'use client';

import { ArrowLeft, Home, Bell, Check, CheckCircle, Loader2, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useNotifications, useMarkNotificationAsRead, useMarkAllAsRead } from '@/hooks/useNotifications';
import { motion } from 'framer-motion';

export default function NotificationsPage() {
  const router = useRouter();
  const { data, isLoading, error } = useNotifications(false);
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();

  const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead.mutateAsync(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsReadMutation.mutateAsync();
  };

  const handleNotificationClick = async (notification: any) => {
    if (!notification.isRead) {
      await handleMarkAsRead(notification.id);
    }
    if (notification.link) {
      router.push(notification.link);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'football_team':
        return <CheckCircle className="w-5 h-5 text-[#E8A33D]" />;
      case 'cleaning':
        return <CheckCircle className="w-5 h-5 text-[#14B8A6]" />;
      default:
        return <Bell className="w-5 h-5 text-[#FB7185]" />;
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header with navigation */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg bg-[#2A2438]/50 hover:bg-[#2A2438] text-[#A79C8C] hover:text-[#F5F0E8] transition-all duration-200"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => router.push('/dashboard')}
            className="p-2 rounded-lg bg-[#2A2438]/50 hover:bg-[#2A2438] text-[#A79C8C] hover:text-[#F5F0E8] transition-all duration-200"
            aria-label="Go home"
          >
            <Home className="w-5 h-5" />
          </button>
          
          <div className="h-8 w-px bg-[#2A2438]" />
          
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#E8A33D]/20 to-[#C97F1F]/10 border border-[#E8A33D]/20">
              <Bell className="w-6 h-6 text-[#E8A33D]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#F5F0E8]">
                Notifications
              </h1>
              {data?.unreadCount && data.unreadCount > 0 && (
                <p className="text-sm text-[#A79C8C]">
                  {data.unreadCount} unread
                </p>
              )}
            </div>
          </div>
        </div>

        {data?.unreadCount && data.unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            disabled={markAllAsReadMutation.isPending}
            className="px-4 py-2 bg-[#14B8A6] text-[#0B0912] rounded-lg hover:bg-[#0D9488] transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {markAllAsReadMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            Mark all as read
          </button>
        )}
      </div>

      {/* Notifications List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[#150F20] border border-[#2A2438] rounded-xl p-6">
              <div className="h-6 w-48 bg-[#2A2438] rounded animate-pulse mb-3" />
              <div className="h-4 w-full bg-[#2A2438] rounded animate-pulse mb-2" />
              <div className="h-4 w-3/4 bg-[#2A2438] rounded animate-pulse" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-[#FB7185]/10 border border-[#FB7185]/30 rounded-xl p-8 text-center">
          <p className="text-[#FB7185]">Failed to load notifications</p>
        </div>
      ) : !data?.notifications || data.notifications.length === 0 ? (
        <div className="bg-[#150F20] border border-[#2A2438] rounded-xl p-12 text-center">
          <Bell className="w-16 h-16 text-[#6B6358] mx-auto mb-4" />
          <p className="text-[#A79C8C]">No notifications yet</p>
          <p className="text-sm text-[#6B6358] mt-2">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.notifications.map((notification, index) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleNotificationClick(notification)}
              className={cn(
                "bg-[#150F20] border rounded-xl p-6 cursor-pointer transition-all hover:border-[#E8A33D]/50",
                !notification.isRead ? "border-[#E8A33D]/30 bg-[#E8A33D]/5" : "border-[#2A2438]"
              )}
            >
              <div className="flex items-start gap-4">
                <div className={cn(
                  "p-3 rounded-xl flex-shrink-0",
                  !notification.isRead ? "bg-[#E8A33D]/20" : "bg-[#2A2438]"
                )}>
                  {getNotificationIcon(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h3 className={cn(
                      "font-semibold",
                      !notification.isRead ? "text-[#F5F0E8]" : "text-[#A79C8C]"
                    )}>
                      {notification.title}
                    </h3>
                    {!notification.isRead && (
                      <span className="w-2 h-2 bg-[#E8A33D] rounded-full flex-shrink-0 mt-2" />
                    )}
                  </div>
                  
                  <p className="text-[#A79C8C] mb-3">{notification.message}</p>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-[#6B6358]">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                    
                    {notification.link && (
                      <div className="flex items-center gap-1 text-xs text-[#E8A33D]">
                        <span>View</span>
                        <ExternalLink className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
