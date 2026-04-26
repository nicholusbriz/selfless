'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-700 to-indigo-800 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-blue-600/20 via-transparent to-purple-700/20"></div>

      {/* Floating animated elements */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-blue-400/20 rounded-full blur-3xl animate-float"></div>
      <div className="absolute top-20 right-20 w-40 h-40 bg-purple-400/20 rounded-full blur-3xl animate-float animation-delay-2000"></div>
      <div className="absolute bottom-10 left-1/3 w-36 h-36 bg-indigo-400/20 rounded-full blur-3xl animate-float animation-delay-1000"></div>

      <div className="w-full max-w-2xl relative z-10">
        <div className="bg-white/10 backdrop-blur-2xl rounded-3xl p-12 border-2 border-white/30 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.02]">
          <div className="text-center mb-12">
            {/* Enhanced Logo */}
            <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-full mb-8 shadow-2xl shadow-purple-500/40 p-3 animate-bounce-in">
              <img
                src="/freedom.png"
                alt="Freedom City Tech Center Logo"
                className="w-full h-full object-contain animate-glow"
              />
            </div>

            {/* Enhanced Title */}
            <h1 className="text-6xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent mb-6 animate-slide-in-right drop-shadow-2xl">
              Create Account
            </h1>

            {/* Enhanced Subtitle */}
            <p className="text-2xl md:text-3xl font-medium text-white/90 mb-4 animate-slide-in-left drop-shadow-lg">
              Freedom Tech Center
            </p>

            {/* Enhanced Description */}
            <div className="inline-flex items-center justify-center bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm px-6 py-3 rounded-full border border-white/30">
              <span className="text-white font-semibold text-lg">🌟 Join Our Community</span>
            </div>
          </div>

          {message && (
            <div className={`mb-8 rounded-2xl p-6 text-center animate-fade-in-up ${messageType === 'success'
              ? 'bg-gradient-to-r from-emerald-500/20 to-green-500/20 border-2 border-emerald-400/50'
              : 'bg-gradient-to-r from-red-500/20 to-rose-500/20 border-2 border-red-400/50'
              }`}>
              <div className="flex items-center justify-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${messageType === 'success' ? 'bg-emerald-400' : 'bg-red-400'}`}>
                  <span className="text-white text-xl">{messageType === 'success' ? '✓' : '!'}</span>
                </div>
                <p className={`text-lg font-semibold ${messageType === 'success' ? 'text-emerald-100' : 'text-red-100'
                  }`}>
                  {message}
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="block text-lg font-semibold text-white/90 mb-3 animate-slide-in-left">
                  👤 First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="w-full px-6 py-4 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-2xl focus:ring-4 focus:ring-blue-500/50 focus:border-blue-400 outline-none transition-all duration-300 text-white placeholder-white/50 text-lg font-medium hover:bg-white/25"
                  placeholder="Enter your real first name"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-lg font-semibold text-white/90 mb-3 animate-slide-in-left">
                  👤 Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="w-full px-6 py-4 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-2xl focus:ring-4 focus:ring-blue-500/50 focus:border-blue-400 outline-none transition-all duration-300 text-white placeholder-white/50 text-lg font-medium hover:bg-white/25"
                  placeholder="Enter your real last name"
                />
              </div>

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
                    required
                    className="w-full px-6 py-4 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-2xl focus:ring-4 focus:ring-blue-500/50 focus:border-blue-400 outline-none transition-all duration-300 text-white placeholder-white/50 text-lg font-medium hover:bg-white/25"
                    placeholder="your.email@byu.edu or personal@email.com"
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="phoneNumber" className="block text-lg font-semibold text-white/90 mb-3 animate-slide-in-left">
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
                    className="w-full px-6 py-4 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-2xl focus:ring-4 focus:ring-blue-500/50 focus:border-blue-400 outline-none transition-all duration-300 text-white placeholder-white/50 text-lg font-medium hover:bg-white/25"
                    placeholder="+256 123 456 789"
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3.5 14.784 3.5 8V6a2 2 0 012-2h1z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="password" className="block text-lg font-semibold text-white/90 mb-3 animate-slide-in-left">
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
                  className="w-full px-6 py-4 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-2xl focus:ring-4 focus:ring-blue-500/50 focus:border-blue-400 outline-none transition-all duration-300 text-white placeholder-white/50 text-lg font-medium hover:bg-white/25 pr-12"
                  placeholder="Create a strong password (min. 6 characters)"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors text-xl"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-8">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg"
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

          <div className="mt-12 space-y-6">
            <div className="flex justify-center gap-6">
              <button
                onClick={() => router.push('/login')}
                className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 text-blue-300 py-4 px-8 rounded-full font-medium border border-blue-400/50 transition-all duration-300 transform hover:scale-105"
              >
                <span className="flex items-center">
                  <span className="mr-2">🔐</span>
                  Sign in here
                </span>
              </button>
              <button
                onClick={() => router.push('/')}
                className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 text-cyan-300 py-4 px-8 rounded-full font-medium border border-cyan-400/50 transition-all duration-300 transform hover:scale-105"
              >
                <span className="flex items-center">
                  <span className="mr-2">🏠</span>
                  Back to Home
                </span>
              </button>
            </div>

            {/* Security and Privacy Info */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm px-6 py-3 rounded-full border border-white/30">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-white text-sm font-medium">Secure Registration</span>
                  </div>
                  <div className="w-px h-4 bg-white/30"></div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse animation-delay-200"></div>
                    <span className="text-white text-sm font-medium">Privacy Protected</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
