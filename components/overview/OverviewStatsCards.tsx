'use client';

import { useState, useEffect, memo } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { Users, BookOpen, Award, GraduationCap, TrendingUp, TrendingDown, ArrowUp, ArrowDown } from 'lucide-react';

interface StatItem {
  id: string;
  icon: any;
  title: string;
  value: string | number;
  subtitle: string;
  iconColor: string;
  gradient: string;
  trend?: {
    value: number;
    isPositive: boolean;
    period: string;
  };
  progress?: number;
  capacity?: number;
}

interface OverviewStatsCardsProps {
  stats: StatItem[];
}

function AnimatedCounter({ value, duration = 1.5 }: { value: number, duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0);
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    const controls = animate(count, value, { duration });
    return controls.stop;
  }, [count, value, duration]);

  useEffect(() => {
    const unsubscribe = rounded.on('change', (v) => setDisplayValue(v));
    return unsubscribe;
  }, [rounded]);

  return <span>{displayValue}</span>;
}

const AnimatedCounterMemo = memo(AnimatedCounter);

function OverviewStatsCards({ stats }: OverviewStatsCardsProps) {
  return (
    <motion.div
      className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
      }}
      initial="hidden"
      animate="visible"
    >
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const hasTrend = stat.trend !== undefined;
        const hasProgress = stat.progress !== undefined;
        
        return (
          <motion.div
            key={stat.id}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 }
            }}
            whileHover={{ 
              scale: 1.05, 
              y: -5,
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.98 }}
            className={`bg-gradient-to-r ${stat.gradient} backdrop-blur-lg rounded-xl p-4 sm:p-6 border border-white/10 relative overflow-hidden group`}
          >
            {/* Background glow effect on hover */}
            <div className={`absolute inset-0 bg-gradient-to-r ${stat.gradient} opacity-0 group-hover:opacity-50 transition-opacity duration-300`} />
            
            <div className="relative z-10">
              {/* Icon with colored background */}
              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <Icon className={`w-6 h-6 sm:w-7 sm:h-7 ${stat.iconColor}`} />
              </div>

              {/* Value with animated counter */}
              <div className="flex items-baseline gap-2 mb-1">
                <p className="text-2xl sm:text-3xl font-bold text-white">
                  <AnimatedCounterMemo value={typeof stat.value === 'number' ? stat.value : 0} />
                </p>
                {hasTrend && stat.trend && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.5 }}
                    className={`flex items-center gap-1 text-xs sm:text-sm font-medium ${
                      stat.trend.isPositive ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {stat.trend.isPositive ? (
                      <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                    ) : (
                      <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4" />
                    )}
                    <span>{Math.abs(stat.trend.value)}%</span>
                  </motion.div>
                )}
              </div>

              {/* Subtitle */}
              <p className="text-gray-400 text-xs sm:text-sm mb-2">{stat.subtitle}</p>

              {/* Title */}
              <p className="text-white font-semibold text-sm sm:text-base">{stat.title}</p>

              {/* Progress bar */}
              {hasProgress && stat.capacity && stat.progress !== undefined && (() => {
                const progress = stat.progress;
                const capacity = stat.capacity;
                const percentage = (progress / capacity) * 100;
                return (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Capacity</span>
                      <span>{Math.round(percentage)}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-1.5 sm:h-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, delay: index * 0.1 + 0.3 }}
                        className={`h-full rounded-full ${
                          percentage > 80
                            ? 'bg-red-500'
                            : percentage > 50
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                        }`}
                      />
                    </div>
                  </div>
                );
              })()}

              {/* Trend period indicator */}
              {hasTrend && stat.trend && (
                <p className="text-xs text-gray-500 mt-2">
                  vs last {stat.trend.period}
                </p>
              )}
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

export default memo(OverviewStatsCards);