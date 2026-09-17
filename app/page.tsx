"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  Variants,
  useReducedMotion,
} from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Network,
  PlayCircle,
  Users,
} from "lucide-react";

import Header2 from "@/app/components/ui/header-2";
import Footer from "@/app/components/Footer";
import LoadingScreen from "@/app/components/LoadingScreen";
import AuthModal from "@/components/auth/AuthModal";
import { useAuth } from "@/lib/hooks/useAuth";

const COLORS = {
  page: "#F1F1EC",
  surface: "#FFFFFF",
  soft: "#F7F6F2",
  border: "#DADCD3",
  ink: "#12203B",
  body: "#4B564C",
  muted: "#6B7268",
  subtle: "#8A9088",
  brass: "#B98A3E",
  brassLight: "#E8A33D",
  moss: "#55705B",
  rust: "#A4462F",
};

type HeroImage = {
  src: string;
  eyebrow: string;
  title: string;
  description: string;
};

const features = [
  {
    number: "01",
    icon: BookOpen,
    title: "Academic progress",
    description:
      "Keep your studies, courses, grades, and academic journey organized.",
    href: "/dashboard",
  },
  {
    number: "02",
    icon: Users,
    title: "Student community",
    description:
      "Connect with students beyond your own tech center and build meaningful relationships.",
    href: "/dashboard",
  },
  {
    number: "03",
    icon: Network,
    title: "Tech-center network",
    description:
      "Stay connected to the wider SELFLESS CE community across different centers.",
    href: "/tech-centers",
  },
  {
    number: "04",
    icon: MessageSquare,
    title: "Communication",
    description:
      "Receive updates, communicate with your center, and stay informed.",
    href: "/dashboard",
  },
];

const journeyPoints = [
  {
    number: "01",
    title: "Stay on track",
    description:
      "Follow your academic progress and keep important study activities in one place.",
  },
  {
    number: "02",
    title: "Connect beyond your center",
    description:
      "Meet students from other tech centers and take part in the wider community.",
  },
  {
    number: "03",
    title: "Get support around you",
    description:
      "Find tutors, resources, communication channels, and services when you need them.",
  },
];

const heroImages: HeroImage[] = [
  {
    src: "/cover page.jpg",
    eyebrow: "SELFLESS CE STUDENT PORTAL",
    title: "Your education, connected.",
    description:
      "A central place for students studying online through BYU-Idaho with SELFLESS CE.",
  },
  {
    src: "/cover image.jpg",
    eyebrow: "ACADEMIC TOOLS",
    title: "Stay focused on your studies.",
    description:
      "Keep your academic activities, courses, grades, and learning journey organized.",
  },
  {
    src: "/student-portal-image.png",
    eyebrow: "ACADEMIC PROGRESS",
    title: "Know where you are in your journey.",
    description:
      "Access the information you need to stay aware of your academic progress.",
  },
  {
    src: "/student-portal.png",
    eyebrow: "STUDENT SERVICES",
    title: "Learn, connect, and move forward.",
    description:
      "Access a connected student experience built around your studies and community.",
  },
];

const heroImageVariants: Variants = {
  enter: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? 28 : -28,
  }),
  center: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.65,
      ease: [0.22, 1, 0.36, 1],
    },
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? -28 : 28,
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

export default function HomePage() {
  const { user, isLoading: authLoading } = useAuth();

  const [currentHero, setCurrentHero] = useState(0);
  const [direction, setDirection] = useState(1);
  const [failedImages, setFailedImages] = useState<Set<string>>(
    () => new Set()
  );
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalType, setAuthModalType] = useState<"login" | "register">("login");
  const [loadingScreen, setLoadingScreen] = useState(true);

  const shouldReduceMotion = useReducedMotion();
  const preloadRef = useRef<Set<string>>(new Set());

  const activeHero = heroImages[currentHero];

  const availableHeroIndexes = useMemo(
    () =>
      heroImages
        .map((_, index) => index)
        .filter((index) => !failedImages.has(heroImages[index].src)),
    [failedImages]
  );

  const handleLoadingComplete = useCallback(() => {
    setLoadingScreen(false);
  }, []);

  const getNextAvailableIndex = useCallback(
    (fromIndex: number, step: 1 | -1) => {
      if (availableHeroIndexes.length === 0) return fromIndex;

      const currentPosition = availableHeroIndexes.indexOf(fromIndex);

      if (currentPosition === -1) {
        return availableHeroIndexes[0];
      }

      const nextPosition =
        (currentPosition + step + availableHeroIndexes.length) %
        availableHeroIndexes.length;

      return availableHeroIndexes[nextPosition];
    },
    [availableHeroIndexes]
  );

  const changeHero = useCallback(
    (nextIndex: number, nextDirection: number) => {
      if (availableHeroIndexes.length <= 1) return;

      setDirection(nextDirection);
      setCurrentHero(nextIndex);
    },
    [availableHeroIndexes.length]
  );

  const nextHero = useCallback(() => {
    const next = getNextAvailableIndex(currentHero, 1);
    changeHero(next, 1);
  }, [changeHero, currentHero, getNextAvailableIndex]);

  const previousHero = useCallback(() => {
    const previous = getNextAvailableIndex(currentHero, -1);
    changeHero(previous, -1);
  }, [changeHero, currentHero, getNextAvailableIndex]);

  const selectHero = useCallback(
    (index: number) => {
      if (index === currentHero || failedImages.has(heroImages[index].src)) {
        return;
      }

      setDirection(index > currentHero ? 1 : -1);
      setCurrentHero(index);
    },
    [currentHero, failedImages]
  );

  const handleImageError = useCallback(
    (src: string) => {
      setFailedImages((previous) => {
        if (previous.has(src)) return previous;

        const updated = new Set(previous);
        updated.add(src);
        return updated;
      });

      if (heroImages[currentHero]?.src === src) {
        const nextIndex = heroImages.findIndex(
          (image, index) =>
            index !== currentHero && !failedImages.has(image.src) && image.src !== src
        );

        if (nextIndex !== -1) {
          setDirection(1);
          setCurrentHero(nextIndex);
        }
      }
    },
    [currentHero, failedImages]
  );

  useEffect(() => {
    heroImages.forEach((image) => {
      if (preloadRef.current.has(image.src)) return;

      const img = new window.Image();

      img.onload = () => {
        preloadRef.current.add(image.src);
      };

      img.onerror = () => {
        handleImageError(image.src);
      };

      img.src = image.src;
    });
  }, [handleImageError]);

  useEffect(() => {
    if (shouldReduceMotion || availableHeroIndexes.length <= 1) {
      return;
    }

    const interval = window.setInterval(() => {
      nextHero();
    }, 10000);

    return () => window.clearInterval(interval);
  }, [
    availableHeroIndexes.length,
    nextHero,
    shouldReduceMotion,
  ]);

  const openLogin = useCallback(() => {
    setAuthModalType("login");
    setShowAuthModal(true);
  }, []);

  const openRegister = useCallback(() => {
    setAuthModalType("register");
    setShowAuthModal(true);
  }, []);

  return (
    <>
      {loadingScreen && <LoadingScreen onComplete={handleLoadingComplete} delay={700} />}

      <div
        className="min-h-screen"
        style={{
          backgroundColor: COLORS.page,
          color: COLORS.ink,
        }}
      >
        <Header2 />

        {/* Reduced top padding so hero sits right under the header */}
        <main className="pt-[104px] sm:pt-[112px] lg:pt-[118px]">
          {/* HERO */}
          <section
            className="relative overflow-hidden"
            style={{ backgroundColor: COLORS.ink }}
          >
            <div className="mx-auto max-w-[1500px]">
              <div className="grid lg:min-h-[640px] lg:grid-cols-[42%_58%]">
                {/* IMAGE — FIRST ON MOBILE */}
                <div
                  className="relative order-1 min-h-[300px] overflow-hidden sm:min-h-[420px] lg:order-2 lg:min-h-[640px]"
                  style={{
                    clipPath:
                      "polygon(7% 0, 100% 0, 100% 100%, 0 100%)",
                  }}
                >
                  <AnimatePresence
                    initial={false}
                    custom={direction}
                    mode="sync"
                  >
                    <motion.div
                      key={activeHero.src}
                      custom={direction}
                      variants={heroImageVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      className="absolute inset-0"
                    >
                      <Image
                        src={activeHero.src}
                        alt={activeHero.title}
                        fill
                        priority={currentHero === 0}
                        sizes="(max-width: 1024px) 100vw, 58vw"
                        className="object-cover"
                        onError={() => handleImageError(activeHero.src)}
                      />

                      <div
                        className="absolute inset-0"
                        style={{
                          backgroundColor: "rgba(18, 32, 59, 0.10)",
                        }}
                      />
                    </motion.div>
                  </AnimatePresence>

                  {/* subtle diagonal navy edge (desktop) */}
                  <div
                    className="absolute inset-y-0 left-0 z-10 hidden w-24 lg:block"
                    style={{
                      backgroundColor: COLORS.ink,
                      clipPath: "polygon(0 0, 100% 0, 0 100%)",
                    }}
                  />

                  {/* mobile diagonal transition */}
                  <div
                    className="absolute inset-x-0 bottom-0 z-20 h-10 lg:hidden"
                    style={{
                      backgroundColor: COLORS.ink,
                      clipPath: "polygon(0 100%, 100% 35%, 100% 100%)",
                    }}
                  />

                  {/* carousel controls */}
                  {availableHeroIndexes.length > 1 && (
                    <div className="absolute bottom-4 left-4 right-4 z-30 flex items-center justify-between sm:bottom-6 sm:left-6 sm:right-6 lg:bottom-8 lg:left-12 lg:right-10">
                      <div className="flex items-center gap-2">
                        {heroImages.map((image, index) => {
                          const isAvailable = !failedImages.has(image.src);

                          if (!isAvailable) return null;

                          return (
                            <button
                              key={image.src}
                              type="button"
                              aria-label={`Show slide ${index + 1}`}
                              aria-current={index === currentHero}
                              onClick={() => selectHero(index)}
                              className="h-1.5 rounded-full transition-all duration-300"
                              style={{
                                width: index === currentHero ? 28 : 8,
                                backgroundColor:
                                  index === currentHero
                                    ? COLORS.brassLight
                                    : "rgba(255,255,255,0.65)",
                              }}
                            />
                          );
                        })}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={previousHero}
                          aria-label="Previous image"
                          className="flex h-8 w-8 items-center justify-center rounded-full border transition-colors sm:h-9 sm:w-9"
                          style={{
                            borderColor: "rgba(255,255,255,0.35)",
                            color: "#FFFFFF",
                            backgroundColor: "rgba(18,32,59,0.35)",
                          }}
                        >
                          <ChevronLeft size={16} strokeWidth={1.8} />
                        </button>

                        <button
                          type="button"
                          onClick={nextHero}
                          aria-label="Next image"
                          className="flex h-8 w-8 items-center justify-center rounded-full border transition-colors sm:h-9 sm:w-9"
                          style={{
                            borderColor: "rgba(255,255,255,0.35)",
                            color: "#FFFFFF",
                            backgroundColor: "rgba(18,32,59,0.35)",
                          }}
                        >
                          <ChevronRight size={16} strokeWidth={1.8} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* COPY — SECOND ON MOBILE */}
                <div
                  className="relative order-2 flex items-center px-5 py-10 sm:px-8 sm:py-14 lg:order-1 lg:px-12 lg:py-16 xl:px-16"
                  style={{ backgroundColor: COLORS.ink }}
                >
                  <div className="max-w-[540px]">
                    <motion.div
                      initial={
                        shouldReduceMotion
                          ? false
                          : { opacity: 0, y: 12 }
                      }
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.55 }}
                    >
                      <div className="mb-4 flex items-center gap-3 sm:mb-6">
                        <span
                          className="h-px w-8 sm:w-9"
                          style={{ backgroundColor: COLORS.brassLight }}
                        />
                        <span
                          className="text-[9px] font-semibold uppercase tracking-[0.2em] sm:text-[10px]"
                          style={{ color: COLORS.brassLight }}
                        >
                          {activeHero.eyebrow}
                        </span>
                      </div>

                      <h1 className="max-w-[500px] text-[clamp(2rem,7vw,4.5rem)] font-semibold leading-[0.98] tracking-[-0.04em] text-white">
                        {activeHero.title}
                      </h1>

                      <p
                        className="mt-4 max-w-[470px] text-[14px] leading-6 sm:mt-6 sm:text-[15px] sm:leading-7"
                        style={{ color: "rgba(255,255,255,0.72)" }}
                      >
                        {activeHero.description}
                      </p>

                      <div className="mt-6 flex flex-wrap items-center gap-4 sm:mt-8 sm:gap-5">
                        <Link
                          href={user ? "/dashboard" : "/register"}
                          className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-[13px] font-semibold transition-transform hover:-translate-y-0.5 sm:px-5 sm:py-3 sm:text-sm"
                          style={{
                            backgroundColor: COLORS.brassLight,
                            color: COLORS.ink,
                          }}
                        >
                          {user ? "Go to dashboard" : "Get started"}
                          <ArrowRight size={16} />
                        </Link>

                        <button
                          type="button"
                          onClick={() => {
                            document
                              .getElementById("about-selfless")
                              ?.scrollIntoView({ behavior: "smooth" });
                          }}
                          className="inline-flex items-center gap-2 text-[13px] font-medium sm:text-sm"
                          style={{ color: "rgba(255,255,255,0.82)" }}
                        >
                          Explore the portal
                          <ArrowRight size={15} />
                        </button>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* INTRODUCTION */}
          <section
            id="about-selfless"
            className="border-b"
            style={{
              backgroundColor: COLORS.surface,
              borderColor: COLORS.border,
            }}
          >
            <div className="mx-auto grid max-w-6xl gap-6 px-5 py-12 sm:px-8 sm:py-14 lg:grid-cols-[0.8fr_1.2fr] lg:items-end lg:gap-16 lg:py-20">
              <div>
                <p
                  className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em]"
                  style={{ color: COLORS.brass }}
                >
                  About the portal
                </p>

                <h2 className="max-w-md text-[1.75rem] font-semibold leading-tight tracking-[-0.03em] sm:text-3xl lg:text-4xl">
                  One portal. Your academic journey.
                </h2>
              </div>

              <div>
                <p
                  className="max-w-2xl text-[15px] leading-7 sm:text-base"
                  style={{ color: COLORS.body }}
                >
                  SELFLESS CE brings students, tech centers, academic support,
                  and community into one connected experience—so less time is
                  spent managing the process and more time can be spent on
                  learning and preparing for the future.
                </p>

                <Link
                  href="/about"
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold"
                  style={{ color: COLORS.ink }}
                >
                  Learn about SELFLESS CE
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </section>

          {/* PORTAL OVERVIEW */}
          <section
            className="border-b"
            style={{
              backgroundColor: COLORS.page,
              borderColor: COLORS.border,
            }}
          >
            <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-14 lg:py-20">
              <div className="grid items-center gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:gap-16">
                <div className="relative overflow-hidden rounded-xl">
                  <div className="relative aspect-[16/9]">
                    <video
                      className="h-full w-full object-cover"
                      src="/graduate.mp4"
                      poster="/student-portal-image.png"
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="metadata"
                    />

                    <div className="pointer-events-none absolute inset-0 flex items-end p-4 sm:p-5">
                      <div
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-[11px] font-medium sm:text-xs"
                        style={{
                          backgroundColor: "rgba(18,32,59,0.88)",
                          color: "#FFFFFF",
                        }}
                      >
                        <PlayCircle size={15} />
                        Your student experience
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <p
                    className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em]"
                    style={{ color: COLORS.brass }}
                  >
                    The student portal
                  </p>

                  <h2 className="text-[1.75rem] font-semibold leading-tight tracking-[-0.03em] sm:text-3xl lg:text-4xl">
                    Everything important, easier to find.
                  </h2>

                  <p
                    className="mt-4 text-[15px] leading-7 sm:mt-5"
                    style={{ color: COLORS.body }}
                  >
                    Your studies and student services are brought together in
                    one place, with the tools and connections you need during
                    your time with SELFLESS CE.
                  </p>

                  <div
                    className="mt-6 border-t pt-5 sm:mt-7"
                    style={{ borderColor: COLORS.border }}
                  >
                    <div className="grid grid-cols-2 gap-x-5 gap-y-4 sm:gap-x-6 sm:gap-y-5">
                      <div>
                        <p className="text-[13px] font-semibold sm:text-sm">Study</p>
                        <p
                          className="mt-1 text-[11px] leading-5 sm:text-xs"
                          style={{ color: COLORS.muted }}
                        >
                          Courses, grades and progress
                        </p>
                      </div>

                      <div>
                        <p className="text-[13px] font-semibold sm:text-sm">Connect</p>
                        <p
                          className="mt-1 text-[11px] leading-5 sm:text-xs"
                          style={{ color: COLORS.muted }}
                        >
                          Students, tutors and centers
                        </p>
                      </div>

                      <div>
                        <p className="text-[13px] font-semibold sm:text-sm">Communicate</p>
                        <p
                          className="mt-1 text-[11px] leading-5 sm:text-xs"
                          style={{ color: COLORS.muted }}
                        >
                          Updates and important messages
                        </p>
                      </div>

                      <div>
                        <p className="text-[13px] font-semibold sm:text-sm">Participate</p>
                        <p
                          className="mt-1 text-[11px] leading-5 sm:text-xs"
                          style={{ color: COLORS.muted }}
                        >
                          Activities and community
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* WHY CHOOSE SELFLESS CE */}
          <section
            className="border-b"
            style={{
              backgroundColor: COLORS.surface,
              borderColor: COLORS.border,
            }}
          >
            <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-14 lg:py-20">
              <div className="mb-8 sm:mb-10">
                <p
                  className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em]"
                  style={{ color: COLORS.brass }}
                >
                  Why choose us
                </p>

                <h2 className="text-[1.75rem] font-semibold tracking-[-0.03em] sm:text-3xl lg:text-4xl">
                  Why choose SELFLESS CE Student Portal
                </h2>

                <p
                  className="mt-4 max-w-2xl text-[15px] leading-7 sm:mt-5"
                  style={{ color: COLORS.body }}
                >
                  Our student portal is designed to simplify your academic journey
                  and connect you with the resources you need to succeed.
                </p>
              </div>

              <div className="grid gap-7 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
                <div className="space-y-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg"
                    style={{ backgroundColor: COLORS.soft }}
                  >
                    <BookOpen size={20} style={{ color: COLORS.ink }} />
                  </div>

                  <h3 className="text-base font-semibold">Centralized Learning</h3>

                  <p
                    className="text-sm leading-6"
                    style={{ color: COLORS.muted }}
                  >
                    Access all your courses, materials, and academic resources in
                    one convenient location.
                  </p>
                </div>

                <div className="space-y-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg"
                    style={{ backgroundColor: COLORS.soft }}
                  >
                    <Users size={20} style={{ color: COLORS.ink }} />
                  </div>

                  <h3 className="text-base font-semibold">Community Connection</h3>

                  <p
                    className="text-sm leading-6"
                    style={{ color: COLORS.muted }}
                  >
                    Stay connected with fellow students, tutors, and tech
                    centers for collaboration and support.
                  </p>
                </div>

                <div className="space-y-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg"
                    style={{ backgroundColor: COLORS.soft }}
                  >
                    <MessageSquare size={20} style={{ color: COLORS.ink }} />
                  </div>

                  <h3 className="text-base font-semibold">Real-time Updates</h3>

                  <p
                    className="text-sm leading-6"
                    style={{ color: COLORS.muted }}
                  >
                    Get instant notifications about grades, announcements, and
                    important campus information.
                  </p>
                </div>
              </div>

              <div className="mt-8 sm:mt-10">
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 text-sm font-semibold"
                  style={{ color: COLORS.ink }}
                >
                  Learn more about SELFLESS CE
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </section>

          {/* SERVICES */}
          <section
            className="border-b"
            style={{
              backgroundColor: COLORS.surface,
              borderColor: COLORS.border,
            }}
          >
            <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-14 lg:py-20">
              <div className="mb-8 flex flex-col gap-4 sm:mb-10 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p
                    className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em]"
                    style={{ color: COLORS.brass }}
                  >
                    What you can do
                  </p>

                  <h2 className="text-[1.75rem] font-semibold tracking-[-0.03em] sm:text-3xl lg:text-4xl">
                    Built around student needs.
                  </h2>
                </div>

                <p
                  className="max-w-md text-[13px] leading-6 sm:text-sm"
                  style={{ color: COLORS.muted }}
                >
                  The portal keeps the most important parts of your student
                  experience within easy reach.
                </p>
              </div>

              <div
                className="divide-y border-y"
                style={{ borderColor: COLORS.border }}
              >
                {features.map((feature) => {
                  const Icon = feature.icon;

                  return (
                    <Link
                      key={feature.number}
                      href={feature.href}
                      className="group grid gap-3 py-5 transition-colors sm:gap-4 sm:py-6 lg:grid-cols-[70px_260px_1fr_30px] lg:items-center lg:gap-8"
                    >
                      <span
                        className="font-mono text-[11px] sm:text-xs"
                        style={{ color: COLORS.subtle }}
                      >
                        {feature.number}
                      </span>

                      <div className="flex items-center gap-3">
                        <Icon
                          size={18}
                          strokeWidth={1.7}
                          style={{ color: COLORS.moss }}
                        />

                        <h3 className="text-[15px] font-semibold sm:text-base">
                          {feature.title}
                        </h3>
                      </div>

                      <p
                        className="max-w-xl text-[13px] leading-6 sm:text-sm"
                        style={{ color: COLORS.body }}
                      >
                        {feature.description}
                      </p>

                      <ArrowRight
                        size={17}
                        className="hidden transition-transform group-hover:translate-x-1 lg:block"
                        style={{ color: COLORS.subtle }}
                      />
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>

          {/* JOURNEY */}
          <section
            className="border-b"
            style={{
              backgroundColor: COLORS.page,
              borderColor: COLORS.border,
            }}
          >
            <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-14 lg:py-20">
              <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
                <div className="relative min-h-[260px] overflow-hidden rounded-xl sm:min-h-[340px] lg:min-h-[400px]">
                  <Image
                    src="/student-portal-image.png"
                    alt="Student using the SELFLESS CE student portal"
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover"
                  />
                </div>

                <div className="flex flex-col justify-center">
                  <p
                    className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em]"
                    style={{ color: COLORS.brass }}
                  >
                    Your journey
                  </p>

                  <h2 className="max-w-xl text-[1.75rem] font-semibold leading-tight tracking-[-0.03em] sm:text-3xl lg:text-4xl">
                    A simpler way to stay connected.
                  </h2>

                  <div
                    className="mt-6 divide-y border-t sm:mt-8"
                    style={{ borderColor: COLORS.border }}
                  >
                    {journeyPoints.map((point) => (
                      <div
                        key={point.number}
                        className="grid gap-2 py-4 sm:grid-cols-[55px_190px_1fr] sm:gap-6 sm:py-5"
                      >
                        <span
                          className="font-mono text-[11px] sm:text-xs"
                          style={{ color: COLORS.brass }}
                        >
                          {point.number}
                        </span>

                        <h3 className="text-[14px] font-semibold sm:text-sm">
                          {point.title}
                        </h3>

                        <p
                          className="text-[13px] leading-6 sm:text-sm"
                          style={{ color: COLORS.body }}
                        >
                          {point.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SUPPORT STRIP */}
          <section
            style={{ backgroundColor: COLORS.ink }}
          >
            <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 sm:gap-7 sm:px-8 sm:py-12 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <p
                  className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em]"
                  style={{ color: COLORS.brassLight }}
                >
                  Support around you
                </p>

                <h2 className="text-[1.5rem] font-semibold tracking-[-0.025em] text-white sm:text-2xl lg:text-3xl">
                  You do not have to navigate your studies alone.
                </h2>

                <p
                  className="mt-3 max-w-xl text-[13px] leading-6 sm:text-sm"
                  style={{ color: "rgba(255,255,255,0.68)" }}
                >
                  Connect with tutors, students, tech-center teams, and the
                  wider SELFLESS CE community when you need support.
                </p>
              </div>

              <Link
                href="/help"
                className="inline-flex w-fit shrink-0 items-center gap-2 rounded-lg border px-5 py-3 text-sm font-semibold"
                style={{
                  borderColor: "rgba(255,255,255,0.25)",
                  color: "#FFFFFF",
                }}
              >
                Visit support
                <ArrowRight size={16} />
              </Link>
            </div>
          </section>

          {/* CLOSING CTA */}
          <section
            style={{ backgroundColor: COLORS.surface }}
          >
            <div className="mx-auto max-w-4xl px-5 py-14 text-center sm:px-8 sm:py-16 lg:py-20">
              <p
                className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em]"
                style={{ color: COLORS.brass }}
              >
                SELFLESS CE
              </p>

              <h2 className="text-[1.75rem] font-semibold leading-tight tracking-[-0.035em] sm:text-3xl lg:text-5xl">
                Focus on your education.
                <br />
                We help connect the rest.
              </h2>

              <p
                className="mx-auto mt-4 max-w-xl text-[13px] leading-6 sm:mt-5 sm:text-sm"
                style={{ color: COLORS.body }}
              >
                Access your student experience, stay connected, and keep moving
                toward your goals.
              </p>

              <div className="mt-6 flex flex-wrap justify-center gap-3 sm:mt-7 sm:gap-4">
                <Link
                  href={user ? "/dashboard" : "/register"}
                  className="inline-flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold"
                  style={{
                    backgroundColor: COLORS.ink,
                    color: "#FFFFFF",
                  }}
                >
                  {user ? "Open dashboard" : "Get started"}
                  <ArrowRight size={16} />
                </Link>

                {!user && !authLoading && (
                  <button
                    type="button"
                    onClick={openLogin}
                    className="inline-flex items-center gap-2 rounded-lg border px-5 py-3 text-sm font-semibold"
                    style={{
                      borderColor: COLORS.border,
                      color: COLORS.ink,
                    }}
                  >
                    Sign in
                  </button>
                )}
              </div>
            </div>
          </section>
        </main>

        <Footer />

        <AuthModal
          isOpen={showAuthModal}
          defaultType={authModalType}
          onClose={() => setShowAuthModal(false)}
        />
      </div>
    </>
  );
}