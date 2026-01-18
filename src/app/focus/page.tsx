'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  Target,
  TrendingUp,
  BookOpen,
  AlertCircle
} from 'lucide-react';

// ===========================================
// FOCUS SESSION PAGE
// ===========================================
// Timed study sessions with continuous questions

interface Question {
  id: string;
  question_text: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
}

interface AnswerRecord {
  questionId: string;
  selected: string;
  correct: boolean;
  timeSpent: number;
  topic: string;
  question: Question;
}

// Demo questions (same as study page)
const DEMO_QUESTIONS: Question[] = [
  {
    id: '1',
    question_text: 'What is the minimum depth for a residential foundation footing in California?',
    options: ['A. 6 inches', 'B. 12 inches', 'C. 18 inches', 'D. 24 inches'],
    correct_answer: 'B',
    explanation: 'According to CBC Section 1809.4, the minimum depth for footings is 12 inches below undisturbed ground surface.',
    difficulty: 'medium',
    topic: 'Building Codes & Regulations',
  },
  {
    id: '2',
    question_text: 'Which document must a contractor provide to a homeowner before starting work over $500?',
    options: ['A. Building permit', 'B. Written contract', 'C. Insurance certificate', 'D. License bond'],
    correct_answer: 'B',
    explanation: 'California law requires a written contract for any home improvement project over $500.',
    difficulty: 'easy',
    topic: 'Contract Law',
  },
  {
    id: '3',
    question_text: 'What is the OSHA requirement for fall protection height in construction?',
    options: ['A. 4 feet', 'B. 6 feet', 'C. 8 feet', 'D. 10 feet'],
    correct_answer: 'B',
    explanation: 'OSHA requires fall protection for construction workers at heights of 6 feet or more above a lower level.',
    difficulty: 'easy',
    topic: 'Construction Safety',
  },
  {
    id: '4',
    question_text: 'How long must a contractor retain project records after completion?',
    options: ['A. 1 year', 'B. 3 years', 'C. 5 years', 'D. 7 years'],
    correct_answer: 'C',
    explanation: 'Contractors should retain project records for at least 5 years for tax and legal purposes.',
    difficulty: 'medium',
    topic: 'Project Management',
  },
  {
    id: '5',
    question_text: 'What percentage markup is typical for general contractor overhead and profit?',
    options: ['A. 5-10%', 'B. 10-15%', 'C. 15-25%', 'D. 25-35%'],
    correct_answer: 'C',
    explanation: 'Industry standard markup for overhead and profit typically ranges from 15-25%, depending on project complexity.',
    difficulty: 'hard',
    topic: 'Estimating & Bidding',
  },
  {
    id: '6',
    question_text: 'What is the maximum fine for contracting without a license in California?',
    options: ['A. $1,000', 'B. $5,000', 'C. $10,000', 'D. $15,000'],
    correct_answer: 'D',
    explanation: 'Contracting without a license is a misdemeanor punishable by a fine up to $15,000 and/or imprisonment.',
    difficulty: 'medium',
    topic: 'Licensing Requirements',
  },
  {
    id: '7',
    question_text: 'How many hours of continuing education are required for license renewal?',
    options: ['A. 8 hours', 'B. 16 hours', 'C. 24 hours', 'D. 32 hours'],
    correct_answer: 'B',
    explanation: 'CSLB requires 16 hours of continuing education for license renewal, including workers comp and law updates.',
    difficulty: 'easy',
    topic: 'Licensing Requirements',
  },
  {
    id: '8',
    question_text: 'What is the minimum trench width for installing a 4-inch pipe?',
    options: ['A. 12 inches', 'B. 16 inches', 'C. 18 inches', 'D. 24 inches'],
    correct_answer: 'C',
    explanation: 'Minimum trench width should be 18 inches or pipe diameter plus 12 inches, whichever is greater.',
    difficulty: 'hard',
    topic: 'Building Codes & Regulations',
  },
  {
    id: '9',
    question_text: 'Within how many days must a contractor respond to a CSLB complaint?',
    options: ['A. 10 days', 'B. 15 days', 'C. 30 days', 'D. 45 days'],
    correct_answer: 'B',
    explanation: 'Contractors must respond to CSLB complaints within 15 days of receipt.',
    difficulty: 'medium',
    topic: 'Licensing Requirements',
  },
  {
    id: '10',
    question_text: 'What type of insurance covers damage to a client\'s property during construction?',
    options: ['A. Workers compensation', 'B. General liability', 'C. Builders risk', 'D. Professional liability'],
    correct_answer: 'B',
    explanation: 'General liability insurance covers property damage and bodily injury to third parties during construction.',
    difficulty: 'easy',
    topic: 'Business & Insurance',
  },
];

type SessionState = 'setup' | 'session' | 'results' | 'review';

const DURATION_OPTIONS = [15, 30, 45, 60];

export default function FocusPage() {
  const [state, setState] = useState<SessionState>('setup');
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [questionStartTime, setQuestionStartTime] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Timer effect
  useEffect(() => {
    if (state === 'session' && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setState('results');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [state, timeRemaining]);

  const startSession = () => {
    if (!selectedDuration) return;

    // Shuffle questions
    const shuffled = [...DEMO_QUESTIONS].sort(() => Math.random() - 0.5);
    setQuestions(shuffled);
    setTimeRemaining(selectedDuration * 60);
    setSessionStartTime(Date.now());
    setQuestionStartTime(Date.now());
    setCurrentIndex(0);
    setAnswers([]);
    setSelectedAnswer(null);
    setShowResult(false);
    setState('session');
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer || !questions[currentIndex]) return;

    const currentQuestion = questions[currentIndex];
    const isCorrect = selectedAnswer === currentQuestion.correct_answer;
    const timeSpent = Math.round((Date.now() - questionStartTime) / 1000);

    setAnswers(prev => [...prev, {
      questionId: currentQuestion.id,
      selected: selectedAnswer,
      correct: isCorrect,
      timeSpent,
      topic: currentQuestion.topic,
      question: currentQuestion,
    }]);

    setShowResult(true);
  };

  const handleNextQuestion = () => {
    // Check if we've exhausted all questions - cycle back if needed
    const nextIndex = currentIndex + 1;
    if (nextIndex >= questions.length) {
      // Reshuffle and start over
      const shuffled = [...DEMO_QUESTIONS].sort(() => Math.random() - 0.5);
      setQuestions(shuffled);
      setCurrentIndex(0);
    } else {
      setCurrentIndex(nextIndex);
    }

    setSelectedAnswer(null);
    setShowResult(false);
    setQuestionStartTime(Date.now());
  };

  const endSession = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setState('results');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate stats
  const totalAnswered = answers.length;
  const correctCount = answers.filter(a => a.correct).length;
  const accuracy = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;
  const avgTimePerQuestion = totalAnswered > 0
    ? Math.round(answers.reduce((sum, a) => sum + a.timeSpent, 0) / totalAnswered)
    : 0;

  // Group wrong answers by topic
  const wrongByTopic = answers
    .filter(a => !a.correct)
    .reduce((acc, a) => {
      acc[a.topic] = (acc[a.topic] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  // Setup Screen
  if (state === 'setup') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
        {/* Back button row */}
        <div className="px-4 pt-4">
          <Link
            href="/dashboard"
            className="w-10 h-10 bg-white dark:bg-gray-800 rounded-full shadow-sm border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </div>

        {/* Centered content */}
        <main className="flex-1 flex items-center justify-center px-4 pb-8">
          <div className="w-full max-w-sm -mt-16">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-5">
                <Clock className="w-10 h-10 text-primary-500" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Focus Session
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                How long do you want to study?
              </p>
            </div>

            <div className="grid grid-cols-4 gap-3 mb-8">
              {DURATION_OPTIONS.map((duration) => (
                <button
                  key={duration}
                  onClick={() => setSelectedDuration(duration)}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${
                    selectedDuration === duration
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 shadow-sm'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className="text-2xl font-bold">{duration}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">min</div>
                </button>
              ))}
            </div>

            <button
              onClick={startSession}
              disabled={!selectedDuration}
              className="btn-primary w-full py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Start Session
            </button>

            <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-4">
              Questions flow continuously until time runs out
            </p>
          </div>
        </main>
      </div>
    );
  }

  // Active Session
  if (state === 'session') {
    const currentQuestion = questions[currentIndex];
    const isCorrect = selectedAnswer === currentQuestion?.correct_answer;

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
          <div className="max-w-lg mx-auto px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <div className={`text-2xl font-bold ${timeRemaining <= 60 ? 'text-danger-500' : 'text-gray-900 dark:text-gray-100'}`}>
                {formatTime(timeRemaining)}
              </div>
              <button
                onClick={endSession}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 px-3 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                End Early
              </button>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
              <span>{totalAnswered} answered</span>
              <span className="text-gray-300 dark:text-gray-600">|</span>
              <span className={accuracy >= 70 ? 'text-success-500' : 'text-amber-500'}>
                {accuracy}% accuracy
              </span>
            </div>
          </div>
        </header>

        <main className="max-w-lg mx-auto px-4 py-6">
          {currentQuestion && (
            <>
              <div className="card p-5 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Question {totalAnswered + 1}</span>
                  <DifficultyBadge difficulty={currentQuestion.difficulty} />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 leading-relaxed">
                  {currentQuestion.question_text}
                </h2>
              </div>

              <div className="space-y-2 mb-4">
                {currentQuestion.options.map((option, index) => {
                  const letter = option.charAt(0);
                  const isSelected = selectedAnswer === letter;
                  const showCorrect = showResult && letter === currentQuestion.correct_answer;
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
                <div className={`card p-4 mb-4 ${isCorrect ? 'bg-success-500/10 border-success-500' : 'bg-amber-500/10 dark:bg-amber-500/20 border-amber-400'} border`}>
                  <p className={`font-medium mb-2 ${isCorrect ? 'text-success-500' : 'text-amber-500'}`}>
                    {isCorrect ? 'Correct!' : 'Not quite'}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">{currentQuestion.explanation}</p>
                </div>
              )}

              {!showResult ? (
                <button
                  onClick={handleSubmitAnswer}
                  disabled={!selectedAnswer}
                  className="btn-primary w-full py-3 disabled:opacity-50"
                >
                  Check Answer
                </button>
              ) : (
                <button onClick={handleNextQuestion} className="btn-primary w-full py-3">
                  Next Question
                </button>
              )}
            </>
          )}
        </main>
      </div>
    );
  }

  // Review Wrong Answers
  if (state === 'review') {
    const wrongAnswers = answers.filter(a => !a.correct);

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
            <button onClick={() => setState('results')} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Review Answers</h1>
          </div>
        </header>

        <main className="max-w-lg mx-auto px-4 py-6">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{wrongAnswers.length} questions to review</p>

          <div className="space-y-4">
            {wrongAnswers.map((answer, index) => (
              <div key={answer.questionId + '-' + index} className="card p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-6 h-6 rounded-full bg-danger-500/20 text-danger-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <XCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-gray-900 dark:text-gray-100 font-medium text-sm leading-relaxed">
                      {answer.question.question_text}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{answer.topic}</p>
                  </div>
                </div>

                <div className="pl-9 space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-danger-500">
                    <span className="font-medium">Your answer:</span>
                    <span>{answer.question.options.find(o => o.startsWith(answer.selected))}</span>
                  </div>
                  <div className="flex items-center gap-2 text-success-500">
                    <span className="font-medium">Correct answer:</span>
                    <span>{answer.question.options.find(o => o.startsWith(answer.question.correct_answer))}</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mt-2 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    {answer.question.explanation}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <Link href="/dashboard" className="btn-secondary w-full py-3 mt-6 flex items-center justify-center">
            Back to Dashboard
          </Link>
        </main>
      </div>
    );
  }

  // Results Screen
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-lg mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 text-center">Session Complete</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-8">
        {/* Stats Card */}
        <div className="card p-6 mb-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Target className="w-8 h-8 text-primary-500" />
            </div>
            <div className="text-4xl font-bold text-gray-900 dark:text-gray-100">{accuracy}%</div>
            <div className="text-gray-500 dark:text-gray-400">accuracy</div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalAnswered}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">questions answered</div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{avgTimePerQuestion}s</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">avg per question</div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-success-500">{correctCount}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">correct</div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-danger-500">{totalAnswered - correctCount}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">incorrect</div>
            </div>
          </div>
        </div>

        {/* Areas to Review */}
        {Object.keys(wrongByTopic).length > 0 && (
          <div className="card p-5 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-amber-500" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Areas to Review</h3>
            </div>
            <div className="space-y-3">
              {Object.entries(wrongByTopic)
                .sort(([, a], [, b]) => b - a)
                .map(([topic, count]) => (
                  <div key={topic} className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300">{topic}</span>
                    <span className="text-sm text-danger-500 font-medium">{count} wrong</span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* No Wrong Answers */}
        {Object.keys(wrongByTopic).length === 0 && totalAnswered > 0 && (
          <div className="card p-5 mb-6 bg-success-500/10 border-success-500">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-success-500" />
              <div>
                <p className="font-medium text-success-500">Perfect Session!</p>
                <p className="text-sm text-success-500/80">You got every question right.</p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          {Object.keys(wrongByTopic).length > 0 && (
            <button
              onClick={() => setState('review')}
              className="btn-secondary w-full py-3 flex items-center justify-center gap-2"
            >
              <AlertCircle className="w-4 h-4" />
              Review Wrong Answers
            </button>
          )}
          <Link href="/dashboard" className="btn-primary w-full py-3 flex items-center justify-center">
            Back to Dashboard
          </Link>
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
