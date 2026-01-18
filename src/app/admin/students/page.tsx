'use client';

import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download,
  Mail,
  Phone,
  MoreVertical,
  Flame,
  CheckCircle,
  XCircle,
  UserPlus,
  RefreshCw
} from 'lucide-react';

// ===========================================
// ADMIN STUDENTS PAGE
// ===========================================

interface Student {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  license_track: 'A' | 'B' | 'both';
  streak_count: number;
  accuracy: number;
  challenges_completed: number;
  enrolled_at: string;
  last_active: string;
  is_active: boolean;
}

const DEMO_STUDENTS: Student[] = [
  {
    id: '1',
    full_name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '(555) 123-4567',
    license_track: 'B',
    streak_count: 12,
    accuracy: 82,
    challenges_completed: 18,
    enrolled_at: '2026-01-05',
    last_active: '2026-01-17',
    is_active: true,
  },
  {
    id: '2',
    full_name: 'Maria Garcia',
    email: 'maria.g@email.com',
    phone: '(555) 234-5678',
    license_track: 'A',
    streak_count: 7,
    accuracy: 78,
    challenges_completed: 14,
    enrolled_at: '2026-01-03',
    last_active: '2026-01-17',
    is_active: true,
  },
  {
    id: '3',
    full_name: 'David Chen',
    email: 'david.chen@email.com',
    phone: '(555) 345-6789',
    license_track: 'both',
    streak_count: 21,
    accuracy: 91,
    challenges_completed: 25,
    enrolled_at: '2025-12-28',
    last_active: '2026-01-17',
    is_active: true,
  },
  {
    id: '4',
    full_name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    phone: '(555) 456-7890',
    license_track: 'B',
    streak_count: 0,
    accuracy: 65,
    challenges_completed: 8,
    enrolled_at: '2026-01-10',
    last_active: '2026-01-14',
    is_active: true,
  },
  {
    id: '5',
    full_name: 'Michael Brown',
    email: 'mike.brown@email.com',
    phone: '(555) 567-8901',
    license_track: 'B',
    streak_count: 3,
    accuracy: 74,
    challenges_completed: 12,
    enrolled_at: '2026-01-08',
    last_active: '2026-01-16',
    is_active: true,
  },
];

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>(DEMO_STUDENTS);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTrack, setFilterTrack] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('enrolled_at');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  useEffect(() => {
    // TODO: Fetch from API
    setTimeout(() => setLoading(false), 300);
  }, []);

  const filteredStudents = students.filter(s => {
    if (searchQuery && !s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !s.email.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filterTrack !== 'all' && s.license_track !== filterTrack) {
      return false;
    }
    return true;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'name': return a.full_name.localeCompare(b.full_name);
      case 'streak': return b.streak_count - a.streak_count;
      case 'accuracy': return b.accuracy - a.accuracy;
      case 'enrolled_at': 
      default: return new Date(b.enrolled_at).getTime() - new Date(a.enrolled_at).getTime();
    }
  });

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'License Track', 'Streak', 'Accuracy', 'Enrolled'];
    const rows = filteredStudents.map(s => [
      s.full_name,
      s.email,
      s.phone,
      s.license_track,
      s.streak_count,
      `${s.accuracy}%`,
      s.enrolled_at,
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `students-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-500">{students.length} registered students</p>
        </div>
        <div className="flex gap-3">
          <button onClick={exportToCSV} className="btn-secondary">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </button>
          <button className="btn-primary">
            <UserPlus className="w-4 h-4 mr-2" />
            Add Student
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10"
            />
          </div>
          <select
            value={filterTrack}
            onChange={(e) => setFilterTrack(e.target.value)}
            className="input w-40"
          >
            <option value="all">All Tracks</option>
            <option value="A">License A</option>
            <option value="B">License B</option>
            <option value="both">Both A & B</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input w-40"
          >
            <option value="enrolled_at">Newest First</option>
            <option value="name">Name</option>
            <option value="streak">Streak</option>
            <option value="accuracy">Accuracy</option>
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Student</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">License</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Streak</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Accuracy</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Challenges</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Last Active</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredStudents.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-gray-900">{student.full_name}</p>
                    <p className="text-sm text-gray-500">{student.email}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <LicenseBadge track={student.license_track} />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1">
                    <Flame className={`w-4 h-4 ${student.streak_count > 0 ? 'text-orange-500' : 'text-gray-300'}`} />
                    <span className={student.streak_count > 0 ? 'font-medium' : 'text-gray-400'}>
                      {student.streak_count}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          student.accuracy >= 80 ? 'bg-green-500' :
                          student.accuracy >= 60 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${student.accuracy}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600">{student.accuracy}%</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {student.challenges_completed}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {formatDate(student.last_active)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button 
                      className="p-2 hover:bg-gray-100 rounded-lg"
                      title="Send Email"
                    >
                      <Mail className="w-4 h-4 text-gray-400" />
                    </button>
                    <button 
                      className="p-2 hover:bg-gray-100 rounded-lg"
                      title="Send SMS"
                    >
                      <Phone className="w-4 h-4 text-gray-400" />
                    </button>
                    <button 
                      onClick={() => setSelectedStudent(student)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredStudents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No students found</p>
          </div>
        )}
      </div>

      {/* Student Detail Modal */}
      {selectedStudent && (
        <StudentDetailModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      )}
    </div>
  );
}

function LicenseBadge({ track }: { track: 'A' | 'B' | 'both' }) {
  const colors = {
    A: 'bg-blue-100 text-blue-700',
    B: 'bg-purple-100 text-purple-700',
    both: 'bg-green-100 text-green-700',
  };
  const labels = {
    A: 'License A',
    B: 'License B',
    both: 'A & B',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[track]}`}>
      {labels[track]}
    </span>
  );
}

function StudentDetailModal({
  student,
  onClose,
}: {
  student: Student;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">{student.full_name}</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <XCircle className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Contact Information</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-400" />
                <span>{student.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gray-400" />
                <span>{student.phone}</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Performance</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center gap-1 text-orange-500 mb-1">
                  <Flame className="w-5 h-5" />
                  <span className="text-xl font-bold">{student.streak_count}</span>
                </div>
                <p className="text-xs text-gray-500">Day Streak</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-xl font-bold text-gray-900">{student.accuracy}%</p>
                <p className="text-xs text-gray-500">Accuracy</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-xl font-bold text-gray-900">{student.challenges_completed}</p>
                <p className="text-xs text-gray-500">Challenges</p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Activity</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Enrolled</span>
                <span className="text-gray-900">{formatDate(student.enrolled_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Active</span>
                <span className="text-gray-900">{formatDate(student.last_active)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button className="btn-secondary flex-1">
            <Mail className="w-4 h-4 mr-2" />
            Send Email
          </button>
          <button className="btn-secondary flex-1">
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset Streak
          </button>
        </div>
      </div>
    </div>
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
