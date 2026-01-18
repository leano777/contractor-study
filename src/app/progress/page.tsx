'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  TrendingUp, 
  Target, 
  Flame,
  Calendar,
  BarChart3,
  PieChart,
  CheckCircle,
  XCircle
} from 'lucide-react';

// ===========================================
// PROGRESS/STATS PAGE
// ===========================================

interface StatsData {
  totalQuestionsAnswered: number;
  correctAnswers: number;
  accuracy: number;
  currentStreak: number;
  longestStreak: number;
  challengesCompleted: number;
  topicBreakdown: Record<string, { total: number; correct: number; accuracy: number }>;
  difficultyBreakdown: Record<string, { total: number; correct: number; accuracy: number }>;
  recentActivity: Array<{ date: string; completed: boolean; score: number }>;
}

const DEMO_STATS: StatsData = {
  totalQuestionsAnswered: 127,
  correctAnswers: 99,
  accuracy: 78,
  currentStreak: 7,
  longestStreak: 14,
  challengesCompleted: 18,
  topicBreakdown: {
    'Building Codes': { total: 45, correct: 36, accuracy: 80 },
    'Licensing': { total: 32, correct: 28, accuracy: 88 },
    'Safety': { total: 28, correct: 20, accuracy: 71 },
    'Business Law': { total: 22, correct: 15, accuracy: 68 },
  },
  difficultyBreakdown: {
    easy: { total: 50, correct: 45, accuracy: 90 },
    medium: { total: 52, correct: 38, accuracy: 73 },
    hard: { total: 25, correct: 16, accuracy: 64 },
  },
  recentActivity: Array.from({ length: 14 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (13 - i));
    const completed = i < 7 || Math.random() > 0.3;
    return {
      date: date.toISOString().split('T')[0],
      completed,
      score: completed ? Math.floor(Math.random() * 40) + 60 : 0,
    };
  }),
};

export default function ProgressPage() {
  const [stats, setStats] = useState<StatsData>(DEMO_STATS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch from /api/students/me/stats
    setTimeout(() => setLoading(false), 300);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Link href="/dashboard" className="inline-flex items-center text-white/80 hover:text-white mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Your Progress</h1>
              <p className="text-white/80">Track your study journey</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={<Target className="w-5 h-5 text-blue-600" />}
            label="Total Questions"
            value={stats.totalQuestionsAnswered.toString()}
          />
          <StatCard
            icon={<CheckCircle className="w-5 h-5 text-green-600" />}
            label="Accuracy"
            value={`${stats.accuracy}%`}
          />
          <StatCard
            icon={<Flame className="w-5 h-5 text-orange-600" />}
            label="Current Streak"
            value={stats.currentStreak.toString()}
            subtext={`Best: ${stats.longestStreak}`}
          />
          <StatCard
            icon={<Calendar className="w-5 h-5 text-purple-600" />}
            label="Challenges"
            value={stats.challengesCompleted.toString()}
          />
        </div>

        {/* Activity Calendar */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Last 14 Days
          </h2>
          <div className="grid grid-cols-7 gap-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
              <div key={i} className="text-center text-xs text-gray-500 font-medium">
                {day}
              </div>
            ))}
            {stats.recentActivity.map((day, i) => (
              <div
                key={i}
                className={`aspect-square rounded-lg flex items-center justify-center text-xs font-medium ${
                  day.completed
                    ? day.score >= 80
                      ? 'bg-green-500 text-white'
                      : day.score >= 60
                      ? 'bg-green-300 text-green-900'
                      : 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-400'
                }`}
                title={`${day.date}: ${day.completed ? `${day.score}%` : 'Not completed'}`}
              >
                {new Date(day.date).getDate()}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-end gap-4 mt-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-gray-100" />
              <span>Missed</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-green-100" />
              <span>60%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-green-300" />
              <span>70%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-green-500" />
              <span>80%+</span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Topic Breakdown */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              By Topic
            </h2>
            <div className="space-y-4">
              {Object.entries(stats.topicBreakdown).map(([topic, data]) => (
                <div key={topic}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{topic}</span>
                    <span className="text-sm text-gray-500">{data.accuracy}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        data.accuracy >= 80 ? 'bg-green-500' :
                        data.accuracy >= 60 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${data.accuracy}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {data.correct}/{data.total} correct
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Difficulty Breakdown */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              By Difficulty
            </h2>
            <div className="space-y-6">
              {Object.entries(stats.difficultyBreakdown).map(([difficulty, data]) => (
                <div key={difficulty}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                        difficulty === 'medium' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {difficulty}
                      </span>
                      <span className="text-sm text-gray-500">
                        {data.total} questions
                      </span>
                    </div>
                    <span className="text-lg font-bold text-gray-900">{data.accuracy}%</span>
                  </div>
                  <div className="flex gap-1">
                    {Array.from({ length: 10 }, (_, i) => (
                      <div
                        key={i}
                        className={`flex-1 h-8 rounded ${
                          i < Math.round(data.accuracy / 10)
                            ? difficulty === 'easy' ? 'bg-green-500' :
                              difficulty === 'medium' ? 'bg-amber-500' : 'bg-red-500'
                            : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">💡 Insights</h2>
          <div className="space-y-3">
            <InsightItem
              type="success"
              text={`Your strongest topic is Licensing with ${stats.topicBreakdown['Licensing'].accuracy}% accuracy!`}
            />
            <InsightItem
              type="warning"
              text="You might want to review Business Law - it's your lowest performing topic."
            />
            <InsightItem
              type="info"
              text={`You've completed ${stats.challengesCompleted} daily challenges. Keep it up!`}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  subtext,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext?: string;
}) {
  return (
    <div className="card p-4">
      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-3">
        {icon}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
      {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
    </div>
  );
}

function InsightItem({
  type,
  text,
}: {
  type: 'success' | 'warning' | 'info';
  text: string;
}) {
  const styles = {
    success: 'bg-green-50 border-green-200 text-green-700',
    warning: 'bg-amber-50 border-amber-200 text-amber-700',
    info: 'bg-blue-50 border-blue-200 text-blue-700',
  };

  return (
    <div className={`p-3 rounded-lg border ${styles[type]}`}>
      {text}
    </div>
  );
}
