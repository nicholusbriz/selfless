'use client';

import { motion } from 'framer-motion';
import { Users, BookOpen, Award, GraduationCap } from 'lucide-react';

interface StatItem {
  id: string;
  icon: any;
  title: string;
  value: string | number;
  subtitle: string;
  iconColor: string;
  gradient: string;
}

interface OverviewStatsCardsProps {
  stats: StatItem[];
}

export default function OverviewStatsCards({ stats }: OverviewStatsCardsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ scale: 1.05, y: -5 }}
            className={`bg-gradient-to-r ${stat.gradient} backdrop-blur-lg rounded-xl p-6 border border-white/10`}
          >
            <div className="flex items-start justify-between mb-4">
              <Icon className={`w-8 h-8 ${stat.iconColor}`} />
              <div className="text-right">
                <p className="text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-gray-400 text-sm">{stat.subtitle}</p>
              </div>
            </div>
            <p className="text-white font-semibold">{stat.title}</p>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
