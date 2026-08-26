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
  UserPlus,
  UserMinus,
  Trash2,
  X,
  MapPin,
  ChevronDown,
  ChevronUp,
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

const UI = {
  page: 'bg-[#f7f9fc]',
  card:
    'bg-white border border-slate-200 rounded-2xl shadow-[0_1px_3px_rgba(15,23,42,0.04)]',
  cardHover:
    'hover:border-slate-300 hover:shadow-[0_8px_24px_rgba(15,23,42,0.07)] transition-all duration-200',
  heading: 'text-[#1a365d]',
  text: 'text-slate-600',
  muted: 'text-slate-500',
  primaryButton:
    'bg-[#1a365d] hover:bg-[#153475] text-white transition-all duration-200',
  secondaryButton:
    'bg-[#eef2f8] hover:bg-[#e2e8f0] text-[#1a365d] transition-all duration-200',
};

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

  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());

  const [selectedStudentsForRemoval, setSelectedStudentsForRemoval] =
    useState<Set<string>>(new Set());

  const [individualRemoving, setIndividualRemoving] = useState<Set<string>>(new Set());

  const [unassignModeTeacherId, setUnassignModeTeacherId] = useState<string | null>(
    null
  );

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

  const allUsers = techCenterData?.users ?? [];

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
        (user) => user.role?.name === 'admin' || user.role?.name === 'super_admin'
      ),
    [filteredUsers]
  );

  const assignedStudents = useMemo(
    () => students.filter((student) => student.teacherId),
    [students]
  );

  const unassignedStudents = useMemo(
    () =>
      allUsers.filter(
        (user) =>
          user.role?.name !== 'teacher' &&
          user.role?.name !== 'admin' &&
          user.role?.name !== 'super_admin' &&
          !user.teacherId
      ),
    [allUsers]
  );

  const getTeacherAssignedStudents = (teacherId: string) =>
    students.filter((student) => student.teacherId === teacherId);

  const handleAssignStudent = async (studentId: string, teacherId: string) => {
    try {
      setAssigning(true);

      queryClient.setQueryData(
        ['admin-tech-center-users'],
        (oldData: TechCenterData | undefined) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            users: oldData.users.map((user) =>
              user.id === studentId
                ? {
                    ...user,
                    teacherId,
                  }
                : user
            ),
          };
        }
      );

      const response = await fetch(
        `/api/admin/tech-centers/users/${studentId}/assign`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            teacherId,
          }),
        }
      );

      if (!response.ok) {
        await refetch();
        throw new Error('Failed to assign student');
      }

      await refetch();
      setSuccess('Student assigned successfully');
      setTimeout(() => setSuccess(''), 3000);
      setShowAssignModal(false);
      setSelectedTeacher(null);
      setSelectedStudents(new Set());
    } catch (error) {
      console.error(error);
      setApiError('Failed to assign student');
      setTimeout(() => setApiError(''), 3000);
    } finally {
      setAssigning(false);
    }
  };

  const handleBulkAssign = async (studentIds: string[], teacherId: string) => {
    try {
      setAssigning(true);

      queryClient.setQueryData(
        ['admin-tech-center-users'],
        (oldData: TechCenterData | undefined) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            users: oldData.users.map((user) =>
              studentIds.includes(user.id)
                ? {
                    ...user,
                    teacherId,
                  }
                : user
            ),
          };
        }
      );

      const response = await fetch(
        '/api/admin/tech-centers/users/bulk-assign',
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            studentIds,
            teacherId,
          }),
        }
      );

      if (!response.ok) {
        await refetch();
        throw new Error('Failed to assign students');
      }

      await refetch();
      setSuccess('Students assigned successfully');
      setTimeout(() => setSuccess(''), 3000);
      setShowAssignModal(false);
      setSelectedTeacher(null);
      setSelectedStudents(new Set());
    } catch (error) {
      console.error(error);
      setApiError('Failed to assign students');
      setTimeout(() => setApiError(''), 3000);
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
    setSelectedStudents(new Set(unassignedStudents.map((student) => student.id)));
  };

  const clearSelection = () => {
    setSelectedStudents(new Set());
  };

  const toggleStudentRemovalSelection = (studentId: string) => {
    setSelectedStudentsForRemoval((previous) => {
      const updated = new Set(previous);

      if (updated.has(studentId)) {
        updated.delete(studentId);
      } else {
        updated.add(studentId);
      }

      return updated;
    });
  };

  const handleBulkUnassign = async (studentIds: string[], teacherId: string) => {
    try {
      setAssigning(true);

      queryClient.setQueryData(
        ['admin-tech-center-users'],
        (oldData: TechCenterData | undefined) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            users: oldData.users.map((user) =>
              studentIds.includes(user.id)
                ? {
                    ...user,
                    teacherId: null,
                  }
                : user
            ),
          };
        }
      );

      const response = await fetch(
        '/api/admin/tech-centers/users/bulk-unassign',
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            studentIds,
            teacherId,
          }),
        }
      );

      if (!response.ok) {
        await refetch();
        throw new Error('Failed to unassign students');
      }

      await refetch();
      setSuccess('Students unassigned successfully');
      setTimeout(() => setSuccess(''), 3000);
      setSelectedStudentsForRemoval(new Set());
    } catch (error) {
      console.error(error);
      setApiError('Failed to unassign students');
      setTimeout(() => setApiError(''), 3000);
    } finally {
      setAssigning(false);
    }
  };

  const handleRemoveStudent = async (studentId: string, teacherId: string) => {
    try {
      setIndividualRemoving((prev) => new Set(prev).add(studentId));

      queryClient.setQueryData(
        ['admin-tech-center-users'],
        (oldData: TechCenterData | undefined) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            users: oldData.users.map((user) =>
              user.id === studentId
                ? {
                    ...user,
                    teacherId: null,
                  }
                : user
            ),
          };
        }
      );

      const response = await fetch(
        `/api/admin/tech-centers/users/${studentId}/assign`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            teacherId,
          }),
        }
      );

      if (!response.ok) {
        await refetch();
        throw new Error('Failed to remove student');
      }

      await refetch();
      setSuccess('Student removed successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error(error);
      setApiError('Failed to remove student');
      setTimeout(() => setApiError(''), 3000);
    } finally {
      setIndividualRemoving((prev) => {
        const updated = new Set(prev);
        updated.delete(studentId);
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
    <div className={`${UI.page} min-h-screen`}>
      <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        {/* HEADER */}
        <div className="mb-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-start gap-3 sm:gap-4">
              <button
                onClick={() => router.back()}
                aria-label="Go back"
                className="
                  mt-0.5
                  flex h-10 w-10 shrink-0 items-center justify-center
                  rounded-xl
                  border border-slate-200
                  bg-white
                  text-[#1a365d]
                  shadow-sm
                  transition-all
                  hover:-translate-x-0.5
                  hover:border-slate-300
                  hover:bg-slate-50
                  focus:outline-none
                  focus:ring-2
                  focus:ring-[#3182ce]/30
                "
              >
                <ArrowLeft size={19} />
              </button>

              <div className="min-w-0">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <span
                    className="
                    inline-flex items-center gap-1.5
                    rounded-full
                    border border-[#1a365d]/10
                    bg-[#eef2f8]
                    px-2.5 py-1
                    text-[11px] font-semibold uppercase tracking-wide
                    text-[#1a365d]
                  "
                  >
                    <Users size={12} />
                    People Management
                  </span>
                </div>

                <h1
                  className="
                  text-2xl font-bold tracking-tight
                  text-[#1a365d]
                  sm:text-3xl
                "
                >
                  Manage Tutors & Students
                </h1>

                <p
                  className="
                  mt-1.5 max-w-2xl
                  text-sm leading-6
                  text-slate-500
                "
                >
                  Assign students, manage tutor relationships, and keep track of
                  learning support.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {techCenterData?.techCenter && (
                <div
                  className="
                  inline-flex items-center gap-2
                  rounded-xl
                  border border-slate-200
                  bg-white
                  px-3.5 py-2.5
                  text-sm
                  text-slate-600
                  shadow-sm
                "
                >
                  <MapPin size={16} className="text-[#3182ce]" />
                  <span className="font-medium text-[#1a365d]">
                    {techCenterData.techCenter.name}
                  </span>
                  <span className="text-slate-400">
                    {techCenterData.techCenter.code}
                  </span>
                </div>
              )}
            </div>
          </div>

          {(apiError || success) && (
            <div className="mt-5">
              {apiError && (
                <div
                  className="
                  flex items-center gap-3
                  rounded-xl
                  border border-red-200
                  bg-red-50
                  px-4 py-3
                  text-sm text-red-700
                "
                >
                  <XCircle size={18} />
                  <span>{apiError}</span>
                </div>
              )}

              {success && (
                <div
                  className="
                  flex items-center gap-3
                  rounded-xl
                  border border-emerald-200
                  bg-emerald-50
                  px-4 py-3
                  text-sm text-emerald-700
                "
                >
                  <CheckCircle size={18} />
                  <span>{success}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {isLoading ? (
          <div
            className="
            flex min-h-[420px]
            items-center justify-center
            rounded-2xl
            border border-slate-200
            bg-white
          "
          >
            <div className="flex flex-col items-center gap-3">
              <div
                className="
                flex h-12 w-12 items-center justify-center
                rounded-full bg-[#eef2f8]
              "
              >
                <Loader2 className="animate-spin text-[#3182ce]" size={23} />
              </div>

              <p className="text-sm font-medium text-slate-500">Loading users...</p>
            </div>
          </div>
        ) : queryError ? (
          <div
            className="
            rounded-2xl
            border border-red-200
            bg-white
            p-8
            text-center
          "
          >
            <div
              className="
              mx-auto mb-4
              flex h-12 w-12 items-center justify-center
              rounded-full bg-red-50
            "
            >
              <XCircle className="text-red-600" size={22} />
            </div>

            <h2 className="font-semibold text-[#1a365d]">Unable to load users</h2>

            <p className="mt-1 text-sm text-slate-500">
              Something went wrong while loading the people in this tech center.
            </p>

            <button
              onClick={() => refetch()}
              className="
                mt-5 rounded-xl
                bg-[#1a365d]
                px-4 py-2.5
                text-sm font-medium text-white
                transition hover:bg-[#153475]
              "
            >
              Try again
            </button>
          </div>
        ) : (
          <div className="space-y-7">
            {/* STATISTICS */}
            <section
              className="
              grid grid-cols-2 gap-3
              md:grid-cols-3
              xl:grid-cols-6
            "
            >
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
                    className={`
                      ${UI.card}
                      group
                      p-4 sm:p-5
                      ${UI.cardHover}
                    `}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div
                        className="
                        flex h-10 w-10 shrink-0
                        items-center justify-center
                        rounded-xl
                        bg-[#eef2f8]
                        text-[#1a365d]
                        transition-transform duration-200
                        group-hover:scale-105
                      "
                      >
                        <Icon size={19} />
                      </div>

                      <span
                        className="
                        text-[11px] font-semibold uppercase tracking-wide
                        text-slate-400
                      "
                      >
                        {item.label}
                      </span>
                    </div>

                    <p
                      className="
                      mt-4
                      text-2xl font-bold tracking-tight
                      text-[#1a365d]
                      sm:text-3xl
                    "
                    >
                      {item.value}
                    </p>
                  </div>
                );
              })}
            </section>

            {/* SEARCH */}
            <section className={`${UI.card} overflow-hidden`}>
              <div
                className="
                flex flex-col gap-4
                p-4 sm:p-5
                lg:flex-row lg:items-center lg:justify-between
              "
              >
                <div className="min-w-0">
                  <h2 className="font-semibold text-[#1a365d]">Find a person</h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Search by name or email address.
                  </p>
                </div>

                <div className="w-full lg:max-w-xl">
                  <div className="relative">
                    <Search
                      className="
                        pointer-events-none
                        absolute left-4 top-1/2
                        -translate-y-1/2
                        text-slate-400
                      "
                      size={18}
                    />

                    <input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search users by name or email..."
                      className="
                        w-full
                        rounded-xl
                        border border-slate-200
                        bg-slate-50
                        py-3 pl-11 pr-10
                        text-sm text-slate-800
                        outline-none
                        transition-all
                        placeholder:text-slate-400
                        focus:border-[#3182ce]
                        focus:bg-white
                        focus:ring-4
                        focus:ring-[#3182ce]/10
                      "
                    />

                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        aria-label="Clear search"
                        className="
                          absolute right-3 top-1/2
                          -translate-y-1/2
                          rounded-lg p-1.5
                          text-slate-400
                          transition
                          hover:bg-slate-100
                          hover:text-slate-600
                        "
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div
                className="
                border-t border-slate-100
                bg-slate-50/70
                px-4 py-3
                sm:px-5
              "
              >
                <p className="text-xs text-slate-500">
                  Showing{' '}
                  <span className="font-semibold text-slate-700">
                    {filteredUsers.length}
                  </span>{' '}
                  of{' '}
                  <span className="font-semibold text-slate-700">
                    {allUsers.length}
                  </span>{' '}
                  users
                  {searchTerm && (
                    <>
                      {' '}
                      matching{' '}
                      <span className="font-medium text-[#1a365d]">
                        “{searchTerm}”
                      </span>
                    </>
                  )}
                </p>
              </div>
            </section>

            {/* TUTORS - IMPROVED CARDS */}
            <section className={`${UI.card} overflow-hidden`}>
              <div
                className="
                flex flex-col gap-4
                border-b border-slate-100
                p-5 sm:p-6
                md:flex-row md:items-center md:justify-between
              "
              >
                <div className="flex items-center gap-3">
                  <div
                    className="
                    flex h-11 w-11 shrink-0
                    items-center justify-center
                    rounded-xl
                    bg-[#eef2f8]
                    text-[#1a365d]
                  "
                  >
                    <GraduationCap size={22} />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h2
                        className="
                        text-lg font-bold
                        text-[#1a365d]
                        sm:text-xl
                      "
                      >
                        Tutors
                      </h2>

                      <span
                        className="
                        rounded-full
                        bg-slate-100
                        px-2 py-0.5
                        text-[11px] font-semibold
                        text-slate-500
                      "
                      >
                        {teachers.length}
                      </span>
                    </div>

                    <p className="mt-0.5 text-sm text-slate-500">
                      Manage assigned students and tutor relationships.
                    </p>
                  </div>
                </div>

                <div
                  className="
                  inline-flex w-fit items-center gap-2
                  rounded-xl
                  border border-slate-200
                  bg-slate-50
                  px-3 py-2
                  text-xs font-medium
                  text-slate-600
                "
                >
                  <Users size={15} />
                  {assignedStudents.length} students assigned
                </div>
              </div>

              <div className="p-5 sm:p-6">
                {teachers.length === 0 ? (
                  <div
                    className="
                    rounded-xl
                    border border-dashed border-slate-200
                    bg-slate-50/60
                    px-5 py-14
                    text-center
                  "
                  >
                    <div
                      className="
                      mx-auto mb-4
                      flex h-12 w-12 items-center justify-center
                      rounded-full bg-white
                      border border-slate-200
                    "
                    >
                      <GraduationCap size={21} className="text-slate-400" />
                    </div>

                    <p className="font-medium text-slate-600">No tutors found</p>

                    <p className="mt-1 text-sm text-slate-400">
                      Try changing your search.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-6 lg:grid-cols-2">
                    {teachers.map((teacher) => {
                      const teacherStudents = getTeacherAssignedStudents(teacher.id);
                      const isUnassigning = unassignModeTeacherId === teacher.id;

                      return (
                        <div
                          key={teacher.id}
                          className={`
                            group
                            overflow-hidden
                            rounded-2xl
                            border-2
                            transition-all duration-200
                            hover:shadow-[0_8px_30px_rgba(15,23,42,0.12)]
                            ${
                              isUnassigning
                                ? 'border-amber-400 bg-amber-50/30 ring-2 ring-amber-200'
                                : 'border-slate-200 bg-white hover:border-[#1a365d]/20'
                            }
                          `}
                        >
                          {/* TUTOR HEADER - HIGHLIGHTED */}
                          <div className={`
                            border-b p-5
                            ${isUnassigning ? 'border-amber-200 bg-amber-50/50' : 'border-slate-100 bg-gradient-to-r from-[#f8faff] to-white'}
                          `}>
                            <div className="flex items-start gap-4">
                              {/* Tutor Avatar - Larger */}
                              <div className="relative">
                                {teacher.profileImageUrl ? (
                                  <Image
                                    src={teacher.profileImageUrl}
                                    alt={`${teacher.firstName} ${teacher.lastName}`}
                                    width={64}
                                    height={64}
                                    unoptimized
                                    className="
                                      h-16 w-16 shrink-0
                                      rounded-full
                                      border-2 border-[#1a365d]/10
                                      object-cover
                                      shadow-sm
                                    "
                                  />
                                ) : (
                                  <div
                                    className="
                                    flex h-16 w-16 shrink-0
                                    items-center justify-center
                                    rounded-full
                                    bg-gradient-to-br from-[#1a365d] to-[#2a4a7d]
                                    text-lg font-bold
                                    text-white
                                    shadow-sm
                                  "
                                  >
                                    {getInitials(teacher.firstName, teacher.lastName)}
                                  </div>
                                )}
                                
                                {/* Status Badge on Avatar */}
                                <div className="absolute -bottom-0.5 -right-0.5">
                                  <span className={`
                                    flex h-5 w-5 items-center justify-center
                                    rounded-full border-2 border-white
                                    ${teacher.isActive ? 'bg-emerald-500' : 'bg-red-500'}
                                  `}>
                                    {teacher.isActive ? (
                                      <CheckCircle size={10} className="text-white" />
                                    ) : (
                                      <XCircle size={10} className="text-white" />
                                    )}
                                  </span>
                                </div>
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <h3
                                      className="
                                      text-lg font-bold
                                      text-[#1a365d]
                                      group-hover:text-[#2a4a7d]
                                      transition-colors
                                    "
                                    >
                                      {teacher.firstName} {teacher.lastName}
                                    </h3>
                                    
                                    <div className="mt-1 flex items-center gap-2">
                                      <span className="inline-flex items-center gap-1 rounded-full bg-[#1a365d]/10 px-2.5 py-0.5 text-xs font-medium text-[#1a365d]">
                                        <GraduationCap size={12} />
                                        Tutor
                                      </span>
                                      <span className="text-xs text-slate-400">
                                        ID: {teacher.id.slice(0, 8)}
                                      </span>
                                    </div>
                                  </div>

                                  <span className={`
                                    inline-flex w-fit shrink-0
                                    items-center gap-1.5
                                    rounded-full
                                    border
                                    px-3 py-1
                                    text-xs font-semibold
                                    ${
                                      teacher.isActive
                                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                        : 'border-red-200 bg-red-50 text-red-700'
                                    }
                                  `}>
                                    {teacher.isActive ? (
                                      <CheckCircle size={12} />
                                    ) : (
                                      <XCircle size={12} />
                                    )}
                                    {teacher.isActive ? 'Active' : 'Inactive'}
                                  </span>
                                </div>

                                {/* Contact Info - Clean and Scannable */}
                                <div className="mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                                  <div className="flex min-w-0 items-center gap-2 text-sm text-slate-600">
                                    <Mail size={15} className="shrink-0 text-slate-400" />
                                    <span className="truncate text-xs">{teacher.email}</span>
                                  </div>

                                  {teacher.phoneNumber && (
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                      <Phone size={15} className="shrink-0 text-slate-400" />
                                      <span className="text-xs">{teacher.phoneNumber}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Student Stats - Prominent */}
                            <div className="mt-4 flex items-center gap-4 rounded-xl bg-white/80 px-4 py-2.5 shadow-sm border border-slate-100">
                              <div className="flex items-center gap-2">
                                <BookOpen size={16} className="text-[#1a365d]" />
                                <span className="text-sm font-medium text-[#1a365d]">
                                  Assigned Students
                                </span>
                              </div>
                              <div className="flex items-center gap-3 ml-auto">
                                <span className="text-2xl font-bold text-[#1a365d]">
                                  {teacherStudents.length}
                                </span>
                                {teacherStudents.length > 0 && (
                                  <span className="text-xs text-slate-400">
                                    {teacherStudents.length === 1 ? 'student' : 'students'}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* STUDENTS LIST */}
                          <div className="p-5">
                            {teacherStudents.length > 0 ? (
                              <div>
                                {isUnassigning && (
                                  <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3.5">
                                    <div className="flex items-start gap-3">
                                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-amber-700">
                                        <Trash2 size={15} />
                                      </div>
                                      <div>
                                        <p className="text-sm font-semibold text-amber-900">
                                          Unassign mode
                                        </p>
                                        <p className="mt-0.5 text-xs leading-5 text-amber-800">
                                          Select the students you want to remove from this tutor.
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {selectedStudentsForRemoval.size > 0 && isUnassigning && (
                                  <button
                                    onClick={() =>
                                      handleBulkUnassign(
                                        Array.from(selectedStudentsForRemoval),
                                        teacher.id
                                      )
                                    }
                                    disabled={assigning}
                                    className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    {assigning && (
                                      <Loader2 size={16} className="animate-spin" />
                                    )}
                                    Remove {selectedStudentsForRemoval.size} Students
                                  </button>
                                )}

                                {/* Student List Items - Clean and Scannable */}
                                <div className="space-y-2">
                                  {teacherStudents.map((student) => (
                                    <div
                                      key={student.id}
                                      className="
                                        group/student
                                        flex items-center gap-3
                                        rounded-lg
                                        border border-slate-200
                                        bg-white
                                        px-3 py-2.5
                                        transition-all
                                        hover:border-[#1a365d]/20
                                        hover:bg-slate-50/70
                                        hover:shadow-sm
                                      "
                                    >
                                      {isUnassigning && canManageAssignments && (
                                        <input
                                          type="checkbox"
                                          checked={selectedStudentsForRemoval.has(student.id)}
                                          onChange={() =>
                                            toggleStudentRemovalSelection(student.id)
                                          }
                                          className="h-4 w-4 shrink-0 rounded border-slate-300 text-[#1a365d] focus:ring-[#1a365d]"
                                        />
                                      )}

                                      <div className="flex items-center gap-3 flex-1 min-w-0">
                                        {student.profileImageUrl ? (
                                          <Image
                                            src={student.profileImageUrl}
                                            alt={`${student.firstName} ${student.lastName}`}
                                            width={36}
                                            height={36}
                                            unoptimized
                                            className="h-9 w-9 shrink-0 rounded-full border border-slate-200 object-cover"
                                          />
                                        ) : (
                                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#eef2f8] text-xs font-bold text-[#1a365d]">
                                            {getInitials(student.firstName, student.lastName)}
                                          </div>
                                        )}

                                        <div className="min-w-0 flex-1">
                                          <p className="truncate text-sm font-semibold text-[#1a365d]">
                                            {student.firstName} {student.lastName}
                                          </p>
                                          <p className="truncate text-xs text-slate-500">
                                            {student.email}
                                          </p>
                                        </div>
                                      </div>

                                      <div className="flex shrink-0 items-center gap-1.5">
                                        <Link
                                          href={`/dashboard/students/${student.id}`}
                                          className="hidden rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-[#1a365d] transition hover:border-[#3182ce]/30 hover:bg-[#eef2f8] sm:inline-flex"
                                        >
                                          View
                                        </Link>

                                        {canManageAssignments && !isUnassigning && (
                                          <button
                                            onClick={() =>
                                              handleRemoveStudent(student.id, teacher.id)
                                            }
                                            disabled={individualRemoving.has(student.id)}
                                            aria-label={`Remove ${student.firstName} ${student.lastName}`}
                                            title="Remove student"
                                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-100 bg-red-50 text-red-600 transition hover:border-red-200 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                                          >
                                            {individualRemoving.has(student.id) ? (
                                              <Loader2 size={14} className="animate-spin" />
                                            ) : (
                                              <Trash2 size={14} />
                                            )}
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-8 text-center">
                                <BookOpen size={24} className="mx-auto mb-2 text-slate-400" />
                                <p className="text-sm font-medium text-slate-600">
                                  No students assigned
                                </p>
                                <p className="mt-1 text-xs text-slate-400">
                                  This tutor is ready for student assignments.
                                </p>
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="mt-4 space-y-2">
                              {canManageAssignments && (
                                <button
                                  onClick={() => openAssignModal(teacher)}
                                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1a365d] px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#153475] hover:shadow-md focus:outline-none focus:ring-4 focus:ring-[#1a365d]/10"
                                >
                                  <UserPlus size={17} />
                                  Assign Students
                                </button>
                              )}

                              {teacherStudents.length > 0 && canManageAssignments && (
                                <button
                                  onClick={() => {
                                    if (unassignModeTeacherId === teacher.id) {
                                      setUnassignModeTeacherId(null);
                                      setSelectedStudentsForRemoval(new Set());
                                    } else {
                                      setUnassignModeTeacherId(teacher.id);
                                      setSelectedStudentsForRemoval(new Set());
                                    }
                                  }}
                                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                                >
                                  <Trash2 size={14} />
                                  {isUnassigning ? 'Cancel Unassign' : 'Unassign Students'}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
          </div>
        )}

        {/* ASSIGN MODAL */}
        {showAssignModal && selectedTeacher && (
          <div
            className="
              fixed inset-0 z-50
              flex items-center justify-center
              bg-slate-950/40
              p-3 sm:p-5
              backdrop-blur-[2px]
            "
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                closeAssignModal();
              }
            }}
          >
            <div
              className="
              flex
              max-h-[92vh]
              w-full max-w-3xl
              flex-col
              overflow-hidden
              rounded-2xl
              border border-slate-200
              bg-white
              shadow-[0_24px_70px_rgba(15,23,42,0.20)]
            "
            >
              {/* MODAL HEADER */}
              <div
                className="
                shrink-0
                border-b border-slate-100
                bg-white
                p-5 sm:p-6
              "
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    {selectedTeacher.profileImageUrl ? (
                      <Image
                        src={selectedTeacher.profileImageUrl}
                        alt={`${selectedTeacher.firstName} ${selectedTeacher.lastName}`}
                        width={46}
                        height={46}
                        unoptimized
                        className="
                          h-11 w-11 shrink-0
                          rounded-full
                          border border-slate-200
                          object-cover
                        "
                      />
                    ) : (
                      <div
                        className="
                        flex h-11 w-11 shrink-0
                        items-center justify-center
                        rounded-full
                        bg-[#eef2f8]
                        text-xs font-bold
                        text-[#1a365d]
                      "
                      >
                        {getInitials(selectedTeacher.firstName, selectedTeacher.lastName)}
                      </div>
                    )}

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-bold text-[#1a365d]">
                          Assign Students
                        </h3>

                        <span className="rounded-full bg-[#eef2f8] px-2 py-0.5 text-[10px] font-semibold text-[#1a365d]">
                          Tutor
                        </span>
                      </div>

                      <p className="mt-0.5 truncate text-sm text-slate-500">
                        {selectedTeacher.firstName} {selectedTeacher.lastName}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={closeAssignModal}
                    aria-label="Close assignment modal"
                    className="
                      flex h-9 w-9 shrink-0
                      items-center justify-center
                      rounded-xl
                      border border-slate-200
                      text-slate-500
                      transition
                      hover:bg-slate-50
                      hover:text-slate-700
                    "
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* MODAL CONTROLS */}
              <div
                className="
                shrink-0
                border-b border-slate-100
                bg-slate-50/70
                p-4 sm:p-5
              "
              >
                <div
                  className="
                  flex flex-col gap-3
                  sm:flex-row sm:items-center sm:justify-between
                "
                >
                  <div>
                    <p className="text-sm font-semibold text-[#1a365d]">
                      Available students
                    </p>

                    <p className="mt-0.5 text-xs text-slate-500">
                      {unassignedStudents.length} students currently available
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={selectAllStudents}
                      className="
                        rounded-lg
                        border border-slate-200
                        bg-white
                        px-3 py-2
                        text-xs font-semibold
                        text-[#1a365d]
                        transition
                        hover:border-slate-300
                        hover:bg-slate-50
                      "
                    >
                      Select all
                    </button>

                    <button
                      onClick={clearSelection}
                      className="
                        rounded-lg
                        border border-slate-200
                        bg-white
                        px-3 py-2
                        text-xs font-semibold
                        text-slate-500
                        transition
                        hover:border-slate-300
                        hover:bg-slate-50
                      "
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {selectedStudents.size > 0 && (
                  <button
                    onClick={() =>
                      handleBulkAssign(Array.from(selectedStudents), selectedTeacher.id)
                    }
                    disabled={assigning}
                    className="
                      mt-4 flex w-full
                      items-center justify-center gap-2
                      rounded-xl
                      bg-[#1a365d]
                      px-4 py-3
                      text-sm font-semibold
                      text-white
                      shadow-sm
                      transition
                      hover:bg-[#153475]
                      disabled:cursor-not-allowed
                      disabled:opacity-50
                    "
                  >
                    {assigning && (
                      <Loader2 size={16} className="animate-spin" />
                    )}

                    Assign {selectedStudents.size} Students
                  </button>
                )}
              </div>

              {/* STUDENT LIST */}
              <div
                className="
                min-h-0
                flex-1
                overflow-y-auto
                p-4 sm:p-5
              "
              >
                {unassignedStudents.length === 0 ? (
                  <div
                    className="
                    flex min-h-[280px]
                    items-center justify-center
                    rounded-xl
                    border border-dashed border-slate-200
                    bg-slate-50/60
                    p-8 text-center
                  "
                  >
                    <div>
                      <div
                        className="
                        mx-auto mb-3
                        flex h-11 w-11
                        items-center justify-center
                        rounded-full
                        bg-white
                        border border-slate-200
                      "
                      >
                        <CheckCircle size={20} className="text-emerald-600" />
                      </div>

                      <p className="font-semibold text-slate-700">
                        No unassigned students
                      </p>

                      <p className="mt-1 text-sm text-slate-400">
                        All available students already have a tutor.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {unassignedStudents.map((student) => (
                      <div
                        key={student.id}
                        className={`
                          flex items-center gap-3
                          rounded-xl
                          border
                          p-3
                          transition-all
                          ${
                            selectedStudents.has(student.id)
                              ? 'border-[#3182ce]/30 bg-[#eef5fb]'
                              : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                          }
                        `}
                      >
                        <input
                          type="checkbox"
                          checked={selectedStudents.has(student.id)}
                          onChange={() => toggleStudentSelection(student.id)}
                          className="
                              h-4.5 w-4.5 shrink-0
                              rounded
                              border-slate-300
                              text-[#1a365d]
                              focus:ring-[#1a365d]
                            "
                        />

                        {student.profileImageUrl ? (
                          <Image
                            src={student.profileImageUrl}
                            alt={`${student.firstName} ${student.lastName}`}
                            width={42}
                            height={42}
                            unoptimized
                            className="
                                h-10 w-10 shrink-0
                                rounded-full
                                border border-slate-200
                                object-cover
                              "
                          />
                        ) : (
                          <div
                            className="
                              flex h-10 w-10 shrink-0
                              items-center justify-center
                              rounded-full
                              bg-[#eef2f8]
                              text-xs font-bold
                              text-[#1a365d]
                            "
                          >
                            {getInitials(student.firstName, student.lastName)}
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <p
                            className="
                              truncate
                              text-sm font-semibold
                              text-[#1a365d]
                            "
                          >
                            {student.firstName} {student.lastName}
                          </p>

                          <p className="truncate text-xs text-slate-500">
                            {student.email}
                          </p>

                          {(student.city || student.country) && (
                            <p
                              className="
                                mt-0.5
                                flex items-center gap-1
                                truncate
                                text-[11px] text-slate-400
                              "
                            >
                              <MapPin size={11} />

                              {[student.city, student.country].filter(Boolean).join(', ')}
                            </p>
                          )}
                        </div>

                        {selectedStudents.size === 0 && (
                          <button
                            onClick={() =>
                              handleAssignStudent(student.id, selectedTeacher.id)
                            }
                            disabled={assigning}
                            className="
                                flex shrink-0
                                items-center gap-1.5
                                rounded-lg
                                bg-[#eef2f8]
                                px-3 py-2
                                text-xs font-semibold
                                text-[#1a365d]
                                transition
                                hover:bg-[#e2e8f0]
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                              "
                          >
                            {assigning && (
                              <Loader2 size={14} className="animate-spin" />
                            )}

                            Assign
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* MODAL FOOTER */}
              <div
                className="
                shrink-0
                border-t border-slate-100
                bg-white
                p-4
              "
              >
                <div
                  className="
                  flex flex-col-reverse gap-2
                  sm:flex-row sm:items-center sm:justify-between
                "
                >
                  <p className="text-xs text-slate-400">
                    {selectedStudents.size > 0
                      ? `${selectedStudents.size} student${
                          selectedStudents.size === 1 ? '' : 's'
                        } selected`
                      : 'Select students individually or use Select all'}
                  </p>

                  <button
                    onClick={closeAssignModal}
                    className="
                      rounded-xl
                      border border-slate-200
                      bg-white
                      px-4 py-2.5
                      text-sm font-semibold
                      text-slate-600
                      transition
                      hover:bg-slate-50
                    "
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