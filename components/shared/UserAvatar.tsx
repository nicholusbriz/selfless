'use client';

import { User } from 'lucide-react';

interface UserAvatarProps {
  user?: {
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string;
  };
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function UserAvatar({ user, size = 'md', className = '' }: UserAvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-lg',
    lg: 'w-20 h-20 sm:w-24 sm:h-24 text-2xl sm:text-3xl'
  };

  if (user?.profileImageUrl) {
    return (
      <img 
        src={user.profileImageUrl} 
        alt={`${user.firstName} ${user.lastName}`}
        className={`${sizeClasses[size]} rounded-full object-cover shadow-lg ${className}`}
      />
    );
  }

  const initials = `${user?.firstName?.charAt(0) || ''}${user?.lastName?.charAt(0) || ''}`;

  return (
    <div className={`${sizeClasses[size]} bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg ${className}`}>
      {initials || <User className="w-1/2 h-1/2" />}
    </div>
  );
}
