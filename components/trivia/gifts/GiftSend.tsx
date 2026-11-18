'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Send, Mail } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';

interface ConnectionUser {
  id: string;
  name: string;
  profileImage: string | null;
}

interface OwnedGift {
  id: string;
  giftId: string;
  giftName: string;
  emoji: string;
  quantity: number;
}

// Shape returned by /api/social/connections/[userId]
interface ConnectionRow {
  id: string;
  firstName: string;
  lastName: string;
  profileImageUrl: string | null;
}

export default function GiftSend() {
  const { user: currentUser } = useAuth();
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedGift, setSelectedGift] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'following' | 'followers'>('all');
  const queryClient = useQueryClient();

  // Fetch people the current user follows
  const { data: followingData } = useQuery({
    queryKey: ['gift-send-following', currentUser?.id],
    enabled: !!currentUser?.id,
    queryFn: async () => {
      const response = await fetch(
        `/api/social/connections/${currentUser!.id}?type=following&limit=100`,
      );
      const result = await response.json();
      return (result.connections ?? []) as ConnectionRow[];
    },
  });

  // Fetch people who follow the current user
  const { data: followersData } = useQuery({
    queryKey: ['gift-send-followers'],
    queryFn: async () => {
      const response = await fetch('/api/social/followers?limit=100');
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch followers');
      }
      return result.followers as ConnectionUser[];
    },
  });

  // Fetch gift inventory
  const { data: inventoryData, isLoading: inventoryLoading } = useQuery({
    queryKey: ['gift-inventory'],
    queryFn: async () => {
      const response = await fetch('/api/gifts/inventory');
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch inventory');
      }
      return result.inventory as OwnedGift[];
    },
  });

  // Send gift mutation
  const sendMutation = useMutation({
    mutationFn: async () => {
      if (!selectedUser || !selectedGift) {
        throw new Error('Please select a recipient and gift');
      }
      const gift = inventoryData?.find((g) => g.id === selectedGift);
      if (!gift) {
        throw new Error('Gift not found');
      }
      const response = await fetch('/api/gifts/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId: selectedUser,
          giftId: gift.giftId,
          message: message || null,
        }),
      });
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to send gift');
      }
      return result;
    },
    onSuccess: () => {
      // Invalidate inventory and received gifts queries
      queryClient.invalidateQueries({ queryKey: ['gift-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['gift-received'] });
      queryClient.invalidateQueries({ queryKey: ['gift-sent'] });
      // Reset form
      setSelectedUser(null);
      setSelectedGift(null);
      setMessage('');
    },
  });

  const followingUsers: ConnectionUser[] = (followingData ?? []).map((u) => ({
    id: u.id,
    name: `${u.firstName} ${u.lastName}`.trim(),
    profileImage: u.profileImageUrl,
  }));
  const followerUsers: ConnectionUser[] = followersData ?? [];

  // Deduplicate: a mutual connection appears in both lists; show them once in 'all'
  const seenIds = new Set<string>();
  const allUsers: Array<ConnectionUser & { type: 'following' | 'follower' }> = [];
  for (const u of followingUsers) {
    seenIds.add(u.id);
    allUsers.push({ ...u, type: 'following' });
  }
  for (const u of followerUsers) {
    if (!seenIds.has(u.id)) allUsers.push({ ...u, type: 'follower' });
  }

  const availableUsers =
    activeFilter === 'all'
      ? allUsers
      : activeFilter === 'following'
        ? followingUsers.map((u) => ({ ...u, type: 'following' as const }))
        : followerUsers.map((u) => ({ ...u, type: 'follower' as const }));

  const filteredUsers = availableUsers.filter((u) =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const inventory = inventoryData || [];
  const filteredInventory = inventory.filter((item) => item.quantity > 0);

  const canSend = selectedUser && selectedGift && message.trim().length > 0;

  return (
    <div className="p-4 sm:p-5">
      {/* Search Users */}
      <div className="mb-4">
        <h3 className="text-sm font-bold text-slate-900 mb-2">Send to</h3>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-2">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition ${activeFilter === 'all'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveFilter('following')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition ${activeFilter === 'following'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
          >
            Following
          </button>
          <button
            onClick={() => setActiveFilter('followers')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition ${activeFilter === 'followers'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
          >
            Followers
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </div>
      </div>

      {/* User List */}
      <div className="mb-4 max-h-32 overflow-y-auto">
        {filteredUsers.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-4">
            {followingData || followersData ? 'No users found' : 'Loading users...'}
          </p>
        ) : (
          <div className="space-y-2">
            {filteredUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => setSelectedUser(user.id)}
                className={`flex items-center gap-2 w-full rounded-lg border p-2 text-left transition ${selectedUser === user.id
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-slate-200 bg-white hover:border-indigo-300'
                  }`}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
                  {user.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <span className="text-xs font-medium text-slate-900">{user.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Gift Selection */}
      <div className="mb-4">
        <h3 className="text-sm font-bold text-slate-900 mb-2">Select Gift</h3>
        {inventoryLoading ? (
          <p className="text-xs text-slate-500">Loading gifts...</p>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {filteredInventory.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedGift(item.id)}
                disabled={item.quantity === 0}
                className={`relative rounded-lg border p-2 text-center transition-all hover:scale-105 ${selectedGift === item.id
                  ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500'
                  : item.quantity === 0
                    ? 'border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed'
                    : 'border-slate-200 bg-white hover:border-indigo-300'
                  }`}
              >
                <div className="text-2xl mb-1">{item.emoji}</div>
                <p className="text-[10px] font-semibold text-slate-900">{item.giftName}</p>
                <p className="text-[9px] text-slate-500">x{item.quantity}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="mb-4">
        <h3 className="text-sm font-bold text-slate-900 mb-2">Message (optional)</h3>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Add a personal message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </div>
      </div>

      {/* Send Button */}
      <button
        disabled={!canSend || sendMutation.isPending}
        onClick={() => sendMutation.mutate()}
        className={`w-full flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold transition ${canSend && !sendMutation.isPending
          ? 'bg-indigo-600 text-white hover:bg-indigo-700'
          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
      >
        <Send className="h-4 w-4" />
        {sendMutation.isPending ? 'Sending...' : 'Send Gift'}
      </button>

      {/* Selection Summary */}
      {(selectedUser || selectedGift) && (
        <div className="mt-4 border-t border-slate-100 pt-3">
          <p className="text-xs text-slate-500">
            {selectedUser && (
              <span>To: <span className="font-semibold text-slate-900">
                {allUsers.find((u) => u.id === selectedUser)?.name}
              </span></span>
            )}
            {selectedUser && selectedGift && ' • '}
            {selectedGift && (
              <span>Gift: <span className="font-semibold text-slate-900">
                {inventory.find((i) => i.id === selectedGift)?.emoji}{' '}
                {inventory.find((i) => i.id === selectedGift)?.giftName}
              </span></span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
