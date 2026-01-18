import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getTodaysChallenge, submitChallengeResponse } from '@/lib/challenge-engine';

// ===========================================
// PHASE 4: CHALLENGES API
// ===========================================

// GET /api/challenges - Get today's challenge
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Demo mode if not authenticated
    if (!user) {
      return NextResponse.json({
        demo: true,
        challengeId: 'demo',
        questions: getDemoQuestions(),
        completed: false,
      });
    }

    // Get student's license track
    const { data: student } = await supabase
      .from('students')
      .select('license_track')
      .eq('id', user.id)
      .single();

    const licenseType = student?.license_track === 'A' ? 'A' : 'B';
    const challenge = await getTodaysChallenge(user.id, licenseType);

    if (!challenge) {
      return NextResponse.json({
        error: 'No challenge available for today',
        message: 'Check back tomorrow or ask your instructor to add more questions.',
      }, { status: 404 });
    }

    return NextResponse.json(challenge);
  } catch (error) {
    console.error('Challenge GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch challenge' },
      { status: 500 }
    );
  }
}

// POST /api/challenges - Submit answer
export async function POST(request: NextRequest) {
  try {
    const { challengeId, questionId, selectedAnswer } = await request.json();

    if (!challengeId || !questionId || !selectedAnswer) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Demo mode
    if (!user || challengeId === 'demo') {
      const demoResult = checkDemoAnswer(questionId, selectedAnswer);
      return NextResponse.json(demoResult);
    }

    const result = await submitChallengeResponse(
      user.id,
      challengeId,
      questionId,
      selectedAnswer
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Challenge POST error:', error);
    return NextResponse.json(
      { error: 'Failed to submit answer' },
      { status: 500 }
    );
  }
}

// Demo data
function getDemoQuestions() {
  return [
    {
      id: '1',
      question_text: 'What is the minimum depth for a residential foundation footing in California?',
      options: ['A. 6 inches', 'B. 12 inches', 'C. 18 inches', 'D. 24 inches'],
    },
    {
      id: '2',
      question_text: 'Which license classification is required to install a residential solar panel system?',
      options: ['A. C-10 Electrical', 'B. C-46 Solar', 'C. B General Building', 'D. Either A or B'],
    },
    {
      id: '3',
      question_text: 'What is the maximum rise for a single stair riser in residential construction?',
      options: ['A. 7 inches', 'B. 7-3/4 inches', 'C. 8 inches', 'D. 8-1/4 inches'],
    },
    {
      id: '4',
      question_text: 'When is a building permit NOT required in California?',
      options: ['A. Installing a new water heater', 'B. Building a fence under 6 feet', 'C. Adding a bedroom', 'D. Replacing a roof'],
    },
    {
      id: '5',
      question_text: 'What is the required experience for a B (General Building) contractor license?',
      options: ['A. 2 years journey-level', 'B. 4 years journey-level', 'C. 4 years any construction', 'D. 6 years journey-level'],
    },
  ];
}

function checkDemoAnswer(questionId: string, selectedAnswer: string) {
  const answers: Record<string, { correct: string; explanation: string }> = {
    '1': {
      correct: 'B',
      explanation: 'According to CBC Section 1809.4, the minimum depth for footings is 12 inches below undisturbed ground surface.',
    },
    '2': {
      correct: 'D',
      explanation: 'Both C-10 (Electrical) and C-46 (Solar) contractors are authorized to install solar panel systems.',
    },
    '3': {
      correct: 'B',
      explanation: 'CBC Section 1011.5.2 specifies that the maximum riser height is 7-3/4 inches for residential stairs.',
    },
    '4': {
      correct: 'B',
      explanation: 'Fences under 6 feet in height typically do not require a building permit.',
    },
    '5': {
      correct: 'B',
      explanation: 'CSLB requires 4 years of journey-level experience within the last 10 years for a B license.',
    },
  };

  const answer = answers[questionId];
  if (!answer) {
    return { isCorrect: false, explanation: 'Question not found' };
  }

  return {
    isCorrect: selectedAnswer === answer.correct,
    explanation: answer.explanation,
  };
}
