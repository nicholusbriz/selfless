"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
  generalCourse?: string | null | { id?: string; name?: string };
  techCenter?: string | null | { id?: string; name?: string };
  role?: {
    name?: string;
  };
};

type DiscoverStudentsProps = {
  /** Optional: pass students to render directly (e.g. from a server component). */
  students?: DiscoverStudent[];
  /** Optional: skip fetching and show skeleton (e.g. SSR loading state). */
  isLoading?: boolean;
  /** Optional: override the API endpoint used when `students` is not provided. */
  endpoint?: string;
  autoplay?: boolean;
  interval?: number;
};

/* ============================================================
   CONFIG
============================================================ */

const DEFAULT_INTERVAL = 5000;
const DEFAULT_ENDPOINT = "/api/discover-students";
const SWIPE_THRESHOLD = 40;
const CARD_ASPECT = 0.76;
const MAX_CARD_WIDTH = 460;
const MIN_CARD_WIDTH = 270;
const MOBILE_HORIZONTAL_PADDING = 12;
const DESKTOP_HORIZONTAL_PADDING = 32;
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

const GOLD = "#B98A3E";
const GOLD_BRIGHT = "#C59B4C";
const WHITE = "#FFFFFF";
const WHITE_85 = "rgba(255, 255, 255, 0.85)";
const WHITE_70 = "rgba(255, 255, 255, 0.70)";
const PANEL_BG = "#1A2B4C";
const PANEL_BORDER = "rgba(185, 138, 62, 0.30)";

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
    infoHeight: 96,
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

      const availableHeight = Math.max(360, window.innerHeight - reserved);
      const widthFromHeight = availableHeight * CARD_ASPECT;

      const calculatedWidth = Math.min(
        MAX_CARD_WIDTH,
        usableWidth,
        widthFromHeight,
      );

      const width = Math.max(MIN_CARD_WIDTH, Math.round(calculatedWidth));
      const height = Math.round(width / CARD_ASPECT);
      const infoHeight = isMobile ? 92 : 100;

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
      setPreloadState((prev) => {
        const base =
          prev.urlsKey === urlsKey
            ? prev
            : { urlsKey, readyUrls: new Set<string>() };
        if (base.readyUrls.has(url)) return base;
        const next = new Set(base.readyUrls);
        next.add(url);
        return { urlsKey, readyUrls: next };
      });
    };

    urlsToPreload.forEach((url) => {
      const img = new window.Image();
      img.decoding = "async";
      img.loading = "eager";
      img.addEventListener("load", () => markReady(url));
      img.addEventListener("error", () => markReady(url));
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
   DATA FETCHING (only when `students` prop is absent)
============================================================ */

const BATCH_SIZE = 50;
const PREFETCH_THRESHOLD = 5; // Fetch more when within 5 of the end

function useDiscoverStudents(
  providedStudents: DiscoverStudent[] | undefined,
  endpoint: string,
  externalLoading: boolean,
  currentIndex: number,
) {
  const hasProvided = providedStudents !== undefined;

  const [fetched, setFetched] = useState<DiscoverStudent[]>([]);
  const [isFetching, setIsFetching] = useState(!hasProvided);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  const fetchBatch = useCallback(
    async (newOffset: number) => {
      setIsFetching(true);
      setError(null);

      const url = new URL(endpoint, window.location.origin);
      url.searchParams.set('limit', String(BATCH_SIZE));
      url.searchParams.set('offset', String(newOffset));

      try {
        const res = await fetch(url.toString(), { cache: "no-store" });
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        const data: DiscoverStudent[] = await res.json();

        if (data.length < BATCH_SIZE) {
          setHasMore(false);
        }
        setFetched((prev) => [...prev, ...data]);
        setOffset(newOffset + BATCH_SIZE);
      } catch (err) {
        console.error("Discover students fetch error:", err);
        setError(err instanceof Error ? err.message : "Failed to load");
      } finally {
        setIsFetching(false);
      }
    },
    [endpoint],
  );

  // Initial fetch
  useEffect(() => {
    if (hasProvided) {
      setIsFetching(false);
      return;
    }

    fetchBatch(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasProvided]);

  // Auto-fetch when approaching the end
  useEffect(() => {
    if (hasProvided || !hasMore || isFetching) return;

    const threshold = fetched.length - PREFETCH_THRESHOLD;
    if (currentIndex >= threshold && currentIndex >= 0) {
      fetchBatch(offset);
    }
  }, [currentIndex, fetched.length, hasMore, isFetching, hasProvided, offset, fetchBatch]);

  const students = hasProvided ? providedStudents! : fetched;
  const isLoading = externalLoading || (!hasProvided && isFetching);

  return { students, isLoading, error, hasMore };
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
      className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white text-[#1A2B4C] shadow-sm transition-all hover:border-[#C8D0DB] hover:bg-[#F3F5F8] disabled:opacity-40"
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
      className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white text-[#1A2B4C] shadow-sm transition-all hover:border-[#C8D0DB] hover:bg-[#F3F5F8] disabled:opacity-40"
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
  students: providedStudents,
  isLoading: externalLoading = false,
  endpoint = DEFAULT_ENDPOINT,
  autoplay = true,
  interval = DEFAULT_INTERVAL,
}: DiscoverStudentsProps) {
  const isMobile = useIsMobile();

  const [currentIndex, setCurrentIndex] = useState(0);

  const { students, isLoading, error, hasMore } = useDiscoverStudents(
    providedStudents,
    endpoint,
    externalLoading,
    currentIndex,
  );
  const [isPaused, setIsPaused] = useState(false);

  const autoplayTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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
      : ((currentIndex % visibleStudents.length) + visibleStudents.length) %
        visibleStudents.length;

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
    const url = visibleStudents[normalizedCurrentIndex]?.profileImageUrl;
    if (!url || !url.trim()) return true;
    return readyUrls.has(url);
  }, [visibleStudents, normalizedCurrentIndex, readyUrls]);

  const currentStudent =
    visibleStudents.length > 0 ? visibleStudents[normalizedCurrentIndex] : null;

  const getDisplayValue = useCallback(
    (value: string | null | undefined | { id?: string; name?: string }) => {
      if (!value) return "";
      if (typeof value === "string") return value;
      if (typeof value === "object") return value.name ?? "";
      return "";
    },
    [],
  );

  const clearAutoplay = useCallback(() => {
    if (autoplayTimeoutRef.current) {
      clearTimeout(autoplayTimeoutRef.current);
      autoplayTimeoutRef.current = null;
    }
  }, []);

  const move = useCallback(
    (step: 1 | -1) => {
      if (visibleStudents.length <= 1) return;
      clearAutoplay();
      setCurrentIndex((prev) =>
        ((prev + step) % visibleStudents.length + visibleStudents.length) %
        visibleStudents.length,
      );
    },
    [visibleStudents.length, clearAutoplay],
  );

  // Autoplay
  useEffect(() => {
    clearAutoplay();
    if (
      !autoplay ||
      isPaused ||
      visibleStudents.length <= 1 ||
      isLoading ||
      !currentImageReady
    ) {
      return;
    }
    autoplayTimeoutRef.current = setTimeout(() => move(1), Math.max(0, interval));
    return clearAutoplay;
  }, [
    autoplay,
    isPaused,
    interval,
    visibleStudents.length,
    isLoading,
    currentIndex,
    move,
    clearAutoplay,
    currentImageReady,
  ]);

  useEffect(() => () => clearAutoplay(), [clearAutoplay]);

  const handlePrevious = useCallback(() => move(-1), [move]);
  const handleNext = useCallback(() => move(1), [move]);
  const togglePause = useCallback(() => setIsPaused((p) => !p), []);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (visibleStudents.length <= 1) return;
      touchStartXRef.current = e.touches[0]?.clientX ?? null;
      touchStartYRef.current = e.touches[0]?.clientY ?? null;
    },
    [visibleStudents.length],
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (
        visibleStudents.length <= 1 ||
        touchStartXRef.current === null ||
        touchStartYRef.current === null
      )
        return;
      const endX = e.changedTouches[0]?.clientX ?? touchStartXRef.current;
      const deltaX = endX - touchStartXRef.current;
      touchStartXRef.current = null;
      touchStartYRef.current = null;
      if (Math.abs(deltaX) < SWIPE_THRESHOLD) return;
      if (deltaX < 0) move(1);
      else move(-1);
    },
    [visibleStudents.length, move],
  );

  // ---- SKELETON / EMPTY ----
  if (isLoading || !currentStudent) {
    return (
      <section className="mx-auto w-full max-w-[520px]">
        <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-md">
          <div className="relative mx-auto mt-2 w-full px-2 sm:px-3">
            <div
              className="relative mx-auto flex w-full max-w-[460px] flex-col overflow-hidden rounded-2xl border border-[#E5E7EB] bg-[#F8F9FA]"
              style={{ aspectRatio: CARD_ASPECT }}
            >
              {isLoading ? (
                <div className="relative min-h-0 flex-1 animate-pulse overflow-hidden bg-gradient-to-br from-[#E5E7EB] to-[#D1D5DB]" />
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
                  <p className="text-sm font-medium text-[#1A2B4C]">
                    {error ? "Couldn’t load students" : "No students to show yet"}
                  </p>
                  {error && (
                    <p className="text-xs text-[#6B7280]">{error}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ---- DERIVED VALUES ----
  const { width: cardWidth, height: cardHeight } = size;
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
  const roleLabel = formatRole(currentStudent.role?.name);

  return (
    <section className="mx-auto w-full max-w-[520px]">
      <div
        className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-md"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* STAGE */}
        <div
          ref={stageContainerRef}
          className="relative mx-auto w-full px-2 pt-2 sm:px-3"
          style={{ height: `${cardHeight + 16}px` }}
        >
          <div
            className="absolute left-1/2 top-1/2"
            style={{
              width: cardWidth,
              height: cardHeight,
              marginLeft: -cardWidth / 2,
              marginTop: -cardHeight / 2,
            }}
          >
            <div
              key={currentStudent.id}
              className="absolute inset-0 flex h-full w-full flex-col overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-lg"
            >
              {/* IMAGE */}
              <div className="relative h-full w-full overflow-hidden bg-[#E9EDF3]">
                {imageSrc ? (
                  <Image
                    key={imageSrc}
                    src={imageSrc}
                    alt={fullName}
                    fill
                    sizes={`${cardWidth}px`}
                    className="h-full w-full object-cover object-[center_40%]"
                    quality={95}
                    priority
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[#1A2B4C] text-4xl font-semibold text-white/70">
                    {initials}
                  </div>
                )}

                {/* INFO OVERLAY */}
                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/30 to-transparent p-5 sm:p-6">
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-lg font-bold leading-tight text-white drop-shadow sm:text-xl">
                        {fullName}
                      </h3>
                      {roleLabel && (
                        <span className="rounded-full border border-white/30 bg-black/40 px-2.5 py-1 text-[10px] font-semibold text-white/95 backdrop-blur-sm">
                          {roleLabel}
                        </span>
                      )}
                    </div>

                    {!isSuperAdmin && (
                      <p className="text-sm font-medium text-white/95">
                        {courseName || "Student"}
                      </p>
                    )}

                    {!isSuperAdmin && techCenterName && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-[12px] w-[12px] shrink-0 text-[#B98A3E]" />
                        <span className="text-xs font-medium text-white/90">
                          {techCenterName}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER CONTROLS */}
        <div className="mx-auto flex w-full items-center justify-between border-t border-[#E5E7EB] bg-[#F8F9FA] px-4 py-3 sm:px-6 sm:py-4">
          <span className="text-xs font-medium tracking-wide text-[#687386]">
            {normalizedCurrentIndex + 1}{" "}
            <span className="text-[#B98A3E]">/</span> {visibleStudents.length}
          </span>

          <div className="flex items-center gap-2">
            <NavButton
              direction="up"
              onClick={handlePrevious}
              disabled={visibleStudents.length <= 1}
            />
            <PauseButton
              isPaused={isPaused}
              onClick={togglePause}
              disabled={visibleStudents.length <= 1}
            />
            <NavButton
              direction="down"
              onClick={handleNext}
              disabled={visibleStudents.length <= 1}
            />
          </div>
        </div>
      </div>
    </section>
  );
}