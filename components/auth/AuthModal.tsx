'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
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
  Key,
  MessageCircle,
} from 'lucide-react';

// ============================================
// THEME TOKENS — matches Header2 exactly
// ============================================

const COLORS = {
  navy: '#12203B',
  navyDeep: '#0D182C',
  navSurface: '#1A2D49',
  navBorder: '#304763',

  brass: '#B98A3E',
  brassLight: '#E8A33D',
  brassBright: '#F0B85C',

  white: '#FFFFFF',
  softWhite: '#F7F6F2',
  page: '#F1F1EC',
  border: '#DADCD3',
  muted: '#6B7268',
  subtle: '#8A9088',
};

// ============================================
// TYPES
// ============================================

interface TechCenter {
  id: string;
  name: string;
  code: string;
  country?: {
    name?: string;
  };
}

// ============================================
// SHARED STYLES — light "paper" card on dark backdrop
// ============================================

const inputClassName =
  'w-full px-4 py-3 bg-white border border-[#DADCD3] rounded-lg text-[#12203B] placeholder-[#8A9088] focus:outline-none focus:ring-2 focus:ring-[#E8A33D]/35 focus:border-[#E8A33D] transition-all duration-200';

const labelClassName =
  'text-sm font-semibold text-[#12203B] flex items-center gap-2';

const primaryButtonClassName =
  'w-full py-3 bg-[#E8A33D] hover:bg-[#F0B85C] rounded-lg font-bold text-[#12203B] transition-all duration-200 shadow-[0_4px_14px_rgba(232,163,61,0.25)] hover:shadow-[0_6px_20px_rgba(232,163,61,0.35)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2';

const secondaryTextButtonClassName =
  'text-[#B98A3E] hover:text-[#E8A33D] font-semibold transition-colors duration-200';

const cardClassName =
  'bg-[#F1F1EC] rounded-2xl border border-[#DADCD3] p-6 sm:p-8 max-h-[90vh] overflow-y-auto relative shadow-[0_24px_60px_rgba(13,24,44,0.35)]';

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

function PasswordInput({
  value,
  onChange,
  placeholder,
  name,
  required,
  minLength,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <input
        type={showPassword ? 'text' : 'password'}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder || 'Enter your password'}
        className={`${inputClassName} pr-12`}
        required={required}
        minLength={minLength}
      />

      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A9088] hover:text-[#12203B] transition-colors duration-200"
        tabIndex={-1}
        aria-label={showPassword ? 'Hide password' : 'Show password'}
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
// AUTH HEADER
// ============================================

interface AuthHeaderProps {
  title: string;
  description: string;
}

function AuthHeader({ title, description }: AuthHeaderProps) {
  return (
    <div className="text-center mb-7">
      {/* Brand mark — brass ring + navy center, matching header brand block */}
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#E8A33D] to-[#B98A3E] p-[2px] shadow-[0_8px_24px_rgba(232,163,61,0.28)] mx-auto mb-4">
        <div className="w-full h-full rounded-2xl bg-[#12203B] flex items-center justify-center overflow-hidden">
          <img
            src="/freedom.png"
            alt="SELFLESS CE"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <h2
        className="text-2xl font-bold text-[#12203B]"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {title}
      </h2>

      <p className="text-[#4B564C] text-sm mt-1.5 leading-5">
        {description}
      </p>
    </div>
  );
}

// ============================================
// FEEDBACK MESSAGE
// ============================================

interface FeedbackMessageProps {
  type: 'error' | 'success' | 'info';
  children: React.ReactNode;
}

function FeedbackMessage({ type, children }: FeedbackMessageProps) {
  const styles = {
    error: {
      wrapper:
        'text-[#B23A3A] bg-[#E05252]/8 border-[#E05252]/25',
      icon: <AlertCircle className="w-4 h-4 flex-shrink-0" />,
    },
    success: {
      wrapper:
        'text-[#1E7A63] bg-[#2FA88A]/8 border-[#2FA88A]/25',
      icon: <CheckCircle className="w-4 h-4 flex-shrink-0" />,
    },
    info: {
      wrapper:
        'text-[#8A6620] bg-[#E8A33D]/10 border-[#E8A33D]/30',
      icon: <Key className="w-4 h-4 flex-shrink-0" />,
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className={`flex items-start gap-2 text-sm border rounded-lg p-3.5 ${styles[type].wrapper}`}
    >
      {styles[type].icon}
      <span className="leading-5">{children}</span>
    </motion.div>
  );
}

// ============================================
// RESET CODE ADMINISTRATOR NOTE
// ============================================

interface ResetCodeNoteProps {
  email: string;
}

function ResetCodeNote({ email }: ResetCodeNoteProps) {
  const whatsappMessage =
    `Hello Admin, I have requested a new password reset token. ` +
    `Please send me my reset code. My email is: ${email}`;

  return (
    <div className="rounded-lg border border-[#25D366]/25 bg-[#25D366]/6 p-4">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-[#25D366]/12 flex items-center justify-center flex-shrink-0">
          <MessageCircle className="w-4 h-4 text-[#25D366]" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[#12203B]">
            Need your reset code?
          </p>

          <p className="text-xs text-[#4B564C] leading-5 mt-1.5">
            A new reset token has been generated for your account.
            Please contact the administrator and let them know that
            you have requested a new token so they can send you the
            reset code immediately.
          </p>

          <a
            href={`https://wa.me/256761996296?text=${encodeURIComponent(
              whatsappMessage
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-3 text-sm font-semibold text-[#1E9C55] hover:text-[#25D366] transition-colors"
          >
            <span>Contact administrator</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}

// ============================================
// LOGIN FORM
// ============================================

interface LoginFormProps {
  onClose: () => void;
  onSwitchToRegister: () => void;
  onSwitchToForgotPassword: () => void;
}

function LoginForm({
  onClose,
  onSwitchToRegister,
  onSwitchToForgotPassword,
}: LoginFormProps) {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError('');
    setIsLoading(true);

    try {
      const result = await login(email, password);

      if (result?.error) {
        setError(result.error);
      } else {
        onClose();
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Login failed'
      );
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
      <div className={cardClassName}>
        <AuthHeader
          title="Welcome Back"
          description="Sign in to continue to your dashboard"
        />

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className={labelClassName}>
              <Mail className="w-4 h-4 text-[#8A9088]" />
              Email Address
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className={inputClassName}
              autoComplete="email"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className={labelClassName}>
              <Lock className="w-4 h-4 text-[#8A9088]" />
              Password
            </label>

            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              name="password"
              required
              minLength={6}
            />

            <div className="text-right pt-1">
              <button
                type="button"
                onClick={onSwitchToForgotPassword}
                className="text-sm text-[#B98A3E] hover:text-[#E8A33D] transition-colors duration-200"
              >
                Forgot Password?
              </button>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <FeedbackMessage type="error">
                {error}
              </FeedbackMessage>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className={primaryButtonClassName}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Access my Portal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </form>

        <p className="text-center text-sm text-[#4B564C] mt-6">
          Don&apos;t have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className={secondaryTextButtonClassName}
          >
            Create one
          </button>
        </p>
      </div>
    </motion.div>
  );
}

// ============================================
// REGISTER FORM
// ============================================

interface RegisterFormProps {
  onClose: () => void;
  onSwitchToLogin: () => void;
  onSwitchToForgotPassword?: () => void;
}

function RegisterForm({
  onClose,
  onSwitchToLogin,
  onSwitchToForgotPassword,
}: RegisterFormProps) {
  const router = useRouter();
  const { login } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [techCenters, setTechCenters] = useState<TechCenter[]>([]);
  const [isLoadingCenters, setIsLoadingCenters] = useState(true);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    techCenterId: '',
    gender: '',
  });

  useEffect(() => {
    const fetchTechCenters = async () => {
      try {
        const response = await fetch('/api/tech-centers');

        if (!response.ok) {
          throw new Error('Failed to load tech centers');
        }

        const data = await response.json();
        setTechCenters(Array.isArray(data) ? data : []);
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

      if (
        response.status === 201 &&
        data.user &&
        data.user.id
      ) {
        setSuccess(true);

        const loginResult = await login(
          formData.email,
          formData.password
        );

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
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Registration failed'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md mx-auto"
    >
      <div className={cardClassName}>
        <AuthHeader
          title="Create Account"
          description="Join the SELFLESS CE community"
        />

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className={labelClassName}>
              <User className="w-4 h-4 text-[#8A9088]" />
              First Name
            </label>

            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="First Name"
              className={inputClassName}
              autoComplete="given-name"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className={labelClassName}>
              <User className="w-4 h-4 text-[#8A9088]" />
              Last Name
            </label>

            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Last Name"
              className={inputClassName}
              autoComplete="family-name"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className={labelClassName}>
              <Mail className="w-4 h-4 text-[#8A9088]" />
              Email Address
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              className={inputClassName}
              autoComplete="email"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className={labelClassName}>
              <Phone className="w-4 h-4 text-[#8A9088]" />
              Phone Number
            </label>

            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="+256 700 000 000"
              className={inputClassName}
              autoComplete="tel"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className={labelClassName}>
              <Building2 className="w-4 h-4 text-[#8A9088]" />
              Tech Center
            </label>

            <select
              name="techCenterId"
              value={formData.techCenterId}
              onChange={handleChange}
              className={inputClassName}
              required
              disabled={isLoadingCenters}
            >
              <option value="">
                {isLoadingCenters
                  ? 'Loading tech centers...'
                  : 'Select Tech Center'}
              </option>

              {techCenters.map((center) => (
                <option key={center.id} value={center.id}>
                  {center.name} ({center.code}) -{' '}
                  {center.country?.name || 'No country'}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className={labelClassName}>
              <User className="w-4 h-4 text-[#8A9088]" />
              Gender
            </label>

            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className={inputClassName}
              required
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className={labelClassName}>
              <Lock className="w-4 h-4 text-[#8A9088]" />
              Password
            </label>

            <PasswordInput
              value={formData.password}
              onChange={(e) =>
                setFormData((previous) => ({
                  ...previous,
                  password: e.target.value,
                }))
              }
              placeholder="Min. 6 characters"
              name="password"
              required
              minLength={6}
            />

            {onSwitchToForgotPassword && (
              <div className="text-right pt-1">
                <button
                  type="button"
                  onClick={onSwitchToForgotPassword}
                  className="text-sm text-[#B98A3E] hover:text-[#E8A33D] transition-colors duration-200"
                >
                  Forgot Password?
                </button>
              </div>
            )}
          </div>

          <AnimatePresence>
            {error && (
              <FeedbackMessage type="error">
                {error}
              </FeedbackMessage>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {success && (
              <FeedbackMessage type="success">
                Account created successfully! Redirecting...
              </FeedbackMessage>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            disabled={loading || isLoadingCenters}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className={primaryButtonClassName}
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

        <p className="text-center text-sm text-[#4B564C] mt-6">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className={secondaryTextButtonClassName}
          >
            Sign in
          </button>
        </p>
      </div>
    </motion.div>
  );
}

// ============================================
// FORGOT PASSWORD FORM
// ============================================

interface ForgotPasswordFormProps {
  onClose: () => void;
  onSwitchToLogin: () => void;
}

function ForgotPasswordForm({
  onClose,
  onSwitchToLogin,
}: ForgotPasswordFormProps) {
  const [step, setStep] = useState<
    'request' | 'verify' | 'reset'
  >('request');

  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [hasActiveToken, setHasActiveToken] = useState(false);
  const [isCheckingToken, setIsCheckingToken] = useState(false);

  // ============================================
  // CHECK ACTIVE TOKEN
  // ============================================

  useEffect(() => {
    const checkForActiveToken = async () => {
      if (email && email.includes('@')) {
        setIsCheckingToken(true);

        try {
          const response = await fetch(
            '/api/auth/check-reset-token',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ email }),
            }
          );

          const data = await response.json();

          if (response.ok) {
            setHasActiveToken(Boolean(data.hasActiveToken));
          }
        } catch {
          setHasActiveToken(false);
        } finally {
          setIsCheckingToken(false);
        }
      } else {
        setHasActiveToken(false);
      }
    };

    const debounceTimer = setTimeout(
      checkForActiveToken,
      500
    );

    return () => clearTimeout(debounceTimer);
  }, [email]);

  // ============================================
  // RESET ACTIVE TOKEN STATE
  // ============================================

  useEffect(() => {
    if (step === 'request') {
      setHasActiveToken(false);
    }
  }, [step]);

  // ============================================
  // REQUEST RESET
  // ============================================

  const handleRequestReset = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const checkResponse = await fetch(
        '/api/auth/check-reset-token',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        }
      );

      const checkData = await checkResponse.json();

      if (
        checkResponse.ok &&
        checkData.hasActiveToken
      ) {
        setSuccess(
          'You already have an active reset code. Please enter it below.'
        );

        setTimeout(() => {
          setStep('verify');
          setSuccess('');
        }, 2000);

        setIsLoading(false);
        return;
      }

      const response = await fetch(
        '/api/auth/forgot-password',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setSuccess(
          'Reset code requested. A new reset token has been generated for your account. Please contact the administrator and let them know that you have requested a new token so they can send you the reset code immediately.'
        );

        setTimeout(() => {
          setStep('verify');
          setSuccess('');
        }, 2500);
      } else {
        setError(
          data.error ||
            'Failed to request password reset'
        );
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to request password reset'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================
  // VERIFY TOKEN
  // ============================================

  const handleVerifyToken = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const response = await fetch(
        '/api/auth/verify-reset-token',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            token,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setSuccess(
          'Reset code verified successfully.'
        );

        setTimeout(() => {
          setStep('reset');
          setSuccess('');
        }, 1000);
      } else {
        setError(data.error || 'Invalid reset code');
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to verify reset code'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================
  // RESET PASSWORD
  // ============================================

  const handleResetPassword = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError(
        'Password must be at least 6 characters long'
      );
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        '/api/auth/reset-password',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            token,
            newPassword,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setSuccess(
          data.message ||
            'Password reset successfully.'
        );

        setTimeout(() => {
          onSwitchToLogin();
        }, 2000);
      } else {
        setError(
          data.error || 'Failed to reset password'
        );
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to reset password'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================
  // STEP TITLE / DESCRIPTION
  // ============================================

  const stepContent = {
    request: {
      title: 'Forgot Password?',
      description:
        'Enter your email address to request a password reset code.',
    },
    verify: {
      title: 'Enter Reset Code',
      description:
        'Enter the 6-digit reset code provided by the administrator.',
    },
    reset: {
      title: 'Create New Password',
      description:
        'Choose a new password to secure your account.',
    },
  };

  const currentStep = stepContent[step];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md mx-auto"
    >
      <div className={cardClassName}>
        <AuthHeader
          title={currentStep.title}
          description={currentStep.description}
        />

        {/* ========================================
            RESET PROGRESS
        ======================================== */}

        <div className="mb-7">
          <div className="flex items-center justify-between text-[11px] font-semibold text-[#8A9088] mb-2">
            <span
              className={
                step === 'request'
                  ? 'text-[#B98A3E]'
                  : ''
              }
            >
              Request
            </span>

            <span
              className={
                step === 'verify'
                  ? 'text-[#B98A3E]'
                  : ''
              }
            >
              Verify
            </span>

            <span
              className={
                step === 'reset'
                  ? 'text-[#B98A3E]'
                  : ''
              }
            >
              Reset
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <div
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                step === 'request' ||
                step === 'verify' ||
                step === 'reset'
                  ? 'bg-[#E8A33D]'
                  : 'bg-[#DADCD3]'
              }`}
            />

            <div
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                step === 'verify' ||
                step === 'reset'
                  ? 'bg-[#E8A33D]'
                  : 'bg-[#DADCD3]'
              }`}
            />

            <div
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                step === 'reset'
                  ? 'bg-[#E8A33D]'
                  : 'bg-[#DADCD3]'
              }`}
            />
          </div>
        </div>

        {/* ========================================
            REQUEST STEP
        ======================================== */}

        {step === 'request' && (
          <form
            onSubmit={handleRequestReset}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <label className={labelClassName}>
                <Mail className="w-4 h-4 text-[#8A9088]" />
                Email Address
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="your@email.com"
                className={inputClassName}
                autoComplete="email"
                required
              />
            </div>

            <AnimatePresence>
              {hasActiveToken && (
                <FeedbackMessage type="success">
                  You already have an active reset code.
                  Enter it below instead of requesting
                  another one.
                </FeedbackMessage>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {error && (
                <FeedbackMessage type="error">
                  {error}
                </FeedbackMessage>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {success && (
                <FeedbackMessage type="success">
                  <span>
                    <strong className="block mb-0.5">
                      Reset code requested
                    </strong>
                    A new reset token has been generated
                    for your account. Please contact the
                    administrator and let them know that
                    you have requested a new token so they
                    can send you the reset code immediately.
                  </span>
                </FeedbackMessage>
              )}
            </AnimatePresence>

            {hasActiveToken ? (
              <motion.button
                type="button"
                onClick={() => setStep('verify')}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 bg-[#E8A33D] hover:bg-[#F0B85C] rounded-lg font-bold text-[#12203B] transition-all duration-200 shadow-[0_4px_14px_rgba(232,163,61,0.25)] flex items-center justify-center gap-2"
              >
                <Key className="w-5 h-5" />
                <span>Enter Reset Code</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            ) : (
              <motion.button
                type="submit"
                disabled={
                  isLoading || isCheckingToken
                }
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className={primaryButtonClassName}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Requesting...</span>
                  </>
                ) : isCheckingToken ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Checking...</span>
                  </>
                ) : (
                  <>
                    <span>Request Reset Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            )}
          </form>
        )}

        {/* ========================================
            VERIFY STEP
        ======================================== */}

        {step === 'verify' && (
          <form
            onSubmit={handleVerifyToken}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <label className={labelClassName}>
                <Mail className="w-4 h-4 text-[#8A9088]" />
                Email Address
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="your@email.com"
                className={inputClassName}
                autoComplete="email"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className={labelClassName}>
                <Key className="w-4 h-4 text-[#8A9088]" />
                Reset Code
              </label>

              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={token}
                onChange={(e) =>
                  setToken(
                    e.target.value
                      .replace(/\D/g, '')
                      .slice(0, 6)
                  )
                }
                placeholder="000000"
                className={`${inputClassName} text-center text-2xl tracking-[0.35em] font-mono`}
                maxLength={6}
                required
              />

              <p className="text-[11px] text-[#8A9088]">
                Enter the 6-digit code provided by the
                administrator.
              </p>
            </div>

            <AnimatePresence>
              {error && (
                <FeedbackMessage type="error">
                  {error}
                </FeedbackMessage>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {success && (
                <FeedbackMessage type="success">
                  {success}
                </FeedbackMessage>
              )}
            </AnimatePresence>

            <ResetCodeNote email={email} />

            <motion.button
              type="submit"
              disabled={
                isLoading || token.length !== 6
              }
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className={primaryButtonClassName}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <span>Verify Code</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>

            <button
              type="button"
              onClick={() => setStep('request')}
              className="w-full py-2 text-[#8A9088] hover:text-[#12203B] text-sm transition-colors"
            >
              Back to Request
            </button>
          </form>
        )}

        {/* ========================================
            RESET STEP
        ======================================== */}

        {step === 'reset' && (
          <form
            onSubmit={handleResetPassword}
            className="space-y-4"
          >
            <div className="rounded-lg border border-[#DADCD3] bg-white p-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#E8A33D]/15 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-4 h-4 text-[#B98A3E]" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-[#12203B]">
                    Reset code verified
                  </p>

                  <p className="text-xs text-[#4B564C] leading-5 mt-1">
                    Your reset code has been verified.
                    Create a new password below to
                    complete the process.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className={labelClassName}>
                <Lock className="w-4 h-4 text-[#8A9088]" />
                New Password
              </label>

              <PasswordInput
                value={newPassword}
                onChange={(e) =>
                  setNewPassword(e.target.value)
                }
                placeholder="Min. 6 characters"
                name="newPassword"
                required
                minLength={6}
              />
            </div>

            <div className="space-y-1.5">
              <label className={labelClassName}>
                <Lock className="w-4 h-4 text-[#8A9088]" />
                Confirm Password
              </label>

              <PasswordInput
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                placeholder="Confirm new password"
                name="confirmPassword"
                required
                minLength={6}
              />
            </div>

            <AnimatePresence>
              {error && (
                <FeedbackMessage type="error">
                  {error}
                </FeedbackMessage>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {success && (
                <FeedbackMessage type="success">
                  {success}
                </FeedbackMessage>
              )}
            </AnimatePresence>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className={primaryButtonClassName}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Resetting...</span>
                </>
              ) : (
                <>
                  <span>Reset Password</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>

            <button
              type="button"
              onClick={() => setStep('verify')}
              className="w-full py-2 text-[#8A9088] hover:text-[#12203B] text-sm transition-colors"
            >
              Back to Verify
            </button>
          </form>
        )}

        {/* ========================================
            FOOTER
        ======================================== */}

        <p className="text-center text-sm text-[#4B564C] mt-6">
          Remember your password?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className={secondaryTextButtonClassName}
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

export default function AuthModal({
  isOpen,
  onClose,
  defaultType = 'login',
}: AuthModalProps) {
  const [type, setType] = useState<
    'login' | 'register' | 'forgot-password'
  >(defaultType);

  // ============================================
  // ESCAPE KEY
  // ============================================

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEsc);

    return () => {
      window.removeEventListener(
        'keydown',
        handleEsc
      );
    };
  }, [isOpen, onClose]);

  // ============================================
  // BODY SCROLL LOCK
  // ============================================

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

  // Reset modal type when reopened with a different default
  useEffect(() => {
    if (isOpen) {
      setType(defaultType);
    }
  }, [isOpen, defaultType]);

  if (!isOpen) {
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm"
        style={{ backgroundColor: 'rgba(13,24,44,0.72)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{
            scale: 0.95,
            opacity: 0,
            y: 20,
          }}
          animate={{
            scale: 1,
            opacity: 1,
            y: 0,
          }}
          exit={{
            scale: 0.95,
            opacity: 0,
            y: 20,
          }}
          transition={{
            duration: 0.3,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          className="relative w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ========================================
              CLOSE BUTTON
          ======================================== */}

          <motion.button
            type="button"
            whileHover={{
              scale: 1.1,
              rotate: 90,
            }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="absolute -top-12 right-0 text-white/70 hover:text-white transition-colors duration-200 z-10 p-2"
            aria-label="Close authentication dialog"
          >
            <X className="w-6 h-6" />
          </motion.button>

          {/* ========================================
              LOGIN / REGISTER TOGGLE — matches header's brass active state
          ======================================== */}

          {type !== 'forgot-password' && (
            <div className="flex justify-center mb-4">
              <div
                className="rounded-full p-1 border"
                style={{
                  backgroundColor: COLORS.navyDeep,
                  borderColor: 'rgba(232,163,61,0.28)',
                }}
              >
                <button
                  type="button"
                  onClick={() => setType('login')}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                    type === 'login'
                      ? 'bg-[#E8A33D] text-[#12203B] shadow-[0_4px_14px_rgba(232,163,61,0.35)]'
                      : 'text-white/65 hover:text-white'
                  }`}
                >
                  Sign In
                </button>

                <button
                  type="button"
                  onClick={() => setType('register')}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                    type === 'register'
                      ? 'bg-[#E8A33D] text-[#12203B] shadow-[0_4px_14px_rgba(232,163,61,0.35)]'
                      : 'text-white/65 hover:text-white'
                  }`}
                >
                  Register
                </button>
              </div>
            </div>
          )}

          {/* ========================================
              ACTIVE FORM
          ======================================== */}

          <AnimatePresence mode="wait">
            {type === 'login' ? (
              <LoginForm
                key="login"
                onClose={onClose}
                onSwitchToRegister={() =>
                  setType('register')
                }
                onSwitchToForgotPassword={() =>
                  setType('forgot-password')
                }
              />
            ) : type === 'register' ? (
              <RegisterForm
                key="register"
                onClose={onClose}
                onSwitchToLogin={() =>
                  setType('login')
                }
                onSwitchToForgotPassword={() =>
                  setType('forgot-password')
                }
              />
            ) : (
              <ForgotPasswordForm
                key="forgot-password"
                onClose={onClose}
                onSwitchToLogin={() =>
                  setType('login')
                }
              />
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}