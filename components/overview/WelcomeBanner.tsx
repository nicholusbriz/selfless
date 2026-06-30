'use client';



import { useState, useEffect } from 'react';

import { motion } from 'framer-motion';

import { RefreshCw, Download, Bell, Calendar, User, Clock, Camera, X } from 'lucide-react';

import { useRouter } from 'next/navigation';

import { useQuery } from '@tanstack/react-query';

import axios from '@/lib/axios';

import UserAvatar from '@/components/shared/UserAvatar';

import { useAuthStore } from '@/stores/authStore';



interface WelcomeBannerProps {

  userName?: string;

  userRole?: string;

  lastUpdated?: Date;

  onRefresh?: () => void;

  onExport?: () => void;

  onAnnouncementsClick?: () => void;

}



export default function WelcomeBanner({

  userName = 'User',

  userRole = 'User',

  lastUpdated,

  onRefresh,

  onExport,

  onAnnouncementsClick

}: WelcomeBannerProps) {

  const { user } = useAuthStore();

  const router = useRouter();

  const [greeting, setGreeting] = useState('');

  const [currentDate, setCurrentDate] = useState('');

  const [currentTime, setCurrentTime] = useState('');

  const [showProfileTip, setShowProfileTip] = useState(true);



  const { data: announcementsData, isLoading } = useQuery({

    queryKey: ['announcements-count'],

    queryFn: async () => {

      const response = await axios.get('/api/announcements');

      return response.data;

    }

    // Removed refetchInterval - using WebSocket for real-time updates

  });



  const notificationCount = announcementsData?.announcements?.filter(

    (ann: any) => ann && ann.id

  ).length || 0;



  useEffect(() => {

    const updateGreeting = () => {

      const hour = new Date().getHours();

      if (hour < 12) {

        setGreeting('Good Morning');

      } else if (hour < 17) {

        setGreeting('Good Afternoon');

      } else {

        setGreeting('Good Evening');

      }

    };



    const updateDateTime = () => {

      const now = new Date();

      setCurrentDate(now.toLocaleDateString('en-US', { 

        weekday: 'long', 

        year: 'numeric', 

        month: 'long', 

        day: 'numeric' 

      }));

      setCurrentTime(now.toLocaleTimeString('en-US', { 

        hour: '2-digit', 

        minute: '2-digit' 

      }));

    };



    updateGreeting();

    updateDateTime();



    const timer = setInterval(updateDateTime, 60000);

    return () => clearInterval(timer);

  }, []);



  const formatLastUpdated = () => {

    if (!lastUpdated) return 'Just now';

    const now = new Date();

    const diff = now.getTime() - lastUpdated.getTime();

    const minutes = Math.floor(diff / 60000);

    

    if (minutes < 1) return 'Just now';

    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);

    if (hours < 24) return `${hours}h ago`;

    return lastUpdated.toLocaleDateString();

  };



  return (

    <motion.div

      initial={{ opacity: 0, y: -20 }}

      animate={{ opacity: 1, y: 0 }}

      transition={{ duration: 0.6 }}

      className="bg-gradient-to-r from-purple-600/20 via-indigo-600/20 to-blue-600/20 backdrop-blur-lg rounded-2xl p-4 sm:p-6 border border-white/20 mb-6"

    >

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

        {/* Greeting and User Info */}

        <div className="flex items-center gap-4 flex-1">

          {user && <UserAvatar user={user} size="lg" />}

          <motion.div

            initial={{ opacity: 0, x: -20 }}

            animate={{ opacity: 1, x: 0 }}

            transition={{ duration: 0.6, delay: 0.1 }}

          >

            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">

              {greeting}, {userName}!

            </h1>

            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-gray-300">

              <span className="flex items-center gap-1.5">

                <User className="w-4 h-4 text-purple-400" />

                {userRole}

              </span>

              <span className="flex items-center gap-1.5">

                <Calendar className="w-4 h-4 text-blue-400" />

                {currentDate}

              </span>

              <span className="flex items-center gap-1.5">

                <Clock className="w-4 h-4 text-green-400" />

                {currentTime}

              </span>

            </div>

          </motion.div>

        </div>

        {/* Profile Picture Tip */}
        {showProfileTip && !user?.profileImageUrl && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-purple-500/20 border border-purple-500/30 rounded-xl p-3 mt-3"
          >
            <div className="flex items-start gap-3">
              <Camera className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-white text-sm font-medium mb-1">Add Your Profile Picture</p>
                <p className="text-gray-300 text-xs">You can now update your profile picture on your profile page!</p>
                <button
                  onClick={() => router.push('/dashboard/profile')}
                  className="mt-2 text-purple-400 text-xs font-medium hover:text-purple-300 transition-colors"
                >
                  Go to Profile →
                </button>
              </div>
              <button
                onClick={() => setShowProfileTip(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}



        {/* Quick Actions */}

        <motion.div

          initial={{ opacity: 0, x: 20 }}

          animate={{ opacity: 1, x: 0 }}

          transition={{ duration: 0.6, delay: 0.2 }}

          className="flex items-center gap-2 sm:gap-3"

        >

          {/* Refresh Button */}

          <button

            onClick={onRefresh}

            className="relative group p-2.5 sm:p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95"

            aria-label="Refresh data"

          >

            <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:rotate-180 transition-transform duration-500" />

          </button>



          {/* Export Button */}

          <button

            onClick={onExport}

            className="relative group p-2.5 sm:p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95"

            aria-label="Export data"

          >

            <Download className="w-5 h-5 sm:w-6 sm:h-6 text-white" />

          </button>



          {/* Notifications Button */}

          <button

            onClick={onAnnouncementsClick}

            className="relative group p-2.5 sm:p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95"

            aria-label="View Announcements"

          >

            <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-white" />

            {!isLoading && notificationCount > 0 && (

              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs font-bold flex items-center justify-center">

                {notificationCount > 9 ? '9+' : notificationCount}

              </span>

            )}

          </button>

        </motion.div>

      </div>



      {/* Last Updated Timestamp */}

      {lastUpdated && (

        <motion.div

          initial={{ opacity: 0 }}

          animate={{ opacity: 1 }}

          transition={{ duration: 0.6, delay: 0.3 }}

          className="mt-4 pt-4 border-t border-white/10"

        >

          <p className="text-xs text-gray-400 flex items-center gap-2">

            <Clock className="w-3 h-3" />

            Last updated: {formatLastUpdated()}

          </p>

        </motion.div>

      )}

    </motion.div>

  );

}

