"use client";

import { motion } from "framer-motion";
import { Quote, Star, ArrowRight } from "lucide-react";

const testimonials = [
  {
    name: "Nicholus Turyamureba",
    role: "Software Engineering Student",
    center: "Freedom City Tech Center",
    message:
      "The Selfless Student Portal keeps all my academic information in one place. I can easily monitor my progress, receive announcements, and stay organized throughout the semester.",
  },
  {
    name: "Amah Maria",
    role: "Student",
    center: "Freedom City Tech Center",
    message:
      "The portal has made studying much easier. Everything from assignments to tutor communication is accessible whenever I need it.",
  },
  {
    name: "Tonny Kiwanuka",
    role: "Student Leader",
    center: "Freedom City Tech Center",
    message:
      "The platform improves collaboration among students and helps us stay informed about activities, schedules, and important updates.",
  },
];

const highlights = [
  {
    title: "Academic Success",
    text: "Stay focused on your educational goals.",
  },
  {
    title: "Student Community",
    text: "Connect, collaborate, and grow together.",
  },
  {
    title: "Selfless Mission",
    text: "Supporting lifelong learning through technology.",
  },
];

export default function Testimonials() {
  return (
    <section className="relative overflow-hidden bg-[#0D1117] py-14 sm:py-16 lg:py-20">
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
              Student Voices
            </span>

            <span className="h-px w-8 bg-[#E8A33D]" />
          </div>

          <h2 className="text-3xl font-bold leading-[1.1] tracking-tight text-white sm:text-4xl lg:text-[46px]">
            Built for
            <span className="block text-[#E8A33D]">
              student success.
            </span>
          </h2>

          <p className="mt-5 text-sm leading-6 text-slate-400 sm:text-base">
            See how students are using the Selfless Student Self Service
            Portal to manage their academic journey and stay connected with
            their Tech Center community.
          </p>
        </motion.div>

        {/* Testimonials */}
        <div className="mt-10 grid gap-px overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.08] lg:grid-cols-3">
          {testimonials.map((item, index) => (
            <motion.article
              key={item.name}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{
                duration: 0.35,
                delay: index * 0.06,
              }}
              className="group flex min-h-[280px] flex-col bg-[#11161D] p-5 transition-colors duration-200 hover:bg-[#151B23] sm:p-6"
            >
              {/* Quote */}
              <div className="flex items-start justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E8A33D]/20 bg-[#E8A33D]/[0.08]">
                  <Quote
                    size={17}
                    strokeWidth={1.8}
                    className="text-[#E8A33D]"
                  />
                </div>

                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={12}
                      strokeWidth={1.5}
                      fill="currentColor"
                      className="text-[#E8A33D]"
                    />
                  ))}
                </div>
              </div>

              <blockquote className="mt-5 flex-1 text-sm leading-6 text-slate-300">
                “{item.message}”
              </blockquote>

              {/* Student */}
              <div className="mt-6 border-t border-white/[0.07] pt-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E8A33D]/10 text-xs font-semibold text-[#E8A33D]">
                    {getInitials(item.name)}
                  </div>

                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold text-white">
                      {item.name}
                    </h3>

                    <p className="mt-0.5 truncate text-xs text-[#E8A33D]">
                      {item.role}
                    </p>
                  </div>
                </div>

                <p className="mt-2 pl-12 text-[11px] text-slate-500">
                  {item.center}
                </p>
              </div>
            </motion.article>
          ))}
        </div>

        {/* Closing Highlights */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mt-8 overflow-hidden rounded-xl border border-white/[0.08] bg-[#101720]"
        >
          <div className="grid lg:grid-cols-3">
            {highlights.map((item, index) => (
              <div
                key={item.title}
                className={`group p-5 sm:p-6 ${
                  index !== highlights.length - 1
                    ? "border-b border-white/[0.07] lg:border-b-0 lg:border-r"
                    : ""
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      {item.title}
                    </h3>

                    <p className="mt-1.5 text-xs leading-5 text-slate-400 sm:text-[13px]">
                      {item.text}
                    </p>
                  </div>

                  <ArrowRight
                    size={15}
                    strokeWidth={1.8}
                    className="mt-0.5 shrink-0 text-slate-600 transition-all duration-200 group-hover:translate-x-1 group-hover:text-[#E8A33D]"
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}