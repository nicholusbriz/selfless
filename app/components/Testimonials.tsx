"use client";

import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";

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

export default function Testimonials() {
  return (
    <section className="relative overflow-hidden bg-[#0D1117] py-20">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(232,163,61,.06),transparent_50%)]" />

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
            Student Stories
          </span>

          <h2 className="mt-5 text-3xl md:text-5xl font-black text-white">
            Built For
            <span className="block text-[#E8A33D]">
              Student Success
            </span>
          </h2>

          <p className="mt-4 text-base leading-7 text-gray-400">
            Hear from students using the Selfless Student Self Service Portal
            to manage their academic journey and stay connected with their
            Tech Center community.
          </p>
        </motion.div>

        {/* Testimonials Cards */}
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {testimonials.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                delay: index * 0.1,
                duration: 0.5,
              }}
              className="group rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:border-[#E8A33D]/40"
            >
              <Quote size={32} className="text-[#E8A33D]" />

              <div className="mt-4 flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={14}
                    fill="#E8A33D"
                    className="text-[#E8A33D]"
                  />
                ))}
              </div>

              <p className="mt-5 leading-7 text-gray-300 text-sm">
                "{item.message}"
              </p>

              <div className="mt-6 border-t border-white/10 pt-5">
                <h3 className="text-base font-bold text-white">
                  {item.name}
                </h3>
                <p className="mt-1 text-[#E8A33D] text-sm">
                  {item.role}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {item.center}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Banner - Simplified */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-14 rounded-2xl border border-[#E8A33D]/20 bg-gradient-to-r from-[#E8A33D]/10 via-white/[0.04] to-[#E8A33D]/10 p-6"
        >
          <div className="grid items-center gap-6 lg:grid-cols-3">
            <Stat
              title="Academic Success"
              text="Stay focused on your educational goals."
            />
            <Stat
              title="Student Community"
              text="Connect, collaborate, and grow together."
            />
            <Stat
              title="Selfless Mission"
              text="Supporting lifelong learning through technology."
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Stat({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="text-center">
      <h3 className="text-lg font-bold text-white">
        {title}
      </h3>
      <p className="mt-1 leading-6 text-gray-400 text-sm">
        {text}
      </p>
    </div>
  );
}