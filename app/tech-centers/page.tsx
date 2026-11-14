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

const stagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
    },
  },
};

const INK = "#111827";

export default function TechCentersPage() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="min-h-screen bg-[#F7F6F2] text-[#111827]">
      <main className="relative overflow-x-hidden">
        {/* =====================================================
            SINGLE SECTION
        ====================================================== */}
        <section className="px-5 pb-16 pt-10 sm:px-8 sm:pb-20 sm:pt-14 lg:px-12 lg:pb-24">
          <div className="mx-auto w-full max-w-7xl">
            <motion.div
              initial={shouldReduceMotion ? false : "hidden"}
              animate="visible"
              variants={stagger}
            >
              <motion.div variants={slideInLeft}>
                <SectionLabel label="Tech Center Network" />
              </motion.div>

              <div className="mt-6 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-14">
                <motion.h1
                  variants={slideInLeft}
                  className="max-w-4xl text-5xl font-bold leading-[0.98] tracking-[-0.045em] sm:text-6xl lg:text-[4.6rem]"
                  style={{ color: INK }}
                >
                  One network.
                  <br />
                  Many places to learn.
                </motion.h1>

                <motion.div variants={slideInRight} className="max-w-xl lg:pb-2">
                  <p
                    className="text-base leading-7 sm:text-lg sm:leading-8"
                    style={{ color: "#111827" }}
                  >
                    Selfless unites all of its tech centers through one
                    student portal — a consistent digital experience for
                    learning, community, and support.
                  </p>

                  <div className="mt-6 flex flex-wrap items-center gap-x-7 gap-y-4">
                    <Link
                      href="/features"
                      className="group inline-flex items-center gap-2 text-sm font-bold transition-opacity hover:opacity-70"
                      style={{ color: INK }}
                    >
                      <span
                        className=""
                        
                      >
                        Explore features
                      </span>

                      <ArrowRight
                        size={16}
                        className="transition-transform duration-300 group-hover:translate-x-1"
                        style={{ color: INK }}
                      />
                    </Link>

                    <Link
                      href="/"
                      className="text-sm font-semibold transition-opacity hover:opacity-70"
                      style={{ color: "#111827" }}
                    >
                      Back to portal
                    </Link>
                  </div>
                </motion.div>
              </div>

              <motion.p
                variants={slideInLeft}
                className="mt-14 max-w-xl text-sm leading-7"
                style={{ color: "#111827" }}
              >
                Every tech center across the network shares the same portal —
                one place for students to learn, connect, and access support,
                wherever they are.
              </motion.p>
            </motion.div>
          </div>
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

      <p
        className="text-[10px] font-bold uppercase tracking-[0.22em]"
        style={{ color: INK }}
      >
        {label}
      </p>
    </div>
  );
}
