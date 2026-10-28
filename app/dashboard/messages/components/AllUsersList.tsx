'use client';

import { Users } from 'lucide-react';
import Image from 'next/image';
import { MapPin } from 'lucide-react';
import type { User } from '@/types/messaging';

interface AllUsersListProps {
  users: User[];
  isLoading: boolean;
  onlineUserIds: Set<string>;
  onUserClick: (user: User) => void;
  searchQuery: string;
}

export function AllUsersList({
  users,
  isLoading,
  onlineUserIds,
  onUserClick,
  searchQuery,
}: AllUsersListProps) {
  if (isLoading) {
    return (
      <div className="divide-y divide-[#EEF1F5]">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3 animate-pulse">
            <div className="w-12 h-12 rounded-full bg-[#F7F9FC]" />
            <div className="flex-1">
              <div className="h-4 w-32 bg-[#F7F9FC] rounded" />
              <div className="h-3 w-24 bg-[#F7F9FC] rounded mt-1" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="py-16 text-center">
        <Users className="mx-auto w-12 h-12 text-[#A0AEC0]" strokeWidth={1.5} />
        <p className="mt-3 text-sm text-[#4A5568]">No users found</p>
        {searchQuery && (
          <p className="text-xs text-[#718096] mt-1">Try a different search term</p>
        )}
      </div>
    );
  }

  return (
    <div className="divide-y divide-[#EEF1F5]">
      {users.map((user) => {
        const fullName = `${user.firstName} ${user.lastName}`.trim() || 'Unknown User';
        const initials = fullName
          .split(/\s+/)
          .slice(0, 2)
          .map((part) => part.charAt(0))
          .join('')
          .toUpperCase() || '?';
        const isOnline = onlineUserIds.has(user.id);

        return (
          <div
            key={user.id}
            onClick={() => onUserClick(user)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onUserClick(user);
              }
            }}
            role="button"
            tabIndex={0}
            aria-label={`Start chat with ${fullName}`}
            className="group flex cursor-pointer items-center gap-3 px-4 py-3.5 transition-colors hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#B98A3E] focus:ring-inset sm:px-6"
          >
            {/* Avatar */}
            {user?.image ? (
              <Image
                src={user.image}
                alt={fullName}
                width={48}
                height={48}
                unoptimized
                className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-[#F0F2F5]"
              />
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#1A2B4C]">
                <span className="text-sm font-semibold text-white">
                  {initials}
                </span>
              </div>
            )}

            {/* User Info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <h3 className="truncate text-sm font-semibold text-[#26354D]">
                    {fullName}
                  </h3>
                  <span className={`flex shrink-0 items-center gap-1 text-[10px] font-medium ${isOnline ? 'text-[#3F8F5B]' : 'text-[#8791A1]'}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${isOnline ? 'bg-[#3F8F5B]' : 'bg-[#A0AEC0]'}`} />
                    {isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>
              <div className="mt-1 flex items-center gap-1 text-xs text-[#788397]">
                <MapPin className="h-3 w-3 text-[#A0A9B6]" strokeWidth={2} />
                <span className="truncate">
                  {user.techCenter?.name || 'No location'}
                </span>
              </div>
            </div>

          </div>
        );
      })}
    </div>
  );
}
