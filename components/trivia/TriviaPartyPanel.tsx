'use client';

import TriviaSpinWheel from './TriviaSpinWheel';
import { useAuth } from '@/lib/hooks/useAuth';

export default function TriviaPartyPanel() {
  const { user } = useAuth();
  const role = user?.role?.toLowerCase();
  const isDirector = role === 'super_admin' || role === 'superadmin';

  if (!isDirector) return null;

  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-4 py-2">
      <TriviaSpinWheel />
    </div>
  );
}
