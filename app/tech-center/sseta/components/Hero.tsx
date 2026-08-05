// app/tech-center/sseta/components/Hero.tsx
import React from 'react';

export default function SsetaHero() {
  const techCenterColor = '#8B5CF6'; // Purple for Sseta

  return (
    <div className="min-h-screen bg-[#0D1117] text-white">
      {/* Hero Section */}
      <div className="relative min-h-[500px] bg-[#0D1117] overflow-hidden">
        {/* Circular gradient pattern */}
        <div className="absolute inset-0">
          <div 
            className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full opacity-20 blur-3xl"
            style={{ backgroundColor: techCenterColor }}
          />
          <div 
            className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full opacity-15 blur-3xl"
            style={{ backgroundColor: techCenterColor }}
          />
          <div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-10 blur-3xl"
            style={{ backgroundColor: techCenterColor }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex flex-col items-center text-center space-y-8">
            {/* Location badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2" style={{ borderColor: techCenterColor }}>
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: techCenterColor }} />
              <span className="text-sm font-medium" style={{ color: techCenterColor }}>
                Central Region, Uganda
              </span>
            </div>

            {/* Main heading */}
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
              Sseta<br />
              <span style={{ color: techCenterColor }}>Tech Center</span>
            </h1>

            {/* Description */}
            <p className="text-xl text-[#A79C8C] max-w-2xl">
              A beacon of educational excellence in central Uganda, providing transformative learning experiences and comprehensive support for BYU-Idaho academic programs.
            </p>

            {/* Stats row */}
            <div className="flex flex-wrap justify-center gap-8 py-4">
              <div className="text-center">
                <div className="text-4xl font-bold mb-1" style={{ color: techCenterColor }}>450</div>
                <div className="text-sm text-[#6B6358]">Students</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-1" style={{ color: techCenterColor }}>14</div>
                <div className="text-sm text-[#6B6358]">Programs</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-1" style={{ color: techCenterColor }}>96%</div>
                <div className="text-sm text-[#6B6358]">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-1" style={{ color: techCenterColor }}>2022</div>
                <div className="text-sm text-[#6B6358]">Established</div>
              </div>
            </div>

            {/* Feature highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
              <div className="p-5 rounded-lg border border-[#2A2438] bg-[#150F20]/50 hover:border-2 transition-all" style={{ hoverBorderColor: techCenterColor }}>
                <div className="text-2xl mb-2">📚</div>
                <div className="font-semibold text-white mb-1">Digital Library</div>
                <div className="text-xs text-[#6B6358]">Access to extensive resources</div>
              </div>
              <div className="p-5 rounded-lg border border-[#2A2438] bg-[#150F20]/50 hover:border-2 transition-all" style={{ hoverBorderColor: techCenterColor }}>
                <div className="text-2xl mb-2">🎯</div>
                <div className="font-semibold text-white mb-1">Personalized Learning</div>
                <div className="text-xs text-[#6B6358]">Tailored academic pathways</div>
              </div>
              <div className="p-5 rounded-lg border border-[#2A2438] bg-[#150F20]/50 hover:border-2 transition-all" style={{ hoverBorderColor: techCenterColor }}>
                <div className="text-2xl mb-2">🌟</div>
                <div className="font-semibold text-white mb-1">Expert Guidance</div>
                <div className="text-xs text-[#6B6358]">Dedicated tutor support</div>
              </div>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-wrap justify-center gap-4">
              <button 
                className="px-8 py-3 rounded-lg font-semibold text-[#0B0912] transition-all hover:scale-105 shadow-lg"
                style={{ backgroundColor: techCenterColor }}
              >
                Get Started
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
              The Sseta Tech Center page is currently under development and will be displayed here soon. 
              This tech center is part of our expanding network across Uganda.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="bg-[#0B0912] rounded-lg p-4 border border-[#2A2438]">
                <div className="text-[#8B5CF6] font-semibold mb-1">Coming Soon</div>
                <div className="text-[#6B6358] text-sm">Center-specific courses and programs</div>
              </div>
              <div className="bg-[#0B0912] rounded-lg p-4 border border-[#2A2438]">
                <div className="text-[#8B5CF6] font-semibold mb-1">Coming Soon</div>
                <div className="text-[#6B6358] text-sm">Local student announcements</div>
              </div>
              <div className="bg-[#0B0912] rounded-lg p-4 border border-[#2A2438]">
                <div className="text-[#8B5CF6] font-semibold mb-1">Coming Soon</div>
                <div className="text-[#6B6358] text-sm">Center-specific events and activities</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}