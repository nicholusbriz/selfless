'use client';

import { Users, MapPin, MessageSquare, Search } from 'lucide-react';
import Image from 'next/image';
import type { User } from '@/types/messaging';
import VerifiedBadge from '@/components/VerifiedBadge';

interface AllUsersListProps {
  users: User[];
  isLoading: boolean;
  onlineUserIds: Set<string>;
  onUserClick: (user: User) => void;
  searchQuery: string;
}

function initialsOf(name: string): string {
  return (
    name
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p.charAt(0))
      .join('')
      .toUpperCase() || '?'
  );
}

function getRoleLabel(roleName?: string | null, displayName?: string | null) {
  const normalizedRole = roleName?.toLowerCase();

  if (!normalizedRole) return displayName || null;
  if (normalizedRole === 'super_admin' || normalizedRole === 'superadmin') {
    return 'Director';
  }
  if (normalizedRole === 'teacher') return 'Tutor';
  if (normalizedRole === 'admin') return 'Manager';
  if (normalizedRole === 'dev') return 'Selfless Support';

  return displayName || normalizedRole.replace(/_/g, ' ');
}

export function AllUsersList({
  users,
  isLoading,
  onlineUserIds,
  onUserClick,
  searchQuery,
}: AllUsersListProps) {
  /* ── Loading ── */
  if (isLoading) {
    return (
      <div className="divide-y divide-[#f1f5f9]">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex animate-pulse items-center gap-3 px-3 py-2.5"
          >
            <div className="h-10 w-10 shrink-0 rounded-full bg-[#f1f5f9]" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-1/3 rounded bg-[#f1f5f9]" />
              <div className="h-3 w-1/2 rounded bg-[#f1f5f9]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  /* ── Empty ── */
  if (users.length === 0) {
    return (
      <div className="px-4 py-12 text-center">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#f1f5f9] text-[#94a3b8]">
          {searchQuery ? (
            <Search className="h-5 w-5" strokeWidth={1.8} />
          ) : (
            <Users className="h-5 w-5" strokeWidth={1.8} />
          )}
        </div>
        <p className="mt-3 text-sm font-semibold text-[#0f172a]">
          {searchQuery ? 'No results' : 'No people available'}
        </p>
        <p className="mx-auto mt-1 max-w-[220px] text-xs leading-5 text-[#64748b]">
          {searchQuery
            ? `No one matches "${searchQuery}". Try a different name, email, or tech center.`
            : 'People in your tech center will appear here.'}
        </p>
      </div>
    );
  }

  /* ── List ── */
  return (
    <div className="divide-y divide-[#f1f5f9]">
      {users.map((user) => {
        const fullName =
          `${user.firstName} ${user.lastName}`.trim() || 'Unknown User';
        const initials = initialsOf(fullName);
        const isOnline = onlineUserIds.has(user.id);
        const roleLabel = getRoleLabel(user.roleName, user.roleDisplayName);

        return (
          <button
            key={user.id}
            type="button"
            onClick={() => onUserClick(user)}
            aria-label={`Start chat with ${fullName}${
              isOnline ? ', online' : ''
            }`}
            className="group relative flex w-full items-center gap-3 px-3 py-2.5 text-left transition hover:bg-[#f8fafc] focus-visible:bg-[#f8fafc] focus-visible:outline-none"
          >
            {/* Avatar with online dot */}
            <div className="relative shrink-0">
              {user.image ? (
                <Image
                  src={user.image}
                  alt=""
                  width={40}
                  height={40}
                  unoptimized
                  className="h-10 w-10 rounded-full object-cover ring-1 ring-[#f1f5f9]"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1a365d] text-[11px] font-bold text-white">
                  {initials}
                </div>
              )}
              {isOnline && (
                <span
                  aria-label="Online"
                  className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500"
                />
              )}
            </div>

            {/* Body */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <h3 className="min-w-0 truncate text-sm font-semibold text-[#0f172a]">
                  {fullName}
                </h3>
                {user.hasVerifiedBadge && (
                  <VerifiedBadge className="h-3 w-3 shrink-0" />
                )}
                {roleLabel && (
                  <span className="ml-1 shrink-0 rounded bg-[#f1f5f9] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#64748b]">
                    {roleLabel}
                  </span>
                )}
              </div>

              {user.techCenter?.name && (
                <div className="mt-0.5 flex items-center gap-1.5 text-[11px]">
                  <MapPin
                    className="h-3 w-3 shrink-0 text-[#94a3b8]"
                    strokeWidth={2}
                  />
                  <span className="truncate text-[#64748b]">
                    {user.techCenter.name}
                  </span>
                </div>
              )}
            </div>

            {/* Hover action */}
            <span
              aria-hidden="true"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[#94a3b8] opacity-0 transition group-hover:bg-[#eef2f8] group-hover:text-[#1a365d] group-hover:opacity-100 group-focus-visible:bg-[#eef2f8] group-focus-visible:text-[#1a365d] group-focus-visible:opacity-100"
            >
              <MessageSquare className="h-3.5 w-3.5" />
            </span>
          </button>
        );
      })}
    </div>
  );
}