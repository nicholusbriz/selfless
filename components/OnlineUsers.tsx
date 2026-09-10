'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';

interface OnlineUser {
  userId: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  image?: string | null;
  techCenter?: {
    id: string;
    name: string;
  };
  connectedAt: string;
}

interface OnlineUsersProps {
  onlineUsers: OnlineUser[];
  currentUserId?: string;
}

export function OnlineUsers({ onlineUsers }: OnlineUsersProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const visibleUsers = onlineUsers;

  // Keep cycling through connected users every 5 seconds.
  useEffect(() => {
    if (visibleUsers.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % visibleUsers.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [visibleUsers.length]);

  if (visibleUsers.length === 0) {
    return null;
  }

  const currentUser =
    visibleUsers[Math.min(currentIndex, visibleUsers.length - 1)];

  const displayName =
    currentUser.fullName?.trim() ||
    `${currentUser.firstName} ${currentUser.lastName}`.trim();

  const initials = `${currentUser.firstName?.charAt(0) || ''}${
    currentUser.lastName?.charAt(0) || ''
  }`.toUpperCase();

  const techCenterName = currentUser.techCenter?.name?.trim();

  return (
    <div
      className="
        ml-2 flex min-w-0 max-w-[calc(100vw-168px)] overflow-hidden
        items-center gap-2
        border-l border-[#DADCD3]
        pl-2
        sm:ml-3 sm:max-w-[460px] sm:gap-3 sm:pl-3
      "
    >
      {/* ============================================================
          CURRENT ONLINE USER
      ============================================================ */}
      <div className="min-w-0 flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentUser.userId}
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 4 }}
            transition={{
              duration: 0.2,
              ease: 'easeOut',
            }}
            className="
              flex h-10 min-w-0 max-w-full items-center gap-2
              rounded-full
              border border-[#DADCD3]
              bg-[#F7F6F2]
              px-2 py-1.5
              shadow-[0_1px_2px_rgba(18,32,59,0.04)]
              sm:px-2.5
            "
          >
            {/* ========================================================
                AVATAR
            ======================================================== */}
            <div className="relative shrink-0 self-center">
              {currentUser.image ? (
                <Image
                  src={currentUser.image}
                  alt={`${displayName} profile`}
                  width={28}
                  height={28}
                  unoptimized
                  className="
                    h-7 w-7 rounded-full
                    border border-white
                    object-cover
                    shadow-sm
                  "
                />
              ) : (
                <div
                  className="
                    flex h-7 w-7 items-center justify-center
                    rounded-full
                    border border-white
                    bg-[#E8E9E3]
                    text-[9px] font-semibold
                    text-[#12203B]
                    shadow-sm
                  "
                  aria-label={`${displayName} profile initials`}
                >
                  {initials || '?'}
                </div>
              )}

              {/* Online indicator */}
              <span
                className="
                  absolute bottom-0 right-0
                  h-2.5 w-2.5
                  rounded-full
                  border-2 border-white
                  bg-[#3F8F5B]
                "
                aria-hidden="true"
              />
            </div>

            {/* ========================================================
                USER INFORMATION
                Names are NEVER truncated.
            ======================================================== */}
            <div className="min-w-0 flex-1 overflow-hidden py-0.5 leading-tight">
              {/* Name and status */}
              <div className="flex min-w-0 items-center gap-1.5 whitespace-nowrap">
                <p
                  className="
                    min-w-0 flex-1 overflow-x-auto whitespace-nowrap
                    [scrollbar-width:none]
                    text-[9px] font-semibold
                    leading-[1.25]
                    text-[#12203B]
                    sm:text-[10px]
                    md:text-[11px]
                  "
                  title={displayName}
                >
                  {displayName}
                </p>
                <span className="inline-flex shrink-0 items-center gap-1 text-[8px] font-semibold leading-none text-[#3F8F5B] sm:text-[9px]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#3F8F5B]" aria-hidden="true" />
                  Online
                </span>
              </div>

              {/* ======================================================
                  TECH CENTER
                  Only shown when available.
              ====================================================== */}
              {techCenterName && (
                <p
                  className="
                    mt-0.5 overflow-x-auto whitespace-nowrap
                    [scrollbar-width:none]
                    text-[7px]
                    font-medium
                    leading-[1.25]
                    tracking-[0.05em]
                    text-[#8A9088]
                    sm:text-[8px]
                    md:text-[9px]
                  "
                  title={techCenterName}
                >
                  {techCenterName}
                </p>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

