'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
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
import { getResponseError, isRecord } from '../../response-guards';
import VerifiedBadge from '@/components/VerifiedBadge';

interface StudentProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  profileImage: string | null;
  hasVerifiedBadge?: boolean;
  profileImageUrls: string[];
  profileGallery: Array<{
    id: string;
    publicUrl: string;
    title: string;
  }>;
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
  bio?: string | null;
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

function isStudentProfile(value: unknown): value is StudentProfile {
  return (
    isRecord(value) &&
    typeof value._id === 'string' &&
    typeof value.firstName === 'string' &&
    typeof value.lastName === 'string' &&
    typeof value.email === 'string' &&
    (typeof value.phoneNumber === 'string' || value.phoneNumber === null) &&
    (typeof value.profileImage === 'string' || value.profileImage === null) &&
    Array.isArray(value.profileImageUrls) &&
    value.profileImageUrls.every((url) => typeof url === 'string') &&
    Array.isArray(value.profileGallery) &&
    value.profileGallery.every(
      (image) =>
        isRecord(image) &&
        typeof image.id === 'string' &&
        typeof image.publicUrl === 'string' &&
        typeof image.title === 'string',
    ) &&
    typeof value.role === 'string' &&
    typeof value.studentId === 'string' &&
    (value.techCenter === null ||
      (isRecord(value.techCenter) &&
        typeof value.techCenter.id === 'string' &&
        typeof value.techCenter.name === 'string' &&
        isRecord(value.techCenter.country) &&
        typeof value.techCenter.country.name === 'string')) &&
    (typeof value.country === 'string' || value.country === null) &&
    (typeof value.city === 'string' || value.city === null) &&
    (typeof value.town === 'string' || value.town === null) &&
    (typeof value.street === 'string' || value.street === null) &&
    (typeof value.generalCourse === 'string' || value.generalCourse === null) &&
    (typeof value.takesReligion === 'boolean' || value.takesReligion === null) &&
    (typeof value.linkedinUrl === 'string' || value.linkedinUrl === null) &&
    (typeof value.githubUrl === 'string' || value.githubUrl === null) &&
    Array.isArray(value.projectUrls) &&
    value.projectUrls.every((url) => typeof url === 'string') &&
    (typeof value.gender === 'string' || value.gender === null) &&
    typeof value.createdAt === 'string' &&
    typeof value.updatedAt === 'string' &&
    typeof value.status === 'string' &&
    typeof value.isActive === 'boolean' &&
    (typeof value.lastLoginAt === 'string' || value.lastLoginAt === null) &&
    Array.isArray(value.studentCourses) &&
    value.studentCourses.every(
      (course) =>
        isRecord(course) &&
        typeof course.id === 'string' &&
        typeof course.code === 'string' &&
        typeof course.courseUnit === 'string' &&
        typeof course.credits === 'number' &&
        typeof course.status === 'string',
    )
  );
}

/* ============================================================
   SHARED UI — compact
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
    <div className="mb-2.5 flex items-center gap-2 border-b border-[#E5E7EB] pb-2">
      <span className="font-mono text-[10px] font-bold tracking-wider text-[#C59B4C]">
        {number}
      </span>
      <span className="h-3.5 w-px bg-[#D1D5DB]" />
      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#F3F4F6] text-[#1A2B4C]">
        {icon}
      </span>
      <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#1A2B4C] md:text-[12px]">
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
    <div className="group flex min-w-0 items-start gap-2.5 border-b border-[#F3F4F6] py-2.5 last:border-b-0 md:last:border-b">
      {icon && (
        <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-[#F8F9FA] text-[#6B7280] transition-colors group-hover:bg-[#C59B4C]/10 group-hover:text-[#C59B4C]">
          {icon}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#6B7280]">
          {label}
        </p>
        <div className="mt-0.5 break-words text-[13px] font-medium leading-5 text-[#1A2B4C] md:text-[14px]">
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
    <div className="min-w-0 px-3 py-3 md:px-4 md:py-3.5">
      <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#6B7280]">
        {label}
      </p>
      <div className={`mt-0.5 truncate text-lg font-black tracking-tight md:text-xl ${accentColor}`}>
        {value}
      </div>
      {detail && <p className="mt-0.5 text-[10px] text-[#9CA3AF]">{detail}</p>}
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
  const [fullImageIndex, setFullImageIndex] = useState<number | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const closeImageRef = useRef<HTMLButtonElement>(null);
  const images = (() => {
    const seen = new Set<string>();
    const list: Array<{ publicUrl: string; title: string }> = [];
    const push = (url: string | null | undefined, title: string) => {
      if (!url || seen.has(url)) return;
      seen.add(url);
      list.push({ publicUrl: url, title });
    };
    if (student) {
      push(
        student.profileImage,
        `${student.firstName} ${student.lastName}`.trim() || 'Profile photo',
      );
      student.profileImageUrls.forEach((url) => push(url, 'Profile photo'));
      student.profileGallery.forEach((image) =>
        push(image.publicUrl, image.title || 'Profile photo'),
      );
    }
    return list;
  })();
  const imageCount = images.length;
  const fullImage = fullImageIndex === null ? undefined : images[fullImageIndex];
  const imageViewerOpen = fullImageIndex !== null;

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/students/${params.studentId}`, {
          headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
        });
        const data: unknown = await response.json();
        if (!response.ok) {
          throw new Error(
            getResponseError(data, 'Failed to fetch student profile'),
          );
        }
        if (!isRecord(data) || !isStudentProfile(data.student)) {
          throw new Error('Invalid student profile response');
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

  useEffect(() => {
    if (!imageViewerOpen) return;

    const previousFocus = document.activeElement;
    closeImageRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setFullImageIndex(null);
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        const direction = event.key === 'ArrowLeft' ? -1 : 1;
        setFullImageIndex((index) =>
          index === null ? null : Math.max(0, Math.min(imageCount - 1, index + direction)),
        );
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, [imageViewerOpen, imageCount]);

  const handleImageTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    if (event.touches.length !== 1) {
      touchStartRef.current = null;
      return;
    }
    touchStartRef.current = {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY,
    };
  };

  const handleImageTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    if (!start || event.touches.length !== 0 || !event.changedTouches[0]) return;

    const deltaX = event.changedTouches[0].clientX - start.x;
    const deltaY = event.changedTouches[0].clientY - start.y;
    if (Math.abs(deltaX) < 50 || Math.abs(deltaX) <= Math.abs(deltaY)) return;

    setFullImageIndex((index) =>
      index === null
        ? null
        : Math.max(0, Math.min(imageCount - 1, index + (deltaX < 0 ? 1 : -1))),
    );
  };

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
        <div className="mx-auto max-w-6xl px-3 py-4 sm:px-5 md:py-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="h-9 w-9 animate-pulse rounded-lg border border-[#E5E7EB] bg-white" />
            <div className="h-6 w-px bg-[#E5E7EB]" />
            <div className="h-3 w-32 animate-pulse rounded bg-[#E5E7EB]" />
          </div>

          <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white">
            <div className="h-[280px] animate-pulse bg-[#E5E7EB] sm:h-[360px]" />
            <div className="px-4 py-4">
              <div className="h-7 w-2/3 animate-pulse rounded bg-[#E5E7EB]" />
              <div className="mt-2 h-3.5 w-1/2 animate-pulse rounded bg-[#F3F4F6]" />
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 divide-x divide-y divide-[#E5E7EB] overflow-hidden rounded-xl border border-[#E5E7EB] bg-white md:grid-cols-4 md:divide-y-0">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="p-3.5">
                <div className="mb-1.5 h-2.5 w-16 animate-pulse rounded bg-[#E5E7EB]" />
                <div className="h-6 w-20 animate-pulse rounded bg-[#E5E7EB]" />
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
        <div className="mx-auto max-w-6xl px-3 py-4 sm:px-5 md:py-6">
          <button
            onClick={() => router.back()}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#4B5646] transition-colors hover:border-[#C59B4C] hover:text-[#1A2B4C]"
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div className="mt-4 rounded-xl border border-[#E5E7EB] bg-white px-4 py-12 text-center shadow-sm md:px-6">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#FBF0EC]">
              <XCircle className="h-6 w-6 text-[#A4462F]" />
            </div>
            <h2 className="mt-4 text-base font-semibold text-[#1A2B4C]">
              Student profile unavailable
            </h2>
            <p className="mx-auto mt-1.5 max-w-md text-[12px] leading-5 text-[#4B5646]">
              {error || 'Student not found'}
            </p>
            <button
              onClick={() => router.back()}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#1A2B4C] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.1em] text-white transition-colors hover:bg-[#C59B4C]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
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
      <div className="mx-auto max-w-6xl px-3 py-4 sm:px-5 md:py-6">
        {/* ======================================================
            TOP NAVIGATION
        ====================================================== */}

        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#4B5646] shadow-sm transition-all hover:border-[#C59B4C] hover:text-[#1A2B4C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C59B4C]"
              aria-label="Go back"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="h-5 w-px bg-[#E5E7EB]" />
            <div className="flex items-center gap-1.5">
              <GraduationCap className="h-3.5 w-3.5 text-[#C59B4C]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#6B7280]">
                Student Directory
              </span>
            </div>
          </div>
          <div className="hidden rounded-full bg-white px-2.5 py-1 font-mono text-[10px] font-semibold tracking-wide text-[#6B7280] sm:block">
            PROFILE / {student.studentId.slice(0, 8)}
          </div>
        </div>

        {/* ======================================================
            HERO PROFILE CARD
        ====================================================== */}

        <section className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-sm">
          <div className="grid md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
            <div className="relative min-h-[280px] bg-[#EEF1F5] sm:min-h-[360px] md:min-h-[400px]">
              {student.profileImage ? (
                <Image
                  src={student.profileImage}
                  alt={`${student.firstName} ${student.lastName}`}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 45vw"
                  className="object-contain object-center p-2 sm:p-3"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-[#E8EDF3]">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#1A2B4C] shadow-lg ring-8 ring-white/70">
                    <span className="font-mono text-2xl font-black text-white">
                      {initials}
                    </span>
                  </div>
                </div>
              )}

              {student.profileImage && (
                <button
                  type="button"
                  onClick={() => setFullImageIndex(0)}
                  className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-lg border border-[#D1D5DB] bg-white/95 px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.08em] text-[#1A2B4C] shadow-sm transition-colors hover:border-[#C59B4C] hover:text-[#8A672C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C59B4C]"
                >
                  <Maximize2 className="h-3 w-3" />
                  View full image
                </button>
              )}

              <div
                className={`absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.08em] shadow-sm ${
                  student.isActive
                    ? 'bg-white text-[#42604A]'
                    : 'bg-white text-[#A4462F]'
                }`}
              >
                {student.isActive ? (
                  <CheckCircle className="h-3 w-3" />
                ) : (
                  <XCircle className="h-3 w-3" />
                )}
                {student.isActive ? 'Active' : 'Inactive'}
              </div>
            </div>

            <div className="flex flex-col justify-center p-4 sm:p-5 md:p-6">
              <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#9A7436]">
                Public student profile
              </p>
              <h1 className="mt-1.5 flex items-center gap-2 break-words text-2xl font-black leading-tight tracking-tight text-[#1A2B4C] sm:text-3xl lg:text-4xl">
                <span className="min-w-0">
                  {student.firstName} {student.lastName}
                </span>
                {student.hasVerifiedBadge && (
                  <VerifiedBadge className="h-6 w-6 shrink-0" />
                )}
              </h1>
              {student.bio && (
                <p className="mt-2 whitespace-pre-line break-words text-[13px] leading-relaxed text-[#4B5646]">
                  {student.bio}
                </p>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <span className="rounded-full bg-[#F3F4F6] px-2.5 py-1 text-[10px] font-semibold capitalize text-[#34445F]">
                  {student.role === 'teacher'
                    ? 'Tutor'
                    : student.role === 'admin'
                      ? 'Manager'
                      : student.role === 'superadmin' || student.role === 'super_admin'
                        ? 'Director'
                        : student.role}
                </span>
                <span className="rounded-full bg-[#F3F4F6] px-2.5 py-1 font-mono text-[10px] font-semibold text-[#34445F]">
                  ID {student.studentId}
                </span>
              </div>

              <div className="mt-4 space-y-2 border-t border-[#E5E7EB] pt-3.5 text-[12px] text-[#4B5646]">
                <div className="flex min-w-0 items-start gap-2.5">
                  <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#9A7436]" />
                  <span className="break-all">{student.email}</span>
                </div>
                {student.techCenter && (
                  <div className="flex min-w-0 items-start gap-2.5">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#9A7436]" />
                    <span>
                      {student.techCenter.name}
                      {student.techCenter.country?.name && `, ${student.techCenter.country.name}`}
                    </span>
                  </div>
                )}
                <div className="flex min-w-0 items-start gap-2.5">
                  <Calendar className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#9A7436]" />
                  <span>Member since {new Date(student.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => router.push(`/dashboard/messages?userId=${encodeURIComponent(student._id)}`)}
                className="mt-5 inline-flex w-fit items-center justify-center gap-1.5 rounded-lg bg-[#1A2B4C] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.08em] text-white shadow-sm transition-colors hover:bg-[#263B60] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C59B4C] focus-visible:ring-offset-2"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                Message student
              </button>
            </div>
          </div>
        </section>

        {/* ======================================================
            QUICK STATS
        ====================================================== */}

        <section className="mt-3 grid grid-cols-2 overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-sm md:grid-cols-4">
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

        <div className="mt-6">
          {/* ACADEMIC */}
          <section className="mb-5">
            <SectionHeading number="01" title="Academic Information" icon={<GraduationCap className="h-4 w-4" />} />
            <div className="rounded-xl border border-[#E5E7EB] bg-white px-3.5 shadow-sm md:px-4">
              <div className="grid grid-cols-1 gap-x-6 md:grid-cols-2">
                <InfoRow label="General Degree Course" value={student.generalCourse || 'Not provided'} icon={<Book className="h-4 w-4" />} />
                <InfoRow label="Tech Center" value={student.techCenter ? student.techCenter.name : 'Not assigned'} icon={<MapPin className="h-4 w-4" />} />
                <InfoRow label="Country" value={student.techCenter?.country?.name || student.country || 'Not provided'} icon={<Globe className="h-4 w-4" />} />
                <InfoRow label="Student Status" value={<span className="capitalize">{student.status}</span>} icon={<CheckCircle className="h-4 w-4" />} />
              </div>
            </div>
          </section>

          {/* COURSE UNITS */}
          <section className="mb-5">
            <SectionHeading number="02" title={`Course Units (${student.studentCourses.length})`} icon={<Book className="h-4 w-4" />} />
            {student.studentCourses.length > 0 ? (
              <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-sm">
                <div className="hidden grid-cols-[90px_1fr_80px_100px] gap-3 bg-[#1A2B4C] px-4 py-2.5 md:grid">
                  <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-white/70">Code</span>
                  <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-white/70">Course Unit</span>
                  <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-white/70">Credits</span>
                  <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-white/70">Status</span>
                </div>

                {student.studentCourses.map((course) => (
                  <div key={course.id} className="group border-b border-[#F3F4F6] last:border-b-0 hover:bg-[#F8F9FA]">
                    <div className="hidden grid-cols-[90px_1fr_80px_100px] items-center gap-3 px-4 py-2.5 md:grid">
                      <span className="font-mono text-[11px] font-bold text-[#C59B4C]">{course.code}</span>
                      <span className="text-[13px] font-semibold text-[#1A2B4C]">{course.courseUnit}</span>
                      <span className="text-[13px] font-medium text-[#4B5646]">{course.credits}</span>
                      <span className="inline-flex w-fit rounded-full bg-[#F3F4F6] px-2 py-0.5 text-[9px] font-semibold capitalize text-[#4B5646]">
                        {course.status}
                      </span>
                    </div>

                    <div className="p-3.5 md:hidden">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <span className="font-mono text-[10px] font-bold text-[#C59B4C]">{course.code}</span>
                          <p className="mt-0.5 break-words text-[13px] font-bold leading-5 text-[#1A2B4C]">
                            {course.courseUnit}
                          </p>
                        </div>
                        <span className="whitespace-nowrap rounded-md bg-[#F3F4F6] px-2 py-0.5 text-[10px] font-bold text-[#1A2B4C]">
                          {course.credits} cr
                        </span>
                      </div>
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#C59B4C]" />
                        <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-[#6B7280]">
                          {course.status}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="flex items-center justify-between border-t border-[#E5E7EB] bg-[#F8F9FA] px-4 py-3">
                  <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#6B7280]">Total Credits</span>
                  <span className="text-lg font-black text-[#C59B4C]">{totalCredits}</span>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 text-[12px] text-[#4B5646]">
                No course units provided.
              </div>
            )}
          </section>

          {/* PERSONAL + CONTACT */}
          <section className="mb-5">
            <SectionHeading number="03" title="Personal & Contact" icon={<User className="h-4 w-4" />} />
            <div className="rounded-xl border border-[#E5E7EB] bg-white px-3.5 shadow-sm md:px-4">
              <div className="grid grid-cols-1 gap-x-6 md:grid-cols-2">
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
          <section className="mb-5">
            <SectionHeading number="04" title="Professional Links" icon={<Briefcase className="h-4 w-4" />} />
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
                <div className="flex items-start gap-2.5">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-[#EAF3F8]">
                    <LinkIcon className="h-3.5 w-3.5 text-[#0077B5]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#6B7280]">LinkedIn</p>
                    {student.linkedinUrl ? (
                      <>
                        <p className="mt-1 truncate text-[12px] font-medium text-[#1A2B4C]">{student.linkedinUrl}</p>
                        <div className="mt-2 flex items-center gap-3">
                          <button onClick={() => copyToClipboard(student.linkedinUrl!)} className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.08em] text-[#1A2B4C] transition-colors hover:text-[#C59B4C]">
                            <Copy className="h-3 w-3" /> Copy
                          </button>
                          <a href={student.linkedinUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.08em] text-[#1A2B4C] transition-colors hover:text-[#C59B4C]">
                            <ExternalLink className="h-3 w-3" /> Open
                          </a>
                        </div>
                      </>
                    ) : (
                      <p className="mt-1 text-[12px] text-[#9CA3AF]">Not provided</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
                <div className="flex items-start gap-2.5">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-[#F3F4F6]">
                    <GitFork className="h-3.5 w-3.5 text-[#1A2B4C]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#6B7280]">GitHub</p>
                    {student.githubUrl ? (
                      <>
                        <p className="mt-1 truncate text-[12px] font-medium text-[#1A2B4C]">{student.githubUrl}</p>
                        <div className="mt-2 flex items-center gap-3">
                          <button onClick={() => copyToClipboard(student.githubUrl!)} className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.08em] text-[#1A2B4C] transition-colors hover:text-[#C59B4C]">
                            <Copy className="h-3 w-3" /> Copy
                          </button>
                          <a href={student.githubUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.08em] text-[#1A2B4C] transition-colors hover:text-[#C59B4C]">
                            <ExternalLink className="h-3 w-3" /> Open
                          </a>
                        </div>
                      </>
                    ) : (
                      <p className="mt-1 text-[12px] text-[#9CA3AF]">Not provided</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* PROJECTS */}
          <section className="mb-5">
            <SectionHeading number="05" title="Student Projects" icon={<LinkIcon className="h-4 w-4" />} />
            {student.projectUrls && student.projectUrls.length > 0 ? (
              <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-sm">
                {student.projectUrls.map((url, index) => (
                  <div key={index} className="flex items-center gap-2.5 border-b border-[#F3F4F6] px-3.5 py-2.5 last:border-b-0 hover:bg-[#F8F9FA] md:px-4">
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-[#FBF7EE] font-mono text-[9px] font-bold text-[#8A6328]">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <LinkIcon className="h-3 w-3 flex-shrink-0 text-[#9CA3AF]" />
                    <span className="min-w-0 flex-1 truncate text-[12px] font-medium text-[#1A2B4C]">{url}</span>
                    <button onClick={() => copyToClipboard(url)} className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md text-[#6B7280] transition-colors hover:bg-[#F3F4F6] hover:text-[#1A2B4C]" title="Copy link">
                      <Copy className="h-3 w-3" />
                    </button>
                    <a href={url} target="_blank" rel="noopener noreferrer" className="hidden h-7 w-7 flex-shrink-0 items-center justify-center rounded-md text-[#6B7280] transition-colors hover:bg-[#FBF7EE] hover:text-[#8A6328] sm:flex" title="Open project">
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-[#E5E7EB] bg-white p-5">
                <p className="text-[12px] text-[#4B5646]">No projects provided.</p>
              </div>
            )}
          </section>

          {/* GALLERY */}
          {images.length > 0 && (
            <section className="mb-5">
              <SectionHeading number="06" title="Gallery" icon={<ImageIcon className="h-4 w-4" />} />
              <div className="rounded-xl border border-[#E5E7EB] bg-white p-3.5 shadow-sm md:p-4">
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                  {images.map((image, index) => (
                    <button
                      key={image.publicUrl}
                      type="button"
                      onClick={() => setFullImageIndex(index)}
                      className="group relative aspect-video w-full overflow-hidden rounded-lg border border-[#E5E7EB] bg-[#F8F9FA] transition-all hover:border-[#C59B4C] hover:shadow-sm"
                    >
                      <Image
                        src={image.publicUrl}
                        alt={image.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-contain p-1.5"
                      />
                      {image.publicUrl === student.profileImage && (
                        <span className="absolute left-1.5 top-1.5 rounded-full bg-[#1A2B4C] px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.08em] text-white">
                          Profile Photo
                        </span>
                      )}
                      <div className="pointer-events-none absolute inset-0 flex items-end justify-between bg-gradient-to-t from-black/50 via-transparent to-transparent p-2.5 opacity-0 transition-opacity group-hover:opacity-100">
                        <span className="line-clamp-1 text-left text-[9px] font-bold uppercase tracking-[0.1em] text-white">
                          {image.publicUrl === student.profileImage
                            ? 'Profile Photo'
                            : image.title}
                        </span>
                        <Maximize2 className="h-3.5 w-3.5 shrink-0 text-white" />
                      </div>
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-[10px] text-[#6B7280]">
                  Click any image to view it in full size{imageCount > 1 ? ' and swipe through the gallery' : ''}.
                </p>
              </div>
            </section>
          )}

          {/* ACCOUNT */}
          <section className="mb-5">
            <SectionHeading number={images.length > 0 ? '07' : '06'} title="Account Information" icon={<Calendar className="h-4 w-4" />} />
            <div className="rounded-xl border border-[#E5E7EB] bg-white px-3.5 shadow-sm md:px-4">
              <div className="grid grid-cols-1 gap-x-6 md:grid-cols-3">
                <InfoRow label="Joined" value={new Date(student.createdAt).toLocaleDateString()} icon={<Calendar className="h-4 w-4" />} />
                <InfoRow label="Profile Updated" value={new Date(student.updatedAt).toLocaleDateString()} icon={<Calendar className="h-4 w-4" />} />
                <InfoRow label="Account Status" value={<span className="capitalize">{student.status}</span>} icon={<User className="h-4 w-4" />} />
              </div>
            </div>
          </section>

          {/* BACK */}
          <div className="border-t border-[#E5E7EB] py-5">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 rounded-lg bg-[#1A2B4C] px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.11em] text-white shadow-sm transition-all hover:bg-[#C59B4C]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Student Directory
            </button>
          </div>
        </div>

        {/* ======================================================
            FULL IMAGE MODAL
        ====================================================== */}

        {fullImageIndex !== null && fullImage && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-3 sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-label="Full profile gallery image"
            onClick={() => setFullImageIndex(null)}
          >
            <div
              className="relative flex h-full w-full max-w-6xl items-center justify-center"
              style={{ touchAction: 'pan-y pinch-zoom' }}
              onClick={(event) => event.stopPropagation()}
              onTouchStart={handleImageTouchStart}
              onTouchMove={(event) => {
                if (event.touches.length !== 1) touchStartRef.current = null;
              }}
              onTouchEnd={handleImageTouchEnd}
              onTouchCancel={() => { touchStartRef.current = null; }}
            >
              <Image
                src={fullImage.publicUrl}
                alt={fullImage.title}
                fill
                sizes="100vw"
                className="object-contain"
                draggable={false}
              />
              {imageCount > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setFullImageIndex((index) => index === null ? null : Math.max(0, index - 1))}
                    disabled={fullImageIndex === 0}
                    className="absolute left-2 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#1A2B4C] shadow-lg transition-colors hover:bg-white disabled:opacity-40"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setFullImageIndex((index) => index === null ? null : Math.min(imageCount - 1, index + 1))}
                    disabled={fullImageIndex === imageCount - 1}
                    className="absolute right-2 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#1A2B4C] shadow-lg transition-colors hover:bg-white disabled:opacity-40"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                  <p aria-live="polite" className="absolute bottom-4 rounded-full bg-black/70 px-3 py-1 text-sm font-semibold text-white">
                    {fullImageIndex + 1} / {imageCount}
                  </p>
                </>
              )}
              <button
                ref={closeImageRef}
                type="button"
                onClick={() => setFullImageIndex(null)}
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