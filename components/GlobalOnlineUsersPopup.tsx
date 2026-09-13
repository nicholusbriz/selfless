'use client';

import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import type { OnlineUser } from '@/lib/hooks/useOnlineUsers';

interface GlobalOnlineUsersPopupProps {
  onlineUsers: OnlineUser[];
  currentUserId?: string;
}

export function GlobalOnlineUsersPopup({
  onlineUsers,
  currentUserId,
}: GlobalOnlineUsersPopupProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const displayCount = onlineUsers.length;

  useEffect(() => {
    if (displayCount === 0) {
      setCurrentIndex(0);
      return;
    }
    setCurrentIndex((previous) => previous % displayCount);
  }, [displayCount]);

  useEffect(() => {
    if (displayCount <= 1) return;
    const interval = window.setInterval(() => {
      setCurrentIndex((previous) => (previous + 1) % displayCount);
    }, 5000);
    return () => window.clearInterval(interval);
  }, [displayCount]);

  if (displayCount === 0) return null;

  const user = onlineUsers[currentIndex];
  if (!user) return null;

  const displayName =
    user.fullName?.trim() ||
    `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
    'User';

  const initials =
    `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase();

  const isCurrentUser = user.userId === currentUserId;
  const hasTechCenter = Boolean(user.techCenter?.name);

  return (
    <div
      className={cn(
        'fixed z-[100]',
        // Mobile - pushed further left
        'top-2 left-[30%] -translate-x-1/2 w-auto',
        // Desktop
        'sm:top-3 sm:left-1/2 sm:-translate-x-1/2 sm:w-auto'
      )}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={user.userId}
          initial={{ opacity: 0, x: -8, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 8, scale: 0.95 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-start gap-1.5"
        >
          {/* Avatar */}
          <div className="relative shrink-0 mt-0.5">
            {user.image ? (
              <Image
                src={user.image}
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
            <p className="text-[9px] font-semibold text-[#12203B] whitespace-nowrap">
              {displayName}
            </p>

            {/* Row 2: Online Status */}
            <p className="text-[7px] font-medium text-[#55705B]">
              Online
            </p>

            {/* Row 3: Tech Center (only if exists) */}
            {hasTechCenter && (
              <p className="text-[7px] text-[#8A9088] whitespace-nowrap">
                {user.techCenter?.name}
              </p>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}