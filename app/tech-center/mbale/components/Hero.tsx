// app/tech-center/mbale/components/Hero.tsx
import React from 'react';

export default function MbaleHero() {
  const techCenterColor = '#3B82F6'; // Blue for Mbale

  return (
    <div className="min-h-screen bg-[#0D1117] text-white">
      {/* Hero Section */}
      <div className="relative min-h-[600px] bg-[#0D1117] overflow-hidden">
        {/* Mountain-inspired layered peaks - representing Mount Elgon */}
        <div className="absolute inset-0 opacity-[0.06]">
          <div className="absolute bottom-0 left-0 right-0 h-2/3">
            <div className="absolute bottom-0 left-0 w-0 h-0 border-l-[200px] border-l-transparent border-r-[300px] border-r-transparent border-b-[400px]" 
                 style={{ borderBottomColor: techCenterColor }} />
            <div className="absolute bottom-0 left-1/4 w-0 h-0 border-l-[150px] border-l-transparent border-r-[250px] border-r-transparent border-b-[300px]" 
                 style={{ borderBottomColor: techCenterColor }} />
            <div className="absolute bottom-0 right-0 w-0 h-0 border-l-[180px] border-l-transparent border-r-[220px] border-r-transparent border-b-[350px]" 
                 style={{ borderBottomColor: techCenterColor }} />
          </div>
        </div>

        {/* Subtle mountain ridge line */}
        <div className="absolute bottom-0 left-0 right-0 h-40 opacity-[0.04]">
          <svg className="w-full h-full" viewBox="0 0 1440 160" preserveAspectRatio="none">
            <polyline 
              points="0,160 100,80 200,120 350,40 500,100 650,20 800,90 950,30 1100,110 1250,50 1440,80 1440,160" 
              stroke={techCenterColor}
              strokeWidth="2"
              fill="none"
            />
          </svg>
        </div>

        {/* Blue mist - representing the mountain atmosphere */}
        <div className="absolute inset-0">
          <div 
            className="absolute bottom-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full opacity-10 blur-3xl"
            style={{ backgroundColor: techCenterColor }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="flex flex-col lg:flex-row items-start gap-16">
            {/* Left - Main content */}
            <div className="lg:w-1/2 space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border" 
                     style={{ borderColor: `${techCenterColor}40` }}>
                  <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: techCenterColor }} />
                  <span className="text-sm font-medium" style={{ color: techCenterColor }}>
                    Mbale, Uganda
                  </span>
                  <span className="w-px h-4" style={{ backgroundColor: `${techCenterColor}30` }} />
                  <span className="text-xs text-[#6B6358]">Eastern Region</span>
                </div>

                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                  Mbale
                  <span className="block mt-2" style={{ color: techCenterColor }}>
                    Tech Center
                  </span>
                </h1>

                <p className="text-lg text-[#A79C8C] leading-relaxed max-w-lg">
                  Nestled at the foot of Mount Elgon, our Mbale tech center combines natural inspiration 
                  with cutting-edge education technology to serve Eastern Uganda students.
                </p>
              </div>

              {/* Feature list - replacing stats */}
              <div className="space-y-4">
                <div className="flex items-start gap-4 group">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 transition-all group-hover:scale-110" 
                       style={{ backgroundColor: `${techCenterColor}20` }}>
                    <span className="text-lg">🏔️</span>
                  </div>
                  <div>
                    <div className="font-semibold text-white">Mountain View Campus</div>
                    <div className="text-sm text-[#A79C8C]">Inspired learning with a view of Mount Elgon</div>
                  </div>
                </div>

                <div className="flex items-start gap-4 group">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 transition-all group-hover:scale-110" 
                       style={{ backgroundColor: `${techCenterColor}20` }}>
                    <span className="text-lg">📚</span>
                  </div>
                  <div>
                    <div className="font-semibold text-white">BYU-Idaho Support</div>
                    <div className="text-sm text-[#A79C8C]">Comprehensive academic guidance and tutoring</div>
                  </div>
                </div>

                <div className="flex items-start gap-4 group">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 transition-all group-hover:scale-110" 
                       style={{ backgroundColor: `${techCenterColor}20` }}>
                    <span className="text-lg">💻</span>
                  </div>
                  <div>
                    <div className="font-semibold text-white">Modern Facilities</div>
                    <div className="text-sm text-[#A79C8C]">State-of-the-art learning technology</div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <button 
                  className="px-8 py-3.5 rounded-lg font-semibold text-[#0B0912] transition-all duration-300 hover:shadow-2xl hover:scale-105 relative overflow-hidden group"
                  style={{ backgroundColor: techCenterColor }}
                >
                  <span className="relative z-10">Apply Now</span>
                  <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </button>
                <button 
                  className="px-8 py-3.5 rounded-lg font-semibold transition-all duration-300 hover:scale-105 group relative overflow-hidden"
                  style={{ 
                    border: `2px solid ${techCenterColor}`,
                    color: techCenterColor
                  }}
                >
                  <span className="relative z-10">Our Programs</span>
                  <span className="absolute inset-0" style={{ backgroundColor: techCenterColor }} />
                  <span className="absolute inset-0 bg-[#0D1117] -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
                </button>
              </div>
            </div>

            {/* Right - Visual element replacing stats */}
            <div className="lg:w-1/2">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <div className="p-6 rounded-2xl bg-[#150F20] border border-[#2A2438] hover:border-[#3B82F6]/30 transition-all duration-300">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0" 
                           style={{ backgroundColor: `${techCenterColor}15` }}>
                        <span className="text-2xl">⛰️</span>
                      </div>
                      <div>
                        <div className="font-semibold text-white">Mount Elgon Region</div>
                        <div className="text-sm text-[#A79C8C]">Eastern Uganda's premier tech education hub</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#150F20] border border-[#2A2438] hover:border-[#3B82F6]/30 transition-all duration-300 hover:-translate-y-1">
                  <div className="text-3xl mb-2">🎓</div>
                  <div className="font-semibold text-white text-sm">Academic Excellence</div>
                  <div className="text-xs text-[#A79C8C] mt-1">Top-tier education</div>
                </div>

                <div className="p-5 rounded-2xl bg-[#150F20] border border-[#2A2438] hover:border-[#3B82F6]/30 transition-all duration-300 hover:-translate-y-1">
                  <div className="text-3xl mb-2">🌄</div>
                  <div className="font-semibold text-white text-sm">Natural Inspiration</div>
                  <div className="text-xs text-[#A79C8C] mt-1">Learning with a view</div>
                </div>

                <div className="p-5 rounded-2xl bg-[#150F20] border border-[#2A2438] hover:border-[#3B82F6]/30 transition-all duration-300 hover:-translate-y-1">
                  <div className="text-3xl mb-2">🔬</div>
                  <div className="font-semibold text-white text-sm">Innovation Hub</div>
                  <div className="text-xs text-[#A79C8C] mt-1">Modern technology</div>
                </div>

                <div className="p-5 rounded-2xl bg-[#150F20] border border-[#2A2438] hover:border-[#3B82F6]/30 transition-all duration-300 hover:-translate-y-1">
                  <div className="text-3xl mb-2">🤝</div>
                  <div className="font-semibold text-white text-sm">Community</div>
                  <div className="text-xs text-[#A79C8C] mt-1">Supportive network</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Center Features - Unique to Mbale */}
      <div className="px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="group relative p-8 rounded-2xl bg-[#150F20] border border-[#2A2438] hover:border-[#3B82F6]/30 transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-0 left-0 w-16 h-[2px]" style={{ backgroundColor: techCenterColor }} />
              <div className="text-3xl mb-4">🏔️</div>
              <h3 className="text-lg font-semibold text-[#F5F0E8] mb-2">Mountain Learning</h3>
              <p className="text-[#A79C8C] text-sm leading-relaxed">
                Inspired by the majesty of Mount Elgon, our campus provides a unique learning environment that fosters creativity.
              </p>
            </div>

            <div className="group relative p-8 rounded-2xl bg-[#150F20] border border-[#2A2438] hover:border-[#3B82F6]/30 transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-0 left-0 w-16 h-[2px]" style={{ backgroundColor: techCenterColor }} />
              <div className="text-3xl mb-4">📈</div>
              <h3 className="text-lg font-semibold text-[#F5F0E8] mb-2">Eastern Excellence</h3>
              <p className="text-[#A79C8C] text-sm leading-relaxed">
                Serving as the leading educational institution for Eastern Uganda with comprehensive academic programs.
              </p>
            </div>

            <div className="group relative p-8 rounded-2xl bg-[#150F20] border border-[#2A2438] hover:border-[#3B82F6]/30 transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-0 left-0 w-16 h-[2px]" style={{ backgroundColor: techCenterColor }} />
              <div className="text-3xl mb-4">🌟</div>
              <h3 className="text-lg font-semibold text-[#F5F0E8] mb-2">Student Success</h3>
              <p className="text-[#A79C8C] text-sm leading-relaxed">
                Dedicated to helping students achieve their academic goals through personalized support and guidance.
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
                CLIMBING HIGHER
              </span>
            </div>
            
            <div className="mt-8 bg-[#150F20] border border-[#2A2438] rounded-2xl p-8 md:p-10">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: techCenterColor }} />
                    <h3 className="text-lg font-semibold text-[#F5F0E8]">Reaching New Heights</h3>
                  </div>
                  <p className="text-[#A79C8C] text-sm max-w-lg">
                    New programs, expanded facilities, and enhanced learning resources coming to Mbale Tech Center.
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
                    Stay Connected
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