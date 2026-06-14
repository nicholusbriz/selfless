'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Bell, Shield, Lock, Palette, Globe, Moon, Sun, ToggleLeft, ToggleRight, ChevronRight } from 'lucide-react';

export default function SettingsPage() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const toggleButton = (
    enabled: boolean,
    onClick: () => void,
    label: string
  ) => (
    <motion.button
      onClick={onClick}
      className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${
        enabled ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gray-600'
      }`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md ${
          enabled ? 'left-8' : 'left-1'
        }`}
        animate={{ left: enabled ? 32 : 4 }}
        transition={{ duration: 0.3 }}
      />
    </motion.button>
  );

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Header Section */}
      <motion.div 
        className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.h1 
          className="text-3xl font-bold text-white mb-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Settings
        </motion.h1>
        <motion.p 
          className="text-gray-300"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          Manage your account settings and preferences
        </motion.p>
      </motion.div>

      {/* Account Settings */}
      <motion.div
        className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <motion.h3 
          className="text-xl font-semibold text-white mb-6 flex items-center"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Shield className="w-5 h-5 mr-2 text-purple-400" />
          Account Settings
        </motion.h3>
        
        <div className="space-y-4">
          {[
            {
              icon: Bell,
              title: "Email Notifications",
              description: "Receive email updates about your account",
              enabled: emailNotifications,
              toggle: () => setEmailNotifications(!emailNotifications)
            },
            {
              icon: Lock,
              title: "Two-Factor Authentication",
              description: "Add an extra layer of security",
              enabled: twoFactorEnabled,
              toggle: () => setTwoFactorEnabled(!twoFactorEnabled)
            }
          ].map((setting, index) => (
            <motion.div
              key={index}
              className="flex items-center justify-between py-4 border-b border-white/10 last:border-0"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
              whileHover={{ x: 5 }}
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <setting.icon className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-white font-medium">{setting.title}</p>
                  <p className="text-gray-400 text-sm">{setting.description}</p>
                </div>
              </div>
              {toggleButton(setting.enabled, setting.toggle, setting.title)}
            </motion.div>
          ))}

          <motion.button
            className="w-full flex items-center justify-between py-4 border-b border-white/10 hover:bg-white/5 rounded-lg transition-all duration-300 px-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            whileHover={{ x: 5 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Lock className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-left">
                <p className="text-white font-medium">Change Password</p>
                <p className="text-gray-400 text-sm">Update your password regularly</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </motion.button>
        </div>
      </motion.div>

      {/* Preferences */}
      <motion.div
        className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.0 }}
      >
        <motion.h3 
          className="text-xl font-semibold text-white mb-6 flex items-center"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 1.1 }}
        >
          <Palette className="w-5 h-5 mr-2 text-purple-400" />
          Preferences
        </motion.h3>
        
        <div className="space-y-4">
          <motion.div
            className="flex items-center justify-between py-4 border-b border-white/10"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 1.2 }}
            whileHover={{ x: 5 }}
          >
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                {darkMode ? <Moon className="w-5 h-5 text-purple-400" /> : <Sun className="w-5 h-5 text-purple-400" />}
              </div>
              <div>
                <p className="text-white font-medium">Dark Mode</p>
                <p className="text-gray-400 text-sm">Toggle dark/light theme</p>
              </div>
            </div>
            {toggleButton(darkMode, () => setDarkMode(!darkMode), "Dark Mode")}
          </motion.div>

          <motion.button
            className="w-full flex items-center justify-between py-4 hover:bg-white/5 rounded-lg transition-all duration-300 px-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 1.3 }}
            whileHover={{ x: 5 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-green-400" />
              </div>
              <div className="text-left">
                <p className="text-white font-medium">Language</p>
                <p className="text-gray-400 text-sm">Select your preferred language</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </motion.button>
        </div>
      </motion.div>

      {/* Danger Zone */}
      <motion.div
        className="bg-red-500/10 backdrop-blur-lg rounded-2xl p-6 border border-red-500/20"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.4 }}
      >
        <motion.h3 
          className="text-xl font-semibold text-red-400 mb-4 flex items-center"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 1.5 }}
        >
          <Settings className="w-5 h-5 mr-2" />
          Danger Zone
        </motion.h3>
        <motion.button
          className="w-full py-3 bg-red-500/20 text-red-400 rounded-lg border border-red-500/30 hover:bg-red-500/30 transition-all duration-300"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.6 }}
        >
          Delete Account
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
