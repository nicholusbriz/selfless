// app/tech-center/lira/components/Hero.tsx
import React from 'react';

export default function LiraHero() {
  const techCenterColor = '#F59E0B'; // Amber for Lira

  return (
    <div className="min-h-screen bg-[#0D1117] text-white">
      {/* Hero Section */}
      <div className="relative min-h-[500px] bg-[#0D1117] overflow-hidden">
        {/* Gradient mesh background */}
        <div className="absolute inset-0">
          <div 
            className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl"
            style={{ backgroundColor: techCenterColor }}
          />
          <div 
            className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full opacity-15 blur-3xl"
            style={{ backgroundColor: techCenterColor }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left column - Logo and tagline */}
            <div className="lg:col-span-1 space-y-6">
              <div className="w-24 h-24 rounded-2xl flex items-center justify-center border-4" style={{ borderColor: techCenterColor }}>
                <span className="text-4xl font-bold" style={{ color: techCenterColor }}>L</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Lira Tech Center</h2>
                <p className="text-[#A79C8C]">Northern Uganda's premier educational hub for BYU-Idaho courses and academic advancement.</p>
              </div>
            </div>

            {/* Center column - Main content */}
            <div className="lg:col-span-2 space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2" style={{ borderColor: techCenterColor }}>
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: techCenterColor }} />
                <span className="text-sm font-medium" style={{ color: techCenterColor }}>
                  Lira, Uganda
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                Excellence in<br />
                <span style={{ color: techCenterColor }}>Northern Education</span>
              </h1>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 rounded-lg bg-[#150F20]/50 border border-[#2A2438]">
                  <div className="text-2xl font-bold mb-1" style={{ color: techCenterColor }}>600+</div>
                  <div className="text-xs text-[#6B6358]">Students</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-[#150F20]/50 border border-[#2A2438]">
                  <div className="text-2xl font-bold mb-1" style={{ color: techCenterColor }}>18</div>
                  <div className="text-xs text-[#6B6358]">Programs</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-[#150F20]/50 border border-[#2A2438]">
                  <div className="text-2xl font-bold mb-1" style={{ color: techCenterColor }}>92%</div>
                  <div className="text-xs text-[#6B6358]">Success</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-[#150F20]/50 border border-[#2A2438]">
                  <div className="text-2xl font-bold mb-1" style={{ color: techCenterColor }}>2021</div>
                  <div className="text-xs text-[#6B6358]">Founded</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <button 
                  className="px-8 py-3 rounded-lg font-semibold text-[#0B0912] transition-all hover:scale-105"
                  style={{ backgroundColor: techCenterColor }}
                >
                  Start Learning
                </button>
                <button 
                  className="px-8 py-3 rounded-lg font-semibold border-2 transition-all hover:scale-105"
                  style={{ borderColor: techCenterColor, color: techCenterColor }}
                >
                  Contact Us
                </button>
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
              The Lira Tech Center page is currently under development and will be displayed here soon. 
              This tech center is part of our expanding network across Uganda.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="bg-[#0B0912] rounded-lg p-4 border border-[#2A2438]">
                <div className="text-[#F59E0B] font-semibold mb-1">Coming Soon</div>
                <div className="text-[#6B6358] text-sm">Center-specific courses and programs</div>
              </div>
              <div className="bg-[#0B0912] rounded-lg p-4 border border-[#2A2438]">
                <div className="text-[#F59E0B] font-semibold mb-1">Coming Soon</div>
                <div className="text-[#6B6358] text-sm">Local student announcements</div>
              </div>
              <div className="bg-[#0B0912] rounded-lg p-4 border border-[#2A2438]">
                <div className="text-[#F59E0B] font-semibold mb-1">Coming Soon</div>
                <div className="text-[#6B6358] text-sm">Center-specific events and activities</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}