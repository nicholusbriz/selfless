'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Calendar, User, Plus, ChevronDown, Megaphone } from 'lucide-react';
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
  const handleNewAnnouncement = useCallback((newAnnouncement: Announcement) => {
    queryClient.setQueryData(['announcements'], (oldData: any) => {
      if (!oldData) return { announcements: [newAnnouncement] };
      return {
        announcements: [newAnnouncement, ...oldData.announcements]
      };
    });
  }, [queryClient]);

  useWebSocketEvent<Announcement>('announcement:created', handleNewAnnouncement);

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
        <Megaphone className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-300 mb-2">No Announcements</h3>
        <p className="text-gray-400">There are no announcements at the moment.</p>
        <button
          onClick={() => router.push('/dashboard/student')}
          className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-lg text-white font-medium transition-all duration-200 shadow-lg hover:shadow-purple-500/25"
        >
          <Plus className="w-5 h-5" />
          Create First Announcement
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with responsive design */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <Megaphone className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Announcements</h2>
            <p className="text-sm text-gray-400">{announcements.length} announcements</p>
          </div>
        </div>

        {/* Create Button - Always Visible */}
        <button
          onClick={() => router.push('/dashboard/student')}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-lg text-white font-medium transition-all duration-200 shadow-lg hover:shadow-purple-500/25 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Create Announcement</span>
        </button>
      </div>

      {/* Announcements List */}
      <div className="space-y-3">
        {announcements.map((announcement: Announcement) => {
          const isExpanded = expandedId === announcement.id;
          const isRecent = Date.now() - new Date(announcement.createdAt).getTime() < 86400000; // 24 hours
          
          return (
            <motion.div
              key={announcement.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`border rounded-xl overflow-hidden transition-all duration-300 ${
                isExpanded 
                  ? 'border-purple-500/30 bg-gradient-to-b from-purple-500/5 to-transparent shadow-lg shadow-purple-500/10' 
                  : 'border-white/10 bg-white/5 hover:bg-white/10'
              }`}
            >
              <button
                onClick={() => toggleExpand(announcement.id)}
                className="w-full p-4 text-left hover:bg-white/5 transition-colors group"
              >
                <div className="flex items-start gap-3">
                  <UserAvatar user={announcement.author || undefined} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-white text-sm sm:text-base line-clamp-2">
                        {announcement.title}
                      </h3>
                      {isRecent && (
                        <span className="flex-shrink-0 px-2 py-0.5 text-xs font-medium bg-purple-500/20 text-purple-300 rounded-full">
                          New
                        </span>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {announcement.author.firstName} {announcement.author.lastName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(announcement.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        {new Date(announcement.createdAt).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex-shrink-0 ml-2">
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="p-1 rounded-full group-hover:bg-white/10 transition-colors"
                    >
                      <ChevronDown className={`w-5 h-5 ${isExpanded ? 'text-purple-400' : 'text-gray-400'}`} />
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
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pt-0">
                      <div className="pt-4 border-t border-white/10">
                        <div className="prose prose-invert prose-sm max-w-none">
                          <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                            {announcement.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Load More / Footer */}
      {announcements.length > 10 && (
        <div className="text-center pt-4">
          <button className="text-sm text-gray-400 hover:text-white transition-colors">
            Load more announcements
          </button>
        </div>
      )}
    </div>
  );
}