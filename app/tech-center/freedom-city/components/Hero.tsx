// app/tech-center/freedom-city/components/Hero.tsx
import React from 'react';

export default function FreedomCityHero() {
  const techCenterColor = '#E8A33D'; // Gold for Freedom City

  return (
    <div className="min-h-screen bg-[#0D1117] text-white">
      {/* Hero Section */}
      <div className="relative min-h-[500px] bg-[#0D1117] overflow-hidden">
        {/* Wave animation background */}
        <div className="absolute inset-0">
          <div 
            className="absolute bottom-0 left-0 right-0 h-64 opacity-20"
            style={{
              background: `linear-gradient(180deg, transparent 0%, ${techCenterColor}30 100%)`,
            }}
          />
          <svg className="absolute bottom-0 w-full" viewBox="0 0 1440 320" style={{ opacity: 0.1 }}>
            <path 
              fill={techCenterColor}
              fillOpacity="1"
              d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,154.7C960,171,1056,181,1152,165.3C1248,149,1344,107,1392,85.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            />
          </svg>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2" style={{ borderColor: techCenterColor }}>
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: techCenterColor }} />
              <span className="text-sm font-medium" style={{ color: techCenterColor }}>
                Kampala, Uganda
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
              Freedom City<br />
              <span style={{ color: techCenterColor }}>Tech Center</span>
            </h1>

            <p className="text-xl text-[#A79C8C] max-w-2xl mx-auto">
              The flagship tech center of Selfless CE, located at Freedom City Mall. We provide world-class education and support for students pursuing BYU-Idaho courses and academic excellence.
            </p>

            <div className="flex flex-wrap justify-center gap-8 pt-4">
              <div className="text-center">
                <div className="text-4xl font-bold mb-1" style={{ color: techCenterColor }}>1,200+</div>
                <div className="text-sm text-[#6B6358]">Students Enrolled</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-1" style={{ color: techCenterColor }}>50+</div>
                <div className="text-sm text-[#6B6358]">Certified Tutors</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-1" style={{ color: techCenterColor }}>2019</div>
                <div className="text-sm text-[#6B6358]">Established</div>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              <button 
                className="px-8 py-3 rounded-lg font-semibold text-[#0B0912] transition-all hover:scale-105 shadow-lg"
                style={{ backgroundColor: techCenterColor }}
              >
                Join Our Community
              </button>
              <button 
                className="px-8 py-3 rounded-lg font-semibold border-2 transition-all hover:scale-105"
                style={{ borderColor: techCenterColor, color: techCenterColor }}
              >
                Explore Programs
              </button>
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
              The Freedom City Tech Center page is currently under development and will be displayed here soon. 
              This tech center is part of our expanding network across Uganda.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="bg-[#0B0912] rounded-lg p-4 border border-[#2A2438]">
                <div className="text-[#E8A33D] font-semibold mb-1">Coming Soon</div>
                <div className="text-[#6B6358] text-sm">Center-specific courses and programs</div>
              </div>
              <div className="bg-[#0B0912] rounded-lg p-4 border border-[#2A2438]">
                <div className="text-[#E8A33D] font-semibold mb-1">Coming Soon</div>
                <div className="text-[#6B6358] text-sm">Local student announcements</div>
              </div>
              <div className="bg-[#0B0912] rounded-lg p-4 border border-[#2A2438]">
                <div className="text-[#E8A33D] font-semibold mb-1">Coming Soon</div>
                <div className="text-[#6B6358] text-sm">Center-specific events and activities</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}