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
  MessageSquare,
  Maximize2,
  ImageIcon,
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
    <div className="mb-4 flex items-center gap-3 border-b border-[#E5E7EB] pb-3">
      <span className="font-mono text-[10px] font-bold tracking-wider text-[#C59B4C]">
        {number}
      </span>
      <span className="h-4 w-px bg-[#D1D5DB]" />
      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#F3F4F6] text-[#1A2B4C]">
        {icon}
      </span>
      <h2 className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#1A2B4C] md:text-[13px]">
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
    <div className="group flex min-w-0 items-start gap-3 border-b border-[#F3F4F6] py-3.5 last:border-b-0">
      {icon && (
        <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-[#F8F9FA] text-[#6B7280] transition-colors group-hover:bg-[#C59B4C]/10 group-hover:text-[#C59B4C]">
          {icon}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-[#6B7280]">
          {label}
        </p>
        <div className="mt-1 break-words text-[14px] font-medium leading-5 text-[#1A2B4C] md:text-[15px]">
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
  accent,
}: {
  label: string;
  value: React.ReactNode;
  detail?: string;
  accent?: 'brass' | 'moss' | 'rust' | 'slate';
}) => {
  const accentColor = {
    brass: 'text-[#C59B4C]',
    moss: 'text-[#55705B]',
    rust: 'text-[#A4462F]',
    slate: 'text-[#3E5C76]',
  }[accent || 'slate'];

  return (
    <div className="min-w-0 px-4 py-4 md:px-5 md:py-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-[#6B7280]">
        {label}
      </p>
      <div className={`mt-1 truncate text-xl font-black tracking-tight md:text-2xl ${accentColor}`}>
        {value}
      </div>
      {detail && <p className="mt-1 text-[10px] text-[#9CA3AF]">{detail}</p>}
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
          headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.message || data?.error || 'Failed to fetch student profile');
        }
        setStudent(data.student);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch student profile';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (params.studentId) fetchStudent();
  }, [params.studentId]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* preserve functionality */
    }
  };

  const totalCredits =
    student?.studentCourses?.reduce((sum, course) => sum + course.credits, 0) || 0;

  /* ============================================================
     LOADING
  ============================================================ */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA]">
        <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 md:py-8">
          <div className="mb-5 flex items-center gap-3">
            <div className="h-9 w-9 animate-pulse rounded-lg border border-[#E5E7EB] bg-white" />
            <div className="h-6 w-px bg-[#E5E7EB]" />
            <div className="h-3 w-32 animate-pulse rounded bg-[#E5E7EB]" />
          </div>

          <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white">
            <div className="h-[320px] animate-pulse bg-[#E5E7EB] sm:h-[400px]" />
            <div className="px-5 py-6">
              <div className="h-8 w-2/3 animate-pulse rounded bg-[#E5E7EB]" />
              <div className="mt-3 h-4 w-1/2 animate-pulse rounded bg-[#F3F4F6]" />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 divide-x divide-y divide-[#E5E7EB] overflow-hidden rounded-xl border border-[#E5E7EB] bg-white md:grid-cols-4 md:divide-y-0">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="p-5">
                <div className="mb-2 h-3 w-20 animate-pulse rounded bg-[#E5E7EB]" />
                <div className="h-7 w-24 animate-pulse rounded bg-[#E5E7EB]" />
              </div>
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
      <div className="min-h-screen bg-[#F8F9FA]">
        <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 md:py-8">
          <button
            onClick={() => router.back()}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#4B5646] transition-colors hover:border-[#C59B4C] hover:text-[#1A2B4C]"
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div className="mt-5 rounded-xl border border-[#E5E7EB] bg-white px-5 py-16 text-center shadow-sm md:px-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#FBF0EC]">
              <XCircle className="h-7 w-7 text-[#A4462F]" />
            </div>
            <h2 className="mt-5 text-lg font-semibold text-[#1A2B4C]">
              Student profile unavailable
            </h2>
            <p className="mx-auto mt-2 max-w-md text-[13px] leading-6 text-[#4B5646]">
              {error || 'Student not found'}
            </p>
            <button
              onClick={() => router.back()}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#1A2B4C] px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.1em] text-white transition-colors hover:bg-[#C59B4C]"
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

  const initials = `${student.firstName.charAt(0)}${student.lastName.charAt(0)}`.toUpperCase();

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 md:py-8">
        {/* ======================================================
            TOP NAVIGATION
        ====================================================== */}

        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#4B5646] shadow-sm transition-all hover:border-[#C59B4C] hover:text-[#1A2B4C]"
              aria-label="Go back"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="h-6 w-px bg-[#E5E7EB]" />
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-[#C59B4C]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#6B7280] md:text-[11px]">
                Student Directory
              </span>
            </div>
          </div>
          <div className="hidden font-mono text-[10px] text-[#9CA3AF] sm:block">
            PROFILE / {student.studentId.slice(0, 8)}
          </div>
        </div>

        {/* ======================================================
            HERO PROFILE CARD
        ====================================================== */}

        <section className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
          <div className="relative bg-[#1A2B4C]">
            <div className="relative h-[280px] w-full sm:h-[340px] md:h-[400px]">
              {student.profileImage ? (
                <Image
                  src={student.profileImage}
                  alt={`${student.firstName} ${student.lastName}`}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 1200px"
                  className="object-cover object-center"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#1A2B4C] to-[#2C3E5A]">
                  <div className="flex h-28 w-28 items-center justify-center rounded-full border-2 border-white/20 bg-white/5">
                    <span className="font-mono text-3xl font-black text-white/80">
                      {initials}
                    </span>
                  </div>
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-[#1A2B4C] via-[#1A2B4C]/30 to-transparent" />
              <div className="absolute inset-x-0 top-0 h-1 bg-[#C59B4C]" />

              {student.profileImage && (
                <button
                  type="button"
                  onClick={() => setShowFullImage(true)}
                  className="absolute right-3 top-4 inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.1em] text-white backdrop-blur-sm transition-colors hover:bg-black/60"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">View Full Image</span>
                  <span className="sm:hidden">View</span>
                </button>
              )}

              <div
                className={`absolute left-3 top-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] backdrop-blur-sm ${
                  student.isActive
                    ? 'bg-[#55705B]/90 text-white'
                    : 'bg-[#A4462F]/90 text-white'
                }`}
              >
                {student.isActive ? (
                  <CheckCircle className="h-3.5 w-3.5" />
                ) : (
                  <XCircle className="h-3.5 w-3.5" />
                )}
                {student.isActive ? 'Active' : 'Inactive'}
              </div>
            </div>

            <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 md:p-7">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#C59B4C]">
                Student Profile
              </p>
              <h1 className="mt-1.5 break-words text-2xl font-black leading-tight tracking-tight text-white sm:text-3xl md:text-4xl lg:text-5xl">
                {student.firstName} {student.lastName}
              </h1>
              <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px] text-white/85">
                <span className="flex min-w-0 items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="break-all">{student.email}</span>
                </span>
                {student.techCenter && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="truncate">
                      {student.techCenter.name}
                      {student.techCenter.country?.name && `, ${student.techCenter.country.name}`}
                    </span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-[#E5E7EB] bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[10px] uppercase tracking-[0.1em] text-[#6B7280]">
              <span>
                ID <strong className="font-mono font-semibold text-[#1A2B4C]">{student.studentId}</strong>
              </span>
              <span>
                Role <strong className="font-semibold capitalize text-[#1A2B4C]">{student.role}</strong>
              </span>
              <span>
                Joined <strong className="font-semibold text-[#1A2B4C]">{new Date(student.createdAt).toLocaleDateString()}</strong>
              </span>
            </div>

            <button
              type="button"
              onClick={() => router.push(`/dashboard/messages?userId=${encodeURIComponent(student._id)}`)}
              className="inline-flex w-fit items-center gap-2 rounded-lg bg-[#1A2B4C] px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.1em] text-white transition-colors hover:bg-[#C59B4C]"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              Message Student
            </button>
          </div>
        </section>

        {/* ======================================================
            QUICK STATS
        ====================================================== */}

        <section className="mt-4 grid grid-cols-2 overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-sm md:grid-cols-4">
          <div className="border-b border-r border-[#E5E7EB] md:border-b-0">
            <StatItem
              label="Course Units"
              value={student.studentCourses.length}
              detail="Registered units"
              accent="slate"
            />
          </div>
          <div className="border-b border-[#E5E7EB] md:border-b-0 md:border-r">
            <StatItem
              label="Total Credits"
              value={totalCredits}
              detail="Academic credits"
              accent="brass"
            />
          </div>
          <div className="border-r border-[#E5E7EB]">
            <StatItem
              label="Joined"
              value={new Date(student.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              detail="Registration date"
              accent="moss"
            />
          </div>
          <div>
            <StatItem
              label="Religion"
              value={
                student.takesReligion === null ? (
                  <span className="text-base font-bold text-[#9CA3AF]">N/A</span>
                ) : student.takesReligion ? (
                  <span className="text-base font-bold text-[#55705B]">Yes</span>
                ) : (
                  <span className="text-base font-bold text-[#A4462F]">No</span>
                )
              }
              detail="Academic record"
              accent={student.takesReligion ? 'moss' : 'rust'}
            />
          </div>
        </section>

        {/* ======================================================
            MAIN CONTENT
        ====================================================== */}

        <div className="mt-8">
          {/* ACADEMIC */}
          <section className="mb-8">
            <SectionHeading number="01" title="Academic Information" icon={<GraduationCap className="h-4 w-4" />} />
            <div className="rounded-xl border border-[#E5E7EB] bg-white px-4 shadow-sm md:px-6">
              <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
                <InfoRow label="General Degree Course" value={student.generalCourse || 'Not provided'} icon={<Book className="h-4 w-4" />} />
                <InfoRow label="Tech Center" value={student.techCenter ? student.techCenter.name : 'Not assigned'} icon={<MapPin className="h-4 w-4" />} />
                <InfoRow label="Country" value={student.techCenter?.country?.name || student.country || 'Not provided'} icon={<Globe className="h-4 w-4" />} />
                <InfoRow label="Student Status" value={<span className="capitalize">{student.status}</span>} icon={<CheckCircle className="h-4 w-4" />} />
              </div>
            </div>
          </section>

          {/* COURSE UNITS */}
          <section className="mb-8">
            <SectionHeading number="02" title={`Course Units (${student.studentCourses.length})`} icon={<Book className="h-4 w-4" />} />
            {student.studentCourses.length > 0 ? (
              <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-sm">
                <div className="hidden grid-cols-[100px_1fr_90px_110px] gap-4 bg-[#1A2B4C] px-5 py-3 md:grid">
                  <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/70">Code</span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/70">Course Unit</span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/70">Credits</span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/70">Status</span>
                </div>

                {student.studentCourses.map((course) => (
                  <div key={course.id} className="group border-b border-[#F3F4F6] last:border-b-0 hover:bg-[#F8F9FA]">
                    <div className="hidden grid-cols-[100px_1fr_90px_110px] items-center gap-4 px-5 py-3.5 md:grid">
                      <span className="font-mono text-[12px] font-bold text-[#C59B4C]">{course.code}</span>
                      <span className="text-[14px] font-semibold text-[#1A2B4C]">{course.courseUnit}</span>
                      <span className="text-[14px] font-medium text-[#4B5646]">{course.credits}</span>
                      <span className="inline-flex w-fit rounded-full bg-[#F3F4F6] px-2.5 py-1 text-[10px] font-semibold capitalize text-[#4B5646]">
                        {course.status}
                      </span>
                    </div>

                    <div className="p-4 md:hidden">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <span className="font-mono text-[11px] font-bold text-[#C59B4C]">{course.code}</span>
                          <p className="mt-1 break-words text-[14px] font-bold leading-5 text-[#1A2B4C]">
                            {course.courseUnit}
                          </p>
                        </div>
                        <span className="whitespace-nowrap rounded-md bg-[#F3F4F6] px-2.5 py-1 text-[10px] font-bold text-[#1A2B4C]">
                          {course.credits} cr
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#C59B4C]" />
                        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6B7280]">
                          {course.status}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="flex items-center justify-between border-t border-[#E5E7EB] bg-[#F8F9FA] px-5 py-4">
                  <span className="text-[10px] font-bold uppercase tracking-[0.13em] text-[#6B7280]">Total Credits</span>
                  <span className="text-xl font-black text-[#C59B4C]">{totalCredits}</span>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 text-[13px] text-[#4B5646]">
                No course units provided.
              </div>
            )}
          </section>

          {/* PERSONAL + CONTACT */}
          <section className="mb-8">
            <SectionHeading number="03" title="Personal & Contact" icon={<User className="h-4 w-4" />} />
            <div className="rounded-xl border border-[#E5E7EB] bg-white px-4 shadow-sm md:px-6">
              <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
                <InfoRow label="Email Address" value={student.email || 'Not provided'} icon={<Mail className="h-4 w-4" />} />
                <InfoRow label="Phone Number" value={student.phoneNumber || 'Not provided'} icon={<Phone className="h-4 w-4" />} />
                <InfoRow label="Gender" value={student.gender ? <span className="capitalize">{student.gender}</span> : 'Not provided'} icon={<User className="h-4 w-4" />} />
                <InfoRow label="Country" value={student.country || student.techCenter?.country?.name || 'Not provided'} icon={<Globe className="h-4 w-4" />} />
                <InfoRow label="City" value={student.city || 'Not provided'} icon={<Map className="h-4 w-4" />} />
                <InfoRow label="Town" value={student.town || 'Not provided'} icon={<MapPin className="h-4 w-4" />} />
                <InfoRow label="Street" value={student.street || 'Not provided'} icon={<MapPin className="h-4 w-4" />} />
              </div>
            </div>
          </section>

          {/* PROFESSIONAL LINKS */}
          <section className="mb-8">
            <SectionHeading number="04" title="Professional Links" icon={<Briefcase className="h-4 w-4" />} />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#EAF3F8]">
                    <LinkIcon className="h-4 w-4 text-[#0077B5]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#6B7280]">LinkedIn</p>
                    {student.linkedinUrl ? (
                      <>
                        <p className="mt-1.5 truncate text-[13px] font-medium text-[#1A2B4C]">{student.linkedinUrl}</p>
                        <div className="mt-3 flex items-center gap-4">
                          <button onClick={() => copyToClipboard(student.linkedinUrl!)} className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.09em] text-[#1A2B4C] transition-colors hover:text-[#C59B4C]">
                            <Copy className="h-3 w-3" /> Copy
                          </button>
                          <a href={student.linkedinUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.09em] text-[#1A2B4C] transition-colors hover:text-[#C59B4C]">
                            <ExternalLink className="h-3 w-3" /> Open
                          </a>
                        </div>
                      </>
                    ) : (
                      <p className="mt-1.5 text-[13px] text-[#9CA3AF]">Not provided</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#F3F4F6]">
                    <GitFork className="h-4 w-4 text-[#1A2B4C]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#6B7280]">GitHub</p>
                    {student.githubUrl ? (
                      <>
                        <p className="mt-1.5 truncate text-[13px] font-medium text-[#1A2B4C]">{student.githubUrl}</p>
                        <div className="mt-3 flex items-center gap-4">
                          <button onClick={() => copyToClipboard(student.githubUrl!)} className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.09em] text-[#1A2B4C] transition-colors hover:text-[#C59B4C]">
                            <Copy className="h-3 w-3" /> Copy
                          </button>
                          <a href={student.githubUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.09em] text-[#1A2B4C] transition-colors hover:text-[#C59B4C]">
                            <ExternalLink className="h-3 w-3" /> Open
                          </a>
                        </div>
                      </>
                    ) : (
                      <p className="mt-1.5 text-[13px] text-[#9CA3AF]">Not provided</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* PROJECTS */}
          <section className="mb-8">
            <SectionHeading number="05" title="Student Projects" icon={<LinkIcon className="h-4 w-4" />} />
            {student.projectUrls && student.projectUrls.length > 0 ? (
              <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-sm">
                {student.projectUrls.map((url, index) => (
                  <div key={index} className="flex items-center gap-3 border-b border-[#F3F4F6] px-4 py-3.5 last:border-b-0 hover:bg-[#F8F9FA] md:px-5">
                    <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-[#FBF7EE] font-mono text-[10px] font-bold text-[#8A6328]">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <LinkIcon className="h-3.5 w-3.5 flex-shrink-0 text-[#9CA3AF]" />
                    <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-[#1A2B4C]">{url}</span>
                    <button onClick={() => copyToClipboard(url)} className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md text-[#6B7280] transition-colors hover:bg-[#F3F4F6] hover:text-[#1A2B4C]" title="Copy link">
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    <a href={url} target="_blank" rel="noopener noreferrer" className="hidden h-8 w-8 flex-shrink-0 items-center justify-center rounded-md text-[#6B7280] transition-colors hover:bg-[#FBF7EE] hover:text-[#8A6328] sm:flex" title="Open project">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
                <p className="text-[13px] text-[#4B5646]">No projects provided.</p>
              </div>
            )}
          </section>

          {/* GALLERY — Full unzoomed image display */}
          {student.profileImage && (
            <section className="mb-8">
              <SectionHeading number="06" title="Gallery" icon={<ImageIcon className="h-4 w-4" />} />
              <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-sm md:p-5">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {/* Profile Image Tile — shows full image, unzoomed */}
                  <button
                    type="button"
                    onClick={() => setShowFullImage(true)}
                    className="group relative aspect-video w-full overflow-hidden rounded-lg border border-[#E5E7EB] bg-[#F8F9FA] transition-all hover:border-[#C59B4C] hover:shadow-md"
                  >
                    <Image
                      src={student.profileImage}
                      alt={`${student.firstName} ${student.lastName}`}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-contain p-2"
                    />
                    <div className="pointer-events-none absolute inset-0 flex items-end justify-between bg-gradient-to-t from-black/50 via-transparent to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
                      <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-white">
                        Profile Photo
                      </span>
                      <Maximize2 className="h-4 w-4 text-white" />
                    </div>
                  </button>
                </div>
                <p className="mt-3 text-[11px] text-[#6B7280]">
                  Click any image to view it in full size.
                </p>
              </div>
            </section>
          )}

          {/* ACCOUNT */}
          <section className="mb-8">
            <SectionHeading number={student.profileImage ? "07" : "06"} title="Account Information" icon={<Calendar className="h-4 w-4" />} />
            <div className="rounded-xl border border-[#E5E7EB] bg-white px-4 shadow-sm md:px-6">
              <div className="grid grid-cols-1 gap-x-8 md:grid-cols-3">
                <InfoRow label="Joined" value={new Date(student.createdAt).toLocaleDateString()} icon={<Calendar className="h-4 w-4" />} />
                <InfoRow label="Profile Updated" value={new Date(student.updatedAt).toLocaleDateString()} icon={<Calendar className="h-4 w-4" />} />
                <InfoRow label="Account Status" value={<span className="capitalize">{student.status}</span>} icon={<User className="h-4 w-4" />} />
              </div>
            </div>
          </section>

          {/* BACK */}
          <div className="border-t border-[#E5E7EB] py-6">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2.5 rounded-lg bg-[#1A2B4C] px-5 py-3 text-[10px] font-bold uppercase tracking-[0.11em] text-white shadow-sm transition-all hover:bg-[#C59B4C]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Student Directory
            </button>
          </div>
        </div>

        {/* ======================================================
            FULL IMAGE MODAL
        ====================================================== */}

        {showFullImage && student.profileImage && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-3 sm:p-6"
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
                className="absolute right-2 top-2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#1A2B4C] shadow-lg transition-colors hover:bg-[#F3F4F6]"
                aria-label="Close full image"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}