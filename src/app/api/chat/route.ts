import { NextRequest, NextResponse } from 'next/server';
import { chat, createChatSession, getChatSession } from '@/lib/rag/chat';
import { createClient } from '@/lib/supabase/server';

// ===========================================
// PHASE 5: RAG CHAT - API Route
// ===========================================

export async function POST(request: NextRequest) {
  try {
    const { message, sessionId, licenseType } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Get current user (optional - for session management)
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Create session if needed
    let activeSessionId = sessionId;
    if (!activeSessionId && user) {
      activeSessionId = await createChatSession(user.id, message.slice(0, 50));
    }

    // Process chat
    const response = await chat(
      message,
      activeSessionId,
      licenseType || 'both'
    );

    return NextResponse.json({
      ...response,
      sessionId: activeSessionId,
    });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('sessionId');

  if (!sessionId) {
    return NextResponse.json(
      { error: 'Session ID is required' },
      { status: 400 }
    );
  }

  const session = await getChatSession(sessionId);

  if (!session) {
    return NextResponse.json(
      { error: 'Session not found' },
      { status: 404 }
    );
  }

  return NextResponse.json(session);
}
