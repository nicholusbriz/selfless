'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Calendar, User, Plus } from 'lucide-react';
import axios from '@/lib/axios';
import { useRouter } from 'next/navigation';
import LoadingState from '@/components/shared/LoadingState';
import ErrorState from '@/components/shared/ErrorState';
import UserAvatar from '@/components/shared/UserAvatar';
import { useWebSocketEvent } from '@/hooks/useWebSocket';

interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profileImageUrl?: string;
  };
}

export default function AnnouncementsTab() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: announcementsData, isLoading, error } = useQuery({
    queryKey: ['announcements'],
    queryFn: async () => {
      const response = await axios.get('/api/announcements');
      return response.data;
    }
  });

  // Listen for new announcements via WebSocket
  useWebSocketEvent<Announcement>('announcement:created', (newAnnouncement) => {
    queryClient.setQueryData(['announcements'], (oldData: any) => {
      if (!oldData) return { announcements: [newAnnouncement] };
      return {
        announcements: [newAnnouncement, ...oldData.announcements]
      };
    });
  });

  const announcements = announcementsData?.announcements || [];

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (isLoading) return <LoadingState type="students" />;

  if (error) {
    return (
      <div className="text-center py-12">
        <Bell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400">Failed to load announcements</p>
      </div>
    );
  }

  if (announcements.length === 0) {
    return (
      <div className="text-center py-12">
        <Bell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-300 mb-2">No Announcements</h3>
        <p className="text-gray-400">There are no announcements at the moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Announcements</h2>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">{announcements.length} announcements</span>
          <button
            onClick={() => router.push('/dashboard/student')}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Announcement
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {announcements.map((announcement: Announcement) => {
          const isExpanded = expandedId === announcement.id;
          
          return (
            <motion.div
              key={announcement.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`border rounded-xl overflow-hidden transition-all duration-300 bg-white/5 border-white/10 ${
                isExpanded ? 'shadow-lg' : ''
              }`}
            >
              <button
                onClick={() => toggleExpand(announcement.id)}
                className="w-full p-4 text-left hover:bg-white/5 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <UserAvatar user={announcement.author} size="sm" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white mb-1">
                      {announcement.title}
                    </h3>
                    
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        {announcement.author.firstName} {announcement.author.lastName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(announcement.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </motion.div>
                  </div>
                </div>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pt-0">
                      <div className="pt-4 border-t border-white/10">
                        <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                          {announcement.content}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
