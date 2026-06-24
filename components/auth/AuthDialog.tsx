'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import axios from '@/lib/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, User, Phone, Lock, Eye, EyeOff, Sparkles, Loader2 } from 'lucide-react';

type AuthTab = 'login' | 'register';

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: AuthTab;
}

export default function AuthDialog({ isOpen, onClose, defaultTab = 'login' }: AuthDialogProps) {
  const [activeTab, setActiveTab] = useState<AuthTab>(defaultTab);
  const router = useRouter();
  const { login, fetchUser } = useAuthStore();

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginMessage, setLoginMessage] = useState('');
  const [loginMessageType, setLoginMessageType] = useState<'success' | 'error' | ''>('');
  const [isLoginLoading, setIsLoginLoading] = useState(false);

  // Register state
  const [registerFormData, setRegisterFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: ''
  });
  const [registerMessage, setRegisterMessage] = useState('');
  const [registerMessageType, setRegisterMessageType] = useState<'success' | 'error' | ''>('');
  const [isRegisterLoading, setIsRegisterLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginEmail) {
      setLoginMessage('Please enter your email address');
      setLoginMessageType('error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(loginEmail)) {
      setLoginMessage('Please enter a valid email address');
      setLoginMessageType('error');
      return;
    }

    setLoginMessage('');
    setLoginMessageType('');
    setIsLoginLoading(true);
    
    try {
      await login(loginEmail);
      setLoginMessage('Login successful! Redirecting...');
      setLoginMessageType('success');
      setTimeout(() => {
        onClose();
        router.push('/dashboard/overview');
      }, 1000);
    } catch (error: any) {
      setLoginMessage(error.response?.data?.message || 'Login failed. Please try again.');
      setLoginMessageType('error');
    } finally {
      setIsLoginLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!registerFormData.firstName || !registerFormData.lastName || !registerFormData.email || !registerFormData.password || !registerFormData.phoneNumber) {
      setRegisterMessage('Please fill in all required fields');
      setRegisterMessageType('error');
      return;
    }

    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(registerFormData.phoneNumber.trim())) {
      setRegisterMessage('Please enter a valid phone number');
      setRegisterMessageType('error');
      return;
    }

    if (registerFormData.password.length < 6) {
      setRegisterMessage('Password must be at least 6 characters long');
      setRegisterMessageType('error');
      return;
    }

    setIsRegisterLoading(true);
    setRegisterMessage('');

    try {
      const response = await axios.post('/api/auth/register', {
        firstName: registerFormData.firstName,
        lastName: registerFormData.lastName,
        email: registerFormData.email,
        password: registerFormData.password,
        phoneNumber: registerFormData.phoneNumber
      });

      const data = response.data;

      if (data.success) {
        setRegisterMessage('Registration successful! Redirecting to dashboard...');
        setRegisterMessageType('success');
        
        await fetchUser();
        
        setTimeout(() => {
          onClose();
          router.push('/dashboard/overview');
        }, 1500);
      } else {
        setRegisterMessage(data.message || 'Registration failed');
        setRegisterMessageType('error');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      setRegisterMessage(error.response?.data?.message || error.message || 'Network error. Please try again.');
      setRegisterMessageType('error');
    } finally {
      setIsRegisterLoading(false);
    }
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="bg-gradient-to-br from-[#0a0618] to-[#1a0b2e] rounded-2xl border border-white/10 w-full max-w-md max-h-[90vh] overflow-hidden shadow-2xl shadow-purple-500/20 flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-b border-white/10 p-6">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-white text-center mb-4">
              {activeTab === 'login' ? 'Welcome Back' : 'Create Account'}
            </h2>

            {/* Tabs */}
            <div className="flex bg-black/30 rounded-lg p-1">
              <button
                onClick={() => {
                  setActiveTab('login');
                  setLoginMessage('');
                  setRegisterMessage('');
                }}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'login'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => {
                  setActiveTab('register');
                  setLoginMessage('');
                  setRegisterMessage('');
                }}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'register'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Register
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto flex-1">
            <AnimatePresence mode="wait">
              {activeTab === 'login' ? (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                >
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <label htmlFor="login-email" className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                        <Mail className="w-4 h-4 mr-2" />
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="login-email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        placeholder="Enter your authorized email"
                        disabled={isLoginLoading}
                        autoComplete="email"
                      />
                    </div>

                    <AnimatePresence>
                      {loginMessage && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className={`p-3 rounded-lg text-sm backdrop-blur-sm ${
                            loginMessageType === 'success'
                              ? 'bg-green-500/20 border border-green-500/50 text-green-300'
                              : 'bg-red-500/20 border border-red-500/50 text-red-300'
                          }`}
                        >
                          {loginMessage}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <button
                      type="submit"
                      disabled={isLoginLoading}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/20"
                    >
                      {isLoginLoading ? (
                        <span className="flex items-center justify-center">
                          <Loader2 className="animate-spin mr-2" />
                          Accessing...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center">
                          <Sparkles className="w-5 h-5 mr-2" />
                          Access System
                        </span>
                      )}
                    </button>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="register"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        First Name
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={registerFormData.firstName}
                        onChange={handleRegisterChange}
                        className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        placeholder="First name"
                        disabled={isRegisterLoading}
                        autoComplete="given-name"
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        Last Name
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={registerFormData.lastName}
                        onChange={handleRegisterChange}
                        className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        placeholder="Last name"
                        disabled={isRegisterLoading}
                        autoComplete="family-name"
                      />
                    </div>

                    <div>
                      <label htmlFor="register-email" className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                        <Mail className="w-4 h-4 mr-2" />
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="register-email"
                        name="email"
                        value={registerFormData.email}
                        onChange={handleRegisterChange}
                        className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        placeholder="your@email.com"
                        disabled={isRegisterLoading}
                        autoComplete="email"
                      />
                    </div>

                    <div>
                      <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                        <Phone className="w-4 h-4 mr-2" />
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phoneNumber"
                        name="phoneNumber"
                        value={registerFormData.phoneNumber}
                        onChange={handleRegisterChange}
                        className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        placeholder="+256 761 996 296"
                        disabled={isRegisterLoading}
                        autoComplete="tel"
                      />
                    </div>

                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                        <Lock className="w-4 h-4 mr-2" />
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          id="password"
                          name="password"
                          value={registerFormData.password}
                          onChange={handleRegisterChange}
                          className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all pr-12"
                          placeholder="Min. 6 characters"
                          disabled={isRegisterLoading}
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <AnimatePresence>
                      {registerMessage && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className={`p-3 rounded-lg text-sm backdrop-blur-sm ${
                            registerMessageType === 'success'
                              ? 'bg-green-500/20 border border-green-500/50 text-green-300'
                              : 'bg-red-500/20 border border-red-500/50 text-red-300'
                          }`}
                        >
                          {registerMessage}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <button
                      type="submit"
                      disabled={isRegisterLoading}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/20"
                    >
                      {isRegisterLoading ? (
                        <span className="flex items-center justify-center">
                          <Loader2 className="animate-spin mr-2" />
                          Creating Account...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center">
                          <Sparkles className="w-5 h-5 mr-2" />
                          Create Account
                        </span>
                      )}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 text-center">
            <p className="text-gray-400 text-sm">
              {activeTab === 'login' ? (
                <>
                  Don't have an account?{' '}
                  <button
                    onClick={() => setActiveTab('register')}
                    className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
                  >
                    Register here
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    onClick={() => setActiveTab('login')}
                    className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
                  >
                    Login here
                  </button>
                </>
              )}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
