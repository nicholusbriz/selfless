'use client';

export const dynamic = 'force-dynamic';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, X, AlertCircle, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/hooks/useAuth';
import { getApiErrorMessage, isJsonObject } from '@/lib/api-response';

interface MediaItem {
  id: string;
  publicUrl: string;
  contentType: string;
  title: string;
  description: string | null;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    profileImageUrl: string | null;
    techCenter?: {
      name: string;
    } | null;
  };
}

function isMediaItem(value: unknown): value is MediaItem {
  if (
    !isJsonObject(value) ||
    typeof value.id !== 'string' ||
    typeof value.publicUrl !== 'string' ||
    typeof value.contentType !== 'string' ||
    typeof value.title !== 'string' ||
    (typeof value.description !== 'string' && value.description !== null) ||
    typeof value.createdAt !== 'string' ||
    !isJsonObject(value.user)
  ) {
    return false;
  }

  const user = value.user;
  return (
    typeof user.id === 'string' &&
    typeof user.firstName === 'string' &&
    typeof user.lastName === 'string' &&
    (typeof user.profileImageUrl === 'string' || user.profileImageUrl === null) &&
    (user.techCenter === undefined ||
      user.techCenter === null ||
      (isJsonObject(user.techCenter) && typeof user.techCenter.name === 'string'))
  );
}

export default function MediaApprovalsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: pendingItems = [], isLoading, error } = useQuery<MediaItem[]>({
    queryKey: ['pending-media'],
    queryFn: async () => {
      const response = await fetch('/api/media/list?status=pending');
      const data = await response.json();
      if (!response.ok) {
        throw new Error(getApiErrorMessage(data, 'Failed to fetch pending media'));
      }
      if (!isJsonObject(data) || !Array.isArray(data.items)) {
        throw new Error('Invalid pending media response');
      }
      return data.items.filter(isMediaItem);
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (mediaId: string) => {
      const response = await fetch(`/api/media/approve/${mediaId}`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to approve');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-media'] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (mediaId: string) => {
      const response = await fetch(`/api/media/approve/${mediaId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to reject');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-media'] });
    },
  });

  if (!user || (user.role !== 'dev' && user.role !== 'super_admin')) {
    return (
      <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-[#A4462F] mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-[#1C1E21]">Access Denied</h2>
          <p className="text-sm text-[#65676B] mt-2">You don&apos;t have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-[520px] bg-[#F0F2F5]">
      <section className="max-w-[680px] mx-auto px-4 py-8">
        <div className="mb-8">
          <p className="mt-2 text-sm text-[#65676B]">
            Review and approve or reject pending posts
          </p>
        </div>

        {isLoading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="flex items-center gap-2 text-[#65676B]">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Loading pending posts...</span>
            </div>
          </div>
        ) : error ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="flex items-center gap-2 text-[#A4462F]">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm">Failed to load pending posts</span>
            </div>
          </div>
        ) : pendingItems.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center text-center bg-white rounded-lg shadow-sm p-8">
            <Check className="h-16 w-16 text-[#55705B] mb-4" />
            <h3 className="text-lg font-semibold text-[#1C1E21]">
              All caught up!
            </h3>
            <p className="mt-2 text-sm text-[#65676B]">
              No pending posts to review.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {pendingItems.map((item) => (
              <div
                key={item.id}
                className="overflow-hidden rounded-lg bg-white shadow-sm"
              >
                {/* Post Header */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-[#E4E6EB]">
                  {item.user.profileImageUrl ? (
                    <Image
                      src={item.user.profileImageUrl}
                      alt={`${item.user.firstName} ${item.user.lastName}`}
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E4E6EB] text-[#65676B]">
                      <span className="text-sm font-semibold">
                        {item.user.firstName[0]}{item.user.lastName[0]}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                      <h4 className="text-sm font-semibold text-[#050505]">
                        {item.user.firstName} {item.user.lastName}
                      </h4>
                      {item.user.techCenter && (
                        <span className="text-xs text-[#65676B]">
                          · {item.user.techCenter.name}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#65676B]">
                      {new Date(item.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                {/* Post Content */}
                <div>
                  {item.description && (
                    <div className="px-4 py-3">
                      <p className="text-sm text-[#050505] whitespace-pre-wrap">
                        {item.description}
                      </p>
                    </div>
                  )}

                  <div className="relative bg-black">
                    {item.contentType.startsWith('video/') ? (
                      <div className="relative aspect-video">
                        <video
                          src={item.publicUrl}
                          controls
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="relative">
                        <Image
                          src={item.publicUrl}
                          alt={item.title}
                          width={680}
                          height={510}
                          className="w-full object-cover"
                        />
                      </div>
                    )}
                  </div>

                  {item.title && (
                    <div className="px-4 py-3 border-t border-[#E4E6EB]">
                      <p className="text-sm font-medium text-[#050505]">{item.title}</p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 px-4 py-3 border-t border-[#E4E6EB] bg-[#F7F6F2]">
                  <button
                    onClick={() => approveMutation.mutate(item.id)}
                    disabled={approveMutation.isPending}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors',
                      'bg-[#17734B] text-white hover:bg-[#145a3a] disabled:opacity-50 disabled:cursor-not-allowed'
                    )}
                  >
                    <Check className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => rejectMutation.mutate(item.id)}
                    disabled={rejectMutation.isPending}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors',
                      'bg-[#A4462F] text-white hover:bg-[#8a3830] disabled:opacity-50 disabled:cursor-not-allowed'
                    )}
                  >
                    <X className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
