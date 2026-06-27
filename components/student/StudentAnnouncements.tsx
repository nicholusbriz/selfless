'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Calendar, User, X, Save } from 'lucide-react';
import axios from '@/lib/axios';
import { useAuthStore } from '@/stores/authStore';
import LoadingState from '@/components/shared/LoadingState';
import ErrorState from '@/components/shared/ErrorState';
import UserAvatar from '@/components/shared/UserAvatar';

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
  };
}

export default function StudentAnnouncements() {
  const { user } = useAuthStore();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: ''
  });

  const queryClient = useQueryClient();

  const { data: announcementsData, isLoading, error } = useQuery({
    queryKey: ['announcements'],
    queryFn: async () => {
      const response = await axios.get('/api/announcements');
      return response.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await axios.post('/api/announcements', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      setIsCreating(false);
      setFormData({ title: '', content: '' });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await axios.put(`/api/announcements/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      setEditingId(null);
      setFormData({ title: '', content: '' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await axios.delete(`/api/announcements/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    }
  });

  const announcements = announcementsData?.announcements?.filter(
    (announcement: Announcement) => announcement.author.id === user?.id
  ) || [];

  const handleCreate = () => {
    createMutation.mutate(formData);
  };

  const handleUpdate = (id: string) => {
    updateMutation.mutate({ id, data: formData });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this announcement?')) {
      deleteMutation.mutate(id);
    }
  };

  const startEditing = (announcement: Announcement) => {
    setEditingId(announcement.id);
    setFormData({
      title: announcement.title,
      content: announcement.content
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setFormData({ title: '', content: '' });
  };

  if (isLoading) return <LoadingState type="students" />;

  if (error) {
    return <ErrorState message="Failed to load announcements" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Announcements</h2>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Announcement
        </button>
      </div>

      {/* Create/Edit Form */}
      <AnimatePresence>
        {(isCreating || editingId) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                {editingId ? 'Edit Announcement' : 'Create Announcement'}
              </h3>
              <button
                onClick={() => {
                  setIsCreating(false);
                  cancelEditing();
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  placeholder="Enter announcement title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Content</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500 resize-none"
                  placeholder="Enter announcement content"
                />
              </div>

              <button
                onClick={() => editingId ? handleUpdate(editingId) : handleCreate()}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 rounded-lg text-white font-medium transition-colors"
              >
                <Save className="w-4 h-4" />
                {editingId ? 'Update Announcement' : 'Create Announcement'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Announcements List */}
      <div className="space-y-3">
        {announcements.length === 0 && !isCreating && (
          <div className="text-center py-12">
            <p className="text-gray-400">No announcements yet. Create one to get started!</p>
          </div>
        )}

        {announcements.map((announcement: Announcement) => (
          <motion.div
            key={announcement.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="border rounded-xl overflow-hidden bg-white/5 border-white/10"
          >
            <div className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <UserAvatar user={announcement.author} size="sm" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-2">{announcement.title}</h3>
                    
                    <div className="flex items-center gap-3 text-xs text-gray-400 mb-2">
                      <span className="flex items-center gap-1">
                        {announcement.author.firstName} {announcement.author.lastName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(announcement.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-gray-300 text-sm whitespace-pre-wrap">{announcement.content}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => startEditing(announcement)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(announcement.id)}
                    className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-gray-400 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
