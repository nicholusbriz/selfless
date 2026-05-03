'use client';

import { useState, useEffect } from 'react';
import { useAnnouncements } from '@/hooks/announcementHooks';

interface NotificationsIconProps {
  onClick?: () => void;
  className?: string;
  forceClose?: boolean; // New prop to force close dropdown
}

export default function NotificationsIcon({ onClick, className = '', forceClose = false }: NotificationsIconProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: announcements = [] } = useAnnouncements();

  // Close dropdown when forceClose is true
  const shouldCloseDropdown = forceClose;
  useEffect(() => {
    if (shouldCloseDropdown) {
      setIsOpen(false);
    }
  }, [shouldCloseDropdown]);

  // Count unread announcements (you can modify this logic based on your read/unread tracking)
  const unreadCount = announcements.length;

  const handleClick = () => {
    setIsOpen(!isOpen);
    if (onClick) onClick();
  };

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        className={`relative p-2 text-white hover:text-cyan-200 transition-colors ${className}`}
        title="Announcements"
      >
        {/* Bell Icon */}
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Notification Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Preview (Optional - shows recent announcements) */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Announcements ({unreadCount})</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {announcements.length > 0 ? (
              announcements.slice(0, 5).map((announcement) => (
                <div
                  key={announcement.id}
                  className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    // You can navigate to full announcement or scroll to it
                    setIsOpen(false);
                  }}
                >
                  <h4 className="font-medium text-gray-900 text-sm mb-1">
                    {announcement.title}
                  </h4>
                  <p className="text-gray-600 text-xs line-clamp-2">
                    {announcement.content}
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    {new Date(announcement.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">
                <p>No announcements</p>
              </div>
            )}
          </div>
          {announcements.length > 5 && (
            <div className="p-3 border-t border-gray-200">
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View all announcements →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
