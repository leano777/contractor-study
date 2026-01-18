'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Trophy, 
  Flame, 
  Target, 
  Zap,
  BookOpen,
  Star,
  Crown,
  Award,
  Medal,
  Lock,
  CheckCircle
} from 'lucide-react';

// ===========================================
// ACHIEVEMENTS PAGE
// ===========================================

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'streak' | 'accuracy' | 'volume' | 'special';
  requirement: number;
  progress: number;
  unlocked: boolean;
  unlockedAt?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

const ACHIEVEMENTS: Achievement[] = [
  // Streak achievements
  { id: 'streak-3', title: 'Getting Started', description: 'Complete a 3-day streak', icon: 'flame', category: 'streak', requirement: 3, progress: 7, unlocked: true, unlockedAt: '2026-01-10', rarity: 'common' },
  { id: 'streak-7', title: 'Week Warrior', description: 'Complete a 7-day streak', icon: 'flame', category: 'streak', requirement: 7, progress: 7, unlocked: true, unlockedAt: '2026-01-14', rarity: 'common' },
  { id: 'streak-14', title: 'Fortnight Fighter', description: 'Complete a 14-day streak', icon: 'flame', category: 'streak', requirement: 14, progress: 7, unlocked: false, rarity: 'rare' },
  { id: 'streak-30', title: 'Monthly Master', description: 'Complete a 30-day streak', icon: 'crown', category: 'streak', requirement: 30, progress: 7, unlocked: false, rarity: 'epic' },
  { id: 'streak-100', title: 'Century Champion', description: 'Complete a 100-day streak', icon: 'trophy', category: 'streak', requirement: 100, progress: 7, unlocked: false, rarity: 'legendary' },
  
  // Accuracy achievements
  { id: 'accuracy-5', title: 'Sharp Mind', description: 'Get 5 questions right in a row', icon: 'target', category: 'accuracy', requirement: 5, progress: 5, unlocked: true, unlockedAt: '2026-01-08', rarity: 'common' },
  { id: 'accuracy-10', title: 'Precision Pro', description: 'Get 10 questions right in a row', icon: 'target', category: 'accuracy', requirement: 10, progress: 8, unlocked: false, rarity: 'rare' },
  { id: 'accuracy-perfect', title: 'Perfect Challenge', description: 'Score 100% on a daily challenge', icon: 'star', category: 'accuracy', requirement: 1, progress: 1, unlocked: true, unlockedAt: '2026-01-12', rarity: 'rare' },
  { id: 'accuracy-80', title: 'Consistent Performer', description: 'Maintain 80% accuracy over 50 questions', icon: 'target', category: 'accuracy', requirement: 50, progress: 45, unlocked: false, rarity: 'epic' },
  
  // Volume achievements
  { id: 'volume-10', title: 'First Steps', description: 'Answer 10 questions', icon: 'book', category: 'volume', requirement: 10, progress: 127, unlocked: true, unlockedAt: '2026-01-06', rarity: 'common' },
  { id: 'volume-50', title: 'Studious', description: 'Answer 50 questions', icon: 'book', category: 'volume', requirement: 50, progress: 127, unlocked: true, unlockedAt: '2026-01-09', rarity: 'common' },
  { id: 'volume-100', title: 'Century Club', description: 'Answer 100 questions', icon: 'book', category: 'volume', requirement: 100, progress: 127, unlocked: true, unlockedAt: '2026-01-13', rarity: 'rare' },
  { id: 'volume-500', title: 'Knowledge Seeker', description: 'Answer 500 questions', icon: 'medal', category: 'volume', requirement: 500, progress: 127, unlocked: false, rarity: 'epic' },
  { id: 'volume-1000', title: 'Question Crusher', description: 'Answer 1000 questions', icon: 'trophy', category: 'volume', requirement: 1000, progress: 127, unlocked: false, rarity: 'legendary' },
  
  // Special achievements
  { id: 'special-early', title: 'Early Bird', description: 'Complete a challenge before 8 AM', icon: 'zap', category: 'special', requirement: 1, progress: 1, unlocked: true, unlockedAt: '2026-01-07', rarity: 'rare' },
  { id: 'special-topics', title: 'Well Rounded', description: 'Answer questions from all topics', icon: 'award', category: 'special', requirement: 6, progress: 4, unlocked: false, rarity: 'epic' },
  { id: 'special-chat', title: 'Curious Mind', description: 'Ask 10 questions to the AI assistant', icon: 'zap', category: 'special', requirement: 10, progress: 3, unlocked: false, rarity: 'rare' },
];

const ICONS: Record<string, React.ReactNode> = {
  flame: <Flame className="w-6 h-6" />,
  target: <Target className="w-6 h-6" />,
  book: <BookOpen className="w-6 h-6" />,
  star: <Star className="w-6 h-6" />,
  crown: <Crown className="w-6 h-6" />,
  trophy: <Trophy className="w-6 h-6" />,
  award: <Award className="w-6 h-6" />,
  medal: <Medal className="w-6 h-6" />,
  zap: <Zap className="w-6 h-6" />,
};

const RARITY_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  common: { bg: 'bg-gray-100', border: 'border-gray-300', text: 'text-gray-600' },
  rare: { bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-600' },
  epic: { bg: 'bg-purple-100', border: 'border-purple-300', text: 'text-purple-600' },
  legendary: { bg: 'bg-amber-100', border: 'border-amber-400', text: 'text-amber-600' },
};

export default function AchievementsPage() {
  const [filter, setFilter] = useState<string>('all');
  const [achievements] = useState<Achievement[]>(ACHIEVEMENTS);

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;

  const filteredAchievements = filter === 'all' 
    ? achievements 
    : filter === 'unlocked'
    ? achievements.filter(a => a.unlocked)
    : achievements.filter(a => a.category === filter);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Link href="/dashboard" className="inline-flex items-center text-white/80 hover:text-white mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                <Trophy className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Achievements</h1>
                <p className="text-white/80">Collect badges as you study</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">{unlockedCount}/{totalCount}</p>
              <p className="text-white/80 text-sm">Unlocked</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { value: 'all', label: 'All' },
            { value: 'unlocked', label: 'Unlocked' },
            { value: 'streak', label: 'Streaks' },
            { value: 'accuracy', label: 'Accuracy' },
            { value: 'volume', label: 'Volume' },
            { value: 'special', label: 'Special' },
          ].map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filter === f.value
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Achievement Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {filteredAchievements.map((achievement) => (
            <AchievementCard key={achievement.id} achievement={achievement} />
          ))}
        </div>
      </main>
    </div>
  );
}

function AchievementCard({ achievement }: { achievement: Achievement }) {
  const colors = RARITY_COLORS[achievement.rarity];
  const progress = Math.min((achievement.progress / achievement.requirement) * 100, 100);

  return (
    <div className={`card p-4 relative overflow-hidden ${!achievement.unlocked ? 'opacity-70' : ''}`}>
      {/* Rarity indicator */}
      <div className={`absolute top-0 right-0 px-2 py-0.5 text-xs font-medium ${colors.bg} ${colors.text} rounded-bl-lg`}>
        {achievement.rarity}
      </div>

      <div className="flex items-start gap-4">
        <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
          achievement.unlocked ? colors.bg : 'bg-gray-100'
        } ${achievement.unlocked ? colors.text : 'text-gray-400'}`}>
          {achievement.unlocked ? ICONS[achievement.icon] : <Lock className="w-6 h-6" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">{achievement.title}</h3>
            {achievement.unlocked && (
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
            )}
          </div>
          <p className="text-sm text-gray-500 mb-2">{achievement.description}</p>
          
          {!achievement.unlocked && (
            <div>
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>Progress</span>
                <span>{achievement.progress}/{achievement.requirement}</span>
              </div>
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${colors.bg.replace('100', '500')} rounded-full`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {achievement.unlocked && achievement.unlockedAt && (
            <p className="text-xs text-gray-400">
              Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
