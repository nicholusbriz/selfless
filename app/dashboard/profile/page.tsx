'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { motion } from 'framer-motion';
import { User, Mail, Shield, Settings, Edit, Camera, Award, Calendar } from 'lucide-react';

export default function ProfilePage() {
  const { user, fetchUser } = useAuthStore();

  useEffect(() => {
    if (!user) {
      fetchUser();
    }
  }, [user, fetchUser]);

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Header Section */}
      <motion.div 
        className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-lg rounded-2xl p-6 sm:p-8 border border-white/20"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.h1 
          className="text-2xl sm:text-3xl font-bold text-white mb-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Profile
        </motion.h1>
        <motion.p 
          className="text-gray-300 text-sm sm:text-base"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          View and manage your profile information
        </motion.p>
      </motion.div>

      {user && (
        <>
          {/* Profile Card */}
          <motion.div
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 sm:p-8 border border-white/20"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="flex flex-col md:flex-row items-center md:items-start gap-4 sm:gap-6">
              {/* Avatar */}
              <motion.div 
                className="relative"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl sm:text-3xl font-bold shadow-lg">
                  {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                </div>
                <motion.button 
                  className="absolute bottom-0 right-0 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white shadow-lg"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Camera className="w-4 h-4" />
                </motion.button>
              </motion.div>

              {/* User Info */}
              <div className="flex-1 text-center md:text-left">
                <motion.h2 
                  className="text-xl sm:text-2xl font-bold text-white mb-1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  {user.firstName} {user.lastName}
                </motion.h2>
                <motion.p 
                  className="text-gray-400 text-sm sm:text-base mb-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                >
                  {user.email}
                </motion.p>
                <motion.div 
                  className="flex flex-wrap gap-2 justify-center md:justify-start"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                >
                  <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm border border-purple-500/30">
                    {user.role?.name || 'Volunteer'}
                  </span>
                  <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm border border-green-500/30">
                    Active
                  </span>
                </motion.div>
              </div>

              {/* Edit Button */}
              <motion.button
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium flex items-center space-x-2 text-sm sm:text-base"
                whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(168, 85, 247, 0.5)" }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.9 }}
              >
                <Edit className="w-4 h-4" />
                <span>Edit Profile</span>
              </motion.button>
            </div>
          </motion.div>

          {/* User Details */}
          <motion.div
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 sm:p-6 border border-white/20"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          >
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6 flex items-center">
              <User className="w-5 h-5 mr-2 text-purple-400" />
              User Information
            </h3>
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
              {[
                { icon: User, label: "Full Name", value: `${user.firstName} ${user.lastName}` },
                { icon: Mail, label: "Email Address", value: user.email },
                { icon: Shield, label: "Role", value: user.role?.name || 'N/A' },
                { icon: Award, label: "Status", value: "Active" }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className="bg-white/5 rounded-xl p-4 border border-white/10"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1.1 + index * 0.1 }}
                  whileHover={{ scale: 1.02, borderColor: "rgba(168, 85, 247, 0.3)" }}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <item.icon className="w-4 h-4 text-purple-400" />
                    <label className="text-gray-400 text-sm">{item.label}</label>
                  </div>
                  <p className="text-white font-medium">{item.value}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Settings Section */}
          <motion.div
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 sm:p-6 border border-white/20"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.5 }}
          >
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6 flex items-center">
              <Settings className="w-5 h-5 mr-2 text-purple-400" />
              Profile Settings
            </h3>
            <div className="space-y-4">
              {[
                { label: "Change Password", icon: Shield },
                { label: "Notification Preferences", icon: Mail },
                { label: "Privacy Settings", icon: User }
              ].map((setting, index) => (
                <motion.button
                  key={index}
                  className="w-full bg-white/5 rounded-xl p-4 border border-white/10 flex items-center justify-between hover:bg-white/10 transition-all duration-300"
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 1.6 + index * 0.1 }}
                >
                  <div className="flex items-center space-x-3">
                    <setting.icon className="w-5 h-5 text-purple-400" />
                    <span className="text-white">{setting.label}</span>
                  </div>
                  <span className="text-gray-400">→</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
