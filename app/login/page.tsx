'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAdminEmail } from '@/config/admin';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: ''
  });
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) {
      setMessage('Please enter your email address');
      setMessageType('error');
      return;
    }

    setIsLoading(true);
    setMessage('');
    setMessageType('');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();

        // Handle specific database errors gracefully
        if (errorData.message?.includes('database') || errorData.message?.includes('MongoDB')) {
          throw new Error('Database connection issue. Please try again in a few minutes.');
        }

        throw new Error(errorData.message || `Login failed with status: ${response.status}`);
      }

      const data = await response.json();

      // Check if user is admin and redirect accordingly
      const isAdmin = isAdminEmail(data.user.email);

      if (isAdmin) {
        setMessage('Admin access granted! Redirecting to admin dashboard...');
        setMessageType('success');
        setTimeout(() => {
          router.push(`/admin?userId=${data.user.id}&email=${encodeURIComponent(data.user.email)}`);
        }, 1500);
      } else {
        setMessage('Access granted! Redirecting to your dashboard...');
        setMessageType('success');
        setTimeout(() => {
          router.push(`/dashboard?userId=${data.user.id}&email=${encodeURIComponent(data.user.email)}`);
        }, 1500);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Network error. Please try again.';
      setMessage(errorMessage);
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4 relative overflow-hidden">

      <div className="w-full max-w-md relative z-10 animate-fade-in-up overflow-y-auto max-h-full">
        <div className="glass-card rounded-3xl p-8 border border-white/20 shadow-glow-lg hover-lift">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 rounded-full mb-4 shadow-lg shadow-purple-500/50 p-2">
              <img
                src="/freedom.png"
                alt="Freedom City Tech Center Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-300 via-purple-300 to-indigo-300 bg-clip-text text-transparent mb-3">
              Welcome Back
            </h1>
            <p className="text-cyan-300 text-lg mb-2">
              Freedom Tech Center
            </p>
            <p className="text-gray-300 text-sm">
              Enter your email to access the system
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-violet-200 mb-2">
                📧 Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                placeholder="Enter your authorized email"
                required
              />
            </div>

            {message && (
              <div className={`p-3 rounded-lg text-sm ${messageType === 'success'
                ? 'bg-green-500/20 border border-green-500/50 text-green-300'
                : 'bg-red-500/20 border border-red-500/50 text-red-300'
                }`}>
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-violet-700 hover:via-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                  Signing in...
                </span>
              ) : (
                '🚀 Access System'
              )}
            </button>
          </form>

          <div className="mt-8 text-center space-y-4">
            <div className="flex justify-center gap-4">
              <button
                onClick={() => router.push('/register')}
                className="bg-violet-600/20 hover:bg-violet-600/30 text-violet-400 py-3 px-6 rounded-full font-medium border border-violet-500/50 transition-all"
              >
                Register here
              </button>
              <button
                onClick={() => router.push('/')}
                className="bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 py-3 px-6 rounded-full font-medium border border-cyan-500/50 transition-all"
              >
                ← Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
