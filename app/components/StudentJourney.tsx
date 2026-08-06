"use client";

import { motion } from "framer-motion";
import {
  UserPlus,
  BookOpen,
  ClipboardCheck,
  Users,
  GraduationCap,
  Briefcase,
} from "lucide-react";
import { useTenant } from "@/lib/contexts/TenantContext";

const journey = [
  {
    title: "Join Your Tech Center",
    description:
      "Create your student account and become part of the Selfless learning community.",
    icon: UserPlus,
    details: ["Account Registration", "Profile Setup", "Tech Center Assignment"],
  },
  {
    title: "Register Your Courses",
    description:
      "Enroll in your courses and organize your semester with ease.",
    icon: BookOpen,
    details: ["Course Selection", "Schedule Planning", "Credit Tracking"],
  },
  {
    title: "Track Academic Progress",
    description:
      "Monitor grades, assignments, attendance, and earned credits in real time.",
    icon: ClipboardCheck,
    details: ["Grade Monitoring", "Assignment Tracking", "Attendance Records"],
  },
  {
    title: "Collaborate & Learn",
    description:
      "Work together with classmates, tutors, and student leaders across Tech Centers.",
    icon: Users,
    details: ["Study Groups", "Tutor Sessions", "Peer Collaboration"],
  },
  {
    title: "Graduate Successfully",
    description:
      "Complete your academic requirements and celebrate every milestone.",
    icon: GraduationCap,
    details: ["Requirement Completion", "Milestone Tracking", "Graduation Planning"],
  },
  {
    title: "Build Your Future",
    description:
      "Apply the skills you've gained to become self-reliant and positively impact your community.",
    icon: Briefcase,
    details: ["Career Preparation", "Skill Application", "Community Impact"],
  },
];

export default function StudentJourney() {
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
            Student Journey
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">
            From Enrollment
            <span className="block" style={{ color: primaryColor }}>
              To Graduation
            </span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Every stage of your learning journey is supported through one
            connected platform designed to help you succeed academically,
            collaborate with others, and confidently achieve your goals.
          </p>
        </motion.div>

        {/* Editorial Layout */}
        <div className="grid md:grid-cols-2 gap-8">
          {journey.map((item, index) => {
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
                  <div className="flex items-center gap-2">
                    <motion.span 
                      className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold"
                      style={{ backgroundColor: primaryColor, color: 'white' }}
                      whileHover={{ scale: 1.2, rotate: 360 }}
                      transition={{ duration: 0.4 }}
                    >
                      {index + 1}
                    </motion.span>
                    <h3 className="text-xl font-semibold">{item.title}</h3>
                  </div>
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