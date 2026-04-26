'use client';

import { useState, useEffect } from 'react';

interface Announcement {
  id: string;
  title: string;
  content: string;
  adminName: string;
  createdAt: string;
  updatedAt: string;
}

interface AnnouncementsProps {
  isAdmin?: boolean;
  adminId?: string;
  adminEmail?: string;
  adminName?: string;
}

export default function Announcements({ isAdmin = false, adminId = '', adminEmail = '', adminName = '' }: AnnouncementsProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '' });
  const [isCreating, setIsCreating] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  // Fetch announcements
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await fetch('/api/announcements');
        const data = await response.json();

        if (data.success) {
          setAnnouncements(data.announcements);
        }
      } catch (error) {
        console.error('Error fetching announcements:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  // Create new announcement (admin only)
  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newAnnouncement.title.trim() || !newAnnouncement.content.trim()) {
      setMessage('Please fill in both title and content');
      setMessageType('error');
      return;
    }

    setIsCreating(true);
    setMessage('');

    try {
      const response = await fetch('/api/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newAnnouncement.title.trim(),
          content: newAnnouncement.content.trim(),
          adminId,
          adminName,
          adminEmail,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setAnnouncements([data.announcement, ...announcements]);
        setNewAnnouncement({ title: '', content: '' });
        setMessage('Announcement created successfully!');
        setMessageType('success');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(data.message || 'Failed to create announcement');
        setMessageType('error');
      }
    } catch {
      setMessage('Network error. Please try again.');
      setMessageType('error');
    } finally {
      setIsCreating(false);
    }
  };

  // Delete announcement (admin only)
  const handleDeleteAnnouncement = async (announcementId: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) {
      return;
    }

    try {
      const response = await fetch(`/api/announcements/delete?id=${announcementId}&adminId=${adminId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setAnnouncements(announcements.filter(a => a.id !== announcementId));
        setMessage('Announcement deleted successfully!');
        setMessageType('success');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(data.message || 'Failed to delete announcement');
        setMessageType('error');
      }
    } catch {
      setMessage('Network error. Please try again.');
      setMessageType('error');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <span>📢</span>
          Announcements
        </h2>
        <p className="text-gray-600">Important updates and information from admin</p>
      </div>

      {/* Admin Create Form */}
      {isAdmin && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Create New Announcement</h3>
          <form onSubmit={handleCreateAnnouncement} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Announcement Title"
                value={newAnnouncement.title}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                maxLength={100}
              />
            </div>
            <div>
              <textarea
                placeholder="Announcement Content"
                value={newAnnouncement.content}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                rows={4}
                maxLength={500}
              />
            </div>
            <button
              type="submit"
              disabled={isCreating}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
            >
              {isCreating ? 'Creating...' : 'Post Announcement'}
            </button>
          </form>
        </div>
      )}

      {/* Message Display */}
      {message && (
        <div className={`mb-4 p-3 rounded-lg ${messageType === 'success'
            ? 'bg-green-100 border border-green-400 text-green-700'
            : 'bg-red-100 border border-red-400 text-red-700'
          }`}>
          {message}
        </div>
      )}

      {/* Announcements List */}
      {announcements.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">📭</div>
          <p>No announcements yet</p>
          {isAdmin && <p className="text-sm">Create the first announcement above!</p>}
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <div key={announcement.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{announcement.title}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">{formatDate(announcement.createdAt)}</span>
                  {isAdmin && (
                    <button
                      onClick={() => handleDeleteAnnouncement(announcement.id)}
                      className="text-red-500 hover:text-red-700 transition-colors p-1"
                      title="Delete announcement"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">{announcement.content}</p>
              <p className="text-sm text-gray-500 mt-2">Posted by {announcement.adminName}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
