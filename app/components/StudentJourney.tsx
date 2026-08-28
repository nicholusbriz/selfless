"use client";

import { motion } from "framer-motion";
import {
  UserPlus,
  BookOpen,
  ClipboardCheck,
  Users,
  GraduationCap,
  Briefcase,
  ArrowRight,
} from "lucide-react";

const journey = [
  {
    title: "Join Your Tech Center",
    description:
      "Create your student account and become part of the Selfless learning community.",
    icon: UserPlus,
  },
  {
    title: "Register Your Courses",
    description:
      "Enroll in your courses and organize your semester with ease.",
    icon: BookOpen,
  },
  {
    title: "Track Academic Progress",
    description:
      "Monitor grades, assignments, attendance, and earned credits in real time.",
    icon: ClipboardCheck,
  },
  {
    title: "Collaborate & Learn",
    description:
      "Work together with classmates, tutors, and student leaders across Tech Centers.",
    icon: Users,
  },
  {
    title: "Graduate Successfully",
    description:
      "Complete your academic requirements and celebrate every milestone.",
    icon: GraduationCap,
  },
  {
    title: "Build Your Future",
    description:
      "Apply the skills you've gained to become self-reliant and positively impact your community.",
    icon: Briefcase,
  },
];

export default function StudentJourney() {
  const primaryColor = "#E8A33D";

  return (
    <section className="relative overflow-hidden bg-[#101826] py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.55 }}
          className="max-w-3xl"
        >
          <div className="mb-5 flex items-center gap-3">
            <span
              className="h-px w-10"
              style={{ backgroundColor: primaryColor }}
            />

            <span
              className="text-xs font-semibold uppercase tracking-[0.2em]"
              style={{ color: primaryColor }}
            >
              Your Student Journey
            </span>
          </div>

          <h2 className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
            From enrollment
            <span
              className="block"
              style={{ color: primaryColor }}
            >
              to your future.
            </span>
          </h2>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-[#9CA3AF] sm:text-base">
            Every stage of your learning journey is supported through one
            connected platform designed to help you progress academically,
            collaborate with others, and confidently achieve your goals.
          </p>
        </motion.div>

        {/* Journey */}
        <div className="relative mt-14">

          {/* Desktop timeline */}
          <div
            className="absolute bottom-8 left-[31px] top-8 hidden w-px lg:block"
            style={{ backgroundColor: "rgba(232, 163, 61, 0.22)" }}
          />

          <div className="space-y-3 sm:space-y-4">
            {journey.map((item, index) => {
              const Icon = item.icon;
              const number = String(index + 1).padStart(2, "0");

              return (
                <motion.div
                  key={item.title}
                  initial={{
                    opacity: 0,
                    y: 18,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  viewport={{
                    once: true,
                    amount: 0.15,
                  }}
                  transition={{
                    duration: 0.45,
                    delay: index * 0.06,
                  }}
                  className="group relative"
                >
                  <div className="flex gap-4 lg:gap-6">

                    {/* Timeline marker */}
                    <div className="relative z-10 flex w-16 shrink-0 justify-center">
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-full border bg-[#101826] transition-all duration-300 group-hover:scale-105"
                        style={{
                          borderColor: `${primaryColor}55`,
                        }}
                      >
                        <Icon
                          size={19}
                          strokeWidth={1.8}
                          style={{ color: primaryColor }}
                        />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex min-w-0 flex-1 items-start justify-between gap-5 border-b border-white/[0.08] pb-6 pt-1 sm:pb-7">
                      <div className="min-w-0">
                        <div className="flex items-center gap-3">
                          <span
                            className="text-xs font-bold tracking-[0.12em]"
                            style={{ color: primaryColor }}
                          >
                            {number}
                          </span>

                          <h3 className="text-base font-semibold text-white sm:text-lg">
                            {item.title}
                          </h3>
                        </div>

                        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#9CA3AF]">
                          {item.description}
                        </p>
                      </div>

                      {/* Desktop arrow */}
                      <div
                        className="mt-1 hidden shrink-0 items-center justify-center opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100 sm:flex"
                        style={{ color: primaryColor }}
                      >
                        <ArrowRight size={18} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Closing statement */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.5 }}
          className="mt-12 border-t border-white/[0.08] pt-7"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-white">
                Your journey starts here.
              </p>

              <p className="mt-1 text-xs leading-6 text-[#6B7280] sm:text-sm">
                Learn, connect, progress, graduate, and build your future.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: primaryColor }}
              />

              <span className="text-xs font-medium text-[#9CA3AF]">
                Six stages of student success
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

