// app/tech-center/freedom-city/components/Hero.tsx
import React from 'react';

export default function FreedomCityHero() {
  const techCenterColor = '#E8A33D'; // Gold for Freedom City

  return (
    <div className="min-h-screen bg-[#0D1117] text-white">
      {/* Hero Section */}
      <div className="relative min-h-[600px] bg-[#0D1117] overflow-hidden">
        {/* Subtle geometric background */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-72 h-72 border-2 rounded-full" style={{ borderColor: techCenterColor }} />
          <div className="absolute bottom-10 right-20 w-96 h-96 border-2 rotate-45" style={{ borderColor: techCenterColor }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border-2 rounded-full" style={{ borderColor: techCenterColor }} />
        </div>

        {/* Minimal wave accent */}
        <div className="absolute bottom-0 left-0 right-0 h-32 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 1440 120" preserveAspectRatio="none">
            <path 
              fill={techCenterColor}
              d="M0,60 C360,120 720,0 1080,60 C1260,90 1380,105 1440,120 L1440,120 L0,120 Z"
            />
          </svg>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-[2px]" style={{ backgroundColor: techCenterColor }} />
                  <span className="text-sm tracking-widest uppercase" style={{ color: techCenterColor }}>
                    Kampala, Uganda
                  </span>
                </div>

                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                  Freedom City
                  <span className="block mt-2" style={{ color: techCenterColor }}>
                    Tech Center
                  </span>
                </h1>

                <p className="text-lg text-[#A79C8C] leading-relaxed max-w-lg">
                  The flagship tech center of Selfless CE, located at Freedom City Mall. 
                  We provide world-class education and support for students pursuing 
                  BYU-Idaho courses and academic excellence.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <button 
                  className="px-8 py-3.5 rounded-lg font-semibold text-[#0B0912] transition-all duration-300 hover:shadow-2xl hover:scale-105 relative overflow-hidden group"
                  style={{ backgroundColor: techCenterColor }}
                >
                  <span className="relative z-10">Join Our Community</span>
                  <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </button>
                <button 
                  className="px-8 py-3.5 rounded-lg font-semibold transition-all duration-300 hover:scale-105 group relative overflow-hidden"
                  style={{ 
                    border: `2px solid ${techCenterColor}`,
                    color: techCenterColor
                  }}
                >
                  <span className="relative z-10">Explore Programs</span>
                  <span className="absolute inset-0" style={{ backgroundColor: techCenterColor }} />
                  <span className="absolute inset-0 bg-[#0D1117] -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
                </button>
              </div>
            </div>

            {/* Right Column - Visual Element */}
            <div className="relative hidden md:block">
              <div className="aspect-square max-w-md mx-auto relative">
                {/* Abstract shape */}
                <div 
                  className="absolute inset-0 rounded-3xl transform rotate-6"
                  style={{ 
                    background: `linear-gradient(135deg, ${techCenterColor}15, transparent 70%)`,
                    border: `1px solid ${techCenterColor}25`
                  }}
                />
                <div 
                  className="absolute inset-8 rounded-2xl transform -rotate-3"
                  style={{ 
                    background: `linear-gradient(225deg, ${techCenterColor}10, transparent 60%)`,
                    border: `1px solid ${techCenterColor}15`
                  }}
                />
                <div className="absolute inset-16 rounded-xl flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <div className="text-7xl font-bold" style={{ color: techCenterColor }}>FC</div>
                    <div className="text-xs tracking-[0.3em] uppercase text-[#6B6358]">Tech Center</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Center Features - Replacing stats with more meaningful content */}
      <div className="px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="group relative p-8 rounded-2xl bg-[#150F20] border border-[#2A2438] hover:border-[#E8A33D]/30 transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-0 left-0 w-20 h-[2px]" style={{ backgroundColor: techCenterColor }} />
              <div className="text-3xl mb-4">🎓</div>
              <h3 className="text-lg font-semibold text-[#F5F0E8] mb-2">Academic Support</h3>
              <p className="text-[#A79C8C] text-sm leading-relaxed">
                Dedicated tutoring and mentoring for BYU-Idaho students in a collaborative learning environment.
              </p>
            </div>

            <div className="group relative p-8 rounded-2xl bg-[#150F20] border border-[#2A2438] hover:border-[#E8A33D]/30 transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-0 left-0 w-20 h-[2px]" style={{ backgroundColor: techCenterColor }} />
              <div className="text-3xl mb-4">🌐</div>
              <h3 className="text-lg font-semibold text-[#F5F0E8] mb-2">Community Hub</h3>
              <p className="text-[#A79C8C] text-sm leading-relaxed">
                A vibrant space where students connect, collaborate, and grow together in their educational journey.
              </p>
            </div>

            <div className="group relative p-8 rounded-2xl bg-[#150F20] border border-[#2A2438] hover:border-[#E8A33D]/30 transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-0 left-0 w-20 h-[2px]" style={{ backgroundColor: techCenterColor }} />
              <div className="text-3xl mb-4">⚡</div>
              <h3 className="text-lg font-semibold text-[#F5F0E8] mb-2">Tech Resources</h3>
              <p className="text-[#A79C8C] text-sm leading-relaxed">
                Access to modern facilities, high-speed internet, and learning resources for academic success.
              </p>
            </div>
          </div>

          {/* Under Development - More integrated and unique */}
          <div className="mt-12 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#2A2438]" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-6 py-2 bg-[#0D1117] text-sm text-[#6B6358] tracking-wider">
                DEVELOPING EXPERIENCE
              </span>
            </div>
            
            <div className="mt-8 bg-[#150F20] border border-[#2A2438] rounded-2xl p-8 md:p-10">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: techCenterColor }} />
                    <h3 className="text-lg font-semibold text-[#F5F0E8]">Coming Soon</h3>
                  </div>
                  <p className="text-[#A79C8C] text-sm">
                    Center-specific courses, events, and local announcements are being prepared.
                  </p>
                </div>
                <button 
                  className="px-6 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105 whitespace-nowrap"
                  style={{ 
                    backgroundColor: `${techCenterColor}15`,
                    color: techCenterColor,
                    border: `1px solid ${techCenterColor}30`
                  }}
                >
                  Notify Me
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}