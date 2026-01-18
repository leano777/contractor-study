-- ===========================================
-- Add UTM tracking columns to students table
-- ===========================================
-- Track registration source for marketing analytics

ALTER TABLE students
ADD COLUMN IF NOT EXISTS utm_source VARCHAR(100),
ADD COLUMN IF NOT EXISTS utm_medium VARCHAR(100),
ADD COLUMN IF NOT EXISTS utm_campaign VARCHAR(100);

-- Index for campaign analysis
CREATE INDEX IF NOT EXISTS idx_students_utm_campaign ON students(utm_campaign) WHERE utm_campaign IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_students_utm_source ON students(utm_source) WHERE utm_source IS NOT NULL;
