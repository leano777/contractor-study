-- ===========================================
-- MIGRATION 002: Achievements & Additional Features
-- ===========================================

-- Student achievements table
CREATE TABLE IF NOT EXISTS student_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, achievement_id)
);

-- Add indexes
CREATE INDEX idx_student_achievements_student ON student_achievements(student_id);
CREATE INDEX idx_student_achievements_achievement ON student_achievements(achievement_id);

-- Add streak freeze columns to students table
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS streak_freeze_available BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS streak_freeze_used_at TIMESTAMPTZ;

-- Add longest streak if not exists
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0;

-- Chat message history table (for RAG chat)
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  sources JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_messages_session ON chat_messages(session_id);

-- Notification log table
CREATE TABLE IF NOT EXISTS notification_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'daily_challenge', 'streak_reminder', 'achievement', 'weekly_progress'
  channel TEXT NOT NULL, -- 'email', 'sms'
  status TEXT NOT NULL DEFAULT 'sent', -- 'sent', 'delivered', 'failed'
  message_id TEXT, -- External provider message ID
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notification_log_student ON notification_log(student_id);
CREATE INDEX idx_notification_log_type ON notification_log(type);

-- Study sessions table (track study time)
CREATE TABLE IF NOT EXISTS study_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  session_type TEXT NOT NULL, -- 'challenge', 'practice', 'chat'
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  questions_answered INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0
);

CREATE INDEX idx_study_sessions_student ON study_sessions(student_id);
CREATE INDEX idx_study_sessions_date ON study_sessions(started_at);

-- Weekly digest settings (for progress emails)
CREATE TABLE IF NOT EXISTS weekly_digest_preferences (
  student_id UUID PRIMARY KEY REFERENCES students(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT true,
  day_of_week INTEGER DEFAULT 1, -- 0 = Sunday, 1 = Monday, etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE student_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_digest_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for student_achievements
CREATE POLICY "Students can view their own achievements"
ON student_achievements FOR SELECT
USING (auth.uid() = student_id);

CREATE POLICY "Service role can manage achievements"
ON student_achievements FOR ALL
USING (auth.role() = 'service_role');

-- RLS Policies for chat_messages
CREATE POLICY "Students can view their own chat messages"
ON chat_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM chat_sessions 
    WHERE chat_sessions.id = chat_messages.session_id 
    AND chat_sessions.student_id = auth.uid()
  )
);

CREATE POLICY "Students can insert their own chat messages"
ON chat_messages FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM chat_sessions 
    WHERE chat_sessions.id = chat_messages.session_id 
    AND chat_sessions.student_id = auth.uid()
  )
);

-- RLS Policies for notification_log
CREATE POLICY "Students can view their own notifications"
ON notification_log FOR SELECT
USING (auth.uid() = student_id);

-- RLS Policies for study_sessions
CREATE POLICY "Students can view their own study sessions"
ON study_sessions FOR SELECT
USING (auth.uid() = student_id);

CREATE POLICY "Students can manage their own study sessions"
ON study_sessions FOR ALL
USING (auth.uid() = student_id);

-- RLS Policies for weekly_digest_preferences
CREATE POLICY "Students can manage their own digest preferences"
ON weekly_digest_preferences FOR ALL
USING (auth.uid() = student_id);

-- Function to reset streak freeze weekly (call via cron)
CREATE OR REPLACE FUNCTION reset_weekly_streak_freezes()
RETURNS void AS $$
BEGIN
  UPDATE students
  SET streak_freeze_available = true
  WHERE streak_freeze_available = false
    AND (streak_freeze_used_at IS NULL 
         OR streak_freeze_used_at < NOW() - INTERVAL '7 days');
END;
$$ LANGUAGE plpgsql;

-- Function to update longest streak
CREATE OR REPLACE FUNCTION update_longest_streak()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.streak_count > COALESCE(OLD.longest_streak, 0) THEN
    NEW.longest_streak := NEW.streak_count;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update longest streak
DROP TRIGGER IF EXISTS trigger_update_longest_streak ON students;
CREATE TRIGGER trigger_update_longest_streak
BEFORE UPDATE ON students
FOR EACH ROW
WHEN (NEW.streak_count IS DISTINCT FROM OLD.streak_count)
EXECUTE FUNCTION update_longest_streak();
