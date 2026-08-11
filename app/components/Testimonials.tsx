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
  const primaryColor = '#E8A33D';
  
  return (
    <section className="relative overflow-hidden bg-[#0D1117] py-16">
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
          <h2 className="text-3xl md:text-5xl font-black text-white">
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
        <div className="mt-12 grid gap-4 lg:grid-cols-3">
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
              className="group rounded-xl border-2 border-[#E8A33D]/20 bg-[#1a1610] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#E8A33D]/40"
              style={{
                backgroundImage: `
                  linear-gradient(135deg, rgba(232, 163, 61, 0.03) 0%, transparent 50%),
                  url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='paperNoise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23paperNoise)' opacity='0.06'/%3E%3C/svg%3E")
                `,
                backgroundSize: 'cover, 400px 400px'
              }}
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

              <p className="mt-1 leading-5 text-gray-400 text-xs">
                "{item.message}"
              </p>

              <div className="mt-3 border-t border-[#E8A33D]/20 pt-3">
                <h3 className="text-sm font-bold text-white">
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
          className="mt-12 rounded-xl border-2 border-[#E8A33D]/20 p-5"
          style={{
            background: `linear-gradient(to right, ${primaryColor}15, rgba(26, 22, 16, 0.8), ${primaryColor}15)`,
            backgroundImage: `
              linear-gradient(to right, ${primaryColor}15, rgba(26, 22, 16, 0.8), ${primaryColor}15),
              url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='paperNoise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23paperNoise)' opacity='0.04'/%3E%3C/svg%3E")
            `,
            backgroundSize: '100% 100%, 400px 400px'
          }}
        >
          <div className="grid items-center gap-4 lg:grid-cols-3">
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