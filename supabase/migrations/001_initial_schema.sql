-- ===========================================
-- PHASE 2: INFRASTRUCTURE - Database Schema
-- ===========================================
-- Run this in your Supabase SQL Editor
-- Or use: supabase db push

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";  -- For RAG (Phase 5)

-- ==========================================
-- CORE TABLES
-- ==========================================

-- Students table
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  full_name VARCHAR(255) NOT NULL,
  license_track VARCHAR(10) CHECK (license_track IN ('A', 'B', 'both')) NOT NULL,
  preferred_contact VARCHAR(10) DEFAULT 'both' CHECK (preferred_contact IN ('email', 'sms', 'both')),
  referral_source VARCHAR(100),
  
  -- Gamification
  streak_count INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  streak_freeze_available BOOLEAN DEFAULT true,
  last_challenge_completed_at TIMESTAMPTZ,
  
  -- Notifications
  notification_preferences JSONB DEFAULT '{"email": true, "sms": true, "push": true}',
  
  -- Metadata
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  
  CONSTRAINT valid_phone CHECK (phone ~ '^\+?1?\d{10,14}$')
);

-- Handouts table (course materials)
CREATE TABLE IF NOT EXISTS handouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_url VARCHAR(500) NOT NULL,
  file_type VARCHAR(20) CHECK (file_type IN ('pdf', 'docx', 'image', 'txt')),
  license_type VARCHAR(10) CHECK (license_type IN ('A', 'B', 'both')) NOT NULL,
  chapter VARCHAR(100),
  topic_tags TEXT[],
  
  -- Processing status
  extracted_text TEXT,
  is_processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMPTZ,
  
  -- Metadata
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  uploaded_by UUID REFERENCES students(id)
);

-- Handout chunks (for RAG - Phase 5)
CREATE TABLE IF NOT EXISTS handout_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  handout_id UUID REFERENCES handouts(id) ON DELETE CASCADE NOT NULL,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  embedding VECTOR(1536),  -- OpenAI ada-002 or Voyage dimensions
  token_count INTEGER,
  metadata JSONB,  -- page number, section title, etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(handout_id, chunk_index)
);

-- Questions table
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  handout_id UUID REFERENCES handouts(id),
  source_chunk_id UUID REFERENCES handout_chunks(id),
  
  question_text TEXT NOT NULL,
  question_type VARCHAR(20) DEFAULT 'multiple_choice' CHECK (question_type IN ('multiple_choice', 'true_false', 'fill_blank')),
  options JSONB,  -- ["Option A", "Option B", "Option C", "Option D"]
  correct_answer VARCHAR(255) NOT NULL,
  explanation TEXT,
  
  difficulty VARCHAR(10) CHECK (difficulty IN ('easy', 'medium', 'hard')) NOT NULL,
  license_type VARCHAR(10) CHECK (license_type IN ('A', 'B', 'both')) NOT NULL,
  topic_tags TEXT[],
  
  -- Generation metadata
  is_ai_generated BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES students(id),
  verified_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily challenges
CREATE TABLE IF NOT EXISTS daily_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_date DATE NOT NULL,
  license_type VARCHAR(10) CHECK (license_type IN ('A', 'B')) NOT NULL,
  question_ids UUID[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(challenge_date, license_type)
);

-- Challenge responses
CREATE TABLE IF NOT EXISTS challenge_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  challenge_id UUID REFERENCES daily_challenges(id) NOT NULL,
  question_id UUID REFERENCES questions(id) NOT NULL,
  
  selected_answer VARCHAR(255),
  is_correct BOOLEAN,
  time_taken_seconds INTEGER,
  answered_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(student_id, challenge_id, question_id)
);

-- Chat sessions (Phase 5)
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(255),
  messages JSONB DEFAULT '[]',
  context_chunks UUID[],  -- Referenced handout chunks
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- INDEXES
-- ==========================================

-- Students
CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);
CREATE INDEX IF NOT EXISTS idx_students_active ON students(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_students_license ON students(license_track);

-- Questions
CREATE INDEX IF NOT EXISTS idx_questions_license ON questions(license_type);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_questions_verified ON questions(is_verified) WHERE is_verified = true;
CREATE INDEX IF NOT EXISTS idx_questions_handout ON questions(handout_id);

-- Full-text search on questions
CREATE INDEX IF NOT EXISTS idx_questions_fts ON questions 
  USING gin(to_tsvector('english', question_text || ' ' || COALESCE(explanation, '')));

-- Challenge responses
CREATE INDEX IF NOT EXISTS idx_responses_student ON challenge_responses(student_id);
CREATE INDEX IF NOT EXISTS idx_responses_date ON challenge_responses(answered_at);

-- Handout chunks vector search (Phase 5)
CREATE INDEX IF NOT EXISTS idx_chunks_embedding ON handout_chunks 
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Chat sessions
CREATE INDEX IF NOT EXISTS idx_chat_student ON chat_sessions(student_id);

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE handouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE handout_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

-- Students: Can read/update own profile
CREATE POLICY "Students can view own profile" ON students
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Students can update own profile" ON students
  FOR UPDATE USING (auth.uid() = id);

-- Allow registration (insert without auth)
CREATE POLICY "Anyone can register" ON students
  FOR INSERT WITH CHECK (true);

-- Handouts: All authenticated users can read
CREATE POLICY "Authenticated can read handouts" ON handouts
  FOR SELECT USING (auth.role() = 'authenticated');

-- Handout chunks: All authenticated users can read
CREATE POLICY "Authenticated can read chunks" ON handout_chunks
  FOR SELECT USING (auth.role() = 'authenticated');

-- Questions: All authenticated users can read verified questions
CREATE POLICY "Authenticated can read verified questions" ON questions
  FOR SELECT USING (auth.role() = 'authenticated' AND is_verified = true);

-- Daily challenges: All authenticated users can read
CREATE POLICY "Authenticated can read challenges" ON daily_challenges
  FOR SELECT USING (auth.role() = 'authenticated');

-- Challenge responses: Students can manage their own
CREATE POLICY "Students can view own responses" ON challenge_responses
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can insert own responses" ON challenge_responses
  FOR INSERT WITH CHECK (auth.uid() = student_id);

-- Chat sessions: Students can manage their own
CREATE POLICY "Students can view own chats" ON chat_sessions
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can insert own chats" ON chat_sessions
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update own chats" ON chat_sessions
  FOR UPDATE USING (auth.uid() = student_id);

CREATE POLICY "Students can delete own chats" ON chat_sessions
  FOR DELETE USING (auth.uid() = student_id);

-- ==========================================
-- FUNCTIONS
-- ==========================================

-- Vector similarity search function (Phase 5)
CREATE OR REPLACE FUNCTION match_chunks(
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5,
  filter_license TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  metadata JSONB,
  similarity FLOAT,
  handout_title TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    hc.id,
    hc.content,
    hc.metadata,
    1 - (hc.embedding <=> query_embedding) AS similarity,
    h.title AS handout_title
  FROM handout_chunks hc
  JOIN handouts h ON h.id = hc.handout_id
  WHERE 
    1 - (hc.embedding <=> query_embedding) > match_threshold
    AND (filter_license IS NULL OR h.license_type IN (filter_license, 'both'))
  ORDER BY hc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Update streak function
CREATE OR REPLACE FUNCTION update_student_streak(p_student_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_last_completed TIMESTAMPTZ;
  v_current_streak INTEGER;
BEGIN
  SELECT last_challenge_completed_at, streak_count 
  INTO v_last_completed, v_current_streak
  FROM students WHERE id = p_student_id;
  
  -- If completed yesterday, increment streak
  IF v_last_completed::date = (CURRENT_DATE - INTERVAL '1 day') THEN
    UPDATE students SET 
      streak_count = streak_count + 1,
      longest_streak = GREATEST(longest_streak, streak_count + 1),
      last_challenge_completed_at = NOW()
    WHERE id = p_student_id;
  -- If already completed today, do nothing
  ELSIF v_last_completed::date = CURRENT_DATE THEN
    -- Already completed today
    NULL;
  -- Otherwise, reset streak to 1
  ELSE
    UPDATE students SET 
      streak_count = 1,
      last_challenge_completed_at = NOW()
    WHERE id = p_student_id;
  END IF;
END;
$$;

-- ==========================================
-- TRIGGERS
-- ==========================================

-- Auto-update updated_at for chat sessions
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER chat_sessions_updated_at
  BEFORE UPDATE ON chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
