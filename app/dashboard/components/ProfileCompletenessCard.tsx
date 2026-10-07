'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  Play,
  Pause,
  CheckCircle2,
} from 'lucide-react';
import { checkProfileCompleteness } from '@/lib/profile-completeness';

interface DashboardAnnouncementsProps {
  user: any;
  inHeader?: boolean;
}

type StaticAnnouncement = {
  kind: 'static';
  id: string;
  label: string;
  title: string;
  body: string;
  warning?: string;
  cta?: { label: string; href: string };
  signoff?: string;
};

type ProfileSlide = { kind: 'profile'; id: 'profile' };
type Slide = StaticAnnouncement | ProfileSlide;

const STATIC_SLIDES: StaticAnnouncement[] = [
  {
    kind: 'static',
    id: 'welcome',
    label: 'Announcement',
    title: 'Welcome to the Official SELFLESS CE Student Portal',
    body: 'To help you connect with fellows across the entire SELFLESS CE community, please update your profile image immediately upon your first login.',
    warning: 'Accounts without a profile picture may not be verified.',
    cta: { label: 'Update Profile Image', href: '/dashboard/profile' },
    signoff: 'Thank you for your understanding.',
  },
  {
    kind: 'static',
    id: 'assignments',
    label: 'Reminder',
    title: 'Finish and Submit Your Assignments on Time',
    body: 'As we look forward to closing the term, make sure you finish and submit your assignments on time.',
    warning: 'Remember: our minimum GPA is 3.0.',
    signoff: 'Stay focused and finish strong.',
  },
  {
    kind: 'static',
    id: 'portal',
    label: 'Important',
    title: 'This Is the Official Student Portal',
    body: 'Get familiar with it starting next block. Each tech center will be operating on this platform. You will be able to register for your cleaning participation days, submit the course units you are taking this block, and submit the tuition you are demanded.',
    warning: 'The core feature of this platform is for you to interact, connect, and seek advice.',
    signoff: 'Make the most of it.',
  },
];

const AUTO_SCROLL_MS = 5000;
const PROFILE_SLIDE_MS = 7000;

export default function DashboardAnnouncements({
  user,
  inHeader = false,
}: DashboardAnnouncementsProps) {
  // ---- Profile completeness (shared by top card AND slide 4) ----
  const completeness = checkProfileCompleteness(user);
  const { completionPercentage, missingFields, isComplete } = completeness;

  const getStatusColor = () => {
    if (completionPercentage >= 80) return '#55705B';
    if (completionPercentage >= 50) return '#B98A3E';
    return '#A4462F';
  };

  const getStatusText = () => {
    if (isComplete) return 'Complete!';
    if (completionPercentage >= 80) return 'Almost there';
    if (completionPercentage >= 50) return 'In progress';
    return 'Just started';
  };

  const highPriorityFields = missingFields.filter((f) => f.priority === 'high');
  const mediumPriorityFields = missingFields.filter((f) => f.priority === 'medium');

  // ---- Carousel state ----
  const slides: Slide[] = [...STATIC_SLIDES, { kind: 'profile', id: 'profile' }];
  const total = slides.length;

  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progressKey, setProgressKey] = useState(0);

  const current = slides[index];
  const currentDuration = current.kind === 'profile' ? PROFILE_SLIDE_MS : AUTO_SCROLL_MS;

  const goTo = useCallback(
    (next: number) => {
      setIndex(((next % total) + total) % total);
      setProgressKey((k) => k + 1);
    },
    [total]
  );

  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  useEffect(() => {
    if (isPaused) return;
    const t = setTimeout(() => next(), currentDuration);
    return () => clearTimeout(t);
  }, [index, isPaused, next, progressKey, currentDuration]);

  const handleCta = (href: string) => {
    window.location.href = href;
  };

  /* ============================================================
     HEADER VARIANT (dark, compact) - no longer used
     ============================================================ */
  if (inHeader) {
    return null;
  }

  /* ============================================================
     MAIN CONTENT VARIANT (light, flat, compact)
     ============================================================ */
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-[#E5E7EB] bg-white rounded-xl p-4 shadow-sm"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-[14px] font-bold text-[#1A2B4C]">Profile Completion</h3>
          <p className="text-[10px] text-[#6B7280] mt-0.5">{getStatusText()}</p>
        </div>
        <span
          className="font-mono text-xl font-black tabular-nums"
          style={{ color: getStatusColor() }}
        >
          {completionPercentage}%
        </span>
      </div>

      <div className="mb-3">
        <div className="h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${completionPercentage}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ backgroundColor: getStatusColor() }}
          />
        </div>
      </div>

      {!isComplete && (
        <div className="space-y-1.5 mb-3">
          {highPriorityFields.length > 0 && (
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wider text-[#A4462F] mb-1">
                Important
              </p>
              {highPriorityFields.slice(0, 2).map((field) => (
                <div
                  key={field.field}
                  className="flex items-center gap-2 text-[11px] text-[#1A2B4C]"
                >
                  <AlertCircle className="w-3 h-3 text-[#A4462F] flex-shrink-0" />
                  <span className="truncate">{field.label}</span>
                </div>
              ))}
            </div>
          )}
          {mediumPriorityFields.length > 0 && highPriorityFields.length === 0 && (
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wider text-[#B98A3E] mb-1">
                Recommended
              </p>
              {mediumPriorityFields.slice(0, 2).map((field) => (
                <div
                  key={field.field}
                  className="flex items-center gap-2 text-[11px] text-[#1A2B4C]"
                >
                  <AlertCircle className="w-3 h-3 text-[#B98A3E] flex-shrink-0" />
                  <span className="truncate">{field.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {isComplete && (
        <div className="flex items-center gap-2 py-1.5 px-3 bg-[#55705B]/10 rounded-lg mb-3">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#55705B]" />
          <span className="text-[11px] font-medium text-[#55705B]">
            Your profile is complete!
          </span>
        </div>
      )}

      <button
        onClick={() => handleCta('/dashboard/profile')}
        className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-[12px] font-bold text-white transition-all hover:-translate-y-px active:translate-y-px"
        style={{ backgroundColor: isComplete ? '#1A2B4C' : getStatusColor() }}
      >
        {isComplete ? 'View Profile' : 'Complete Profile'}
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}