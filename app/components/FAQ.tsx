"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "Who can access the Selfless Student Self Service Portal?",
    answer:
      "The portal is available to registered students studying through the Selfless Tech Center Network. Each student receives secure credentials to access their academic information.",
  },
  {
    question: "Can I access the portal on my phone?",
    answer:
      "Yes. The portal is fully responsive and works seamlessly across desktop, tablet, and mobile devices.",
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
    <section className="relative bg-[#101826] py-20">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <span className="inline-flex rounded-full border border-[#E8A33D]/20 bg-[#E8A33D]/10 px-4 py-1.5 text-xs uppercase tracking-[0.25em] text-[#F2C879]">
            Frequently Asked Questions
          </span>

          <h2 className="mt-5 text-3xl md:text-5xl font-black text-white">
            Have Questions?
            <span className="block text-[#E8A33D]">
              We've Got Answers.
            </span>
          </h2>
        </motion.div>

        {/* FAQ Items */}
        <div className="mt-14 space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={faq.question}
              className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] transition-all duration-300 hover:border-[#E8A33D]/20"
            >
              <button
                onClick={() => setActive(active === index ? null : index)}
                className="flex w-full items-center justify-between px-6 py-5 text-left"
              >
                <h3 className="text-base font-semibold text-white">
                  {faq.question}
                </h3>

                <ChevronDown
                  size={18}
                  className={`transition duration-300 flex-shrink-0 ml-4 ${
                    active === index
                      ? "rotate-180 text-[#E8A33D]"
                      : "text-gray-400"
                  }`}
                />
              </button>

              <AnimatePresence>
                {active === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{
                      height: "auto",
                      opacity: 1,
                    }}
                    exit={{
                      height: 0,
                      opacity: 0,
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="px-6 pb-6 leading-7 text-gray-400 text-sm">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}