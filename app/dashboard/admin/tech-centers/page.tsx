// app/dashboard/admin/tech-centers/page.tsx
'use client';

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
  Calendar,
  ChevronRight,
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

  /* ---------------------------------------------
     Loading State
  --------------------------------------------- */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#1A365D]/10 flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-7 h-7 text-[#1A365D] animate-spin" />
          </div>

          <h3 className="text-lg font-semibold text-[#1A365D]">
            Loading Tech Center
          </h3>

          <p className="text-sm text-[#64748B] mt-1">
            Please wait while we load your center information.
          </p>
        </div>
      </div>
    );
  }

  /* ---------------------------------------------
     Error State
  --------------------------------------------- */
  if (error) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white border border-[#E2E8F0] rounded-2xl shadow-sm p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-5">
            <Building2 className="w-8 h-8 text-red-500" />
          </div>

          <h3 className="text-xl font-bold text-[#1A365D] mb-2">
            Failed to Load
          </h3>

          <p className="text-sm text-[#64748B]">
            {(error as Error)?.message || 'An error occurred while loading the tech center.'}
          </p>

          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-5 py-2.5 rounded-lg bg-[#1A365D] text-white text-sm font-medium hover:bg-[#153475] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  /* ---------------------------------------------
     No Tech Center State
  --------------------------------------------- */
  if (!techCenter) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white border border-[#E2E8F0] rounded-2xl shadow-sm p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#1A365D]/10 flex items-center justify-center mx-auto mb-5">
            <Building2 className="w-8 h-8 text-[#1A365D]" />
          </div>

          <h3 className="text-xl font-bold text-[#1A365D] mb-2">
            No Tech Center Assigned
          </h3>

          <p className="text-sm text-[#64748B]">
            You haven't been assigned to a tech center yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#1E293B]">
      <div className="space-y-6">

        {/* =========================================
            PAGE HEADER
        ========================================= */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 rounded-xl bg-white border border-[#E2E8F0] flex items-center justify-center text-[#64748B] hover:text-[#1A365D] hover:border-[#CBD5E1] hover:bg-[#F8FAFC] transition-all shadow-sm"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="w-px h-8 bg-[#E2E8F0] hidden sm:block" />

            <div className="w-11 h-11 rounded-xl bg-[#1A365D]/10 border border-[#1A365D]/10 flex items-center justify-center">
              <School className="w-5 h-5 text-[#1A365D]" />
            </div>

            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#1A365D]">
                Tech Center Dashboard
              </h1>

              <p className="text-sm text-[#64748B] mt-0.5">
                Manage your assigned tech center
              </p>
            </div>
          </div>
        </motion.div>

        {/* =========================================
            TECH CENTER INFORMATION CARD
        ========================================= */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden"
        >
          {/* Card top accent */}
          <div className="h-1 bg-[#1A365D]" />

          <div className="p-5 sm:p-6">
            <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-6">

              {/* Center Details */}
              <div className="flex-1 min-w-0">

                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-[#1A365D]/10 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-[#1A365D]" />
                  </div>

                  <h2 className="text-xl sm:text-2xl font-bold text-[#1A365D]">
                    {techCenter.name}
                  </h2>

                  <span
                    className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
                      techCenter.isActive
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-red-50 text-red-700 border-red-200'
                    }`}
                  >
                    {techCenter.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* Center Code */}
                <div className="ml-0 sm:ml-[52px] mb-4">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-[#F1F5F9] border border-[#E2E8F0] text-xs font-mono font-medium text-[#64748B]">
                    {techCenter.code}
                  </span>
                </div>

                {/* Description */}
                {techCenter.description && (
                  <p className="text-sm sm:text-base leading-6 text-[#64748B] max-w-3xl mb-5">
                    {techCenter.description}
                  </p>
                )}

                {/* Contact / Location Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {techCenter.country && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                      <div className="w-9 h-9 rounded-lg bg-[#1A365D]/10 flex items-center justify-center flex-shrink-0">
                        <Globe className="w-4 h-4 text-[#1A365D]" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-[11px] uppercase tracking-wide font-semibold text-[#94A3B8]">
                          Country
                        </p>

                        <p className="text-sm font-medium text-[#334155] truncate">
                          {techCenter.country.name}
                        </p>
                      </div>
                    </div>
                  )}

                  {techCenter.city && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                      <div className="w-9 h-9 rounded-lg bg-[#3182CE]/10 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-4 h-4 text-[#3182CE]" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-[11px] uppercase tracking-wide font-semibold text-[#94A3B8]">
                          City
                        </p>

                        <p className="text-sm font-medium text-[#334155] truncate">
                          {techCenter.city}
                        </p>
                      </div>
                    </div>
                  )}

                  {techCenter.phone && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                      <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                        <Phone className="w-4 h-4 text-emerald-600" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-[11px] uppercase tracking-wide font-semibold text-[#94A3B8]">
                          Phone
                        </p>

                        <p className="text-sm font-medium text-[#334155] truncate">
                          {techCenter.phone}
                        </p>
                      </div>
                    </div>
                  )}

                  {techCenter.email && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                      <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <Mail className="w-4 h-4 text-blue-600" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-[11px] uppercase tracking-wide font-semibold text-[#94A3B8]">
                          Email
                        </p>

                        <p className="text-sm font-medium text-[#334155] truncate">
                          {techCenter.email}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* =====================================
                  QUICK ACTIONS
              ===================================== */}
              <div className="flex flex-col sm:flex-row xl:flex-col gap-2.5 xl:w-48">
                <button
                  onClick={() =>
                    router.push('/dashboard/admin/tech-centers/edit')
                  }
                  className="px-4 py-2.5 bg-[#1A365D] text-white font-medium rounded-lg hover:bg-[#153475] transition-all duration-200 flex items-center justify-center gap-2 shadow-sm"
                >
                  <Edit className="w-4 h-4" />
                  Edit Center
                </button>

                <button
                  onClick={() =>
                    router.push(
                      '/dashboard/admin/tech-centers/announcements'
                    )
                  }
                  className="px-4 py-2.5 bg-white border border-[#CBD5E1] text-[#334155] font-medium rounded-lg hover:bg-[#F8FAFC] hover:border-[#94A3B8] transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Megaphone className="w-4 h-4 text-[#1A365D]" />
                  Announcements
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* =========================================
            STATISTICS
        ========================================= */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <TechCenterStats />
        </motion.div>

        {/* =========================================
            QUICK LINKS HEADER
        ========================================= */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-bold text-[#1A365D]">
                Quick Links
              </h2>

              <p className="text-sm text-[#64748B]">
                Quickly access common management areas
              </p>
            </div>
          </div>
        </motion.div>

        {/* =========================================
            QUICK LINKS
        ========================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

          {/* Users */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onClick={() => router.push('/dashboard/admin/users')}
            className="group bg-white border border-[#E2E8F0] rounded-xl p-5 text-left shadow-sm hover:shadow-md hover:border-[#CBD5E1] transition-all duration-300"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="w-11 h-11 rounded-xl bg-[#1A365D]/10 flex items-center justify-center mb-4">
                  <Users className="w-5 h-5 text-[#1A365D]" />
                </div>

                <h3 className="text-[#1E293B] font-semibold">
                  Users
                </h3>

                <p className="text-sm text-[#64748B] mt-1">
                  Manage users in your center
                </p>
              </div>

              <div className="w-8 h-8 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center group-hover:bg-[#1A365D] group-hover:border-[#1A365D] transition-all">
                <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:text-white group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          </motion.button>

          {/* Tutors */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            onClick={() => router.push('/dashboard/admin/teachers')}
            className="group bg-white border border-[#E2E8F0] rounded-xl p-5 text-left shadow-sm hover:shadow-md hover:border-[#CBD5E1] transition-all duration-300"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center mb-4">
                  <School className="w-5 h-5 text-emerald-600" />
                </div>

                <h3 className="text-[#1E293B] font-semibold">
                  Tutors
                </h3>

                <p className="text-sm text-[#64748B] mt-1">
                  Manage tutors in your center
                </p>
              </div>

              <div className="w-8 h-8 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center group-hover:bg-[#1A365D] group-hover:border-[#1A365D] transition-all">
                <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:text-white group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          </motion.button>

          {/* Cleaning */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onClick={() => router.push('/dashboard/admin/cleaning')}
            className="group bg-white border border-[#E2E8F0] rounded-xl p-5 text-left shadow-sm hover:shadow-md hover:border-[#CBD5E1] transition-all duration-300"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center mb-4">
                  <Calendar className="w-5 h-5 text-amber-600" />
                </div>

                <h3 className="text-[#1E293B] font-semibold">
                  Cleaning
                </h3>

                <p className="text-sm text-[#64748B] mt-1">
                  Manage cleaning schedules
                </p>
              </div>

              <div className="w-8 h-8 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center group-hover:bg-[#1A365D] group-hover:border-[#1A365D] transition-all">
                <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:text-white group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          </motion.button>
        </div>
      </div>
    </div>
  );
}