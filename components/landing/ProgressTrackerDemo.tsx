'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Circle, Trophy, Target, Flame } from 'lucide-react';

interface Task {
  id: number;
  title: string;
  completed: boolean;
  category: string;
}

export default function ProgressTrackerDemo() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, title: 'Complete React Fundamentals', completed: true, category: 'Learning' },
    { id: 2, title: 'Build First Project', completed: true, category: 'Project' },
    { id: 3, title: 'Learn State Management', completed: false, category: 'Learning' },
    { id: 4, title: 'Deploy to Production', completed: false, category: 'Deployment' },
    { id: 5, title: 'Write Unit Tests', completed: false, category: 'Testing' },
  ]);

  const toggleTask = (id: number) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const progress = (completedCount / tasks.length) * 100;
  const streak = completedCount >= 2 ? completedCount : 0;

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-400" />
            <span className="text-white font-medium">Progress</span>
          </div>
          <span className="text-purple-400 font-bold">{Math.round(progress)}%</span>
        </div>
        
        <div className="h-3 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-gray-400">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span>{completedCount} of {tasks.length} completed</span>
          </div>
          {streak > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1 text-orange-400"
            >
              <Flame className="w-4 h-4" />
              <span className="font-medium">{streak} streak!</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {tasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                task.completed 
                  ? 'bg-green-500/10 border-green-500/30' 
                  : 'bg-white/5 border-white/10 hover:border-purple-500/30'
              }`}
              onClick={() => toggleTask(task.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-start gap-3">
                <motion.div
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.8 }}
                >
                  {task.completed ? (
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  )}
                </motion.div>
                <div className="flex-1">
                  <p className={`font-medium ${task.completed ? 'text-green-400 line-through' : 'text-white'}`}>
                    {task.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{task.category}</p>
                </div>
                {task.completed && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    <Trophy className="w-5 h-5 text-yellow-400" />
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Achievement Badge */}
      {progress === 100 && (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.5 }}
          className="text-center p-6 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl border border-yellow-500/30"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex justify-center mb-3"
          >
            <Trophy className="w-12 h-12 text-yellow-400" />
          </motion.div>
          <p className="text-white font-bold text-lg">All Tasks Completed!</p>
          <p className="text-yellow-400 text-sm">Amazing work! 🎉</p>
        </motion.div>
      )}
    </div>
  );
}
