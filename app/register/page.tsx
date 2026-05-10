'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { BackgroundImage, LoadingButton } from '@/components/ui';
import { useRegister } from '@/hooks/loginRegister';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: ''
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  // Use register hook instead of manual fetch
  const register = useRegister();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.phoneNumber) {
      setMessage('Please fill in all required fields including phone number');
      setMessageType('error');
      return;
    }

    // Basic phone number validation
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(formData.phoneNumber.trim())) {
      setMessage('Please enter a valid phone number');
      setMessageType('error');
      return;
    }

    if (formData.password.length < 6) {
      setMessage('Password must be at least 6 characters long');
      setMessageType('error');
      return;
    }

    try {
      await register.mutateAsync({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber
      });

      // All users redirect to dashboard after registration
      setMessage('Account created successfully! Redirecting to your dashboard...');
      setMessageType('success');
      setTimeout(() => {
        // Force a hard refresh to ensure user status is updated
        window.location.href = '/dashboard';
      }, 1500);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
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
        {/* Floating animated elements - Same as Homepage and Login */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-emerald-400/25 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-20 right-20 w-40 h-40 bg-teal-400/25 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-10 left-1/3 w-36 h-36 bg-cyan-400/25 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 right-1/4 w-28 h-28 bg-purple-400/25 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }}></div>

        <div className="w-full max-w-3xl relative z-10">
          <div className="p-6">
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

              {/* Enhanced Title - Same styling as homepage */}
              <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-emerald-100 via-teal-200 to-cyan-300 bg-clip-text text-transparent mb-3" style={{
                textShadow: '0 0 30px rgba(16, 185, 129, 0.5), 0 0 60px rgba(6, 182, 212, 0.3)',
                letterSpacing: '0.02em'
              }}>
                CREATE ACCOUNT
              </h1>

              {/* Enhanced Subtitle - Same styling as homepage */}
              <p className="text-lg md:text-xl font-light text-emerald-50/90 mb-3 uppercase tracking-widest" style={{
                textShadow: '0 0 20px rgba(16, 185, 129, 0.8), 0 0 40px rgba(6, 182, 212, 0.4)',
                letterSpacing: '0.15em'
              }}>
                Freedom City Tech Center
              </p>

              {/* Enhanced Description - Same styling as homepage */}
              <div className="inline-flex items-center justify-center bg-gradient-to-r from-emerald-500/30 via-teal-500/20 to-cyan-500/30 backdrop-blur-md px-6 py-3 rounded-full border border-emerald-400/40" style={{
                boxShadow: '0 0 30px rgba(16, 185, 129, 0.3), inset 0 0 20px rgba(255, 255, 255, 0.1)'
              }}>
                <span className="text-emerald-100 font-bold text-lg tracking-wide" style={{ textShadow: '0 0 15px rgba(16, 185, 129, 0.8)' }}>🌟 Join Our Community</span>
              </div>
            </div>

            {message && (
              <div className={`mb-4 rounded-xl p-4 text-center ${messageType === 'success'
                ? 'bg-gradient-to-r from-emerald-500/20 to-green-500/20 border-2 border-emerald-400/50'
                : 'bg-gradient-to-r from-red-500/20 to-rose-500/20 border-2 border-red-400/50'
                }`}>
                <div className="flex items-center justify-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${messageType === 'success' ? 'bg-emerald-400' : 'bg-red-400'}`}>
                    <span className="text-white text-lg">{messageType === 'success' ? '✓' : '!'}</span>
                  </div>
                  <p className={`text-base font-semibold ${messageType === 'success' ? 'text-emerald-100' : 'text-red-100'
                    }`}>
                    {message}
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-base font-semibold text-emerald-100/90 mb-2">
                    👤 First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border-2 border-emerald-400/30 rounded-xl focus:ring-4 focus:ring-emerald-500/50 focus:border-emerald-400 outline-none transition-all duration-300 text-white placeholder-white/50 text-base font-medium hover:bg-white/25"
                    placeholder="Enter your real first name"
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-base font-semibold text-emerald-100/90 mb-2">
                    👤 Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border-2 border-emerald-400/30 rounded-xl focus:ring-4 focus:ring-emerald-500/50 focus:border-emerald-400 outline-none transition-all duration-300 text-white placeholder-white/50 text-base font-medium hover:bg-white/25"
                    placeholder="Enter your real last name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-base font-semibold text-emerald-100/90 mb-2">
                    📧 Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-xl focus:ring-4 focus:ring-blue-500/50 focus:border-blue-400 outline-none transition-all duration-300 text-white placeholder-white/50 text-base font-medium hover:bg-white/25"
                      placeholder="your.email@byu.edu or personal@email.com"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="phoneNumber" className="block text-base font-semibold text-emerald-100/90 mb-2">
                    📱 Phone Number
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-xl focus:ring-4 focus:ring-blue-500/50 focus:border-blue-400 outline-none transition-all duration-300 text-white placeholder-white/50 text-base font-medium hover:bg-white/25"
                      placeholder="+256 123 456 789"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3.5 14.784 3.5 8V6a2 2 0 012-2h1z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <label htmlFor="password" className="block text-base font-semibold text-emerald-100/90 mb-2">
                  🔐 Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border-2 border-emerald-400/30 rounded-xl focus:ring-4 focus:ring-emerald-500/50 focus:border-emerald-400 outline-none transition-all duration-300 text-white placeholder-white/50 text-base font-medium hover:bg-white/25 pr-10"
                    placeholder="Create a strong password (min. 6 characters)"
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

              {/* Submit Button */}
              <div className="mt-4">
                <LoadingButton
                  type="submit"
                  isLoading={register.isPending}
                  className="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700 text-white font-bold py-3 px-6 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
                  loadingText="Creating Account..."
                >
                  <span className="flex items-center justify-center">
                    <span className="mr-2">🚀</span>
                    Create Account
                  </span>
                </LoadingButton>
              </div>
            </form>

            <div className="mt-6 space-y-4">
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => router.push('/login')}
                  className="bg-gradient-to-r from-emerald-500/20 via-teal-500/20 hover:from-emerald-500/30 hover:via-teal-500/30 text-emerald-100 py-3 px-6 rounded-full font-medium border border-emerald-400/50 transition-all duration-300 transform hover:scale-105"
                >
                  <span className="flex items-center">
                    <span className="mr-2">🔐</span>
                    Sign in
                  </span>
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="bg-gradient-to-r from-teal-500/20 via-cyan-500/20 hover:from-teal-500/30 hover:via-cyan-500/30 text-teal-100 py-3 px-6 rounded-full font-medium border border-teal-400/50 transition-all duration-300 transform hover:scale-105"
                >
                  <span className="flex items-center">
                    <span className="mr-2">🏠</span>
                    Home
                  </span>
                </button>
              </div>

              {/* Security and Privacy Info */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center bg-gradient-to-r from-emerald-500/20 via-teal-500/20 backdrop-blur-sm px-6 py-3 rounded-full border border-emerald-400/30">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                      <span className="text-emerald-100 text-sm font-medium">Secure Registration</span>
                    </div>
                    <div className="w-px h-4 bg-emerald-400/30"></div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
                      <span className="text-emerald-100 text-sm font-medium">Privacy Protected</span>
                    </div>
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
