'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import RippleButton from '@/components/RippleButton';
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
      console.log('🔐 Attempting login for:', formData.email);

      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email
        }),
      });

      console.log('📡 Login response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Login failed:', errorData);

        // Handle specific database errors gracefully
        if (errorData.message?.includes('database') || errorData.message?.includes('MongoDB')) {
          throw new Error('Database connection issue. Please try again in a few minutes.');
        }

        throw new Error(errorData.message || `Login failed with status: ${response.status}`);
      }

      const data = await response.json();

      setMessage('Access granted! Redirecting to your dashboard...');
      setMessageType('success');
      setTimeout(() => {
        // Pass user data via URL parameters instead of localStorage
        router.push(`/form?userId=${data.user.id}&email=${encodeURIComponent(data.user.email)}`);
      }, 1500);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Network error. Please try again.';
      console.error('Login error:', error);
      setMessage(errorMessage);
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-40 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 rounded-full mb-4 shadow-lg shadow-purple-500/50">
              <span className="text-3xl text-white font-bold">🔐</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-300 via-purple-300 to-indigo-300 bg-clip-text text-transparent mb-3">
              Welcome Back
            </h1>
            <p className="text-cyan-300 text-lg">
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
              Don't have an account?{' '}
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
