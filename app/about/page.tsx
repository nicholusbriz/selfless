"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import PublicPageHero from "@/app/components/PublicPageHero";
import PublicPageShell from "@/app/components/PublicPageShell";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

export default function AboutPage() {
  const shouldReduceMotion = useReducedMotion();

  const animationProps = shouldReduceMotion
    ? {}
    : {
        initial: "hidden",
        whileInView: "visible",
        viewport: { once: true, amount: 0.12 },
      };

  return (
    <PublicPageShell>
      <PublicPageHero
        eyebrow="About Selfless CE"
        title="A student portal built around the whole journey."
        description="Selfless CE Portal gives students one dependable place to manage academic progress, stay connected to their tech center, communicate with others, and find the support and opportunities that help them move forward."
        backgroundVideo="/about video.mp4"
        backgroundPoster="/student-portal-image.png"
        actionHref="/tech-centers"
        actionLabel="View tech centers"
      />

      {/* =====================================================
          INTRODUCTION
      ====================================================== */}
      <section className="bg-[#F1F1EC] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-28">
        <motion.div
          {...animationProps}
          variants={stagger}
          className="mx-auto max-w-7xl"
        >
          <motion.div
            variants={fadeUp}
            className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-end lg:gap-20"
          >
            <div>
              <SectionLabel label="Built for student life" color="brass" />
              <h2 className="mt-5 max-w-xl text-3xl font-semibold leading-[1.05] tracking-[-0.04em] text-[#12203B] sm:text-4xl lg:text-[3rem]">
                One place to understand what comes next.
              </h2>
            </div>

            <div className="max-w-2xl">
              <p className="text-[15px] leading-7 text-[#4B564C] sm:text-base sm:leading-8">
                Student life involves more than classes and grades. There are
                people to connect with, activities to follow, support to find,
                and important information to keep up with.
              </p>
              <p className="mt-4 text-[15px] leading-7 text-[#6B7268] sm:text-base sm:leading-8">
                Selfless CE brings these parts of the experience together in
                one organized digital environment, helping students spend less
                time searching for information and more time moving forward.
              </p>
            </div>
          </motion.div>

          {/* Intro stats — no border box, breathing whitespace */}
          <motion.div
            variants={fadeIn}
            className="mt-16 grid gap-10 sm:grid-cols-3 sm:gap-8 lg:mt-24"
          >
            <IntroStat
              number="01"
              label="Learn"
              text="Follow academic progress and stay focused on your studies."
            />
            <IntroStat
              number="02"
              label="Connect"
              text="Stay connected with students, tutors, teachers, and your tech center."
            />
            <IntroStat
              number="03"
              label="Progress"
              text="Find the information, support, and opportunities that help you move ahead."
            />
          </motion.div>
        </motion.div>
      </section>

      {/* =====================================================
          WHAT IS THE PORTAL?
      ====================================================== */}
      <section className="bg-white px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-28">
        <motion.div
          {...animationProps}
          variants={stagger}
          className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-20"
        >
          <motion.div variants={fadeUp} className="relative">
            <div className="relative overflow-hidden rounded-2xl shadow-[0_30px_80px_-40px_rgba(18,32,59,0.45)]">
              <div className="relative aspect-[4/3]">
                <Image
                  src="/student-portal-image.png"
                  alt="Student using the Selfless CE student portal"
                  fill
                  priority
                  sizes="(min-width: 1024px) 45vw, 100vw"
                  className="object-cover"
                />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-[10px] font-medium uppercase tracking-[0.16em] text-[#8A9088]">
              <span>Student experience</span>
              <span>Selfless CE</span>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="max-w-2xl">
            <SectionLabel label="What is the portal?" color="brass" />
            <h2 className="mt-5 text-3xl font-semibold leading-[1.06] tracking-[-0.04em] text-[#12203B] sm:text-4xl lg:text-[2.8rem]">
              More than a dashboard.
              <br />A connected student experience.
            </h2>

            <div className="mt-7 space-y-4 text-[15px] leading-7 text-[#4B564C] sm:text-base sm:leading-8">
              <p>
                The Selfless CE Student Portal is a centralized digital
                platform created to support students studying through the
                Selfless CE network. It brings important parts of student life
                into one organized environment.
              </p>
              <p>
                Instead of moving between disconnected systems to check
                academic information, communicate with others, find support,
                or understand what is happening at your tech center, students
                can use one portal designed around their journey.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
              <Link
                href="/features"
                className="group inline-flex items-center gap-2 text-sm font-bold text-[#55705B] transition-colors hover:text-[#B98A3E]"
              >
                See what's inside the portal
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
              <Link
                href="/tech-centers"
                className="group inline-flex items-center gap-2 text-sm font-bold text-[#55705B] transition-colors hover:text-[#B98A3E]"
              >
                Explore the network
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* =====================================================
          WHY IT EXISTS (dark band)
      ====================================================== */}
      <section className="relative overflow-hidden bg-[#12203B] px-5 py-20 sm:px-8 sm:py-24 lg:px-12 lg:py-28">
        <div
          aria-hidden="true"
          className="absolute right-0 top-0 h-px w-1/3 bg-[#B98A3E]"
        />

        <motion.div
          {...animationProps}
          variants={fadeUp}
          className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-20"
        >
          <div>
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-[#B98A3E]" />
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#E8A33D]">
                Why it exists
              </p>
            </div>

            <h2 className="mt-5 max-w-2xl text-3xl font-semibold leading-[1.06] tracking-[-0.04em] text-white sm:text-4xl lg:text-[2.8rem]">
              Technology should give students more room to focus on their
              future.
            </h2>

            <p className="mt-6 max-w-2xl text-[15px] leading-7 text-white/70 sm:text-base sm:leading-8">
              Selfless CE brings the operational side of student support
              together so students can spend less time figuring out where
              information lives and more time learning, connecting, and
              progressing toward their goals.
            </p>
          </div>

          <div className="lg:border-l lg:border-white/15 lg:pl-10">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#E8A33D]">
              The goal
            </p>
            <p className="mt-5 text-xl font-medium leading-8 text-white sm:text-2xl sm:leading-9">
              “Learn with purpose. Stay connected. Build your future.”
            </p>

            <Link
              href="/tech-centers"
              className="group mt-8 inline-flex items-center gap-2 text-sm font-bold text-white transition-colors hover:text-[#E8A33D]"
            >
              Discover the tech-center network
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* =====================================================
          NEXT STEP
      ====================================================== */}
      <section className="bg-[#F1F1EC] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
        <motion.div
          {...animationProps}
          variants={fadeUp}
          className="mx-auto flex max-w-7xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="text-sm font-semibold text-[#55705B]">
              Your next step starts here.
            </p>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[#6B7268]">
              Learn what is available to students across the Selfless CE
              network.
            </p>
          </div>

          <Link
            href="/tech-centers"
            className="group inline-flex items-center gap-2 self-start text-sm font-bold text-[#12203B] transition-colors hover:text-[#B98A3E] sm:self-auto"
          >
            Meet the tech centers
            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </motion.div>
      </section>
    </PublicPageShell>
  );
}

/* =========================================================
   INTRO STAT
========================================================= */

function IntroStat({
  number,
  label,
  text,
}: {
  number: string;
  label: string;
  text: string;
}) {
  return (
    <div className="group">
      <div className="flex items-center gap-3">
        <span className="font-mono text-[10px] font-medium tracking-[0.16em] text-[#B98A3E]">
          {number}
        </span>
        <span className="h-px w-5 bg-[#DADCD3] transition-all duration-300 group-hover:w-10 group-hover:bg-[#B98A3E]" />
      </div>

      <h3 className="mt-5 text-base font-semibold text-[#12203B]">
        {label}
      </h3>
      <p className="mt-2 max-w-sm text-sm leading-6 text-[#6B7268]">{text}</p>
    </div>
  );
}

/* =========================================================
   SECTION LABEL
========================================================= */

function SectionLabel({
  label,
  color,
}: {
  label: string;
  color: "brass" | "moss";
}) {
  const textColor = color === "brass" ? "text-[#B98A3E]" : "text-[#55705B]";
  const lineColor = color === "brass" ? "bg-[#B98A3E]" : "bg-[#55705B]";

  return (
    <div className="flex items-center gap-3">
      <span className={`h-px w-8 ${lineColor}`} />
      <p
        className={`text-[10px] font-bold uppercase tracking-[0.2em] ${textColor}`}
      >
        {label}
      </p>
    </div>
  );
}