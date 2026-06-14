'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, User, Clock, CheckCircle, X, Trash2, Eye, MessageSquare } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phoneNumber: string | null;
  message: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface ApplicationsTabProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export default function ApplicationsTab({ searchTerm, onSearchChange }: ApplicationsTabProps) {
  const queryClient = useQueryClient();
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  const { data: messagesData, isLoading, error, refetch } = useQuery({
    queryKey: ['contact-messages'],
    queryFn: async () => {
      const response = await fetch('/api/contact');
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      const data = await response.json();
      return data.messages || [];
    },
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await fetch(`/api/contact/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error('Failed to update status');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-messages'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/contact/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete message');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-messages'] });
      setSelectedMessage(null);
    },
  });

  const messages = messagesData || [];

  const filteredMessages = messages.filter((msg: ContactMessage) =>
    msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const unreadCount = messages.filter((m: ContactMessage) => m.status === 'unread').length;

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/10 animate-pulse">
            <div className="h-4 bg-white/10 rounded w-1/3 mb-2"></div>
            <div className="h-3 bg-white/10 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-white/10 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-2">Error loading messages</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-3">
            <div className="bg-purple-500/20 p-3 rounded-lg">
              <MessageSquare className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Messages</p>
              <p className="text-2xl font-bold text-white">{messages.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500/20 p-3 rounded-lg">
              <Mail className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Unread</p>
              <p className="text-2xl font-bold text-white">{unreadCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-3">
            <div className="bg-green-500/20 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Read/Replied</p>
              <p className="text-2xl font-bold text-white">{messages.length - unreadCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages List */}
      <div className="space-y-4">
        {filteredMessages.length === 0 ? (
          <div className="text-center py-12">
            <Mail className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No messages found</p>
          </div>
        ) : (
          filteredMessages.map((message: ContactMessage, index: number) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`bg-white/5 backdrop-blur-lg rounded-xl p-4 border ${
                message.status === 'unread' ? 'border-purple-500/30' : 'border-white/10'
              } hover:border-purple-500/50 transition-all`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{message.name}</h3>
                    <p className="text-gray-400 text-sm">{message.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {message.status === 'unread' && (
                    <span className="bg-purple-500/20 text-purple-300 text-xs px-2 py-1 rounded-full">Unread</span>
                  )}
                  <span className="text-gray-500 text-xs flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(message.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <p className="text-gray-300 text-sm mb-3 line-clamp-2">{message.message}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-gray-400 text-sm">
                  {message.phoneNumber && (
                    <div className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      <span>{message.phoneNumber}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedMessage(message)}
                    className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4 text-gray-300" />
                  </button>
                  {message.status === 'unread' && (
                    <button
                      onClick={() => updateStatusMutation.mutate({ id: message.id, status: 'read' })}
                      className="p-2 bg-blue-500/20 rounded-lg hover:bg-blue-500/30 transition-colors"
                      title="Mark as Read"
                    >
                      <CheckCircle className="w-4 h-4 text-blue-400" />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (confirm('Delete this message?')) {
                        deleteMutation.mutate(message.id);
                      }
                    }}
                    className="p-2 bg-red-500/20 rounded-lg hover:bg-red-500/30 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Message Detail Modal */}
      {selectedMessage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedMessage(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full w-12 h-12 flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">{selectedMessage.name}</h3>
                  <p className="text-gray-400 text-sm">{selectedMessage.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMessage(null)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-3 mb-4">
              {selectedMessage.phoneNumber && (
                <div className="flex items-center gap-2 text-gray-300">
                  <Phone className="w-4 h-4" />
                  <span>{selectedMessage.phoneNumber}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-gray-300">
                <Clock className="w-4 h-4" />
                <span>{new Date(selectedMessage.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  selectedMessage.status === 'unread' 
                    ? 'bg-purple-500/20 text-purple-300' 
                    : selectedMessage.status === 'read'
                    ? 'bg-blue-500/20 text-blue-300'
                    : 'bg-green-500/20 text-green-300'
                }`}>
                  {selectedMessage.status.charAt(0).toUpperCase() + selectedMessage.status.slice(1)}
                </span>
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-4 mb-4">
              <p className="text-white text-sm leading-relaxed">{selectedMessage.message}</p>
            </div>

            <div className="flex items-center gap-2">
              {selectedMessage.status === 'unread' && (
                <button
                  onClick={() => {
                    updateStatusMutation.mutate({ id: selectedMessage.id, status: 'read' });
                  }}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Mark as Read
                </button>
              )}
              {selectedMessage.status === 'read' && (
                <button
                  onClick={() => {
                    updateStatusMutation.mutate({ id: selectedMessage.id, status: 'replied' });
                  }}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Mark as Replied
                </button>
              )}
              <button
                onClick={() => {
                  if (confirm('Delete this message?')) {
                    deleteMutation.mutate(selectedMessage.id);
                    setSelectedMessage(null);
                  }
                }}
                className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
