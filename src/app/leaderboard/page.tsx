'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Trophy, 
  Flame, 
  Target, 
  TrendingUp,
  Medal,
  Crown
} from 'lucide-react';

// ===========================================
// LEADERBOARD PAGE
// ===========================================

interface LeaderboardEntry {
  id: string;
  rank: number;
  name: string;
  initials: string;
  licenseTrack: string;
  streak: number;
  totalAnswered: number;
  accuracy: number;
  score: number;
}

interface LeaderboardData {
  leaderboard: LeaderboardEntry[];
  currentUser: LeaderboardEntry | null;
  total: number;
}

type SortType = 'score' | 'streak' | 'accuracy' | 'total';

// Demo data
const DEMO_LEADERBOARD: LeaderboardEntry[] = [
  { id: '1', rank: 1, name: 'David Chen', initials: 'DC', licenseTrack: 'both', streak: 21, totalAnswered: 245, accuracy: 91, score: 89 },
  { id: '2', rank: 2, name: 'Maria Garcia', initials: 'MG', licenseTrack: 'A', streak: 18, totalAnswered: 198, accuracy: 85, score: 82 },
  { id: '3', rank: 3, name: 'John Smith', initials: 'JS', licenseTrack: 'B', streak: 12, totalAnswered: 156, accuracy: 82, score: 74 },
  { id: '4', rank: 4, name: 'Sarah Johnson', initials: 'SJ', licenseTrack: 'B', streak: 9, totalAnswered: 134, accuracy: 79, score: 68 },
  { id: '5', rank: 5, name: 'Michael Brown', initials: 'MB', licenseTrack: 'B', streak: 7, totalAnswered: 112, accuracy: 76, score: 62 },
  { id: '6', rank: 6, name: 'Emily Davis', initials: 'ED', licenseTrack: 'A', streak: 5, totalAnswered: 98, accuracy: 74, score: 55 },
  { id: '7', rank: 7, name: 'James Wilson', initials: 'JW', licenseTrack: 'B', streak: 4, totalAnswered: 87, accuracy: 72, score: 50 },
  { id: '8', rank: 8, name: 'Lisa Anderson', initials: 'LA', licenseTrack: 'both', streak: 3, totalAnswered: 76, accuracy: 70, score: 45 },
  { id: '9', rank: 9, name: 'Robert Taylor', initials: 'RT', licenseTrack: 'B', streak: 2, totalAnswered: 65, accuracy: 68, score: 40 },
  { id: '10', rank: 10, name: 'Jennifer Martinez', initials: 'JM', licenseTrack: 'A', streak: 1, totalAnswered: 54, accuracy: 65, score: 35 },
];

export default function LeaderboardPage() {
  const [data, setData] = useState<LeaderboardData>({
    leaderboard: DEMO_LEADERBOARD,
    currentUser: { ...DEMO_LEADERBOARD[2], id: 'current' },
    total: 18,
  });
  const [loading, setLoading] = useState(true);
  const [sortType, setSortType] = useState<SortType>('score');
  const [licenseFilter, setLicenseFilter] = useState<string>('all');

  useEffect(() => {
    // TODO: Fetch from API
    setTimeout(() => setLoading(false), 300);
  }, [sortType, licenseFilter]);

  const sortedLeaderboard = [...data.leaderboard].sort((a, b) => {
    switch (sortType) {
      case 'streak': return b.streak - a.streak;
      case 'accuracy': return b.accuracy - a.accuracy;
      case 'total': return b.totalAnswered - a.totalAnswered;
      default: return b.score - a.score;
    }
  }).map((entry, index) => ({ ...entry, rank: index + 1 }));

  const filteredLeaderboard = licenseFilter === 'all' 
    ? sortedLeaderboard 
    : sortedLeaderboard.filter(e => 
        e.licenseTrack === licenseFilter || e.licenseTrack === 'both'
      );

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      {/* Header */}
      <header className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Link href="/dashboard" className="inline-flex items-center text-white/80 hover:text-white mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
              <Trophy className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Leaderboard</h1>
              <p className="text-white/80">{data.total} students competing</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Current User Rank */}
        {data.currentUser && (
          <div className="card bg-primary-50 border-2 border-primary-200 p-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="text-2xl font-bold text-primary-600">#{data.currentUser.rank}</div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">Your Ranking</p>
                <p className="text-sm text-gray-500">Keep your streak going to climb higher!</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary-600">{data.currentUser.score}</p>
                <p className="text-sm text-gray-500">points</p>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
          <SortButton 
            active={sortType === 'score'} 
            onClick={() => setSortType('score')}
            icon={<Trophy className="w-4 h-4" />}
            label="Overall"
          />
          <SortButton 
            active={sortType === 'streak'} 
            onClick={() => setSortType('streak')}
            icon={<Flame className="w-4 h-4" />}
            label="Streak"
          />
          <SortButton 
            active={sortType === 'accuracy'} 
            onClick={() => setSortType('accuracy')}
            icon={<Target className="w-4 h-4" />}
            label="Accuracy"
          />
          <SortButton 
            active={sortType === 'total'} 
            onClick={() => setSortType('total')}
            icon={<TrendingUp className="w-4 h-4" />}
            label="Questions"
          />
          
          <div className="ml-auto">
            <select
              value={licenseFilter}
              onChange={(e) => setLicenseFilter(e.target.value)}
              className="input text-sm h-10"
            >
              <option value="all">All Licenses</option>
              <option value="A">License A</option>
              <option value="B">License B</option>
            </select>
          </div>
        </div>

        {/* Top 3 Podium */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {filteredLeaderboard.slice(0, 3).map((entry, index) => (
            <PodiumCard 
              key={entry.id} 
              entry={entry} 
              position={index + 1}
              sortType={sortType}
            />
          ))}
        </div>

        {/* Rest of Leaderboard */}
        <div className="card overflow-hidden">
          <div className="divide-y divide-gray-100">
            {filteredLeaderboard.slice(3).map((entry) => (
              <LeaderboardRow 
                key={entry.id} 
                entry={entry}
                sortType={sortType}
                isCurrentUser={entry.id === data.currentUser?.id}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

function SortButton({ 
  active, 
  onClick, 
  icon, 
  label 
}: { 
  active: boolean; 
  onClick: () => void; 
  icon: React.ReactNode; 
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
        active 
          ? 'bg-primary-600 text-white' 
          : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function PodiumCard({ 
  entry, 
  position,
  sortType,
}: { 
  entry: LeaderboardEntry; 
  position: number;
  sortType: SortType;
}) {
  const positionConfig = {
    1: { bg: 'bg-gradient-to-br from-amber-400 to-amber-500', icon: Crown, height: 'h-32' },
    2: { bg: 'bg-gradient-to-br from-gray-300 to-gray-400', icon: Medal, height: 'h-28' },
    3: { bg: 'bg-gradient-to-br from-orange-300 to-orange-400', icon: Medal, height: 'h-24' },
  }[position] || { bg: 'bg-gray-200', icon: Medal, height: 'h-24' };

  const Icon = positionConfig.icon;
  const displayValue = sortType === 'streak' ? entry.streak :
                       sortType === 'accuracy' ? `${entry.accuracy}%` :
                       sortType === 'total' ? entry.totalAnswered :
                       entry.score;

  return (
    <div className={`relative ${position === 1 ? 'order-2' : position === 2 ? 'order-1 mt-4' : 'order-3 mt-4'}`}>
      <div className={`card p-4 text-center ${position === 1 ? 'ring-2 ring-amber-400' : ''}`}>
        <div className={`w-12 h-12 ${positionConfig.bg} rounded-full flex items-center justify-center mx-auto mb-3 text-white`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-2 text-primary-600 font-bold text-lg">
          {entry.initials}
        </div>
        <p className="font-semibold text-gray-900 truncate">{entry.name}</p>
        <p className="text-2xl font-bold text-primary-600 mt-1">{displayValue}</p>
        <p className="text-xs text-gray-500">
          {sortType === 'streak' ? 'day streak' :
           sortType === 'accuracy' ? 'accuracy' :
           sortType === 'total' ? 'questions' : 'points'}
        </p>
      </div>
    </div>
  );
}

function LeaderboardRow({ 
  entry,
  sortType,
  isCurrentUser,
}: { 
  entry: LeaderboardEntry;
  sortType: SortType;
  isCurrentUser: boolean;
}) {
  const displayValue = sortType === 'streak' ? entry.streak :
                       sortType === 'accuracy' ? `${entry.accuracy}%` :
                       sortType === 'total' ? entry.totalAnswered :
                       entry.score;

  return (
    <div className={`flex items-center gap-4 p-4 ${isCurrentUser ? 'bg-primary-50' : ''}`}>
      <div className="w-8 text-center font-semibold text-gray-500">
        {entry.rank}
      </div>
      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-medium">
        {entry.initials}
      </div>
      <div className="flex-1">
        <p className="font-medium text-gray-900">{entry.name}</p>
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Flame className="w-3 h-3 text-orange-500" />
            {entry.streak}
          </span>
          <span>{entry.accuracy}%</span>
          <LicenseBadge track={entry.licenseTrack} />
        </div>
      </div>
      <div className="text-right">
        <p className="text-xl font-bold text-gray-900">{displayValue}</p>
      </div>
    </div>
  );
}

function LicenseBadge({ track }: { track: string }) {
  const colors: Record<string, string> = {
    A: 'bg-blue-100 text-blue-700',
    B: 'bg-purple-100 text-purple-700',
    both: 'bg-green-100 text-green-700',
  };
  return (
    <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${colors[track] || 'bg-gray-100 text-gray-700'}`}>
      {track === 'both' ? 'A&B' : track}
    </span>
  );
}
