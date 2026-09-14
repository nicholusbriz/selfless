"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  BellRing,
  BookOpen,
  Briefcase,
  CheckCircle2,
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
    role: "Students",
    description:
      "Follow your academic journey, stay informed, connect with others, and access available support and opportunities.",
  },
  {
    role: "Tutors & teachers",
    description:
      "Guide learners, provide academic support, and manage responsibilities connected to student learning.",
  },
  {
    role: "Administrators",
    description:
      "Coordinate students, people, communication, activities, tech centers, and day-to-day operations.",
  },
];

const animation = {
  hidden: {
    opacity: 0,
    y: 18,
  },
  visible: {
    opacity: 1,
    y: 0,
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
      staggerChildren: 0.08,
    },
  },
};

export default function FeaturesPage() {
  const shouldReduceMotion = useReducedMotion();

  const motionProps = shouldReduceMotion
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
          INTRODUCTION
      ====================================================== */}
      <section className="bg-[#F1F1EC] px-5 py-14 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
        <motion.div
          {...motionProps}
          variants={stagger}
          className="mx-auto max-w-7xl"
        >
          <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-center lg:gap-16">
            <motion.div variants={animation}>
              <SectionLabel label="One connected portal" />

              <h2 className="mt-4 max-w-xl text-3xl font-semibold leading-[1.08] tracking-[-0.04em] text-[#12203B] sm:text-4xl lg:text-[2.8rem]">
                Built around the way students actually learn.
              </h2>

              <p className="mt-5 max-w-lg text-[15px] leading-7 text-[#5F685F] sm:text-base sm:leading-8">
                SELFLESS CE brings the important parts of student life into
                one organized experience. Instead of moving between separate
                systems, students and support teams can work from the same
                connected portal.
              </p>

              <Link
                href="/about"
                className="group mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#55705B] transition-colors duration-300 hover:text-[#B98A3E]"
              >
                Learn about SELFLESS CE
                <ArrowRight
                  size={16}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>
            </motion.div>

            <motion.div
              variants={animation}
              className="border-y border-[#DADCD3]"
            >
              {[
                {
                  number: "01",
                  title: "Academic",
                  text: "Courses, grades, credits, progress, and tutoring.",
                },
                {
                  number: "02",
                  title: "Community",
                  text: "People, activities, support groups, and shared experiences.",
                },
                {
                  number: "03",
                  title: "Support",
                  text: "Communication, notifications, policies, and student services.",
                },
              ].map((item, index) => (
                <div
                  key={item.title}
                  className={`group flex gap-5 py-5 sm:gap-7 ${
                    index !== 0 ? "border-t border-[#DADCD3]" : ""
                  }`}
                >
                  <span className="pt-1 font-mono text-[10px] font-bold tracking-[0.16em] text-[#B98A3E]">
                    {item.number}
                  </span>

                  <div>
                    <h3 className="text-lg font-semibold tracking-[-0.015em] text-[#12203B]">
                      {item.title}
                    </h3>

                    <p className="mt-1.5 text-sm leading-6 text-[#697169]">
                      {item.text}
                    </p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* =====================================================
          CORE FEATURES
      ====================================================== */}
      <section className="relative isolate overflow-hidden bg-[#0D1117] px-5 py-14 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
        <div
          className="pointer-events-none absolute inset-0 -z-10 bg-cover bg-center opacity-30"
          style={{ backgroundImage: "url('/features.jpg')" }}
        />

        <div className="pointer-events-none absolute inset-0 -z-[5] bg-[#071018]/90" />

        <motion.div
          {...motionProps}
          variants={stagger}
          className="relative mx-auto max-w-7xl"
        >
          <motion.div
            variants={animation}
            className="flex flex-col justify-between gap-5 border-b border-white/15 pb-7 lg:flex-row lg:items-end lg:gap-10"
          >
            <div>
              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-[#E8A33D]" />

                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#E8A33D]">
                  Core features
                </p>
              </div>

              <h2 className="mt-4 max-w-2xl text-3xl font-semibold leading-[1.08] tracking-[-0.035em] text-white sm:text-4xl lg:text-[2.7rem]">
                Everything you need,
                <br className="hidden sm:block" />
                connected in one place.
              </h2>
            </div>

            <p className="max-w-md text-sm leading-7 text-white/65 lg:text-right">
              Each part of the portal has a clear purpose while remaining
              connected to the wider student experience.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            className="mt-8 divide-y divide-white/15 border-y border-white/15"
          >
            {portalAreas.map(
              ({ icon: Icon, number, title, description }) => (
                <motion.article
                  key={title}
                  variants={animation}
                  className="group grid gap-5 py-6 transition-colors duration-300 hover:bg-white/[0.045] sm:grid-cols-[76px_1fr_auto] sm:items-start sm:gap-8 sm:py-7"
                >
                  <div className="flex items-center gap-3 sm:block">
                    <span className="font-mono text-[10px] font-bold tracking-[0.16em] text-[#E8A33D]">
                      {number}
                    </span>

                    <Icon
                      size={19}
                      strokeWidth={1.8}
                      className="text-white/70 sm:mt-5"
                    />
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold tracking-[-0.015em] text-white sm:text-xl">
                      {title}
                    </h3>

                    <p className="mt-2 max-w-2xl text-sm leading-7 text-white/65 sm:text-[15px]">
                      {description}
                    </p>
                  </div>

                  <div className="hidden items-center gap-2 pt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white/35 transition-colors duration-300 group-hover:text-[#E8A33D] sm:flex">
                    Explore
                    <ArrowRight
                      size={13}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </div>
                </motion.article>
              )
            )}
          </motion.div>
        </motion.div>
      </section>

      {/* =====================================================
          ACADEMIC FEATURES
      ====================================================== */}
      <AcademicFeatures />

      {/* =====================================================
          COMMUNITY FEATURES
      ====================================================== */}
      <CommunityFeatures />

      {/* =====================================================
          ROLES
      ====================================================== */}
      <section className="bg-[#F7F6F2] px-5 py-14 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
        <motion.div
          {...motionProps}
          variants={stagger}
          className="mx-auto max-w-7xl"
        >
          <div className="grid gap-9 lg:grid-cols-[0.82fr_1.18fr] lg:items-center lg:gap-16">
            <motion.div variants={animation}>
              <SectionLabel label="Designed for the network" />

              <h2 className="mt-4 max-w-xl text-3xl font-semibold leading-[1.08] tracking-[-0.04em] text-[#12203B] sm:text-4xl lg:text-[2.7rem]">
                The experience changes with your responsibility.
              </h2>

              <p className="mt-4 max-w-xl text-[15px] leading-7 text-[#626B62] sm:text-base sm:leading-8">
                SELFLESS CE is not a one-size-fits-all system. Each role gets
                access to the information and tools needed to contribute
                effectively.
              </p>
            </motion.div>

            <motion.div
              variants={animation}
              className="border-y border-[#DADCD3]"
            >
              {roles.map((item, index) => (
                <div
                  key={item.role}
                  className={`group grid gap-4 py-5 sm:grid-cols-[150px_1fr] sm:gap-6 ${
                    index !== 0 ? "border-t border-[#DADCD3]" : ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2
                      size={17}
                      strokeWidth={1.8}
                      className="shrink-0 text-[#55705B]"
                    />

                    <span className="text-sm font-semibold text-[#12203B]">
                      {item.role}
                    </span>
                  </div>

                  <p className="text-sm leading-7 text-[#4F594F]">
                    {item.description}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* =====================================================
          SECURITY / OPERATIONS
      ====================================================== */}
      <section className="bg-white px-5 py-14 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
        <motion.div
          {...motionProps}
          variants={animation}
          className="mx-auto max-w-7xl"
        >
          <div className="overflow-hidden border border-[#DADCD3] bg-[#12203B] px-6 py-8 sm:px-9 sm:py-9 lg:px-12 lg:py-10">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-12">
              <div>
                <div className="flex items-center gap-3">
                  <ShieldCheck
                    size={17}
                    strokeWidth={1.8}
                    className="text-[#E8A33D]"
                  />

                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#E8A33D]">
                    Organized access
                  </p>
                </div>

                <h2 className="mt-4 max-w-3xl text-2xl font-semibold leading-[1.12] tracking-[-0.025em] text-white sm:text-3xl">
                  Clear access. Clear responsibilities. One connected
                  experience.
                </h2>

                <p className="mt-3.5 max-w-2xl text-sm leading-7 text-[#C5CBD1]">
                  Role-based access keeps information relevant while supporting
                  the different responsibilities of students, tutors, teachers,
                  and administrators.
                </p>

                <div className="mt-5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#E8A33D]">
                  <BellRing size={14} strokeWidth={1.8} />
                  Connected across the SELFLESS CE network
                </div>
              </div>

              <Link
                href="/tech-centers"
                className="group inline-flex w-fit items-center gap-2 border border-white/20 px-5 py-3 text-sm font-semibold text-white transition-all duration-300 hover:border-[#E8A33D] hover:text-[#E8A33D]"
              >
                Explore tech centers
                <ArrowRight
                  size={16}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* =====================================================
          FINAL CTA
      ====================================================== */}
      <section className="bg-[#F1F1EC] px-5 py-14 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
        <motion.div
          {...motionProps}
          variants={animation}
          className="mx-auto max-w-4xl text-center"
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#B98A3E]">
            Start with the portal
          </p>

          <h2 className="mt-3.5 text-3xl font-semibold leading-[1.08] tracking-[-0.04em] text-[#12203B] sm:text-4xl lg:text-[2.8rem]">
            A simpler way to stay connected to your education.
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-7 text-[#626B62] sm:text-base">
            Explore what SELFLESS CE offers and see how the portal brings your
            academic and student experience together.
          </p>

          <Link
            href="/about"
            className="group mt-7 inline-flex items-center gap-2 bg-[#12203B] px-6 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-[#55705B]"
          >
            Discover SELFLESS CE
            <ArrowRight
              size={17}
              className="transition-transform duration-300 group-hover:translate-x-1"
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

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-px w-8 bg-[#B98A3E]" />

      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#B98A3E]">
        {label}
      </p>
    </div>
  );
}