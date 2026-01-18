'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  Clock,
  AlertCircle,
  Trash2,
  Eye,
  Cog,
  X,
  File,
  Image,
  Loader2
} from 'lucide-react';

// ===========================================
// ADMIN HANDOUTS PAGE
// ===========================================

interface Handout {
  id: string;
  title: string;
  description: string;
  file_type: 'pdf' | 'docx' | 'image' | 'txt';
  file_url: string;
  license_type: 'A' | 'B' | 'both';
  chapter: string;
  is_processed: boolean;
  questions_generated: number;
  uploaded_at: string;
}

const DEMO_HANDOUTS: Handout[] = [
  {
    id: '1',
    title: 'Chapter 1 - Licensing Requirements',
    description: 'Overview of CSLB licensing requirements and classifications',
    file_type: 'pdf',
    file_url: '/handouts/chapter1.pdf',
    license_type: 'both',
    chapter: 'Chapter 1',
    is_processed: true,
    questions_generated: 28,
    uploaded_at: '2026-01-10',
  },
  {
    id: '2',
    title: 'Chapter 2 - Business Law',
    description: 'Contract requirements, mechanics liens, and business regulations',
    file_type: 'pdf',
    file_url: '/handouts/chapter2.pdf',
    license_type: 'both',
    chapter: 'Chapter 2',
    is_processed: true,
    questions_generated: 35,
    uploaded_at: '2026-01-11',
  },
  {
    id: '3',
    title: 'Chapter 3 - Building Codes',
    description: 'California Building Code overview and key sections',
    file_type: 'pdf',
    file_url: '/handouts/chapter3.pdf',
    license_type: 'B',
    chapter: 'Chapter 3',
    is_processed: true,
    questions_generated: 42,
    uploaded_at: '2026-01-12',
  },
  {
    id: '4',
    title: 'Chapter 4 - Safety Requirements',
    description: 'OSHA regulations and jobsite safety protocols',
    file_type: 'pdf',
    file_url: '/handouts/chapter4.pdf',
    license_type: 'both',
    chapter: 'Chapter 4',
    is_processed: false,
    questions_generated: 0,
    uploaded_at: '2026-01-15',
  },
  {
    id: '5',
    title: 'Engineering Fundamentals Slides',
    description: 'Lecture slides for engineering contractors',
    file_type: 'image',
    file_url: '/handouts/engineering-slides.png',
    license_type: 'A',
    chapter: 'Supplemental',
    is_processed: false,
    questions_generated: 0,
    uploaded_at: '2026-01-16',
  },
];

export default function AdminHandoutsPage() {
  const [handouts, setHandouts] = useState<Handout[]>(DEMO_HANDOUTS);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    setTimeout(() => setLoading(false), 300);
  }, []);

  const handleProcess = async (handoutId: string) => {
    setProcessingId(handoutId);
    
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setHandouts(prev => prev.map(h => 
      h.id === handoutId 
        ? { ...h, is_processed: true, questions_generated: Math.floor(Math.random() * 30) + 15 }
        : h
    ));
    setProcessingId(null);
  };

  const handleDelete = (handoutId: string) => {
    if (confirm('Are you sure you want to delete this handout?')) {
      setHandouts(prev => prev.filter(h => h.id !== handoutId));
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="w-5 h-5 text-red-500" />;
      case 'docx': return <FileText className="w-5 h-5 text-blue-500" />;
      case 'image': return <Image className="w-5 h-5 text-green-500" />;
      default: return <File className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Handouts</h1>
          <p className="text-gray-500">Upload and manage study materials</p>
        </div>
        <button onClick={() => setShowUploadModal(true)} className="btn-primary">
          <Upload className="w-4 h-4 mr-2" />
          Upload Handout
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="card p-4">
          <p className="text-2xl font-bold text-gray-900">{handouts.length}</p>
          <p className="text-sm text-gray-500">Total Handouts</p>
        </div>
        <div className="card p-4">
          <p className="text-2xl font-bold text-green-600">
            {handouts.filter(h => h.is_processed).length}
          </p>
          <p className="text-sm text-gray-500">Processed</p>
        </div>
        <div className="card p-4">
          <p className="text-2xl font-bold text-amber-600">
            {handouts.filter(h => !h.is_processed).length}
          </p>
          <p className="text-sm text-gray-500">Pending</p>
        </div>
        <div className="card p-4">
          <p className="text-2xl font-bold text-primary-600">
            {handouts.reduce((sum, h) => sum + h.questions_generated, 0)}
          </p>
          <p className="text-sm text-gray-500">Questions Generated</p>
        </div>
      </div>

      {/* Handouts List */}
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">File</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">License</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Chapter</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Questions</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Uploaded</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {handouts.map((handout) => (
              <tr key={handout.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {getFileIcon(handout.file_type)}
                    <div>
                      <p className="font-medium text-gray-900">{handout.title}</p>
                      <p className="text-sm text-gray-500 line-clamp-1">{handout.description}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <LicenseBadge track={handout.license_type} />
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {handout.chapter}
                </td>
                <td className="px-6 py-4">
                  {processingId === handout.id ? (
                    <span className="flex items-center gap-2 text-primary-600">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </span>
                  ) : handout.is_processed ? (
                    <span className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      Processed
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-amber-600">
                      <Clock className="w-4 h-4" />
                      Pending
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {handout.questions_generated > 0 ? handout.questions_generated : '—'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(handout.uploaded_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-gray-100 rounded-lg" title="Preview">
                      <Eye className="w-4 h-4 text-gray-400" />
                    </button>
                    {!handout.is_processed && (
                      <button 
                        onClick={() => handleProcess(handout.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg" 
                        title="Process"
                        disabled={processingId !== null}
                      >
                        <Cog className="w-4 h-4 text-gray-400" />
                      </button>
                    )}
                    <button 
                      onClick={() => handleDelete(handout.id)}
                      className="p-2 hover:bg-gray-100 rounded-lg" 
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadModal onClose={() => setShowUploadModal(false)} onUpload={(h) => {
          setHandouts(prev => [h, ...prev]);
          setShowUploadModal(false);
        }} />
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
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[track]}`}>
      {track === 'both' ? 'A & B' : `License ${track}`}
    </span>
  );
}

function UploadModal({ 
  onClose, 
  onUpload 
}: { 
  onClose: () => void;
  onUpload: (handout: Handout) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    license_type: 'both' as 'A' | 'B' | 'both',
    chapter: '',
  });
  const [uploading, setUploading] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (file: File) => {
    setSelectedFile(file);
    if (!formData.title) {
      setFormData(prev => ({
        ...prev,
        title: file.name.replace(/\.[^/.]+$/, ''),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);

    // Simulate upload
    await new Promise(resolve => setTimeout(resolve, 1500));

    const fileType = selectedFile.name.toLowerCase().endsWith('.pdf') ? 'pdf' :
                    selectedFile.name.toLowerCase().endsWith('.docx') ? 'docx' :
                    selectedFile.type.startsWith('image/') ? 'image' : 'txt';

    const newHandout: Handout = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      file_type: fileType,
      file_url: `/handouts/${selectedFile.name}`,
      license_type: formData.license_type,
      chapter: formData.chapter,
      is_processed: false,
      questions_generated: 0,
      uploaded_at: new Date().toISOString().split('T')[0],
    };

    onUpload(newHandout);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Upload Handout</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* File Upload */}
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              dragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {selectedFile ? (
              <div className="flex items-center justify-center gap-3">
                <FileText className="w-8 h-8 text-primary-500" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            ) : (
              <>
                <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-1">
                  Drag and drop your file here, or{' '}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-primary-600 hover:underline"
                  >
                    browse
                  </button>
                </p>
                <p className="text-sm text-gray-400">PDF, DOCX, or images up to 50MB</p>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.doc,.png,.jpg,.jpeg"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              className="hidden"
            />
          </div>

          {/* Form Fields */}
          <div>
            <label className="label block mb-1.5">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="input"
              placeholder="Chapter 1 - Licensing Requirements"
              required
            />
          </div>

          <div>
            <label className="label block mb-1.5">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="input"
              rows={2}
              placeholder="Brief description of the content..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label block mb-1.5">License Type</label>
              <select
                value={formData.license_type}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  license_type: e.target.value as 'A' | 'B' | 'both' 
                }))}
                className="input"
              >
                <option value="both">Both A & B</option>
                <option value="A">License A only</option>
                <option value="B">License B only</option>
              </select>
            </div>
            <div>
              <label className="label block mb-1.5">Chapter</label>
              <input
                type="text"
                value={formData.chapter}
                onChange={(e) => setFormData(prev => ({ ...prev, chapter: e.target.value }))}
                className="input"
                placeholder="Chapter 1"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={!selectedFile || uploading}
              className="btn-primary flex-1 disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
