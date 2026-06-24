'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, X, ChevronUp } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import AuthDialog from '@/components/auth/AuthDialog';

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

  const handleReports = () => {
    router.push('/dashboard/overview');
  };

  const handleProfile = () => {
    router.push('/dashboard/profile');
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-[#0a0618]">
      {/* Animated BG */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-700/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-pink-600/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

      {/* NAV */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-white/5" style={{ background: 'rgba(10,6,24,0.8)', backdropFilter: 'blur(16px)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3 cursor-pointer" onClick={scrollToTop}>
              <div className="w-9 h-9 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                <span className="text-white font-bold text-sm">F</span>
              </div>
              <span className="text-white font-semibold text-lg tracking-tight">Freedom City Tech Center</span>
            </div>
            <div className="hidden md:flex items-center gap-1">
              <button onClick={handleDashboard} className="px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition">Dashboard</button>
              <button onClick={handleCourses} className="px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition">Courses</button>
              <button onClick={handleProgress} className="px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition">Progress</button>
              <button onClick={handleReports} className="px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition">Reports</button>
              <button onClick={handleProfile} className="px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition">Profile</button>
              <div className="w-px h-6 bg-white/10 mx-2"></div>
              {isAuthenticated ? (
                <>
                  <span className="text-gray-300 text-sm">👋 {user?.firstName}</span>
                  <button onClick={handleDashboard} className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-sm font-medium text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition">Dashboard</button>
                </>
              ) : (
                <>
                  <button onClick={handleSignIn} className="px-4 py-2 text-sm text-gray-300 hover:text-white transition">Student Login</button>
                  <button onClick={handleGetStarted} className="px-5 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-sm font-medium text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition">Student Registration</button>
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
        <div className="fixed inset-0 z-40 md:hidden bg-[#0a0618]/95 backdrop-blur-xl">
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

      {/* HERO */}
      <section className="relative min-h-screen flex items-center pt-20 pb-12 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="slide-up">
            <div className="inline-flex items-center gap-2 bg-purple-500/20 rounded-full px-4 py-1.5 mb-5 border border-purple-500/10">
              <span className="text-purple-300 text-xs font-medium tracking-wider">STUDENT MANAGEMENT SYSTEM</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 leading-tight">
              <span className="text-white">Freedom City Tech Center</span><br />
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Student Learning &amp; Progress Portal</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mb-8 leading-relaxed">
              Manage your learning journey at Freedom City Tech Center. Submit courses, register for participation days with the team, monitor progress, view reports, and achieve your educational goals through one centralized platform.
            </p>
            <div className="flex flex-wrap gap-4">
              {isAuthenticated ? (
                <button onClick={handleDashboard} className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-medium text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition hover:scale-[1.02]">Go to Dashboard</button>
              ) : (
                <>
                  <button onClick={handleSignIn} className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-medium text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition hover:scale-[1.02]">Student Login</button>
                  <button onClick={handleGetStarted} className="px-6 py-3 glass rounded-xl font-medium text-white border border-white/10 hover:bg-white/5 transition">Student Registration</button>
                </>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 slide-up delay-1">
            <div className="glass rounded-xl p-5 hover-lift transition">
              <p className="text-gray-400 text-xs uppercase tracking-wider">My Courses</p>
              <p className="text-2xl font-bold text-white mt-1">12 Active</p>
            </div>
            <div className="glass rounded-xl p-5 hover-lift transition">
              <p className="text-gray-400 text-xs uppercase tracking-wider">Participation Days</p>
              <p className="text-2xl font-bold text-white mt-1">2 Scheduled</p>
            </div>
            <div className="glass rounded-xl p-5 hover-lift transition">
              <p className="text-gray-400 text-xs uppercase tracking-wider">Progress</p>
              <p className="text-2xl font-bold text-white mt-1">78% Complete</p>
            </div>
            <div className="glass rounded-xl p-5 hover-lift transition">
              <p className="text-gray-400 text-xs uppercase tracking-wider">Certificates</p>
              <p className="text-2xl font-bold text-white mt-1">3 Earned</p>
            </div>
          </div>
        </div>
      </section>

      {/* STUDENT LEARNING */}
      <section className="relative py-16 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="slide-up">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">📚 Student Learning</h2>
            <p className="text-gray-400 text-sm mt-1">Submit courses, register for participation days, and monitor academic growth.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5 mt-6">
            <div className="glass rounded-xl p-5 slide-up delay-1 hover-lift transition">
              <div className="flex items-center gap-3"><span className="text-2xl">📖</span><div><p className="text-white font-medium">My Courses</p><p className="text-gray-400 text-xs">Access learning materials</p></div></div>
            </div>
            <div className="glass rounded-xl p-5 slide-up delay-2 hover-lift transition">
              <div className="flex items-center gap-3"><span className="text-2xl">�</span><div><p className="text-white font-medium">Participation Days</p><p className="text-gray-400 text-xs">Register for team sessions</p></div></div>
            </div>
            <div className="glass rounded-xl p-5 slide-up delay-3 hover-lift transition">
              <div className="flex items-center gap-3"><span className="text-2xl">📈</span><div><p className="text-white font-medium">Learning Progress</p><p className="text-gray-400 text-xs">Monitor academic growth</p></div></div>
            </div>
          </div>
        </div>
      </section>

      {/* ACADEMIC ACTIVITIES + REPORTS */}
      <section className="relative py-16 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="slide-up">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">📚 Academic Activities</h2>
              <p className="text-gray-400 text-sm mt-1">Stay informed about upcoming lessons, deadlines, and learning activities.</p>
              <div className="glass rounded-xl p-5 mt-4 hover-lift transition">
                <div className="flex justify-between items-center border-b border-white/5 pb-3"><span className="text-white font-medium">Upcoming Classes</span><span className="text-purple-300 text-sm">Available</span></div>
                <div className="flex justify-between items-center border-b border-white/5 py-3"><span className="text-white font-medium">Participation Days</span><span className="text-purple-300 text-sm">Open</span></div>
                <div className="flex justify-between items-center pt-3"><span className="text-white font-medium">Learning Milestones</span><span className="text-purple-300 text-sm">Active</span></div>
              </div>
            </div>
            <div className="slide-up delay-2">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">📈 Reports</h2>
              <p className="text-gray-400 text-sm mt-1">Track academic performance, learning achievements, and certificate completion.</p>
              <div className="glass rounded-xl p-5 mt-4 hover-lift transition">
                <div className="flex items-center gap-3"><span className="text-2xl">📊</span><div><p className="text-white font-medium">Performance Reports</p><p className="text-gray-400 text-xs">View report</p></div></div>
                <div className="flex items-center gap-3 mt-3"><span className="text-2xl">🏆</span><div><p className="text-white font-medium">Course Progress</p><p className="text-gray-400 text-xs">Track progress</p></div></div>
                <div className="flex items-center gap-3 mt-3"><span className="text-2xl">📜</span><div><p className="text-white font-medium">Certificate Records</p><p className="text-gray-400 text-xs">View details</p></div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-white/5 py-8 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-4">
            <p className="text-white font-semibold text-lg">Freedom City Tech Center</p>
            <p className="text-gray-400 text-sm">Student Management System</p>
            <p className="text-gray-500 text-sm mt-1">Empowering students through technology education.</p>
          </div>
          <div className="border-t border-white/5 pt-4 mt-4">
            <p className="text-gray-400 text-sm">Developed By</p>
            <p className="text-white font-medium">Atbriz</p>
            <p className="text-gray-400 text-sm">Software Developer</p>
            <p className="text-gray-400 text-sm">+256 761 996 296</p>
            <p className="text-gray-400 text-sm">Zana, Kampala, Uganda</p>
            <p className="text-purple-300 text-sm">Student at BYU–Idaho</p>
          </div>
          <div className="border-t border-white/5 pt-4 mt-4">
            <p className="text-gray-500 text-sm">© 2026 Freedom City Tech Center</p>
            <p className="text-gray-500 text-sm">All Rights Reserved.</p>
          </div>
        </div>
      </footer>

      {/* Scroll to top */}
      {showScrollTop && (
        <button onClick={scrollToTop} className="fixed bottom-6 right-6 z-50 w-11 h-11 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-lg shadow-purple-500/20 flex items-center justify-center transition hover:scale-110">
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