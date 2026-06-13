'use client';

import { motion } from 'framer-motion';
import { Calendar, Clock, User } from 'lucide-react';

interface ScheduleRow {
  day: string;
  morning: string;
  afternoon: string;
}

const scheduleData: ScheduleRow[] = [
  { day: 'Monday', morning: 'Kenneth', afternoon: 'Mercy' },
  { day: 'Tuesday', morning: 'Nicholus', afternoon: 'Kenneth' },
  { day: 'Wednesday', morning: 'Nicholus', afternoon: 'Mary & Shiellah' },
  { day: 'Thursday', morning: 'Mercy', afternoon: 'Mary' },
  { day: 'Friday', morning: 'Mary & Mercy', afternoon: 'Nicholus & Kenneth' },
];

export default function TutorSchedule() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 backdrop-blur-lg rounded-xl p-6 border border-white/10"
    >
      <div className="flex items-center gap-3 mb-6">
        <Calendar className="w-6 h-6 text-blue-400" />
        <h2 className="text-2xl font-bold text-white">Tutor Schedule</h2>
      </div>
      
      <div className="mb-4">
        <p className="text-lg font-semibold text-blue-300">TERM 3 2026 - FREEDOM TECH CENTER</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Day</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  8:00am - 1:00pm
                </div>
              </th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  1:00pm - 6:00pm
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {scheduleData.map((row, index) => (
              <motion.tr
                key={row.day}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                className="border-b border-white/5 hover:bg-white/5 transition-colors"
              >
                <td className="py-4 px-4">
                  <span className="text-white font-semibold">{row.day}</span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-purple-400" />
                    <span className="text-gray-300">{row.morning}</span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-cyan-400" />
                    <span className="text-gray-300">{row.afternoon}</span>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
