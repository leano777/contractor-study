'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Send, 
  Bot, 
  User, 
  Loader2,
  BookOpen,
  Sparkles,
  MessageCircle,
  Trash2,
  Plus
} from 'lucide-react';

// ===========================================
// PHASE 5: AI CHAT INTERFACE
// ===========================================
// RAG-powered chat for code compliance questions

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{
    title: string;
    section?: string;
  }>;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}

// Demo suggestions
const SUGGESTED_QUESTIONS = [
  "What are the requirements for a B-1 license?",
  "Explain the permit process for residential additions",
  "What safety equipment is required on construction sites?",
  "How do I calculate overhead and profit for a bid?",
];

export default function ChatPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentSession?.messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + 'px';
    }
  }, [input]);

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSession(newSession);
  };

  const handleSend = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || isLoading) return;

    // Create session if needed
    let session = currentSession;
    if (!session) {
      session = {
        id: Date.now().toString(),
        title: text.slice(0, 30) + (text.length > 30 ? '...' : ''),
        messages: [],
        createdAt: new Date(),
      };
      setSessions(prev => [session!, ...prev]);
      setCurrentSession(session);
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    const updatedSession = {
      ...session,
      messages: [...session.messages, userMessage],
    };
    setCurrentSession(updatedSession);
    setSessions(prev => prev.map(s => s.id === session!.id ? updatedSession : s));
    setInput('');
    setIsLoading(true);

    try {
      // Call chat API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          sessionId: session.id,
          licenseType: 'both',
        }),
      });

      const data = await response.json();

      // Add assistant message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || "I'm sorry, I couldn't process your question. Please try again.",
        sources: data.sources,
        timestamp: new Date(),
      };

      const finalSession = {
        ...updatedSession,
        messages: [...updatedSession.messages, assistantMessage],
      };
      setCurrentSession(finalSession);
      setSessions(prev => prev.map(s => s.id === session!.id ? finalSession : s));
    } catch (error) {
      // Demo fallback response
      const demoResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: getDemoResponse(text),
        sources: [
          { title: 'California Building Code', section: 'Chapter 1' },
          { title: 'CSLB License Requirements', section: 'Section 7065' },
        ],
        timestamp: new Date(),
      };

      const finalSession = {
        ...updatedSession,
        messages: [...updatedSession.messages, demoResponse],
      };
      setCurrentSession(finalSession);
      setSessions(prev => prev.map(s => s.id === session!.id ? finalSession : s));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const deleteSession = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    if (currentSession?.id === sessionId) {
      setCurrentSession(null);
    }
  };

  return (
    <div className="h-screen flex bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      {showSidebar && (
        <aside className="w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <Link href="/dashboard" className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mb-4">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back to Dashboard</span>
            </Link>
            <button onClick={createNewSession} className="btn-primary w-full">
              <Plus className="w-4 h-4 mr-2" />
              New Chat
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {sessions.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                No chat history yet
              </p>
            ) : (
              <div className="space-y-1">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`group flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors ${
                      currentSession?.id === session.id
                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                    onClick={() => setCurrentSession(session)}
                  >
                    <MessageCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="flex-1 text-sm truncate">{session.title}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteSession(session.id); }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                    >
                      <Trash2 className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      )}

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <MessageCircle className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
          <div className="flex-1">
            <h1 className="font-semibold text-gray-900 dark:text-gray-100">AI Study Assistant</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Ask questions about codes, regulations, and exam topics</p>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {!currentSession || currentSession.messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-8">
              <div className="w-16 h-16 bg-primary-500/20 rounded-2xl flex items-center justify-center mb-6">
                <Sparkles className="w-8 h-8 text-primary-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">How can I help you study?</h2>
              <p className="text-gray-500 dark:text-gray-400 text-center mb-8 max-w-md">
                Ask me anything about contractor licensing, building codes, safety regulations, or exam prep.
              </p>

              <div className="grid grid-cols-2 gap-3 max-w-xl">
                {SUGGESTED_QUESTIONS.map((question, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(question)}
                    className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto py-6 px-4">
              {currentSession.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-4 mb-6 ${message.role === 'user' ? 'justify-end' : ''}`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-lg bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-5 h-5 text-primary-500" />
                    </div>
                  )}

                  <div className={`flex-1 max-w-[80%] ${message.role === 'user' ? 'text-right' : ''}`}>
                    <div className={`inline-block p-4 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-primary-600 text-white rounded-br-md'
                        : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-bl-md text-gray-900 dark:text-gray-100'
                    }`}>
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>

                    {/* Sources */}
                    {message.sources && message.sources.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {message.sources.map((source, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs text-gray-600 dark:text-gray-400"
                          >
                            <BookOpen className="w-3 h-3" />
                            {source.title}
                            {source.section && <span className="text-gray-400 dark:text-gray-500">• {source.section}</span>}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {message.role === 'user' && (
                    <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-4 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-primary-500/20 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-primary-500" />
                  </div>
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-2xl rounded-bl-md">
                    <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex gap-3 items-end">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about codes, licensing, or exam topics..."
                  rows={1}
                  className="input resize-none pr-12 min-h-[44px]"
                />
              </div>
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className="btn-primary h-11 px-4 disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 text-center">
              AI responses are based on your course materials. Always verify critical information.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

// Demo response generator
function getDemoResponse(question: string): string {
  const q = question.toLowerCase();
  
  if (q.includes('b-1') || q.includes('license b') || q.includes('general building')) {
    return `A B-1 (General Building) Contractor license in California allows you to construct, alter, or repair residential and commercial buildings.

**Requirements:**
1. **Experience**: 4 years of journey-level experience in the last 10 years
2. **Examination**: Pass the Law & Business exam and the B trade exam
3. **Bonding**: $25,000 contractor's bond
4. **Insurance**: Workers' compensation (if you have employees)

**Scope of Work:**
- Wood frame and masonry construction
- Concrete work as part of a structure
- Cabinet installation (as part of a larger project)
- General supervision of specialty contractors

[Source 1: CSLB License Requirements]

Would you like me to explain any specific requirement in more detail?`;
  }
  
  if (q.includes('permit') || q.includes('building permit')) {
    return `The building permit process for residential additions in California typically involves these steps:

**1. Planning & Design**
- Create architectural plans meeting CBC requirements
- May need engineer-stamped structural calculations

**2. Submit Application**
- Complete permit application at local building department
- Submit plans, site plan, and required documents
- Pay plan check fees

**3. Plan Review** (2-6 weeks typically)
- Plans reviewed for code compliance
- May receive correction notices

**4. Permit Issuance**
- Pay permit fees
- Receive approved plans and permit card

**5. Inspections**
- Foundation, framing, electrical, plumbing, mechanical
- Final inspection for certificate of occupancy

[Source 1: California Building Code - Chapter 1]

Is there a specific part of the process you'd like more detail on?`;
  }
  
  return `That's a great question! Based on your course materials, here's what I found:

This topic is covered in your study materials. The key points to remember for the exam are:

1. **Know the specific code sections** - Examiners often reference specific CBC or CSLB regulation numbers
2. **Understand the practical application** - Questions often present real-world scenarios
3. **Remember the exceptions** - Many rules have important exceptions

[Source 1: Course Handouts - General Principles]

Would you like me to elaborate on any specific aspect, or do you have a follow-up question?`;
}
