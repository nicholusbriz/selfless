// app/tech-center/masaka/components/Hero.tsx
import React from 'react';

export default function MasakaHero() {
  const techCenterColor = '#EC4899'; // Pink for Masaka

  return (
    <div className="min-h-screen bg-[#0D1117] text-white">
      {/* Hero Section */}
      <div className="relative min-h-[600px] bg-[#0D1117] overflow-hidden">
        {/* Floral pattern - representing Masaka's garden city reputation */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute top-10 left-10 w-40 h-40" style={{
            backgroundImage: `radial-gradient(circle at 30% 30%, ${techCenterColor} 2px, transparent 2px),
                             radial-gradient(circle at 70% 70%, ${techCenterColor} 2px, transparent 2px),
                             radial-gradient(circle at 50% 50%, ${techCenterColor} 3px, transparent 3px)`,
            backgroundSize: '80px 80px'
          }} />
          <div className="absolute bottom-20 right-20 w-60 h-60" style={{
            backgroundImage: `radial-gradient(circle at 20% 40%, ${techCenterColor} 2px, transparent 2px),
                             radial-gradient(circle at 80% 60%, ${techCenterColor} 2px, transparent 2px),
                             radial-gradient(circle at 50% 50%, ${techCenterColor} 3px, transparent 3px)`,
            backgroundSize: '100px 100px'
          }} />
        </div>

        {/* Soft glow - representing Masaka's vibrant energy */}
        <div className="absolute inset-0">
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10 blur-3xl"
            style={{ backgroundColor: techCenterColor }}
          />
          <div 
            className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-5 blur-3xl"
            style={{ backgroundColor: '#F472B6' }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid lg:grid-cols-5 gap-12 items-start">
            {/* Left side - Brand and content */}
            <div className="lg:col-span-3 space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border" 
                     style={{ borderColor: `${techCenterColor}40` }}>
                  <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: techCenterColor }} />
                  <span className="text-sm font-medium" style={{ color: techCenterColor }}>
                    Masaka, Uganda
                  </span>
                  <span className="w-px h-4" style={{ backgroundColor: `${techCenterColor}30` }} />
                  <span className="text-xs text-[#6B6358]">Central Region</span>
                </div>

                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                  <span style={{ color: techCenterColor }}>Masaka</span>
                  <br />
                  <span className="text-white">Tech Center</span>
                </h1>

                <p className="text-lg text-[#A79C8C] leading-relaxed max-w-xl">
                  Empowering students in the central region with innovative learning solutions 
                  and comprehensive academic support for BYU-Idaho courses.
                </p>

                <div className="flex flex-wrap gap-4">
                  <button 
                    className="px-8 py-3.5 rounded-lg font-semibold text-[#0B0912] transition-all duration-300 hover:shadow-2xl hover:scale-105 relative overflow-hidden group"
                    style={{ backgroundColor: techCenterColor }}
                  >
                    <span className="relative z-10">Begin Your Journey</span>
                    <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  </button>
                  <button 
                    className="px-8 py-3.5 rounded-lg font-semibold transition-all duration-300 hover:scale-105 group relative overflow-hidden"
                    style={{ 
                      border: `2px solid ${techCenterColor}`,
                      color: techCenterColor
                    }}
                  >
                    <span className="relative z-10">Learn More</span>
                    <span className="absolute inset-0" style={{ backgroundColor: techCenterColor }} />
                    <span className="absolute inset-0 bg-[#0D1117] -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right side - Feature grid replacing stats */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-[#150F20] to-[#1A1525] border border-[#2A2438] hover:border-[#EC4899]/30 transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" 
                           style={{ backgroundColor: `${techCenterColor}20` }}>
                        <span className="text-xl">🌺</span>
                      </div>
                      <div>
                        <div className="font-semibold text-white text-sm">Garden City Campus</div>
                        <div className="text-xs text-[#A79C8C]">Learning in Uganda's green heart</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#150F20] border border-[#2A2438] hover:border-[#EC4899]/30 transition-all duration-300 hover:-translate-y-1">
                  <div className="text-2xl mb-2">📖</div>
                  <div className="font-semibold text-white text-sm">Academic Support</div>
                  <div className="text-xs text-[#A79C8C] mt-1">Dedicated mentoring</div>
                </div>

                <div className="p-4 rounded-2xl bg-[#150F20] border border-[#2A2438] hover:border-[#EC4899]/30 transition-all duration-300 hover:-translate-y-1">
                  <div className="text-2xl mb-2">🚀</div>
                  <div className="font-semibold text-white text-sm">Innovation</div>
                  <div className="text-xs text-[#A79C8C] mt-1">Modern learning tools</div>
                </div>

                <div className="p-4 rounded-2xl bg-[#150F20] border border-[#2A2438] hover:border-[#EC4899]/30 transition-all duration-300 hover:-translate-y-1">
                  <div className="text-2xl mb-2">🤗</div>
                  <div className="font-semibold text-white text-sm">Community</div>
                  <div className="text-xs text-[#A79C8C] mt-1">Supportive environment</div>
                </div>

                <div className="p-4 rounded-2xl bg-[#150F20] border border-[#2A2438] hover:border-[#EC4899]/30 transition-all duration-300 hover:-translate-y-1">
                  <div className="text-2xl mb-2">🎯</div>
                  <div className="font-semibold text-white text-sm">Excellence</div>
                  <div className="text-xs text-[#A79C8C] mt-1">Quality education</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Center Features - Unique to Masaka */}
      <div className="px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="group relative p-8 rounded-2xl bg-[#150F20] border border-[#2A2438] hover:border-[#EC4899]/30 transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-0 left-0 w-16 h-[2px]" style={{ backgroundColor: techCenterColor }} />
              <div className="text-3xl mb-4">🌿</div>
              <h3 className="text-lg font-semibold text-[#F5F0E8] mb-2">Green Learning</h3>
              <p className="text-[#A79C8C] text-sm leading-relaxed">
                A serene learning environment surrounded by Masaka's natural beauty, fostering focus and growth.
              </p>
            </div>

            <div className="group relative p-8 rounded-2xl bg-[#150F20] border border-[#2A2438] hover:border-[#EC4899]/30 transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-0 left-0 w-16 h-[2px]" style={{ backgroundColor: techCenterColor }} />
              <div className="text-3xl mb-4">⚡</div>
              <h3 className="text-lg font-semibold text-[#F5F0E8] mb-2">Tech Empowerment</h3>
              <p className="text-[#A79C8C] text-sm leading-relaxed">
                Equipping students with cutting-edge technology skills for the modern digital economy.
              </p>
            </div>

            <div className="group relative p-8 rounded-2xl bg-[#150F20] border border-[#2A2438] hover:border-[#EC4899]/30 transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-0 left-0 w-16 h-[2px]" style={{ backgroundColor: techCenterColor }} />
              <div className="text-3xl mb-4">🌟</div>
              <h3 className="text-lg font-semibold text-[#F5F0E8] mb-2">Excellence Hub</h3>
              <p className="text-[#A79C8C] text-sm leading-relaxed">
                Central region's premier destination for BYU-Idaho academic success and personal growth.
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
                BLOOMING OPPORTUNITIES
              </span>
            </div>
            
            <div className="mt-8 bg-[#150F20] border border-[#2A2438] rounded-2xl p-8 md:p-10">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: techCenterColor }} />
                    <h3 className="text-lg font-semibold text-[#F5F0E8]">Growing Stronger</h3>
                  </div>
                  <p className="text-[#A79C8C] text-sm max-w-lg">
                    New programs, expanded facilities, and enhanced resources coming to Masaka Tech Center.
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
                    Get Updates
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