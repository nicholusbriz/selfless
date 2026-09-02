'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Users as UsersIcon,
  UserCheck,
  UserX,
  UserCog,
  ArrowLeft,
  Shield,
  ChevronDown,
  ChevronUp,
  Edit,
  Trash2,
  X,
  Check,
  AlertTriangle,
  Building2,
  Globe,
  Filter,
  ChevronLeft,
  ChevronRight,
  Calendar,
  RefreshCw,
  Save,
} from 'lucide-react';

import {
  useSuperAdminUsers,
  useUpdateSuperAdminUser,
  useUpdateSuperAdminUserRole,
  useUpdateSuperAdminUserStatus,
  useDeleteSuperAdminUser,
} from '@/hooks/useSuperAdminUsers';

/* -------------------------------------------------------------------------- */
/* Design tokens                                                               */
/* -------------------------------------------------------------------------- */

const TOKENS = {
  ink: '#12203B',
  ink2: '#43516A',
  muted: '#6F7B8D',
  subtle: '#8993A3',

  surface: '#FFFFFF',
  surface2: '#F7F8FA',
  surface3: '#F0F2F5',

  line: '#E2E6EB',
  lineStrong: '#D2D8E0',

  brand: '#12203B',
  brandHover: '#1C2E4E',
  brandSoft: '#EEF2F7',

  accent: '#B98A3E',
  accentHover: '#A67A34',
  accentSoft: '#F8F3E8',

  success: '#55705B',
  successSoft: '#EEF4EF',

  warning: '#8A6E3A',
  warningSoft: '#F8F4EC',

  danger: '#A4462F',
  dangerSoft: '#FBF0EC',
};

/* -------------------------------------------------------------------------- */
/* Shared classes                                                              */
/* -------------------------------------------------------------------------- */

const inputClass =
  'w-full rounded-lg border border-[#E2E6EB] bg-white px-3.5 py-2.5 text-sm text-[#12203B] outline-none transition placeholder:text-[#8993A3] focus:border-[#B98A3E] focus:ring-2 focus:ring-[#B98A3E]/15';

const selectClass =
  'w-full rounded-lg border border-[#E2E6EB] bg-white px-3.5 py-2.5 text-sm text-[#12203B] outline-none transition focus:border-[#B98A3E] focus:ring-2 focus:ring-[#B98A3E]/15';

const buttonBase =
  'inline-flex items-center justify-center gap-2 rounded-lg transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50';

const quietButton = `${buttonBase} border border-[#E2E6EB] bg-white text-[#43516A] hover:border-[#D2D8E0] hover:bg-[#F7F8FA] hover:text-[#12203B]`;

const primaryButton = `${buttonBase} bg-[#12203B] text-white hover:bg-[#1C2E4E]`;

const dangerButton = `${buttonBase} bg-[#A4462F] text-white hover:bg-[#8E3C28]`;

/* -------------------------------------------------------------------------- */
/* Badges                                                                      */
/* -------------------------------------------------------------------------- */

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    ACTIVE: 'border-[#D7E7D9] bg-[#EEF4EF] text-[#55705B]',
    INACTIVE: 'border-[#E2E6EB] bg-[#F3F4F6] text-[#6F7B8D]',
    SUSPENDED: 'border-[#F0D7D0] bg-[#FBF0EC] text-[#A4462F]',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium tracking-wide ${
        styles[status] || styles.INACTIVE
      }`}
    >
      {status}
    </span>
  );
};

const RoleBadge = ({ role }: { role: string }) => {
  const styles: Record<string, string> = {
    super_admin: 'border-[#E8DABF] bg-[#F8F3E8] text-[#8A6E3A]',
    admin: 'border-[#D9DFEA] bg-[#EEF2F7] text-[#43516A]',
    teacher: 'border-[#D7E7D9] bg-[#EEF4EF] text-[#55705B]',
    student: 'border-[#E8DABF] bg-[#F8F3E8] text-[#8A6E3A]',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium tracking-wide ${
        styles[role] || styles.student
      }`}
    >
      {role.replace('_', ' ').toUpperCase()}
    </span>
  );
};

/* -------------------------------------------------------------------------- */
/* Avatar                                                                       */
/* -------------------------------------------------------------------------- */

const UserAvatar = ({
  user,
  size = 'md',
}: {
  user: any;
  size?: 'sm' | 'md';
}) => {
  const sizeClass = size === 'sm' ? 'h-10 w-10 text-xs' : 'h-11 w-11 text-sm';

  if (user.profileImageUrl) {
    return (
      <img
        src={user.profileImageUrl}
        alt={`${user.firstName} ${user.lastName}`}
        className={`${sizeClass} flex-shrink-0 rounded-full border border-[#E2E6EB] object-cover`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} flex flex-shrink-0 items-center justify-center rounded-full bg-[#EEF2F7] font-semibold text-[#12203B]`}
    >
      {user.firstName?.charAt(0).toUpperCase()}
      {user.lastName?.charAt(0).toUpperCase()}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Stats card                                                                   */
/* -------------------------------------------------------------------------- */

const StatsCard = ({
  title,
  value,
  icon,
  subtitle,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  subtitle?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    className="rounded-xl border border-[#E2E6EB] bg-white p-4"
  >
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="truncate text-xs font-medium uppercase tracking-wide text-[#6F7B8D]">
          {title}
        </p>

        <p className="mt-1 text-2xl font-semibold tracking-tight text-[#12203B]">
          {value}
        </p>

        {subtitle && (
          <p className="mt-0.5 text-xs text-[#8993A3]">{subtitle}</p>
        )}
      </div>

      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#F7F8FA] text-[#12203B]">
        {icon}
      </div>
    </div>
  </motion.div>
);

/* -------------------------------------------------------------------------- */
/* Skeletons                                                                    */
/* -------------------------------------------------------------------------- */

const Skeleton = ({ className }: { className: string }) => (
  <div className={`animate-pulse rounded-md bg-[#E9EDF1] ${className}`} />
);

const HeaderSkeleton = () => (
  <div className="mb-6 flex items-center gap-3">
    <Skeleton className="h-9 w-9 rounded-lg" />
    <div className="space-y-2">
      <Skeleton className="h-6 w-44" />
      <Skeleton className="h-3.5 w-64" />
    </div>
  </div>
);

const StatsSkeleton = () => (
  <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
    {Array.from({ length: 4 }).map((_, index) => (
      <div
        key={index}
        className="rounded-xl border border-[#E2E6EB] bg-white p-4"
      >
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-7 w-12" />
          </div>
          <Skeleton className="h-10 w-10 rounded-lg" />
        </div>
      </div>
    ))}
  </div>
);

const SearchFiltersSkeleton = () => (
  <div className="mb-5 rounded-xl border border-[#E2E6EB] bg-white p-3">
    <div className="flex flex-col gap-3 lg:flex-row">
      <Skeleton className="h-10 flex-1" />
      <Skeleton className="h-10 w-full lg:w-28" />
      <Skeleton className="h-10 w-full lg:w-28" />
    </div>
  </div>
);

const UserTableSkeleton = () => (
  <div className="hidden overflow-hidden rounded-xl border border-[#E2E6EB] bg-white lg:block">
    <div className="border-b border-[#E2E6EB] bg-[#F7F8FA] px-4 py-3">
      <div className="grid grid-cols-[minmax(260px,1.5fr)_1fr_1fr_140px] gap-4">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>

    {Array.from({ length: 7 }).map((_, index) => (
      <div
        key={index}
        className="border-b border-[#E2E6EB] px-4 py-4 last:border-b-0"
      >
        <div className="grid grid-cols-[minmax(260px,1.5fr)_1fr_1fr_140px] items-center gap-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>

          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />

          <div className="flex justify-end gap-1.5">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

const UserCardSkeleton = () => (
  <div className="rounded-xl border border-[#E2E6EB] bg-white p-4">
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-3">
        <Skeleton className="h-11 w-11 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="h-3 w-40" />
        </div>
      </div>

      <div className="space-y-1">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
    </div>

    <div className="mt-4 space-y-2">
      <Skeleton className="h-3 w-40" />
      <Skeleton className="h-3 w-32" />
      <Skeleton className="h-3 w-36" />
    </div>

    <div className="mt-4 flex justify-end gap-2 border-t border-[#E2E6EB] pt-3">
      <Skeleton className="h-8 w-14 rounded-lg" />
      <Skeleton className="h-8 w-14 rounded-lg" />
      <Skeleton className="h-8 w-16 rounded-lg" />
      <Skeleton className="h-8 w-16 rounded-lg" />
    </div>
  </div>
);

/* -------------------------------------------------------------------------- */
/* Main page                                                                    */
/* -------------------------------------------------------------------------- */

export default function SuperAdminUsersPage() {
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

  const [expandedAction, setExpandedAction] = useState<
    'edit' | 'role' | 'status' | 'delete' | null
  >(null);

  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    techCenterId: '',
    country: '',
    role: '',
    status: '',
  });

  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    country: '',
    city: '',
    techCenterId: '',
    profileImageUrl: '',
  });

  const {
    data: usersData,
    isLoading,
    error,
    refetch,
  } = useSuperAdminUsers({
    page: 1,
    limit: 1000,
    techCenterId: filters.techCenterId || undefined,
    country: filters.country || undefined,
    role: filters.role || undefined,
    status: filters.status || undefined,
  });

  const filteredUsers = useMemo(() => {
    if (!usersData?.users) return [];

    let users = usersData.users;

    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase().trim();

      users = users.filter(
        (user) =>
          user.firstName?.toLowerCase().includes(search) ||
          user.lastName?.toLowerCase().includes(search) ||
          user.email?.toLowerCase().includes(search) ||
          user.phoneNumber?.toLowerCase().includes(search) ||
          `${user.firstName} ${user.lastName}`
            .toLowerCase()
            .includes(search)
      );
    }

    return users;
  }, [usersData?.users, searchTerm]);

  const paginatedUsers = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredUsers.slice(start, start + limit);
  }, [filteredUsers, page, limit]);

  const totalPages = Math.ceil(filteredUsers.length / limit);

  const stats = useMemo(() => {
    if (!usersData) return null;

    const users = usersData.users;

    return {
      total: usersData.pagination.total || users.length,
      active: users.filter((u) => u.status === 'ACTIVE').length,
      inactive: users.filter((u) => u.status === 'INACTIVE').length,
      suspended: users.filter((u) => u.status === 'SUSPENDED').length,
    };
  }, [usersData]);

  const deleteMutation = useDeleteSuperAdminUser();
  const updateRoleMutation = useUpdateSuperAdminUserRole();
  const updateStatusMutation = useUpdateSuperAdminUserStatus();
  const updateUserMutation = useUpdateSuperAdminUser();

  const hasFilters = Object.values(filters).some(Boolean);

  const closeExpanded = () => {
    setExpandedUserId(null);
    setExpandedAction(null);
    setSelectedUser(null);
  };

  const toggleExpand = (
    userId: string,
    action: 'edit' | 'role' | 'status' | 'delete'
  ) => {
    const user = usersData?.users.find((u) => u.id === userId);

    if (!user) return;

    if (expandedUserId === userId && expandedAction === action) {
      closeExpanded();
      return;
    }

    setSelectedUser(user);
    setExpandedUserId(userId);
    setExpandedAction(action);

    if (action === 'edit') {
      setEditFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        country: user.country || '',
        city: user.city || '',
        techCenterId: user.techCenterId || '',
        profileImageUrl: user.profileImageUrl || '',
      });
    }
  };

  const handleEditInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUser) return;

    updateUserMutation.mutate(
      {
        userId: selectedUser.id,
        data: editFormData,
      },
      {
        onSuccess: () => {
          closeExpanded();
          refetch();
        },
        onError: (error: any) => {
          window.alert(error.message || 'Failed to update user');
        },
      }
    );
  };

  const handleDeleteUser = () => {
    if (!selectedUser) return;

    deleteMutation.mutate(selectedUser.id, {
      onSuccess: () => {
        closeExpanded();
        refetch();
      },
      onError: (error: any) => {
        window.alert(error.message || 'Failed to delete user');
      },
    });
  };

  const handleChangeRole = (roleId: string) => {
    if (!selectedUser) return;

    updateRoleMutation.mutate(
      {
        userId: selectedUser.id,
        roleId,
      },
      {
        onSuccess: () => {
          closeExpanded();
          refetch();
        },
        onError: (error: any) => {
          window.alert(error.message || 'Failed to update user role');
        },
      }
    );
  };

  const handleChangeStatus = (status: string) => {
    if (!selectedUser) return;

    updateStatusMutation.mutate(
      {
        userId: selectedUser.id,
        status,
      },
      {
        onSuccess: () => {
          closeExpanded();
          refetch();
        },
        onError: (error: any) => {
          window.alert(error.message || 'Failed to update user status');
        },
      }
    );
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  useEffect(() => {
    setPage(1);
  }, [searchTerm, filters]);

  /* ------------------------------------------------------------------------ */
  /* Initial loading                                                           */
  /* ------------------------------------------------------------------------ */

  if (isLoading && !usersData) {
    return (
      <main className="min-h-screen bg-[#F7F8FA] px-3 py-4 sm:px-5 lg:px-6">
        <div className="mx-auto max-w-[1500px]">
          <HeaderSkeleton />
          <StatsSkeleton />
          <SearchFiltersSkeleton />

          <UserTableSkeleton />

          <div className="space-y-3 lg:hidden">
            {Array.from({ length: 5 }).map((_, index) => (
              <UserCardSkeleton key={index} />
            ))}
          </div>
        </div>
      </main>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Error                                                                     */
  /* ------------------------------------------------------------------------ */

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F7F8FA] px-4">
        <div className="w-full max-w-md rounded-xl border border-[#E2E6EB] bg-white p-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#FBF0EC]">
            <UsersIcon className="h-6 w-6 text-[#A4462F]" />
          </div>

          <h2 className="text-lg font-semibold text-[#12203B]">
            Unable to load users
          </h2>

          <p className="mt-1 text-sm text-[#6F7B8D]">
            {(error as Error)?.message ||
              'Something went wrong while loading users.'}
          </p>

          <button
            onClick={() => refetch()}
            className={`${primaryButton} mt-5 px-4 py-2 text-sm`}
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F8FA]">
      <div className="mx-auto max-w-[1500px] px-3 py-4 sm:px-5 lg:px-6 lg:py-5">
        {/* ---------------------------------------------------------------- */}
        {/* Header                                                            */}
        {/* ---------------------------------------------------------------- */}

        <header className="mb-6 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            aria-label="Go back"
            className={`${quietButton} h-9 w-9`}
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div className="h-7 w-px bg-[#E2E6EB]" />

          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#EEF2F7] text-[#12203B]">
              <UsersIcon className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <h1
                className="truncate text-xl font-semibold tracking-tight text-[#12203B] sm:text-2xl"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                User Management
              </h1>

              <p className="truncate text-xs text-[#6F7B8D] sm:text-sm">
                Manage users, roles and account access
              </p>
            </div>
          </div>
        </header>

        {/* ---------------------------------------------------------------- */}
        {/* Stats                                                             */}
        {/* ---------------------------------------------------------------- */}

        {stats && (
          <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatsCard
              title="Total Users"
              value={stats.total}
              icon={<UsersIcon className="h-5 w-5" />}
            />

            <StatsCard
              title="Active"
              value={stats.active}
              icon={<UserCheck className="h-5 w-5" />}
            />

            <StatsCard
              title="Inactive"
              value={stats.inactive}
              icon={<UserX className="h-5 w-5" />}
            />

            <StatsCard
              title="Suspended"
              value={stats.suspended}
              icon={<Shield className="h-5 w-5" />}
            />
          </section>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Search + Filters                                                  */}
        {/* ---------------------------------------------------------------- */}

        <section className="mb-5 rounded-xl border border-[#E2E6EB] bg-white p-3">
          <div className="flex flex-col gap-2.5 lg:flex-row">
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8993A3]" />

              <input
                type="text"
                placeholder="Search by name, email or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`${inputClass} pl-9 pr-9`}
              />

              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8993A3] transition hover:text-[#12203B]"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <button
              onClick={() => setShowFilters((value) => !value)}
              className={`${quietButton} h-10 px-3.5 text-sm`}
            >
              <Filter className="h-4 w-4" />
              Filters

              {hasFilters && (
                <span className="h-1.5 w-1.5 rounded-full bg-[#B98A3E]" />
              )}

              {showFilters ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>

            <button
              onClick={() => refetch()}
              className={`${quietButton} h-10 px-3.5 text-sm`}
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>

          <AnimatePresence initial={false}>
            {showFilters && usersData && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.18 }}
                className="overflow-hidden"
              >
                <div className="mt-3 grid grid-cols-1 gap-3 border-t border-[#E2E6EB] pt-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-[#43516A]">
                      Tech Center
                    </label>

                    <select
                      value={filters.techCenterId}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          techCenterId: e.target.value,
                        }))
                      }
                      className={selectClass}
                    >
                      <option value="">All Centers</option>

                      {usersData.filters.techCenters.map((tc) => (
                        <option key={tc.id} value={tc.id}>
                          {tc.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-[#43516A]">
                      Country
                    </label>

                    <select
                      value={filters.country}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          country: e.target.value,
                        }))
                      }
                      className={selectClass}
                    >
                      <option value="">All Countries</option>

                      {usersData.filters.countries.map((country) => (
                        <option key={country.id} value={country.name}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-[#43516A]">
                      Role
                    </label>

                    <select
                      value={filters.role}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          role: e.target.value,
                        }))
                      }
                      className={selectClass}
                    >
                      <option value="">All Roles</option>

                      {usersData.filters.roles.map((role) => (
                        <option key={role.id} value={role.name}>
                          {role.displayName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-[#43516A]">
                      Status
                    </label>

                    <select
                      value={filters.status}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          status: e.target.value,
                        }))
                      }
                      className={selectClass}
                    >
                      <option value="">All Statuses</option>

                      {usersData.filters.statuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {hasFilters && (
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={() =>
                        setFilters({
                          techCenterId: '',
                          country: '',
                          role: '',
                          status: '',
                        })
                      }
                      className="text-xs font-medium text-[#8A6E3A] hover:text-[#A67A34]"
                    >
                      Clear all filters
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Results summary                                                   */}
        {/* ---------------------------------------------------------------- */}

        {usersData && filteredUsers.length > 0 && (
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-[#6F7B8D] sm:text-sm">
              Showing{' '}
              <span className="font-medium text-[#43516A]">
                {(page - 1) * limit + 1}–
                {Math.min(page * limit, filteredUsers.length)}
              </span>{' '}
              of{' '}
              <span className="font-medium text-[#43516A]">
                {filteredUsers.length}
              </span>{' '}
              users
            </p>

            {(searchTerm || hasFilters) && (
              <span className="text-xs text-[#8993A3]">
                Filtered results
              </span>
            )}
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Empty state                                                       */}
        {/* ---------------------------------------------------------------- */}

        {usersData && filteredUsers.length === 0 && (
          <div className="rounded-xl border border-[#E2E6EB] bg-white px-5 py-14 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#F7F8FA] text-[#6F7B8D]">
              <UsersIcon className="h-6 w-6" />
            </div>

            <h2 className="text-base font-semibold text-[#12203B]">
              No users found
            </h2>

            <p className="mx-auto mt-1 max-w-sm text-sm text-[#6F7B8D]">
              {searchTerm || hasFilters
                ? 'Try adjusting your search or filters.'
                : 'There are no registered users yet.'}
            </p>

            {(searchTerm || hasFilters) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilters({
                    techCenterId: '',
                    country: '',
                    role: '',
                    status: '',
                  });
                }}
                className={`${quietButton} mt-5 px-4 py-2 text-sm`}
              >
                Clear search and filters
              </button>
            )}
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Desktop users table                                               */}
        {/* ---------------------------------------------------------------- */}

        {usersData && filteredUsers.length > 0 && (
          <>
            <div className="hidden overflow-hidden rounded-xl border border-[#E2E6EB] bg-white lg:block">
              {/* Table heading */}
              <div className="grid grid-cols-[minmax(280px,1.5fr)_160px_minmax(180px,1fr)_150px] gap-4 border-b border-[#E2E6EB] bg-[#F7F8FA] px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#6F7B8D]">
                <span>User</span>
                <span>Role</span>
                <span>Account</span>
                <span className="text-right">Actions</span>
              </div>

              {paginatedUsers.map((user) => {
                const isExpanded = expandedUserId === user.id;

                return (
                  <div
                    key={user.id}
                    className="border-b border-[#E2E6EB] last:border-b-0"
                  >
                    <div className="grid grid-cols-[minmax(280px,1.5fr)_160px_minmax(180px,1fr)_150px] items-center gap-4 px-4 py-3.5">
                      {/* User */}
                      <div className="flex min-w-0 items-center gap-3">
                        <UserAvatar user={user} size="sm" />

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-sm font-semibold text-[#12203B]">
                              {user.firstName} {user.lastName}
                            </p>
                          </div>

                          <p className="truncate text-xs text-[#6F7B8D]">
                            {user.email}
                          </p>

                          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-[#8993A3]">
                            {user.phoneNumber && (
                              <span>{user.phoneNumber}</span>
                            )}

                            <span>
                              Joined {formatDate(user.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Role */}
                      <div>
                        <RoleBadge
                          role={user.role?.name || 'student'}
                        />
                      </div>

                      {/* Account */}
                      <div className="min-w-0">
                        <StatusBadge status={user.status} />

                        <div className="mt-1.5 flex min-w-0 items-center gap-1.5 text-xs text-[#6F7B8D]">
                          <Building2 className="h-3.5 w-3.5 flex-shrink-0 text-[#8993A3]" />
                          <span className="truncate">
                            {user.techCenter?.name || 'No tech center'}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => toggleExpand(user.id, 'edit')}
                          aria-label={`Edit ${user.firstName}`}
                          className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                            isExpanded && expandedAction === 'edit'
                              ? 'bg-[#F8F3E8] text-[#8A6E3A]'
                              : 'text-[#6F7B8D] hover:bg-[#F7F8FA] hover:text-[#12203B]'
                          }`}
                        >
                          <Edit className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => toggleExpand(user.id, 'role')}
                          aria-label={`Change role for ${user.firstName}`}
                          className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                            isExpanded && expandedAction === 'role'
                              ? 'bg-[#F8F3E8] text-[#8A6E3A]'
                              : 'text-[#6F7B8D] hover:bg-[#F7F8FA] hover:text-[#12203B]'
                          }`}
                        >
                          <Shield className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => toggleExpand(user.id, 'status')}
                          aria-label={`Change status for ${user.firstName}`}
                          className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                            isExpanded && expandedAction === 'status'
                              ? 'bg-[#F8F3E8] text-[#8A6E3A]'
                              : 'text-[#6F7B8D] hover:bg-[#F7F8FA] hover:text-[#12203B]'
                          }`}
                        >
                          <UserCog className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => toggleExpand(user.id, 'delete')}
                          aria-label={`Delete ${user.firstName}`}
                          className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                            isExpanded && expandedAction === 'delete'
                              ? 'bg-[#FBF0EC] text-[#A4462F]'
                              : 'text-[#6F7B8D] hover:bg-[#FBF0EC] hover:text-[#A4462F]'
                          }`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Desktop expanded panel */}
                    <AnimatePresence initial={false}>
                      {isExpanded && selectedUser?.id === user.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.18 }}
                          className="overflow-hidden border-t border-[#E2E6EB] bg-[#F7F8FA]"
                        >
                          <div className="p-4">
                            {/* Edit */}
                            {expandedAction === 'edit' && (
                              <form
                                onSubmit={handleEditSubmit}
                                className="rounded-lg border border-[#E2E6EB] bg-white p-4"
                              >
                                <div className="mb-4 flex items-center justify-between">
                                  <div>
                                    <h3 className="text-sm font-semibold text-[#12203B]">
                                      Edit user
                                    </h3>
                                    <p className="mt-0.5 text-xs text-[#6F7B8D]">
                                      Update the user's profile information.
                                    </p>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={closeExpanded}
                                    className="text-[#8993A3] hover:text-[#12203B]"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>

                                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
                                  {[
                                    ['firstName', 'First name', 'text'],
                                    ['lastName', 'Last name', 'text'],
                                    ['email', 'Email', 'email'],
                                    ['phoneNumber', 'Phone', 'text'],
                                    ['country', 'Country', 'text'],
                                    ['city', 'City', 'text'],
                                    [
                                      'profileImageUrl',
                                      'Profile image URL',
                                      'url',
                                    ],
                                  ].map(([name, label, type]) => (
                                    <div key={name}>
                                      <label className="mb-1.5 block text-xs font-medium text-[#43516A]">
                                        {label}
                                      </label>

                                      <input
                                        type={type}
                                        name={name}
                                        value={
                                          editFormData[
                                            name as keyof typeof editFormData
                                          ]
                                        }
                                        onChange={handleEditInputChange}
                                        className={inputClass}
                                      />
                                    </div>
                                  ))}

                                  <div>
                                    <label className="mb-1.5 block text-xs font-medium text-[#43516A]">
                                      Tech center
                                    </label>

                                    <select
                                      name="techCenterId"
                                      value={editFormData.techCenterId}
                                      onChange={handleEditInputChange}
                                      className={selectClass}
                                    >
                                      <option value="">
                                        Select Tech Center
                                      </option>

                                      {usersData.filters.techCenters.map(
                                        (tc) => (
                                          <option
                                            key={tc.id}
                                            value={tc.id}
                                          >
                                            {tc.name}
                                          </option>
                                        )
                                      )}
                                    </select>
                                  </div>
                                </div>

                                <div className="mt-4 flex gap-2">
                                  <button
                                    type="button"
                                    onClick={closeExpanded}
                                    className={`${quietButton} px-4 py-2 text-sm`}
                                  >
                                    Cancel
                                  </button>

                                  <button
                                    type="submit"
                                    disabled={updateUserMutation.isPending}
                                    className={`${primaryButton} px-4 py-2 text-sm`}
                                  >
                                    {updateUserMutation.isPending ? (
                                      <>
                                        <span className="h-4 w-4 animate-pulse rounded-full bg-white/60" />
                                        Saving...
                                      </>
                                    ) : (
                                      <>
                                        <Save className="h-4 w-4" />
                                        Save changes
                                      </>
                                    )}
                                  </button>
                                </div>
                              </form>
                            )}

                            {/* Role */}
                            {expandedAction === 'role' && (
                              <div className="rounded-lg border border-[#E2E6EB] bg-white p-4">
                                <div className="mb-4">
                                  <h3 className="text-sm font-semibold text-[#12203B]">
                                    Change role
                                  </h3>

                                  <p className="mt-0.5 text-xs text-[#6F7B8D]">
                                    Select a new role for{' '}
                                    {selectedUser.firstName}{' '}
                                    {selectedUser.lastName}.
                                  </p>
                                </div>

                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                                  {usersData.filters.roles.map((role) => {
                                    const selected =
                                      selectedUser.role?.id === role.id;

                                    return (
                                      <button
                                        key={role.id}
                                        onClick={() =>
                                          handleChangeRole(role.id)
                                        }
                                        disabled={
                                          updateRoleMutation.isPending ||
                                          selected
                                        }
                                        className={`flex items-center justify-between rounded-lg border p-3 text-left transition ${
                                          selected
                                            ? 'border-[#D8C59F] bg-[#F8F3E8]'
                                            : 'border-[#E2E6EB] bg-white hover:border-[#D2D8E0] hover:bg-[#F7F8FA]'
                                        }`}
                                      >
                                        <div>
                                          <p className="text-sm font-medium text-[#12203B]">
                                            {role.displayName}
                                          </p>
                                          <p className="mt-0.5 text-[11px] text-[#8993A3]">
                                            {role.name}
                                          </p>
                                        </div>

                                        {selected && (
                                          <Check className="h-4 w-4 text-[#8A6E3A]" />
                                        )}
                                      </button>
                                    );
                                  })}
                                </div>

                                <button
                                  onClick={closeExpanded}
                                  className={`${quietButton} mt-4 px-4 py-2 text-sm`}
                                >
                                  Close
                                </button>
                              </div>
                            )}

                            {/* Status */}
                            {expandedAction === 'status' && (
                              <div className="rounded-lg border border-[#E2E6EB] bg-white p-4">
                                <div className="mb-4">
                                  <h3 className="text-sm font-semibold text-[#12203B]">
                                    Change account status
                                  </h3>

                                  <p className="mt-0.5 text-xs text-[#6F7B8D]">
                                    Choose the access status for{' '}
                                    {selectedUser.firstName}{' '}
                                    {selectedUser.lastName}.
                                  </p>
                                </div>

                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                                  {[
                                    {
                                      value: 'ACTIVE',
                                      description: 'Full platform access',
                                    },
                                    {
                                      value: 'INACTIVE',
                                      description: 'User cannot log in',
                                    },
                                    {
                                      value: 'SUSPENDED',
                                      description: 'Temporarily blocked',
                                    },
                                  ].map((item) => {
                                    const selected =
                                      selectedUser.status === item.value;

                                    return (
                                      <button
                                        key={item.value}
                                        onClick={() =>
                                          handleChangeStatus(item.value)
                                        }
                                        disabled={
                                          updateStatusMutation.isPending ||
                                          selected
                                        }
                                        className={`flex items-center justify-between rounded-lg border p-3 text-left transition ${
                                          selected
                                            ? 'border-[#D8C59F] bg-[#F8F3E8]'
                                            : 'border-[#E2E6EB] bg-white hover:border-[#D2D8E0] hover:bg-[#F7F8FA]'
                                        }`}
                                      >
                                        <div>
                                          <p className="text-sm font-medium text-[#12203B]">
                                            {item.value}
                                          </p>
                                          <p className="mt-0.5 text-[11px] text-[#8993A3]">
                                            {item.description}
                                          </p>
                                        </div>

                                        {selected && (
                                          <Check className="h-4 w-4 text-[#8A6E3A]" />
                                        )}
                                      </button>
                                    );
                                  })}
                                </div>

                                <button
                                  onClick={closeExpanded}
                                  className={`${quietButton} mt-4 px-4 py-2 text-sm`}
                                >
                                  Close
                                </button>
                              </div>
                            )}

                            {/* Delete */}
                            {expandedAction === 'delete' && (
                              <div className="rounded-lg border border-[#F0D7D0] bg-white p-4">
                                <div className="flex items-start gap-3">
                                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#FBF0EC]">
                                    <AlertTriangle className="h-4 w-4 text-[#A4462F]" />
                                  </div>

                                  <div className="min-w-0">
                                    <h3 className="text-sm font-semibold text-[#12203B]">
                                      Delete {selectedUser.firstName}{' '}
                                      {selectedUser.lastName}?
                                    </h3>

                                    <p className="mt-1 max-w-2xl text-xs leading-5 text-[#6F7B8D]">
                                      This action cannot be undone. The user's
                                      account and associated platform data may
                                      be permanently removed.
                                    </p>
                                  </div>
                                </div>

                                <div className="mt-4 flex gap-2">
                                  <button
                                    onClick={closeExpanded}
                                    className={`${quietButton} px-4 py-2 text-sm`}
                                  >
                                    Cancel
                                  </button>

                                  <button
                                    onClick={handleDeleteUser}
                                    disabled={deleteMutation.isPending}
                                    className={`${dangerButton} px-4 py-2 text-sm`}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    {deleteMutation.isPending
                                      ? 'Deleting...'
                                      : 'Delete user'}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            {/* ---------------------------------------------------------------- */}
            {/* Mobile cards                                                     */}
            {/* ---------------------------------------------------------------- */}

            <div className="space-y-3 lg:hidden">
              {paginatedUsers.map((user) => {
                const isExpanded = expandedUserId === user.id;

                return (
                  <div
                    key={user.id}
                    className="overflow-hidden rounded-xl border border-[#E2E6EB] bg-white"
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <UserAvatar user={user} />

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-[#12203B]">
                              {user.firstName} {user.lastName}
                            </p>

                            <p className="truncate text-xs text-[#6F7B8D]">
                              {user.email}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-shrink-0 flex-col items-end gap-1">
                          <StatusBadge status={user.status} />
                          <RoleBadge
                            role={user.role?.name || 'student'}
                          />
                        </div>
                      </div>

                      <div className="mt-4 space-y-2">
                        {user.techCenter && (
                          <div className="flex items-center gap-2 text-xs text-[#6F7B8D]">
                            <Building2 className="h-3.5 w-3.5 text-[#8993A3]" />
                            <span className="truncate">
                              {user.techCenter.name}
                            </span>
                          </div>
                        )}

                        {user.country && (
                          <div className="flex items-center gap-2 text-xs text-[#6F7B8D]">
                            <Globe className="h-3.5 w-3.5 text-[#8993A3]" />
                            <span>{user.country}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-xs text-[#6F7B8D]">
                          <Calendar className="h-3.5 w-3.5 text-[#8993A3]" />
                          <span>Joined {formatDate(user.createdAt)}</span>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-end gap-1.5 border-t border-[#E2E6EB] pt-3">
                        <button
                          onClick={() => toggleExpand(user.id, 'edit')}
                          className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                            isExpanded && expandedAction === 'edit'
                              ? 'bg-[#F8F3E8] text-[#8A6E3A]'
                              : 'bg-[#F7F8FA] text-[#43516A] hover:bg-[#EEF2F7]'
                          }`}
                        >
                          <Edit className="h-3.5 w-3.5" />
                          Edit
                        </button>

                        <button
                          onClick={() => toggleExpand(user.id, 'role')}
                          className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                            isExpanded && expandedAction === 'role'
                              ? 'bg-[#F8F3E8] text-[#8A6E3A]'
                              : 'bg-[#F7F8FA] text-[#43516A] hover:bg-[#EEF2F7]'
                          }`}
                        >
                          <Shield className="h-3.5 w-3.5" />
                          Role
                        </button>

                        <button
                          onClick={() => toggleExpand(user.id, 'status')}
                          className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                            isExpanded && expandedAction === 'status'
                              ? 'bg-[#F8F3E8] text-[#8A6E3A]'
                              : 'bg-[#F7F8FA] text-[#43516A] hover:bg-[#EEF2F7]'
                          }`}
                        >
                          <UserCog className="h-3.5 w-3.5" />
                          Status
                        </button>

                        <button
                          onClick={() => toggleExpand(user.id, 'delete')}
                          className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                            isExpanded && expandedAction === 'delete'
                              ? 'bg-[#FBF0EC] text-[#A4462F]'
                              : 'bg-[#F7F8FA] text-[#43516A] hover:bg-[#FBF0EC] hover:text-[#A4462F]'
                          }`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </div>
                    </div>

                    {/* Mobile expanded actions */}
                    <AnimatePresence initial={false}>
                      {isExpanded && selectedUser?.id === user.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.18 }}
                          className="overflow-hidden border-t border-[#E2E6EB] bg-[#F7F8FA]"
                        >
                          <div className="p-4">
                            {expandedAction === 'edit' && (
                              <form
                                onSubmit={handleEditSubmit}
                                className="space-y-3"
                              >
                                <div className="grid grid-cols-1 gap-3">
                                  <input
                                    type="text"
                                    name="firstName"
                                    value={editFormData.firstName}
                                    onChange={handleEditInputChange}
                                    placeholder="First name"
                                    className={inputClass}
                                  />

                                  <input
                                    type="text"
                                    name="lastName"
                                    value={editFormData.lastName}
                                    onChange={handleEditInputChange}
                                    placeholder="Last name"
                                    className={inputClass}
                                  />

                                  <input
                                    type="email"
                                    name="email"
                                    value={editFormData.email}
                                    onChange={handleEditInputChange}
                                    placeholder="Email"
                                    className={inputClass}
                                  />

                                  <input
                                    type="text"
                                    name="phoneNumber"
                                    value={editFormData.phoneNumber}
                                    onChange={handleEditInputChange}
                                    placeholder="Phone"
                                    className={inputClass}
                                  />

                                  <input
                                    type="text"
                                    name="country"
                                    value={editFormData.country}
                                    onChange={handleEditInputChange}
                                    placeholder="Country"
                                    className={inputClass}
                                  />

                                  <input
                                    type="text"
                                    name="city"
                                    value={editFormData.city}
                                    onChange={handleEditInputChange}
                                    placeholder="City"
                                    className={inputClass}
                                  />

                                  <select
                                    name="techCenterId"
                                    value={editFormData.techCenterId}
                                    onChange={handleEditInputChange}
                                    className={selectClass}
                                  >
                                    <option value="">
                                      Select Tech Center
                                    </option>

                                    {usersData.filters.techCenters.map(
                                      (tc) => (
                                        <option
                                          key={tc.id}
                                          value={tc.id}
                                        >
                                          {tc.name}
                                        </option>
                                      )
                                    )}
                                  </select>

                                  <input
                                    type="url"
                                    name="profileImageUrl"
                                    value={editFormData.profileImageUrl}
                                    onChange={handleEditInputChange}
                                    placeholder="Profile image URL"
                                    className={inputClass}
                                  />
                                </div>

                                <div className="flex gap-2 pt-1">
                                  <button
                                    type="button"
                                    onClick={closeExpanded}
                                    className={`${quietButton} flex-1 px-4 py-2 text-sm`}
                                  >
                                    Cancel
                                  </button>

                                  <button
                                    type="submit"
                                    disabled={updateUserMutation.isPending}
                                    className={`${primaryButton} flex-1 px-4 py-2 text-sm`}
                                  >
                                    <Save className="h-4 w-4" />
                                    {updateUserMutation.isPending
                                      ? 'Saving...'
                                      : 'Save'}
                                  </button>
                                </div>
                              </form>
                            )}

                            {expandedAction === 'role' && (
                              <div>
                                <p className="mb-3 text-xs text-[#6F7B8D]">
                                  Select a role for{' '}
                                  <span className="font-medium text-[#43516A]">
                                    {selectedUser.firstName}
                                  </span>
                                  .
                                </p>

                                <div className="space-y-2">
                                  {usersData.filters.roles.map((role) => {
                                    const selected =
                                      selectedUser.role?.id === role.id;

                                    return (
                                      <button
                                        key={role.id}
                                        onClick={() =>
                                          handleChangeRole(role.id)
                                        }
                                        disabled={
                                          updateRoleMutation.isPending ||
                                          selected
                                        }
                                        className={`flex w-full items-center justify-between rounded-lg border p-3 text-left ${
                                          selected
                                            ? 'border-[#D8C59F] bg-[#F8F3E8]'
                                            : 'border-[#E2E6EB] bg-white hover:bg-[#F7F8FA]'
                                        }`}
                                      >
                                        <span className="text-sm font-medium text-[#12203B]">
                                          {role.displayName}
                                        </span>

                                        {selected && (
                                          <Check className="h-4 w-4 text-[#8A6E3A]" />
                                        )}
                                      </button>
                                    );
                                  })}
                                </div>

                                <button
                                  onClick={closeExpanded}
                                  className={`${quietButton} mt-3 w-full px-4 py-2 text-sm`}
                                >
                                  Close
                                </button>
                              </div>
                            )}

                            {expandedAction === 'status' && (
                              <div>
                                <p className="mb-3 text-xs text-[#6F7B8D]">
                                  Select a new status for{' '}
                                  <span className="font-medium text-[#43516A]">
                                    {selectedUser.firstName}
                                  </span>
                                  .
                                </p>

                                <div className="space-y-2">
                                  {['ACTIVE', 'INACTIVE', 'SUSPENDED'].map(
                                    (status) => {
                                      const selected =
                                        selectedUser.status === status;

                                      return (
                                        <button
                                          key={status}
                                          onClick={() =>
                                            handleChangeStatus(status)
                                          }
                                          disabled={
                                            updateStatusMutation.isPending ||
                                            selected
                                          }
                                          className={`flex w-full items-center justify-between rounded-lg border p-3 text-left ${
                                            selected
                                              ? 'border-[#D8C59F] bg-[#F8F3E8]'
                                              : 'border-[#E2E6EB] bg-white hover:bg-[#F7F8FA]'
                                          }`}
                                        >
                                          <div>
                                            <p className="text-sm font-medium text-[#12203B]">
                                              {status}
                                            </p>

                                            <p className="mt-0.5 text-[11px] text-[#8993A3]">
                                              {status === 'ACTIVE'
                                                ? 'Full access'
                                                : status === 'INACTIVE'
                                                ? 'Cannot login'
                                                : 'Temporarily blocked'}
                                            </p>
                                          </div>

                                          {selected && (
                                            <Check className="h-4 w-4 text-[#8A6E3A]" />
                                          )}
                                        </button>
                                      );
                                    }
                                  )}
                                </div>

                                <button
                                  onClick={closeExpanded}
                                  className={`${quietButton} mt-3 w-full px-4 py-2 text-sm`}
                                >
                                  Close
                                </button>
                              </div>
                            )}

                            {expandedAction === 'delete' && (
                              <div>
                                <div className="flex items-start gap-3">
                                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#FBF0EC]">
                                    <AlertTriangle className="h-4 w-4 text-[#A4462F]" />
                                  </div>

                                  <div>
                                    <p className="text-sm font-semibold text-[#12203B]">
                                      Delete {selectedUser.firstName}?
                                    </p>

                                    <p className="mt-1 text-xs leading-5 text-[#6F7B8D]">
                                      This action cannot be undone.
                                    </p>
                                  </div>
                                </div>

                                <div className="mt-4 flex gap-2">
                                  <button
                                    onClick={closeExpanded}
                                    className={`${quietButton} flex-1 px-4 py-2 text-sm`}
                                  >
                                    Cancel
                                  </button>

                                  <button
                                    onClick={handleDeleteUser}
                                    disabled={deleteMutation.isPending}
                                    className={`${dangerButton} flex-1 px-4 py-2 text-sm`}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    {deleteMutation.isPending
                                      ? 'Deleting...'
                                      : 'Delete'}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            {/* ---------------------------------------------------------------- */}
            {/* Pagination                                                        */}
            {/* ---------------------------------------------------------------- */}

            {totalPages > 1 && (
              <div className="mt-5 flex flex-col items-center justify-between gap-3 sm:flex-row">
                <p className="text-xs text-[#6F7B8D] sm:text-sm">
                  Page {page} of {totalPages}
                </p>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    aria-label="Previous page"
                    className={`${quietButton} h-9 w-9`}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  {Array.from(
                    { length: Math.min(5, totalPages) },
                    (_, index) => {
                      const pageNum =
                        index +
                        Math.max(
                          1,
                          Math.min(page - 2, totalPages - 4)
                        );

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`flex h-9 w-9 items-center justify-center rounded-lg text-xs font-medium transition-colors ${
                            pageNum === page
                              ? 'bg-[#12203B] text-white'
                              : 'border border-[#E2E6EB] bg-white text-[#43516A] hover:bg-[#F7F8FA]'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                  )}

                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    aria-label="Next page"
                    className={`${quietButton} h-9 w-9`}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

