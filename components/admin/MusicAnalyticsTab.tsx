'use client';

import { useState, useEffect } from 'react';
import { Music, Users, Play, MapPin, Clock, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';

interface AnalyticsData {
  summary: {
    totalSessions: number;
    totalPlayEvents: number;
    uniqueUsers: number;
    avgSessionDuration: number;
    timeframe: string;
  };
  mostPlayedVideos: Array<{
    videoId: string;
    videoTitle: string;
    channelTitle: string;
    playCount: number;
  }>;
  sessionsByLocation: Array<{
    location: string;
    count: number;
  }>;
  sessionsOverTime: Array<{
    date: string;
    count: number;
  }>;
  recentSessions: Array<{
    id: string;
    sessionId: string;
    anonymousId: string;
    location: string;
    startedAt: string;
    endedAt: string;
    duration: number;
    playEventsCount: number;
  }>;
}

export default function MusicAnalyticsTab() {
  const { user } = useAuthStore();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState('7d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeframe]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/admin/music-analytics?timeframe=${timeframe}`, {
        headers: {
          'x-user-id': user?.id || '',
          'x-user-role': user?.role?.name || ''
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      
      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
        <p className="text-red-400">{error}</p>
        <button 
          onClick={fetchAnalytics}
          className="mt-4 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <motion.div 
        className="flex justify-between items-center"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Music Player Analytics</h1>
          <p className="text-gray-400 text-sm sm:text-base">Track music player performance and user engagement</p>
        </div>
        
        {/* Timeframe Selector */}
        <div className="flex gap-2">
          {['7d', '30d', '90d', 'all'].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                timeframe === tf
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg'
                  : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              {tf === 'all' ? 'All Time' : tf}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6"
            whileHover={{ scale: 1.02, borderColor: "rgba(168, 85, 247, 0.3)" }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between mb-4">
              <Music className="w-8 h-8 text-violet-400" />
              <span className="text-xs text-gray-400">{analytics.summary.timeframe}</span>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">{analytics.summary.totalSessions}</h3>
            <p className="text-gray-400 text-sm">Total Sessions</p>
          </motion.div>

          <motion.div
            className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6"
            whileHover={{ scale: 1.02, borderColor: "rgba(168, 85, 247, 0.3)" }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-blue-400" />
              <span className="text-xs text-gray-400">{analytics.summary.timeframe}</span>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">{analytics.summary.uniqueUsers}</h3>
            <p className="text-gray-400 text-sm">Unique Users</p>
          </motion.div>

          <motion.div
            className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6"
            whileHover={{ scale: 1.02, borderColor: "rgba(168, 85, 247, 0.3)" }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between mb-4">
              <Play className="w-8 h-8 text-green-400" />
              <span className="text-xs text-gray-400">{analytics.summary.timeframe}</span>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">{analytics.summary.totalPlayEvents}</h3>
            <p className="text-gray-400 text-sm">Total Plays</p>
          </motion.div>

          <motion.div
            className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6"
            whileHover={{ scale: 1.02, borderColor: "rgba(168, 85, 247, 0.3)" }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between mb-4">
              <Clock className="w-8 h-8 text-orange-400" />
              <span className="text-xs text-gray-400">{analytics.summary.timeframe}</span>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">{formatDuration(analytics.summary.avgSessionDuration)}</h3>
            <p className="text-gray-400 text-sm">Avg Session</p>
          </motion.div>
        </div>
      </motion.div>

      {/* Most Played Videos */}
      <motion.div
        className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        whileHover={{ scale: 1.01, borderColor: "rgba(168, 85, 247, 0.3)" }}
      >
        <h2 className="text-lg sm:text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-violet-400" />
          Most Played Videos
        </h2>
        <div className="space-y-3">
          {analytics.mostPlayedVideos.slice(0, 10).map((video, index) => (
            <motion.div
              key={video.videoId}
              className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 + index * 0.05 }}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-violet-400 font-bold text-lg w-6">{index + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{video.videoTitle}</p>
                  <p className="text-gray-400 text-sm truncate">{video.channelTitle}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4 text-green-400" />
                <span className="text-white font-semibold">{video.playCount}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Sessions by Location */}
      <motion.div
        className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        whileHover={{ scale: 1.01, borderColor: "rgba(168, 85, 247, 0.3)" }}
      >
        <h2 className="text-lg sm:text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-400" />
          Sessions by Location
        </h2>
        <div className="space-y-3">
          {analytics.sessionsByLocation.length > 0 ? (
            analytics.sessionsByLocation.map((location, index) => (
              <motion.div
                key={location.location || 'Unknown'}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.6 + index * 0.05 }}
              >
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-blue-400" />
                  <span className="text-white">{location.location || 'Unknown Location'}</span>
                </div>
                <span className="text-white font-semibold">{location.count}</span>
              </motion.div>
            ))
          ) : (
            <p className="text-gray-400 text-center py-4">No location data available yet</p>
          )}
        </div>
      </motion.div>

      {/* Recent Sessions */}
      <motion.div
        className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        whileHover={{ scale: 1.01, borderColor: "rgba(168, 85, 247, 0.3)" }}
      >
        <h2 className="text-lg sm:text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-green-400" />
          Recent Sessions
        </h2>
        <div className="space-y-3">
          {analytics.recentSessions.map((session, index) => (
            <motion.div
              key={session.id}
              className="p-4 bg-white/5 rounded-lg"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.7 + index * 0.05 }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Session ID: {session.sessionId.slice(0, 8)}...</span>
                <span className="text-gray-400 text-sm">{formatDate(session.startedAt)}</span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300">User: {session.anonymousId.slice(0, 8)}...</span>
                </div>
                {session.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">{session.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Play className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300">{session.playEventsCount} plays</span>
                </div>
                {session.duration && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">{formatDuration(session.duration)}</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
