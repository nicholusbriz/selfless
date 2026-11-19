'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Gift, Send, Mail } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import VerifiedBadge from '@/components/VerifiedBadge';

interface ConnectionUser {
  id: string;
  name: string;
  profileImage: string | null;
  hasVerifiedBadge?: boolean;
}

interface OwnedGift {
  id: string;
  giftId: string;
  giftName: string;
  emoji: string;
  quantity: number;
  cost: number;
  description?: string | null;
}

// Shape returned by /api/social/connections/[userId]
interface ConnectionRow {
  id: string;
  firstName: string;
  lastName: string;
  profileImageUrl: string | null;
  hasVerifiedBadge?: boolean;
}

export default function GiftSend() {
  const { user: currentUser } = useAuth();
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedGift, setSelectedGift] = useState<string | null>(null);
  const [message, setMessage] = useState('Here is a gift for you!');
  const [activeFilter, setActiveFilter] = useState<'all' | 'following' | 'followers'>('all');
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const showToast = (message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 5000);
  };

  // Fetch people the current user follows
  const { data: followingData } = useQuery({
    queryKey: ['gift-send-following', currentUser?.id],
    enabled: !!currentUser?.id,
    queryFn: async () => {
      const response = await fetch(
        `/api/social/connections/${currentUser!.id}?type=following&limit=100`,
      );
      const result: any = await response.json();
      return (result.connections ?? []) as ConnectionRow[];
    },
  });

  // Fetch people who follow the current user
  const { data: followersData } = useQuery({
    queryKey: ['gift-send-followers'],
    queryFn: async () => {
      const response = await fetch('/api/social/followers?limit=100');
      const result: any = await response.json();
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
      const result: any = await response.json();
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
      const result: any = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to send gift');
      }
      return result;
    },
    onSuccess: () => {
      const sentGift = inventoryData?.find((g) => g.id === selectedGift);
      const sentName = allUsers.find((u) => u.id === selectedUser)?.name ?? 'your friend';
      showToast(`🎁 ${sentGift?.giftName ?? 'Gift'} sent to ${sentName}!`);
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
    hasVerifiedBadge: u.hasVerifiedBadge,
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

  const filteredUsers = availableUsers;

  const inventory = inventoryData || [];
  const filteredInventory = inventory.filter((item) => item.quantity > 0);

  const canSend = selectedUser && selectedGift && message.trim().length > 0;

  return (
    <div className="p-4 sm:p-5">
      {/* Gift Selection */}
      <div className="mb-4">
        <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-400">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[8px] font-bold text-white">1</span>
          Select a gift
        </p>
        {inventoryLoading ? (
          <p className="text-xs text-slate-500">Loading gifts...</p>
        ) : (
          <div className="flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {filteredInventory.map((item) => (
              <div
                key={item.id}
                className={`relative w-[110px] shrink-0 overflow-hidden rounded-lg border p-2 text-center transition-all ${selectedGift === item.id
                  ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500 scale-[1.02]'
                  : item.quantity === 0
                    ? 'border-slate-100 bg-slate-50 opacity-50'
                    : 'border-indigo-100 bg-white hover:border-indigo-300 hover:shadow-md'
                  }`}
              >
                <button
                  onClick={() => item.quantity > 0 && setSelectedGift(item.id)}
                  disabled={item.quantity === 0}
                  className="w-full"
                >
                  <div className="text-xl mb-1">{item.emoji}</div>
                  <p className="text-[10px] font-bold text-slate-900 leading-tight">{item.giftName}</p>
                  {item.description && (
                    <p className="mt-0.5 text-[8px] leading-snug text-slate-500 line-clamp-1">{item.description}</p>
                  )}
                  <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-indigo-50 px-1.5 py-0.5 text-[8px] font-bold text-indigo-700">
                    <Gift className="h-2.5 w-2.5" />
                    {item.quantity} owned
                  </span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filter tabs on top */}
      <div className="mb-3 flex gap-2">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1 rounded-full text-xs font-semibold transition ${activeFilter === 'all'
            ? 'bg-indigo-600 text-white'
            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
        >
          All <span className="ml-1 opacity-70">{allUsers.length}</span>
        </button>
        <button
          onClick={() => setActiveFilter('following')}
          className={`px-3 py-1 rounded-full text-xs font-semibold transition ${activeFilter === 'following'
            ? 'bg-indigo-600 text-white'
            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
        >
          Following <span className="ml-1 opacity-70">{followingUsers.length}</span>
        </button>
        <button
          onClick={() => setActiveFilter('followers')}
          className={`px-3 py-1 rounded-full text-xs font-semibold transition ${activeFilter === 'followers'
            ? 'bg-indigo-600 text-white'
            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
        >
          Followers <span className="ml-1 opacity-70">{followerUsers.length}</span>
        </button>
      </div>

      {/* Choose a friend + dropdown in one row */}
      <div className="mb-4 flex items-center gap-2">
        <span className="flex shrink-0 items-center gap-1.5 text-xs font-semibold text-slate-700">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[8px] font-bold text-white">2</span>
          Send it to
        </span>
        <select
          value={selectedUser ?? ''}
          onChange={(e) => setSelectedUser(e.target.value || null)}
          className="min-w-0 flex-1 appearance-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-medium text-slate-900 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        >
          <option value="" disabled>
            {filteredUsers.length > 0 ? 'Choose who to send to' : 'No users available'}
          </option>
          {filteredUsers.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
              {user.hasVerifiedBadge ? ' ✓' : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Composer - expands when a user is selected */}
      {selectedUser && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50/60 p-2.5">
          <div className="relative min-w-0 flex-1">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Write a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <button
            disabled={!canSend || sendMutation.isPending}
            onClick={() => sendMutation.mutate()}
            className={`shrink-0 inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition ${canSend && !sendMutation.isPending
              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
          >
            <Send className="h-3.5 w-3.5" />
            {sendMutation.isPending ? 'Sending...' : 'Send'}
          </button>
        </div>
      )}

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

      {/* Send toast */}
      {toast && (
        <button
          type="button"
          onClick={() => setToast(null)}
          className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-lg transition hover:bg-slate-800"
        >
          {toast} Tap to dismiss
        </button>
      )}
    </div>
  );
}
