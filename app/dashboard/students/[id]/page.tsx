// app/dashboard/students/[id]/page.tsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Mail, ArrowLeft, BookOpen, Award, Calendar } from 'lucide-react';

export default function StudentProfilePage() {
  const params = useParams();
  const router = useRouter();

  return (
    <div className="min-h-screen">
      {/* Header with Back Button */}
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
              Student Profile
            </h1>
            <p className="text-sm text-[#A79C8C]">View student information and academic progress</p>
          </div>
        </div>
      </div>

      {/* Student ID Badge */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#2A2438] rounded-lg">
          <span className="text-xs text-[#6B6358]">Student ID:</span>
          <span className="text-sm font-medium text-[#F5F0E8]">{params.id?.toString().slice(0, 8) || 'Loading...'}</span>
        </div>
      </div>

      {/* Placeholder Content */}
      <div className="bg-[#150F20] border border-[#2A2438] rounded-2xl p-8 md:p-12">
        <div className="flex flex-col items-center justify-center text-center py-12 md:py-20">
          <div className="w-16 h-16 rounded-2xl bg-[#E8A33D]/10 border border-[#E8A33D]/20 flex items-center justify-center mb-6">
            <User className="w-8 h-8 text-[#E8A33D] opacity-60" />
          </div>
          
          <h2 className="text-xl font-semibold text-[#F5F0E8] mb-2">
            Student Profile
          </h2>
          
          <p className="text-[#A79C8C] max-w-md">
            Student details, academic information, and enrolled courses will be displayed here.
          </p>
          
          <div className="mt-6 px-4 py-2 bg-[#E8A33D]/5 border border-[#E8A33D]/20 rounded-full">
            <p className="text-[#6B6358] text-sm">🚧 Under construction</p>
          </div>

          {/* Quick Stats Placeholder */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
            {[
              { icon: Award, label: 'GPA', value: '--' },
              { icon: BookOpen, label: 'Courses', value: '--' },
              { icon: Calendar, label: 'Joined', value: '--' }
            ].map((stat, index) => (
              <div key={index} className="bg-[#0B0912] rounded-xl p-4 border border-[#2A2438]">
                <stat.icon className="w-5 h-5 text-[#6B6358] mx-auto mb-2" />
                <p className="text-xl font-bold text-[#F5F0E8]">{stat.value}</p>
                <p className="text-xs text-[#6B6358]">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}