import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppShell } from '@/components/layout/Navigation';
import { ThemeProvider } from '@/components/ThemeProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Contractor License Study System',
  description: 'Prepare for your California Contractor License exam with daily challenges and AI-powered study assistance.',
  keywords: ['contractor license', 'California', 'exam prep', 'study', 'License A', 'License B'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <AppShell>
            <main className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
              {children}
            </main>
          </AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
