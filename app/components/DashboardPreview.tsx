"use client";

import { motion } from "framer-motion";
import {
  BookOpen,
  Calendar,
  Bell,
  CheckCircle2,
  BarChart3,
  Users,
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

export default function DashboardPreview() {
  return (
    <section className="relative overflow-hidden bg-[#0D1117] py-20">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(232,163,61,.06),transparent_55%)]" />

      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          <span className="inline-flex rounded-full border border-[#E8A33D]/20 bg-[#E8A33D]/10 px-4 py-1.5 text-xs uppercase tracking-[0.25em] text-[#F2C879]">
            Student Dashboard
          </span>

          <h2 className="mt-5 text-3xl md:text-5xl font-black text-white">
            Everything At
            <span className="block text-[#E8A33D]">
              Your Fingertips
            </span>
          </h2>

          <p className="mt-4 text-base leading-7 text-gray-400">
            Access your academic information, notifications,
            assignments, attendance records, announcements,
            and progress from one beautiful dashboard.
          </p>
        </motion.div>

        <div className="mt-14 grid lg:grid-cols-2 gap-12 items-center">
          {/* Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">
                  Welcome Back 👋
                </h3>
                <p className="mt-1 text-gray-400 text-sm">
                  Here's your academic overview.
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-[#E8A33D]/10 flex items-center justify-center">
                <BarChart3 className="text-[#E8A33D]" size={22} />
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
              {widgets.map((item) => {
                const Icon = item.icon;

                return (
                  <motion.div
                    key={item.title}
                    whileHover={{ scale: 1.02 }}
                    className="rounded-xl border border-white/10 bg-[#111827] p-4 transition-all duration-300 hover:border-[#E8A33D]/30"
                  >
                    <Icon className="text-[#E8A33D]" size={20} />
                    <h4 className="mt-3 font-semibold text-white text-sm">
                      {item.title}
                    </h4>
                  </motion.div>
                );
              })}
            </div>

            {/* Progress Bar */}
            <motion.div 
              className="mt-6 rounded-xl bg-[#111827] p-5"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Academic Progress</span>
                <motion.span 
                  className="text-[#E8A33D] font-semibold"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  82%
                </motion.span>
              </div>
              <div className="mt-3 h-2.5 rounded-full bg-white/10 overflow-hidden">
                <motion.div 
                  className="h-full rounded-full bg-[#E8A33D]"
                  initial={{ width: 0 }}
                  whileInView={{ width: "82%" }}
                  transition={{ duration: 1, delay: 0.4 }}
                />
              </div>
            </motion.div>
          </motion.div>

          {/* Features List */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <Feature
              icon={<Users size={20} />}
              title="Personal Dashboard"
              text="Your own workspace with everything that matters."
            />
            <Feature
              icon={<BookOpen size={20} />}
              title="Real-Time Academic Records"
              text="Instant access to grades, credits and courses."
            />
            <Feature
              icon={<Bell size={20} />}
              title="Smart Notifications"
              text="Stay informed with announcements and reminders."
            />
            <Feature
              icon={<Calendar size={20} />}
              title="Daily Schedule"
              text="Never miss lectures, meetings or deadlines."
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Feature({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <motion.div 
      whileHover={{ x: 4 }}
      className="flex gap-4 rounded-xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl transition-all duration-300 hover:border-[#E8A33D]/30"
    >
      <div className="h-11 w-11 rounded-xl bg-[#E8A33D]/10 flex items-center justify-center text-[#E8A33D] flex-shrink-0">
        {icon}
      </div>
      <div>
        <h3 className="text-base font-semibold text-white">
          {title}
        </h3>
        <p className="mt-1 leading-6 text-gray-400 text-sm">
          {text}
        </p>
      </div>
    </motion.div>
  );
}