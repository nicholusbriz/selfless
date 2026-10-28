'use client';

import { useQueryClient } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';
import { useState } from 'react';

interface PageRefreshButtonProps {
  queryKeys?: string[][];
  className?: string;
  variant?: 'icon' | 'full';
}

export function PageRefreshButton({
  queryKeys,
  className = '',
  variant = 'icon',
}: PageRefreshButtonProps) {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (queryKeys && queryKeys.length > 0) {
        // Refresh specific queries
        await Promise.all(
          queryKeys.map((key) =>
            queryClient.refetchQueries({ queryKey: key })
          )
        );
      } else {
        // Refresh all active queries for current page
        await queryClient.refetchQueries({
          type: 'active',
        });
      }
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={handleRefresh}
        disabled={isRefreshing}
        className={`flex items-center justify-center w-9 h-9 rounded-lg text-[#1A2B4C] hover:text-[#B98A3E] hover:bg-[#F7F6F2] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#B98A3E]/30 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        title="Refresh page"
      >
        <RefreshCw
          className={`w-[18px] h-[18px] ${isRefreshing ? 'animate-spin' : ''}`}
        />
      </button>
    );
  }

  return (
    <button
      onClick={handleRefresh}
      disabled={isRefreshing}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-white/10 ${className}`}
      title="Refresh page"
    >
      <RefreshCw
        className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
      />
      <span className="text-sm font-medium">
        {isRefreshing ? 'Refreshing...' : 'Refresh'}
      </span>
    </button>
  );
}
