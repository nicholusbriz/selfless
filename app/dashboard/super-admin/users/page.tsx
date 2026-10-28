'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Users as UsersIcon,
  ArrowLeft,
  Shield,
  Edit,
  Trash2,
  MoreVertical,
  Power,
  LoaderCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import {
  useSuperAdminUsers,
  useSuperAdminUserFilters,
  useUpdateSuperAdminUser,
  useUpdateSuperAdminUserRole,
  useUpdateSuperAdminUserStatus,
  useDeleteSuperAdminUser,
} from '@/hooks/useSuperAdminUsers';
import type { User } from '@/lib/api/admin-users';

type ActionType = 'edit' | 'role' | 'status' | null;

const UserAvatar = ({ user }: { user: User }) => {
  const [imageFailed, setImageFailed] = useState(false);
  const imageUrl = user.profileImageUrl?.trim();
  const initials = `${user.firstName?.[0] ?? 'U'}${user.lastName?.[0] ?? ''}`;

  return (
    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100 text-xs font-semibold uppercase text-gray-600">
      {imageUrl && !imageFailed ? (
        <Image
          src={imageUrl}
          alt={`${user.firstName} ${user.lastName}`}
          width={40}
          height={40}
          unoptimized
          className="h-full w-full object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        initials
      )}
    </div>
  );
};

export default function SuperAdminUsersPage() {
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState('');
  const [submittedSearchTerm, setSubmittedSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(50);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [expandedAction, setExpandedAction] = useState<ActionType>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

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
    techCenterId: '',
  });

  const {
    data: usersData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useSuperAdminUsers({
    page,
    limit,
    search: submittedSearchTerm || undefined,
    techCenterId: filters.techCenterId || undefined,
    country: filters.country || undefined,
    role: filters.role || undefined,
    status: filters.status || undefined,
  });
  const {
    data: userFiltersData,
    isLoading: filtersLoading,
    error: filtersError,
    refetch: refetchFilters,
  } = useSuperAdminUserFilters();
  const totalPages = usersData?.pagination.totalPages ?? 0;
  const stats = usersData?.stats;

  const deleteMutation = useDeleteSuperAdminUser();
  const updateRoleMutation = useUpdateSuperAdminUserRole();
  const updateStatusMutation = useUpdateSuperAdminUserStatus();
  const updateUserMutation = useUpdateSuperAdminUser();

  const hasFilters = Object.values(filters).some(Boolean);

  const closeExpanded = () => {
    setExpandedUserId(null);
    setExpandedAction(null);
    setSelectedUser(null);
    setMenuOpen(null);
  };

  const toggleExpand = (
    userId: string,
    action: Exclude<ActionType, null>
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
        techCenterId: user.techCenterId || '',
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
        onError: (error) => {
          window.alert(error.message || 'Failed to update user');
        },
      }
    );
    closeExpanded();
  };

  const handleChangeRole = (roleId: string) => {
    if (!selectedUser) return;

    updateRoleMutation.mutate(
      {
        userId: selectedUser.id,
        roleId,
      },
      {
        onError: (error) => {
          window.alert(error.message || 'Failed to update user role');
        },
      }
    );
    closeExpanded();
  };

  const handleChangeStatus = (status: string) => {
    if (!selectedUser) return;

    updateStatusMutation.mutate(
      {
        userId: selectedUser.id,
        status,
      },
      {
        onError: (error) => {
          window.alert(error.message || 'Failed to update user status');
        },
      }
    );
    closeExpanded();
  };

  const handleDeleteUser = (user: User) => {
    if (!confirm(`Are you sure you want to delete ${user.firstName} ${user.lastName}?`)) return;

    deleteMutation.mutate(user.id, {
      onError: (error) => {
        window.alert(error.message || 'Failed to delete user');
      },
    });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuOpen && !(event.target as HTMLElement).closest('.menu-container')) {
        setMenuOpen(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  if ((isLoading && !usersData) || (filtersLoading && !userFiltersData)) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-center gap-4">
            <div className="h-8 w-8 animate-pulse rounded bg-gray-200" />
            <div className="h-6 w-px bg-gray-200" />
            <div className="h-6 w-32 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      </div>
    );
  }

  if (error || filtersError) {
    const loadError = error ?? filtersError;

    return (
      <div className="flex min-h-screen items-center justify-center bg-white p-6">
        <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
            <UsersIcon className="h-6 w-6 text-gray-500" />
          </div>

          <h2 className="text-lg font-semibold text-gray-900">
            Unable to load users
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            {loadError instanceof Error ? loadError.message : 'Please try again.'}
          </p>
          <button
            type="button"
            onClick={() => {
              if (error) void refetch();
              if (filtersError) void refetchFilters();
            }}
            className="mt-5 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded hover:bg-gray-100 text-gray-600 transition"
              aria-label="Go back"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            <h1 className="text-lg font-semibold text-gray-900">
              User Management
            </h1>
          </div>

          <div className="text-sm text-gray-500">
            {usersData?.pagination.total ?? 0} users
          </div>
        </div>

        {/* Statistics */}
        {stats && (
          <div className="mb-6 flex items-center gap-6 text-sm text-gray-500">
            <span className="font-medium text-gray-900">{usersData?.pagination.total ?? 0} total</span>
            <span className="text-gray-300">•</span>
            <span className="text-emerald-600">{stats.active} active</span>
            <span className="text-gray-300">•</span>
            <span className="text-amber-600">{stats.inactive} inactive</span>
            <span className="text-gray-300">•</span>
            <span className="text-red-600">{stats.suspended} suspended</span>
          </div>
        )}

        {/* Search and Filters */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <form
            role="search"
            className="flex min-w-0 basis-full gap-2 sm:flex-1 sm:basis-auto"
            onSubmit={(event) => {
              event.preventDefault();
              setSubmittedSearchTerm(searchTerm.trim());
              setPage(1);
            }}
          >
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

              <input
                type="search"
                aria-label="Search users by name or tech center"
                placeholder="Search by name or tech center..."
                value={searchTerm}
                onChange={(e) => {
                  const value = e.target.value;
                  setSearchTerm(value);
                  if (!value) {
                    setSubmittedSearchTerm('');
                    setPage(1);
                  }
                }}
                className="w-full rounded-md border border-gray-200 bg-white py-1.5 pl-9 pr-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:ring-1 focus:ring-gray-100"
              />
            </div>
            <button
              type="submit"
              disabled={isFetching}
              className="inline-flex shrink-0 items-center gap-2 rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-gray-800 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 disabled:cursor-wait disabled:opacity-75"
            >
              {isFetching ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Searching
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Search
                </>
              )}
            </button>
          </form>

          {submittedSearchTerm && (
            <p role="status" aria-live="polite" className="basis-full text-xs text-gray-500">
              {isFetching
                ? `Searching for "${submittedSearchTerm}"...`
                : `Showing results for "${submittedSearchTerm}"`}
            </p>
          )}

          {userFiltersData && (
            <>
              <div className="relative">
                <select
                  value={filters.techCenterId}
                  onChange={(e) => {
                    setFilters((prev) => ({ ...prev, techCenterId: e.target.value }));
                    setPage(1);
                  }}
                  className="w-32 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-900 outline-none transition focus:border-gray-400 focus:ring-1 focus:ring-gray-100 appearance-none"
                >
                  <option value="">All Centers</option>
                  {userFiltersData.filters.techCenters.map((tc) => (
                    <option key={tc.id} value={tc.id}>
                      {tc.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
              </div>

              <div className="relative">
                <select
                  value={filters.role}
                  onChange={(e) => {
                    setFilters((prev) => ({ ...prev, role: e.target.value }));
                    setPage(1);
                  }}
                  className="w-32 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-900 outline-none transition focus:border-gray-400 focus:ring-1 focus:ring-gray-100 appearance-none"
                >
                  <option value="">All Roles</option>
                  {userFiltersData.filters.roles.map((role) => (
                    <option key={role.id} value={role.name}>
                      {role.name === 'teacher' ? 'Tutor' : role.name === 'admin' ? 'Manager' : role.name === 'superadmin' || role.name === 'super_admin' ? 'Director' : role.displayName || role.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
              </div>

              <div className="relative">
                <select
                  value={filters.status}
                  onChange={(e) => {
                    setFilters((prev) => ({ ...prev, status: e.target.value }));
                    setPage(1);
                  }}
                  className="w-32 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-900 outline-none transition focus:border-gray-400 focus:ring-1 focus:ring-gray-100 appearance-none"
                >
                  <option value="">All Statuses</option>
                  {userFiltersData.filters.statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
              </div>

              {hasFilters && (
                <button
                  onClick={() => {
                    setFilters({ techCenterId: '', country: '', role: '', status: '' });
                    setPage(1);
                  }}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Clear
                </button>
              )}
            </>
          )}
        </div>

        {/* Empty state */}
        {usersData && usersData.users.length === 0 && (
          <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-16 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <UsersIcon className="h-6 w-6 text-gray-400" />
            </div>

            <h2 className="text-base font-semibold text-gray-900">
              No users found
            </h2>

            <p className="mx-auto mt-1 max-w-sm text-sm text-gray-500">
              {searchTerm || hasFilters
                ? 'Try adjusting your search or filters.'
                : 'There are no registered users yet.'}
            </p>

            {(searchTerm || hasFilters) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSubmittedSearchTerm('');
                  setFilters({ techCenterId: '', country: '', role: '', status: '' });
                  setPage(1);
                }}
                className="mt-5 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
              >
                Clear search and filters
              </button>
            )}
          </div>
        )}

        {/* Users List */}
        {usersData && usersData.users.length > 0 && (
          <>
            <div className="divide-y divide-gray-100">
              {usersData.users.map((user) => (
                <div key={user.id} className="relative group hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3 px-4 py-2">
                    <UserAvatar user={user} />

                    {/* User information */}
                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-3">
                        <div className="flex min-w-0 items-center gap-2">
                          <p className="min-w-0 flex-1 truncate text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </p>
                          <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
                            {user.role?.name === 'teacher' ? 'Tutor' : user.role?.name === 'admin' ? 'Manager' : user.role?.name === 'superadmin' || user.role?.name === 'super_admin' ? 'Director' : user.role?.name || 'Student'}
                          </span>
                        </div>
                        <div className="flex min-w-0 items-center gap-2 text-xs text-gray-500 sm:gap-2.5">
                          {user.techCenter?.name && (
                            <span className="min-w-0 truncate">
                              {user.techCenter.name}
                            </span>
                          )}
                          {user.techCenter?.name && <span className="text-gray-300">•</span>}
                          <span className="shrink-0">
                            {user.status === 'ACTIVE' ? 'Active' : user.status === 'INACTIVE' ? 'Inactive' : user.status === 'SUSPENDED' ? 'Suspended' : user.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Three-dot menu */}
                    <div className="relative menu-container">
                      <button
                        onClick={() => setMenuOpen(menuOpen === user.id ? null : user.id)}
                        className="flex h-7 w-7 items-center justify-center rounded text-gray-400 transition hover:bg-gray-200 hover:text-gray-600"
                        aria-label="More options"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>

                      {/* Dropdown menu */}
                      {menuOpen === user.id && (
                        <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-md border border-gray-200 bg-white shadow-lg">
                          <div className="py-1">
                            <button
                              onClick={() => {
                                setMenuOpen(null);
                                toggleExpand(user.id, 'edit');
                              }}
                              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
                            >
                              <Edit className="h-4 w-4 text-gray-500" />
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                setMenuOpen(null);
                                toggleExpand(user.id, 'role');
                              }}
                              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
                            >
                              <Shield className="h-4 w-4 text-gray-500" />
                              Role
                            </button>
                            <button
                              onClick={() => {
                                setMenuOpen(null);
                                toggleExpand(user.id, 'status');
                              }}
                              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
                            >
                              <Power className="h-4 w-4 text-gray-500" />
                              Status
                            </button>
                            <div className="border-t border-gray-100 my-1" />
                            <button
                              onClick={() => {
                                setMenuOpen(null);
                                handleDeleteUser(user);
                              }}
                              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 transition hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Expanded Content */}
                  <AnimatePresence>
                    {expandedUserId === user.id && selectedUser && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden border-t border-gray-200 bg-gray-50"
                      >
                        <div className="p-5">
                          {/* Edit User */}
                          {expandedAction === 'edit' && (
                            <form onSubmit={handleEditSubmit} className="space-y-5">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h3 className="text-base font-bold text-gray-900">
                                    Edit User
                                  </h3>
                                  <p className="mt-1 text-sm text-gray-500">
                                    Update the account information for {selectedUser.firstName} {selectedUser.lastName}.
                                  </p>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                                    First Name
                                  </label>
                                  <input
                                    type="text"
                                    name="firstName"
                                    value={editFormData.firstName}
                                    onChange={handleEditInputChange}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
                                  />
                                </div>
                                <div>
                                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                                    Last Name
                                  </label>
                                  <input
                                    type="text"
                                    name="lastName"
                                    value={editFormData.lastName}
                                    onChange={handleEditInputChange}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
                                  />
                                </div>
                                {selectedUser.email && (
                                  <div className="md:col-span-2">
                                    <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                                      Email
                                    </label>
                                    <input
                                      type="email"
                                      name="email"
                                      value={editFormData.email}
                                      onChange={handleEditInputChange}
                                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
                                    />
                                  </div>
                                )}
                                <div className="md:col-span-2">
                                  <label
                                    htmlFor="edit-user-tech-center"
                                    className="mb-1.5 block text-sm font-semibold text-gray-700"
                                  >
                                    Tech Center
                                  </label>
                                  <select
                                    id="edit-user-tech-center"
                                    name="techCenterId"
                                    value={editFormData.techCenterId}
                                    onChange={handleEditInputChange}
                                    disabled={filtersLoading}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                                  >
                                    <option value="">No tech center</option>
                                    {selectedUser.techCenterId &&
                                      selectedUser.techCenter &&
                                      !userFiltersData?.filters.techCenters.some(
                                        (techCenter) =>
                                          techCenter.id === selectedUser.techCenterId,
                                      ) && (
                                        <option value={selectedUser.techCenterId}>
                                          {selectedUser.techCenter.name} (inactive)
                                        </option>
                                      )}
                                    {userFiltersData?.filters.techCenters.map((techCenter) => (
                                      <option key={techCenter.id} value={techCenter.id}>
                                        {techCenter.name} ({techCenter.code})
                                      </option>
                                    ))}
                                  </select>
                                  <p className="mt-1.5 text-xs text-gray-500">
                                    Changing a user’s tech center changes their role to Student, except for Dev and Super Admin accounts.
                                  </p>
                                </div>
                              </div>

                              <div className="flex justify-end gap-3">
                                <button
                                  type="button"
                                  onClick={closeExpanded}
                                  className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="submit"
                                  disabled={updateUserMutation.isPending}
                                  className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {updateUserMutation.isPending ? 'Saving...' : 'Save Changes'}
                                </button>
                              </div>
                            </form>
                          )}

                          {/* Change Role */}
                          {expandedAction === 'role' && (
                            <div className="space-y-5">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h3 className="text-base font-bold text-gray-900">
                                    Change Role
                                  </h3>
                                  <p className="mt-1 text-sm text-gray-500">
                                    Update the role for {selectedUser.firstName} {selectedUser.lastName}.
                                  </p>
                                </div>
                              </div>

                              <div className="space-y-2">
                                {userFiltersData?.filters.roles.map((role) => (
                                  <button
                                    key={role.id}
                                    onClick={() => handleChangeRole(role.id)}
                                    disabled={updateRoleMutation.isPending}
                                    className={`w-full rounded-lg border px-4 py-3 text-left text-sm font-semibold transition ${
                                      selectedUser.role?.id === role.id
                                        ? 'border-purple-300 bg-purple-50 text-purple-700'
                                        : 'border-gray-300 bg-white text-gray-700 hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700'
                                    } disabled:cursor-not-allowed disabled:opacity-50`}
                                  >
                                    {role.name === 'teacher' ? 'Tutor' : role.name === 'admin' ? 'Manager' : role.name === 'superadmin' || role.name === 'super_admin' ? 'Director' : role.displayName || role.name}
                                  </button>
                                ))}
                              </div>

                              <button
                                onClick={closeExpanded}
                                className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                              >
                                Cancel
                              </button>
                            </div>
                          )}

                          {/* Change Status */}
                          {expandedAction === 'status' && (
                            <div className="space-y-5">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h3 className="text-base font-bold text-gray-900">
                                    Change Status
                                  </h3>
                                  <p className="mt-1 text-sm text-gray-500">
                                    Update the status for {selectedUser.firstName} {selectedUser.lastName}.
                                  </p>
                                </div>
                              </div>

                              <div className="space-y-2">
                                {['ACTIVE', 'INACTIVE', 'SUSPENDED'].map((status) => (
                                  <button
                                    key={status}
                                    onClick={() => handleChangeStatus(status)}
                                    disabled={updateStatusMutation.isPending}
                                    className={`w-full rounded-lg border px-4 py-3 text-left text-sm font-semibold transition ${
                                      selectedUser.status === status
                                        ? 'border-amber-300 bg-amber-50 text-amber-700'
                                        : 'border-gray-300 bg-white text-gray-700 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700'
                                    } disabled:cursor-not-allowed disabled:opacity-50`}
                                  >
                                    {status === 'ACTIVE' ? 'Active' : status === 'INACTIVE' ? 'Inactive' : 'Suspended'}
                                  </button>
                                ))}
                              </div>

                              <button
                                onClick={closeExpanded}
                                className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                              >
                                Cancel
                              </button>
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
              <div className="mt-6 flex items-center justify-between gap-4 border-t border-gray-200 pt-4">
                <p className="text-sm text-gray-500">
                  Showing {(page - 1) * limit + 1} to {Math.min(page * limit, usersData.pagination.total)} of {usersData.pagination.total} users
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 transition hover:border-gray-400 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  <span className="text-sm font-medium text-gray-700">
                    Page {page} of {totalPages}
                  </span>

                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 transition hover:border-gray-400 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Next page"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
