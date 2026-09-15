"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  type Variants,
  useReducedMotion,
} from "framer-motion";

import Header2 from "@/app/components/ui/header-2";
import Footer from "@/app/components/Footer";
import LoadingScreen from "@/app/components/LoadingScreen";
import AuthModal from "@/components/auth/AuthModal";
import { useAuth } from "@/lib/hooks/useAuth";

import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  LayoutDashboard,
  MessageSquare,
  Network,
  Play,
  Users,
} from "lucide-react";

/* =========================================================
   DATA
========================================================= */

const features = [
  {
    icon: BookOpen,
    title: "Academic progress",
    text: "Keep courses, credits, grades, GPA, and semester progress easier to follow.",
  },
  {
    icon: Users,
    title: "Student community",
    text: "Connect with peers, tutors, and learning communities across the SELFLESS CE network.",
  },
  {
    icon: Network,
    title: "Tech-center network",
    text: "Stay connected to your tech center while being part of a wider student community.",
  },
  {
    icon: MessageSquare,
    title: "Clear communication",
    text: "Keep announcements, messages, feedback, and student support within reach.",
  },
];

const journeyPoints = [
  {
    number: "01",
    title: "Stay on track",
    text: "See the academic information you need to understand where you are and what comes next.",
  },
  {
    number: "02",
    title: "Connect beyond your center",
    text: "Build relationships with students, tutors, and communities across different tech centers.",
  },
  {
    number: "03",
    title: "Get support around you",
    text: "SELFLESS CE helps coordinate the support around your student experience so you can focus on learning.",
  },
];

const heroImages = [
  {
    src: "/cover page.jpg",
    alt: "SELFLESS CE student community",
    eyebrow: "One place for your academic life",
    title: "Where challenge meets possibility",
    description:
      "Earn an accredited online degree from our partners while you keep working, managing life, and moving forward.",
  },
  {
    src: "/cover image.jpg",
    alt: "Student learning with a laptop",
    eyebrow: "Everything you need to stay ahead",
    title: "Focus on learning while your tools stay organized.",
    description:
      "Manage course registration, assignments, attendance, announcements, and academic progress from one secure platform.",
  },
  {
    src: "/student-portal-image.png",
    alt: "Student using the SELFLESS CE portal",
    eyebrow: "Real-time academic records",
    title: "See your progress and your next step.",
    description:
      "Keep grades, credits, courses, schedules, tutor feedback, and performance insights within reach as you move through your studies.",
  },
  {
    src: "/student-portal.png",
    alt: "SELFLESS CE student portal experience",
    eyebrow: "One portal. Multiple services.",
    title: "Learn, connect, progress, and build your future.",
    description:
      "Access study groups, tutor feedback, smart notifications, student activities, achievements, and tech-center support with one login.",
  },
];

/* =========================================================
   MOTION
========================================================= */

const reveal: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  },
};

const revealLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

const revealRight: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.04 },
  },
};

const heroContent: Variants = {
  initial: { opacity: 0, y: 14, filter: "blur(3px)" },
  animate: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    y: -8,
    filter: "blur(2px)",
    transition: { duration: 0.28, ease: "easeIn" },
  },
};

const journeyReveal: Variants = {
  hidden: { opacity: 0, x: 16 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

const imageReveal: Variants = {
  hidden: { opacity: 0, scale: 0.975, x: -18 },
  visible: {
    opacity: 1,
    scale: 1,
    x: 0,
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
  },
};

/* =========================================================
   3D HERO IMAGE STACK VARIANTS
========================================================= */

const heroImageVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "60%" : "-60%",
    z: -400,
    rotateY: direction > 0 ? -55 : 55,
    scale: 0.75,
    opacity: 0,
    filter: "blur(12px)",
  }),
  center: {
    x: "0%",
    z: 0,
    rotateY: 0,
    scale: 1,
    opacity: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.95,
      ease: [0.22, 1, 0.36, 1],
      opacity: { duration: 0.5 },
      filter: { duration: 0.6 },
    },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? "-60%" : "60%",
    z: -400,
    rotateY: direction > 0 ? 55 : -55,
    scale: 0.75,
    opacity: 0,
    filter: "blur(12px)",
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

const reducedHeroImageVariants: Variants = {
  enter: { opacity: 0 },
  center: { opacity: 1, transition: { duration: 0.35 } },
  exit: { opacity: 0, transition: { duration: 0.25 } },
};

/* =========================================================
   COMPONENT
========================================================= */

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [heroImageIndex, setHeroImageIndex] = useState(0);
  const [heroDirection, setHeroDirection] = useState(1);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalType, setAuthModalType] = useState<"login" | "register">(
    "login"
  );
  const [imageLoadErrors, setImageLoadErrors] = useState<Set<number>>(new Set());

  const { isAuthenticated } = useAuth();
  const prefersReducedMotion = useReducedMotion();

  const heroImage = heroImages[heroImageIndex];

  /* =========================================================
     LOADING
  ========================================================= */

  const handleLoadingComplete = useCallback(() => {
    setIsLoading(false);
  }, []);

  /* =========================================================
     AUTH
  ========================================================= */

  const openAuthModal = (type: "login" | "register") => {
    setAuthModalType(type);
    setShowAuthModal(true);
  };

  /* =========================================================
     PRELOAD HERO IMAGES
  ========================================================= */

  useEffect(() => {
    const preloadImages = async () => {
      const imagePromises = heroImages.map((image) => {
        return new Promise<void>((resolve) => {
          const img = new window.Image();
          img.onload = () => resolve();
          img.onerror = () => resolve();
          img.src = image.src;
        });
      });

      try {
        await Promise.all(imagePromises);
      } catch (error) {
        console.warn("Some images failed to preload:", error);
      }
    };

    if (typeof window !== "undefined") {
      preloadImages();
    }
  }, []);

  /* =========================================================
     AUTO ROTATION
  ========================================================= */

  useEffect(() => {
    if (typeof window === "undefined") return;

    const interval = window.setInterval(() => {
      setHeroDirection(1);
      setHeroImageIndex((currentIndex) => {
        let nextIndex = (currentIndex + 1) % heroImages.length;
        let attempts = 0;
        while (
          imageLoadErrors.has(nextIndex) &&
          attempts < heroImages.length
        ) {
          nextIndex = (nextIndex + 1) % heroImages.length;
          attempts++;
        }
        return nextIndex;
      });
    }, 10000);

    return () => window.clearInterval(interval);
  }, [imageLoadErrors]);

  /* =========================================================
     CAROUSEL CONTROLS
  ========================================================= */

  const showPreviousHeroImage = () => {
    setHeroDirection(-1);
    setHeroImageIndex(
      (currentIndex) =>
        (currentIndex - 1 + heroImages.length) % heroImages.length
    );
  };

  const showNextHeroImage = () => {
    setHeroDirection(1);
    setHeroImageIndex((currentIndex) => {
      let nextIndex = (currentIndex + 1) % heroImages.length;
      let attempts = 0;
      while (
        imageLoadErrors.has(nextIndex) &&
        attempts < heroImages.length
      ) {
        nextIndex = (nextIndex + 1) % heroImages.length;
        attempts++;
      }
      return nextIndex;
    });
  };

  const goToHeroImage = (index: number) => {
    setHeroDirection(index > heroImageIndex ? 1 : -1);
    setHeroImageIndex(index);
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F1F1EC]">
      <LoadingScreen onComplete={handleLoadingComplete} delay={5000} />

      <Header2 />

      <main
        id="main"
        className="transition-opacity duration-700"
        style={{ opacity: isLoading ? 0 : 1 }}
      >
        {/* =====================================================
            HERO
        ====================================================== */}

        <section className="relative isolate w-full overflow-hidden bg-[#12203B] lg:min-h-screen">
          {/* Ambient background depth layers */}
          <div
            className="pointer-events-none absolute inset-0 z-0"
            aria-hidden="true"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_40%,rgba(232,163,61,0.10),transparent_55%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(18,32,59,0.9),transparent_60%)]" />
          </div>

          {/* ===================================================
              MOBILE HERO
          =================================================== */}

          <div className="flex flex-col lg:hidden">
            {/* 3D IMAGE STAGE */}
            <div
              className="relative h-[43vh] min-h-[285px] w-full overflow-hidden"
              style={{ perspective: "1400px" }}
            >
              <AnimatePresence initial={false} custom={heroDirection} mode="wait">
                <motion.div
                  key={heroImage.src}
                  custom={heroDirection}
                  variants={
                    prefersReducedMotion
                      ? reducedHeroImageVariants
                      : heroImageVariants
                  }
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="absolute inset-0 origin-center will-change-transform"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <Image
                    src={heroImage.src}
                    alt={heroImage.alt}
                    fill
                    sizes="100vw"
                    className="object-cover object-center"
                    priority={heroImageIndex === 0}
                    quality={90}
                    onError={() => {
                      setImageLoadErrors((prev) =>
                        new Set(prev).add(heroImageIndex)
                      );
                    }}
                  />

                  <div className="absolute inset-0 bg-[#12203B]/10" />
                </motion.div>
              </AnimatePresence>

              {/* Bottom transition */}
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-16"
                style={{
                  background: "#12203B",
                  clipPath: "polygon(0 100%, 100% 0, 100% 100%, 0 100%)",
                }}
              />

              {/* Mobile carousel */}
              <div className="absolute bottom-5 left-0 right-0 z-20 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={showPreviousHeroImage}
                  aria-label="Show previous hero image"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-white/25 bg-[#12203B]/65 text-white backdrop-blur-md transition-all duration-300 hover:border-[#E8A33D] hover:text-[#E8A33D] focus:outline-none focus:ring-2 focus:ring-[#E8A33D]/50"
                >
                  <ChevronLeft size={15} />
                </button>

                <div className="flex items-center gap-1.5">
                  {heroImages.map((image, index) => (
                    <button
                      key={image.src}
                      type="button"
                      onClick={() => goToHeroImage(index)}
                      aria-label={`Show slide ${index + 1}`}
                      className="relative h-4 w-6"
                    >
                      <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-white/25" />
                      <motion.span
                        initial={false}
                        animate={{
                          width: index === heroImageIndex ? "100%" : "0%",
                        }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute left-0 top-1/2 h-[2px] -translate-y-1/2 bg-[#E8A33D]"
                      />
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={showNextHeroImage}
                  aria-label="Show next hero image"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-white/25 bg-[#12203B]/65 text-white backdrop-blur-md transition-all duration-300 hover:border-[#E8A33D] hover:text-[#E8A33D] focus:outline-none focus:ring-2 focus:ring-[#E8A33D]/50"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>

            {/* CONTENT */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate={isLoading ? "hidden" : "visible"}
              className="relative z-20 bg-[#12203B] px-6 pb-10 pt-4"
            >
              <div className="mx-auto max-w-md text-center">
                <AnimatePresence initial={false} mode="wait">
                  <motion.div
                    key={`mobile-eyebrow-${heroImage.src}`}
                    variants={heroContent}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#E8A33D]">
                      {heroImage.eyebrow}
                    </p>
                  </motion.div>
                </AnimatePresence>

                <AnimatePresence initial={false} mode="wait">
                  <motion.h1
                    key={`mobile-title-${heroImage.src}`}
                    variants={heroContent}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="mt-4 text-[2rem] font-light leading-[1.08] tracking-[-0.035em] text-white sm:text-4xl"
                  >
                    {heroImage.title.split(" ").map((word, index) => (
                      <span
                        key={`${heroImage.src}-${index}`}
                        className={
                          index === 1
                            ? "italic underline decoration-[#E8A33D] decoration-2 underline-offset-[5px]"
                            : ""
                        }
                      >
                        {word}{" "}
                      </span>
                    ))}
                  </motion.h1>
                </AnimatePresence>

                <AnimatePresence initial={false} mode="wait">
                  <motion.p
                    key={`mobile-description-${heroImage.src}`}
                    variants={heroContent}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="mt-4 text-[13px] font-medium leading-6 text-white/80"
                  >
                    {heroImage.description}
                  </motion.p>
                </AnimatePresence>

                {/* ===== ENHANCED MOBILE BUTTON PAIR ===== */}
                <motion.div
                  variants={reveal}
                  className="mt-7 flex flex-col gap-3"
                >
                  <div className="grid grid-cols-2 gap-2.5">
                    <Link
                      href="/features"
                      className="group inline-flex h-12 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#E8A33D] to-[#D69528] px-3 text-[12.5px] font-bold tracking-wide text-[#12203B] shadow-[0_4px_14px_rgba(232,163,61,0.32)] transition-all duration-300 hover:-translate-y-0.5 hover:from-[#F2B359] hover:to-[#E8A33D] hover:shadow-[0_6px_20px_rgba(232,163,61,0.42)] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8A33D]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#12203B]"
                    >
                      <span className="truncate">Explore Features</span>
                      <ArrowRight
                        size={14}
                        className="shrink-0 transition-transform duration-300 group-hover:translate-x-1"
                      />
                    </Link>

                    <Link
                      href="/tech-centers"
                      className="group inline-flex h-12 items-center justify-center gap-1.5 rounded-xl border border-white/20 bg-white/[0.06] px-3 text-[12.5px] font-bold tracking-wide text-white backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/[0.12] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#12203B]"
                    >
                      <Building2 size={14} className="shrink-0" />
                      <span className="truncate">Tech Centers</span>
                    </Link>
                  </div>

                  <Link
                    href="/about"
                    className="group mx-auto inline-flex items-center gap-2.5 py-1 text-[12.5px] font-semibold text-white/65 transition-colors hover:text-[#E8A33D]"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-[#E8A33D] shadow-[0_2px_6px_rgba(0,0,0,0.15)] transition-all duration-300 group-hover:bg-[#E8A33D] group-hover:text-[#12203B] group-hover:shadow-[0_4px_10px_rgba(232,163,61,0.4)]">
                      <Play size={10} fill="currentColor" />
                    </span>
                    <span>Why Choose SELFLESS CE?</span>
                  </Link>
                </motion.div>

                {/* ===== ENHANCED MOBILE AUTH ===== */}
                <motion.div
                  variants={reveal}
                  className="mt-7 border-t border-white/10 pt-5"
                >
                  {isAuthenticated ? (
                    <Link
                      href="/dashboard"
                      className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/[0.06] px-5 text-[13px] font-bold text-white backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-white/35 hover:bg-white/[0.12] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                    >
                      <LayoutDashboard size={16} />
                      Go to Dashboard
                    </Link>
                  ) : (
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => openAuthModal("login")}
                        className="inline-flex h-12 items-center justify-center rounded-xl border border-white/20 bg-white/[0.06] px-4 text-[12.5px] font-bold tracking-wide text-white backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-white/35 hover:bg-white/[0.12] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                      >
                        Log In
                      </button>
                      <button
                        type="button"
                        onClick={() => openAuthModal("register")}
                        className="inline-flex h-12 items-center justify-center rounded-xl border border-[#E8A33D]/45 bg-[#E8A33D]/12 px-4 text-[12.5px] font-bold tracking-wide text-[#E8A33D] backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#E8A33D]/70 hover:bg-[#E8A33D]/20 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8A33D]/60"
                      >
                        Create Account
                      </button>
                    </div>
                  )}
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* ===================================================
              DESKTOP HERO — 3D LAYERED STAGE
          =================================================== */}

          <div className="hidden lg:block">
            {/* 3D STAGE WRAPPER */}
            <div
              className="absolute inset-y-0 right-0 z-0 w-[58%] overflow-hidden"
              style={{ perspective: "1600px", perspectiveOrigin: "35% 50%" }}
            >
              {/* Soft glow behind the image */}
              <div
                className="pointer-events-none absolute inset-0 z-0"
                aria-hidden="true"
                style={{
                  background:
                    "radial-gradient(circle at 60% 50%, rgba(232,163,61,0.18), transparent 60%)",
                }}
              />

              <AnimatePresence initial={false} custom={heroDirection} mode="wait">
                <motion.div
                  key={heroImage.src}
                  custom={heroDirection}
                  variants={
                    prefersReducedMotion
                      ? reducedHeroImageVariants
                      : heroImageVariants
                  }
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="absolute inset-0 origin-center will-change-transform"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <Image
                    src={heroImage.src}
                    alt={heroImage.alt}
                    fill
                    sizes="(min-width: 1024px) 58vw, 100vw"
                    className="object-cover object-center"
                    priority={heroImageIndex === 0}
                    quality={90}
                    onError={() => {
                      setImageLoadErrors((prev) =>
                        new Set(prev).add(heroImageIndex)
                      );
                    }}
                  />

                  {/* Depth overlays */}
                  <div className="absolute inset-0 bg-[#12203B]/15" />
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(120deg, rgba(18,32,59,0.55) 0%, transparent 45%, transparent 75%, rgba(18,32,59,0.35) 100%)",
                    }}
                  />
                </motion.div>
              </AnimatePresence>

              {/* Floating decorative particles for depth */}
              <motion.div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 1 }}
              >
                {[
                  { top: "18%", left: "22%", size: 3, delay: 0 },
                  { top: "62%", left: "78%", size: 4, delay: 1.2 },
                  { top: "38%", left: "68%", size: 2, delay: 0.6 },
                  { top: "80%", left: "35%", size: 3, delay: 1.8 },
                ].map((dot, i) => (
                  <motion.span
                    key={i}
                    className="absolute rounded-full bg-[#E8A33D]/40"
                    style={{
                      top: dot.top,
                      left: dot.left,
                      width: dot.size,
                      height: dot.size,
                    }}
                    animate={
                      prefersReducedMotion
                        ? {}
                        : {
                            y: [0, -12, 0],
                            opacity: [0.3, 0.8, 0.3],
                          }
                    }
                    transition={{
                      duration: 4 + i,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: dot.delay,
                    }}
                  />
                ))}
              </motion.div>
            </div>

            {/* DIAGONAL DIVIDER — now sits above the image for depth */}
            <div
              className="pointer-events-none absolute inset-y-0 left-0 z-10 hidden w-[58%] lg:block"
              style={{
                clipPath: "polygon(0 0, 100% 0, 85% 100%, 0 100%)",
                background: "#12203B",
              }}
            />

            {/* CONTENT — floats above everything */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate={isLoading ? "hidden" : "visible"}
              className="relative z-20 mx-auto flex min-h-[clamp(680px,88vh,900px)] w-full max-w-7xl items-center px-8 pt-32 lg:px-12 lg:pt-36"
            >
              <div className="w-[55%] pr-8 xl:pr-12">
                <div className="max-w-xl">
                  <AnimatePresence initial={false} mode="wait">
                    <motion.div
                      key={`desktop-eyebrow-${heroImage.src}`}
                      variants={heroContent}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                    >
                      <div className="mb-5 flex items-center gap-3">
                        <span className="h-px w-8 bg-[#E8A33D]" />
                        <p className="text-[10px] font-bold uppercase tracking-[0.23em] text-white/65">
                          {heroImage.eyebrow}
                        </p>
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  <AnimatePresence initial={false} mode="wait">
                    <motion.h1
                      key={`desktop-title-${heroImage.src}`}
                      variants={heroContent}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      className="text-[3.5rem] font-light leading-[1.05] tracking-[-0.04em] text-white xl:text-[3.8rem]"
                    >
                      {heroImage.title.split(" ").map((word, index) => (
                        <span
                          key={`${heroImage.src}-${index}`}
                          className={
                            index === 1
                              ? "italic underline decoration-[#E8A33D] decoration-2 underline-offset-8"
                              : ""
                          }
                        >
                          {word}{" "}
                        </span>
                      ))}
                    </motion.h1>
                  </AnimatePresence>

                  <AnimatePresence initial={false} mode="wait">
                    <motion.p
                      key={`desktop-description-${heroImage.src}`}
                      variants={heroContent}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      className="mt-7 max-w-lg text-[15px] font-medium leading-7 text-white/75"
                    >
                      {heroImage.description}
                    </motion.p>
                  </AnimatePresence>

                  {/* ===== ENHANCED DESKTOP BUTTON PAIR ===== */}
                  <motion.div
                    variants={reveal}
                    className="mt-8 flex flex-wrap items-center gap-3"
                  >
                    <Link
                      href="/features"
                      className="group relative inline-flex h-12 items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-[#E8A33D] to-[#D69528] px-6 text-[13px] font-bold tracking-wide text-[#12203B] shadow-[0_4px_14px_rgba(232,163,61,0.32)] transition-all duration-300 hover:-translate-y-0.5 hover:from-[#F2B359] hover:to-[#E8A33D] hover:shadow-[0_6px_20px_rgba(232,163,61,0.42)] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8A33D]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#12203B]"
                    >
                      <span>Explore Portal Features</span>
                      <ArrowRight
                        size={15}
                        className="transition-transform duration-300 group-hover:translate-x-1"
                      />
                    </Link>

                    <Link
                      href="/tech-centers"
                      className="group inline-flex h-12 items-center justify-center gap-2.5 rounded-xl border border-white/20 bg-white/[0.06] px-6 text-[13px] font-bold tracking-wide text-white backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/[0.12] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#12203B]"
                    >
                      <Building2 size={15} />
                      <span>View Tech Centers</span>
                    </Link>
                  </motion.div>

                  <motion.div
                    variants={reveal}
                    className="mt-6 flex items-center"
                  >
                    <Link
                      href="/about"
                      className="group inline-flex items-center gap-2.5 text-[12.5px] font-semibold text-white/60 transition-colors hover:text-[#E8A33D]"
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-[#E8A33D] shadow-[0_2px_6px_rgba(0,0,0,0.15)] transition-all duration-300 group-hover:bg-[#E8A33D] group-hover:text-[#12203B] group-hover:shadow-[0_4px_10px_rgba(232,163,61,0.4)]">
                        <Play size={10} fill="currentColor" />
                      </span>
                      <span>Why Choose SELFLESS CE?</span>
                    </Link>
                  </motion.div>

                  {/* ===== ENHANCED DESKTOP AUTH ===== */}
                  <motion.div
                    variants={reveal}
                    className="mt-8 border-t border-white/10 pt-6"
                  >
                    {isAuthenticated ? (
                      <Link
                        href="/dashboard"
                        className="relative inline-flex h-12 items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-[#E8A33D] to-[#D69528] px-6 text-[13px] font-bold tracking-wide text-[#12203B] shadow-[0_4px_14px_rgba(232,163,61,0.32)] transition-all duration-300 hover:-translate-y-0.5 hover:from-[#F2B359] hover:to-[#E8A33D] hover:shadow-[0_6px_20px_rgba(232,163,61,0.42)] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8A33D]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#12203B]"
                      >
                        <LayoutDashboard size={16} />
                        Go to Your Dashboard
                      </Link>
                    ) : (
                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={() => openAuthModal("login")}
                          className="inline-flex h-11 items-center justify-center rounded-xl border border-white/20 bg-white/[0.06] px-5 text-[12.5px] font-bold tracking-wide text-white backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-white/35 hover:bg-white/[0.12] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#12203B]"
                        >
                          Log In to Portal
                        </button>
                        <button
                          type="button"
                          onClick={() => openAuthModal("register")}
                          className="inline-flex h-11 items-center justify-center rounded-xl border border-[#E8A33D]/45 bg-[#E8A33D]/12 px-5 text-[12.5px] font-bold tracking-wide text-[#E8A33D] backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#E8A33D]/70 hover:bg-[#E8A33D]/20 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8A33D]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#12203B]"
                        >
                          Create an Account
                        </button>
                      </div>
                    )}
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* DESKTOP CAROUSEL */}
            <div className="absolute bottom-8 right-5 z-30 flex items-center gap-4 sm:right-8 lg:right-12">
              <div className="flex items-center gap-1.5">
                {heroImages.map((image, index) => (
                  <button
                    key={image.src}
                    type="button"
                    onClick={() => goToHeroImage(index)}
                    aria-label={`Show slide ${index + 1}`}
                    className="group relative h-5 w-8"
                  >
                    <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-white/25" />
                    <motion.span
                      initial={false}
                      animate={{
                        width: index === heroImageIndex ? "100%" : "0%",
                      }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute left-0 top-1/2 h-[2px] -translate-y-1/2 bg-[#E8A33D]"
                    />
                  </button>
                ))}
              </div>

              <span className="text-[10px] font-semibold tracking-[0.18em] text-white/60">
                {String(heroImageIndex + 1).padStart(2, "0")} /{" "}
                {String(heroImages.length).padStart(2, "0")}
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={showPreviousHeroImage}
                  aria-label="Show previous hero image"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-[#12203B]/55 text-white backdrop-blur-md transition-all duration-300 hover:border-[#E8A33D] hover:text-[#E8A33D]"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={showNextHeroImage}
                  aria-label="Show next hero image"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-[#12203B]/55 text-white backdrop-blur-md transition-all duration-300 hover:border-[#E8A33D] hover:text-[#E8A33D]"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            INTRODUCTION
        ====================================================== */}

        <section className="relative overflow-hidden bg-[#F1F1EC] px-5 py-14 sm:px-8 sm:py-18 lg:px-12 lg:py-20">
          <div className="mx-auto max-w-7xl">
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.25 }}
              className="grid gap-9 lg:grid-cols-[0.8fr_1.2fr] lg:items-end lg:gap-16"
            >
              <motion.div variants={revealLeft}>
                <div className="flex items-center gap-3">
                  <span className="h-px w-8 bg-[#B98A3E]" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#B98A3E]">
                    Built around your journey
                  </p>
                </div>
                <h2 className="mt-4 max-w-xl text-3xl font-semibold leading-[1.08] tracking-[-0.04em] text-[#12203B] sm:text-4xl lg:text-[2.8rem]">
                  Everything important stays connected.
                </h2>
              </motion.div>

              <motion.p
                variants={revealRight}
                className="max-w-2xl text-[15px] leading-7 text-[#4B564C] sm:text-base"
              >
                Your student experience involves more than completing
                coursework. The SELFLESS CE portal brings academic progress,
                community connection, tech-center communication, and support
                together in one dependable experience.
              </motion.p>
            </motion.div>
          </div>
        </section>

        {/* =====================================================
            PORTAL PROFILE
        ====================================================== */}

        <section className="relative isolate overflow-hidden border-y border-white/10 bg-[#0D1117] px-5 py-14 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
          <video
            className="pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            poster="/student-portal-image.png"
            aria-hidden="true"
          >
            <source src="/graduate.mp4" type="video/mp4" />
          </video>

          <div className="pointer-events-none absolute inset-0 -z-[5] bg-[#071018]/80" />

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            variants={staggerContainer}
            className="relative mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-16"
          >
            <motion.div variants={revealLeft} className="flex items-start gap-4">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-white/15 bg-white/10 shadow-sm sm:h-16 sm:w-16">
                <Image
                  src="/freedom.png"
                  alt="SELFLESS CE logo"
                  fill
                  sizes="64px"
                  className="object-contain p-1"
                />
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#E8A33D]">
                  About the platform
                </p>
                <h2 className="mt-2 text-2xl font-semibold leading-tight tracking-[-0.035em] text-white sm:text-3xl">
                  SELFLESS CE Student Portal
                </h2>
                <p className="mt-2 max-w-lg text-[13px] leading-6 text-white/65">
                  A centralized student self-service platform for learning,
                  connection, and support across the SELFLESS CE network.
                </p>
              </div>
            </motion.div>

            <motion.div
              variants={revealRight}
              className="grid gap-6 border-t border-white/10 pt-6 sm:grid-cols-3 sm:border-t-0 sm:pt-0"
            >
              <div className="border-l-2 border-[#E8A33D] pl-4">
                <p className="text-[1.65rem] font-semibold tracking-[-0.04em] text-white">
                  07+
                </p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/45">
                  Connected tech centers
                </p>
              </div>
              <div className="border-l-2 border-[#E8A33D] pl-4">
                <p className="text-[1.65rem] font-semibold tracking-[-0.04em] text-white">
                  BYU-Idaho
                </p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/45">
                  Academic pathways supported
                </p>
              </div>
              <div className="border-l-2 border-[#E8A33D] pl-4">
                <p className="text-[1.65rem] font-semibold tracking-[-0.04em] text-white">
                  ONE
                </p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/45">
                  Student community
                </p>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* =====================================================
            FEATURES
        ====================================================== */}

        <section className="bg-[#F1F1EC] px-5 pb-14 pt-12 sm:px-8 sm:pb-18 lg:px-12 lg:pb-20 lg:pt-14">
          <div className="mx-auto max-w-7xl">
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              className="grid overflow-hidden border-y border-[#DADCD3] bg-white sm:grid-cols-2 lg:grid-cols-4"
            >
              {features.map(({ icon: Icon, title, text }, index) => (
                <motion.div
                  key={title}
                  variants={reveal}
                  className={`
                    group relative p-5 transition-colors duration-400 hover:bg-[#F7F6F2] sm:p-6 lg:p-7
                    ${
                      index !== features.length - 1
                        ? "border-b border-[#DADCD3] sm:border-r"
                        : ""
                    }
                    ${index === 1 ? "lg:border-r" : ""}
                  `}
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-md border border-[#DADCD3] bg-[#F7F6F2] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-[#B98A3E]/50">
                    <Icon
                      size={18}
                      strokeWidth={1.8}
                      className="text-[#B98A3E] transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>

                  <h3 className="mt-5 text-[16px] font-semibold tracking-[-0.01em] text-[#12203B] transition-colors duration-300 group-hover:text-[#B98A3E]">
                    {title}
                  </h3>
                  <p className="mt-2.5 text-[13px] leading-6 text-[#6B7268]">
                    {text}
                  </p>
                  <div className="mt-6 h-px w-0 bg-[#B98A3E] transition-all duration-500 group-hover:w-9" />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* =====================================================
            STUDENT JOURNEY
        ====================================================== */}

        <section className="overflow-hidden bg-white px-5 py-14 sm:px-8 sm:py-18 lg:px-12 lg:py-20">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
              <motion.div
                variants={imageReveal}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.25 }}
                className="relative"
              >
                <div
                  className="relative h-[22rem] w-full overflow-hidden sm:h-[27rem] lg:h-[34rem]"
                  style={{ clipPath: "polygon(0 0, 100% 0, 88% 100%, 0 100%)" }}
                >
                  <motion.div
                    animate={
                      prefersReducedMotion ? {} : { scale: [1, 1.025, 1] }
                    }
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={heroImage.src}
                      alt={heroImage.alt}
                      fill
                      sizes="(min-width: 1024px) 45vw, 100vw"
                      className="object-cover object-center"
                    />
                  </motion.div>

                  <div className="absolute inset-0 bg-[#12203B]/30" />

                  <div className="absolute inset-x-5 top-5 z-10 max-w-xs sm:inset-x-7 sm:top-7">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#E8A33D]">
                      Your journey, in motion
                    </p>
                    <p className="mt-2 text-lg font-semibold leading-6 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)] sm:text-xl">
                      Learning today. Opportunity tomorrow.
                    </p>
                  </div>
                </div>

                <div className="absolute bottom-5 left-5 flex items-center gap-2.5 sm:bottom-7 sm:left-7">
                  <CheckCircle2 size={17} className="shrink-0 text-[#E8A33D]" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
                    Learning first
                  </p>
                </div>
              </motion.div>

              <div className="lg:pl-3">
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.25 }}
                  variants={staggerContainer}
                >
                  <motion.div variants={revealRight}>
                    <div className="flex items-center gap-3">
                      <span className="h-px w-8 bg-[#B98A3E]" />
                      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#B98A3E]">
                        Your student journey
                      </p>
                    </div>

                    <h2 className="mt-4 max-w-xl text-3xl font-semibold leading-[1.08] tracking-[-0.04em] text-[#12203B] sm:text-4xl lg:text-[2.8rem]">
                      Learning comes first. Support stays around you.
                    </h2>

                    <p className="mt-5 max-w-xl text-[15px] leading-7 text-[#5D665D]">
                      SELFLESS CE is designed around the reality of student
                      life. Your education remains the focus while the
                      community, communication, and support around you stay
                      connected.
                    </p>
                  </motion.div>
                </motion.div>

                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.15 }}
                  variants={{
                    hidden: {},
                    visible: { transition: { staggerChildren: 0.1 } },
                  }}
                  className="mt-8 border-t border-[#DADCD3]"
                >
                  {journeyPoints.map((item) => (
                    <motion.div
                      key={item.number}
                      variants={journeyReveal}
                      className="group grid gap-3 border-b border-[#DADCD3] py-5 sm:grid-cols-[50px_1fr] sm:gap-5"
                    >
                      <span className="text-[11px] font-bold tracking-[0.16em] text-[#B98A3E]">
                        {item.number}
                      </span>
                      <div>
                        <h3 className="text-[15px] font-semibold text-[#12203B] transition-colors duration-300 group-hover:text-[#B98A3E]">
                          {item.title}
                        </h3>
                        <p className="mt-1.5 max-w-xl text-[13px] leading-6 text-[#6B7268]">
                          {item.text}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            SUPPORT STRIP
        ====================================================== */}

        <section className="bg-[#F7F6F2] px-5 py-14 sm:px-8 sm:py-16 lg:px-12">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="mx-auto grid max-w-7xl gap-7 border-y border-[#DADCD3] py-8 md:grid-cols-3 md:gap-9"
          >
            <motion.div variants={reveal} className="flex gap-3.5">
              <GraduationCap
                size={21}
                strokeWidth={1.7}
                className="mt-0.5 shrink-0 text-[#B98A3E]"
              />
              <div>
                <p className="text-[13px] font-semibold text-[#12203B]">
                  Learning first
                </p>
                <p className="mt-1.5 text-[13px] leading-6 text-[#6B7268]">
                  Keep your attention on the academic work that moves you
                  forward.
                </p>
              </div>
            </motion.div>

            <motion.div variants={reveal} className="flex gap-3.5">
              <BarChart3
                size={21}
                strokeWidth={1.7}
                className="mt-0.5 shrink-0 text-[#B98A3E]"
              />
              <div>
                <p className="text-[13px] font-semibold text-[#12203B]">
                  Progress you can see
                </p>
                <p className="mt-1.5 text-[13px] leading-6 text-[#6B7268]">
                  Useful academic information gives you a clearer view of your
                  next step.
                </p>
              </div>
            </motion.div>

            <motion.div variants={reveal} className="flex gap-3.5">
              <Users
                size={21}
                strokeWidth={1.7}
                className="mt-0.5 shrink-0 text-[#B98A3E]"
              />
              <div>
                <p className="text-[13px] font-semibold text-[#12203B]">
                  Support around you
                </p>
                <p className="mt-1.5 text-[13px] leading-6 text-[#6B7268]">
                  Your tech center and student community remain part of the
                  journey.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* =====================================================
            CLOSING CTA
        ====================================================== */}

        <section className="bg-[#12203B] px-5 py-16 sm:px-8 sm:py-18 lg:px-12 lg:py-20">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.1 } },
            }}
            className="mx-auto max-w-7xl"
          >
            <div className="max-w-3xl">
              <motion.div variants={reveal}>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#E8A33D]">
                  Keep moving forward
                </p>
              </motion.div>

              <motion.h2
                variants={reveal}
                className="mt-4 text-3xl font-semibold leading-[1.08] tracking-[-0.04em] text-white sm:text-4xl lg:text-[2.9rem]"
              >
                We support the journey.
                <br />
                <span className="text-[#E8A33D]">
                  You focus on the future.
                </span>
              </motion.h2>

              <motion.p
                variants={reveal}
                className="mt-5 max-w-2xl text-[15px] leading-7 text-white/60 sm:text-base"
              >
                Stay connected to your education, your community, and the
                people helping you move toward a brighter future.
              </motion.p>

              <motion.div variants={reveal} className="mt-7">
                <Link
                  href="/features"
                  className="group inline-flex h-12 items-center gap-2.5 rounded-xl bg-[#E8A33D] px-6 text-[13px] font-bold text-[#12203B] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#F2B359] hover:shadow-lg active:translate-y-0"
                >
                  Explore the portal
                  <ArrowRight
                    size={15}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </section>
      </main>

      <Footer />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultType={authModalType}
      />
    </div>
  );
}