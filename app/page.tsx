"use client";

export const dynamic = 'force-dynamic';

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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import Footer from "@/app/components/Footer";
import LoadingScreen from "@/app/components/LoadingScreen";
import AuthModal from "@/components/auth/AuthModal";
import { useAuth } from "@/lib/hooks/useAuth";
import { siteTheme } from "@/lib/site-theme";

const COLORS = siteTheme;

type HeroImage = {
  src: string;
  eyebrow: string;
  title: string;
  description: string;
};

const heroImages: HeroImage[] = [
  {
    src: "/ce11.jpeg",
    eyebrow: "SELFLESS STUDENT PORTAL",
    title: "Your Education, Connected.",
    description:
      "One portal for your courses, grades, community, and everything that moves you forward.",
  },
  {
    src: "/ce3.jpeg",
    eyebrow: "ACADEMIC TOOLS",
    title: "Stay Focused on Your Studies.",
    description:
      "Courses, grades, and progress — organized in one place so you can focus on what matters.",
  },
  {
    src: "/ce4.jpeg",
    eyebrow: "STUDENT SERVICES",
    title: "Learn, Connect, and Move Forward.",
    description:
      "Students, tutors, and tech centers — one community built around your growth.",
  },
  {
    src: "/ce5.jpeg",
    eyebrow: "EVERYTHING IN ONE PLACE",
    title: "Your Whole Journey, Simplified.",
    description:
      "Courses, communication, community, and support — finally organized in one place.",
  },
  {
    src: "/ce6.jpeg",
    eyebrow: "BUILT FOR STUDENTS",
    title: "Designed Around How You Learn.",
    description:
      "A portal that fits your academic life, from first day to graduation.",
  },
  {
    src: "/ce7.jpeg",
    eyebrow: "ONE COMMUNITY",
    title: "Grow Together, Achieve Together.",
    description:
      "Connect with peers and tutors who share your goals and your journey.",
  },
];

const heroImageVariants: Variants = {
  enter: () => ({
    opacity: 0,
    scale: 1.08,
  }),
  center: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 1.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    transition: {
      duration: 1.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

/* =========================================================
   SLIDE ANIMATIONS — text slides in from left, right, or up
========================================================= */

const slideInLeft = {
  hidden: { opacity: 0, x: -28 },
  visible: {
    opacity: 1,
    x: 0,
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
      staggerChildren: 0.07,
    },
  },
};

export default function HomePage() {
  const { user } = useAuth();

  const [showAuthModal, setShowAuthModal] = useState(false);

  const [authModalType, setAuthModalType] = useState<"login" | "register">(
    "login"
  );

  const [loadingScreen, setLoadingScreen] = useState(true);

  const shouldReduceMotion = useReducedMotion();

  const preloadRef = useRef<Set<string>>(new Set());

  const [currentHero, setCurrentHero] = useState(0);
  const [direction, setDirection] = useState(1);

  const [failedImages, setFailedImages] = useState<Set<string>>(
    () => new Set()
  );

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

  /* -----------------------------------------------------
     AUTH MODAL HELPERS
  ----------------------------------------------------- */

  const openAuth = useCallback((type: "login" | "register") => {
    setAuthModalType(type);
    setShowAuthModal(true);
  }, []);

  const closeAuth = useCallback(() => {
    setShowAuthModal(false);
  }, []);

  return (
    <>
      {loadingScreen && (
        <LoadingScreen
          onComplete={handleLoadingComplete}
          delay={700}
        />
      )}

      <div className="min-h-screen flex flex-col bg-[#F7F6F2]">

        <main className="flex-1">

          {/* =====================================================
              HERO
          ====================================================== */}

          <section className="relative overflow-hidden bg-[#12203B]">
            {/* BACKGROUND SLIDESHOW */}
            <div aria-hidden="true" className="absolute inset-0">
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
                    sizes="100vw"
                    className="object-cover"
                    onError={() => handleImageError(activeHero.src)}
                  />
                </motion.div>
              </AnimatePresence>

              <div className="absolute inset-0 bg-[#0D182C]/30" />
              <div className="absolute inset-0 bg-gradient-to-b from-[#0D182C]/20 via-[#0D182C]/10 to-[#0D182C]/35" />
              <div
                aria-hidden="true"
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(ellipse 65% 55% at 50% 45%, rgba(13,24,44,0.3), transparent 75%)",
                }}
              />
            </div>

            {/* HERO CONTENT */}
            <div className="relative z-10 mx-auto flex min-h-[100dvh] max-w-[1200px] flex-col justify-center px-5 pb-24 pt-36 sm:px-8 sm:pt-40 lg:px-10">
              <motion.div
                initial={shouldReduceMotion ? false : "hidden"}
                animate="visible"
                variants={stagger}
                className="mx-auto max-w-[640px] text-center"
              >
                <motion.div
                  variants={slideInLeft}
                  className="mb-4 sm:mb-6"
                >
                  <span
                    className="text-[10px] font-semibold uppercase tracking-[0.22em] sm:text-[11px]"
                    style={{ color: COLORS.brassLight }}
                  >
                    {activeHero.eyebrow}
                  </span>
                </motion.div>

                <motion.h1
                  variants={slideInLeft}
                  className="text-[clamp(2.5rem,5.5vw,4.6rem)] font-semibold leading-[1.02] tracking-[-0.04em] text-white"
                  style={{ textShadow: "0 2px 14px rgba(0,0,0,0.6), 0 1px 6px rgba(0,0,0,0.4)" }}
                >
                  {activeHero.title}
                </motion.h1>

                <motion.p
                  variants={slideInLeft}
                  className="mx-auto mt-5 max-w-[500px] text-[15px] leading-[1.75] sm:mt-6 sm:text-[16px] font-normal"
                  style={{
                    color: "rgba(255,255,255,0.95)",
                    textShadow: "0 1px 10px rgba(0,0,0,0.6)",
                  }}
                >
                  {activeHero.description}
                </motion.p>

                <motion.div
                  variants={slideInLeft}
                  className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:mt-9"
                >
                  {user ? (
                    <Link
                      href="/dashboard"
                      className="group inline-flex items-center gap-2.5 rounded-lg px-6 py-3.5 text-[14px] font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                      style={{
                        backgroundColor: COLORS.brassLight,
                        color: COLORS.ink,
                        boxShadow: "0 4px 20px rgba(232,163,61,0.4), 0 2px 10px rgba(0,0,0,0.3)",
                      }}
                    >
                      Go to dashboard

                      <ArrowRight
                        size={16}
                        className="transition-transform duration-300 group-hover:translate-x-1"
                      />
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => openAuth("register")}
                      className="group inline-flex items-center gap-2.5 rounded-lg px-6 py-3.5 text-[14px] font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg motion-reduce:transition-none"
                      style={{
                        backgroundColor: COLORS.brassLight,
                        color: COLORS.ink,
                        boxShadow: "0 4px 20px rgba(232,163,61,0.4), 0 2px 10px rgba(0,0,0,0.3)",
                      }}
                    >
                      Get started

                      <ArrowRight
                        size={16}
                        className="transition-transform duration-300 group-hover:translate-x-1"
                      />
                    </button>
                  )}

                  <Link
                    href="/about"
                    className="group inline-flex items-center gap-2.5 rounded-lg border px-6 py-3.5 text-[14px] font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/10"
                    style={{
                      color: "rgba(255,255,255,0.95)",
                      borderColor: "rgba(255,255,255,0.5)",
                      backgroundColor: "rgba(0,0,0,0.2)",
                      backdropFilter: "blur(10px)",
                      boxShadow: "0 2px 12px rgba(0,0,0,0.4)",
                    }}
                  >
                    About the portal

                    <ArrowRight
                      size={15}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </Link>
                </motion.div>
              </motion.div>
            </div>

            {/* SLIDER CONTROLS */}
            {availableHeroIndexes.length > 1 && (
              <div className="absolute inset-x-0 bottom-0 z-20">
                <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-3 px-5 pb-6 sm:px-8 lg:px-10">
                  <div className="flex items-center gap-1.5">
                    {heroImages.map((image, index) => {
                      if (failedImages.has(image.src)) {
                        return null;
                      }

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
                                : "rgba(255,255,255,0.55)",
                          }}
                        />
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] tracking-[0.15em] text-white/95" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.8), 0 1px 5px rgba(0,0,0,0.6)" }}>
                      {String(availableHeroIndexes.indexOf(currentHero) + 1).padStart(2, "0")}
                      {" / "}
                      {String(availableHeroIndexes.length).padStart(2, "0")}
                    </span>

                    <button
                      type="button"
                      onClick={previousHero}
                      aria-label="Previous image"
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition-colors hover:bg-white/25"
                      style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.4)" }}
                    >
                      <ChevronLeft size={15} strokeWidth={2} />
                    </button>

                    <button
                      type="button"
                      onClick={nextHero}
                      aria-label="Next image"
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition-colors hover:bg-white/25"
                      style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.4)" }}
                    >
                      <ChevronRight size={15} strokeWidth={2} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>
        </main>

        <Footer />

        {/* key ensures the modal remounts with the correct tab when reopened */}
        <AuthModal
          key={authModalType}
          isOpen={showAuthModal}
          defaultType={authModalType}
          onClose={closeAuth}
        />
      </div>
    </>
  );
}