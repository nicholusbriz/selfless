"use client";

import { motion } from "framer-motion";
import {
  Users,
  MessageSquare,
  Calendar,
  BellRing,
  Sparkles,
  UserCheck,
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
      "Never miss important announcements, schedules, or updates from administrators.",
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
      "Grow your leadership skills through mentorship, volunteering, and student responsibilities.",
    icon: UserCheck,
  },
];

export default function CommunityFeatures() {
  const primaryColor = '#E8A33D';
  
  return (
    <section className="relative overflow-hidden bg-[#101826] py-16">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_right,rgba(232,163,61,.05),transparent_45%)]" />

      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <h2 className="text-3xl md:text-5xl font-black text-white">
            Learn Together.
            <span className="block text-[#E8A33D]">
              Grow Together.
            </span>
          </h2>

          <p className="mt-4 text-base leading-7 text-gray-400">
            Education is more than attending classes. Build friendships,
            collaborate with tutors, participate in Tech Center activities,
            and become part of a thriving student community designed to help
            everyone succeed.
          </p>
        </motion.div>

        {/* Community Cards */}
        <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {community.map((item, index) => {
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
                className="group rounded-xl border-2 border-[#E8A33D]/20 bg-[#1a1610] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#E8A33D]/40"
                style={{
                  backgroundImage: `
                    linear-gradient(135deg, rgba(232, 163, 61, 0.03) 0%, transparent 50%),
                    url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='paperNoise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23paperNoise)' opacity='0.06'/%3E%3C/svg%3E")
                  `,
                  backgroundSize: 'cover, 400px 400px'
                }}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E8A33D]/10 text-[#E8A33D] border border-[#E8A33D]/30 transition duration-300 group-hover:scale-110">
                  <Icon size={22} />
                </div>

                <h3 className="mt-4 text-base font-bold text-white">
                  {item.title}
                </h3>

                <p className="mt-2 leading-6 text-gray-400 text-sm">
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Stats Banner */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-12 rounded-xl border-2 border-[#E8A33D]/20 p-6"
          style={{
            background: `linear-gradient(to right, ${primaryColor}15, rgba(26, 22, 16, 0.8), ${primaryColor}15)`,
            backgroundImage: `
              linear-gradient(to right, ${primaryColor}15, rgba(26, 22, 16, 0.8), ${primaryColor}15),
              url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='paperNoise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23paperNoise)' opacity='0.04'/%3E%3C/svg%3E")
            `,
            backgroundSize: '100% 100%, 400px 400px'
          }}
        >
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard
              title="Study Groups"
              value="Collaborative Learning"
            />
            <StatCard
              title="Tutor Support"
              value="Always Connected"
            />
            <StatCard
              title="Events"
              value="Stay Involved"
            />
            <StatCard
              title="Community"
              value="Learn Together"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function StatCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  const primaryColor = '#E8A33D';
  
  return (
    <div 
      className="rounded-lg border-2 border-[#E8A33D]/20 bg-[#E8A33D]/5 p-4 text-center transition hover:border-[#E8A33D]/40"
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = `${primaryColor}50`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(232, 163, 61, 0.2)';
      }}
    >
      <h4 className="text-sm font-semibold text-white">
        {title}
      </h4>
      <p className="mt-1 text-[#E8A33D] text-xs">
        {value}
      </p>
    </div>
  );
}