// app/tech-center/masaka/components/Hero.tsx
import React from 'react';

export default function MasakaHero() {
  const techCenterColor = '#EC4899'; // Pink for Masaka

  return (
    <div className="min-h-screen bg-[#0D1117] text-white">
      {/* Hero Section */}
      <div className="relative min-h-[500px] bg-[#0D1117] overflow-hidden">
        {/* Hexagon pattern background */}
        <div className="absolute inset-0 opacity-[0.05]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill='none' stroke='${techCenterColor}' stroke-width='1'/%3E%3C/svg%3E")`,
        }} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2" style={{ borderColor: techCenterColor }}>
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: techCenterColor }} />
              <span className="text-sm font-medium" style={{ color: techCenterColor }}>
                Masaka, Uganda
              </span>
            </div>

            {/* Main heading with gradient text */}
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
              <span style={{ 
                background: `linear-gradient(135deg, ${techCenterColor}, #F472B6)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Masaka
              </span>
              <br />
              Tech Center
            </h1>

            <p className="text-xl text-[#A79C8C] max-w-2xl mx-auto">
              Empowering students in the central region with innovative learning solutions and comprehensive academic support for BYU-Idaho courses.
            </p>

            {/* Feature cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="p-6 rounded-xl border-2 bg-[#150F20]/80 backdrop-blur hover:scale-105 transition-transform" style={{ borderColor: techCenterColor }}>
                <div className="text-3xl mb-2">🎓</div>
                <div className="font-bold text-white mb-1">Academic Excellence</div>
                <div className="text-sm text-[#6B6358]">Top-tier educational programs</div>
              </div>
              <div className="p-6 rounded-xl border-2 bg-[#150F20]/80 backdrop-blur hover:scale-105 transition-transform" style={{ borderColor: techCenterColor }}>
                <div className="text-3xl mb-2">💻</div>
                <div className="font-bold text-white mb-1">Modern Facilities</div>
                <div className="text-sm text-[#6B6358]">State-of-the-art technology</div>
              </div>
              <div className="p-6 rounded-xl border-2 bg-[#150F20]/80 backdrop-blur hover:scale-105 transition-transform" style={{ borderColor: techCenterColor }}>
                <div className="text-3xl mb-2">🤝</div>
                <div className="font-bold text-white mb-1">Community Focus</div>
                <div className="text-sm text-[#6B6358]">Supportive learning environment</div>
              </div>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-wrap justify-center gap-4">
              <button 
                className="px-8 py-3 rounded-lg font-semibold text-[#0B0912] transition-all hover:scale-105 shadow-lg"
                style={{ backgroundColor: techCenterColor }}
              >
                Begin Your Journey
              </button>
              <button 
                className="px-8 py-3 rounded-lg font-semibold border-2 transition-all hover:scale-105"
                style={{ borderColor: techCenterColor, color: techCenterColor }}
              >
                Learn More
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
              The Masaka Tech Center page is currently under development and will be displayed here soon. 
              This tech center is part of our expanding network across Uganda.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="bg-[#0B0912] rounded-lg p-4 border border-[#2A2438]">
                <div className="text-[#EC4899] font-semibold mb-1">Coming Soon</div>
                <div className="text-[#6B6358] text-sm">Center-specific courses and programs</div>
              </div>
              <div className="bg-[#0B0912] rounded-lg p-4 border border-[#2A2438]">
                <div className="text-[#EC4899] font-semibold mb-1">Coming Soon</div>
                <div className="text-[#6B6358] text-sm">Local student announcements</div>
              </div>
              <div className="bg-[#0B0912] rounded-lg p-4 border border-[#2A2438]">
                <div className="text-[#EC4899] font-semibold mb-1">Coming Soon</div>
                <div className="text-[#6B6358] text-sm">Center-specific events and activities</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}