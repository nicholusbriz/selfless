"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  BellRing,
  BookOpen,
  Briefcase,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

import AcademicFeatures from "@/app/components/AcademicFeatures";
import CommunityFeatures from "@/app/components/CommunityFeatures";
import PublicPageHero from "@/app/components/PublicPageHero";
import PublicPageShell from "@/app/components/PublicPageShell";

const portalAreas = [
  {
    icon: BarChart3,
    number: "01",
    title: "Your dashboard",
    description:
      "See the information, updates, and actions that matter most to you in one focused student workspace.",
  },
  {
    icon: BookOpen,
    number: "02",
    title: "Academic progress",
    description:
      "Keep courses, credits, grades, GPA progress, and tutor feedback organized throughout your studies.",
  },
  {
    icon: MessageSquare,
    number: "03",
    title: "Communication",
    description:
      "Stay informed through announcements, messages, notifications, policies, and student support.",
  },
  {
    icon: Users,
    number: "04",
    title: "Student community",
    description:
      "Stay connected to your tech center while participating in the wider SELFLESS CE student community.",
  },
  {
    icon: Briefcase,
    number: "05",
    title: "Opportunities",
    description:
      "Discover internships, activities, learning programs, and other opportunities to develop beyond the classroom.",
  },
  {
    icon: Sparkles,
    number: "06",
    title: "Atbriz AI",
    description:
      "Get guided assistance when navigating the portal, understanding available information, and finding useful resources.",
  },
];

const roles = [
  {
    number: "01",
    role: "Students",
    description:
      "Follow your academic journey, stay informed, connect with others, and access available support and opportunities.",
  },
  {
    number: "02",
    role: "Tutors & teachers",
    description:
      "Guide learners, provide academic support, and manage responsibilities connected to student learning.",
  },
  {
    number: "03",
    role: "Administrators",
    description:
      "Coordinate students, people, communication, activities, tech centers, and day-to-day operations.",
  },
];

const animation = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.065 } },
};

export default function FeaturesPage() {
  const shouldReduceMotion = useReducedMotion();

  const motionProps = shouldReduceMotion
    ? {}
    : {
        initial: "hidden",
        whileInView: "visible",
        viewport: { once: true, amount: 0.1 },
      };

  return (
    <PublicPageShell>
      <PublicPageHero
        eyebrow="SELFLESS CE Portal"
        title="Everything around your student journey, connected."
        description="A single portal for learning, communication, community, opportunities, and student support."
        backgroundImage="/features.jpg"
        actionHref="/help"
        actionLabel="Need help?"
      />

      {/* =====================================================
          SHORT INTRO
      ====================================================== */}
      <section className="bg-[#F1F1EC] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
        <motion.div
          {...motionProps}
          variants={stagger}
          className="mx-auto max-w-7xl"
        >
          <motion.div
            variants={animation}
            className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-20"
          >
            <div>
              <SectionLabel label="One connected portal" />
              <h2 className="mt-5 max-w-xl text-[2rem] font-semibold leading-[1.08] tracking-[-0.04em] text-[#12203B] sm:text-4xl lg:text-[2.65rem]">
                Built around the way students actually learn.
              </h2>
            </div>

            <div className="max-w-xl">
              <p className="text-[14px] leading-7 text-[#5F685F] sm:text-[15px]">
                SELFLESS CE brings the important parts of student life into
                one organized experience. Instead of moving between separate
                systems, students and support teams work from the same
                connected portal.
              </p>

              <Link
                href="/about"
                className="group mt-6 inline-flex items-center gap-2 text-[13px] font-bold text-[#55705B] transition-colors hover:text-[#B98A3E]"
              >
                Learn about SELFLESS CE
                <ArrowRight
                  size={15}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* =====================================================
          CORE FEATURES (dark, image-backed)
      ====================================================== */}
      <section className="relative isolate overflow-hidden bg-[#0D1117] px-5 py-20 sm:px-8 sm:py-24 lg:px-12 lg:py-28">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-cover bg-center opacity-25"
          style={{ backgroundImage: "url('/features.jpg')" }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-[5] bg-[#071018]/90"
        />

        <motion.div
          {...motionProps}
          variants={stagger}
          className="relative mx-auto max-w-7xl"
        >
          <motion.div
            variants={animation}
            className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-12"
          >
            <div>
              <SectionLabel label="Core features" dark />
              <h2 className="mt-5 max-w-2xl text-[2rem] font-semibold leading-[1.08] tracking-[-0.04em] text-white sm:text-4xl lg:text-[2.65rem]">
                Everything you need,
                <br className="hidden sm:block" />
                connected in one place.
              </h2>
            </div>

            <p className="max-w-md text-[13px] leading-7 text-white/60 sm:text-sm lg:text-right">
              Each part of the portal has a clear purpose while remaining
              connected to the wider student experience.
            </p>
          </motion.div>

          {/* No divide-y, no borders — spacing + accent lines instead */}
          <div className="mt-14 grid gap-x-16 gap-y-12 lg:grid-cols-2 lg:gap-y-16">
            {portalAreas.map(({ icon: Icon, number, title, description }) => (
              <motion.article
                key={title}
                variants={animation}
                className="group relative"
              >
                <div className="flex items-center gap-4">
                  <Icon
                    size={18}
                    strokeWidth={1.8}
                    className="text-white/70 transition-colors duration-200 group-hover:text-[#E8A33D]"
                  />
                  <span className="font-mono text-[9px] font-bold tracking-[0.18em] text-[#E8A33D]">
                    {number}
                  </span>
                  <span className="h-px flex-1 bg-white/10 transition-colors duration-300 group-hover:bg-[#E8A33D]/40" />
                </div>

                <h3 className="mt-5 text-[17px] font-semibold tracking-[-0.015em] text-white sm:text-lg">
                  {title}
                </h3>
                <p className="mt-2 max-w-xl text-[13px] leading-7 text-white/60 sm:text-sm">
                  {description}
                </p>
              </motion.article>
            ))}
          </div>
        </motion.div>
      </section>

      {/* =====================================================
          ACADEMIC + COMMUNITY
      ====================================================== */}
      <AcademicFeatures />
      <CommunityFeatures />

      {/* =====================================================
          ROLES (no border wrapper)
      ====================================================== */}
      <section className="bg-[#F7F6F2] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
        <motion.div
          {...motionProps}
          variants={stagger}
          className="mx-auto max-w-7xl"
        >
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <motion.div variants={animation}>
              <SectionLabel label="Designed for the network" />
              <h2 className="mt-5 max-w-xl text-[2rem] font-semibold leading-[1.08] tracking-[-0.04em] text-[#12203B] sm:text-4xl lg:text-[2.6rem]">
                The experience changes with your responsibility.
              </h2>
              <p className="mt-5 max-w-md text-[14px] leading-7 text-[#626B62] sm:text-[15px]">
                SELFLESS CE is not a one-size-fits-all system. Each role gets
                access to the information and tools needed to contribute
                effectively.
              </p>
            </motion.div>

            <motion.div variants={animation} className="space-y-10">
              {roles.map((item) => (
                <div
                  key={item.role}
                  className="grid gap-3 sm:grid-cols-[180px_1fr] sm:gap-8"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[9px] font-bold tracking-[0.18em] text-[#B98A3E]">
                      {item.number}
                    </span>
                    <span className="h-px w-6 bg-[#DADCD3]" />
                    <span className="text-[13px] font-semibold text-[#12203B] sm:text-sm">
                      {item.role}
                    </span>
                  </div>
                  <p className="text-[13px] leading-7 text-[#4F594F] sm:text-sm">
                    {item.description}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* =====================================================
          ACCESS & ORGANIZATION
      ====================================================== */}
      <section className="bg-white px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
        <motion.div
          {...motionProps}
          variants={animation}
          className="mx-auto max-w-7xl"
        >
          <div className="rounded-2xl bg-[#12203B] px-7 py-10 sm:px-10 sm:py-12 lg:px-14 lg:py-14">
            <div className="grid gap-9 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-14">
              <div>
                <div className="flex items-center gap-2.5">
                  <ShieldCheck
                    size={17}
                    strokeWidth={1.8}
                    className="text-[#E8A33D]"
                  />
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#E8A33D]">
                    Organized access
                  </p>
                </div>

                <h2 className="mt-4 max-w-3xl text-[1.7rem] font-semibold leading-[1.12] tracking-[-0.03em] text-white sm:text-3xl">
                  Clear access. Clear responsibilities. One connected
                  experience.
                </h2>

                <p className="mt-4 max-w-2xl text-[13px] leading-7 text-white/60 sm:text-sm">
                  Role-based access keeps information relevant while supporting
                  the different responsibilities of students, tutors, teachers,
                  and administrators.
                </p>

                <div className="mt-5 flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.16em] text-[#E8A33D]">
                  <BellRing size={13} strokeWidth={1.8} />
                  <span>Connected across the SELFLESS CE network</span>
                </div>
              </div>

              <Link
                href="/tech-centers"
                className="group inline-flex w-fit items-center gap-2 rounded-lg border border-white/20 px-5 py-3 text-[13px] font-semibold text-white transition-all hover:border-[#E8A33D] hover:text-[#E8A33D]"
              >
                Explore tech centers
                <ArrowRight
                  size={15}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* =====================================================
          FINAL CTA
      ====================================================== */}
      <section className="bg-[#F1F1EC] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
        <motion.div
          {...motionProps}
          variants={animation}
          className="mx-auto max-w-4xl text-center"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B98A3E]">
            Start with the portal
          </p>
          <h2 className="mt-4 text-[2rem] font-semibold leading-[1.08] tracking-[-0.04em] text-[#12203B] sm:text-4xl lg:text-[2.7rem]">
            A simpler way to stay connected to your education.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[14px] leading-7 text-[#626B62] sm:text-[15px]">
            Explore what SELFLESS CE offers and see how the portal brings your
            academic and student experience together.
          </p>

          <Link
            href="/about"
            className="group mt-8 inline-flex items-center gap-2 rounded-lg bg-[#12203B] px-6 py-3 text-[13px] font-semibold text-white transition-all hover:bg-[#55705B]"
          >
            Discover SELFLESS CE
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
   SECTION LABEL
========================================================= */

function SectionLabel({
  label,
  dark = false,
}: {
  label: string;
  dark?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        aria-hidden="true"
        className={`h-px w-7 ${dark ? "bg-[#E8A33D]" : "bg-[#B98A3E]"}`}
      />
      <p
        className={`text-[10px] font-bold uppercase tracking-[0.2em] ${
          dark ? "text-[#E8A33D]" : "text-[#B98A3E]"
        }`}
      >
        {label}
      </p>
    </div>
  );
}