// app/tech-center/mbale/components/Hero.tsx
import React from 'react';

export default function MbaleHero() {
  const techCenterColor = '#3B82F6'; // Blue for Mbale

  return (
    <div className="min-h-screen bg-[#0D1117] text-white">
      {/* Hero Section */}
      <div className="relative min-h-[500px] bg-[#0D1117] overflow-hidden">
        {/* Mountain-like gradient background */}
        <div className="absolute inset-0">
          <div 
            className="absolute bottom-0 left-0 right-0 h-1/2 opacity-20"
            style={{
              background: `linear-gradient(180deg, transparent 0%, ${techCenterColor}30 100%)`,
            }}
          />
          <svg className="absolute bottom-0 w-full opacity-10" viewBox="0 0 1440 320">
            <path 
              fill={techCenterColor}
              fillOpacity="1"
              d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            />
          </svg>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Left - Content */}
            <div className="lg:w-1/2 space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2" style={{ borderColor: techCenterColor }}>
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: techCenterColor }} />
                <span className="text-sm font-medium" style={{ color: techCenterColor }}>
                  Mbale, Uganda
                </span>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight">
                Mbale<br />
                <span style={{ color: techCenterColor }}>Tech Center</span>
              </h1>

              <p className="text-xl text-[#A79C8C]">
                Nestled at the foot of Mount Elgon, our Mbale tech center combines natural inspiration with cutting-edge education technology to serve Eastern Uganda students.
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: techCenterColor }}>
                    <span className="text-sm font-bold text-[#0B0912]">✓</span>
                  </div>
                  <span className="text-[#A79C8C]">Comprehensive BYU-Idaho course support</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: techCenterColor }}>
                    <span className="text-sm font-bold text-[#0B0912]">✓</span>
                  </div>
                  <span className="text-[#A79C8C]">Expert tutoring and mentorship</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: techCenterColor }}>
                    <span className="text-sm font-bold text-[#0B0912]">✓</span>
                  </div>
                  <span className="text-[#A79C8C]">Modern learning facilities</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <button 
                  className="px-8 py-3 rounded-lg font-semibold text-[#0B0912] transition-all hover:scale-105"
                  style={{ backgroundColor: techCenterColor }}
                >
                  Apply Now
                </button>
                <button 
                  className="px-8 py-3 rounded-lg font-semibold border-2 transition-all hover:scale-105"
                  style={{ borderColor: techCenterColor, color: techCenterColor }}
                >
                  Our Programs
                </button>
              </div>
            </div>

            {/* Right - Stats */}
            <div className="lg:w-1/2 grid grid-cols-2 gap-4">
              <div className="p-6 rounded-xl border-2 bg-[#150F20]/80 backdrop-blur text-center" style={{ borderColor: techCenterColor }}>
                <div className="text-4xl font-bold mb-2" style={{ color: techCenterColor }}>720</div>
                <div className="text-sm text-[#6B6358]">Students</div>
              </div>
              <div className="p-6 rounded-xl border-2 bg-[#150F20]/80 backdrop-blur text-center" style={{ borderColor: techCenterColor }}>
                <div className="text-4xl font-bold mb-2" style={{ color: techCenterColor }}>20</div>
                <div className="text-sm text-[#6B6358]">Programs</div>
              </div>
              <div className="p-6 rounded-xl border-2 bg-[#150F20]/80 backdrop-blur text-center" style={{ borderColor: techCenterColor }}>
                <div className="text-4xl font-bold mb-2" style={{ color: techCenterColor }}>94%</div>
                <div className="text-sm text-[#6B6358]">Graduation</div>
              </div>
              <div className="p-6 rounded-xl border-2 bg-[#150F20]/80 backdrop-blur text-center" style={{ borderColor: techCenterColor }}>
                <div className="text-4xl font-bold mb-2" style={{ color: techCenterColor }}>2020</div>
                <div className="text-sm text-[#6B6358]">Founded</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Under Development Card */}
      <div className="px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#150F20] border border-[#2A2438] rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-[#F5F0E8] mb-4">
              Under Development
            </h2>
            <p className="text-[#A79C8C] text-lg mb-8 max-w-xl mx-auto">
              The Mbale Tech Center page is currently under development and will be displayed here soon. 
              This tech center is part of our expanding network across Uganda.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="bg-[#0B0912] rounded-lg p-4 border border-[#2A2438]">
                <div className="text-[#3B82F6] font-semibold mb-1">Coming Soon</div>
                <div className="text-[#6B6358] text-sm">Center-specific courses and programs</div>
              </div>
              <div className="bg-[#0B0912] rounded-lg p-4 border border-[#2A2438]">
                <div className="text-[#3B82F6] font-semibold mb-1">Coming Soon</div>
                <div className="text-[#6B6358] text-sm">Local student announcements</div>
              </div>
              <div className="bg-[#0B0912] rounded-lg p-4 border border-[#2A2438]">
                <div className="text-[#3B82F6] font-semibold mb-1">Coming Soon</div>
                <div className="text-[#6B6358] text-sm">Center-specific events and activities</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}