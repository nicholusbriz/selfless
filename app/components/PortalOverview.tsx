// components/PortalOverview.tsx

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
  const primaryColor = '#E8A33D';

  return (
    <section className="relative py-16 bg-[#0D1117] overflow-hidden">
      {/* Background */}
      <div 
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle_at_center,${primaryColor}12,transparent_60%)`
        }}
      />
      
      <div className="relative max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="mt-6 text-3xl md:text-5xl font-black tracking-tight text-white">
            Designed Around
            <span className="block" style={{ color: primaryColor }}>
              Student Success
            </span>
          </h2>

          <p className="mt-5 text-base leading-7 text-gray-400 max-w-2xl mx-auto">
            The Selfless Student Self Service Portal provides every tool students 
            need to stay organized, collaborate with others, monitor academic 
            progress, and successfully complete their educational journey.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="mt-12 grid gap-4 lg:grid-cols-2">
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
                className="group relative overflow-hidden rounded-xl border-2 border-[#E8A33D]/20 bg-[#1a1610] transition-all duration-500 hover:-translate-y-1"
                style={{
                  backgroundImage: `
                    linear-gradient(135deg, rgba(232, 163, 61, 0.03) 0%, transparent 50%),
                    url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='paperNoise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23paperNoise)' opacity='0.06'/%3E%3C/svg%3E")
                  `,
                  backgroundSize: 'cover, 400px 400px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = `${primaryColor}50`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(232, 163, 61, 0.2)';
                }}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.color}`}
                />

                <div className="relative p-5">
                  <div 
                    className="flex h-12 w-12 items-center justify-center rounded-xl"
                    style={{
                      backgroundColor: `${primaryColor}20`,
                      color: primaryColor,
                      border: `1px solid ${primaryColor}30`
                    }}
                  >
                    <Icon size={24} />
                  </div>
                  <ArrowRight
                    size={18}
                    className="transition duration-300 group-hover:translate-x-1"
                    style={{ color: primaryColor }}
                  />

                  <h3 className="mt-4 text-lg font-bold text-white">
                    {feature.title}
                  </h3>

                  <p className="mt-2 leading-6 text-gray-400 text-sm">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Banner */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-12 rounded-xl border-2 p-6"
          style={{
            borderColor: `${primaryColor}30`,
            background: `linear-gradient(to right, ${primaryColor}15, rgba(26, 22, 16, 0.8), ${primaryColor}15)`,
            backgroundImage: `
              linear-gradient(to right, ${primaryColor}15, rgba(26, 22, 16, 0.8), ${primaryColor}15),
              url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='paperNoise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23paperNoise)' opacity='0.04'/%3E%3C/svg%3E")
            `,
            backgroundSize: '100% 100%, 400px 400px'
          }}
        >
          <div className="grid lg:grid-cols-2 gap-6 items-center">
            <div>
              <span 
                className="uppercase tracking-[0.25em] text-xs"
                style={{ color: primaryColor }}
              >
                Why Students Love It
              </span>

              <h3 className="mt-2 text-xl md:text-2xl font-black text-white">
                One Login.
                <br />
                Every Student Service.
              </h3>

              <p className="mt-2 leading-6 text-gray-400 text-sm">
                Forget switching between multiple systems. Access your courses, 
                academic records, announcements, schedules, tutor feedback, and 
                student activities from one secure platform.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
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
                  className="rounded-lg border border-[#E8A33D]/20 bg-[#E8A33D]/5 p-2.5 text-center transition hover:bg-[#E8A33D]/10"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = `${primaryColor}40`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(232, 163, 61, 0.2)';
                  }}
                >
                  <p className="font-medium text-white text-xs">
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