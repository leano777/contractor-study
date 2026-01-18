'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Users, 
  FileText, 
  HelpCircle, 
  QrCode,
  BarChart3,
  Settings,
  ChevronLeft,
  BookOpen
} from 'lucide-react';

// ===========================================
// ADMIN LAYOUT WITH SIDEBAR
// ===========================================

const ADMIN_NAV = [
  { href: '/admin', label: 'Overview', icon: BarChart3 },
  { href: '/admin/students', label: 'Students', icon: Users },
  { href: '/admin/handouts', label: 'Handouts', icon: FileText },
  { href: '/admin/questions', label: 'Questions', icon: HelpCircle },
  { href: '/admin/qr', label: 'QR Code', icon: QrCode },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <Link href="/dashboard" className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm mb-4">
            <ChevronLeft className="w-4 h-4" />
            Back to App
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900">Admin Panel</h1>
              <p className="text-xs text-gray-500">Contractor Study</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {ADMIN_NAV.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || 
                (item.href !== '/admin' && pathname.startsWith(item.href));
              
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <Link
            href="/admin/settings"
            className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium">Settings</span>
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
