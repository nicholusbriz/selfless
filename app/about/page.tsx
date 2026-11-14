"use client";

export const dynamic = 'force-dynamic';

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
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

const NAVY = "#111827";
const BRASS = "#111827";

export default function AboutPage() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="min-h-screen bg-[#F7F6F2] text-[#111827]">
      <main className="relative overflow-x-hidden">
        <div className="relative z-10">
          {/* =====================================================
              HERO
          ====================================================== */}
          <section className="flex min-h-[calc(100dvh-124px)] items-center px-5 pb-14 pt-10 sm:px-8 sm:pt-14 lg:px-12">
            <div className="mx-auto w-full max-w-7xl">
              <motion.div
                initial={shouldReduceMotion ? false : "hidden"}
                animate="visible"
                variants={stagger}
                className="max-w-6xl"
              >
                <motion.div variants={slideInLeft}>
                  <SectionLabel label="About Selfless Student Portal" />
                </motion.div>

                <div className="mt-6 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-14">
                  <motion.div variants={slideInLeft}>
                    <h1 className="max-w-5xl text-5xl font-bold leading-[0.98] tracking-[-0.045em] sm:text-6xl lg:text-[5.5rem]" style={{ color: NAVY }}>
                      A student portal built around the{" "}
                      <span style={{ color: BRASS }}>
                        whole journey
                      </span>
                      .
                    </h1>
                  </motion.div>

                  <motion.div
                    variants={slideInRight}
                    className="max-w-xl lg:pb-2"
                  >
                    <p className="text-base leading-7 sm:text-lg sm:leading-8" style={{ color: "#111827" }}>
                      Selfless Portal gives students one dependable place to
                      manage academic progress, stay connected to their tech
                      center, communicate with others, and find the support
                      and opportunities that help them move forward.
                    </p>

                    <div className="mt-6 flex flex-wrap items-center gap-x-7 gap-y-4">
                      <Link
                        href="/tech-centers"
                        className="group inline-flex items-center gap-2 text-sm font-bold transition-colors hover:opacity-80"
                        style={{ color: NAVY }}
                      >
                        <span
                          className=""
                          
                        >
                          View tech centers
                        </span>

                        <ArrowRight
                          size={16}
                          className="transition-transform duration-300 group-hover:translate-x-1"
                          style={{ color: BRASS }}
                        />
                      </Link>

                      <Link
                        href="/features"
                        className="text-sm font-semibold transition-colors hover:opacity-80"
                        style={{ color: "#111827" }}
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
      <span
        className="font-mono text-[10px] font-bold tracking-[0.16em]"
        style={{ color: BRASS }}
      >
        {number}
      </span>

      <div>
        <p
          className="text-[10px] font-bold uppercase tracking-[0.15em]"
          style={{ color: NAVY }}
        >
          {label}
        </p>
        <p className="mt-0.5 text-xs" style={{ color: "#111827" }}>
          {text}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   SECTION LABEL
========================================================= */

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">

      <p
        className="text-[10px] font-bold uppercase tracking-[0.22em]"
        style={{ color: BRASS }}
      >
        {label}
      </p>
    </div>
  );
}
