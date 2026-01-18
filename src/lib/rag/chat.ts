import Anthropic from '@anthropic-ai/sdk';
import { createAdminClient } from '@/lib/supabase/server';
import { generateEmbedding } from '@/lib/pipeline/embeddings';

// ===========================================
// PHASE 5: RAG CHAT SYSTEM
// ===========================================
// Retrieval-Augmented Generation for answering questions

const anthropic = process.env.ANTHROPIC_API_KEY 
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

interface SearchResult {
  id: string;
  content: string;
  metadata: Record<string, unknown>;
  similarity: number;
  handout_title: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatResponse {
  response: string;
  sources: Array<{
    title: string;
    section?: string;
    chunkId: string;
  }>;
}

const SYSTEM_PROMPT = `You are a helpful study assistant for California contractor license exam preparation.
You help students understand building codes, licensing requirements, and construction standards.

Your role is to:
- Answer questions accurately based on the provided study materials
- Explain concepts in clear, practical terms
- Reference specific codes, regulations, and section numbers when available
- Help students prepare for License A (General Engineering) and License B (General Building) exams

Guidelines:
- Always cite your sources using [Source N] format when referencing the provided context
- If the context doesn't contain enough information, say so clearly
- When discussing codes, be specific about which code (CBC, NEC, etc.) and section numbers
- For safety-related topics, emphasize the importance of proper training and compliance
- If asked about something outside contractor licensing, politely redirect

Student's license track: {LICENSE_TYPE}`;

/**
 * Semantic search using vector similarity
 */
export async function semanticSearch(
  query: string,
  licenseType: 'A' | 'B' | 'both' | null = null,
  limit: number = 5
): Promise<SearchResult[]> {
  const supabase = createAdminClient();

  // Generate query embedding
  const queryEmbedding = await generateEmbedding(query);

  // Use the match_chunks function
  const { data: results, error } = await supabase.rpc('match_chunks', {
    query_embedding: queryEmbedding,
    match_threshold: 0.7,
    match_count: limit,
    filter_license: licenseType,
  });

  if (error) {
    console.error('Semantic search error:', error);
    return [];
  }

  return results || [];
}

/**
 * Full-text keyword search
 */
export async function keywordSearch(
  query: string,
  licenseType: 'A' | 'B' | 'both' | null = null,
  limit: number = 10
): Promise<SearchResult[]> {
  const supabase = createAdminClient();

  // Build full-text search query
  const searchTerms = query
    .split(/\s+/)
    .filter(term => term.length > 2)
    .join(' | ');

  let queryBuilder = supabase
    .from('handout_chunks')
    .select(`
      id,
      content,
      metadata,
      handouts!inner(title, license_type)
    `)
    .textSearch('content', searchTerms)
    .limit(limit);

  if (licenseType) {
    queryBuilder = queryBuilder.or(
      `handouts.license_type.eq.${licenseType},handouts.license_type.eq.both`
    );
  }

  const { data: results, error } = await queryBuilder;

  if (error) {
    console.error('Keyword search error:', error);
    return [];
  }

  return (results || []).map((r: Record<string, unknown>) => ({
    id: r.id as string,
    content: r.content as string,
    metadata: r.metadata as Record<string, unknown>,
    similarity: 0.5, // Fixed score for keyword matches
    handout_title: (r.handouts as { title: string })?.title || 'Unknown',
  }));
}

/**
 * Hybrid search combining semantic and keyword search with RRF
 */
export async function hybridSearch(
  query: string,
  licenseType: 'A' | 'B' | 'both' | null = null,
  limit: number = 5
): Promise<SearchResult[]> {
  // Run both searches in parallel
  const [semanticResults, keywordResults] = await Promise.all([
    semanticSearch(query, licenseType, 10),
    keywordSearch(query, licenseType, 10),
  ]);

  // Reciprocal Rank Fusion
  const K = 60; // RRF constant
  const scores = new Map<string, number>();
  const resultsMap = new Map<string, SearchResult>();

  semanticResults.forEach((result, rank) => {
    const score = 1 / (K + rank + 1);
    scores.set(result.id, (scores.get(result.id) || 0) + score);
    resultsMap.set(result.id, result);
  });

  keywordResults.forEach((result, rank) => {
    const score = 1 / (K + rank + 1);
    scores.set(result.id, (scores.get(result.id) || 0) + score);
    if (!resultsMap.has(result.id)) {
      resultsMap.set(result.id, result);
    }
  });

  // Sort by combined score
  const sortedResults = Array.from(resultsMap.values())
    .map(r => ({ ...r, rrf_score: scores.get(r.id) || 0 }))
    .sort((a, b) => b.rrf_score - a.rrf_score)
    .slice(0, limit);

  return sortedResults;
}

/**
 * Main chat function with RAG
 */
export async function chat(
  message: string,
  sessionId: string | null,
  licenseType: 'A' | 'B' | 'both' = 'both'
): Promise<ChatResponse> {
  if (!anthropic) {
    return {
      response: 'Chat is not available. Please configure the ANTHROPIC_API_KEY.',
      sources: [],
    };
  }

  const supabase = createAdminClient();

  // 1. Retrieve relevant context
  const relevantChunks = await hybridSearch(message, licenseType);

  // 2. Format context for prompt
  const contextBlock = relevantChunks
    .map((chunk, i) => {
      const section = chunk.metadata?.sectionTitle || 'General';
      return `[Source ${i + 1}: ${chunk.handout_title} - ${section}]
${chunk.content}`;
    })
    .join('\n\n---\n\n');

  // 3. Get conversation history if session exists
  let history: ChatMessage[] = [];
  if (sessionId) {
    const { data: session } = await supabase
      .from('chat_sessions')
      .select('messages')
      .eq('id', sessionId)
      .single();

    if (session?.messages) {
      history = (session.messages as ChatMessage[]).slice(-10); // Last 5 turns
    }
  }

  // 4. Build messages array
  const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [
    ...history,
    {
      role: 'user' as const,
      content: contextBlock
        ? `Context from study materials:
${contextBlock}

Student question: ${message}

Provide a helpful answer based on the context above. Cite sources using [Source N] format.`
        : message,
    },
  ];

  // 5. Call Claude
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    temperature: 0.3,
    system: SYSTEM_PROMPT.replace('{LICENSE_TYPE}', licenseType === 'both' ? 'A & B' : `License ${licenseType}`),
    messages,
  });

  const assistantResponse = response.content[0].type === 'text' 
    ? response.content[0].text 
    : '';

  // 6. Save to session if exists
  if (sessionId) {
    const newMessages = [
      ...history,
      { role: 'user' as const, content: message },
      { role: 'assistant' as const, content: assistantResponse },
    ];

    await supabase
      .from('chat_sessions')
      .update({
        messages: newMessages,
        context_chunks: relevantChunks.map(c => c.id),
      })
      .eq('id', sessionId);
  }

  // 7. Return response with sources
  return {
    response: assistantResponse,
    sources: relevantChunks.map(c => ({
      title: c.handout_title,
      section: c.metadata?.sectionTitle as string | undefined,
      chunkId: c.id,
    })),
  };
}

/**
 * Create a new chat session
 */
export async function createChatSession(
  studentId: string,
  title?: string
): Promise<string> {
  const supabase = createAdminClient();

  const { data: session, error } = await supabase
    .from('chat_sessions')
    .insert({
      student_id: studentId,
      title: title || 'New Chat',
      messages: [],
    })
    .select('id')
    .single();

  if (error) {
    throw new Error(`Failed to create chat session: ${error.message}`);
  }

  return session.id;
}

/**
 * Get chat session history
 */
export async function getChatSession(sessionId: string): Promise<{
  id: string;
  title: string;
  messages: ChatMessage[];
} | null> {
  const supabase = createAdminClient();

  const { data: session, error } = await supabase
    .from('chat_sessions')
    .select('id, title, messages')
    .eq('id', sessionId)
    .single();

  if (error || !session) {
    return null;
  }

  return {
    id: session.id,
    title: session.title,
    messages: session.messages as ChatMessage[],
  };
}
