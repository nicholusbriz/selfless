"use client";

import { motion } from "framer-motion";
import {
  BookOpen,
  GraduationCap,
  Users,
  CalendarDays,
} from "lucide-react";
import { useTenant } from "@/lib/contexts/TenantContext";

const features = [
  {
    title: "Academic Hub",
    description:
      "Manage your courses, assignments, academic progress, and earned credits from one personalized dashboard.",
    icon: BookOpen,
    details: ["Course Registration", "Grade Tracking", "Credit Management"],
  },
  {
    title: "Student Community",
    description:
      "Collaborate with classmates, join study groups, communicate with tutors, and stay connected across Tech Centers.",
    icon: Users,
    details: ["Study Groups", "Tutor Communication", "Peer Collaboration"],
  },
  {
    title: "Campus Activities",
    description:
      "Never miss announcements, events, attendance updates, or daily responsibilities within your Tech Center.",
    icon: CalendarDays,
    details: ["Event Calendar", "Attendance Tracking", "Announcements"],
  },
  {
    title: "Student Success",
    description:
      "Track milestones, receive tutor feedback, celebrate achievements, and stay focused on graduation.",
    icon: GraduationCap,
    details: ["Progress Tracking", "Achievement Badges", "Goal Setting"],
  },
];

export default function PortalOverview() {
  const { currentTechCenter, isTenantView } = useTenant();
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
            Platform Overview
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">
            {isTenantView ? `${currentTechCenter?.displayName} Portal` : 'Designed Around'}
            <span className="block" style={{ color: primaryColor }}>
              Student Success
            </span>
          </h2>
          <p className="text-muted-foreground text-lg">
            {isTenantView 
              ? `The ${currentTechCenter?.displayName} Student Portal provides every tool students need to stay organized, collaborate with others, monitor academic progress, and successfully complete their educational journey at ${currentTechCenter?.description}.`
              : 'The Selfless Student Self Service Portal provides every tool students need to stay organized, collaborate with others, monitor academic progress, and successfully complete their educational journey.'
            }
          </p>
        </motion.div>

        {/* Editorial Layout */}
        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.div
                key={feature.title}
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
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                </motion.div>
                <p className="text-muted-foreground mb-4">{feature.description}</p>
                <motion.ul 
                  className="space-y-1"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 + 0.3, duration: 0.4 }}
                >
                  {feature.details.map((detail, detailIndex) => (
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

        {/* Bottom Banner */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-16 p-8 border rounded-lg"
          style={{
            borderColor: `${primaryColor}20`,
            backgroundColor: `${primaryColor}05`,
          }}
        >
          <div className="max-w-2xl">
            <span 
              className="text-sm font-semibold uppercase tracking-wider"
              style={{ color: primaryColor }}
            >
              Why Students Love It
            </span>
            <h3 className="text-2xl font-bold mt-2 mb-3">
              One Login. Every Student Service.
            </h3>
            <p className="text-muted-foreground">
              {isTenantView 
                ? `Forget switching between multiple systems. Access your courses, academic records, announcements, schedules, tutor feedback, and student activities at ${currentTechCenter?.displayName} from one secure platform.`
                : 'Forget switching between multiple systems. Access your courses, academic records, announcements, schedules, tutor feedback, and student activities from one secure platform.'
              }
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}