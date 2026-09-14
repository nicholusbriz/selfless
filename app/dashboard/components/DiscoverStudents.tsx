"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  MessageCircle,
  MapPin,
  UserRound,
} from "lucide-react";

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

export function DiscoverStudents({
  students,
  isLoading = false,
}: DiscoverStudentsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (students.length <= 1) return;

    const interval = window.setInterval(() => {
      setCurrentIndex((index) => (index + 1) % students.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [students.length]);

  if (isLoading) {
    return (
      <section
        className="mt-6 overflow-hidden border border-[#DADCD3] bg-white"
        aria-label="Loading discover students"
      >
        <div className="border-b border-[#DADCD3] px-4 py-3 sm:px-5">
          <div className="h-2.5 w-20 animate-pulse bg-[#E8E9E3]" />
          <div className="mt-2 h-6 w-44 animate-pulse bg-[#E8E9E3]" />
        </div>

        <div className="flex h-[260px] items-center gap-4 bg-[#FBFBF9] px-5 sm:h-[300px] sm:px-7">
          <div className="h-32 w-32 shrink-0 animate-pulse rounded-full bg-[#E8E9E3] sm:h-40 sm:w-40" />

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
      (index) => (index + direction + students.length) % students.length,
    );
  };

  const slideTransition = shouldReduceMotion
    ? { duration: 0 }
    : {
        duration: 0.26,
        ease: [0.22, 1, 0.36, 1] as const,
      };

  return (
    <section
      className="mt-6 overflow-hidden border border-[#DADCD3] bg-[#F7F6F2]"
      aria-labelledby="discover-students-heading"
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
      <div className="flex items-center justify-between gap-4 border-b border-[#DADCD3] bg-white px-4 py-3 sm:px-5 sm:py-3.5">
        <div className="min-w-0">
          <p className="font-mono text-[9px] font-medium uppercase tracking-[0.18em] text-[#B98A3E]">
            Community
          </p>

          <h2
            id="discover-students-heading"
            className="mt-1 text-lg font-semibold tracking-[-0.015em] text-[#12203B] sm:text-xl"
          >
            Discover students
          </h2>

          <p className="mt-0.5 text-[10px] leading-relaxed text-[#6B7268] sm:text-[11px]">
            Connect with students across the SELFLESS CE network.
          </p>
        </div>

        <Link
          href="/dashboard/students"
          className="
            inline-flex
            shrink-0
            items-center
            gap-1.5
            text-[10px]
            font-semibold
            uppercase
            tracking-[0.1em]
            text-[#55705B]
            transition-colors
            duration-200
            hover:text-[#12203B]
            focus:outline-none
            focus:ring-2
            focus:ring-[#B98A3E]
          "
        >
          View all
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Featured student */}
      <div className="relative overflow-hidden bg-[#FBFBF9]">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={student.id}
            initial={
              shouldReduceMotion
                ? { opacity: 1 }
                : { opacity: 0, x: 8 }
            }
            animate={{ opacity: 1, x: 0 }}
            exit={
              shouldReduceMotion
                ? { opacity: 0 }
                : { opacity: 0, x: -8 }
            }
            transition={slideTransition}
            className="relative h-[300px] w-full sm:h-[340px] lg:h-[380px]"
          >
            {/* Student image */}
            <Image
              src={student.profileImageUrl}
              alt={`${fullName} profile`}
              fill
              priority={safeIndex === 0}
              unoptimized
              sizes="100vw"
              className="object-contain object-center p-2.5 sm:p-4"
            />

            {/* Subtle image readability layer */}
            <div
              className="absolute inset-0 bg-black/[0.025]"
              aria-hidden="true"
            />

            {/* Availability */}
            <span
              className="
                absolute
                right-3
                top-3
                h-3.5
                w-3.5
                rounded-full
                border-2
                border-white
                bg-[#55705B]
                shadow-sm
                sm:right-5
                sm:top-5
                sm:h-4
                sm:w-4
              "
              aria-label="Profile available"
            />

            {/* Profile information panel */}
            <div className="absolute inset-x-0 bottom-0 p-2.5 sm:p-4 lg:p-5">
              <div
                className="
                  w-full
                  max-w-xl
                  border
                  border-white/70
                  bg-white/[0.93]
                  px-3.5
                  py-3.5
                  shadow-[0_6px_24px_rgba(18,32,59,0.10)]
                  backdrop-blur-md
                  sm:px-4
                  sm:py-4
                "
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-5">
                  {/* Student information */}
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-[8px] font-medium uppercase tracking-[0.18em] text-[#B98A3E]">
                      Student profile
                    </p>

                    <div className="mt-1 flex items-start gap-1.5">
                      <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-[#B98A3E]" />

                      <h3
                        className="
                          min-w-0
                          break-words
                          text-lg
                          font-semibold
                          leading-tight
                          tracking-[-0.025em]
                          text-[#12203B]
                          sm:text-xl
                          lg:text-[1.35rem]
                        "
                      >
                        {fullName}
                      </h3>
                    </div>

                    <p className="mt-1 break-words text-xs leading-5 text-[#4B564C] sm:text-sm">
                      {student.generalCourse || "Selfless CE student"}
                    </p>

                    {student.techCenter && (
                      <div className="mt-1 flex min-w-0 items-start gap-1.5 text-[11px] text-[#6B7268] sm:text-xs">
                        <MapPin className="mt-0.5 h-3 w-3 shrink-0 text-[#B98A3E]" />

                        <span className="break-words leading-4">
                          {student.techCenter.name}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 items-center gap-3">
                    <Link
                      href={`/dashboard/students/${student.id}`}
                      className="
                        group/profile
                        inline-flex
                        items-center
                        gap-1.5
                        border-b
                        border-[#55705B]/40
                        pb-1
                        text-[9px]
                        font-semibold
                        uppercase
                        tracking-[0.12em]
                        text-[#55705B]
                        transition-all
                        duration-200
                        hover:border-[#B98A3E]
                        hover:text-[#B98A3E]
                        focus:outline-none
                        focus:ring-2
                        focus:ring-[#B98A3E]
                        focus:ring-offset-2
                      "
                    >
                      View profile

                      <ArrowRight
                        className="
                          h-3
                          w-3
                          transition-transform
                          duration-200
                          group-hover/profile:translate-x-0.5
                        "
                      />
                    </Link>

                    <Link
                      href={`/dashboard/messages?userId=${student.id}`}
                      aria-label={`Message ${fullName}`}
                      className="
                        group/message
                        inline-flex
                        items-center
                        gap-1.5
                        bg-[#12203B]
                        px-3
                        py-2
                        text-[9px]
                        font-semibold
                        uppercase
                        tracking-[0.1em]
                        text-white
                        shadow-sm
                        transition-all
                        duration-200
                        hover:-translate-y-0.5
                        hover:bg-[#55705B]
                        hover:shadow-md
                        focus:outline-none
                        focus:ring-2
                        focus:ring-[#B98A3E]
                        focus:ring-offset-2
                      "
                    >
                      <MessageCircle className="h-3.5 w-3.5" />

                      <span>Message</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Previous */}
        {students.length > 1 && (
          <button
            type="button"
            onClick={() => move(-1)}
            aria-label="Previous student"
            className="
              group/previous
              absolute
              left-2.5
              top-1/2
              z-20
              flex
              h-8
              w-8
              -translate-y-1/2
              items-center
              justify-center
              border
              border-white/80
              bg-white/80
              text-[#12203B]
              shadow-sm
              backdrop-blur-sm
              transition-all
              duration-200
              hover:border-[#B98A3E]/50
              hover:bg-white
              hover:shadow-md
              focus:outline-none
              focus:ring-2
              focus:ring-[#B98A3E]
              sm:left-3
              sm:h-9
              sm:w-9
            "
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-200 group-hover/previous:-translate-x-0.5 sm:h-4 sm:w-4" />
          </button>
        )}

        {/* Next */}
        {students.length > 1 && (
          <button
            type="button"
            onClick={() => move(1)}
            aria-label="Next student"
            className="
              group/next
              absolute
              right-2.5
              top-1/2
              z-20
              flex
              h-8
              w-8
              -translate-y-1/2
              items-center
              justify-center
              border
              border-white/80
              bg-white/80
              text-[#12203B]
              shadow-sm
              backdrop-blur-sm
              transition-all
              duration-200
              hover:border-[#B98A3E]/50
              hover:bg-white
              hover:shadow-md
              focus:outline-none
              focus:ring-2
              focus:ring-[#B98A3E]
              sm:right-3
              sm:h-9
              sm:w-9
            "
          >
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover/next:translate-x-0.5 sm:h-4 sm:w-4" />
          </button>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-[#DADCD3] bg-white px-4 py-2.5 sm:px-5">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[#55705B]" />

          <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#8A9088]">
            {safeIndex + 1} of {students.length}
          </span>
        </div>

        <span className="hidden text-[9px] font-semibold uppercase tracking-[0.12em] text-[#8A9088] sm:block">
          Swipe or use arrows
        </span>
      </div>
    </section>
  );
}

