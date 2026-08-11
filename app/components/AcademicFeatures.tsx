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
  const primaryColor = '#E8A33D';
  
  return (
    <section className="relative bg-[#0D1117] py-16 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(232,163,61,.06),transparent_45%)]" />

      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid lg:grid-cols-2 gap-8 items-center"
        >
          {/* Left Content */}
          <div>
            <h2 className="text-3xl md:text-5xl font-black leading-tight text-white">
              Everything You Need
              <span className="block text-[#E8A33D]">
                To Stay Ahead
              </span>
            </h2>

            <p className="mt-3 text-gray-400 leading-6 text-base">
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
          <div className="grid sm:grid-cols-2 gap-3">
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
                  className="group rounded-xl border-2 border-[#E8A33D]/20 bg-[#1a1610] p-4 transition-all duration-300 hover:-translate-y-1 hover:border-[#E8A33D]/40"
                  style={{
                    backgroundImage: `
                      linear-gradient(135deg, rgba(232, 163, 61, 0.03) 0%, transparent 50%),
                      url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='paperNoise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23paperNoise)' opacity='0.06'/%3E%3C/svg%3E")
                    `,
                    backgroundSize: 'cover, 400px 400px'
                  }}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E8A33D]/10 text-[#E8A33D] border border-[#E8A33D]/30">
                    <Icon size={20} />
                  </div>

                  <h3 className="mt-3 text-sm font-semibold text-white">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-gray-400 leading-5 text-xs">
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