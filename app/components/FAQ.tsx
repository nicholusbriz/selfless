"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "Who can access the Selfless Student Self Service Portal?",
    answer:
      "The portal is available to registered students studying through the Selfless Tech Center Network. Each student receives secure credentials to access their academic information.",
  },
  {
    question: "Can I access the portal on my phone?",
    answer:
      "Yes. The portal is fully responsive and works across desktop, tablet, and mobile devices, so you can stay connected wherever you are.",
  },
  {
    question: "What can I manage from the portal?",
    answer:
      "Students can register courses, monitor academic progress, view attendance, receive announcements, communicate with tutors, join study groups, and manage their learning journey from one place.",
  },
  {
    question: "How do I recover my account?",
    answer:
      "If you've forgotten your password or cannot access your account, use the password recovery option or contact your Tech Center administrator for assistance.",
  },
  {
    question: "Is my academic information secure?",
    answer:
      "Yes. Your academic records and personal information are securely stored and protected using modern security practices.",
  },
];

export default function FAQ() {
  const [active, setActive] = useState<number | null>(0);

  return (
    <section className="relative overflow-hidden bg-[#101826] py-14 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-4xl px-5 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.4 }}
          className="text-center"
        >
          <div className="mb-4 flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-[#E8A33D]" />

            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#E8A33D]">
              Frequently Asked Questions
            </span>

            <span className="h-px w-8 bg-[#E8A33D]" />
          </div>

          <h2 className="text-3xl font-bold leading-[1.1] tracking-tight text-white sm:text-4xl lg:text-[44px]">
            Have questions?
            <span className="block text-[#E8A33D]">
              We&apos;ve got answers.
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
            Find quick answers to common questions about accessing and using
            the Selfless Student Self Service Portal.
          </p>
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.45, delay: 0.08 }}
          className="mt-9 overflow-hidden rounded-xl border border-white/[0.08] bg-[#0D141E]"
        >
          {faqs.map((faq, index) => {
            const isActive = active === index;
            const answerId = `faq-answer-${index}`;

            return (
              <div
                key={faq.question}
                className={
                  index !== faqs.length - 1
                    ? "border-b border-white/[0.07]"
                    : ""
                }
              >
                <button
                  type="button"
                  onClick={() =>
                    setActive(isActive ? null : index)
                  }
                  aria-expanded={isActive}
                  aria-controls={answerId}
                  className={`group flex w-full items-center gap-4 px-4 py-4 text-left transition-colors duration-200 sm:px-5 sm:py-[18px] ${
                    isActive
                      ? "bg-[#151C25]"
                      : "hover:bg-[#131A23]"
                  }`}
                >
                  {/* Number */}
                  <span
                    className={`hidden h-7 w-7 shrink-0 items-center justify-center rounded-md text-[10px] font-semibold sm:flex ${
                      isActive
                        ? "bg-[#E8A33D]/10 text-[#E8A33D]"
                        : "bg-white/[0.04] text-slate-600"
                    }`}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  {/* Question */}
                  <span
                    className={`flex-1 text-sm font-medium transition-colors duration-200 sm:text-[15px] ${
                      isActive
                        ? "text-white"
                        : "text-slate-300 group-hover:text-white"
                    }`}
                  >
                    {faq.question}
                  </span>

                  {/* Icon */}
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border transition-all duration-200 ${
                      isActive
                        ? "border-[#E8A33D]/20 bg-[#E8A33D]/10 text-[#E8A33D]"
                        : "border-white/[0.07] text-slate-500 group-hover:border-white/[0.12] group-hover:text-slate-300"
                    }`}
                  >
                    <ChevronDown
                      size={15}
                      strokeWidth={2}
                      className={`transition-transform duration-300 ${
                        isActive ? "rotate-180" : ""
                      }`}
                    />
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isActive && (
                    <motion.div
                      id={answerId}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{
                        height: {
                          duration: 0.25,
                          ease: "easeOut",
                        },
                        opacity: {
                          duration: 0.18,
                        },
                      }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-5 sm:pl-[76px] sm:pr-14">
                        <div className="border-l border-[#E8A33D]/30 pl-4">
                          <p className="text-xs leading-6 text-slate-400 sm:text-[13px]">
                            {faq.answer}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </motion.div>

        {/* Bottom Help */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35, delay: 0.15 }}
          className="mt-6 flex items-center gap-3 rounded-lg border border-white/[0.06] bg-[#0D141E] px-4 py-3.5"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#E8A33D]/[0.08] text-[#E8A33D]">
            <HelpCircle size={16} strokeWidth={1.8} />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-300">
              Still need help?
            </p>

            <p className="mt-0.5 text-[11px] leading-5 text-slate-500">
              Contact your Tech Center administrator for assistance with your
              student account.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}