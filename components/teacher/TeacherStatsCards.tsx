'use client';

interface TeacherStatsCardsProps {
  totalStudents: number;
  totalCourses: number;
  pendingGrades: number;
  isLoading?: boolean;
}

export default function TeacherStatsCards({
  totalStudents,
  totalCourses,
  pendingGrades,
  isLoading
}: TeacherStatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white/5 rounded-xl p-6 animate-pulse">
            <div className="h-4 bg-white/10 rounded w-24 mb-2"></div>
            <div className="h-8 bg-white/10 rounded w-32"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-gradient-to-br from-violet-600/20 to-indigo-600/20 backdrop-blur-lg border border-white/10 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-violet-400 text-xl">👥</span>
          <h3 className="text-gray-400 text-sm font-medium">Total Students</h3>
        </div>
        <p className="text-3xl font-bold text-white">{totalStudents || 0}</p>
      </div>
      <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 backdrop-blur-lg border border-white/10 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-blue-400 text-xl">📚</span>
          <h3 className="text-gray-400 text-sm font-medium">Total Courses</h3>
        </div>
        <p className="text-3xl font-bold text-white">{totalCourses || 0}</p>
      </div>
      <div className="bg-gradient-to-br from-orange-600/20 to-red-600/20 backdrop-blur-lg border border-white/10 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-orange-400 text-xl">⭐</span>
          <h3 className="text-gray-400 text-sm font-medium">Pending Grades</h3>
        </div>
        <p className="text-3xl font-bold text-white">{pendingGrades || 0}</p>
      </div>
    </div>
  );
}