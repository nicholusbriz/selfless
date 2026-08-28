"use client";

import { motion } from "framer-motion";
import {
  BookOpen,
  Calendar,
  Bell,
  CheckCircle2,
  BarChart3,
  Users,
  ArrowUpRight,
} from "lucide-react";

const widgets = [
  {
    title: "Courses",
    icon: BookOpen,
  },
  {
    title: "Assignments",
    icon: CheckCircle2,
  },
  {
    title: "Attendance",
    icon: Calendar,
  },
  {
    title: "Notifications",
    icon: Bell,
  },
];

const features = [
  {
    icon: Users,
    title: "Personal Dashboard",
    text: "Your own workspace with the academic information that matters most.",
  },
  {
    icon: BookOpen,
    title: "Real-Time Academic Records",
    text: "Quick access to your grades, credits, courses, and academic progress.",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    text: "Stay informed about announcements, reminders, and important updates.",
  },
  {
    icon: Calendar,
    title: "Daily Schedule",
    text: "Keep track of lectures, meetings, activities, and upcoming deadlines.",
  },
];

export default function DashboardPreview() {
  return (
    <section className="relative overflow-hidden bg-[#0D1117] py-14 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.4 }}
          className="mx-auto max-w-2xl text-center"
        >
          <div className="mb-4 flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-[#E8A33D]" />

            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#E8A33D]">
              Your Dashboard
            </span>

            <span className="h-px w-8 bg-[#E8A33D]" />
          </div>

          <h2 className="text-3xl font-bold leading-[1.1] tracking-tight text-white sm:text-4xl lg:text-[46px]">
            Everything at
            <span className="block text-[#E8A33D]">
              your fingertips.
            </span>
          </h2>

          <p className="mt-5 text-sm leading-6 text-slate-400 sm:text-base">
            Access your courses, assignments, attendance, notifications, and
            academic progress from one organized student dashboard.
          </p>
        </motion.div>

        {/* Main Content */}
        <div className="mt-10 grid items-center gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
          {/* Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, x: -18 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.45 }}
            className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#11161D]"
          >
            {/* Dashboard Header */}
            <div className="border-b border-white/[0.08] px-5 py-5 sm:px-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-medium text-slate-500">
                    Student Dashboard
                  </p>

                  <h3 className="mt-1 text-lg font-semibold tracking-tight text-white sm:text-xl">
                    Welcome back
                  </h3>

                  <p className="mt-1 text-xs text-slate-400">
                    Here&apos;s your academic overview.
                  </p>
                </div>

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#E8A33D]/20 bg-[#E8A33D]/[0.08] text-[#E8A33D]">
                  <BarChart3 size={19} strokeWidth={1.8} />
                </div>
              </div>
            </div>

            {/* Dashboard Body */}
            <div className="p-5 sm:p-6">
              {/* Quick Access */}
              <div className="grid grid-cols-2 gap-2.5">
                {widgets.map((item, index) => {
                  const Icon = item.icon;

                  return (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, y: 8 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 0.3,
                        delay: 0.08 + index * 0.04,
                      }}
                      className="group rounded-lg border border-white/[0.07] bg-[#0D141E] p-3.5 transition-colors duration-200 hover:border-[#E8A33D]/20 hover:bg-[#121A24]"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#E8A33D]/[0.08] text-[#E8A33D]">
                          <Icon size={16} strokeWidth={1.8} />
                        </div>

                        <ArrowUpRight
                          size={14}
                          className="text-slate-600 opacity-0 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#E8A33D] group-hover:opacity-100"
                        />
                      </div>

                      <h4 className="mt-3 text-xs font-semibold text-white">
                        {item.title}
                      </h4>
                    </motion.div>
                  );
                })}
              </div>

              {/* Academic Progress */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: 0.25 }}
                className="mt-3 rounded-lg border border-white/[0.07] bg-[#0D141E] p-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium text-slate-400">
                      Academic Progress
                    </p>

                    <p className="mt-1 text-[11px] text-slate-500">
                      Overall semester progress
                    </p>
                  </div>

                  <span className="text-sm font-semibold text-[#E8A33D]">
                    82%
                  </span>
                </div>

                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: "82%" }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.8,
                      delay: 0.35,
                      ease: "easeOut",
                    }}
                    className="h-full rounded-full bg-[#E8A33D]"
                  />
                </div>
              </motion.div>

              {/* Small dashboard footer */}
              <div className="mt-3 flex items-center justify-between border-t border-white/[0.06] pt-3">
                <span className="text-[11px] text-slate-500">
                  Last updated today
                </span>

                <span className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Up to date
                </span>
              </div>
            </div>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, x: 18 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.45 }}
          >
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Built around your studies
              </p>

              <h3 className="mt-2 text-xl font-semibold tracking-tight text-white sm:text-2xl">
                One place for your academic life.
              </h3>
            </div>

            <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#11161D]">
              {features.map((item, index) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className={`group flex gap-4 p-4 transition-colors duration-200 hover:bg-[#151B23] sm:p-5 ${
                      index !== features.length - 1
                        ? "border-b border-white/[0.07]"
                        : ""
                    }`}
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#E8A33D]/20 bg-[#E8A33D]/[0.08] text-[#E8A33D]">
                      <Icon size={17} strokeWidth={1.8} />
                    </div>

                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-white">
                        {item.title}
                      </h4>

                      <p className="mt-1 text-xs leading-5 text-slate-400 sm:text-[13px]">
                        {item.text}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}