"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Image from "next/image";
import { useState } from "react";

export default function CoverContent() {
  const [isHovered, setIsHovered] = useState(false);

  // Deterministic particle positions to avoid hydration mismatch
  const particlePositions = [
    { x: 25, y: 61 },
    { x: 67, y: 55 },
    { x: 95, y: 4 },
    { x: 90, y: 45 },
    { x: 48, y: 35 },
    { x: 22, y: 23 },
    { x: 84, y: 81 },
    { x: 9, y: 49 },
  ];

  // Mouse follow tilt effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["5deg", "-5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-5deg", "5deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = (e.clientX - rect.left) / width - 0.5;
    const mouseY = (e.clientY - rect.top) / height - 0.5;
    x.set(mouseX);
    y.set(mouseY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <section className="relative min-h-[80vh] flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0D1117] via-[#111827] to-[#171F2E]" />

      {/* Ambient Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(232,163,61,0.12),transparent_35%)]" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#E8A33D]/5 blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-[#E8A33D]/5 blur-[120px]" />

      {/* Animated Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particlePositions.map((pos, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-[#E8A33D]/20"
            initial={{
              x: pos.x + "%",
              y: pos.y + "%",
            }}
            animate={{
              y: [null, "-20%", "20%", null],
              x: [null, "10%", "-10%", null],
            }}
            transition={{
              duration: 10 + (i * 1.5),
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.025)_1px,transparent_1px)] bg-[size:60px_60px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 w-full">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center lg:text-left"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.1] tracking-tight mb-8">
              <span className="text-white">Student</span>
              <span className="block text-[#E8A33D] mt-1">
                Self Service
              </span>
              <span className="block text-white/90 mt-1">
                Portal
              </span>
            </h1>

            <p className="text-base md:text-lg leading-relaxed text-gray-300 max-w-2xl mx-auto lg:mx-0 mb-4">
              Everything you need to manage your academic journey from one
              intelligent platform. Register courses, monitor your progress,
              collaborate with peers, and receive tutor feedback — all in one
              place.
            </p>

            <p className="text-sm md:text-base text-gray-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Built exclusively for students studying through the{" "}
              <span className="text-[#E8A33D] font-semibold">
                Selfless Tech Center Network
              </span>
              , connecting learning, collaboration, and student success into
              one seamless experience.
            </p>
          </motion.div>

          {/* Right Side - Enhanced Image with Interactivity */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex items-center justify-center"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onMouseEnter={() => setIsHovered(true)}
          >
            <div className="relative w-full max-w-md lg:max-w-lg">
              {/* Animated Glow Background */}
              <motion.div
                className="absolute -inset-6 bg-gradient-to-r from-[#E8A33D]/20 via-[#C97F1F]/10 to-[#E8A33D]/20 rounded-3xl blur-2xl"
                animate={{
                  scale: isHovered ? 1.1 : 1,
                  opacity: isHovered ? 0.8 : 0.5,
                }}
                transition={{ duration: 0.5 }}
              />

              {/* Image Container with 3D Tilt */}
              <motion.div
                className="relative rounded-2xl overflow-hidden border border-[#E8A33D]/20 shadow-2xl shadow-[#E8A33D]/10"
                style={{
                  rotateX: rotateX,
                  rotateY: rotateY,
                  transformStyle: "preserve-3d",
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {/* Shine/Reflection Overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none z-10" />
                
                {/* Animated Border Glow */}
                <motion.div
                  className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-[#E8A33D] via-[#C97F1F] to-[#E8A33D] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  animate={{
                    opacity: isHovered ? 1 : 0,
                  }}
                />

                <Image
                  src="/student-portal.png"
                  alt="Student Portal Dashboard"
                  width={600}
                  height={400}
                  className="w-full h-auto object-cover relative z-0"
                  priority
                />

                {/* Bottom Gradient Overlay */}
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0D1117] to-transparent pointer-events-none" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}