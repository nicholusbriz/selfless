"use client";

import { motion } from "framer-motion";
import {
  Clock3,
  ShieldCheck,
  Smartphone,
  Globe,
  Layers3,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";

const reasons = [
  {
    icon: Clock3,
    title: "Save Time",
    description:
      "Complete academic tasks from one centralized platform without switching between multiple systems.",
  },
  {
    icon: ShieldCheck,
    title: "Secure & Reliable",
    description:
      "Your academic records and personal information are securely managed and available when you need them.",
  },
  {
    icon: Smartphone,
    title: "Access Anywhere",
    description:
      "Use the portal comfortably on your laptop, tablet, or mobile phone wherever you are.",
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
      "Manage courses, attendance, assignments, grades, schedules, announcements, and communication in one place.",
  },
  {
    icon: Sparkles,
    title: "Built Around Students",
    description:
      "Designed to simplify everyday student tasks and make the learning experience easier to manage.",
  },
];

export default function WhyChoosePortal() {
  return (
    <section className="relative overflow-hidden bg-[#101826] py-14 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        {/* Header */}
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
              Why the Portal
            </span>

            <span className="h-px w-8 bg-[#E8A33D]" />
          </div>

          <h2 className="text-3xl font-bold leading-[1.1] tracking-tight text-white sm:text-4xl lg:text-[46px]">
            More than a
            <span className="block text-[#E8A33D]">
              student portal.
            </span>
          </h2>

          <p className="mt-5 text-sm leading-6 text-slate-400 sm:text-base">
            Your Selfless Student Self Service Portal brings the essential
            parts of student life together in one organized digital workspace.
          </p>
        </motion.div>

        {/* Reasons */}
        <div className="mt-10 overflow-hidden rounded-xl border border-white/[0.08] bg-[#0D141E]">
          <div className="grid md:grid-cols-2 xl:grid-cols-3">
            {reasons.map((item, index) => {
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
                  className={`group relative bg-[#111923] p-5 transition-colors duration-200 hover:bg-[#151F2A] sm:p-6 ${
                    index < 3
                      ? "border-b border-white/[0.07]"
                      : ""
                  } ${
                    index % 2 === 0
                      ? "md:border-r md:border-white/[0.07] xl:border-r-0"
                      : ""
                  } ${
                    index !== 2 && index !== 5
                      ? "xl:border-r xl:border-white/[0.07]"
                      : ""
                  }`}
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#E8A33D]/20 bg-[#E8A33D]/[0.08] text-[#E8A33D]">
                      <Icon size={19} strokeWidth={1.8} />
                    </div>

                    <ArrowUpRight
                      size={16}
                      strokeWidth={1.8}
                      className="text-slate-600 opacity-0 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#E8A33D] group-hover:opacity-100"
                    />
                  </div>

                  <h3 className="mt-5 text-sm font-semibold text-white sm:text-[15px]">
                    {item.title}
                  </h3>

                  <p className="mt-2 max-w-md text-xs leading-5 text-slate-400 sm:text-[13px]">
                    {item.description}
                  </p>

                  {/* Subtle index */}
                  <span className="absolute bottom-5 right-5 text-[10px] font-medium tracking-wider text-white/[0.06] transition-colors duration-200 group-hover:text-[#E8A33D]/20">
                    0{index + 1}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Closing statement */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="mt-8 flex flex-col gap-3 border-l-2 border-[#E8A33D]/60 pl-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
        >
          <p className="max-w-2xl text-sm leading-6 text-slate-400">
            Everything you need to stay organized, connected, and focused on
            your education—without unnecessary complexity.
          </p>

          <span className="shrink-0 text-xs font-semibold uppercase tracking-[0.12em] text-[#E8A33D]">
            Student focused
          </span>
        </motion.div>
      </div>
    </section>
  );
}