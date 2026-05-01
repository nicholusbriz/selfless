'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import { BackgroundImage } from '@/components/ui';

export default function Page() {
  const router = useRouter();
  const [currentFeature, setCurrentFeature] = useState(0);

  const features = [
    {
      title: "Cleaning Day Registration",
      description: "Register for your assigned cleaning duty and manage your schedule efficiently",
      icon: "",
      action: () => router.push('/login')
    },
    {
      title: "Announcements",
      description: "Stay updated with latest announcements and notifications",
      icon: "",
      action: () => router.push('/login')
    }
  ];


  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);


  return (
    <>
      <BackgroundImage className="min-h-screen relative overflow-hidden">
        {/* Enhanced overlay with sophisticated gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 via-blue-900/30 to-indigo-900/50"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/50"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-15"></div>

        {/* Premium floating elements */}
        <div className="absolute top-20 left-20 w-48 h-48 bg-gradient-to-r from-blue-500/25 to-purple-500/25 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-32 right-32 w-56 h-56 bg-gradient-to-r from-cyan-500/25 to-indigo-500/25 rounded-full blur-3xl animate-float animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/4 w-52 h-52 bg-gradient-to-r from-purple-500/25 to-pink-500/25 rounded-full blur-3xl animate-float animation-delay-1000"></div>
        <div className="absolute bottom-32 right-1/3 w-44 h-44 bg-gradient-to-r from-indigo-500/25 to-blue-500/25 rounded-full blur-3xl animate-float animation-delay-3000"></div>

        <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
          <div className="w-full max-w-7xl">
            {/* Hero Section */}
            <div className="text-center mb-20 animate-fade-in">
              {/* Premium Logo with enhanced effects */}
              <div className="inline-flex items-center justify-center w-40 h-40 bg-gradient-to-br from-slate-800 via-blue-900 to-indigo-900 rounded-full mb-8 shadow-2xl p-4 relative"
                style={{
                  boxShadow: '0 0 80px rgba(59, 130, 246, 0.6), 0 0 160px rgba(99, 102, 241, 0.4), inset 0 0 60px rgba(255, 255, 255, 0.15)'
                }}>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/25 to-purple-500/25 rounded-full animate-pulse-slow"></div>
                <Image
                  src="/freedom.png"
                  alt="Freedom City Tech Center Logo"
                  width={160}
                  height={160}
                  className="w-full h-full object-contain relative z-10"
                  style={{ filter: 'drop-shadow(0 0 40px rgba(255, 255, 255, 0.95))' }}
                />
              </div>

              {/* Premium Typography */}
              <h1 className="font-display text-6xl md:text-8xl bg-gradient-to-r from-slate-100 via-blue-200 to-indigo-200 bg-clip-text text-transparent mb-8 animate-slide-up" style={{
                textShadow: '0 0 80px rgba(255, 255, 255, 0.5), 0 0 160px rgba(59, 130, 246, 0.4)',
                letterSpacing: '-0.02em',
                lineHeight: '0.9',
                fontWeight: 900
              }}>
                FREEDOM CITY TECH CENTER
              </h1>

              <div className="inline-flex items-center justify-center bg-gradient-to-r from-blue-500/25 via-indigo-500/25 to-purple-500/25 backdrop-blur-xl px-12 py-6 rounded-3xl border border-white/30 mb-12 animate-slide-up animation-delay-200"
                style={{
                  boxShadow: '0 0 80px rgba(59, 130, 246, 0.5), inset 0 0 50px rgba(255, 255, 255, 0.2)'
                }}>
                <span className="font-heading text-blue-100 text-2xl tracking-widest uppercase" style={{
                  textShadow: '0 0 40px rgba(59, 130, 246, 1)',
                  fontWeight: 700,
                  letterSpacing: '0.15em'
                }}>
                  Excellence in Technology Education
                </span>
              </div>

              {/* Enhanced Tagline */}
              <p className="font-body text-2xl md:text-3xl text-slate-200 font-light mb-12 max-w-4xl mx-auto animate-slide-up animation-delay-400" style={{
                textShadow: '0 0 40px rgba(255, 255, 255, 0.5)',
                fontWeight: 300,
                lineHeight: '1.4'
              }}>
                Where Innovation Meets Opportunity &bull; Transforming Tomorrow&apos;s Leaders Today
              </p>
            </div>



            {/* Features Showcase */}
            <div className="mb-20">
              <h2 className="font-heading text-4xl font-bold text-white text-center mb-12">Platform Features</h2>
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-12 border border-white/25 max-w-5xl mx-auto">
                <div className="flex flex-col md:flex-row items-center gap-12">
                  <div className="text-8xl animate-float">{features[currentFeature].icon}</div>
                  <div className="flex-1">
                    <h3 className="text-3xl font-bold text-white mb-4">{features[currentFeature].title}</h3>
                    <p className="text-xl text-slate-200 mb-6">{features[currentFeature].description}</p>
                    <button
                      onClick={features[currentFeature].action}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3 px-8 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105"
                    >
                      Learn More
                    </button>
                  </div>
                </div>
                <div className="flex justify-center mt-8 gap-3">
                  {features.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentFeature(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-500 ${index === currentFeature ? 'bg-white w-12' : 'bg-white/40'
                        }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Premium Action Buttons */}
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <button
                onClick={() => router.push('/register')}
                className="group relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold py-8 px-12 rounded-3xl hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-500/50 transition-all duration-500 transform hover:scale-105 overflow-hidden"
                style={{
                  boxShadow: '0 0 60px rgba(59, 130, 246, 0.5), 0 0 120px rgba(99, 102, 241, 0.3)',
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-center text-2xl mb-3">
                    <span className="mr-4 text-3xl">🚀</span>
                    <span className="uppercase tracking-wider">Begin Your Journey</span>
                  </div>
                  <div className="text-blue-100 text-lg">Join Our Tech Community</div>
                </div>
              </button>

              <button
                onClick={() => router.push('/login')}
                className="group relative bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 text-white font-bold py-8 px-12 rounded-3xl hover:from-slate-800 hover:via-slate-900 hover:to-black focus:outline-none focus:ring-4 focus:ring-slate-500/50 transition-all duration-500 transform hover:scale-105 overflow-hidden border border-white/25"
                style={{
                  boxShadow: '0 0 60px rgba(148, 163, 184, 0.4), 0 0 120px rgba(71, 85, 105, 0.3)',
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-center text-2xl mb-3">
                    <span className="mr-4 text-3xl">🔐</span>
                    <span className="uppercase tracking-wider">Access Portal</span>
                  </div>
                  <div className="text-slate-300 text-lg">Continue Your Learning Path</div>
                </div>
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-12 mt-16 text-white/70">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-base uppercase tracking-wider">SELFLESS Organisation</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="text-base uppercase tracking-wider">Tech Education</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-purple-400 rounded-full animate-pulse"></div>
                <span className="text-base uppercase tracking-wider">Professional Development</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-indigo-400 rounded-full animate-pulse"></div>
                <span className="text-base uppercase tracking-wider">Career Support</span>
              </div>
            </div>
          </div>
        </div>
      </BackgroundImage>
      <PWAInstallPrompt />
    </>
  );
}
