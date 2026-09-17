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

export default function HelpPage() {
  const shouldReduceMotion = useReducedMotion();

  const reveal = {
    initial: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : 14,
    },
    whileInView: {
      opacity: 1,
      y: 0,
    },
    viewport: {
      once: true,
      amount: 0.12,
    },
    transition: {
      duration: shouldReduceMotion ? 0 : 0.45,
      ease: "easeOut" as const,
    },
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
      <section className="bg-[#F1F1EC] px-5 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-18">
        <div className="mx-auto max-w-7xl">
          <motion.div
            {...reveal}
            className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20"
          >
            <div>
              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-[#B98A3E]" />

                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B98A3E]">
                  How we can help
                </p>
              </div>

              <h2 className="mt-4 max-w-lg text-3xl font-semibold leading-[1.08] tracking-[-0.04em] text-[#12203B] sm:text-4xl lg:text-[2.75rem]">
                Get the right help without searching everywhere.
              </h2>
            </div>

            <div className="max-w-2xl lg:pt-7">
              <p className="text-[15px] leading-7 text-[#5F685F]">
                Whether you are having trouble accessing the portal, need
                clarification about your studies, or are unsure where to go
                next, SELFLESS CE provides several straightforward ways to get
                support.
              </p>

              <div className="mt-6 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                {helpTopics.map((topic) => (
                  <div key={topic} className="flex items-start gap-2.5">
                    <CheckCircle2
                      size={16}
                      strokeWidth={1.8}
                      className="mt-0.5 shrink-0 text-[#55705B]"
                    />

                    <span className="text-sm font-medium leading-5 text-[#4F594F]">
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
        className="scroll-mt-20 bg-white px-5 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-18"
      >
        <div className="mx-auto max-w-7xl">
          <motion.div
            {...reveal}
            className="flex flex-col gap-5 border-b border-[#DADCD3] pb-6 lg:flex-row lg:items-end lg:justify-between"
          >
            <div>
              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-[#B98A3E]" />

                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B98A3E]">
                  Contact support
                </p>
              </div>

              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-[#12203B] sm:text-4xl">
                Choose how you want to reach us.
              </h2>
            </div>

            <p className="max-w-md text-sm leading-6 text-[#697169] lg:text-right">
              Choose the channel that matches the type of help you need.
              WhatsApp and phone support are suitable for quicker questions,
              while email works well for detailed enquiries.
            </p>
          </motion.div>

          <div className="mt-7 divide-y divide-[#DADCD3] border-y border-[#DADCD3]">
            {supportOptions.map((option, index) => {
              const Icon = option.icon;
              const isEmail = option.href.startsWith('mailto:');

              return (
                isEmail ? (
                  <a
                    key={option.title}
                    href={option.href}
                    className="group grid gap-5 py-6 transition-colors duration-200 hover:bg-[#F7F6F2] sm:grid-cols-[56px_48px_1fr_auto] sm:items-center sm:gap-5 sm:px-4 lg:grid-cols-[64px_48px_1fr_auto] lg:py-7"
                  >
                    <span className="text-xs font-semibold tabular-nums text-[#8A9088]">
                      {option.number}
                    </span>

                    <div className="flex h-11 w-11 items-center justify-center border border-[#DADCD3] bg-[#F7F6F2] text-[#55705B] transition-colors duration-200 group-hover:border-[#B98A3E]/40 group-hover:bg-white group-hover:text-[#B98A3E]">
                      <Icon size={20} strokeWidth={1.8} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <h3 className="text-lg font-semibold tracking-[-0.02em] text-[#12203B]">
                          {option.title}
                        </h3>

                        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#8A9088]">
                          {option.label}
                        </span>
                      </div>

                      <p className="mt-1.5 max-w-2xl text-sm leading-6 text-[#697169]">
                        {option.description}
                      </p>
                    </div>

                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#55705B] sm:justify-self-end">
                      {option.action}

                      <ArrowRight
                        size={16}
                        strokeWidth={1.8}
                        className="transition-transform duration-200 group-hover:translate-x-1"
                      />
                    </span>
                  </a>
                ) : (
                  <motion.a
                    key={option.title}
                    {...reveal}
                    href={option.href}
                    target={option.external ? "_blank" : undefined}
                    rel={option.external ? "noopener noreferrer" : undefined}
                    className="group grid gap-5 py-6 transition-colors duration-200 hover:bg-[#F7F6F2] sm:grid-cols-[56px_48px_1fr_auto] sm:items-center sm:gap-5 sm:px-4 lg:grid-cols-[64px_48px_1fr_auto] lg:py-7"
                  >
                    <span className="text-xs font-semibold tabular-nums text-[#8A9088]">
                      {option.number}
                    </span>

                    <div className="flex h-11 w-11 items-center justify-center border border-[#DADCD3] bg-[#F7F6F2] text-[#55705B] transition-colors duration-200 group-hover:border-[#B98A3E]/40 group-hover:bg-white group-hover:text-[#B98A3E]">
                      <Icon size={20} strokeWidth={1.8} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <h3 className="text-lg font-semibold tracking-[-0.02em] text-[#12203B]">
                          {option.title}
                        </h3>

                        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#8A9088]">
                          {option.label}
                        </span>
                      </div>

                      <p className="mt-1.5 max-w-2xl text-sm leading-6 text-[#697169]">
                        {option.description}
                      </p>
                    </div>

                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#55705B] sm:justify-self-end">
                      {option.action}

                      <ArrowRight
                        size={16}
                        strokeWidth={1.8}
                        className="transition-transform duration-200 group-hover:translate-x-1"
                      />
                    </span>
                  </motion.a>
                )
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-[#F1F1EC] px-5 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-18">
        <div className="mx-auto max-w-7xl">
          <motion.div {...reveal} className="mb-8">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-[#B98A3E]" />

              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B98A3E]">
                Frequently asked questions
              </p>
            </div>

            <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <h2 className="max-w-2xl text-3xl font-semibold leading-tight tracking-[-0.035em] text-[#12203B] sm:text-4xl">
                Find an answer before you reach out.
              </h2>

              <p className="max-w-md text-sm leading-6 text-[#697169] lg:text-right">
                Browse common questions about the portal, accounts, studies,
                and student support.
              </p>
            </div>
          </motion.div>

          <FAQ />
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-[#12203B] px-5 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-18">
        <motion.div
          {...reveal}
          className="mx-auto flex max-w-7xl flex-col gap-7 lg:flex-row lg:items-center lg:justify-between"
        >
          <div>
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-[#E8A33D]" />

              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#E8A33D]">
                Still need help?
              </p>
            </div>

            <h2 className="mt-3 max-w-2xl text-3xl font-semibold leading-tight tracking-[-0.035em] text-white sm:text-4xl">
              We can help you find the next step.
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#C5CBD1]">
              Contact the SELFLESS CE support team if you cannot find the
              information you need in the FAQ or need help with your portal
              access.
            </p>
          </div>

          <Link
            href="#support"
            className="group inline-flex w-fit shrink-0 items-center gap-2 bg-[#E8A33D] px-6 py-3.5 text-sm font-semibold text-[#12203B] transition-colors duration-200 hover:bg-white"
          >
            Contact support

            <ArrowRight
              size={17}
              strokeWidth={1.8}
              className="transition-transform duration-200 group-hover:translate-x-1"
            />
          </Link>
        </motion.div>
      </section>
    </PublicPageShell>
  );
}