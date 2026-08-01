"use client";

import { motion } from "framer-motion";
import {
  BookOpen,
  GraduationCap,
  Users,
  CalendarDays,
  ArrowRight,
} from "lucide-react";

const features = [
  {
    title: "Academic Hub",
    description:
      "Manage your courses, assignments, academic progress, and earned credits from one personalized dashboard.",
    icon: BookOpen,
    stats: "Courses • Credits • Grades",
    color: "from-[#E8A33D]/20 to-transparent",
  },
  {
    title: "Student Community",
    description:
      "Collaborate with classmates, join study groups, communicate with tutors, and stay connected across Tech Centers.",
    icon: Users,
    stats: "Groups • Tutors • Chat",
    color: "from-[#0EA5E9]/20 to-transparent",
  },
  {
    title: "Campus Activities",
    description:
      "Never miss announcements, events, attendance updates, or daily responsibilities within your Tech Center.",
    icon: CalendarDays,
    stats: "Events • Attendance • Notices",
    color: "from-[#22C55E]/20 to-transparent",
  },
  {
    title: "Student Success",
    description:
      "Track milestones, receive tutor feedback, celebrate achievements, and stay focused on graduation.",
    icon: GraduationCap,
    stats: "Progress • Goals • Achievements",
    color: "from-[#A855F7]/20 to-transparent",
  },
];

export default function PortalOverview() {
  return (
    <section className="relative py-20 bg-[#0D1117] overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(232,163,61,.06),transparent_60%)]" />
      
      <div className="relative max-w-7xl mx-auto px-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          <span className="inline-flex rounded-full border border-[#E8A33D]/20 bg-[#E8A33D]/10 px-4 py-1.5 text-xs uppercase tracking-[0.25em] text-[#F2C879]">
            Everything In One Place
          </span>

          <h2 className="mt-6 text-3xl md:text-5xl font-black tracking-tight text-white">
            Designed Around
            <span className="block text-[#E8A33D]">
              Student Success
            </span>
          </h2>

          <p className="mt-5 text-base leading-7 text-gray-400 max-w-2xl mx-auto">
            The Selfless Student Self Service Portal provides every tool
            students need to stay organized, collaborate with others,
            monitor academic progress, and successfully complete their
            educational journey.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  delay: index * 0.12,
                  duration: 0.6,
                }}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl transition-all duration-500 hover:-translate-y-1.5 hover:border-[#E8A33D]/40"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.color}`}
                />

                <div className="relative p-7">
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E8A33D]/10 text-[#E8A33D]">
                      <Icon size={24} />
                    </div>
                    <ArrowRight
                      size={18}
                      className="text-gray-600 transition duration-300 group-hover:translate-x-1 group-hover:text-[#E8A33D]"
                    />
                  </div>

                  <h3 className="mt-5 text-xl font-bold text-white">
                    {feature.title}
                  </h3>

                  <p className="mt-3 leading-7 text-gray-400 text-sm">
                    {feature.description}
                  </p>

                  <div className="mt-5 inline-flex rounded-full bg-white/5 px-3.5 py-1.5 text-xs text-[#E8A33D] border border-white/10">
                    {feature.stats}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Banner - Reduced padding */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-16 rounded-2xl border border-[#E8A33D]/20 bg-gradient-to-r from-[#E8A33D]/10 via-white/5 to-[#E8A33D]/10 p-8"
        >
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <span className="text-[#F2C879] uppercase tracking-[0.25em] text-xs">
                Why Students Love It
              </span>

              <h3 className="mt-3 text-2xl md:text-3xl font-black text-white">
                One Login.
                <br />
                Every Student Service.
              </h3>

              <p className="mt-3 leading-7 text-gray-400 text-sm">
                Forget switching between multiple systems.
                Access your courses, academic records,
                announcements, schedules, tutor feedback,
                and student activities from one secure platform.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                "Course Registration",
                "Academic Progress",
                "Assignments",
                "Attendance",
                "Announcements",
                "Study Groups",
                "Tutor Feedback",
                "Achievements",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-xl border border-white/10 bg-white/5 p-3.5 text-center transition hover:border-[#E8A33D]/30 hover:bg-white/10"
                >
                  <p className="font-medium text-white text-sm">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}