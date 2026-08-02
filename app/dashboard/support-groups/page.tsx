export default function SupportGroupsPage() {
  return (
    <div className="min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Support Groups</h1>
        <p className="text-[#8A8278]">Connect with support groups and mentoring programs</p>
      </div>

      <div className="bg-gradient-to-br from-[#1A1228] to-[#0F0A1A] rounded-2xl p-8 border border-[#1A1228]">
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#E8A33D] to-[#14B8A6] flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-[#0F0A1A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Support Groups Coming Soon</h2>
          <p className="text-[#8A8278] text-center max-w-md">
            This page is under development. Check back later to access support groups and mentoring programs.
          </p>
        </div>
      </div>
    </div>
  );
}
