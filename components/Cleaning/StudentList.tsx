import { motion } from 'framer-motion';
import { Filter } from 'lucide-react';
import UserAvatar from '@/components/shared/UserAvatar';

interface CleaningStudent {
  id: string;
  name: string;
  status: 'attended' | 'pending' | 'no-show';
  user?: {
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string;
  };
}

interface StudentListProps {
  students: CleaningStudent[];
  filter?: 'all' | 'attended' | 'pending' | 'no-show';
}

const statusConfig = {
  attended: { 
    emoji: '✓',
    border: 'border-green-500/30',
    bg: 'bg-green-500/10',
    text: 'text-green-400',
    glow: 'shadow-green-500/20',
  },
  pending: { 
    emoji: '⏳',
    border: 'border-yellow-500/30',
    bg: 'bg-yellow-500/10',
    text: 'text-yellow-400',
    glow: 'shadow-yellow-500/20',
  },
  'no-show': { 
    emoji: '✗',
    border: 'border-red-500/30',
    bg: 'bg-red-500/10',
    text: 'text-red-400',
    glow: 'shadow-red-500/20',
  }
};

export default function StudentList({ students, filter = 'all' }: StudentListProps) {
  const filteredStudents = filter === 'all' 
    ? students 
    : students.filter(student => student.status === filter);
  
  const hasStudents = filteredStudents.length > 0;

  return (
    <div className="p-4">
      {hasStudents ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filteredStudents.map((student, idx) => {
            const config = statusConfig[student.status];
            
            return (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3, delay: idx * 0.02, ease: "easeOut" }}
                className={`group relative flex items-center justify-between p-3 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border ${config.border} hover:${config.bg} hover:shadow-lg hover:${config.glow} transition-all duration-300 overflow-hidden`}
              >
                {/* Decorative glow */}
                <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-${config.text.split('-')[1]}-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                
                <div className="relative flex items-center gap-2.5 flex-1 min-w-0">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-sm opacity-30" />
                    <UserAvatar user={student.user || undefined} size="sm" />
                    {!student.user?.profileImageUrl && (
                      <div className="absolute -bottom-0.5 -right-0.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[6px] px-1 py-0.5 rounded-full whitespace-nowrap font-bold">
                        Update
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-white text-xs font-semibold truncate block group-hover:text-purple-300 transition-colors" title={student.name}>
                      {student.name}
                    </span>
                  </div>
                </div>
                <div className={`relative flex items-center justify-center w-6 h-6 rounded-full ${config.bg} ${config.text} text-sm font-bold shadow-md`}>
                  {config.emoji}
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-8 border-2 border-dashed border-white/10 rounded-xl bg-white/5"
        >
          <Filter className="w-10 h-10 text-gray-500 mx-auto mb-3 opacity-50" />
          <p className="text-gray-400 text-sm font-medium">No students match the selected filter</p>
        </motion.div>
      )}
    </div>
  );
}
