'use client';

import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  GraduationCap,
  Users,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  Loader2,
  BookOpen,
  Search,
  SearchX,
  UserPlus,
  UserMinus,
  Trash2,
  X,
  MapPin,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

import { useAuth } from '@/lib/hooks/useAuth';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  country?: string;
  city?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  isActive: boolean;
  createdAt: string;
  profileImageUrl?: string;

  techCenter?: {
    id: string;
    name: string;
    code: string;
  };

  role?: {
    id: string;
    name: string;
    displayName: string;
  };

  teacherId?: string | null;

  teacher?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profileImageUrl?: string;
  } | null;

  _count?: {
    assignedStudents: number;
    gradesGiven: number;
  };
}

interface TechCenterData {
  users: User[];
  techCenter: {
    id: string;
    name: string;
    code: string;
  };
}

const getInitials = (firstName = '', lastName = '') =>
  `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

export default function ManageTeachersPage() {
  const router = useRouter();
  const { isAdmin, isSuperAdmin } = useAuth();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState<User | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(
    new Set()
  );
  const [selectedUsersForRemoval, setSelectedUsersForRemoval] = useState<
    Set<string>
  >(new Set());
  const [individualRemoving, setIndividualRemoving] = useState<Set<string>>(
    new Set()
  );
  const [unassignModeTeacherId, setUnassignModeTeacherId] = useState<
    string | null
  >(null);
  const [modalSearchTerm, setModalSearchTerm] = useState('');

  const toggleUserRemovalSelection = (userId: string) => {
    setSelectedUsersForRemoval((previous) => {
      const updated = new Set(previous);

      if (updated.has(userId)) {
        updated.delete(userId);
      } else {
        updated.add(userId);
      }

      return updated;
    });
  };

  const canManageAssignments = isAdmin() || isSuperAdmin();

  const {
    data: techCenterData,
    isLoading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ['admin-tech-center-users'],
    queryFn: async () => {
      const response = await fetch(
        '/api/admin/tech-centers/users?limit=1000'
      );

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      return response.json() as Promise<TechCenterData>;
    },
  });

  const allUsers = useMemo(
    () => techCenterData?.users ?? [],
    [techCenterData?.users]
  );

  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return allUsers;

    const query = searchTerm.toLowerCase();

    return allUsers.filter(
      (user) =>
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
    );
  }, [allUsers, searchTerm]);

  const teachers = useMemo(
    () => filteredUsers.filter((user) => user.role?.name === 'teacher'),
    [filteredUsers]
  );

  const students = useMemo(
    () =>
      filteredUsers.filter(
        (user) =>
          user.role?.name !== 'teacher' &&
          user.role?.name !== 'admin' &&
          user.role?.name !== 'super_admin'
      ),
    [filteredUsers]
  );

  const admins = useMemo(
    () =>
      filteredUsers.filter(
        (user) =>
          user.role?.name === 'admin' ||
          user.role?.name === 'super_admin'
      ),
    [filteredUsers]
  );

  // Users that can be assigned to tutors
  const assignableUsers = useMemo(
    () =>
      filteredUsers.filter(
        (user) =>
          user.role?.name !== 'admin' &&
          user.role?.name !== 'super_admin' &&
          user.role?.name !== 'teacher'
      ),
    [filteredUsers]
  );

  const assignedStudents = useMemo(
    () => students.filter((student) => student.teacherId),
    [students]
  );

  const unassignedStudents = useMemo(
    () => assignableUsers.filter((user) => !user.teacherId),
    [assignableUsers]
  );

  const filteredUnassignedStudents = useMemo(() => {
    if (!modalSearchTerm.trim()) return unassignedStudents;

    const query = modalSearchTerm.toLowerCase();

    return unassignedStudents.filter(
      (user) =>
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
    );
  }, [unassignedStudents, modalSearchTerm]);

  const getTeacherAssignedStudents = (teacherId: string) =>
    students.filter((student) => student.teacherId === teacherId);

  const handleAssignUser = async (userId: string, teacherId: string) => {
    try {
      setAssigning(true);

      queryClient.setQueryData(
        ['admin-tech-center-users'],
        (oldData: TechCenterData | undefined) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            users: oldData.users.map((user) =>
              user.id === userId ? { ...user, teacherId } : user
            ),
          };
        }
      );

      setShowAssignModal(false);
      setSelectedTeacher(null);
      setSelectedStudents(new Set());

      const response = await fetch(
        `/api/admin/tech-centers/users/${userId}/assign`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ teacherId }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();

        await refetch();

        throw new Error(errorData.error || 'Failed to assign user');
      }

      setSuccess('User assigned successfully');

      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error(error);

      setApiError('Failed to assign user');

      setTimeout(() => setApiError(''), 3000);

      await refetch();
    } finally {
      setAssigning(false);
    }
  };

  const handleBulkAssign = async (
    userIds: string[],
    teacherId: string
  ) => {
    try {
      setAssigning(true);

      queryClient.setQueryData(
        ['admin-tech-center-users'],
        (oldData: TechCenterData | undefined) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            users: oldData.users.map((user) =>
              userIds.includes(user.id)
                ? { ...user, teacherId }
                : user
            ),
          };
        }
      );

      setShowAssignModal(false);
      setSelectedTeacher(null);
      setSelectedStudents(new Set());

      const response = await fetch(
        '/api/admin/tech-centers/users/bulk-assign',
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userIds, teacherId }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();

        await refetch();

        throw new Error(errorData.error || 'Failed to assign users');
      }

      setSuccess('Users assigned successfully');

      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error(error);

      setApiError('Failed to assign users');

      setTimeout(() => setApiError(''), 3000);

      await refetch();
    } finally {
      setAssigning(false);
    }
  };

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudents((previous) => {
      const updated = new Set(previous);

      if (updated.has(studentId)) {
        updated.delete(studentId);
      } else {
        updated.add(studentId);
      }

      return updated;
    });
  };

  const selectAllStudents = () => {
    setSelectedStudents(
      new Set(unassignedStudents.map((user) => user.id))
    );
  };

  const clearSelection = () => {
    setSelectedStudents(new Set());
  };

  const handleBulkUnassign = async (
    userIds: string[],
    teacherId: string
  ) => {
    try {
      setAssigning(true);

      queryClient.setQueryData(
        ['admin-tech-center-users'],
        (oldData: TechCenterData | undefined) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            users: oldData.users.map((user) =>
              userIds.includes(user.id)
                ? { ...user, teacherId: null }
                : user
            ),
          };
        }
      );

      setSelectedUsersForRemoval(new Set());
      setUnassignModeTeacherId(null);

      const response = await fetch(
        '/api/admin/tech-centers/users/bulk-unassign',
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userIds, teacherId }),
        }
      );

      if (!response.ok) {
        await refetch();

        throw new Error('Failed to unassign users');
      }

      setSuccess('Users unassigned successfully');

      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error(error);

      setApiError('Failed to unassign users');

      setTimeout(() => setApiError(''), 3000);

      await refetch();
    } finally {
      setAssigning(false);
    }
  };

  const handleRemoveUser = async (
    userId: string,
    teacherId: string
  ) => {
    try {
      setIndividualRemoving(
        (prev) => new Set(prev).add(userId)
      );

      queryClient.setQueryData(
        ['admin-tech-center-users'],
        (oldData: TechCenterData | undefined) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            users: oldData.users.map((user) =>
              user.id === userId
                ? { ...user, teacherId: null }
                : user
            ),
          };
        }
      );

      const response = await fetch(
        `/api/admin/tech-centers/users/${userId}/assign`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ teacherId }),
        }
      );

      if (!response.ok) {
        await refetch();

        throw new Error('Failed to remove user');
      }

      setSuccess('User removed successfully');

      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error(error);

      setApiError('Failed to remove user');

      setTimeout(() => setApiError(''), 3000);

      await refetch();
    } finally {
      setIndividualRemoving((prev) => {
        const updated = new Set(prev);

        updated.delete(userId);

        return updated;
      });
    }
  };

  const openAssignModal = (teacher: User) => {
    setSelectedTeacher(teacher);
    setSelectedStudents(new Set());
    setShowAssignModal(true);
  };

  const closeAssignModal = () => {
    setShowAssignModal(false);
    setSelectedTeacher(null);
    setSelectedStudents(new Set());
  };

  return (
    <div className="min-h-screen bg-[#F1F1EC]">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">

        {/* HEADER */}
        <div className="mb-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-start gap-3 sm:gap-4">
              <button
                onClick={() => router.back()}
                aria-label="Go back"
                className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#DADCD3] bg-white text-[#12203B] shadow-sm transition-all hover:-translate-x-0.5 hover:border-[#B98A3E]/30 hover:bg-[#F7F6F2] focus:outline-none focus:ring-2 focus:ring-[#B98A3E]/25"
              >
                <ArrowLeft size={19} />
              </button>

              <div className="min-w-0">
                <h1 className="text-2xl font-bold tracking-tight text-[#12203B] sm:text-3xl">
                  Tutors & Assigned Students
                </h1>

                <p className="mt-1.5 max-w-2xl text-sm leading-6 text-[#6B7268] sm:text-base">
                  View tutors, assigned students, and manage learning support relationships.
                </p>
              </div>
            </div>

            {techCenterData?.techCenter && (
              <div className="inline-flex items-center gap-2 rounded-lg border border-[#DADCD3] bg-white px-3.5 py-2.5 text-sm text-[#4B564C]">
                <MapPin size={16} className="text-[#55705B]" />

                <span className="font-medium text-[#12203B]">
                  {techCenterData.techCenter.name}
                </span>

                <span className="text-[#8A9088]">
                  {techCenterData.techCenter.code}
                </span>
              </div>
            )}
          </div>

          {(apiError || success) && (
            <div className="mt-4">
              {apiError && (
                <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <XCircle size={18} />
                  <span>{apiError}</span>
                </div>
              )}

              {success && (
                <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  <CheckCircle size={18} />
                  <span>{success}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* LOADING */}
        {isLoading ? (
          <div
            className="rounded-xl border border-[#DADCD3] bg-white p-4 sm:p-5"
            aria-label="Loading tutors and students"
            aria-busy="true"
          >
            <div className="animate-pulse space-y-5">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-[#E7E8E1] p-4"
                  >
                    <div className="h-3 w-16 rounded bg-[#E7E8E1]" />
                    <div className="mt-4 h-7 w-10 rounded bg-[#E7E8E1]" />
                  </div>
                ))}
              </div>

              <div className="rounded-lg border border-[#E7E8E1] p-5">
                <div className="h-4 w-32 rounded bg-[#E7E8E1]" />
                <div className="mt-4 h-11 w-full rounded-lg bg-[#F7F6F2]" />
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                {Array.from({ length: 2 }).map((_, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-[#E7E8E1] p-5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-14 w-14 rounded-full bg-[#E7E8E1]" />

                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-36 rounded bg-[#E7E8E1]" />
                        <div className="h-3 w-52 rounded bg-[#F7F6F2]" />
                      </div>
                    </div>

                    <div className="mt-5 space-y-2">
                      <div className="h-12 rounded-lg bg-[#F7F6F2]" />
                      <div className="h-12 rounded-lg bg-[#F7F6F2]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : queryError ? (
          <div className="rounded-2xl border border-red-200 bg-white p-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
              <XCircle className="text-red-600" size={22} />
            </div>

            <h2 className="font-semibold text-[#12203B]">
              Unable to load users
            </h2>

            <p className="mt-1 text-sm text-[#6B7268]">
              Something went wrong while loading the people in this tech center.
            </p>

            <button
              onClick={() => refetch()}
              className="mt-5 rounded-xl bg-[#12203B] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#9A7333]"
            >
              Try again
            </button>
          </div>
        ) : (
          <div className="space-y-6">

            {/* STATISTICS */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {[
                {
                  label: 'Total Users',
                  value: allUsers.length,
                  icon: Users,
                },
                {
                  label: 'Tutors',
                  value: teachers.length,
                  icon: GraduationCap,
                },
                {
                  label: 'Admins',
                  value: admins.length,
                  icon: Users,
                },
                {
                  label: 'Students',
                  value: students.length,
                  icon: Users,
                },
                {
                  label: 'Assigned',
                  value: assignedStudents.length,
                  icon: UserPlus,
                },
                {
                  label: 'Available',
                  value: unassignedStudents.length,
                  icon: UserMinus,
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="rounded-xl border border-[#DADCD3] bg-white p-4 transition-colors duration-200 hover:border-[#B98A3E]/35 sm:p-5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#E7E8E1] bg-[#F7F6F2] text-[#55705B]">
                        <Icon size={19} />
                      </div>

                      <span className="text-[11px] font-semibold uppercase tracking-wide text-[#8A9088]">
                        {item.label}
                      </span>
                    </div>

                    <p className="mt-4 text-2xl font-bold tracking-tight text-[#12203B] sm:text-3xl">
                      {item.value}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* SEARCH */}
            <div className="overflow-hidden rounded-xl border border-[#DADCD3] bg-white">
              <div className="flex flex-col gap-3 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <h2 className="font-semibold text-[#12203B] sm:text-lg">
                    Find a person
                  </h2>

                  <p className="mt-0.5 text-xs text-[#6B7268] sm:text-sm">
                    Search by name or email address.
                  </p>
                </div>

                <div className="w-full lg:max-w-xl">
                  <div className="relative">
                    <Search
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8A9088]"
                      size={18}
                    />

                    <input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search users by name or email..."
                      className="w-full rounded-xl border border-[#DADCD3] bg-[#F7F6F2] py-3 pl-11 pr-10 text-sm text-[#12203B] outline-none transition-all placeholder:text-[#8A9088] focus:border-[#B98A3E] focus:bg-white focus:ring-4 focus:ring-[#B98A3E]/10 sm:text-base"
                    />

                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        aria-label="Clear search"
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[#8A9088] transition hover:bg-[#E7E8E1] hover:text-[#4B564C]"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t border-[#E7E8E1] bg-[#F7F6F2] px-4 py-2.5 sm:px-5">
                <p className="text-xs text-[#6B7268] sm:text-sm">
                  Showing{' '}
                  <span className="font-semibold text-[#3F4A41]">
                    {filteredUsers.length}
                  </span>{' '}
                  of{' '}
                  <span className="font-semibold text-[#3F4A41]">
                    {allUsers.length}
                  </span>{' '}
                  users

                  {searchTerm && (
                    <>
                      {' '}
                      matching{' '}
                      <span className="font-medium text-[#12203B]">
                        “{searchTerm}”
                      </span>
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* TUTORS SECTION */}
            <div className="overflow-hidden rounded-xl border border-[#DADCD3] bg-white">
              <div className="flex flex-col gap-3 border-b border-[#E7E8E1] p-4 sm:p-5 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-[#55705B]">
                    <GraduationCap size={21} />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-[#12203B] sm:text-lg">
                        Tutors
                      </h2>

                      <span className="rounded-full bg-[#E7E8E1] px-2 py-0.5 text-[11px] font-semibold text-[#6B7268]">
                        {teachers.length}
                      </span>
                    </div>

                    <p className="mt-0.5 text-xs text-[#6B7268] sm:text-sm">
                      {assignedStudents.length} students assigned across all tutors
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-5">
                {teachers.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[#DADCD3] bg-[#F7F6F2] px-5 py-14 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-[#DADCD3] bg-white">
                      <GraduationCap
                        size={21}
                        className="text-[#8A9088]"
                      />
                    </div>

                    <p className="font-medium text-[#4B564C]">
                      No tutors found
                    </p>

                    <p className="mt-1 text-sm text-[#8A9088]">
                      Try changing your search.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-5 lg:grid-cols-2">
                    {teachers.map((teacher) => {
                      const teacherStudents =
                        getTeacherAssignedStudents(teacher.id);

                      const isUnassigning =
                        unassignModeTeacherId === teacher.id;

                      return (
                        <div
                          key={teacher.id}
                          className={`group overflow-hidden rounded-xl bg-white transition-shadow duration-200 ${
                            isUnassigning
                              ? 'bg-amber-50/30 ring-2 ring-amber-200'
                              : 'shadow-[0_1px_3px_rgba(18,32,59,0.06)] hover:shadow-[0_6px_20px_rgba(18,32,59,0.08)]'
                          }`}
                        >

                          {/* TUTOR HEADER */}
                          <div
                            className={`p-4 sm:p-5 ${
                              isUnassigning
                                ? 'bg-amber-50/50'
                                : 'bg-[#FAFAF7]'
                            }`}
                          >
                            <div className="flex items-start gap-3 sm:gap-4">

                              {/* AVATAR */}
                              <div className="relative shrink-0">
                                {teacher.profileImageUrl ? (
                                  <Image
                                    src={teacher.profileImageUrl}
                                    alt={`${teacher.firstName} ${teacher.lastName}`}
                                    width={56}
                                    height={56}
                                    unoptimized
                                    className="h-14 w-14 rounded-full border-2 border-[#DADCD3] object-cover shadow-sm"
                                  />
                                ) : (
                                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#12203B] text-base font-bold text-white shadow-sm">
                                    {getInitials(
                                      teacher.firstName,
                                      teacher.lastName
                                    )}
                                  </div>
                                )}

                                <div className="absolute -bottom-0.5 -right-0.5">
                                  <span
                                    className={`flex h-4.5 w-4.5 items-center justify-center rounded-full border-2 border-white ${
                                      teacher.isActive
                                        ? 'bg-emerald-500'
                                        : 'bg-red-500'
                                    }`}
                                  >
                                    {teacher.isActive ? (
                                      <CheckCircle
                                        size={9}
                                        className="text-white"
                                      />
                                    ) : (
                                      <XCircle
                                        size={9}
                                        className="text-white"
                                      />
                                    )}
                                  </span>
                                </div>
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <h3 className="text-base font-bold text-[#12203B] sm:text-lg">
                                      {teacher.firstName} {teacher.lastName}
                                    </h3>

                                    <div className="mt-1 flex items-center gap-1.5">
                                      <span className="text-xs font-semibold uppercase tracking-wide text-[#55705B]">
                                        Tutor
                                      </span>
                                    </div>
                                  </div>

                                  <span
                                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                      teacher.isActive
                                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                        : 'border-red-200 bg-red-50 text-red-700'
                                    }`}
                                  >
                                    {teacher.isActive ? (
                                      <CheckCircle size={11} />
                                    ) : (
                                      <XCircle size={11} />
                                    )}

                                    {teacher.isActive
                                      ? 'Active'
                                      : 'Inactive'}
                                  </span>
                                </div>

                                {/* CONTACT */}
                                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[#6B7268] sm:text-sm">
                                  <div className="flex min-w-0 items-center gap-1.5">
                                    <Mail
                                      size={14}
                                      className="shrink-0 text-[#8A9088]"
                                    />

                                    <span className="truncate">
                                      {teacher.email}
                                    </span>
                                  </div>

                                  {teacher.phoneNumber && (
                                    <div className="flex items-center gap-1.5">
                                      <Phone
                                        size={14}
                                        className="text-[#8A9088]"
                                      />

                                      <span>
                                        {teacher.phoneNumber}
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {/* STUDENT COUNT */}
                                <div className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-[#55705B] sm:text-sm">
                                  <BookOpen
                                    size={14}
                                    className="text-[#12203B]"
                                  />

                                  <span className="text-xs font-medium text-[#12203B] sm:text-sm">
                                    {teacherStudents.length}{' '}
                                    {teacherStudents.length === 1
                                      ? 'student'
                                      : 'students'}{' '}
                                    assigned
                                  </span>
                                </div>

                                {/* TEXT-BASED TUTOR PROFILE LINK */}
                                <div className="mt-3">
                                  <Link
                                    href={`/dashboard/students/${teacher.id}`}
                                    className="inline-flex text-xs font-semibold text-[#12203B] underline underline-offset-2 transition-colors hover:text-[#8A6328] sm:text-sm"
                                  >
                                    View Profile
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* STUDENTS LIST */}
                          <div className="p-4">
                            {teacherStudents.length > 0 ? (
                              <div>
                                {isUnassigning && (
                                  <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
                                    <div className="flex items-start gap-2.5">
                                      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-amber-700">
                                        <Trash2 size={14} />
                                      </div>

                                      <div>
                                        <p className="text-sm font-semibold text-amber-900">
                                          Unassign mode
                                        </p>

                                        <p className="text-xs text-amber-800">
                                          Select students to remove from this tutor.
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {selectedUsersForRemoval.size > 0 &&
                                  isUnassigning && (
                                    <button
                                      onClick={() =>
                                        handleBulkUnassign(
                                          Array.from(
                                            selectedUsersForRemoval
                                          ),
                                          teacher.id
                                        )
                                      }
                                      disabled={assigning}
                                      className="mb-3 flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                      {assigning && (
                                        <Loader2
                                          size={16}
                                          className="animate-spin"
                                        />
                                      )}

                                      Remove{' '}
                                      {selectedUsersForRemoval.size}{' '}
                                      User
                                      {selectedUsersForRemoval.size > 1
                                        ? 's'
                                        : ''}
                                    </button>
                                  )}

                                {/* ASSIGNED USERS */}
                                <div className="space-y-2">
                                  {teacherStudents.map((user) => {
                                    const showRemoveIcon =
                                      isUnassigning &&
                                      canManageAssignments;

                                    return (
                                      <div
                                        key={user.id}
                                        className="flex items-center gap-3 rounded-xl border border-[#DADCD3] bg-white px-4 py-3 transition-all hover:border-[#B98A3E]/45 hover:bg-[#F7F6F2] hover:shadow-sm"
                                      >
                                        {showRemoveIcon && (
                                          <input
                                            type="checkbox"
                                            checked={selectedUsersForRemoval.has(
                                              user.id
                                            )}
                                            onChange={() =>
                                              toggleUserRemovalSelection(
                                                user.id
                                              )
                                            }
                                            className="h-4.5 w-4.5 shrink-0 rounded border-[#C9CCC3] text-[#12203B] focus:ring-2 focus:ring-[#B98A3E]/20"
                                          />
                                        )}

                                        {user.profileImageUrl ? (
                                          <div className="relative shrink-0">
                                            <Image
                                              src={user.profileImageUrl}
                                              alt={`${user.firstName} ${user.lastName}`}
                                              width={40}
                                              height={40}
                                              unoptimized
                                              className="h-10 w-10 rounded-full border-2 border-[#E7E8E1] object-cover shadow-sm"
                                            />

                                            <div className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3 items-center justify-center rounded-full border-2 border-white bg-emerald-500">
                                              <CheckCircle
                                                size={7}
                                                className="text-white"
                                              />
                                            </div>
                                          </div>
                                        ) : (
                                          <div className="relative shrink-0">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#12203B] text-sm font-bold text-white shadow-sm">
                                              {getInitials(
                                                user.firstName,
                                                user.lastName
                                              )}
                                            </div>

                                            <div className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3 items-center justify-center rounded-full border-2 border-white bg-emerald-500">
                                              <CheckCircle
                                                size={7}
                                                className="text-white"
                                              />
                                            </div>
                                          </div>
                                        )}

                                        <div className="min-w-0 flex-1">
                                          <p className="text-sm font-semibold text-[#12203B] sm:text-base">
                                            {user.firstName} {user.lastName}
                                          </p>

                                          <div className="flex min-w-0 items-center gap-2">
                                            <p className="truncate text-xs text-[#6B7268] sm:text-sm">
                                              {user.email}
                                            </p>

                                            {user.role?.name ===
                                              'teacher' && (
                                              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#12203B]/10 px-2 py-0.5 text-[10px] font-medium text-[#12203B]">
                                                <GraduationCap size={10} />
                                                Teacher
                                              </span>
                                            )}
                                          </div>
                                        </div>

                                        <div className="flex shrink-0 items-center gap-2">
                                          {/* TEXT-BASED PROFILE LINK */}
                                          <Link
                                            href={`/dashboard/students/${user.id}`}
                                            className="text-xs font-semibold text-[#12203B] underline underline-offset-2 transition-colors hover:text-[#8A6328] sm:text-sm"
                                          >
                                            View Profile
                                          </Link>

                                          {showRemoveIcon && (
                                            <button
                                              onClick={() =>
                                                handleRemoveUser(
                                                  user.id,
                                                  teacher.id
                                                )
                                              }
                                              disabled={individualRemoving.has(
                                                user.id
                                              )}
                                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-100 bg-red-50 text-red-600 transition-all hover:border-red-200 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                                              title="Remove user"
                                            >
                                              {individualRemoving.has(
                                                user.id
                                              ) ? (
                                                <Loader2
                                                  size={14}
                                                  className="animate-spin"
                                                />
                                              ) : (
                                                <Trash2 size={14} />
                                              )}
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ) : (
                              <div className="rounded-lg border border-dashed border-[#DADCD3] bg-[#F7F6F2] px-4 py-6 text-center">
                                <BookOpen
                                  size={20}
                                  className="mx-auto mb-1.5 text-[#8A9088]"
                                />

                                <p className="text-sm font-medium text-[#4B564C]">
                                  No students assigned
                                </p>

                                <p className="mt-0.5 text-xs text-[#8A9088]">
                                  This tutor is ready for assignments.
                                </p>
                              </div>
                            )}

                            {/* ACTION BUTTONS */}
                            {canManageAssignments && (
                              <div className="mt-3 space-y-1.5">
                                {!isUnassigning && (
                                  <button
                                    onClick={() =>
                                      openAssignModal(teacher)
                                    }
                                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#12203B] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#9A7333] hover:shadow-md focus:outline-none focus:ring-4 focus:ring-[#B98A3E]/10"
                                  >
                                    <UserPlus size={16} />
                                    Assign Students
                                  </button>
                                )}

                                {teacherStudents.length > 0 && (
                                  <button
                                    onClick={() => {
                                      if (
                                        unassignModeTeacherId ===
                                        teacher.id
                                      ) {
                                        setUnassignModeTeacherId(null);
                                        setSelectedUsersForRemoval(
                                          new Set()
                                        );
                                      } else {
                                        setUnassignModeTeacherId(
                                          teacher.id
                                        );
                                        setSelectedUsersForRemoval(
                                          new Set()
                                        );
                                      }
                                    }}
                                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#DADCD3] bg-white px-4 py-2 text-xs font-semibold text-[#4B564C] transition hover:border-[#B98A3E]/30 hover:bg-[#F7F6F2]"
                                  >
                                    <Trash2 size={13} />

                                    {isUnassigning
                                      ? 'Cancel Unassign'
                                      : 'Unassign Students'}
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* AVAILABLE USERS */}
            <div className="overflow-hidden rounded-xl border border-[#DADCD3] bg-white">
              <div className="flex items-center justify-between border-b border-[#E7E8E1] p-4 sm:p-5">
                <div className="flex items-center gap-3">
                  <div className="text-[#55705B]">
                    <Users size={21} />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-[#12203B] sm:text-lg">
                        Available Users
                      </h2>

                      <span className="rounded-full bg-[#E7E8E1] px-2 py-0.5 text-[11px] font-semibold text-[#6B7268]">
                        {unassignedStudents.length}
                      </span>
                    </div>

                    <p className="mt-0.5 text-xs text-[#6B7268] sm:text-sm">
                      Students available for tutor assignment
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-5">
                {unassignedStudents.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-[#DADCD3] bg-[#F7F6F2] px-5 py-12 text-center">
                    <CheckCircle
                      size={24}
                      className="mx-auto mb-2 text-emerald-500"
                    />

                    <p className="font-medium text-[#4B564C]">
                      All students have tutors
                    </p>

                    <p className="mt-1 text-sm text-[#8A9088]">
                      Every student in your tech center is assigned to a tutor.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-[#E7E8E1]">
                    {unassignedStudents.map((user) => (
                      <div
                        key={user.id}
                        className="flex w-full items-center gap-3 px-4 py-3.5 transition-colors hover:bg-[#F7F6F2] sm:px-5"
                      >
                        {user.profileImageUrl ? (
                          <div className="relative shrink-0">
                            <Image
                              src={user.profileImageUrl}
                              alt={`${user.firstName} ${user.lastName}`}
                              width={40}
                              height={40}
                              unoptimized
                              className="h-10 w-10 rounded-full border-2 border-[#E7E8E1] object-cover shadow-sm"
                            />

                            <div className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3 items-center justify-center rounded-full border-2 border-white bg-amber-500">
                              <UserMinus
                                size={7}
                                className="text-white"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="relative shrink-0">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#12203B] text-sm font-bold text-white shadow-sm">
                              {getInitials(
                                user.firstName,
                                user.lastName
                              )}
                            </div>

                            <div className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3 items-center justify-center rounded-full border-2 border-white bg-amber-500">
                              <UserMinus
                                size={7}
                                className="text-white"
                              />
                            </div>
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold leading-5 text-[#12203B] sm:text-base">
                            {user.firstName} {user.lastName}
                          </p>

                          <p className="mt-0.5 flex items-center gap-1 text-xs font-medium text-amber-600">
                            <UserMinus size={11} />
                            Student • Unassigned
                          </p>
                        </div>

                        {/* TEXT-BASED PROFILE LINK */}
                        <Link
                          href={`/dashboard/students/${user.id}`}
                          className="shrink-0 text-xs font-semibold text-[#12203B] underline underline-offset-2 transition-colors hover:text-[#8A6328] sm:text-sm"
                        >
                          View Profile
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ASSIGN MODAL */}
        {showAssignModal && selectedTeacher && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-3 backdrop-blur-[2px] sm:p-5"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                closeAssignModal();
              }
            }}
          >
            <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-[#DADCD3] bg-white shadow-[0_20px_60px_rgba(18,32,59,0.16)]">

              {/* MODAL HEADER */}
              <div className="shrink-0 border-b border-[#E7E8E1] bg-white p-4 sm:p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    {selectedTeacher.profileImageUrl ? (
                      <Image
                        src={selectedTeacher.profileImageUrl}
                        alt={`${selectedTeacher.firstName} ${selectedTeacher.lastName}`}
                        width={44}
                        height={44}
                        unoptimized
                        className="h-11 w-11 shrink-0 rounded-full border-2 border-[#E7E8E1] object-cover shadow-sm"
                      />
                    ) : (
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#12203B] text-sm font-bold text-white shadow-sm">
                        {getInitials(
                          selectedTeacher.firstName,
                          selectedTeacher.lastName
                        )}
                      </div>
                    )}

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-[#12203B] sm:text-lg">
                          Assign Students
                        </h3>

                        <span className="rounded-full bg-[#F7F6F2] px-2.5 py-1 text-[11px] font-semibold text-[#12203B]">
                          Tutor
                        </span>
                      </div>

                      <p className="mt-0.5 truncate text-sm text-[#6B7268] sm:text-base">
                        {selectedTeacher.firstName}{' '}
                        {selectedTeacher.lastName}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={closeAssignModal}
                    aria-label="Close assignment modal"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#DADCD3] text-[#6B7268] transition hover:bg-[#F7F6F2] hover:text-[#3F4A41]"
                  >
                    <X size={17} />
                  </button>
                </div>
              </div>

              {/* MODAL CONTROLS */}
              <div className="shrink-0 border-b border-[#E7E8E1] bg-[#F7F6F2] p-3 sm:p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[#12203B] sm:text-base">
                      Available students
                    </p>

                    <p className="text-xs text-[#6B7268] sm:text-sm">
                      {unassignedStudents.length} students available
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={selectAllStudents}
                      className="rounded-lg border border-[#DADCD3] bg-white px-3 py-1.5 text-xs font-semibold text-[#12203B] transition hover:border-[#B98A3E]/30 hover:bg-[#F7F6F2] sm:text-sm"
                    >
                      Select all
                    </button>

                    <button
                      onClick={clearSelection}
                      className="rounded-lg border border-[#DADCD3] bg-white px-3 py-1.5 text-xs font-semibold text-[#6B7268] transition hover:border-[#B98A3E]/30 hover:bg-[#F7F6F2] sm:text-sm"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="relative">
                    <Search
                      className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A9088]"
                      size={16}
                    />

                    <input
                      type="text"
                      placeholder="Search by name or email..."
                      value={modalSearchTerm}
                      onChange={(e) =>
                        setModalSearchTerm(e.target.value)
                      }
                      className="w-full rounded-lg border border-[#DADCD3] bg-white py-2 pl-9 pr-4 text-sm text-[#12203B] placeholder:text-[#8A9088] focus:border-[#B98A3E] focus:outline-none focus:ring-2 focus:ring-[#B98A3E]/20"
                    />
                  </div>
                </div>

                {selectedStudents.size > 0 && (
                  <button
                    onClick={() =>
                      handleBulkAssign(
                        Array.from(selectedStudents),
                        selectedTeacher.id
                      )
                    }
                    disabled={assigning}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-[#12203B] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#9A7333] disabled:cursor-not-allowed disabled:opacity-50 sm:text-base"
                  >
                    {assigning && (
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />
                    )}

                    Assign {selectedStudents.size}{' '}
                    Student
                    {selectedStudents.size > 1 ? 's' : ''}
                  </button>
                )}
              </div>

              {/* STUDENT LIST */}
              <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
                {filteredUnassignedStudents.length === 0 ? (
                  <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed border-[#DADCD3] bg-[#F7F6F2] p-6 text-center">
                    <div>
                      <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full border border-[#DADCD3] bg-white">
                        {modalSearchTerm.trim() ? (
                          <SearchX
                            size={18}
                            className="text-[#8A9088]"
                          />
                        ) : (
                          <CheckCircle
                            size={18}
                            className="text-emerald-600"
                          />
                        )}
                      </div>

                      <p className="font-semibold text-[#3F4A41]">
                        {modalSearchTerm.trim()
                          ? 'No matching students found'
                          : 'No unassigned users'}
                      </p>

                      <p className="mt-0.5 text-sm text-[#8A9088]">
                        {modalSearchTerm.trim()
                          ? 'Try a different search term or check if the student is already assigned'
                          : 'All available students already have a tutor.'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredUnassignedStudents.map((user) => (
                      <div
                        key={user.id}
                        className={`flex items-center gap-3 rounded-xl border p-3 transition-all ${
                          selectedStudents.has(user.id)
                            ? 'border-[#B98A3E]/45 bg-[#FBF7EE] shadow-sm'
                            : 'border-[#DADCD3] bg-white hover:border-[#B98A3E]/30 hover:bg-[#F7F6F2]'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedStudents.has(user.id)}
                          onChange={() =>
                            toggleStudentSelection(user.id)
                          }
                          className="h-4.5 w-4.5 shrink-0 rounded border-[#C9CCC3] text-[#12203B] focus:ring-2 focus:ring-[#B98A3E]/20"
                        />

                        {user.profileImageUrl ? (
                          <div className="relative shrink-0">
                            <Image
                              src={user.profileImageUrl}
                              alt={`${user.firstName} ${user.lastName}`}
                              width={40}
                              height={40}
                              unoptimized
                              className="h-10 w-10 rounded-full border-2 border-[#E7E8E1] object-cover shadow-sm"
                            />

                            <div className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3 items-center justify-center rounded-full border-2 border-white bg-amber-500">
                              <UserMinus
                                size={7}
                                className="text-white"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="relative shrink-0">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#12203B] text-sm font-bold text-white shadow-sm">
                              {getInitials(
                                user.firstName,
                                user.lastName
                              )}
                            </div>

                            <div className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3 items-center justify-center rounded-full border-2 border-white bg-amber-500">
                              <UserMinus
                                size={7}
                                className="text-white"
                              />
                            </div>
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-[#12203B] sm:text-base">
                            {user.firstName} {user.lastName}
                          </p>

                          <div className="flex min-w-0 items-center gap-2">
                            <p className="truncate text-xs text-[#6B7268] sm:text-sm">
                              {user.email}
                            </p>
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                          {/* TEXT-BASED PROFILE LINK */}
                          <Link
                            href={`/dashboard/students/${user.id}`}
                            className="text-xs font-semibold text-[#12203B] underline underline-offset-2 transition-colors hover:text-[#8A6328] sm:text-sm"
                          >
                            View Profile
                          </Link>

                          {selectedStudents.size === 0 && (
                            <button
                              onClick={() =>
                                handleAssignUser(
                                  user.id,
                                  selectedTeacher.id
                                )
                              }
                              disabled={assigning}
                              className="flex shrink-0 items-center gap-1.5 rounded-lg bg-[#F7F6F2] px-3 py-2 text-xs font-semibold text-[#12203B] transition-all hover:bg-[#E7E8E1] hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
                            >
                              {assigning && (
                                <Loader2
                                  size={14}
                                  className="animate-spin"
                                />
                              )}

                              Assign
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* MODAL FOOTER */}
              <div className="shrink-0 border-t border-[#E7E8E1] bg-white p-3 sm:p-4">
                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-[#8A9088] sm:text-sm">
                    {selectedStudents.size > 0
                      ? `${selectedStudents.size} student${
                          selectedStudents.size === 1 ? '' : 's'
                        } selected`
                      : 'Select students individually or use Select all'}
                  </p>

                  <button
                    onClick={closeAssignModal}
                    className="rounded-lg border border-[#DADCD3] bg-white px-4 py-2 text-sm font-semibold text-[#4B564C] transition hover:bg-[#F7F6F2] sm:text-base"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

