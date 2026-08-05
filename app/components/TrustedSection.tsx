// components/home/TrustedSection.tsx

"use client";

import { motion } from "framer-motion";
import { useTenant } from "@/lib/contexts/TenantContext";

export default function TrustedSection() {
  const { currentTechCenter, isTenantView } = useTenant();

  return (
    <section className="py-20 bg-[#0F172A]">

      <div className="max-w-6xl mx-auto px-6">

        <motion.div

          initial={{opacity:0,y:30}}
          whileInView={{opacity:1,y:0}}
          viewport={{once:true}}

          className="text-center"

        >

          <p 
            className="uppercase tracking-[0.3em] text-sm"
            style={{ color: isTenantView ? currentTechCenter?.color : '#E8A33D' }}
          >
            {isTenantView ? 'Welcome to' : 'Trusted Across'}
          </p>

          <h2 className="mt-4 text-4xl font-bold text-white">

            {isTenantView 
              ? `${currentTechCenter?.displayName} Tech Center`
              : 'The SELFLESS Tech Center Network'
            }

          </h2>

          <p className="mt-5 max-w-3xl mx-auto text-gray-400 leading-8">

            {isTenantView 
              ? `Part of the broader SELFLESS CE network, ${currentTechCenter?.displayName} provides specialized technical education and BYU-Idaho courses with local support and community engagement.`
              : 'Designed to support students across SELFLESS learning communities, providing one unified platform for academic success, collaboration, and student engagement.'
            }

          </p>

        </motion.div>

      </div>

    </section>
  );
}