'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Mail, Sparkles, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  const router = useRouter();
  const { login, isLoading } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setMessage('Please enter your email address');
      setMessageType('error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage('Please enter a valid email address');
      setMessageType('error');
      return;
    }

    setMessage('');
    setMessageType('');
    
    try {
      await login(email);
      setMessage('Login successful! Redirecting...');
      setMessageType('success');
      // Use Next.js router for client-side navigation
      router.push('/dashboard/overview');
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Login failed. Please try again.');
      setMessageType('error');
    }
  };

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4 relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Rest of your JSX - keep the same */}
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
        className="w-full max-w-md relative z-10 px-2"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div 
          className="rounded-3xl p-6 sm:p-8 border border-white/20 bg-white/10 backdrop-blur-lg"
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
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 rounded-full mb-4 shadow-lg shadow-purple-500/50 p-2"
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
              <img src="/freedom.png" alt="Logo" className="w-full h-full object-contain" />
            </motion.div>
            <motion.h1 
              className="text-4xl sm:text-4xl font-bold bg-gradient-to-r from-violet-300 via-purple-300 to-indigo-300 bg-clip-text text-transparent mb-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Welcome Back
            </motion.h1>
            <motion.p 
              className="text-cyan-300 text-basese sm:text-lg mb-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Freedom City Tech Center
            </motion.p>
            <motion.p 
              className="text-gray-300 text- mm:text-base"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              Enter your credentials to access the system
            </motion.p>
          </motion.div>

          <motion.form 
            onSubmit={handleSubmit} 
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <label htmlFor="email" className="block text-base font-medium text-violet-200 mb-2 flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                Email Address
              </label>
              <motion.input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-black/50 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-base"
                placeholder="Enter your authorized email"
                disabled={isLoading}
                autoComplete="email"
                whileFocus={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              />
            </motion.div>

            <AnimatePresence>
              {message && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`p-3 rounded-lg text-sm backdrop-blur-sm ${
                    messageType === 'success'
                      ? 'bg-green-500/20 border border-green-500/50 text-green-300'
                      : 'bg-red-500/20 border border-red-500/50 text-red-300'
                  }`}
                >
                  {message}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white font-semibold py-3 sm:py-3 px-6 rounded-lg hover:from-violet-700 hover:via-purple-700 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-base"
              whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(139, 92, 246, 0.5)" }}
              whileTap={{ scale: 0.95 }}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="animate-spin" />
                  <span className="ml-2">Accessing...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Access System
                </span>
              )}
            </motion.button>
          </motion.form>

          <motion.div 
            className="mt-8 text-center space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.9 }}
          >
            <div className="text-cyan-300 text-base sm:text-base">
              Don&apos;t have an account?{' '}
              <button
                onClick={() => router.push('/register')}
                className="text-violet-300 hover:text-white font-medium underline transition-colors duration-300"
              >
                Register here
              </button>
            </div>

            <button
              onClick={() => router.push('/')}
              className="text-cyan-300 hover:text-white font-medium text-base sm:text-base transition-colors duration-300 flex items-center justify-center mx-auto"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </button>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}