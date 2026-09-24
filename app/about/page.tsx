"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  MessageCircle,
  Users,
} from "lucide-react";
import Header2 from "@/app/components/ui/header-2";
import Footer from "@/app/components/Footer";

/* =========================================================
   SLIDE ANIMATIONS
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

const slideInRight = {
  hidden: { opacity: 0, x: 28 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.65,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

const slideInUp = {
  hidden: { opacity: 0, y: 22 },
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
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
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

const staggerFast = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

export default function AboutPage() {
  const shouldReduceMotion = useReducedMotion();

  const viewportAnimation = shouldReduceMotion
    ? {}
    : {
        initial: "hidden",
        whileInView: "visible",
        viewport: {
          once: true,
          amount: 0.12,
        },
      };

  return (
    <div className="min-h-screen bg-[#071018] text-white">
      <Header2 />

      <main className="relative overflow-x-hidden">
        {/* =====================================================
            PAGE VIDEO BACKGROUND
        ====================================================== */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
        >
          <video
            autoPlay
            muted
            loop
            playsInline
            poster="/student-portal-image.png"
            className="h-full w-full object-cover"
          >
            <source src="/about%20video.mp4" type="video/mp4" />
          </video>

          {/* Flat overlay — no gradients */}
          <div className="absolute inset-0 bg-[#071321]/60" />
        </div>

        <div className="relative z-10">
          {/* =====================================================
              HERO
          ====================================================== */}
          <section className="flex min-h-[calc(100vh-76px)] items-center px-5 pt-[140px] pb-14 sm:px-8 sm:pt-[150px] lg:px-12 lg:pt-[160px]">
            <div className="mx-auto w-full max-w-7xl">
              <motion.div
                initial={shouldReduceMotion ? false : "hidden"}
                animate="visible"
                variants={stagger}
                className="max-w-6xl"
              >
                <motion.div variants={slideInLeft}>
                  <SectionLabel label="About Selfless CE" />
                </motion.div>

                <div className="mt-6 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-14">
                  <motion.div variants={slideInLeft}>
                    <h1 className="max-w-5xl text-5xl font-bold leading-[0.98] tracking-[-0.045em] text-white drop-shadow-[0_2px_14px_rgba(0,0,0,0.75)] sm:text-6xl lg:text-[5.5rem]">
                      A student portal built around the{" "}
                      <span className="text-[#E8A33D] drop-shadow-[0_2px_14px_rgba(0,0,0,0.85)]">
                        whole journey
                      </span>
                      .
                    </h1>
                  </motion.div>

                  <motion.div
                    variants={slideInRight}
                    className="max-w-xl lg:pb-2"
                  >
                    <p className="text-base leading-7 text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.85)] sm:text-lg sm:leading-8">
                      Selfless CE Portal gives students one dependable place to
                      manage academic progress, stay connected to their tech
                      center, communicate with others, and find the support
                      and opportunities that help them move forward.
                    </p>

                    <div className="mt-6 flex flex-wrap items-center gap-x-7 gap-y-4">
                      <Link
                        href="/tech-centers"
                        className="group inline-flex items-center gap-2 text-sm font-bold text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.85)] transition-colors hover:text-[#E8A33D]"
                      >
                        <span className="border-b border-white/40 pb-1 group-hover:border-[#E8A33D]">
                          View tech centers
                        </span>

                        <ArrowRight
                          size={16}
                          className="transition-transform duration-300 group-hover:translate-x-1"
                        />
                      </Link>

                      <Link
                        href="/features"
                        className="text-sm font-semibold text-white/90 drop-shadow-[0_1px_6px_rgba(0,0,0,0.85)] transition-colors hover:text-[#E8A33D]"
                      >
                        Explore the portal
                      </Link>
                    </div>
                  </motion.div>
                </div>

                {/* Hero meta row */}
                <motion.div
                  variants={staggerFast}
                  className="mt-10 grid sm:grid-cols-3"
                >
                  <motion.div variants={slideInUp}>
                    <HeroMeta
                      number="01"
                      label="Learn"
                      text="Academic progress"
                    />
                  </motion.div>

                  <motion.div variants={slideInUp}>
                    <HeroMeta
                      number="02"
                      label="Connect"
                      text="People & community"
                    />
                  </motion.div>

                  <motion.div variants={slideInUp}>
                    <HeroMeta
                      number="03"
                      label="Progress"
                      text="Support & opportunity"
                    />
                  </motion.div>
                </motion.div>
              </motion.div>
            </div>
          </section>

          {/* =====================================================
              WHAT SELFLESS CE BRINGS TOGETHER
          ====================================================== */}
          <section className="relative px-5 py-14 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
            <motion.div
              {...viewportAnimation}
              variants={stagger}
              className="mx-auto max-w-7xl"
            >
              <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-end lg:gap-14">
                <motion.div variants={slideInLeft}>
                  <SectionLabel label="Built for student life" />

                  <h2 className="mt-4 max-w-xl text-3xl font-bold leading-[1.05] tracking-[-0.04em] text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.75)] sm:text-4xl lg:text-[3.2rem]">
                    One place to understand{" "}
                    <span className="text-[#E8A33D] drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]">
                      what comes next
                    </span>
                    .
                  </h2>
                </motion.div>

                <motion.div
                  variants={slideInRight}
                  className="max-w-3xl"
                >
                  <p className="text-base leading-7 text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.85)] sm:text-lg sm:leading-8">
                    Student life involves more than classes and grades. There
                    are people to connect with, activities to follow, support
                    to find, and important information to keep up with.
                  </p>

                  <p className="mt-3 text-base leading-7 text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.85)] sm:text-lg sm:leading-8">
                    Selfless CE brings these parts of the experience together
                    in one organized digital environment, helping students
                    spend less time searching for information and more time
                    moving forward.
                  </p>
                </motion.div>
              </div>

              {/* Experience row — no borders, spaced columns */}
              <motion.div
                variants={staggerFast}
                className="mt-12 grid gap-10 sm:grid-cols-3 sm:gap-10 lg:gap-14"
              >
                <motion.div variants={slideInUp}>
                  <ExperienceItem
                    number="01"
                    icon={<BookOpen size={18} />}
                    title="Learn"
                    text="Follow academic progress and stay focused on your studies."
                  />
                </motion.div>

                <motion.div variants={slideInUp}>
                  <ExperienceItem
                    number="02"
                    icon={<Users size={18} />}
                    title="Connect"
                    text="Stay connected with students, tutors, teachers, and your tech center."
                  />
                </motion.div>

                <motion.div variants={slideInUp}>
                  <ExperienceItem
                    number="03"
                    icon={<CheckCircle2 size={18} />}
                    title="Progress"
                    text="Find the support, information, and opportunities that help you move ahead."
                  />
                </motion.div>
              </motion.div>
            </motion.div>
          </section>

          {/* =====================================================
              PORTAL OVERVIEW
          ====================================================== */}
          <section className="relative px-5 py-14 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
            <motion.div
              {...viewportAnimation}
              variants={stagger}
              className="mx-auto max-w-7xl"
            >
              <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-center lg:gap-14">
                {/* Visual frame with video */}
                <motion.div variants={slideInLeft}>
                  <div className="relative overflow-hidden rounded-2xl bg-[#12203B]">
                    <div className="relative aspect-[16/10]">
                      <video
                        autoPlay
                        muted
                        loop
                        playsInline
                        poster="/student-portal-image.png"
                        className="h-full w-full object-cover"
                      >
                        <source src="/about%20video.mp4" type="video/mp4" />
                      </video>

                      <div className="absolute inset-0 bg-[#12203B]/15" />

                      {/* Bottom caption bar — flat overlay, no gradient */}
                      <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between bg-black/60 p-5 backdrop-blur-sm">
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-[#E8A33D] drop-shadow-[0_1px_6px_rgba(0,0,0,0.95)]">
                            Selfless CE
                          </p>
                          <p className="mt-1.5 text-base font-bold text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.9)]">
                            Student experience
                          </p>
                        </div>

                        <span className="rounded-full border border-[#E8A33D]/40 bg-[#071018]/70 px-3.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-[#E8A33D] backdrop-blur-sm drop-shadow-[0_1px_6px_rgba(0,0,0,0.95)]">
                          Connected
                        </span>
                      </div>

                      {/* Top-left accent tag */}
                      <div className="absolute left-5 top-5 flex items-center gap-2.5">
                        <span className="h-px w-6 bg-[#E8A33D] drop-shadow-[0_1px_4px_rgba(0,0,0,0.95)]" />
                        <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#E8A33D] drop-shadow-[0_1px_6px_rgba(0,0,0,0.95)]">
                          Inside the portal
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Content */}
                <motion.div variants={slideInRight}>
                  <SectionLabel label="What is the portal?" />

                  <h2 className="mt-4 max-w-3xl text-3xl font-bold leading-[1.05] tracking-[-0.04em] text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.75)] sm:text-4xl lg:text-[3.2rem]">
                    More than a{" "}
                    <span className="text-[#E8A33D] drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]">
                      dashboard
                    </span>
                    . A connected{" "}
                    <span className="text-[#E8A33D] drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]">
                      student experience
                    </span>
                    .
                  </h2>

                  <div className="mt-5 space-y-4 text-[15px] leading-7 tracking-[0.005em] text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.85)] sm:text-base sm:leading-8">
                    <p>
                      The Selfless CE Student Portal is a centralized digital
                      platform created to support students studying through the
                      Selfless CE network. It brings important parts of student
                      life into one organized environment.
                    </p>

                    <p>
                      Instead of moving between disconnected systems to check
                      academic information, communicate with others, find
                      support, or understand what is happening at your tech
                      center, students can use one portal designed around their
                      journey.
                    </p>
                  </div>

                  {/* Portal highlights */}
                  <div className="mt-6 grid grid-cols-3 gap-4">
                    <PortalHighlight value="One" label="Platform" />
                    <PortalHighlight value="One" label="Community" />
                    <PortalHighlight value="Your" label="Journey" />
                  </div>

                  <div className="mt-6 flex flex-wrap gap-x-7 gap-y-3">
                    <Link
                      href="/features"
                      className="group inline-flex items-center gap-2 text-sm font-bold text-[#E8A33D] drop-shadow-[0_1px_8px_rgba(0,0,0,0.85)] transition-colors hover:text-white"
                    >
                      See what's inside
                      <ArrowRight
                        size={15}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </Link>

                    <Link
                      href="/tech-centers"
                      className="group inline-flex items-center gap-2 text-sm font-bold text-[#E8A33D] drop-shadow-[0_1px_8px_rgba(0,0,0,0.85)] transition-colors hover:text-white"
                    >
                      Explore the network
                      <ArrowRight
                        size={15}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </Link>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </section>

          {/* =====================================================
              WHY IT EXISTS
          ====================================================== */}
          <section className="relative px-5 py-14 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
            <motion.div
              {...viewportAnimation}
              variants={stagger}
              className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-16"
            >
              <motion.div variants={slideInLeft}>
                <SectionLabel label="Why it exists" />

                <h2 className="mt-4 max-w-3xl text-3xl font-bold leading-[1.05] tracking-[-0.04em] text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.75)] sm:text-4xl lg:text-[3.2rem]">
                  Technology should give students more room to focus on their
                  <span className="text-[#E8A33D] drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]">
                    {" "}future
                  </span>
                  .
                </h2>

                <p className="mt-5 max-w-2xl text-base leading-7 text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.85)] sm:text-lg sm:leading-8">
                  Selfless CE brings the operational side of student support
                  together so students can spend less time figuring out where
                  information lives and more time learning, connecting, and
                  progressing toward their goals.
                </p>
              </motion.div>

              <motion.div variants={slideInRight}>
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#E8A33D] drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)]">
                  The goal
                </p>

                <p className="mt-4 max-w-md text-xl font-bold leading-8 text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)] sm:text-2xl">
                  "Learn with purpose. Stay connected. Build your future."
                </p>

                <Link
                  href="/tech-centers"
                  className="group mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#E8A33D] drop-shadow-[0_1px_8px_rgba(0,0,0,0.85)] transition-colors hover:text-white"
                >
                  Discover the tech-center network
                  <ArrowRight
                    size={15}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>
              </motion.div>
            </motion.div>
          </section>

          {/* =====================================================
              NEXT STEP
          ====================================================== */}
          <section className="relative px-5 py-10 sm:px-8 lg:px-12 lg:py-12">
            <motion.div
              {...viewportAnimation}
              variants={stagger}
              className="mx-auto grid max-w-7xl gap-5 sm:grid-cols-[1fr_auto] sm:items-center"
            >
              <motion.div variants={slideInLeft}>
                <p className="text-sm font-bold text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.85)]">
                  Your next step starts here.
                </p>

                <p className="mt-1 max-w-2xl text-sm leading-6 text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.85)]">
                  Learn what is available to students across the Selfless CE
                  network.
                </p>
              </motion.div>

              <motion.div variants={slideInRight}>
                <Link
                  href="/tech-centers"
                  className="group inline-flex items-center gap-2 text-sm font-bold text-[#E8A33D] drop-shadow-[0_1px_8px_rgba(0,0,0,0.85)] transition-colors hover:text-white"
                >
                  Meet the tech centers
                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>
              </motion.div>
            </motion.div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

/* =========================================================
   HERO META — no borders
========================================================= */

function HeroMeta({
  number,
  label,
  text,
}: {
  number: string;
  label: string;
  text: string;
}) {
  return (
    <div className="flex items-center gap-3 py-4">
      <span className="font-mono text-[10px] font-bold tracking-[0.16em] text-[#E8A33D] drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)]">
        {number}
      </span>

      <span className="h-px w-5 bg-white/40" />

      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)]">
          {label}
        </p>
        <p className="mt-0.5 text-xs text-white drop-shadow-[0_1px_5px_rgba(0,0,0,0.85)]">
          {text}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   EXPERIENCE ITEM — no borders, icon badge rounded
========================================================= */

function ExperienceItem({
  number,
  icon,
  title,
  text,
}: {
  number: string;
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="group">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/[0.08] text-[#E8A33D] drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)] backdrop-blur-sm transition-all duration-300 group-hover:bg-[#E8A33D]/20">
          {icon}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[9px] font-bold tracking-[0.15em] text-[#E8A33D] drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)]">
              {number}
            </span>

            <h3 className="text-[15px] font-bold text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.85)]">
              {title}
            </h3>
          </div>

          <p className="mt-2 text-sm leading-7 text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.85)]">
            {text}
          </p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   PORTAL HIGHLIGHT
========================================================= */

function PortalHighlight({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div>
      <p className="text-xl font-bold tracking-[-0.02em] text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.85)]">
        {value}
      </p>
      <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.18em] text-[#E8A33D] drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)]">
        {label}
      </p>
    </div>
  );
}

/* =========================================================
   SECTION LABEL
========================================================= */

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-px w-8 bg-[#E8A33D] drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]" />

      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#E8A33D] drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)]">
        {label}
      </p>
    </div>
  );
}