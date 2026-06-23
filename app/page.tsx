'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, X, ChevronUp } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

export default function HomePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

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
    router.push('/login');
  };

  const handleGetStarted = () => {
    router.push('/register');
  };

  const handleDashboard = () => {
    router.push('/dashboard/overview');
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
              <span className="text-white font-semibold text-lg tracking-tight">Freedom Tech</span>
            </div>
            <div className="hidden md:flex items-center gap-1">
              <button onClick={handleDashboard} className="px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition">Dashboard</button>
              <button onClick={handleDashboard} className="px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition">Students</button>
              <button onClick={handleDashboard} className="px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition">Schedule</button>
              <button onClick={handleDashboard} className="px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition">Reports</button>
              <div className="w-px h-6 bg-white/10 mx-2"></div>
              {isAuthenticated ? (
                <>
                  <span className="text-gray-300 text-sm">👋 {user?.firstName}</span>
                  <button onClick={handleDashboard} className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-sm font-medium text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition">Dashboard</button>
                </>
              ) : (
                <>
                  <button onClick={handleSignIn} className="px-4 py-2 text-sm text-gray-300 hover:text-white transition">Sign In</button>
                  <button onClick={handleGetStarted} className="px-5 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-sm font-medium text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition">Get Started</button>
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
              <button onClick={() => { handleDashboard(); setMobileMenuOpen(false); }} className="text-white hover:text-purple-400 py-2 border-b border-white/5 text-left">Students</button>
              <button onClick={() => { handleDashboard(); setMobileMenuOpen(false); }} className="text-white hover:text-purple-400 py-2 border-b border-white/5 text-left">Schedule</button>
              <button onClick={() => { handleDashboard(); setMobileMenuOpen(false); }} className="text-white hover:text-purple-400 py-2 border-b border-white/5 text-left">Reports</button>
              <div className="pt-4 flex flex-col gap-3">
                {isAuthenticated ? (
                  <>
                    <span className="text-gray-300 text-sm">👋 {user?.firstName}</span>
                    <button onClick={() => { handleDashboard(); setMobileMenuOpen(false); }} className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold">Dashboard</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => { handleSignIn(); setMobileMenuOpen(false); }} className="w-full py-3 border border-white/10 rounded-lg text-white">Sign In</button>
                    <button onClick={() => { handleGetStarted(); setMobileMenuOpen(false); }} className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold">Get Started</button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HERO (Dashboard) */}
      <section id="dashboard" className="relative min-h-screen flex items-center pt-20 pb-12 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="slide-up">
            <div className="inline-flex items-center gap-2 bg-purple-500/20 rounded-full px-4 py-1.5 mb-5 border border-purple-500/10">
              <span className="text-purple-300 text-xs font-medium tracking-wider">MANAGEMENT SYSTEM</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 leading-tight">
              <span className="text-white">Freedom City</span><br />
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Tech Center</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mb-8 leading-relaxed">
              Student management system for cleaning day registration, course submission, and credit tracking.
            </p>
            <div className="flex flex-wrap gap-4">
              {isAuthenticated ? (
                <button onClick={handleDashboard} className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-medium text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition hover:scale-[1.02]">Go to Dashboard</button>
              ) : (
                <>
                  <button onClick={handleSignIn} className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-medium text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition hover:scale-[1.02]">Sign In</button>
                  <button onClick={handleGetStarted} className="px-6 py-3 glass rounded-xl font-medium text-white border border-white/10 hover:bg-white/5 transition">Get Started</button>
                </>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 slide-up delay-1">
            <div className="glass rounded-xl p-5 hover-lift transition">
              <p className="text-gray-400 text-xs uppercase tracking-wider">Active Students</p>
              <p className="text-2xl font-bold text-white mt-1">Enrolled</p>
            </div>
            <div className="glass rounded-xl p-5 hover-lift transition">
              <p className="text-gray-400 text-xs uppercase tracking-wider">Courses</p>
              <p className="text-2xl font-bold text-white mt-1">Submitted</p>
            </div>
            <div className="glass rounded-xl p-5 hover-lift transition">
              <p className="text-gray-400 text-xs uppercase tracking-wider">Credits</p>
              <p className="text-2xl font-bold text-white mt-1">Tracking</p>
            </div>
            <div className="glass rounded-xl p-5 hover-lift transition">
              <p className="text-gray-400 text-xs uppercase tracking-wider">Status</p>
              <p className="text-2xl font-bold text-white mt-1">Active</p>
            </div>
          </div>
        </div>
      </section>

      {/* STUDENTS */}
      <section id="students" className="relative py-16 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="slide-up">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">👥 Student Management</h2>
            <p className="text-gray-400 text-sm mt-1">Enroll, track, and support student progress.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5 mt-6">
            <div className="glass rounded-xl p-5 slide-up delay-1 hover-lift transition">
              <div className="flex items-center gap-3"><span className="text-2xl">📋</span><div><p className="text-white font-medium">New Enrollment</p><p className="text-gray-400 text-xs">Register students</p></div></div>
            </div>
            <div className="glass rounded-xl p-5 slide-up delay-2 hover-lift transition">
              <div className="flex items-center gap-3"><span className="text-2xl">📊</span><div><p className="text-white font-medium">Active Students</p><p className="text-gray-400 text-xs">View enrolled</p></div></div>
            </div>
            <div className="glass rounded-xl p-5 slide-up delay-3 hover-lift transition">
              <div className="flex items-center gap-3"><span className="text-2xl">🎯</span><div><p className="text-white font-medium">Graduation Track</p><p className="text-gray-400 text-xs">Monitor progress</p></div></div>
            </div>
          </div>
        </div>
      </section>

      {/* SCHEDULE + REPORTS */}
      <section id="schedule" className="relative py-16 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="slide-up">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">📅 Schedule</h2>
              <p className="text-gray-400 text-sm mt-1">Manage cleaning days and student schedules.</p>
              <div className="glass rounded-xl p-5 mt-4 hover-lift transition">
                <div className="flex justify-between items-center border-b border-white/5 pb-3"><span className="text-white font-medium">Cleaning Day Registration</span><span className="text-purple-300 text-sm">Available</span></div>
                <div className="flex justify-between items-center border-b border-white/5 py-3"><span className="text-white font-medium">Course Submission</span><span className="text-purple-300 text-sm">Open</span></div>
                <div className="flex justify-between items-center pt-3"><span className="text-white font-medium">Credit Tracking</span><span className="text-purple-300 text-sm">Active</span></div>
              </div>
            </div>
            <div id="reports" className="slide-up delay-2">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">📈 Reports</h2>
              <p className="text-gray-400 text-sm mt-1">Student progress and performance insights.</p>
              <div className="glass rounded-xl p-5 mt-4 hover-lift transition">
                <div className="flex items-center gap-3"><span className="text-2xl">📊</span><div><p className="text-white font-medium">Attendance Report</p><p className="text-gray-400 text-xs">View report</p></div></div>
                <div className="flex items-center gap-3 mt-3"><span className="text-2xl">🏆</span><div><p className="text-white font-medium">Credit Progress</p><p className="text-gray-400 text-xs">Track credits</p></div></div>
                <div className="flex items-center gap-3 mt-3"><span className="text-2xl">📋</span><div><p className="text-white font-medium">Student Status</p><p className="text-gray-400 text-xs">View details</p></div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-white/5 py-8 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-500 text-sm">© 2025 Freedom City Tech Center · Management System</p>
        </div>
      </footer>

      {/* Scroll to top */}
      {showScrollTop && (
        <button onClick={scrollToTop} className="fixed bottom-6 right-6 z-50 w-11 h-11 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-lg shadow-purple-500/20 flex items-center justify-center transition hover:scale-110">
          <ChevronUp size={20} className="text-white" />
        </button>
      )}
    </div>
  );
}