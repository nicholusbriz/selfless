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
    title: "Everything In One Place",
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
  return (
    <section className="relative overflow-hidden bg-[#101826] py-20">
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
          <span className="inline-flex rounded-full border border-[#E8A33D]/20 bg-[#E8A33D]/10 px-4 py-1.5 text-xs uppercase tracking-[0.25em] text-[#F2C879]">
            Why Students Choose It
          </span>

          <h2 className="mt-5 text-3xl md:text-5xl font-black text-white">
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
        <div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
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
                className="group rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-[#E8A33D]/40"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E8A33D]/10 text-[#E8A33D] transition group-hover:scale-110">
                  <Icon size={22} />
                </div>

                <h3 className="mt-5 text-lg font-bold text-white">
                  {item.title}
                </h3>

                <p className="mt-2 leading-7 text-gray-400 text-sm">
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