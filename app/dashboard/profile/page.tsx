// app/dashboard/profile/page.tsx
'use client';

import { ArrowLeft, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg bg-[#2A2438]/50 hover:bg-[#2A2438] text-[#A79C8C] hover:text-[#F5F0E8] transition-all duration-200"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        
        <div className="h-8 w-px bg-[#2A2438]" />
        
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#E8A33D]/20 to-[#C97F1F]/10 border border-[#E8A33D]/20">
            <User className="w-6 h-6 text-[#E8A33D]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#F5F0E8]" style={{ fontFamily: 'var(--font-display)' }}>
              My Profile
            </h1>
            <p className="text-sm text-[#A79C8C]">View and manage your personal information</p>
          </div>
        </div>
      </div>

      {/* Placeholder Content */}
      <div className="bg-[#150F20] border border-[#2A2438] rounded-2xl p-8 md:p-12">
        <div className="flex flex-col items-center justify-center text-center py-12 md:py-20">
          <div className="w-16 h-16 rounded-2xl bg-[#E8A33D]/10 border border-[#E8A33D]/20 flex items-center justify-center mb-6">
            <User className="w-8 h-8 text-[#E8A33D] opacity-60" />
          </div>
          
          <h2 className="text-xl font-semibold text-[#F5F0E8] mb-2">
            Profile Page
          </h2>
          
          <p className="text-[#A79C8C]">
            Your profile information will be displayed here.
          </p>
          
          <div className="mt-6 px-4 py-2 bg-[#E8A33D]/5 border border-[#E8A33D]/20 rounded-full">
            <p className="text-[#6B6358] text-sm">🚧 Under construction</p>
          </div>
        </div>
      </div>
    </div>
  );
}