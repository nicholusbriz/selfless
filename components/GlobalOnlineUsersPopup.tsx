'use client';

import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { useOnlineUsersContext } from '@/lib/contexts/OnlineUsersContext';
import { useAuth } from '@/lib/hooks/useAuth';
import VerifiedBadge from '@/components/VerifiedBadge';

export function GlobalOnlineUsersPopup() {
  const { onlineUsers } = useOnlineUsersContext();
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [onTriviaModal, setOnTriviaModal] = useState(false);
  const displayCount = onlineUsers.length;
  const currentUserId = user?.id;

  useEffect(() => {
    if (displayCount === 0) {
      setCurrentIndex(0);
      return;
    }
    setCurrentIndex((previous) => previous % displayCount);
  }, [displayCount]);

  useEffect(() => {
    const check = () =>
      setOnTriviaModal(document.body.dataset.triviaModal === 'open');
    check();
    const interval = window.setInterval(check, 800);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (displayCount <= 1) return;
    const interval = window.setInterval(() => {
      setCurrentIndex((previous) => (previous + 1) % displayCount);
    }, 5000);
    return () => window.clearInterval(interval);
  }, [displayCount]);

  if (displayCount === 0) return null;

  const onlineUser = onlineUsers[currentIndex];
  if (!onlineUser) return null;

  const displayName =
    onlineUser.fullName?.trim() ||
    `${onlineUser.firstName || ''} ${onlineUser.lastName || ''}`.trim() ||
    'User';

  const initials =
    `${onlineUser.firstName?.charAt(0) || ''}${onlineUser.lastName?.charAt(0) || ''}`.toUpperCase();

  const isCurrentUser = onlineUser.userId === currentUserId;
  const hasTechCenter = Boolean(onlineUser.techCenter?.name);

  return (
    <div
      className={cn(
        'fixed z-[120]',
        // Mobile - pushed further left
        'top-2 left-[35%] -translate-x-1/2 w-auto',
        // Desktop
        'sm:top-3 sm:left-[55%] sm:-translate-x-1/2 sm:w-auto'
      )}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={onlineUser.userId}
          initial={{ opacity: 0, x: -8, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 8, scale: 0.95 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            'flex items-start gap-1.5',
            onTriviaModal && 'rounded-xl bg-white/95 px-2 py-1.5 shadow-lg shadow-black/10 backdrop-blur'
          )}
        >
          {/* Avatar */}
          <div className="relative shrink-0 mt-0.5">
            {onlineUser.image ? (
              <Image
                src={onlineUser.image}
                alt={displayName}
                width={24}
                height={24}
                unoptimized
                className={cn(
                  'h-6 w-6 rounded-full object-cover',
                  'border-2 border-white shadow-sm',
                  isCurrentUser && 'ring-1 ring-[#B98A3E]/60'
                )}
              />
            ) : (
              <div
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full',
                  'border-2 border-white bg-[#E8E9E3]',
                  'text-[8px] font-bold text-[#12203B] shadow-sm',
                  isCurrentUser && 'ring-1 ring-[#B98A3E]/60'
                )}
              >
                {initials || '?'}
              </div>
            )}
            {/* Online dot */}
            <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border-[1.5px] border-white bg-[#55705B]" />
          </div>

          {/* Text Block - 3 rows max */}
          <div className="min-w-0 flex flex-col leading-tight">
            {/* Row 1: Full Name (no break, no truncate) */}
            <p className={cn("text-[8px] font-bold whitespace-nowrap", onTriviaModal ? "text-[#12203B]" : "text-[#8B6914]")}>
              {displayName}{onlineUser.hasVerifiedBadge && (<VerifiedBadge className="ml-0.5 inline h-2.5 w-2.5 align-[-1px]" />)}
            </p>

            {/* Row 2: Online Status */}
            <p className="text-[7px] font-medium text-[#55705B]">
              Online
            </p>

            {/* Row 3: Tech Center (only if exists) */}
            {hasTechCenter && (
              <p className="text-[7px] text-black whitespace-nowrap">
                {onlineUser.techCenter?.name}
              </p>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}