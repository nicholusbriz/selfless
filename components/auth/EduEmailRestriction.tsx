'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { getApiErrorMessage, readJsonObject } from '@/lib/api-response';

const COLORS = {
  navy: '#12203B',
  brass: '#B98A3E',
  brassLight: '#E8A33D',
  white: '#FFFFFF',
  softWhite: '#F7F6F2',
  page: '#F1F1EC',
  border: '#DADCD3',
  muted: '#6B7268',
};

const cardClassName =
  'bg-[#F1F1EC] rounded-2xl border border-[#DADCD3] p-6 sm:p-8 max-h-[90vh] overflow-y-auto relative shadow-[0_24px_60px_rgba(13,24,44,0.35)]';

const inputClassName =
  'w-full px-4 py-3 bg-white border border-[#DADCD3] rounded-lg text-[#12203B] placeholder-[#8A9088] focus:outline-none focus:ring-2 focus:ring-[#E8A33D]/35 focus:border-[#E8A33D] transition-all duration-200';

const primaryButtonClassName =
  'w-full py-3 bg-[#E8A33D] hover:bg-[#F0B85C] rounded-lg font-bold text-[#12203B] transition-all duration-200 shadow-[0_4px_14px_rgba(232,163,61,0.25)] hover:shadow-[0_6px_20px_rgba(232,163,61,0.35)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2';

interface EduEmailRestrictionProps {
  eduEmail: string;
  onClose?: () => void;
}

export default function EduEmailRestriction({ eduEmail, onClose }: EduEmailRestrictionProps) {
  const router = useRouter();
  const [personalEmail, setPersonalEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValidFormat = emailRegex.test(personalEmail);
    const domain = personalEmail.split('@')[1]?.toLowerCase();

    if (!isValidFormat) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    if (domain !== 'gmail.com') {
      setError('Please enter your personal email with @gmail.com');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/user/update-personal-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ personalEmail }),
      });

      const data = await readJsonObject(response);

      if (response.ok) {
        // Success - redirect to dashboard
        if (onClose) onClose();
        router.push('/dashboard');
        router.refresh();
      } else {
        setError(getApiErrorMessage(data, 'Failed to update email'));
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
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
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#E8A33D] to-[#B98A3E] p-[2px] shadow-[0_8px_24px_rgba(232,163,61,0.28)] mx-auto mb-4">
            <div className="w-full h-full rounded-2xl bg-[#12203B] flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-[#E8A33D]" />
            </div>
          </div>

          <h2
            className="text-2xl font-bold text-[#12203B]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Email Restriction
          </h2>

          <p className="text-[#4B564C] text-sm mt-1.5 leading-5">
            Please update your login email to a personal Gmail address
          </p>
        </div>

        {/* Info Box */}
        <div className="rounded-lg border border-[#E8A33D]/30 bg-[#E8A33D]/10 p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#E8A33D] flex-shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[#12203B]">
                Email Update Required
              </p>
              <p className="text-xs text-[#4B564C] leading-5 mt-1.5">
                Your .edu email ({eduEmail}) will be saved for reference, and your Gmail address will become your new login email for all platform access.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-[#12203B] flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#8A9088]" />
              New Login Email (Gmail)
            </label>

            <input
              type="email"
              value={personalEmail}
              onChange={(e) => setPersonalEmail(e.target.value)}
              placeholder="your@gmail.com"
              className={inputClassName}
              autoComplete="email"
              required
            />

            {error && (
              <p className="text-xs text-[#B23A3A] mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {error}
              </p>
            )}
          </div>

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
                <span>Saving...</span>
              </>
            ) : (
              <>
                <span>Continue to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </form>

        <p className="text-center text-xs text-[#6B7268] mt-6">
          Your Gmail will become your primary login email
        </p>
      </div>
    </motion.div>
  );
}
