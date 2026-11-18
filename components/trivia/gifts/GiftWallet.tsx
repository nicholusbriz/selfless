'use client';

import { Wallet, TrendingUp, History } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

export default function GiftWallet({ credits }: { credits: number }) {
  // Fetch user's trivia points to get total earned
  const { data: userPoints } = useQuery({
    queryKey: ['user-points'],
    queryFn: async () => {
      const response = await fetch('/api/user/trivia-points');
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch points');
      }
      return result.totalPoints as number;
    },
  });

  const totalEarned = userPoints || credits;

  return (
    <div className="p-4 sm:p-5">
      {/* Balance Card */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Wallet className="h-5 w-5" />
          <span className="text-sm font-medium">Your Balance</span>
        </div>
        <p className="text-3xl font-bold tabular-nums">{credits.toLocaleString()}</p>
        <p className="text-xs text-indigo-100 mt-1">credits</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            <span className="text-xs font-semibold text-slate-700">Earned Today</span>
          </div>
          <p className="text-lg font-bold text-slate-900">0</p>
          <p className="text-[10px] text-slate-500">credits</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <History className="h-4 w-4 text-indigo-500" />
            <span className="text-xs font-semibold text-slate-700">Total Earned</span>
          </div>
          <p className="text-lg font-bold text-slate-900">{totalEarned.toLocaleString()}</p>
          <p className="text-[10px] text-slate-500">credits</p>
        </div>
      </div>

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
