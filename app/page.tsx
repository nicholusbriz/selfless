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
    title: "Everything important, in one student portal.",
    description:
      "Your personal dashboard brings together the academic information, services, and support that matter most to your student journey.",
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
          HERO
          - One continuous full-bleed carousel image
          - Text remains readable through a soft overlay
        ====================================================== */}
        <section className="relative isolate min-h-screen overflow-hidden bg-[#0D1117]">
          {/* Hero background image (full bleed) */}
          <motion.div
            initial={{ scale: 1.04, opacity: 0 }}
            animate={
              isLoading ? { scale: 1.04, opacity: 0 } : { scale: 1, opacity: 1 }
            }
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            <Image
              key={heroImage.src}
              src={heroImage.src}
              alt={heroImage.alt}
              fill
              sizes="100vw"
              className="object-cover object-center"
            />
          </motion.div>

          {/* Base dark overlay */}
          <div className="absolute inset-0 bg-[#071018]/60" />

          {/* Soft readability gradient without dividing the image */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#071018]/75 via-[#071018]/35 to-[#071018]/15" />

          {/* Subtle bottom fade */}
          <div className="absolute inset-x-0 bottom-0 h-32 bg-[#0D1117]/70" />

          <div className="absolute bottom-8 left-5 z-20 flex items-center gap-2 sm:left-8 lg:left-12">
            <button
              type="button"
              onClick={showPreviousHeroImage}
              aria-label="Show previous hero image"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-[#071018]/65 text-white backdrop-blur-md transition hover:border-[#E8A33D] hover:text-[#E8A33D] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8A33D]"
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
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-[#071018]/65 text-white backdrop-blur-md transition hover:border-[#E8A33D] hover:text-[#E8A33D] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8A33D]"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* =====================================================
              HERO CONTENT — pinned to LEFT half on lg+
          ====================================================== */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate={isLoading ? "hidden" : "visible"}
            className="
              relative
              z-10
              mx-auto
              flex
              min-h-screen
              w-full
              max-w-7xl
              items-center
              px-5
              pb-28
              pt-36
              sm:px-8
              sm:pb-32
              sm:pt-40
              lg:px-12
              lg:pt-44
            "
          >
            <div className="w-full lg:w-1/2 lg:pr-12">
              <div className="max-w-2xl">
                <motion.div variants={reveal}>
                  <div className="mb-7 flex items-center gap-3">
                    <span className="h-px w-8 bg-[#E8A33D]" />
                    <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/75">
                      {heroImage.eyebrow}
                    </p>
                  </div>
                </motion.div>

                <motion.h1
                  key={`hero-title-${heroImage.src}`}
                  variants={reveal}
                  className="
                    max-w-xl
                    text-[2.6rem]
                    font-semibold
                    leading-[1.02]
                    tracking-[-0.045em]
                    text-white
                    sm:text-5xl
                    md:text-[3.4rem]
                    lg:text-[3.9rem]
                    xl:text-[4.4rem]
                  "
                >
                  {heroImage.title}
                </motion.h1>

                <motion.p
                  key={`hero-description-${heroImage.src}`}
                  variants={reveal}
                  className="
                    mt-7
                    max-w-xl
                    text-[15px]
                    font-medium
                    leading-7
                    text-white/[0.78]
                    sm:mt-8
                    sm:text-lg
                    sm:leading-8
                  "
                >
                  {heroImage.description}
                </motion.p>

                <motion.div
                  variants={reveal}
                  className="
                    mt-8
                    flex
                    flex-col
                    gap-3
                    sm:mt-9
                    sm:flex-row
                    sm:items-center
                  "
                >
                  <Link
                    href="/features"
                    className="
                      group
                      inline-flex
                      items-center
                      justify-center
                      gap-2.5
                      rounded-xl
                      bg-[#E8A33D]
                      px-5
                      py-3.5
                      text-[13px]
                      font-bold
                      tracking-wide
                      text-[#0D1117]
                      shadow-[0_10px_30px_rgba(0,0,0,0.18)]
                      transition-all
                      duration-300
                      hover:bg-[#F2B359]
                      hover:shadow-[0_14px_35px_rgba(0,0,0,0.25)]
                      active:scale-[0.98]
                    "
                  >
                    <span>Explore the portal</span>
                    <ArrowRight
                      size={16}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </Link>

                  <Link
                    href="/about"
                    className="
                      inline-flex
                      items-center
                      justify-center
                      rounded-xl
                      border
                      border-white/20
                      bg-white/[0.06]
                      px-5
                      py-3.5
                      text-[13px]
                      font-semibold
                      tracking-wide
                      text-white/90
                      backdrop-blur-md
                      transition-all
                      duration-300
                      hover:border-white/35
                      hover:bg-white/[0.11]
                      hover:text-white
                    "
                  >
                    Learn about SELFLESS CE
                  </Link>
                </motion.div>

                <motion.div
                  variants={reveal}
                  className="mt-4 flex flex-wrap items-center gap-3"
                >
                  {isAuthenticated ? (
                    <Link
                      href="/dashboard"
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E8A33D]/60 bg-[#E8A33D]/15 px-5 py-3 text-[13px] font-bold tracking-wide text-white transition-all duration-300 hover:bg-[#E8A33D]/25"
                    >
                      <LayoutDashboard size={16} />
                      Dashboard
                    </Link>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => openAuthModal("login")}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/[0.06] px-5 py-3 text-[13px] font-semibold tracking-wide text-white/90 backdrop-blur-md transition-all duration-300 hover:border-white/35 hover:bg-white/[0.11] hover:text-white"
                      >
                        Login
                      </button>
                      <button
                        type="button"
                        onClick={() => openAuthModal("register")}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#E8A33D] px-5 py-3 text-[13px] font-bold tracking-wide text-[#0D1117] transition-all duration-300 hover:bg-[#F2B359]"
                      >
                        Get Started
                        <ArrowRight size={16} />
                      </button>
                    </>
                  )}
                </motion.div>

                <motion.div
                  variants={reveal}
                  className="mt-9 max-w-xl border-l-2 border-[#E8A33D] pl-4"
                >
                  <p className="text-[12px] font-medium leading-6 text-white/[0.62] sm:text-[13px]">
                    We support the journey around your education, so you can
                    keep your attention on learning, growth, and a brighter
                    future.
                  </p>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* =====================================================
              MOBILE IMAGE (below lg only)
          ====================================================== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isLoading ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.35,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="relative z-10 mx-5 pb-28 sm:mx-8 lg:hidden"
          >
            <div className="relative h-[22rem] overflow-hidden rounded-2xl sm:h-[28rem]">
              <Image
                key={heroImage.src}
                src={heroImage.src}
                alt={heroImage.alt}
                fill
                sizes="(min-width: 640px) calc(100vw - 4rem), calc(100vw - 2.5rem)"
                className="object-cover object-center"
              />

              <div className="absolute inset-0 bg-[#071018]/15" />

              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#E8A33D]">
                  Student experience
                </p>

                <p className="mt-1.5 text-sm font-semibold leading-5 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
                  Learning, community, and support connected.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Mobile statement */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={isLoading ? { opacity: 0, y: 15 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.55 }}
            className="absolute inset-x-5 bottom-7 z-10 sm:inset-x-8 lg:hidden"
          >
            <div className="rounded-xl border border-white/10 bg-[#071018]/70 px-4 py-3 backdrop-blur-md">
              <p className="text-center text-[11px] font-semibold leading-5 text-white/70">
                We support the journey.
                <span className="text-[#E8A33D]">
                  {" "}
                  You focus on the future.
                </span>
              </p>
            </div>
          </motion.div>
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
                <p className="text-2xl font-bold text-white">7</p>
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
            - Image bare in its own column, diagonally clipped
            - Supporting text in the opposite column
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
              {/* IMAGE — bare, diagonally clipped */}
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

              {/* CONTENT — opposite column */}
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