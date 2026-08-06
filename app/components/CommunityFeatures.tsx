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
import { useTenant } from "@/lib/contexts/TenantContext";

const community = [
  {
    title: "Study Groups",
    description:
      "Join collaborative study groups, prepare for exams together, and learn from your peers.",
    icon: Users,
    details: ["Group Formation", "Exam Preparation", "Peer Learning"],
  },
  {
    title: "Tutor Communication",
    description:
      "Reach tutors quickly, receive guidance, and ask questions whenever you need academic support.",
    icon: MessageSquare,
    details: ["Quick Access", "Academic Guidance", "Q&A Support"],
  },
  {
    title: "Campus Activities",
    description:
      "Participate in Tech Center activities, workshops, events, and community initiatives.",
    icon: Calendar,
    details: ["Workshops", "Community Events", "Initiatives"],
  },
  {
    title: "Announcements",
    description:
      "Never miss important announcements, schedules, or updates from administrators.",
    icon: BellRing,
    details: ["Important Updates", "Schedule Changes", "Admin Notices"],
  },
  {
    title: "Student Recognition",
    description:
      "Celebrate achievements, milestones, and outstanding contributions within the community.",
    icon: Sparkles,
    details: ["Achievement Badges", "Milestone Tracking", "Community Awards"],
  },
  {
    title: "Leadership Opportunities",
    description:
      "Grow your leadership skills through mentorship, volunteering, and student responsibilities.",
    icon: UserCheck,
    details: ["Mentorship Programs", "Volunteer Roles", "Student Leadership"],
  },
];

export default function CommunityFeatures() {
  const { currentTechCenter } = useTenant();
  const primaryColor = currentTechCenter?.color || '#000000';

  return (
    <section className="py-20 border-t border-border">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mb-12"
        >
          <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: primaryColor }}>
            Connected Learning
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">
            Learn Together.
            <span className="block" style={{ color: primaryColor }}>
              Grow Together.
            </span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Education is more than attending classes. Build friendships,
            collaborate with tutors, participate in Tech Center activities,
            and become part of a thriving student community designed to help
            everyone succeed.
          </p>
        </motion.div>

        {/* Editorial Layout */}
        <div className="grid md:grid-cols-2 gap-8">
          {community.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{
                  delay: index * 0.15,
                  duration: 0.6,
                  ease: "easeOut"
                }}
                whileHover={{ 
                  scale: 1.02, 
                  x: 10,
                  transition: { duration: 0.2 }
                }}
                className="border-l-2 pl-6 cursor-pointer"
                style={{ borderColor: primaryColor }}
              >
                <motion.div 
                  className="flex items-center gap-3 mb-3"
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.div 
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                    whileHover={{ 
                      rotate: 360,
                      transition: { duration: 0.6 }
                    }}
                  >
                    <Icon size={20} />
                  </motion.div>
                  <h3 className="text-xl font-semibold">{item.title}</h3>
                </motion.div>
                <p className="text-muted-foreground mb-4">{item.description}</p>
                <motion.ul 
                  className="space-y-1"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 + 0.3, duration: 0.4 }}
                >
                  {item.details.map((detail, detailIndex) => (
                    <motion.li 
                      key={detail} 
                      className="text-sm text-muted-foreground flex items-center gap-2"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ 
                        delay: index * 0.15 + 0.3 + (detailIndex * 0.1),
                        duration: 0.4 
                      }}
                    >
                      <motion.span 
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: primaryColor }}
                        whileHover={{ scale: 1.5 }}
                      />
                      {detail}
                    </motion.li>
                  ))}
                </motion.ul>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}