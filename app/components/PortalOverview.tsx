"use client";

import { motion } from "framer-motion";
import {
  BookOpen,
  GraduationCap,
  Users,
  CalendarDays,
  ArrowRight,
} from "lucide-react";
import { useTenant } from "@/lib/contexts/TenantContext";

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
  const { currentTechCenter, isTenantView } = useTenant();
  const primaryColor = currentTechCenter?.color || '#E8A33D';
  const accentColor = currentTechCenter?.accentColor || '#C97F1F';

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
            {isTenantView ? `${currentTechCenter?.displayName} Portal` : 'Designed Around'}
            <span 
              className="block"
              style={{ color: primaryColor }}
            >
              {isTenantView ? 'Student Success' : 'Student Success'}
            </span>
          </h2>

          <p className="mt-5 text-base leading-7 text-gray-400 max-w-2xl mx-auto">
            {isTenantView 
              ? `The ${currentTechCenter?.displayName} Student Portal provides every tool students need to stay organized, collaborate with others, monitor academic progress, and successfully complete their educational journey at ${currentTechCenter?.description}.`
              : 'The Selfless Student Self Service Portal provides every tool students need to stay organized, collaborate with others, monitor academic progress, and successfully complete their educational journey.'
            }
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
                className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-xl transition-all duration-500 hover:-translate-y-1"
                style={{
                  borderColor: isTenantView ? `${primaryColor}20` : 'rgba(255,255,255,0.1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = `${primaryColor}40`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = isTenantView ? `${primaryColor}20` : 'rgba(255,255,255,0.1)';
                }}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.color}`}
                />

                <div className="relative p-5">
                  <div 
                    className="flex h-12 w-12 items-center justify-center rounded-xl"
                    style={{
                      backgroundColor: `${primaryColor}15`,
                      color: primaryColor,
                    }}
                  >
                    <Icon size={24} />
                  </div>
                  <ArrowRight
                    size={18}
                    className="transition duration-300 group-hover:translate-x-1"
                    style={{
                      color: isTenantView ? primaryColor : '#6B7280',
                    }}
                  />

                  <h3 className="mt-4 text-lg font-bold text-white">
                    {feature.title}
                  </h3>

                  <p className="mt-2 leading-6 text-gray-400 text-sm">
                    {feature.description}
                  </p>

                  <div 
                    className="mt-4 inline-flex rounded-full bg-white/5 px-3 py-1 text-xs border border-white/10"
                    style={{
                      color: primaryColor,
                    }}
                  >
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
          className="mt-12 rounded-xl border p-6"
          style={{
            borderColor: `${primaryColor}20`,
            background: `linear-gradient(to right, ${primaryColor}10, rgba(255,255,255,0.05), ${primaryColor}10)`,
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
                {isTenantView 
                  ? `Forget switching between multiple systems. Access your courses, academic records, announcements, schedules, tutor feedback, and student activities at ${currentTechCenter?.displayName} from one secure platform.`
                  : 'Forget switching between multiple systems. Access your courses, academic records, announcements, schedules, tutor feedback, and student activities from one secure platform.'
                }
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
                  className="rounded-lg border border-white/10 bg-white/5 p-2.5 text-center transition hover:bg-white/10"
                  style={{
                    borderColor: isTenantView ? `${primaryColor}20` : 'rgba(255,255,255,0.1)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = `${primaryColor}30`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = isTenantView ? `${primaryColor}20` : 'rgba(255,255,255,0.1)';
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