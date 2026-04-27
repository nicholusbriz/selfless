'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

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
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

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

    setIsLoading(true);
    setMessage('');

    try {

      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          phoneNumber: formData.phoneNumber
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // All users redirect to dashboard after registration
        setMessage('Account created successfully! Redirecting to your dashboard...');
        setMessageType('success');
        setTimeout(() => {
          router.push(`/dashboard?userId=${data.user.id}&email=${encodeURIComponent(data.user.email)}`);
        }, 1500);
      } else {
        setMessage(data.message || 'Registration failed');
        setMessageType('error');
      }
    } catch {
      setMessage('Network error. Please try again.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen relative overflow-hidden">
        {/* Image Background */}
        <div className="absolute inset-0 w-full h-full">
          <Image
            src="/atbriz.jpg"
            alt="Background"
            fill
            className="object-cover"
            style={{
              filter: 'brightness(0.3) contrast(1.1) saturate(0.8) blur(0.8px)',
              objectFit: 'cover',
              objectPosition: 'center',
            }}
            priority
          />

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 via-blue-800/10 to-purple-900/20"></div>
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          {/* Floating animated elements - Same as Homepage and Login */}
          <div className="absolute top-10 left-10 w-32 h-32 bg-blue-400/20 rounded-full blur-3xl"></div>
          <div className="absolute top-20 right-20 w-40 h-40 bg-purple-400/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-1/3 w-36 h-36 bg-indigo-400/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-1/4 w-28 h-28 bg-pink-400/20 rounded-full blur-3xl"></div>

          <div className="w-full max-w-3xl relative z-10">
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
                  CREATE ACCOUNT
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
                  <span className="text-cyan-100 font-bold text-lg tracking-wide" style={{ textShadow: '0 0 15px rgba(6, 182, 212, 0.8)' }}>🌟 Join Our Community</span>
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
                    <label htmlFor="firstName" className="block text-base font-semibold text-white/90 mb-2">
                      👤 First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-xl focus:ring-4 focus:ring-blue-500/50 focus:border-blue-400 outline-none transition-all duration-300 text-white placeholder-white/50 text-base font-medium hover:bg-white/25"
                      placeholder="Enter your real first name"
                    />
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-base font-semibold text-white/90 mb-2">
                      👤 Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-xl focus:ring-4 focus:ring-blue-500/50 focus:border-blue-400 outline-none transition-all duration-300 text-white placeholder-white/50 text-base font-medium hover:bg-white/25"
                      placeholder="Enter your real last name"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-base font-semibold text-white/90 mb-2">
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
                    <label htmlFor="phoneNumber" className="block text-base font-semibold text-white/90 mb-2">
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
                  <label htmlFor="password" className="block text-base font-semibold text-white/90 mb-2">
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
                      className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-xl focus:ring-4 focus:ring-blue-500/50 focus:border-blue-400 outline-none transition-all duration-300 text-white placeholder-white/50 text-base font-medium hover:bg-white/25 pr-10"
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
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-3 px-6 rounded-full transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating Account...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        <span className="mr-2">🚀</span>
                        Create Account
                      </span>
                    )}
                  </button>
                </div>
              </form>

              <div className="mt-6 space-y-4">
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => router.push('/login')}
                    className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 text-blue-300 py-3 px-6 rounded-full font-medium border border-blue-400/50 transition-all duration-300 transform hover:scale-105"
                  >
                    <span className="flex items-center">
                      <span className="mr-2">🔐</span>
                      Sign in
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

                {/* Security and Privacy Info */}
                <div className="text-center">
                  <div className="inline-flex items-center justify-center bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm px-6 py-3 rounded-full border border-white/30">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-white text-sm font-medium">Secure Registration</span>
                      </div>
                      <div className="w-px h-4 bg-white/30"></div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <span className="text-white text-sm font-medium">Privacy Protected</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
