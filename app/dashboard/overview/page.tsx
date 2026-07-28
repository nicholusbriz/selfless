'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OverviewPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect all requests to home page
    router.replace('/');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E8A33D] mx-auto mb-4"></div>
        <p className="text-[#A79C8C]">Redirecting to home...</p>
      </div>
    </div>
  );
}
