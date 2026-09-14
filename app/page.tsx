"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import Header2 from "@/app/components/ui/header-2";
import Footer from "@/app/components/Footer";
import LoadingScreen from "@/app/components/LoadingScreen";
import AuthModal from "@/components/auth/AuthModal";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  MessageSquare,
  Network,
  Users,
  LayoutDashboard,
  Play,
  Building2,
} from "lucide-react";

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

const reveal: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const imageReveal: Variants = {
  hidden: { opacity: 0, scale: 1.035 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 1.15, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [heroImageIndex, setHeroImageIndex] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalType, setAuthModalType] = useState<"login" | "register">(
    "login"
  );
  const { isAuthenticated } = useAuth();

  const handleLoadingComplete = useCallback(() => {
    setIsLoading(false);
  }, []);

  const openAuthModal = (type: "login" | "register") => {
    setAuthModalType(type);
    setShowAuthModal(true);
  };

  const heroImage = heroImages[heroImageIndex];

  useEffect(() => {
    const interval = window.setInterval(() => {
      setHeroImageIndex((currentIndex) => (currentIndex + 1) % heroImages.length);
    }, 10000);

    return () => window.clearInterval(interval);
  }, []);

  const showPreviousHeroImage = () => {
    setHeroImageIndex(
      (currentIndex) =>
        (currentIndex - 1 + heroImages.length) % heroImages.length,
    );
  };

  const showNextHeroImage = () => {
    setHeroImageIndex((currentIndex) => (currentIndex + 1) % heroImages.length);
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
          HERO - RESPONSIVE SPLIT SCREEN
        ====================================================== */}
        <section className="relative isolate w-full overflow-hidden bg-[#12203B] lg:min-h-screen">
          
          {/* Mobile Layout: Flex Column */}
          <div className="flex flex-col lg:hidden">
            {/* Top: Image Section */}
            <div className="relative h-[45vh] min-h-[300px] w-full overflow-hidden">
              <motion.div
                key={heroImage.src}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                <Image
                  src={heroImage.src}
                  alt={heroImage.alt}
                  fill
                  sizes="100vw"
                  className="object-cover object-center"
                  priority
                />
              </motion.div>
              
              <div 
                className="absolute inset-x-0 bottom-0 h-16 pointer-events-none z-10"
                style={{
                  background: '#12203B',
                  clipPath: 'polygon(0 100%, 100% 0, 100% 100%, 0 100%)'
                }}
              />
              
              <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center items-center gap-2">
                <button
                  type="button"
                  onClick={showPreviousHeroImage}
                  aria-label="Show previous hero image"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-[#12203B]/65 text-white backdrop-blur-md transition hover:border-[#FFC107] hover:text-[#FFC107] focus:outline-none"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="px-2 text-[10px] font-semibold tracking-[0.16em] text-white/75">
                  {String(heroImageIndex + 1).padStart(2, "0")} / {String(heroImages.length).padStart(2, "0")}
                </span>
                <button
                  type="button"
                  onClick={showNextHeroImage}
                  aria-label="Show next hero image"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-[#12203B]/65 text-white backdrop-blur-md transition hover:border-[#FFC107] hover:text-[#FFC107] focus:outline-none"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Bottom: Content Section */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate={isLoading ? "hidden" : "visible"}
              className="relative z-20 flex-1 bg-[#12203B] px-6 pb-12 pt-2"
            >
              <div className="mx-auto max-w-md text-center">
                <motion.h1
                  key={`hero-title-mobile-${heroImage.src}`}
                  variants={reveal}
                  className="text-3xl font-light leading-[1.1] tracking-[-0.03em] text-white sm:text-4xl"
                >
                  {heroImage.title.split(' ').map((word, i) => (
                    <span key={i} className={i === 1 ? "italic underline decoration-[#FFC107] decoration-2 underline-offset-[6px]" : ""}>
                      {word}{' '}
                    </span>
                  ))}
                </motion.h1>

                <motion.p
                  key={`hero-description-mobile-${heroImage.src}`}
                  variants={reveal}
                  className="mt-5 text-[14px] font-medium leading-6 text-white/90"
                >
                  {heroImage.description}
                </motion.p>

                {/* Mobile CTA Links */}
                <motion.div
                  variants={reveal}
                  className="mt-8 flex flex-col gap-4"
                >
                  <Link
                    href="/features"
                    className="group inline-flex w-full items-center justify-center gap-2.5 rounded-md bg-[#FFC107] px-6 py-3.5 text-[15px] font-bold tracking-wide text-[#12203B] shadow-lg transition-all duration-300 hover:bg-[#FFD54F] active:scale-[0.98]"
                  >
                    <span>Explore Portal Features</span>
                  </Link>

                  <Link
                    href="/tech-centers"
                    className="group inline-flex w-full items-center justify-center gap-2.5 rounded-md border border-white/20 bg-white/5 px-6 py-3.5 text-[14px] font-bold tracking-wide text-white transition-all duration-300 hover:bg-white/10 active:scale-[0.98]"
                  >
                    <Building2 size={16} />
                    <span>View Tech Centers</span>
                  </Link>

                  <Link
                    href="/about"
                    className="group inline-flex w-full items-center justify-center gap-3 text-[14px] font-semibold text-white transition-colors hover:text-[#FFC107]"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FFC107] text-[#12203B] transition-transform group-hover:scale-110">
                      <Play size={12} fill="currentColor" />
                    </div>
                    <span>Why Choose SELFLESS CE?</span>
                  </Link>
                </motion.div>

                {/* Auth / Dashboard Buttons (Conditional) */}
                <motion.div
                  variants={reveal}
                  className="mt-10 border-t border-white/10 pt-6"
                >
                  {isAuthenticated ? (
                    <Link
                      href="/dashboard"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-white/20 bg-white/5 px-5 py-3.5 text-[14px] font-bold tracking-wide text-white transition-all duration-300 hover:bg-white/10"
                    >
                      <LayoutDashboard size={18} />
                      Go to Dashboard
                    </Link>
                  ) : (
                    <div className="flex flex-col items-center gap-3 text-center">
                      <button
                        type="button"
                        onClick={() => openAuthModal("login")}
                        className="text-[14px] font-semibold text-white/70 underline decoration-white/30 underline-offset-4 transition-colors hover:text-white hover:decoration-white"
                      >
                        Log in to your portal
                      </button>
                      <button
                        type="button"
                        onClick={() => openAuthModal("register")}
                        className="text-[14px] font-semibold text-[#FFC107] transition-colors hover:text-[#FFD54F]"
                      >
                        Create an account
                      </button>
                    </div>
                  )}
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Desktop Layout: Absolute Split */}
          <div className="hidden lg:block">
            {/* RIGHT SIDE: Rotating Images */}
            <div className="absolute inset-y-0 right-0 w-[55%] z-0">
              <motion.div
                key={heroImage.src}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                <Image
                  src={heroImage.src}
                  alt={heroImage.alt}
                  fill
                  sizes="(min-width: 1024px) 55vw, 100vw"
                  className="object-cover object-center"
                  priority
                />
              </motion.div>
              <div className="absolute inset-0 bg-[#12203B]/10 lg:bg-transparent" />
            </div>

            {/* DIAGONAL DIVIDER - Desktop Only */}
            <div 
              className="absolute inset-y-0 left-0 hidden lg:block w-[55%] z-10 pointer-events-none"
              style={{
                clipPath: 'polygon(0 0, 100% 0, 85% 100%, 0 100%)',
                background: '#12203B'
              }}
            />

            {/* LEFT SIDE: Content */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate={isLoading ? "hidden" : "visible"}
              className="relative z-20 mx-auto flex min-h-screen w-full max-w-7xl items-center px-12 pt-44"
            >
              <div className="w-[55%] pr-12">
                <div className="max-w-xl">
                  {/* Eyebrow / Tagline */}
                  <motion.div variants={reveal}>
                    <div className="mb-6 flex items-center gap-3">
                      <span className="h-px w-8 bg-[#E8A33D]" />
                      <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/70">
                        {heroImage.eyebrow}
                      </p>
                    </div>
                  </motion.div>

                  {/* Main Title with Underline */}
                  <motion.h1
                    key={`hero-title-${heroImage.src}`}
                    variants={reveal}
                    className="text-[3.8rem] font-light leading-[1.05] tracking-[-0.03em] text-white"
                  >
                    {heroImage.title.split(' ').map((word, i) => (
                      <span key={i} className={i === 1 ? "italic underline decoration-[#E8A33D] decoration-2 underline-offset-8" : ""}>
                        {word}{' '}
                      </span>
                    ))}
                  </motion.h1>

                  {/* Description */}
                  <motion.p
                    key={`hero-description-${heroImage.src}`}
                    variants={reveal}
                    className="mt-8 max-w-lg text-base font-medium leading-8 text-white/80"
                  >
                    {heroImage.description}
                  </motion.p>

                  {/* Desktop CTA Buttons - Redesigned for clarity */}
                  <motion.div
                    variants={reveal}
                    className="mt-10 flex flex-wrap items-center gap-4"
                  >
                    <Link
                      href="/features"
                      className="group inline-flex items-center justify-center gap-2.5 rounded-lg bg-[#FFC107] px-6 py-3.5 text-[14px] font-bold tracking-wide text-[#12203B] shadow-lg transition-all duration-300 hover:bg-[#FFD54F] hover:shadow-xl active:scale-[0.98]"
                    >
                      <span>Explore Portal Features</span>
                      <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                    </Link>

                    <Link
                      href="/tech-centers"
                      className="group inline-flex items-center justify-center gap-2.5 rounded-lg border border-white/20 bg-white/5 px-6 py-3.5 text-[14px] font-bold tracking-wide text-white backdrop-blur-md transition-all duration-300 hover:border-white/35 hover:bg-white/10 active:scale-[0.98]"
                    >
                      <Building2 size={16} />
                      <span>View Tech Centers</span>
                    </Link>
                  </motion.div>

                  {/* Secondary Text Links */}
                  <motion.div
                    variants={reveal}
                    className="mt-6 flex items-center gap-6"
                  >
                    <Link
                      href="/about"
                      className="group inline-flex items-center gap-2 text-[13px] font-semibold text-white/70 transition-colors hover:text-[#FFC107]"
                    >
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-[#FFC107] transition-colors group-hover:bg-[#FFC107] group-hover:text-[#12203B]">
                        <Play size={10} fill="currentColor" />
                      </div>
                      <span>Why Choose SELFLESS CE?</span>
                    </Link>
                  </motion.div>

                  {/* Auth / Dashboard Buttons (Conditional) - Redesigned */}
                  <motion.div
                    variants={reveal}
                    className="mt-10 border-t border-white/10 pt-8"
                  >
                    {isAuthenticated ? (
                      <Link
                        href="/dashboard"
                        className="inline-flex items-center justify-center gap-2.5 rounded-lg bg-[#E8A33D] px-8 py-3.5 text-[14px] font-bold tracking-wide text-[#12203B] shadow-lg transition-all duration-300 hover:bg-[#F2B359] hover:shadow-xl active:scale-[0.98]"
                      >
                        <LayoutDashboard size={18} />
                        Go to Your Dashboard
                      </Link>
                    ) : (
                      <div className="flex flex-wrap items-center gap-4">
                        <button
                          type="button"
                          onClick={() => openAuthModal("login")}
                          className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 px-6 py-3 text-[13px] font-bold tracking-wide text-white transition-all duration-300 hover:border-white/35 hover:bg-white/10 active:scale-[0.98]"
                        >
                          Log In to Portal
                        </button>
                        <button
                          type="button"
                          onClick={() => openAuthModal("register")}
                          className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#FFC107]/50 bg-[#FFC107]/10 px-6 py-3 text-[13px] font-bold tracking-wide text-[#FFC107] transition-all duration-300 hover:bg-[#FFC107]/20 active:scale-[0.98]"
                        >
                          Create an Account
                        </button>
                      </div>
                    )}
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Carousel Controls - Desktop */}
            <div className="absolute bottom-8 right-5 z-30 flex items-center gap-2 sm:right-8 lg:right-12">
              <button
                type="button"
                onClick={showPreviousHeroImage}
                aria-label="Show previous hero image"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-[#12203B]/65 text-white backdrop-blur-md transition hover:border-[#FFC107] hover:text-[#FFC107] focus:outline-none"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="px-2 text-[11px] font-semibold tracking-[0.16em] text-white/75">
                {String(heroImageIndex + 1).padStart(2, "0")} / {String(heroImages.length).padStart(2, "0")}
              </span>
              <button
                type="button"
                onClick={showNextHeroImage}
                aria-label="Show next hero image"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-[#12203B]/65 text-white backdrop-blur-md transition hover:border-[#FFC107] hover:text-[#FFC107] focus:outline-none"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </section>

        {/* =====================================================
            BRIGHT INTRODUCTION
        ====================================================== */}
        <section className="relative overflow-hidden bg-[#F1F1EC] px-5 py-20 sm:px-8 sm:py-28 lg:px-12 lg:py-32">
          <div className="mx-auto max-w-7xl">
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-end lg:gap-20"
            >
              <motion.div variants={reveal}>
                <div className="flex items-center gap-3">
                  <span className="h-px w-8 bg-[#B98A3E]" />
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#B98A3E]">
                    Built around your journey
                  </p>
                </div>

                <h2 className="mt-5 max-w-xl text-3xl font-semibold leading-tight tracking-[-0.035em] text-[#12203B] sm:text-4xl lg:text-5xl">
                  Everything important stays connected.
                </h2>
              </motion.div>

              <motion.p
                variants={reveal}
                className="max-w-2xl text-base leading-8 text-[#4B564C] sm:text-lg"
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
        <section className="relative isolate overflow-hidden border-y border-white/10 bg-[#0D1117] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
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

          <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-20">
            <div className="flex items-start gap-5">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-white/20 bg-white/10 shadow-sm sm:h-20 sm:w-20">
                <Image
                  src="/freedom.png"
                  alt="SELFLESS CE logo"
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#E8A33D]">
                  About the platform
                </p>
                <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-[-0.035em] text-white sm:text-4xl">
                  SELFLESS CE Student Portal
                </h2>
                <p className="mt-3 text-sm leading-7 text-white/70">
                  A centralized student self-service platform for learning,
                  connection, and support across the SELFLESS CE network.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="border-l-2 border-[#E8A33D] pl-4">
                <p className="text-2xl font-bold text-white">7+ll </p>
                <p className="mt-1 text-sm leading-6 text-white/65">
                  connected tech centers
                </p>
              </div>
              <div className="border-l-2 border-[#E8A33D] pl-4">
                <p className="text-2xl font-bold text-white">BYU-Idaho</p>
                <p className="mt-1 text-sm leading-6 text-white/65">
                  academic pathways supported
                </p>
              </div>
              <div className="border-l-2 border-[#E8A33D] pl-4">
                <p className="text-2xl font-bold text-white">One</p>
                <p className="mt-1 text-sm leading-6 text-white/65">
                  student community and support system
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            FEATURES
        ====================================================== */}
        <section className="bg-[#F1F1EC] px-5 pb-20 sm:px-8 sm:pb-28 lg:px-12 lg:pb-32">
          <div className="mx-auto max-w-7xl">
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.12 }}
              className="grid overflow-hidden rounded-[1.75rem] border border-[#DADCD3] bg-white shadow-[0_12px_40px_rgba(18,32,59,0.045)] sm:grid-cols-2 lg:grid-cols-4"
            >
              {features.map(({ icon: Icon, title, text }, index) => (
                <motion.div
                  key={title}
                  variants={reveal}
                  className={`
                    group
                    relative
                    p-6
                    transition-colors
                    duration-300
                    hover:bg-[#F7F6F2]
                    sm:p-7
                    lg:p-8
                    ${
                      index !== features.length - 1
                        ? "border-b border-[#DADCD3] sm:border-r"
                        : ""
                    }
                    ${index === 1 ? "lg:border-r" : ""}
                  `}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#DADCD3] bg-[#F7F6F2] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-[#B98A3E]/50">
                    <Icon
                      size={19}
                      strokeWidth={1.8}
                      className="text-[#B98A3E]"
                    />
                  </div>

                  <h3 className="mt-6 text-[17px] font-semibold tracking-[-0.01em] text-[#12203B]">
                    {title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-[#6B7268]">
                    {text}
                  </p>

                  <div className="mt-7 h-px w-0 bg-[#B98A3E] transition-all duration-500 group-hover:w-10" />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* =====================================================
            STUDENT JOURNEY
        ====================================================== */}
        <section className="overflow-hidden bg-white px-5 py-20 sm:px-8 sm:py-28 lg:px-12 lg:py-32">
          <div className="mx-auto max-w-7xl">
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              className="grid gap-14 lg:grid-cols-2 lg:items-center lg:gap-20"
            >
              <motion.div variants={imageReveal} className="relative">
                <div
                  className="relative h-[24rem] w-full overflow-hidden sm:h-[30rem] lg:h-[36rem]"
                  style={{
                    clipPath: "polygon(0 0, 100% 0, 88% 100%, 0 100%)",
                  }}
                >
                  <Image
                    key={`journey-${heroImage.src}`}
                    src={heroImage.src}
                    alt={heroImage.alt}
                    fill
                    sizes="(min-width: 1024px) 45vw, 100vw"
                    className="object-cover object-center transition-opacity duration-700"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-[#12203B]/80 via-[#12203B]/25 to-[#12203B]/10" />

                  <div className="absolute inset-x-6 top-6 z-10 max-w-xs sm:inset-x-8 sm:top-8">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#E8A33D]">
                      Your journey, in motion
                    </p>
                    <p className="mt-2 text-lg font-semibold leading-6 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] sm:text-xl">
                      Learning today. Opportunity tomorrow.
                    </p>
                  </div>

                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(96deg, transparent calc(50% - 1px), rgba(185,138,62,0.7) 50%, transparent calc(50% + 1px))",
                    }}
                  />
                </div>

                <div className="absolute bottom-6 left-6 flex items-center gap-3 sm:bottom-8 sm:left-8">
                  <CheckCircle2 size={18} className="shrink-0 text-[#E8A33D]" />

                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
                    Learning first
                  </p>
                </div>
              </motion.div>

              <div className="lg:pl-4">
                <motion.div variants={reveal}>
                  <div className="flex items-center gap-3">
                    <span className="h-px w-8 bg-[#B98A3E]" />
                    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#B98A3E]">
                      Your student journey
                    </p>
                  </div>

                  <h2 className="mt-5 max-w-xl text-3xl font-semibold leading-tight tracking-[-0.035em] text-[#12203B] sm:text-4xl lg:text-[3rem]">
                    Learning comes first. Support stays around you.
                  </h2>

                  <p className="mt-6 max-w-xl text-base leading-8 text-[#5D665D]">
                    SELFLESS CE is designed around the reality of student
                    life. Your education remains the focus while the
                    community, communication, and support around you stay
                    connected.
                  </p>
                </motion.div>

                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.15 }}
                  className="mt-10 border-t border-[#DADCD3]"
                >
                  {journeyPoints.map((item) => (
                    <motion.div
                      key={item.number}
                      variants={reveal}
                      className="group grid gap-4 border-b border-[#DADCD3] py-6 sm:grid-cols-[55px_1fr] sm:gap-5"
                    >
                      <span className="text-xs font-bold tracking-[0.16em] text-[#B98A3E]">
                        {item.number}
                      </span>

                      <div>
                        <h3 className="text-base font-semibold text-[#12203B] transition-colors duration-300 group-hover:text-[#B98A3E]">
                          {item.title}
                        </h3>

                        <p className="mt-2 max-w-xl text-sm leading-7 text-[#6B7268]">
                          {item.text}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* =====================================================
            PROGRESS / SUPPORT STRIP
        ====================================================== */}
        <section className="bg-[#F7F6F2] px-5 py-20 sm:px-8 sm:py-24 lg:px-12">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="mx-auto grid max-w-7xl gap-8 border-y border-[#DADCD3] py-10 md:grid-cols-3 md:gap-10"
          >
            <motion.div variants={reveal} className="flex gap-4">
              <GraduationCap
                size={23}
                strokeWidth={1.7}
                className="mt-0.5 shrink-0 text-[#B98A3E]"
              />
              <div>
                <p className="text-sm font-semibold text-[#12203B]">
                  Learning first
                </p>
                <p className="mt-2 text-sm leading-6 text-[#6B7268]">
                  Keep your attention on the academic work that moves you
                  forward.
                </p>
              </div>
            </motion.div>

            <motion.div variants={reveal} className="flex gap-4">
              <BarChart3
                size={23}
                strokeWidth={1.7}
                className="mt-0.5 shrink-0 text-[#B98A3E]"
              />
              <div>
                <p className="text-sm font-semibold text-[#12203B]">
                  Progress you can see
                </p>
                <p className="mt-2 text-sm leading-6 text-[#6B7268]">
                  Useful academic information gives you a clearer view of your
                  next step.
                </p>
              </div>
            </motion.div>

            <motion.div variants={reveal} className="flex gap-4">
              <Users
                size={23}
                strokeWidth={1.7}
                className="mt-0.5 shrink-0 text-[#B98A3E]"
              />
              <div>
                <p className="text-sm font-semibold text-[#12203B]">
                  Support around you
                </p>
                <p className="mt-2 text-sm leading-6 text-[#6B7268]">
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
        <section className="bg-[#12203B] px-5 py-20 sm:px-8 sm:py-24 lg:px-12 lg:py-28">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            className="mx-auto max-w-7xl"
          >
            <div className="max-w-3xl">
              <motion.div variants={reveal}>
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#E8A33D]">
                  Keep moving forward
                </p>
              </motion.div>

              <motion.h2
                variants={reveal}
                className="mt-5 text-3xl font-semibold leading-tight tracking-[-0.035em] text-white sm:text-4xl lg:text-5xl"
              >
                We support the journey.
                <br />
                <span className="text-[#E8A33D]">
                  You focus on the future.
                </span>
              </motion.h2>

              <motion.p
                variants={reveal}
                className="mt-6 max-w-2xl text-base leading-8 text-white/65 sm:text-lg"
              >
                Stay connected to your education, your community, and the
                people helping you move toward a brighter future.
              </motion.p>

              <motion.div variants={reveal} className="mt-8">
                <Link
                  href="/features"
                  className="
                    group
                    inline-flex
                    items-center
                    gap-2.5
                    rounded-xl
                    bg-[#E8A33D]
                    px-5
                    py-3.5
                    text-[13px]
                    font-bold
                    text-[#12203B]
                    transition-all
                    duration-300
                    hover:bg-[#F2B359]
                    active:scale-[0.98]
                  "
                >
                  Explore the portal
                  <ArrowRight
                    size={16}
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