'use client';

interface TeacherStatsCardsProps {
  totalStudents: number;
  totalCourses: number;
  pendingGrades: number;
  assignedStudents?: number;
  verifiedStudents?: number;
  notVerifiedStudents?: number;
  isLoading?: boolean;
}

export default function TeacherStatsCards({
  totalStudents,
  totalCourses,
  pendingGrades,
  assignedStudents,
  verifiedStudents,
  notVerifiedStudents,
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
          <h3 className="text-gray-400 text-sm font-medium">Assigned Students</h3>
        </div>
        <p className="text-3xl font-bold text-white">{assignedStudents || 0}</p>
      </div>
      <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 backdrop-blur-lg border border-white/10 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-green-400 text-xl">✅</span>
          <h3 className="text-gray-400 text-sm font-medium">Verified</h3>
        </div>
        <p className="text-3xl font-bold text-white">{verifiedStudents || 0}</p>
      </div>
      <div className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 backdrop-blur-lg border border-white/10 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-yellow-400 text-xl">⏳</span>
          <h3 className="text-gray-400 text-sm font-medium">Not Verified</h3>
        </div>
        <p className="text-3xl font-bold text-white">{notVerifiedStudents || 0}</p>
      </div>
    </div>
  );
}