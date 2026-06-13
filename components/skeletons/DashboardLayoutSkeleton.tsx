export default function DashboardLayoutSkeleton() {
  return (
    <div className="h-screen bg-black flex overflow-hidden">
      {/* Sidebar Skeleton */}
      <aside className="w-64 bg-black/90 backdrop-blur-lg border-r border-white/10 flex-shrink-0 hidden md:block">
        <div className="flex flex-col h-full">
          {/* Logo Skeleton */}
          <div className="p-6 border-b border-white/10 flex-shrink-0">
            <div className="animate-shimmer bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%] rounded h-8 w-32"></div>
          </div>

          {/* Navigation Skeleton */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-lg">
                <div className="animate-shimmer bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%] rounded w-5 h-5"></div>
                <div className="animate-shimmer bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%] rounded h-4 w-24"></div>
              </div>
            ))}
          </nav>

          {/* User Info Skeleton */}
          <div className="p-4 border-t border-white/10 flex-shrink-0">
            <div className="animate-shimmer bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%] rounded h-4 w-32 mb-2"></div>
            <div className="animate-shimmer bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%] rounded h-3 w-40 mb-3"></div>
            <div className="animate-shimmer bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%] rounded h-8 w-full"></div>
          </div>
        </div>
      </aside>

      {/* Main Content Skeleton */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header Skeleton */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-white/10 bg-black/80 backdrop-blur-lg flex-shrink-0">
          <div className="animate-shimmer bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%] rounded w-6 h-6"></div>
          <div className="animate-shimmer bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%] rounded h-6 w-24"></div>
          <div className="animate-shimmer bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%] rounded w-10 h-6"></div>
        </header>

        {/* Content Area Skeleton */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="animate-shimmer bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%] rounded h-12 w-64 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
                  <div className="animate-shimmer bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%] rounded h-4 w-24 mb-4"></div>
                  <div className="animate-shimmer bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%] rounded h-12 w-20"></div>
                </div>
              ))}
            </div>
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
              <div className="animate-shimmer bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%] rounded h-6 w-48 mb-4"></div>
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="animate-shimmer bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%] rounded-full h-10 w-10"></div>
                    <div className="space-y-2">
                      <div className="animate-shimmer bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%] rounded h-4 w-32"></div>
                      <div className="animate-shimmer bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%] rounded h-3 w-24"></div>
                    </div>
                  </div>
                  <div className="animate-shimmer bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%] rounded h-8 w-16"></div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
