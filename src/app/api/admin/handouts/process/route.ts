import { NextRequest, NextResponse } from 'next/server';
import { processHandout } from '@/lib/pipeline/extraction';
import { processAndStoreChunks } from '@/lib/pipeline/chunking';
import { embedHandoutChunks } from '@/lib/pipeline/embeddings';
import { generateQuestionsForHandout } from '@/lib/pipeline/questions';
import { createAdminClient } from '@/lib/supabase/server';

// ===========================================
// HANDOUT PROCESSING API
// ===========================================
// Triggers the full processing pipeline for a handout

export async function POST(request: NextRequest) {
  try {
    const { handoutId, steps } = await request.json();

    if (!handoutId) {
      return NextResponse.json({ error: 'Handout ID required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Get handout info
    const { data: handout, error } = await supabase
      .from('handouts')
      .select('*')
      .eq('id', handoutId)
      .single();

    if (error || !handout) {
      return NextResponse.json({ error: 'Handout not found' }, { status: 404 });
    }

    const results: Record<string, unknown> = {
      handoutId,
      title: handout.title,
      steps: [],
    };

    // Default to all steps if not specified
    const stepsToRun = steps || ['extract', 'chunk', 'embed', 'generate'];

    // Step 1: Extract text
    if (stepsToRun.includes('extract')) {
      try {
        await processHandout(handoutId);
        (results.steps as string[]).push('extract: success');
      } catch (err) {
        console.error('Extraction error:', err);
        (results.steps as string[]).push(`extract: failed - ${err}`);
      }
    }

    // Step 2: Chunk document
    if (stepsToRun.includes('chunk')) {
      try {
        const chunkCount = await processAndStoreChunks(handoutId);
        (results.steps as string[]).push(`chunk: ${chunkCount} chunks created`);
        results.chunkCount = chunkCount;
      } catch (err) {
        console.error('Chunking error:', err);
        (results.steps as string[]).push(`chunk: failed - ${err}`);
      }
    }

    // Step 3: Generate embeddings
    if (stepsToRun.includes('embed')) {
      try {
        const embedCount = await embedHandoutChunks(handoutId);
        (results.steps as string[]).push(`embed: ${embedCount} embeddings generated`);
        results.embedCount = embedCount;
      } catch (err) {
        console.error('Embedding error:', err);
        (results.steps as string[]).push(`embed: failed - ${err}`);
      }
    }

    // Step 4: Generate questions
    if (stepsToRun.includes('generate')) {
      try {
        const questionCount = await generateQuestionsForHandout(
          handoutId,
          handout.license_type as 'A' | 'B' | 'both'
        );
        (results.steps as string[]).push(`generate: ${questionCount} questions generated`);
        results.questionCount = questionCount;
      } catch (err) {
        console.error('Question generation error:', err);
        (results.steps as string[]).push(`generate: failed - ${err}`);
      }
    }

    // Mark handout as processed
    await supabase
      .from('handouts')
      .update({
        is_processed: true,
        processed_at: new Date().toISOString(),
      })
      .eq('id', handoutId);

    return NextResponse.json(results);
  } catch (error) {
    console.error('Processing error:', error);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}

// GET /api/admin/handouts/process?id=xxx - Get processing status
export async function GET(request: NextRequest) {
  try {
    const handoutId = request.nextUrl.searchParams.get('id');
    
    if (!handoutId) {
      return NextResponse.json({ error: 'Handout ID required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Get handout with related counts
    const { data: handout } = await supabase
      .from('handouts')
      .select('*')
      .eq('id', handoutId)
      .single();

    if (!handout) {
      return NextResponse.json({ error: 'Handout not found' }, { status: 404 });
    }

    // Get chunk count
    const { count: chunkCount } = await supabase
      .from('handout_chunks')
      .select('*', { count: 'exact', head: true })
      .eq('handout_id', handoutId);

    // Get question count
    const { count: questionCount } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true })
      .eq('handout_id', handoutId);

    // Get embeddings count
    const { count: embeddingCount } = await supabase
      .from('handout_chunks')
      .select('*', { count: 'exact', head: true })
      .eq('handout_id', handoutId)
      .not('embedding', 'is', null);

    return NextResponse.json({
      handout,
      status: {
        extracted: !!handout.extracted_text,
        chunks: chunkCount || 0,
        embeddings: embeddingCount || 0,
        questions: questionCount || 0,
        isProcessed: handout.is_processed,
      },
    });
  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json({ error: 'Failed to get status' }, { status: 500 });
  }
}
