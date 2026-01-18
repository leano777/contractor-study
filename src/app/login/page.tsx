'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, Loader2, CheckCircle, ArrowLeft } from 'lucide-react';

// ===========================================
// AUTH: LOGIN PAGE (Magic Link)
// ===========================================

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send magic link');
      }

      setIsSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="card max-w-md w-full p-8 text-center animate-fade-in">
          <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-primary-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Check your email</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            We sent a magic link to <strong>{email}</strong>. Click the link to sign in.
          </p>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-sm text-gray-500 dark:text-gray-400">
            <p>Didn&apos;t receive the email? Check your spam folder or</p>
            <button
              onClick={() => setIsSent(false)}
              className="text-primary-600 dark:text-primary-400 hover:underline mt-1"
            >
              try again with a different email
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="card max-w-md w-full">
        <div className="card-header">
          <Link href="/" className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mb-4">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to home
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Welcome back</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Sign in to continue your study journey
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card-body space-y-5">
          <div>
            <label htmlFor="email" className="label block mb-1.5">
              Email address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="you@example.com"
              required
            />
          </div>

          {error && (
            <div className="bg-danger-500/10 text-danger-500 rounded-lg p-3 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full py-3"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Sending link...
              </>
            ) : (
              <>
                <Mail className="w-5 h-5 mr-2" />
                Send magic link
              </>
            )}
          </button>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-primary-600 dark:text-primary-400 hover:underline">
              Register here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
