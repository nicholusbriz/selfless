'use client';

import { Wallet, History, Gift as GiftIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface InventoryItem {
  id: string;
  giftId: string;
  giftName: string;
  emoji: string;
  quantity: number;
  cost: number;
  purchasedAt: string;
}

export default function GiftWallet({ credits }: { credits: number }) {
  // Fetch user's trivia points to get total earned
  const { data: userPoints } = useQuery({
    queryKey: ['user-points'],
    queryFn: async () => {
      const response = await fetch('/api/user/trivia-points');
      const result: any = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch points');
      }
      return (result.triviaPoints ?? credits) as number;
    },
  });

  const totalEarned = userPoints || credits;
  const spentOnGifts = Math.max(0, totalEarned - credits);
  const spentUsd = spentOnGifts / 10;
  const spentUgx = spentUsd * 3700;

  // Fetch purchase history (inventory records)
  const { data: inventoryData } = useQuery({
    queryKey: ['gift-inventory'],
    queryFn: async () => {
      const response = await fetch('/api/gifts/inventory');
      const result: any = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch inventory');
      }
      return result.inventory as InventoryItem[];
    },
  });
  const purchases = inventoryData || [];

  return (
    <div className="p-4 sm:p-5">
      {/* Balance Card */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Wallet className="h-5 w-5" />
          <span className="text-sm font-medium">Your Balance</span>
        </div>
        <p className="text-3xl font-bold tabular-nums">{credits.toLocaleString()}</p>
        <p className="text-xs text-indigo-100 mt-1">credits exchanged from points · used to purchase gifts</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <GiftIcon className="h-4 w-4 text-rose-500" />
            <span className="text-xs font-semibold text-slate-700">Spent on Gifts</span>
          </div>
          <p className="text-lg font-bold text-slate-900">{spentOnGifts.toLocaleString()}</p>
          <p className="text-[10px] text-slate-500">
            credits · ${spentUsd.toFixed(2)} · USh {Math.round(spentUgx).toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <History className="h-4 w-4 text-indigo-500" />
            <span className="text-xs font-semibold text-slate-700">Total Earned Points</span>
          </div>
          <p className="text-lg font-bold text-slate-900">{totalEarned.toLocaleString()}</p>
        </div>
      </div>

      {/* Purchase History */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 mb-4">
        <h3 className="text-xs font-bold text-slate-900 mb-3 flex items-center gap-1.5">
          <History className="h-3.5 w-3.5 text-indigo-500" />
          Purchase history
        </h3>
        {purchases.length === 0 ? (
          <p className="text-xs text-slate-400">No purchases yet</p>
        ) : (
          <div className="space-y-2">
            {purchases.map((item) => (
              <div key={item.id} className="flex items-center gap-2.5 rounded-lg bg-slate-50 px-3 py-2">
                <span className="text-xl">{item.emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-900 truncate">
                    {item.giftName} <span className="text-slate-400 font-normal">x{item.quantity}</span>
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {(item.cost * item.quantity).toLocaleString()} credits • {new Date(item.purchasedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Credit value */}
      {(() => {
        const usd = totalEarned / 10;
        return (
          <div className="rounded-xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-teal-50 p-4 mb-4">
            <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-600 mb-2">
              Your credits exchanged into US dollars · 10 credits = $1
            </p>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-lg font-bold text-slate-900">${usd.toFixed(2)}</p>
                <p className="text-[10px] text-slate-500">USD</p>
              </div>
              <button
                type="button"
                disabled
                title="Withdrawals are coming soon"
                className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white opacity-50 cursor-not-allowed"
              >
                Withdraw
              </button>
            </div>
          </div>
        );
      })()}

      {/* Info */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <h3 className="text-xs font-bold text-slate-900 mb-2">How to Earn Credits</h3>
        <ul className="space-y-2 text-xs text-slate-600">
          <li className="flex items-start gap-2">
            <span className="text-indigo-500">•</span>
            <span>Play trivia games and answer correctly</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-500">•</span>
            <span>Build streaks for bonus points</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-500">•</span>
            <span>Complete daily challenges</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
