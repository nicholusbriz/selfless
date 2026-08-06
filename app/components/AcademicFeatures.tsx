"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  BookOpen,
  ClipboardList,
  GraduationCap,
  CalendarCheck,
  Bell,
  BarChart3,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useTenant } from "@/lib/contexts/TenantContext";

const features = [
  {
    id: 0,
    title: "Course Registration",
    description:
      "Register and manage your semester courses with an organized and streamlined enrollment experience.",
    icon: BookOpen,
    details: ["Course Selection", "Schedule Planning", "Enrollment Confirmation"],
    color: "#4F46E5",
  },
  {
    id: 1,
    title: "Assignments",
    description:
      "Keep track of upcoming assignments, submission deadlines, and completed coursework.",
    icon: ClipboardList,
    details: ["Assignment Tracking", "Deadline Alerts", "Submission History"],
    color: "#7C3AED",
  },
  {
    id: 2,
    title: "Academic Progress",
    description:
      "Monitor grades, earned credits, GPA, and overall performance throughout your studies.",
    icon: GraduationCap,
    details: ["Grade Monitoring", "Credit Tracking", "GPA Calculation"],
    color: "#EC4899",
  },
  {
    id: 3,
    title: "Attendance",
    description:
      "View attendance records and remain informed about your participation status.",
    icon: CalendarCheck,
    details: ["Attendance Records", "Participation Status", "Absence Alerts"],
    color: "#F59E0B",
  },
  {
    id: 4,
    title: "Announcements",
    description:
      "Receive important academic updates, notices, and communication from administrators.",
    icon: Bell,
    details: ["Academic Updates", "Important Notices", "Admin Communication"],
    color: "#10B981",
  },
  {
    id: 5,
    title: "Performance Analytics",
    description:
      "Understand your academic growth through easy-to-read reports and progress insights.",
    icon: BarChart3,
    details: ["Progress Reports", "Performance Insights", "Growth Analytics"],
    color: "#3B82F6",
  },
];

export default function AcademicFeatures() {
  const { currentTechCenter } = useTenant();
  const primaryColor = currentTechCenter?.color || '#000000';
  const shouldReduceMotion = useReducedMotion();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [direction, setDirection] = useState(1);
  const [isHovering, setIsHovering] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const autoResumeRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll logic
  useEffect(() => {
    if (isAutoPlaying && !isHovering && !shouldReduceMotion) {
      timeoutRef.current = setTimeout(() => {
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % features.length);
      }, 9000);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentIndex, isAutoPlaying, isHovering, shouldReduceMotion]);

  // Clean up auto-resume timeout
  useEffect(() => {
    return () => {
      if (autoResumeRef.current) {
        clearTimeout(autoResumeRef.current);
      }
    };
  }, []);

  const handleNext = () => {
    setIsAutoPlaying(false);
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % features.length);
    
    if (autoResumeRef.current) {
      clearTimeout(autoResumeRef.current);
    }
    autoResumeRef.current = setTimeout(() => {
      setIsAutoPlaying(true);
    }, 10000);
  };

  const handlePrev = () => {
    setIsAutoPlaying(false);
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + features.length) % features.length);
    
    if (autoResumeRef.current) {
      clearTimeout(autoResumeRef.current);
    }
    autoResumeRef.current = setTimeout(() => {
      setIsAutoPlaying(true);
    }, 10000);
  };

  const handleDotClick = (index: number) => {
    setIsAutoPlaying(false);
    const diff = index - currentIndex;
    setDirection(diff > 0 ? 1 : -1);
    setCurrentIndex(index);
    
    if (autoResumeRef.current) {
      clearTimeout(autoResumeRef.current);
    }
    autoResumeRef.current = setTimeout(() => {
      setIsAutoPlaying(true);
    }, 10000);
  };

  const currentFeature = features[currentIndex];
  const Icon = currentFeature.icon;

  // Premium easing
  const premiumEase = [0.22, 1, 0.36, 1] as const;

  // Slide variants with subtle motion
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 60 : -60,
      opacity: 0,
      scale: 0.96,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.9,
        ease: premiumEase as any,
      },
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -60 : 60,
      opacity: 0,
      scale: 0.96,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.7,
        ease: premiumEase as any,
      },
    }),
  };

  // Staggered child variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.15,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.6,
        ease: premiumEase as any,
      },
    },
    exit: {
      opacity: 0,
      y: -8,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.3,
        ease: premiumEase as any,
      },
    },
  };

  const chipVariants = {
    hidden: { opacity: 0, y: 10, scale: 0.96 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        delay: i * 0.06,
        duration: shouldReduceMotion ? 0 : 0.5,
        ease: premiumEase as any,
      },
    }),
    exit: {
      opacity: 0,
      y: -6,
      scale: 0.96,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.2,
        ease: premiumEase as any,
      },
    },
  };

  return (
    <section className="py-16 md:py-24 border-t border-border/50 overflow-hidden relative">
      {/* Subtle background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-3xl opacity-[0.08]"
          style={{ backgroundColor: primaryColor }}
        />
        <div 
          className="absolute top-1/3 right-0 w-[400px] h-[400px] rounded-full blur-3xl opacity-[0.05]"
          style={{ backgroundColor: primaryColor }}
        />
        <div 
          className="absolute bottom-1/3 left-0 w-[300px] h-[300px] rounded-full blur-3xl opacity-[0.04]"
          style={{ backgroundColor: primaryColor }}
        />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, ease: premiumEase }}
          className="text-center max-w-2xl mx-auto mb-16 md:mb-20"
        >
          <span 
            className="text-xs font-medium uppercase tracking-[0.2em]"
            style={{ color: primaryColor }}
          >
            Academic Excellence
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mt-4 mb-6 tracking-tight">
            Everything You Need
            <span className="block mt-1" style={{ color: primaryColor }}>
              To Stay Ahead
            </span>
          </h2>
          <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-xl mx-auto">
            Focus on learning while the portal keeps everything organized.
            From course registration to graduation tracking, every academic
            tool is available within one secure platform.
          </p>
        </motion.div>

        {/* Carousel Container */}
        <div 
          className="relative max-w-3xl mx-auto"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {/* Card Display - One at a time with premium animation */}
          <div className="relative min-h-[420px] md:min-h-[400px]">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="absolute inset-0"
              >
                <div 
                  className="rounded-3xl p-8 md:p-12 h-full backdrop-blur-sm"
                  style={{ 
                    border: `1px solid ${currentFeature.color}20`,
                    background: `linear-gradient(145deg, ${currentFeature.color}06, rgba(255,255,255,0.98))`,
                    boxShadow: `
                      0 1px 3px rgba(0,0,0,0.02),
                      0 8px 32px rgba(0,0,0,0.04),
                      0 24px 80px -16px ${currentFeature.color}25
                    `,
                  }}
                >
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="flex flex-col md:flex-row md:items-start gap-8 md:gap-10 h-full"
                  >
                    {/* Icon */}
                    <motion.div 
                      variants={itemVariants}
                      className="flex-shrink-0"
                    >
                      <motion.div 
                        className="w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center"
                        style={{ 
                          backgroundColor: `${currentFeature.color}12`,
                          color: currentFeature.color,
                          border: `1px solid ${currentFeature.color}15`,
                        }}
                        whileHover={{ 
                          scale: 1.04,
                          transition: { duration: 0.3, ease: premiumEase }
                        }}
                      >
                        <Icon size={36} className="md:w-10 md:h-10" />
                      </motion.div>
                    </motion.div>

                    {/* Content */}
                    <div className="flex-1 space-y-5 md:space-y-6">
                      {/* Title */}
                      <motion.h3 
                        variants={itemVariants}
                        className="text-3xl md:text-4xl font-bold tracking-tight"
                        style={{ color: currentFeature.color }}
                      >
                        {currentFeature.title}
                      </motion.h3>

                      {/* Description */}
                      <motion.p 
                        variants={itemVariants}
                        className="text-muted-foreground text-base md:text-lg leading-relaxed"
                      >
                        {currentFeature.description}
                      </motion.p>

                      {/* Divider */}
                      <motion.div 
                        variants={itemVariants}
                        className="w-16 h-px rounded-full"
                        style={{ backgroundColor: `${currentFeature.color}20` }}
                      />

                      {/* Feature Chips */}
                      <motion.div 
                        variants={itemVariants}
                        className="flex flex-wrap gap-3 pt-1"
                      >
                        {currentFeature.details.map((detail, index) => (
                          <motion.span
                            key={detail}
                            custom={index}
                            variants={chipVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            whileHover={{ 
                              scale: 1.04,
                              backgroundColor: `${currentFeature.color}12`,
                              borderColor: `${currentFeature.color}30`,
                              transition: { duration: 0.2, ease: premiumEase as any }
                            }}
                            className="px-4 py-2 rounded-full text-sm font-medium border transition-colors cursor-default"
                            style={{ 
                              borderColor: `${currentFeature.color}15`,
                              backgroundColor: `${currentFeature.color}06`,
                              color: currentFeature.color,
                            }}
                          >
                            {detail}
                          </motion.span>
                        ))}
                      </motion.div>

                      {/* Counter */}
                      <motion.div 
                        variants={itemVariants}
                        className="text-sm text-muted-foreground/60 font-medium tracking-wider pt-2"
                      >
                        {String(currentIndex + 1).padStart(2, '0')} / {String(features.length).padStart(2, '0')}
                      </motion.div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Progress Bar */}
          <motion.div 
            className="absolute -bottom-6 left-0 right-0 h-[2px] rounded-full overflow-hidden"
            style={{ backgroundColor: `${primaryColor}08` }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: primaryColor }}
              initial={{ width: "0%" }}
              animate={{ 
                width: (isAutoPlaying && !isHovering && !shouldReduceMotion) ? "100%" : "0%",
              }}
              transition={{
                duration: 9,
                ease: "linear",
              }}
              key={currentIndex}
            />
          </motion.div>

          {/* Navigation Controls */}
          <div className="flex justify-between items-center mt-12 md:mt-14">
            <div className="flex gap-2">
              <motion.button
                whileHover={{ 
                  scale: 1.05,
                  backgroundColor: `${primaryColor}08`,
                  borderColor: `${primaryColor}30`,
                }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePrev}
                className="p-3 rounded-full border transition-all duration-200"
                style={{ 
                  borderColor: `${primaryColor}15`,
                  color: primaryColor,
                }}
                aria-label="Previous card"
              >
                <ChevronLeft size={20} />
              </motion.button>
              <motion.button
                whileHover={{ 
                  scale: 1.05,
                  backgroundColor: `${primaryColor}08`,
                  borderColor: `${primaryColor}30`,
                }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNext}
                className="p-3 rounded-full border transition-all duration-200"
                style={{ 
                  borderColor: `${primaryColor}15`,
                  color: primaryColor,
                }}
                aria-label="Next card"
              >
                <ChevronRight size={20} />
              </motion.button>
            </div>

            {/* Dot Indicators */}
            <div className="flex gap-2 md:gap-2.5">
              {features.map((_, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleDotClick(index)}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: currentIndex === index ? 28 : 8,
                    height: 8,
                    backgroundColor: currentIndex === index ? primaryColor : `${primaryColor}20`,
                  }}
                  aria-label={`Go to card ${index + 1}`}
                />
              ))}
            </div>

            {/* Auto-play indicator */}
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground/50 font-medium">
              <motion.div
                animate={{ 
                  opacity: (isAutoPlaying && !isHovering && !shouldReduceMotion) ? 1 : 0.3,
                  scale: (isAutoPlaying && !isHovering && !shouldReduceMotion) ? [1, 1.2, 1] : 1,
                }}
                transition={{ 
                  duration: 2,
                  repeat: (isAutoPlaying && !isHovering && !shouldReduceMotion) ? Infinity : 0,
                  ease: "easeInOut"
                }}
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: primaryColor }}
              />
              <span>Auto</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}