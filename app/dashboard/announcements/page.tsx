'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Home, Plus, Trash2, Edit, Bell, Calendar, ChevronDown, ChevronUp, Loader2, X, AlertCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/hooks/useAuth';
import axios from 'axios';

interface Announcement {
  id: string;
  title: string;
  content: string;
  deadline: string | null;
  isGlobal: boolean;
  createdAt: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    profileImageUrl: string | null;
    role: {
      name: string;
      displayName: string;
    };
  };
  techCenter: {
    id: string;
    name: string;
  } | null;
}

export default function AnnouncementsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [expandedAnnouncement, setExpandedAnnouncement] = useState<string | null>(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    deadline: '',
    isGlobal: false
  });

  // Fetch announcements
  const { data, isLoading, error } = useQuery({
    queryKey: ['announcements'],
    queryFn: async () => {
      const response = await axios.get('/api/announcements');
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const currentUser = data?.currentUser;
  const announcements = data?.announcements || [];

  // Fetch announcement count for navigation badge
  const { data: announcementCount } = useQuery({
    queryKey: ['announcements', 'count'],
    queryFn: async () => {
      try {
        const response = await axios.get('/api/announcements');
        return response.data.announcements?.length || 0;
      } catch (error) {
        console.error('Error fetching announcement count:', error);
        return 0;
      }
    },
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  // Create announcement mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await axios.post('/api/announcements', data);
      return response.data;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['announcements'] });
      const previousData = queryClient.getQueryData(['announcements']);
      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['announcements'], context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      queryClient.invalidateQueries({ queryKey: ['announcements', 'count'] });
    },
  });

  // Update announcement mutation
  const updateMutation = useMutation({
    mutationFn: async ({ announcementId, data }: { announcementId: string; data: any }) => {
      const response = await axios.put(`/api/announcements/${announcementId}`, data);
      return response.data;
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['announcements'] });
      const previousData = queryClient.getQueryData(['announcements']);
      
      queryClient.setQueryData(['announcements'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          announcements: old.announcements.map((a: Announcement) => 
            a.id === variables.announcementId 
              ? { 
                  ...a, 
                  title: variables.data.title || a.title,
                  content: variables.data.content || a.content,
                  deadline: variables.data.deadline ? new Date(variables.data.deadline) : a.deadline,
                  isGlobal: variables.data.isGlobal !== undefined ? variables.data.isGlobal : a.isGlobal
                }
              : a
          )
        };
      });
      
      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['announcements'], context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      queryClient.invalidateQueries({ queryKey: ['announcements', 'count'] });
    },
  });
  const deleteMutation = useMutation({
    mutationFn: async (announcementId: string) => {
      const response = await axios.delete(`/api/announcements/${announcementId}`);
      return response.data;
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['announcements'] });
      const previousData = queryClient.getQueryData(['announcements']);
      
      queryClient.setQueryData(['announcements'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          announcements: old.announcements.filter((a: Announcement) => a.id !== variables)
        };
      });
      
      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['announcements'], context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      queryClient.invalidateQueries({ queryKey: ['announcements', 'count'] });
    },
  });

  const handleCreateAnnouncement = async () => {
    if (!formData.title || !formData.content) {
      alert('Please fill in title and description');
      return;
    }
    
    try {
      await createMutation.mutateAsync(formData);
      setShowCreateForm(false);
      setFormData({ title: '', content: '', deadline: '', isGlobal: false });
    } catch (error) {
      console.error('Failed to create announcement:', error);
    }
  };

  const handleEditAnnouncement = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      deadline: announcement.deadline ? announcement.deadline.slice(0, 16) : '',
      isGlobal: announcement.isGlobal
    });
    setShowEditForm(true);
  };

  const handleUpdateAnnouncement = async () => {
    if (!editingAnnouncement || !formData.title || !formData.content) {
      alert('Please fill in title and description');
      return;
    }
    
    try {
      await updateMutation.mutateAsync({
        announcementId: editingAnnouncement.id,
        data: formData
      });
      setShowEditForm(false);
      setEditingAnnouncement(null);
      setFormData({ title: '', content: '', deadline: '', isGlobal: false });
    } catch (error) {
      console.error('Failed to update announcement:', error);
    }
  };

  const handleDeleteAnnouncement = async (announcementId: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    
    try {
      await deleteMutation.mutateAsync(announcementId);
    } catch (error) {
      console.error('Failed to delete announcement:', error);
    }
  };

  const toggleExpand = (announcementId: string) => {
    setExpandedAnnouncement(expandedAnnouncement === announcementId ? null : announcementId);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOwner = (announcement: Announcement) => {
    return announcement.author.id === user?.id;
  };

  const canDelete = (announcement: Announcement) => {
    return isOwner(announcement) || currentUser?.isAdmin;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-6 bg-[#0D1117]">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[#150F20] border border-[#2A2438] rounded-xl p-6 h-32" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0D1117]">
        <div className="text-center">
          <p className="text-[#FB7185]">Failed to load announcements</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D1117]">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 p-6">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg bg-[#2A2438]/50 hover:bg-[#2A2438] text-[#A79C8C] hover:text-[#F5F0E8] transition-all duration-200"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        
        <button
          onClick={() => router.push('/dashboard')}
          className="p-2 rounded-lg bg-[#2A2438]/50 hover:bg-[#2A2438] text-[#A79C8C] hover:text-[#F5F0E8] transition-all duration-200"
        >
          <Home className="w-5 h-5" />
        </button>
        
        <div className="h-8 w-px bg-[#2A2438]" />
        
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#E8A33D]/10 border border-[#E8A33D]/20">
            <Bell className="w-6 h-6 text-[#E8A33D]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#F5F0E8]" style={{ fontFamily: 'var(--font-display)' }}>
              Announcements
            </h1>
            <p className="text-sm text-[#A79C8C]">{announcements.length} announcement{announcements.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 pb-8">
        {/* Create Button */}
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="w-full bg-gradient-to-r from-[#E8A33D] to-[#C97F1F] text-[#0B0912] rounded-xl p-4 font-medium hover:shadow-lg hover:shadow-[#E8A33D]/30 transition-all flex items-center justify-center gap-2 mb-8"
        >
          <Plus className="w-5 h-5" />
          Create Announcement
        </button>

        {/* Create Form */}
        <AnimatePresence>
          {showCreateForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-[#150F20] border border-[#2A2438] rounded-xl p-6 mb-8"
            >
              <h3 className="text-lg font-semibold text-[#F5F0E8] mb-4">Create Announcement</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-[#A79C8C] mb-2">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 bg-[#0B0912]/60 border border-[#2A2438] rounded-xl text-[#F5F0E8] placeholder-[#6B6358] focus:outline-none focus:ring-2 focus:ring-[#E8A33D]/40 focus:border-[#E8A33D]/40 transition-all"
                    placeholder="Announcement title"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#A79C8C] mb-2">Description</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full px-4 py-3 bg-[#0B0912]/60 border border-[#2A2438] rounded-xl text-[#F5F0E8] placeholder-[#6B6358] focus:outline-none focus:ring-2 focus:ring-[#E8A33D]/40 focus:border-[#E8A33D]/40 transition-all min-h-[120px]"
                    placeholder="Announcement description"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#A79C8C] mb-2">Deadline (Optional)</label>
                  <div className="relative">
                    <input
                      type="datetime-local"
                      value={formData.deadline}
                      onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                      className="w-full px-4 py-3 bg-[#0B0912]/60 border border-[#2A2438] rounded-xl text-[#F5F0E8] focus:outline-none focus:ring-2 focus:ring-[#E8A33D]/40 focus:border-[#E8A33D]/40 transition-all cursor-pointer"
                      min={new Date().toISOString().slice(0, 16)}
                    />
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A79C8C] pointer-events-none" />
                  </div>
                  <p className="text-xs text-[#6B6358] mt-1">Click to open calendar and pick date/time</p>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isGlobal"
                    checked={formData.isGlobal}
                    onChange={(e) => setFormData({ ...formData, isGlobal: e.target.checked })}
                    className="w-5 h-5 rounded"
                  />
                  <label htmlFor="isGlobal" className="text-sm text-[#A79C8C]">
                    Global announcement (visible to all tech centers)
                  </label>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleCreateAnnouncement}
                    disabled={createMutation.isPending}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-[#E8A33D] to-[#C97F1F] text-[#0B0912] rounded-xl font-medium hover:shadow-lg hover:shadow-[#E8A33D]/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {createMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Create Announcement'
                    )}
                  </button>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-3 bg-[#2A2438]/50 border border-[#2A2438] text-[#A79C8C] rounded-xl hover:bg-[#2A2438] transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit Form */}
        <AnimatePresence>
          {showEditForm && editingAnnouncement && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-[#150F20] border border-[#2A2438] rounded-xl p-6 mb-8"
            >
              <h3 className="text-lg font-semibold text-[#F5F0E8] mb-4">Edit Announcement</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-[#A79C8C] mb-2">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 bg-[#0B0912]/60 border border-[#2A2438] rounded-xl text-[#F5F0E8] placeholder-[#6B6358] focus:outline-none focus:ring-2 focus:ring-[#E8A33D]/40 focus:border-[#E8A33D]/40 transition-all"
                    placeholder="Announcement title"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#A79C8C] mb-2">Description</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full px-4 py-3 bg-[#0B0912]/60 border border-[#2A2438] rounded-xl text-[#F5F0E8] placeholder-[#6B6358] focus:outline-none focus:ring-2 focus:ring-[#E8A33D]/40 focus:border-[#E8A33D]/40 transition-all min-h-[120px]"
                    placeholder="Announcement description"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#A79C8C] mb-2">Deadline (Optional)</label>
                  <div className="relative">
                    <input
                      type="datetime-local"
                      value={formData.deadline}
                      onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                      className="w-full px-4 py-3 bg-[#0B0912]/60 border border-[#2A2438] rounded-xl text-[#F5F0E8] focus:outline-none focus:ring-2 focus:ring-[#E8A33D]/40 focus:border-[#E8A33D]/40 transition-all cursor-pointer"
                      min={new Date().toISOString().slice(0, 16)}
                    />
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A79C8C] pointer-events-none" />
                  </div>
                  <p className="text-xs text-[#6B6358] mt-1">Click to open calendar and pick date/time</p>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isGlobalEdit"
                    checked={formData.isGlobal}
                    onChange={(e) => setFormData({ ...formData, isGlobal: e.target.checked })}
                    className="w-5 h-5 rounded"
                  />
                  <label htmlFor="isGlobalEdit" className="text-sm text-[#A79C8C]">
                    Global announcement (visible to all tech centers)
                  </label>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleUpdateAnnouncement}
                    disabled={updateMutation.isPending}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-[#E8A33D] to-[#C97F1F] text-[#0B0912] rounded-xl font-medium hover:shadow-lg hover:shadow-[#E8A33D]/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {updateMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Update Announcement'
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowEditForm(false);
                      setEditingAnnouncement(null);
                      setFormData({ title: '', content: '', deadline: '', isGlobal: false });
                    }}
                    className="px-4 py-3 bg-[#2A2438]/50 border border-[#2A2438] text-[#A79C8C] rounded-xl hover:bg-[#2A2438] transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Announcements List */}
        {announcements.length === 0 ? (
          <div className="bg-[#150F20] border border-[#2A2438] rounded-xl p-8 text-center">
            <Bell className="w-12 h-12 text-[#A79C8C] mx-auto mb-3" />
            <p className="text-[#A79C8C]">No announcements yet</p>
            <p className="text-sm text-[#6B6358] mt-1">Be the first to create an announcement!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {announcements.map((announcement: Announcement) => (
              <motion.div
                key={announcement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#150F20] border border-[#2A2438] rounded-xl overflow-hidden"
              >
                {/* Header */}
                <div 
                  className="p-4 cursor-pointer hover:bg-[#1A1525] transition-colors"
                  onClick={() => toggleExpand(announcement.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      {/* Profile Image */}
                      {announcement.author.profileImageUrl ? (
                        <img
                          src={announcement.author.profileImageUrl}
                          alt={announcement.author.firstName}
                          className="w-10 h-10 rounded-full object-cover flex-shrink-0 border-2 border-[#2A2438]"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E8A33D] to-[#C97F1F] flex items-center justify-center text-[#0B0912] font-semibold flex-shrink-0 border-2 border-[#2A2438]">
                          {announcement.author.firstName.charAt(0)}{announcement.author.lastName.charAt(0)}
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          {announcement.isGlobal && (
                            <span className="px-2 py-1 bg-[#E8A33D]/20 border border-[#E8A33D]/30 rounded-full text-xs text-[#E8A33D]">
                              Global
                            </span>
                          )}
                          {announcement.techCenter && (
                            <span className="px-2 py-1 bg-[#14B8A6]/20 border border-[#14B8A6]/30 rounded-full text-xs text-[#14B8A6]">
                              {announcement.techCenter.name}
                            </span>
                          )}
                          <h3 className="text-lg font-semibold text-[#F5F0E8]">{announcement.title}</h3>
                        </div>
                        
                        <div className="flex items-center gap-3 text-sm text-[#A79C8C] flex-wrap">
                          <span>{announcement.author.firstName} {announcement.author.lastName}</span>
                          <span>•</span>
                          <span>{announcement.author.role.displayName}</span>
                          {announcement.deadline && (
                            <>
                              <span>•</span>
                              <Calendar className="w-4 h-4" />
                              <span>Deadline: {formatDate(announcement.deadline)}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button className="p-1 rounded hover:bg-[#2A2438] transition-colors">
                        {expandedAnnouncement === announcement.id ? (
                          <ChevronUp className="w-5 h-5 text-[#A79C8C]" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-[#A79C8C]" />
                        )}
                      </button>
                      
                      {isOwner(announcement) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditAnnouncement(announcement);
                          }}
                          className="p-1 rounded hover:bg-[#E8A33D]/20 text-[#E8A33D] transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                      
                      {canDelete(announcement) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAnnouncement(announcement.id);
                          }}
                          disabled={deleteMutation.isPending}
                          className="p-1 rounded hover:bg-[#FB7185]/20 text-[#FB7185] transition-colors disabled:opacity-50"
                        >
                          {deleteMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expandable Content */}
                <AnimatePresence>
                  {expandedAnnouncement === announcement.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-[#2A2438] px-4 py-4"
                    >
                      <div className="pl-16">
                        <p className="text-[#A79C8C] whitespace-pre-wrap">{announcement.content}</p>
                        <p className="text-xs text-[#6B6358] mt-2">
                          Created: {formatDate(announcement.createdAt)}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}