'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft,
  Search,
  Filter,
  BookOpen,
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock,
  Target,
  Bookmark,
  BookmarkCheck
} from 'lucide-react';

// ===========================================
// PHASE 4: STUDY BROWSER PAGE
// ===========================================
// Browse and practice questions by topic

interface Topic {
  id: string;
  name: string;
  questionCount: number;
  completedCount: number;
  accuracy: number;
}

interface Question {
  id: string;
  question_text: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  bookmarked: boolean;
  lastAnswered?: {
    correct: boolean;
    date: string;
  };
}

// Demo data
const DEMO_TOPICS: Topic[] = [
  { id: '1', name: 'Building Codes & Regulations', questionCount: 45, completedCount: 32, accuracy: 78 },
  { id: '2', name: 'Licensing Requirements', questionCount: 28, completedCount: 28, accuracy: 85 },
  { id: '3', name: 'Construction Safety', questionCount: 35, completedCount: 20, accuracy: 72 },
  { id: '4', name: 'Contract Law', questionCount: 22, completedCount: 15, accuracy: 80 },
  { id: '5', name: 'Estimating & Bidding', questionCount: 30, completedCount: 8, accuracy: 65 },
  { id: '6', name: 'Project Management', questionCount: 25, completedCount: 12, accuracy: 75 },
];

const DEMO_QUESTIONS: Question[] = [
  {
    id: '1',
    question_text: 'What is the minimum depth for a residential foundation footing in California?',
    options: ['A. 6 inches', 'B. 12 inches', 'C. 18 inches', 'D. 24 inches'],
    correct_answer: 'B',
    explanation: 'According to CBC Section 1809.4, the minimum depth for footings is 12 inches below undisturbed ground surface.',
    difficulty: 'medium',
    topic: 'Building Codes & Regulations',
    bookmarked: true,
    lastAnswered: { correct: true, date: '2026-01-16' },
  },
  {
    id: '2',
    question_text: 'Which document must a contractor provide to a homeowner before starting work over $500?',
    options: ['A. Building permit', 'B. Written contract', 'C. Insurance certificate', 'D. License bond'],
    correct_answer: 'B',
    explanation: 'California law requires a written contract for any home improvement project over $500.',
    difficulty: 'easy',
    topic: 'Contract Law',
    bookmarked: false,
  },
  {
    id: '3',
    question_text: 'What is the OSHA requirement for fall protection height in construction?',
    options: ['A. 4 feet', 'B. 6 feet', 'C. 8 feet', 'D. 10 feet'],
    correct_answer: 'B',
    explanation: 'OSHA requires fall protection for construction workers at heights of 6 feet or more above a lower level.',
    difficulty: 'easy',
    topic: 'Construction Safety',
    bookmarked: false,
    lastAnswered: { correct: false, date: '2026-01-15' },
  },
  {
    id: '4',
    question_text: 'How long must a contractor retain project records after completion?',
    options: ['A. 1 year', 'B. 3 years', 'C. 5 years', 'D. 7 years'],
    correct_answer: 'C',
    explanation: 'Contractors should retain project records for at least 5 years for tax and legal purposes.',
    difficulty: 'medium',
    topic: 'Project Management',
    bookmarked: true,
  },
  {
    id: '5',
    question_text: 'What percentage markup is typical for general contractor overhead and profit?',
    options: ['A. 5-10%', 'B. 10-15%', 'C. 15-25%', 'D. 25-35%'],
    correct_answer: 'C',
    explanation: 'Industry standard markup for overhead and profit typically ranges from 15-25%, depending on project complexity.',
    difficulty: 'hard',
    topic: 'Estimating & Bidding',
    bookmarked: false,
  },
];

type ViewMode = 'topics' | 'questions' | 'practice';
type FilterType = 'all' | 'bookmarked' | 'incorrect' | 'unanswered';

export default function StudyPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('topics');
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [difficulty, setDifficulty] = useState<string>('all');
  const [practiceQuestion, setPracticeQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const filteredQuestions = DEMO_QUESTIONS.filter(q => {
    if (selectedTopic && q.topic !== selectedTopic.name) return false;
    if (searchQuery && !q.question_text.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filter === 'bookmarked' && !q.bookmarked) return false;
    if (filter === 'incorrect' && q.lastAnswered?.correct !== false) return false;
    if (filter === 'unanswered' && q.lastAnswered) return false;
    if (difficulty !== 'all' && q.difficulty !== difficulty) return false;
    return true;
  });

  const handleSelectTopic = (topic: Topic) => {
    setSelectedTopic(topic);
    setViewMode('questions');
  };

  const handleStartPractice = (question: Question) => {
    setPracticeQuestion(question);
    setSelectedAnswer(null);
    setShowResult(false);
    setViewMode('practice');
  };

  const handleSubmitAnswer = () => {
    setShowResult(true);
  };

  const handleNextQuestion = () => {
    const currentIndex = filteredQuestions.findIndex(q => q.id === practiceQuestion?.id);
    const nextQuestion = filteredQuestions[currentIndex + 1];
    if (nextQuestion) {
      handleStartPractice(nextQuestion);
    } else {
      setViewMode('questions');
    }
  };

  // Practice Mode
  if (viewMode === 'practice' && practiceQuestion) {
    const isCorrect = selectedAnswer === practiceQuestion.correct_answer;

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
          <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
            <button onClick={() => setViewMode('questions')} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="text-sm text-gray-500 dark:text-gray-400">{practiceQuestion.topic}</span>
            <DifficultyBadge difficulty={practiceQuestion.difficulty} />
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 py-8">
          <div className="card p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 leading-relaxed">
              {practiceQuestion.question_text}
            </h2>
          </div>

          <div className="space-y-3 mb-6">
            {practiceQuestion.options.map((option, index) => {
              const letter = option.charAt(0);
              const isSelected = selectedAnswer === letter;
              const showCorrect = showResult && letter === practiceQuestion.correct_answer;
              const showIncorrect = showResult && isSelected && !isCorrect;

              return (
                <button
                  key={index}
                  onClick={() => !showResult && setSelectedAnswer(letter)}
                  disabled={showResult}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    showCorrect ? 'border-success-500 bg-success-500/10' :
                    showIncorrect ? 'border-danger-500 bg-danger-500/10' :
                    isSelected ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30' :
                    'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      showCorrect ? 'bg-success-500 text-white' :
                      showIncorrect ? 'bg-danger-500 text-white' :
                      isSelected ? 'bg-primary-500 text-white' :
                      'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                    }`}>
                      {showCorrect ? <CheckCircle className="w-5 h-5" /> :
                       showIncorrect ? <XCircle className="w-5 h-5" /> : letter}
                    </div>
                    <span className="flex-1 text-gray-700 dark:text-gray-300">{option.slice(3)}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {showResult && (
            <div className={`card p-4 mb-6 ${isCorrect ? 'bg-success-500/10 border-success-500' : 'bg-amber-500/10 dark:bg-amber-500/20 border-amber-400'} border`}>
              <p className={`font-medium mb-2 ${isCorrect ? 'text-success-500' : 'text-amber-500'}`}>
                {isCorrect ? '✓ Correct!' : '✗ Not quite'}
              </p>
              <p className="text-gray-700 dark:text-gray-300 text-sm">{practiceQuestion.explanation}</p>
            </div>
          )}

          <div className="flex gap-3">
            {!showResult ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={!selectedAnswer}
                className="btn-primary flex-1 py-3 disabled:opacity-50"
              >
                Check Answer
              </button>
            ) : (
              <button onClick={handleNextQuestion} className="btn-primary flex-1 py-3">
                Next Question
              </button>
            )}
          </div>
        </main>
      </div>
    );
  }

  // Questions List
  if (viewMode === 'questions') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center gap-4 mb-4">
              <button onClick={() => { setViewMode('topics'); setSelectedTopic(null); }} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {selectedTopic?.name || 'All Questions'}
              </h1>
            </div>

            {/* Search & Filter - Simplified */}
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input pl-10"
                />
              </div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as FilterType)}
                className="input w-40"
              >
                <option value="all">All</option>
                <option value="bookmarked">Bookmarked</option>
                <option value="incorrect">Got Wrong</option>
                <option value="unanswered">Unanswered</option>
              </select>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-6">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{filteredQuestions.length} questions</p>

          <div className="space-y-3">
            {filteredQuestions.map((question) => (
              <div key={question.id} className="card p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-start gap-4">
                  <button className="mt-1 text-gray-400 hover:text-primary-500">
                    {question.bookmarked ? (
                      <BookmarkCheck className="w-5 h-5 text-primary-500" />
                    ) : (
                      <Bookmark className="w-5 h-5" />
                    )}
                  </button>

                  <div className="flex-1">
                    <p className="text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">{question.question_text}</p>
                    <div className="flex items-center gap-3 text-sm">
                      <DifficultyBadge difficulty={question.difficulty} />
                      {question.lastAnswered && (
                        <span className={`flex items-center gap-1 ${
                          question.lastAnswered.correct ? 'text-success-500' : 'text-danger-500'
                        }`}>
                          {question.lastAnswered.correct ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <XCircle className="w-4 h-4" />
                          )}
                          <span>{question.lastAnswered.date}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleStartPractice(question)}
                    className="btn-secondary text-sm"
                  >
                    Practice
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  // Topics List (default)
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Study</h1>
            </div>
            <button
              onClick={() => { setSelectedTopic(null); setViewMode('questions'); }}
              className="btn-primary"
            >
              <Target className="w-4 h-4 mr-2" />
              Practice All
            </button>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Choose a topic to study or practice all questions
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid gap-4">
          {DEMO_TOPICS.map((topic) => (
            <button
              key={topic.id}
              onClick={() => handleSelectTopic(topic)}
              className="card p-5 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary-500/20 text-primary-500 flex items-center justify-center">
                  <BookOpen className="w-6 h-6" />
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{topic.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>{topic.questionCount} questions</span>
                    <span>{topic.completedCount} completed</span>
                    <span className="text-success-500">{topic.accuracy}% accuracy</span>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-2 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 rounded-full"
                      style={{ width: `${(topic.completedCount / topic.questionCount) * 100}%` }}
                    />
                  </div>
                </div>

                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}

function DifficultyBadge({ difficulty }: { difficulty: 'easy' | 'medium' | 'hard' }) {
  const colors = {
    easy: 'bg-green-500/20 text-green-600 dark:text-green-400',
    medium: 'bg-amber-500/20 text-amber-600 dark:text-amber-400',
    hard: 'bg-red-500/20 text-red-600 dark:text-red-400',
  };

  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[difficulty]}`}>
      {difficulty}
    </span>
  );
}
