'use client';

import { useState, useEffect } from 'react';

interface Comment {
  id: string;
  announcementId: string;
  userId: string;
  userName: string;
  userEmail: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  replies?: Comment[];
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  adminId: string;
  adminName: string;
  adminEmail: string;
  createdAt: string;
  updatedAt: string;
  comments?: Comment[];
}

interface AnnouncementsProps {
  isAdmin?: boolean;
  adminId?: string;
  adminEmail?: string;
  adminName?: string;
  isTutor?: boolean;
  tutorId?: string;
  tutorEmail?: string;
  tutorName?: string;
  canPostAnnouncements?: boolean;
}

interface ReplyItemProps {
  reply: Comment;
  currentUser: { id: string; name: string; email: string } | null;
  announcementId: string;
  parentCommentId: string;
  onReply: (commentId: string, announcementId: string) => void;
  onDelete: (commentId: string, announcementId: string, isReply?: boolean, parentCommentId?: string) => void;
  newReplies: { [key: string]: string };
  setNewReplies: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
  isPostingComment: string | null;
  formatDate: (dateString: string) => string;
  depth: number;
}

function ReplyItem({ reply, currentUser, announcementId, parentCommentId, onReply, onDelete, newReplies, setNewReplies, isPostingComment, formatDate, depth }: ReplyItemProps) {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const isOwnReply = currentUser?.id === reply.userId;
  const maxDepth = 3; // Limit nesting depth to prevent too deep threads

  // Check if current user is admin
  const isAdmin = currentUser?.email?.includes('admin') || false; // Adjust this logic based on your admin detection

  return (
    <div className={`${depth > 0 ? 'ml-4' : ''} ${depth > 0 ? 'border-l-2 border-gray-200 pl-3' : ''}`}>
      <div className="bg-gray-50 rounded-lg p-2 border border-gray-100">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-xs text-gray-900">{reply.userName}</span>
              <span className="text-xs text-gray-400">{formatDate(reply.createdAt)}</span>
            </div>
            <p className="text-gray-600 text-xs whitespace-pre-wrap">{reply.content}</p>
          </div>
          {(isOwnReply || isAdmin) && (
            <button
              onClick={() => onDelete(reply.id, announcementId, true, parentCommentId)}
              className="text-red-500 hover:text-red-700 transition-colors p-1 rounded hover:bg-red-50"
              title={isAdmin ? "Delete reply (Admin)" : "Delete reply"}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Reply to Reply Section */}
        {depth < maxDepth && currentUser && (
          <div className="mt-2">
            {!showReplyInput ? (
              <button
                onClick={() => setShowReplyInput(true)}
                className="text-blue-600 hover:text-blue-800 text-xs font-medium transition-colors"
              >
                Reply
              </button>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Write a reply..."
                    value={newReplies[reply.id] || ''}
                    onChange={(e) => setNewReplies(prev => ({ ...prev, [reply.id]: e.target.value }))}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && onReply(reply.id, announcementId)}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    maxLength={300}
                  />
                  <button
                    onClick={() => onReply(reply.id, announcementId)}
                    disabled={!newReplies[reply.id]?.trim() || isPostingComment === reply.id}
                    className="px-2 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded text-xs font-medium transition-colors disabled:cursor-not-allowed"
                  >
                    {isPostingComment === reply.id ? '...' : 'Reply'}
                  </button>
                  <button
                    onClick={() => setShowReplyInput(false)}
                    className="px-2 py-1 text-gray-600 hover:text-gray-800 rounded text-xs transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Nested Replies */}
      {reply.replies && reply.replies.length > 0 && (
        <div className="mt-2 space-y-2">
          {reply.replies.map((nestedReply) => (
            <ReplyItem
              key={nestedReply.id}
              reply={nestedReply}
              currentUser={currentUser}
              announcementId={announcementId}
              parentCommentId={reply.id}
              onReply={onReply}
              onDelete={onDelete}
              newReplies={newReplies}
              setNewReplies={setNewReplies}
              isPostingComment={isPostingComment}
              formatDate={formatDate}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Announcements({
  isAdmin = false,
  adminId = '',
  adminEmail = '',
  adminName = '',
  isTutor = false,
  tutorId = '',
  tutorEmail = '',
  tutorName = '',
  canPostAnnouncements = false
}: AnnouncementsProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '' });
  const [isCreating, setIsCreating] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [newComments, setNewComments] = useState<{ [key: string]: string }>({});
  const [newReplies, setNewReplies] = useState<{ [key: string]: string }>({});
  const [isPostingComment, setIsPostingComment] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; email: string } | null>(null);

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

      } finally {
        setIsLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  // Fetch current user info
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        // Get user info from JWT token
        const response = await fetch('/api/user-status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.user) {
            setCurrentUser({
              id: data.user.id,
              name: data.user.fullName,
              email: data.user.email
            });
          }
        }
      } catch (error) {

      }
    };

    fetchCurrentUser();
  }, []);

  // Comment and reply handling functions
  const refreshAnnouncements = async () => {
    try {
      const response = await fetch('/api/announcements');
      const data = await response.json();

      if (data.success) {
        setAnnouncements(data.announcements);
      }
    } catch (error) {

    }
  };

  const handlePostComment = async (announcementId: string) => {
    const content = newComments[announcementId]?.trim();
    if (!content || !currentUser) return;

    setIsPostingComment(announcementId);

    try {
      const response = await fetch('/api/announcements/comment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          announcementId,
          userId: currentUser.id,
          userName: currentUser.name,
          userEmail: currentUser.email,
          content,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setNewComments(prev => ({ ...prev, [announcementId]: '' }));
        await refreshAnnouncements();
      } else {

      }
    } catch {

    } finally {
      setIsPostingComment(null);
    }
  };

  const handlePostReply = async (commentId: string, announcementId: string) => {
    const content = newReplies[commentId]?.trim();
    if (!content || !currentUser) return;

    setIsPostingComment(commentId);

    try {
      const response = await fetch('/api/announcements/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          commentId,
          announcementId,
          userId: currentUser.id,
          userName: currentUser.name,
          userEmail: currentUser.email,
          content,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setNewReplies(prev => ({ ...prev, [commentId]: '' }));
        await refreshAnnouncements();
      } else {

      }
    } catch {

    } finally {
      setIsPostingComment(null);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      const response = await fetch(`/api/announcements/comment/delete?id=${commentId}&userId=${currentUser?.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        await refreshAnnouncements();
      } else {

      }
    } catch (error) {

    }
  };

  const toggleComments = (announcementId: string) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(announcementId)) {
      newExpanded.delete(announcementId);
    } else {
      newExpanded.add(announcementId);
    }
    setExpandedComments(newExpanded);
  };

  // Create new announcement (admin only)
  const handleCreateAnnouncement = async () => {
    if (!newAnnouncement.title.trim() || !newAnnouncement.content.trim()) {
      setMessage('Please fill in all fields');
      setMessageType('error');
      return;
    }

    setIsCreating(true);
    try {
      // Use tutor info if available, otherwise admin info
      const creatorId = isTutor && tutorId ? tutorId : adminId;
      const creatorName = isTutor && tutorName ? tutorName : adminName;
      const creatorEmail = isTutor && tutorEmail ? tutorEmail : adminEmail;

      const response = await fetch('/api/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newAnnouncement.title.trim(),
          content: newAnnouncement.content.trim(),
          adminId: creatorId,
          adminName: creatorName,
          adminEmail: creatorEmail,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setNewAnnouncement({ title: '', content: '' });
        setShowCreateModal(false);
        setMessage('Announcement created successfully!');
        setMessageType('success');
        setTimeout(() => setMessage(''), 3000);
        await refreshAnnouncements();
      } else {
        setMessage(data.message || 'Failed to create announcement');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
      setMessageType('error');
    } finally {
      setIsCreating(false);
    }
  };

  // Delete announcement (admin or own posts for tutors)
  const handleDeleteAnnouncement = async (announcementId: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) {
      return;
    }

    try {
      // Use current user's ID for deletion check
      const currentUserId = currentUser?.id;
      if (!currentUserId) {
        setMessage('User not authenticated');
        setMessageType('error');
        return;
      }

      const response = await fetch(`/api/announcements/delete?id=${announcementId}&userId=${currentUserId}`, {
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
    <>
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <span>📢</span>
            Announcements
          </h2>
          <p className="text-gray-600">Important updates and information from admin</p>
        </div>

        {/* Admin/Tutor Create Button */}
        {(isAdmin || (isTutor && canPostAnnouncements)) && (
          <div className="mb-6">
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25 flex items-center gap-2"
            >
              <span className="text-xl">➕</span>
              <span>Create New Announcement</span>
            </button>
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
            {(isAdmin || (isTutor && canPostAnnouncements)) && <p className="text-sm">Create the first announcement above!</p>}
          </div>
        ) : (
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <div key={announcement.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{announcement.title}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">{formatDate(announcement.createdAt)}</span>
                    {(isAdmin || (isTutor && currentUser?.id === announcement.adminId)) && (
                      <button
                        onClick={() => handleDeleteAnnouncement(announcement.id)}
                        className="text-red-500 hover:text-red-700 transition-colors p-1"
                        title={isAdmin ? "Delete announcement (Admin)" : "Delete your announcement"}
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

                {/* Comments Section */}
                <div className="border-t border-gray-100 pt-4 mt-4">
                  <div className="flex items-center justify-between mb-3">
                    <button
                      onClick={() => toggleComments(announcement.id)}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      {announcement.comments?.length || 0} Comment{(announcement.comments?.length || 0) !== 1 ? 's' : ''}
                    </button>
                    {expandedComments.has(announcement.id) && (
                      <span className="text-xs text-gray-500">
                        Click to hide
                      </span>
                    )}
                  </div>

                  {expandedComments.has(announcement.id) && currentUser && (
                    <div className="mb-4">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Write a comment..."
                          value={newComments[announcement.id] || ''}
                          onChange={(e) => setNewComments(prev => ({ ...prev, [announcement.id]: e.target.value }))}
                          onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handlePostComment(announcement.id)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                          maxLength={500}
                        />
                        <button
                          onClick={() => handlePostComment(announcement.id)}
                          disabled={!newComments[announcement.id]?.trim() || isPostingComment === announcement.id}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition-colors disabled:cursor-not-allowed"
                        >
                          {isPostingComment === announcement.id ? 'Posting...' : 'Post'}
                        </button>
                      </div>
                    </div>
                  )}

                  {expandedComments.has(announcement.id) && (
                    <div className="space-y-3">
                      {announcement.comments?.map((comment) => {
                        // Check if current user is admin
                        const isAdmin = currentUser?.email?.includes('admin') || false; // Adjust this logic based on your admin detection

                        return (
                          <div key={comment.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-sm text-gray-900">{comment.userName}</span>
                                  <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
                                </div>
                                <p className="text-gray-700 text-sm whitespace-pre-wrap">{comment.content}</p>
                              </div>
                              {(currentUser?.id === comment.userId || isAdmin) && (
                                <button
                                  onClick={() => handleDeleteComment(comment.id)}
                                  className="text-red-500 hover:text-red-700 transition-colors p-1 rounded hover:bg-red-50"
                                  title={isAdmin ? "Delete comment (Admin)" : "Delete comment"}
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              )}
                            </div>

                            {/* Reply Section */}
                            <div className="mt-2">
                              {!currentUser ? (
                                <p className="text-xs text-gray-500">Login to reply</p>
                              ) : (
                                <>
                                  <button
                                    onClick={() => {
                                      const replyInput = document.getElementById(`reply-input-${comment.id}`);
                                      if (replyInput) {
                                        replyInput.focus();
                                      }
                                    }}
                                    className="text-blue-600 hover:text-blue-800 text-xs font-medium transition-colors"
                                  >
                                    Reply
                                  </button>
                                  <div className="mt-2">
                                    <div className="flex gap-2">
                                      <input
                                        id={`reply-input-${comment.id}`}
                                        type="text"
                                        placeholder="Write a reply..."
                                        value={newReplies[comment.id] || ''}
                                        onChange={(e) => setNewReplies(prev => ({ ...prev, [comment.id]: e.target.value }))}
                                        onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handlePostReply(comment.id, announcement.id)}
                                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        maxLength={300}
                                      />
                                      <button
                                        onClick={() => handlePostReply(comment.id, announcement.id)}
                                        disabled={!newReplies[comment.id]?.trim() || isPostingComment === comment.id}
                                        className="px-2 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded text-xs font-medium transition-colors disabled:cursor-not-allowed"
                                      >
                                        {isPostingComment === comment.id ? '...' : 'Reply'}
                                      </button>
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>

                            {/* Replies */}
                            {comment.replies && comment.replies.length > 0 && (
                              <div className="mt-3 space-y-2 pl-4 border-l-2 border-gray-200">
                                {comment.replies.map((reply) => (
                                  <ReplyItem
                                    key={reply.id}
                                    reply={reply}
                                    currentUser={currentUser}
                                    announcementId={announcement.id}
                                    parentCommentId={comment.id}
                                    onReply={handlePostReply}
                                    onDelete={handleDeleteComment}
                                    newReplies={newReplies}
                                    setNewReplies={setNewReplies}
                                    isPostingComment={isPostingComment}
                                    formatDate={formatDate}
                                    depth={0}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {(!announcement.comments || announcement.comments.length === 0) && (
                        <p className="text-gray-500 text-sm text-center py-2">
                          No comments yet. Be the first to comment!
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full animate-scale-in">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-xl">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <span>📝</span>
                  Create New Announcement
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Announcement Title
                  </label>
                  <input
                    type="text"
                    placeholder="Enter announcement title"
                    value={newAnnouncement.title}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    maxLength={100}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {newAnnouncement.title.length}/100 characters
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Announcement Content
                  </label>
                  <textarea
                    placeholder="Enter announcement content"
                    value={newAnnouncement.content}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                    rows={4}
                    maxLength={500}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {newAnnouncement.content.length}/500 characters
                  </p>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-2 rounded-lg font-medium transition-all disabled:cursor-not-allowed"
                  >
                    {isCreating ? 'Creating...' : 'Post Announcement'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
