'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import RippleButton from '@/components/RippleButton';
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
          router.push(`/form?userId=${data.user.id}&email=${encodeURIComponent(data.user.email)}`);
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4 relative">
      {/* Enhanced animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-40 w-72 h-72 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float animation-delay-4000"></div>
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='40' height='40' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 40 0 L 0 0 0 40' fill='none' stroke='rgba(255,255,255,0.03)' stroke-width='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)' /%3E%3C/svg%3E")`
        }}
      />

      <div className="w-full max-w-md relative z-10 animate-fade-in-up">
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

            <RippleButton
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-violet-700 hover:via-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <LoadingSpinner />
                  <span className="ml-2">Accessing...</span>
                </span>
              ) : (
                '🚀 Access System'
              )}
            </RippleButton>
          </form>

          <div className="mt-8 text-center space-y-3">
            <div className="text-cyan-300 text-sm">
              Don&apos;t have an account?{' '}
              <RippleButton
                onClick={() => router.push('/register')}
                className="text-violet-300 hover:text-white font-medium underline transition-colors duration-300"
              >
                Register here
              </RippleButton>
            </div>

            <RippleButton
              onClick={() => router.push('/')}
              className="text-cyan-300 hover:text-white font-medium text-sm transition-colors duration-300"
            >
              ← Back to Home
            </RippleButton>
          </div>
        </div>
      </div>
    </div>
  );
}
