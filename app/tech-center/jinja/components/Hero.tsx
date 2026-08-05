// app/tech-center/jinja/components/Hero.tsx
import React from 'react';

export default function JinjaHero() {
  const techCenterColor = '#10B981'; // Green for Jinja

  return (
    <div className="min-h-screen bg-[#0D1117] text-white">
      {/* Hero Section */}
      <div className="relative min-h-[600px] bg-[#0D1117] overflow-hidden">
        {/* Organic pattern - unique to Jinja */}
        <div className="absolute inset-0 opacity-[0.06]">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full" 
               style={{ background: `radial-gradient(circle, ${techCenterColor}, transparent 70%)` }} />
          <div className="absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full" 
               style={{ background: `radial-gradient(circle, ${techCenterColor}, transparent 70%)` }} />
          <div className="absolute top-2/3 left-1/2 w-48 h-48 rounded-full" 
               style={{ background: `radial-gradient(circle, ${techCenterColor}, transparent 70%)` }} />
        </div>

        {/* Subtle topographic lines - unique to Jinja */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `
            repeating-linear-gradient(0deg, ${techCenterColor} 0px, ${techCenterColor} 1px, transparent 1px, transparent 30px),
            repeating-linear-gradient(90deg, ${techCenterColor} 0px, ${techCenterColor} 1px, transparent 1px, transparent 30px)
          `
        }} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="flex flex-col lg:flex-row items-start gap-16">
            {/* Left side - Main content */}
            <div className="lg:w-2/3 space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: techCenterColor }} />
                  <span className="text-sm tracking-widest uppercase" style={{ color: techCenterColor }}>
                    Jinja, Uganda
                  </span>
                </div>

                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                  Jinja <br />
                  <span style={{ color: techCenterColor }}>Tech Center</span>
                </h1>

                <p className="text-lg text-[#A79C8C] leading-relaxed max-w-xl">
                  Serving the Eastern region with excellence in education. Our Jinja tech center combines 
                  traditional learning values with modern technology to create an optimal learning environment.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <button 
                  className="px-8 py-3.5 rounded-lg font-semibold text-[#0B0912] transition-all duration-300 hover:shadow-2xl hover:scale-105 relative overflow-hidden group"
                  style={{ backgroundColor: techCenterColor }}
                >
                  <span className="relative z-10">Enroll Now</span>
                  <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </button>
                <button 
                  className="px-8 py-3.5 rounded-lg font-semibold transition-all duration-300 hover:scale-105 group relative overflow-hidden"
                  style={{ 
                    border: `2px solid ${techCenterColor}`,
                    color: techCenterColor
                  }}
                >
                  <span className="relative z-10">Virtual Tour</span>
                  <span className="absolute inset-0" style={{ backgroundColor: techCenterColor }} />
                  <span className="absolute inset-0 bg-[#0D1117] -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
                </button>
              </div>

              {/* Unique feature badges - replaces stats */}
              <div className="flex flex-wrap gap-6 pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" 
                       style={{ backgroundColor: `${techCenterColor}20` }}>
                    <span className="text-lg">🌿</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">Nile Valley Campus</div>
                    <div className="text-xs text-[#6B6358]">Lakeside learning environment</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" 
                       style={{ backgroundColor: `${techCenterColor}20` }}>
                    <span className="text-lg">🖥️</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">Tech-Integrated</div>
                    <div className="text-xs text-[#6B6358]">Modern learning tools</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Visual element */}
            <div className="lg:w-1/3 w-full">
              <div className="relative">
                <div className="aspect-square max-w-sm mx-auto relative">
                  {/* Organic shape - represents Jinja's natural setting */}
                  <div 
                    className="absolute inset-0 rounded-[40%_60%_40%_60%_/_60%_40%_60%_40%]"
                    style={{ 
                      background: `linear-gradient(135deg, ${techCenterColor}25, transparent 70%)`,
                      border: `1px solid ${techCenterColor}15`
                    }}
                  />
                  <div 
                    className="absolute inset-8 rounded-[30%_70%_30%_70%_/_70%_30%_70%_30%]"
                    style={{ 
                      background: `linear-gradient(225deg, ${techCenterColor}15, transparent 60%)`,
                      border: `1px solid ${techCenterColor}10`
                    }}
                  />
                  <div className="absolute inset-16 flex items-center justify-center">
                    <div className="text-center space-y-1">
                      <div className="text-6xl font-bold" style={{ color: techCenterColor }}>J</div>
                      <div className="text-xs tracking-[0.2em] uppercase text-[#6B6358]">Tech Hub</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Center Features - Unique to Jinja */}
      <div className="px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="group relative p-8 rounded-2xl bg-[#150F20] border border-[#2A2438] hover:border-[#10B981]/30 transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-0 left-0 w-16 h-[2px]" style={{ backgroundColor: techCenterColor }} />
              <div className="text-3xl mb-4">📚</div>
              <h3 className="text-lg font-semibold text-[#F5F0E8] mb-2">Regional Excellence</h3>
              <p className="text-[#A79C8C] text-sm leading-relaxed">
                Serving as the premier tech education hub for the Eastern region with tailored academic support.
              </p>
            </div>

            <div className="group relative p-8 rounded-2xl bg-[#150F20] border border-[#2A2438] hover:border-[#10B981]/30 transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-0 left-0 w-16 h-[2px]" style={{ backgroundColor: techCenterColor }} />
              <div className="text-3xl mb-4">🏗️</div>
              <h3 className="text-lg font-semibold text-[#F5F0E8] mb-2">Skills Development</h3>
              <p className="text-[#A79C8C] text-sm leading-relaxed">
                Practical training programs designed to bridge the gap between education and industry demands.
              </p>
            </div>

            <div className="group relative p-8 rounded-2xl bg-[#150F20] border border-[#2A2438] hover:border-[#10B981]/30 transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-0 left-0 w-16 h-[2px]" style={{ backgroundColor: techCenterColor }} />
              <div className="text-3xl mb-4">🤝</div>
              <h3 className="text-lg font-semibold text-[#F5F0E8] mb-2">Community Focus</h3>
              <p className="text-[#A79C8C] text-sm leading-relaxed">
                Building a supportive community of learners and educators dedicated to academic excellence.
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
                BUILDING THE FUTURE
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
                    New programs, expanded facilities, and enhanced learning resources coming to Jinja Tech Center.
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
                    Learn More
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