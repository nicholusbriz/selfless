// app/tech-center/sseta/components/Hero.tsx
import React from 'react';

export default function SsetaHero() {
  const techCenterColor = '#8B5CF6'; // Purple for Sseta

  return (
    <div className="min-h-screen bg-[#0D1117] text-white">
      {/* Hero Section */}
      <div className="relative min-h-[600px] bg-[#0D1117] overflow-hidden">
        {/* Abstract pattern - representing Sseta's central location */}
        <div className="absolute inset-0 opacity-[0.05]">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              radial-gradient(circle at 20% 30%, ${techCenterColor} 2px, transparent 2px),
              radial-gradient(circle at 80% 70%, ${techCenterColor} 2px, transparent 2px),
              radial-gradient(circle at 50% 50%, ${techCenterColor} 3px, transparent 3px)
            `,
            backgroundSize: '80px 80px'
          }} />
          <div className="absolute top-1/3 right-1/4 w-64 h-64" style={{
            backgroundImage: `
              radial-gradient(circle at 30% 40%, ${techCenterColor} 1px, transparent 1px),
              radial-gradient(circle at 70% 60%, ${techCenterColor} 1px, transparent 1px),
              radial-gradient(circle at 50% 50%, ${techCenterColor} 2px, transparent 2px)
            `,
            backgroundSize: '50px 50px'
          }} />
        </div>

        {/* Central glow - representing Sseta's central location */}
        <div className="absolute inset-0">
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-10 blur-3xl"
            style={{ backgroundColor: techCenterColor }}
          />
          <div 
            className="absolute bottom-0 left-1/3 w-80 h-80 rounded-full opacity-5 blur-3xl"
            style={{ backgroundColor: techCenterColor }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="flex flex-col lg:flex-row items-start gap-16">
            {/* Left - Main content */}
            <div className="lg:w-3/5 space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border" 
                     style={{ borderColor: `${techCenterColor}40` }}>
                  <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: techCenterColor }} />
                  <span className="text-sm font-medium" style={{ color: techCenterColor }}>
                    Central Region, Uganda
                  </span>
                  <span className="w-px h-4" style={{ backgroundColor: `${techCenterColor}30` }} />
                  <span className="text-xs text-[#6B6358]">Growing Hub</span>
                </div>

                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                  Sseta
                  <span className="block mt-2" style={{ color: techCenterColor }}>
                    Tech Center
                  </span>
                </h1>

                <p className="text-lg text-[#A79C8C] leading-relaxed max-w-xl">
                  A beacon of educational excellence in central Uganda, providing transformative learning 
                  experiences and comprehensive support for BYU-Idaho academic programs.
                </p>
              </div>

              {/* Feature highlights - replacing stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-xl border border-[#2A2438] bg-[#150F20]/50 hover:border-[#8B5CF6]/30 transition-all duration-300 hover:-translate-y-1 group">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" 
                         style={{ backgroundColor: `${techCenterColor}20` }}>
                      <span className="text-lg">📚</span>
                    </div>
                    <div>
                      <div className="font-semibold text-white text-sm">Digital Library</div>
                      <div className="text-xs text-[#A79C8C] mt-1">Extensive resource access</div>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-xl border border-[#2A2438] bg-[#150F20]/50 hover:border-[#8B5CF6]/30 transition-all duration-300 hover:-translate-y-1 group">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" 
                         style={{ backgroundColor: `${techCenterColor}20` }}>
                      <span className="text-lg">🎯</span>
                    </div>
                    <div>
                      <div className="font-semibold text-white text-sm">Personalized Learning</div>
                      <div className="text-xs text-[#A79C8C] mt-1">Tailored pathways</div>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-xl border border-[#2A2438] bg-[#150F20]/50 hover:border-[#8B5CF6]/30 transition-all duration-300 hover:-translate-y-1 group sm:col-span-2">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" 
                         style={{ backgroundColor: `${techCenterColor}20` }}>
                      <span className="text-lg">🌟</span>
                    </div>
                    <div>
                      <div className="font-semibold text-white text-sm">Expert Guidance</div>
                      <div className="text-xs text-[#A79C8C] mt-1">Dedicated tutor support and mentoring</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <button 
                  className="px-8 py-3.5 rounded-lg font-semibold text-[#0B0912] transition-all duration-300 hover:shadow-2xl hover:scale-105 relative overflow-hidden group"
                  style={{ backgroundColor: techCenterColor }}
                >
                  <span className="relative z-10">Get Started</span>
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

            {/* Right - Visual element replacing stats */}
            <div className="lg:w-2/5">
              <div className="relative w-full aspect-square max-w-sm mx-auto">
                {/* Concentric geometric shapes */}
                <div 
                  className="absolute inset-0 rounded-[30%_70%_40%_60%_/_60%_30%_70%_40%] border-2 opacity-30 animate-[spin_30s_linear_infinite]"
                  style={{ borderColor: techCenterColor }}
                />
                <div 
                  className="absolute inset-[12%] rounded-[60%_40%_70%_30%_/_30%_70%_40%_60%] border-2 opacity-40 animate-[spin_25s_linear_infinite_reverse]"
                  style={{ borderColor: techCenterColor }}
                />
                <div 
                  className="absolute inset-[28%] rounded-[40%_60%_30%_70%_/_70%_40%_60%_30%] border-2 opacity-50 animate-[spin_20s_linear_infinite]"
                  style={{ borderColor: techCenterColor }}
                />

                {/* Center content */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <div className="text-6xl font-bold" style={{ color: techCenterColor }}>SS</div>
                    <div className="h-px w-12 mx-auto" style={{ backgroundColor: techCenterColor }} />
                    <div className="text-xs tracking-[0.3em] uppercase text-[#6B6358]">Tech Hub</div>
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: techCenterColor }} />
                      <span className="text-[10px] text-[#6B6358]">Central Region</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Center Features - Unique to Sseta */}
      <div className="px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="group relative p-8 rounded-2xl bg-[#150F20] border border-[#2A2438] hover:border-[#8B5CF6]/30 transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-0 left-0 w-16 h-[2px]" style={{ backgroundColor: techCenterColor }} />
              <div className="text-3xl mb-4">🏛️</div>
              <h3 className="text-lg font-semibold text-[#F5F0E8] mb-2">Central Excellence</h3>
              <p className="text-[#A79C8C] text-sm leading-relaxed">
                Serving as the educational cornerstone of central Uganda with world-class academic programs.
              </p>
            </div>

            <div className="group relative p-8 rounded-2xl bg-[#150F20] border border-[#2A2438] hover:border-[#8B5CF6]/30 transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-0 left-0 w-16 h-[2px]" style={{ backgroundColor: techCenterColor }} />
              <div className="text-3xl mb-4">💫</div>
              <h3 className="text-lg font-semibold text-[#F5F0E8] mb-2">Transformative Learning</h3>
              <p className="text-[#A79C8C] text-sm leading-relaxed">
                Empowering students through innovative teaching methods and comprehensive academic support.
              </p>
            </div>

            <div className="group relative p-8 rounded-2xl bg-[#150F20] border border-[#2A2438] hover:border-[#8B5CF6]/30 transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-0 left-0 w-16 h-[2px]" style={{ backgroundColor: techCenterColor }} />
              <div className="text-3xl mb-4">🤝</div>
              <h3 className="text-lg font-semibold text-[#F5F0E8] mb-2">Community Impact</h3>
              <p className="text-[#A79C8C] text-sm leading-relaxed">
                Building a legacy of education and opportunity that strengthens the entire central region.
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
                GROWING CENTRAL UGANDA
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
                    New programs, enhanced facilities, and expanded opportunities coming to Sseta Tech Center.
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