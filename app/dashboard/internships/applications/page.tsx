export default function MyApplicationsPage() {
  return (
    <div className="min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">My Applications</h1>
        <p className="text-[#8A8278]">Track your internship applications and their status</p>
      </div>

      <div className="bg-gradient-to-br from-[#1A1228] to-[#0F0A1A] rounded-2xl p-8 border border-[#1A1228]">
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#E8A33D] to-[#14B8A6] flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-[#0F0A1A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Applications Coming Soon</h2>
          <p className="text-[#8A8278] text-center max-w-md">
            This page is under development. Check back later to view and manage your internship applications.
          </p>
        </div>
      </div>
    </div>
  );
}
