'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { useActivityTracker } from '@/lib/hooks/useActivityTracker';

export function ActivityTracker() {
  const { user } = useAuth();
  useActivityTracker(Boolean(user?.id));

  return null;
}
