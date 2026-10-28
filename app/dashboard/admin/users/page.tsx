'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Users as UsersIcon,
  ArrowLeft,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Edit,
  Shield,
  Power,
  Trash2,
  Eye,
  LoaderCircle,
} from 'lucide-react';
import {
  useAdminUsers,
  useUpdateUser,
  useUpdateUserRole,
  useUpdateUserStatus,
} from '@/hooks/useAdminUsers';
import { useDeleteSuperAdminUser } from '@/hooks/useSuperAdminUsers';
import type { User as AdminUser } from '@/lib/api/admin-tech-center-users';

type ActionType = 'edit' | 'role' | 'status' | null;

const roleDisplayName = (roleName?: string | null) => {
  const normalizedRole = roleName?.toLowerCase();

  if (!normalizedRole) return 'Student';
  if (normalizedRole === 'teacher') return 'Tutor';
  if (normalizedRole === 'admin') return 'Manager';
  if (normalizedRole === 'superadmin' || normalizedRole === 'super_admin') return 'Director';
  if (normalizedRole === 'dev') return 'Developer';

  return normalizedRole.replace('_', ' ').replace(/\b\w/g, (char) => char.toUpperCase());
};

const StatusLabel = ({ status }: { status: string }) => {
  const normalizedStatus = status?.toUpperCase();
  const statusText = normalizedStatus === 'ACTIVE'
    ? 'Active'
    : normalizedStatus === 'INACTIVE'
      ? 'Inactive'
      : normalizedStatus === 'SUSPENDED'
        ? 'Suspended'
        : 'Unknown';

  return (
    <span className="font-medium text-[#4B5646]">{statusText}</span>
  );
};

const RoleLabel = ({ role }: { role: string }) => {
  const normalizedRole = role?.toLowerCase();

  return <span className="text-xs font-medium text-[#4B5646]">{roleDisplayName(normalizedRole)}</span>;
};

const UserAvatar = ({ user }: { user: AdminUser }) => {
  const [imageFailed, setImageFailed] = useState(false);
  const imageUrl = user.profileImageUrl?.trim();
  const initials = `${user.firstName?.[0] ?? 'U'}${user.lastName?.[0] ?? ''}`;

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#F2EFEA] text-xs font-bold uppercase tracking-[0.08em] text-[#12203B]">
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

export default function AdminUsersPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [searchTerm, setSearchTerm] = useState('');
  const [submittedSearchTerm, setSubmittedSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(50);

  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [expandedAction, setExpandedAction] = useState<ActionType>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    techCenterId: '',
  });

  const [filters, setFilters] = useState({
    role: '',
    status: '',
  });

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);

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

  const {
    data: usersData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useAdminUsers({
    page,
    limit,
    search: submittedSearchTerm || undefined,
    role: filters.role || undefined,
    status: filters.status || undefined,
  });

  const manageableRoles =
    usersData?.filters.roles?.filter((role) => {
      if (session?.user?.role === 'dev') return true;
      if (session?.user?.role === 'super_admin') return role.name !== 'dev';
      return role.name !== 'super_admin' && role.name !== 'dev';
    }) ?? [];

  const updateRoleMutation = useUpdateUserRole();
  const updateStatusMutation = useUpdateUserStatus();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteSuperAdminUser();

  const closeExpandedAction = () => {
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
        onError: (mutationError: unknown) => {
          alert(
            mutationError instanceof Error
              ? mutationError.message
              : 'Failed to update user'
          );
        },
      }
    );
    closeExpandedAction();
  };

  const handleChangeRole = (roleId: string) => {
    if (!selectedUser) return;

    updateRoleMutation.mutate(
      {
        userId: selectedUser.id,
        roleId,
      },
      {
        onError: (mutationError: unknown) => {
          alert(
            mutationError instanceof Error
              ? mutationError.message
              : 'Failed to update user role'
          );
        },
      }
    );
    closeExpandedAction();
  };

  const handleChangeStatus = (status: string) => {
    if (!selectedUser) return;

    updateStatusMutation.mutate(
      {
        userId: selectedUser.id,
        status,
      },
      {
        onError: (mutationError: unknown) => {
          alert(
            mutationError instanceof Error
              ? mutationError.message
              : 'Failed to update user status'
          );
        },
      }
    );
    closeExpandedAction();
  };

  const handleDeleteUser = (user: AdminUser) => {
    setUserToDelete(user);
    setShowDeleteDialog(true);
  };

  const confirmDeleteUser = () => {
    if (!userToDelete) return;

    const userId = userToDelete.id;

    setShowDeleteDialog(false);
    setUserToDelete(null);

    deleteUserMutation.mutate(userId, {
      onError: (mutationError: unknown) => {
        alert(
          mutationError instanceof Error
            ? mutationError.message
            : 'Failed to delete user',
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

  const stats = usersData?.stats ?? null;
  const totalPages = usersData?.pagination.totalPages ?? 0;

  if (isLoading && !usersData) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-center gap-4">
            <div className="h-10 w-10 animate-pulse rounded-lg bg-gray-200" />
            <div className="h-8 w-px bg-gray-200" />
            <div>
              <div className="mb-2 h-7 w-48 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-64 animate-pulse rounded bg-gray-200" />
            </div>
          </div>
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 animate-pulse rounded-xl bg-gray-100" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white p-6">
        <div className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-8 text-center shadow-lg">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
            <UsersIcon className="h-7 w-7 text-red-600" />
          </div>

          <h3 className="text-xl font-bold text-gray-900">
            Failed to Load Users
          </h3>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            {(error as Error)?.message ||
              'An error occurred while loading users.'}
          </p>

          <button
            onClick={() => refetch()}
            className="mt-6 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mb-6 rounded-2xl border border-[#E7E6E1] bg-[#F8F7F3] p-4 shadow-[0_1px_3px_rgba(18,32,59,0.04)] sm:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#DADCD3] bg-white text-[#3D4A61] transition hover:border-[#B98A3E] hover:text-[#12203B]"
                aria-label="Go back"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6B7280]">
                  People & access
                </p>
                <h1 className="text-xl font-bold text-[#12203B] sm:text-2xl">
                  Manage all users in {usersData?.techCenter.name ?? 'your tech center'}
                </h1>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 self-start rounded-full border border-[#DADCD3] bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-[#12203B] xl:self-center">
              <UsersIcon className="h-3.5 w-3.5 text-[#B98A3E]" />
              {session?.user?.role === 'dev' ? 'Developer view' : session?.user?.role === 'super_admin' ? 'Executive access' : 'People access'}
            </div>
          </div>
        </div>

        {stats && (
          <div className="mb-5 flex flex-wrap items-center gap-3 text-sm text-[#3D4A61]">
            <span className="font-medium">Total: <span className="font-bold text-[#12203B]">{stats.total}</span></span>
            <span className="text-[#DADCD3]">•</span>
            <span className="font-medium">Active: <span className="font-bold text-[#2F6B45]">{stats.active}</span></span>
            <span className="text-[#DADCD3]">•</span>
            <span className="font-medium">Inactive: <span className="font-bold text-[#6E5520]">{stats.inactive}</span></span>
            <span className="text-[#DADCD3]">•</span>
            <span className="font-medium">Suspended: <span className="font-bold text-[#8B3A24]">{stats.suspended}</span></span>
          </div>
        )}

        <div className="mb-5 rounded-2xl border border-[#E7E6E1] bg-white p-3 shadow-[0_1px_2px_rgba(18,32,59,0.03)] sm:p-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
            <form
              role="search"
              className="flex min-w-0 basis-full gap-2 xl:flex-1 xl:basis-auto"
              onSubmit={(event) => {
                event.preventDefault();
                setSubmittedSearchTerm(searchTerm.trim());
                setPage(1);
                closeExpandedAction();
              }}
            >
              <div className="relative min-w-0 flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />

                <input
                  type="search"
                  aria-label="Search users by name or email"
                  placeholder="Search by name or email"
                  value={searchTerm}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSearchTerm(value);
                    if (!value) {
                      setSubmittedSearchTerm('');
                      setPage(1);
                    }
                  }}
                  className="w-full rounded-xl border border-[#DADCD3] bg-[#F9F9F7] py-2.5 pl-9 pr-3 text-sm text-[#12203B] outline-none transition placeholder:text-[#6B7280] focus:border-[#B98A3E] focus:ring-2 focus:ring-[#F3E5C3]"
                />
              </div>
              <button
                type="submit"
                disabled={isFetching}
                className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#12203B] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#263653] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#B98A3E] focus:ring-offset-2 disabled:cursor-wait disabled:opacity-75"
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
              <p role="status" aria-live="polite" className="basis-full text-xs text-[#6B7280] xl:order-3">
                {isFetching
                  ? `Searching for "${submittedSearchTerm}"...`
                  : `Showing results for "${submittedSearchTerm}"`}
              </p>
            )}

            <div className="grid gap-3 sm:grid-cols-2 xl:flex xl:items-center">
              <div className="relative">
                <select
                  value={filters.role}
                  onChange={(e) => {
                    setFilters((prev) => ({ ...prev, role: e.target.value }));
                    setPage(1);
                  }}
                  className="w-full appearance-none rounded-xl border border-[#DADCD3] bg-[#F9F9F7] px-3 py-2.5 pr-9 text-sm text-[#12203B] outline-none transition focus:border-[#B98A3E] focus:ring-2 focus:ring-[#F3E5C3] xl:min-w-[170px]"
                >
                  <option value="">All roles</option>
                  {manageableRoles.map((role) => (
                    <option key={role.id} value={role.name}>
                      {roleDisplayName(role.name)}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#6B7280]" />
              </div>

              <div className="relative">
                <select
                  value={filters.status}
                  onChange={(e) => {
                    setFilters((prev) => ({ ...prev, status: e.target.value }));
                    setPage(1);
                  }}
                  className="w-full appearance-none rounded-xl border border-[#DADCD3] bg-[#F9F9F7] px-3 py-2.5 pr-9 text-sm text-[#12203B] outline-none transition focus:border-[#B98A3E] focus:ring-2 focus:ring-[#F3E5C3] xl:min-w-[170px]"
                >
                  <option value="">All statuses</option>
                  {usersData?.filters.statuses.map((status) => (
                    <option key={status} value={status}>
                      {status === 'ACTIVE' ? 'Active' : status === 'INACTIVE' ? 'Inactive' : 'Suspended'}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#6B7280]" />
              </div>
            </div>

            {(filters.role || filters.status) && (
              <button
                onClick={() => {
                  setFilters({ role: '', status: '' });
                  setPage(1);
                }}
                className="inline-flex items-center justify-center rounded-xl border border-[#DADCD3] bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#12203B] transition hover:border-[#B98A3E] hover:text-[#B98A3E]"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {usersData && (
          <>
            {usersData.users.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-16 text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                  <UsersIcon className="h-8 w-8 text-gray-400" />
                </div>

                <h3 className="text-xl font-bold text-gray-900">
                  No Users Found
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                  {searchTerm || filters.role || filters.status
                    ? 'Try adjusting your search or filters to find the user you are looking for.'
                    : 'There are currently no users in the organization.'}
                </p>

                {(searchTerm || filters.role || filters.status) && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSubmittedSearchTerm('');
                      setFilters({ role: '', status: '' });
                      setPage(1);
                    }}
                    className="mt-5 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
                  >
                    Clear Search and Filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="space-y-0">
                  {usersData.users.map((user) => (
                    <div key={user.id} className="relative border-b border-[#E7E6E1] bg-white py-3.5 transition hover:bg-[#F9F9F7]">
                      <div className="flex items-center gap-3">
                        <UserAvatar user={user} />

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold text-[#12203B] sm:text-[15px]">
                              {user.firstName} {user.lastName}
                            </p>
                            <RoleLabel role={user.role?.name ?? 'student'} />
                          </div>

                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#4B5646]">
                            <StatusLabel status={user.status ?? 'ACTIVE'} />
                          </div>
                        </div>

                        <div className="relative menu-container">
                          <button
                            onClick={() => setMenuOpen(menuOpen === user.id ? null : user.id)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E7E6E1] bg-[#F9F9F7] text-[#3D4A61] transition hover:border-[#B98A3E] hover:text-[#12203B]"
                            aria-label="More options"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>

                          {menuOpen === user.id && (
                            <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-lg border border-[#E7E6E1] bg-white p-1.5 shadow-[0_6px_16px_rgba(18,32,59,0.08)]">
                              <div className="space-y-1">
                                <button
                                  onClick={() => {
                                    setMenuOpen(null);
                                    toggleExpand(user.id, 'edit');
                                  }}
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#3D4A61] transition hover:bg-[#F7F6F2]"
                                >
                                  <Edit className="h-4 w-4 text-[#6B7280]" />
                                  Edit
                                </button>
                                <button
                                  onClick={() => {
                                    setMenuOpen(null);
                                    toggleExpand(user.id, 'role');
                                  }}
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#3D4A61] transition hover:bg-[#F7F6F2]"
                                >
                                  <Shield className="h-4 w-4 text-[#6B7280]" />
                                  Role
                                </button>
                                <button
                                  onClick={() => {
                                    setMenuOpen(null);
                                    toggleExpand(user.id, 'status');
                                  }}
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#3D4A61] transition hover:bg-[#F7F6F2]"
                                >
                                  <Power className="h-4 w-4 text-[#6B7280]" />
                                  Status
                                </button>
                                <div className="my-1 border-t border-[#E7E6E1]" />
                                <button
                                  onClick={() => {
                                    setMenuOpen(null);
                                    router.push(`/dashboard/students/${user.id}`);
                                  }}
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#3D4A61] transition hover:bg-[#F7F6F2]"
                                >
                                  <Eye className="h-4 w-4 text-[#6B7280]" />
                                  View
                                </button>
                                <button
                                  onClick={() => {
                                    setMenuOpen(null);
                                    handleDeleteUser(user);
                                  }}
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 transition hover:bg-red-50"
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
                            className="overflow-hidden border-t border-[#E7E6E1] bg-[#F9F9F7]"
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
                                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                                          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                        />
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex justify-end gap-3">
                                    <button
                                      type="button"
                                      onClick={closeExpandedAction}
                                      className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      type="submit"
                                      disabled={updateUserMutation.isPending}
                                      className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
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
                                    {manageableRoles.map((role) => (
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
                                    onClick={closeExpandedAction}
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
                                    onClick={closeExpandedAction}
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
          </>
        )}

        {/* Delete Confirmation Dialog */}
        {showDeleteDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-xl border border-red-100 bg-white p-6 shadow-2xl">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>

              <h3 className="text-lg font-bold text-gray-900">
                Delete User
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Are you sure you want to delete <span className="font-medium text-gray-700">{userToDelete?.firstName} {userToDelete?.lastName}</span>? This action cannot be undone.
              </p>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={cancelDeleteUser}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  onClick={confirmDeleteUser}
                  disabled={deleteUserMutation.isPending}
                  className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {deleteUserMutation.isPending ? 'Deleting...' : 'Delete User'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
