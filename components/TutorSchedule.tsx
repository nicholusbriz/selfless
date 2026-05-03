'use client';

import React from 'react';

interface TutorSchedule {
  dayOfWeek: string;
  morningSlot: string;
  afternoonSlot: string;
}

const TutorSchedule: React.FC = () => {
  const scheduleData: TutorSchedule[] = [
    {
      dayOfWeek: 'Monday',
      morningSlot: 'Kenneth',
      afternoonSlot: 'Mercy'
    },
    {
      dayOfWeek: 'Tuesday',
      morningSlot: 'Nicholus',
      afternoonSlot: 'Kenneth'
    },
    {
      dayOfWeek: 'Wednesday',
      morningSlot: 'Nicholus',
      afternoonSlot: 'Mary & Shiellah'
    },
    {
      dayOfWeek: 'Thursday',
      morningSlot: 'Mercy',
      afternoonSlot: 'Mary'
    },
    {
      dayOfWeek: 'Friday',
      morningSlot: 'Mary & Mercy',
      afternoonSlot: 'Nicholus & Kenneth'
    }
  ];

  const notes = [
    "All Tutors on afternoon/evening shifts are required to assist Shiellah during English classes",
    "Tonny will oversee English class on Friday when Shiellah is off"
  ];

  return (
    <div className="bg-black/30 rounded-2xl p-6 border border-white/20">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Freedom Tech Center Tutor on Duty Schedule</h2>
        <p className="text-gray-300">Term 3 2026</p>
      </div>

      {/* Schedule Table */}
      <div className="overflow-x-auto mb-6">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-blue-600/20 border border-blue-400/30">
              <th className="px-4 py-3 text-left text-white font-semibold border border-white/20">Day of week</th>
              <th className="px-4 py-3 text-left text-white font-semibold border border-white/20">8:00am - 1:00pm</th>
              <th className="px-4 py-3 text-left text-white font-semibold border border-white/20">1:00pm - 6:00pm</th>
            </tr>
          </thead>
          <tbody>
            {scheduleData.map((day, index) => (
              <tr key={day.dayOfWeek} className={`${index % 2 === 0 ? 'bg-black/10' : 'bg-black/20'} hover:bg-white/10 transition-colors`}>
                <td className="px-4 py-3 text-white font-medium border border-white/20">{day.dayOfWeek}</td>
                <td className="px-4 py-3 text-blue-300 border border-white/20">{day.morningSlot}</td>
                <td className="px-4 py-3 text-purple-300 border border-white/20">{day.afternoonSlot}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Notes Section */}
      <div className="bg-amber-600/20 rounded-xl p-4 border border-amber-400/30">
        <h3 className="text-lg font-semibold text-amber-300 mb-3">Important Notes:</h3>
        <ul className="space-y-2">
          {notes.map((note, index) => (
            <li key={index} className="flex items-start gap-2 text-amber-100 text-sm">
              <span className="text-amber-400 mt-1">•</span>
              <span>{note}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TutorSchedule;
