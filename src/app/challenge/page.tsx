'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  XCircle, 
  Clock,
  Flame,
  Trophy,
  Home
} from 'lucide-react';

// ===========================================
// PHASE 4: DAILY CHALLENGE PAGE
// ===========================================
// Interactive quiz interface for daily challenges

interface Question {
  id: string;
  question_text: string;
  options: string[];
  correct_answer?: string;
  explanation?: string;
}

interface ChallengeState {
  questions: Question[];
  currentIndex: number;
  answers: Record<string, string>;
  results: Record<string, boolean>;
  showingResult: boolean;
  completed: boolean;
  startTime: number;
}

// Demo questions
const DEMO_QUESTIONS: Question[] = [
  {
    id: '1',
    question_text: 'What is the minimum depth for a residential foundation footing in California?',
    options: [
      'A. 6 inches',
      'B. 12 inches', 
      'C. 18 inches',
      'D. 24 inches'
    ],
    correct_answer: 'B',
    explanation: 'According to CBC Section 1809.4, the minimum depth for footings is 12 inches below undisturbed ground surface. This ensures adequate bearing capacity and protection from frost heave.',
  },
  {
    id: '2',
    question_text: 'Which license classification is required to install a residential solar panel system?',
    options: [
      'A. C-10 Electrical',
      'B. C-46 Solar',
      'C. B General Building',
      'D. Either A or B'
    ],
    correct_answer: 'D',
    explanation: 'Both C-10 (Electrical) and C-46 (Solar) contractors are authorized to install solar panel systems. A B (General Building) contractor can also perform this work if it\'s part of a larger project.',
  },
  {
    id: '3',
    question_text: 'What is the maximum rise for a single stair riser in residential construction?',
    options: [
      'A. 7 inches',
      'B. 7-3/4 inches',
      'C. 8 inches',
      'D. 8-1/4 inches'
    ],
    correct_answer: 'B',
    explanation: 'CBC Section 1011.5.2 specifies that the maximum riser height is 7-3/4 inches for residential stairs. This ensures safe and comfortable stair navigation.',
  },
  {
    id: '4',
    question_text: 'When is a building permit NOT required in California?',
    options: [
      'A. Installing a new water heater',
      'B. Building a fence under 6 feet',
      'C. Adding a bedroom to a house',
      'D. Replacing a roof'
    ],
    correct_answer: 'B',
    explanation: 'Fences under 6 feet in height typically do not require a building permit. However, water heater installation, room additions, and roof replacements generally require permits.',
  },
  {
    id: '5',
    question_text: 'What is the required experience for a B (General Building) contractor license?',
    options: [
      'A. 2 years journey-level experience',
      'B. 4 years journey-level experience',
      'C. 4 years any construction experience',
      'D. 6 years journey-level experience'
    ],
    correct_answer: 'B',
    explanation: 'CSLB requires 4 years of journey-level experience within the last 10 years to qualify for a B license. This experience must be verifiable and at a journeyman level.',
  },
];

export default function ChallengePage() {
  const router = useRouter();
  const [state, setState] = useState<ChallengeState>({
    questions: DEMO_QUESTIONS,
    currentIndex: 0,
    answers: {},
    results: {},
    showingResult: false,
    completed: false,
    startTime: Date.now(),
  });

  const currentQuestion = state.questions[state.currentIndex];
  const selectedAnswer = state.answers[currentQuestion?.id];
  const isCorrect = state.results[currentQuestion?.id];
  const progress = ((state.currentIndex + (state.showingResult ? 1 : 0)) / state.questions.length) * 100;

  const handleSelectAnswer = (answer: string) => {
    if (state.showingResult) return;
    
    setState(prev => ({
      ...prev,
      answers: { ...prev.answers, [currentQuestion.id]: answer },
    }));
  };

  const handleSubmitAnswer = async () => {
    if (!selectedAnswer) return;

    // In production, this would call the API
    const correct = selectedAnswer === currentQuestion.correct_answer;
    
    setState(prev => ({
      ...prev,
      results: { ...prev.results, [currentQuestion.id]: correct },
      showingResult: true,
    }));
  };

  const handleNext = () => {
    if (state.currentIndex < state.questions.length - 1) {
      setState(prev => ({
        ...prev,
        currentIndex: prev.currentIndex + 1,
        showingResult: false,
      }));
    } else {
      setState(prev => ({ ...prev, completed: true }));
    }
  };

  const calculateScore = () => {
    const correct = Object.values(state.results).filter(Boolean).length;
    return {
      correct,
      total: state.questions.length,
      percentage: Math.round((correct / state.questions.length) * 100),
    };
  };

  // Completed state
  if (state.completed) {
    const score = calculateScore();
    const timeTaken = Math.round((Date.now() - state.startTime) / 1000 / 60);

    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center p-4">
        <div className="card max-w-md w-full p-8 text-center animate-fade-in">
          <div className="w-20 h-20 bg-success-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trophy className="w-10 h-10 text-white" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Challenge Complete!
          </h1>

          <div className="my-8">
            <div className="text-6xl font-bold text-primary-600 dark:text-primary-400 mb-2">
              {score.percentage}%
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              {score.correct} of {score.total} correct
            </p>
          </div>

          <div className="flex justify-center gap-6 mb-8 text-sm">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-orange-500 mb-1">
                <Flame className="w-5 h-5" />
                <span className="font-bold text-lg">8</span>
              </div>
              <p className="text-gray-500 dark:text-gray-400">Day Streak</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-gray-700 dark:text-gray-300 mb-1">
                <Clock className="w-5 h-5" />
                <span className="font-bold text-lg">{timeTaken}m</span>
              </div>
              <p className="text-gray-500 dark:text-gray-400">Time</p>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setState(prev => ({ ...prev, currentIndex: 0, completed: false }))}
              className="btn-secondary w-full"
            >
              Review Answers
            </button>
            <Link href="/dashboard" className="btn-primary w-full flex items-center justify-center">
              <Home className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <Link href="/dashboard" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2 text-orange-500">
              <Flame className="w-5 h-5" />
              <span className="font-semibold">7 day streak</span>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {state.currentIndex + 1} / {state.questions.length}
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      {/* Question */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="card p-6 mb-6">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">
            Question {state.currentIndex + 1}
          </p>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 leading-relaxed">
            {currentQuestion.question_text}
          </h2>
        </div>

        {/* Options */}
        <div className="space-y-3 mb-6">
          {currentQuestion.options.map((option, index) => {
            const letter = option.charAt(0);
            const isSelected = selectedAnswer === letter;
            const showCorrect = state.showingResult && letter === currentQuestion.correct_answer;
            const showIncorrect = state.showingResult && isSelected && !isCorrect;

            return (
              <button
                key={index}
                onClick={() => handleSelectAnswer(letter)}
                disabled={state.showingResult}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  showCorrect
                    ? 'border-success-500 bg-success-500/10'
                    : showIncorrect
                    ? 'border-danger-500 bg-danger-500/10'
                    : isSelected
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    showCorrect
                      ? 'bg-success-500 text-white'
                      : showIncorrect
                      ? 'bg-danger-500 text-white'
                      : isSelected
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}>
                    {showCorrect ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : showIncorrect ? (
                      <XCircle className="w-5 h-5" />
                    ) : (
                      letter
                    )}
                  </div>
                  <span className={`flex-1 ${
                    showCorrect ? 'text-success-500 font-medium' :
                    showIncorrect ? 'text-danger-500' : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {option.slice(3)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Explanation (shown after answer) */}
        {state.showingResult && currentQuestion.explanation && (
          <div className={`card p-4 mb-6 ${
            isCorrect ? 'bg-success-500/10 border-success-500' : 'bg-amber-500/10 dark:bg-amber-500/20 border-amber-400'
          } border`}>
            <p className={`font-medium mb-2 ${isCorrect ? 'text-success-500' : 'text-amber-500'}`}>
              {isCorrect ? '✓ Correct!' : '✗ Not quite'}
            </p>
            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
              {currentQuestion.explanation}
            </p>
          </div>
        )}

        {/* Action Button */}
        <div className="flex gap-3">
          {!state.showingResult ? (
            <button
              onClick={handleSubmitAnswer}
              disabled={!selectedAnswer}
              className="btn-primary flex-1 py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Check Answer
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="btn-primary flex-1 py-3 text-base"
            >
              {state.currentIndex < state.questions.length - 1 ? (
                <>
                  Next Question
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              ) : (
                'See Results'
              )}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
