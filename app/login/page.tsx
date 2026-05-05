'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { BackgroundImage, LoadingButton } from '@/components/ui';
import { useLogin } from '@/hooks/loginRegister';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setMessage('Please enter both email and password');
      setMessageType('error');
      return;
    }

    setMessage('');
    setMessageType('');

    try {
      await login.mutateAsync({ email: formData.email, password: formData.password });

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
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 via-blue-800/10 to-purple-900/20"></div>
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>

      {/* Content */}
      <div className="min-h-screen flex items-center justify-center p-4">
        {/* Floating animated elements - Same as Homepage */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-20 right-20 w-40 h-40 bg-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-1/3 w-36 h-36 bg-indigo-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-1/4 w-28 h-28 bg-pink-400/20 rounded-full blur-3xl"></div>

        <div className="w-full max-w-md relative z-10">
          <div className="p-6">
            <div className="text-center mb-6">
              {/* Enhanced Logo - Same as Homepage */}
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-700 rounded-full mb-4 shadow-2xl shadow-cyan-500/50 p-2" style={{ boxShadow: '0 0 40px rgba(6, 182, 212, 0.5), 0 0 80px rgba(59, 130, 246, 0.3)' }}>
                <Image
                  src="/freedom.png"
                  alt="Freedom City Tech Center Logo"
                  width={128}
                  height={128}
                  className="w-full h-full object-contain"
                  style={{ filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.8))' }}
                />
              </div>

              {/* Enhanced Title - Same styling as homepage */}
              <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-cyan-300 via-white to-purple-300 bg-clip-text text-transparent mb-3" style={{
                textShadow: '0 0 30px rgba(255, 255, 255, 0.5), 0 0 60px rgba(6, 182, 212, 0.3)',
                letterSpacing: '0.02em'
              }}>
                WELCOME BACK
              </h1>

              {/* Enhanced Subtitle - Same styling as homepage */}
              <p className="text-lg md:text-xl font-light text-cyan-200 mb-3 uppercase tracking-widest" style={{
                textShadow: '0 0 20px rgba(6, 182, 212, 0.8), 0 0 40px rgba(6, 182, 212, 0.4)',
                letterSpacing: '0.15em'
              }}>
                Freedom City Tech Center
              </p>

              {/* Enhanced Description - Same styling as homepage */}
              <div className="inline-flex items-center justify-center bg-gradient-to-r from-cyan-500/30 via-blue-500/20 to-purple-500/30 backdrop-blur-md px-6 py-3 rounded-full border border-cyan-400/40" style={{
                boxShadow: '0 0 30px rgba(6, 182, 212, 0.3), inset 0 0 20px rgba(255, 255, 255, 0.1)'
              }}>
                <span className="text-cyan-100 font-bold text-sm tracking-wide" style={{ textShadow: '0 0 15px rgba(6, 182, 212, 0.8)' }}> Secure Access Portal</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-base font-semibold text-white/90 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-4 focus:ring-blue-500/50 focus:border-blue-400 transition-all duration-300 text-base font-medium"
                    placeholder="Enter your authorized email"
                    required
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-base font-semibold text-white/90 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-4 focus:ring-blue-500/50 focus:border-blue-400 transition-all duration-300 text-base font-medium pr-10"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors text-lg"
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              {message && (
                <div className={`p-4 rounded-xl text-center ${messageType === 'success'
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

              <LoadingButton
                type="submit"
                isLoading={login.isPending}
                className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white font-bold py-3 px-6 rounded-xl hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-500 transform hover:scale-105 shadow-2xl hover:shadow-blue-500/40 text-base"
                loadingText="Signing in..."
              >
                <span className="flex items-center justify-center">
                  <span className="mr-2">🚀</span>
                  <span>Access System</span>
                </span>
              </LoadingButton>
            </form>

            <div className="mt-6 space-y-4">
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => router.push('/register')}
                  className="bg-gradient-to-r from-emerald-500/20 to-green-500/20 hover:from-emerald-500/30 hover:to-green-500/30 text-emerald-300 py-3 px-6 rounded-full font-medium border border-emerald-400/50 transition-all duration-300 transform hover:scale-105"
                >
                  <span className="flex items-center">
                    <span className="mr-2">📝</span>
                    Register
                  </span>
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 text-cyan-300 py-3 px-6 rounded-full font-medium border border-cyan-400/50 transition-all duration-300 transform hover:scale-105"
                >
                  <span className="flex items-center">
                    <span className="mr-2">🏠</span>
                    Home
                  </span>
                </button>
              </div>

              {/* Security Badge */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-white text-sm font-medium">Secure Connection</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BackgroundImage>
  );
}
