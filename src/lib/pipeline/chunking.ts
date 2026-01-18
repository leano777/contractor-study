import { createAdminClient } from '@/lib/supabase/server';
import { analyzeDocumentStructure } from './extraction';

// ===========================================
// PHASE 3: CONTENT PIPELINE - Chunking
// ===========================================
// Splits documents into semantic chunks for RAG

const CHUNK_SIZE = 1000; // Target tokens per chunk
const CHUNK_OVERLAP = 100; // Overlap tokens between chunks

interface Chunk {
  content: string;
  tokenCount: number;
  metadata: {
    sectionTitle?: string;
    sectionSummary?: string;
    chunkOfSection?: number;
    totalSectionChunks?: number;
    pageNumber?: number;
  };
}

/**
 * Estimate token count (rough approximation: 1 token ≈ 4 chars)
 */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Split text with overlap
 */
function splitWithOverlap(
  text: string,
  chunkSize: number,
  overlap: number
): Chunk[] {
  const chunks: Chunk[] = [];
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  
  let currentChunk = '';
  let currentTokens = 0;

  for (const sentence of sentences) {
    const sentenceTokens = estimateTokens(sentence);

    if (currentTokens + sentenceTokens > chunkSize && currentChunk) {
      // Save current chunk
      chunks.push({
        content: currentChunk.trim(),
        tokenCount: currentTokens,
        metadata: {},
      });

      // Start new chunk with overlap
      const overlapText = getOverlapText(currentChunk, overlap);
      currentChunk = overlapText + sentence;
      currentTokens = estimateTokens(currentChunk);
    } else {
      currentChunk += sentence;
      currentTokens += sentenceTokens;
    }
  }

  // Add final chunk
  if (currentChunk.trim()) {
    chunks.push({
      content: currentChunk.trim(),
      tokenCount: currentTokens,
      metadata: {},
    });
  }

  return chunks;
}

/**
 * Get overlap text from end of chunk
 */
function getOverlapText(text: string, overlapTokens: number): string {
  const targetChars = overlapTokens * 4;
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  
  let overlapText = '';
  for (let i = sentences.length - 1; i >= 0; i--) {
    if (overlapText.length + sentences[i].length > targetChars) {
      break;
    }
    overlapText = sentences[i] + overlapText;
  }
  
  return overlapText;
}

/**
 * Chunk a document with intelligent section awareness
 */
export async function chunkDocument(
  text: string,
  handoutId: string
): Promise<Chunk[]> {
  // Analyze document structure
  const sections = await analyzeDocumentStructure(text);
  
  const allChunks: Chunk[] = [];

  for (const section of sections) {
    const sectionText = text.slice(section.startIndex, section.endIndex);
    const sectionChunks = splitWithOverlap(sectionText, CHUNK_SIZE, CHUNK_OVERLAP);

    // Add section metadata to each chunk
    sectionChunks.forEach((chunk, index) => {
      chunk.metadata = {
        sectionTitle: section.title,
        sectionSummary: section.summary,
        chunkOfSection: index + 1,
        totalSectionChunks: sectionChunks.length,
      };
      allChunks.push(chunk);
    });
  }

  return allChunks;
}

/**
 * Process and store chunks for a handout
 */
export async function processAndStoreChunks(handoutId: string): Promise<number> {
  const supabase = createAdminClient();

  // Get handout with extracted text
  const { data: handout, error } = await supabase
    .from('handouts')
    .select('id, extracted_text, title')
    .eq('id', handoutId)
    .single();

  if (error || !handout?.extracted_text) {
    throw new Error(`Handout not found or not processed: ${handoutId}`);
  }

  // Delete existing chunks
  await supabase
    .from('handout_chunks')
    .delete()
    .eq('handout_id', handoutId);

  // Chunk the document
  const chunks = await chunkDocument(handout.extracted_text, handoutId);

  // Store chunks (without embeddings - those are added separately)
  const chunkRecords = chunks.map((chunk, index) => ({
    handout_id: handoutId,
    chunk_index: index,
    content: chunk.content,
    token_count: chunk.tokenCount,
    metadata: chunk.metadata,
  }));

  const { error: insertError } = await supabase
    .from('handout_chunks')
    .insert(chunkRecords);

  if (insertError) {
    throw new Error(`Failed to insert chunks: ${insertError.message}`);
  }

  console.log(`✅ Created ${chunks.length} chunks for: ${handout.title}`);
  return chunks.length;
}
