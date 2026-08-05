// app/tech-center/jinja/components/Hero.tsx
import React from 'react';

export default function JinjaHero() {
  const techCenterColor = '#10B981'; // Green for Jinja

  return (
    <div className="min-h-screen bg-[#0D1117] text-white">
      {/* Hero Section */}
      <div className="relative min-h-[500px] bg-[#0D1117] overflow-hidden">
        {/* Diagonal stripe pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `repeating-linear-gradient(
          45deg,
          ${techCenterColor}40,
          ${techCenterColor}40 1px,
          transparent 1px,
          transparent 20px
        )`
        }} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Left side - Stats card */}
            <div className="lg:w-1/3 space-y-4">
              <div className="p-6 rounded-2xl border-2 bg-[#150F20]/80 backdrop-blur" style={{ borderColor: techCenterColor }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: techCenterColor }}>
                    <span className="text-2xl font-bold text-[#0B0912]">J</span>
                  </div>
                  <div>
                    <div className="font-bold text-white">Jinja</div>
                    <div className="text-xs text-[#6B6358]">Eastern Region</div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#A79C8C]">Students</span>
                    <span className="font-bold" style={{ color: techCenterColor }}>850+</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#A79C8C]">Programs</span>
                    <span className="font-bold" style={{ color: techCenterColor }}>12</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#A79C8C]">Graduation Rate</span>
                    <span className="font-bold" style={{ color: techCenterColor }}>95%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Center - Main content */}
            <div className="lg:w-2/3 text-center lg:text-left space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2" style={{ borderColor: techCenterColor }}>
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: techCenterColor }} />
                <span className="text-sm font-medium" style={{ color: techCenterColor }}>
                  Jinja, Uganda
                </span>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight">
                Jinja <span style={{ color: techCenterColor }}>Tech Center</span>
              </h1>

              <p className="text-xl text-[#A79C8C] max-w-xl">
                Serving the Eastern region with excellence in education. Our Jinja tech center combines traditional learning values with modern technology to create an optimal learning environment.
              </p>

              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <button 
                  className="px-8 py-3 rounded-lg font-semibold text-[#0B0912] transition-all hover:scale-105"
                  style={{ backgroundColor: techCenterColor }}
                >
                  Enroll Now
                </button>
                <button 
                  className="px-8 py-3 rounded-lg font-semibold border-2 transition-all hover:scale-105"
                  style={{ borderColor: techCenterColor, color: techCenterColor }}
                >
                  Virtual Tour
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
              The Jinja Tech Center page is currently under development and will be displayed here soon. 
              This tech center is part of our expanding network across Uganda.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="bg-[#0B0912] rounded-lg p-4 border border-[#2A2438]">
                <div className="text-[#10B981] font-semibold mb-1">Coming Soon</div>
                <div className="text-[#6B6358] text-sm">Center-specific courses and programs</div>
              </div>
              <div className="bg-[#0B0912] rounded-lg p-4 border border-[#2A2438]">
                <div className="text-[#10B981] font-semibold mb-1">Coming Soon</div>
                <div className="text-[#6B6358] text-sm">Local student announcements</div>
              </div>
              <div className="bg-[#0B0912] rounded-lg p-4 border border-[#2A2438]">
                <div className="text-[#10B981] font-semibold mb-1">Coming Soon</div>
                <div className="text-[#6B6358] text-sm">Center-specific events and activities</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}