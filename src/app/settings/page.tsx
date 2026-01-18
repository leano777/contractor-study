'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  User,
  Bell,
  Shield,
  Smartphone,
  Mail,
  MessageSquare,
  Moon,
  Sun,
  Monitor,
  LogOut,
  ChevronRight,
  Save,
  Loader2,
  CheckCircle,
  Palette
} from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

// ===========================================
// STUDENT SETTINGS PAGE
// ===========================================

interface UserSettings {
  fullName: string;
  email: string;
  phone: string;
  licenseTrack: 'A' | 'B' | 'both';
  preferredContact: 'email' | 'sms' | 'both';
  notifications: {
    dailyChallenge: boolean;
    streakReminder: boolean;
    weeklyProgress: boolean;
    newContent: boolean;
  };
  darkMode: boolean;
}

const DEFAULT_SETTINGS: UserSettings = {
  fullName: 'Demo Student',
  email: 'demo@example.com',
  phone: '(555) 123-4567',
  licenseTrack: 'B',
  preferredContact: 'both',
  notifications: {
    dailyChallenge: true,
    streakReminder: true,
    weeklyProgress: true,
    newContent: false,
  },
  darkMode: false,
};

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('profile');

  useEffect(() => {
    // TODO: Fetch from API
    setTimeout(() => setLoading(false), 300);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    // TODO: Save to API
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogout = async () => {
    if (confirm('Are you sure you want to log out?')) {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-8">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : saved ? (
              <CheckCircle className="w-4 h-4 mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {saved ? 'Saved!' : 'Save'}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid md:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="md:col-span-1">
            <nav className="space-y-1">
              <NavItem
                icon={<User className="w-5 h-5" />}
                label="Profile"
                active={activeSection === 'profile'}
                onClick={() => setActiveSection('profile')}
              />
              <NavItem
                icon={<Bell className="w-5 h-5" />}
                label="Notifications"
                active={activeSection === 'notifications'}
                onClick={() => setActiveSection('notifications')}
              />
              <NavItem
                icon={<Shield className="w-5 h-5" />}
                label="Privacy"
                active={activeSection === 'privacy'}
                onClick={() => setActiveSection('privacy')}
              />
              <NavItem
                icon={<Palette className="w-5 h-5" />}
                label="Appearance"
                active={activeSection === 'appearance'}
                onClick={() => setActiveSection('appearance')}
              />
            </nav>

            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2 text-danger-500 hover:bg-danger-500/10 rounded-lg w-full"
              >
                <LogOut className="w-5 h-5" />
                <span>Log Out</span>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="md:col-span-3">
            {activeSection === 'profile' && (
              <ProfileSection settings={settings} onChange={setSettings} />
            )}
            {activeSection === 'notifications' && (
              <NotificationsSection settings={settings} onChange={setSettings} />
            )}
            {activeSection === 'privacy' && (
              <PrivacySection />
            )}
            {activeSection === 'appearance' && (
              <AppearanceSection />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function NavItem({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg w-full transition-colors ${
        active
          ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );
}

function ProfileSection({
  settings,
  onChange,
}: {
  settings: UserSettings;
  onChange: (s: UserSettings) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Personal Information</h2>

        <div className="space-y-4">
          <div>
            <label className="label block mb-1.5">Full Name</label>
            <input
              type="text"
              value={settings.fullName}
              onChange={(e) => onChange({ ...settings, fullName: e.target.value })}
              className="input"
            />
          </div>

          <div>
            <label className="label block mb-1.5">Email</label>
            <input
              type="email"
              value={settings.email}
              disabled
              className="input bg-gray-50 dark:bg-gray-700"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Contact support to change your email</p>
          </div>

          <div>
            <label className="label block mb-1.5">Phone</label>
            <input
              type="tel"
              value={settings.phone}
              onChange={(e) => onChange({ ...settings, phone: e.target.value })}
              className="input"
            />
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Study Preferences</h2>

        <div className="space-y-4">
          <div>
            <label className="label block mb-1.5">License Track</label>
            <select
              value={settings.licenseTrack}
              onChange={(e) => onChange({ ...settings, licenseTrack: e.target.value as 'A' | 'B' | 'both' })}
              className="input"
            >
              <option value="A">License A - General Engineering</option>
              <option value="B">License B - General Building</option>
              <option value="both">Both Licenses</option>
            </select>
          </div>

          <div>
            <label className="label block mb-1.5">Preferred Contact Method</label>
            <div className="flex gap-3 text-gray-900 dark:text-gray-100">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="contact"
                  checked={settings.preferredContact === 'email'}
                  onChange={() => onChange({ ...settings, preferredContact: 'email' })}
                  className="w-4 h-4 text-primary-600"
                />
                <Mail className="w-4 h-4 text-gray-400" />
                <span>Email</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="contact"
                  checked={settings.preferredContact === 'sms'}
                  onChange={() => onChange({ ...settings, preferredContact: 'sms' })}
                  className="w-4 h-4 text-primary-600"
                />
                <MessageSquare className="w-4 h-4 text-gray-400" />
                <span>SMS</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="contact"
                  checked={settings.preferredContact === 'both'}
                  onChange={() => onChange({ ...settings, preferredContact: 'both' })}
                  className="w-4 h-4 text-primary-600"
                />
                <span>Both</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NotificationsSection({
  settings,
  onChange,
}: {
  settings: UserSettings;
  onChange: (s: UserSettings) => void;
}) {
  const updateNotification = (key: keyof UserSettings['notifications'], value: boolean) => {
    onChange({
      ...settings,
      notifications: { ...settings.notifications, [key]: value },
    });
  };

  return (
    <div className="card p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Notification Preferences</h2>
      
      <div className="space-y-4">
        <ToggleItem
          title="Daily Challenge Reminder"
          description="Get notified when the daily challenge is ready"
          enabled={settings.notifications.dailyChallenge}
          onChange={(v) => updateNotification('dailyChallenge', v)}
        />
        <ToggleItem
          title="Streak at Risk"
          description="Remind me if I haven't completed today's challenge"
          enabled={settings.notifications.streakReminder}
          onChange={(v) => updateNotification('streakReminder', v)}
        />
        <ToggleItem
          title="Weekly Progress Report"
          description="Summary of your weekly study activity"
          enabled={settings.notifications.weeklyProgress}
          onChange={(v) => updateNotification('weeklyProgress', v)}
        />
        <ToggleItem
          title="New Content Available"
          description="Notify me when new study materials are added"
          enabled={settings.notifications.newContent}
          onChange={(v) => updateNotification('newContent', v)}
        />
      </div>
    </div>
  );
}

function PrivacySection() {
  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Privacy & Data</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">Show on Leaderboard</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Display your name publicly</p>
            </div>
            <Toggle enabled={true} onChange={() => {}} />
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">Activity Status</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Show when you're studying</p>
            </div>
            <Toggle enabled={false} onChange={() => {}} />
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Data Management</h2>

        <div className="space-y-3">
          <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
            <span className="text-gray-700 dark:text-gray-300">Export My Data</span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
          <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-danger-500">
            <span>Delete Account</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function AppearanceSection() {
  const { theme, setTheme } = useTheme();

  const themeOptions: { value: 'light' | 'dark' | 'system'; label: string; icon: React.ReactNode }[] = [
    { value: 'light', label: 'Light', icon: <Sun className="w-5 h-5" /> },
    { value: 'dark', label: 'Dark', icon: <Moon className="w-5 h-5" /> },
    { value: 'system', label: 'System', icon: <Monitor className="w-5 h-5" /> },
  ];

  return (
    <div className="card p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Appearance</h2>

      <div>
        <label className="label block mb-3">Theme</label>
        <div className="grid grid-cols-3 gap-3">
          {themeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setTheme(option.value)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                theme === option.value
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-600 dark:text-gray-400'
              }`}
            >
              {option.icon}
              <span className="text-sm font-medium">{option.label}</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
          {theme === 'system' ? 'Automatically match your device settings' : `Using ${theme} mode`}
        </p>
      </div>
    </div>
  );
}

function ToggleItem({
  title,
  description,
  enabled,
  onChange,
}: {
  title: string;
  description: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
      <div>
        <p className="font-medium text-gray-900 dark:text-gray-100">{title}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
      </div>
      <Toggle enabled={enabled} onChange={onChange} />
    </div>
  );
}

function Toggle({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative w-11 h-6 rounded-full transition-colors ${
        enabled ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
      }`}
    >
      <div
        className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
          enabled ? 'translate-x-5' : ''
        }`}
      />
    </button>
  );
}
