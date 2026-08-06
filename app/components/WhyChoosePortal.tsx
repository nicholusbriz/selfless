"use client";

import { motion } from "framer-motion";
import {
  Clock3,
  ShieldCheck,
  Smartphone,
  Globe,
  Layers3,
  Sparkles,
} from "lucide-react";

const reasons = [
  { icon: Clock3, title: "Save Time" },
  { icon: ShieldCheck, title: "Secure" },
  { icon: Smartphone, title: "Anywhere" },
  { icon: Globe, title: "Connected" },
  { icon: Layers3, title: "All-In-One" },
  { icon: Sparkles, title: "Student-First" },
];

export default function WhyChoosePortal() {
  return (
    <section className="py-4">
      <h2 className="text-lg font-semibold text-foreground mb-4">Why Choose</h2>
      <div className="space-y-2">
        {reasons.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-primary/5 transition-colors"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Icon size={16} />
              </div>
              <span className="text-sm font-medium text-foreground">{item.title}</span>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}