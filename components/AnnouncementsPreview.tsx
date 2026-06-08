'use client';

import { useAnnouncements } from '@/hooks/announcementHooks';

interface Announcement {
  id: string;
  title: string;
  content: string;
  adminName: string;
  createdAt: string;
}

interface AnnouncementsPreviewProps {
  onViewAll: () => void;
}

export default function AnnouncementsPreview({ onViewAll }: AnnouncementsPreviewProps) {
  const { data: announcements = [], isLoading } = useAnnouncements();

  // Get the 3 most recent announcements
  const recentAnnouncements = announcements
    .sort((a: Announcement, b: Announcement) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 3);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const truncateContent = (content: string, maxLength: number) => {
    if (content.length <= maxLength) return content;
    return content.slice(0, maxLength) + '...';
  };

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-cloud-500 to-cloud-400 backdrop-blur-md rounded-2xl border border-sandstone-400 shadow-xl">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-terracotta-400 to-terracotta-600 rounded-xl flex items-center justify-center shadow-lg shadow-terracotta-400/30">
              <span className="text-2xl text-white">📢</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-charcoal-700">Announcements</h3>
              <p className="text-charcoal-600 text-sm">Latest updates</p>
            </div>
          </div>
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-terracotta-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-charcoal-600 mt-2">Loading announcements...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-cloud-500 to-cloud-400 backdrop-blur-md rounded-2xl border border-sandstone-400 hover:shadow-2xl transition-all duration-300 group shadow-xl">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-terracotta-400 to-terracotta-600 rounded-xl flex items-center justify-center shadow-lg shadow-terracotta-400/30 group-hover:scale-110 transition-transform">
              <span className="text-2xl text-white">📢</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-charcoal-700">Announcements</h3>
              <p className="text-charcoal-600 text-sm">Latest updates</p>
            </div>
          </div>
          {announcements.length > 0 && (
            <div className="px-3 py-1 bg-terracotta-400/10 rounded-full border border-terracotta-400/30">
              <span className="text-terracotta-600 text-sm font-medium">{announcements.length}</span>
            </div>
          )}
        </div>

        {recentAnnouncements.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-cloud-400 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-sandstone-400">
              <span className="text-2xl">📢</span>
            </div>
            <p className="text-charcoal-600 text-sm">No announcements yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentAnnouncements.map((announcement: Announcement) => (
              <div
                key={announcement.id}
                className="p-4 bg-cloud-400 rounded-xl border border-sandstone-400 hover:bg-sandstone-400 hover:border-terracotta-400 transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-charcoal-700 mb-1 truncate">
                      {announcement.title}
                    </h4>
                    <p className="text-xs text-charcoal-600 line-clamp-2">
                      {truncateContent(announcement.content, 100)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-5 h-5 bg-sage-400 rounded-full flex items-center justify-center shadow-md shadow-sage-400/30">
                    <span className="text-xs font-semibold text-white">
                      {announcement.adminName.charAt(0)}
                    </span>
                  </div>
                  <span className="text-xs text-charcoal-700">{announcement.adminName}</span>
                  <span className="text-xs text-charcoal-500">•</span>
                  <span className="text-xs text-charcoal-600">{formatDate(announcement.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {announcements.length > 0 && (
          <button
            onClick={onViewAll}
            className="w-full mt-4 bg-gradient-to-r from-terracotta-400 to-terracotta-600 text-white font-medium py-2 px-4 rounded-lg hover:from-terracotta-500 hover:to-terracotta-700 transition-all duration-200 transform hover:scale-105 shadow-lg shadow-terracotta-400/30"
          >
            View All Announcements
          </button>
        )}
      </div>
    </div>
  );
}
