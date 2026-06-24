'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, X, ChevronUp } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import AuthDialog from '@/components/auth/AuthDialog';
import RotatingEarth from '@/components/ui/wireframe-dotted-globe';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

function ScrollSection({ children }: { children: React.ReactNode }) {
  const [ref, isVisible] = useScrollAnimation();
  return (
    <div ref={ref} className={`scroll-hidden ${isVisible ? 'scroll-visible' : ''}`}>
      {children}
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const { user, isAuthenticated, fetchUser, isLoading } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const hasFetchedUser = useRef(false);

  // Fetch user data on mount to hydrate auth store after hard refresh
  useEffect(() => {
    if (!user && !isLoading && !hasFetchedUser.current) {
      hasFetchedUser.current = true;
      fetchUser();
    }
  }, [user, isLoading, fetchUser]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSignIn = () => {
    setAuthTab('login');
    setShowAuthDialog(true);
  };

  const handleGetStarted = () => {
    setAuthTab('register');
    setShowAuthDialog(true);
  };

  const handleDashboard = () => {
    router.push('/dashboard/overview');
  };

  const handleCourses = () => {
    router.push('/dashboard/student');
  };

  const handleProgress = () => {
    router.push('/dashboard/overview');
  };

  const handleProfile = () => {
    router.push('/dashboard/profile');
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-[#0a0618]">
      {/* FIXED EARTH BACKGROUND - Stays in place while scrolling */}
      <div className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none">
        <div className="w-full h-full relative">
          <RotatingEarth width={1920} height={1080} className="w-full h-full" />
        </div>
        
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse at center, rgba(10,6,24,0.3) 0%, rgba(10,6,24,0.85) 70%, rgba(10,6,24,0.95) 100%)'
        }} />
      </div>

      {/* Decorative animated blobs - subtle */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-pink-500/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

      {/* NAV - Transparent with blur */}
      <nav className="fixed top-0 w-full z-50" style={{ 
        background: 'rgba(10,6,24,0.7)', 
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)'
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3 cursor-pointer" onClick={scrollToTop}>
              <img src="/freedom.png" alt="Freedom City Tech Center" className="w-10 h-10 rounded-xl object-cover" />
              <span className="text-white font-semibold text-lg tracking-tight">Freedom City Tech Center</span>
            </div>
            <div className="hidden md:flex items-center gap-1">
              <button onClick={handleDashboard} className="px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition">Dashboard</button>
              <button onClick={handleCourses} className="px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition">Courses</button>
              <button onClick={handleProgress} className="px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition">Progress</button>
              <button onClick={handleProfile} className="px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition">Profile</button>
              <div className="w-px h-6 bg-white/10 mx-2"></div>
              {isAuthenticated ? (
                <>
                  <span className="text-gray-300 text-sm">👋 {user?.firstName}</span>
                  <button onClick={handleDashboard} className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-sm font-medium text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition">Dashboard</button>
                </>
              ) : (
                <>
                  <button onClick={handleSignIn} className="px-4 py-2 text-sm text-gray-300 hover:text-white transition">Student Login</button>
                  <button onClick={handleGetStarted} className="px-5 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-sm font-medium text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition">Student Registration</button>
                </>
              )}
            </div>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-white p-2">
              {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden" style={{ background: 'rgba(10,6,24,0.98)', backdropFilter: 'blur(20px)' }}>
          <div className="flex flex-col h-full p-6 pt-20">
            <button onClick={() => setMobileMenuOpen(false)} className="absolute top-4 right-4 text-white p-2">
              <X size={28} />
            </button>
            <div className="flex flex-col gap-4 text-lg">
              <button onClick={() => { handleDashboard(); setMobileMenuOpen(false); }} className="text-white hover:text-purple-400 py-2 border-b border-white/5 text-left">Dashboard</button>
              <button onClick={() => { handleCourses(); setMobileMenuOpen(false); }} className="text-white hover:text-purple-400 py-2 border-b border-white/5 text-left">Courses</button>
              <button onClick={() => { handleProgress(); setMobileMenuOpen(false); }} className="text-white hover:text-purple-400 py-2 border-b border-white/5 text-left">Progress</button>
              <button onClick={() => { handleReports(); setMobileMenuOpen(false); }} className="text-white hover:text-purple-400 py-2 border-b border-white/5 text-left">Reports</button>
              <button onClick={() => { handleProfile(); setMobileMenuOpen(false); }} className="text-white hover:text-purple-400 py-2 border-b border-white/5 text-left">Profile</button>
              <div className="pt-4 flex flex-col gap-3">
                {isAuthenticated ? (
                  <>
                    <span className="text-gray-300 text-sm">👋 {user?.firstName}</span>
                    <button onClick={() => { handleDashboard(); setMobileMenuOpen(false); }} className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold">Dashboard</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => { setAuthTab('login'); setShowAuthDialog(true); setMobileMenuOpen(false); }} className="w-full py-3 border border-white/10 rounded-lg text-white">Student Login</button>
                    <button onClick={() => { setAuthTab('register'); setShowAuthDialog(true); setMobileMenuOpen(false); }} className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold">Student Registration</button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HERO SECTION - Content scrolls over fixed earth */}
      <section className="relative min-h-screen flex items-center pt-20 pb-12 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="slide-up">
              <div className="inline-flex items-center gap-2 bg-purple-500/20 rounded-full px-4 py-1.5 mb-5 border border-purple-500/10 backdrop-blur-sm">
                <span className="text-purple-300 text-xs font-medium tracking-wider">STUDENT TRACKING SYSTEM</span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 leading-tight [text-shadow:_0_2px_30px_rgba(0,0,0,0.8)]">
                <span className="text-white">Track Your Learning Journey</span><br />
                <span className="bg-gradient-to-r from-purple-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">Submit Courses & Register Participation Days</span>
              </h1>
              <p className="text-white text-lg max-w-2xl mb-8 leading-relaxed [text-shadow:_0_2px_20px_rgba(0,0,0,0.9)]">
                Freedom City Tech Center student portal. Submit your courses, register for participation days, and track your academic progress all in one place.
              </p>
              <div className="flex flex-wrap gap-4">
                {isAuthenticated ? (
                  <button onClick={handleDashboard} className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-medium text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition hover:scale-[1.02]">Go to Dashboard</button>
                ) : (
                  <>
                    <button onClick={handleSignIn} className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-medium text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition hover:scale-[1.02]">Student Login</button>
                    <button onClick={handleGetStarted} className="px-6 py-3 rounded-xl font-medium text-white border border-white/20 hover:bg-white/10 transition backdrop-blur-sm" style={{ background: 'rgba(10,6,24,0.3)' }}>Student Registration</button>
                  </>
                )}
              </div>
            </div>

            {/* Stats - Right side */}
            <div className="grid grid-cols-2 gap-4 slide-up delay-1">
              <div className="rounded-xl p-5 hover-lift transition backdrop-blur-md border border-white/10" style={{ background: 'rgba(10,6,24,0.4)' }}>
                <p className="text-white text-xs uppercase tracking-wider">Courses Submitted</p>
              </div>
              <div className="rounded-xl p-5 hover-lift transition backdrop-blur-md border border-white/10" style={{ background: 'rgba(10,6,24,0.4)' }}>
                <p className="text-white text-xs uppercase tracking-wider">Participation Days</p>
              </div>
              <div className="rounded-xl p-5 hover-lift transition backdrop-blur-md border border-white/10" style={{ background: 'rgba(10,6,24,0.4)' }}>
                <p className="text-white text-xs uppercase tracking-wider">Progress</p>
              </div>
              <div className="rounded-xl p-5 hover-lift transition backdrop-blur-md border border-white/10" style={{ background: 'rgba(10,6,24,0.4)' }}>
                <p className="text-white text-xs uppercase tracking-wider">Active Status</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STUDENT TRACKING SECTION */}
      <section className="relative py-20 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollSection>
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 bg-purple-500/20 rounded-full px-4 py-1.5 mb-4 border border-purple-500/10 backdrop-blur-sm">
                <span className="text-purple-300 text-xs font-medium tracking-wider">CORE FEATURES</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 [text-shadow:_0_2px_30px_rgba(0,0,0,0.8)]">Student Tracking Portal</h2>
              <p className="text-white text-base [text-shadow:_0_2px_20px_rgba(0,0,0,0.9)]">Manage your courses and participation days at Freedom City Tech Center.</p>
            </div>
          </ScrollSection>
          <div className="grid md:grid-cols-2 gap-6">
            <ScrollSection>
              <div className="rounded-2xl p-6 hover-lift transition backdrop-blur-md border border-white/10 group cursor-pointer" style={{ background: 'rgba(10,6,24,0.4)' }}>
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-purple-500/20">
                  <span className="text-2xl">�</span>
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">Submit Courses</h3>
                <p className="text-white text-sm">Submit your courses for tracking and academic progress monitoring.</p>
              </div>
            </ScrollSection>
            <ScrollSection>
              <div className="rounded-2xl p-6 hover-lift transition backdrop-blur-md border border-white/10 group cursor-pointer" style={{ background: 'rgba(10,6,24,0.4)' }}>
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-purple-500/20">
                  <span className="text-2xl">📅</span>
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">Participation Days</h3>
                <p className="text-white text-sm">Register for participation days and team activities.</p>
              </div>
            </ScrollSection>
            <ScrollSection>
              <div className="rounded-2xl p-6 hover-lift transition backdrop-blur-md border border-white/10 group cursor-pointer" style={{ background: 'rgba(10,6,24,0.4)' }}>
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-purple-500/20">
                  <span className="text-2xl">�</span>
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">Track Progress</h3>
                <p className="text-white text-sm">Monitor your academic growth and completion status.</p>
              </div>
            </ScrollSection>
            <ScrollSection>
              <div className="rounded-2xl p-6 hover-lift transition backdrop-blur-md border border-white/10 group cursor-pointer" style={{ background: 'rgba(10,6,24,0.4)' }}>
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-purple-500/20">
                  <span className="text-2xl">👤</span>
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">My Profile</h3>
                <p className="text-white text-sm">View and update your student information and details.</p>
              </div>
            </ScrollSection>
          </div>
        </div>
      </section>


      {/* FOOTER */}
      <footer className="relative z-10 border-t border-white/5 py-16 mt-8" style={{ background: 'rgba(10,6,24,0.6)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollSection>
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                  <img src="/freedom.png" alt="Freedom City Tech Center" className="w-10 h-10 rounded-xl object-cover" />
                  <span className="text-white font-semibold text-lg">Freedom City Tech Center</span>
                </div>
                <p className="text-white text-sm mb-2">Student Tracking System</p>
                <p className="text-white text-sm">Empowering students through technology education.</p>
              </div>
              <div className="text-center">
                <h3 className="text-white font-semibold mb-4">Location</h3>
                <p className="text-white text-sm mb-1">Freedom City Tech Center</p>
                <p className="text-white text-sm mb-4">Namasuba, Stella, Kabowa</p>
                <p className="text-white text-sm">Kampala, Uganda</p>
                <div className="mt-4 rounded-xl overflow-hidden border border-white/10 relative">
                  <style>{`
                    .gmnoprint a[href^="https://maps.google.com/maps"] {
                      display: none !important;
                    }
                  `}</style>
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31918.08877867205!2d32.525365583003335!3d0.3068647019174247!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x177dbb06c47502b1%3A0xaf67246fe5cb34bb!2sFreedom%20city!5e0!3m2!1sen!2sug!4v1782328514193!5m2!1sen!2sug&output=embed&z=15"
                    width="100%"
                    height="250"
                    style={{ border: 0, minHeight: '200px' }}
                    loading="lazy"
                    referrerPolicy="strict-origin-when-cross-origin"
                    title="Freedom City Tech Center Location Map"
                  />
                </div>
              </div>
              <div className="text-center md:text-right">
                <h3 className="text-white font-semibold mb-4">Quick Links</h3>
                <div className="space-y-2">
                  <button onClick={handleDashboard} className="block text-white hover:text-purple-300 text-sm transition">Dashboard</button>
                  <button onClick={handleCourses} className="block text-white hover:text-purple-300 text-sm transition">Courses</button>
                  <button onClick={handleProgress} className="block text-white hover:text-purple-300 text-sm transition">Progress</button>
                  <button onClick={handleProfile} className="block text-white hover:text-purple-300 text-sm transition">Profile</button>
                </div>
              </div>
            </div>
            <div className="border-t border-white/5 pt-8 text-center">
              <p className="text-white text-sm">© 2026 Freedom City Tech Center. All Rights Reserved.</p>
            </div>
          </ScrollSection>
        </div>
      </footer>

      {/* Scroll to top */}
      {showScrollTop && (
        <button onClick={scrollToTop} className="fixed bottom-6 right-6 z-50 w-11 h-11 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-lg shadow-purple-500/30 flex items-center justify-center transition hover:scale-110">
          <ChevronUp size={20} className="text-white" />
        </button>
      )}

      {/* Auth Dialog */}
      <AuthDialog 
        isOpen={showAuthDialog} 
        onClose={() => setShowAuthDialog(false)} 
        defaultTab={authTab}
      />
    </div>
  );
}