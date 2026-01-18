-- ===========================================
-- Add multi-license support and language preference
-- ===========================================
-- Supports all California contractor license types
-- and bilingual (English/Spanish) interface

-- Add licenses array column (stores multiple license codes)
ALTER TABLE students
ADD COLUMN IF NOT EXISTS licenses TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Add preferred language column
ALTER TABLE students
ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(5) DEFAULT 'en';

-- Migrate existing license_track data to licenses array
UPDATE students
SET licenses = CASE
  WHEN license_track = 'A' THEN ARRAY['A']::TEXT[]
  WHEN license_track = 'B' THEN ARRAY['B']::TEXT[]
  WHEN license_track = 'both' THEN ARRAY['A', 'B']::TEXT[]
  ELSE ARRAY[]::TEXT[]
END
WHERE licenses = ARRAY[]::TEXT[] OR licenses IS NULL;

-- Index for license queries
CREATE INDEX IF NOT EXISTS idx_students_licenses ON students USING GIN(licenses);

-- Index for language preference
CREATE INDEX IF NOT EXISTS idx_students_language ON students(preferred_language);

-- Add check constraint for valid language values
ALTER TABLE students
ADD CONSTRAINT valid_language CHECK (preferred_language IN ('en', 'es'));

-- Comment for documentation
COMMENT ON COLUMN students.licenses IS 'Array of California contractor license codes (A, B, C-2 through C-61)';
COMMENT ON COLUMN students.preferred_language IS 'User preferred language: en (English) or es (Spanish)';
