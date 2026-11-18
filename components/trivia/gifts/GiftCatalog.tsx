'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Gift {
  id: string;
  name: string;
  emoji: string;
  cost: number;
  tier: number;
  description: string;
}

const tierLabels = {
  1: 'Budget',
  2: 'Mid',
  3: 'Premium',
  4: 'Rare',
};

const tierColors = {
  1: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  2: 'bg-blue-50 text-blue-700 border-blue-200',
  3: 'bg-purple-50 text-purple-700 border-purple-200',
  4: 'bg-amber-50 text-amber-700 border-amber-200',
};

export default function GiftCatalog({ credits }: { credits: number }) {
  const [selectedTier, setSelectedTier] = useState<number | null>(null);
  const queryClient = useQueryClient();

  // Fetch gift catalog
  const { data: catalogData, isLoading } = useQuery({
    queryKey: ['gift-catalog'],
    queryFn: async () => {
      const response = await fetch('/api/gifts/catalog');
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch catalog');
      }
      return result.gifts as Gift[];
    },
  });

  // Purchase gift mutation
  const purchaseMutation = useMutation({
    mutationFn: async (giftId: string) => {
      const response = await fetch('/api/gifts/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ giftId }),
      });
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to purchase gift');
      }
      return result;
    },
    onSuccess: () => {
      // Invalidate inventory query
      queryClient.invalidateQueries({ queryKey: ['gift-inventory'] });
      // Also invalidate credits to update balance
      queryClient.invalidateQueries({ queryKey: ['user-points'] });
    },
  });

  const gifts = catalogData || [];
  const filteredGifts = selectedTier 
    ? gifts.filter(gift => gift.tier === selectedTier)
    : gifts;

  if (isLoading) {
    return (
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-center py-12">
          <div className="text-sm text-slate-500">Loading gifts...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-5">
      {/* Tier Filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setSelectedTier(null)}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
            selectedTier === null
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          All
        </button>
        {[1, 2, 3, 4].map((tier) => (
          <button
            key={tier}
            onClick={() => setSelectedTier(tier)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
              selectedTier === tier
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {tierLabels[tier as keyof typeof tierLabels]}
          </button>
        ))}
      </div>

      {/* Gift Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {filteredGifts.map((gift) => (
          <div
            key={gift.id}
            className={`relative overflow-hidden rounded-xl border p-3 text-center transition-all hover:scale-105 hover:shadow-lg ${
              tierColors[gift.tier as keyof typeof tierColors]
            }`}
          >
            <div className="text-4xl mb-2">{gift.emoji}</div>
            <h4 className="text-xs font-bold text-slate-900 mb-1">{gift.name}</h4>
            <p className="text-[10px] text-slate-600 mb-2 line-clamp-1">{gift.description}</p>
            <div className="flex items-center justify-center gap-1 rounded-full bg-white/50 px-2 py-1">
              <span className="text-[10px] font-bold text-slate-900">{gift.cost}</span>
              <span className="text-[10px] text-slate-600">credits</span>
            </div>
            <button
              disabled={credits < gift.cost || purchaseMutation.isPending}
              onClick={() => purchaseMutation.mutate(gift.id)}
              className={`mt-2 w-full rounded-lg py-2 text-[10px] font-semibold transition ${
                credits >= gift.cost && !purchaseMutation.isPending
                  ? 'bg-slate-900 text-white hover:bg-slate-800'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {purchaseMutation.isPending ? 'Purchasing...' : credits >= gift.cost ? 'Purchase' : 'Not enough'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
