// components/PortalOverview.tsx

"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  GraduationCap,
  Users,
  CalendarDays,
  ArrowRight,
  Check,
} from "lucide-react";

const features = [
  {
    title: "Academic Hub",
    description:
      "Manage your courses, assignments, academic progress, and earned credits from one personalized dashboard.",
    icon: BookOpen,
    stats: "Courses • Credits • Grades",
  },
  {
    title: "Student Community",
    description:
      "Collaborate with classmates, join study groups, communicate with tutors, and stay connected across Tech Centers.",
    icon: Users,
    stats: "Groups • Tutors • Chat",
  },
  {
    title: "Campus Activities",
    description:
      "Never miss announcements, events, attendance updates, or daily responsibilities within your Tech Center.",
    icon: CalendarDays,
    stats: "Events • Attendance • Notices",
  },
  {
    title: "Student Success",
    description:
      "Track milestones, receive tutor feedback, celebrate achievements, and stay focused on graduation.",
    icon: GraduationCap,
    stats: "Progress • Goals • Achievements",
  },
];

const services = [
  "Course Registration",
  "Academic Progress",
  "Assignments",
  "Attendance",
  "Announcements",
  "Study Groups",
  "Tutor Feedback",
  "Achievements",
];

export default function PortalOverview() {
  const primaryColor = "#E8A33D";
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % features.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, []);

  const activeFeature = features[activeIndex];
  const ActiveIcon = activeFeature.icon;

  return (
    <section className="relative overflow-hidden bg-[#0D1117] py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">

        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.55 }}
          className="max-w-3xl"
        >
          <div className="mb-5 flex items-center gap-3">
            <span
              className="h-px w-10"
              style={{ backgroundColor: primaryColor }}
            />

            <span
              className="text-xs font-semibold uppercase tracking-[0.2em]"
              style={{ color: primaryColor }}
            >
              Portal Overview
            </span>
          </div>

          <h2 className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
            Everything you need
            <span className="block" style={{ color: primaryColor }}>
              to succeed as a student.
            </span>
          </h2>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-[#9CA3AF] sm:text-base">
            The Selfless Student Self Service Portal brings your academic
            tools, student services, communication, and progress tracking
            together in one secure platform.
          </p>
        </motion.div>

        {/* Feature navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-12 border-y border-white/[0.08]"
        >
          <div className="grid grid-cols-2 md:grid-cols-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const isActive = index === activeIndex;

              return (
                <button
                  key={feature.title}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className="group relative flex items-center gap-3 px-3 py-5 text-left transition-colors duration-200 sm:px-5"
                >
                  <Icon
                    size={19}
                    className="shrink-0 transition-colors duration-200"
                    style={{
                      color: isActive ? primaryColor : "#6B7280",
                    }}
                  />

                  <span
                    className="text-xs font-semibold transition-colors duration-200 sm:text-sm"
                    style={{
                      color: isActive ? "#FFFFFF" : "#9CA3AF",
                    }}
                  >
                    {feature.title}
                  </span>

                  {/* Active indicator */}
                  <span
                    className="absolute bottom-0 left-3 right-3 h-0.5 origin-left transition-transform duration-300 sm:left-5 sm:right-5"
                    style={{
                      backgroundColor: primaryColor,
                      transform: isActive ? "scaleX(1)" : "scaleX(0)",
                    }}
                  />
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Main information area */}
        <div className="mt-10 grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">

          {/* Active feature */}
          <div className="min-h-[250px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeFeature.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35 }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-lg border"
                    style={{
                      color: primaryColor,
                      borderColor: `${primaryColor}45`,
                      backgroundColor: `${primaryColor}0D`,
                    }}
                  >
                    <ActiveIcon size={21} />
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#6B7280]">
                      Student Services
                    </p>

                    <h3 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                      {activeFeature.title}
                    </h3>
                  </div>
                </div>

                <p className="mt-6 max-w-2xl text-sm leading-7 text-[#9CA3AF] sm:text-base">
                  {activeFeature.description}
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
                  {activeFeature.stats.split(" • ").map((stat) => (
                    <div
                      key={stat}
                      className="flex items-center gap-2 text-xs font-medium text-[#D1D5DB] sm:text-sm"
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: primaryColor }}
                      />
                      {stat}
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Service list */}
          <motion.div
            initial={{ opacity: 0, x: 18 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.55 }}
            className="border-l border-white/[0.08] pl-0 lg:pl-10"
          >
            <p
              className="text-xs font-semibold uppercase tracking-[0.18em]"
              style={{ color: primaryColor }}
            >
              Available Services
            </p>

            <h3 className="mt-2 text-xl font-bold text-white">
              One portal. Multiple services.
            </h3>

            <div className="mt-6 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
              {services.map((service) => (
                <div
                  key={service}
                  className="flex items-center gap-3 py-1.5"
                >
                  <Check
                    size={15}
                    className="shrink-0"
                    style={{ color: primaryColor }}
                  />

                  <span className="text-sm text-[#B8BEC8]">
                    {service}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-7 flex items-center gap-2 text-sm font-semibold text-white">
              <span>Explore the portal</span>

              <ArrowRight
                size={17}
                style={{ color: primaryColor }}
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </div>
          </motion.div>
        </div>

        {/* Bottom statement */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.5 }}
          className="mt-14 border-t border-white/[0.08] pt-7"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-white">
                One Login. Every Student Service.
              </p>

              <p className="mt-1 max-w-2xl text-xs leading-6 text-[#6B7280] sm:text-sm">
                Access your courses, academic records, schedules, tutor
                feedback, announcements, and student activities from one
                platform.
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: primaryColor }}
              />

              <span className="text-xs font-medium text-[#9CA3AF]">
                Student services available
              </span>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}

