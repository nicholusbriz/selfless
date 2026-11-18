'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Heart, Clock, User } from 'lucide-react';

interface ReceivedGift {
  id: string;
  senderId: string;
  senderName: string;
  senderProfileImage: string | null;
  giftId: string;
  giftName: string;
  emoji: string;
  message: string | null;
  receivedAt: string;
}

export default function GiftReceived() {
  const [selectedGift, setSelectedGift] = useState<string | null>(null);

  // Fetch received gifts
  const { data: receivedData, isLoading } = useQuery({
    queryKey: ['gift-received'],
    queryFn: async () => {
      const response = await fetch('/api/gifts/received');
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch received gifts');
      }
      return result.gifts as ReceivedGift[];
    },
  });

  const receivedGifts = receivedData || [];

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="p-4 sm:p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Received Gifts</h3>
          <p className="text-xs text-slate-500 mt-0.5">Gifts from other users</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1.5 text-rose-700">
          <Heart className="h-3.5 w-3.5" />
          <span className="text-xs font-bold">{receivedGifts.length}</span>
        </div>
      </div>

      {/* Gift List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-sm text-slate-500">Loading gifts...</p>
        </div>
      ) : receivedGifts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Heart className="h-12 w-12 text-slate-300 mb-3" />
          <p className="text-sm text-slate-500">No gifts received yet</p>
          <p className="text-xs text-slate-400 mt-1">When someone sends you a gift, it will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {receivedGifts.map((gift) => (
            <div
              key={gift.id}
              className={`relative rounded-xl border p-3 transition-all hover:shadow-md ${
                selectedGift === gift.id
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-slate-200 bg-white hover:border-indigo-300'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Sender Avatar */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
                  {gift.senderName.split(' ').map((n) => n[0]).join('')}
                </div>

                {/* Gift Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{gift.emoji}</span>
                      <div>
                        <p className="text-xs font-semibold text-slate-900">{gift.giftName}</p>
                        <p className="text-[10px] text-slate-500">from {gift.senderName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400">
                      <Clock className="h-3 w-3" />
                      <span>{formatTime(gift.receivedAt)}</span>
                    </div>
                  </div>
                  {gift.message && (
                    <p className="text-xs text-slate-600 italic bg-slate-50 rounded-lg px-2 py-1 mt-2">
                      "{gift.message}"
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
