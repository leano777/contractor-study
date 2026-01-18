'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  FileText, 
  HelpCircle, 
  TrendingUp,
  Flame,
  Target,
  ChevronRight,
  AlertCircle
} from 'lucide-react';

// ===========================================
// ADMIN OVERVIEW PAGE
// ===========================================

interface AdminStats {
  totalStudents: number;
  activeToday: number;
  totalHandouts: number;
  processedHandouts: number;
  totalQuestions: number;
  unverifiedQuestions: number;
  averageStreak: number;
  averageAccuracy: number;
}

const DEMO_STATS: AdminStats = {
  totalStudents: 18,
  activeToday: 12,
  totalHandouts: 8,
  processedHandouts: 6,
  totalQuestions: 245,
  unverifiedQuestions: 34,
  averageStreak: 5.2,
  averageAccuracy: 76,
};

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<AdminStats>(DEMO_STATS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch real stats from API
    setTimeout(() => setLoading(false), 300);
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Overview</h1>
        <p className="text-gray-500">Monitor your study system at a glance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<Users className="w-5 h-5" />}
          label="Total Students"
          value={stats.totalStudents}
          subtext={`${stats.activeToday} active today`}
          color="blue"
        />
        <StatCard
          icon={<FileText className="w-5 h-5" />}
          label="Handouts"
          value={stats.totalHandouts}
          subtext={`${stats.processedHandouts} processed`}
          color="purple"
        />
        <StatCard
          icon={<HelpCircle className="w-5 h-5" />}
          label="Questions"
          value={stats.totalQuestions}
          subtext={`${stats.unverifiedQuestions} need review`}
          color="green"
          alert={stats.unverifiedQuestions > 0}
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="Avg Accuracy"
          value={`${stats.averageAccuracy}%`}
          subtext={`${stats.averageStreak.toFixed(1)} avg streak`}
          color="orange"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <QuickAction
              href="/admin/handouts?action=upload"
              icon={<FileText className="w-5 h-5" />}
              title="Upload Handout"
              description="Add new study material"
            />
            <QuickAction
              href="/admin/questions?filter=unverified"
              icon={<HelpCircle className="w-5 h-5" />}
              title="Review Questions"
              description={`${stats.unverifiedQuestions} questions pending`}
              alert={stats.unverifiedQuestions > 0}
            />
            <QuickAction
              href="/admin/students"
              icon={<Users className="w-5 h-5" />}
              title="Manage Students"
              description="View registrations"
            />
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">System Status</h2>
          <div className="space-y-4">
            <StatusItem
              label="Database"
              status="connected"
              detail="Supabase"
            />
            <StatusItem
              label="Email Service"
              status="configured"
              detail="Resend"
            />
            <StatusItem
              label="SMS Service"
              status="configured"
              detail="Twilio"
            />
            <StatusItem
              label="AI Service"
              status="connected"
              detail="Claude API"
            />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {[
            { time: '2 minutes ago', event: 'New student registered', detail: 'John Smith (License B)' },
            { time: '15 minutes ago', event: 'Daily challenge completed', detail: '12 students participated' },
            { time: '1 hour ago', event: 'Handout processed', detail: 'Chapter 5 - Safety Requirements' },
            { time: '2 hours ago', event: 'Questions generated', detail: '15 new questions from Chapter 5' },
            { time: '3 hours ago', event: 'Questions verified', detail: '8 questions approved' },
          ].map((activity, i) => (
            <div key={i} className="flex items-center gap-4 py-2 border-b border-gray-100 last:border-0">
              <span className="text-sm text-gray-400 w-28">{activity.time}</span>
              <span className="font-medium text-gray-900">{activity.event}</span>
              <span className="text-gray-500">{activity.detail}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  subtext,
  color,
  alert,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtext: string;
  color: 'blue' | 'purple' | 'green' | 'orange';
  alert?: boolean;
}) {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    green: 'bg-green-100 text-green-600',
    orange: 'bg-orange-100 text-orange-600',
  };

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg ${colors[color]} flex items-center justify-center`}>
          {icon}
        </div>
        {alert && (
          <span className="w-2 h-2 bg-red-500 rounded-full"></span>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-xs text-gray-400 mt-1">{subtext}</p>
    </div>
  );
}

function QuickAction({
  href,
  icon,
  title,
  description,
  alert,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  alert?: boolean;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
    >
      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">
        {icon}
      </div>
      <div className="flex-1">
        <p className="font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      {alert && <AlertCircle className="w-5 h-5 text-amber-500" />}
      <ChevronRight className="w-5 h-5 text-gray-400" />
    </Link>
  );
}

function StatusItem({
  label,
  status,
  detail,
}: {
  label: string;
  status: 'connected' | 'configured' | 'error' | 'pending';
  detail: string;
}) {
  const statusColors = {
    connected: 'bg-green-500',
    configured: 'bg-green-500',
    error: 'bg-red-500',
    pending: 'bg-amber-500',
  };

  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${statusColors[status]}`}></div>
        <span className="font-medium text-gray-900">{label}</span>
      </div>
      <span className="text-sm text-gray-500">{detail}</span>
    </div>
  );
}
