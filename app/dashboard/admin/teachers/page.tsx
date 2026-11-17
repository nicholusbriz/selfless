'use client';

export const dynamic = 'force-dynamic';

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

import { useAuth } from '@/lib/hooks/useAuth';
import { getResponseError } from '../../response-guards';

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

const compareByName = (
  a: { firstName: string; lastName: string },
  b: { firstName: string; lastName: string },
) =>
  `${a.firstName} ${a.lastName}`.localeCompare(
    `${b.firstName} ${b.lastName}`,
    undefined,
    { sensitivity: 'base' },
  );

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
      if (updated.has(userId)) updated.delete(userId);
      else updated.add(userId);
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
      if (!response.ok) throw new Error('Failed to fetch users');
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
      ).sort(compareByName),
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

  const assignableUsers = useMemo(
    () =>
      filteredUsers.filter(
        (user) =>
          user.role?.name !== 'admin' &&
          user.role?.name !== 'super_admin' &&
          user.role?.name !== 'teacher'
      ).sort(compareByName),
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
        const errorData: unknown = await response.json();
        await refetch();
        throw new Error(getResponseError(errorData, 'Failed to assign user'));
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

  const handleBulkAssign = async (userIds: string[], teacherId: string) => {
    try {
      setAssigning(true);
      queryClient.setQueryData(
        ['admin-tech-center-users'],
        (oldData: TechCenterData | undefined) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            users: oldData.users.map((user) =>
              userIds.includes(user.id) ? { ...user, teacherId } : user
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
        const errorData: unknown = await response.json();
        await refetch();
        throw new Error(getResponseError(errorData, 'Failed to assign users'));
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
      if (updated.has(studentId)) updated.delete(studentId);
      else updated.add(studentId);
      return updated;
    });
  };

  const selectAllStudents = () => {
    setSelectedStudents(new Set(unassignedStudents.map((user) => user.id)));
  };

  const clearSelection = () => {
    setSelectedStudents(new Set());
  };

  const handleBulkUnassign = async (userIds: string[], teacherId: string) => {
    try {
      setAssigning(true);
      queryClient.setQueryData(
        ['admin-tech-center-users'],
        (oldData: TechCenterData | undefined) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            users: oldData.users.map((user) =>
              userIds.includes(user.id) ? { ...user, teacherId: null } : user
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

  const handleRemoveUser = async (userId: string, teacherId: string) => {
    try {
      setIndividualRemoving((prev) => new Set(prev).add(userId));
      queryClient.setQueryData(
        ['admin-tech-center-users'],
        (oldData: TechCenterData | undefined) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            users: oldData.users.map((user) =>
              user.id === userId ? { ...user, teacherId: null } : user
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
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="mx-auto w-full max-w-6xl px-3 py-4 sm:px-5 lg:px-6 md:py-6">

        {/* HEADER */}
        <div className="mb-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-start gap-2.5">
              <button
                onClick={() => router.back()}
                aria-label="Go back"
                className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#1A2B4C] shadow-sm transition-colors hover:border-[#C59B4C] hover:text-[#8A672C] focus:outline-none focus:ring-2 focus:ring-[#C59B4C]/25"
              >
                <ArrowLeft size={18} />
              </button>

              <div className="min-w-0">
                <h1 className="text-xl font-bold tracking-tight text-[#1A2B4C] sm:text-2xl">
                  Tutors & Assigned Students
                </h1>
                <p className="mt-1 max-w-2xl text-[12px] leading-5 text-[#6B7280] sm:text-[13px]">
                  View tutors, assigned students, and manage learning support relationships.
                </p>
              </div>
            </div>

            {techCenterData?.techCenter && (
              <div className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-white px-2.5 py-1.5 text-[12px] text-[#4B5646]">
                <MapPin size={14} className="text-[#55705B]" />
                <span className="font-medium text-[#1A2B4C]">
                  {techCenterData.techCenter.name}
                </span>
                <span className="text-[#9CA3AF]">
                  {techCenterData.techCenter.code}
                </span>
              </div>
            )}
          </div>

          {(apiError || success) && (
            <div className="mt-3 space-y-2">
              {apiError && (
                <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700">
                  <XCircle size={16} />
                  <span>{apiError}</span>
                </div>
              )}
              {success && (
                <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-[12px] text-emerald-700">
                  <CheckCircle size={16} />
                  <span>{success}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* LOADING */}
        {isLoading ? (
          <div
            className="rounded-xl border border-[#E5E7EB] bg-white p-4"
            aria-label="Loading tutors and students"
            aria-busy="true"
          >
            <div className="animate-pulse space-y-4">
              <div className="h-4 w-64 rounded bg-[#F3F4F6]" />
              <div className="rounded-lg border border-[#F3F4F6] p-4">
                <div className="h-3 w-32 rounded bg-[#F3F4F6]" />
                <div className="mt-3 h-9 w-full rounded-lg bg-[#F8F9FA]" />
              </div>
              <div className="space-y-3">
                {Array.from({ length: 2 }).map((_, index) => (
                  <div key={index} className="rounded-lg border border-[#F3F4F6] p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-[#F3F4F6]" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3.5 w-36 rounded bg-[#F3F4F6]" />
                        <div className="h-2.5 w-52 rounded bg-[#F8F9FA]" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : queryError ? (
          <div className="rounded-xl border border-red-200 bg-white p-8 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
              <XCircle className="text-red-600" size={20} />
            </div>
            <h2 className="font-semibold text-[#1A2B4C]">
              Unable to load users
            </h2>
            <p className="mt-1 text-[13px] text-[#6B7280]">
              Something went wrong while loading the people in this tech center.
            </p>
            <button
              onClick={() => refetch()}
              className="mt-4 rounded-lg bg-[#1A2B4C] px-4 py-2 text-[12px] font-semibold text-white transition-colors hover:bg-[#8A672C]"
            >
              Try again
            </button>
          </div>
        ) : (
          <div className="space-y-4">

            {/* STATS — simple text strip */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-[13px]">
              <span className="text-[#6B7280]">
                Users <span className="font-semibold text-[#1A2B4C]">{allUsers.length}</span>
              </span>
              <span className="h-3 w-px bg-[#E5E7EB]" />
              <span className="text-[#6B7280]">
                Tutors <span className="font-semibold text-[#1A2B4C]">{teachers.length}</span>
              </span>
              <span className="h-3 w-px bg-[#E5E7EB]" />
              <span className="text-[#6B7280]">
                Admins <span className="font-semibold text-[#1A2B4C]">{admins.length}</span>
              </span>
              <span className="h-3 w-px bg-[#E5E7EB]" />
              <span className="text-[#6B7280]">
                Students <span className="font-semibold text-[#1A2B4C]">{students.length}</span>
              </span>
              <span className="h-3 w-px bg-[#E5E7EB]" />
              <span className="text-[#6B7280]">
                Assigned <span className="font-semibold text-[#1A2B4C]">{assignedStudents.length}</span>
              </span>
              <span className="h-3 w-px bg-[#E5E7EB]" />
              <span className="text-[#6B7280]">
                Available <span className="font-semibold text-[#1A2B4C]">{unassignedStudents.length}</span>
              </span>
            </div>

            {/* SEARCH */}
            <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white">
              <div className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
                <div className="min-w-0">
                  <h2 className="text-[13px] font-semibold text-[#1A2B4C]">
                    Find a person
                  </h2>
                  <p className="mt-0.5 text-[11px] text-[#6B7280]">
                    Search by name or email address.
                  </p>
                </div>

                <div className="w-full sm:max-w-md">
                  <div className="relative">
                    <Search
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
                      size={16}
                    />
                    <input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search users by name or email..."
                      className="w-full rounded-lg border border-[#E5E7EB] bg-[#F8F9FA] py-2 pl-9 pr-9 text-[13px] text-[#1A2B4C] outline-none transition-colors placeholder:text-[#9CA3AF] focus:border-[#C59B4C] focus:bg-white focus:ring-2 focus:ring-[#C59B4C]/15"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        aria-label="Clear search"
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#9CA3AF] transition-colors hover:bg-[#F3F4F6] hover:text-[#4B5646]"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t border-[#F3F4F6] bg-[#F8F9FA] px-3 py-2 sm:px-4">
                <p className="text-[11px] text-[#6B7280]">
                  Showing{' '}
                  <span className="font-semibold text-[#1A2B4C]">
                    {filteredUsers.length}
                  </span>{' '}
                  of{' '}
                  <span className="font-semibold text-[#1A2B4C]">
                    {allUsers.length}
                  </span>{' '}
                  users
                  {searchTerm && (
                    <>
                      {' '}matching{' '}
                      <span className="font-medium text-[#1A2B4C]">
                        “{searchTerm}”
                      </span>
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* TUTORS */}
            <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white">
              <div className="flex items-center justify-between border-b border-[#F3F4F6] px-3 py-2.5 sm:px-4">
                <div className="flex items-center gap-2">
                  <GraduationCap size={18} className="text-[#55705B]" />
                  <h2 className="text-[13px] font-semibold text-[#1A2B4C]">
                    Tutors
                  </h2>
                  <span className="rounded-full bg-[#F3F4F6] px-1.5 py-0.5 text-[10px] font-semibold text-[#6B7280]">
                    {teachers.length}
                  </span>
                </div>
                <p className="text-[11px] text-[#6B7280]">
                  {assignedStudents.length} students assigned
                </p>
              </div>

              {teachers.length === 0 ? (
                <div className="px-4 py-10 text-center">
                  <GraduationCap size={20} className="mx-auto mb-2 text-[#9CA3AF]" />
                  <p className="text-[13px] font-medium text-[#4B5646]">
                    No tutors found
                  </p>
                  <p className="mt-0.5 text-[11px] text-[#9CA3AF]">
                    Try changing your search.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-[#F3F4F6]">
                  {teachers.map((teacher) => {
                    const teacherStudents = getTeacherAssignedStudents(teacher.id);
                    const isUnassigning = unassignModeTeacherId === teacher.id;

                    return (
                      <li key={teacher.id} className="px-3 py-3 sm:px-4">
                        {/* Tutor row */}
                        <div className="flex items-start gap-3">
                          {teacher.profileImageUrl ? (
                            <Image
                              src={teacher.profileImageUrl}
                              alt={`${teacher.firstName} ${teacher.lastName}`}
                              width={36}
                              height={36}
                              unoptimized
                              className="h-9 w-9 shrink-0 rounded-full border border-[#E5E7EB] object-cover"
                            />
                          ) : (
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1A2B4C] text-[11px] font-bold text-white">
                              {getInitials(teacher.firstName, teacher.lastName)}
                            </div>
                          )}

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="min-w-0">
                                <h3 className="text-[13px] font-semibold text-[#1A2B4C]">
                                  {teacher.firstName} {teacher.lastName}
                                </h3>
                                <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-[#6B7280]">
                                  <span className="inline-flex items-center gap-1">
                                    <Mail size={11} className="text-[#9CA3AF]" />
                                    <span className="truncate">{teacher.email}</span>
                                  </span>
                                  {teacher.phoneNumber && (
                                    <span className="inline-flex items-center gap-1">
                                      <Phone size={11} className="text-[#9CA3AF]" />
                                      {teacher.phoneNumber}
                                    </span>
                                  )}
                                </p>
                              </div>

                              <div className="flex items-center gap-2 text-[11px]">
                                <span className={`inline-flex items-center gap-1 font-medium ${teacher.isActive ? 'text-emerald-700' : 'text-red-600'}`}>
                                  {teacher.isActive ? <CheckCircle size={11} /> : <XCircle size={11} />}
                                  {teacher.isActive ? 'Active' : 'Inactive'}
                                </span>
                                <span className="h-3 w-px bg-[#E5E7EB]" />
                                <span className="font-medium text-[#6B7280]">
                                  {teacherStudents.length} student{teacherStudents.length === 1 ? '' : 's'}
                                </span>
                              </div>
                            </div>

                            {/* Actions */}
                            {canManageAssignments && (
                              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                <button
                                  onClick={() => openAssignModal(teacher)}
                                  className="inline-flex items-center gap-1 rounded-md border border-[#E5E7EB] bg-white px-2 py-1 text-[11px] font-medium text-[#1A2B4C] transition-colors hover:border-[#C59B4C] hover:bg-[#FBF7EE]"
                                >
                                  <UserPlus size={12} />
                                  Assign
                                </button>
                                {teacherStudents.length > 0 && (
                                  <button
                                    onClick={() => {
                                      if (unassignModeTeacherId === teacher.id) {
                                        setUnassignModeTeacherId(null);
                                        setSelectedUsersForRemoval(new Set());
                                      } else {
                                        setUnassignModeTeacherId(teacher.id);
                                        setSelectedUsersForRemoval(new Set());
                                      }
                                    }}
                                    className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-medium transition-colors ${
                                      isUnassigning
                                        ? 'border-amber-200 bg-amber-50 text-amber-800'
                                        : 'border-[#E5E7EB] bg-white text-[#4B5646] hover:border-[#C59B4C] hover:bg-[#FBF7EE]'
                                    }`}
                                  >
                                    <Trash2 size={12} />
                                    {isUnassigning ? 'Cancel' : 'Unassign'}
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Assigned students — plain text list */}
                        {teacherStudents.length > 0 && (
                          <div className="mt-2.5 border-t border-[#F3F4F6] pt-2.5">
                            {isUnassigning && selectedUsersForRemoval.size > 0 && (
                              <button
                                onClick={() =>
                                  handleBulkUnassign(
                                    Array.from(selectedUsersForRemoval),
                                    teacher.id
                                  )
                                }
                                disabled={assigning}
                                className="mb-2 flex items-center gap-1.5 rounded-md bg-red-600 px-2.5 py-1 text-[11px] font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {assigning && <Loader2 size={12} className="animate-spin" />}
                                Remove {selectedUsersForRemoval.size} user
                                {selectedUsersForRemoval.size > 1 ? 's' : ''}
                              </button>
                            )}

                            <ul className="space-y-1.5">
                              {teacherStudents.map((user) => (
                                <li
                                  key={user.id}
                                  className="flex items-center gap-2 text-[12px]"
                                >
                                  {isUnassigning && canManageAssignments && (
                                    <input
                                      type="checkbox"
                                      checked={selectedUsersForRemoval.has(user.id)}
                                      onChange={() => toggleUserRemovalSelection(user.id)}
                                      className="h-3.5 w-3.5 shrink-0 rounded border-[#D1D5DB] text-[#1A2B4C] focus:ring-2 focus:ring-[#C59B4C]/20"
                                    />
                                  )}
                                  <span className="min-w-0 flex-1 truncate text-[#4B5646]">
                                    {user.firstName} {user.lastName}
                                  </span>
                                  {isUnassigning && canManageAssignments && (
                                    <button
                                      onClick={() => handleRemoveUser(user.id, teacher.id)}
                                      disabled={individualRemoving.has(user.id)}
                                      className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                      title="Remove user"
                                    >
                                      {individualRemoving.has(user.id) ? (
                                        <Loader2 size={11} className="animate-spin" />
                                      ) : (
                                        <Trash2 size={11} />
                                      )}
                                    </button>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {teacherStudents.length === 0 && (
                          <p className="mt-2.5 border-t border-[#F3F4F6] pt-2.5 text-[11px] italic text-[#9CA3AF]">
                            No students assigned.
                          </p>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* AVAILABLE USERS */}
            <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white">
              <div className="flex items-center justify-between border-b border-[#F3F4F6] px-3 py-2.5 sm:px-4">
                <div className="flex items-center gap-2">
                  <Users size={18} className="text-[#55705B]" />
                  <h2 className="text-[13px] font-semibold text-[#1A2B4C]">
                    Available Users
                  </h2>
                  <span className="rounded-full bg-[#F3F4F6] px-1.5 py-0.5 text-[10px] font-semibold text-[#6B7280]">
                    {unassignedStudents.length}
                  </span>
                </div>
                <p className="text-[11px] text-[#6B7280]">
                  Not yet assigned
                </p>
              </div>

              {unassignedStudents.length === 0 ? (
                <div className="px-4 py-10 text-center">
                  <CheckCircle size={20} className="mx-auto mb-2 text-emerald-500" />
                  <p className="text-[13px] font-medium text-[#4B5646]">
                    All students have tutors
                  </p>
                  <p className="mt-0.5 text-[11px] text-[#9CA3AF]">
                    Every student in your tech center is assigned to a tutor.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-[#F3F4F6]">
                  {unassignedStudents.map((user) => (
                    <li
                      key={user.id}
                      className="flex items-center gap-2.5 px-3 py-2 sm:px-4"
                    >
                      {user.profileImageUrl ? (
                        <Image
                          src={user.profileImageUrl}
                          alt={`${user.firstName} ${user.lastName}`}
                          width={28}
                          height={28}
                          unoptimized
                          className="h-7 w-7 shrink-0 rounded-full border border-[#E5E7EB] object-cover"
                        />
                      ) : (
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#E5E7EB] text-[10px] font-bold text-[#4B5646]">
                          {getInitials(user.firstName, user.lastName)}
                        </div>
                      )}
                      <span className="min-w-0 flex-1 truncate text-[12px] font-medium text-[#1A2B4C]">
                        {user.firstName} {user.lastName}
                      </span>
                      <span className="hidden shrink-0 text-[11px] text-[#9CA3AF] sm:inline">
                        {user.email}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* ASSIGN MODAL */}
        {showAssignModal && selectedTeacher && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-3 backdrop-blur-[2px] sm:p-5"
            onClick={(e) => {
              if (e.target === e.currentTarget) closeAssignModal();
            }}
          >
            <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-xl">

              {/* MODAL HEADER */}
              <div className="shrink-0 border-b border-[#F3F4F6] px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-[14px] font-semibold text-[#1A2B4C]">
                      Assign students to {selectedTeacher.firstName} {selectedTeacher.lastName}
                    </h3>
                    <p className="mt-0.5 text-[11px] text-[#6B7280]">
                      {unassignedStudents.length} students available
                    </p>
                  </div>
                  <button
                    onClick={closeAssignModal}
                    aria-label="Close assignment modal"
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[#6B7280] transition-colors hover:bg-[#F3F4F6] hover:text-[#1A2B4C]"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* MODAL CONTROLS */}
              <div className="shrink-0 border-b border-[#F3F4F6] bg-[#F8F9FA] px-4 py-2.5">
                <div className="relative">
                  <Search
                    className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]"
                    size={14}
                  />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={modalSearchTerm}
                    onChange={(e) => setModalSearchTerm(e.target.value)}
                    className="w-full rounded-lg border border-[#E5E7EB] bg-white py-1.5 pl-8 pr-3 text-[12px] text-[#1A2B4C] placeholder:text-[#9CA3AF] focus:border-[#C59B4C] focus:outline-none focus:ring-2 focus:ring-[#C59B4C]/15"
                  />
                </div>

                <div className="mt-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={selectAllStudents}
                      className="rounded-md border border-[#E5E7EB] bg-white px-2 py-1 text-[11px] font-medium text-[#1A2B4C] transition-colors hover:border-[#C59B4C]"
                    >
                      Select all
                    </button>
                    <button
                      onClick={clearSelection}
                      className="rounded-md border border-[#E5E7EB] bg-white px-2 py-1 text-[11px] font-medium text-[#6B7280] transition-colors hover:border-[#C59B4C]"
                    >
                      Clear
                    </button>
                  </div>
                  {selectedStudents.size > 0 && (
                    <span className="text-[11px] font-medium text-[#1A2B4C]">
                      {selectedStudents.size} selected
                    </span>
                  )}
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
                    className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#1A2B4C] px-3 py-2 text-[12px] font-semibold text-white transition-colors hover:bg-[#8A672C] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {assigning && <Loader2 size={13} className="animate-spin" />}
                    Assign {selectedStudents.size} student
                    {selectedStudents.size > 1 ? 's' : ''}
                  </button>
                )}
              </div>

              {/* STUDENT LIST */}
              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-2">
                {filteredUnassignedStudents.length === 0 ? (
                  <div className="py-10 text-center">
                    {modalSearchTerm.trim() ? (
                      <SearchX size={18} className="mx-auto mb-2 text-[#9CA3AF]" />
                    ) : (
                      <CheckCircle size={18} className="mx-auto mb-2 text-emerald-600" />
                    )}
                    <p className="text-[13px] font-medium text-[#4B5646]">
                      {modalSearchTerm.trim()
                        ? 'No matching students found'
                        : 'No unassigned users'}
                    </p>
                    <p className="mt-0.5 text-[11px] text-[#9CA3AF]">
                      {modalSearchTerm.trim()
                        ? 'Try a different search term.'
                        : 'All available students already have a tutor.'}
                    </p>
                  </div>
                ) : (
                  <ul className="divide-y divide-[#F3F4F6]">
                    {filteredUnassignedStudents.map((user) => (
                      <li
                        key={user.id}
                        className="flex items-center gap-2.5 py-2"
                      >
                        <input
                          type="checkbox"
                          checked={selectedStudents.has(user.id)}
                          onChange={() => toggleStudentSelection(user.id)}
                          className="h-3.5 w-3.5 shrink-0 rounded border-[#D1D5DB] text-[#1A2B4C] focus:ring-2 focus:ring-[#C59B4C]/20"
                        />
                        <span className="min-w-0 flex-1 truncate text-[12px] text-[#1A2B4C]">
                          {user.firstName} {user.lastName}
                        </span>
                        {selectedStudents.size === 0 && (
                          <button
                            onClick={() => handleAssignUser(user.id, selectedTeacher.id)}
                            disabled={assigning}
                            className="shrink-0 rounded-md border border-[#E5E7EB] bg-white px-2 py-0.5 text-[11px] font-medium text-[#1A2B4C] transition-colors hover:border-[#C59B4C] hover:bg-[#FBF7EE] disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Assign
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* MODAL FOOTER */}
              <div className="shrink-0 border-t border-[#F3F4F6] px-4 py-2.5">
                <button
                  onClick={closeAssignModal}
                  className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5 text-[12px] font-semibold text-[#4B5646] transition-colors hover:bg-[#F8F9FA] sm:w-auto"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}