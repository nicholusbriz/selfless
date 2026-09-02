// app/dashboard/super-admin/centers/[id]/page.tsx
'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Home,
  Building2,
  MapPin,
  Phone,
  Mail,
  Users,
  Check,
  Globe,
  Loader2,
  Calendar,
  Edit,
  Trash2,
  AlertTriangle,
  X,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { techCentersApi } from '@/lib/api/tech-centers';

export default function TechCenterDetailPage() {
  const router = useRouter();
  const params = useParams();
  const techCenterId = params.id as string;
  const queryClient = useQueryClient();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const {
    data: techCenter,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['techCenter', techCenterId],
    queryFn: () => techCentersApi.getTechCenterById(techCenterId),
    enabled: !!techCenterId,
  });

  const deleteMutation = useMutation({
    mutationFn: techCentersApi.deleteTechCenter,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['techCenters'] });
      router.push('/dashboard/super-admin/centers');
    },
    onError: (error: any) => {
      alert(error.message || 'Failed to delete tech center');
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate(techCenterId);
  };

  /* -------------------------------------------------------------------------- */
  /* Loading                                                                    */
  /* -------------------------------------------------------------------------- */

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-7 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-[#E8EBF0]" />
              <div className="space-y-2">
                <div className="h-5 w-48 rounded bg-[#E8EBF0]" />
                <div className="h-3 w-28 rounded bg-[#E8EBF0]" />
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-[#E1E5EA] bg-white shadow-sm">
            <div className="border-b border-[#E8EBEF] p-5 sm:p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-6 w-64 rounded bg-[#E8EBEF]" />
                <div className="h-4 w-24 rounded bg-[#E8EBEF]" />
                <div className="h-4 w-3/4 max-w-xl rounded bg-[#E8EBEF]" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8 p-5 sm:p-6 md:grid-cols-2">
              {[1, 2].map((item) => (
                <div key={item} className="animate-pulse space-y-5">
                  <div className="h-4 w-24 rounded bg-[#E8EBEF]" />
                  {[1, 2, 3].map((row) => (
                    <div key={row} className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-[#E8EBEF]" />
                      <div className="space-y-2">
                        <div className="h-3 w-16 rounded bg-[#E8EBEF]" />
                        <div className="h-4 w-28 rounded bg-[#E8EBEF]" />
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div className="border-t border-[#E8EBEF] p-5 sm:p-6">
              <div className="mb-4 h-4 w-24 animate-pulse rounded bg-[#E8EBEF]" />
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="h-24 animate-pulse rounded-lg bg-[#F2F4F6]"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------------------- */
  /* Error                                                                      */
  /* -------------------------------------------------------------------------- */

  if (error) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] px-4 py-10 sm:px-6">
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="w-full max-w-md rounded-xl border border-[#E1E5EA] bg-white p-7 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#FEF2F0]">
              <AlertTriangle className="h-7 w-7 text-[#B54732]" />
            </div>

            <h3 className="mb-2 text-lg font-semibold text-[#172033]">
              Failed to Load
            </h3>

            <p className="text-sm leading-6 text-[#667085]">
              {(error as Error)?.message || 'An error occurred while loading the tech center.'}
            </p>

            <button
              onClick={() => router.back()}
              className="mt-5 inline-flex items-center justify-center rounded-lg bg-[#12203B] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1C2E4E] focus:outline-none focus:ring-2 focus:ring-[#12203B]/20"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------------------- */
  /* Not found                                                                  */
  /* -------------------------------------------------------------------------- */

  if (!techCenter) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] px-4 py-10 sm:px-6">
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="w-full max-w-md rounded-xl border border-[#E1E5EA] bg-white p-7 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#F4F6F8]">
              <Building2 className="h-7 w-7 text-[#667085]" />
            </div>

            <h3 className="mb-2 text-lg font-semibold text-[#172033]">
              Tech Center Not Found
            </h3>

            <p className="text-sm leading-6 text-[#667085]">
              The tech center you&apos;re looking for doesn&apos;t exist.
            </p>

            <button
              onClick={() =>
                router.push('/dashboard/super-admin/centers')
              }
              className="mt-5 inline-flex items-center justify-center rounded-lg bg-[#12203B] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1C2E4E] focus:outline-none focus:ring-2 focus:ring-[#12203B]/20"
            >
              View All Centers
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------------------- */
  /* Main page                                                                  */
  /* -------------------------------------------------------------------------- */

  return (
    <div className="min-h-screen bg-[#F7F8FA] px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">

        {/* ------------------------------------------------------------------ */}
        {/* Page header                                                         */}
        {/* ------------------------------------------------------------------ */}

        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">

            <button
              onClick={() => router.back()}
              aria-label="Go back"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#DCE1E7] bg-white text-[#667085] shadow-sm transition-colors hover:border-[#C8CFD8] hover:bg-[#F8FAFC] hover:text-[#12203B] focus:outline-none focus:ring-2 focus:ring-[#12203B]/10"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            <div className="mx-1 hidden h-7 w-px bg-[#DCE1E7] sm:block" />

            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#D9DEE5] bg-white">
                <Building2 className="h-5 w-5 text-[#12203B]" />
              </div>

              <div className="min-w-0">
                <h1
                  className="truncate text-xl font-semibold text-[#172033] sm:text-2xl"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {techCenter.name}
                </h1>

                <p className="text-sm text-[#667085]">
                  Tech Center Details
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* Main card                                                           */}
        {/* ------------------------------------------------------------------ */}

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="overflow-hidden rounded-xl border border-[#E1E5EA] bg-white shadow-sm"
        >
          {/* Card header */}

          <div className="border-b border-[#E8EBEF] p-5 sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="text-lg font-semibold text-[#172033] sm:text-xl">
                    {techCenter.name}
                  </h2>

                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                      techCenter.isActive
                        ? 'bg-[#EEF4EF] text-[#55705B]'
                        : 'bg-[#FEF1EF] text-[#A4462F]'
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        techCenter.isActive
                          ? 'bg-[#55705B]'
                          : 'bg-[#A4462F]'
                      }`}
                    />
                    {techCenter.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <p className="mt-1.5 font-mono text-xs text-[#7A8494]">
                  {techCenter.code}
                </p>

                {techCenter.description && (
                  <p className="mt-3 max-w-3xl text-sm leading-6 text-[#667085]">
                    {techCenter.description}
                  </p>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <button
                  onClick={() =>
                    router.push(
                      `/dashboard/super-admin/centers/${techCenter.id}/edit`
                    )
                  }
                  className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#DCE1E7] bg-white px-3 text-sm font-medium text-[#475467] transition-colors hover:border-[#C8CFD8] hover:bg-[#F8FAFC] hover:text-[#12203B] focus:outline-none focus:ring-2 focus:ring-[#12203B]/10"
                  title="Edit tech center"
                >
                  <Edit className="h-4 w-4" />
                  <span className="hidden sm:inline">Edit</span>
                </button>

                <button
                  onClick={() => setShowDeleteDialog(true)}
                  className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#F0D7D2] bg-white px-3 text-sm font-medium text-[#A4462F] transition-colors hover:bg-[#FEF4F2] focus:outline-none focus:ring-2 focus:ring-[#A4462F]/10"
                  title="Delete tech center"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Delete</span>
                </button>
              </div>
            </div>
          </div>

          {/* ---------------------------------------------------------------- */}
          {/* Details                                                           */}
          {/* ---------------------------------------------------------------- */}

          <div className="p-5 sm:p-6">

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">

              {/* Location */}

              <section>
                <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.08em] text-[#7A8494]">
                  Location
                </h3>

                <div className="space-y-4">

                  {techCenter.country && (
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#E3E7EC] bg-[#F8F9FA]">
                        <Globe className="h-4.5 w-4.5 text-[#12203B]" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs text-[#7A8494]">
                          Country
                        </p>
                        <p className="mt-0.5 text-sm font-medium text-[#344054]">
                          {techCenter.country.name}
                        </p>
                      </div>
                    </div>
                  )}

                  {techCenter.city && (
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#E3E7EC] bg-[#F8F9FA]">
                        <MapPin className="h-4 w-4 text-[#12203B]" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs text-[#7A8494]">
                          City
                        </p>
                        <p className="mt-0.5 text-sm font-medium text-[#344054]">
                          {techCenter.city}
                        </p>
                      </div>
                    </div>
                  )}

                  {techCenter.address && (
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#E3E7EC] bg-[#F8F9FA]">
                        <MapPin className="h-4 w-4 text-[#12203B]" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs text-[#7A8494]">
                          Address
                        </p>
                        <p className="mt-0.5 text-sm font-medium text-[#344054] break-words">
                          {techCenter.address}
                        </p>
                      </div>
                    </div>
                  )}

                </div>
              </section>

              {/* Contact */}

              <section>
                <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.08em] text-[#7A8494]">
                  Contact
                </h3>

                <div className="space-y-4">

                  {techCenter.phone && (
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#E3E7EC] bg-[#F8F9FA]">
                        <Phone className="h-4 w-4 text-[#12203B]" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs text-[#7A8494]">
                          Phone
                        </p>
                        <p className="mt-0.5 break-words text-sm font-medium text-[#344054]">
                          {techCenter.phone}
                        </p>
                      </div>
                    </div>
                  )}

                  {techCenter.email && (
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#E3E7EC] bg-[#F8F9FA]">
                        <Mail className="h-4 w-4 text-[#12203B]" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs text-[#7A8494]">
                          Email
                        </p>
                        <p className="mt-0.5 break-all text-sm font-medium text-[#344054]">
                          {techCenter.email}
                        </p>
                      </div>
                    </div>
                  )}

                </div>
              </section>
            </div>

            {/* ---------------------------------------------------------------- */}
            {/* Statistics                                                       */}
            {/* ---------------------------------------------------------------- */}

            <section className="mt-8 border-t border-[#E8EBEF] pt-6">
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.08em] text-[#7A8494]">
                Statistics
              </h3>

              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">

                <div className="rounded-lg border border-[#E3E7EC] bg-[#FAFBFC] p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4 text-[#12203B]" />
                    <p className="text-xs font-medium text-[#667085]">
                      Total Users
                    </p>
                  </div>

                  <p className="text-xl font-semibold text-[#172033]">
                    {techCenter._count?.users ||
                      techCenter.users?.length ||
                      0}
                  </p>
                </div>

                <div className="rounded-lg border border-[#E3E7EC] bg-[#FAFBFC] p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[#12203B]" />
                    <p className="text-xs font-medium text-[#667085]">
                      Created
                    </p>
                  </div>

                  <p className="text-sm font-semibold text-[#344054]">
                    {new Date(
                      techCenter.createdAt
                    ).toLocaleDateString()}
                  </p>
                </div>

                <div className="rounded-lg border border-[#E3E7EC] bg-[#FAFBFC] p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Check className="h-4 w-4 text-[#55705B]" />
                    <p className="text-xs font-medium text-[#667085]">
                      Status
                    </p>
                  </div>

                  <p
                    className={`text-sm font-semibold ${
                      techCenter.isActive
                        ? 'text-[#55705B]'
                        : 'text-[#A4462F]'
                    }`}
                  >
                    {techCenter.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>

                <div className="rounded-lg border border-[#E3E7EC] bg-[#FAFBFC] p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-[#12203B]" />
                    <p className="text-xs font-medium text-[#667085]">
                      Code
                    </p>
                  </div>

                  <p className="truncate font-mono text-sm font-semibold text-[#344054]">
                    {techCenter.code}
                  </p>
                </div>

              </div>
            </section>

            {/* ---------------------------------------------------------------- */}
            {/* Tech Center ID                                                   */}
            {/* ---------------------------------------------------------------- */}

            <section className="mt-6 border-t border-[#E8EBEF] pt-6">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#7A8494]">
                Tech Center ID
              </h3>

              <div className="overflow-hidden rounded-lg border border-[#E3E7EC] bg-[#F8F9FA] px-3.5 py-3">
                <p className="break-all font-mono text-xs text-[#475467] sm:text-sm">
                  {techCenter.id}
                </p>
              </div>
            </section>

          </div>
        </motion.div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* Delete Confirmation Dialog                                             */}
      {/* -------------------------------------------------------------------- */}

      <AnimatePresence>
        {showDeleteDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#172033]/35 p-4 backdrop-blur-[2px]"
            onClick={() => setShowDeleteDialog(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              className="w-full max-w-md overflow-hidden rounded-xl border border-[#E1E5EA] bg-white shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5 sm:p-6">

                <div className="flex items-start gap-4">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#FEF1EF]">
                    <AlertTriangle className="h-5 w-5 text-[#B54732]" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="pr-6 text-base font-semibold text-[#172033] sm:text-lg">
                      Delete {techCenter?.name}?
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-[#667085]">
                      This action cannot be undone. All associated data
                      including users, courses, and other resources will be
                      permanently removed.
                    </p>
                  </div>

                  <button
                    onClick={() => setShowDeleteDialog(false)}
                    aria-label="Close dialog"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#98A2B3] transition-colors hover:bg-[#F2F4F7] hover:text-[#344054]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">

                  <button
                    onClick={() => setShowDeleteDialog(false)}
                    className="rounded-lg border border-[#DCE1E7] bg-white px-4 py-2.5 text-sm font-medium text-[#475467] transition-colors hover:bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#12203B]/10"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleDelete}
                    disabled={deleteMutation.isPending}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#B54732] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#963B29] focus:outline-none focus:ring-2 focus:ring-[#B54732]/20 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {deleteMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4" />
                        Delete Center
                      </>
                    )}
                  </button>

                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}