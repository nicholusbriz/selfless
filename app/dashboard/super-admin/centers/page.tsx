// app/dashboard/super-admin/centers/page.tsx
'use client';

import { useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  Building2,
  MapPin,
  Phone,
  Mail,
  Users,
  Check,
  X,
  Globe,
  ArrowLeft,
  Home,
  School,
  Loader2,
  ArrowRight,
  MousePointerClick,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { techCentersApi, type TechCenter } from '@/lib/api/tech-centers';

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#12203B]/20 focus-visible:ring-offset-2';

const iconButton =
  `inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#DADCD3] bg-white text-[#3D4A61] transition-colors hover:border-[#C8CABF] hover:bg-[#F7F6F2] hover:text-[#12203B] ${focusRing}`;

export default function TechCentersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');

  const {
    data: techCenters = [],
    isLoading: loadingCenters,
    error: centersError,
  } = useQuery({
    queryKey: ['techCenters'],
    queryFn: techCentersApi.getTechCenters,
  });

  const updateStatusMutation = useMutation({
    mutationFn: techCentersApi.updateTechCenterStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['techCenters'] });
    },
    onError: (error: any) => {
      alert(error.message || 'Failed to update tech center status');
    },
  });

  const handleToggleActive = (center: TechCenter) => {
    updateStatusMutation.mutate({
      id: center.id,
      isActive: !center.isActive,
    });
  };

  const filteredCenters = techCenters.filter((center) => {
    const normalizedSearch = searchTerm.toLowerCase();

    const matchesSearch =
      center.name.toLowerCase().includes(normalizedSearch) ||
      center.code.toLowerCase().includes(normalizedSearch) ||
      (center.city && center.city.toLowerCase().includes(normalizedSearch));

    const matchesFilter =
      filterActive === 'all' ||
      (filterActive === 'active' && center.isActive) ||
      (filterActive === 'inactive' && !center.isActive);

    return matchesSearch && matchesFilter;
  });

  const totalCenters = techCenters.length;
  const activeCenters = techCenters.filter((center) => center.isActive).length;
  const inactiveCenters = totalCenters - activeCenters;
  const totalStudents = techCenters.reduce(
    (acc, center) => acc + (center._count?.users || center.users?.length || 0),
    0
  );

  if (loadingCenters) {
    return (
      <div className="min-h-[70vh] bg-[#F7F6F2] flex items-center justify-center px-4">
        <div className="rounded-xl border border-[#DADCD3] bg-white px-8 py-7 text-center shadow-sm">
          <Loader2 className="mx-auto mb-3 h-7 w-7 animate-spin text-[#12203B]" />
          <p className="text-sm font-medium text-[#3D4A61]">Loading tech centers...</p>
        </div>
      </div>
    );
  }

  if (centersError) {
    return (
      <div className="min-h-[70vh] bg-[#F7F6F2] flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-xl border border-[#E6D5CF] bg-white p-7 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-[#FBF0EC]">
            <X className="h-5 w-5 text-[#A4462F]" />
          </div>

          <h3 className="text-lg font-semibold text-[#12203B]">Failed to load tech centers</h3>
          <p className="mt-2 text-sm leading-6 text-[#6B7268]">
            {(centersError as Error)?.message || 'An error occurred while loading the tech centers.'}
          </p>

          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ['techCenters'] })}
            className={`mt-5 inline-flex items-center justify-center rounded-lg bg-[#12203B] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1C2E4E] ${focusRing}`}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F6F2]">
      <div className="mx-auto w-full max-w-[1500px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
        {/* Page heading */}
        <header className="mb-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex items-center gap-2 pt-0.5">
                <button
                  onClick={() => router.back()}
                  className={iconButton}
                  aria-label="Go back"
                  title="Go back"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
              </div>

              <div className="hidden h-9 w-px bg-[#DADCD3] sm:block" />

              <div className="flex min-w-0 items-start gap-3">
                <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#DADCD3] bg-white sm:flex">
                  <School className="h-5 w-5 text-[#12203B]" />
                </div>

                <div className="min-w-0">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#8A9088]">
                    Administration
                  </p>
                  <h1 className="text-2xl font-semibold tracking-tight text-[#12203B] sm:text-[28px]">
                    Tech Centers
                  </h1>
                  <p className="mt-1 max-w-2xl text-sm leading-6 text-[#6B7268]">
                    Manage center information, availability, and student membership across the platform.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => router.push('/dashboard/super-admin/centers/create')}
              className={`inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#12203B] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#1C2E4E] sm:w-auto ${focusRing}`}
            >
              <Plus className="h-4 w-4" />
              New Center
            </button>
          </div>
        </header>

        {/* Statistics */}
        <section className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Tech center statistics">
          <StatCard
            label="Total Centers"
            value={totalCenters}
            icon={<Building2 className="h-5 w-5" />}
          />
          <StatCard
            label="Active Centers"
            value={activeCenters}
            icon={<Check className="h-5 w-5" />}
            tone="success"
          />
          <StatCard
            label="Inactive Centers"
            value={inactiveCenters}
            icon={<X className="h-5 w-5" />}
            tone="danger"
          />
          <StatCard
            label="Total Students"
            value={totalStudents}
            icon={<Users className="h-5 w-5" />}
          />
        </section>

        {/* Search and filters */}
        <section className="mb-4 rounded-xl border border-[#DADCD3] bg-white p-3 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A9088]" />
              <input
                type="search"
                placeholder="Search by center name, code, or city"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className={`h-10 w-full rounded-lg border border-[#DADCD3] bg-white pl-10 pr-4 text-sm text-[#12203B] placeholder:text-[#8A9088] transition-colors hover:border-[#C8CABF] focus:border-[#12203B]/40 ${focusRing}`}
              />
            </div>

            <select
              value={filterActive}
              onChange={(event) =>
                setFilterActive(event.target.value as 'all' | 'active' | 'inactive')
              }
              className={`h-10 w-full rounded-lg border border-[#DADCD3] bg-white px-3 text-sm font-medium text-[#3D4A61] transition-colors hover:border-[#C8CABF] focus:border-[#12203B]/40 md:w-[170px] ${focusRing}`}
              aria-label="Filter tech centers by status"
            >
              <option value="all">All Centers</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </section>

        {/* Card instruction + result count */}
        <div className="mb-3 flex flex-col gap-2 px-0.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-[#6B7268]">
            <MousePointerClick className="h-4 w-4 shrink-0 text-[#12203B]" />
            <span>
              Click on a center card to view its full details.
            </span>
          </div>

          <p className="text-xs font-medium text-[#8A9088]">
            {filteredCenters.length} {filteredCenters.length === 1 ? 'center' : 'centers'} shown
          </p>
        </div>

        {/* Tech center cards */}
        {filteredCenters.length === 0 ? (
          <div className="rounded-xl border border-[#DADCD3] bg-white px-6 py-12 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#F0F0EB]">
              <Building2 className="h-6 w-6 text-[#3D4A61]" />
            </div>

            <h3 className="text-lg font-semibold text-[#12203B]">No tech centers found</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#6B7268]">
              {searchTerm || filterActive !== 'all'
                ? 'No centers match the current search and filter. Try changing your criteria.'
                : 'There are no tech centers yet. Create the first center to get started.'}
            </p>

            {!searchTerm && filterActive === 'all' && (
              <button
                onClick={() => router.push('/dashboard/super-admin/centers/create')}
                className={`mt-5 inline-flex items-center justify-center gap-2 rounded-lg bg-[#12203B] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1C2E4E] ${focusRing}`}
              >
                <Plus className="h-4 w-4" />
                Create Tech Center
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredCenters.map((center, index) => {
              const studentCount = center._count?.users || center.users?.length || 0;

              return (
                <motion.article
                  key={center.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.22,
                    delay: Math.min(index * 0.025, 0.15),
                    ease: 'easeOut',
                  }}
                  onClick={() =>
                    router.push(`/dashboard/super-admin/centers/${center.id}`)
                  }
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      router.push(`/dashboard/super-admin/centers/${center.id}`);
                    }
                  }}
                  tabIndex={0}
                  role="link"
                  aria-label={`View ${center.name} details`}
                  className={`group cursor-pointer rounded-xl border border-[#DADCD3] bg-white shadow-sm transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-[#BFC3B8] hover:shadow-md ${focusRing}`}
                >
                  <div className="p-4 sm:p-5">
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="mb-1.5 flex flex-wrap items-center gap-2">
                          <h2 className="min-w-0 truncate text-base font-semibold text-[#12203B] sm:text-[17px]">
                            {center.name}
                          </h2>

                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                              center.isActive
                                ? 'bg-[#EEF3EE] text-[#55705B]'
                                : 'bg-[#FBF0EC] text-[#A4462F]'
                            }`}
                          >
                            {center.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>

                        <p className="font-mono text-xs font-medium tracking-wide text-[#8A9088]">
                          {center.code}
                        </p>
                      </div>

                      <div
                        className="shrink-0"
                        onClick={(event) => event.stopPropagation()}
                        onKeyDown={(event) => event.stopPropagation()}
                      >
                        <button
                          onClick={() => handleToggleActive(center)}
                          disabled={updateStatusMutation.isPending}
                          className={`inline-flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-[#6B7268] transition-colors hover:border-[#DADCD3] hover:bg-[#F7F6F2] hover:text-[#12203B] disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`}
                          title={center.isActive ? 'Deactivate center' : 'Activate center'}
                          aria-label={
                            center.isActive
                              ? `Deactivate ${center.name}`
                              : `Activate ${center.name}`
                          }
                        >
                          {updateStatusMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : center.isActive ? (
                            <Check className="h-4 w-4 text-[#55705B]" />
                          ) : (
                            <X className="h-4 w-4 text-[#A4462F]" />
                          )}
                        </button>
                      </div>
                    </div>

                    {center.description && (
                      <p className="mb-4 line-clamp-2 text-sm leading-6 text-[#6B7268]">
                        {center.description}
                      </p>
                    )}

                    <div className="space-y-2.5">
                      {center.country && (
                        <DetailRow
                          icon={<Globe className="h-4 w-4" />}
                          value={center.country.name}
                        />
                      )}

                      {center.city && (
                        <DetailRow
                          icon={<MapPin className="h-4 w-4" />}
                          value={center.city}
                        />
                      )}

                      {center.phone && (
                        <DetailRow
                          icon={<Phone className="h-4 w-4" />}
                          value={center.phone}
                        />
                      )}

                      {center.email && (
                        <DetailRow
                          icon={<Mail className="h-4 w-4" />}
                          value={center.email}
                          truncate
                        />
                      )}
                    </div>

                    <div className="mt-5 border-t border-[#EDECE6] pt-3">
                      <div className="flex items-center justify-between gap-3 text-xs text-[#8A9088]">
                        <span className="truncate">
                          Created {new Date(center.createdAt).toLocaleDateString()}
                        </span>

                        <span className="inline-flex shrink-0 items-center gap-1.5">
                          <Users className="h-3.5 w-3.5" />
                          {studentCount} {studentCount === 1 ? 'student' : 'students'}
                        </span>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-xs font-medium text-[#6B7268]">
                          View center details
                        </span>
                        <ArrowRight className="h-4 w-4 text-[#8A9088] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-[#12203B]" />
                      </div>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  tone = 'default',
}: {
  label: string;
  value: number;
  icon: ReactNode;
  tone?: 'default' | 'success' | 'danger';
}) {
  const iconTone =
    tone === 'success'
      ? 'bg-[#EEF3EE] text-[#55705B]'
      : tone === 'danger'
        ? 'bg-[#FBF0EC] text-[#A4462F]'
        : 'bg-[#F0F0EB] text-[#12203B]';

  const valueTone =
    tone === 'success'
      ? 'text-[#55705B]'
      : tone === 'danger'
        ? 'text-[#A4462F]'
        : 'text-[#12203B]';

  return (
    <div className="rounded-xl border border-[#DADCD3] bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-[#6B7268] sm:text-sm">{label}</p>
          <p className={`mt-1 text-2xl font-semibold tracking-tight ${valueTone}`}>
            {value}
          </p>
        </div>

        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconTone}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  icon,
  value,
  truncate = false,
}: {
  icon: ReactNode;
  value: string;
  truncate?: boolean;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2.5 text-sm text-[#3D4A61]">
      <span className="shrink-0 text-[#8A9088]">{icon}</span>
      <span className={truncate ? 'min-w-0 truncate' : 'min-w-0'}>
        {value}
      </span>
    </div>
  );
}
