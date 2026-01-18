import { createAdminClient } from '@/lib/supabase/server';

// ===========================================
// PHASE 3/5: CONTENT PIPELINE - Embeddings
// ===========================================
// Generates vector embeddings for semantic search

// Support both Voyage AI and OpenAI
const VOYAGE_API_KEY = process.env.VOYAGE_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

interface EmbeddingResult {
  embedding: number[];
  model: string;
}

/**
 * Generate embedding using Voyage AI
 */
async function generateVoyageEmbedding(text: string): Promise<EmbeddingResult> {
  const response = await fetch('https://api.voyageai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${VOYAGE_API_KEY}`,
    },
    body: JSON.stringify({
      input: [text],
      model: 'voyage-2',
    }),
  });

  if (!response.ok) {
    throw new Error(`Voyage API error: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    embedding: data.data[0].embedding,
    model: 'voyage-2',
  };
}

/**
 * Generate embedding using OpenAI
 */
async function generateOpenAIEmbedding(text: string): Promise<EmbeddingResult> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      input: text,
      model: 'text-embedding-3-small',
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    embedding: data.data[0].embedding,
    model: 'text-embedding-3-small',
  };
}

/**
 * Generate embedding using available provider
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  if (VOYAGE_API_KEY) {
    const result = await generateVoyageEmbedding(text);
    return result.embedding;
  } else if (OPENAI_API_KEY) {
    const result = await generateOpenAIEmbedding(text);
    return result.embedding;
  } else {
    throw new Error('No embedding API key configured. Set VOYAGE_API_KEY or OPENAI_API_KEY');
  }
}

/**
 * Batch generate embeddings (more efficient)
 */
export async function generateEmbeddingsBatch(texts: string[]): Promise<number[][]> {
  const batchSize = 100; // Voyage supports up to 128
  const allEmbeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    
    if (VOYAGE_API_KEY) {
      const response = await fetch('https://api.voyageai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${VOYAGE_API_KEY}`,
        },
        body: JSON.stringify({
          input: batch,
          model: 'voyage-2',
        }),
      });

      if (!response.ok) {
        throw new Error(`Voyage API error: ${response.statusText}`);
      }

      const data = await response.json();
      allEmbeddings.push(...data.data.map((d: { embedding: number[] }) => d.embedding));
    } else if (OPENAI_API_KEY) {
      // OpenAI also supports batch
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          input: batch,
          model: 'text-embedding-3-small',
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      allEmbeddings.push(...data.data.map((d: { embedding: number[] }) => d.embedding));
    }

    // Rate limiting
    if (i + batchSize < texts.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return allEmbeddings;
}

/**
 * Generate and store embeddings for all chunks of a handout
 */
export async function embedHandoutChunks(handoutId: string): Promise<number> {
  const supabase = createAdminClient();

  // Get chunks without embeddings
  const { data: chunks, error } = await supabase
    .from('handout_chunks')
    .select('id, content')
    .eq('handout_id', handoutId)
    .is('embedding', null);

  if (error || !chunks?.length) {
    console.log('No chunks to embed');
    return 0;
  }

  // Generate embeddings in batch
  const texts = chunks.map(c => c.content);
  const embeddings = await generateEmbeddingsBatch(texts);

  // Update chunks with embeddings
  for (let i = 0; i < chunks.length; i++) {
    await supabase
      .from('handout_chunks')
      .update({ embedding: embeddings[i] })
      .eq('id', chunks[i].id);
  }

  console.log(`✅ Generated ${embeddings.length} embeddings for handout: ${handoutId}`);
  return embeddings.length;
}

/**
 * Embed all unprocessed chunks across all handouts
 */
export async function embedAllPendingChunks(): Promise<number> {
  const supabase = createAdminClient();

  // Get all chunks without embeddings
  const { data: chunks, error } = await supabase
    .from('handout_chunks')
    .select('id, content')
    .is('embedding', null)
    .limit(500); // Process in batches

  if (error || !chunks?.length) {
    return 0;
  }

  const texts = chunks.map(c => c.content);
  const embeddings = await generateEmbeddingsBatch(texts);

  for (let i = 0; i < chunks.length; i++) {
    await supabase
      .from('handout_chunks')
      .update({ embedding: embeddings[i] })
      .eq('id', chunks[i].id);
  }

  return embeddings.length;
}
