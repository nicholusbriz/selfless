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
  Maximize2,
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
    <div className="mb-3 flex items-center gap-2.5 border-b border-[#E1E5EA] pb-2.5">
      <span className="font-mono text-[9px] font-bold tracking-wider text-[#C88A24]">
        {number}
      </span>

      <span className="h-4 w-px bg-[#D9DEE5]" />

      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#F1F4F7] text-[#1A365D]">
        {icon}
      </span>

      <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#344154] md:text-xs">
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
    <div className="group flex min-w-0 items-start gap-2.5 border-b border-[#E8EBEF] py-3 last:border-b-0">
      {icon && (
        <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-[#F4F6F8] text-[#7A8594] transition-colors group-hover:text-[#1A365D]">
          {icon}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="text-[8px] font-bold uppercase tracking-[0.13em] text-[#929CAA]">
          {label}
        </p>

        <div className="mt-0.5 break-words text-[13px] leading-5 text-[#354258] md:text-sm">
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
    <div className="min-w-0 px-3 py-3 md:px-4 md:py-3.5">
      <p className="text-[8px] font-bold uppercase tracking-[0.13em] text-[#929CAA]">
        {label}
      </p>

      <div className="mt-0.5 truncate text-lg font-black tracking-tight text-[#1A365D] md:text-xl">
        {value}
      </div>

      {detail && (
        <p className="mt-0.5 text-[9px] text-[#8993A2]">{detail}</p>
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
  const [showFullImage, setShowFullImage] = useState(false);

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
        <div className="mx-auto max-w-7xl px-3 py-4 sm:px-4 md:px-6 md:py-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="h-9 w-9 animate-pulse rounded-md border border-[#D8DDE4] bg-white" />
            <div className="h-6 w-px bg-[#D8DDE4]" />
            <div className="h-3 w-28 animate-pulse rounded bg-[#D8DDE4]" />
          </div>

          <div className="overflow-hidden rounded-lg border border-[#D8DDE4] bg-white">
            <div className="h-[320px] animate-pulse bg-[#DDE2E8] sm:h-[400px] md:h-[480px]" />

            <div className="px-4 py-5 md:px-6">
              <div className="h-8 w-2/3 animate-pulse rounded bg-[#D8DDE4]" />
              <div className="mt-3 h-4 w-1/2 animate-pulse rounded bg-[#E1E5EA]" />
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 divide-x divide-y divide-[#D8DDE4] overflow-hidden rounded-lg border border-[#D8DDE4] bg-white md:grid-cols-4 md:divide-y-0">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="p-4">
                <div className="mb-2 h-2.5 w-16 animate-pulse rounded bg-[#D8DDE4]" />
                <div className="h-6 w-20 animate-pulse rounded bg-[#D8DDE4]" />
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-32 animate-pulse rounded-lg border border-[#D8DDE4] bg-white"
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
        <div className="mx-auto max-w-7xl px-3 py-4 sm:px-4 md:px-6 md:py-6">
          <button
            onClick={() => router.back()}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[#D8DDE4] bg-white text-[#596678] transition-colors hover:border-[#1A365D] hover:text-[#1A365D]"
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div className="mt-4 rounded-lg border border-[#D8DDE4] bg-white px-5 py-12 text-center md:px-8">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#FEF0F0]">
              <XCircle className="h-6 w-6 text-[#C74D4D]" />
            </div>

            <h2 className="mt-4 text-lg font-bold text-[#14213D]">
              Student profile unavailable
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#718096]">
              {error || 'Student not found'}
            </p>

            <button
              onClick={() => router.back()}
              className="mt-5 inline-flex items-center gap-2 rounded-md bg-[#1A365D] px-5 py-2.5 text-xs font-bold uppercase tracking-[0.1em] text-white transition-colors hover:bg-[#14294A]"
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
      <div className="mx-auto max-w-7xl px-3 py-4 sm:px-4 md:px-6 md:py-6">
        {/* ======================================================
            TOP NAVIGATION
        ====================================================== */}

        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => router.back()}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[#D8DDE4] bg-white text-[#596678] shadow-[0_1px_2px_rgba(20,33,61,0.03)] transition-all hover:border-[#1A365D] hover:text-[#1A365D]"
              aria-label="Go back"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            <div className="h-6 w-px bg-[#D8DDE4]" />

            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-[#C88A24]" />

              <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#6F7B8B] md:text-[10px]">
                Student Directory
              </span>
            </div>
          </div>

          <div className="hidden font-mono text-[9px] text-[#9AA3AF] sm:block">
            PROFILE / {student.studentId.slice(0, 8)}
          </div>
        </div>

        {/* ======================================================
            PROFILE
        ====================================================== */}

        <section className="overflow-hidden rounded-lg border border-[#D5DCE4] bg-white shadow-[0_1px_5px_rgba(20,33,61,0.035)]">
          {/* ====================================================
              IMAGE
          ==================================================== */}

          <div className="relative bg-[#EDF0F3]">
            <div className="relative h-[330px] w-full sm:h-[420px] md:h-[500px]">
              {student.profileImage ? (
                <Image
                  src={student.profileImage}
                  alt={`${student.firstName} ${student.lastName}`}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 1200px"
                  className="object-contain object-center"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-[#EEF1F4]">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#DCE2E8] text-[#7C8795]">
                    <User className="h-11 w-11" />
                  </div>
                </div>
              )}

              <div className="absolute inset-x-0 top-0 h-1 bg-[#C88A24]" />
            </div>
          </div>

          {/* ====================================================
              IMAGE ACTION + IDENTITY
          ==================================================== */}

          <div className="px-4 py-4 sm:px-5 md:px-6 md:py-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0">
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#929CAA]">
                  Student Profile
                </p>

                <h1 className="mt-1 break-words text-3xl font-black leading-tight tracking-tight text-[#14213D] sm:text-4xl md:text-5xl">
                  {student.firstName} {student.lastName}
                </h1>

                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] text-[#657286]">
                  <span className="flex min-w-0 items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 flex-shrink-0 text-[#8993A2]" />
                    <span className="break-all">{student.email}</span>
                  </span>

                  {student.techCenter && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-[#8993A2]" />
                      <span>
                        {student.techCenter.name}
                        {student.techCenter.country?.name &&
                          `, ${student.techCenter.country.name}`}
                      </span>
                    </span>
                  )}
                </div>
              </div>

              {/* Status */}
              <div
                className={`inline-flex w-fit flex-shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 ${
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

            {/* ==================================================
                VIEW FULL IMAGE
                Normal document flow — scrolls with the page.
            ================================================== */}

            {student.profileImage && (
              <div className="mt-4 border-t border-[#E7EAEE] pt-3">
                <button
                  type="button"
                  onClick={() => setShowFullImage(true)}
                  className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.11em] text-[#1A365D] transition-colors hover:text-[#C88A24]"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                  View full image
                </button>
              </div>
            )}

            {/* Student metadata */}
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[#E7EAEE] pt-3 text-[9px] uppercase tracking-[0.1em] text-[#8A94A3]">
              <span>
                ID{' '}
                <strong className="font-mono font-semibold text-[#536174]">
                  {student.studentId}
                </strong>
              </span>

              <span>
                Role{' '}
                <strong className="font-semibold capitalize text-[#536174]">
                  {student.role}
                </strong>
              </span>

              <span>
                Joined{' '}
                <strong className="font-semibold text-[#536174]">
                  {new Date(student.createdAt).toLocaleDateString()}
                </strong>
              </span>

              {student.generalCourse && (
                <span>
                  Course{' '}
                  <strong className="font-semibold text-[#536174]">
                    {student.generalCourse}
                  </strong>
                </span>
              )}
            </div>
          </div>
        </section>

        {/* ======================================================
            FULL IMAGE VIEWER
            Normal modal only when explicitly opened.
        ====================================================== */}

        {showFullImage && student.profileImage && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-3 sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-label="Full student profile image"
            onClick={() => setShowFullImage(false)}
          >
            <div
              className="relative flex h-full w-full max-w-6xl items-center justify-center"
              onClick={(event) => event.stopPropagation()}
            >
              <Image
                src={student.profileImage}
                alt={`${student.firstName} ${student.lastName}`}
                fill
                sizes="100vw"
                className="object-contain"
              />

              <button
                type="button"
                onClick={() => setShowFullImage(false)}
                className="absolute right-2 top-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#1A365D] shadow-md transition-colors hover:bg-[#F1F4F7]"
                aria-label="Close full image"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* ======================================================
            QUICK ACADEMIC STRIP
        ====================================================== */}

        <section className="mt-3 grid grid-cols-2 overflow-hidden rounded-lg border border-[#D8DDE4] bg-white shadow-[0_1px_3px_rgba(20,33,61,0.025)] md:grid-cols-4">
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
              detail="Academic credits"
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
                  <span className="text-sm font-bold text-[#8993A2]">
                    Not specified
                  </span>
                ) : student.takesReligion ? (
                  <span className="text-sm font-bold text-[#247653]">
                    Takes Religion
                  </span>
                ) : (
                  <span className="text-sm font-bold text-[#C74D4D]">
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

        <div className="mt-7">
          {/* ====================================================
              ACADEMIC
          ==================================================== */}

          <section className="mb-7">
            <SectionHeading
              number="01"
              title="Academic Information"
              icon={<GraduationCap className="h-3.5 w-3.5" />}
            />

            <div className="rounded-lg border border-[#D8DDE4] bg-white px-3 shadow-[0_1px_3px_rgba(20,33,61,0.02)] md:px-5">
              <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
                <InfoRow
                  label="General Degree Course"
                  value={student.generalCourse || 'Not provided'}
                  icon={<Book className="h-3.5 w-3.5" />}
                />

                <InfoRow
                  label="Tech Center"
                  value={
                    student.techCenter
                      ? student.techCenter.name
                      : 'Not assigned'
                  }
                  icon={<MapPin className="h-3.5 w-3.5" />}
                />

                <InfoRow
                  label="Country"
                  value={
                    student.techCenter?.country?.name ||
                    student.country ||
                    'Not provided'
                  }
                  icon={<Globe className="h-3.5 w-3.5" />}
                />

                <InfoRow
                  label="Student Status"
                  value={
                    <span className="capitalize">{student.status}</span>
                  }
                  icon={<CheckCircle className="h-3.5 w-3.5" />}
                />
              </div>
            </div>
          </section>

          {/* ====================================================
              COURSE UNITS
          ==================================================== */}

          <section className="mb-7">
            <SectionHeading
              number="02"
              title={`Course Units (${student.studentCourses.length})`}
              icon={<Book className="h-3.5 w-3.5" />}
            />

            {student.studentCourses.length > 0 ? (
              <div className="overflow-hidden rounded-lg border border-[#D8DDE4] bg-white shadow-[0_1px_3px_rgba(20,33,61,0.02)]">
                {/* Desktop */}
                <div className="hidden grid-cols-[100px_1fr_90px_110px] gap-4 bg-[#1A365D] px-4 py-2.5 md:grid">
                  <span className="text-[8px] font-bold uppercase tracking-[0.14em] text-white/65">
                    Code
                  </span>

                  <span className="text-[8px] font-bold uppercase tracking-[0.14em] text-white/65">
                    Course Unit
                  </span>

                  <span className="text-[8px] font-bold uppercase tracking-[0.14em] text-white/65">
                    Credits
                  </span>

                  <span className="text-[8px] font-bold uppercase tracking-[0.14em] text-white/65">
                    Status
                  </span>
                </div>

                {student.studentCourses.map((course) => (
                  <div
                    key={course.id}
                    className="group border-b border-[#E4E8ED] last:border-b-0 hover:bg-[#FAFBFC]"
                  >
                    {/* Desktop */}
                    <div className="hidden grid-cols-[100px_1fr_90px_110px] items-center gap-4 px-4 py-3 md:grid">
                      <span className="font-mono text-[11px] font-bold text-[#C88A24]">
                        {course.code}
                      </span>

                      <span className="text-[13px] font-semibold text-[#354258]">
                        {course.courseUnit}
                      </span>

                      <span className="text-[13px] text-[#657286]">
                        {course.credits}
                      </span>

                      <span className="inline-flex w-fit rounded-full bg-[#F1F4F7] px-2 py-1 text-[9px] font-semibold capitalize text-[#657286]">
                        {course.status}
                      </span>
                    </div>

                    {/* Mobile */}
                    <div className="p-3.5 md:hidden">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <span className="font-mono text-[11px] font-bold text-[#C88A24]">
                            {course.code}
                          </span>

                          <p className="mt-0.5 break-words text-[13px] font-bold leading-5 text-[#354258]">
                            {course.courseUnit}
                          </p>
                        </div>

                        <span className="whitespace-nowrap rounded-md bg-[#EEF2F7] px-2 py-1 text-[9px] font-bold text-[#1A365D]">
                          {course.credits} credits
                        </span>
                      </div>

                      <div className="mt-2 flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#8A94A3]" />

                        <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-[#929CAA]">
                          {course.status}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="flex items-center justify-between border-t border-[#E0E5EA] bg-[#F7F8FA] px-4 py-3">
                  <span className="text-[9px] font-bold uppercase tracking-[0.13em] text-[#7B8797]">
                    Total Credits
                  </span>

                  <span className="text-lg font-black text-[#1A365D]">
                    {totalCredits}
                  </span>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-[#D8DDE4] bg-white p-5 text-[13px] text-[#8993A2]">
                No course units provided.
              </div>
            )}
          </section>

          {/* ====================================================
              PERSONAL + CONTACT
          ==================================================== */}

          <section className="mb-7">
            <SectionHeading
              number="03"
              title="Personal & Contact"
              icon={<User className="h-3.5 w-3.5" />}
            />

            <div className="rounded-lg border border-[#D8DDE4] bg-white px-3 shadow-[0_1px_3px_rgba(20,33,61,0.02)] md:px-5">
              <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
                <InfoRow
                  label="Email Address"
                  value={student.email || 'Not provided'}
                  icon={<Mail className="h-3.5 w-3.5" />}
                />

                <InfoRow
                  label="Phone Number"
                  value={student.phoneNumber || 'Not provided'}
                  icon={<Phone className="h-3.5 w-3.5" />}
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
                  icon={<User className="h-3.5 w-3.5" />}
                />

                <InfoRow
                  label="Country"
                  value={
                    student.country ||
                    student.techCenter?.country?.name ||
                    'Not provided'
                  }
                  icon={<Globe className="h-3.5 w-3.5" />}
                />

                <InfoRow
                  label="City"
                  value={student.city || 'Not provided'}
                  icon={<Map className="h-3.5 w-3.5" />}
                />

                <InfoRow
                  label="Town"
                  value={student.town || 'Not provided'}
                  icon={<MapPin className="h-3.5 w-3.5" />}
                />

                <InfoRow
                  label="Street"
                  value={student.street || 'Not provided'}
                  icon={<MapPin className="h-3.5 w-3.5" />}
                />
              </div>
            </div>
          </section>

          {/* ====================================================
              PROFESSIONAL LINKS
          ==================================================== */}

          <section className="mb-7">
            <SectionHeading
              number="04"
              title="Professional Links"
              icon={<Briefcase className="h-3.5 w-3.5" />}
            />

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {/* LinkedIn */}
              <div className="rounded-lg border border-[#D8DDE4] bg-white p-4 shadow-[0_1px_3px_rgba(20,33,61,0.02)]">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-[#EAF3F8]">
                    <LinkIcon className="h-4 w-4 text-[#0077B5]" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-[#929CAA]">
                      LinkedIn
                    </p>

                    {student.linkedinUrl ? (
                      <>
                        <p className="mt-1 truncate text-[13px] font-medium text-[#354258]">
                          {student.linkedinUrl}
                        </p>

                        <div className="mt-2 flex items-center gap-4">
                          <button
                            onClick={() =>
                              copyToClipboard(student.linkedinUrl!)
                            }
                            className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.09em] text-[#1A365D] transition-colors hover:text-[#C88A24]"
                          >
                            <Copy className="h-3 w-3" />
                            Copy
                          </button>

                          <a
                            href={student.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.09em] text-[#1A365D] transition-colors hover:text-[#C88A24]"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Open
                          </a>
                        </div>
                      </>
                    ) : (
                      <p className="mt-1 text-[13px] text-[#8993A2]">
                        Not provided
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* GitHub */}
              <div className="rounded-lg border border-[#D8DDE4] bg-white p-4 shadow-[0_1px_3px_rgba(20,33,61,0.02)]">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-[#EEF0F2]">
                    <GitFork className="h-4 w-4 text-[#354258]" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-[#929CAA]">
                      GitHub
                    </p>

                    {student.githubUrl ? (
                      <>
                        <p className="mt-1 truncate text-[13px] font-medium text-[#354258]">
                          {student.githubUrl}
                        </p>

                        <div className="mt-2 flex items-center gap-4">
                          <button
                            onClick={() =>
                              copyToClipboard(student.githubUrl!)
                            }
                            className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.09em] text-[#1A365D] transition-colors hover:text-[#C88A24]"
                          >
                            <Copy className="h-3 w-3" />
                            Copy
                          </button>

                          <a
                            href={student.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.09em] text-[#1A365D] transition-colors hover:text-[#C88A24]"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Open
                          </a>
                        </div>
                      </>
                    ) : (
                      <p className="mt-1 text-[13px] text-[#8993A2]">
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

          <section className="mb-7">
            <SectionHeading
              number="05"
              title="Student Projects"
              icon={<LinkIcon className="h-3.5 w-3.5" />}
            />

            {student.projectUrls && student.projectUrls.length > 0 ? (
              <div className="overflow-hidden rounded-lg border border-[#D8DDE4] bg-white shadow-[0_1px_3px_rgba(20,33,61,0.02)]">
                {student.projectUrls.map((url, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2.5 border-b border-[#E1E5E9] px-3.5 py-3 last:border-b-0 hover:bg-[#FAFBFC] md:gap-3 md:px-4"
                  >
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-[#F6EBD8] font-mono text-[9px] font-bold text-[#9A691B]">
                      {String(index + 1).padStart(2, '0')}
                    </span>

                    <LinkIcon className="h-3.5 w-3.5 flex-shrink-0 text-[#8A94A3]" />

                    <span className="min-w-0 flex-1 truncate text-[13px] text-[#354258]">
                      {url}
                    </span>

                    <button
                      onClick={() => copyToClipboard(url)}
                      className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md text-[#7B8797] transition-colors hover:bg-[#EEF2F7] hover:text-[#1A365D]"
                      title="Copy link"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>

                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hidden h-7 w-7 flex-shrink-0 items-center justify-center rounded-md text-[#7B8797] transition-colors hover:bg-[#F6EBD8] hover:text-[#9A691B] sm:flex"
                      title="Open project"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-[#D8DDE4] bg-white p-5">
                <p className="text-[13px] text-[#8993A2]">
                  No projects provided.
                </p>
              </div>
            )}
          </section>

          {/* ====================================================
              ACCOUNT
          ==================================================== */}

          <section className="mb-7">
            <SectionHeading
              number="06"
              title="Account Information"
              icon={<Calendar className="h-3.5 w-3.5" />}
            />

            <div className="rounded-lg border border-[#D8DDE4] bg-white px-3 shadow-[0_1px_3px_rgba(20,33,61,0.02)] md:px-5">
              <div className="grid grid-cols-1 gap-x-8 md:grid-cols-3">
                <InfoRow
                  label="Joined"
                  value={new Date(student.createdAt).toLocaleDateString()}
                  icon={<Calendar className="h-3.5 w-3.5" />}
                />

                <InfoRow
                  label="Profile Updated"
                  value={new Date(student.updatedAt).toLocaleDateString()}
                  icon={<Calendar className="h-3.5 w-3.5" />}
                />

                <InfoRow
                  label="Account Status"
                  value={
                    <span className="capitalize">{student.status}</span>
                  }
                  icon={<User className="h-3.5 w-3.5" />}
                />
              </div>
            </div>
          </section>

          {/* ====================================================
              BACK TO DIRECTORY
          ==================================================== */}

          <div className="border-t border-[#D8DDE4] py-5">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2.5 rounded-md bg-[#1A365D] px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.11em] text-white shadow-[0_1px_3px_rgba(26,54,93,0.12)] transition-all hover:bg-[#14294A]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Student Directory
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}