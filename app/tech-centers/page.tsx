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

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 16,
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

const stagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
    },
  },
};

export default function TechCentersPage() {
  const shouldReduceMotion = useReducedMotion();

  const animationProps = shouldReduceMotion
    ? {}
    : {
        initial: "hidden",
        whileInView: "visible",
        viewport: {
          once: true,
          amount: 0.08,
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
            <source
              src="/tech%20center.mp4"
              type="video/mp4"
            />
          </video>

          {/* Light readability layer — video stays visible */}
          <div className="absolute inset-0 bg-[#071018]/45" />

          {/* Directional gradient — darkens top/bottom where text sits */}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,32,59,0.55)_0%,rgba(7,16,24,0.20)_45%,rgba(18,32,59,0.60)_100%)]" />
        </div>

        {/* =====================================================
            HERO
        ====================================================== */}
        <section className="relative flex min-h-[72vh] items-end px-5 pb-16 pt-24 sm:px-8 sm:pb-20 sm:pt-28 lg:min-h-[76vh] lg:px-12 lg:pb-24 lg:pt-32">
          <motion.div
            {...animationProps}
            variants={fadeUp}
            className="mx-auto w-full max-w-7xl"
          >
            <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
              <div className="max-w-4xl">
                <div className="flex items-center gap-3">
                  <span className="h-px w-9 bg-[#E8A33D] drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]" />

                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#E8A33D] drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)]">
                    Tech Center Network
                  </p>
                </div>

                <h1 className="mt-5 text-4xl font-bold leading-[0.94] tracking-[-0.045em] text-white drop-shadow-[0_2px_14px_rgba(0,0,0,0.75)] sm:text-6xl lg:text-[5.2rem]">
                  One <span className="text-[#E8A33D] drop-shadow-[0_2px_14px_rgba(0,0,0,0.85)]">network</span>.
                  <br />
                  <span className="text-[#E8A33D] drop-shadow-[0_2px_14px_rgba(0,0,0,0.85)]">
                    Many places to learn.
                  </span>
                </h1>

                <p className="mt-6 max-w-2xl text-base leading-7 text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.85)] sm:text-lg sm:leading-8">
                  SELFLESS CE unites its tech centers through one student
                  portal—a consistent digital experience for learning,
                  community, and support.
                </p>

                <div className="mt-7 flex flex-wrap items-center gap-5">
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
                </div>
              </div>

              {/* Compact hero information */}
              <div className="hidden lg:block">
                <div className="border-l border-white/25 pl-7">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#E8A33D] drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)]">
                    Across the network
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-x-8 gap-y-5">
                    <HeroMetric
                      value={String(centers.length)}
                      label="Tech centers"
                    />

                    <HeroMetric
                      value="01"
                      label="Connected portal"
                    />

                    <HeroMetric
                      value="24/7"
                      label="Digital access"
                    />

                    <HeroMetric
                      value="01"
                      label="Student community"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* =====================================================
            NETWORK INTRO + THREE BENEFITS
        ====================================================== */}
        <section className="relative border-t border-white/15 bg-[#071018]/55 px-5 py-20 backdrop-blur-[2px] sm:px-8 lg:px-12 lg:py-24">
          <motion.div
            {...animationProps}
            variants={stagger}
            className="mx-auto max-w-7xl"
          >
            {/* Intro */}
            <motion.div
              variants={fadeUp}
              className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end"
            >
              <div>
                <SectionLabel label="The network" />

                <h2 className="mt-4 max-w-2xl text-3xl font-bold leading-[1.02] tracking-[-0.04em] text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.75)] sm:text-4xl lg:text-[3.2rem]">
                  Different <span className="text-[#E8A33D] drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]">locations</span>.
                  <br />
                  <span className="text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.75)]">
                    One experience.
                  </span>
                </h2>
              </div>

              <p className="max-w-2xl text-sm leading-7 text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.85)] sm:text-base sm:leading-8">
                Local spaces provide support and learning while the portal
                extends that experience beyond the physical center. Students
                remain connected to their center and the wider SELFLESS CE
                community.
              </p>
            </motion.div>

            {/* Three columns */}
            <motion.div
              variants={stagger}
              className="mt-10 grid gap-px overflow-hidden border border-white/15 bg-white/10 md:grid-cols-3"
            >
              {networkPoints.map(
                ({ number, icon: Icon, title, description }) => (
                  <motion.article
                    key={number}
                    variants={fadeUp}
                    className="group bg-[#071018]/80 p-6 backdrop-blur-[2px] transition-colors duration-300 hover:bg-[#12203B]/90 sm:p-7"
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

                    <h3 className="mt-7 text-lg font-bold tracking-[-0.02em] text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.85)]">
                      {title}
                    </h3>

                    <p className="mt-2.5 text-sm leading-6 text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.8)]">
                      {description}
                    </p>
                  </motion.article>
                ),
              )}
            </motion.div>
          </motion.div>
        </section>

        {/* =====================================================
            CENTER DIRECTORY
        ====================================================== */}
        <section className="relative border-t border-white/15 bg-[#071018]/60 px-5 py-20 backdrop-blur-[2px] sm:px-8 lg:px-12 lg:py-24">
          <motion.div
            {...animationProps}
            variants={stagger}
            className="mx-auto max-w-7xl"
          >
            <motion.div
              variants={fadeUp}
              className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"
            >
              <div>
                <SectionLabel label="Our centers" />

                <h2 className="mt-4 text-3xl font-bold leading-[1.02] tracking-[-0.04em] text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.75)] sm:text-4xl lg:text-[3.2rem]">
                  Local <span className="text-[#E8A33D] drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]">centers</span>.
                  <br />
                  <span className="text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.75)]">
                    Connected by one platform.
                  </span>
                </h2>
              </div>

              <p className="max-w-md text-sm leading-7 text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.85)] sm:text-right sm:text-base">
                Each center provides a local connection while the portal keeps
                the wider student experience connected.
              </p>
            </motion.div>

            {/* Compact 3-column directory */}
            <motion.div
              variants={stagger}
              className="mt-10 grid gap-px overflow-hidden border border-white/15 bg-white/10 sm:grid-cols-2 lg:grid-cols-3"
            >
              {centers.map((center, index) => (
                <motion.article
                  key={center.name}
                  variants={fadeUp}
                  className="group flex min-h-[104px] items-center gap-4 bg-[#071018]/85 p-5 backdrop-blur-[2px] transition-colors duration-300 hover:bg-[#12203B]/95"
                >
                  <span className="font-mono text-[10px] font-bold tracking-[0.16em] text-[#E8A33D] drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)] transition-colors group-hover:text-white">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold leading-5 text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.85)] transition-colors group-hover:text-[#E8A33D] sm:text-[15px]">
                      {center.name}
                    </h3>

                    <div className="mt-1.5 flex items-center gap-1.5 text-xs text-white/90 drop-shadow-[0_1px_5px_rgba(0,0,0,0.8)]">
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
                    className="shrink-0 text-white/40 transition-all duration-300 group-hover:translate-x-1 group-hover:text-[#E8A33D]"
                  />
                </motion.article>
              ))}
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="mt-6 flex flex-wrap items-center justify-between gap-4"
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
            STUDENT BENEFITS
        ====================================================== */}
        <section className="relative border-t border-white/15 bg-[#12203B]/60 px-5 py-20 backdrop-blur-[2px] sm:px-8 lg:px-12 lg:py-24">
          <motion.div
            {...animationProps}
            variants={stagger}
            className="mx-auto max-w-7xl"
          >
            <motion.div
              variants={fadeUp}
              className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-end"
            >
              <div>
                <SectionLabel label="For students" />

                <h2 className="mt-4 text-3xl font-bold leading-[1.02] tracking-[-0.04em] text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.75)] sm:text-4xl lg:text-[3.1rem]">
                  Your center is <span className="text-[#E8A33D] drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]">local</span>.
                  <br />
                  <span className="text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.75)]">
                    Your community is bigger.
                  </span>
                </h2>
              </div>

              <p className="max-w-xl text-sm leading-7 text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.85)] sm:text-base sm:leading-8">
                Your physical center gives you a local place to learn and
                connect. The portal helps that experience continue across the
                wider SELFLESS CE network.
              </p>
            </motion.div>

            {/* Three horizontal benefits */}
            <motion.div
              variants={stagger}
              className="mt-10 grid gap-8 border-t border-white/15 pt-8 md:grid-cols-3 md:gap-6"
            >
              <NetworkBenefit
                number="01"
                icon={Users}
                title="Connect beyond your center"
                description="Build relationships with students from other centers and join a wider community."
              />

              <NetworkBenefit
                number="02"
                icon={ShieldCheck}
                title="Find support more easily"
                description="Keep communication, academic help, and student services closer to your studies."
              />

              <NetworkBenefit
                number="03"
                icon={Network}
                title="Stay part of one system"
                description="Your local center and the wider network stay connected through one platform."
              />
            </motion.div>
          </motion.div>
        </section>

        {/* =====================================================
            PORTAL ACCESS + CTA
        ====================================================== */}
        <section className="relative border-t border-white/15 bg-[#071018]/55 px-5 py-20 backdrop-blur-[2px] sm:px-8 lg:px-12 lg:py-24">
          <motion.div
            {...animationProps}
            variants={fadeUp}
            className="mx-auto max-w-7xl"
          >
            <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-center">
              {/* Main CTA */}
              <div>
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

                <div className="mt-7 flex flex-wrap items-center gap-5">
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
              </div>

              {/* Compact supporting information */}
              <div className="border-l border-white/25 pl-6 lg:pl-8">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-[#E8A33D]/40 bg-[#E8A33D]/15 backdrop-blur-sm">
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

                <div className="mt-7 grid grid-cols-2 gap-5 border-t border-white/15 pt-6">
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
              </div>
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
    <motion.article
      variants={fadeUp}
      className="group"
    >
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
    </motion.article>
  );
}