"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  MessageCircle,
} from "lucide-react";

/* ============================================================
   TYPES
============================================================ */

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
  autoplay?: boolean;
  interval?: number;
}

type CardPosition = "left" | "center" | "right";

/* ============================================================
   CONFIGURATION
============================================================ */

const DEFAULT_INTERVAL = 5000;
const SWIPE_THRESHOLD = 50;

/*
 * Fixed 3D positions.
 *
 * The presentation remains constant while the student data
 * changes between the three positions.
 */
const CARD_VARIANTS = {
  left: {
    x: -125,
    z: -150,
    rotateY: 10,
    scale: 0.85,
    opacity: 0.42,
  },

  center: {
    x: 0,
    z: 0,
    rotateY: 0,
    scale: 1,
    opacity: 1,
  },

  right: {
    x: 125,
    z: -150,
    rotateY: -10,
    scale: 0.85,
    opacity: 0.42,
  },
};

const CARD_TRANSITION = {
  type: "spring" as const,
  stiffness: 220,
  damping: 28,
  mass: 0.9,
};

const CONTENT_TRANSITION = {
  duration: 0.3,
  ease: [0.22, 1, 0.36, 1] as const,
};

/* ============================================================
   COMPONENT
============================================================ */

export function DiscoverStudents({
  students,
  isLoading = false,
  autoplay = true,
  interval = DEFAULT_INTERVAL,
}: DiscoverStudentsProps) {
  const shouldReduceMotion = useReducedMotion();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const touchStartX = useRef<number | null>(null);

  const animationTimeout =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ============================================================
     CLEANUP
  ============================================================ */

  useEffect(() => {
    return () => {
      if (animationTimeout.current) {
        clearTimeout(animationTimeout.current);
      }
    };
  }, []);

  /* ============================================================
     SAFE INDEX
     
     Derived instead of resetting state inside an effect.
     This avoids react-hooks/set-state-in-effect.
  ============================================================ */

  const safeCurrentIndex =
    students.length > 0
      ? Math.min(currentIndex, students.length - 1)
      : 0;

  /* ============================================================
     CAROUSEL NAVIGATION
  ============================================================ */

  const move = useCallback(
    (nextDirection: 1 | -1) => {
      if (
        students.length <= 1 ||
        isAnimating
      ) {
        return;
      }

      setIsAnimating(true);

      setCurrentIndex((previous) => {
        const validPrevious = Math.min(
          previous,
          students.length - 1,
        );

        if (nextDirection === 1) {
          return (
            (validPrevious + 1) %
            students.length
          );
        }

        return (
          (validPrevious - 1 + students.length) %
          students.length
        );
      });

      if (animationTimeout.current) {
        clearTimeout(animationTimeout.current);
      }

      animationTimeout.current = setTimeout(() => {
        setIsAnimating(false);
      }, 430);
    },
    [students.length, isAnimating],
  );

  /* ============================================================
     AUTOPLAY
  ============================================================ */

  useEffect(() => {
    if (
      !autoplay ||
      shouldReduceMotion ||
      students.length <= 1
    ) {
      return;
    }

    const timer = setInterval(() => {
      move(1);
    }, interval);

    return () => {
      clearInterval(timer);
    };
  }, [
    autoplay,
    interval,
    move,
    shouldReduceMotion,
    students.length,
  ]);

  /* ============================================================
     KEYBOARD NAVIGATION
  ============================================================ */

  useEffect(() => {
    if (students.length <= 1) {
      return;
    }

    const handleKeyDown = (
      event: KeyboardEvent,
    ) => {
      if (event.key === "ArrowLeft") {
        move(-1);
      }

      if (event.key === "ArrowRight") {
        move(1);
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [move, students.length]);

  /* ============================================================
     TOUCH / SWIPE
  ============================================================ */

  const handleTouchStart = (
    event: React.TouchEvent<HTMLDivElement>,
  ) => {
    touchStartX.current =
      event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (
    event: React.TouchEvent<HTMLDivElement>,
  ) => {
    if (touchStartX.current === null) {
      return;
    }

    const touchEndX =
      event.changedTouches[0]?.clientX ?? 0;

    const difference =
      touchStartX.current - touchEndX;

    touchStartX.current = null;

    if (
      Math.abs(difference) <
      SWIPE_THRESHOLD
    ) {
      return;
    }

    if (difference > 0) {
      move(1);
    } else {
      move(-1);
    }
  };

  /* ============================================================
     CIRCULAR STUDENT LOOKUP
  ============================================================ */

  const getStudentAt = useCallback(
    (offset: number) => {
      if (students.length === 0) {
        return null;
      }

      return students[
        (safeCurrentIndex +
          offset +
          students.length) %
          students.length
      ];
    },
    [safeCurrentIndex, students],
  );

  /* ============================================================
     FIXED 3-CARD TEMPLATE
  ============================================================ */

  const visibleStudents = useMemo(
    () => ({
      left: getStudentAt(-1),
      center: getStudentAt(0),
      right: getStudentAt(1),
    }),
    [getStudentAt],
  );

  /* ============================================================
     BACKGROUND STUDENTS
     
     No blur.
     These create depth through scale + opacity only.
  ============================================================ */

  const backgroundStudents = useMemo(
    () => ({
      farLeft: getStudentAt(-2),
      farRight: getStudentAt(2),
      veryFarLeft: getStudentAt(-3),
      veryFarRight: getStudentAt(3),
    }),
    [getStudentAt],
  );

  /* ============================================================
     LOADING SKELETON
  ============================================================ */

  if (isLoading) {
    return (
      <section className="w-full">
        <div className="overflow-hidden rounded-2xl bg-[#111827] px-4 py-6 sm:px-6 sm:py-8">
          <div className="mx-auto flex max-w-6xl flex-col items-center">
            <div className="mb-4 h-3 w-32 animate-pulse rounded-full bg-white/10" />

            <div className="relative h-[370px] w-full max-w-[290px] overflow-hidden rounded-2xl border border-white/10 bg-[#18212F] shadow-xl">
              <div className="absolute inset-0 animate-pulse bg-white/[0.03]" />

              <div className="absolute inset-x-4 bottom-4 space-y-2">
                <div className="h-4 w-2/3 animate-pulse rounded bg-white/10" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-white/10" />
                <div className="h-8 w-full animate-pulse rounded bg-white/10" />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  /* ============================================================
     EMPTY STATE
  ============================================================ */

  if (students.length === 0) {
    return (
      <section className="w-full">
        <div className="rounded-2xl border border-[#DADCD3] bg-white px-5 py-8 text-center sm:px-8">
          <div className="mx-auto max-w-md">
            <h3 className="text-sm font-semibold text-[#12203B]">
              No students to discover
            </h3>

            <p className="mt-1 text-xs leading-5 text-[#6B7268]">
              Student profiles will appear here when
              they become available.
            </p>
          </div>
        </div>
      </section>
    );
  }

  /* ============================================================
     REUSABLE 3D STUDENT CARD
  ============================================================ */

  const renderCard = (
    student: DiscoverStudent | null,
    position: CardPosition,
  ) => {
    if (!student) {
      return null;
    }

    const isCenter =
      position === "center";

    const name =
      `${student.firstName} ${student.lastName}`.trim();

    const image =
      student.profileImageUrl ||
      "/default-avatar.png";

    const profileHref =
      `/dashboard/students/${student.id}`;

    const messageHref =
      `/dashboard/messages?user=${student.id}`;

    return (
      /*
       * Wrapper controls the card's fixed center point.
       * Framer Motion controls only the 3D movement.
       */
      <div
        key={`${position}-${student.id}`}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          zIndex: isCenter ? 30 : 10,
        }}
      >
        <motion.article
          className={[
            "relative h-[410px] w-[290px]",
            "overflow-hidden rounded-2xl border",
            "bg-[#18212F]",
            "shadow-[0_18px_45px_rgba(0,0,0,0.3)]",
            "will-change-transform",
            isCenter
              ? "border-white/15"
              : "border-white/10",
          ].join(" ")}
          initial={false}
          animate={
            shouldReduceMotion
              ? {
                  x: CARD_VARIANTS[position].x,
                  z: 0,
                  rotateY: 0,
                  scale:
                    position === "center"
                      ? 1
                      : 0.85,
                  opacity:
                    position === "center"
                      ? 1
                      : 0.42,
                }
              : CARD_VARIANTS[position]
          }
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : CARD_TRANSITION
          }
          style={{
            transformStyle: "preserve-3d",
            backfaceVisibility: "hidden",
            pointerEvents: isCenter
              ? "auto"
              : "none",
          }}
        >
          {/* ==================================================
              FULL-BLEED PROFILE IMAGE
              
              object-cover makes the image fill the complete
              card instead of leaving empty areas.

              The image is NOT blurred.
          ================================================== */}

          <div className="absolute inset-0 bg-[#202A39]">
            <Image
              src={image}
              alt={name}
              fill
              sizes="(max-width: 768px) 290px, 290px"
              className="object-cover object-center"
              quality={85}
              priority={isCenter}
            />

            {/* =================================================
                CONTROLLED READABILITY GRADIENT

                Only the bottom portion is darkened.
                The main profile image remains clear.
            ================================================= */}

            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-[48%]"
              style={{
                background:
                  "linear-gradient(to top, rgba(24,33,47,0.98) 0%, rgba(24,33,47,0.84) 30%, rgba(24,33,47,0.45) 62%, rgba(24,33,47,0) 100%)",
              }}
            />
          </div>

          {/* ==================================================
              STUDENT INFORMATION
          ================================================== */}

          <div className="absolute inset-x-0 bottom-0 z-10 overflow-hidden px-4 pb-4 pt-14">
            <AnimatePresence
              mode="wait"
              initial={false}
            >
              {isCenter && (
                <motion.div
                  key={student.id}
                  initial={
                    shouldReduceMotion
                      ? false
                      : {
                          opacity: 0,
                          y: 10,
                        }
                  }
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={
                    shouldReduceMotion
                      ? undefined
                      : {
                          opacity: 0,
                          y: -8,
                        }
                  }
                  transition={
                    shouldReduceMotion
                      ? { duration: 0 }
                      : CONTENT_TRANSITION
                  }
                >
                  {/* Student name */}
                  <h3 className="min-h-[24px] truncate text-[18px] font-semibold leading-6 tracking-[-0.01em] text-white">
                    {name}
                  </h3>

                  {/* Course */}
                  <div className="mt-1 min-h-[18px]">
                    {student.generalCourse ? (
                      <p className="truncate text-[13px] font-medium text-white/85">
                        {student.generalCourse}
                      </p>
                    ) : (
                      <p className="text-[13px] text-white/65">
                        Student
                      </p>
                    )}
                  </div>

                  {/* Tech center */}
                  <div className="mt-1.5 flex min-h-[18px] items-center gap-1 text-white/75">
                    {student.techCenter?.name ? (
                      <>
                        <MapPin
                          className="h-3 w-3 shrink-0"
                          strokeWidth={1.8}
                        />

                        <span className="truncate text-[12px]">
                          {student.techCenter.name}
                        </span>
                      </>
                    ) : (
                      <span className="text-[12px]">
                        Tech center not specified
                      </span>
                    )}
                  </div>

                  {/* ==================================================
                      ACTIONS
                  ================================================== */}

                  <div className="mt-3 flex items-center gap-1.5">
                    <Link
                      href={profileHref}
                      className="inline-flex h-8 flex-1 items-center justify-center rounded-lg bg-white px-3 text-[12px] font-semibold text-[#12203B] transition-colors hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-white/40"
                    >
                      View profile
                    </Link>

                    <Link
                      href={messageHref}
                      aria-label={`Message ${name}`}
                      className="inline-flex h-8 w-9 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/[0.08] text-white/90 transition-colors hover:bg-white/[0.14] hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30"
                    >
                      <MessageCircle
                        className="h-3.5 w-3.5"
                        strokeWidth={1.8}
                      />
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.article>
      </div>
    );
  };

  /* ============================================================
     GO TO SPECIFIC STUDENT
  ============================================================ */

  const goToStudent = (
    index: number,
  ) => {
    if (
      index === safeCurrentIndex ||
      isAnimating
    ) {
      return;
    }

    setIsAnimating(true);
    setCurrentIndex(index);

    if (animationTimeout.current) {
      clearTimeout(animationTimeout.current);
    }

    animationTimeout.current = setTimeout(() => {
      setIsAnimating(false);
    }, 430);
  };

  /* ============================================================
     MAIN
  ============================================================ */

  return (
    <section className="w-full">
      <div
        className="overflow-hidden rounded-2xl bg-[#111827]"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="mx-auto flex max-w-6xl items-end justify-between gap-4 px-5 pb-1 pt-4 sm:px-7 sm:pt-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#B98A3E]">
              Student community
            </p>

            <h2 className="mt-1 text-lg font-semibold tracking-[-0.02em] text-white sm:text-xl">
              Discover students
            </h2>

            <p className="mt-0.5 max-w-lg text-[12px] leading-5 text-white/70 sm:text-sm">
              Meet students across SELFLESS CE and
              connect with people on a similar
              academic journey.
            </p>
          </div>

          {/* Desktop controls */}
          <div className="hidden shrink-0 items-center gap-1.5 sm:flex">
            <button
              type="button"
              onClick={() => move(-1)}
              disabled={
                isAnimating ||
                students.length <= 1
              }
              aria-label="Previous student"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/70 transition-all hover:bg-white/[0.09] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ArrowLeft
                className="h-3.5 w-3.5"
                strokeWidth={1.8}
              />
            </button>

            <button
              type="button"
              onClick={() => move(1)}
              disabled={
                isAnimating ||
                students.length <= 1
              }
              aria-label="Next student"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/70 transition-all hover:bg-white/[0.09] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ArrowRight
                className="h-3.5 w-3.5"
                strokeWidth={1.8}
              />
            </button>
          </div>
        </div>

        {/* ==================================================
            3D CAROUSEL STAGE
        ================================================== */}

        <div
          className="relative mx-auto mt-2 h-[420px] w-full max-w-[620px] overflow-hidden sm:h-[440px]"
          style={{
            perspective: "1100px",
            perspectiveOrigin: "50% 50%",
          }}
        >
          {/* ==================================================
              BACKGROUND STUDENTS
              
              No blur.
              No gradient.
              No backdrop filter.
          ================================================== */}

          <div className="pointer-events-none absolute inset-0">
            {/* Very far left */}
            {backgroundStudents.veryFarLeft && (
              <div className="absolute left-[5%] top-1/2 -translate-y-1/2 scale-[0.6] opacity-[0.13]">
                <div className="relative h-[350px] w-[240px] overflow-hidden rounded-2xl border border-white/5 bg-[#18212F]">
                  <Image
                    src={
                      backgroundStudents
                        .veryFarLeft
                        .profileImageUrl ||
                      "/default-avatar.png"
                    }
                    alt="Student profile"
                    fill
                    sizes="240px"
                    className="object-cover object-center"
                  />
                </div>
              </div>
            )}

            {/* Very far right */}
            {backgroundStudents.veryFarRight && (
              <div className="absolute right-[5%] top-1/2 -translate-y-1/2 scale-[0.6] opacity-[0.13]">
                <div className="relative h-[350px] w-[240px] overflow-hidden rounded-2xl border border-white/5 bg-[#18212F]">
                  <Image
                    src={
                      backgroundStudents
                        .veryFarRight
                        .profileImageUrl ||
                      "/default-avatar.png"
                    }
                    alt="Student profile"
                    fill
                    sizes="240px"
                    className="object-cover object-center"
                  />
                </div>
              </div>
            )}

            {/* Near left */}
            {backgroundStudents.farLeft && (
              <div className="absolute left-[15%] top-1/2 -translate-y-1/2 scale-[0.75] opacity-[0.24]">
                <div className="relative h-[350px] w-[240px] overflow-hidden rounded-2xl border border-white/5 bg-[#18212F]">
                  <Image
                    src={
                      backgroundStudents
                        .farLeft
                        .profileImageUrl ||
                      "/default-avatar.png"
                    }
                    alt="Student profile"
                    fill
                    sizes="240px"
                    className="object-cover object-center"
                  />
                </div>
              </div>
            )}

            {/* Near right */}
            {backgroundStudents.farRight && (
              <div className="absolute right-[15%] top-1/2 -translate-y-1/2 scale-[0.75] opacity-[0.24]">
                <div className="relative h-[350px] w-[240px] overflow-hidden rounded-2xl border border-white/5 bg-[#18212F]">
                  <Image
                    src={
                      backgroundStudents
                        .farRight
                        .profileImageUrl ||
                      "/default-avatar.png"
                    }
                    alt="Student profile"
                    fill
                    sizes="240px"
                    className="object-cover object-center"
                  />
                </div>
              </div>
            )}
          </div>

          {/* ==================================================
              FIXED 3D SPACE
          ================================================== */}

          <div
            className="absolute inset-0"
            style={{
              transformStyle: "preserve-3d",
            }}
          >
            {renderCard(
              visibleStudents.left,
              "left",
            )}

            {renderCard(
              visibleStudents.right,
              "right",
            )}

            {renderCard(
              visibleStudents.center,
              "center",
            )}
          </div>

          {/* ==================================================
              MOBILE CONTROLS
              
              No blur.
          ================================================== */}

          <div className="absolute bottom-2 left-0 right-0 flex items-center justify-between px-4 sm:hidden">
            {/* Previous */}
            <button
              type="button"
              onClick={() => move(-1)}
              disabled={
                isAnimating ||
                students.length <= 1
              }
              aria-label="Previous student"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-[#18212F] text-white/80 shadow-lg transition-all hover:bg-[#202A39] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ArrowLeft
                className="h-4 w-4"
                strokeWidth={2}
              />
            </button>

            {/* Pagination */}
            <div className="mx-2 flex max-w-[120px] items-center justify-center gap-1.5 overflow-hidden">
              {students.map(
                (student, index) => {
                  const isActive =
                    index ===
                    safeCurrentIndex;

                  return (
                    <button
                      key={student.id}
                      type="button"
                      aria-label={`Go to student ${
                        index + 1
                      }`}
                      onClick={() =>
                        goToStudent(index)
                      }
                      className={[
                        "h-1.5 rounded-full transition-all duration-300",
                        isActive
                          ? "w-5 bg-white"
                          : "w-1.5 bg-white/25 hover:bg-white/45",
                      ].join(" ")}
                    />
                  );
                },
              )}
            </div>

            {/* Next */}
            <button
              type="button"
              onClick={() => move(1)}
              disabled={
                isAnimating ||
                students.length <= 1
              }
              aria-label="Next student"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-[#18212F] text-white/80 shadow-lg transition-all hover:bg-[#202A39] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ArrowRight
                className="h-4 w-4"
                strokeWidth={2}
              />
            </button>
          </div>
        </div>

        {/* ==================================================
            FOOTER
        ================================================== */}

        <div className="flex items-center justify-center border-t border-white/[0.07] px-5 py-2.5">
          <div className="flex items-center gap-2 text-[12px] text-white/60">
            <span className="font-medium text-white/80">
              {safeCurrentIndex + 1}
            </span>

            <span>/</span>

            <span>{students.length}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default DiscoverStudents;