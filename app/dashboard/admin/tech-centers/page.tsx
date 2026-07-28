// app/dashboard/admin/tech-centers/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail,
  Globe,
  ArrowLeft,
  School,
  Loader2,
  Edit,
  Users,
  Megaphone,
  BookOpen,
  Calendar,
  ChevronRight
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { adminTechCenterApi } from '@/lib/api/admin-tech-center';
import TechCenterStats from '@/app/dashboard/admin/components/TechCenterStats';

export default function AdminTechCenterPage() {
  const router = useRouter();
  
  const {
    data: techCenter,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['adminTechCenter'],
    queryFn: adminTechCenterApi.getTechCenter,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#E8A33D] animate-spin mx-auto mb-4" />
          <p className="text-[#A79C8C]">Loading tech center...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-[#F87171]/10 flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-[#F87171]" />
          </div>
          <h3 className="text-xl font-semibold text-[#F5F0E8] mb-2">Failed to Load</h3>
          <p className="text-[#A79C8C]">{(error as Error)?.message || 'An error occurred'}</p>
        </div>
      </div>
    );
  }

  if (!techCenter) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-[#E8A33D]/10 flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-[#E8A33D] opacity-60" />
          </div>
          <h3 className="text-xl font-semibold text-[#F5F0E8] mb-2">No Tech Center Assigned</h3>
          <p className="text-[#A79C8C]">You haven't been assigned to a tech center yet.</p>
        </div>
      </div>
    );
  }

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
            <School className="w-6 h-6 text-[#E8A33D]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#F5F0E8]" style={{ fontFamily: 'var(--font-display)' }}>
              Tech Center Dashboard
            </h1>
            <p className="text-sm text-[#A79C8C]">Manage your assigned tech center</p>
          </div>
        </div>
      </div>

      {/* Tech Center Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#150F20] border border-[#2A2438] rounded-2xl p-6 mb-8"
      >
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Building2 className="w-6 h-6 text-[#E8A33D]" />
              <h2 className="text-2xl font-bold text-[#F5F0E8]">{techCenter.name}</h2>
              <span className={`px-2 py-0.5 text-xs rounded-full ${techCenter.isActive ? 'bg-[#34D399]/20 text-[#34D399]' : 'bg-[#F87171]/20 text-[#F87171]'}`}>
                {techCenter.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="text-sm text-[#6B6358] font-mono mb-3">{techCenter.code}</p>
            
            {techCenter.description && (
              <p className="text-[#A79C8C] mb-4">{techCenter.description}</p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {techCenter.country && (
                <div className="flex items-center gap-2 text-[#A79C8C]">
                  <Globe className="w-4 h-4 text-[#6B6358]" />
                  <span>{techCenter.country.name}</span>
                </div>
              )}
              {techCenter.city && (
                <div className="flex items-center gap-2 text-[#A79C8C]">
                  <MapPin className="w-4 h-4 text-[#6B6358]" />
                  <span>{techCenter.city}</span>
                </div>
              )}
              {techCenter.phone && (
                <div className="flex items-center gap-2 text-[#A79C8C]">
                  <Phone className="w-4 h-4 text-[#6B6358]" />
                  <span>{techCenter.phone}</span>
                </div>
              )}
              {techCenter.email && (
                <div className="flex items-center gap-2 text-[#A79C8C]">
                  <Mail className="w-4 h-4 text-[#6B6358]" />
                  <span className="truncate">{techCenter.email}</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3 lg:flex-col lg:items-stretch">
            <button
              onClick={() => router.push('/dashboard/admin/tech-centers/edit')}
              className="px-4 py-2.5 bg-gradient-to-r from-[#E8A33D] to-[#C97F1F] text-[#0B0912] font-medium rounded-lg hover:shadow-lg hover:shadow-[#E8A33D]/30 transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <Edit className="w-4 h-4" />
              Edit Center
            </button>
            <button
              onClick={() => router.push('/dashboard/admin/tech-centers/announcements')}
              className="px-4 py-2.5 bg-[#2A2438] text-[#A79C8C] rounded-lg hover:bg-[#3A3448] hover:text-[#F5F0E8] transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <Megaphone className="w-4 h-4" />
              Announcements
            </button>
          </div>
        </div>
      </motion.div>

      {/* Statistics */}
      <TechCenterStats />

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onClick={() => router.push('/dashboard/admin/students')}
          className="bg-[#150F20] border border-[#2A2438] rounded-xl p-6 hover:border-[#6366F1]/30 transition-all duration-300 text-left group"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#6366F1]/10 flex items-center justify-center mb-3">
                <Users className="w-6 h-6 text-[#6366F1]" />
              </div>
              <h3 className="text-[#F5F0E8] font-semibold">Students</h3>
              <p className="text-sm text-[#6B6358] mt-1">Manage students in your center</p>
            </div>
            <ChevronRight className="w-5 h-5 text-[#6B6358] group-hover:text-[#E8A33D] group-hover:translate-x-1 transition-all duration-200" />
          </div>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => router.push('/dashboard/admin/courses')}
          className="bg-[#150F20] border border-[#2A2438] rounded-xl p-6 hover:border-[#34D399]/30 transition-all duration-300 text-left group"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#34D399]/10 flex items-center justify-center mb-3">
                <BookOpen className="w-6 h-6 text-[#34D399]" />
              </div>
              <h3 className="text-[#F5F0E8] font-semibold">Courses</h3>
              <p className="text-sm text-[#6B6358] mt-1">View courses in your center</p>
            </div>
            <ChevronRight className="w-5 h-5 text-[#6B6358] group-hover:text-[#E8A33D] group-hover:translate-x-1 transition-all duration-200" />
          </div>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={() => router.push('/dashboard/admin/cleaning')}
          className="bg-[#150F20] border border-[#2A2438] rounded-xl p-6 hover:border-[#F59E0B]/30 transition-all duration-300 text-left group"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#F59E0B]/10 flex items-center justify-center mb-3">
                <Calendar className="w-6 h-6 text-[#F59E0B]" />
              </div>
              <h3 className="text-[#F5F0E8] font-semibold">Cleaning</h3>
              <p className="text-sm text-[#6B6358] mt-1">Manage cleaning schedules</p>
            </div>
            <ChevronRight className="w-5 h-5 text-[#6B6358] group-hover:text-[#E8A33D] group-hover:translate-x-1 transition-all duration-200" />
          </div>
        </motion.button>
      </div>
    </div>
  );
}