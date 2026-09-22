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

export function OnlineUsers({ onlineUsers, currentUserId }: OnlineUsersProps) {
  // Ensure current user is included in the online users list
  const visibleUsers = currentUserId && !onlineUsers.some(u => u.userId === currentUserId)
    ? [
        {
          userId: currentUserId,
          firstName: 'You',
          lastName: '',
          fullName: 'You',
          image: null,
          techCenter: null,
          connectedAt: new Date().toISOString(),
        },
        ...onlineUsers,
      ]
    : onlineUsers;

  if (visibleUsers.length === 0) {
    return null;
  }

  // Show up to 3 users at once instead of cycling
  const displayUsers = visibleUsers.slice(0, 3);
  const additionalCount = Math.max(0, visibleUsers.length - 3);

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
          ONLINE USERS DISPLAY
      ============================================================ */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {displayUsers.map((user, index) => (
          <motion.div
            key={user.userId}
            initial={{ opacity: 0, scale: 0.8, x: -10 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{
              duration: 0.3,
              delay: index * 0.1,
              type: 'spring',
              stiffness: 300,
              damping: 20,
            }}
            className="
              flex items-center gap-2
              rounded-full
              border border-[#DADCD3]
              bg-[#F7F6F2]
              px-2 py-1.5
              shadow-[0_1px_2px_rgba(18,32,59,0.04)]
              sm:px-2.5
            "
          >
            {/* Avatar */}
            <div className="relative shrink-0">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={`${user.fullName || `${user.firstName} ${user.lastName}`} profile`}
                  width={26}
                  height={26}
                  unoptimized
                  className="h-6.5 w-6.5 rounded-full border border-white object-cover shadow-sm"
                />
              ) : (
                <div
                  className="flex h-6.5 w-6.5 items-center justify-center rounded-full border border-white bg-[#E8E9E3] text-[9px] font-semibold text-[#1A2B4C] shadow-sm"
                  aria-label={`${user.fullName || `${user.firstName} ${user.lastName}`} profile initials`}
                >
                  {(user.firstName?.charAt(0) || '')}{(user.lastName?.charAt(0) || '')}
                </div>
              )}
              {/* Online indicator */}
              <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full border-2 border-white bg-[#2F6B45]" aria-hidden="true" />
            </div>

            {/* User Info */}
            <div className="min-w-0 hidden sm:block">
              <p
                className="text-[10px] font-bold leading-tight truncate text-[#1A2B4C] sm:text-[11px]"
                title={user.fullName || `${user.firstName} ${user.lastName}`}
              >
                {user.fullName || `${user.firstName} ${user.lastName}`}
                {user.userId === currentUserId && (
                  <span className="ml-1.5 text-[8px] font-mono uppercase text-[#2F6B45]">(You)</span>
                )}
              </p>
              {user.techCenter && (
                <p
                  className="text-[8px] font-semibold leading-tight truncate text-[#5A6472] sm:text-[9px]"
                  title={user.techCenter.name}
                >
                  {user.techCenter.name}
                </p>
              )}
            </div>
          </motion.div>
        ))}

        {/* Additional users indicator */}
        {additionalCount > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="flex items-center justify-center w-7 h-7 rounded-full text-[9px] font-semibold border border-[#DADCD3] bg-[#F7F6F2] text-[#5A6472]"
          >
            +{additionalCount}
          </motion.div>
        )}
      </div>
    </div>
  );
}