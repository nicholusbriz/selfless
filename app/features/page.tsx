"use client";

export const dynamic = 'force-dynamic';

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import Footer from "@/app/components/Footer";

const portalAreas = [
  {
    title: "Your dashboard",
    description:
      "See the information, updates, and actions that matter most to you in one focused student workspace.",
  },
  {
    title: "Academic progress",
    description:
      "Keep courses, credits, grades, GPA progress, and tutor feedback organized throughout your studies.",
  },
  {
    title: "Communication",
    description:
      "Stay informed through announcements, messages, notifications, policies, and student support.",
  },
  {
    title: "Student community",
    description:
      "Stay connected to your tech center while participating in the wider Selfless student community.",
  },
  {
    title: "Opportunities",
    description:
      "Discover internships, activities, learning programs, and other opportunities to develop beyond the classroom.",
  },
  {
    title: "Atbriz AI",
    description:
      "Get guided assistance when navigating the portal, understanding available information, and finding useful resources.",
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
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const slideInRight = {
  hidden: { opacity: 0, x: 28 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const slideInUp = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const staggerFast = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

const INK = "#111827";

export default function FeaturesPage() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="min-h-screen bg-[#F7F6F2] text-[#111827]">
      <main>
      {/* =====================================================
          SINGLE SECTION
      ====================================================== */}
      <section className="bg-[#F7F6F2] px-5 pb-16 pt-10 sm:px-8 sm:pb-20 sm:pt-14 lg:px-12 lg:pb-24">
        <motion.div
          initial={shouldReduceMotion ? false : "hidden"}
          animate="visible"
          variants={stagger}
          className="mx-auto w-full max-w-7xl"
        >
          <motion.div variants={slideInLeft}>
            <SectionLabel label="Features" />
          </motion.div>

          <div className="mt-6 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-14">
            <motion.h1
              variants={slideInLeft}
              className="max-w-4xl text-5xl font-bold leading-[0.98] tracking-[-0.045em] sm:text-6xl lg:text-[4.2rem]"
              style={{ color: INK }}
            >
              Everything around your student journey, connected.
            </motion.h1>

            <motion.div variants={slideInRight} className="max-w-xl lg:pb-2">
              <p
                className="text-base leading-7 sm:text-lg sm:leading-8"
                style={{ color: "#111827" }}
              >
                A single portal for learning, communication, community,
                opportunities, and student support.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-x-7 gap-y-4">
                <Link
                  href="/about"
                  className="group inline-flex items-center gap-2 text-sm font-bold transition-opacity hover:opacity-70"
                  style={{ color: INK }}
                >
                  <span
                    className=""
                    
                  >
                    Learn about Selfless
                  </span>

                  <ArrowRight
                    size={16}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                    style={{ color: INK }}
                  />
                </Link>

                <Link
                  href="/help"
                  className="text-sm font-semibold transition-opacity hover:opacity-70"
                  style={{ color: "#111827" }}
                >
                  Need help?
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Feature grid */}
          <motion.div
            variants={staggerFast}
            className="mt-14 grid gap-x-12 gap-y-10 sm:grid-cols-2 lg:grid-cols-3"
          >
            {portalAreas.map(({ title, description }) => (
              <motion.article
                key={title}
                variants={slideInUp}
                className="group"
              >

                <h3
                  className="mt-5 text-[17px] font-bold tracking-[-0.015em] sm:text-lg"
                  style={{ color: INK }}
                >
                  {title}
                </h3>
                <p
                  className="mt-2.5 max-w-xl text-[13px] leading-7 sm:text-sm"
                  style={{ color: "#111827" }}
                >
                  {description}
                </p>
              </motion.article>
            ))}
          </motion.div>
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

      <p
        className="text-[10px] font-bold uppercase tracking-[0.22em]"
        style={{ color: INK }}
      >
        {label}
      </p>
    </div>
  );
}
