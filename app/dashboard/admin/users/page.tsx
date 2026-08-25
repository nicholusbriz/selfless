'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Users as UsersIcon,
  UserCheck,
  UserX,
  ArrowLeft,
  Loader2,
  ChevronDown,
  ChevronUp,
  X,
  Check,
  Filter,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Save,
  Trash2,
  AlertTriangle,
  Eye,
} from 'lucide-react';
import {
  useAdminUsers,
  useUpdateUser,
  useUpdateUserRole,
  useUpdateUserStatus,
} from '@/hooks/useAdminUsers';
import { useDeleteSuperAdminUser } from '@/hooks/useSuperAdminUsers';

type ActionType = 'edit' | 'role' | 'status' | null;

type StatsCardProps = {
  title: string;
  value: number;
  subtitle?: string;
  variant: 'primary' | 'success' | 'neutral' | 'danger';
};

const statsStyles = {
  primary: {
    card: 'border-blue-100 bg-white',
    accent: 'bg-blue-50 text-blue-700',
    value: 'text-slate-900',
  },
  success: {
    card: 'border-emerald-100 bg-white',
    accent: 'bg-emerald-50 text-emerald-700',
    value: 'text-slate-900',
  },
  neutral: {
    card: 'border-slate-200 bg-white',
    accent: 'bg-slate-100 text-slate-600',
    value: 'text-slate-900',
  },
  danger: {
    card: 'border-red-100 bg-white',
    accent: 'bg-red-50 text-red-700',
    value: 'text-slate-900',
  },
};

const StatusBadge = ({ status }: { status: string }) => {
  const normalizedStatus = status?.toUpperCase();

  const styles = {
    ACTIVE: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    INACTIVE: 'bg-amber-50 text-amber-700 border border-amber-200',
    SUSPENDED: 'bg-red-50 text-red-700 border border-red-200',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
        styles[normalizedStatus as keyof typeof styles] ||
        'bg-slate-100 text-slate-600 border border-slate-200'
      }`}
    >
      {normalizedStatus || 'UNKNOWN'}
    </span>
  );
};

const RoleBadge = ({ role }: { role: string }) => {
  const normalizedRole = role?.toLowerCase();

  const styles = {
    admin: 'bg-violet-50 text-violet-700 border border-violet-200',
    teacher: 'bg-blue-50 text-blue-700 border border-blue-200',
    student: 'bg-sky-50 text-sky-700 border border-sky-200',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
        styles[normalizedRole as keyof typeof styles] ||
        'bg-slate-100 text-slate-600 border border-slate-200'
      }`}
    >
      {role?.replace('_', ' ').toUpperCase() || 'STUDENT'}
    </span>
  );
};

const StatsCard = ({
  title,
  value,
  subtitle,
  variant,
}: StatsCardProps) => {
  const style = statsStyles[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border p-5 shadow-sm transition-shadow duration-200 hover:shadow-md ${style.card}`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{title}</p>

          <p className={`mt-1 text-2xl font-bold ${style.value}`}>
            {value}
          </p>

          {subtitle && (
            <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
          )}
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${style.accent}`}
        >
          <span className="text-lg font-bold">
            {value}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

const SkeletonStatsCard = () => (
  <div className="animate-pulse rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <div className="mb-2 h-4 w-24 rounded bg-slate-200" />
        <div className="h-8 w-14 rounded bg-slate-200" />
      </div>
      <div className="h-11 w-11 rounded-lg bg-slate-200" />
    </div>
  </div>
);

const SkeletonUserRow = () => (
  <div className="animate-pulse rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-center gap-4">
      <div className="h-11 w-11 shrink-0 rounded-full bg-slate-200" />

      <div className="min-w-0 flex-1">
        <div className="mb-2 flex items-center gap-3">
          <div className="h-5 w-32 rounded bg-slate-200" />
          <div className="h-5 w-16 rounded-full bg-slate-200" />
          <div className="h-5 w-16 rounded-full bg-slate-200" />
        </div>

        <div className="flex gap-4">
          <div className="h-3 w-48 rounded bg-slate-200" />
          <div className="h-3 w-24 rounded bg-slate-200" />
        </div>
      </div>

      <div className="flex gap-2">
        <div className="h-9 w-24 rounded-lg bg-slate-200" />
        <div className="h-9 w-24 rounded-lg bg-slate-200" />
        <div className="h-9 w-28 rounded-lg bg-slate-200" />
      </div>
    </div>
  </div>
);

export default function AdminUsersPage() {
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [expandedAction, setExpandedAction] = useState<ActionType>(null);

  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    country: '',
    city: '',
  });

  const [filters, setFilters] = useState({
    role: '',
    status: '',
  });

  const [showFilters, setShowFilters] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const {
    data: usersData,
    isLoading,
    error,
    refetch,
  } = useAdminUsers({
    page: 1,
    limit: 1000,
  });

  const updateRoleMutation = useUpdateUserRole();
  const updateStatusMutation = useUpdateUserStatus();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteSuperAdminUser();

  const closeExpandedAction = () => {
    setExpandedUserId(null);
    setExpandedAction(null);
    setSelectedUser(null);
  };

  const toggleExpand = (
    userId: string,
    action: Exclude<ActionType, null>
  ) => {
    const user = usersData?.users.find((u) => u.id === userId);

    if (!user) return;

    if (
      expandedUserId === userId &&
      expandedAction === action
    ) {
      closeExpandedAction();
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
        onSuccess: (data) => {
          closeExpandedAction();
          alert(data.message);
        },
        onError: (mutationError: any) => {
          alert(
            mutationError.message ||
              'Failed to update user'
          );
        },
      }
    );
  };

  const handleChangeRole = (roleId: string) => {
    if (!selectedUser) return;

    updateRoleMutation.mutate(
      {
        userId: selectedUser.id,
        roleId,
      },
      {
        onSuccess: (data) => {
          closeExpandedAction();
          alert(data.message);
        },
        onError: (mutationError: any) => {
          alert(
            mutationError.message ||
              'Failed to update user role'
          );
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
        onSuccess: (data) => {
          closeExpandedAction();
          alert(data.message);
        },
        onError: (mutationError: any) => {
          alert(
            mutationError.message ||
              'Failed to update user status'
          );
        },
      }
    );
  };

  const handleDeleteUser = (user: any) => {
    setUserToDelete(user);
    setShowDeleteDialog(true);
  };

  const confirmDeleteUser = () => {
    if (!userToDelete) return;

    deleteUserMutation.mutate(userToDelete.id, {
      onSuccess: (data) => {
        setShowDeleteDialog(false);
        setUserToDelete(null);
        alert(data.message);
      },
      onError: (mutationError: any) => {
        setShowDeleteDialog(false);
        setUserToDelete(null);
        alert(
          mutationError.message ||
            'Failed to delete user'
        );
      },
    });
  };

  const cancelDeleteUser = () => {
    setShowDeleteDialog(false);
    setUserToDelete(null);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);

    closeExpandedAction();

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(
      'en-US',
      {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }
    );
  };

  const filteredUsers = useMemo(() => {
    if (!usersData) return [];

    return usersData.users.filter((user) => {
      const searchLower =
        debouncedSearchTerm.toLowerCase();

      const matchesSearch =
        !debouncedSearchTerm ||
        user.firstName
          .toLowerCase()
          .includes(searchLower) ||
        user.lastName
          .toLowerCase()
          .includes(searchLower) ||
        (user.email &&
          user.email
            .toLowerCase()
            .includes(searchLower)) ||
        (user.phoneNumber &&
          user.phoneNumber
            .toLowerCase()
            .includes(searchLower));

      const matchesRole =
        !filters.role ||
        user.role?.name === filters.role;

      const matchesStatus =
        !filters.status ||
        user.status === filters.status;

      return (
        matchesSearch &&
        matchesRole &&
        matchesStatus
      );
    });
  }, [
    usersData,
    debouncedSearchTerm,
    filters,
  ]);

  const stats = useMemo(() => {
    if (!usersData) return null;

    return {
      total: usersData.pagination.total,
      active: usersData.stats.active,
      inactive: usersData.stats.inactive,
      suspended: usersData.stats.suspended,
    };
  }, [usersData]);

  const paginatedUsers = useMemo(() => {
    const startIndex = (page - 1) * limit;

    return filteredUsers.slice(
      startIndex,
      startIndex + limit
    );
  }, [filteredUsers, page, limit]);

  const totalPages = Math.ceil(
    filteredUsers.length / limit
  );

  if (isLoading && !usersData) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-center gap-4">
            <div className="h-10 w-10 animate-pulse rounded-lg bg-slate-200" />

            <div className="h-8 w-px bg-slate-200" />

            <div>
              <div className="mb-2 h-7 w-48 animate-pulse rounded bg-slate-200" />
              <div className="h-4 w-64 animate-pulse rounded bg-slate-200" />
            </div>
          </div>

          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonStatsCard key={i} />
            ))}
          </div>

          <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row">
              <div className="h-11 flex-1 animate-pulse rounded-lg bg-slate-200" />
              <div className="h-11 w-full animate-pulse rounded-lg bg-slate-200 lg:w-28" />
              <div className="h-11 w-full animate-pulse rounded-lg bg-slate-200 lg:w-28" />
            </div>
          </div>

          <div className="hidden space-y-4 lg:block">
            {[1, 2, 3, 4, 5].map((i) => (
              <SkeletonUserRow key={i} />
            ))}
          </div>

          <div className="space-y-4 lg:hidden">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="animate-pulse rounded-xl border border-slate-200 bg-white p-5"
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-slate-200" />
                  <div>
                    <div className="mb-2 h-4 w-32 rounded bg-slate-200" />
                    <div className="h-3 w-44 rounded bg-slate-200" />
                  </div>
                </div>

                <div className="mb-4 space-y-2">
                  <div className="h-3 w-40 rounded bg-slate-200" />
                  <div className="h-3 w-48 rounded bg-slate-200" />
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <div className="h-9 rounded-lg bg-slate-200" />
                  <div className="h-9 rounded-lg bg-slate-200" />
                  <div className="h-9 rounded-lg bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
            <UsersIcon className="h-7 w-7 text-red-600" />
          </div>

          <h3 className="text-xl font-bold text-slate-900">
            Failed to Load Users
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {(error as Error)?.message ||
              'An error occurred while loading users.'}
          </p>

          <button
            onClick={() => refetch()}
            className="mt-6 rounded-lg bg-blue-700 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <div className="h-8 w-px bg-slate-200" />

            <div>
              <h1
                className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl"
                style={{
                  fontFamily:
                    'var(--font-display)',
                }}
              >
                User Management
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Manage users in{' '}
                <span className="font-medium text-slate-700">
                  {usersData?.techCenter?.name ||
                    'your tech center'}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Statistics */}
        {stats && (
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Total Users"
              value={stats.total}
              subtitle="All registered users"
              variant="primary"
            />

            <StatsCard
              title="Active Users"
              value={stats.active}
              subtitle="Currently active"
              variant="success"
            />

            <StatsCard
              title="Inactive Users"
              value={stats.inactive}
              subtitle="Currently inactive"
              variant="neutral"
            />

            <StatsCard
              title="Suspended Users"
              value={stats.suspended}
              subtitle="Currently suspended"
              variant="danger"
            />
          </div>
        )}

        {/* Search and Filters */}
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                placeholder="Search users by name, email, or phone..."
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(e.target.value)
                }
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <button
              onClick={() =>
                setShowFilters(!showFilters)
              }
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Filter className="h-4 w-4" />

              Filters

              {Object.values(filters).some(
                (value) => value
              ) && (
                <span className="h-2 w-2 rounded-full bg-blue-600" />
              )}

              {showFilters ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>

            <button
              onClick={() => refetch()}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>

          <AnimatePresence>
            {showFilters && usersData && (
              <motion.div
                initial={{
                  opacity: 0,
                  height: 0,
                }}
                animate={{
                  opacity: 1,
                  height: 'auto',
                }}
                exit={{
                  opacity: 0,
                  height: 0,
                }}
                transition={{
                  duration: 0.2,
                }}
                className="overflow-hidden"
              >
                <div className="mt-4 grid grid-cols-1 gap-4 border-t border-slate-100 pt-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                      Role
                    </label>

                    <select
                      value={filters.role}
                      onChange={(e) => {
                        setFilters((prev) => ({
                          ...prev,
                          role: e.target.value,
                        }));
                        setPage(1);
                      }}
                      className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="">
                        All Roles
                      </option>

                      {usersData.filters.roles.map(
                        (role) => (
                          <option
                            key={role.id}
                            value={role.name}
                          >
                            {role.displayName}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                      Status
                    </label>

                    <select
                      value={filters.status}
                      onChange={(e) => {
                        setFilters((prev) => ({
                          ...prev,
                          status: e.target.value,
                        }));
                        setPage(1);
                      }}
                      className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="">
                        All Statuses
                      </option>

                      {usersData.filters.statuses.map(
                        (status) => (
                          <option
                            key={status}
                            value={status}
                          >
                            {status}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                </div>

                {Object.values(filters).some(
                  (value) => value
                ) && (
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => {
                        setFilters({
                          role: '',
                          status: '',
                        });
                        setPage(1);
                      }}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-800"
                    >
                      <X className="h-4 w-4" />
                      Clear all filters
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Result summary */}
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Users
            </h2>

            <p className="text-sm text-slate-500">
              {filteredUsers.length}{' '}
              {filteredUsers.length === 1
                ? 'user'
                : 'users'}{' '}
              found
            </p>
          </div>

          {(searchTerm ||
            Object.values(filters).some(
              (value) => value
            )) && (
            <p className="text-sm text-slate-500">
              Results filtered by your search and filters
            </p>
          )}
        </div>

        {usersData && (
          <>
            {filteredUsers.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                  <UsersIcon className="h-8 w-8 text-slate-400" />
                </div>

                <h3 className="text-xl font-bold text-slate-900">
                  No Users Found
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  {searchTerm ||
                  Object.values(filters).some(
                    (value) => value
                  )
                    ? 'Try adjusting your search or filters to find the user you are looking for.'
                    : 'There are currently no users in your tech center.'}
                </p>

                {(searchTerm ||
                  Object.values(filters).some(
                    (value) => value
                  )) && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setFilters({
                        role: '',
                        status: '',
                      });
                      setPage(1);
                    }}
                    className="mt-5 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                  >
                    Clear Search and Filters
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Desktop Users */}
                <div className="hidden space-y-3 lg:block">
                  {paginatedUsers.map((user) => (
                    <div key={user.id}>
                      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md">
                        <div className="flex items-center gap-5 p-5">
                          {/* Avatar */}
                          {user.profileImageUrl ? (
                            <img
                              src={user.profileImageUrl}
                              alt={`${user.firstName} ${user.lastName}`}
                              className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-slate-100"
                            />
                          ) : (
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-700 ring-2 ring-blue-100">
                              {user.firstName
                                .charAt(0)
                                .toUpperCase()}
                              {user.lastName
                                .charAt(0)
                                .toUpperCase()}
                            </div>
                          )}

                          {/* User information */}
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-base font-bold text-slate-900">
                                {user.firstName}{' '}
                                {user.lastName}
                              </p>

                              <RoleBadge
                                role={
                                  user.role?.name ||
                                  'student'
                                }
                              />

                              <StatusBadge
                                status={user.status}
                              />
                            </div>

                            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                              <span className="truncate">
                                {user.email}
                              </span>

                              {user.phoneNumber && (
                                <span>
                                  {user.phoneNumber}
                                </span>
                              )}

                              <span>
                                Joined{' '}
                                {formatDate(
                                  user.createdAt
                                )}
                              </span>
                            </div>
                          </div>

                          {/* Text actions */}
                          <div className="flex shrink-0 items-center gap-2">
                            <button
                              onClick={() =>
                                toggleExpand(
                                  user.id,
                                  'edit'
                                )
                              }
                              className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                                expandedUserId ===
                                  user.id &&
                                expandedAction === 'edit'
                                  ? 'border-blue-200 bg-blue-50 text-blue-700'
                                  : 'border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700'
                              }`}
                            >
                              Edit User
                            </button>

                            <button
                              onClick={() =>
                                toggleExpand(
                                  user.id,
                                  'role'
                                )
                              }
                              className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                                expandedUserId ===
                                  user.id &&
                                expandedAction === 'role'
                                  ? 'border-violet-200 bg-violet-50 text-violet-700'
                                  : 'border-slate-200 bg-white text-slate-700 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700'
                              }`}
                            >
                              Edit Role
                            </button>

                            <button
                              onClick={() =>
                                toggleExpand(
                                  user.id,
                                  'status'
                                )
                              }
                              className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                                expandedUserId ===
                                  user.id &&
                                expandedAction === 'status'
                                  ? 'border-amber-200 bg-amber-50 text-amber-700'
                                  : 'border-slate-200 bg-white text-slate-700 hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700'
                              }`}
                            >
                              Change Status
                            </button>

                            <button
                              onClick={() => router.push(`/dashboard/students/${user.id}`)}
                              className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-100"
                            >
                              <Eye className="h-4 w-4" />
                            </button>

                            <button
                              onClick={() => handleDeleteUser(user)}
                              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 transition hover:border-red-300 hover:bg-red-100"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* Expanded Content */}
                        <AnimatePresence>
                          {expandedUserId ===
                            user.id &&
                            selectedUser && (
                              <motion.div
                                initial={{
                                  opacity: 0,
                                  height: 0,
                                }}
                                animate={{
                                  opacity: 1,
                                  height: 'auto',
                                }}
                                exit={{
                                  opacity: 0,
                                  height: 0,
                                }}
                                transition={{
                                  duration: 0.25,
                                }}
                                className="overflow-hidden border-t border-slate-200"
                              >
                                <div className="bg-slate-50 p-5">
                                  {/* Edit User */}
                                  {expandedAction ===
                                    'edit' && (
                                    <form
                                      onSubmit={
                                        handleEditSubmit
                                      }
                                      className="space-y-5"
                                    >
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <h3 className="text-base font-bold text-slate-900">
                                            Edit User
                                          </h3>
                                          <p className="mt-1 text-sm text-slate-500">
                                            Update the
                                            account
                                            information
                                            for{' '}
                                            {selectedUser.firstName}{' '}
                                            {
                                              selectedUser.lastName
                                            }
                                            .
                                          </p>
                                        </div>
                                      </div>

                                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        {[
                                          {
                                            label: 'First Name',
                                            name: 'firstName',
                                            type: 'text',
                                          },
                                          {
                                            label: 'Last Name',
                                            name: 'lastName',
                                            type: 'text',
                                          },
                                          {
                                            label: 'Email',
                                            name: 'email',
                                            type: 'email',
                                          },
                                          {
                                            label: 'Phone',
                                            name: 'phoneNumber',
                                            type: 'text',
                                          },
                                          {
                                            label: 'Country',
                                            name: 'country',
                                            type: 'text',
                                          },
                                          {
                                            label: 'City',
                                            name: 'city',
                                            type: 'text',
                                          },
                                        ].map(
                                          (field) => (
                                            <div
                                              key={
                                                field.name
                                              }
                                            >
                                              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                                                {
                                                  field.label
                                                }
                                              </label>

                                              <input
                                                type={
                                                  field.type
                                                }
                                                name={
                                                  field.name
                                                }
                                                value={
                                                  editFormData[
                                                    field.name as keyof typeof editFormData
                                                  ]
                                                }
                                                onChange={
                                                  handleEditInputChange
                                                }
                                                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                              />
                                            </div>
                                          )
                                        )}
                                      </div>

                                      <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-4">
                                        <button
                                          type="button"
                                          onClick={
                                            closeExpandedAction
                                          }
                                          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                                        >
                                          <X className="h-4 w-4" />
                                          Cancel
                                        </button>

                                        <button
                                          type="submit"
                                          disabled={
                                            updateUserMutation.isPending
                                          }
                                          className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                          {updateUserMutation.isPending ? (
                                            <>
                                              <Loader2 className="h-4 w-4 animate-spin" />
                                              Saving...
                                            </>
                                          ) : (
                                            <>
                                              <Save className="h-4 w-4" />
                                              Save Changes
                                            </>
                                          )}
                                        </button>
                                      </div>
                                    </form>
                                  )}

                                  {/* Edit Role */}
                                  {expandedAction ===
                                    'role' &&
                                    usersData && (
                                      <div className="space-y-4">
                                        <div>
                                          <h3 className="text-base font-bold text-slate-900">
                                            Edit Role
                                          </h3>

                                          <p className="mt-1 text-sm text-slate-500">
                                            Select the new
                                            role for{' '}
                                            {
                                              selectedUser.firstName
                                            }{' '}
                                            {
                                              selectedUser.lastName
                                            }
                                            .
                                          </p>
                                        </div>

                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                          {usersData.filters.roles.map(
                                            (role) => {
                                              const isCurrent =
                                                selectedUser
                                                  .role
                                                  ?.id ===
                                                role.id;

                                              return (
                                                <button
                                                  key={
                                                    role.id
                                                  }
                                                  onClick={() =>
                                                    handleChangeRole(
                                                      role.id
                                                    )
                                                  }
                                                  disabled={
                                                    updateRoleMutation.isPending ||
                                                    isCurrent
                                                  }
                                                  className={`rounded-xl border p-4 text-left transition ${
                                                    isCurrent
                                                      ? 'border-blue-300 bg-blue-50 ring-1 ring-blue-200'
                                                      : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/50'
                                                  } disabled:cursor-not-allowed disabled:opacity-60`}
                                                >
                                                  <div className="flex items-center justify-between gap-3">
                                                    <div>
                                                      <p className="font-semibold text-slate-900">
                                                        {
                                                          role.displayName
                                                        }
                                                      </p>

                                                      <p className="mt-1 text-xs text-slate-500">
                                                        {
                                                          role.name
                                                        }
                                                      </p>
                                                    </div>

                                                    {isCurrent && (
                                                      <Check className="h-5 w-5 shrink-0 text-blue-700" />
                                                    )}
                                                  </div>

                                                  <div className="mt-3 text-xs font-semibold">
                                                    {isCurrent
                                                      ? 'Current role'
                                                      : 'Select this role'}
                                                  </div>
                                                </button>
                                              );
                                            }
                                          )}
                                        </div>

                                        {updateRoleMutation.isPending && (
                                          <div className="flex items-center gap-2 text-sm font-medium text-blue-700">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Updating role...
                                          </div>
                                        )}
                                      </div>
                                    )}

                                  {/* Change Status */}
                                  {expandedAction ===
                                    'status' && (
                                    <div className="space-y-4">
                                      <div>
                                        <h3 className="text-base font-bold text-slate-900">
                                          Change Status
                                        </h3>

                                        <p className="mt-1 text-sm text-slate-500">
                                          Select the new
                                          account status
                                          for{' '}
                                          {
                                            selectedUser.firstName
                                          }{' '}
                                          {
                                            selectedUser.lastName
                                          }
                                          .
                                        </p>
                                      </div>

                                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                        {[
                                          'ACTIVE',
                                          'INACTIVE',
                                          'SUSPENDED',
                                        ].map(
                                          (status) => {
                                            const isCurrent =
                                              selectedUser.status ===
                                              status;

                                            const optionStyles =
                                              {
                                                ACTIVE:
                                                  isCurrent
                                                    ? 'border-emerald-300 bg-emerald-50'
                                                    : 'border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/50',
                                                INACTIVE:
                                                  isCurrent
                                                    ? 'border-amber-300 bg-amber-50'
                                                    : 'border-slate-200 bg-white hover:border-amber-300 hover:bg-amber-50/50',
                                                SUSPENDED:
                                                  isCurrent
                                                    ? 'border-red-300 bg-red-50'
                                                    : 'border-slate-200 bg-white hover:border-red-300 hover:bg-red-50/50',
                                              };

                                            return (
                                              <button
                                                key={
                                                  status
                                                }
                                                onClick={() =>
                                                  handleChangeStatus(
                                                    status
                                                  )
                                                }
                                                disabled={
                                                  updateStatusMutation.isPending ||
                                                  isCurrent
                                                }
                                                className={`rounded-xl border p-4 text-left transition ${
                                                  optionStyles[
                                                    status as keyof typeof optionStyles
                                                  ]
                                                } disabled:cursor-not-allowed disabled:opacity-60`}
                                              >
                                                <div className="flex items-center justify-between">
                                                  <StatusBadge
                                                    status={
                                                      status
                                                    }
                                                  />

                                                  {isCurrent && (
                                                    <Check className="h-5 w-5 text-slate-700" />
                                                  )}
                                                </div>

                                                <p className="mt-3 text-xs font-medium text-slate-500">
                                                  {isCurrent
                                                    ? 'Current status'
                                                    : `Change to ${status.toLowerCase()}`}
                                                </p>
                                              </button>
                                            );
                                          }
                                        )}
                                      </div>

                                      {updateStatusMutation.isPending && (
                                        <div className="flex items-center gap-2 text-sm font-medium text-blue-700">
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                          Updating status...
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            )}
                        </AnimatePresence>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Mobile Users */}
                <div className="space-y-4 lg:hidden">
                  {paginatedUsers.map((user) => (
                    <div
                      key={user.id}
                      className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
                    >
                      <div className="p-4 sm:p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-3">
                            {user.profileImageUrl ? (
                              <img
                                src={
                                  user.profileImageUrl
                                }
                                alt={`${user.firstName} ${user.lastName}`}
                                className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-slate-100"
                              />
                            ) : (
                              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-700 ring-2 ring-blue-100">
                                {user.firstName
                                  .charAt(0)
                                  .toUpperCase()}
                                {user.lastName
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>
                            )}

                            <div className="min-w-0">
                              <p className="truncate text-sm font-bold text-slate-900">
                                {user.firstName}{' '}
                                {user.lastName}
                              </p>

                              <p className="mt-0.5 truncate text-xs text-slate-500">
                                {user.email}
                              </p>
                            </div>
                          </div>

                          <div className="flex shrink-0 flex-col items-end gap-1.5">
                            <RoleBadge
                              role={
                                user.role?.name ||
                                'student'
                              }
                            />

                            <StatusBadge
                              status={user.status}
                            />
                          </div>
                        </div>

                        <div className="mt-4 space-y-1.5 text-sm text-slate-500">
                          {user.phoneNumber && (
                            <p>
                              <span className="font-medium text-slate-700">
                                Phone:
                              </span>{' '}
                              {user.phoneNumber}
                            </p>
                          )}

                          <p>
                            <span className="font-medium text-slate-700">
                              Joined:
                            </span>{' '}
                            {formatDate(
                              user.createdAt
                            )}
                          </p>

                          {user.country && (
                            <p>
                              <span className="font-medium text-slate-700">
                                Location:
                              </span>{' '}
                              {user.city
                                ? `${user.city}, `
                                : ''}
                              {user.country}
                            </p>
                          )}
                        </div>

                        {/* Mobile text actions */}
                        <div className="mt-5 grid grid-cols-2 gap-2 border-t border-slate-100 pt-4 sm:grid-cols-5">
                          <button
                            onClick={() =>
                              toggleExpand(
                                user.id,
                                'edit'
                              )
                            }
                            className={`rounded-lg border px-3 py-2.5 text-sm font-semibold transition ${
                              expandedUserId ===
                                user.id &&
                              expandedAction === 'edit'
                                ? 'border-blue-200 bg-blue-50 text-blue-700'
                                : 'border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700'
                            }`}
                          >
                            Edit User
                          </button>

                          <button
                            onClick={() =>
                              toggleExpand(
                                user.id,
                                'role'
                              )
                            }
                            className={`rounded-lg border px-3 py-2.5 text-sm font-semibold transition ${
                              expandedUserId ===
                                user.id &&
                              expandedAction === 'role'
                                ? 'border-violet-200 bg-violet-50 text-violet-700'
                                : 'border-slate-200 bg-white text-slate-700 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700'
                            }`}
                          >
                            Edit Role
                          </button>

                          <button
                            onClick={() =>
                              toggleExpand(
                                user.id,
                                'status'
                              )
                            }
                            className={`rounded-lg border px-3 py-2.5 text-sm font-semibold transition ${
                              expandedUserId ===
                                user.id &&
                              expandedAction === 'status'
                                ? 'border-amber-200 bg-amber-50 text-amber-700'
                                : 'border-slate-200 bg-white text-slate-700 hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700'
                            }`}
                          >
                            Change Status
                          </button>

                          <button
                            onClick={() => router.push(`/dashboard/students/${user.id}`)}
                            className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm font-semibold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-100"
                          >
                            View Profile
                          </button>

                          <button
                            onClick={() => handleDeleteUser(user)}
                            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-700 transition hover:border-red-300 hover:bg-red-100"
                          >
                            Delete User
                          </button>
                        </div>
                      </div>

                      {/* Mobile expanded content */}
                      <AnimatePresence>
                        {expandedUserId ===
                          user.id &&
                          selectedUser && (
                            <motion.div
                              initial={{
                                opacity: 0,
                                height: 0,
                              }}
                              animate={{
                                opacity: 1,
                                height: 'auto',
                              }}
                              exit={{
                                opacity: 0,
                                height: 0,
                              }}
                              transition={{
                                duration: 0.25,
                              }}
                              className="overflow-hidden border-t border-slate-200"
                            >
                              <div className="bg-slate-50 p-4">
                                {/* Mobile Edit */}
                                {expandedAction ===
                                  'edit' && (
                                  <form
                                    onSubmit={
                                      handleEditSubmit
                                    }
                                    className="space-y-4"
                                  >
                                    <div>
                                      <h3 className="text-base font-bold text-slate-900">
                                        Edit User
                                      </h3>

                                      <p className="mt-1 text-sm text-slate-500">
                                        Update user
                                        information.
                                      </p>
                                    </div>

                                    <div className="space-y-3">
                                      {[
                                        {
                                          label: 'First Name',
                                          name: 'firstName',
                                          type: 'text',
                                        },
                                        {
                                          label: 'Last Name',
                                          name: 'lastName',
                                          type: 'text',
                                        },
                                        {
                                          label: 'Email',
                                          name: 'email',
                                          type: 'email',
                                        },
                                        {
                                          label: 'Phone',
                                          name: 'phoneNumber',
                                          type: 'text',
                                        },
                                        {
                                          label: 'Country',
                                          name: 'country',
                                          type: 'text',
                                        },
                                        {
                                          label: 'City',
                                          name: 'city',
                                          type: 'text',
                                        },
                                      ].map(
                                        (field) => (
                                          <div
                                            key={
                                              field.name
                                            }
                                          >
                                            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                                              {
                                                field.label
                                              }
                                            </label>

                                            <input
                                              type={
                                                field.type
                                              }
                                              name={
                                                field.name
                                              }
                                              value={
                                                editFormData[
                                                  field.name as keyof typeof editFormData
                                                ]
                                              }
                                              onChange={
                                                handleEditInputChange
                                              }
                                              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                            />
                                          </div>
                                        )
                                      )}
                                    </div>

                                    <div className="flex gap-2 border-t border-slate-200 pt-4">
                                      <button
                                        type="button"
                                        onClick={
                                          closeExpandedAction
                                        }
                                        className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700"
                                      >
                                        Cancel
                                      </button>

                                      <button
                                        type="submit"
                                        disabled={
                                          updateUserMutation.isPending
                                        }
                                        className="flex-1 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                                      >
                                        {updateUserMutation.isPending
                                          ? 'Saving...'
                                          : 'Save Changes'}
                                      </button>
                                    </div>
                                  </form>
                                )}

                                {/* Mobile Role */}
                                {expandedAction ===
                                  'role' &&
                                  usersData && (
                                    <div className="space-y-3">
                                      <div>
                                        <h3 className="text-base font-bold text-slate-900">
                                          Edit Role
                                        </h3>

                                        <p className="mt-1 text-sm text-slate-500">
                                          Select the new
                                          role.
                                        </p>
                                      </div>

                                      {usersData.filters.roles.map(
                                        (role) => {
                                          const isCurrent =
                                            selectedUser
                                              .role
                                              ?.id ===
                                            role.id;

                                          return (
                                            <button
                                              key={
                                                role.id
                                              }
                                              onClick={() =>
                                                handleChangeRole(
                                                  role.id
                                                )
                                              }
                                              disabled={
                                                updateRoleMutation.isPending ||
                                                isCurrent
                                              }
                                              className={`flex w-full items-center justify-between rounded-xl border p-4 text-left ${
                                                isCurrent
                                                  ? 'border-blue-300 bg-blue-50'
                                                  : 'border-slate-200 bg-white'
                                              } disabled:opacity-60`}
                                            >
                                              <div>
                                                <p className="font-semibold text-slate-900">
                                                  {
                                                    role.displayName
                                                  }
                                                </p>

                                                <p className="mt-1 text-xs text-slate-500">
                                                  {
                                                    role.name
                                                  }
                                                </p>
                                              </div>

                                              {isCurrent && (
                                                <Check className="h-5 w-5 text-blue-700" />
                                              )}
                                            </button>
                                          );
                                        }
                                      )}

                                      {updateRoleMutation.isPending && (
                                        <div className="flex items-center gap-2 text-sm font-medium text-blue-700">
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                          Updating role...
                                        </div>
                                      )}
                                    </div>
                                  )}

                                {/* Mobile Status */}
                                {expandedAction ===
                                  'status' && (
                                  <div className="space-y-3">
                                    <div>
                                      <h3 className="text-base font-bold text-slate-900">
                                        Change Status
                                      </h3>

                                      <p className="mt-1 text-sm text-slate-500">
                                        Select the new
                                        account status.
                                      </p>
                                    </div>

                                    {[
                                      'ACTIVE',
                                      'INACTIVE',
                                      'SUSPENDED',
                                    ].map(
                                      (status) => {
                                        const isCurrent =
                                          selectedUser.status ===
                                          status;

                                        return (
                                          <button
                                            key={
                                              status
                                            }
                                            onClick={() =>
                                              handleChangeStatus(
                                                status
                                              )
                                            }
                                            disabled={
                                              updateStatusMutation.isPending ||
                                              isCurrent
                                            }
                                            className={`flex w-full items-center justify-between rounded-xl border p-4 text-left ${
                                              isCurrent
                                                ? 'border-blue-300 bg-blue-50'
                                                : 'border-slate-200 bg-white'
                                            } disabled:opacity-60`}
                                          >
                                            <StatusBadge
                                              status={
                                                status
                                              }
                                            />

                                            {isCurrent && (
                                              <Check className="h-5 w-5 text-blue-700" />
                                            )}
                                          </button>
                                        );
                                      }
                                    )}

                                    {updateStatusMutation.isPending && (
                                      <div className="flex items-center gap-2 text-sm font-medium text-blue-700">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Updating status...
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-6 flex flex-col gap-4 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-slate-500">
                      Showing{' '}
                      <span className="font-semibold text-slate-700">
                        {(page - 1) * limit + 1}
                      </span>{' '}
                      to{' '}
                      <span className="font-semibold text-slate-700">
                        {Math.min(
                          page * limit,
                          filteredUsers.length
                        )}
                      </span>{' '}
                      of{' '}
                      <span className="font-semibold text-slate-700">
                        {filteredUsers.length}
                      </span>{' '}
                      users
                    </p>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          handlePageChange(page - 1)
                        }
                        disabled={page === 1}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </button>

                      <span className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
                        Page {page} of {totalPages}
                      </span>

                      <button
                        onClick={() =>
                          handlePageChange(page + 1)
                        }
                        disabled={
                          page === totalPages
                        }
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Delete Confirmation Dialog */}
        <AnimatePresence>
          {showDeleteDialog && userToDelete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
              onClick={cancelDeleteUser}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md overflow-hidden rounded-2xl border border-red-200 bg-white shadow-xl"
              >
                <div className="p-6">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
                    <AlertTriangle className="h-7 w-7 text-red-600" />
                  </div>

                  <h3 className="text-xl font-bold text-slate-900">
                    Delete User
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Are you sure you want to delete{' '}
                    <span className="font-semibold text-slate-900">
                      {userToDelete.firstName} {userToDelete.lastName}
                    </span>
                    ? This action cannot be undone and will permanently remove the user from your tech center.
                  </p>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                    <button
                      onClick={cancelDeleteUser}
                      className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Cancel
                    </button>

                    <button
                      onClick={confirmDeleteUser}
                      disabled={deleteUserMutation.isPending}
                      className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deleteUserMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="mr-2 h-4 w-4 inline" />
                          Delete User
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
    </div>
  );
}