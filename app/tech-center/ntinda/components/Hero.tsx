// app/tech-center/ntinda/components/Hero.tsx
import React from 'react';

export default function NtindaHero() {
  const techCenterColor = '#06B6D4'; // Cyan for Ntinda

  return (
    <div className="min-h-screen bg-[#0D1117] text-white">
      {/* Hero Section */}
      <div className="relative min-h-[600px] bg-[#0D1117] overflow-hidden">
        {/* Urban grid pattern - representing Ntinda's metropolitan location */}
        <div className="absolute inset-0 opacity-[0.04]">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(${techCenterColor} 1px, transparent 1px),
              linear-gradient(90deg, ${techCenterColor} 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px'
          }} />
          {/* Highlighted intersection points */}
          <div className="absolute top-1/4 left-1/3 w-2 h-2 rounded-full" style={{ backgroundColor: techCenterColor }} />
          <div className="absolute bottom-1/3 right-1/4 w-2 h-2 rounded-full" style={{ backgroundColor: techCenterColor }} />
          <div className="absolute top-2/3 left-2/3 w-2 h-2 rounded-full" style={{ backgroundColor: techCenterColor }} />
          <div className="absolute top-1/2 left-1/2 w-3 h-3 rounded-full" style={{ backgroundColor: techCenterColor }} />
        </div>

        {/* Urban glow - representing the city vibe */}
        <div className="absolute inset-0">
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10 blur-3xl"
            style={{ backgroundColor: techCenterColor }}
          />
          <div 
            className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-5 blur-3xl"
            style={{ backgroundColor: techCenterColor }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
            {/* Content Section */}
            <div className="lg:col-span-3 space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border" 
                     style={{ borderColor: `${techCenterColor}40` }}>
                  <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: techCenterColor }} />
                  <span className="text-sm font-medium" style={{ color: techCenterColor }}>
                    Kampala, Uganda
                  </span>
                  <span className="w-px h-4" style={{ backgroundColor: `${techCenterColor}30` }} />
                  <span className="text-xs text-[#6B6358]">Metropolitan Hub</span>
                </div>

                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                  <span style={{ color: techCenterColor }}>Ntinda</span>
                  <br />
                  <span className="text-white">Tech Center</span>
                </h1>

                <p className="text-lg text-[#A79C8C] leading-relaxed max-w-xl">
                  Located in the heart of Ntinda, Kampala, our tech center serves students in the 
                  metropolitan area with state-of-the-art facilities and comprehensive academic support.
                </p>
              </div>

              {/* Feature grid - replacing stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-[#2A2438] bg-[#150F20]/50 hover:border-[#06B6D4]/30 transition-all duration-300 hover:-translate-y-1">
                  <div className="text-2xl mb-2">🏙️</div>
                  <div className="font-semibold text-white text-sm">City Campus</div>
                  <div className="text-xs text-[#A79C8C] mt-1">Metropolitan learning</div>
                </div>

                <div className="p-4 rounded-xl border border-[#2A2438] bg-[#150F20]/50 hover:border-[#06B6D4]/30 transition-all duration-300 hover:-translate-y-1">
                  <div className="text-2xl mb-2">📡</div>
                  <div className="font-semibold text-white text-sm">Modern Tech</div>
                  <div className="text-xs text-[#A79C8C] mt-1">State-of-the-art facilities</div>
                </div>

                <div className="p-4 rounded-xl border border-[#2A2438] bg-[#150F20]/50 hover:border-[#06B6D4]/30 transition-all duration-300 hover:-translate-y-1">
                  <div className="text-2xl mb-2">👥</div>
                  <div className="font-semibold text-white text-sm">Community</div>
                  <div className="text-xs text-[#A79C8C] mt-1">Supportive network</div>
                </div>

                <div className="p-4 rounded-xl border border-[#2A2438] bg-[#150F20]/50 hover:border-[#06B6D4]/30 transition-all duration-300 hover:-translate-y-1">
                  <div className="text-2xl mb-2">🎯</div>
                  <div className="font-semibold text-white text-sm">Excellence</div>
                  <div className="text-xs text-[#A79C8C] mt-1">Academic achievement</div>
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

            {/* Visual Section - Unique city-inspired design */}
            <div className="lg:col-span-2">
              <div className="relative w-full aspect-square max-w-md mx-auto">
                {/* Dynamic city-inspired geometric shapes */}
                <div className="absolute inset-0">
                  {/* Rotating geometric elements */}
                  <div 
                    className="absolute inset-0 rounded-3xl border-2 opacity-20 animate-[spin_25s_linear_infinite]"
                    style={{ borderColor: techCenterColor }}
                  />
                  <div 
                    className="absolute inset-[15%] rounded-2xl border-2 opacity-30 animate-[spin_20s_linear_infinite_reverse]"
                    style={{ borderColor: techCenterColor }}
                  />
                  <div 
                    className="absolute inset-[30%] rounded-xl border-2 opacity-40 animate-[spin_15s_linear_infinite]"
                    style={{ borderColor: techCenterColor }}
                  />
                </div>

                {/* Center content */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <div className="text-6xl font-bold" style={{ color: techCenterColor }}>NT</div>
                    <div className="h-px w-12 mx-auto" style={{ backgroundColor: techCenterColor }} />
                    <div className="text-xs tracking-[0.3em] uppercase text-[#6B6358]">City Hub</div>
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: techCenterColor }} />
                      <span className="text-[10px] text-[#6B6358]">Active Learning</span>
                    </div>
                  </div>
                </div>

                {/* Small accent dots */}
                <div className="absolute top-[10%] right-[15%] w-1.5 h-1.5 rounded-full" style={{ backgroundColor: techCenterColor }} />
                <div className="absolute bottom-[15%] left-[20%] w-1.5 h-1.5 rounded-full" style={{ backgroundColor: techCenterColor }} />
                <div className="absolute top-[30%] left-[10%] w-1 h-1 rounded-full" style={{ backgroundColor: techCenterColor }} />
                <div className="absolute bottom-[25%] right-[12%] w-1 h-1 rounded-full" style={{ backgroundColor: techCenterColor }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Center Features - Unique to Ntinda */}
      <div className="px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="group relative p-8 rounded-2xl bg-[#150F20] border border-[#2A2438] hover:border-[#06B6D4]/30 transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-0 left-0 w-16 h-[2px]" style={{ backgroundColor: techCenterColor }} />
              <div className="text-3xl mb-4">🚀</div>
              <h3 className="text-lg font-semibold text-[#F5F0E8] mb-2">Urban Innovation</h3>
              <p className="text-[#A79C8C] text-sm leading-relaxed">
                At the heart of Kampala's tech scene, we provide students with cutting-edge resources and opportunities.
              </p>
            </div>

            <div className="group relative p-8 rounded-2xl bg-[#150F20] border border-[#2A2438] hover:border-[#06B6D4]/30 transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-0 left-0 w-16 h-[2px]" style={{ backgroundColor: techCenterColor }} />
              <div className="text-3xl mb-4">🌐</div>
              <h3 className="text-lg font-semibold text-[#F5F0E8] mb-2">Connected Learning</h3>
              <p className="text-[#A79C8C] text-sm leading-relaxed">
                Seamless access to global educational resources and a network of learners and mentors.
              </p>
            </div>

            <div className="group relative p-8 rounded-2xl bg-[#150F20] border border-[#2A2438] hover:border-[#06B6D4]/30 transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-0 left-0 w-16 h-[2px]" style={{ backgroundColor: techCenterColor }} />
              <div className="text-3xl mb-4">⚡</div>
              <h3 className="text-lg font-semibold text-[#F5F0E8] mb-2">24/7 Access</h3>
              <p className="text-[#A79C8C] text-sm leading-relaxed">
                Flexible learning hours with round-the-clock access to facilities and digital resources.
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
                BUILDING THE METROPOLITAN HUB
              </span>
            </div>
            
            <div className="mt-8 bg-[#150F20] border border-[#2A2438] rounded-2xl p-8 md:p-10">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: techCenterColor }} />
                    <h3 className="text-lg font-semibold text-[#F5F0E8]">Expanding Horizons</h3>
                  </div>
                  <p className="text-[#A79C8C] text-sm max-w-lg">
                    New programs, enhanced facilities, and expanded learning opportunities coming to Ntinda Tech Center.
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
                    Stay Informed
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