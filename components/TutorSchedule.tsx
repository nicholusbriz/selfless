'use client';

import React from 'react';

interface TutorSchedule {
  day: string;
  morning: string;
  afternoon: string;
}

const tutorScheduleData: TutorSchedule[] = [
  {
    day: 'Monday',
    morning: 'Kenneth',
    afternoon: 'Mercy'
  },
  {
    day: 'Tuesday',
    morning: 'Nicholus',
    afternoon: 'Kenneth'
  },
  {
    day: 'Wednesday',
    morning: 'Nicholus',
    afternoon: 'Mary & Shiellah'
  },
  {
    day: 'Thursday',
    morning: 'Mercy',
    afternoon: 'Mary'
  },
  {
    day: 'Friday',
    morning: 'Mary & Mercy',
    afternoon: 'Nicholus & Kenneth'
  }
];

export default function TutorSchedule() {
  return (
    <div className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 backdrop-blur-md rounded-2xl border border-blue-400/30 hover:from-blue-500/30 hover:to-indigo-500/30 transition-all duration-300">
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <span className="text-2xl">👥</span>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">Tutor On-Duty Schedule</h3>
            <p className="text-white/70 text-sm">Term 3, 2026 - Freedom Tech Center</p>
          </div>
        </div>

        {/* Schedule Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-white">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left py-3 px-4 font-semibold text-white/90">Day</th>
                <th className="text-left py-3 px-4 font-semibold text-white/90">8:00am - 1:00pm</th>
                <th className="text-left py-3 px-4 font-semibold text-white/90">1:00pm - 6:00pm</th>
              </tr>
            </thead>
            <tbody>
              {tutorScheduleData.map((schedule, index) => (
                <tr key={schedule.day} className={`border-b border-white/10 ${index % 2 === 0 ? 'bg-white/5' : ''}`}>
                  <td className="py-3 px-4 font-medium text-white/90">{schedule.day}</td>
                  <td className="py-3 px-4 text-white/80">{schedule.morning}</td>
                  <td className="py-3 px-4 text-white/80">{schedule.afternoon}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Notes Section */}
        <div className="mt-6 space-y-2">
          <div className="bg-yellow-500/20 backdrop-blur-sm rounded-lg p-3 border border-yellow-400/30">
            <p className="text-sm text-yellow-100">
              <span className="font-semibold">Note:</span> All Tutors on the afternoon/evening shifts are required to assist Shiellah during the English classes
            </p>
          </div>
          <div className="bg-green-500/20 backdrop-blur-sm rounded-lg p-3 border border-green-400/30">
            <p className="text-sm text-green-100">
              <span className="font-semibold">Note:</span> Tonny will oversee the English class on Friday when Shiellah is off
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
