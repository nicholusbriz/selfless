'use client';

import { useQuery } from '@tanstack/react-query';
import { Heart, Clock } from 'lucide-react';

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
  // Fetch received gifts
  const { data: receivedData, isLoading } = useQuery({
    queryKey: ['gift-received'],
    queryFn: async () => {
      const response = await fetch('/api/gifts/received');
      const result: any = await response.json();
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
    <div className="p-3 sm:p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-xs font-bold text-slate-900">Received Gifts</h3>
          <p className="text-[10px] text-slate-500 mt-0.5">Gifts from other users</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-rose-700">
          <Heart className="h-3 w-3" />
          <span className="text-[10px] font-bold">{receivedGifts.length}</span>
        </div>
      </div>

      {/* Gift List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <p className="text-xs text-slate-500">Loading gifts...</p>
        </div>
      ) : receivedGifts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Heart className="h-9 w-9 text-slate-300 mb-2" />
          <p className="text-xs text-slate-500">No gifts received yet</p>
          <p className="text-[10px] text-slate-400 mt-0.5">When someone sends you a gift, it will appear here</p>
        </div>
      ) : (
        <div className="space-y-2">
          {receivedGifts.map((gift) => (
            <div
              key={gift.id}
              className="rounded-lg border border-slate-200 bg-white p-2.5 transition-all hover:shadow-md hover:border-rose-300"
            >
              <div className="flex items-start gap-2.5">
                {/* Sender Avatar */}
                {gift.senderProfileImage ? (
                  <img
                    src={gift.senderProfileImage}
                    alt={gift.senderName}
                    className="h-8 w-8 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold">
                    {gift.senderName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                )}

                {/* Gift Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-semibold text-slate-900">
                        You received a gift from {gift.senderName}
                      </p>
                      <p className="text-[10px] font-semibold text-indigo-700 mt-0.5">
                        {gift.giftName}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-[9px] text-slate-400">
                      <Clock className="h-2.5 w-2.5" />
                      <span>{formatTime(gift.receivedAt)}</span>
                    </div>
                  </div>
                  {gift.message && (
                    <p className="text-[10px] text-slate-600 italic bg-rose-50/60 rounded-md px-2 py-1 mt-1.5">
                      "{gift.message}"
                    </p>
                  )}
                </div>
                <span className="flex w-12 shrink-0 self-stretch items-center justify-center rounded-xl bg-gradient-to-br from-rose-50 to-pink-50 text-2xl">
                  {gift.emoji}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
