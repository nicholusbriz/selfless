export default function TempleTripsPage() {
  return (
    <div className="min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Temple Trips</h1>
        <p className="text-[#8A8278]">View temple trip schedules and register for upcoming trips</p>
      </div>

      <div className="bg-gradient-to-br from-[#1A1228] to-[#0F0A1A] rounded-2xl p-8 border border-[#1A1228]">
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#E8A33D] to-[#14B8A6] flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-[#0F0A1A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Temple Trips Coming Soon</h2>
          <p className="text-[#8A8278] text-center max-w-md">
            This page is under development. Check back later to view temple trip schedules and register for upcoming trips.
          </p>
        </div>
      </div>
    </div>
  );
}
