"use client";

import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";

const testimonials = [
  {
    name: "Nicholus T.",
    message: "Keeps all my academic info in one place.",
  },
  {
    name: "Amah M.",
    message: "Made studying much easier.",
  },
  {
    name: "Tonny K.",
    message: "Improves collaboration among students.",
  },
];

export default function Testimonials() {
  return (
    <section className="py-4">
      <h2 className="text-lg font-semibold text-foreground mb-4">Testimonials</h2>
      <div className="space-y-3">
        {testimonials.map((item, index) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, x: 10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            className="p-3 rounded-lg bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-colors"
          >
            <div className="flex items-start gap-3">
              <Quote size={16} className="text-primary flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-foreground">{item.message}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs font-medium text-primary">{item.name}</span>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={10}
                        fill="var(--primary)"
                        className="text-primary"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}