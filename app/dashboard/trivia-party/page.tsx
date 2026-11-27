'use client';

import Link from 'next/link';
import { ArrowLeft, LoaderCircle } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import TriviaPartyPanel from '@/components/trivia/TriviaPartyPanel';

export default function TriviaPartyPage() {
  const { user, isLoading } = useAuth();
  const role = user?.role?.toLowerCase();
  const isDirector = role === 'super_admin' || role === 'superadmin';

  if (isLoading) {
    return (
      <main className="flex min-h-[calc(100dvh-5rem)] items-center justify-center">
        <LoaderCircle className="h-6 w-6 animate-spin text-slate-400" />
      </main>
    );
  }

  if (!isDirector) {
    return (
      <main className="flex min-h-[calc(100dvh-5rem)] items-center justify-center px-6">
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-700">Directors only</p>
          <Link
            href="/dashboard"
            className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to dashboard
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-[calc(100dvh-5rem)] w-full flex-col overflow-y-auto bg-white">
      <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-4 py-3 sm:px-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 transition hover:text-slate-950"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to dashboard
        </Link>
        <h1 className="text-sm font-bold text-slate-900">End of Year Party</h1>
      </div>
      <TriviaPartyPanel showFullPictureCards />
    </main>
  );
}
