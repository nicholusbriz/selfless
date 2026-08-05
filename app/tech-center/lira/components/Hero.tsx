// app/tech-center/lira/components/Hero.tsx
import React from 'react';

export default function LiraHero() {
  const techCenterColor = '#F59E0B'; // Amber for Lira

  return (
    <div className="min-h-screen bg-[#0D1117] text-white">
      {/* Hero Section */}
      <div className="relative min-h-[600px] bg-[#0D1117] overflow-hidden">
        {/* African savanna-inspired pattern - unique to Lira */}
        <div className="absolute inset-0 opacity-[0.04]">
          <div className="absolute bottom-0 left-0 right-0 h-2/3" style={{
            backgroundImage: `
              repeating-linear-gradient(
                45deg,
                ${techCenterColor} 0px,
                ${techCenterColor} 2px,
                transparent 2px,
                transparent 60px
              )
            `
          }} />
          <div className="absolute top-0 right-0 w-1/2 h-full" style={{
            backgroundImage: `
              repeating-linear-gradient(
                -45deg,
                ${techCenterColor} 0px,
                ${techCenterColor} 1px,
                transparent 1px,
                transparent 40px
              )
            `
          }} />
        </div>

        {/* Warm glow - representing Lira's golden savanna */}
        <div className="absolute inset-0">
          <div 
            className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full opacity-10 blur-3xl"
            style={{ backgroundColor: techCenterColor }}
          />
          <div 
            className="absolute bottom-0 right-0 w-96 h-96 rounded-full opacity-5 blur-3xl"
            style={{ backgroundColor: techCenterColor }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
            {/* Left column - Brand identity */}
            <div className="lg:col-span-2 space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center border-2" 
                       style={{ borderColor: techCenterColor }}>
                    <span className="text-3xl font-bold" style={{ color: techCenterColor }}>L</span>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-white">Lira Tech</div>
                    <div className="text-xs text-[#6B6358] tracking-wider">Northern Hub</div>
                  </div>
                </div>

                <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                  Excellence in<br />
                  <span style={{ color: techCenterColor }}>Northern Education</span>
                </h1>

                <p className="text-lg text-[#A79C8C] leading-relaxed max-w-lg">
                  Northern Uganda's premier educational hub for BYU-Idaho courses and academic advancement. 
                  Empowering the region through technology and education.
                </p>

                <div className="flex flex-wrap gap-4">
                  <button 
                    className="px-8 py-3.5 rounded-lg font-semibold text-[#0B0912] transition-all duration-300 hover:shadow-2xl hover:scale-105 relative overflow-hidden group"
                    style={{ backgroundColor: techCenterColor }}
                  >
                    <span className="relative z-10">Start Learning</span>
                    <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  </button>
                  <button 
                    className="px-8 py-3.5 rounded-lg font-semibold transition-all duration-300 hover:scale-105 group relative overflow-hidden"
                    style={{ 
                      border: `2px solid ${techCenterColor}`,
                      color: techCenterColor
                    }}
                  >
                    <span className="relative z-10">Contact Us</span>
                    <span className="absolute inset-0" style={{ backgroundColor: techCenterColor }} />
                    <span className="absolute inset-0 bg-[#0D1117] -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right column - Visual elements */}
            <div className="lg:col-span-3">
              <div className="grid grid-cols-2 gap-4 max-w-2xl ml-auto">
                {/* Feature cards replacing stats */}
                <div className="col-span-2">
                  <div className="p-6 rounded-2xl bg-[#150F20]/80 border border-[#2A2438] hover:border-[#F59E0B]/30 transition-all duration-300">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" 
                           style={{ backgroundColor: `${techCenterColor}20` }}>
                        <span className="text-2xl">🌾</span>
                      </div>
                      <div>
                        <div className="font-semibold text-white">Savanna Region Hub</div>
                        <div className="text-sm text-[#A79C8C]">Serving Northern Uganda's growing tech community</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#150F20]/80 border border-[#2A2438] hover:border-[#F59E0B]/30 transition-all duration-300">
                  <div className="text-3xl mb-2">🎯</div>
                  <div className="font-semibold text-white text-sm">Focused Learning</div>
                  <div className="text-xs text-[#A79C8C] mt-1">Tailored BYU-Idaho programs</div>
                </div>

                <div className="p-5 rounded-2xl bg-[#150F20]/80 border border-[#2A2438] hover:border-[#F59E0B]/30 transition-all duration-300">
                  <div className="text-3xl mb-2">🌍</div>
                  <div className="font-semibold text-white text-sm">Regional Impact</div>
                  <div className="text-xs text-[#A79C8C] mt-1">Building Northern Uganda's future</div>
                </div>

                <div className="p-5 rounded-2xl bg-[#150F20]/80 border border-[#2A2438] hover:border-[#F59E0B]/30 transition-all duration-300">
                  <div className="text-3xl mb-2">📈</div>
                  <div className="font-semibold text-white text-sm">Growth Path</div>
                  <div className="text-xs text-[#A79C8C] mt-1">From education to career</div>
                </div>

                <div className="p-5 rounded-2xl bg-[#150F20]/80 border border-[#2A2438] hover:border-[#F59E0B]/30 transition-all duration-300">
                  <div className="text-3xl mb-2">🤝</div>
                  <div className="font-semibold text-white text-sm">Community First</div>
                  <div className="text-xs text-[#A79C8C] mt-1">Supportive learning environment</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Center Features - Unique to Lira */}
      <div className="px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="group relative p-8 rounded-2xl bg-[#150F20] border border-[#2A2438] hover:border-[#F59E0B]/30 transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-0 left-0 w-16 h-[2px]" style={{ backgroundColor: techCenterColor }} />
              <div className="text-3xl mb-4">🏫</div>
              <h3 className="text-lg font-semibold text-[#F5F0E8] mb-2">Northern Excellence</h3>
              <p className="text-[#A79C8C] text-sm leading-relaxed">
                Dedicated to providing world-class education opportunities in the Northern region of Uganda.
              </p>
            </div>

            <div className="group relative p-8 rounded-2xl bg-[#150F20] border border-[#2A2438] hover:border-[#F59E0B]/30 transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-0 left-0 w-16 h-[2px]" style={{ backgroundColor: techCenterColor }} />
              <div className="text-3xl mb-4">💡</div>
              <h3 className="text-lg font-semibold text-[#F5F0E8] mb-2">Innovation Hub</h3>
              <p className="text-[#A79C8C] text-sm leading-relaxed">
                Fostering innovation and technological advancement through modern facilities and resources.
              </p>
            </div>

            <div className="group relative p-8 rounded-2xl bg-[#150F20] border border-[#2A2438] hover:border-[#F59E0B]/30 transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-0 left-0 w-16 h-[2px]" style={{ backgroundColor: techCenterColor }} />
              <div className="text-3xl mb-4">🌅</div>
              <h3 className="text-lg font-semibold text-[#F5F0E8] mb-2">Future Ready</h3>
              <p className="text-[#A79C8C] text-sm leading-relaxed">
                Preparing students for the future with skills that bridge the gap between education and industry.
              </p>
            </div>
          </div>

          {/* Under Development - Unique integration */}
          <div className="mt-12 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#2A2438]" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-6 py-2 bg-[#0D1117] text-sm text-[#6B6358] tracking-wider">
                DEVELOPING NORTHERN UGANDA
              </span>
            </div>
            
            <div className="mt-8 bg-[#150F20] border border-[#2A2438] rounded-2xl p-8 md:p-10">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: techCenterColor }} />
                    <h3 className="text-lg font-semibold text-[#F5F0E8]">Expanding Impact</h3>
                  </div>
                  <p className="text-[#A79C8C] text-sm max-w-lg">
                    New facilities, enhanced programs, and increased opportunities coming to Lira Tech Center.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button 
                    className="px-6 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105 whitespace-nowrap"
                    style={{ 
                      backgroundColor: `${techCenterColor}15`,
                      color: techCenterColor,
                      border: `1px solid ${techCenterColor}30`
                    }}
                  >
                    Stay Updated
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}