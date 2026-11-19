'use client';

import { useQuery } from '@tanstack/react-query';
import { Send, Clock } from 'lucide-react';

interface SentGift {
  id: string;
  recipientId: string;
  recipientName: string;
  recipientProfileImage: string | null;
  giftId: string;
  giftName: string;
  emoji: string;
  message: string | null;
  sentAt: string;
}

export default function GiftSent() {
  const { data: sentData, isLoading } = useQuery({
    queryKey: ['gift-sent'],
    queryFn: async () => {
      const response = await fetch('/api/gifts/sent');
      const result: any = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch sent gifts');
      }
      return result.gifts as SentGift[];
    },
  });

  const sentGifts = sentData || [];

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
          <h3 className="text-xs font-bold text-slate-900">Sent Gifts</h3>
          <p className="text-[10px] text-slate-500 mt-0.5">Gifts you have sent</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-indigo-700">
          <Send className="h-3 w-3" />
          <span className="text-[10px] font-bold">{sentGifts.length}</span>
        </div>
      </div>

      {/* Gift List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <p className="text-sm text-slate-500">Loading gifts...</p>
        </div>
      ) : sentGifts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Send className="h-9 w-9 text-slate-300 mb-2" />
          <p className="text-xs text-slate-500">No gifts sent yet</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Gifts you send will appear here</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sentGifts.map((gift) => (
            <div
              key={gift.id}
              className="rounded-lg border border-slate-200 bg-white p-2.5 transition-all hover:shadow-md hover:border-indigo-300"
            >
              <div className="flex items-start gap-3">
                {/* Recipient Avatar */}
                {gift.recipientProfileImage ? (
                  <img
                    src={gift.recipientProfileImage}
                    alt={gift.recipientName}
                    className="h-8 w-8 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
                    {gift.recipientName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                )}

                {/* Gift Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <p className="text-[11px] font-semibold text-slate-900">
                        You sent a gift to {gift.recipientName}
                      </p>
                      <p className="text-[10px] text-slate-600 mt-0.5">
                        <span className="font-semibold text-indigo-700">{gift.giftName}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-[9px] text-slate-400">
                      <Clock className="h-3 w-3" />
                      <span>{formatTime(gift.sentAt)}</span>
                    </div>
                  </div>
                  {gift.message && (
                    <p className="text-[10px] text-slate-600 italic bg-slate-50 rounded-md px-2 py-1 mt-1.5">
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
