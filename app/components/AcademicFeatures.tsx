"use client";

import { motion } from "framer-motion";
import {
  BookOpen,
  ClipboardList,
  GraduationCap,
  CalendarCheck,
  Bell,
  BarChart3,
  ArrowRight,
} from "lucide-react";

const features = [
  {
    title: "Course Registration",
    description:
      "Register and manage your semester courses through a simple, organized enrollment experience.",
    icon: BookOpen,
  },
  {
    title: "Assignments",
    description:
      "Keep track of coursework, submission deadlines, and completed assignments in one place.",
    icon: ClipboardList,
  },
  {
    title: "Academic Progress",
    description:
      "Monitor your grades, earned credits, GPA, and academic progress throughout your studies.",
    icon: GraduationCap,
  },
  {
    title: "Attendance",
    description:
      "Review your attendance records and stay informed about your participation status.",
    icon: CalendarCheck,
  },
  {
    title: "Announcements",
    description:
      "Stay updated with important academic notices and communication from administrators.",
    icon: Bell,
  },
  {
    title: "Performance Analytics",
    description:
      "Understand your academic growth through clear reports and meaningful progress insights.",
    icon: BarChart3,
  },
];

export default function AcademicFeatures() {
  return (
    <section className="relative overflow-hidden bg-[#0D1117] py-14 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="grid items-start gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
          {/* Intro */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.45 }}
            className="lg:sticky lg:top-24"
          >
            <div className="mb-4 flex items-center gap-3">
              <span className="h-px w-8 bg-[#E8A33D]" />
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#E8A33D]">
                Academic Tools
              </span>
            </div>

            <h2 className="max-w-xl text-3xl font-bold leading-[1.1] tracking-tight text-white sm:text-4xl lg:text-[46px]">
              Everything you need
              <span className="block text-[#E8A33D]">
                to stay ahead.
              </span>
            </h2>

            <p className="mt-5 max-w-lg text-sm leading-6 text-slate-400 sm:text-base">
              Focus on learning while your academic tools stay organized.
              Manage courses, assignments, attendance, progress, and important
              updates from one secure platform.
            </p>

            <div className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-[#E8A33D]">
              Explore academic tools
              <ArrowRight
                size={16}
                strokeWidth={1.8}
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </div>
          </motion.div>

          {/* Features */}
          <div className="grid gap-px overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.08] sm:grid-cols-2">
            {features.map((item, index) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{
                    duration: 0.35,
                    delay: index * 0.045,
                  }}
                  className="group bg-[#11161D] p-5 transition-colors duration-200 hover:bg-[#151B23] sm:p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#E8A33D]/20 bg-[#E8A33D]/[0.08] text-[#E8A33D]">
                      <Icon size={19} strokeWidth={1.8} />
                    </div>

                    <ArrowRight
                      size={15}
                      className="mt-1 text-slate-600 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-[#E8A33D] group-hover:opacity-100"
                    />
                  </div>

                  <h3 className="mt-5 text-sm font-semibold text-white sm:text-[15px]">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-xs leading-5 text-slate-400 sm:text-[13px]">
                    {item.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}