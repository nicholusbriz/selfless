"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Mail,
  MessageCircle,
  Phone,
} from "lucide-react";
import Link from "next/link";

import FAQ from "@/app/components/FAQ";
import PublicPageHero from "@/app/components/PublicPageHero";
import PublicPageShell from "@/app/components/PublicPageShell";

const supportOptions = [
  {
    title: "WhatsApp",
    description:
      "Chat directly with the support team when you need quick guidance.",
    action: "Open WhatsApp",
    href: "https://wa.me/256761996296",
    icon: MessageCircle,
  },
  {
    title: "Call us",
    description:
      "Speak with the support team when your issue needs direct assistance.",
    action: "Call support",
    href: "tel:+256761996296",
    icon: Phone,
  },
  {
    title: "Email",
    description:
      "Send a detailed message about your account, courses, or portal access.",
    action: "Send an email",
    href: "mailto:turyamurebanicholus@gmail.com",
    icon: Mail,
  },
];

const helpTopics = [
  "Account and portal access",
  "Courses and academic progress",
  "Tutor and student support",
  "Tech center information",
];

export default function HelpPage() {
  const shouldReduceMotion = useReducedMotion();

  const reveal = {
    initial: { opacity: 0, y: shouldReduceMotion ? 0 : 18 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.15 },
    transition: { duration: 0.5, ease: "easeOut" as const },
  };

  return (
    <PublicPageShell>
      <PublicPageHero
        eyebrow="Support center"
        title="Need a hand? Start here."
        description="Find answers to common questions or contact the SELFLESS CE team for help with your account, courses, and portal access."
        actionHref="#support"
        actionLabel="Contact support"
      />

      {/* INTRODUCTION */}
      <section className="bg-[#F1F1EC] px-5 py-14 sm:px-8 sm:py-18 lg:px-12 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <motion.div
            {...reveal}
            className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end lg:gap-20"
          >
            <div>
              <div className="flex items-center gap-3">
                <span className="h-px w-9 bg-[#B98A3E]" />
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#B98A3E]">
                  How we can help
                </p>
              </div>

              <h2 className="mt-5 max-w-xl text-3xl font-semibold leading-[1.08] tracking-[-0.04em] text-[#12203B] sm:text-4xl lg:text-[3rem]">
                Get the right help without searching everywhere.
              </h2>
            </div>

            <div className="max-w-2xl">
              <p className="text-[15px] leading-7 text-[#5F685F]">
                Whether you are having trouble accessing the portal, need
                clarification about your studies, or simply need to know where
                to go next, SELFLESS CE provides several ways to get support.
              </p>

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {helpTopics.map((topic) => (
                  <div key={topic} className="flex items-start gap-3">
                    <CheckCircle2
                      size={17}
                      strokeWidth={1.8}
                      className="mt-0.5 shrink-0 text-[#55705B]"
                    />
                    <span className="text-sm font-medium text-[#4F594F]">
                      {topic}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SUPPORT OPTIONS */}
      <section
        id="support"
        className="scroll-mt-20 bg-white px-5 py-14 sm:px-8 sm:py-18 lg:px-12 lg:py-20"
      >
        <div className="mx-auto max-w-7xl">
          <motion.div {...reveal}>
            <div className="flex flex-col justify-between gap-5 border-b border-[#DADCD3] pb-7 lg:flex-row lg:items-end">
              <div>
                <div className="flex items-center gap-3">
                  <span className="h-px w-9 bg-[#B98A3E]" />
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#B98A3E]">
                    Contact support
                  </p>
                </div>

                <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-[#12203B] sm:text-4xl">
                  Choose how you want to reach us.
                </h2>
              </div>

              <p className="max-w-md text-sm leading-6 text-[#697169] lg:text-right">
                Use the option that best fits your question. For quick issues,
                WhatsApp or a phone call may be the fastest route.
              </p>
            </div>
          </motion.div>

          <div className="mt-8 grid gap-4 lg:grid-cols-[1.15fr_0.85fr_0.85fr]">
            {/* WHATSAPP — PRIMARY */}
            <motion.a
              {...reveal}
              href={supportOptions[0].href}
              target="_blank"
              rel="noreferrer"
              className="group relative overflow-hidden bg-[#12203B] p-7 transition-transform duration-300 hover:-translate-y-1 sm:p-8"
            >
              <div className="absolute right-0 top-0 h-32 w-32 translate-x-10 -translate-y-10 rounded-full bg-[#B98A3E]/10" />

              <div className="relative flex h-full flex-col">
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center border border-[#E8A33D]/30 bg-[#E8A33D]/10 text-[#E8A33D]">
                    <MessageCircle size={21} strokeWidth={1.8} />
                  </div>

                  <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#E8A33D]">
                    Recommended
                  </span>
                </div>

                <div className="mt-12">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/50">
                    Quick support
                  </p>

                  <h3 className="mt-2 text-2xl font-semibold tracking-[-0.025em] text-white">
                    WhatsApp
                  </h3>

                  <p className="mt-3 max-w-md text-sm leading-6 text-white/65">
                    Chat directly with the support team when you need quick
                    guidance or help navigating the portal.
                  </p>
                </div>

                <div className="mt-8 flex items-center gap-2 text-sm font-semibold text-[#E8A33D]">
                  Open WhatsApp
                  <ArrowRight
                    size={16}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </div>
              </div>
            </motion.a>

            {/* CALL */}
            <motion.a
              {...reveal}
              href={supportOptions[1].href}
              className="group border border-[#DADCD3] bg-[#F7F6F2] p-7 transition-all duration-300 hover:-translate-y-1 hover:border-[#B98A3E]/50 hover:bg-white sm:p-8"
            >
              <div className="flex h-11 w-11 items-center justify-center border border-[#B98A3E]/25 bg-[#B98A3E]/10 text-[#B98A3E]">
                <Phone size={21} strokeWidth={1.8} />
              </div>

              <h3 className="mt-8 text-xl font-semibold tracking-[-0.02em] text-[#12203B]">
                Call us
              </h3>

              <p className="mt-3 text-sm leading-6 text-[#697169]">
                Speak directly with the support team when your issue needs
                immediate attention.
              </p>

              <div className="mt-7 flex items-center gap-2 text-sm font-semibold text-[#55705B]">
                Call support
                <ArrowRight
                  size={16}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </div>
            </motion.a>

            {/* EMAIL */}
            <motion.a
              {...reveal}
              href={supportOptions[2].href}
              className="group border border-[#DADCD3] bg-[#F7F6F2] p-7 transition-all duration-300 hover:-translate-y-1 hover:border-[#B98A3E]/50 hover:bg-white sm:p-8"
            >
              <div className="flex h-11 w-11 items-center justify-center border border-[#55705B]/20 bg-[#55705B]/10 text-[#55705B]">
                <Mail size={21} strokeWidth={1.8} />
              </div>

              <h3 className="mt-8 text-xl font-semibold tracking-[-0.02em] text-[#12203B]">
                Email
              </h3>

              <p className="mt-3 text-sm leading-6 text-[#697169]">
                Send a detailed message when you need to explain your issue or
                include additional information.
              </p>

              <div className="mt-7 flex items-center gap-2 text-sm font-semibold text-[#55705B]">
                Send an email
                <ArrowRight
                  size={16}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </div>
            </motion.a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-[#F1F1EC] px-5 py-14 sm:px-8 sm:py-18 lg:px-12 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <motion.div {...reveal} className="mb-10">
            <div className="flex items-center gap-3">
              <span className="h-px w-9 bg-[#B98A3E]" />
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#B98A3E]">
                Frequently asked questions
              </p>
            </div>

            <div className="mt-4 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
              <h2 className="max-w-2xl text-3xl font-semibold leading-tight tracking-[-0.035em] text-[#12203B] sm:text-4xl">
                Find an answer before you reach out.
              </h2>

              <p className="max-w-md text-sm leading-6 text-[#697169] lg:text-right">
                Browse the common questions below for quick answers about the
                portal and student experience.
              </p>
            </div>
          </motion.div>

          <FAQ />
        </div>
      </section>

      {/* FINAL DARK CTA */}
      <section className="bg-[#12203B] px-5 py-14 sm:px-8 sm:py-18 lg:px-12 lg:py-20">
        <motion.div
          {...reveal}
          className="mx-auto flex max-w-7xl flex-col gap-8 lg:flex-row lg:items-center lg:justify-between"
        >
          <div>
            <div className="flex items-center gap-3">
              <span className="h-px w-9 bg-[#E8A33D]" />
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#E8A33D]">
                Still need help?
              </p>
            </div>

            <h2 className="mt-4 max-w-2xl text-3xl font-semibold leading-tight tracking-[-0.035em] text-white sm:text-4xl">
              You do not have to figure it out alone.
            </h2>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#C5CBD1]">
              Contact the SELFLESS CE support team and we will help you find
              the right next step.
            </p>
          </div>

          <Link
            href="#support"
            className="group inline-flex w-fit shrink-0 items-center gap-2 bg-[#E8A33D] px-6 py-3.5 text-sm font-semibold text-[#12203B] transition-all duration-300 hover:bg-white"
          >
            Contact support
            <ArrowRight
              size={17}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </motion.div>
      </section>
    </PublicPageShell>
  );
}

