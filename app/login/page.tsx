'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { BackgroundImage, LoadingButton } from '@/components/ui';
import { useLogin } from '@/hooks/loginRegister';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: ''
  });
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  // Use login hook instead of manual fetch
  const login = useLogin();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) {
      setMessage('Please enter your email');
      setMessageType('error');
      return;
    }

    setMessage('');
    setMessageType('');

    try {
      await login.mutateAsync({ email: formData.email });

      // All users redirect to dashboard after login
      setMessage('Access granted! Redirecting to your dashboard...');
      setMessageType('success');
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Network error. Please try again.';
      setMessage(errorMessage);
      setMessageType('error');
    }
  };

  return (
    <BackgroundImage className="min-h-screen relative overflow-hidden">
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/30 via-teal-900/20 to-cyan-900/25"></div>
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>

      {/* Content */}
      <div className="min-h-screen flex items-center justify-center p-4">
        {/* Floating animated elements */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-emerald-400/25 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-20 right-20 w-40 h-40 bg-teal-400/25 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-10 left-1/3 w-36 h-36 bg-cyan-400/25 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 right-1/4 w-28 h-28 bg-purple-400/25 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }}></div>

        <div className="w-full max-w-lg relative z-10">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-emerald-400/20 shadow-2xl p-8" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(6,182,212,0.05) 100%)', backdropFilter: 'blur(20px)' }}>
            <div className="text-center mb-6">
              {/* Enhanced Logo - Same as Homepage */}
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 rounded-full mb-4 shadow-2xl shadow-emerald-500/50 p-2" style={{ boxShadow: '0 0 40px rgba(16, 185, 129, 0.5), 0 0 80px rgba(6, 182, 212, 0.3)' }}>
                <Image
                  src="/freedom.png"
                  alt="Freedom City Tech Center Logo"
                  width={128}
                  height={128}
                  className="w-full h-full object-contain"
                  style={{ filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.8))' }}
                />
              </div>

              {/* Modern Title */}
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-100 via-teal-200 to-cyan-300 bg-clip-text text-transparent mb-4" style={{
                textShadow: '0 0 40px rgba(16, 185, 129, 0.3)',
                letterSpacing: '-0.02em'
              }}>
                Welcome Back
              </h1>

              {/* Modern Subtitle */}
              <p className="text-lg md:text-xl text-emerald-50/90 font-light mb-6" style={{
                letterSpacing: '0.01em'
              }}>
                Enter your email to access your dashboard
              </p>

              {/* Status Badge */}
              <div className="inline-flex items-center justify-center bg-gradient-to-r from-emerald-500/20 to-teal-500/20 backdrop-blur-sm px-4 py-2 rounded-full border border-emerald-400/30 mb-8">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-emerald-100 text-sm font-medium">System Online</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-emerald-100/90 mb-3 tracking-wide">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    className={`relative w-full px-5 py-4 bg-white/10 backdrop-blur-md border rounded-2xl text-white placeholder-white/50 focus:outline-none transition-all duration-300 text-base font-medium ${isFocused
                      ? 'border-emerald-400/60 bg-white/15 shadow-lg shadow-emerald-500/20'
                      : 'border-white/20 hover:border-white/30'
                      }`}
                    placeholder="your@email.com"
                    required
                  />
                  <div className={`absolute right-4 top-1/2 transform -translate-y-1/2 transition-all duration-300 ${isFocused ? 'text-emerald-300 scale-110' : 'text-white/50'
                    }`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>


              {message && (
                <div className={`p-4 rounded-2xl text-center transform transition-all duration-500 ${messageType === 'success'
                  ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-400/40 text-emerald-100 shadow-lg shadow-emerald-500/20'
                  : 'bg-gradient-to-r from-red-500/20 to-rose-500/20 border border-red-400/40 text-red-100 shadow-lg shadow-red-500/20'
                  }`}>
                  <div className="flex items-center justify-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${messageType === 'success' ? 'bg-emerald-400' : 'bg-red-400'} animate-pulse`}>
                      <span className="text-white text-lg">{messageType === 'success' ? '✓' : '⚠'}</span>
                    </div>
                    <p className="font-medium">{message}</p>
                  </div>
                </div>
              )}

              <LoadingButton
                type="submit"
                isLoading={login.isPending}
                className="relative w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white font-semibold py-4 px-8 rounded-2xl hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/30 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-500 transform hover:scale-[1.02] shadow-xl hover:shadow-2xl hover:shadow-emerald-500/40 text-base overflow-hidden group"
                loadingText="Authenticating..."
              >
                <span className="relative z-10 flex items-center justify-center">
                  <span className="mr-3 text-lg">→</span>
                  <span>Sign In</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              </LoadingButton>
            </form>

            <div className="mt-8 space-y-6">
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => router.push('/register')}
                  className="group relative px-6 py-3 bg-emerald-500/20 backdrop-blur-sm border border-emerald-400/30 rounded-2xl text-emerald-100 font-medium hover:bg-emerald-500/30 hover:border-emerald-400/40 transition-all duration-300 transform hover:scale-105"
                >
                  <span className="flex items-center">
                    <span className="mr-2 opacity-70 group-hover:opacity-100 transition-opacity">Create Account</span>
                  </span>
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="group relative px-6 py-3 bg-teal-500/10 backdrop-blur-sm border border-teal-400/20 rounded-2xl text-teal-100/80 font-medium hover:bg-teal-500/20 hover:border-teal-400/30 hover:text-teal-100/90 transition-all duration-300 transform hover:scale-105"
                >
                  <span className="flex items-center">
                    <span className="mr-2 opacity-70 group-hover:opacity-100 transition-opacity">← Back</span>
                  </span>
                </button>
              </div>

              {/* Security & Trust Indicators */}
              <div className="flex items-center justify-center space-x-6 text-xs text-emerald-100/50">
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span>Secure</span>
                </div>
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Encrypted</span>
                </div>
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span>Privacy</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BackgroundImage>
  );
}
