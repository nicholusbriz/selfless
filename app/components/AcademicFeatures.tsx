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
      "Register and manage your semester courses with an organized and streamlined enrollment experience.",
    icon: BookOpen,
  },
  {
    title: "Assignments",
    description:
      "Keep track of upcoming assignments, submission deadlines, and completed coursework.",
    icon: ClipboardList,
  },
  {
    title: "Academic Progress",
    description:
      "Monitor grades, earned credits, GPA, and overall performance throughout your studies.",
    icon: GraduationCap,
  },
  {
    title: "Attendance",
    description:
      "View attendance records and remain informed about your participation status.",
    icon: CalendarCheck,
  },
  {
    title: "Announcements",
    description:
      "Receive important academic updates, notices, and communication from administrators.",
    icon: Bell,
  },
  {
    title: "Performance Analytics",
    description:
      "Understand your academic growth through easy-to-read reports and progress insights.",
    icon: BarChart3,
  },
];

export default function AcademicFeatures() {
  return (
    <section className="relative bg-[#0D1117] py-20 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(232,163,61,.06),transparent_45%)]" />

      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid lg:grid-cols-2 gap-12 items-center"
        >
          {/* Left Content */}
          <div>
            <span className="inline-flex rounded-full bg-[#E8A33D]/10 border border-[#E8A33D]/20 px-4 py-1.5 uppercase tracking-[0.25em] text-xs text-[#F2C879]">
              Academic Excellence
            </span>

            <h2 className="mt-5 text-3xl md:text-5xl font-black leading-tight text-white">
              Everything You Need
              <span className="block text-[#E8A33D]">
                To Stay Ahead
              </span>
            </h2>

            <p className="mt-4 text-gray-400 leading-7 text-base">
              Focus on learning while the portal keeps everything organized.
              From course registration to graduation tracking, every academic
              tool is available within one secure platform.
            </p>

            <div className="mt-7 flex items-center gap-3 text-[#E8A33D] font-semibold text-sm">
              Explore Academic Tools
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Right Content - Features Grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            {features.map((item, index) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    delay: index * 0.06,
                    duration: 0.4,
                  }}
                  className="group rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-5 transition-all duration-300 hover:-translate-y-1.5 hover:border-[#E8A33D]/40"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8A33D]/10 text-[#E8A33D]">
                    <Icon size={20} />
                  </div>

                  <h3 className="mt-4 text-base font-semibold text-white">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-gray-400 leading-6 text-sm">
                    {item.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}