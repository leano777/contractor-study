// ===========================================
// SHARED TYPES
// ===========================================

// Legacy single license type (for backwards compatibility with existing data)
export type LicenseTrack = 'A' | 'B' | 'both';

// New multi-license support - all California contractor license codes
export type LicenseCode =
  | 'A' | 'B'  // General licenses
  | 'C-2' | 'C-4' | 'C-5' | 'C-6' | 'C-7' | 'C-8' | 'C-9' | 'C-10'
  | 'C-11' | 'C-12' | 'C-13' | 'C-15' | 'C-16' | 'C-17' | 'C-20' | 'C-21'
  | 'C-22' | 'C-23' | 'C-27' | 'C-28' | 'C-29' | 'C-31' | 'C-32' | 'C-33'
  | 'C-34' | 'C-35' | 'C-36' | 'C-38' | 'C-39' | 'C-42' | 'C-43' | 'C-45'
  | 'C-46' | 'C-47' | 'C-50' | 'C-51' | 'C-53' | 'C-54' | 'C-55' | 'C-57'
  | 'C-60' | 'C-61';

export type Difficulty = 'easy' | 'medium' | 'hard';
export type QuestionType = 'multiple_choice' | 'true_false' | 'fill_blank';
export type ContactPreference = 'email' | 'sms' | 'both';
export type Language = 'en' | 'es';

export interface Student {
  id: string;
  email: string;
  phone: string | null;
  full_name: string;
  // Legacy single license field (for backwards compatibility)
  license_track: LicenseTrack;
  // New multi-license field
  licenses: LicenseCode[];
  preferred_contact: ContactPreference;
  preferred_language: Language;
  referral_source: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  streak_count: number;
  longest_streak: number;
  streak_freeze_available: boolean;
  last_challenge_completed_at: string | null;
  notification_preferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  enrolled_at: string;
  is_active: boolean;
}

export interface Handout {
  id: string;
  title: string;
  description: string | null;
  file_url: string;
  file_type: 'pdf' | 'docx' | 'image' | 'txt';
  license_type: LicenseTrack;
  chapter: string | null;
  topic_tags: string[];
  extracted_text: string | null;
  is_processed: boolean;
  processed_at: string | null;
  uploaded_at: string;
  uploaded_by: string | null;
}

export interface HandoutChunk {
  id: string;
  handout_id: string;
  chunk_index: number;
  content: string;
  embedding: number[] | null;
  token_count: number | null;
  metadata: {
    sectionTitle?: string;
    sectionSummary?: string;
    chunkOfSection?: number;
    totalSectionChunks?: number;
    pageNumber?: number;
  };
  created_at: string;
}

export interface Question {
  id: string;
  handout_id: string | null;
  source_chunk_id: string | null;
  question_text: string;
  question_type: QuestionType;
  options: string[];
  correct_answer: string;
  explanation: string | null;
  difficulty: Difficulty;
  license_type: LicenseTrack;
  topic_tags: string[];
  is_ai_generated: boolean;
  is_verified: boolean;
  verified_by: string | null;
  verified_at: string | null;
  created_at: string;
}

export interface DailyChallenge {
  id: string;
  challenge_date: string;
  license_type: 'A' | 'B';
  question_ids: string[];
  created_at: string;
}

export interface ChallengeResponse {
  id: string;
  student_id: string;
  challenge_id: string;
  question_id: string;
  selected_answer: string | null;
  is_correct: boolean | null;
  time_taken_seconds: number | null;
  answered_at: string;
}

export interface ChatSession {
  id: string;
  student_id: string;
  title: string | null;
  messages: ChatMessage[];
  context_chunks: string[];
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Challenge Types
export interface ChallengeQuestion extends Question {
  answered?: boolean;
  selectedAnswer?: string;
  isCorrect?: boolean;
}

export interface ChallengeState {
  challengeId: string;
  questions: ChallengeQuestion[];
  currentIndex: number;
  completed: boolean;
  score?: number;
  startedAt: string;
  completedAt?: string;
}

// Stats Types
export interface StudentStats {
  totalQuestionsAnswered: number;
  correctAnswers: number;
  accuracy: number;
  currentStreak: number;
  longestStreak: number;
  challengesCompleted: number;
  topicBreakdown: Record<string, {
    total: number;
    correct: number;
    accuracy: number;
  }>;
  difficultyBreakdown: Record<Difficulty, {
    total: number;
    correct: number;
    accuracy: number;
  }>;
  recentActivity: Array<{
    date: string;
    completed: boolean;
    score: number;
  }>;
}
