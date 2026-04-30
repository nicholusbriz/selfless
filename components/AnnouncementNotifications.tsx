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
  adminName: string;
  createdAt: string;
  updatedAt: string;
  comments?: Comment[];
}

interface AnnouncementNotificationsProps {
  isAdmin?: boolean;
  adminId?: string;
  adminName?: string;
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

interface CommentItemProps {
  comment: Comment;
  currentUser: { id: string; name: string; email: string } | null;
  announcementId: string;
  onReply: (commentId: string, announcementId: string) => void;
  onDelete: (commentId: string, announcementId: string, isReply?: boolean, parentCommentId?: string) => void;
  newReplies: { [key: string]: string };
  setNewReplies: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
  isPostingComment: string | null;
  formatDate: (dateString: string) => string;
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

function CommentItem({ comment, currentUser, announcementId, onReply, onDelete, newReplies, setNewReplies, isPostingComment, formatDate }: CommentItemProps) {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const isOwnComment = currentUser?.id === comment.userId;
  // Check if current user is admin (you can pass admin status as a prop or check user role)
  const isAdmin = currentUser?.email?.includes('admin') || false; // Adjust this logic based on your admin detection

  return (
    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm text-gray-900">{comment.userName}</span>
            <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
          </div>
          <p className="text-gray-700 text-sm whitespace-pre-wrap">{comment.content}</p>
        </div>
        {(isOwnComment || isAdmin) && (
          <button
            onClick={() => onDelete(comment.id, announcementId)}
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
                value={newReplies[comment.id] || ''}
                onChange={(e) => setNewReplies(prev => ({ ...prev, [comment.id]: e.target.value }))}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && onReply(comment.id, announcementId)}
                className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                maxLength={300}
              />
              <button
                onClick={() => onReply(comment.id, announcementId)}
                disabled={!newReplies[comment.id]?.trim() || isPostingComment === comment.id}
                className="px-2 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded text-xs font-medium transition-colors disabled:cursor-not-allowed"
              >
                {isPostingComment === comment.id ? '...' : 'Reply'}
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

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3 space-y-2 pl-4 border-l-2 border-gray-200">
            {comment.replies.map((reply) => (
              <ReplyItem
                key={reply.id}
                reply={reply}
                currentUser={currentUser}
                announcementId={announcementId}
                parentCommentId={comment.id}
                onReply={onReply}
                onDelete={onDelete}
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
    </div>
  );
}

export default function AnnouncementNotifications({ isAdmin = false, adminId = '', adminName = '' }: AnnouncementNotificationsProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [newComments, setNewComments] = useState<{ [key: string]: string }>({});
  const [newReplies, setNewReplies] = useState<{ [key: string]: string }>({});
  const [isPostingComment, setIsPostingComment] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '' });
  const [isCreating, setIsCreating] = useState(false);

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

  // Get current user from database
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get('userId');

        if (!userId) {
          
          return;
        }

        // Fetch user data from database
        const response = await fetch(`/api/users?id=${userId}`);
        const data = await response.json();

        if (data.success && data.users) {
          const user = data.users.find((u: { id: string; fullName: string; email: string }) => u.id === userId);
          if (user) {
            setCurrentUser({
              id: user.id,
              name: user.fullName,
              email: user.email
            });
          } else {
            
          }
        } else {
          
        }
      } catch (error) {
        
      }
    };

    fetchCurrentUser();
  }, []);


  const handleOpenModal = () => {
    setShowModal(true);
    // Expand all comments by default when modal opens
    const allAnnouncementIds = announcements.map(a => a.id);
    setExpandedComments(new Set(allAnnouncementIds));
  };

  const handleDeleteAnnouncement = async (announcementId: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) {
      return;
    }

    setIsDeleting(announcementId);

    try {
      const response = await fetch(`/api/announcements/delete?id=${announcementId}&adminId=${adminId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setAnnouncements(announcements.filter(a => a.id !== announcementId));
      } else {
        // If not admin or deletion failed, just remove from local state for user
        setAnnouncements(announcements.filter(a => a.id !== announcementId));
      }
    } catch (error) {
      
      // Still remove from local state even if API fails
      setAnnouncements(announcements.filter(a => a.id !== announcementId));
    } finally {
      setIsDeleting(null);
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
        // Clear the input field and refresh announcements to get the latest data
        setNewComments(prev => ({ ...prev, [announcementId]: '' }));
        // Refresh the announcements to get the latest data from database
        await refreshAnnouncements();
      } else {
        
      }
    } catch (error) {
      
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
        // Clear the reply input and refresh announcements to get the latest data
        setNewReplies(prev => ({ ...prev, [commentId]: '' }));
        // Refresh the announcements to get the latest data from database
        await refreshAnnouncements();
      } else {
        
      }
    } catch (error) {
      
    } finally {
      setIsPostingComment(null);
    }
  };

  const handleDeleteComment = async (commentId: string, announcementId: string, isReply: boolean = false, parentCommentId?: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      const response = await fetch(`/api/announcements/comment/delete?id=${commentId}&userId=${currentUser?.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        // Refresh announcements to get the latest data from database
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

  const handleCreateAnnouncement = async () => {
    if (!newAnnouncement.title.trim() || !newAnnouncement.content.trim()) {
      alert('Please fill in both title and content');
      return;
    }

    setIsCreating(true);

    try {
      const response = await fetch('/api/announcements/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newAnnouncement.title.trim(),
          content: newAnnouncement.content.trim(),
          adminId: adminId,
          adminName: adminName,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Reset form and close modal
        setNewAnnouncement({ title: '', content: '' });
        setShowCreateModal(false);
        // Refresh announcements to get the latest data
        await refreshAnnouncements();
        alert('Announcement created successfully!');
      } else {
        alert(data.message || 'Failed to create announcement');
      }
    } catch (error) {
      
      alert('Network error occurred');
    } finally {
      setIsCreating(false);
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
    return null;
  }

  return (
    <>
      {/* Admin Create Announcement Button */}
      {isAdmin && (
        <button
          onClick={() => setShowCreateModal(true)}
          className="mb-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <span>➕</span>
          Create New Announcement
        </button>
      )}

      {/* Notification Button - Always Visible */}
      <button
        onClick={handleOpenModal}
        className="fixed top-4 right-4 z-50 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2 animate-bounce-in"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
        </span>
        <span className="text-sm font-medium">
          {announcements.length} announcement{announcements.length > 1 ? 's' : ''}
        </span>
        <span className="bg-white text-blue-600 text-xs font-bold px-2 py-1 rounded-full">
          {announcements.length}
        </span>
      </button>

      {/* Modal - Always Available */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden animate-scale-in">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <span>📢</span>
                    Admin Announcements
                  </h2>
                  <p className="text-blue-100 mt-1">
                    {announcements.length} announcement{announcements.length > 1 ? 's' : ''} available
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {announcements.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">📭</div>
                  <p>No announcements yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {announcements.map((announcement) => (
                    <div
                      key={announcement.id}
                      className="border border-gray-200 bg-white rounded-lg p-4 shadow-sm transition-all hover:shadow-md"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {announcement.title}
                          </h3>
                          <p className="text-sm text-gray-500 mb-2">
                            {formatDate(announcement.createdAt)} • Posted by {announcement.adminName}
                          </p>
                        </div>
                        {isAdmin && (
                          <button
                            onClick={() => handleDeleteAnnouncement(announcement.id)}
                            disabled={isDeleting === announcement.id}
                            className="text-red-500 hover:text-red-700 transition-colors p-2 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete announcement"
                          >
                            {isDeleting === announcement.id ? (
                              <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            )}
                          </button>
                        )}
                      </div>
                      <div className="text-gray-700 whitespace-pre-wrap mb-4">
                        {announcement.content}
                      </div>

                      {/* Comments Section */}
                      <div className="border-t border-gray-100 pt-4">
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
                            {announcement.comments?.map((comment) => (
                              <CommentItem
                                key={comment.id}
                                comment={comment}
                                currentUser={currentUser}
                                announcementId={announcement.id}
                                onReply={handlePostReply}
                                onDelete={handleDeleteComment}
                                newReplies={newReplies}
                                setNewReplies={setNewReplies}
                                isPostingComment={isPostingComment}
                                formatDate={formatDate}
                              />
                            ))}
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

            {/* Modal Footer */}
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  {announcements.length} announcement{announcements.length > 1 ? 's' : ''} available
                </span>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
