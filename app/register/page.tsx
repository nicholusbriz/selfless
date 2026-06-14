'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import axios from '@/lib/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, User, Mail, Phone, Lock, Eye, EyeOff, Sparkles, Building2, Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { isAuthenticated, user, fetchUser } = useAuthStore();

  // Redirect when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      router.push('/dashboard/overview');
    }
  }, [isAuthenticated, user, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.phoneNumber) {
      setMessage('Please fill in all required fields including phone number');
      setMessageType('error');
      return;
    }

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
      // ✅ FIXED: Changed from '/auth/register' to '/api/auth/register'
      const response = await axios.post('/api/auth/register', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber
      });

      const data = response.data;

      if (data.success) {
        setMessage('Registration successful! Redirecting to dashboard...');
        setMessageType('success');
        
        // ✅ FIXED: Fetch user data after registration to update auth state
        await fetchUser();
        
        // Small delay to ensure auth state is updated
        setTimeout(() => {
          router.push('/dashboard/overview');
        }, 1500);
      } else {
        setMessage(data.message || 'Registration failed');
        setMessageType('error');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      setMessage(error.response?.data?.message || error.message || 'Network error. Please try again.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4 relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="absolute inset-0">
        <motion.div 
          className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"
          animate={{ x: [0, 100, 0], y: [0, -100, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute top-40 right-20 w-72 h-72 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"
          animate={{ x: [0, -100, 0], y: [0, 100, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute -bottom-8 left-40 w-72 h-72 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"
          animate={{ x: [0, 50, 0], y: [0, 50, 0], scale: [1, 1.3, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='40' height='40' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 40 0 L 0 0 0 40' fill='none' stroke='rgba(255,255,255,0.03)' stroke-width='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)' /%3E%3C/svg%3E")`
        }}
      />

      <motion.div 
        className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div 
          className="rounded-3xl p-8 border border-white/20 bg-white/10 backdrop-blur-lg"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <motion.div 
              className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 rounded-full mb-4 shadow-lg shadow-purple-500/50 p-2"
              animate={{ 
                rotate: [0, 360],
                boxShadow: [
                  "0 0 20px rgba(139, 92, 246, 0.5)",
                  "0 0 40px rgba(236, 72, 153, 0.5)",
                  "0 0 20px rgba(139, 92, 246, 0.5)"
                ]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            >
              <img src="/freedom.png" alt="Freedom City Tech Center Logo" className="w-full h-full object-contain" />
            </motion.div>
            <motion.h1 
              className="text-5xl font-bold bg-gradient-to-r from-violet-300 via-purple-300 to-indigo-300 bg-clip-text text-transparent mb-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Create Account
            </motion.h1>
            <motion.p 
              className="text-cyan-300 text-xl mb-4 font-medium"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Freedom City Tech Center
            </motion.p>
          </motion.div>

          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`mb-6 rounded-lg p-4 text-center ${
                  messageType === 'success'
                    ? 'bg-green-600/20 border border-green-400/30'
                    : 'bg-red-600/20 border border-red-400/30'
                }`}
              >
                <p className={`font-medium ${
                  messageType === 'success' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {message}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.form 
            onSubmit={handleSubmit} 
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <label htmlFor="firstName" className="block text-sm font-medium text-violet-200 mb-2 flex items-center">
                <User className="w-4 h-4 mr-2" />
                First Name (Real Name Required)
              </label>
              <motion.input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full px-4 py-4 bg-white/10 backdrop-blur-sm border border-violet-400/30 rounded-2xl focus:ring-4 focus:ring-violet-400/50 focus:border-violet-300 outline-none transition-all duration-300 text-white placeholder-violet-300/70 hover:bg-white/15"
                placeholder="Enter your real first name"
                whileFocus={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <label htmlFor="lastName" className="block text-sm font-medium text-violet-200 mb-2 flex items-center">
                <User className="w-4 h-4 mr-2" />
                Last Name (Real Name Required)
              </label>
              <motion.input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="w-full px-4 py-4 bg-white/10 backdrop-blur-sm border border-violet-400/30 rounded-2xl focus:ring-4 focus:ring-violet-400/50 focus:border-violet-300 outline-none transition-all duration-300 text-white placeholder-violet-300/70 hover:bg-white/15"
                placeholder="Enter your real last name"
                whileFocus={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <label htmlFor="email" className="block text-sm font-medium text-violet-200 mb-2 flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                Email Address (BYU or Personal Email)
              </label>
              <motion.input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-4 bg-white/10 backdrop-blur-sm border border-violet-400/30 rounded-2xl focus:ring-4 focus:ring-violet-400/50 focus:border-violet-300 outline-none transition-all duration-300 text-white placeholder-violet-300/70 hover:bg-white/15"
                placeholder="your.email@byu.edu or personal@email.com"
                whileFocus={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
            >
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-violet-200 mb-2 flex items-center">
                <Phone className="w-4 h-4 mr-2" />
                Phone Number
              </label>
              <motion.input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
                className="w-full px-4 py-4 bg-white/10 backdrop-blur-sm border border-violet-400/30 rounded-2xl focus:ring-4 focus:ring-violet-400/50 focus:border-violet-300 outline-none transition-all duration-300 text-white placeholder-violet-300/70 hover:bg-white/15"
                placeholder="+256 123 456 789 *"
                whileFocus={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 1.0 }}
            >
              <label htmlFor="password" className="block text-sm font-medium text-violet-200 mb-2 flex items-center">
                <Lock className="w-4 h-4 mr-2" />
                Password (Min. 6 Characters)
              </label>
              <div className="relative">
                <motion.input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-4 bg-white/10 backdrop-blur-sm border border-violet-400/30 rounded-2xl focus:ring-4 focus:ring-violet-400/50 focus:border-violet-300 outline-none transition-all duration-300 text-white placeholder-violet-300/70 hover:bg-white/15 pr-12"
                  placeholder="Create a strong password"
                  whileFocus={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                />
                <motion.button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-violet-300 hover:text-violet-200 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </motion.button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.1 }}
            >
              <motion.button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:via-purple-700 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-2xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="animate-spin" />
                    <span className="ml-2">Creating Account...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Create Account
                  </span>
                )}
              </motion.button>
            </motion.div>
          </motion.form>

          <motion.div 
            className="mt-8 pt-6 border-t border-violet-400/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.2 }}
          >
            <div className="text-center">
              <p className="text-violet-200 text-sm mb-4">
                Already have an account?{' '}
                <button
                  onClick={() => router.push('/login')}
                  className="text-cyan-300 hover:text-white font-bold underline transition-all duration-300"
                >
                  Login here
                </button>
              </p>
              <motion.div 
                className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-xl p-3 border border-blue-400/30"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-violet-200 text-xs font-medium mb-1 flex items-center justify-center">
                  <Building2 className="w-3 h-3 mr-1" />
                  Freedom City Tech Center
                </p>
                <p className="text-violet-300 text-xs">
                  Empowering through technology education
                </p>
              </motion.div>
            </div>
          </motion.div>

          <button
            onClick={() => router.push('/')}
            className="mt-4 text-cyan-300 hover:text-white font-medium text-sm transition-colors duration-300 flex items-center justify-center mx-auto"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}