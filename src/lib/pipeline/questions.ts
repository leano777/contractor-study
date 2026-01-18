import Anthropic from '@anthropic-ai/sdk';
import { createAdminClient } from '@/lib/supabase/server';

// ===========================================
// PHASE 3: CONTENT PIPELINE - Question Generation
// ===========================================
// Generates exam-style questions from handout chunks

const anthropic = process.env.ANTHROPIC_API_KEY 
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

interface GeneratedQuestion {
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic_tags: string[];
}

const QUESTION_GENERATION_PROMPT = `You are an expert California contractor license exam question writer.
Generate exam-style multiple choice questions from the following content.

Requirements:
- Create questions with 4 options (A, B, C, D)
- Mix of difficulties: easy (basic recall), medium (application), hard (analysis/synthesis)
- Questions should test practical knowledge for {LICENSE_TYPE} contractors
- Include detailed explanations for why the correct answer is right AND why others are wrong
- Reference specific codes, regulations, or standards when applicable
- Make distractors (wrong answers) plausible but clearly incorrect

License Track: {LICENSE_TYPE}
- License A (General Engineering): Highways, bridges, dams, pipelines, utilities
- License B (General Building): Residential & commercial structures, framing, concrete

Content to generate questions from:
---
{CHUNK_CONTENT}
---

Additional context from surrounding sections:
---
{SURROUNDING_CONTEXT}
---

Generate 3-5 questions in this exact JSON format (no markdown, just JSON):
[
  {
    "question": "Clear, specific question text?",
    "options": ["A. First option", "B. Second option", "C. Third option", "D. Fourth option"],
    "correct_answer": "A",
    "explanation": "A is correct because... B is incorrect because... C is incorrect because... D is incorrect because...",
    "difficulty": "easy",
    "topic_tags": ["relevant", "topic", "tags"]
  }
]`;

/**
 * Generate questions from a single chunk
 */
export async function generateQuestionsFromChunk(
  chunkId: string,
  licenseType: 'A' | 'B' | 'both'
): Promise<GeneratedQuestion[]> {
  if (!anthropic) {
    throw new Error('ANTHROPIC_API_KEY required for question generation');
  }

  const supabase = createAdminClient();

  // Get chunk and surrounding context
  const { data: chunk, error } = await supabase
    .from('handout_chunks')
    .select(`
      id,
      content,
      chunk_index,
      handout_id,
      metadata
    `)
    .eq('id', chunkId)
    .single();

  if (error || !chunk) {
    throw new Error(`Chunk not found: ${chunkId}`);
  }

  // Get surrounding chunks for context
  const { data: surroundingChunks } = await supabase
    .from('handout_chunks')
    .select('content')
    .eq('handout_id', chunk.handout_id)
    .gte('chunk_index', chunk.chunk_index - 1)
    .lte('chunk_index', chunk.chunk_index + 1)
    .neq('id', chunkId);

  const surroundingContext = surroundingChunks
    ?.map(c => c.content)
    .join('\n---\n') || '';

  // Generate questions
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: QUESTION_GENERATION_PROMPT
          .replace('{LICENSE_TYPE}', licenseType === 'both' ? 'A & B' : `License ${licenseType}`)
          .replace('{CHUNK_CONTENT}', chunk.content)
          .replace('{SURROUNDING_CONTEXT}', surroundingContext),
      },
    ],
  });

  const responseText = response.content[0].type === 'text' ? response.content[0].text : '[]';
  
  try {
    // Clean up response (remove markdown code blocks if present)
    const cleanedResponse = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    return JSON.parse(cleanedResponse);
  } catch {
    console.error('Failed to parse question response:', responseText);
    return [];
  }
}

/**
 * Generate and store questions for a handout
 */
export async function generateQuestionsForHandout(
  handoutId: string,
  licenseType: 'A' | 'B' | 'both'
): Promise<number> {
  const supabase = createAdminClient();

  // Get all chunks for this handout
  const { data: chunks, error } = await supabase
    .from('handout_chunks')
    .select('id')
    .eq('handout_id', handoutId)
    .order('chunk_index');

  if (error || !chunks?.length) {
    throw new Error(`No chunks found for handout: ${handoutId}`);
  }

  let totalQuestions = 0;

  for (const chunk of chunks) {
    try {
      const questions = await generateQuestionsFromChunk(chunk.id, licenseType);

      // Store questions
      for (const q of questions) {
        const { error: insertError } = await supabase
          .from('questions')
          .insert({
            handout_id: handoutId,
            source_chunk_id: chunk.id,
            question_text: q.question,
            question_type: 'multiple_choice',
            options: q.options,
            correct_answer: q.correct_answer,
            explanation: q.explanation,
            difficulty: q.difficulty,
            license_type: licenseType === 'both' ? 'both' : licenseType,
            topic_tags: q.topic_tags,
            is_ai_generated: true,
            is_verified: false,
          });

        if (!insertError) {
          totalQuestions++;
        }
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (err) {
      console.error(`Error generating questions for chunk ${chunk.id}:`, err);
    }
  }

  console.log(`✅ Generated ${totalQuestions} questions for handout: ${handoutId}`);
  return totalQuestions;
}

/**
 * Regenerate a specific question
 */
export async function regenerateQuestion(questionId: string): Promise<GeneratedQuestion | null> {
  const supabase = createAdminClient();

  // Get original question to find source chunk
  const { data: question, error } = await supabase
    .from('questions')
    .select('source_chunk_id, license_type')
    .eq('id', questionId)
    .single();

  if (error || !question?.source_chunk_id) {
    return null;
  }

  const questions = await generateQuestionsFromChunk(
    question.source_chunk_id,
    question.license_type as 'A' | 'B' | 'both'
  );

  return questions[0] || null;
}
