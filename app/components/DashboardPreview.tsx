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
  const primaryColor = '#E8A33D';
  
  return (
    <section className="relative overflow-hidden bg-[#0D1117] py-16">
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

        <div className="mt-12 grid lg:grid-cols-2 gap-10 items-center">
          {/* Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-xl border-2 border-[#E8A33D]/20 bg-[#1a1610] p-5"
            style={{
              backgroundImage: `
                linear-gradient(135deg, rgba(232, 163, 61, 0.03) 0%, transparent 50%),
                url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='paperNoise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23paperNoise)' opacity='0.06'/%3E%3C/svg%3E")
              `,
              backgroundSize: 'cover, 400px 400px'
            }}
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
              <div className="h-12 w-12 rounded-xl bg-[#E8A33D]/10 border border-[#E8A33D]/30 flex items-center justify-center">
                <BarChart3 className="text-[#E8A33D]" size={22} />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              {widgets.map((item) => {
                const Icon = item.icon;

                return (
                  <motion.div
                    key={item.title}
                    whileHover={{ scale: 1.02 }}
                    className="rounded-lg border-2 border-[#E8A33D]/20 bg-[#111827] p-3 transition-all duration-300 hover:border-[#E8A33D]/40"
                  >
                    <Icon className="text-[#E8A33D]" size={20} />
                    <h4 className="mt-2 font-semibold text-white text-xs">
                      {item.title}
                    </h4>
                  </motion.div>
                );
              })}
            </div>

            {/* Progress Bar */}
            <motion.div 
              className="mt-5 rounded-lg border-2 border-[#E8A33D]/20 bg-[#111827] p-4"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex justify-between text-xs">
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
              <div className="mt-2 h-2 rounded-full bg-white/10 overflow-hidden">
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
  const primaryColor = '#E8A33D';
  
  return (
    <motion.div 
      whileHover={{ x: 4 }}
      className="group rounded-lg border-2 border-[#E8A33D]/20 bg-[#1a1610] p-4 transition-all duration-300 hover:border-[#E8A33D]/40"
      style={{
        backgroundImage: `
          linear-gradient(135deg, rgba(232, 163, 61, 0.03) 0%, transparent 50%),
          url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='paperNoise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23paperNoise)' opacity='0.06'/%3E%3C/svg%3E")
        `,
        backgroundSize: 'cover, 400px 400px'
      }}
    >
      <div className="h-10 w-10 rounded-lg bg-[#E8A33D]/10 border border-[#E8A33D]/30 flex items-center justify-center text-[#E8A33D] flex-shrink-0">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-semibold text-white">
          {title}
        </h3>
        <p className="mt-1 leading-5 text-gray-400 text-xs">
          {text}
        </p>
      </div>
    </motion.div>
  );
}