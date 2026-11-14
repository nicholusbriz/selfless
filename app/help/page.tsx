"use client";

export const dynamic = 'force-dynamic';

import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Mail,
  MessageCircle,
  Phone,
} from "lucide-react";
import Link from "next/link";
import Footer from "@/app/components/Footer";

const supportOptions = [
  {
    number: "01",
    title: "WhatsApp",
    label: "Quick support",
    description:
      "Chat directly with the support team for quick guidance, account questions, or help navigating the portal.",
    action: "Open WhatsApp",
    href: "https://wa.me/256761996296",
    icon: MessageCircle,
    external: true,
  },
  {
    number: "02",
    title: "Call support",
    label: "Direct assistance",
    description:
      "Speak with the support team when your issue is easier to explain or requires direct assistance.",
    action: "Call support",
    href: "tel:+256761996296",
    icon: Phone,
    external: false,
  },
  {
    number: "03",
    title: "Email",
    label: "Detailed enquiries",
    description:
      "Send a detailed message when you need to explain an issue or provide additional information.",
    action: "Send an email",
    href: "mailto:turyamurebanicholus@gmail.com",
    icon: Mail,
    external: false,
  },
];

const helpTopics = [
  "Account and portal access",
  "Courses and academic progress",
  "Tutor and student support",
  "Tech center information",
];

/* =========================================================
   SLIDE ANIMATIONS
========================================================= */

const slideInLeft = {
  hidden: { opacity: 0, x: -28 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const slideInRight = {
  hidden: { opacity: 0, x: 28 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const slideInUp = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const staggerFast = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

const INK = "#111827";
const BODY = "#111827";

export default function HelpPage() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="min-h-screen bg-[#F7F6F2] text-[#111827]">
      <main>
        {/* =====================================================
            SINGLE SECTION
        ====================================================== */}
        <section className="px-5 pb-16 pt-10 sm:px-8 sm:pb-20 sm:pt-14 lg:px-12 lg:pb-24">
          <motion.div
            initial={shouldReduceMotion ? false : "hidden"}
            animate="visible"
            variants={stagger}
            className="mx-auto w-full max-w-7xl"
          >
            <motion.div variants={slideInLeft}>
              <SectionLabel label="Support Center" />
            </motion.div>

            <div className="mt-6 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-14">
              <motion.h1
                variants={slideInLeft}
                className="max-w-4xl text-5xl font-bold leading-[0.98] tracking-[-0.045em] sm:text-6xl lg:text-[4.2rem]"
                style={{ color: INK }}
              >
                Need a hand? Start here.
              </motion.h1>

              <motion.div variants={slideInRight} className="max-w-xl lg:pb-2">
                <p
                  className="text-base leading-7 sm:text-lg sm:leading-8"
                  style={{ color: BODY }}
                >
                  Find answers to common questions or contact the Selfless
                  team for help with your account, courses, and portal
                  access.
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-x-7 gap-y-4">
                  <a
                    href="#support"
                    className="group inline-flex items-center gap-2 text-sm font-bold transition-opacity hover:opacity-70"
                    style={{ color: INK }}
                  >
                    <span
                      className=""
                      
                    >
                      Contact support
                    </span>

                    <ArrowRight
                      size={16}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                      style={{ color: INK }}
                    />
                  </a>

                  <Link
                    href="/about"
                    className="text-sm font-semibold transition-opacity hover:opacity-70"
                    style={{ color: "#111827" }}
                  >
                    About Selfless
                  </Link>
                </div>
              </motion.div>
            </div>

            {/* What we can help with */}
            <motion.div
              variants={slideInLeft}
              className="mt-14 max-w-3xl"
            >
              <p
                className="text-[11px] font-bold uppercase tracking-[0.2em]"
                style={{ color: "#111827" }}
              >
                How we can help
              </p>

              <h2
                className="mt-3 text-2xl font-bold tracking-[-0.03em] sm:text-3xl"
                style={{ color: INK }}
              >
                Get the right help without searching everywhere.
              </h2>

              <p className="mt-3 text-sm leading-7 sm:text-base" style={{ color: BODY }}>
                Whether you are having trouble accessing the portal, need
                clarification about your studies, or are unsure where to go
                next, Selfless provides several straightforward ways to get
                support.
              </p>

              <div className="mt-6 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                {helpTopics.map((topic) => (
                  <div key={topic} className="flex items-start gap-2.5">
                    <CheckCircle2
                      size={16}
                      strokeWidth={1.8}
                      className="mt-0.5 shrink-0"
                      style={{ color: INK }}
                    />

                    <span className="text-sm font-medium leading-5" style={{ color: BODY }}>
                      {topic}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Contact options */}
            <div id="support" className="mt-16 scroll-mt-24">
              <motion.div variants={slideInLeft}>
                <p
                  className="text-[11px] font-bold uppercase tracking-[0.2em]"
                  style={{ color: "#111827" }}
                >
                  Contact support
                </p>

                <h2
                  className="mt-3 text-2xl font-bold tracking-[-0.03em] sm:text-3xl"
                  style={{ color: INK }}
                >
                  Choose how you want to reach us.
                </h2>

                <p className="mt-3 max-w-2xl text-sm leading-7" style={{ color: BODY }}>
                  Choose the channel that matches the type of help you need.
                  WhatsApp and phone support are suitable for quicker
                  questions, while email works well for detailed enquiries.
                </p>
              </motion.div>

              <motion.div
                variants={staggerFast}
                className="mt-8 grid gap-5 md:grid-cols-3"
              >
                {supportOptions.map((option) => {
                  const Icon = option.icon;
                  const isEmail = option.href.startsWith("mailto:");

                  const content = (
                    <>
                      <div className="flex items-center gap-3">
                        <span
                          className="font-mono text-[10px] font-bold tracking-[0.18em]"
                          style={{ color: "#111827" }}
                        >
                          {option.number}
                        </span>
                        <Icon size={18} strokeWidth={1.8} style={{ color: INK }} />
                      </div>

                      <h3
                        className="mt-4 text-[16px] font-bold tracking-[-0.015em]"
                        style={{ color: INK }}
                      >
                        {option.title}
                      </h3>

                      <p
                        className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em]"
                        style={{ color: "#111827" }}
                      >
                        {option.label}
                      </p>

                      <p className="mt-3 text-[13px] leading-6" style={{ color: BODY }}>
                        {option.description}
                      </p>

                      <span
                        className="mt-5 inline-flex items-center gap-2 text-[13px] font-bold"
                        style={{ color: INK }}
                      >
                        {option.action}
                        <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
                      </span>
                    </>
                  );

                  const cardClass =
                    "group block rounded-2xl p-6 transition-all duration-300 hover:-translate-y-0.5";
                  const cardStyle = {
                    backgroundColor: "rgba(255,255,255,0.6)",
                  } as const;

                  return isEmail ? (
                    <a
                      key={option.title}
                      href={option.href}
                      className={cardClass}
                      style={cardStyle}
                    >
                      {content}
                    </a>
                  ) : (
                    <a
                      key={option.title}
                      href={option.href}
                      target={option.external ? "_blank" : undefined}
                      rel={option.external ? "noopener noreferrer" : undefined}
                      className={cardClass}
                      style={cardStyle}
                    >
                      {content}
                    </a>
                  );
                })}
              </motion.div>
            </div>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

/* =========================================================
   SECTION LABEL
========================================================= */

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">

      <p
        className="text-[10px] font-bold uppercase tracking-[0.22em]"
        style={{ color: INK }}
      >
        {label}
      </p>
    </div>
  );
}
