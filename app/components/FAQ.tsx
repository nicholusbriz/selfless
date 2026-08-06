"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "Who can access?",
    answer: "Registered students at Selfless Tech Centers.",
  },
  {
    question: "Mobile access?",
    answer: "Yes, fully responsive on all devices.",
  },
  {
    question: "What can I manage?",
    answer: "Courses, progress, attendance, announcements.",
  },
  {
    question: "Account recovery?",
    answer: "Use password recovery or contact admin.",
  },
  {
    question: "Is it secure?",
    answer: "Yes, modern security practices protect data.",
  },
];

export default function FAQ() {
  const [active, setActive] = useState<number | null>(0);

  return (
    <section className="py-4">
      <h2 className="text-lg font-semibold text-foreground mb-4">FAQ</h2>
      <div className="space-y-2">
        {faqs.map((faq, index) => (
          <div
            key={faq.question}
            className="rounded-lg border border-primary/10 bg-primary/5 transition-all duration-300 hover:border-primary/20"
          >
            <button
              onClick={() => setActive(active === index ? null : index)}
              className="flex w-full items-center justify-between px-3 py-2 text-left"
            >
              <h3 className="text-sm font-medium text-foreground">
                {faq.question}
              </h3>

              <ChevronDown
                size={16}
                className={`transition duration-300 flex-shrink-0 ml-2 ${
                  active === index
                    ? "rotate-180 text-primary"
                    : "text-muted-foreground"
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
                  transition={{ duration: 0.2 }}
                >
                  <p className="px-3 pb-2 text-xs text-muted-foreground">
                    {faq.answer}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  );
}