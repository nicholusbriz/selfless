export default function BrowseInternshipsPage() {
  return (
    <div className="min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Browse Internships</h1>
        <p className="text-[#8A8278]">Explore available internship opportunities</p>
      </div>

      <div className="bg-gradient-to-br from-[#1A1228] to-[#0F0A1A] rounded-2xl p-8 border border-[#1A1228]">
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#E8A33D] to-[#14B8A6] flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-[#0F0A1A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Internships Coming Soon</h2>
          <p className="text-[#8A8278] text-center max-w-md">
            This page is under development. Check back later to browse available internship opportunities.
          </p>
        </div>
      </div>
    </div>
  );
}
