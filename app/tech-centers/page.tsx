"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  MapPin,
  Network,
  ShieldCheck,
  Users,
} from "lucide-react";
import Header2 from "@/app/components/ui/header-2";
import Footer from "@/app/components/Footer";

const centers = [
  { name: "Freedom City Tech Center", location: "Kampala" },
  { name: "Jinja Tech Center", location: "Jinja" },
  { name: "Lira Tech Center", location: "Northern Uganda" },
  { name: "Masaka Tech Center", location: "Central Uganda" },
  { name: "Mbale Tech Center", location: "Eastern Uganda" },
  { name: "Ntinda Tech Center", location: "Kampala" },
  { name: "Sseta Tech Center", location: "Central Region" },
];

const networkPoints = [
  {
    number: "01",
    icon: Network,
    title: "One connected system",
    description:
      "Every center operates within one digital environment for learning, communication, and support.",
  },
  {
    number: "02",
    icon: Users,
    title: "Local support, wider community",
    description:
      "Your center remains your local hub while the portal connects you to the broader SELFLESS CE community.",
  },
  {
    number: "03",
    icon: CheckCircle2,
    title: "A consistent experience",
    description:
      "The same portal experience everywhere—find information, stay connected, and manage your journey.",
  },
];

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

export default function TechCentersPage() {
  const shouldReduceMotion = useReducedMotion();

  const viewportAnimation = shouldReduceMotion
    ? {}
    : {
        initial: "hidden",
        whileInView: "visible",
        viewport: {
          once: true,
          amount: 0.1,
        },
      };

  return (
    <div className="min-h-screen bg-[#071018]">
      <Header2 />

      <main className="relative isolate overflow-hidden">
        {/* =====================================================
            FULL PAGE VIDEO BACKGROUND
        ====================================================== */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 -z-20 overflow-hidden"
        >
          <video
            autoPlay
            muted
            loop
            playsInline
            poster="/student-portal-image.png"
            className="h-full w-full object-cover"
          >
            <source src="/tech%20center.mp4" type="video/mp4" />
          </video>

          {/* Flat overlay — no gradients */}
          <div className="absolute inset-0 bg-[#071018]/55" />
        </div>

        {/* =====================================================
            HERO
        ====================================================== */}
        <section className="relative flex min-h-[72vh] items-end px-5 pb-14 pt-24 sm:px-8 sm:pb-16 sm:pt-28 lg:min-h-[76vh] lg:px-12 lg:pb-20 lg:pt-32">
          <div className="mx-auto w-full max-w-7xl">
            <motion.div
              initial={shouldReduceMotion ? false : "hidden"}
              animate="visible"
              variants={stagger}
              className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end"
            >
              <div className="max-w-4xl">
                <motion.div
                  variants={slideInLeft}
                  className="flex items-center gap-3"
                >
                  <span className="h-px w-9 bg-[#E8A33D] drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]" />

                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#E8A33D] drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)]">
                    Tech Center Network
                  </p>
                </motion.div>

                <motion.h1
                  variants={slideInLeft}
                  className="mt-5 text-4xl font-bold leading-[0.94] tracking-[-0.045em] text-white drop-shadow-[0_2px_14px_rgba(0,0,0,0.75)] sm:text-6xl lg:text-[5.2rem]"
                >
                  One{" "}
                  <span className="text-[#E8A33D] drop-shadow-[0_2px_14px_rgba(0,0,0,0.85)]">
                    network
                  </span>
                  .
                  <br />
                  <span className="text-[#E8A33D] drop-shadow-[0_2px_14px_rgba(0,0,0,0.85)]">
                    Many places to learn.
                  </span>
                </motion.h1>

                <motion.p
                  variants={slideInLeft}
                  className="mt-5 max-w-2xl text-base leading-7 text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.85)] sm:text-lg sm:leading-8"
                >
                  SELFLESS CE unites its tech centers through one student
                  portal—a consistent digital experience for learning,
                  community, and support.
                </motion.p>

                <motion.div
                  variants={slideInLeft}
                  className="mt-6 flex flex-wrap items-center gap-5"
                >
                  <Link
                    href="/features"
                    className="group inline-flex items-center gap-2.5 rounded-full bg-[#E8A33D] px-5 py-3 text-sm font-bold text-[#12203B] transition-all hover:bg-[#F2B359] active:scale-[0.98]"
                  >
                    Explore features

                    <ArrowRight
                      size={16}
                      strokeWidth={2.5}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </Link>

                  <Link
                    href="/"
                    className="text-sm font-semibold text-white/90 drop-shadow-[0_1px_6px_rgba(0,0,0,0.85)] transition-colors hover:text-[#E8A33D]"
                  >
                    Back to portal
                  </Link>
                </motion.div>
              </div>

              {/* Hero metrics */}
              <motion.div
                variants={slideInRight}
                className="hidden lg:block"
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#E8A33D] drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)]">
                  Across the network
                </p>

                <div className="mt-5 grid grid-cols-2 gap-x-8 gap-y-5">
                  <HeroMetric
                    value={String(centers.length)}
                    label="Tech centers"
                  />
                  <HeroMetric value="01" label="Connected portal" />
                  <HeroMetric value="24/7" label="Digital access" />
                  <HeroMetric value="01" label="Student community" />
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* =====================================================
            NETWORK INTRO + THREE BENEFITS
        ====================================================== */}
        <section className="relative px-5 py-14 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
          <motion.div
            {...viewportAnimation}
            variants={stagger}
            className="mx-auto max-w-7xl"
          >
            {/* Intro */}
            <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end lg:gap-14">
              <motion.div variants={slideInLeft}>
                <SectionLabel label="The network" />

                <h2 className="mt-4 max-w-2xl text-3xl font-bold leading-[1.02] tracking-[-0.04em] text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.75)] sm:text-4xl lg:text-[3.2rem]">
                  Different{" "}
                  <span className="text-[#E8A33D] drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]">
                    locations
                  </span>
                  .
                  <br />
                  <span className="text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.75)]">
                    One experience.
                  </span>
                </h2>
              </motion.div>

              <motion.p
                variants={slideInRight}
                className="max-w-2xl text-sm leading-7 text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.85)] sm:text-base sm:leading-8"
              >
                Local spaces provide support and learning while the portal
                extends that experience beyond the physical center. Students
                remain connected to their center and the wider SELFLESS CE
                community.
              </motion.p>
            </div>

            {/* Three columns — no borders */}
            <motion.div
              variants={staggerFast}
              className="mt-12 grid gap-10 md:grid-cols-3 md:gap-10 lg:gap-14"
            >
              {networkPoints.map(
                ({ number, icon: Icon, title, description }) => (
                  <motion.article
                    key={number}
                    variants={slideInUp}
                    className="group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold tracking-[0.2em] text-[#E8A33D] drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)]">
                        {number}
                      </span>

                      <Icon
                        size={19}
                        strokeWidth={1.7}
                        className="text-[#E8A33D] drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)]"
                      />
                    </div>

                    <h3 className="mt-5 text-lg font-bold tracking-[-0.02em] text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.85)]">
                      {title}
                    </h3>

                    <p className="mt-2.5 max-w-md text-sm leading-7 text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.8)]">
                      {description}
                    </p>
                  </motion.article>
                ),
              )}
            </motion.div>
          </motion.div>
        </section>

        {/* =====================================================
            CENTER DIRECTORY — no borders
        ====================================================== */}
        <section className="relative px-5 py-14 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
          <motion.div
            {...viewportAnimation}
            variants={stagger}
            className="mx-auto max-w-7xl"
          >
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <motion.div variants={slideInLeft}>
                <SectionLabel label="Our centers" />

                <h2 className="mt-4 text-3xl font-bold leading-[1.02] tracking-[-0.04em] text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.75)] sm:text-4xl lg:text-[3.2rem]">
                  Local{" "}
                  <span className="text-[#E8A33D] drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]">
                    centers
                  </span>
                  .
                  <br />
                  <span className="text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.75)]">
                    Connected by one platform.
                  </span>
                </h2>
              </motion.div>

              <motion.p
                variants={slideInRight}
                className="max-w-md text-sm leading-7 text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.85)] sm:text-right sm:text-base"
              >
                Each center provides a local connection while the portal keeps
                the wider student experience connected.
              </motion.p>
            </div>

            {/* Directory — free-floating rows, no borders */}
            <motion.div
              variants={staggerFast}
              className="mt-12 grid gap-8 sm:grid-cols-2 sm:gap-x-12 sm:gap-y-9 lg:grid-cols-3 lg:gap-x-14"
            >
              {centers.map((center, index) => (
                <motion.article
                  key={center.name}
                  variants={slideInUp}
                  className="group flex items-start gap-4"
                >
                  <span className="mt-1 font-mono text-[10px] font-bold tracking-[0.16em] text-[#E8A33D] drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)] transition-colors group-hover:text-white">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-[15px] font-bold leading-snug text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.85)] transition-colors group-hover:text-[#E8A33D] sm:text-base">
                      {center.name}
                    </h3>

                    <div className="mt-1.5 flex items-center gap-1.5 text-xs text-white drop-shadow-[0_1px_5px_rgba(0,0,0,0.8)] sm:text-[13px]">
                      <MapPin
                        size={12}
                        strokeWidth={1.8}
                        className="shrink-0 text-[#E8A33D]"
                      />

                      <span>{center.location}</span>
                    </div>
                  </div>

                  <ArrowRight
                    size={15}
                    className="mt-1 shrink-0 text-white/30 transition-all duration-300 group-hover:translate-x-1 group-hover:text-[#E8A33D]"
                  />
                </motion.article>
              ))}
            </motion.div>

            <motion.div
              variants={slideInLeft}
              className="mt-10 flex flex-wrap items-center justify-between gap-4"
            >
              <p className="text-xs font-medium text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.85)]">
                {centers.length} tech centers across the network
              </p>

              <div className="flex items-center gap-2 text-[#E8A33D]">
                <Building2
                  size={14}
                  strokeWidth={1.8}
                  className="shrink-0 drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)]"
                />

                <span className="text-xs font-bold drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)]">
                  More locations joining soon
                </span>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* =====================================================
            STUDENT BENEFITS — no borders
        ====================================================== */}
        <section className="relative px-5 py-14 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
          <motion.div
            {...viewportAnimation}
            variants={stagger}
            className="mx-auto max-w-7xl"
          >
            <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-end lg:gap-14">
              <motion.div variants={slideInLeft}>
                <SectionLabel label="For students" />

                <h2 className="mt-4 text-3xl font-bold leading-[1.02] tracking-[-0.04em] text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.75)] sm:text-4xl lg:text-[3.1rem]">
                  Your center is{" "}
                  <span className="text-[#E8A33D] drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]">
                    local
                  </span>
                  .
                  <br />
                  <span className="text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.75)]">
                    Your community is bigger.
                  </span>
                </h2>
              </motion.div>

              <motion.p
                variants={slideInRight}
                className="max-w-xl text-sm leading-7 text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.85)] sm:text-base sm:leading-8"
              >
                Your physical center gives you a local place to learn and
                connect. The portal helps that experience continue across the
                wider SELFLESS CE network.
              </motion.p>
            </div>

            {/* Three benefits — no borders, spaced */}
            <motion.div
              variants={staggerFast}
              className="mt-12 grid gap-10 md:grid-cols-3 md:gap-10 lg:gap-14"
            >
              <motion.div variants={slideInUp}>
                <NetworkBenefit
                  number="01"
                  icon={Users}
                  title="Connect beyond your center"
                  description="Build relationships with students from other centers and join a wider community."
                />
              </motion.div>

              <motion.div variants={slideInUp}>
                <NetworkBenefit
                  number="02"
                  icon={ShieldCheck}
                  title="Find support more easily"
                  description="Keep communication, academic help, and student services closer to your studies."
                />
              </motion.div>

              <motion.div variants={slideInUp}>
                <NetworkBenefit
                  number="03"
                  icon={Network}
                  title="Stay part of one system"
                  description="Your local center and the wider network stay connected through one platform."
                />
              </motion.div>
            </motion.div>
          </motion.div>
        </section>

        {/* =====================================================
            PORTAL ACCESS + CTA — no borders
        ====================================================== */}
        <section className="relative px-5 py-14 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
          <motion.div
            {...viewportAnimation}
            variants={stagger}
            className="mx-auto max-w-7xl"
          >
            <div className="grid gap-10 lg:grid-cols-[1.25fr_0.75fr] lg:items-center lg:gap-16">
              {/* Main CTA */}
              <motion.div variants={slideInLeft}>
                <SectionLabel label="Portal access" />

                <h2 className="mt-4 max-w-3xl text-3xl font-bold leading-[1.02] tracking-[-0.04em] text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.75)] sm:text-4xl lg:text-[3.3rem]">
                  Your connection continues{" "}
                  <span className="text-[#E8A33D] drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]">
                    beyond the tech center.
                  </span>
                </h2>

                <p className="mt-5 max-w-2xl text-sm leading-7 text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.85)] sm:text-base sm:leading-8">
                  Your experience doesn't stop when you leave. Check
                  academics, communication, opportunities, and services
                  whenever you need them.
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-5">
                  <Link
                    href="/features"
                    className="group inline-flex items-center gap-2.5 rounded-full bg-[#E8A33D] px-6 py-3.5 text-sm font-bold text-[#12203B] transition-all hover:bg-[#F2B359] active:scale-[0.98]"
                  >
                    Explore portal features

                    <ArrowRight
                      size={16}
                      strokeWidth={2.5}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </Link>

                  <Link
                    href="/"
                    className="text-sm font-semibold text-white/90 drop-shadow-[0_1px_6px_rgba(0,0,0,0.85)] transition-colors hover:text-[#E8A33D]"
                  >
                    Return to portal
                  </Link>
                </div>
              </motion.div>

              {/* Supporting info */}
              <motion.div variants={slideInRight}>
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#E8A33D]/15 backdrop-blur-sm">
                    <ShieldCheck
                      size={18}
                      strokeWidth={1.8}
                      className="text-[#E8A33D] drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)]"
                    />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.85)]">
                      Always within reach
                    </p>

                    <p className="mt-1 text-xs leading-5 text-white drop-shadow-[0_1px_5px_rgba(0,0,0,0.8)]">
                      Wherever your learning takes you, your student portal
                      stays connected to your experience.
                    </p>
                  </div>
                </div>

                <div className="mt-7 grid grid-cols-2 gap-5">
                  <div>
                    <p className="text-xl font-bold text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.85)]">
                      {centers.length}
                    </p>

                    <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#E8A33D] drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)]">
                      Centers
                    </p>
                  </div>

                  <div>
                    <p className="text-xl font-bold text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.85)]">
                      01
                    </p>

                    <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#E8A33D] drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)]">
                      Platform
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </section>
      </main>

      <Footer />
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

      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#E8A33D] drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)]">
        {label}
      </p>
    </div>
  );
}

/* =========================================================
   HERO METRIC
========================================================= */

function HeroMetric({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div>
      <p className="text-2xl font-bold tracking-[-0.03em] text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.85)]">
        {value}
      </p>

      <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.14em] text-[#E8A33D] drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)]">
        {label}
      </p>
    </div>
  );
}

/* =========================================================
   NETWORK BENEFIT
========================================================= */

function NetworkBenefit({
  number,
  icon: Icon,
  title,
  description,
}: {
  number: string;
  icon: typeof Users;
  title: string;
  description: string;
}) {
  return (
    <div className="group">
      <div className="flex items-center gap-3">
        <span className="font-mono text-[10px] font-bold tracking-[0.2em] text-[#E8A33D] drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)]">
          {number}
        </span>

        <span className="h-px w-6 bg-white/30 transition-all duration-500 group-hover:w-12 group-hover:bg-[#E8A33D]" />

        <Icon
          size={17}
          strokeWidth={1.8}
          className="text-[#E8A33D] drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)]"
        />
      </div>

      <h3 className="mt-5 text-lg font-bold tracking-[-0.02em] text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.85)]">
        {title}
      </h3>

      <p className="mt-2.5 max-w-md text-sm leading-7 text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.8)]">
        {description}
      </p>
    </div>
  );
}