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
  const primaryColor = '#E8A33D';

  return (
    <section className="relative bg-[#101826] py-16">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-3xl md:text-5xl font-black text-white">
            Have Questions?
            <span className="block text-[#E8A33D]">
              We've Got Answers.
            </span>
          </h2>
        </motion.div>

        {/* FAQ Items */}
        <div className="mt-12 space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={faq.question}
              className="overflow-hidden rounded-xl border-2 border-[#E8A33D]/20 bg-[#1a1610] transition-all duration-300 hover:border-[#E8A33D]/30"
              style={{
                backgroundImage: `
                  linear-gradient(135deg, rgba(232, 163, 61, 0.03) 0%, transparent 50%),
                  url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='paperNoise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23paperNoise)' opacity='0.06'/%3E%3C/svg%3E")
                `,
                backgroundSize: 'cover, 400px 400px'
              }}
            >
              <button
                onClick={() => setActive(active === index ? null : index)}
                className="flex w-full items-center justify-between px-5 py-4 text-left"
              >
                <h3 className="text-sm font-semibold text-white">
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
                    <p className="px-5 pb-5 leading-6 text-gray-400 text-sm">
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