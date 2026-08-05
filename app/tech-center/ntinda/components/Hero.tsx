// app/tech-center/ntinda/components/Hero.tsx
import React from 'react';

export default function NtindaHero() {
  const techCenterColor = '#06B6D4'; // Cyan for Ntinda

  return (
    <div className="min-h-screen bg-[#0D1117] text-white">
      {/* Hero Section */}
      <div className="relative min-h-[500px] bg-[#0D1117] overflow-hidden">
        {/* Animated gradient background */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            background: `radial-gradient(circle at 30% 50%, ${techCenterColor}40 0%, transparent 50%), radial-gradient(circle at 70% 50%, ${techCenterColor}30 0%, transparent 50%)`,
          }}
        />
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(${techCenterColor}40 1px, transparent 1px), linear-gradient(90deg, ${techCenterColor}40 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Content Section */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2" style={{ borderColor: techCenterColor }}>
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: techCenterColor }} />
                <span className="text-sm font-medium" style={{ color: techCenterColor }}>
                  Kampala, Uganda
                </span>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight">
                <span style={{ color: techCenterColor }}>Ntinda</span> Tech Center
              </h1>

              <p className="text-xl text-[#A79C8C] max-w-xl">
                Located in the heart of Ntinda, Kampala, our tech center serves students in the metropolitan area with state-of-the-art facilities and comprehensive academic support.
              </p>

              <div className="grid grid-cols-2 gap-6">
                <div className="p-4 rounded-xl border border-[#2A2438] bg-[#150F20]/50">
                  <div className="text-3xl font-bold mb-1" style={{ color: techCenterColor }}>500+</div>
                  <div className="text-sm text-[#6B6358]">Active Students</div>
                </div>
                <div className="p-4 rounded-xl border border-[#2A2438] bg-[#150F20]/50">
                  <div className="text-3xl font-bold mb-1" style={{ color: techCenterColor }}>15+</div>
                  <div className="text-sm text-[#6B6358]">Course Programs</div>
                </div>
                <div className="p-4 rounded-xl border border-[#2A2438] bg-[#150F20]/50">
                  <div className="text-3xl font-bold mb-1" style={{ color: techCenterColor }}>24/7</div>
                  <div className="text-sm text-[#6B6358]">Learning Access</div>
                </div>
                <div className="p-4 rounded-xl border border-[#2A2438] bg-[#150F20]/50">
                  <div className="text-3xl font-bold mb-1" style={{ color: techCenterColor }}>98%</div>
                  <div className="text-sm text-[#6B6358]">Success Rate</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <button 
                  className="px-8 py-3 rounded-lg font-semibold text-[#0B0912] transition-all hover:scale-105"
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

            {/* Visual Section */}
            <div className="relative">
              <div className="relative w-full aspect-square max-w-md mx-auto">
                {/* Rotating circles */}
                <div 
                  className="absolute inset-0 rounded-full border-2 opacity-20 animate-spin"
                  style={{ 
                    borderColor: techCenterColor,
                    animationDuration: '20s'
                  }}
                />
                <div 
                  className="absolute inset-8 rounded-full border-2 opacity-30 animate-spin"
                  style={{ 
                    borderColor: techCenterColor,
                    animationDuration: '15s',
                    animationDirection: 'reverse'
                  }}
                />
                <div 
                  className="absolute inset-16 rounded-full border-2 opacity-40 animate-spin"
                  style={{ 
                    borderColor: techCenterColor,
                    animationDuration: '10s'
                  }}
                />
                
                {/* Center content */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl font-bold mb-2" style={{ color: techCenterColor }}>NT</div>
                    <div className="text-sm text-[#6B6358]">Since 2020</div>
                  </div>
                </div>
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
              The Ntinda Tech Center page is currently under development and will be displayed here soon. 
              This tech center is part of our expanding network across Uganda.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="bg-[#0B0912] rounded-lg p-4 border border-[#2A2438]">
                <div className="text-[#06B6D4] font-semibold mb-1">Coming Soon</div>
                <div className="text-[#6B6358] text-sm">Center-specific courses and programs</div>
              </div>
              <div className="bg-[#0B0912] rounded-lg p-4 border border-[#2A2438]">
                <div className="text-[#06B6D4] font-semibold mb-1">Coming Soon</div>
                <div className="text-[#6B6358] text-sm">Local student announcements</div>
              </div>
              <div className="bg-[#0B0912] rounded-lg p-4 border border-[#2A2438]">
                <div className="text-[#06B6D4] font-semibold mb-1">Coming Soon</div>
                <div className="text-[#6B6358] text-sm">Center-specific events and activities</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}