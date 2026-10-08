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
  ChevronRight,
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
  role?: {
    name?: string;
  };
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

const DEFAULT_INTERVAL = 5000;

const SWAP_DURATION_S = 0.6;
const TOTAL_SLIDE_MS = SWAP_DURATION_S * 1000;
const SWAP_PERSPECTIVE = 1400;

const SWIPE_THRESHOLD = 40;

const CARD_ASPECT = 0.76;
const INFO_RATIO = 0.28;

const MAX_CARD_WIDTH = 400;
const MIN_CARD_WIDTH = 270;

const MOBILE_HORIZONTAL_PADDING = 12;
const DESKTOP_HORIZONTAL_PADDING = 80;

const MOBILE_RESERVED_VERTICAL = 120;
const DESKTOP_RESERVED_VERTICAL = 165;

const MOBILE_MAX = 639;

/* ============================================================
   HELPERS
============================================================ */

function formatRole(roleName?: string | null) {
  if (!roleName) return null;
  if (roleName === "teacher") return "Tutor";
  if (roleName === "admin") return "Manager";
  if (roleName === "superadmin" || roleName === "super_admin") return "Director";
  return roleName;
}

/* ============================================================
   THEME
============================================================ */

const GOLD = "#C8A24A";
const GOLD_BRIGHT = "#D9B563";

const WHITE = "#FFFFFF";
const WHITE_85 = "rgba(255, 255, 255, 0.85)";
const WHITE_70 = "rgba(255, 255, 255, 0.70)";

const PANEL_BG = "#0F1115";
const PANEL_BORDER = "rgba(200, 162, 74, 0.22)";

const CUBIC_EASE = [0.65, 0, 0.35, 1] as const;

/* ============================================================
   HOOKS
============================================================ */

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_MAX}px)`);
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

function useImagePreloader(urls: string[]) {
  const urlsKey = urls.join("\0");
  const urlsToPreload = useMemo(
    () => (urlsKey ? urlsKey.split("\0") : []),
    [urlsKey],
  );
  const [preloadState, setPreloadState] = useState(() => ({
    urlsKey,
    readyUrls: new Set<string>(),
  }));
  const readyUrls =
    preloadState.urlsKey === urlsKey
      ? preloadState.readyUrls
      : new Set<string>();

  useEffect(() => {
    if (urlsToPreload.length === 0) return;

    let cancelled = false;
    const images: HTMLImageElement[] = [];

    const markReady = (url: string) => {
      if (cancelled) return;
      setPreloadState((previousState) => {
        const previous =
          previousState.urlsKey === urlsKey
            ? previousState
            : { urlsKey, readyUrls: new Set<string>() };

        if (previous.readyUrls.has(url)) return previous;

        const next = new Set(previous.readyUrls);
        next.add(url);
        return { urlsKey, readyUrls: next };
      });
    };

    urlsToPreload.forEach((url) => {
      const img = new window.Image();
      img.decoding = "async";
      img.loading = "eager";

      const onLoad = () => markReady(url);
      const onError = () => markReady(url);

      img.addEventListener("load", onLoad);
      img.addEventListener("error", onError);

      img.src = url;
      images.push(img);
    });

    return () => {
      cancelled = true;
      images.forEach((img) => {
        img.onload = null;
        img.onerror = null;
      });
      images.length = 0;
    };
  }, [urlsKey, urlsToPreload]);

  return readyUrls;
}

/* ============================================================
   SUB-COMPONENTS
============================================================ */

function PauseButton({
  isPaused,
  onClick,
  disabled,
}: {
  isPaused: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/80 transition-all hover:bg-white/[0.1] hover:text-white disabled:opacity-40"
      aria-label={isPaused ? "Play autoplay" : "Pause autoplay"}
    >
      {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
    </button>
  );
}

function NavButton({
  direction,
  onClick,
  disabled,
}: {
  direction: "up" | "down";
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/80 transition-all hover:bg-white/[0.1] hover:text-white disabled:opacity-40"
      aria-label={direction === "up" ? "Previous student" : "Next student"}
    >
      {direction === "up" ? (
        <ArrowUp className="h-4 w-4" />
      ) : (
        <ArrowDown className="h-4 w-4" />
      )}
    </button>
  );
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
  const stageContainerRef = useRef<HTMLDivElement | null>(null);

  const size = useResponsiveCardSize(stageContainerRef, isMobile);

  const visibleStudents = useMemo(
    () => students.filter(Boolean),
    [students],
  );

  const normalizedCurrentIndex =
    visibleStudents.length === 0
      ? 0
      : ((currentIndex % visibleStudents.length) +
          visibleStudents.length) %
        visibleStudents.length;

  /* -------- Smart preload: only current ± 1 -------- */

  const preloadUrls = useMemo(() => {
    if (visibleStudents.length === 0) return [];
    const n = visibleStudents.length;
    const i = normalizedCurrentIndex;
    return [
      visibleStudents[i]?.profileImageUrl,
      visibleStudents[(i + 1) % n]?.profileImageUrl,
      visibleStudents[(i - 1 + n) % n]?.profileImageUrl,
    ].filter((u): u is string => Boolean(u && u.trim()));
  }, [visibleStudents, normalizedCurrentIndex]);

  const readyUrls = useImagePreloader(preloadUrls);

  const currentImageReady = useMemo(() => {
    const currentUrl = visibleStudents[normalizedCurrentIndex]?.profileImageUrl;
    if (!currentUrl || !currentUrl.trim()) return true;
    return readyUrls.has(currentUrl);
  }, [visibleStudents, normalizedCurrentIndex, readyUrls]);

  const currentStudent =
    visibleStudents.length > 0
      ? visibleStudents[normalizedCurrentIndex]
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
        return (
          ((previousIndex + step) % visibleStudents.length) +
          visibleStudents.length
        ) % visibleStudents.length;
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

  useEffect(() => {
    clearAutoplayTimeout();

    if (
      !autoplay ||
      isPaused ||
      shouldReduceMotion ||
      visibleStudents.length <= 1 ||
      isLoading ||
      isTransitioning ||
      !currentImageReady
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
    currentImageReady,
  ]);

  useEffect(() => {
    return () => {
      clearTransitionTimeout();
      clearAutoplayTimeout();
    };
  }, [clearTransitionTimeout, clearAutoplayTimeout]);

  const handlePrevious = useCallback(() => move(-1), [move]);
  const handleNext = useCallback(() => move(1), [move]);
  const togglePause = useCallback(() => setIsPaused((p) => !p), []);

  const handleTouchStart = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      if (visibleStudents.length <= 1) return;
      touchStartXRef.current = event.touches[0]?.clientX ?? null;
      touchStartYRef.current = event.touches[0]?.clientY ?? null;
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

      const endX = event.changedTouches[0]?.clientX ?? touchStartXRef.current;
      const deltaX = endX - touchStartXRef.current;
      touchStartXRef.current = null;
      touchStartYRef.current = null;

      if (Math.abs(deltaX) < SWIPE_THRESHOLD) return;
      if (deltaX < 0) move(1);
      else move(-1);
    },
    [visibleStudents.length, move],
  );

  if (isLoading || !currentStudent) {
    return (
      <section className="w-full">
        <div className="overflow-hidden rounded-2xl bg-black">
          <div className="relative mx-auto mt-3 w-full px-3">
            <div
              className="relative mx-auto flex w-full max-w-[400px] flex-col overflow-hidden rounded-[22px] border border-[#C8A24A]/40 bg-[#0F1115]"
              style={{ aspectRatio: CARD_ASPECT }}
            >
              <div className="relative min-h-0 flex-1 overflow-hidden bg-black animate-pulse" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  const { width: cardWidth, height: cardHeight, infoHeight } = size;
  const firstName = currentStudent.firstName?.trim() || "Student";
  const lastName = currentStudent.lastName?.trim() || "";
  const fullName = `${firstName} ${lastName}`.trim();
  const imageSrc = currentStudent.profileImageUrl?.trim() || null;
  const courseName = getDisplayValue(currentStudent.generalCourse);
  const techCenterName = getDisplayValue(currentStudent.techCenter);
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  const isSuperAdmin =
    currentStudent.role?.name === "superadmin" ||
    currentStudent.role?.name === "super_admin";

  /* ============================================================
     PURE 3D FLIP — no blur, no fade tricks, no gold sweep.
     The exiting card rotates fully away on the Y axis, the
     entering card rotates fully in from the opposite side.
     Think "revolving door", not "crossfade".
  ============================================================ */

  const cardSwapVariants = {
    enter: (dir: 1 | -1) => ({
      rotateY: dir === 1 ? 90 : -90,
      z: -200,
    }),
    center: {
      rotateY: 0,
      z: 0,
      transition: {
        duration: SWAP_DURATION_S,
        ease: CUBIC_EASE,
      },
    },
    exit: (dir: 1 | -1) => ({
      rotateY: dir === 1 ? -90 : 90,
      z: -200,
      transition: {
        duration: SWAP_DURATION_S,
        ease: CUBIC_EASE,
      },
    }),
  };

  return (
    <section className="w-full">
      <div
        className="overflow-hidden rounded-2xl bg-black"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* STAGE CONTAINER */}
        <div
          ref={stageContainerRef}
          className="relative mx-auto w-full px-3 pt-2"
          style={{
            height: `${cardHeight + 16}px`,
            perspective: `${SWAP_PERSPECTIVE}px`,
          }}
        >
          <div
            className="absolute left-1/2 top-1/2"
            style={{
              width: cardWidth,
              height: cardHeight,
              marginLeft: -cardWidth / 2,
              marginTop: -cardHeight / 2,
              transformStyle: "preserve-3d",
              transformOrigin: "center center",
            }}
          >
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={currentStudent.id}
                custom={direction}
                variants={cardSwapVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="absolute inset-0 flex h-full w-full flex-col overflow-hidden rounded-[22px] border border-[#C8A24A]/40 bg-[#0F1115] shadow-[0_24px_65px_rgba(0,0,0,0.52)]"
                style={{
                  transformStyle: "preserve-3d",
                  transformOrigin: "center center",
                  backfaceVisibility: "hidden",
                  willChange: "transform",
                }}
              >
                {/* IMAGE AREA */}
                <div className="relative min-h-0 flex-1 overflow-hidden bg-black">
                  {imageSrc ? (
                    <Image
                      src={imageSrc}
                      alt={fullName}
                      fill
                      sizes={`${cardWidth}px`}
                      className="h-full w-full object-cover object-center"
                      quality={95}
                      priority
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[#18212F] text-4xl font-semibold text-white/70">
                      {initials}
                    </div>
                  )}
                  <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(0,0,0,0) 65%, rgba(0,0,0,0.4) 100%)",
                    }}
                  />
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
                  <div className="flex w-full flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-3">
                      <h3
                        className="min-w-0 flex-1 truncate text-[17px] font-bold tracking-[-0.02em]"
                        style={{ color: GOLD_BRIGHT }}
                        title={fullName}
                      >
                        {fullName}
                      </h3>
                      {currentStudent.role?.name && (
                        <span
                          className="shrink-0 truncate text-[11.5px] font-medium"
                          style={{ color: WHITE_70 }}
                        >
                          {formatRole(currentStudent.role.name)}
                        </span>
                      )}
                    </div>

                    {!isSuperAdmin && (
                      <>
                        <p
                          className="truncate text-[13px] font-medium"
                          style={{ color: WHITE }}
                          title={courseName || "Student"}
                        >
                          {courseName || "Student"}
                        </p>
                        {techCenterName && (
                          <div className="flex items-center gap-1.5">
                            <MapPin
                              className="h-[11px] w-[11px] shrink-0"
                              style={{ color: GOLD }}
                            />
                            <span
                              className="truncate text-[11.5px] font-medium"
                              style={{ color: WHITE_85 }}
                            >
                              {techCenterName}
                            </span>
                          </div>
                        )}
                      </>
                    )}

                    <div className="flex items-center gap-2 pt-0.5">
                      <Link
                        href={`/dashboard/students/${currentStudent.id}`}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11.5px] font-semibold"
                        style={{
                          backgroundColor: `${GOLD}20`,
                          color: GOLD_BRIGHT,
                          border: `1px solid ${GOLD}40`,
                        }}
                      >
                        View Profile <ChevronRight className="h-3 w-3" />
                      </Link>
                      <Link
                        href={`/dashboard/messages?user=${currentStudent.id}`}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11.5px] font-semibold"
                        style={{
                          backgroundColor: "rgba(255, 255, 255, 0.08)",
                          color: WHITE,
                          border: "1px solid rgba(255, 255, 255, 0.15)",
                        }}
                      >
                        Message <ChevronRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* FOOTER CONTROLS & COUNTER */}
        <div className="mx-auto flex w-full max-w-[820px] items-center justify-between border-t border-white/[0.07] px-4 py-3 sm:px-7 sm:py-4">
          <span
            className="text-xs font-medium tracking-wide"
            style={{ color: WHITE_70 }}
          >
            {normalizedCurrentIndex + 1}{" "}
            <span style={{ color: GOLD }}>/</span> {visibleStudents.length}
          </span>

          <div className="flex items-center gap-2">
            <NavButton
              direction="up"
              onClick={handlePrevious}
              disabled={isTransitioning || visibleStudents.length <= 1}
            />
            <PauseButton
              isPaused={isPaused}
              onClick={togglePause}
              disabled={visibleStudents.length <= 1}
            />
            <NavButton
              direction="down"
              onClick={handleNext}
              disabled={isTransitioning || visibleStudents.length <= 1}
            />
          </div>
        </div>
      </div>
    </section>
  );
}