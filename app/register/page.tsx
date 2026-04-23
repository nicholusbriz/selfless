'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import RippleButton from '@/components/RippleButton';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [showPassword, setShowPassword] = useState(false);
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
    console.log('🔵 Register button clicked!');
    console.log('🔵 Form data:', formData);

    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      console.log('🔴 Validation failed: Missing fields');
      setMessage('Please fill in all fields');
      setMessageType('error');
      return;
    }


    if (formData.password.length < 6) {
      console.log('🔴 Validation failed: Password too short');
      setMessage('Password must be at least 6 characters long');
      setMessageType('error');
      return;
    }

    console.log('🟢 Validation passed, starting API call...');
    setIsLoading(true);
    setMessage('');

    try {
      console.log('Submitting registration:', formData);

      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password
        }),
      });

      console.log('🟡 Response status:', response.status);
      const data = await response.json();
      console.log('🟡 Response data:', data);

      if (response.ok) {
        console.log('✅ Registration successful!');
        console.log('✅ User data:', data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        setMessage('Registration successful! Redirecting to your dashboard...');
        setMessageType('success');
        setTimeout(() => {
          console.log('🔄 Redirecting to /form...');
          router.push('/form');
        }, 1500);
      } else {
        console.log('❌ Registration failed:', data.message);
        setMessage(data.message || 'Registration failed');
        setMessageType('error');
      }
    } catch (error) {
      console.log('💥 Network error:', error);
      setMessage('Network error. Please try again.');
      setMessageType('error');
    } finally {
      console.log('🏁 Finished registration attempt');
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
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 rounded-full mb-4 shadow-lg shadow-purple-500/50">
              <span className="text-4xl text-white font-bold">SF</span>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-violet-300 via-purple-300 to-indigo-300 bg-clip-text text-transparent mb-3">
              Create Account
            </h1>
            <p className="text-cyan-300 text-xl mb-4 font-medium">
              Selfless CE Freedom City
            </p>

            {/* Organization Info */}
            <div className="bg-gradient-to-r from-blue-600/30 to-purple-600/30 backdrop-blur-sm rounded-2xl p-4 mb-4 border border-blue-400/30">
              <div className="flex items-center justify-center mb-2">
                <span className="text-2xl mr-2">🌍</span>
                <span className="text-white font-semibold text-sm">BeSelfless (U) Initiative</span>
              </div>
              <p className="text-gray-200 text-xs mb-2">
                📍 Freedom City Mall, Entebbe Road, Kampala, Uganda
              </p>
              <p className="text-cyan-300 text-xs italic">
                &quot;Nurturing Resilient Minds&quot; 💻🚀
              </p>
            </div>
            <div className="bg-blue-600/20 backdrop-blur-sm rounded-lg p-4 mb-4 border border-blue-400/30">
              <h3 className="text-white font-semibold mb-2">📝 Create Your Account:</h3>
              <ul className="text-gray-200 text-sm space-y-1">
                <li>• Use your BYU student email or personal account email</li>
                <li>• Enter your real first and last name (no nicknames)</li>
                <li>• Create a strong password (min. 6 characters)</li>
                <li>• One account per email address</li>
                <li>• Your information helps us track cleaning assignments</li>
              </ul>
              <p className="text-cyan-300 text-xs mt-2">
                All fields are required. Your account will be created immediately.
              </p>
            </div>
          </div>

          {message && (
            <div className={`mb-6 rounded-lg p-4 text-center ${messageType === 'success'
              ? 'bg-green-600/20 border border-green-400/30'
              : 'bg-red-600/20 border border-red-400/30'
              }`}>
              <p className={`font-medium ${messageType === 'success' ? 'text-green-400' : 'text-red-400'
                }`}>
                {message}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-violet-200 mb-2">
                👤 First Name (Real Name Required)
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full px-4 py-4 bg-white/10 backdrop-blur-sm border border-violet-400/30 rounded-2xl focus:ring-4 focus:ring-violet-400/50 focus:border-violet-300 outline-none transition-all duration-300 text-white placeholder-violet-300/70 hover:bg-white/15"
                placeholder="Enter your real first name"
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-violet-200 mb-2">
                👤 Last Name (Real Name Required)
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="w-full px-4 py-4 bg-white/10 backdrop-blur-sm border border-violet-400/30 rounded-2xl focus:ring-4 focus:ring-violet-400/50 focus:border-violet-300 outline-none transition-all duration-300 text-white placeholder-violet-300/70 hover:bg-white/15"
                placeholder="Enter your real last name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-violet-200 mb-2">
                📧 Email Address (BYU or Personal Email)
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-4 bg-white/10 backdrop-blur-sm border border-violet-400/30 rounded-2xl focus:ring-4 focus:ring-violet-400/50 focus:border-violet-300 outline-none transition-all duration-300 text-white placeholder-violet-300/70 hover:bg-white/15"
                placeholder="your.email@byu.edu or personal@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-violet-200 mb-2">
                🔐 Password (Min. 6 Characters)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-4 bg-white/10 backdrop-blur-sm border border-violet-400/30 rounded-2xl focus:ring-4 focus:ring-violet-400/50 focus:border-violet-300 outline-none transition-all duration-300 text-white placeholder-violet-300/70 hover:bg-white/15 pr-12"
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-violet-300 hover:text-violet-200 transition-colors text-xl"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <RippleButton
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:via-purple-700 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-2xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70"
            >
              {isLoading ? (
                <LoadingSpinner size="md" text="Creating Account..." className="text-white" />
              ) : (
                <span className="flex items-center justify-center">
                  <span className="mr-2">🚀</span>
                  Create Account
                </span>
              )}
            </RippleButton>
          </form>

          <div className="mt-8 pt-6 border-t border-violet-400/20">
            <div className="text-center">
              <p className="text-violet-200 text-sm mb-4">
                Already have an account?{' '}
                <Link
                  href="/"
                  className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent font-bold hover:from-violet-300 hover:to-purple-300 transition-all duration-300 transform hover:scale-105"
                >
                  🔑 Sign In Here
                </Link>
              </p>
              <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-xl p-3 border border-blue-400/30">
                <p className="text-violet-200 text-xs font-medium mb-1">
                  💻 BeSelfless (U) Initiative
                </p>
                <p className="text-violet-300 text-xs">
                  Empowering youth through technology education in Uganda 🇺🇬
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
