'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  User,
  MapPin,
  Calendar,
  Book,
  CheckCircle,
  XCircle,
  Phone,
  Globe,
  Link as LinkIcon,
  Map,
  GitFork,
  Copy,
  GraduationCap,
  ExternalLink,
  Briefcase,
} from 'lucide-react';

interface StudentProfile {
  _id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string | null;
  profileImage: string | null;
  role: string;
  studentId: string;
  techCenter: {
    id: string;
    name: string;
    country: {
      name: string;
    };
  } | null;
  country: string | null;
  city: string | null;
  town: string | null;
  street: string | null;
  generalCourse: string | null;
  takesReligion: boolean | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  projectUrls: string[];
  gender: string | null;
  createdAt: string;
  updatedAt: string;
  status: string;
  isActive: boolean;
  lastLoginAt: string | null;
  studentCourses: Array<{
    id: string;
    code: string;
    courseUnit: string;
    credits: number;
    status: string;
  }>;
}

export default function StudentProfilePage() {
  const params = useParams();
  const router = useRouter();

  const [student, setStudent] =
    useState<StudentProfile | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `/api/students/${params.studentId}`,
          {
            headers: {
              'Cache-Control': 'no-cache',
              Pragma: 'no-cache',
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message ||
              data?.error ||
              'Failed to fetch student profile'
          );
        }

        setStudent(data.student);
      } catch (err: any) {
        setError(
          err.message ||
            'Failed to fetch student profile'
        );
      } finally {
        setLoading(false);
      }
    };

    if (params.studentId) {
      fetchStudent();
    }
  }, [params.studentId]);

  const getInitials = () => {
    if (!student) return '??';

    return `${student.firstName.charAt(
      0
    )}${student.lastName.charAt(0)}`.toUpperCase();
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Preserve functionality without breaking the page
    }
  };

  const totalCredits =
    student?.studentCourses?.reduce(
      (sum, course) => sum + course.credits,
      0
    ) || 0;

  /*
   * ============================================================
   * LOADING
   * ============================================================
   */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F6F8]">

        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10">

          {/* Navigation skeleton */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-white border border-[#D8DDE4] animate-pulse" />

            <div className="w-px h-8 bg-[#D8DDE4]" />

            <div className="h-4 w-32 bg-[#D8DDE4] animate-pulse" />
          </div>

          {/* Billboard skeleton */}
          <div className="border-y border-[#D8DDE4] py-8 md:py-12">

            <div className="flex flex-col md:flex-row gap-7">

              <div className="w-32 h-32 md:w-44 md:h-44 bg-[#E2E6EB] animate-pulse flex-shrink-0" />

              <div className="flex-1 space-y-5">

                <div className="h-3 w-28 bg-[#D8DDE4] animate-pulse" />

                <div className="h-12 md:h-20 w-3/4 bg-[#D8DDE4] animate-pulse" />

                <div className="h-5 w-64 bg-[#E1E5EA] animate-pulse" />

                <div className="h-4 w-48 bg-[#E1E5EA] animate-pulse" />
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 border-b border-[#D8DDE4] mb-10">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="p-5 border-r border-[#D8DDE4]"
              >
                <div className="h-3 w-20 bg-[#D8DDE4] animate-pulse mb-3" />
                <div className="h-7 w-28 bg-[#D8DDE4] animate-pulse" />
              </div>
            ))}
          </div>

          {/* Sections */}
          <div className="space-y-6">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-32 bg-white border border-[#D8DDE4] animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  /*
   * ============================================================
   * ERROR
   * ============================================================
   */

  if (error || !student) {
    return (
      <div className="min-h-screen bg-[#F5F6F8]">

        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10">

          <button
            onClick={() => router.back()}
            className="
              p-2.5
              bg-white
              border
              border-[#D8DDE4]
              text-[#596678]
              hover:text-[#14213D]
              transition-colors
            "
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="mt-8 bg-white border border-[#D8DDE4] p-10 md:p-16 text-center">

            <XCircle className="w-12 h-12 text-[#D95C5C] mx-auto mb-5" />

            <h2 className="text-xl font-bold text-[#14213D]">
              Student profile unavailable
            </h2>

            <p className="text-sm text-[#718096] mt-2">
              {error || 'Student not found'}
            </p>

            <button
              onClick={() => router.back()}
              className="
                mt-6
                px-6
                py-3
                bg-[#1A365D]
                text-white
                text-sm
                font-bold
                uppercase
                tracking-[0.12em]
                hover:bg-[#15304F]
                transition-colors
              "
            >
              Back to Students
            </button>
          </div>
        </div>
      </div>
    );
  }

  /*
   * ============================================================
   * REUSABLE SECTION HEADER
   * ============================================================
   */

  const SectionHeading = ({
    number,
    title,
    icon,
  }: {
    number: string;
    title: string;
    icon: React.ReactNode;
  }) => {
    return (
      <div className="flex items-center gap-4 border-b border-[#D8DDE4] pb-3 mb-6">

        <span className="font-mono text-xs font-bold text-[#E8A33D]">
          {number}
        </span>

        <div className="w-px h-5 bg-[#D8DDE4]" />

        <div className="flex items-center gap-2">
          <span className="text-[#1A365D]">
            {icon}
          </span>

          <h2 className="text-xs md:text-sm uppercase tracking-[0.18em] font-bold text-[#354258]">
            {title}
          </h2>
        </div>
      </div>
    );
  };

  /*
   * ============================================================
   * INFORMATION ROW
   * ============================================================
   */

  const InfoRow = ({
    label,
    value,
    icon,
  }: {
    label: string;
    value: React.ReactNode;
    icon?: React.ReactNode;
  }) => {
    return (
      <div className="flex items-start gap-3 py-4 border-b border-[#E4E7EB] last:border-b-0">

        {icon && (
          <div className="text-[#8A94A3] pt-0.5 flex-shrink-0">
            {icon}
          </div>
        )}

        <div className="min-w-0 flex-1">

          <p className="text-[9px] uppercase tracking-[0.15em] font-bold text-[#929CAA]">
            {label}
          </p>

          <div className="text-sm md:text-base text-[#354258] mt-1 break-words">
            {value}
          </div>
        </div>
      </div>
    );
  };

  /*
   * ============================================================
   * PAGE
   * ============================================================
   */

  return (
    <div className="min-h-screen bg-[#F5F6F8]">

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10">

        {/* ======================================================
            TOP NAVIGATION
        ====================================================== */}

        <div className="flex items-center justify-between mb-8">

          <div className="flex items-center gap-3">

            <button
              onClick={() => router.back()}
              className="
                p-2.5
                bg-white
                border
                border-[#D8DDE4]
                text-[#596678]
                hover:text-[#14213D]
                hover:border-[#1A365D]
                transition-colors
              "
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="h-8 w-px bg-[#D8DDE4]" />

            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-[#E8A33D]" />

              <span className="text-[10px] md:text-xs uppercase tracking-[0.2em] font-bold text-[#7B8797]">
                Student Directory
              </span>
            </div>
          </div>

          <div className="hidden sm:block font-mono text-[10px] text-[#A0A8B3]">
            PROFILE / {student.studentId.slice(0, 8)}
          </div>
        </div>

        {/* ======================================================
            STUDENT BILLBOARD HERO
        ====================================================== */}

        <section className="border-y border-[#CCD3DC] bg-white">

          {/* Gold marker */}
          <div className="h-[3px] bg-[#E8A33D] w-20" />

          <div className="p-5 md:p-8 lg:p-10">

            <div className="flex flex-col md:flex-row gap-7 lg:gap-10">

              {/* =================================================
                  PHOTO
              ================================================= */}

              <div className="flex-shrink-0">

                <div className="relative">

                  <div className="w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 overflow-hidden bg-[#E8EBEF]">

                    {student.profileImage ? (
                      <img
                        src={student.profileImage}
                        alt={`${student.firstName} ${student.lastName}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#1A365D] flex items-center justify-center">
                        <span className="text-4xl md:text-5xl font-black text-white">
                          {getInitials()}
                        </span>
                      </div>
                    )}
                  </div>

                  <div
                    className={`
                      absolute
                      -bottom-2
                      -right-2
                      px-2.5
                      py-1
                      bg-white
                      border
                      ${
                        student.isActive
                          ? 'border-[#2F9E78]'
                          : 'border-[#D95C5C]'
                      }
                    `}
                  >
                    <div className="flex items-center gap-1.5">

                      {student.isActive ? (
                        <CheckCircle className="w-3.5 h-3.5 text-[#2F9E78]" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-[#D95C5C]" />
                      )}

                      <span
                        className={`text-[9px] uppercase tracking-[0.12em] font-bold ${
                          student.isActive
                            ? 'text-[#2F9E78]'
                            : 'text-[#D95C5C]'
                        }`}
                      >
                        {student.isActive
                          ? 'Active'
                          : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* =================================================
                  IDENTITY
              ================================================= */}

              <div className="flex-1 min-w-0">

                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">

                  <div>

                    <div className="flex items-center gap-2 mb-4">

                      <span className="font-mono text-xs font-bold text-[#E8A33D]">
                        STUDENT
                      </span>

                      <span className="w-8 h-px bg-[#D8DDE4]" />

                      <span className="text-[10px] uppercase tracking-[0.16em] text-[#8993A2]">
                        {student.role}
                      </span>
                    </div>

                    <h1 className="
                      text-4xl
                      sm:text-5xl
                      md:text-6xl
                      lg:text-7xl
                      font-black
                      tracking-[-0.05em]
                      leading-[0.9]
                      text-[#14213D]
                      break-words
                    ">
                      {student.firstName}
                      <br className="hidden sm:block" />{' '}
                      {student.lastName}
                    </h1>

                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-5">

                      <div className="flex items-center gap-2 text-[#667386]">
                        <MapPin className="w-4 h-4 text-[#E8A33D]" />

                        <span className="text-sm">
                          {student.techCenter
                            ? `${student.techCenter.name}, ${student.techCenter.country?.name || ''}`
                            : 'No tech center assigned'}
                        </span>
                      </div>

                      {student.generalCourse && (
                        <div className="flex items-center gap-2 text-[#667386]">

                          <Book className="w-4 h-4 text-[#E8A33D]" />

                          <span className="text-sm">
                            {student.generalCourse}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Student ID */}
                  <div className="lg:text-right">

                    <p className="text-[9px] uppercase tracking-[0.18em] font-bold text-[#929CAA]">
                      Student ID
                    </p>

                    <p className="font-mono text-sm md:text-base font-bold text-[#354258] mt-1">
                      {student.studentId}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Hero bottom line */}
            <div className="flex items-center gap-3 mt-8">

              <div className="h-px flex-1 bg-[#E0E4E8]" />

              <span className="text-[#E8A33D] text-xs">
                ◆
              </span>

              <div className="h-px w-20 bg-[#E0E4E8]" />
            </div>
          </div>
        </section>

        {/* ======================================================
            QUICK ACADEMIC STRIP
        ====================================================== */}

        <section className="grid grid-cols-2 md:grid-cols-4 bg-white border-x border-b border-[#D8DDE4]">

          <div className="p-4 md:p-5 border-r border-b md:border-b-0 border-[#D8DDE4]">

            <p className="text-[9px] uppercase tracking-[0.16em] font-bold text-[#929CAA]">
              Course Units
            </p>

            <p className="text-2xl md:text-3xl font-black text-[#1A365D] mt-1">
              {student.studentCourses.length}
            </p>
          </div>

          <div className="p-4 md:p-5 md:border-r border-b md:border-b-0 border-[#D8DDE4]">

            <p className="text-[9px] uppercase tracking-[0.16em] font-bold text-[#929CAA]">
              Credits
            </p>

            <p className="text-2xl md:text-3xl font-black text-[#1A365D] mt-1">
              {totalCredits}
            </p>
          </div>

          <div className="p-4 md:p-5 border-r border-[#D8DDE4]">

            <p className="text-[9px] uppercase tracking-[0.16em] font-bold text-[#929CAA]">
              Joined
            </p>

            <p className="text-sm md:text-base font-bold text-[#354258] mt-2">
              {new Date(
                student.createdAt
              ).toLocaleDateString()}
            </p>
          </div>

          <div className="p-4 md:p-5">

            <p className="text-[9px] uppercase tracking-[0.16em] font-bold text-[#929CAA]">
              Religion
            </p>

            <p className="text-sm md:text-base font-bold mt-2">
              {student.takesReligion === null ? (
                <span className="text-[#8993A2]">
                  Not specified
                </span>
              ) : student.takesReligion ? (
                <span className="text-[#2F9E78]">
                  Takes Religion
                </span>
              ) : (
                <span className="text-[#D95C5C]">
                  No Religion
                </span>
              )}
            </p>
          </div>
        </section>

        {/* ======================================================
            MAIN CONTENT
        ====================================================== */}

        <div className="mt-10">

          {/* ====================================================
              ACADEMIC
          ==================================================== */}

          <section className="mb-10">

            <SectionHeading
              number="01"
              title="Academic Information"
              icon={<GraduationCap className="w-4 h-4" />}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10">

              <InfoRow
                label="General Course"
                value={
                  student.generalCourse ||
                  'Not provided'
                }
                icon={<Book className="w-4 h-4" />}
              />

              <InfoRow
                label="Tech Center"
                value={
                  student.techCenter
                    ? student.techCenter.name
                    : 'Not assigned'
                }
                icon={<MapPin className="w-4 h-4" />}
              />

              <InfoRow
                label="Country"
                value={
                  student.techCenter?.country?.name ||
                  student.country ||
                  'Not provided'
                }
                icon={<Globe className="w-4 h-4" />}
              />

              <InfoRow
                label="Student Status"
                value={
                  <span className="capitalize">
                    {student.status}
                  </span>
                }
                icon={<CheckCircle className="w-4 h-4" />}
              />
            </div>
          </section>

          {/* ====================================================
              COURSE UNITS
          ==================================================== */}

          <section className="mb-10">

            <SectionHeading
              number="02"
              title={`Course Units (${student.studentCourses.length})`}
              icon={<Book className="w-4 h-4" />}
            />

            {student.studentCourses.length > 0 ? (
              <div className="border border-[#D8DDE4] bg-white">

                {/* Desktop header */}
                <div className="hidden md:grid grid-cols-[100px_1fr_100px_120px] gap-5 px-5 py-3 bg-[#1A365D] text-white">

                  <span className="text-[9px] uppercase tracking-[0.15em] text-white/60">
                    Code
                  </span>

                  <span className="text-[9px] uppercase tracking-[0.15em] text-white/60">
                    Course Unit
                  </span>

                  <span className="text-[9px] uppercase tracking-[0.15em] text-white/60">
                    Credits
                  </span>

                  <span className="text-[9px] uppercase tracking-[0.15em] text-white/60">
                    Status
                  </span>
                </div>

                {student.studentCourses.map(
                  (course, index) => (
                    <div
                      key={course.id}
                      className="group border-b border-[#E1E5E9] last:border-b-0 hover:bg-[#FAFBFC] transition-colors"
                    >

                      {/* Desktop */}
                      <div className="hidden md:grid grid-cols-[100px_1fr_100px_120px] gap-5 items-center px-5 py-4">

                        <span className="font-mono text-xs font-bold text-[#E8A33D]">
                          {course.code}
                        </span>

                        <span className="text-sm font-semibold text-[#354258]">
                          {course.courseUnit}
                        </span>

                        <span className="text-sm text-[#657286]">
                          {course.credits}
                        </span>

                        <span className="text-xs capitalize text-[#657286]">
                          {course.status}
                        </span>
                      </div>

                      {/* Mobile */}
                      <div className="md:hidden p-4">

                        <div className="flex items-start justify-between gap-4">

                          <div className="min-w-0">

                            <span className="font-mono text-xs font-bold text-[#E8A33D]">
                              {course.code}
                            </span>

                            <p className="text-sm font-bold text-[#354258] mt-1 break-words">
                              {course.courseUnit}
                            </p>
                          </div>

                          <span className="text-xs font-bold text-[#1A365D] whitespace-nowrap">
                            {course.credits} credits
                          </span>
                        </div>

                        <p className="text-[10px] uppercase tracking-[0.12em] text-[#929CAA] mt-3">
                          {course.status}
                        </p>
                      </div>
                    </div>
                  )
                )}

                {/* Total */}
                <div className="flex items-center justify-between px-5 py-4 bg-[#F7F8FA]">

                  <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-[#7B8797]">
                    Total Credits
                  </span>

                  <span className="text-xl font-black text-[#1A365D]">
                    {totalCredits}
                  </span>
                </div>
              </div>
            ) : (
              <div className="border border-[#D8DDE4] bg-white p-6 text-sm text-[#8993A2]">
                No course units provided.
              </div>
            )}
          </section>

          {/* ====================================================
              CONTACT + LOCATION
          ==================================================== */}

          <section className="mb-10">

            <SectionHeading
              number="03"
              title="Personal & Contact"
              icon={<User className="w-4 h-4" />}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10">

              <InfoRow
                label="Phone Number"
                value={
                  student.phoneNumber ||
                  'Not provided'
                }
                icon={<Phone className="w-4 h-4" />}
              />

              <InfoRow
                label="Gender"
                value={
                  student.gender ? (
                    <span className="capitalize">
                      {student.gender}
                    </span>
                  ) : (
                    'Not provided'
                  )
                }
                icon={<User className="w-4 h-4" />}
              />

              <InfoRow
                label="Country"
                value={
                  student.country ||
                  student.techCenter?.country?.name ||
                  'Not provided'
                }
                icon={<Globe className="w-4 h-4" />}
              />

              <InfoRow
                label="City"
                value={
                  student.city ||
                  'Not provided'
                }
                icon={<Map className="w-4 h-4" />}
              />

              <InfoRow
                label="Town"
                value={
                  student.town ||
                  'Not provided'
                }
                icon={<MapPin className="w-4 h-4" />}
              />

              <InfoRow
                label="Street"
                value={
                  student.street ||
                  'Not provided'
                }
                icon={<MapPin className="w-4 h-4" />}
              />
            </div>
          </section>

          {/* ====================================================
              SOCIAL / PROFESSIONAL
          ==================================================== */}

          <section className="mb-10">

            <SectionHeading
              number="04"
              title="Professional Links"
              icon={<Briefcase className="w-4 h-4" />}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* LinkedIn */}
              <div className="bg-white border border-[#D8DDE4] p-5">

                <div className="flex items-start gap-4">

                  <div className="w-10 h-10 bg-[#EAF3F8] flex items-center justify-center flex-shrink-0">
                    <LinkIcon className="w-5 h-5 text-[#0077B5]" />
                  </div>

                  <div className="min-w-0 flex-1">

                    <p className="text-[9px] uppercase tracking-[0.16em] font-bold text-[#929CAA]">
                      LinkedIn
                    </p>

                    {student.linkedinUrl ? (
                      <>
                        <p className="text-sm text-[#354258] truncate mt-1">
                          {student.linkedinUrl}
                        </p>

                        <div className="flex items-center gap-3 mt-3">

                          <button
                            onClick={() =>
                              copyToClipboard(
                                student.linkedinUrl!
                              )
                            }
                            className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.12em] font-bold text-[#1A365D] hover:text-[#E8A33D]"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            Copy
                          </button>

                          <a
                            href={student.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.12em] font-bold text-[#1A365D] hover:text-[#E8A33D]"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Open
                          </a>
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-[#8993A2] mt-1">
                        Not provided
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* GitHub */}
              <div className="bg-white border border-[#D8DDE4] p-5">

                <div className="flex items-start gap-4">

                  <div className="w-10 h-10 bg-[#EEF0F2] flex items-center justify-center flex-shrink-0">
                    <GitFork className="w-5 h-5 text-[#354258]" />
                  </div>

                  <div className="min-w-0 flex-1">

                    <p className="text-[9px] uppercase tracking-[0.16em] font-bold text-[#929CAA]">
                      GitHub
                    </p>

                    {student.githubUrl ? (
                      <>
                        <p className="text-sm text-[#354258] truncate mt-1">
                          {student.githubUrl}
                        </p>

                        <div className="flex items-center gap-3 mt-3">

                          <button
                            onClick={() =>
                              copyToClipboard(
                                student.githubUrl!
                              )
                            }
                            className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.12em] font-bold text-[#1A365D] hover:text-[#E8A33D]"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            Copy
                          </button>

                          <a
                            href={student.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.12em] font-bold text-[#1A365D] hover:text-[#E8A33D]"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Open
                          </a>
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-[#8993A2] mt-1">
                        Not provided
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ====================================================
              PROJECTS
          ==================================================== */}

          <section className="mb-10">

            <SectionHeading
              number="05"
              title="Student Projects"
              icon={<LinkIcon className="w-4 h-4" />}
            />

            {student.projectUrls &&
            student.projectUrls.length > 0 ? (
              <div className="border border-[#D8DDE4] bg-white">

                {student.projectUrls.map(
                  (url, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 px-4 md:px-5 py-4 border-b border-[#E1E5E9] last:border-b-0"
                    >

                      <span className="font-mono text-xs font-bold text-[#E8A33D]">
                        {String(index + 1).padStart(
                          2,
                          '0'
                        )}
                      </span>

                      <LinkIcon className="w-4 h-4 text-[#8A94A3] flex-shrink-0" />

                      <span className="text-sm text-[#354258] truncate flex-1">
                        {url}
                      </span>

                      <button
                        onClick={() =>
                          copyToClipboard(url)
                        }
                        className="p-2 text-[#7B8797] hover:text-[#1A365D] flex-shrink-0"
                        title="Copy link"
                      >
                        <Copy className="w-4 h-4" />
                      </button>

                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hidden sm:flex p-2 text-[#7B8797] hover:text-[#E8A33D]"
                        title="Open project"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  )
                )}
              </div>
            ) : (
              <div className="bg-white border border-[#D8DDE4] p-6">
                <p className="text-sm text-[#8993A2]">
                  No projects provided.
                </p>
              </div>
            )}
          </section>

          {/* ====================================================
              ACCOUNT
          ==================================================== */}

          <section className="mb-10">

            <SectionHeading
              number="06"
              title="Account Information"
              icon={<Calendar className="w-4 h-4" />}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-10">

              <InfoRow
                label="Joined"
                value={new Date(
                  student.createdAt
                ).toLocaleDateString()}
                icon={<Calendar className="w-4 h-4" />}
              />

              <InfoRow
                label="Profile Updated"
                value={new Date(
                  student.updatedAt
                ).toLocaleDateString()}
                icon={<Calendar className="w-4 h-4" />}
              />

              <InfoRow
                label="Account Status"
                value={
                  <span className="capitalize">
                    {student.status}
                  </span>
                }
                icon={<User className="w-4 h-4" />}
              />
            </div>
          </section>

          {/* ====================================================
              BACK TO DIRECTORY
          ==================================================== */}

          <div className="border-t border-[#D8DDE4] pt-6 pb-10">

            <button
              onClick={() => router.back()}
              className="
                inline-flex
                items-center
                gap-3
                px-5
                py-3
                bg-[#1A365D]
                text-white
                text-xs
                uppercase
                tracking-[0.14em]
                font-bold
                hover:bg-[#15304F]
                transition-colors
              "
            >
              <ArrowLeft className="w-4 h-4" />

              Back to Student Directory
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}