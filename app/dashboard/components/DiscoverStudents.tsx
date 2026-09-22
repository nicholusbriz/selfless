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
  ArrowDown,
  ArrowUp,
  MapPin,
  Pause,
  Play,
} from "lucide-react";

/* ============================================================
   TYPES
============================================================ */

export type DiscoverStudent = {
  id: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string | null;
  generalCourse?:
    | string
    | null
    | { id?: string; name?: string };
  techCenter?:
    | string
    | null
    | { id?: string; name?: string };
};

type DiscoverStudentsProps = {
  students: DiscoverStudent[];
  isLoading?: boolean;
  autoplay?: boolean;
  interval?: number;
};

/* ============================================================
   CONFIG
============================================================ */

/*
 * AUTOPLAY DELAY
 * --------------
 * How long each student stays visible before sliding.
 * Set to 5000ms = 5 seconds.
 */
const DEFAULT_INTERVAL = 5000;

const CONTENT_DURATION_S = 0.42;
const TOTAL_SLIDE_MS = CONTENT_DURATION_S * 1000;

const SWIPE_THRESHOLD = 40;

const CARD_ASPECT = 0.76;
const INFO_RATIO = 0.205;

/*
 * CARD SIZING
 * -----------
 * On mobile, we now use a much larger share of the
 * available screen so the card feels alive and immersive.
 */
const MAX_CARD_WIDTH = 400;
const MIN_CARD_WIDTH = 270;

/* Horizontal padding from the container edge */
const MOBILE_HORIZONTAL_PADDING = 12;   // was 20 → tighter edges
const DESKTOP_HORIZONTAL_PADDING = 80;

/*
 * Vertical space reserved for header + footer + breathing room.
 * Reduced on mobile so the card can grow.
 */
const MOBILE_RESERVED_VERTICAL = 120;   // was 165 → more card
const DESKTOP_RESERVED_VERTICAL = 165;

const MOBILE_MAX = 639;

/* ============================================================
   THEME
============================================================ */

const GOLD = "#C8A24A";
const GOLD_BRIGHT = "#D9B563";

const WHITE = "#FFFFFF";
const WHITE_85 = "rgba(255, 255, 255, 0.85)";
const WHITE_70 = "rgba(255, 255, 255, 0.70)";
const WHITE_50 = "rgba(255, 255, 255, 0.50)";

const PANEL_BG = "#0F1115";
const PANEL_BORDER = "rgba(200, 162, 74, 0.22)";

const CONTENT_EASE = [0.22, 1, 0.36, 1] as const;

/* ============================================================
   HOOKS
============================================================ */

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(
      `(max-width: ${MOBILE_MAX}px)`,
    );
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return isMobile;
}

function useResponsiveCardSize(
  containerRef: React.RefObject<HTMLDivElement | null>,
  isMobile: boolean,
) {
  const [size, setSize] = useState({
    width: 340,
    height: 447,
    infoHeight: 92,
  });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const availableWidth = el.clientWidth;
      if (!availableWidth) return;

      const horizontalPadding = isMobile
        ? MOBILE_HORIZONTAL_PADDING
        : DESKTOP_HORIZONTAL_PADDING;

      const usableWidth = Math.max(
        MIN_CARD_WIDTH,
        availableWidth - horizontalPadding,
      );

      const reserved = isMobile
        ? MOBILE_RESERVED_VERTICAL
        : DESKTOP_RESERVED_VERTICAL;

      const availableHeight = Math.max(
        360,
        window.innerHeight - reserved,
      );

      const widthFromHeight = availableHeight * CARD_ASPECT;

      const calculatedWidth = Math.min(
        MAX_CARD_WIDTH,
        usableWidth,
        widthFromHeight,
      );

      const width = Math.max(
        MIN_CARD_WIDTH,
        Math.round(calculatedWidth),
      );

      const height = Math.round(width / CARD_ASPECT);

      /* Info panel a touch taller on mobile so text
         doesn't feel cramped inside a bigger card */
      const infoRatio = isMobile ? 0.22 : INFO_RATIO;
      const infoHeight = Math.max(
        82,
        Math.round(height * infoRatio),
      );

      setSize({ width, height, infoHeight });
    };

    update();

    const observer = new ResizeObserver(update);
    observer.observe(el);

    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, [containerRef, isMobile]);

  return size;
}

/* ============================================================
   AGGRESSIVE IMAGE PRELOADER
============================================================ */

function useImagePreloader(urls: string[]) {
  const [readyUrls, setReadyUrls] = useState<Set<string>>(
    () => new Set(),
  );

  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (urls.length === 0) {
      setReadyUrls(new Set());
      setHasError(false);
      return;
    }

    let cancelled = false;
    const images: HTMLImageElement[] = [];

    const markReady = (url: string) => {
      if (cancelled) return;
      setReadyUrls((prev) => {
        if (prev.has(url)) return prev;
        const next = new Set(prev);
        next.add(url);
        return next;
      });
    };

    urls.forEach((url) => {
      const img = new window.Image();
      img.decoding = "async";
      img.loading = "eager";

      const onLoad = () => markReady(url);
      const onError = () => {
        markReady(url);
        setHasError(true);
      };

      img.addEventListener("load", onLoad);
      img.addEventListener("error", onError);

      img.src = url;
      images.push(img);
    });

    Promise.allSettled(
      urls.map((url) =>
        fetch(url, {
          cache: "force-cache",
          credentials: "same-origin",
        }).catch(() => null),
      ),
    ).catch(() => {});

    return () => {
      cancelled = true;
      images.forEach((img) => {
        img.onload = null;
        img.onerror = null;
      });
      images.length = 0;
    };
  }, [urls.join("|")]);

  return { readyUrls, hasError };
}

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
  const isMobile = useIsMobile();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const transitionTimeoutRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  const autoplayTimeoutRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  const stageContainerRef =
    useRef<HTMLDivElement | null>(null);

  const size = useResponsiveCardSize(
    stageContainerRef,
    isMobile,
  );

  const visibleStudents = useMemo(
    () => students.filter(Boolean),
    [students],
  );

  const imageUrls = useMemo(
    () =>
      visibleStudents
        .map((s) => s.profileImageUrl)
        .filter((u): u is string => Boolean(u && u.trim())),
    [visibleStudents],
  );

  const { readyUrls, hasError } = useImagePreloader(imageUrls);

  const allImagesReady =
    imageUrls.length === 0 ||
    imageUrls.every((u) => readyUrls.has(u));

  const currentStudent =
    visibleStudents.length > 0
      ? visibleStudents[
          currentIndex % visibleStudents.length
        ]
      : null;

  const getDisplayValue = useCallback(
    (
      value:
        | string
        | null
        | undefined
        | { id?: string; name?: string },
    ) => {
      if (!value) return "";
      if (typeof value === "string") return value;
      if (typeof value === "object") return value.name ?? "";
      return "";
    },
    [],
  );

  const clearTransitionTimeout = useCallback(() => {
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }
  }, []);

  const clearAutoplayTimeout = useCallback(() => {
    if (autoplayTimeoutRef.current) {
      clearTimeout(autoplayTimeoutRef.current);
      autoplayTimeoutRef.current = null;
    }
  }, []);

  /* ============================================================
     MOVE
  ============================================================ */

  const move = useCallback(
    (step: 1 | -1) => {
      if (visibleStudents.length <= 1 || isTransitioning) {
        return;
      }

      clearAutoplayTimeout();
      clearTransitionTimeout();

      setDirection(step);
      setIsTransitioning(true);

      setCurrentIndex((previousIndex) => {
        const nextIndex = previousIndex + step;
        if (nextIndex < 0) return visibleStudents.length - 1;
        if (nextIndex >= visibleStudents.length) return 0;
        return nextIndex;
      });

      transitionTimeoutRef.current = setTimeout(() => {
        setIsTransitioning(false);
        transitionTimeoutRef.current = null;
      }, TOTAL_SLIDE_MS);
    },
    [
      visibleStudents.length,
      isTransitioning,
      clearAutoplayTimeout,
      clearTransitionTimeout,
    ],
  );

  /* ============================================================
     AUTOPLAY — 5 seconds forward only
     ------------------------------------------------------------
     After each transition finishes, the timer starts fresh.
     The result: every student is visible for exactly
     `interval` ms (5000ms = 5 seconds) before sliding away.
  ============================================================ */

  useEffect(() => {
    clearAutoplayTimeout();

    if (
      !autoplay ||
      isPaused ||
      shouldReduceMotion ||
      visibleStudents.length <= 1 ||
      isLoading ||
      isTransitioning ||
      !allImagesReady
    ) {
      return;
    }

    autoplayTimeoutRef.current = setTimeout(() => {
      move(1);
    }, Math.max(0, interval));

    return clearAutoplayTimeout;
  }, [
    autoplay,
    isPaused,
    interval,
    visibleStudents.length,
    isLoading,
    isTransitioning,
    currentIndex,
    move,
    clearAutoplayTimeout,
    shouldReduceMotion,
    allImagesReady,
  ]);

  useEffect(() => {
    return () => {
      clearTransitionTimeout();
      clearAutoplayTimeout();
    };
  }, [clearTransitionTimeout, clearAutoplayTimeout]);

  useEffect(() => {
    if (visibleStudents.length === 0) {
      setCurrentIndex(0);
      return;
    }
    setCurrentIndex(
      (previousIndex) =>
        previousIndex % visibleStudents.length,
    );
  }, [visibleStudents.length]);

  const handlePrevious = useCallback(() => {
    move(-1);
  }, [move]);

  const handleNext = useCallback(() => {
    move(1);
  }, [move]);

  const togglePause = useCallback(() => {
    setIsPaused((p) => !p);
  }, []);

  /* Keyboard */
  useEffect(() => {
    if (visibleStudents.length <= 1) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") move(-1);
      if (event.key === "ArrowRight") move(1);
      if (event.key === "ArrowUp") move(-1);
      if (event.key === "ArrowDown") move(1);
      if (event.key === " " || event.key === "Spacebar") {
        const t = event.target as HTMLElement;
        if (
          t.tagName !== "INPUT" &&
          t.tagName !== "TEXTAREA" &&
          t.tagName !== "A" &&
          t.tagName !== "BUTTON"
        ) {
          event.preventDefault();
          togglePause();
        }
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visibleStudents.length, move, togglePause]);

  /* Swipe */
  const handleTouchStart = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      if (visibleStudents.length <= 1) return;
      touchStartXRef.current =
        event.touches[0]?.clientX ?? null;
      touchStartYRef.current =
        event.touches[0]?.clientY ?? null;
    },
    [visibleStudents.length],
  );

  const handleTouchEnd = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      if (
        visibleStudents.length <= 1 ||
        touchStartXRef.current === null ||
        touchStartYRef.current === null
      ) {
        return;
      }

      const endX =
        event.changedTouches[0]?.clientX ??
        touchStartXRef.current;
      const endY =
        event.changedTouches[0]?.clientY ??
        touchStartYRef.current;

      const deltaX = endX - touchStartXRef.current;
      const deltaY = endY - touchStartYRef.current;

      touchStartXRef.current = null;
      touchStartYRef.current = null;

      const horizontalDominant =
        Math.abs(deltaX) >= Math.abs(deltaY);

      if (horizontalDominant) {
        if (Math.abs(deltaX) < SWIPE_THRESHOLD) return;
        if (deltaX < 0) move(1);
        else move(-1);
      } else {
        if (Math.abs(deltaY) < SWIPE_THRESHOLD) return;
        if (deltaY < 0) move(1);
        else move(-1);
      }
    },
    [visibleStudents.length, move],
  );

  /* ============================================================
     LOADING
  ============================================================ */

  if (isLoading || !currentStudent) {
    return (
      <section className="w-full">
        <div className="overflow-hidden rounded-2xl bg-black">
          <div className="mx-auto flex w-full max-w-[820px] items-end justify-between gap-4 px-4 pb-1 pt-3 sm:px-7 sm:pt-5">
            <div className="min-w-0">
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
            </div>
          </div>

          <div className="relative mx-auto mt-3 w-full px-3">
            <div
              className="relative mx-auto flex w-full max-w-[400px] flex-col overflow-hidden rounded-[22px] border border-[#C8A24A]/40 bg-[#0F1115] shadow-[0_24px_65px_rgba(0,0,0,0.52)]"
              style={{ aspectRatio: CARD_ASPECT }}
            >
              <div className="relative min-h-0 flex-1 overflow-hidden bg-black">
                <div className="absolute inset-0 animate-pulse bg-white/[0.04]" />
              </div>
              <div
                className="flex shrink-0 flex-col justify-center px-4 sm:px-5"
                style={{
                  height: 92,
                  backgroundColor: PANEL_BG,
                  borderTop: `1px solid ${PANEL_BORDER}`,
                }}
              >
                <div className="h-4 w-2/3 rounded bg-white/[0.06]" />
                <div className="mt-2 h-3 w-1/2 rounded bg-white/[0.06]" />
              </div>
            </div>
          </div>

          <div className="h-14" />
        </div>
      </section>
    );
  }

  /* ============================================================
     CARD DATA
  ============================================================ */

  const {
    width: cardWidth,
    height: cardHeight,
    infoHeight,
  } = size;

  const firstName =
    currentStudent.firstName?.trim() || "Student";
  const lastName = currentStudent.lastName?.trim() || "";
  const fullName = `${firstName} ${lastName}`.trim();

  const imageSrc =
    currentStudent.profileImageUrl &&
    currentStudent.profileImageUrl.trim().length > 0
      ? currentStudent.profileImageUrl
      : null;

  const courseName = getDisplayValue(
    currentStudent.generalCourse,
  );
  const techCenterName = getDisplayValue(
    currentStudent.techCenter,
  );

  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  /* ============================================================
     SLIDE VARIANTS — LEFT ↔ RIGHT
  ============================================================ */

  const imageVariants = {
    enter: (customDirection: 1 | -1) =>
      shouldReduceMotion
        ? { opacity: 0 }
        : {
            x: customDirection === 1 ? "100%" : "-100%",
            opacity: 0,
          },
    center: shouldReduceMotion
      ? { opacity: 1 }
      : { x: 0, opacity: 1 },
    exit: (customDirection: 1 | -1) =>
      shouldReduceMotion
        ? { opacity: 0 }
        : {
            x: customDirection === 1 ? "-100%" : "100%",
            opacity: 0,
          },
  };

  const infoVariants = {
    enter: (customDirection: 1 | -1) =>
      shouldReduceMotion
        ? { opacity: 0 }
        : {
            x: customDirection === 1 ? 40 : -40,
            opacity: 0,
          },
    center: shouldReduceMotion
      ? { opacity: 1 }
      : { x: 0, opacity: 1 },
    exit: (customDirection: 1 | -1) =>
      shouldReduceMotion
        ? { opacity: 0 }
        : {
            x: customDirection === 1 ? -40 : 40,
            opacity: 0,
          },
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
        {/* HEADER — tighter on mobile */}
        <div className="mx-auto flex w-full max-w-[820px] items-end justify-between gap-4 px-4 pb-1 pt-3 sm:px-7 sm:pt-5">
          <div className="min-w-0">
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

          <div className="hidden shrink-0 items-center gap-2 sm:flex">
            <PauseButton
              isPaused={isPaused}
              onClick={togglePause}
              disabled={visibleStudents.length <= 1}
            />
            <NavButton
              direction="up"
              onClick={handlePrevious}
              disabled={
                isTransitioning ||
                visibleStudents.length <= 1
              }
            />
            <NavButton
              direction="down"
              onClick={handleNext}
              disabled={
                isTransitioning ||
                visibleStudents.length <= 1
              }
            />
          </div>
        </div>

        {/* ==================================================
            FIXED CARD SHELL — content crossfades inside
        ================================================== */}

        <div
          ref={stageContainerRef}
          className="relative mx-auto mt-2 w-full px-3 sm:mt-3"
          style={{ height: `${cardHeight + 36}px` }}
        >
          <div
            className="absolute left-1/2 top-1/2 overflow-hidden rounded-[22px] border border-[#C8A24A]/40 bg-[#0F1115] shadow-[0_24px_65px_rgba(0,0,0,0.52)]"
            style={{
              width: cardWidth,
              height: cardHeight,
              marginLeft: -cardWidth / 2,
              marginTop: -cardHeight / 2,
            }}
          >
            <div className="relative flex h-full w-full flex-col">
              {/* IMAGE AREA */}
              <div className="relative min-h-0 flex-1 overflow-hidden bg-black">
                <AnimatePresence
                  mode="popLayout"
                  initial={false}
                  custom={direction}
                >
                  <motion.div
                    key={currentStudent.id}
                    custom={direction}
                    variants={imageVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={
                      shouldReduceMotion
                        ? { duration: 0 }
                        : {
                            duration: CONTENT_DURATION_S,
                            ease: CONTENT_EASE,
                          }
                    }
                    className="absolute inset-0 h-full w-full"
                  >
                    {imageSrc ? (
                      <Image
                        src={imageSrc}
                        alt={fullName}
                        fill
                        sizes={`${cardWidth}px`}
                        className="object-cover object-center"
                        quality={95}
                        priority
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[#18212F] text-4xl font-semibold text-white/70">
                        {initials}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* INFO AREA */}
              <div
                className="relative flex shrink-0 flex-col justify-center overflow-hidden px-4 sm:px-5"
                style={{
                  height: infoHeight,
                  backgroundColor: PANEL_BG,
                  borderTop: `1px solid ${PANEL_BORDER}`,
                }}
              >
                <AnimatePresence
                  mode="popLayout"
                  initial={false}
                  custom={direction}
                >
                  <motion.div
                    key={currentStudent.id}
                    custom={direction}
                    variants={infoVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={
                      shouldReduceMotion
                        ? { duration: 0 }
                        : {
                            duration: CONTENT_DURATION_S * 0.9,
                            ease: CONTENT_EASE,
                          }
                    }
                    className="flex items-center gap-4"
                  >
                    <div className="min-w-0 flex-1">
                      <h3
                        className="truncate text-[16.5px] font-bold leading-[1.2] tracking-[-0.015em] antialiased"
                        style={{
                          color: GOLD_BRIGHT,
                          WebkitFontSmoothing: "antialiased",
                          textRendering:
                            "geometricPrecision",
                        }}
                        title={fullName}
                      >
                        {fullName}
                      </h3>

                      <p
                        className="mt-[3px] truncate text-[12.5px] font-semibold leading-[1.3] tracking-[-0.005em] antialiased"
                        style={{
                          color: WHITE,
                          WebkitFontSmoothing:
                            "antialiased",
                        }}
                        title={courseName || "Student"}
                      >
                        {courseName || "Student"}
                      </p>

                      <div className="mt-[3px] flex min-w-0 items-center gap-1.5">
                        {techCenterName ? (
                          <>
                            <MapPin
                              className="h-[11px] w-[11px] shrink-0"
                              strokeWidth={2}
                              style={{ color: GOLD }}
                            />
                            <span
                              className="truncate text-[11.5px] font-medium leading-[1.3] antialiased"
                              style={{
                                color: WHITE_85,
                                WebkitFontSmoothing:
                                  "antialiased",
                              }}
                              title={techCenterName}
                            >
                              {techCenterName}
                            </span>
                          </>
                        ) : (
                          <span
                            className="text-[11.5px] font-medium leading-[1.3]"
                            style={{ color: WHITE_50 }}
                          >
                            Tech center not specified
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <Link
                        href={`/dashboard/students/${currentStudent.id}`}
                        className="group inline-flex items-center text-[12.5px] font-semibold tracking-[-0.005em] transition-colors focus:outline-none"
                        style={{ color: GOLD_BRIGHT }}
                      >
                        <span className="underline decoration-[#C8A24A]/50 decoration-[1.5px] underline-offset-[3px] transition-colors group-hover:decoration-[#D9B563]">
                          View profile
                        </span>
                      </Link>

                      <Link
                        href={`/dashboard/messages?user=${currentStudent.id}`}
                        className="group inline-flex items-center text-[12.5px] font-semibold tracking-[-0.005em] transition-colors focus:outline-none"
                        style={{ color: GOLD_BRIGHT }}
                      >
                        <span className="underline decoration-[#C8A24A]/50 decoration-[1.5px] underline-offset-[3px] transition-colors group-hover:decoration-[#D9B563]">
                          Message
                        </span>
                      </Link>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-between border-t border-white/[0.07] px-4 py-3 sm:justify-center sm:gap-3">
          <div className="sm:hidden">
            <NavButton
              direction="up"
              onClick={handlePrevious}
              disabled={
                isTransitioning ||
                visibleStudents.length <= 1
              }
            />
          </div>

          <div className="sm:hidden">
            <PauseButton
              isPaused={isPaused}
              onClick={togglePause}
              disabled={visibleStudents.length <= 1}
            />
          </div>

          <div
            className="flex items-center gap-1.5 text-[12.5px] font-medium tabular-nums"
            style={{ color: WHITE_70 }}
            aria-live="polite"
          >
            <span
              className="font-bold tabular-nums"
              style={{ color: GOLD_BRIGHT }}
            >
              {(currentIndex % visibleStudents.length) + 1}
            </span>
            <span style={{ color: WHITE_50 }}>/</span>
            <span
              className="tabular-nums"
              style={{ color: WHITE }}
            >
              {visibleStudents.length}
            </span>
          </div>

          <div className="sm:hidden">
            <NavButton
              direction="down"
              onClick={handleNext}
              disabled={
                isTransitioning ||
                visibleStudents.length <= 1
              }
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   CONTROL PRIMITIVES
============================================================ */

interface NavButtonProps {
  direction: "up" | "down";
  onClick: () => void;
  disabled?: boolean;
}

function NavButton({
  direction,
  onClick,
  disabled,
}: NavButtonProps) {
  const isUp = direction === "up";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={isUp ? "Previous student" : "Next student"}
      className="group inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#C8A24A]/35 bg-white/[0.02] text-[#C8A24A] transition-all duration-200 hover:border-[#C8A24A]/70 hover:bg-[#C8A24A]/10 hover:text-[#D9B563] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A24A]/40 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-transparent disabled:text-white/25 disabled:opacity-60"
    >
      {isUp ? (
        <ArrowUp
          className="h-[15px] w-[15px] transition-transform duration-200 group-hover:-translate-y-[1px]"
          strokeWidth={2}
        />
      ) : (
        <ArrowDown
          className="h-[15px] w-[15px] transition-transform duration-200 group-hover:translate-y-[1px]"
          strokeWidth={2}
        />
      )}
    </button>
  );
}

interface PauseButtonProps {
  isPaused: boolean;
  onClick: () => void;
  disabled?: boolean;
}

function PauseButton({
  isPaused,
  onClick,
  disabled,
}: PauseButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={isPaused ? "Resume autoplay" : "Pause autoplay"}
      className="group inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#C8A24A]/35 bg-white/[0.02] text-[#C8A24A] transition-all duration-200 hover:border-[#C8A24A]/70 hover:bg-[#C8A24A]/10 hover:text-[#D9B563] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A24A]/40 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-transparent disabled:text-white/25 disabled:opacity-60"
    >
      {isPaused ? (
        <Play
          className="h-[14px] w-[14px] transition-transform duration-200 group-hover:scale-110"
          strokeWidth={2}
        />
      ) : (
        <Pause
          className="h-[14px] w-[14px] transition-transform duration-200 group-hover:scale-110"
          strokeWidth={2}
        />
      )}
    </button>
  );
}

export default DiscoverStudents;