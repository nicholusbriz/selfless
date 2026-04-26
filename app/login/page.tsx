'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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

      // All users redirect to dashboard after login
      setMessage('Access granted! Redirecting to your dashboard...');
      setMessageType('success');
      setTimeout(() => {
        router.push(`/dashboard?userId=${data.user.id}&email=${encodeURIComponent(data.user.email)}`);
      }, 1500);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Network error. Please try again.';
      setMessage(errorMessage);
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-700 to-indigo-800 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-blue-600/20 via-transparent to-purple-700/20"></div>

      {/* Floating animated elements */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-blue-400/20 rounded-full blur-3xl animate-float"></div>
      <div className="absolute top-20 right-20 w-40 h-40 bg-purple-400/20 rounded-full blur-3xl animate-float animation-delay-2000"></div>
      <div className="absolute bottom-10 left-1/3 w-36 h-36 bg-indigo-400/20 rounded-full blur-3xl animate-float animation-delay-1000"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/10 backdrop-blur-2xl rounded-3xl p-10 border-2 border-white/30 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.02]">
          <div className="text-center mb-10">
            {/* Enhanced Logo */}
            <div className="inline-flex items-center justify-center w-28 h-28 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-full mb-6 shadow-2xl shadow-purple-500/40 p-3 animate-bounce-in">
              <img
                src="/freedom.png"
                alt="Freedom City Tech Center Logo"
                className="w-full h-full object-contain animate-glow"
              />
            </div>

            {/* Enhanced Title */}
            <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent mb-4 animate-slide-in-right drop-shadow-2xl">
              Welcome Back
            </h1>

            {/* Enhanced Subtitle */}
            <p className="text-2xl font-medium text-white/90 mb-2 animate-slide-in-left drop-shadow-lg">
              Freedom City Tech Center
            </p>

            {/* Enhanced Description */}
            <div className="inline-flex items-center justify-center bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">
              <span className="text-white text-sm font-medium">🔐 Secure Access Portal</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label htmlFor="email" className="block text-lg font-semibold text-white/90 mb-3 animate-slide-in-left">
                📧 Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-6 py-4 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-4 focus:ring-blue-500/50 focus:border-blue-400 transition-all duration-300 text-lg font-medium"
                  placeholder="Enter your authorized email"
                  required
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>

            {message && (
              <div className={`p-4 rounded-2xl text-center animate-fade-in-up ${messageType === 'success'
                ? 'bg-gradient-to-r from-emerald-500/20 to-green-500/20 border-2 border-emerald-400/50 text-emerald-100'
                : 'bg-gradient-to-r from-red-500/20 to-rose-500/20 border-2 border-red-400/50 text-red-100'
                }`}>
                <div className="flex items-center justify-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${messageType === 'success' ? 'bg-emerald-400' : 'bg-red-400'}`}>
                    <span className="text-white text-lg">{messageType === 'success' ? '✓' : '!'}</span>
                  </div>
                  <p className="font-medium">{message}</p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white font-bold py-5 px-8 rounded-2xl hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-500 transform hover:scale-105 shadow-2xl hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-3 border-white border-t-transparent mr-3"></div>
                  <span>Signing in...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <span className="mr-2">🚀</span>
                  <span>Access System</span>
                </span>
              )}
            </button>
          </form>

          <div className="mt-10 space-y-6">
            <div className="flex justify-center gap-4">
              <button
                onClick={() => router.push('/register')}
                className="bg-gradient-to-r from-emerald-500/20 to-green-500/20 hover:from-emerald-500/30 hover:to-green-500/30 text-emerald-300 py-3 px-6 rounded-full font-medium border border-emerald-400/50 transition-all duration-300 transform hover:scale-105"
              >
                <span className="flex items-center">
                  <span className="mr-2">📝</span>
                  Register here
                </span>
              </button>
              <button
                onClick={() => router.push('/')}
                className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 text-cyan-300 py-3 px-6 rounded-full font-medium border border-cyan-400/50 transition-all duration-300 transform hover:scale-105"
              >
                <span className="flex items-center">
                  <span className="mr-2">🏠</span>
                  Back to Home
                </span>
              </button>
            </div>

            {/* Security Badge */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-white text-sm font-medium">Secure Connection</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
