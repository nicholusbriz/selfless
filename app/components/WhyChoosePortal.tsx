"use client";

import { motion } from "framer-motion";
import {
  Clock3,
  ShieldCheck,
  Smartphone,
  Globe,
  Layers3,
  Sparkles,
} from "lucide-react";

const reasons = [
  {
    icon: Clock3,
    title: "Save Time",
    description:
      "Complete academic tasks in minutes from one centralized platform without switching between multiple systems.",
  },
  {
    icon: ShieldCheck,
    title: "Secure & Reliable",
    description:
      "Your academic records and personal information are securely managed and always accessible.",
  },
  {
    icon: Smartphone,
    title: "Access Anywhere",
    description:
      "Use the portal on your laptop, tablet, or mobile phone wherever you are.",
  },
  {
    icon: Globe,
    title: "Connected Tech Centers",
    description:
      "Stay connected with students, tutors, and administrators across the Selfless Tech Center Network.",
  },
  {
    icon: Layers3,
    title: "All-In-One Platform",
    description:
      "Courses, attendance, announcements, assignments, grades, schedules, and communication—all from one dashboard.",
  },
  {
    icon: Sparkles,
    title: "Built Around Students",
    description:
      "Every feature has been designed to simplify student life and improve the overall learning experience.",
  },
];

export default function WhyChoosePortal() {
  const primaryColor = '#E8A33D';
  
  return (
    <section className="relative overflow-hidden bg-[#101826] py-16">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(232,163,61,.06),transparent_45%)]" />

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
            More Than A
            <span className="block text-[#E8A33D]">
              Student Portal
            </span>
          </h2>

          <p className="mt-4 text-base leading-7 text-gray-400">
            The Selfless Student Self Service Portal isn't just another
            website. It's your academic workspace, communication hub,
            planning assistant, and digital companion throughout your
            educational journey.
          </p>
        </motion.div>

        {/* Reasons Grid */}
        <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {reasons.map((item, index) => {
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
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E8A33D]/10 text-[#E8A33D] border border-[#E8A33D]/30 transition group-hover:scale-110">
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
      </div>
    </section>
  );
}