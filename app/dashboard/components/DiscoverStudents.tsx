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

/* Card dimensions — image + info split */
const CARD_WIDTH = 290;
const CARD_HEIGHT = 420;
const IMAGE_HEIGHT = 280; // info panel gets the rest

/* ============================================================
   THEME TOKENS
============================================================ */

const GOLD = "#C8A24A";
const WHITE = "#FFFFFF";
const WHITE_85 = "rgba(255, 255, 255, 0.85)";
const WHITE_70 = "rgba(255, 255, 255, 0.70)";
const WHITE_50 = "rgba(255, 255, 255, 0.50)";

/* Info panel — solid surface, no overlays on image */
const PANEL_BG = "#0F1115";
const PANEL_BORDER = "rgba(200, 162, 74, 0.22)";

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
      if (students.length <= 1 || isAnimating) {
        return;
      }

      setIsAnimating(true);

      setCurrentIndex((previous) => {
        const validPrevious = Math.min(
          previous,
          students.length - 1,
        );

        if (nextDirection === 1) {
          return (validPrevious + 1) % students.length;
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

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        move(-1);
      }

      if (event.key === "ArrowRight") {
        move(1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
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

    const difference = touchStartX.current - touchEndX;

    touchStartX.current = null;

    if (Math.abs(difference) < SWIPE_THRESHOLD) {
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
        (safeCurrentIndex + offset + students.length) %
          students.length
      ];
    },
    [safeCurrentIndex, students],
  );

  /* ============================================================
     VISIBLE + BACKGROUND STUDENTS
  ============================================================ */

  const visibleStudents = useMemo(
    () => ({
      left: getStudentAt(-1),
      center: getStudentAt(0),
      right: getStudentAt(1),
    }),
    [getStudentAt],
  );

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
        <div className="overflow-hidden rounded-2xl bg-black px-4 py-6 sm:px-6 sm:py-8">
          <div className="mx-auto flex max-w-6xl flex-col items-center">
            <div className="mb-4 h-3 w-32 animate-pulse rounded-full bg-white/10" />

            <div
              className="relative overflow-hidden rounded-2xl border border-white/10 bg-black shadow-xl"
              style={{
                width: CARD_WIDTH,
                height: CARD_HEIGHT,
              }}
            >
              <div className="h-[280px] animate-pulse bg-white/[0.04]" />
              <div className="space-y-2 p-4">
                <div className="h-4 w-2/3 animate-pulse rounded bg-white/10" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-white/10" />
                <div className="mt-3 h-8 w-full animate-pulse rounded bg-white/10" />
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
        <div className="rounded-2xl border border-white/10 bg-black px-5 py-8 text-center sm:px-8">
          <div className="mx-auto max-w-md">
            <h3
              className="text-sm font-semibold"
              style={{ color: GOLD }}
            >
              No students to discover
            </h3>
            <p
              className="mt-1 text-xs leading-5"
              style={{ color: WHITE_70 }}
            >
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

    const isCenter = position === "center";

    const name =
      `${student.firstName} ${student.lastName}`.trim();

    const image =
      student.profileImageUrl || "/default-avatar.png";

    const profileHref =
      `/dashboard/students/${student.id}`;

    const messageHref =
      `/dashboard/messages?user=${student.id}`;

    return (
      <div
        key={`${position}-${student.id}`}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ zIndex: isCenter ? 30 : 10 }}
      >
        <motion.article
          className={[
            "relative flex flex-col",
            "overflow-hidden rounded-2xl border",
            "bg-[#0F1115]",
            "shadow-[0_18px_45px_rgba(0,0,0,0.5)]",
            "will-change-transform",
            isCenter
              ? "border-[#C8A24A]/40"
              : "border-white/10",
          ].join(" ")}
          style={{
            width: CARD_WIDTH,
            height: CARD_HEIGHT,
            transformStyle: "preserve-3d",
            backfaceVisibility: "hidden",
            pointerEvents: isCenter ? "auto" : "none",
          }}
          initial={false}
          animate={
            shouldReduceMotion
              ? {
                x: CARD_VARIANTS[position].x,
                z: 0,
                rotateY: 0,
                scale:
                  position === "center" ? 1 : 0.85,
                opacity:
                  position === "center" ? 1 : 0.42,
              }
              : CARD_VARIANTS[position]
          }
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : CARD_TRANSITION
          }
        >
          {/* ==================================================
              IMAGE SECTION — TOP
              Pure image. Nothing on it. No overlay, no text.
          ================================================== */}

          <div
            className="relative w-full shrink-0 bg-black"
            style={{ height: IMAGE_HEIGHT }}
          >
            <Image
              key={image}
              src={image}
              alt={name}
              fill
              sizes={`${CARD_WIDTH}px`}
              className="object-cover object-center"
              quality={95}
              priority={isCenter}
            />
          </div>

          {/* ==================================================
              INFO SECTION — BOTTOM
              Solid surface. No overlays on the image above.
          ================================================== */}

          <div
            className="flex flex-1 flex-col justify-between px-4 py-3"
            style={{
              backgroundColor: PANEL_BG,
              borderTop: `1px solid ${PANEL_BORDER}`,
            }}
          >
            <AnimatePresence mode="wait" initial={false}>
              {isCenter && (
                <motion.div
                  key={student.id}
                  initial={
                    shouldReduceMotion
                      ? false
                      : { opacity: 0, y: 8 }
                  }
                  animate={{ opacity: 1, y: 0 }}
                  exit={
                    shouldReduceMotion
                      ? undefined
                      : { opacity: 0, y: -6 }
                  }
                  transition={
                    shouldReduceMotion
                      ? { duration: 0 }
                      : CONTENT_TRANSITION
                  }
                  className="flex h-full flex-col justify-between"
                >
                  {/* ---------- Text block ---------- */}
                  <div>
                    <h3
                      className="truncate text-[17px] font-semibold leading-6 tracking-[-0.01em]"
                      style={{ color: GOLD }}
                    >
                      {name}
                    </h3>

                    <p
                      className="mt-0.5 truncate text-[13px] font-medium"
                      style={{ color: WHITE }}
                    >
                      {student.generalCourse || "Student"}
                    </p>

                    <div className="mt-1 flex items-center gap-1">
                      {student.techCenter?.name ? (
                        <>
                          <MapPin
                            className="h-3 w-3 shrink-0"
                            strokeWidth={1.8}
                            style={{ color: GOLD }}
                          />
                          <span
                            className="truncate text-[12px]"
                            style={{ color: WHITE_85 }}
                          >
                            {student.techCenter.name}
                          </span>
                        </>
                      ) : (
                        <span
                          className="text-[12px]"
                          style={{ color: WHITE_50 }}
                        >
                          Tech center not specified
                        </span>
                      )}
                    </div>
                  </div>

                  {/* ---------- Actions ---------- */}
                  <div className="mt-3 flex items-center gap-1.5">
                    <Link
                      href={profileHref}
                      className="inline-flex h-8 flex-1 items-center justify-center rounded-lg px-3 text-[12px] font-semibold transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#C8A24A]/40"
                      style={{
                        backgroundColor: GOLD,
                        color: "#000000",
                      }}
                    >
                      View profile
                    </Link>

                    <Link
                      href={messageHref}
                      aria-label={`Message ${name}`}
                      className="inline-flex h-8 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors hover:bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-[#C8A24A]/40"
                      style={{
                        borderColor:
                          "rgba(200, 162, 74, 0.45)",
                        color: GOLD,
                      }}
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

  const goToStudent = (index: number) => {
    if (index === safeCurrentIndex || isAnimating) {
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
        className="overflow-hidden rounded-2xl bg-black"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="mx-auto flex max-w-6xl items-end justify-between gap-4 px-5 pb-1 pt-4 sm:px-7 sm:pt-5">
          <div>
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.16em]"
              style={{ color: GOLD }}
            >
              Student community
            </p>

            <h2
              className="mt-1 text-lg font-semibold tracking-[-0.02em] sm:text-xl"
              style={{ color: WHITE }}
            >
              Discover students
            </h2>

            <p
              className="mt-0.5 max-w-lg text-[12px] leading-5 sm:text-sm"
              style={{ color: WHITE_70 }}
            >
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
              disabled={isAnimating || students.length <= 1}
              aria-label="Previous student"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border transition-colors hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-30"
              style={{
                borderColor: "rgba(200, 162, 74, 0.35)",
                color: GOLD,
              }}
            >
              <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.8} />
            </button>

            <button
              type="button"
              onClick={() => move(1)}
              disabled={isAnimating || students.length <= 1}
              aria-label="Next student"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border transition-colors hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-30"
              style={{
                borderColor: "rgba(200, 162, 74, 0.35)",
                color: GOLD,
              }}
            >
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.8} />
            </button>
          </div>
        </div>

        {/* ==================================================
            3D CAROUSEL STAGE
        ================================================== */}

        <div
          className="relative mx-auto mt-2 h-[440px] w-full max-w-[620px] overflow-hidden sm:h-[460px]"
          style={{
            perspective: "1100px",
            perspectiveOrigin: "50% 50%",
          }}
        >
          {/* Background students — image only, no info */}
          <div className="pointer-events-none absolute inset-0">
            {backgroundStudents.veryFarLeft && (
              <div className="absolute left-[5%] top-1/2 -translate-y-1/2 scale-[0.6] opacity-[0.13]">
                <div className="relative h-[350px] w-[240px] overflow-hidden rounded-2xl border border-white/5 bg-black">
                  <Image
                    key={backgroundStudents.veryFarLeft.profileImageUrl || "/default-avatar.png"}
                    src={backgroundStudents.veryFarLeft.profileImageUrl || "/default-avatar.png"}
                    alt="Student profile"
                    fill
                    sizes="240px"
                    className="object-cover object-center"
                  />
                </div>
              </div>
            )}

            {backgroundStudents.veryFarRight && (
              <div className="absolute right-[5%] top-1/2 -translate-y-1/2 scale-[0.6] opacity-[0.13]">
                <div className="relative h-[350px] w-[240px] overflow-hidden rounded-2xl border border-white/5 bg-black">
                  <Image
                    key={backgroundStudents.veryFarRight.profileImageUrl || "/default-avatar.png"}
                    src={backgroundStudents.veryFarRight.profileImageUrl || "/default-avatar.png"}
                    alt="Student profile"
                    fill
                    sizes="240px"
                    className="object-cover object-center"
                  />
                </div>
              </div>
            )}

            {backgroundStudents.farLeft && (
              <div className="absolute left-[15%] top-1/2 -translate-y-1/2 scale-[0.75] opacity-[0.24]">
                <div className="relative h-[350px] w-[240px] overflow-hidden rounded-2xl border border-white/5 bg-black">
                  <Image
                    key={backgroundStudents.farLeft.profileImageUrl || "/default-avatar.png"}
                    src={backgroundStudents.farLeft.profileImageUrl || "/default-avatar.png"}
                    alt="Student profile"
                    fill
                    sizes="240px"
                    className="object-cover object-center"
                  />
                </div>
              </div>
            )}

            {backgroundStudents.farRight && (
              <div className="absolute right-[15%] top-1/2 -translate-y-1/2 scale-[0.75] opacity-[0.24]">
                <div className="relative h-[350px] w-[240px] overflow-hidden rounded-2xl border border-white/5 bg-black">
                  <Image
                    key={backgroundStudents.farRight.profileImageUrl || "/default-avatar.png"}
                    src={backgroundStudents.farRight.profileImageUrl || "/default-avatar.png"}
                    alt="Student profile"
                    fill
                    sizes="240px"
                    className="object-cover object-center"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 3D space */}
          <div
            className="absolute inset-0"
            style={{ transformStyle: "preserve-3d" }}
          >
            {renderCard(visibleStudents.left, "left")}
            {renderCard(visibleStudents.right, "right")}
            {renderCard(visibleStudents.center, "center")}
          </div>
        </div>

        {/* ==================================================
            FOOTER
        ================================================== */}

        <div className="flex items-center justify-between border-t border-white/[0.07] px-4 py-2.5 sm:justify-center">
          <button
            type="button"
            onClick={() => move(-1)}
            disabled={isAnimating || students.length <= 1}
            aria-label="Previous student"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border transition-colors hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-30 sm:hidden"
            style={{
              borderColor: "rgba(200, 162, 74, 0.35)",
              color: GOLD,
            }}
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.8} />
          </button>

          <div
            className="flex items-center gap-2 text-[12px]"
            style={{ color: WHITE_70 }}
          >
            <span className="font-medium" style={{ color: GOLD }}>
              {safeCurrentIndex + 1}
            </span>
            <span style={{ color: WHITE_50 }}>/</span>
            <span style={{ color: WHITE }}>{students.length}</span>
          </div>

          <button
            type="button"
            onClick={() => move(1)}
            disabled={isAnimating || students.length <= 1}
            aria-label="Next student"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border transition-colors hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-30 sm:hidden"
            style={{
              borderColor: "rgba(200, 162, 74, 0.35)",
              color: GOLD,
            }}
          >
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.8} />
          </button>
        </div>
      </div>
    </section>
  );
}

export default DiscoverStudents;