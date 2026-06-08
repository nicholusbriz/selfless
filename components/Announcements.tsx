/**
 * @fileoverview Announcements System Component
 * 
 * This component manages the announcements feature for the Selfless platform.
 * It allows admins and tutors to create announcements, and all authenticated users
 * to view and comment on them.
 * 
 * Key Features:
 * - Create/delete announcements (admin/tutor only)
 * - View announcements with pagination
 * - Comment system with nested replies
 * - Real-time updates via React Query
 * 
 * Data Flow:
 * 1. Component fetches announcements via useAnnouncements hook
 * 2. User interactions trigger mutations (create/delete/comment)
 * 3. UI updates automatically when data changes
 * 4. Comments support nested replies up to 3 levels deep
 */

'use client';

import { useState, useMemo } from 'react';
import { useAnnouncements, useDeleteAnnouncement, useCreateAnnouncement, usePostComment, usePostReply, useDeleteComment } from '@/hooks/announcementHooks';
import { useUserStatus } from '@/contexts/UserStatusContext';
import { BackgroundImage } from '@/components/ui';

/**
 * Represents a single comment in the announcement system.
 * Comments can have nested replies, creating a threaded discussion.
 */
interface Comment {
  id: string;
  announcementId: string;
  userId: string;
  userName: string;
  userEmail: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  replies?: Comment[]; // Nested replies for threaded conversations
}

/**
 * Represents an announcement in the system.
 * Announcements are created by admins or tutors and can be commented on by users.
 */
interface Announcement {
  id: string;
  title: string;
  content: string;
  adminId: string;        // ID of the creator (admin or tutor)
  adminName: string;      // Name of the creator
  adminEmail: string;     // Email of the creator
  createdAt: string;
  updatedAt: string;
  isActive?: boolean;     // Soft delete flag (optional)
  comments?: Comment[];   // Array of comments on this announcement
}

/**
 * Props for the main Announcements component.
 * 
 * This component now uses the global user status context instead of
 * prop-based status passing. Only UI-specific props are needed.
 * 
 * Props:
 * - showAnnouncementsList: Controls whether to display the announcements list
 */
interface AnnouncementsProps {
  showAnnouncementsList?: boolean; // UI control for showing/hiding list
}

/**
 * Props for the ReplyItem component.
 * 
 * This component handles individual replies in the comment thread.
 * It supports nested replies with a maximum depth to prevent infinite nesting.
 */
interface ReplyItemProps {
  reply: Comment;    // The reply comment to display
  currentUser: { id: string; name: string; email: string } | null; // Current logged-in user
  announcementId: string;        // Parent announcement ID
  parentCommentId: string;       // ID of the parent comment being replied to
  onReply: (announcementId: string, content: string, parentCommentId?: string, replyId?: string) => void; // Reply handler
  onDelete: (commentId: string) => void; // Delete handler
  newReplies: { [key: string]: string }; // Reply input state management
  setNewReplies: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>; // Reply input setter
  isPostingComment: string | null; // Loading state for reply submission
  formatDate: (dateString: string) => string; // Date formatting function
  depth: number;       // Current nesting depth (prevents infinite nesting)
}

/**
 * Props for the CommentItem component.
 * 
 * This component displays top-level comments and manages their replies.
 * It handles the main comment interactions and delegates reply rendering.
 */
interface CommentItemProps {
  comment: Comment;  // The comment to display
  currentUser: { id: string; name: string; email: string } | null; // Current logged-in user
  announcementId: string;        // Parent announcement ID
  onReply: (announcementId: string, content: string, parentCommentId?: string, replyId?: string) => void; // Reply handler
  onDelete: (commentId: string) => void; // Delete handler
  newReplies: { [key: string]: string }; // Reply input state management
  setNewReplies: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>; // Reply input setter
  isPostingComment: string | null; // Loading state for comment submission
  formatDate: (dateString: string) => string; // Date formatting function
}

/**
 * ReplyItem Component - Handles nested replies in comment threads
 * 
 * This component renders individual replies and manages the reply functionality
 * for comments. It includes permission checks and prevents infinite nesting.
 * 
 * Key Features:
 * - Displays reply content with author info and timestamp
 * - Allows users to reply to replies (nested comments)
 * - Permission-based delete functionality
 * - Maximum nesting depth of 3 levels to maintain readability
 * - Real-time loading states during reply submission
 */
function ReplyItem({ reply, currentUser, announcementId, parentCommentId, onReply, onDelete, newReplies, setNewReplies, isPostingComment, formatDate, depth }: ReplyItemProps) {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const isOwnReply = currentUser?.id === reply.userId;  // User can only delete their own replies
  const maxDepth = 3;  // Prevent infinite nesting for better UX

  // Use context-based permissions instead of email checking
  // Note: This component receives permissions as props from parent

  /**
 * Handles submitting a reply to this comment
 * Validates content and triggers the parent reply handler
 */
  const handleReply = () => {
    const content = newReplies[reply.id];
    if (content && content.trim()) {
      onReply(announcementId, content, parentCommentId, reply.id);
      setShowReplyInput(false);
    }
  };

  return (
    <div className={`ml-${depth * 4} mt-2 p-3 bg-cloud-500 rounded-xl border-l-2 border-sandstone-400`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-6 h-6 bg-terracotta-400 rounded-full flex items-center justify-center shadow-md shadow-terracotta-400/30">
              <span className="text-xs font-semibold text-white">{reply.userName.charAt(0)}</span>
            </div>
            <div>
              <span className="font-medium text-sm text-charcoal-700">{reply.userName}</span>
              <span className="text-xs text-charcoal-500 ml-2">{formatDate(reply.createdAt)}</span>
            </div>
          </div>
          <p className="text-sm text-charcoal-700 leading-relaxed whitespace-pre-wrap">{reply.content}</p>
        </div>
        {(isOwnReply) && (
          <button
            onClick={() => onDelete(reply.id)}
            className="text-red-600 hover:text-red-700 text-sm p-1.5 hover:bg-red-400/10 rounded-lg transition-colors"
            title="Delete reply"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        )}
      </div>
      {depth < maxDepth && (
        <div className="mt-3">
          <button
            onClick={() => setShowReplyInput(!showReplyInput)}
            className="text-terracotta-600 hover:text-terracotta-700 text-sm font-medium transition-colors"
          >
            Reply
          </button>
          {showReplyInput && (
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                placeholder="Write a reply..."
                value={newReplies[reply.id] || ''}
                onChange={(e) => setNewReplies((prev: { [key: string]: string }) => ({ ...prev, [reply.id]: e.target.value }))}
                className="flex-1 px-3 py-2.5 bg-cloud-400 border border-sandstone-400 rounded-lg text-charcoal-700 placeholder-charcoal-500 focus:outline-none focus:ring-2 focus:ring-terracotta-400 focus:border-terracotta-400 transition-all"
              />
              <button
                onClick={handleReply}
                disabled={isPostingComment === reply.id}
                className="px-3 py-2.5 bg-gradient-to-r from-terracotta-400 to-terracotta-600 text-white rounded-lg text-sm font-medium hover:from-terracotta-500 hover:to-terracotta-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-terracotta-400/30"
              >
                {isPostingComment === reply.id ? 'Posting...' : 'Reply'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * CommentItem Component - Handles top-level comments and their replies
 * 
 * This component manages the display and interaction of individual comments
 * on announcements. It coordinates between the main comment display and
 * nested reply components.
 * 
 * Key Features:
 * - Displays comment content with author information
 * - Manages reply functionality for top-level comments
 * - Handles permission-based comment deletion
 * - Coordinates nested reply rendering through ReplyItem components
 * - Provides real-time feedback during comment operations
 */
function CommentItem({ comment, currentUser, announcementId, onReply, onDelete, newReplies, setNewReplies, isPostingComment, formatDate }: CommentItemProps) {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const isOwnComment = currentUser?.id === comment.userId;  // User can only delete their own comments

  // Use context-based permissions instead of email checking
  // Note: This component receives permissions as props from parent

  /**
   * Handles submitting a reply to this comment
   * Validates content and triggers the parent reply handler
   */
  const handleReply = () => {
    const content = newReplies[comment.id];
    if (content && content.trim()) {
      onReply(announcementId, content, comment.id, comment.id);
      setShowReplyInput(false);
    }
  };

  return (
    <div className="mt-4 p-4 bg-cloud-400 rounded-xl border border-sandstone-400">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-sage-400 rounded-full flex items-center justify-center shadow-md shadow-sage-400/30">
            <span className="text-sm font-semibold text-white">{comment.userName.charAt(0)}</span>
          </div>
          <div>
            <span className="font-medium text-charcoal-700">{comment.userName}</span>
            <span className="text-xs text-charcoal-500 ml-2">{formatDate(comment.createdAt)}</span>
          </div>
        </div>
        {(isOwnComment) && (
          <button
            onClick={() => onDelete(comment.id)}
            className="text-red-600 hover:text-red-700 text-sm p-1.5 hover:bg-red-400/10 rounded-lg transition-colors"
            title="Delete comment"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        )}
      </div>
      <p className="text-charcoal-700 leading-relaxed whitespace-pre-wrap mb-3">{comment.content}</p>

      <div className="space-y-2">
        {comment.replies?.map((reply: Comment) => (
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
            depth={1}
          />
        ))}
      </div>

      <div className="mt-4">
        <button
          onClick={() => setShowReplyInput(!showReplyInput)}
          className="text-terracotta-600 hover:text-terracotta-700 text-sm font-medium transition-colors"
        >
          Reply
        </button>
        {showReplyInput && (
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              placeholder="Write a reply..."
              value={newReplies[comment.id] || ''}
              onChange={(e) => setNewReplies(prev => ({ ...prev, [comment.id]: e.target.value }))}
              className="flex-1 px-3 py-2.5 bg-cloud-500 border border-sandstone-400 rounded-lg text-charcoal-700 placeholder-charcoal-500 focus:outline-none focus:ring-2 focus:ring-terracotta-400 focus:border-terracotta-400 transition-all"
            />
            <button
              onClick={handleReply}
              disabled={isPostingComment === comment.id}
              className="px-3 py-2.5 bg-gradient-to-r from-terracotta-400 to-terracotta-600 text-white rounded-lg text-sm font-medium hover:from-terracotta-500 hover:to-terracotta-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-terracotta-400/30"
            >
              {isPostingComment === comment.id ? 'Posting...' : 'Reply'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Announcements({
  showAnnouncementsList = true
}: AnnouncementsProps) {
  return (
    <div className="min-h-screen bg-cloud-500 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-terracotta-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-sage-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse animation-delay-2000"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(44, 44, 44, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(44, 44, 44, 0.03) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }}></div>
      </div>
      <div className="relative z-10 container mx-auto px-4 py-6">
        <AnnouncementsContent showAnnouncementsList={showAnnouncementsList} />
      </div>
    </div>
  );
}

function AnnouncementsContent({
  showAnnouncementsList = true
}: AnnouncementsProps) {
  // Use global user status context instead of props
  const {
    user,
    canCreateAnnouncements,
    canDeleteAnnouncements,
    isAuthenticated
  } = useUserStatus();

  // Use API hooks for data management
  const { data: announcements = [], isLoading } = useAnnouncements();
  const createAnnouncementMutation = useCreateAnnouncement();
  const deleteAnnouncementMutation = useDeleteAnnouncement();
  const postCommentMutation = usePostComment();
  const postReplyMutation = usePostReply();
  const deleteCommentMutation = useDeleteComment();

  // Local state for UI only
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '' });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newComments, setNewComments] = useState<{ [key: string]: string }>({});
  const [newReplies, setNewReplies] = useState<{ [key: string]: string }>({});
  const [isPostingComment, setIsPostingComment] = useState<string | null>(null);

  // Set current user from context using useMemo to avoid setState in effect
  const currentUser = useMemo(() => {
    if (user) {
      return {
        id: user.id,
        name: user.fullName || `${user.firstName} ${user.lastName}`,
        email: user.email
      };
    }
    return null;
  }, [user]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Fetch current user info - REMOVED: Now using context
  // useEffect(() => {
  //   const fetchCurrentUser = async () => {
  //     try {
  //       const response = await fetch('/api/user-status', {
  //         method: 'POST',
  //         headers: {
  //           'Content-Type': 'application/json',
  //         },
  //       });

  //       if (response.ok) {
  //         const userData = await response.json();
  //         if (userData.success && userData.user) {
  //           setCurrentUser({
  //             id: userData.user.id,
  //             name: userData.user.fullName || `${userData.user.firstName} ${userData.user.lastName}`,
  //             email: userData.user.email
  //           });
  //         }
  //       }
  //     } catch (error) {
  //       console.error('Failed to fetch current user:', error);
  //     }
  //   };

  //   fetchCurrentUser();
  // }, []);

  const handleCreateAnnouncement = async () => {
    if (!newAnnouncement.title.trim() || !newAnnouncement.content.trim()) {
      setMessage('Please fill in all fields');
      setMessageType('error');
      return;
    }

    // Check if user is authenticated
    if (!isAuthenticated || !user) {
      setMessage('User data not loaded. Please wait and try again.');
      setMessageType('error');
      return;
    }

    // Check if user has permission to create announcements
    if (!canCreateAnnouncements) {
      setMessage('You do not have permission to create announcements.');
      setMessageType('error');
      return;
    }

    try {
      await createAnnouncementMutation.mutateAsync({
        title: newAnnouncement.title.trim(),
        content: newAnnouncement.content.trim(),
        adminId: user.id,
        adminName: user.fullName || `${user.firstName} ${user.lastName}`,
        adminEmail: user.email,
        isActive: true
      });

      setMessage('Announcement created successfully');
      setMessageType('success');
      setNewAnnouncement({ title: '', content: '' });
      setShowCreateModal(false);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create announcement';
      setMessage(errorMessage);
      setMessageType('error');
    }
  };

  const handleDeleteAnnouncement = async (announcementId: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) {
      return;
    }

    try {
      await deleteAnnouncementMutation.mutateAsync({
        announcementId,
        userId: user?.id || ''
      });
      setMessage('Announcement deleted successfully');
      setMessageType('success');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete announcement';
      setMessage(errorMessage);
      setMessageType('error');
    }
  };

  const handleComment = async (announcementId: string, content: string, parentCommentId?: string, replyId?: string) => {
    if (!content.trim()) return;

    try {
      setIsPostingComment(parentCommentId || announcementId);

      if (parentCommentId) {
        await postReplyMutation.mutateAsync({
          commentId: parentCommentId,
          announcementId,
          userId: user?.id || '',
          userName: user?.fullName || '',
          userEmail: user?.email || '',
          content
        });
      } else {
        await postCommentMutation.mutateAsync({
          announcementId,
          userId: user?.id || '',
          userName: user?.fullName || '',
          userEmail: user?.email || '',
          content
        });
      }

      if (replyId) {
        setNewReplies(prev => ({ ...prev, [replyId]: '' }));
      } else {
        setNewComments(prev => ({ ...prev, [parentCommentId || announcementId]: '' }));
      }

      setMessage(parentCommentId ? 'Reply posted successfully' : 'Comment posted successfully');
      setMessageType('success');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to post comment';
      setMessage(errorMessage);
      setMessageType('error');
    } finally {
      setIsPostingComment(null);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      await deleteCommentMutation.mutateAsync({
        commentId,
        userId: user?.id || ''
      });
      setMessage('Comment deleted successfully');
      setMessageType('success');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete comment';
      setMessage(errorMessage);
      setMessageType('error');
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="w-8 h-8 border-2 border-terracotta-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-charcoal-600 mt-2">Loading announcements...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-terracotta-400 to-terracotta-600 rounded-xl flex items-center justify-center shadow-lg shadow-terracotta-400/30">
            <span className="text-2xl text-white">📢</span>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-charcoal-700">Announcements</h3>
            <p className="text-charcoal-600 text-sm">Latest updates and news</p>
          </div>
        </div>
        {canCreateAnnouncements && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-terracotta-400 to-terracotta-600 text-white rounded-lg hover:from-terracotta-500 hover:to-terracotta-700 transition-all flex items-center gap-2 shadow-lg shadow-terracotta-400/30"
          >
            <span className="text-lg">+</span>
            Create Announcement
          </button>
        )}
      </div>

      {message && (
        <div className={`rounded-lg p-4 text-center ${messageType === 'success'
          ? 'bg-sage-400/10 border border-sage-400/30 text-sage-600'
          : 'bg-red-400/10 border border-red-400/30 text-red-600'
          }`}>
          <div className="flex items-center justify-center gap-2">
            <span>{messageType === 'success' ? '✓' : '⚠️'}</span>
            <span className="font-medium">{message}</span>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-cloud-500 to-cloud-400 backdrop-blur-md rounded-2xl border border-sandstone-400 shadow-2xl p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-terracotta-400 to-terracotta-600 rounded-xl flex items-center justify-center shadow-lg shadow-terracotta-400/30">
                <span className="text-lg text-white">📝</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-charcoal-700">Create Announcement</h3>
                <p className="text-charcoal-600 text-sm">Share important updates</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={newAnnouncement.title}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-cloud-400 border border-sandstone-400 rounded-lg text-charcoal-700 placeholder-charcoal-500 focus:outline-none focus:ring-2 focus:ring-terracotta-400 focus:border-terracotta-400 transition-all"
                  placeholder="Announcement title"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-2">
                  Content
                </label>
                <textarea
                  value={newAnnouncement.content}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                  className="w-full px-4 py-2.5 bg-cloud-400 border border-sandstone-400 rounded-lg text-charcoal-700 placeholder-charcoal-500 focus:outline-none focus:ring-2 focus:ring-terracotta-400 focus:border-terracotta-400 transition-all resize-none"
                  rows={4}
                  placeholder="Announcement content"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2.5 bg-cloud-400 border border-sandstone-400 text-charcoal-700 rounded-lg hover:bg-sandstone-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAnnouncement}
                disabled={createAnnouncementMutation.isPending}
                className="px-4 py-2.5 bg-gradient-to-r from-terracotta-400 to-terracotta-600 text-white rounded-lg hover:from-terracotta-500 hover:to-terracotta-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-terracotta-400/30"
              >
                {createAnnouncementMutation.isPending ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAnnouncementsList && (
        <div className="space-y-4">
          {announcements.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-cloud-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-sandstone-400">
                <span className="text-2xl">📢</span>
              </div>
              <p className="text-charcoal-600">No announcements yet.</p>
            </div>
          ) : (
            announcements.map((announcement: Announcement) => (
              <div key={announcement.id} className="bg-gradient-to-br from-white to-cloud-400 backdrop-blur-md rounded-2xl border border-sandstone-400 shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="p-6 border-b border-sandstone-400">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-terracotta-400 to-terracotta-600 rounded-xl flex items-center justify-center shadow-lg shadow-terracotta-400/30">
                          <span className="text-lg text-white">📢</span>
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-charcoal-700">{announcement.title}</h4>
                          <div className="flex items-center gap-3 mt-1">
                            <div className="w-6 h-6 bg-sage-400 rounded-full flex items-center justify-center shadow-md shadow-sage-400/30">
                              <span className="text-xs font-semibold text-white">{announcement.adminName.charAt(0)}</span>
                            </div>
                            <span className="text-sm text-charcoal-700">{announcement.adminName}</span>
                            <span className="text-xs text-charcoal-500">{formatDate(announcement.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {(canDeleteAnnouncements) && (
                      <button
                        onClick={() => handleDeleteAnnouncement(announcement.id)}
                        className="text-red-600 hover:text-red-700 p-2 hover:bg-red-400/10 rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                  <div className="text-charcoal-700 leading-relaxed whitespace-pre-wrap">{announcement.content}</div>
                </div>

                <div className="p-6 border-t border-sandstone-400">
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add a comment..."
                        value={newComments[announcement.id] || ''}
                        onChange={(e) => setNewComments(prev => ({ ...prev, [announcement.id]: e.target.value }))}
                        className="flex-1 px-3 py-2.5 bg-cloud-400 border border-sandstone-400 rounded-lg text-charcoal-700 placeholder-charcoal-500 focus:outline-none focus:ring-2 focus:ring-terracotta-400 focus:border-terracotta-400 transition-all"
                      />
                      <button
                        onClick={() => handleComment(announcement.id, newComments[announcement.id])}
                        disabled={isPostingComment === announcement.id}
                        className="px-3 py-2.5 bg-gradient-to-r from-sage-400 to-sage-600 text-white rounded-lg text-sm font-medium hover:from-sage-500 hover:to-sage-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-sage-400/30"
                      >
                        {isPostingComment === announcement.id ? 'Posting...' : 'Comment'}
                      </button>
                    </div>

                    {announcement.comments?.map((comment: Comment) => (
                      <CommentItem
                        key={comment.id}
                        comment={comment}
                        currentUser={currentUser}
                        announcementId={announcement.id}
                        onReply={handleComment}
                        onDelete={handleDeleteComment}
                        newReplies={newReplies}
                        setNewReplies={setNewReplies}
                        isPostingComment={isPostingComment}
                        formatDate={formatDate}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
