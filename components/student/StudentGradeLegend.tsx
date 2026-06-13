'use client';

export default function StudentGradeLegend() {
  const grades = [
    { grade: 'A', color: 'text-green-400', bg: 'bg-green-400' },
    { grade: 'A-', color: 'text-green-300', bg: 'bg-green-300' },
    { grade: 'B+', color: 'text-blue-400', bg: 'bg-blue-400' },
    { grade: 'B', color: 'text-blue-300', bg: 'bg-blue-300' },
    { grade: 'B-', color: 'text-blue-200', bg: 'bg-blue-200' },
    { grade: 'C+', color: 'text-yellow-400', bg: 'bg-yellow-400' },
    { grade: 'C', color: 'text-yellow-300', bg: 'bg-yellow-300' },
    { grade: 'C-', color: 'text-yellow-200', bg: 'bg-yellow-200' },
    { grade: 'D+', color: 'text-orange-400', bg: 'bg-orange-400' },
    { grade: 'D', color: 'text-orange-300', bg: 'bg-orange-300' },
    { grade: 'D-', color: 'text-orange-200', bg: 'bg-orange-200' },
    { grade: 'E', color: 'text-red-400', bg: 'bg-red-400' },
    { grade: 'F', color: 'text-red-500', bg: 'bg-red-500' },
  ];

  return (
    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-4">
      <h3 className="text-white text-sm font-medium mb-3">Grade Legend</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
        {grades.map((item) => (
          <div key={item.grade} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${item.bg}`} />
            <span className={`text-xs ${item.color}`}>{item.grade}</span>
          </div>
        ))}
      </div>
    </div>
  );
}