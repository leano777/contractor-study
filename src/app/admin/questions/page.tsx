'use client';

import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter,
  CheckCircle,
  XCircle,
  Edit3,
  Trash2,
  RefreshCw,
  Eye,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Sparkles
} from 'lucide-react';

// ===========================================
// ADMIN QUESTIONS REVIEW PAGE
// ===========================================

interface Question {
  id: string;
  question_text: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  license_type: 'A' | 'B' | 'both';
  topic_tags: string[];
  is_ai_generated: boolean;
  is_verified: boolean;
  source_handout: string;
  created_at: string;
}

const DEMO_QUESTIONS: Question[] = [
  {
    id: '1',
    question_text: 'What is the minimum depth for a residential foundation footing in California?',
    options: ['A. 6 inches', 'B. 12 inches', 'C. 18 inches', 'D. 24 inches'],
    correct_answer: 'B',
    explanation: 'According to CBC Section 1809.4, the minimum depth for footings is 12 inches below undisturbed ground surface.',
    difficulty: 'medium',
    license_type: 'B',
    topic_tags: ['foundations', 'building codes'],
    is_ai_generated: true,
    is_verified: true,
    source_handout: 'Chapter 3 - Building Codes',
    created_at: '2026-01-12',
  },
  {
    id: '2',
    question_text: 'Which agency is responsible for issuing contractor licenses in California?',
    options: ['A. Department of Consumer Affairs', 'B. CSLB', 'C. Cal/OSHA', 'D. Building Standards Commission'],
    correct_answer: 'B',
    explanation: 'The Contractors State License Board (CSLB) is responsible for licensing and regulating contractors in California.',
    difficulty: 'easy',
    license_type: 'both',
    topic_tags: ['licensing', 'regulations'],
    is_ai_generated: true,
    is_verified: true,
    source_handout: 'Chapter 1 - Licensing Requirements',
    created_at: '2026-01-10',
  },
  {
    id: '3',
    question_text: 'What is the maximum penalty for contracting without a license in California?',
    options: ['A. $500', 'B. $5,000', 'C. $15,000', 'D. $50,000'],
    correct_answer: 'C',
    explanation: 'Contracting without a license can result in penalties up to $15,000 for the first offense under Business and Professions Code 7028.',
    difficulty: 'hard',
    license_type: 'both',
    topic_tags: ['licensing', 'penalties'],
    is_ai_generated: true,
    is_verified: false,
    source_handout: 'Chapter 1 - Licensing Requirements',
    created_at: '2026-01-10',
  },
  {
    id: '4',
    question_text: 'What is the required experience for a B (General Building) contractor license?',
    options: ['A. 2 years journey-level', 'B. 4 years journey-level', 'C. 4 years any construction', 'D. 6 years journey-level'],
    correct_answer: 'B',
    explanation: 'CSLB requires 4 years of journey-level experience within the last 10 years to qualify for a B license.',
    difficulty: 'medium',
    license_type: 'B',
    topic_tags: ['licensing', 'requirements'],
    is_ai_generated: true,
    is_verified: false,
    source_handout: 'Chapter 1 - Licensing Requirements',
    created_at: '2026-01-10',
  },
  {
    id: '5',
    question_text: 'What is the OSHA requirement for fall protection height in construction?',
    options: ['A. 4 feet', 'B. 6 feet', 'C. 8 feet', 'D. 10 feet'],
    correct_answer: 'B',
    explanation: 'OSHA requires fall protection for construction workers at heights of 6 feet or more above a lower level.',
    difficulty: 'easy',
    license_type: 'both',
    topic_tags: ['safety', 'OSHA'],
    is_ai_generated: true,
    is_verified: false,
    source_handout: 'Chapter 4 - Safety Requirements',
    created_at: '2026-01-15',
  },
  {
    id: '6',
    question_text: 'How long must a contractor retain project records after completion?',
    options: ['A. 1 year', 'B. 3 years', 'C. 5 years', 'D. 7 years'],
    correct_answer: 'C',
    explanation: 'Contractors should retain project records for at least 5 years for tax and legal purposes.',
    difficulty: 'medium',
    license_type: 'both',
    topic_tags: ['business', 'records'],
    is_ai_generated: true,
    is_verified: false,
    source_handout: 'Chapter 2 - Business Law',
    created_at: '2026-01-11',
  },
];

type FilterStatus = 'all' | 'verified' | 'unverified';
type FilterDifficulty = 'all' | 'easy' | 'medium' | 'hard';

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>(DEMO_QUESTIONS);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<FilterDifficulty>('all');
  const [filterLicense, setFilterLicense] = useState<string>('all');
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    setTimeout(() => setLoading(false), 300);
  }, []);

  const filteredQuestions = questions.filter(q => {
    if (searchQuery && !q.question_text.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filterStatus === 'verified' && !q.is_verified) return false;
    if (filterStatus === 'unverified' && q.is_verified) return false;
    if (filterDifficulty !== 'all' && q.difficulty !== filterDifficulty) return false;
    if (filterLicense !== 'all' && q.license_type !== filterLicense) return false;
    return true;
  });

  const unverifiedCount = questions.filter(q => !q.is_verified).length;

  const handleApprove = (questionId: string) => {
    setQuestions(prev => prev.map(q =>
      q.id === questionId ? { ...q, is_verified: true } : q
    ));
    if (selectedQuestion?.id === questionId) {
      setSelectedQuestion(prev => prev ? { ...prev, is_verified: true } : null);
    }
  };

  const handleReject = (questionId: string) => {
    if (confirm('Are you sure you want to delete this question?')) {
      setQuestions(prev => prev.filter(q => q.id !== questionId));
      if (selectedQuestion?.id === questionId) {
        setSelectedQuestion(null);
      }
    }
  };

  const handleSaveEdit = (updatedQuestion: Question) => {
    setQuestions(prev => prev.map(q =>
      q.id === updatedQuestion.id ? updatedQuestion : q
    ));
    setSelectedQuestion(updatedQuestion);
    setEditMode(false);
  };

  const navigateQuestion = (direction: 'prev' | 'next') => {
    if (!selectedQuestion) return;
    const currentIndex = filteredQuestions.findIndex(q => q.id === selectedQuestion.id);
    const newIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex >= 0 && newIndex < filteredQuestions.length) {
      setSelectedQuestion(filteredQuestions[newIndex]);
      setEditMode(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Questions</h1>
            <p className="text-gray-500">Review and manage study questions</p>
          </div>
          {unverifiedCount > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-lg">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">{unverifiedCount} questions need review</span>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="card p-4 bg-white">
            <p className="text-2xl font-bold text-gray-900">{questions.length}</p>
            <p className="text-sm text-gray-500">Total Questions</p>
          </div>
          <div className="card p-4 bg-white">
            <p className="text-2xl font-bold text-green-600">
              {questions.filter(q => q.is_verified).length}
            </p>
            <p className="text-sm text-gray-500">Verified</p>
          </div>
          <div className="card p-4 bg-white">
            <p className="text-2xl font-bold text-amber-600">{unverifiedCount}</p>
            <p className="text-sm text-gray-500">Pending Review</p>
          </div>
          <div className="card p-4 bg-white">
            <p className="text-2xl font-bold text-purple-600">
              {questions.filter(q => q.is_ai_generated).length}
            </p>
            <p className="text-sm text-gray-500">AI Generated</p>
          </div>
        </div>

        {/* Filters */}
        <div className="card p-4 mb-6 bg-white">
          <div className="flex gap-4">
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
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
              className="input w-40"
            >
              <option value="all">All Status</option>
              <option value="verified">Verified</option>
              <option value="unverified">Needs Review</option>
            </select>
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value as FilterDifficulty)}
              className="input w-36"
            >
              <option value="all">All Difficulty</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            <select
              value={filterLicense}
              onChange={(e) => setFilterLicense(e.target.value)}
              className="input w-36"
            >
              <option value="all">All Licenses</option>
              <option value="A">License A</option>
              <option value="B">License B</option>
              <option value="both">Both</option>
            </select>
          </div>
        </div>

        {/* Questions List */}
        <div className="grid grid-cols-2 gap-6">
          {/* List Panel */}
          <div className="card bg-white overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <p className="text-sm text-gray-600">{filteredQuestions.length} questions</p>
            </div>
            <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
              {filteredQuestions.map((question) => (
                <button
                  key={question.id}
                  onClick={() => { setSelectedQuestion(question); setEditMode(false); }}
                  className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                    selectedQuestion?.id === question.id ? 'bg-primary-50 border-l-4 border-primary-500' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      question.is_verified ? 'bg-green-500' : 'bg-amber-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 line-clamp-2 mb-2">{question.question_text}</p>
                      <div className="flex items-center gap-2">
                        <DifficultyBadge difficulty={question.difficulty} />
                        <LicenseBadge track={question.license_type} />
                        {question.is_ai_generated && (
                          <span className="flex items-center gap-1 text-xs text-purple-600">
                            <Sparkles className="w-3 h-3" />
                            AI
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Detail Panel */}
          <div className="card bg-white">
            {selectedQuestion ? (
              editMode ? (
                <QuestionEditor
                  question={selectedQuestion}
                  onSave={handleSaveEdit}
                  onCancel={() => setEditMode(false)}
                />
              ) : (
                <QuestionDetail
                  question={selectedQuestion}
                  onApprove={() => handleApprove(selectedQuestion.id)}
                  onReject={() => handleReject(selectedQuestion.id)}
                  onEdit={() => setEditMode(true)}
                  onPrev={() => navigateQuestion('prev')}
                  onNext={() => navigateQuestion('next')}
                  hasPrev={filteredQuestions.findIndex(q => q.id === selectedQuestion.id) > 0}
                  hasNext={filteredQuestions.findIndex(q => q.id === selectedQuestion.id) < filteredQuestions.length - 1}
                />
              )
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 p-8">
                <div className="text-center">
                  <Eye className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Select a question to review</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function QuestionDetail({
  question,
  onApprove,
  onReject,
  onEdit,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}: {
  question: Question;
  onApprove: () => void;
  onReject: () => void;
  onEdit: () => void;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {question.is_verified ? (
            <span className="flex items-center gap-1 text-green-600 text-sm">
              <CheckCircle className="w-4 h-4" />
              Verified
            </span>
          ) : (
            <span className="flex items-center gap-1 text-amber-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              Needs Review
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onPrev}
            disabled={!hasPrev}
            className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={onNext}
            disabled={!hasNext}
            className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-30"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <DifficultyBadge difficulty={question.difficulty} />
            <LicenseBadge track={question.license_type} />
            {question.is_ai_generated && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs">
                <Sparkles className="w-3 h-3" />
                AI Generated
              </span>
            )}
          </div>
          <h3 className="text-lg font-medium text-gray-900 leading-relaxed">
            {question.question_text}
          </h3>
        </div>

        {/* Options */}
        <div className="space-y-2 mb-6">
          {question.options.map((option, i) => {
            const letter = option.charAt(0);
            const isCorrect = letter === question.correct_answer;
            return (
              <div
                key={i}
                className={`p-3 rounded-lg border-2 ${
                  isCorrect
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    isCorrect ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {letter}
                  </div>
                  <span className={isCorrect ? 'text-green-700 font-medium' : 'text-gray-700'}>
                    {option.slice(3)}
                  </span>
                  {isCorrect && <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Explanation */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-500 mb-2">Explanation</h4>
          <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{question.explanation}</p>
        </div>

        {/* Meta */}
        <div className="text-sm text-gray-500 space-y-1">
          <p><span className="font-medium">Source:</span> {question.source_handout}</p>
          <p><span className="font-medium">Tags:</span> {question.topic_tags.join(', ')}</p>
          <p><span className="font-medium">Created:</span> {question.created_at}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-gray-200 flex gap-3">
        {!question.is_verified && (
          <>
            <button onClick={onApprove} className="btn-success flex-1">
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve
            </button>
            <button onClick={onReject} className="btn-danger flex-1">
              <XCircle className="w-4 h-4 mr-2" />
              Reject
            </button>
          </>
        )}
        <button onClick={onEdit} className="btn-secondary flex-1">
          <Edit3 className="w-4 h-4 mr-2" />
          Edit
        </button>
      </div>
    </div>
  );
}

function QuestionEditor({
  question,
  onSave,
  onCancel,
}: {
  question: Question;
  onSave: (q: Question) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({ ...question });

  const updateOption = (index: number, value: string) => {
    const newOptions = [...formData.options];
    const letter = newOptions[index].charAt(0);
    newOptions[index] = `${letter}. ${value}`;
    setFormData({ ...formData, options: newOptions });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">Edit Question</h3>
      </div>

      <div className="flex-1 p-6 overflow-y-auto space-y-4">
        {/* Question Text */}
        <div>
          <label className="label block mb-1.5">Question</label>
          <textarea
            value={formData.question_text}
            onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
            className="input"
            rows={3}
          />
        </div>

        {/* Options */}
        <div>
          <label className="label block mb-1.5">Options</label>
          <div className="space-y-2">
            {formData.options.map((option, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                  option.charAt(0) === formData.correct_answer
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {option.charAt(0)}
                </span>
                <input
                  type="text"
                  value={option.slice(3)}
                  onChange={(e) => updateOption(i, e.target.value)}
                  className="input flex-1"
                />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, correct_answer: option.charAt(0) })}
                  className={`p-2 rounded-lg ${
                    option.charAt(0) === formData.correct_answer
                      ? 'bg-green-100 text-green-600'
                      : 'hover:bg-gray-100 text-gray-400'
                  }`}
                  title="Set as correct"
                >
                  <CheckCircle className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Explanation */}
        <div>
          <label className="label block mb-1.5">Explanation</label>
          <textarea
            value={formData.explanation}
            onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
            className="input"
            rows={3}
          />
        </div>

        {/* Difficulty & License */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label block mb-1.5">Difficulty</label>
            <select
              value={formData.difficulty}
              onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as 'easy' | 'medium' | 'hard' })}
              className="input"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div>
            <label className="label block mb-1.5">License Type</label>
            <select
              value={formData.license_type}
              onChange={(e) => setFormData({ ...formData, license_type: e.target.value as 'A' | 'B' | 'both' })}
              className="input"
            >
              <option value="both">Both A & B</option>
              <option value="A">License A</option>
              <option value="B">License B</option>
            </select>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="label block mb-1.5">Topic Tags (comma separated)</label>
          <input
            type="text"
            value={formData.topic_tags.join(', ')}
            onChange={(e) => setFormData({ 
              ...formData, 
              topic_tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
            })}
            className="input"
          />
        </div>
      </div>

      <div className="p-4 border-t border-gray-200 flex gap-3">
        <button onClick={onCancel} className="btn-secondary flex-1">
          Cancel
        </button>
        <button onClick={() => onSave(formData)} className="btn-primary flex-1">
          Save Changes
        </button>
      </div>
    </div>
  );
}

function DifficultyBadge({ difficulty }: { difficulty: 'easy' | 'medium' | 'hard' }) {
  const colors = {
    easy: 'bg-green-100 text-green-700',
    medium: 'bg-amber-100 text-amber-700',
    hard: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[difficulty]}`}>
      {difficulty}
    </span>
  );
}

function LicenseBadge({ track }: { track: 'A' | 'B' | 'both' }) {
  const colors = {
    A: 'bg-blue-100 text-blue-700',
    B: 'bg-purple-100 text-purple-700',
    both: 'bg-gray-100 text-gray-700',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[track]}`}>
      {track === 'both' ? 'A & B' : track}
    </span>
  );
}
