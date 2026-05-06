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
    <div className={`ml-${depth * 4} mt-2 p-3 bg-gray-50 rounded-lg border-l-2 border-gray-200`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm text-gray-900">{reply.userName}</span>
            <span className="text-xs text-gray-400">{formatDate(reply.createdAt)}</span>
          </div>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{reply.content}</p>
        </div>
        {(isOwnReply) && (
          <button
            onClick={() => onDelete(reply.id)}
            className="text-red-500 hover:text-red-700 text-sm p-1 hover:bg-red-50 rounded transition-colors"
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
        <div className="mt-2">
          <button
            onClick={() => setShowReplyInput(!showReplyInput)}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Reply
          </button>
          {showReplyInput && (
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                placeholder="Write a reply..."
                value={newReplies[reply.id] || ''}
                onChange={(e) => setNewReplies((prev: { [key: string]: string }) => ({ ...prev, [reply.id]: e.target.value }))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleReply}
                disabled={isPostingComment === reply.id}
                className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
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
    <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900">{comment.userName}</span>
          <span className="text-xs text-gray-400">{formatDate(comment.createdAt)}</span>
        </div>
        {(isOwnComment) && (
          <button
            onClick={() => onDelete(comment.id)}
            className="text-red-500 hover:text-red-700 text-sm p-1 hover:bg-red-50 rounded transition-colors"
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
      <p className="text-gray-700 whitespace-pre-wrap mb-3">{comment.content}</p>

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

      <div className="mt-3">
        <button
          onClick={() => setShowReplyInput(!showReplyInput)}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          Reply
        </button>
        {showReplyInput && (
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              placeholder="Write a reply..."
              value={newReplies[comment.id] || ''}
              onChange={(e) => setNewReplies((prev: { [key: string]: string }) => ({ ...prev, [comment.id]: e.target.value }))}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleReply}
              disabled={isPostingComment === comment.id}
              className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-2">Loading announcements...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-800">Announcements</h3>
        {canCreateAnnouncements && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <span className="text-lg">+</span>
            Create Announcement
          </button>
        )}
      </div>

      {message && (
        <div className={`p-3 rounded-lg ${messageType === 'success'
          ? 'bg-green-100 text-green-800 border border-green-200'
          : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
          {message}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Create Announcement</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={newAnnouncement.title}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Announcement title"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content
                </label>
                <textarea
                  value={newAnnouncement.content}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Announcement content"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAnnouncement}
                disabled={createAnnouncementMutation.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
            <p className="text-gray-500 text-center py-8">No announcements yet.</p>
          ) : (
            announcements.map((announcement: Announcement) => (
              <div key={announcement.id} className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">{announcement.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-gray-600">{announcement.adminName}</span>
                      <span className="text-xs text-gray-400">{formatDate(announcement.createdAt)}</span>
                    </div>
                  </div>
                  {(canDeleteAnnouncements) && (
                    <button
                      onClick={() => handleDeleteAnnouncement(announcement.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  )}
                </div>

                <div className="text-gray-700 whitespace-pre-wrap mb-4">{announcement.content}</div>

                <div className="border-t pt-4">
                  <div className="mt-4 space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add a comment..."
                        value={newComments[announcement.id] || ''}
                        onChange={(e) => setNewComments(prev => ({ ...prev, [announcement.id]: e.target.value }))}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => handleComment(announcement.id, newComments[announcement.id])}
                        disabled={isPostingComment === announcement.id}
                        className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
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
