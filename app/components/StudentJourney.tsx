"use client";

import { motion } from "framer-motion";
import {
  UserPlus,
  BookOpen,
  ClipboardCheck,
  Users,
  GraduationCap,
  Briefcase,
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
  return (
    <section className="relative py-20 bg-[#101826] overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(232,163,61,.06),transparent_45%)]" />

      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          <span className="inline-flex rounded-full border border-[#E8A33D]/20 bg-[#E8A33D]/10 px-4 py-1.5 text-xs tracking-[0.25em] uppercase text-[#F2C879]">
            Student Journey
          </span>

          <h2 className="mt-5 text-3xl md:text-5xl font-black text-white">
            From Enrollment
            <span className="block text-[#E8A33D]">
              To Graduation
            </span>
          </h2>

          <p className="mt-4 text-base text-gray-400 leading-7">
            Every stage of your learning journey is supported through one
            connected platform designed to help you succeed academically,
            collaborate with others, and confidently achieve your goals.
          </p>
        </motion.div>

        {/* Journey Timeline */}
        <div className="relative mt-14">
          {/* Timeline Line */}
          <div className="absolute left-8 top-0 hidden h-full w-px bg-gradient-to-b from-[#E8A33D] via-[#E8A33D]/40 to-transparent lg:block" />

          <div className="space-y-6">
            {journey.map((item, index) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    delay: index * 0.08,
                    duration: 0.4,
                  }}
                  className="relative flex gap-6"
                >
                  {/* Icon */}
                  <div className="hidden lg:flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-[#E8A33D]/30 bg-[#E8A33D]/10 text-[#E8A33D]">
                    <Icon size={24} />
                  </div>

                  {/* Card */}
                  <div className="flex-1 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-6 transition-all duration-300 hover:border-[#E8A33D]/40 hover:-translate-y-1">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E8A33D] font-bold text-black text-sm">
                        {index + 1}
                      </span>
                      <h3 className="text-lg font-bold text-white">
                        {item.title}
                      </h3>
                    </div>
                    <p className="mt-3 text-gray-400 leading-7 text-sm">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}