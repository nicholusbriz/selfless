'use client';

import { Users, MessageSquare } from 'lucide-react';
import Image from 'next/image';
import { MapPin } from 'lucide-react';
import type { User } from '@/types/messaging';

interface AllUsersListProps {
  users: User[];
  isLoading: boolean;
  onlineUserIds: Set<string>;
  getConversationForUser: (userId: string) => any;
  onUserClick: (user: User) => void;
  searchQuery: string;
}

export function AllUsersList({
  users,
  isLoading,
  onlineUserIds,
  getConversationForUser,
  onUserClick,
  searchQuery,
}: AllUsersListProps) {
  if (isLoading) {
    return (
      <div className="divide-y divide-[#F7F9FC]">
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
    <div className="divide-y divide-[#F7F9FC]">
      {users.map((user) => {
        const fullName = `${user.firstName} ${user.lastName}`;
        const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
        const hasConversation = getConversationForUser(user.id);
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
            aria-label={`Start chat with ${fullName}${hasConversation ? ', conversation exists' : ''}`}
            className="flex items-center gap-3 px-4 py-3 hover:bg-[#F7FAFC] cursor-pointer transition-colors group focus:outline-none focus:ring-2 focus:ring-[#3182CE] focus:ring-inset"
          >
            {/* Avatar */}
            {user?.image ? (
              <Image
                src={user.image}
                alt={fullName}
                width={48}
                height={48}
                unoptimized
                className="w-12 h-12 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-12 h-12 flex items-center justify-center bg-[#1A365D] rounded-full flex-shrink-0">
                <span className="text-white text-sm font-medium">
                  {initials}
                </span>
              </div>
            )}

            {/* User Info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <h3 className="truncate text-sm font-medium text-[#1A365D]">
                    {fullName}
                  </h3>
                  <span className={`flex shrink-0 items-center gap-1 text-[10px] font-medium ${isOnline ? 'text-[#3F8F5B]' : 'text-[#8A9088]'}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${isOnline ? 'bg-[#3F8F5B]' : 'bg-[#A0AEC0]'}`} />
                    {isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
                {hasConversation && (
                  <span className="text-xs text-[#2C5282] bg-[#EBF8FF] px-2 py-0.5 rounded-full">
                    Chat
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-[#4A5568]">
                <MapPin className="w-3 h-3 text-[#3182CE]" strokeWidth={2} />
                <span className="truncate">
                  {user.techCenter?.name || 'No location'}
                </span>
              </div>
            </div>

            {/* Message button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUserClick(user);
              }}
              className="p-2 bg-[#1A365D] text-white rounded-full hover:bg-[#153475] transition-colors opacity-0 group-hover:opacity-100"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
