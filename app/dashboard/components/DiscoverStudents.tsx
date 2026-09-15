"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, MessageCircle, MapPin } from "lucide-react";

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

const AUTOPLAY_DELAY = 5000;
const SWIPE_THRESHOLD = 50;
const DARK_SURFACE = "#111827";
const DARK_CARD = "#18212F";
const DARK_BORDER = "rgba(255,255,255,0.10)";

const cardTransition = {
  type: "spring" as const,
  stiffness: 210,
  damping: 25,
  mass: 0.9,
};

const contentTransition = {
  duration: 0.42,
  ease: [0.22, 1, 0.36, 1] as const,
};

export function DiscoverStudents({
  students,
  isLoading = false,
}: DiscoverStudentsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const touchStartX = useRef<number | null>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (students.length === 0) {
      setCurrentIndex(0);
      return;
    }

    setCurrentIndex((index) => Math.min(index, students.length - 1));
  }, [students.length]);

  const move = useCallback(
    (nextDirection: number) => {
      if (students.length <= 1) return;

      setDirection(nextDirection);
      setCurrentIndex(
        (index) => (index + nextDirection + students.length) % students.length,
      );
    },
    [students.length],
  );

  useEffect(() => {
    if (students.length <= 1 || shouldReduceMotion) return;

    const interval = window.setInterval(() => move(1), AUTOPLAY_DELAY);
    return () => window.clearInterval(interval);
  }, [move, shouldReduceMotion, students.length]);

  if (isLoading) {
    return (
      <motion.section
        initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={contentTransition}
        className="mt-5 overflow-hidden rounded-2xl border border-[#DADCD3] bg-white"
        aria-label="Loading discover students"
        aria-busy="true"
      >
        <div className="border-b border-[#DADCD3] px-4 py-3 sm:px-5">
          <div className="h-2.5 w-20 animate-pulse rounded bg-[#E8E9E3]" />
          <div className="mt-2 h-6 w-44 animate-pulse rounded bg-[#E8E9E3]" />
        </div>

        <div className="relative flex h-[400px] items-center justify-center overflow-hidden bg-[#111827] sm:h-[460px]">
          <motion.div
            animate={
              shouldReduceMotion
                ? undefined
                : { scale: [1, 1.04, 1], opacity: [0.6, 1, 0.6] }
            }
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="h-32 w-32 rounded-full bg-white/10"
          />
        </div>
      </motion.section>
    );
  }

  if (students.length === 0) return null;

  const safeIndex = Math.min(currentIndex, students.length - 1);

  const getOffset = (index: number) => {
    let offset = index - safeIndex;
    const half = Math.floor(students.length / 2);

    if (offset > half) offset -= students.length;
    if (offset < -half) offset += students.length;

    return offset;
  };

  return (
    <motion.section
      initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={contentTransition}
      className="mt-5 overflow-hidden rounded-2xl border border-[#DADCD3] bg-white"
      aria-labelledby="discover-students-heading"
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") move(-1);
        if (event.key === "ArrowRight") move(1);
      }}
      onTouchStart={(event) => {
        touchStartX.current = event.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(event) => {
        if (touchStartX.current !== null) {
          const endX = event.changedTouches[0]?.clientX ?? touchStartX.current;
          const distance = endX - touchStartX.current;

          if (Math.abs(distance) > SWIPE_THRESHOLD) {
            move(distance < 0 ? 1 : -1);
          }
        }

        touchStartX.current = null;
      }}
    >
      <div className="flex items-center justify-between gap-4 border-b border-[#DADCD3] bg-white px-4 py-3 sm:px-5">
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ ...contentTransition, delay: 0.08 }}
          className="min-w-0"
        >
          <p className="font-mono text-[9px] font-medium uppercase tracking-[0.18em] text-[#B98A3E]">
            Community
          </p>

          <h2
            id="discover-students-heading"
            className="mt-0.5 text-lg font-semibold tracking-tight text-[#12203B] sm:text-xl"
          >
            Discover students
          </h2>

          <p className="mt-0.5 text-[10px] leading-relaxed text-[#6B7268] sm:text-[11px]">
            Connect with students across the SELFLESS CE network.
          </p>
        </motion.div>

        <Link
          href="/dashboard/students"
          className="group inline-flex shrink-0 items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#55705B] transition-colors duration-200 hover:text-[#12203B] focus:outline-none focus:ring-2 focus:ring-[#B98A3E] focus:ring-offset-2"
        >
          <span>View all</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div
        className="relative flex h-[470px] w-full touch-pan-y items-center justify-center overflow-hidden bg-[#111827] sm:h-[520px] lg:h-[550px]"
        style={{ perspective: "1100px" }}
      >
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 38%, rgba(255,255,255,0.055), transparent 48%)",
          }}
          animate={
            shouldReduceMotion
              ? undefined
              : { opacity: [0.7, 1, 0.7], scale: [1, 1.03, 1] }
          }
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />

        <AnimatePresence initial={false} custom={direction}>
          {students.map((student, index) => {
            const offset = getOffset(index);
            const isActive = offset === 0;

            if (Math.abs(offset) > 2) return null;

            const fullName = `${student.firstName} ${student.lastName}`.trim();
            const distance = Math.abs(offset);

            return (
              <motion.article
                key={student.id}
                layout
                initial={
                  shouldReduceMotion
                    ? false
                    : {
                        opacity: 0,
                        x: direction * 150,
                        scale: 0.88,
                        rotateY: direction * -10,
                      }
                }
                animate={{
                  x: shouldReduceMotion ? 0 : offset * 112,
                  z: shouldReduceMotion ? 0 : -distance * 180,
                  y: isActive ? 0 : 10,
                  rotateY: shouldReduceMotion ? 0 : offset * -12,
                  scale: shouldReduceMotion
                    ? isActive
                      ? 1
                      : 0.86
                    : 1 - distance * 0.1,
                  opacity: distance > 1 ? 0.3 : isActive ? 1 : 0.72,
                }}
                exit={
                  shouldReduceMotion
                    ? { opacity: 0 }
                    : {
                        opacity: 0,
                        x: direction * -150,
                        scale: 0.88,
                        rotateY: direction * 10,
                      }
                }
                transition={
                  shouldReduceMotion
                    ? { duration: 0.12 }
                    : {
                        ...cardTransition,
                        opacity: { duration: 0.24 },
                      }
                }
                className={`absolute w-[280px] overflow-hidden rounded-2xl border will-change-transform sm:w-[330px] ${
                  isActive ? "cursor-default" : "cursor-pointer"
                }`}
                style={{
                  zIndex: 20 - distance,
                  borderColor: DARK_BORDER,
                  backgroundColor: DARK_CARD,
                  boxShadow: isActive
                    ? "0 24px 60px rgba(0,0,0,0.46)"
                    : "0 12px 30px rgba(0,0,0,0.30)",
                  transformStyle: "preserve-3d",
                  backfaceVisibility: "hidden",
                }}
                onClick={() => {
                  if (!isActive) move(offset > 0 ? 1 : -1);
                }}
                aria-hidden={!isActive}
              >
                <div className="relative h-[315px] w-full overflow-hidden bg-[#0B1220] sm:h-[365px]">
                  <motion.div
                    className="absolute inset-0"
                    animate={{
                      scale: isActive && !shouldReduceMotion ? 1.025 : 1,
                    }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Image
                      src={student.profileImageUrl}
                      alt={`${fullName} profile`}
                      fill
                      priority={isActive}
                      unoptimized
                      sizes="(max-width: 640px) 280px, 330px"
                      className="object-cover object-top"
                    />
                  </motion.div>

                  <div
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-32"
                    style={{
                      background:
                        "linear-gradient(to bottom, transparent, #18212F)",
                    }}
                  />

                  <motion.span
                    initial={false}
                    animate={{
                      scale: isActive ? 1 : 0.8,
                      opacity: isActive ? 1 : 0.55,
                    }}
                    transition={cardTransition}
                    className="absolute right-4 top-4 flex h-4 w-4 items-center justify-center rounded-full border border-white/30 bg-[#55705B]"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  </motion.span>
                </div>

                <div className="relative px-5 pb-5 pt-0 sm:px-6 sm:pb-6">
                  <div className="relative -mt-8">
                    <AnimatePresence mode="wait" initial={false}>
                      {isActive && (
                        <motion.div
                          key={`content-${student.id}`}
                          initial={
                            shouldReduceMotion
                              ? { opacity: 0 }
                              : { opacity: 0, y: 12 }
                          }
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -8 }}
                          transition={{ ...contentTransition, delay: 0.08 }}
                        >
                          <p className="font-mono text-[8px] font-medium uppercase tracking-[0.18em] text-white/45">
                            Student Profile
                          </p>

                          <h3 className="mt-1 break-words text-[21px] font-semibold leading-tight tracking-tight text-white sm:text-[23px]">
                            {fullName}
                          </h3>

                          <p className="mt-1 break-words text-xs font-medium leading-relaxed text-white/65 sm:text-sm">
                            {student.generalCourse || "Selfless CE student"}
                          </p>

                          {student.techCenter && (
                            <motion.div
                              initial={
                                shouldReduceMotion
                                  ? false
                                  : { opacity: 0, y: 5 }
                              }
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ ...contentTransition, delay: 0.16 }}
                              className="mt-2 flex items-start gap-1.5 text-[10px] leading-relaxed text-white/50 sm:text-xs"
                            >
                              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#B98A3E]" />
                              <span className="break-words">
                                {student.techCenter.name}
                              </span>
                            </motion.div>
                          )}

                          <motion.div
                            initial={
                              shouldReduceMotion ? false : { opacity: 0, y: 8 }
                            }
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ ...contentTransition, delay: 0.22 }}
                            className="mt-4 flex items-center gap-4"
                          >
                            <Link
                              href={`/dashboard/students/${student.id}`}
                              className="group/profile inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/80 transition-colors duration-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/40"
                            >
                              View Profile
                              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover/profile:translate-x-0.5" />
                            </Link>

                            <Link
                              href={`/dashboard/messages?userId=${student.id}`}
                              aria-label={`Message ${fullName}`}
                              className="group/message inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-white/85 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/40"
                            >
                              <MessageCircle className="h-3.5 w-3.5 transition-transform duration-200 group-hover/message:scale-110" />
                              <span>Message</span>
                            </Link>
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </AnimatePresence>

        {students.length > 1 && (
          <>
            <motion.button
              type="button"
              onClick={() => move(-1)}
              aria-label="Previous student"
              whileHover={shouldReduceMotion ? undefined : { scale: 1.08 }}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.92 }}
              className="group absolute left-3 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white/80 backdrop-blur-sm transition-colors duration-200 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/40 sm:left-6 sm:h-11 sm:w-11"
            >
              <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
            </motion.button>

            <motion.button
              type="button"
              onClick={() => move(1)}
              aria-label="Next student"
              whileHover={shouldReduceMotion ? undefined : { scale: 1.08 }}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.92 }}
              className="group absolute right-3 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white/80 backdrop-blur-sm transition-colors duration-200 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/40 sm:right-6 sm:h-11 sm:w-11"
            >
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </motion.button>
          </>
        )}

      </div>

      <div className="flex items-center justify-between border-t border-[#DADCD3] bg-white px-4 py-2.5 sm:px-5">
        <div className="flex items-center gap-2">
          <motion.span
            animate={
              shouldReduceMotion
                ? undefined
                : { scale: [1, 1.35, 1] }
            }
            transition={{ duration: 1.8, repeat: Infinity }}
            className="h-1.5 w-1.5 rounded-full bg-[#55705B]"
          />

          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={safeIndex}
              initial={
                shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 5 }
              }
              animate={{ opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#8A9088]"
            >
              {safeIndex + 1} of {students.length}
            </motion.span>
          </AnimatePresence>
        </div>

        <span className="hidden text-[9px] font-semibold uppercase tracking-[0.12em] text-[#8A9088] sm:block">
          Swipe or use arrows
        </span>
      </div>
    </motion.section>
  );
}
