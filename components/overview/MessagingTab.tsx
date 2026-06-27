'use client';

import { motion } from 'framer-motion';
import { MessageSquare, Clock, Send, Users } from 'lucide-react';

export default function MessagingTab() {
  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Messages</h1>
        <p className="text-gray-400 text-sm sm:text-base">Connect with your fellow students and teachers</p>
      </motion.div>

      {/* Coming Soon Placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 sm:p-12 border border-white/20 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center"
        >
          <MessageSquare className="w-10 h-10 text-white" />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-xl sm:text-2xl font-bold text-white mb-4"
        >
          Messaging Coming Soon
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-gray-400 text-sm sm:text-base mb-8 max-w-md mx-auto"
        >
          You will be able to message your fellow students, teachers, and tutors directly from here. Stay tuned for this exciting feature!
        </motion.p>

        {/* Feature Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto"
        >
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <Send className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <p className="text-white text-sm font-medium">Direct Messages</p>
            <p className="text-gray-400 text-xs mt-1">Chat one-on-one</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <Users className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <p className="text-white text-sm font-medium">Group Chats</p>
            <p className="text-gray-400 text-xs mt-1">Collaborate together</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <Clock className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <p className="text-white text-sm font-medium">Real-time</p>
            <p className="text-gray-400 text-xs mt-1">Instant updates</p>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
