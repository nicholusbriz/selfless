import { motion } from 'framer-motion';
import { Filter } from 'lucide-react';
import UserAvatar from '@/components/shared/UserAvatar';

interface CleaningStudent {
  id: string;
  name: string;
  status: 'attended' | 'pending' | 'no-show';
  user?: any; // User object for avatar
}

interface StudentListProps {
  students: CleaningStudent[];
  filter?: 'all' | 'attended' | 'pending' | 'no-show';
}

const statusConfig = {
  attended: { 
    emoji: '✓',
    border: 'border-green-500/30',
  },
  pending: { 
    emoji: '⏳',
    border: 'border-yellow-500/30',
  },
  'no-show': { 
    emoji: '✗',
    border: 'border-red-500/30',
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {filteredStudents.map((student, idx) => {
            const emoji = statusConfig[student.status].emoji;
            const border = statusConfig[student.status].border;
            
            return (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.01 }}
                className={`flex items-center justify-between p-2 rounded-lg bg-white/5 border ${border} hover:bg-white/10 transition-all group`}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <UserAvatar user={student.user} size="sm" />
                  <span className="text-white text-xs truncate" title={student.name}>
                    {student.name}
                  </span>
                </div>
                <span className="text-sm">{emoji}</span>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-6">
          <Filter className="w-8 h-8 text-gray-500 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">No students match the selected filter</p>
        </div>
      )}
    </div>
  );
}
