'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Flame, Target, BookOpen, MessageCircle, Zap, TrendingUp, Clock } from 'lucide-react';

// ===========================================
// SIMPLIFIED DASHBOARD
// ===========================================
// Focused on the essentials: streak, today's challenge, and quick study access

interface DashboardData {
  student: {
    name: string;
    licenseTrack: string;
    streakCount: number;
  };
  todayChallenge: {
    completed: boolean;
    score?: number;
    totalQuestions: number;
  };
  stats: {
    accuracy: number;
  };
}

const DEMO_DATA: DashboardData = {
  student: {
    name: 'Demo Student',
    licenseTrack: 'B',
    streakCount: 7,
  },
  todayChallenge: {
    completed: false,
    totalQuestions: 5,
  },
  stats: {
    accuracy: 78,
  },
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>(DEMO_DATA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 300);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="max-w-lg mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
            Welcome back, {data.student.name.split(' ')[0]}!
          </h1>
          <p className="text-gray-500 dark:text-gray-400">License {data.student.licenseTrack} Track</p>
        </div>

        {/* Main Card - Today's Challenge */}
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Today&apos;s Challenge</p>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {data.todayChallenge.completed ? 'Completed!' : 'Ready for you'}
              </h2>
            </div>
            <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
              data.todayChallenge.completed
                ? 'bg-success-500/20 text-success-500'
                : 'bg-primary-500/20 text-primary-500'
            }`}>
              <Target className="w-7 h-7" />
            </div>
          </div>

          {data.todayChallenge.completed ? (
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                You scored {Math.round((data.todayChallenge.score || 0) * 100)}% today!
              </p>
              <Link href="/challenge" className="btn-secondary w-full justify-center">
                Review Answers
              </Link>
            </div>
          ) : (
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                {data.todayChallenge.totalQuestions} questions waiting
              </p>
              <Link href="/challenge" className="btn-primary w-full justify-center">
                <Zap className="w-4 h-4 mr-2" />
                Start Challenge
              </Link>
            </div>
          )}
        </div>

        {/* Stats Row - Simplified */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="card p-4 text-center">
            <div className="flex items-center justify-center gap-2 text-orange-500 mb-1">
              <Flame className="w-5 h-5" />
              <span className="text-2xl font-bold">{data.student.streakCount}</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Day Streak</p>
          </div>
          <div className="card p-4 text-center">
            <div className="flex items-center justify-center gap-2 text-green-500 mb-1">
              <TrendingUp className="w-5 h-5" />
              <span className="text-2xl font-bold">{data.stats.accuracy}%</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Accuracy</p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-3 gap-3">
          <Link
            href="/study"
            className="card p-4 text-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <BookOpen className="w-6 h-6 text-primary-600 dark:text-primary-400 mx-auto mb-2" />
            <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">Study</p>
          </Link>
          <Link
            href="/focus"
            className="card p-4 text-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Clock className="w-6 h-6 text-primary-600 dark:text-primary-400 mx-auto mb-2" />
            <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">Focus</p>
          </Link>
          <Link
            href="/chat"
            className="card p-4 text-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <MessageCircle className="w-6 h-6 text-primary-600 dark:text-primary-400 mx-auto mb-2" />
            <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">Ask AI</p>
          </Link>
        </div>
      </main>
    </div>
  );
}
