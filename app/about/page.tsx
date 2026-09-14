"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  BellRing,
  BookOpen,
  Building2,
  CheckCircle2,
  GraduationCap,
  MessageCircle,
  Network,
  Users,
  Workflow,
} from "lucide-react";
import PublicPageHero from "@/app/components/PublicPageHero";
import PublicPageShell from "@/app/components/PublicPageShell";

const portalAreas = [
  {
    icon: BookOpen,
    title: "Academic progress",
    description:
      "Keep track of courses, credits, grades, GPA progress, tutor feedback, and the academic steps ahead.",
  },
  {
    icon: MessageCircle,
    title: "Communication",
    description:
      "Stay informed through announcements, messages, notifications, policies, and student support channels.",
  },
  {
    icon: Users,
    title: "Student community",
    description:
      "Connect with students across Selfless CE tech centers, share experiences, collaborate, and build relationships.",
  },
  {
    icon: BarChart3,
    title: "Your student overview",
    description:
      "See your profile, academic information, activities, opportunities, and important updates from one dashboard.",
  },
];

const principles = [
  {
    icon: GraduationCap,
    title: "Student-first",
    description:
      "The experience is organized around what students need to learn, stay informed, receive support, and move forward.",
  },
  {
    icon: Network,
    title: "Connected network",
    description:
      "Students and staff remain connected across Selfless CE tech centers through one shared digital environment.",
  },
  {
    icon: Workflow,
    title: "One clear system",
    description:
      "Academic information, communication, activities, and support are brought together instead of being scattered across platforms.",
  },
];

const audiences = [
  {
    number: "01",
    title: "Students",
    description:
      "Students use the portal as their central digital space for academic progress, communication, activities, support, and connection.",
  },
  {
    number: "02",
    title: "Tech centers",
    description:
      "Each tech center can coordinate its students, staff, activities, and day-to-day student support within the wider Selfless CE network.",
  },
  {
    number: "03",
    title: "Tutors & teachers",
    description:
      "Tutors and teachers can stay connected to students, provide academic guidance, and support learning progress.",
  },
  {
    number: "04",
    title: "Administrators",
    description:
      "Administrators have the tools to coordinate users, activities, communication, and student services across the system.",
  },
];

const fadeUp = {
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

export default function AboutPage() {
  const shouldReduceMotion = useReducedMotion();

  const animationProps = shouldReduceMotion
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
          WHAT IS THE PORTAL?
      ====================================================== */}
      <section className="bg-[#F1F1EC] px-5 py-14 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
        <motion.div
          {...animationProps}
          variants={stagger}
          className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16"
        >
          {/* Image */}
          <motion.div variants={fadeUp} className="relative">
            <div className="relative overflow-hidden rounded-[1.35rem] border border-[#DADCD3] bg-white shadow-[0_16px_40px_rgba(18,32,59,0.07)]">
              <div className="relative aspect-[4/3]">
                <Image
                  src="/student-portal-image.png"
                  alt="Student using the Selfless CE student portal"
                  fill
                  priority
                  sizes="(min-width: 1024px) 43vw, 100vw"
                  className="object-cover"
                />
              </div>

              <div className="absolute inset-x-4 bottom-4 sm:inset-x-5 sm:bottom-5">
                <div className="border-l-2 border-[#B98A3E] bg-white/94 px-4 py-3 shadow-sm backdrop-blur-sm">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#B98A3E]">
                    Selfless CE Portal
                  </p>

                  <p className="mt-1 text-sm font-semibold text-[#12203B]">
                    One connected place for student life.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div variants={fadeUp} className="max-w-2xl">
            <SectionLabel
              label="What is the portal?"
              color="brass"
            />

            <h2 className="mt-4 text-3xl font-semibold leading-[1.08] tracking-[-0.035em] text-[#12203B] sm:text-4xl lg:text-[2.8rem]">
              More than a dashboard.
              <br />
              A connected student experience.
            </h2>

            <div className="mt-6 space-y-4 text-[15px] leading-7 text-[#4B564C] sm:text-base sm:leading-8">
              <p>
                The Selfless CE Student Portal is a centralized digital
                platform created to support students studying through the
                Selfless CE network. It brings the important parts of student
                life into one organized environment.
              </p>

              <p>
                Instead of moving between disconnected systems to check
                academic information, communicate with others, find support,
                or understand what is happening at your tech center, students
                can use one portal designed around their journey.
              </p>

              <p>
                Behind the scenes, Selfless CE and its tech centers can
                coordinate the people, activities, communication, and services
                that help students stay focused on their education and future.
              </p>
            </div>

            <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3">
              {[
                "Academic support",
                "Student connection",
                "Tech-center coordination",
                "Centralized information",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 text-sm font-medium text-[#55705B]"
                >
                  <CheckCircle2 size={16} strokeWidth={1.8} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* =====================================================
          HOW IT WORKS
      ====================================================== */}
      <section className="border-y border-[#DADCD3] bg-white px-5 py-14 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
        <motion.div
          {...animationProps}
          variants={stagger}
          className="mx-auto max-w-7xl"
        >
          <motion.div variants={fadeUp} className="max-w-2xl">
            <SectionLabel label="How it works" color="moss" />

            <h2 className="mt-4 text-3xl font-semibold leading-[1.08] tracking-[-0.035em] text-[#12203B] sm:text-4xl lg:text-[2.8rem]">
              One network. One connected experience.
            </h2>

            <p className="mt-4 max-w-xl text-[15px] leading-7 text-[#6B7268] sm:text-base sm:leading-8">
              The portal connects students with the people, information, and
              services around their education while giving each tech center
              the structure it needs to support its students.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            className="mt-9 grid border-y border-[#DADCD3] md:grid-cols-4"
          >
            {audiences.map((item, index) => (
              <motion.article
                key={item.number}
                variants={fadeUp}
                className={`group py-6 md:px-6 md:py-7 ${
                  index !== 0 ? "border-t border-[#DADCD3] md:border-l md:border-t-0" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-medium tracking-[0.15em] text-[#B98A3E]">
                    {item.number}
                  </span>

                  <ArrowRight
                    size={15}
                    strokeWidth={1.7}
                    className="text-[#B8BDB5] transition-transform duration-300 group-hover:translate-x-1 group-hover:text-[#B98A3E]"
                  />
                </div>

                <h3 className="mt-5 text-lg font-semibold tracking-[-0.015em] text-[#12203B]">
                  {item.title}
                </h3>

                <p className="mt-2.5 text-sm leading-7 text-[#626A62]">
                  {item.description}
                </p>
              </motion.article>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* =====================================================
          PORTAL AREAS
      ====================================================== */}
      <section className="bg-[#F1F1EC] px-5 py-14 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
        <motion.div
          {...animationProps}
          variants={stagger}
          className="mx-auto max-w-7xl"
        >
          <motion.div
            variants={fadeUp}
            className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end"
          >
            <div className="max-w-2xl">
              <SectionLabel
                label="Inside the portal"
                color="brass"
              />

              <h2 className="mt-4 text-3xl font-semibold leading-[1.08] tracking-[-0.035em] text-[#12203B] sm:text-4xl lg:text-[2.8rem]">
                The important parts of student life, brought together.
              </h2>
            </div>

            <p className="max-w-md text-sm leading-7 text-[#6B7268] lg:pb-1">
              The experience is designed to make important information easier
              to find and everyday student responsibilities easier to manage.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            className="mt-8 grid gap-px overflow-hidden border border-[#DADCD3] bg-[#DADCD3] md:grid-cols-2"
          >
            {portalAreas.map(({ icon: Icon, title, description }) => (
              <motion.article
                key={title}
                variants={fadeUp}
                className="group bg-white p-6 transition-colors duration-300 hover:bg-[#FBFAF7] sm:p-7 lg:p-8"
              >
                <div className="flex items-start justify-between gap-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-[#DADCD3] bg-[#F7F6F2]">
                    <Icon
                      size={19}
                      strokeWidth={1.8}
                      className="text-[#B98A3E]"
                    />
                  </div>

                  <span className="h-px w-10 bg-[#DADCD3] transition-all duration-500 group-hover:w-16 group-hover:bg-[#B98A3E]" />
                </div>

                <h3 className="mt-6 text-lg font-semibold tracking-[-0.015em] text-[#12203B]">
                  {title}
                </h3>

                <p className="mt-2.5 max-w-lg text-sm leading-7 text-[#5F685F]">
                  {description}
                </p>
              </motion.article>
            ))}
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <p className="text-sm text-[#6B7268]">
              Explore the full set of tools available through the portal.
            </p>

            <Link
              href="/features"
              className="group inline-flex items-center gap-2 text-sm font-bold text-[#55705B] transition-colors duration-300 hover:text-[#B98A3E]"
            >
              Explore portal features
              <ArrowRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* =====================================================
          PRINCIPLES
      ====================================================== */}
      <section className="border-y border-[#DADCD3] bg-white px-5 py-14 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
        <motion.div
          {...animationProps}
          variants={stagger}
          className="mx-auto max-w-7xl"
        >
          <motion.div
            variants={fadeUp}
            className="grid gap-7 lg:grid-cols-[0.75fr_1.25fr] lg:items-end"
          >
            <div>
              <SectionLabel
                label="Our principles"
                color="moss"
              />

              <h2 className="mt-4 text-3xl font-semibold leading-[1.08] tracking-[-0.035em] text-[#12203B] sm:text-4xl">
                Designed around people, not complexity.
              </h2>
            </div>

            <p className="max-w-2xl text-[15px] leading-7 text-[#6B7268] sm:text-base sm:leading-8">
              The technology should make student support clearer, not add
              another layer of complexity. These principles guide how the
              Selfless CE experience is organized.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            className="mt-9 grid border-y border-[#DADCD3] md:grid-cols-3"
          >
            {principles.map(
              ({ icon: Icon, title, description }, index) => (
                <motion.article
                  key={title}
                  variants={fadeUp}
                  className={`py-7 md:px-7 md:py-8 ${
                    index !== 0
                      ? "border-t border-[#DADCD3] md:border-l md:border-t-0"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center bg-[#F7F6F2]">
                      <Icon
                        size={18}
                        strokeWidth={1.8}
                        className="text-[#55705B]"
                      />
                    </div>

                    <span className="h-px w-6 bg-[#DADCD3]" />
                  </div>

                  <h3 className="mt-5 text-lg font-semibold text-[#12203B]">
                    {title}
                  </h3>

                  <p className="mt-2.5 text-sm leading-7 text-[#626A62]">
                    {description}
                  </p>
                </motion.article>
              )
            )}
          </motion.div>
        </motion.div>
      </section>

      {/* =====================================================
          WHY SELFLESS CE
      ====================================================== */}
      <section className="bg-[#12203B] px-5 py-14 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
        <motion.div
          {...animationProps}
          variants={fadeUp}
          className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16"
        >
          <div>
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-[#B98A3E]" />

              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#E8A33D]">
                Why it exists
              </p>
            </div>

            <h2 className="mt-4 max-w-2xl text-3xl font-semibold leading-[1.08] tracking-[-0.035em] text-white sm:text-4xl lg:text-[2.8rem]">
              Technology should give students more room to focus on their
              future.
            </h2>

            <p className="mt-5 max-w-2xl text-[15px] leading-7 text-white/70 sm:text-base sm:leading-8">
              Selfless CE brings the operational side of student support
              together so students can spend less time figuring out where
              information lives and more time learning, connecting, and
              progressing toward their goals.
            </p>
          </div>

          <div className="border-l border-white/15 pl-6 sm:pl-8">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#E8A33D]">
              The goal
            </p>

            <p className="mt-4 text-xl font-medium leading-8 text-white sm:text-2xl sm:leading-9">
              “Learn with purpose. Stay connected. Build your future.”
            </p>

            <Link
              href="/tech-centers"
              className="group mt-7 inline-flex items-center gap-2 text-sm font-bold text-white transition-colors duration-300 hover:text-[#E8A33D]"
            >
              Discover the tech-center network
              <ArrowRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* =====================================================
          NEXT STEP
      ====================================================== */}
      <section className="bg-[#F1F1EC] px-5 py-12 sm:px-8 sm:py-14 lg:px-12 lg:py-16">
        <motion.div
          {...animationProps}
          variants={fadeUp}
          className="mx-auto flex max-w-7xl flex-col gap-5 border-t border-[#DADCD3] pt-7 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <div className="flex items-center gap-2 text-[#55705B]">
              <BellRing size={17} strokeWidth={1.8} />

              <p className="text-sm font-semibold">
                Your next step starts here.
              </p>
            </div>

            <p className="mt-1.5 max-w-xl text-sm leading-6 text-[#6B7268]">
              Learn what is available to students across the Selfless CE
              network.
            </p>
          </div>

          <Link
            href="/tech-centers"
            className="group inline-flex items-center gap-2 self-start text-sm font-bold text-[#12203B] transition-colors duration-300 hover:text-[#B98A3E] sm:self-auto"
          >
            Meet the tech centers
            <ArrowRight
              size={16}
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

function SectionLabel({
  label,
  color,
}: {
  label: string;
  color: "brass" | "moss";
}) {
  const textColor =
    color === "brass" ? "text-[#B98A3E]" : "text-[#55705B]";

  const lineColor =
    color === "brass" ? "bg-[#B98A3E]" : "bg-[#55705B]";

  return (
    <div className="flex items-center gap-3">
      <span className={`h-px w-8 ${lineColor}`} />

      <p
        className={`text-[11px] font-bold uppercase tracking-[0.2em] ${textColor}`}
      >
        {label}
      </p>
    </div>
  );
}