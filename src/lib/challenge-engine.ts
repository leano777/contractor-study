import { createAdminClient } from '@/lib/supabase/server';

// ===========================================
// PHASE 4: DAILY CHALLENGES - Challenge Engine
// ===========================================
// Selects questions for daily challenges using spaced repetition

const QUESTIONS_PER_CHALLENGE = 5;
const DIFFICULTY_MIX = { easy: 2, medium: 2, hard: 1 };

interface QuestionSelection {
  id: string;
  difficulty: string;
}

/**
 * Select questions for a daily challenge
 * Uses a mix of:
 * - Questions the student hasn't seen
 * - Questions the student got wrong (spaced repetition)
 * - Random sampling for variety
 */
export async function selectChallengeQuestions(
  studentId: string,
  licenseType: 'A' | 'B'
): Promise<string[]> {
  const supabase = createAdminClient();

  // Get student's question history
  const { data: answeredQuestions } = await supabase
    .from('challenge_responses')
    .select('question_id, is_correct, answered_at')
    .eq('student_id', studentId);

  const answeredIds = new Set(answeredQuestions?.map(q => q.question_id) || []);
  const incorrectIds = new Set(
    answeredQuestions
      ?.filter(q => !q.is_correct)
      .map(q => q.question_id) || []
  );

  const selectedQuestions: string[] = [];

  // For each difficulty level
  for (const [difficulty, count] of Object.entries(DIFFICULTY_MIX)) {
    // First, try to get questions the student got wrong (spaced repetition)
    if (incorrectIds.size > 0) {
      const { data: wrongQuestions } = await supabase
        .from('questions')
        .select('id')
        .eq('is_verified', true)
        .in('license_type', [licenseType, 'both'])
        .eq('difficulty', difficulty)
        .in('id', Array.from(incorrectIds))
        .limit(Math.ceil(count / 2));

      if (wrongQuestions) {
        selectedQuestions.push(...wrongQuestions.map(q => q.id));
      }
    }

    // Fill remaining with new or random questions
    const remaining = count - (selectedQuestions.filter(id => {
      // Count questions of this difficulty we've already added
      return true; // Simplified - would need difficulty tracking
    }).length);

    if (remaining > 0) {
      const { data: newQuestions } = await supabase
        .from('questions')
        .select('id')
        .eq('is_verified', true)
        .in('license_type', [licenseType, 'both'])
        .eq('difficulty', difficulty)
        .not('id', 'in', `(${[...selectedQuestions, ...answeredIds].join(',') || 'null'})`)
        .limit(remaining);

      if (newQuestions) {
        selectedQuestions.push(...newQuestions.map(q => q.id));
      }
    }
  }

  // If we still don't have enough questions, fill with any available
  if (selectedQuestions.length < QUESTIONS_PER_CHALLENGE) {
    const { data: fillQuestions } = await supabase
      .from('questions')
      .select('id')
      .eq('is_verified', true)
      .in('license_type', [licenseType, 'both'])
      .not('id', 'in', `(${selectedQuestions.join(',') || 'null'})`)
      .limit(QUESTIONS_PER_CHALLENGE - selectedQuestions.length);

    if (fillQuestions) {
      selectedQuestions.push(...fillQuestions.map(q => q.id));
    }
  }

  // Shuffle the questions
  return shuffleArray(selectedQuestions).slice(0, QUESTIONS_PER_CHALLENGE);
}

/**
 * Create a daily challenge for a license type
 */
export async function createDailyChallenge(
  licenseType: 'A' | 'B',
  date: Date = new Date()
): Promise<string | null> {
  const supabase = createAdminClient();
  const dateStr = date.toISOString().split('T')[0];

  // Check if challenge already exists
  const { data: existing } = await supabase
    .from('daily_challenges')
    .select('id')
    .eq('challenge_date', dateStr)
    .eq('license_type', licenseType)
    .single();

  if (existing) {
    return existing.id;
  }

  // Get random verified questions for this license type
  const { data: questions } = await supabase
    .from('questions')
    .select('id, difficulty')
    .eq('is_verified', true)
    .in('license_type', [licenseType, 'both']);

  if (!questions || questions.length < QUESTIONS_PER_CHALLENGE) {
    console.error(`Not enough questions for ${licenseType} challenge`);
    return null;
  }

  // Select questions with difficulty mix
  const questionIds = selectQuestionsByDifficulty(questions);

  // Create challenge
  const { data: challenge, error } = await supabase
    .from('daily_challenges')
    .insert({
      challenge_date: dateStr,
      license_type: licenseType,
      question_ids: questionIds,
    })
    .select('id')
    .single();

  if (error) {
    console.error('Failed to create challenge:', error);
    return null;
  }

  return challenge.id;
}

/**
 * Get today's challenge for a student
 */
export async function getTodaysChallenge(
  studentId: string,
  licenseType: 'A' | 'B'
): Promise<{
  challengeId: string;
  questions: Array<{
    id: string;
    question_text: string;
    options: string[];
    answered?: boolean;
    selectedAnswer?: string;
    isCorrect?: boolean;
  }>;
  completed: boolean;
  score?: number;
} | null> {
  const supabase = createAdminClient();
  const today = new Date().toISOString().split('T')[0];

  // Get today's challenge
  const { data: challenge } = await supabase
    .from('daily_challenges')
    .select('id, question_ids')
    .eq('challenge_date', today)
    .eq('license_type', licenseType)
    .single();

  if (!challenge) {
    return null;
  }

  // Get questions
  const { data: questions } = await supabase
    .from('questions')
    .select('id, question_text, options')
    .in('id', challenge.question_ids);

  if (!questions) {
    return null;
  }

  // Get student's responses
  const { data: responses } = await supabase
    .from('challenge_responses')
    .select('question_id, selected_answer, is_correct')
    .eq('student_id', studentId)
    .eq('challenge_id', challenge.id);

  const responseMap = new Map(
    responses?.map(r => [r.question_id, r]) || []
  );

  // Merge questions with responses
  const enrichedQuestions = questions.map(q => ({
    ...q,
    answered: responseMap.has(q.id),
    selectedAnswer: responseMap.get(q.id)?.selected_answer,
    isCorrect: responseMap.get(q.id)?.is_correct,
  }));

  const answeredCount = enrichedQuestions.filter(q => q.answered).length;
  const correctCount = enrichedQuestions.filter(q => q.isCorrect).length;

  return {
    challengeId: challenge.id,
    questions: enrichedQuestions,
    completed: answeredCount === questions.length,
    score: answeredCount > 0 ? correctCount / answeredCount : undefined,
  };
}

/**
 * Submit a challenge response
 */
export async function submitChallengeResponse(
  studentId: string,
  challengeId: string,
  questionId: string,
  selectedAnswer: string
): Promise<{ isCorrect: boolean; explanation: string }> {
  const supabase = createAdminClient();

  // Get correct answer
  const { data: question } = await supabase
    .from('questions')
    .select('correct_answer, explanation')
    .eq('id', questionId)
    .single();

  if (!question) {
    throw new Error('Question not found');
  }

  const isCorrect = selectedAnswer === question.correct_answer;

  // Save response
  await supabase
    .from('challenge_responses')
    .upsert({
      student_id: studentId,
      challenge_id: challengeId,
      question_id: questionId,
      selected_answer: selectedAnswer,
      is_correct: isCorrect,
    });

  // Check if challenge is complete and update streak
  const { data: challenge } = await supabase
    .from('daily_challenges')
    .select('question_ids')
    .eq('id', challengeId)
    .single();

  if (challenge) {
    const { data: responses } = await supabase
      .from('challenge_responses')
      .select('id')
      .eq('student_id', studentId)
      .eq('challenge_id', challengeId);

    if (responses?.length === challenge.question_ids.length) {
      // Challenge complete - update streak
      await supabase.rpc('update_student_streak', { p_student_id: studentId });
    }
  }

  return {
    isCorrect,
    explanation: question.explanation || '',
  };
}

// Helper functions
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function selectQuestionsByDifficulty(
  questions: QuestionSelection[]
): string[] {
  const byDifficulty = {
    easy: questions.filter(q => q.difficulty === 'easy'),
    medium: questions.filter(q => q.difficulty === 'medium'),
    hard: questions.filter(q => q.difficulty === 'hard'),
  };

  const selected: string[] = [];

  for (const [difficulty, count] of Object.entries(DIFFICULTY_MIX)) {
    const pool = byDifficulty[difficulty as keyof typeof byDifficulty];
    const shuffled = shuffleArray(pool);
    selected.push(...shuffled.slice(0, count).map(q => q.id));
  }

  return shuffleArray(selected);
}
