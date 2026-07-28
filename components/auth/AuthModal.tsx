'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Mail, 
  Lock,
  User, 
  Phone, 
  Building2,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  Sparkles
} from 'lucide-react';

// ============================================
// PASSWORD INPUT WITH TOGGLE
// ============================================

interface PasswordInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  name?: string;
  required?: boolean;
  minLength?: number;
}

function PasswordInput({ value, onChange, placeholder, name, required, minLength }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <input
        type={showPassword ? 'text' : 'password'}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder || 'Enter your password'}
        className="w-full px-4 py-3 bg-[#0B0912]/60 border border-[#2A2438] rounded-xl text-[#F5F0E8] placeholder-[#6B6358] focus:outline-none focus:ring-2 focus:ring-[#E8A33D]/40 focus:border-[#E8A33D]/40 transition-all duration-200 pr-12"
        required={required}
        minLength={minLength}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6358] hover:text-[#A79C8C] transition-colors duration-200"
        tabIndex={-1}
      >
        {showPassword ? (
          <EyeOff className="w-5 h-5" />
        ) : (
          <Eye className="w-5 h-5" />
        )}
      </button>
    </div>
  );
}

// ============================================
// LOGIN FORM (Inner Component)
// ============================================

interface LoginFormProps {
  onClose: () => void;
  onSwitchToRegister: () => void;
}

function LoginForm({ onClose, onSwitchToRegister }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        onClose();
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="bg-[#150F20] rounded-2xl border border-[#2A2438] p-6 sm:p-8 max-h-[90vh] overflow-y-auto relative shadow-2xl shadow-[#E8A33D]/5">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#E8A33D] to-[#C97F1F] p-[2px] shadow-lg shadow-[#E8A33D]/30 mx-auto mb-4">
            <div className="w-full h-full rounded-2xl bg-[#0B0912] flex items-center justify-center overflow-hidden">
              <img src="/freedom.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-[#F5F0E8]" style={{ fontFamily: 'var(--font-display)' }}>
            Welcome Back
          </h2>
          <p className="text-[#A79C8C] text-sm mt-1">Sign in to continue to your dashboard</p>
        </div>

        {/* Email Only Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-[#A79C8C] flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#6B6358]" />
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-3 bg-[#0B0912]/60 border border-[#2A2438] rounded-xl text-[#F5F0E8] placeholder-[#6B6358] focus:outline-none focus:ring-2 focus:ring-[#E8A33D]/40 focus:border-[#E8A33D]/40 transition-all duration-200"
              required
            />
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 text-[#F0827A] text-sm bg-[#E05252]/10 border border-[#E05252]/20 rounded-xl p-3"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 bg-gradient-to-r from-[#E8A33D] to-[#C97F1F] rounded-xl font-semibold text-[#0B0912] transition-all duration-300 shadow-lg shadow-[#E8A33D]/20 hover:shadow-[#E8A33D]/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In with Email</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-[#A79C8C] mt-6">
          Don't have an account?{' '}
          <button
            onClick={onSwitchToRegister}
            className="text-[#F2C879] hover:text-[#E8A33D] font-medium transition-colors duration-200"
          >
            Create one
          </button>
        </p>
      </div>
    </motion.div>
  );
}

// ============================================
// REGISTER FORM (Inner Component)
// ============================================

interface RegisterFormProps {
  onClose: () => void;
  onSwitchToLogin: () => void;
}

function RegisterForm({ onClose, onSwitchToLogin }: RegisterFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [techCenters, setTechCenters] = useState([]);
  const [isLoadingCenters, setIsLoadingCenters] = useState(true);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    techCenterId: '',
  });

  useEffect(() => {
    const fetchTechCenters = async () => {
      try {
        const response = await fetch('/api/tech-centers');
        const data = await response.json();
        setTechCenters(data);
      } catch (error) {
        console.error('Failed to fetch tech centers:', error);
      } finally {
        setIsLoadingCenters(false);
      }
    };
    fetchTechCenters();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.status === 201 && data.user && data.user.id) {
        setSuccess(true);
        
        const loginResult = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });
        
        if (loginResult?.error) {
          router.push('/login?registered=true');
        } else {
          onClose();
          router.push('/dashboard');
          router.refresh();
        }
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="bg-[#150F20] rounded-2xl border border-[#2A2438] p-6 sm:p-8 max-h-[90vh] overflow-y-auto relative shadow-2xl shadow-[#E8A33D]/5">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#E8A33D] to-[#C97F1F] p-[2px] shadow-lg shadow-[#E8A33D]/30 mx-auto mb-4">
            <div className="w-full h-full rounded-2xl bg-[#0B0912] flex items-center justify-center overflow-hidden">
              <img src="/freedom.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-[#F5F0E8]" style={{ fontFamily: 'var(--font-display)' }}>
            Create Account
          </h2>
          <p className="text-[#A79C8C] text-sm mt-1">Join the Freedom City Tech community</p>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* First Name */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-[#A79C8C] flex items-center gap-2">
              <User className="w-4 h-4 text-[#6B6358]" />
              First Name
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="First Name"
              className="w-full px-4 py-3 bg-[#0B0912]/60 border border-[#2A2438] rounded-xl text-[#F5F0E8] placeholder-[#6B6358] focus:outline-none focus:ring-2 focus:ring-[#E8A33D]/40 focus:border-[#E8A33D]/40 transition-all duration-200"
              required
            />
          </div>

          {/* Last Name */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-[#A79C8C] flex items-center gap-2">
              <User className="w-4 h-4 text-[#6B6358]" />
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Last Name"
              className="w-full px-4 py-3 bg-[#0B0912]/60 border border-[#2A2438] rounded-xl text-[#F5F0E8] placeholder-[#6B6358] focus:outline-none focus:ring-2 focus:ring-[#E8A33D]/40 focus:border-[#E8A33D]/40 transition-all duration-200"
              required
            />
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-[#A79C8C] flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#6B6358]" />
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              className="w-full px-4 py-3 bg-[#0B0912]/60 border border-[#2A2438] rounded-xl text-[#F5F0E8] placeholder-[#6B6358] focus:outline-none focus:ring-2 focus:ring-[#E8A33D]/40 focus:border-[#E8A33D]/40 transition-all duration-200"
              required
            />
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-[#A79C8C] flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#6B6358]" />
              Phone Number
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="+256 700 000 000"
              className="w-full px-4 py-3 bg-[#0B0912]/60 border border-[#2A2438] rounded-xl text-[#F5F0E8] placeholder-[#6B6358] focus:outline-none focus:ring-2 focus:ring-[#E8A33D]/40 focus:border-[#E8A33D]/40 transition-all duration-200"
              required
            />
          </div>

          {/* Tech Center */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-[#A79C8C] flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#6B6358]" />
              Tech Center
            </label>
            <select
              name="techCenterId"
              value={formData.techCenterId}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-[#0B0912]/60 border border-[#2A2438] rounded-xl text-[#F5F0E8] focus:outline-none focus:ring-2 focus:ring-[#E8A33D]/40 focus:border-[#E8A33D]/40 transition-all duration-200"
              required
              disabled={isLoadingCenters}
            >
              <option value="">
                {isLoadingCenters ? 'Loading tech centers...' : 'Select Tech Center'}
              </option>
              {techCenters.map((center: any) => (
                <option key={center.id} value={center.id}>
                  {center.name} ({center.code}) - {center.country?.name || 'No country'}
                </option>
              ))}
            </select>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-[#A79C8C] flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#6B6358]" />
              Password
            </label>
            <PasswordInput
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Min. 6 characters"
              name="password"
              required
              minLength={6}
            />
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 text-[#F0827A] text-sm bg-[#E05252]/10 border border-[#E05252]/20 rounded-xl p-3"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 text-[#45C7A6] text-sm bg-[#2FA88A]/10 border border-[#2FA88A]/20 rounded-xl p-3"
              >
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span>Account created successfully! Redirecting...</span>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            disabled={loading || isLoadingCenters}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 bg-gradient-to-r from-[#E8A33D] to-[#C97F1F] rounded-xl font-semibold text-[#0B0912] transition-all duration-300 shadow-lg shadow-[#E8A33D]/20 hover:shadow-[#E8A33D]/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-[#A79C8C] mt-6">
          Already have an account?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-[#F2C879] hover:text-[#E8A33D] font-medium transition-colors duration-200"
          >
            Sign in
          </button>
        </p>
      </div>
    </motion.div>
  );
}

// ============================================
// MAIN AUTH MODAL
// ============================================

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: 'login' | 'register';
}

export default function AuthModal({ isOpen, onClose, defaultType = 'login' }: AuthModalProps) {
  const [type, setType] = useState<'login' | 'register'>(defaultType);

  // Handle escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // Handle body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          className="relative w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="absolute -top-12 right-0 text-[#A79C8C] hover:text-[#F5F0E8] transition-colors duration-200 z-10 p-2"
          >
            <X className="w-6 h-6" />
          </motion.button>

          {/* Form Toggle Indicator */}
          <div className="flex justify-center mb-4">
            <div className="bg-[#0B0912] rounded-full p-1 border border-[#2A2438]">
              <button
                onClick={() => setType('login')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  type === 'login'
                    ? 'bg-gradient-to-r from-[#E8A33D] to-[#C97F1F] text-[#0B0912] shadow-lg shadow-[#E8A33D]/20'
                    : 'text-[#A79C8C] hover:text-[#F5F0E8]'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setType('register')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  type === 'register'
                    ? 'bg-gradient-to-r from-[#E8A33D] to-[#C97F1F] text-[#0B0912] shadow-lg shadow-[#E8A33D]/20'
                    : 'text-[#A79C8C] hover:text-[#F5F0E8]'
                }`}
              >
                Register
              </button>
            </div>
          </div>

          {/* Render the active form */}
          <AnimatePresence mode="wait">
            {type === 'login' ? (
              <LoginForm 
                key="login"
                onClose={onClose}
                onSwitchToRegister={() => setType('register')}
              />
            ) : (
              <RegisterForm 
                key="register"
                onClose={onClose}
                onSwitchToLogin={() => setType('login')}
              />
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}