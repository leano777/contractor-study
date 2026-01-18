'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Target,
  BookOpen,
  MessageCircle,
  Settings,
  Flame,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

// ===========================================
// SHARED NAVIGATION COMPONENT
// ===========================================

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Home', icon: <Home className="w-5 h-5" /> },
  { href: '/challenge', label: 'Challenge', icon: <Target className="w-5 h-5" /> },
  { href: '/study', label: 'Study', icon: <BookOpen className="w-5 h-5" /> },
  { href: '/chat', label: 'Ask AI', icon: <MessageCircle className="w-5 h-5" /> },
];

// Simplified - removed gamification features for cleaner UX
const MORE_ITEMS: NavItem[] = [
  { href: '/settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
];

export function BottomNav() {
  const pathname = usePathname();

  // Don't show on certain pages
  if (pathname === '/register' || pathname === '/') {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 md:hidden z-50">
      <div className="flex justify-around py-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-2 px-3 ${
                isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {item.icon}
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function TopNav() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Don't show on certain pages
  if (pathname === '/register' || pathname === '/chat' || pathname === '/' || pathname === '/login') {
    return null;
  }

  return (
    <>
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 hidden md:block">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-gray-900 dark:text-gray-100">Contractor Study</span>
            </Link>

            <div className="flex items-center gap-1">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    {item.icon}
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-orange-500 px-2">
                <Flame className="w-5 h-5" />
                <span className="font-semibold">7</span>
              </div>
              <Link href="/settings" className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <Settings className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile header */}
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 md:hidden">
        <div className="flex items-center justify-between px-4 h-14">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-900 dark:text-gray-100">Contractor Study</span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-orange-500">
              <Flame className="w-5 h-5" />
              <span className="font-semibold">7</span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-500 dark:text-gray-400"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900">
            {[...NAV_ITEMS, ...MORE_ITEMS].map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg ${
                    isActive ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </nav>
    </>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showBottomNav = !['/register', '/', '/chat'].includes(pathname);

  return (
    <div className={showBottomNav ? 'pb-16 md:pb-0' : ''}>
      <TopNav />
      {children}
      <BottomNav />
    </div>
  );
}
