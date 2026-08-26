'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
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
  Mail,
} from 'lucide-react';

interface StudentProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
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

/* ============================================================
   SHARED UI
============================================================ */

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
    <div className="mb-6 flex items-center gap-3 border-b border-[#DCE2E9] pb-3">
      <span className="font-mono text-[10px] font-bold tracking-wider text-[#C88A24]">
        {number}
      </span>

      <span className="h-4 w-px bg-[#D7DDE5]" />

      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#EEF2F7] text-[#1A365D]">
        {icon}
      </span>

      <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-[#344154] md:text-sm">
        {title}
      </h2>
    </div>
  );
};

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
    <div className="group flex items-start gap-3 border-b border-[#E5E9EE] py-4 last:border-b-0">
      {icon && (
        <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-[#F1F4F7] text-[#718096] transition-colors group-hover:bg-[#E8EDF3] group-hover:text-[#1A365D]">
          {icon}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#929CAA]">
          {label}
        </p>

        <div className="mt-1 break-words text-sm text-[#354258] md:text-[15px]">
          {value}
        </div>
      </div>
    </div>
  );
};

const StatItem = ({
  label,
  value,
  detail,
}: {
  label: string;
  value: React.ReactNode;
  detail?: string;
}) => {
  return (
    <div className="min-w-0 p-4 md:p-5">
      <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#929CAA]">
        {label}
      </p>

      <div className="mt-1 text-xl font-black tracking-tight text-[#1A365D] md:text-2xl">
        {value}
      </div>

      {detail && (
        <p className="mt-1 text-[10px] text-[#8993A2]">{detail}</p>
      )}
    </div>
  );
};

/* ============================================================
   MAIN PAGE
============================================================ */

export default function StudentProfilePage() {
  const params = useParams();
  const router = useRouter();

  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        setLoading(true);

        const response = await fetch(`/api/students/${params.studentId}`, {
          headers: {
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache',
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message || data?.error || 'Failed to fetch student profile'
          );
        }

        setStudent(data.student);
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to fetch student profile';

        setError(errorMessage);
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

    return `${student.firstName.charAt(0)}${student.lastName.charAt(
      0
    )}`.toUpperCase();
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

  /* ============================================================
     LOADING
  ============================================================ */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F6F8]">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-10">
          <div className="mb-7 flex items-center gap-3">
            <div className="h-10 w-10 animate-pulse rounded-md border border-[#D8DDE4] bg-white" />
            <div className="h-8 w-px bg-[#D8DDE4]" />
            <div className="h-3 w-32 animate-pulse rounded bg-[#D8DDE4]" />
          </div>

          <div className="overflow-hidden rounded-lg border border-[#D8DDE4] bg-white">
            <div className="h-56 animate-pulse bg-[#DDE2E8] md:h-72" />

            <div className="px-5 pb-7 md:px-8">
              <div className="-mt-16 flex flex-col gap-5 md:flex-row md:items-end">
                <div className="h-32 w-32 flex-shrink-0 animate-pulse rounded-xl border-4 border-white bg-[#C9D0D8] md:h-40 md:w-40" />

                <div className="flex-1 space-y-3 pb-2">
                  <div className="h-3 w-24 animate-pulse rounded bg-[#D8DDE4]" />
                  <div className="h-10 w-3/4 animate-pulse rounded bg-[#D8DDE4]" />
                  <div className="h-4 w-2/3 animate-pulse rounded bg-[#E1E5EA]" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 divide-x divide-y divide-[#D8DDE4] overflow-hidden rounded-lg border border-[#D8DDE4] bg-white md:grid-cols-4 md:divide-y-0">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="p-5">
                <div className="mb-3 h-2.5 w-20 animate-pulse rounded bg-[#D8DDE4]" />
                <div className="h-7 w-24 animate-pulse rounded bg-[#D8DDE4]" />
              </div>
            ))}
          </div>

          <div className="mt-10 space-y-5">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-40 animate-pulse rounded-lg border border-[#D8DDE4] bg-white"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ============================================================
     ERROR
  ============================================================ */

  if (error || !student) {
    return (
      <div className="min-h-screen bg-[#F5F6F8]">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-10">
          <button
            onClick={() => router.back()}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[#D8DDE4] bg-white text-[#596678] transition-colors hover:border-[#1A365D] hover:text-[#1A365D]"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="mt-6 rounded-lg border border-[#D8DDE4] bg-white px-6 py-14 text-center md:px-10 md:py-20">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#FEF0F0]">
              <XCircle className="h-7 w-7 text-[#C74D4D]" />
            </div>

            <h2 className="mt-5 text-xl font-bold text-[#14213D]">
              Student profile unavailable
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#718096]">
              {error || 'Student not found'}
            </p>

            <button
              onClick={() => router.back()}
              className="mt-7 inline-flex items-center gap-2 rounded-md bg-[#1A365D] px-6 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#14294A]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Students
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ============================================================
     PAGE
  ============================================================ */

  return (
    <div className="min-h-screen bg-[#F5F6F8]">
      <div className="mx-auto max-w-7xl px-4 py-5 md:px-6 md:py-8">
        {/* ======================================================
            TOP NAVIGATION
        ====================================================== */}

        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[#D8DDE4] bg-white text-[#596678] shadow-[0_1px_2px_rgba(20,33,61,0.03)] transition-all hover:border-[#1A365D] hover:text-[#1A365D]"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <div className="h-7 w-px bg-[#D8DDE4]" />

            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-[#C88A24]" />

              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#6F7B8B] md:text-xs">
                Student Directory
              </span>
            </div>
          </div>

          <div className="hidden font-mono text-[10px] text-[#9AA3AF] sm:block">
            PROFILE / {student.studentId.slice(0, 8)}
          </div>
        </div>

        {/* ======================================================
            PROFILE COVER + IDENTITY
        ====================================================== */}

        <section className="overflow-hidden rounded-lg border border-[#D5DCE4] bg-white shadow-[0_2px_8px_rgba(20,33,61,0.04)]">
          {/* Cover */}
          <div className="relative h-52 overflow-hidden bg-[#1A365D] sm:h-60 md:h-72 lg:h-80">
            {student.profileImage ? (
              <Image
                src={student.profileImage}
                alt=""
                fill
                priority
                sizes="(max-width: 768px) 100vw, 1200px"
                className="object-cover object-center"
              />
            ) : (
              <div className="absolute inset-0 bg-[#1A365D]" />
            )}

            {/* Professional cover treatment */}
            <div className="absolute inset-0 bg-[#0F2038]/65" />

            <div className="absolute inset-0 bg-gradient-to-b from-[#0B1B30]/25 via-transparent to-[#0B1B30]/80" />

            {/* Subtle institutional frame */}
            <div className="absolute inset-x-0 top-0 h-1 bg-[#C88A24]" />

            <div className="absolute bottom-0 left-0 right-0 p-5 md:p-7">
              <div className="flex items-center gap-2 text-white/75">
                <span className="h-1.5 w-1.5 rounded-full bg-[#E8A33D]" />

                <span className="text-[9px] font-bold uppercase tracking-[0.18em]">
                  Student Profile
                </span>
              </div>
            </div>
          </div>

          {/* Identity body */}
          <div className="px-5 pb-6 md:px-8 md:pb-8">
            <div className="-mt-14 flex flex-col gap-5 md:-mt-20 md:flex-row md:items-end md:gap-7">
              {/* Profile image */}
              <div className="relative z-10 flex-shrink-0">
                <div className="relative h-28 w-28 overflow-hidden rounded-xl border-4 border-white bg-[#E5E9EE] shadow-[0_5px_18px_rgba(20,33,61,0.16)] sm:h-32 sm:w-32 md:h-40 md:w-40">
                  {student.profileImage ? (
                    <Image
                      src={student.profileImage}
                      alt={`${student.firstName} ${student.lastName}`}
                      fill
                      sizes="160px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[#1A365D]">
                      <span className="text-4xl font-black tracking-tight text-white md:text-5xl">
                        {getInitials()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Status */}
                <div
                  className={`absolute -bottom-2 -right-2 flex items-center gap-1.5 rounded-full border-2 border-white px-2.5 py-1 shadow-sm ${
                    student.isActive
                      ? 'bg-[#EAF7F1] text-[#247653]'
                      : 'bg-[#FEF0F0] text-[#C74D4D]'
                  }`}
                >
                  {student.isActive ? (
                    <CheckCircle className="h-3.5 w-3.5" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5" />
                  )}

                  <span className="text-[9px] font-bold uppercase tracking-[0.1em]">
                    {student.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {/* Identity */}
              <div className="min-w-0 flex-1 pb-1">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="rounded bg-[#F6EBD8] px-2 py-1 font-mono text-[9px] font-bold tracking-[0.1em] text-[#9A691B]">
                        STUDENT
                      </span>

                      <span className="text-[10px] uppercase tracking-[0.14em] text-[#8A94A3]">
                        {student.role}
                      </span>
                    </div>

                    <h1 className="break-words text-3xl font-black leading-[0.95] tracking-[-0.035em] text-[#14213D] sm:text-4xl md:text-5xl lg:text-6xl">
                      {student.firstName} {student.lastName}
                    </h1>

                    <div className="mt-3 flex items-center gap-2">
                      <Mail className="h-4 w-4 flex-shrink-0 text-[#C88A24]" />

                      <span className="break-all text-sm text-[#667386]">
                        {student.email}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
                      <div className="flex items-center gap-2 text-sm text-[#667386]">
                        <MapPin className="h-4 w-4 flex-shrink-0 text-[#C88A24]" />

                        <span>
                          {student.techCenter
                            ? `${student.techCenter.name}${
                                student.techCenter.country?.name
                                  ? `, ${student.techCenter.country.name}`
                                  : ''
                              }`
                            : 'No tech center assigned'}
                        </span>
                      </div>

                      {student.generalCourse && (
                        <div className="flex items-center gap-2 text-sm text-[#667386]">
                          <Book className="h-4 w-4 flex-shrink-0 text-[#C88A24]" />

                          <span>{student.generalCourse}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Student ID */}
                  <div className="rounded-md border border-[#E0E5EB] bg-[#F8F9FB] px-4 py-3 lg:min-w-[190px] lg:text-right">
                    <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#929CAA]">
                      Student ID
                    </p>

                    <p className="mt-1 break-all font-mono text-sm font-bold text-[#354258]">
                      {student.studentId}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Metadata line */}
            <div className="mt-7 flex flex-col gap-3 border-t border-[#E5E9EE] pt-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-x-5 gap-y-2 text-[10px] uppercase tracking-[0.12em] text-[#8A94A3]">
                <span>
                  Joined{' '}
                  <strong className="font-semibold text-[#536174]">
                    {new Date(student.createdAt).toLocaleDateString()}
                  </strong>
                </span>

                <span>
                  Status{' '}
                  <strong className="font-semibold capitalize text-[#536174]">
                    {student.status}
                  </strong>
                </span>
              </div>

              <div className="hidden h-px flex-1 bg-[#E5E9EE] sm:block sm:max-w-[120px]" />
            </div>
          </div>
        </section>

        {/* ======================================================
            QUICK ACADEMIC STRIP
        ====================================================== */}

        <section className="mt-4 grid grid-cols-2 overflow-hidden rounded-lg border border-[#D8DDE4] bg-white shadow-[0_1px_4px_rgba(20,33,61,0.03)] md:grid-cols-4">
          <div className="border-b border-r border-[#D8DDE4] md:border-b-0">
            <StatItem
              label="Course Units"
              value={student.studentCourses.length}
              detail="Registered units"
            />
          </div>

          <div className="border-b border-[#D8DDE4] md:border-b-0 md:border-r">
            <StatItem
              label="Credits"
              value={totalCredits}
              detail="Total academic credits"
            />
          </div>

          <div className="border-r border-[#D8DDE4]">
            <StatItem
              label="Joined"
              value={new Date(student.createdAt).toLocaleDateString()}
              detail="Registration date"
            />
          </div>

          <div>
            <StatItem
              label="Religion"
              value={
                student.takesReligion === null ? (
                  <span className="text-base font-bold text-[#8993A2] md:text-lg">
                    Not specified
                  </span>
                ) : student.takesReligion ? (
                  <span className="text-base font-bold text-[#247653] md:text-lg">
                    Takes Religion
                  </span>
                ) : (
                  <span className="text-base font-bold text-[#C74D4D] md:text-lg">
                    No Religion
                  </span>
                )
              }
              detail="Academic record"
            />
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
              icon={<GraduationCap className="h-4 w-4" />}
            />

            <div className="rounded-lg border border-[#D8DDE4] bg-white px-4 shadow-[0_1px_4px_rgba(20,33,61,0.025)] md:px-6">
              <div className="grid grid-cols-1 gap-x-10 md:grid-cols-2">
                <InfoRow
                  label="General Course"
                  value={student.generalCourse || 'Not provided'}
                  icon={<Book className="h-4 w-4" />}
                />

                <InfoRow
                  label="Tech Center"
                  value={
                    student.techCenter
                      ? student.techCenter.name
                      : 'Not assigned'
                  }
                  icon={<MapPin className="h-4 w-4" />}
                />

                <InfoRow
                  label="Country"
                  value={
                    student.techCenter?.country?.name ||
                    student.country ||
                    'Not provided'
                  }
                  icon={<Globe className="h-4 w-4" />}
                />

                <InfoRow
                  label="Student Status"
                  value={
                    <span className="capitalize">{student.status}</span>
                  }
                  icon={<CheckCircle className="h-4 w-4" />}
                />
              </div>
            </div>
          </section>

          {/* ====================================================
              COURSE UNITS
          ==================================================== */}

          <section className="mb-10">
            <SectionHeading
              number="02"
              title={`Course Units (${student.studentCourses.length})`}
              icon={<Book className="h-4 w-4" />}
            />

            {student.studentCourses.length > 0 ? (
              <div className="overflow-hidden rounded-lg border border-[#D8DDE4] bg-white shadow-[0_1px_4px_rgba(20,33,61,0.025)]">
                {/* Desktop header */}
                <div className="hidden grid-cols-[110px_1fr_100px_120px] gap-5 bg-[#1A365D] px-5 py-3 md:grid">
                  <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/65">
                    Code
                  </span>

                  <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/65">
                    Course Unit
                  </span>

                  <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/65">
                    Credits
                  </span>

                  <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/65">
                    Status
                  </span>
                </div>

                {student.studentCourses.map((course) => (
                  <div
                    key={course.id}
                    className="group border-b border-[#E4E8ED] last:border-b-0 hover:bg-[#FAFBFC]"
                  >
                    {/* Desktop */}
                    <div className="hidden grid-cols-[110px_1fr_100px_120px] items-center gap-5 px-5 py-4 md:grid">
                      <span className="font-mono text-xs font-bold text-[#C88A24]">
                        {course.code}
                      </span>

                      <span className="text-sm font-semibold text-[#354258]">
                        {course.courseUnit}
                      </span>

                      <span className="text-sm text-[#657286]">
                        {course.credits}
                      </span>

                      <span className="inline-flex w-fit rounded-full bg-[#F1F4F7] px-2.5 py-1 text-[10px] font-semibold capitalize text-[#657286]">
                        {course.status}
                      </span>
                    </div>

                    {/* Mobile */}
                    <div className="p-4 md:hidden">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <span className="font-mono text-xs font-bold text-[#C88A24]">
                            {course.code}
                          </span>

                          <p className="mt-1 break-words text-sm font-bold text-[#354258]">
                            {course.courseUnit}
                          </p>
                        </div>

                        <span className="whitespace-nowrap rounded-md bg-[#EEF2F7] px-2 py-1 text-[10px] font-bold text-[#1A365D]">
                          {course.credits} credits
                        </span>
                      </div>

                      <div className="mt-3 flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#8A94A3]" />

                        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#929CAA]">
                          {course.status}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Total */}
                <div className="flex items-center justify-between border-t border-[#E0E5EA] bg-[#F7F8FA] px-5 py-4">
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#7B8797]">
                    Total Credits
                  </span>

                  <span className="text-xl font-black text-[#1A365D]">
                    {totalCredits}
                  </span>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-[#D8DDE4] bg-white p-7 text-sm text-[#8993A2]">
                No course units provided.
              </div>
            )}
          </section>

          {/* ====================================================
              PERSONAL + CONTACT
          ==================================================== */}

          <section className="mb-10">
            <SectionHeading
              number="03"
              title="Personal & Contact"
              icon={<User className="h-4 w-4" />}
            />

            <div className="rounded-lg border border-[#D8DDE4] bg-white px-4 shadow-[0_1px_4px_rgba(20,33,61,0.025)] md:px-6">
              <div className="grid grid-cols-1 gap-x-10 md:grid-cols-2">
                <InfoRow
                  label="Email Address"
                  value={student.email || 'Not provided'}
                  icon={<Mail className="h-4 w-4" />}
                />

                <InfoRow
                  label="Phone Number"
                  value={student.phoneNumber || 'Not provided'}
                  icon={<Phone className="h-4 w-4" />}
                />

                <InfoRow
                  label="Gender"
                  value={
                    student.gender ? (
                      <span className="capitalize">{student.gender}</span>
                    ) : (
                      'Not provided'
                    )
                  }
                  icon={<User className="h-4 w-4" />}
                />

                <InfoRow
                  label="Country"
                  value={
                    student.country ||
                    student.techCenter?.country?.name ||
                    'Not provided'
                  }
                  icon={<Globe className="h-4 w-4" />}
                />

                <InfoRow
                  label="City"
                  value={student.city || 'Not provided'}
                  icon={<Map className="h-4 w-4" />}
                />

                <InfoRow
                  label="Town"
                  value={student.town || 'Not provided'}
                  icon={<MapPin className="h-4 w-4" />}
                />

                <InfoRow
                  label="Street"
                  value={student.street || 'Not provided'}
                  icon={<MapPin className="h-4 w-4" />}
                />
              </div>
            </div>
          </section>

          {/* ====================================================
              PROFESSIONAL LINKS
          ==================================================== */}

          <section className="mb-10">
            <SectionHeading
              number="04"
              title="Professional Links"
              icon={<Briefcase className="h-4 w-4" />}
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* LinkedIn */}
              <div className="rounded-lg border border-[#D8DDE4] bg-white p-5 shadow-[0_1px_4px_rgba(20,33,61,0.025)] transition-shadow hover:shadow-[0_4px_12px_rgba(20,33,61,0.06)]">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-md bg-[#EAF3F8]">
                    <LinkIcon className="h-5 w-5 text-[#0077B5]" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#929CAA]">
                      LinkedIn
                    </p>

                    {student.linkedinUrl ? (
                      <>
                        <p className="mt-1 truncate text-sm font-medium text-[#354258]">
                          {student.linkedinUrl}
                        </p>

                        <div className="mt-3 flex items-center gap-4">
                          <button
                            onClick={() =>
                              copyToClipboard(student.linkedinUrl!)
                            }
                            className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#1A365D] transition-colors hover:text-[#C88A24]"
                          >
                            <Copy className="h-3.5 w-3.5" />
                            Copy
                          </button>

                          <a
                            href={student.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#1A365D] transition-colors hover:text-[#C88A24]"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            Open
                          </a>
                        </div>
                      </>
                    ) : (
                      <p className="mt-1 text-sm text-[#8993A2]">
                        Not provided
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* GitHub */}
              <div className="rounded-lg border border-[#D8DDE4] bg-white p-5 shadow-[0_1px_4px_rgba(20,33,61,0.025)] transition-shadow hover:shadow-[0_4px_12px_rgba(20,33,61,0.06)]">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-md bg-[#EEF0F2]">
                    <GitFork className="h-5 w-5 text-[#354258]" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#929CAA]">
                      GitHub
                    </p>

                    {student.githubUrl ? (
                      <>
                        <p className="mt-1 truncate text-sm font-medium text-[#354258]">
                          {student.githubUrl}
                        </p>

                        <div className="mt-3 flex items-center gap-4">
                          <button
                            onClick={() =>
                              copyToClipboard(student.githubUrl!)
                            }
                            className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#1A365D] transition-colors hover:text-[#C88A24]"
                          >
                            <Copy className="h-3.5 w-3.5" />
                            Copy
                          </button>

                          <a
                            href={student.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#1A365D] transition-colors hover:text-[#C88A24]"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            Open
                          </a>
                        </div>
                      </>
                    ) : (
                      <p className="mt-1 text-sm text-[#8993A2]">
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
              icon={<LinkIcon className="h-4 w-4" />}
            />

            {student.projectUrls && student.projectUrls.length > 0 ? (
              <div className="overflow-hidden rounded-lg border border-[#D8DDE4] bg-white shadow-[0_1px_4px_rgba(20,33,61,0.025)]">
                {student.projectUrls.map((url, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 border-b border-[#E1E5E9] px-4 py-4 last:border-b-0 hover:bg-[#FAFBFC] md:gap-4 md:px-5"
                  >
                    <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-[#F6EBD8] font-mono text-[10px] font-bold text-[#9A691B]">
                      {String(index + 1).padStart(2, '0')}
                    </span>

                    <LinkIcon className="h-4 w-4 flex-shrink-0 text-[#8A94A3]" />

                    <span className="min-w-0 flex-1 truncate text-sm text-[#354258]">
                      {url}
                    </span>

                    <button
                      onClick={() => copyToClipboard(url)}
                      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md text-[#7B8797] transition-colors hover:bg-[#EEF2F7] hover:text-[#1A365D]"
                      title="Copy link"
                    >
                      <Copy className="h-4 w-4" />
                    </button>

                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hidden h-8 w-8 flex-shrink-0 items-center justify-center rounded-md text-[#7B8797] transition-colors hover:bg-[#F6EBD8] hover:text-[#9A691B] sm:flex"
                      title="Open project"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-[#D8DDE4] bg-white p-7">
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
              icon={<Calendar className="h-4 w-4" />}
            />

            <div className="rounded-lg border border-[#D8DDE4] bg-white px-4 shadow-[0_1px_4px_rgba(20,33,61,0.025)] md:px-6">
              <div className="grid grid-cols-1 gap-x-10 md:grid-cols-3">
                <InfoRow
                  label="Joined"
                  value={new Date(student.createdAt).toLocaleDateString()}
                  icon={<Calendar className="h-4 w-4" />}
                />

                <InfoRow
                  label="Profile Updated"
                  value={new Date(student.updatedAt).toLocaleDateString()}
                  icon={<Calendar className="h-4 w-4" />}
                />

                <InfoRow
                  label="Account Status"
                  value={
                    <span className="capitalize">{student.status}</span>
                  }
                  icon={<User className="h-4 w-4" />}
                />
              </div>
            </div>
          </section>

          {/* ====================================================
              BACK TO DIRECTORY
          ==================================================== */}

          <div className="border-t border-[#D8DDE4] py-6">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-3 rounded-md bg-[#1A365D] px-5 py-3 text-xs font-bold uppercase tracking-[0.13em] text-white shadow-[0_2px_5px_rgba(26,54,93,0.12)] transition-all hover:bg-[#14294A] hover:shadow-[0_4px_10px_rgba(26,54,93,0.16)]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Student Directory
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}