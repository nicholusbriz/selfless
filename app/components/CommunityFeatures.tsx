"use client";

import { motion } from "framer-motion";
import {
  Users,
  MessageSquare,
  Calendar,
  BellRing,
  Sparkles,
  UserCheck,
  ArrowUpRight,
} from "lucide-react";

const community = [
  {
    title: "Study Groups",
    description:
      "Join collaborative study groups, prepare for exams together, and learn from your peers.",
    icon: Users,
  },
  {
    title: "Tutor Communication",
    description:
      "Reach tutors quickly, receive guidance, and ask questions whenever you need academic support.",
    icon: MessageSquare,
  },
  {
    title: "Campus Activities",
    description:
      "Participate in Tech Center activities, workshops, events, and community initiatives.",
    icon: Calendar,
  },
  {
    title: "Announcements",
    description:
      "Stay informed about important announcements, schedules, and updates from administrators.",
    icon: BellRing,
  },
  {
    title: "Student Recognition",
    description:
      "Celebrate achievements, milestones, and outstanding contributions within the community.",
    icon: Sparkles,
  },
  {
    title: "Leadership Opportunities",
    description:
      "Develop leadership skills through mentorship, volunteering, and student responsibilities.",
    icon: UserCheck,
  },
];

const communityHighlights = [
  {
    title: "Study Groups",
    value: "Collaborative learning",
  },
  {
    title: "Tutor Support",
    value: "Stay connected",
  },
  {
    title: "Activities",
    value: "Get involved",
  },
  {
    title: "Community",
    value: "Grow together",
  },
];

export default function CommunityFeatures() {
  return (
    <section className="relative overflow-hidden bg-[#101826] py-14 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        {/* Section Header */}
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
              Student Community
            </span>

            <span className="h-px w-8 bg-[#E8A33D]" />
          </div>

          <h2 className="text-3xl font-bold leading-[1.1] tracking-tight text-white sm:text-4xl lg:text-[46px]">
            Learn together.
            <span className="block text-[#E8A33D]">
              Grow together.
            </span>
          </h2>

          <p className="mt-5 text-sm leading-6 text-slate-400 sm:text-base">
            Education is more than attending classes. Connect with other
            students, work with tutors, participate in Tech Center activities,
            and build a community that supports your success.
          </p>
        </motion.div>

        {/* Community Features */}
        <div className="mt-10 grid gap-px overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.08] md:grid-cols-2 xl:grid-cols-3">
          {community.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{
                  duration: 0.35,
                  delay: index * 0.045,
                }}
                className="group bg-[#121A25] p-5 transition-colors duration-200 hover:bg-[#17202D] sm:p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#E8A33D]/20 bg-[#E8A33D]/[0.08] text-[#E8A33D]">
                    <Icon size={19} strokeWidth={1.8} />
                  </div>

                  <ArrowUpRight
                    size={16}
                    strokeWidth={1.8}
                    className="mt-1 text-slate-600 opacity-0 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#E8A33D] group-hover:opacity-100"
                  />
                </div>

                <h3 className="mt-5 text-sm font-semibold text-white sm:text-[15px]">
                  {item.title}
                </h3>

                <p className="mt-2 max-w-md text-xs leading-5 text-slate-400 sm:text-[13px]">
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Community Highlights */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.4 }}
          className="mt-8 overflow-hidden rounded-xl border border-white/[0.08] bg-[#0D141E]"
        >
          <div className="grid sm:grid-cols-2 lg:grid-cols-4">
            {communityHighlights.map((item, index) => (
              <div
                key={item.title}
                className={`px-5 py-5 sm:px-6 ${
                  index !== communityHighlights.length - 1
                    ? "border-b border-white/[0.08] sm:border-r lg:border-b-0"
                    : ""
                } ${
                  index === 1
                    ? "sm:border-r-0 lg:border-r"
                    : ""
                }`}
              >
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  {item.title}
                </p>

                <p className="mt-1.5 text-sm font-semibold text-[#E8A33D]">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}