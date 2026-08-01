'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Menu, X, ChevronUp, Sparkles, Home,
  GraduationCap, MessageSquare, User, ChevronDown,
  Globe, Code, Heart, Star, Award, Zap,
  BookOpen, CreditCard, Users, Calendar, Megaphone, FileText,
  Phone, Mail, ArrowRight, Check, ExternalLink, Trophy, Footprints
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import AuthModal from '@/components/auth/AuthModal';

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
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    observer.observe(ref);
    return () => observer.disconnect();
  }, [ref]);

  return { ref: setRef, isVisible };
}

// Floating Shape - Minimal
const FloatingShape = ({ className, delay = 0 }: { className?: string; delay?: number }) => (
  <div 
    className={`absolute ${className} opacity-20`}
    style={{ animationDelay: `${delay}s` }}
  >
    <div className="w-16 h-16 rounded-full border border-[#E8A33D]/10" />
  </div>
);

// Card Component
const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-[#150F20]/60 backdrop-blur-sm border border-[#2A2438]/50 rounded-2xl p-6 hover:border-[#E8A33D]/20 transition-all duration-300 ${className}`}>
    {children}
  </div>
);

export default function HomePageClient() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalType, setAuthModalType] = useState<'login' | 'register'>('login');
  const [activeSection, setActiveSection] = useState('hero');
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(800);
  const [scrollProgress, setScrollProgress] = useState(0);
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  useEffect(() => {
    const updateViewport = () => setViewportHeight(window.innerHeight);
    updateViewport();
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
      setIsScrolled(window.scrollY > 50);
      setScrollY(window.scrollY);

      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0);

      const sections = ['cover', 'hero', 'features', 'ecosystem', 'testimonials', 'footer-section'];
      let current = 'hero';
      sections.forEach(id => {
        const el = sectionRefs.current[id];
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 100) current = id;
        }
      });
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

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
    setAuthModalType('login');
    setShowAuthModal(true);
  };

  const handleRegister = () => {
    setAuthModalType('register');
    setShowAuthModal(true);
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
  };

  const handleDashboard = () => router.push('/dashboard');

  const coverProgress = Math.min(scrollY / (viewportHeight * 0.85 || 700), 1);
  const coverOpacity = Math.max(1 - coverProgress * 1.15, 0);
  const coverTranslate = scrollY * 0.35;
  const showHeader = coverProgress > 0.55;

  const userRole = user?.role || 'student';
  const roleDisplayName = userRole
    .split('_')
    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const navItems = [
    { id: 'hero', label: 'Home', icon: Home },
    { id: 'features', label: 'Features', icon: Sparkles },
    { id: 'ecosystem', label: 'Ecosystem', icon: GraduationCap },
    { id: 'testimonials', label: 'Community', icon: MessageSquare },
  ];

  const heroAnim = useScrollAnimation();
  const featuresAnim = useScrollAnimation();
  const ecosystemAnim = useScrollAnimation();
  const testimonialsAnim = useScrollAnimation();
  const footerAnim = useScrollAnimation();

  // Features data - enhanced descriptions
  const features = [
    { 
      icon: BookOpen, 
      title: 'Course Registration', 
      desc: 'Register your BYU-Idaho courses each semester and track your academic progress in real-time. Stay organized and never miss a deadline.',
      tag: 'Academic'
    },
    { 
      icon: CreditCard, 
      title: 'Credit Tracking', 
      desc: 'Monitor your credit accumulation with a clear visual dashboard. Plan your academic journey and ensure you meet graduation requirements.',
      tag: 'Progress'
    },
    { 
      icon: Users, 
      title: 'Study Network', 
      desc: 'Connect with peers taking the same courses. Collaborate, share resources, and build meaningful study partnerships that enhance learning.',
      tag: 'Community'
    },
    { 
      icon: Calendar, 
      title: 'Tech Center Participation', 
      desc: 'Choose your preferred participation days and manage your weekly schedule. Stay actively engaged with your Tech Center community.',
      tag: 'Engagement'
    },
    { 
      icon: MessageSquare, 
      title: 'Tutor Support', 
      desc: 'Receive personalized guidance from experienced tutors. Get feedback on your progress and stay on track with your academic goals.',
      tag: 'Support'
    },
    { 
      icon: Megaphone, 
      title: 'Center Announcements', 
      desc: 'Stay informed with real-time updates, event notifications, and important communications from your Tech Center leadership.',
      tag: 'Communication'
    },
  ];

  // Football team feature
  const footballFeature = {
    icon: Trophy,
    title: 'Join Football Team',
    desc: 'Represent your Tech Center in the inter-center football league. Build teamwork, stay active, and compete for glory.',
    tag: 'Sports'
  };

  return (
    <div className="min-h-screen bg-[#0B0912] text-[#F5F0E8] overflow-x-hidden font-sans relative">
      {/* Background - Clean and subtle */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-10%,#1B1526_0%,#0B0912_55%)]" />
        
        {/* Minimal ambient glow */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#E8A33D]/5 blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-[#2FA88A]/5 blur-[100px]" />
      </div>

      {/* Cover Section - Updated content */}
      <section
        id="cover"
        ref={(el) => { sectionRefs.current.cover = el; }}
        className="relative z-30 min-h-screen flex flex-col items-center justify-center text-center px-4 select-none"
        style={{
          opacity: coverOpacity,
          transform: `translateY(-${coverTranslate}px)`,
          pointerEvents: coverOpacity < 0.05 ? 'none' : 'auto',
        }}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <FloatingShape className="top-20 left-[5%]" delay={0} />
          <FloatingShape className="bottom-20 right-[5%]" delay={2} />
        </div>

        <div className="inline-flex items-center gap-2 bg-[#E8A33D]/10 rounded-full px-4 py-1.5 border border-[#E8A33D]/20 mb-8">
          <span className="w-1.5 h-1.5 bg-[#E8A33D] rounded-full" />
          <span className="text-[#F2C879] text-[11px] font-medium tracking-widest uppercase">Welcome to</span>
        </div>
        
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold leading-[1.05] tracking-tight text-[#F5F0E8]">
          <span className="block">Selfless CE</span>
          <span className="block text-[#E8A33D]">Student Self Service</span>
          <span className="block text-3xl sm:text-4xl md:text-5xl mt-2 text-[#F5F0E8]/70">Portal</span>
        </h1>
        
        <p className="mt-6 text-[#A79C8C] text-sm sm:text-base max-w-md leading-relaxed">
          Your centralized hub for academic tracking, course registration, and Tech Center community engagement.
        </p>
        
        <button
          onClick={() => scrollToSection('hero')}
          className="mt-12 flex flex-col items-center gap-2 text-[#A79C8C] hover:text-[#F5F0E8] transition-colors group"
        >
          <span className="text-[10px] tracking-[0.3em] uppercase">Explore</span>
          <span className="w-6 h-10 rounded-full border border-[#2A2438] group-hover:border-[#E8A33D]/50 flex items-start justify-center p-1.5 transition-colors">
            <span className="w-1 h-1.5 rounded-full bg-[#E8A33D] animate-scroll-cue" />
          </span>
        </button>
      </section>

      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        showHeader ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3 pointer-events-none'
      } ${
        isScrolled
          ? 'bg-[#0B0912]/80 backdrop-blur-md border-b border-[#2A2438]/50'
          : 'bg-transparent border-b border-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => scrollToSection('hero')}>
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#E8A33D] to-[#C97F1F] p-[2px]">
                <div className="w-full h-full rounded-lg bg-[#0B0912] flex items-center justify-center">
                  <img src="/freedom.png" alt="FCTC" className="w-7 h-7 rounded-lg object-cover" />
                </div>
              </div>
              <div>
                <h1 className="text-[#F5F0E8] font-bold text-sm md:text-base tracking-tight">
                  Selfless CE Student Portal
                </h1>
                <div className="flex items-center gap-2">
                  <span className="text-[#E8A33D] text-[8px] font-medium tracking-wider uppercase">Multi-Tenant</span>
                  <span className="w-0.5 h-0.5 bg-[#2A2438] rounded-full" />
                  <span className="text-[#6B6358] text-[8px]">BYU Idaho</span>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                    activeSection === item.id
                      ? 'text-[#E8A33D] bg-[#E8A33D]/10'
                      : 'text-[#A79C8C] hover:text-[#F5F0E8] hover:bg-[#2A2438]/30'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Auth */}
            <div className="flex items-center gap-3">
              {isAuthenticated && user ? (
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#150F20] rounded-lg border border-[#2A2438]">
                    <div className="w-6 h-6 bg-gradient-to-br from-[#E8A33D] to-[#C97F1F] rounded-full flex items-center justify-center text-xs font-bold text-[#0B0912]">
                      {user?.firstName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="text-[#F5F0E8] text-sm font-medium hidden md:inline">
                      {user?.firstName || 'User'}
                    </span>
                  </div>
                  <button
                    onClick={handleDashboard}
                    className="bg-[#E8A33D] hover:bg-[#C97F1F] text-[#0B0912] text-sm px-4 py-2 rounded-lg font-semibold transition-all duration-300"
                  >
                    Dashboard
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSignIn}
                    className="text-[#A79C8C] hover:text-[#F5F0E8] text-sm px-3 py-2 rounded-lg transition-all duration-300 hover:bg-[#2A2438]/30"
                  >
                    Login
                  </button>
                  <button
                    onClick={handleRegister}
                    className="bg-[#E8A33D] hover:bg-[#C97F1F] text-[#0B0912] text-sm px-4 py-2 rounded-lg font-semibold transition-all duration-300"
                  >
                    Get Started
                  </button>
                </div>
              )}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden text-[#A79C8C] hover:text-[#F5F0E8] p-2 rounded-lg hover:bg-[#2A2438]/30 transition-all"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-4 border-t border-[#2A2438]/50">
              <div className="space-y-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                      activeSection === item.id
                        ? 'text-[#E8A33D] bg-[#E8A33D]/10'
                        : 'text-[#A79C8C] hover:text-[#F5F0E8] hover:bg-[#2A2438]/30'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </button>
                ))}
                {isAuthenticated && user ? (
                  <button
                    onClick={handleDashboard}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-[#A79C8C] hover:text-[#F5F0E8] hover:bg-[#2A2438]/30 rounded-lg transition-all"
                  >
                    <User className="w-4 h-4" />
                    Dashboard
                  </button>
                ) : (
                  <div className="pt-2 flex flex-col gap-2">
                    <button
                      onClick={() => { handleSignIn(); setMobileMenuOpen(false); }}
                      className="w-full py-3 text-sm text-[#A79C8C] hover:text-[#F5F0E8] hover:bg-[#2A2438]/30 rounded-lg transition-all"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => { handleRegister(); setMobileMenuOpen(false); }}
                      className="w-full py-3 text-sm bg-[#E8A33D] text-[#0B0912] rounded-lg font-semibold"
                    >
                      Get Started
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <div
          className="h-[2px] bg-gradient-to-r from-[#E8A33D] to-[#C97F1F] transition-[width] duration-150"
          style={{ width: `${scrollProgress * 100}%` }}
        />
      </header>

      {/* Hero Section */}
      <section
        id="hero"
        ref={(el) => { sectionRefs.current.hero = el; heroAnim.ref(el); }}
        className={`relative z-10 min-h-screen flex items-center pt-20 pb-10 transition-all duration-700 ${
          heroAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#E8A33D]/10 rounded-lg px-3 py-1.5 border border-[#E8A33D]/20 mb-6">
              <span className="w-1.5 h-1.5 bg-[#E8A33D] rounded-full" />
              <span className="text-[#F2C879] text-[11px] font-medium tracking-widest uppercase">Your Academic Hub</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.1] text-[#F5F0E8]">
              Manage Your
              <span className="block text-[#E8A33D]">Academic Journey</span>
            </h1>
            
            <p className="text-[#A79C8C] text-base md:text-lg max-w-lg mt-4 leading-relaxed">
              A centralized workspace for Selfless CE students to track courses, monitor progress, and stay connected with your Tech Center community.
            </p>
            
            <div className="flex flex-wrap gap-3 mt-6">
              {isAuthenticated && user ? (
                <button
                  onClick={handleDashboard}
                  className="group bg-[#E8A33D] hover:bg-[#C97F1F] text-[#0B0912] px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center gap-2"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSignIn}
                    className="bg-[#E8A33D] hover:bg-[#C97F1F] text-[#0B0912] px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-300"
                  >
                    Student Login
                  </button>
                  <button
                    onClick={handleRegister}
                    className="border border-[#2A2438] hover:border-[#E8A33D] text-[#F5F0E8] px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-[#2A2438]/30"
                  >
                    Register
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="relative w-64 h-64 sm:w-80 sm:h-80">
              <svg viewBox="0 0 300 300" className="w-full h-full">
                <circle cx="150" cy="150" r="100" fill="none" stroke="#E8A33D" strokeWidth="1" opacity="0.15" />
                <circle cx="150" cy="150" r="70" fill="none" stroke="#E8A33D" strokeWidth="1" opacity="0.1" />
                <circle cx="150" cy="150" r="40" fill="none" stroke="#E8A33D" strokeWidth="1" opacity="0.05" />
                <circle cx="150" cy="60" r="8" fill="#E8A33D" />
                <circle cx="80" cy="120" r="6" fill="#F2C879" />
                <circle cx="220" cy="120" r="6" fill="#2FA88A" />
                <circle cx="80" cy="200" r="6" fill="#E8735C" />
                <circle cx="220" cy="200" r="6" fill="#F2C879" />
                <circle cx="150" cy="240" r="8" fill="#E8A33D" />
                <line x1="150" y1="60" x2="80" y2="120" stroke="#E8A33D" strokeWidth="1" opacity="0.2" />
                <line x1="150" y1="60" x2="220" y2="120" stroke="#E8A33D" strokeWidth="1" opacity="0.2" />
                <line x1="80" y1="120" x2="80" y2="200" stroke="#F2C879" strokeWidth="1" opacity="0.2" />
                <line x1="220" y1="120" x2="220" y2="200" stroke="#2FA88A" strokeWidth="1" opacity="0.2" />
                <line x1="80" y1="200" x2="150" y2="240" stroke="#E8735C" strokeWidth="1" opacity="0.2" />
                <line x1="220" y1="200" x2="150" y2="240" stroke="#F2C879" strokeWidth="1" opacity="0.2" />
                <text x="140" y="55" fontSize="9" fill="#A79C8C">You</text>
                <text x="50" y="125" fontSize="9" fill="#A79C8C">Peers</text>
                <text x="210" y="125" fontSize="9" fill="#A79C8C">Peers</text>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Features - Clean grid */}
      <section
        ref={(el) => { featuresAnim.ref(el); }}
        className={`relative z-10 py-20 border-t border-[#2A2438]/40 transition-all duration-700 ${
          featuresAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mb-12">
            <span className="text-[#E8A33D] text-xs font-semibold tracking-widest uppercase">Features</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#F5F0E8] mt-2">
              Everything you need to succeed
            </h2>
            <p className="text-[#A79C8C] mt-3">
              Tools designed to help you track your academic journey and stay connected with your Tech Center community.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className={`transition-all duration-700 delay-${i * 100} ${
                  featuresAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: featuresAnim.isVisible ? `${i * 100}ms` : '0ms' }}
              >
                <Card className="group h-full">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[#E8A33D]/10 flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-5 h-5 text-[#E8A33D]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-[#F5F0E8] font-semibold">{feature.title}</h3>
                        <span className="text-[10px] text-[#A79C8C] bg-[#2A2438]/30 px-2 py-0.5 rounded-full">
                          {feature.tag}
                        </span>
                      </div>
                      <p className="text-[#A79C8C] text-sm mt-1 leading-relaxed">{feature.desc}</p>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>

          {/* Football Team Card - Added as a featured card */}
          <div
            className={`mt-6 transition-all duration-700 delay-300 ${
              featuresAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <Card className="border-[#E8A33D]/20 bg-gradient-to-r from-[#E8A33D]/5 to-transparent">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#E8A33D]/20 flex items-center justify-center flex-shrink-0">
                    <Trophy className="w-5 h-5 text-[#E8A33D]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-[#F5F0E8] font-semibold">Join Your Tech Center Football Team</h3>
                      <span className="text-[10px] text-[#E8A33D] bg-[#E8A33D]/20 px-2 py-0.5 rounded-full">
                        Sports
                      </span>
                    </div>
                    <p className="text-[#A79C8C] text-sm mt-1 leading-relaxed max-w-2xl">
                      Represent your Tech Center in the inter-center football league. Build teamwork, stay active, compete for glory, and connect with fellow students through sports.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Ecosystem - Clean and focused */}
      <section
        ref={(el) => { ecosystemAnim.ref(el); }}
        className={`relative z-10 py-20 border-t border-[#2A2438]/40 transition-all duration-700 ${
          ecosystemAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-[#E8A33D] text-xs font-semibold tracking-widest uppercase">Community</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#F5F0E8] mt-2">
                Find your study partners
              </h2>
              <p className="text-[#A79C8C] text-lg mt-3">Learning is better together.</p>
              <p className="text-[#A79C8C] mt-2 leading-relaxed">
                Connect with students taking the same BYU–Idaho courses. Exchange ideas, share resources, and support each other throughout each academic block.
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="bg-[#150F20]/50 px-3 py-1.5 rounded-lg text-sm border border-[#2A2438]/50">
                  👥 Study Partners
                </span>
                <span className="bg-[#150F20]/50 px-3 py-1.5 rounded-lg text-sm border border-[#2A2438]/50">
                  💬 Direct Messaging
                </span>
                <span className="bg-[#150F20]/50 px-3 py-1.5 rounded-lg text-sm border border-[#2A2438]/50">
                  📚 Course Groups
                </span>
              </div>
            </div>
            <div className="relative flex justify-center">
              <div className="w-64 h-64">
                <svg viewBox="0 0 300 300" className="w-full h-full">
                  <circle cx="150" cy="150" r="100" fill="none" stroke="#E8A33D" strokeWidth="1" opacity="0.15" />
                  <circle cx="150" cy="150" r="70" fill="none" stroke="#E8A33D" strokeWidth="1" opacity="0.1" />
                  <circle cx="150" cy="150" r="40" fill="none" stroke="#E8A33D" strokeWidth="1" opacity="0.05" />
                  <circle cx="150" cy="60" r="8" fill="#E8A33D" />
                  <circle cx="80" cy="120" r="6" fill="#F2C879" />
                  <circle cx="220" cy="120" r="6" fill="#2FA88A" />
                  <circle cx="80" cy="200" r="6" fill="#E8735C" />
                  <circle cx="220" cy="200" r="6" fill="#F2C879" />
                  <circle cx="150" cy="240" r="8" fill="#E8A33D" />
                  <line x1="150" y1="60" x2="80" y2="120" stroke="#E8A33D" strokeWidth="1" opacity="0.2" />
                  <line x1="150" y1="60" x2="220" y2="120" stroke="#E8A33D" strokeWidth="1" opacity="0.2" />
                  <line x1="80" y1="120" x2="80" y2="200" stroke="#F2C879" strokeWidth="1" opacity="0.2" />
                  <line x1="220" y1="120" x2="220" y2="200" stroke="#2FA88A" strokeWidth="1" opacity="0.2" />
                  <line x1="80" y1="200" x2="150" y2="240" stroke="#E8735C" strokeWidth="1" opacity="0.2" />
                  <line x1="220" y1="200" x2="150" y2="240" stroke="#F2C879" strokeWidth="1" opacity="0.2" />
                  <text x="140" y="55" fontSize="9" fill="#A79C8C">You</text>
                  <text x="50" y="125" fontSize="9" fill="#A79C8C">Peer</text>
                  <text x="210" y="125" fontSize="9" fill="#A79C8C">Peer</text>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section
        id="testimonials"
        ref={(el) => { sectionRefs.current.testimonials = el; testimonialsAnim.ref(el); }}
        className={`relative z-10 py-20 border-t border-[#2A2438]/40 transition-all duration-700 ${
          testimonialsAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mb-12">
            <span className="text-[#E8A33D] text-xs font-semibold tracking-widest uppercase">Voices</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#F5F0E8] mt-2">
              What students say
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            <div
              className={`transition-all duration-700 delay-0 ${
                testimonialsAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              <Card>
                <p className="text-[#A79C8C] text-sm leading-relaxed">
                  "Freedom City gave me mentorship and a community. I grew from student to mentor."
                </p>
                <p className="text-[#F5F0E8] font-semibold mt-3 text-sm">— Nicholus Turyamureba</p>
              </Card>
            </div>
            <div
              className={`transition-all duration-700 delay-100 ${
                testimonialsAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              <Card>
                <p className="text-[#A79C8C] text-sm leading-relaxed">
                  "The course tracking and credit system helped me stay on top of everything."
                </p>
                <p className="text-[#F5F0E8] font-semibold mt-3 text-sm">— Tonny Kiwanuka</p>
              </Card>
            </div>
            <div
              className={`transition-all duration-700 delay-200 ${
                testimonialsAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              <Card>
                <p className="text-[#A79C8C] text-sm leading-relaxed">
                  "I found study partners through the platform. Learning together made all the difference."
                </p>
                <p className="text-[#F5F0E8] font-semibold mt-3 text-sm">— Amah Maria</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <section
        id="footer-section"
        ref={(el) => { sectionRefs.current['footer-section'] = el; footerAnim.ref(el); }}
        className={`relative z-10 border-t border-[#2A2438]/40 transition-all duration-700 ${
          footerAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
            <div className="col-span-1 sm:col-span-2 lg:col-span-1">
              <h3 className="text-white font-bold text-lg">Selfless CE Portal</h3>
              <p className="text-[#8A8278] text-sm mt-3 leading-relaxed">
                Centralized multi-tenant platform for all Selfless CE Tech Centers across Uganda.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-3">Quick Links</h4>
              <ul className="space-y-2 text-sm text-[#8A8278]">
                <li><button onClick={() => scrollToSection('hero')} className="hover:text-white transition-colors">About</button></li>
                <li><button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors">Features</button></li>
                <li><button onClick={() => scrollToSection('ecosystem')} className="hover:text-white transition-colors">Community</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-3">Community</h4>
              <ul className="space-y-2 text-sm text-[#8A8278]">
                <li><button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors">Students</button></li>
                <li><button onClick={() => scrollToSection('ecosystem')} className="hover:text-white transition-colors">Alumni</button></li>
                <li><button onClick={() => scrollToSection('hero')} className="hover:text-white transition-colors">Events</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-[#8A8278]">
                <li><button onClick={() => scrollToSection('hero')} className="hover:text-white transition-colors">FAQ</button></li>
                <li><button onClick={() => scrollToSection('hero')} className="hover:text-white transition-colors">Contact</button></li>
                <li><button onClick={() => scrollToSection('hero')} className="hover:text-white transition-colors">Privacy</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-3">Connect</h4>
              <div className="flex items-center gap-3">
                <a
                  href="https://wa.me/256761996296"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-[#150F20]/50 border border-[#2A2438] hover:border-[#E8A33D]/30 hover:bg-[#E8A33D]/10 flex items-center justify-center transition-all"
                >
                  <Phone className="w-5 h-5 text-[#E8A33D]" />
                </a>
                <a
                  href="mailto:turyamurebanicholus@gmail.com"
                  className="w-10 h-10 rounded-lg bg-[#150F20]/50 border border-[#2A2438] hover:border-[#E8A33D]/30 hover:bg-[#E8A33D]/10 flex items-center justify-center transition-all"
                >
                  <Mail className="w-5 h-5 text-[#E8A33D]" />
                </a>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 mt-8 border-t border-[#2A2438]/30 text-xs text-[#6B6358]">
            <p>© {new Date().getFullYear()} Selfless CE Organization. All rights reserved.</p>
            <div className="flex items-center gap-3">
              <span>Nurturing Resilient Minds</span>
              <span className="w-1 h-1 rounded-full bg-[#2A2438]" />
              <span className="text-[#E8A33D]">✦</span>
              <span>Built in Africa</span>
            </div>
          </div>
        </div>
      </section>

      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-[999] w-11 h-11 bg-[#E8A33D] hover:bg-[#C97F1F] rounded-lg shadow-lg shadow-[#E8A33D]/20 flex items-center justify-center text-[#0B0912] transition-all duration-300 hover:scale-105"
        >
          <ChevronUp size={18} />
        </button>
      )}

      <AuthModal
        isOpen={showAuthModal}
        onClose={closeAuthModal}
        defaultType={authModalType}
      />

      <style jsx>{`
        @keyframes scroll-cue {
          0% { transform: translateY(0); opacity: 1; }
          70% { opacity: 0; }
          100% { transform: translateY(14px); opacity: 0; }
        }
        .animate-scroll-cue {
          animation: scroll-cue 1.6s ease-in-out infinite;
        }

        .delay-0 { transition-delay: 0ms; }
        .delay-100 { transition-delay: 100ms; }
        .delay-200 { transition-delay: 200ms; }
        .delay-300 { transition-delay: 300ms; }
      `}</style>
    </div>
  );
}