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
  Eye,
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
  page: 'bg-[#f8fafc]',
  card:
    'bg-white border border-slate-200 rounded-2xl shadow-sm',
  cardHover:
    'hover:border-[#3182ce]/40 hover:shadow-md transition-all duration-200',
  heading: 'text-[#1a365d]',
  text: 'text-slate-600',
  muted: 'text-slate-500',
  primaryButton:
    'bg-[#1a365d] hover:bg-[#153475] text-white transition-colors',
  secondaryButton:
    'bg-[#eef2f8] hover:bg-[#e2e8f0] text-[#1a365d] transition-colors',
};

export default function ManageTeachersPage() {
  const router = useRouter();

  const { isAdmin, isSuperAdmin } = useAuth();

  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');

  const [selectedTeacher, setSelectedTeacher] =
    useState<User | null>(null);

  const [showAssignModal, setShowAssignModal] =
    useState(false);

  const [assigning, setAssigning] =
    useState(false);
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState('');

  const [selectedStudents, setSelectedStudents] =
    useState<Set<string>>(new Set());

  const [selectedStudentsForRemoval, setSelectedStudentsForRemoval] =
    useState<Set<string>>(new Set());

  const [individualRemoving, setIndividualRemoving] =
    useState<Set<string>>(new Set());

  const [unassignModeTeacherId, setUnassignModeTeacherId] =
    useState<string | null>(null);

  const canManageAssignments =
    isAdmin() || isSuperAdmin();


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

    return allUsers.filter((user) =>
      `${user.firstName} ${user.lastName}`
        .toLowerCase()
        .includes(query) ||
      user.email.toLowerCase().includes(query)
    );
  }, [allUsers, searchTerm]);


  const teachers = useMemo(
    () =>
      filteredUsers.filter(
        (user) => user.role?.name === 'teacher'
      ),
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


  const assignedStudents = useMemo(
    () =>
      students.filter(
        (student) => student.teacherId
      ),
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


  const getTeacherAssignedStudents = (
    teacherId: string
  ) =>
    students.filter(
      (student) =>
        student.teacherId === teacherId
    );


  const handleAssignStudent = async (
    studentId: string,
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
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            teacherId,
          }),
        }
      );


      if (!response.ok) {
        await refetch();
        throw new Error(
          'Failed to assign student'
        );
      }


      await refetch();
      setSuccess('Student assigned successfully');
      setTimeout(() => setSuccess(''), 3000);
      setShowAssignModal(false);
      setSelectedTeacher(null);

    } catch (error) {
      console.error(error);
      setApiError('Failed to assign student');
      setTimeout(() => setApiError(''), 3000);
    } finally {
      setAssigning(false);
    }
  };


  const handleBulkAssign = async (
    studentIds: string[],
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
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            studentIds,
            teacherId,
          }),
        }
      );


      if (!response.ok) {
        await refetch();
        throw new Error(
          'Failed to assign students'
        );
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
    setSelectedStudents(
      new Set(
        unassignedStudents.map(
          (student) => student.id
        )
      )
    );
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


  const handleBulkUnassign = async (
    studentIds: string[],
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
        throw new Error(
          'Failed to unassign students'
        );
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


  const handleRemoveStudent = async (
    studentId: string,
    teacherId: string
  ) => {
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
        throw new Error(
          'Failed to remove student'
        );
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


  return (
    <div className={`${UI.page} min-h-screen p-4 md:p-8`}>

      {/* PAGE HEADER */}
      <div className="flex items-center gap-4 mb-8">

        <button
          onClick={() => router.back()}
          className="
            w-10 h-10 rounded-xl
            bg-white border border-slate-200
            flex items-center justify-center
            text-[#1a365d]
            hover:bg-slate-50
            transition
          "
        >
          <ArrowLeft size={20}/>
        </button>


        <div className="flex-1">
          <h1 className="
            text-2xl md:text-3xl
            font-bold
            text-[#1a365d]
          ">
            Manage Teachers & Students
          </h1>

          <p className="
            text-slate-500
            text-sm
            mt-1
          ">
            Assign students, manage tutors and monitor learning relationships.
          </p>
        </div>

        {apiError && (
          <div className="px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {apiError}
          </div>
        )}

        {success && (
          <div className="px-4 py-2 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
            {success}
          </div>
        )}

      </div>



      {isLoading ? (

        <div className="
          flex justify-center items-center
          py-20
        ">
          <Loader2
            className="
              animate-spin
              text-[#3182ce]
            "
            size={40}
          />
        </div>


      ) : queryError ? (

        <div className="
          bg-white
          border border-red-200
          rounded-2xl
          p-8
          text-center
        ">
          <p className="text-red-600">
            Failed to load users
          </p>
        </div>


      ) : (

        <div className="space-y-6">



          {/* STATISTICS */}

          <div className="
            grid
            grid-cols-2
            md:grid-cols-3
            lg:grid-cols-6
            gap-4
          ">


            {[

              {
                label:'Total Users',
                value:allUsers.length,
                icon:Users
              },
              {
                label:'Teachers',
                value:teachers.length,
                icon:GraduationCap
              },
              {
                label:'Admins',
                value:admins.length,
                icon:Users
              },
              {
                label:'Students',
                value:students.length,
                icon:Users
              },
              {
                label:'Assigned',
                value:assignedStudents.length,
                icon:UserPlus
              },
              {
                label:'Available',
                value:unassignedStudents.length,
                icon:UserMinus
              },
            ].map((item)=>{

              const Icon=item.icon;

              return (

                <div
                  key={item.label}
                  className={`
                    ${UI.card}
                    p-5
                    ${UI.cardHover}
                  `}
                >

                  <div className="
                    flex
                    items-center
                    gap-3
                    mb-3
                  ">

                    <div className="
                      w-10 h-10
                      rounded-xl
                      bg-[#eef2f8]
                      flex
                      items-center
                      justify-center
                    ">

                      <Icon
                        size={20}
                        className="text-[#1a365d]"
                      />

                    </div>


                    <span className="
                      text-sm
                      text-slate-500
                    ">
                      {item.label}
                    </span>

                  </div>


                  <p className="
                    text-3xl
                    font-bold
                    text-[#1a365d]
                  ">
                    {item.value}
                  </p>


                </div>

              );

            })}


          </div>




          {/* SEARCH */}

          <div className={`${UI.card} p-5`}>

            <div className="
              relative
            ">

              <Search
                className="
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2
                  text-slate-400
                "
                size={20}
              />


              <input
                value={searchTerm}
                onChange={(e)=>setSearchTerm(e.target.value)}
                placeholder="
                  Search users by name or email...
                "
                className="
                  w-full
                  pl-12
                  pr-4
                  py-3
                  rounded-xl
                  border
                  border-slate-200
                  bg-slate-50
                  text-slate-800
                  outline-none
                  focus:border-[#3182ce]
                  focus:bg-white
                "
              />

            </div>


            <p className="
              text-xs
              text-slate-500
              mt-3
            ">
              Showing {filteredUsers.length} of {allUsers.length} users
            </p>

          </div>

                    {/* TEACHERS */}

          <section className={`${UI.card} p-6`}>

            <div className="
              flex
              items-center
              gap-3
              mb-6
            ">

              <div className="
                w-12 h-12
                rounded-xl
                bg-[#eef2f8]
                flex
                items-center
                justify-center
              ">
                <GraduationCap
                  className="text-[#1a365d]"
                  size={24}
                />
              </div>

              <div>
                <h2 className="
                  text-xl
                  font-bold
                  text-[#1a365d]
                ">
                  Teachers
                </h2>

                <p className="
                  text-sm
                  text-slate-500
                ">
                  Manage assigned students and tutor relationships.
                </p>
              </div>

            </div>



            {teachers.length === 0 ? (

              <div className="
                py-12
                text-center
                text-slate-500
              ">
                No teachers found
              </div>

            ) : (

              <div className="
                grid
                md:grid-cols-2
                xl:grid-cols-2
                gap-5
              ">

                {teachers.map((teacher)=>{

                  const teacherStudents =
                    getTeacherAssignedStudents(
                      teacher.id
                    );


                  return (

                    <div
                      key={teacher.id}
                      className={`
                        ${UI.card}
                        p-5
                        ${UI.cardHover}
                      `}
                    >


                      <div className="
                        flex
                        items-start
                        gap-4
                      ">

                        {teacher.profileImageUrl ? (

                          <Image
                            src={teacher.profileImageUrl}
                            alt={`${teacher.firstName} ${teacher.lastName}`}
                            width={56}
                            height={56}
                            unoptimized
                            className="
                              w-14
                              h-14
                              rounded-full
                              object-cover
                              border
                              border-slate-200
                            "
                          />

                        ) : (

                          <div className="
                            w-14
                            h-14
                            rounded-full
                            bg-[#eef2f8]
                            flex
                            items-center
                            justify-center
                            font-bold
                            text-[#1a365d]
                          ">
                            {teacher.firstName[0]}
                            {teacher.lastName[0]}
                          </div>

                        )}



                        <div className="flex-1">

                          <h3 className="
                            font-semibold
                            text-[#1a365d]
                          ">
                            {teacher.firstName}{' '}
                            {teacher.lastName}
                          </h3>


                          <span className={`
                            inline-flex
                            items-center
                            gap-1
                            text-xs
                            mt-1
                            ${
                              teacher.isActive
                              ? 'text-green-700'
                              : 'text-red-600'
                            }
                          `}>

                            {
                              teacher.isActive
                              ?
                              <CheckCircle size={13}/>
                              :
                              <XCircle size={13}/>
                            }

                            {
                              teacher.isActive
                              ?
                              'Active'
                              :
                              'Inactive'
                            }

                          </span>


                        </div>


                      </div>




                      <div className="
                        mt-5
                        space-y-2
                        text-sm
                      ">

                        <div className="
                          flex
                          gap-2
                          items-center
                          text-slate-600
                        ">
                          <Mail size={15}/>
                          {teacher.email}
                        </div>


                        {teacher.phoneNumber && (

                          <div className="
                            flex
                            gap-2
                            items-center
                            text-slate-600
                          ">
                            <Phone size={15}/>
                            {teacher.phoneNumber}
                          </div>

                        )}

                      </div>




                      <div className="
                        mt-5
                        pt-4
                        border-t
                        border-slate-200
                        flex
                        justify-between
                        items-center
                      ">

                        <div className="
                          flex
                          items-center
                          gap-2
                          text-sm
                          text-[#1a365d]
                          font-medium
                        ">
                          <BookOpen size={16}/>
                          {teacherStudents.length} students
                        </div>


                      </div>





                      {teacherStudents.length > 0 && (

                        <div className="
                          mt-4
                          space-y-2
                        ">

                          {unassignModeTeacherId === teacher.id && (
                            <div className="
                              mb-3
                              p-3
                              bg-amber-50
                              border
                              border-amber-200
                              rounded-lg
                              text-sm
                              text-amber-800
                            ">
                              <p className="font-medium mb-1">Unassign Mode</p>
                              <p className="text-xs">Mark all the students you want to remove below, then click the remove button.</p>
                            </div>
                          )}

                          {selectedStudentsForRemoval.size > 0 && unassignModeTeacherId === teacher.id && (
                            <button
                              onClick={() =>
                                handleBulkUnassign(
                                  Array.from(selectedStudentsForRemoval),
                                  teacher.id
                                )
                              }
                              disabled={assigning}
                              className="
                                w-full
                                mb-3
                                py-2
                                rounded-lg
                                bg-red-600
                                text-white
                                disabled:opacity-50
                                disabled:cursor-not-allowed
                                flex
                                items-center
                                justify-center
                                gap-2
                              "
                            >
                              {assigning && <Loader2 size={16} className="animate-spin" />}
                              Remove {selectedStudentsForRemoval.size} Students
                            </button>
                          )}

                          {teacherStudents.map((student)=>(

                            <div
                              key={student.id}
                              className="
                                flex
                                items-center
                                justify-between
                                p-3
                                rounded-xl
                                bg-slate-50
                                border
                                border-slate-200
                              "
                            >

                              <div className="flex items-center gap-3">

                                {unassignModeTeacherId === teacher.id && canManageAssignments && (
                                  <input
                                    type="checkbox"
                                    checked={selectedStudentsForRemoval.has(student.id)}
                                    onChange={() => toggleStudentRemovalSelection(student.id)}
                                    className="
                                      w-4
                                      h-4
                                      rounded
                                      border-slate-300
                                      text-[#1a365d]
                                      focus:ring-[#1a365d]
                                    "
                                  />
                                )}

                                <div>

                                  <p className="
                                    text-sm
                                    font-medium
                                    text-[#1a365d]
                                  ">
                                    {student.firstName}{' '}
                                    {student.lastName}
                                  </p>


                                  <p className="
                                    text-xs
                                    text-slate-500
                                  ">
                                    {student.email}
                                  </p>

                                </div>

                              </div>



                              <div className="
                                flex
                                gap-2
                              ">

                                <Link
                                  href={`/dashboard/students/${student.id}`}
                                  className="
                                    px-3
                                    py-1.5
                                    rounded-lg
                                    bg-[#eef2f8]
                                    text-[#1a365d]
                                    text-xs
                                    font-medium
                                    hover:bg-[#e2e8f0]
                                  "
                                >
                                  View Profile
                                </Link>


                                {unassignModeTeacherId !== teacher.id && canManageAssignments && (
                                  <button
                                    onClick={() =>
                                      handleRemoveStudent(
                                        student.id,
                                        teacher.id
                                      )
                                    }
                                    disabled={individualRemoving.has(student.id)}
                                    className="
                                      p-2
                                      rounded-lg
                                      bg-red-50
                                      text-red-600
                                      hover:bg-red-100
                                      disabled:opacity-50
                                      disabled:cursor-not-allowed
                                    "
                                  >
                                    {individualRemoving.has(student.id) ? (
                                      <Loader2 size={15} className="animate-spin" />
                                    ) : (
                                      <Trash2 size={15}/>
                                    )}
                                  </button>
                                )}

                              </div>


                            </div>

                          ))}

                        </div>

                      )}




                      {canManageAssignments && (

                        <button
                          onClick={()=>{
                            setSelectedTeacher(teacher);
                            setShowAssignModal(true);
                          }}
                          className="
                            mt-5
                            w-full
                            py-3
                            rounded-xl
                            bg-[#1a365d]
                            hover:bg-[#153475]
                            text-white
                            flex
                            justify-center
                            items-center
                            gap-2
                          "
                        >

                          <UserPlus size={17}/>
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
                          className="
                            mt-3
                            w-full
                            py-2
                            rounded-lg
                            bg-slate-100
                            text-slate-600
                            hover:bg-slate-200
                            flex
                            items-center
                            justify-center
                            gap-2
                            text-xs
                            font-medium
                          "
                        >
                          <Trash2 size={14}/>
                          {unassignModeTeacherId === teacher.id ? 'Cancel Unassign' : 'Unassign Students'}
                        </button>
                      )}


                    </div>

                  );

                })}

              </div>

            )}

          </section>




          {/* ASSIGN MODAL */}

          {showAssignModal && selectedTeacher && (

            <div
              className="
                fixed
                inset-0
                bg-black/40
                flex
                items-center
                justify-center
                z-50
                p-4
              "
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setShowAssignModal(false);
                  setSelectedTeacher(null);
                  setSelectedStudents(new Set());
                }
              }}
            >


              <div className="
                bg-white
                rounded-2xl
                max-w-3xl
                w-full
                max-h-[85vh]
                overflow-y-auto
                p-6
                shadow-xl
              ">


                <div className="
                  flex
                  justify-between
                  items-center
                  mb-6
                ">

                  <div>

                    <h3 className="
                      text-xl
                      font-bold
                      text-[#1a365d]
                    ">
                      Assign Students
                    </h3>

                    <p className="
                      text-sm
                      text-slate-500
                    ">
                      To {selectedTeacher.firstName}{' '}
                      {selectedTeacher.lastName}
                    </p>

                  </div>

                  <button
                    onClick={()=>{
                      setShowAssignModal(false);
                      setSelectedTeacher(null);
                      setSelectedStudents(new Set());
                    }}
                    className="
                      p-2
                      rounded-lg
                      hover:bg-slate-100
                    "
                  >
                    <X size={20}/>
                  </button>

                </div>



                <div className="
                  flex
                  justify-between
                  mb-5
                  bg-slate-50
                  p-4
                  rounded-xl
                ">

                  <button
                    onClick={selectAllStudents}
                    className="
                      text-[#1a365d]
                      text-sm
                      font-medium
                    "
                  >
                    Select all
                  </button>


                  <button
                    onClick={clearSelection}
                    className="
                      text-slate-500
                      text-sm
                    "
                  >
                    Clear
                  </button>

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
                    className="
                      w-full
                      mb-5
                      py-3
                      rounded-xl
                      bg-[#1a365d]
                      text-white
                      disabled:opacity-50
                      disabled:cursor-not-allowed
                      flex
                      items-center
                      justify-center
                      gap-2
                    "
                  >
                    {assigning && <Loader2 size={16} className="animate-spin" />}
                    Assign {selectedStudents.size} Students
                  </button>

                )}



                <div className="space-y-3">

                  {unassignedStudents.length === 0 ? (
                    <div className="py-12 text-center text-slate-500">
                      No unassigned students available
                    </div>
                  ) : (
                    unassignedStudents.map((student)=>(

                      <div
                        key={student.id}
                        className="
                          flex
                          items-center
                          gap-4
                          p-4
                          border
                          border-slate-200
                          rounded-xl
                        "
                      >

                        <input
                          type="checkbox"
                          checked={
                            selectedStudents.has(student.id)
                          }
                          onChange={() =>
                            toggleStudentSelection(student.id)
                          }
                          className="
                            w-5
                            h-5
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
                            width={40}
                            height={40}
                            unoptimized
                            className="
                              w-10
                              h-10
                              rounded-full
                              object-cover
                              border
                              border-slate-200
                            "
                          />
                        ) : (
                          <div className="
                            w-10
                            h-10
                            rounded-full
                            bg-[#eef2f8]
                            flex
                            items-center
                            justify-center
                            font-bold
                            text-[#1a365d]
                          ">
                            {student.firstName[0]}
                            {student.lastName[0]}
                          </div>
                        )}

                        <div className="flex-1">

                          <p className="
                            font-medium
                            text-[#1a365d]
                          ">
                            {student.firstName}{' '}
                            {student.lastName}
                          </p>


                          <p className="
                            text-sm
                            text-slate-500
                          ">
                            {student.email}
                          </p>

                        </div>



                        {selectedStudents.size === 0 && (

                          <button
                            onClick={() =>
                              handleAssignStudent(
                                student.id,
                                selectedTeacher.id
                              )
                            }
                            disabled={assigning}
                            className="
                              px-4
                              py-2
                              rounded-lg
                              bg-[#eef2f8]
                              text-[#1a365d]
                              hover:bg-[#e2e8f0]
                              disabled:opacity-50
                              disabled:cursor-not-allowed
                              flex
                              items-center
                              gap-2
                            "
                          >
                            {assigning ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : null}
                            Assign
                          </button>

                        )}

                      </div>

                    ))
                  )}


                </div>


              </div>


            </div>

          )}



        </div>

      )}

    </div>
  );
}