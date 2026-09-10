'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  MessageCircle,
  MapPin,
  UserRound,
} from 'lucide-react';

export interface DiscoverStudent {
  id: string;
  firstName: string;
  lastName: string;
  profileImageUrl: string;
  generalCourse: string | null;
  techCenter: {
    id: string;
    name: string;
  } | null;
}

interface DiscoverStudentsProps {
  students: DiscoverStudent[];
  isLoading?: boolean;
}

export function DiscoverStudents({ students, isLoading = false }: DiscoverStudentsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    if (students.length <= 1 || isPaused) return;

    const interval = window.setInterval(() => {
      setCurrentIndex((index) => (index + 1) % students.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [isPaused, students.length]);

  if (isLoading) {
    return (
      <section className="mt-6 overflow-hidden border border-[#DADCD3] bg-white" aria-label="Loading discover students">
        <div className="border-b border-[#DADCD3] px-4 py-3.5 sm:px-6 sm:py-4">
          <div className="h-2.5 w-20 animate-pulse bg-[#E8E9E3]" />
          <div className="mt-2 h-6 w-48 animate-pulse bg-[#E8E9E3]" />
        </div>
        <div className="flex h-[280px] items-center gap-4 bg-[#FBFBF9] px-5 sm:h-[340px] sm:px-8">
          <div className="h-40 w-40 shrink-0 animate-pulse rounded-full bg-[#E8E9E3] sm:h-52 sm:w-52" />
          <div className="min-w-0 flex-1">
            <div className="h-5 w-3/4 animate-pulse bg-[#E8E9E3]" />
            <div className="mt-3 h-3 w-1/2 animate-pulse bg-[#E8E9E3]" />
            <div className="mt-3 h-3 w-2/3 animate-pulse bg-[#E8E9E3]" />
          </div>
        </div>
      </section>
    );
  }

  if (students.length === 0) return null;

  const safeIndex = Math.min(currentIndex, students.length - 1);
  const student = students[safeIndex];

  const fullName = `${student.firstName} ${student.lastName}`.trim();

  const move = (direction: number) => {
    setCurrentIndex(
      (index) => (index + direction + students.length) % students.length
    );
  };

  return (
    <section
      className="mt-6 overflow-hidden border border-[#DADCD3] bg-[#F7F6F2]"
      aria-labelledby="discover-students-heading"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsPaused(false);
        }
      }}
      onTouchStart={(event) => {
        touchStartX.current = event.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(event) => {
        if (touchStartX.current === null) return;

        const endX = event.changedTouches[0]?.clientX ?? 0;
        const distance = endX - touchStartX.current;

        if (Math.abs(distance) > 40) {
          move(distance < 0 ? 1 : -1);
        }

        touchStartX.current = null;
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-4 border-b border-[#DADCD3] bg-white px-4 py-3.5 sm:px-6 sm:py-4">
        <div className="min-w-0">
          <p className="font-mono text-[9px] font-medium uppercase tracking-[0.18em] text-[#B98A3E]">
            Community
          </p>

          <h2
            id="discover-students-heading"
            className="mt-1 text-lg font-semibold tracking-[-0.01em] text-[#12203B] sm:text-xl"
          >
            Discover students
          </h2>
          <p className="mt-1 text-[10px] leading-relaxed text-[#6B7268] sm:text-[11px]">
            Update your avatar to appear on the Selfless Discovery board.
          </p>
        </div>

        <Link
          href="/dashboard/students"
          className="inline-flex shrink-0 items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#55705B] transition-colors hover:text-[#12203B] focus:outline-none focus:ring-2 focus:ring-[#B98A3E]"
        >
          View all
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Featured student */}
      <div className="relative">
        <Link
          href={`/dashboard/students/${student.id}`}
          className="group relative block h-[380px] w-full overflow-hidden bg-[#FBFBF9] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#B98A3E] sm:h-[440px] lg:h-[500px]"
        >
          {/* Full-container image */}
          <Image
            src={student.profileImageUrl}
            alt={`${fullName} profile`}
            fill
            priority={safeIndex === 0}
            unoptimized
            sizes="100vw"
            className="
              object-contain
              object-center
              p-3
              transition-transform
              duration-700
              ease-out
              group-hover:scale-[1.015]
              sm:p-5
            "
          />

          {/* Very light readability layer.
              Kept intentionally subtle so the photograph remains dominant. */}
          <div
            className="absolute inset-0 bg-black/[0.04]"
            aria-hidden="true"
          />

          {/* Transparent profile information */}
          <div className="absolute inset-x-0 bottom-0 p-3 sm:p-5 lg:p-6">
            <div
              className="
                w-full
                max-w-2xl
                border
                border-white/60
                bg-white/95
                p-4
                shadow-[0_8px_30px_rgba(18,32,59,0.10)]
                backdrop-blur-md
                transition-all
                duration-300
                group-hover:bg-white
                sm:p-5
                lg:p-6
              "
            >
              {/* Label */}
              <p className="font-mono text-[9px] font-medium uppercase tracking-[0.18em] text-[#B98A3E]">
                Student profile
              </p>

              {/* Name */}
              <div className="mt-1.5 flex items-start gap-2">
                <UserRound className="mt-1 h-4 w-4 shrink-0 text-[#B98A3E] sm:h-5 sm:w-5" />

                <h3
                  className="
                    break-words
                    text-xl
                    font-semibold
                    leading-tight
                    tracking-[-0.025em]
                    text-[#12203B]
                    sm:text-2xl
                    lg:text-3xl
                  "
                >
                  {fullName}
                </h3>
              </div>

              {/* Course */}
              <p className="mt-2 break-words text-sm leading-relaxed text-[#4B564C] sm:text-base">
                {student.generalCourse || 'Selfless CE student'}
              </p>

              {/* Tech center */}
              {student.techCenter && (
                <div className="mt-2 flex min-w-0 items-start gap-1.5 text-xs text-[#6B7268] sm:text-sm">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#B98A3E]" />

                  <span className="break-words leading-relaxed">
                    {student.techCenter.name}
                  </span>
                </div>
              )}

              {/* Profile action */}
              <div className="mt-3 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#55705B] sm:mt-4">
                View student profile
              </div>
            </div>
          </div>

          {/* Availability */}
          <span
            className="
              absolute
              right-4
              top-4
              h-4
              w-4
              rounded-full
              border-[3px]
              border-white
              bg-[#55705B]
              shadow-sm
              sm:right-6
              sm:top-6
              sm:h-5
              sm:w-5
            "
            aria-label="Profile available"
          />
        </Link>

        <Link
          href={`/dashboard/messages?userId=${student.id}`}
          aria-label={`Message ${fullName}`}
          className="absolute bottom-6 right-6 z-10 inline-flex items-center gap-1.5 border border-[#12203B] bg-[#12203B] px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.1em] text-white shadow-sm transition-colors hover:bg-[#55705B] focus:outline-none focus:ring-2 focus:ring-[#B98A3E] sm:bottom-8 sm:right-8"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          Message
        </Link>

        {/* Previous */}
        <button
          type="button"
          onClick={() => move(-1)}
          aria-label="Previous student"
          className="
            absolute
            left-3
            top-1/2
            flex
            h-10
            w-10
            -translate-y-1/2
            items-center
            justify-center
            border
            border-white/70
            bg-white/75
            text-[#12203B]
            shadow-sm
            backdrop-blur-sm
            transition-all
            hover:bg-white/90
            focus:outline-none
            focus:ring-2
            focus:ring-[#B98A3E]
            sm:flex
          "
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        {/* Next */}
        <button
          type="button"
          onClick={() => move(1)}
          aria-label="Next student"
          className="
            absolute
            right-3
            top-1/2
            flex
            h-10
            w-10
            -translate-y-1/2
            items-center
            justify-center
            border
            border-white/70
            bg-white/75
            text-[#12203B]
            shadow-sm
            backdrop-blur-sm
            transition-all
            hover:bg-white/90
            focus:outline-none
            focus:ring-2
            focus:ring-[#B98A3E]
            sm:flex
          "
        >
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-[#DADCD3] bg-white px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[#55705B]" />

          <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#8A9088]">
            {safeIndex + 1} of {students.length}
          </span>
        </div>

        {/* Desktop hint */}
        <span className="hidden text-[9px] font-semibold uppercase tracking-[0.12em] text-[#8A9088] sm:block">
          Swipe or use arrows
        </span>
      </div>
    </section>
  );
}

