'use client';

import { motion } from 'framer-motion';
import { Calendar, Clock, User, BookOpen, AlertTriangle, Shield, CheckCircle, XCircle } from 'lucide-react';
import { useState } from 'react';

interface ScheduleRow {
  day: string;
  morning: string;
  afternoon: string;
}

const scheduleData: ScheduleRow[] = [
  { day: 'Monday', morning: 'Kenneth', afternoon: 'Nicholus' },
  { day: 'Tuesday', morning: 'Nicholus', afternoon: 'Kenneth' },
  { day: 'Wednesday', morning: 'Mary', afternoon: 'Mercy & Betty' },
  { day: 'Thursday', morning: 'Mercy', afternoon: 'Mary' },
  { day: 'Friday', morning: 'Mary & Mercy', afternoon: 'Nicholus & Kenneth' },
];

const conductRules = [
  {
    id: 1,
    title: 'Classroom Space and Usage',
    icon: <BookOpen className="w-5 h-5 text-purple-400" />,
    content: 'The main English Hub room is reserved strictly for active participants during class hours. If you are not attending the session, please use the adjacent study rooms or common areas.',
    type: 'info'
  },
  {
    id: 2,
    title: 'Active Participation (The "Present" Rule)',
    icon: <CheckCircle className="w-5 h-5 text-green-400" />,
    content: 'Attendance must be earned through active participation, not just presence. To be marked present, you must contribute to the session—whether by speaking in debates, responding to questions, or engaging in group work. Simply logging in or arriving on time does not guarantee attendance. If you remain silent and disengaged, your name will not be recorded, regardless of punctuality.',
    type: 'warning'
  },
  {
    id: 3,
    title: 'Respect for Speakers and Turn-Taking',
    icon: <Shield className="w-5 h-5 text-blue-400" />,
    content: 'When a fellow student is sharing, answering, or presenting, you may not interrupt, interject, or distract them. Only the English Tutor has the authority to open the floor for questions or comments. Do not speak unless you are explicitly called upon. Any student who disrupts or speaks out of turn will be marked absent, as this shows a lack of respect for the learning environment.',
    type: 'critical'
  },
  {
    id: 4,
    title: 'Technology Policy',
    icon: <XCircle className="w-5 h-5 text-red-400" />,
    content: 'To maintain focus and respect for speakers, phones and personal laptops are not permitted during sessions. On debate or presentation days, prepare your points on paper beforehand so you can present clearly. If you are observed using your phone or visibly distracted at any point, you will be marked absent without warning.',
    type: 'critical'
  },
  {
    id: 5,
    title: 'Attendance Sheet and Registration (Strict Deadline)',
    icon: <Clock className="w-5 h-5 text-orange-400" />,
    content: 'The official attendance sheet will be circulated exactly thirty minutes before the session begins (at 1:30 PM). You must sign your name within this thirty-minute window. If you fail to register within this window, you will automatically be marked absent. Late registration will not be accepted under any circumstances.',
    type: 'critical'
  },
  {
    id: 6,
    title: 'No Special Requests or Favours',
    icon: <AlertTriangle className="w-5 h-5 text-yellow-400" />,
    content: 'Do not approach the tutor to manually add your name, request a favour, or excuse an absence after the deadline. The policy is final, non-negotiable, and applies equally to all students.',
    type: 'warning'
  },
  {
    id: 7,
    title: 'Preparation Requirement',
    icon: <BookOpen className="w-5 h-5 text-purple-400" />,
    content: 'Students must come to class with a pen, paper, and any assigned readings or preparatory materials completed. Failure to bring basic writing materials may result in a verbal warning. Repeated offenses will affect your participation record.',
    type: 'info'
  },
  {
    id: 8,
    title: 'One Speaker at a Time',
    icon: <Shield className="w-5 h-5 text-blue-400" />,
    content: 'When the tutor opens the floor for discussion, only one student may speak at a time. Side conversations, whispering, or group chatter are strictly prohibited. All attention must be directed to the current speaker.',
    type: 'warning'
  },
  {
    id: 9,
    title: 'No Recording Without Permission',
    icon: <AlertTriangle className="w-5 h-5 text-yellow-400" />,
    content: 'Students are not permitted to audio-record, video-record, or photograph the session—including the attendance sheet—without the tutor\'s explicit written consent. This protects the privacy and academic integrity of all participants.',
    type: 'critical'
  }
];

export default function TutorSchedule() {
  const [showConduct, setShowConduct] = useState(false);

  return (
    <div className="space-y-6">
      {/* Tutor Schedule Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 backdrop-blur-lg rounded-xl p-6 border border-white/10"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-bold text-white">Tutor Schedule</h2>
          </div>
        </div>
        
        <div className="mb-4">
          <p className="text-lg font-semibold text-blue-300">TERM 4 2026 - FREEDOM CITY TECH CENTER</p>
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

      {/* English Hub Code of Conduct Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-lg rounded-xl p-6 border border-white/10"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold text-white">English Hub: Code of Conduct & Attendance Policy</h2>
          </div>
          <button
            onClick={() => setShowConduct(!showConduct)}
            className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg text-purple-300 text-sm font-medium transition cursor-pointer pointer-events-auto"
            type="button"
          >
            {showConduct ? 'Hide Rules' : 'View All Rules'}
          </button>
        </div>

        <div className="mb-4">
          <p className="text-lg font-semibold text-purple-300">English Class Tutor: Sister Betty</p>
        </div>

        {showConduct && (
          <div className="space-y-4">
            {conductRules.map((rule, index) => (
            <motion.div
              key={rule.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.6 + index * 0.05 }}
              className={`p-4 rounded-lg border ${
                rule.type === 'critical' 
                  ? 'bg-red-500/10 border-red-500/20' 
                  : rule.type === 'warning'
                  ? 'bg-yellow-500/10 border-yellow-500/20'
                  : 'bg-purple-500/10 border-purple-500/20'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {rule.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold mb-2">{rule.title}</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">{rule.content}</p>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Final Reminder */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="mt-6 p-4 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-lg border border-orange-500/20"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-white font-semibold mb-2">Final Reminder</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  These rules are designed to create a focused, respectful, and professional learning environment for everyone. 
                  Not knowing these policies will not be accepted as an excuse. By remaining in the English Hub, you agree to abide by all regulations listed above.
                </p>
              </div>
            </div>
          </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
