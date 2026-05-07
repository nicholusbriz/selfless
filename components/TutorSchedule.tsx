'use client';

interface ScheduleSlot {
  day: string;
  morning: string;
  afternoon: string;
}

export default function TutorSchedule() {
  const scheduleData: ScheduleSlot[] = [
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

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/30">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
            <span className="text-2xl">📅</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Tutor Schedule</h3>
            <p className="text-gray-300 text-sm">TERM 3 2026 - FREEDOM TECH CENTER</p>
          </div>
        </div>

        {/* Schedule Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left py-3 px-4 text-white font-semibold">Day</th>
                <th className="text-left py-3 px-4 text-white font-semibold">8:00am - 1:00pm</th>
                <th className="text-left py-3 px-4 text-white font-semibold">1:00pm - 6:00pm</th>
              </tr>
            </thead>
            <tbody>
              {scheduleData.map((slot, index) => (
                <tr key={slot.day} className={`border-b border-white/10 ${index % 2 === 0 ? 'bg-white/5' : ''}`}>
                  <td className="py-3 px-4 text-white font-medium">{slot.day}</td>
                  <td className="py-3 px-4 text-gray-300">{slot.morning}</td>
                  <td className="py-3 px-4 text-gray-300">{slot.afternoon}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Notes */}
        <div className="mt-6 space-y-3">
          <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <span className="text-yellow-300 text-lg">📝</span>
              <div>
                <p className="text-yellow-300 text-sm font-medium mb-1">Important Notes:</p>
                <ul className="text-yellow-200 text-xs space-y-1">
                  <li>• All Tutors on the afternoon/evening shifts are required to assist Shiellah during English classes</li>
                  <li>• Manager Tonny will oversee the English class on Friday when Shiellah is off</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
