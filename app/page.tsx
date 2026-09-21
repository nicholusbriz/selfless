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

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 18,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

const fadeIn = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.65,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

const stagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

export default function HomePage() {
  const { user, isLoading: authLoading } = useAuth();

  const [currentHero, setCurrentHero] = useState(0);
  const [direction, setDirection] = useState(1);

  const [failedImages, setFailedImages] = useState<Set<string>>(
    () => new Set()
  );

  const [showAuthModal, setShowAuthModal] = useState(false);

  const [authModalType, setAuthModalType] = useState<"login" | "register">(
    "login"
  );

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
      if (
        index === currentHero ||
        failedImages.has(heroImages[index].src)
      ) {
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
            index !== currentHero &&
            !failedImages.has(image.src) &&
            image.src !== src
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
    if (shouldReduceMotion || availableHeroIndexes.length <= 1) return;

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

  return (
    <>
      {loadingScreen && (
        <LoadingScreen
          onComplete={handleLoadingComplete}
          delay={700}
        />
      )}

      <div className="min-h-screen flex flex-col bg-[#F1F1EC]">
        <Header2 />

        <main className="flex-1 pt-[104px] sm:pt-[112px] lg:pt-[118px]">

          {/* =====================================================
              HERO
          ====================================================== */}

          <section
            className="relative z-20 overflow-hidden"
            style={{
              backgroundColor: COLORS.ink,
            }}
          >
            <div className="mx-auto max-w-[1500px]">
              <div className="grid lg:min-h-[650px] lg:grid-cols-[43%_57%]">

                {/* HERO COPY */}

                <div
                  className="relative order-2 flex items-center px-5 py-12 sm:px-8 sm:py-16 lg:order-1 lg:px-12 lg:py-20 xl:px-16"
                  style={{
                    backgroundColor: COLORS.ink,
                  }}
                >
                  <div className="relative z-10 max-w-[570px]">
                    <motion.div
                      initial={
                        shouldReduceMotion
                          ? false
                          : {
                              opacity: 0,
                              y: 12,
                            }
                      }
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        duration: 0.6,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    >
                      <div className="mb-5 flex items-center gap-3 sm:mb-7">
                        <span
                          className="h-px w-9"
                          style={{
                            backgroundColor:
                              COLORS.brassLight,
                          }}
                        />

                        <span
                          className="text-[9px] font-semibold uppercase tracking-[0.22em] sm:text-[10px]"
                          style={{
                            color:
                              COLORS.brassLight,
                          }}
                        >
                          {activeHero.eyebrow}
                        </span>
                      </div>

                      <h1 className="max-w-[540px] text-[clamp(2.7rem,6vw,5.2rem)] font-semibold leading-[0.94] tracking-[-0.055em] text-white">
                        {activeHero.title}
                      </h1>

                      <p
                        className="mt-5 max-w-[480px] text-[14px] leading-7 sm:mt-7 sm:text-[15px]"
                        style={{
                          color:
                            "rgba(255,255,255,0.70)",
                        }}
                      >
                        {activeHero.description}
                      </p>

                      <div className="mt-7 flex flex-wrap items-center gap-4 sm:mt-9">
                        <Link
                          href={
                            user
                              ? "/dashboard"
                              : "/register"
                          }
                          className="group inline-flex items-center gap-2 rounded-lg px-5 py-3 text-[13px] font-semibold transition-all duration-300 hover:-translate-y-0.5"
                          style={{
                            backgroundColor:
                              COLORS.brassLight,
                            color: COLORS.ink,
                          }}
                        >
                          {user
                            ? "Go to dashboard"
                            : "Get started"}

                          <ArrowRight
                            size={16}
                            className="transition-transform duration-300 group-hover:translate-x-1"
                          />
                        </Link>

                        <Link
                          href="/about"
                          className="group inline-flex items-center gap-2 text-[13px] font-medium sm:text-sm"
                          style={{
                            color:
                              "rgba(255,255,255,0.80)",
                          }}
                        >
                          About the portal

                          <ArrowRight
                            size={15}
                            className="transition-transform duration-300 group-hover:translate-x-1"
                          />
                        </Link>
                      </div>

                      <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-white/10 pt-5 sm:mt-12">
                        <div>
                          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/35">
                            Experience
                          </p>

                          <p className="mt-1 text-[11px] font-medium text-white/65">
                            Student-centered
                          </p>
                        </div>

                        <div className="hidden h-7 w-px bg-white/10 sm:block" />

                        <div>
                          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/35">
                            Community
                          </p>

                          <p className="mt-1 text-[11px] font-medium text-white/65">
                            Connected
                          </p>
                        </div>

                        <div className="hidden h-7 w-px bg-white/10 sm:block" />

                        <div>
                          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/35">
                            Focus
                          </p>

                          <p className="mt-1 text-[11px] font-medium text-white/65">
                            Your education
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>

                {/* HERO IMAGE */}

                <div
                  className="relative order-1 min-h-[320px] overflow-hidden sm:min-h-[440px] lg:order-2 lg:min-h-[650px]"
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
                        sizes="(max-width: 1024px) 100vw, 57vw"
                        className="object-cover"
                        onError={() =>
                          handleImageError(
                            activeHero.src
                          )
                        }
                      />

                      <div
                        className="absolute inset-0"
                        style={{
                          backgroundColor:
                            "rgba(18, 32, 59, 0.08)",
                        }}
                      />
                    </motion.div>
                  </AnimatePresence>

                  <div
                    className="absolute inset-y-0 left-0 z-10 hidden w-24 lg:block"
                    style={{
                      backgroundColor: COLORS.ink,
                      clipPath:
                        "polygon(0 0, 100% 0, 0 100%)",
                    }}
                  />

                  <div
                    className="absolute inset-x-0 bottom-0 z-20 h-12 lg:hidden"
                    style={{
                      backgroundColor: COLORS.ink,
                      clipPath:
                        "polygon(0 100%, 100% 35%, 100% 100%)",
                    }}
                  />

                  <div className="absolute right-5 top-5 z-30 sm:right-7 sm:top-7">
                    <div className="border border-white/25 bg-[#12203B]/35 px-3 py-2 backdrop-blur-[2px]">
                      <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-white/75">
                        Student experience
                      </p>
                    </div>
                  </div>

                  {availableHeroIndexes.length > 1 && (
                    <div className="absolute bottom-5 left-5 right-5 z-30 flex items-center justify-between sm:bottom-7 sm:left-7 sm:right-7 lg:bottom-9 lg:left-12 lg:right-10">
                      <div className="flex items-center gap-2">
                        {heroImages.map((image, index) => {
                          if (
                            failedImages.has(
                              image.src
                            )
                          ) {
                            return null;
                          }

                          return (
                            <button
                              key={image.src}
                              type="button"
                              aria-label={`Show slide ${
                                index + 1
                              }`}
                              aria-current={
                                index === currentHero
                              }
                              onClick={() =>
                                selectHero(index)
                              }
                              className="h-1.5 rounded-full transition-all duration-300"
                              style={{
                                width:
                                  index === currentHero
                                    ? 30
                                    : 8,
                                backgroundColor:
                                  index === currentHero
                                    ? COLORS.brassLight
                                    : "rgba(255,255,255,0.60)",
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
                          className="flex h-9 w-9 items-center justify-center rounded-full border transition-colors hover:bg-white/10"
                          style={{
                            borderColor:
                              "rgba(255,255,255,0.35)",
                            color: "#FFFFFF",
                            backgroundColor:
                              "rgba(18,32,59,0.35)",
                          }}
                        >
                          <ChevronLeft
                            size={16}
                            strokeWidth={1.8}
                          />
                        </button>

                        <button
                          type="button"
                          onClick={nextHero}
                          aria-label="Next image"
                          className="flex h-9 w-9 items-center justify-center rounded-full border transition-colors hover:bg-white/10"
                          style={{
                            borderColor:
                              "rgba(255,255,255,0.35)",
                            color: "#FFFFFF",
                            backgroundColor:
                              "rgba(18,32,59,0.35)",
                          }}
                        >
                          <ChevronRight
                            size={16}
                            strokeWidth={1.8}
                          />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* =====================================================
              FIXED VIDEO EXPERIENCE
          ====================================================== */}

          <section className="relative isolate overflow-hidden bg-[#071018]">

            {/* FIXED VIDEO LAYER */}

            <div
              aria-hidden="true"
              className="pointer-events-none fixed inset-0 z-[-20] overflow-hidden"
              style={{
                top: "0",
              }}
            >
              <video
                className="absolute inset-0 h-full w-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                poster="/student-portal-image.png"
              >
                <source
                  src="/graduate.mp4"
                  type="video/mp4"
                />
              </video>

              {/* Lighter readability layer — video stays visible */}

              <div
                className="absolute inset-0"
                style={{
                  backgroundColor:
                    "rgba(7, 16, 24, 0.55)",
                }}
              />

              {/* Soft brand tone for depth */}

              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(18,32,59,0.45) 0%, rgba(7,16,24,0.15) 45%, rgba(18,32,59,0.55) 100%)",
                }}
              />
            </div>

            {/* =================================================
                VIDEO INTRO
            ================================================== */}

            <section className="relative z-10 border-t border-white/10 bg-[#071018]/25">
              <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24 lg:px-12 lg:py-28">
                <motion.div
                  {...(shouldReduceMotion
                    ? {}
                    : {
                        initial: "hidden",
                        whileInView: "visible",
                        viewport: {
                          once: true,
                          amount: 0.16,
                        },
                      })}
                  variants={stagger}
                  className="grid items-center gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24"
                >
                  <motion.div variants={fadeUp}>
                    <div className="flex items-center gap-3">
                      <span className="h-px w-10 bg-[#E8A33D]" />

                      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#E8A33D] drop-shadow-[0_1px_6px_rgba(0,0,0,0.8)]">
                        About SELFLESS CE
                      </p>
                    </div>

                    <h2 className="mt-6 max-w-xl text-[clamp(2.6rem,5.5vw,4.8rem)] font-semibold leading-[0.95] tracking-[-0.05em] text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]">
                      One place for
                      <br />
                      <span className="text-[#E8A33D] drop-shadow-[0_2px_12px_rgba(0,0,0,0.7)]">
                        your journey.
                      </span>
                    </h2>
                  </motion.div>

                  <motion.div
                    variants={fadeUp}
                    className="max-w-2xl"
                  >
                    <p className="text-lg leading-8 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.75)] sm:text-xl sm:leading-9">
                      SELFLESS CE brings students,
                      tech centers, academic support,
                      and community into one connected
                      experience.
                    </p>

                    <p className="mt-5 max-w-xl text-sm leading-7 text-white/90 drop-shadow-[0_1px_6px_rgba(0,0,0,0.7)] sm:text-base sm:leading-8">
                      Instead of moving between
                      disconnected information and
                      services, students have one place
                      to stay informed, connected, and
                      focused on their education.
                    </p>

                    <Link
                      href="/about"
                      className="group mt-8 inline-flex items-center gap-2 text-sm font-bold text-[#E8A33D] drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)] transition-colors hover:text-white"
                    >
                      Learn about SELFLESS CE

                      <ArrowRight
                        size={16}
                        className="transition-transform duration-300 group-hover:translate-x-1"
                      />
                    </Link>
                  </motion.div>
                </motion.div>
              </div>
            </section>

            {/* =================================================
                JOURNEY SECTION
            ================================================== */}

            <section className="relative z-10 border-y border-white/15 bg-[#12203B]/40 backdrop-blur-[2px]">
              <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
                <motion.div
                  {...(shouldReduceMotion
                    ? {}
                    : {
                        initial: "hidden",
                        whileInView: "visible",
                        viewport: {
                          once: true,
                          amount: 0.14,
                        },
                      })}
                  variants={fadeIn}
                  className="grid sm:grid-cols-3"
                >
                  <VideoJourneyItem
                    number="01"
                    title="Learn"
                    text="Keep your academic journey organized and stay focused on the work that matters."
                  />

                  <VideoJourneyItem
                    number="02"
                    title="Connect"
                    text="Build relationships with students, tutors, tech centers, and the wider community."
                  />

                  <VideoJourneyItem
                    number="03"
                    title="Progress"
                    text="Find support, information, and opportunities as you continue your education."
                  />
                </motion.div>
              </div>
            </section>

            {/* =================================================
                PORTAL STATEMENT
            ================================================== */}

            <section className="relative z-10 bg-[#071018]/35 backdrop-blur-[2px]">
              <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24 lg:px-12 lg:py-28">
                <motion.div
                  {...(shouldReduceMotion
                    ? {}
                    : {
                        initial: "hidden",
                        whileInView: "visible",
                        viewport: {
                          once: true,
                          amount: 0.14,
                        },
                      })}
                  variants={fadeUp}
                  className="grid gap-12 lg:grid-cols-[1fr_280px] lg:items-end lg:gap-20"
                >
                  <div className="max-w-4xl">
                    <div className="flex items-center gap-3">
                      <span className="h-px w-9 bg-[#E8A33D]" />

                      <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#E8A33D] drop-shadow-[0_1px_6px_rgba(0,0,0,0.85)]">
                        The Student Portal
                      </p>
                    </div>

                    <h2 className="mt-6 text-[clamp(2.4rem,5.5vw,4.7rem)] font-semibold leading-[0.98] tracking-[-0.05em] text-white drop-shadow-[0_2px_14px_rgba(0,0,0,0.75)]">
                      Everything important,
                      <br />
                      <span className="text-[#E8A33D] drop-shadow-[0_2px_14px_rgba(0,0,0,0.85)]">
                        easier to find.
                      </span>
                    </h2>

                    <p className="mt-8 max-w-2xl text-[15px] leading-8 tracking-[0.005em] text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.8)] sm:text-base sm:leading-9">
                      Your studies and student services are brought together
                      in one place, with the tools you need throughout your
                      time with SELFLESS CE.
                    </p>
                  </div>

                  <div className="border-l-2 border-[#E8A33D]/40 pl-6 lg:pl-8">
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#E8A33D] drop-shadow-[0_1px_6px_rgba(0,0,0,0.85)]">
                      Designed For
                    </p>

                    <div className="mt-5 space-y-3">
                      {[
                        "Students",
                        "Tech centers",
                        "Academic support",
                        "Community",
                      ].map((item) => (
                        <p
                          key={item}
                          className="text-[15px] font-semibold tracking-[-0.01em] text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.85)]"
                        >
                          {item}
                        </p>
                      ))}
                    </div>

                    <Link
                      href="/features"
                      className="group mt-8 inline-flex items-center gap-2 text-sm font-bold tracking-[0.005em] text-[#E8A33D] drop-shadow-[0_1px_8px_rgba(0,0,0,0.85)] transition-colors hover:text-white"
                    >
                      Explore features

                      <ArrowRight
                        size={15}
                        className="transition-transform duration-300 group-hover:translate-x-1"
                      />
                    </Link>
                  </div>
                </motion.div>
              </div>
            </section>

            {/* =================================================
                FEATURES
            ================================================== */}

            <section className="relative z-10 border-y border-white/15 bg-[#071018]/45 backdrop-blur-[2px]">
              <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24 lg:px-12 lg:py-28">
                <motion.div
                  {...(shouldReduceMotion
                    ? {}
                    : {
                        initial: "hidden",
                        whileInView: "visible",
                        viewport: {
                          once: true,
                          amount: 0.1,
                        },
                      })}
                  variants={fadeIn}
                >
                  <div className="mb-12 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="h-px w-9 bg-[#E8A33D]" />

                        <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#E8A33D] drop-shadow-[0_1px_6px_rgba(0,0,0,0.85)]">
                          What You Can Do
                        </p>
                      </div>

                      <h2 className="mt-5 text-3xl font-semibold leading-[1.02] tracking-[-0.045em] text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.75)] sm:text-4xl lg:text-5xl">
                        Built around{" "}
                        <span className="text-[#E8A33D] drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]">
                          student needs.
                        </span>
                      </h2>
                    </div>

                    <Link
                      href="/features"
                      className="group inline-flex items-center gap-2 text-sm font-bold tracking-[0.005em] text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.85)] transition-colors hover:text-[#E8A33D]"
                    >
                      Explore all features

                      <ArrowRight
                        size={15}
                        className="transition-transform duration-300 group-hover:translate-x-1"
                      />
                    </Link>
                  </div>

                  <div className="grid border-t border-white/15 sm:grid-cols-2 lg:grid-cols-4">
                    {features.map((feature) => {
                      const Icon = feature.icon;

                      return (
                        <Link
                          key={feature.number}
                          href={feature.href}
                          className="group relative border-b border-white/15 px-0 py-9 transition-colors duration-300 hover:bg-white/[0.06] sm:border-r sm:px-7 lg:border-b-0 lg:first:pl-0 lg:last:border-r-0 lg:last:pr-0"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex h-11 w-11 items-center justify-center border border-white/25 bg-white/10 text-[#E8A33D] backdrop-blur-sm transition-all duration-300 group-hover:border-[#E8A33D] group-hover:bg-[#E8A33D]/15">
                              <Icon
                                size={18}
                                strokeWidth={1.7}
                              />
                            </div>

                            <span className="font-mono text-[10px] font-bold tracking-[0.2em] text-[#E8A33D] drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)]">
                              {feature.number}
                            </span>
                          </div>

                          <h3 className="mt-6 text-[17px] font-bold leading-snug tracking-[-0.015em] text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.85)] transition-colors duration-300 group-hover:text-[#E8A33D]">
                            {feature.title}
                          </h3>

                          <p className="mt-2.5 max-w-[260px] text-[13px] leading-[1.7] tracking-[0.005em] text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.8)]">
                            {feature.description}
                          </p>

                          <span className="mt-6 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#E8A33D] drop-shadow-[0_1px_6px_rgba(0,0,0,0.85)] transition-colors duration-300 group-hover:text-white">
                            Open

                            <ArrowRight
                              size={13}
                              className="transition-transform duration-300 group-hover:translate-x-1"
                            />
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </motion.div>
              </div>
            </section>

            {/* =================================================
                FINAL CTA
            ================================================== */}

            <section className="relative z-10 bg-[#12203B]/40 backdrop-blur-[2px]">
              <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24 lg:px-12 lg:py-32">
                <motion.div
                  {...(shouldReduceMotion
                    ? {}
                    : {
                        initial: "hidden",
                        whileInView: "visible",
                        viewport: {
                          once: true,
                          amount: 0.15,
                        },
                      })}
                  variants={fadeUp}
                  className="grid gap-12 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-16"
                >
                  <div className="max-w-3xl">
                    <div className="flex items-center gap-3">
                      <span className="h-px w-9 bg-[#E8A33D]" />

                      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#E8A33D] drop-shadow-[0_1px_6px_rgba(0,0,0,0.85)]">
                        SELFLESS CE
                      </p>
                    </div>

                    <h2 className="mt-5 text-[clamp(2.5rem,5.5vw,4.7rem)] font-semibold leading-[0.96] tracking-[-0.05em] text-white drop-shadow-[0_2px_14px_rgba(0,0,0,0.75)]">
                      Focus on your{" "}
                      <span className="text-[#E8A33D] drop-shadow-[0_2px_14px_rgba(0,0,0,0.85)]">
                        education.
                      </span>
                      <br />
                      We help connect the rest.
                    </h2>

                    <p className="mt-7 max-w-2xl text-sm leading-7 text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.8)] sm:text-base sm:leading-8">
                      Connect with tutors, students,
                      tech-center teams, and the wider
                      SELFLESS CE community whenever you
                      need support.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 lg:max-w-[360px] lg:justify-end">
                    <Link
                      href={
                        user
                          ? "/dashboard"
                          : "/register"
                      }
                      className="group inline-flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold transition-transform duration-300 hover:-translate-y-0.5"
                      style={{
                        backgroundColor:
                          COLORS.brassLight,
                        color: COLORS.ink,
                      }}
                    >
                      {user
                        ? "Open dashboard"
                        : "Get started"}

                      <ArrowRight
                        size={16}
                        className="transition-transform duration-300 group-hover:translate-x-1"
                      />
                    </Link>

                    {!user && !authLoading && (
                      <button
                        type="button"
                        onClick={openLogin}
                        className="inline-flex items-center gap-2 rounded-lg border px-5 py-3 text-sm font-semibold text-white transition-colors duration-300 hover:bg-white/10"
                        style={{
                          borderColor:
                            "rgba(255,255,255,0.35)",
                        }}
                      >
                        Sign in
                      </button>
                    )}

                    <Link
                      href="/help"
                      className="group inline-flex items-center gap-2 px-2 py-3 text-sm font-medium text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.85)] transition-colors hover:text-[#E8A33D]"
                    >
                      Visit support

                      <ArrowRight
                        size={15}
                        className="transition-transform duration-300 group-hover:translate-x-1"
                      />
                    </Link>
                  </div>
                </motion.div>
              </div>
            </section>
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

/* =========================================================
   VIDEO JOURNEY ITEM
========================================================= */

function VideoJourneyItem({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="border-b border-white/15 py-8 sm:border-b-0 sm:border-r sm:px-7 sm:py-10 sm:first:pl-0 sm:last:border-r-0 sm:last:pr-0">
      <div className="flex items-start gap-4">
        <span className="mt-0.5 font-mono text-[9px] font-bold tracking-[0.16em] text-[#E8A33D] drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
          {number}
        </span>

        <div>
          <p className="text-sm font-bold text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.9)]">
            {title}
          </p>

          <p className="mt-2 max-w-[280px] text-xs leading-6 text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.85)]">
            {text}
          </p>
        </div>
      </div>
    </div>
  );
}