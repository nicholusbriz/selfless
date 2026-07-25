'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Menu, X, ChevronUp, Sparkles, LogIn, UserPlus, Home,
  GraduationCap, MessageSquare, Heart, MapPin, Phone, Mail,
  User, ChevronDown
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import AuthDialog from '@/components/auth/AuthDialog';

// Custom hook for scroll animation
function useScrollAnimation() {
  const [ref, setRef] = useState<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(ref);
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    observer.observe(ref);
    return () => observer.disconnect();
  }, [ref]);

  return { ref: setRef, isVisible };
}

export default function RedesignedHomePage() {
  const router = useRouter();
  const { user, isAuthenticated, fetchUser, isLoading } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [activeSection, setActiveSection] = useState('hero');
  const [isScrolled, setIsScrolled] = useState(false);
  const hasFetchedUser = useRef(false);
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  // Fetch user data on mount
  useEffect(() => {
    if (!user && !isLoading && !hasFetchedUser.current) {
      hasFetchedUser.current = true;
      fetchUser().catch(() => {
        console.log('User not authenticated');
      });
    }
  }, [user, isLoading, fetchUser]);

  // Scroll handlers
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
      setIsScrolled(window.scrollY > 50);
      
      // Track active section
      const sections = ['hero', 'features', 'ecosystem', 'testimonials'];
      let current = 'hero';
      sections.forEach(id => {
        const el = sectionRefs.current[id];
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 100) {
            current = id;
          }
        }
      });
      setActiveSection(current);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (sectionId: string) => {
    const el = sectionRefs.current[sectionId];
    if (el) {
      const offset = 80;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
      setActiveSection(sectionId);
    }
    setMobileMenuOpen(false);
  };

  const handleSignIn = () => {
    setAuthTab('login');
    setShowAuthDialog(true);
  };

  const handleRegister = () => {
    setAuthTab('register');
    setShowAuthDialog(true);
  };

  const handleDashboard = () => {
    router.push('/dashboard/overview');
  };

  // Navigation items
  const navItems = [
    { id: 'hero', label: 'Home', icon: Home },
    { id: 'features', label: 'Features', icon: Sparkles },
    { id: 'ecosystem', label: 'Ecosystem', icon: GraduationCap },
    { id: 'testimonials', label: 'Community', icon: MessageSquare },
  ];

  // Scroll animation hooks for each section
  const heroAnim = useScrollAnimation();
  const featuresAnim = useScrollAnimation();
  const storytellingAnim = useScrollAnimation();
  const ecosystemAnim = useScrollAnimation();
  const countersAnim = useScrollAnimation();
  const testimonialsAnim = useScrollAnimation();
  const contactAnim = useScrollAnimation();

  return (
    <div className="min-h-screen bg-[#0A0E17] text-[#FFFFFF] overflow-x-hidden font-['Inter',sans-serif]">
      
      {/* ========== HEADER ========== */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-[#0A0E17]/95 backdrop-blur-xl shadow-2xl border-b border-[#1E293B]' 
          : 'bg-transparent border-b border-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo & Brand */}
            <div className="flex items-center gap-2 sm:gap-3 group cursor-pointer flex-shrink-0" onClick={() => scrollToSection('hero')}>
              <div className="relative">
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-[#2D9CDB] to-[#1A7BBF] p-[2px] shadow-lg shadow-[#2D9CDB]/20 group-hover:shadow-[#2D9CDB]/40 transition-all duration-300">
                  <div className="w-full h-full rounded-xl bg-[#0A0E17] flex items-center justify-center">
                    <img src="/freedom.png" alt="FCTC" className="w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-lg object-cover" />
                  </div>
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 sm:w-3 sm:h-3 bg-[#2D9CDB] rounded-full animate-pulse border-2 border-[#0A0E17]" />
              </div>
              <div className="flex flex-col min-w-0">
                <h1 className="text-[#F0F6FC] font-bold text-sm sm:text-base md:text-lg tracking-tight leading-tight truncate">
                  Freedom City Tech
                </h1>
                <div className="flex items-center gap-1 sm:gap-2">
                  <span className="text-[#2D9CDB] text-[8px] sm:text-[10px] md:text-xs font-medium tracking-wider uppercase">Selfless CE</span>
                  <span className="w-0.5 h-0.5 sm:w-1 sm:h-1 bg-[#1E293B] rounded-full"></span>
                  <span className="text-[#64748B] text-[8px] sm:text-[10px] md:text-xs truncate">BYU University</span>
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1 bg-[#131B2E]/50 backdrop-blur-sm rounded-full px-2 py-1 border border-[#1E293B]">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`px-3 xl:px-4 py-1.5 xl:py-2 text-xs xl:text-sm font-medium rounded-full transition-all duration-300 flex items-center gap-1.5 xl:gap-2 ${
                    activeSection === item.id 
                      ? 'text-[#FFFFFF] bg-gradient-to-r from-[#2D9CDB] to-[#1A7BBF] shadow-lg shadow-[#2D9CDB]/25' 
                      : 'text-[#94A3B8] hover:text-[#FFFFFF] hover:bg-[#1E293B]/50'
                  }`}
                >
                  <item.icon className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
                  {item.label}
                </button>
              ))}
            </div>

            {/* Auth Actions */}
            <div className="flex items-center gap-1 sm:gap-2 md:gap-3 flex-shrink-0">
              {isAuthenticated ? (
                <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
                  <div className="hidden sm:flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 bg-[#131B2E] rounded-full border border-[#1E293B]">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 bg-gradient-to-br from-[#2D9CDB] to-[#1A7BBF] rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold text-[#FFFFFF] shadow-lg shadow-[#2D9CDB]/20">
                      {user?.firstName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="text-[#F0F6FC] text-xs sm:text-sm font-medium hidden md:inline">{user?.firstName || 'User'}</span>
                  </div>
                  <button 
                    onClick={handleDashboard}
                    className="bg-gradient-to-r from-[#238636] to-[#2EA043] hover:from-[#2EA043] hover:to-[#238636] text-[#FFFFFF] text-[10px] sm:text-xs md:text-sm px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-full font-medium transition-all duration-300 shadow-lg shadow-[#238636]/20 hover:shadow-[#238636]/40 hover:scale-105 whitespace-nowrap"
                  >
                    Dashboard
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2">
                  <button 
                    onClick={handleSignIn}
                    className="text-[#94A3B8] hover:text-[#FFFFFF] text-[10px] sm:text-xs md:text-sm px-2 sm:px-3 py-1.5 sm:py-2 rounded-full transition-all duration-300 hover:bg-[#1E293B]/50 whitespace-nowrap"
                  >
                    Login
                  </button>
                  <button 
                    onClick={handleRegister}
                    className="bg-gradient-to-r from-[#2D9CDB] to-[#1A7BBF] hover:from-[#1A7BBF] hover:to-[#2D9CDB] text-[#FFFFFF] text-[10px] sm:text-xs md:text-sm px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-full font-medium transition-all duration-300 shadow-lg shadow-[#2D9CDB]/20 hover:shadow-[#2D9CDB]/40 hover:scale-105 whitespace-nowrap"
                  >
                    Get Started
                  </button>
                </div>
              )}
              {/* Mobile Menu Toggle */}
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
                className="lg:hidden text-[#94A3B8] hover:text-[#FFFFFF] p-1.5 sm:p-2 rounded-full hover:bg-[#1E293B]/50 transition-all duration-300"
              >
                {mobileMenuOpen ? <X size={18} className="sm:w-5 sm:h-5 md:w-6 md:h-6" /> : <Menu size={18} className="sm:w-5 sm:h-5 md:w-6 md:h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-3 sm:py-4 border-t border-[#1E293B] space-y-1 animate-in slide-in-from-top-2 duration-300">
              <div className="bg-[#131B2E]/50 backdrop-blur-sm rounded-2xl p-2 border border-[#1E293B]">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`w-full flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium rounded-xl transition-all duration-300 ${
                      activeSection === item.id 
                        ? 'text-[#FFFFFF] bg-gradient-to-r from-[#2D9CDB] to-[#1A7BBF]' 
                        : 'text-[#94A3B8] hover:text-[#FFFFFF] hover:bg-[#1E293B]/50'
                    }`}
                  >
                    <item.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    {item.label}
                  </button>
                ))}
                {isAuthenticated && (
                  <div className="border-t border-[#1E293B] pt-2 mt-2">
                    <button 
                      onClick={handleDashboard}
                      className="w-full flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-[#94A3B8] hover:text-[#FFFFFF] hover:bg-[#1E293B]/50 rounded-xl transition-all duration-300"
                    >
                      <User className="w-4 h-4 sm:w-5 sm:h-5" />
                      Dashboard
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* ========== HERO ========== */}
      <section 
        id="hero" 
        ref={(el) => { 
          sectionRefs.current.hero = el; 
          heroAnim.ref(el);
        }}
        className={`relative min-h-screen flex items-center pt-20 pb-10 overflow-hidden bg-[#0A0E17] transition-all duration-1000 ${
          heroAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        {/* Background network dots */}
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill="#2D9CDB" opacity="0.3"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)"/>
          </svg>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#2D9CDB]/5 to-transparent blur-3xl"></div>
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#2D9CDB]/10 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#1A7BBF]/10 rounded-full blur-[120px]"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full relative z-10 grid lg:grid-cols-2 gap-10 items-center">
          {/* Left content */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-[#2D9CDB]/10 rounded-full px-4 py-1.5 border border-[#2D9CDB]/10">
              <span className="w-2 h-2 bg-[#2D9CDB] rounded-full animate-pulse"></span>
              <span className="text-[#6BB8E8] text-[10px] font-medium tracking-widest uppercase">Live · 156 students active</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.1]">
              <span className="text-white/90">Build.</span><br />
              <span className="text-white/90">Learn.</span><br />
              <span className="text-white/90">Collaborate.</span><br />
              <span className="bg-gradient-to-r from-[#2D9CDB] via-[#6BB8E8] to-[#1A7BBF] bg-clip-text text-transparent">Graduate.</span>
            </h1>
            <p className="text-[#94A3B8] text-base md:text-lg max-w-lg leading-relaxed">
              One intelligent platform for the entire Freedom City community. Real-time attendance, mentorship, projects & more.
            </p>
            <div className="flex flex-wrap gap-3">
              {isAuthenticated ? (
                <button 
                  onClick={handleDashboard}
                  className="group bg-gradient-to-r from-[#238636] to-[#2EA043] hover:from-[#2EA043] hover:to-[#238636] text-[#FFFFFF] px-6 sm:px-8 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 shadow-lg shadow-[#238636]/20 hover:shadow-[#238636]/40 hover:scale-105 flex items-center gap-2"
                >
                  <span>Go to Dashboard</span>
                  <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:rotate-180 transition-transform duration-300" />
                </button>
              ) : (
                <>
                  <button 
                    onClick={handleSignIn}
                    className="bg-gradient-to-r from-[#2D9CDB] to-[#1A7BBF] hover:from-[#1A7BBF] hover:to-[#2D9CDB] text-[#FFFFFF] px-6 sm:px-8 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 shadow-lg shadow-[#2D9CDB]/20 hover:shadow-[#2D9CDB]/40 hover:scale-105"
                  >
                    Student Login
                  </button>
                  <button 
                    onClick={handleRegister}
                    className="border-2 border-[#1E293B] hover:border-[#2D9CDB] bg-transparent hover:bg-[#1E293B]/50 text-[#F0F6FC] px-6 sm:px-8 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 hover:scale-105"
                  >
                    Register
                  </button>
                </>
              )}
            </div>
            <div className="flex flex-wrap gap-6 text-xs text-[#64748B]">
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-[#2D9CDB] rounded-full"></span> 24+ Courses</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-[#238636] rounded-full"></span> 156 Students</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-[#F59E0B] rounded-full"></span> 94% Success</span>
            </div>
          </div>
          
          {/* Right: 3D Globe + floating notifications */}
          <div className="relative flex items-center justify-center">
            <div className="relative w-[280px] h-[280px] sm:w-[380px] sm:h-[380px] md:w-[450px] md:h-[450px] animate-float">
              <svg viewBox="0 0 400 400" className="w-full h-full drop-shadow-2xl">
                <circle cx="200" cy="200" r="150" fill="none" stroke="#2D9CDB" strokeWidth="0.8" strokeDasharray="3 8" opacity="0.5"/>
                <circle cx="200" cy="200" r="120" fill="none" stroke="#2D9CDB" strokeWidth="0.8" strokeDasharray="2 6" opacity="0.4"/>
                <circle cx="200" cy="200" r="90" fill="none" stroke="#2D9CDB" strokeWidth="0.8" strokeDasharray="1 4" opacity="0.3"/>
                <ellipse cx="200" cy="200" rx="150" ry="40" fill="none" stroke="#2D9CDB" strokeWidth="0.6" strokeDasharray="4 8" opacity="0.2" transform="rotate(-20 200 200)"/>
                <ellipse cx="200" cy="200" rx="150" ry="40" fill="none" stroke="#2D9CDB" strokeWidth="0.6" strokeDasharray="4 8" opacity="0.2" transform="rotate(40 200 200)"/>
                <circle cx="200" cy="200" r="10" fill="#2D9CDB" opacity="0.3"/>
                <circle cx="260" cy="140" r="4" fill="#6BB8E8" className="animate-bounce" />
                <circle cx="130" cy="260" r="4" fill="#6BB8E8" className="animate-bounce [animation-delay:1.5s]" />
                <circle cx="290" cy="220" r="3" fill="#F59E0B" className="animate-pulse" />
                <circle cx="110" cy="120" r="3" fill="#238636" className="animate-pulse [animation-delay:2s]" />
              </svg>
            </div>
            {/* Floating notifications */}
            <div className="absolute top-4 -right-6 sm:top-10 sm:right-0 bg-[#131B2E]/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-[10px] sm:text-xs text-white/80 border border-[#2D9CDB]/20 shadow-xl animate-pulse">
              📌 Student joined · 2 min ago
            </div>
            <div className="absolute bottom-12 -left-6 sm:bottom-16 sm:left-0 bg-[#131B2E]/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-[10px] sm:text-xs text-white/80 border border-[#238636]/20 shadow-xl">
              ✅ Assignment submitted
            </div>
            <div className="absolute top-1/2 -translate-y-1/2 -left-10 sm:left-0 bg-[#131B2E]/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-[10px] sm:text-xs text-white/80 border border-[#F59E0B]/20 shadow-xl">
              📊 Attendance 98%
            </div>
            <div className="absolute bottom-20 right-0 bg-[#131B2E]/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-[10px] sm:text-xs text-white/80 border border-[#2D9CDB]/20 shadow-xl">
              🤖 AI Assistant active
            </div>
          </div>
        </div>
      </section>

      {/* ========== SECTION CONNECTION LINE ========== */}
      <div className="relative z-20 flex justify-center">
        <div className="w-px h-12 bg-gradient-to-b from-[#2D9CDB]/20 to-transparent"></div>
      </div>

      {/* ========== FEATURES ========== */}
      <section 
        id="features"
        ref={(el) => { 
          sectionRefs.current.features = el; 
          featuresAnim.ref(el);
        }}
        className={`relative z-20 bg-[#0A0E17]/95 backdrop-blur-sm border-t border-[#1E293B] py-20 transition-all duration-1000 delay-200 ${
          featuresAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <span className="text-[#2D9CDB] text-xs font-semibold tracking-widest uppercase">✦ ecosystem features</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white">Everything connected.</h2>
              <p className="text-[#94A3B8]">Live attendance · course tracking · AI mentorship · community feed · all in one.</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#131B2E]/60 backdrop-blur-sm p-4 rounded-xl border border-[#2D9CDB]/10 hover:border-[#2D9CDB]/30 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#2D9CDB]/10">
                  <span className="text-2xl">📚</span>
                  <p className="text-sm font-medium mt-1">Course Mgmt</p>
                  <p className="text-[10px] text-[#94A3B8]">97% completion</p>
                </div>
                <div className="bg-[#131B2E]/60 backdrop-blur-sm p-4 rounded-xl border border-[#2D9CDB]/10 hover:border-[#2D9CDB]/30 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#2D9CDB]/10">
                  <span className="text-2xl">📅</span>
                  <p className="text-sm font-medium mt-1">Attendance</p>
                  <p className="text-[10px] text-[#94A3B8]">98% this month</p>
                </div>
              </div>
            </div>
            <div className="relative flex justify-center">
              <div className="w-64 h-64 bg-[#131B2E]/60 backdrop-blur-sm rounded-3xl border border-[#2D9CDB]/20 p-4 flex items-center justify-center hover:border-[#2D9CDB]/40 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-[#2D9CDB]/10">
                <div className="text-center">
                  <span className="text-6xl block">📊</span>
                  <p className="text-white/70 text-sm mt-2">Live dashboard</p>
                  <div className="flex gap-2 mt-2 text-xs text-[#94A3B8]">
                    <span>● 24 courses</span>
                    <span>● 156 students</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== SECTION CONNECTION LINE ========== */}
      <div className="relative z-30 flex justify-center">
        <div className="w-px h-12 bg-gradient-to-b from-[#2D9CDB]/20 to-[#2D9CDB]/10"></div>
      </div>

      {/* ========== STICKY STORYTELLING ========== */}
      <section 
        ref={(el) => { storytellingAnim.ref(el); }}
        className={`relative z-30 bg-[#0D1524]/90 backdrop-blur-sm border-t border-[#1E293B] py-20 transition-all duration-1000 delay-300 ${
          storytellingAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full flex flex-col md:flex-row items-center gap-10">
          <div className="md:w-1/2 space-y-6">
            <span className="text-[#2D9CDB] text-xs font-semibold tracking-widest uppercase">✦ journey</span>
            <div className="space-y-4 text-2xl sm:text-3xl font-bold text-white">
              <p className="border-l-4 border-[#2D9CDB] pl-4 transition-all duration-300 hover:pl-6 hover:border-l-8">Track Attendance</p>
              <p className="border-l-4 border-[#F59E0B] pl-4 transition-all duration-300 hover:pl-6 hover:border-l-8">Manage Tuition</p>
              <p className="border-l-4 border-[#238636] pl-4 transition-all duration-300 hover:pl-6 hover:border-l-8">Join Communities</p>
              <p className="border-l-4 border-[#6BB8E8] pl-4 transition-all duration-300 hover:pl-6 hover:border-l-8">Monitor Performance</p>
              <p className="border-l-4 border-[#2D9CDB] pl-4 transition-all duration-300 hover:pl-6 hover:border-l-8">Graduate 🎓</p>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <div className="relative w-48 h-80 sm:w-56 sm:h-96 bg-[#131B2E] rounded-3xl border border-[#1E293B] shadow-2xl shadow-[#2D9CDB]/10 p-3 flex items-center justify-center hover:shadow-[#2D9CDB]/30 transition-all duration-500 hover:scale-105">
              <div className="w-full h-full bg-[#0A0E17] rounded-2xl flex flex-col items-center justify-center gap-2 text-white/70 text-xs">
                <span className="text-3xl">📱</span>
                <span className="font-semibold text-white">Dashboard</span>
                <div className="w-3/4 h-1 bg-[#2D9CDB]/30 rounded-full"></div>
                <div className="w-3/4 h-1 bg-[#2D9CDB]/20 rounded-full"></div>
                <div className="w-1/2 h-1 bg-[#F59E0B]/30 rounded-full"></div>
                <span className="text-[10px] text-[#94A3B8]">Attendance 98%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== SECTION CONNECTION LINE ========== */}
      <div className="relative z-40 flex justify-center">
        <div className="w-px h-12 bg-gradient-to-b from-[#2D9CDB]/20 to-[#2D9CDB]/5"></div>
      </div>

      {/* ========== ECOSYSTEM ========== */}
      <section 
        id="ecosystem"
        ref={(el) => { 
          sectionRefs.current.ecosystem = el; 
          ecosystemAnim.ref(el);
        }}
        className={`relative z-40 bg-[#0A0E17]/95 backdrop-blur-sm border-t border-[#1E293B] py-20 transition-all duration-1000 delay-400 ${
          ecosystemAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <span className="text-[#2D9CDB] text-xs font-semibold tracking-widest uppercase">✦ live ecosystem</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white">Connected community</h2>
              <p className="text-[#94A3B8]">Mentors, students, tutors, projects — all linked in real time.</p>
              <div className="flex flex-wrap gap-3 text-sm">
                <span className="bg-[#131B2E]/60 backdrop-blur-sm px-3 py-1 rounded-full border border-[#2D9CDB]/20 hover:border-[#2D9CDB]/50 transition-all duration-300 hover:scale-105">👨‍🏫 12 Mentors</span>
                <span className="bg-[#131B2E]/60 backdrop-blur-sm px-3 py-1 rounded-full border border-[#F59E0B]/20 hover:border-[#F59E0B]/50 transition-all duration-300 hover:scale-105">👥 156 Students</span>
                <span className="bg-[#131B2E]/60 backdrop-blur-sm px-3 py-1 rounded-full border border-[#238636]/20 hover:border-[#238636]/50 transition-all duration-300 hover:scale-105">📁 48 Projects</span>
              </div>
            </div>
            <div className="relative flex justify-center h-64">
              <svg viewBox="0 0 300 200" className="w-full max-w-xs">
                <circle cx="80" cy="100" r="24" fill="none" stroke="#2D9CDB" strokeWidth="2" strokeDasharray="4 4" className="animate-pulse">
                  <animate attributeName="r" values="20;26;20" dur="3s" repeatCount="indefinite" />
                </circle>
                <circle cx="200" cy="60" r="20" fill="none" stroke="#6BB8E8" strokeWidth="2" strokeDasharray="4 4" className="animate-pulse">
                  <animate attributeName="r" values="16;22;16" dur="3.5s" repeatCount="indefinite" />
                </circle>
                <circle cx="220" cy="140" r="18" fill="none" stroke="#F59E0B" strokeWidth="2" strokeDasharray="4 4" className="animate-pulse">
                  <animate attributeName="r" values="14;20;14" dur="4s" repeatCount="indefinite" />
                </circle>
                <circle cx="140" cy="160" r="22" fill="none" stroke="#238636" strokeWidth="2" strokeDasharray="4 4" className="animate-pulse">
                  <animate attributeName="r" values="18;24;18" dur="3.8s" repeatCount="indefinite" />
                </circle>
                <line x1="80" y1="100" x2="200" y2="60" stroke="#2D9CDB" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6">
                  <animate attributeName="stroke-dashoffset" from="0" to="100" dur="3s" repeatCount="indefinite" />
                </line>
                <line x1="80" y1="100" x2="220" y2="140" stroke="#2D9CDB" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6">
                  <animate attributeName="stroke-dashoffset" from="0" to="100" dur="4s" repeatCount="indefinite" />
                </line>
                <line x1="200" y1="60" x2="140" y2="160" stroke="#6BB8E8" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6">
                  <animate attributeName="stroke-dashoffset" from="0" to="100" dur="3.5s" repeatCount="indefinite" />
                </line>
                <text x="70" y="105" fontSize="8" fill="#94A3B8">Student</text>
                <text x="190" y="65" fontSize="8" fill="#94A3B8">Mentor</text>
                <text x="210" y="145" fontSize="8" fill="#94A3B8">Tutor</text>
                <text x="130" y="165" fontSize="8" fill="#94A3B8">Projects</text>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* ========== SECTION CONNECTION LINE ========== */}
      <div className="relative z-50 flex justify-center">
        <div className="w-px h-12 bg-gradient-to-b from-[#2D9CDB]/20 to-[#2D9CDB]/5"></div>
      </div>

      {/* ========== ANIMATED COUNTERS ========== */}
      <section 
        ref={(el) => { countersAnim.ref(el); }}
        className={`relative z-50 py-20 bg-[#0A0E17] border-t border-[#1E293B] transition-all duration-1000 delay-500 ${
          countersAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="text-[#2D9CDB] text-xs font-semibold tracking-widest uppercase">✦ impact</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mt-2">Numbers that move</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            <div className="bg-[#131B2E]/60 backdrop-blur-sm p-6 rounded-2xl border border-[#2D9CDB]/10 text-center hover:border-[#2D9CDB]/40 transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-[#2D9CDB]/10">
              <span className="text-4xl font-bold text-[#2D9CDB]">24</span>
              <p className="text-[#94A3B8] text-sm">Courses</p>
            </div>
            <div className="bg-[#131B2E]/60 backdrop-blur-sm p-6 rounded-2xl border border-[#2D9CDB]/10 text-center hover:border-[#2D9CDB]/40 transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-[#2D9CDB]/10">
              <span className="text-4xl font-bold text-[#6BB8E8]">156</span>
              <p className="text-[#94A3B8] text-sm">Students</p>
            </div>
            <div className="bg-[#131B2E]/60 backdrop-blur-sm p-6 rounded-2xl border border-[#2D9CDB]/10 text-center hover:border-[#2D9CDB]/40 transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-[#2D9CDB]/10">
              <span className="text-4xl font-bold text-[#F59E0B]">12</span>
              <p className="text-[#94A3B8] text-sm">Tutors</p>
            </div>
            <div className="bg-[#131B2E]/60 backdrop-blur-sm p-6 rounded-2xl border border-[#2D9CDB]/10 text-center hover:border-[#2D9CDB]/40 transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-[#2D9CDB]/10">
              <span className="text-4xl font-bold text-[#238636]">48</span>
              <p className="text-[#94A3B8] text-sm">Projects</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========== SECTION CONNECTION LINE ========== */}
      <div className="relative z-50 flex justify-center">
        <div className="w-px h-12 bg-gradient-to-b from-[#2D9CDB]/20 to-[#2D9CDB]/5"></div>
      </div>

      {/* ========== TESTIMONIALS ========== */}
      <section 
        id="testimonials"
        ref={(el) => { 
          sectionRefs.current.testimonials = el; 
          testimonialsAnim.ref(el);
        }}
        className={`relative z-50 py-20 bg-[#0D1524] border-t border-[#1E293B] transition-all duration-1000 delay-600 ${
          testimonialsAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="text-[#2D9CDB] text-xs font-semibold tracking-widest uppercase">✦ voices</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mt-2">What students say</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-[#131B2E]/60 backdrop-blur-sm p-6 rounded-2xl border border-[#2D9CDB]/10 hover:border-[#2D9CDB]/40 transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-[#2D9CDB]/10">
              <p className="text-[#94A3B8] text-sm">“Freedom City gave me mentorship and a community. I grew from student to mentor.”</p>
              <p className="text-white font-semibold mt-3">— Aisha, CS</p>
            </div>
            <div className="bg-[#131B2E]/60 backdrop-blur-sm p-6 rounded-2xl border border-[#2D9CDB]/10 hover:border-[#2D9CDB]/40 transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-[#2D9CDB]/10">
              <p className="text-[#94A3B8] text-sm">“The live dashboard and attendance tracking helped me stay on top of everything.”</p>
              <p className="text-white font-semibold mt-3">— James, Engineering</p>
            </div>
            <div className="bg-[#131B2E]/60 backdrop-blur-sm p-6 rounded-2xl border border-[#2D9CDB]/10 hover:border-[#2D9CDB]/40 transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-[#2D9CDB]/10">
              <p className="text-[#94A3B8] text-sm">“I landed my first internship through the ecosystem. It's more than a school.”</p>
              <p className="text-white font-semibold mt-3">— Grace, Design</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========== SECTION CONNECTION LINE ========== */}
      <div className="relative z-50 flex justify-center">
        <div className="w-px h-12 bg-gradient-to-b from-[#2D9CDB]/20 to-[#2D9CDB]/5"></div>
      </div>

      {/* ========== CONTACT ========== */}
      <section 
        ref={(el) => { contactAnim.ref(el); }}
        className={`relative z-50 py-20 bg-[#0A0E17] border-t border-[#1E293B] transition-all duration-1000 delay-700 ${
          contactAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid md:grid-cols-2 gap-10">
          <div>
            <span className="text-[#2D9CDB] text-xs font-semibold tracking-widest uppercase">✦ connect</span>
            <h2 className="text-3xl font-bold text-white mt-2">Get in touch</h2>
            <div className="space-y-4 mt-6 text-[#94A3B8]">
              <p className="hover:text-white transition-colors duration-300"><span className="inline-block w-8">📍</span> Namasuba, Stella, Kabowa, Kampala</p>
              <p className="hover:text-white transition-colors duration-300"><span className="inline-block w-8">📞</span> 0761996296</p>
              <p className="hover:text-white transition-colors duration-300"><span className="inline-block w-8">✉️</span> turyamurebanicholus@gmail.com</p>
              <div className="flex gap-4 mt-4">
                <span className="bg-[#131B2E]/60 backdrop-blur-sm px-3 py-1 rounded-full text-xs border border-[#2D9CDB]/20 hover:border-[#2D9CDB]/60 transition-all duration-300 hover:scale-105 cursor-pointer">WhatsApp</span>
                <span className="bg-[#131B2E]/60 backdrop-blur-sm px-3 py-1 rounded-full text-xs border border-[#2D9CDB]/20 hover:border-[#2D9CDB]/60 transition-all duration-300 hover:scale-105 cursor-pointer">Email</span>
                <span className="bg-[#131B2E]/60 backdrop-blur-sm px-3 py-1 rounded-full text-xs border border-[#2D9CDB]/20 hover:border-[#2D9CDB]/60 transition-all duration-300 hover:scale-105 cursor-pointer">Office Hours</span>
              </div>
            </div>
          </div>
          <div className="h-64 rounded-2xl overflow-hidden border border-[#1E293B] bg-[#131B2E] hover:border-[#2D9CDB]/30 transition-all duration-500 hover:shadow-xl hover:shadow-[#2D9CDB]/10">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31918.08877867205!2d32.525365583003335!3d0.3068647019174247!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x177dbb06c47502b1%3A0xaf67246fe5cb34bb!2sFreedom%20city!5e0!3m2!1sen!2sug!4v1782328514193!5m2!1sen!2sug&output=embed&z=15" 
              className="w-full h-full" 
              style={{ border: 0 }} 
              loading="lazy"
              title="Location Map"
            ></iframe>
          </div>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="relative z-50 border-t border-[#1E293B] py-10 bg-[#0A0E17]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-2 sm:grid-cols-4 gap-8 text-sm">
          <div>
            <h4 className="text-white font-semibold mb-2">Freedom City</h4>
            <p className="text-[#64748B] text-xs">Selfless CE · BYU</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-2">Products</h4>
            <ul className="text-[#64748B] text-xs space-y-1">
              <li className="hover:text-white transition-colors duration-300 cursor-pointer">Courses</li>
              <li className="hover:text-white transition-colors duration-300 cursor-pointer">Mentorship</li>
              <li className="hover:text-white transition-colors duration-300 cursor-pointer">Dashboard</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-2">Community</h4>
            <ul className="text-[#64748B] text-xs space-y-1">
              <li className="hover:text-white transition-colors duration-300 cursor-pointer">Students</li>
              <li className="hover:text-white transition-colors duration-300 cursor-pointer">Alumni</li>
              <li className="hover:text-white transition-colors duration-300 cursor-pointer">Events</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-2">Support</h4>
            <ul className="text-[#64748B] text-xs space-y-1">
              <li className="hover:text-white transition-colors duration-300 cursor-pointer">FAQ</li>
              <li className="hover:text-white transition-colors duration-300 cursor-pointer">Contact</li>
              <li className="hover:text-white transition-colors duration-300 cursor-pointer">Newsletter</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-8 pt-6 border-t border-[#1E293B] flex flex-col sm:flex-row justify-between text-xs text-[#64748B]">
          <p>© 2026 Freedom City Tech · Developed by Nicholus Turyamureba</p>
          <p>Powered by Tech Rise Africa</p>
        </div>
      </footer>

      {/* ========== SCROLL TO TOP ========== */}
      {showScrollTop && (
        <button 
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-[999] w-12 h-12 bg-gradient-to-r from-[#2D9CDB] to-[#1A7BBF] rounded-full shadow-2xl shadow-[#2D9CDB]/30 flex items-center justify-center text-white hover:scale-110 transition-all duration-300 hover:shadow-[#2D9CDB]/60"
        >
          <ChevronUp size={20} />
        </button>
      )}

      {/* ========== AUTH DIALOG ========== */}
      <AuthDialog 
        isOpen={showAuthDialog} 
        onClose={() => setShowAuthDialog(false)} 
        defaultTab={authTab}
      />

      {/* ========== CUSTOM ANIMATIONS ========== */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}