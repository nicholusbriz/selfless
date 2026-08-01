'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Menu, X, ChevronUp, Sparkles, Home,
  GraduationCap, MessageSquare, User, ChevronDown,
  MapPin, Globe, Code, Heart, Star, Award, Zap,
  BookOpen, CreditCard, Users, Calendar, Megaphone, FileText,
  Phone, Mail
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import Link from 'next/link';
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

// Floating Shape Component
const FloatingShape = ({ className, delay = 0, type = 'diamond' }: { className?: string; delay?: number; type?: 'diamond' | 'circle' | 'triangle' }) => {
  const shapes: Record<string, React.ReactNode> = {
    diamond: (
      <polygon points="30,0 60,30 30,60 0,30" fill="none" stroke="rgba(232,163,61,0.15)" strokeWidth="1" />
    ),
    circle: (
      <circle cx="30" cy="30" r="25" fill="none" stroke="rgba(47,168,138,0.12)" strokeWidth="1" />
    ),
    triangle: (
      <polygon points="30,0 60,60 0,60" fill="none" stroke="rgba(232,115,92,0.12)" strokeWidth="1" />
    ),
  };

  return (
    <div 
      className={`absolute ${className} animate-float-slow`}
      style={{ animationDelay: `${delay}s` }}
    >
      <svg width="60" height="60" viewBox="0 0 60 60">
        {shapes[type]}
      </svg>
    </div>
  );
};

// 3D Card Component
const Card3D = ({ children, className = '', style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) => {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setRotation({ x: y * 8, y: x * 8 });
  };
  
  return (
    <div
      className={`perspective-1000 ${className}`}
      style={style}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setRotation({ x: 0, y: 0 })}
    >
      <div
        className="transform-gpu transition-transform duration-300 ease-out"
        style={{
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
        }}
      >
        {children}
      </div>
    </div>
  );
};

// Feature Card Component
const FeatureCard = ({ icon: Icon, title, desc, index, isVisible }: { icon: any; title: string; desc: string; index: number; isVisible: boolean }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      className="relative group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated gradient border */}
      <div className="absolute -inset-px bg-gradient-to-r from-[#E8A33D] via-[#2FA88A] to-[#E8735C] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
      
      <div className="relative bg-[#150F20]/80 backdrop-blur-sm p-6 rounded-2xl border border-[#2A2438] group-hover:border-transparent transition-all duration-500">
        <div className="relative">
          {/* Icon with floating animation */}
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#E8A33D]/20 to-[#E8A33D]/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
            <Icon className="w-6 h-6 text-[#E8A33D]" />
          </div>
          
          {/* Animated underline */}
          <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#E8A33D] to-[#F2C879] group-hover:w-full transition-all duration-700" />
          
          <h3 className="text-[#F5F0E8] font-semibold text-lg mt-4">{title}</h3>
          <p className="text-[#A79C8C] text-sm mt-2 leading-relaxed">{desc}</p>
          
          {/* Reveal more info on hover */}
          <div className={`overflow-hidden transition-all duration-500 ${isHovered ? 'max-h-20 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
            <span className="text-xs text-[#E8A33D] flex items-center gap-2">
              Learn more →
              <span className="w-1.5 h-1.5 rounded-full bg-[#E8A33D] animate-pulse" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Decorative Heading Component
const DecorativeHeading = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`relative inline-block ${className}`}>
    <span className="relative z-10 text-3xl sm:text-4xl font-bold text-[#F5F0E8]" style={{ fontFamily: 'var(--font-display)' }}>
      {children}
    </span>
    {/* Decorative underline */}
    <svg className="absolute -bottom-3 left-0 w-full h-4" viewBox="0 0 200 16">
      <defs>
        <linearGradient id={`underlineGradient-${children}`}>
          <stop offset="0%" stopColor="#E8A33D" />
          <stop offset="50%" stopColor="#2FA88A" />
          <stop offset="100%" stopColor="#E8735C" />
        </linearGradient>
      </defs>
      <path
        d="M0,8 Q50,2 100,8 T200,8"
        stroke={`url(#underlineGradient-${children})`}
        strokeWidth="2.5"
        fill="none"
        className="animate-draw-line"
        strokeDasharray="200"
        strokeDashoffset="200"
      />
    </svg>
  </div>
);

export default function HomePageClient() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalType, setAuthModalType] = useState<'login' | 'register'>('login');
  const [activeSection, setActiveSection] = useState('hero');
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [heroGlow, setHeroGlow] = useState({ x: 50, y: 50 });
  const [viewportHeight, setViewportHeight] = useState(800);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const coverProgress = Math.min(scrollY / (viewportHeight * 0.85 || 700), 1);
  const coverOpacity = Math.max(1 - coverProgress * 1.15, 0);
  const coverTranslate = scrollY * 0.35;
  const showHeader = coverProgress > 0.55;

  const userRole = user?.role || 'student';
  const roleDisplayName = userRole
    .split('_')
    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

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

  const handleHeroMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    rafRef.current = requestAnimationFrame(() => setHeroGlow({ x, y }));
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

  const navItems = [
    { id: 'hero', label: 'Home', icon: Home },
    { id: 'features', label: 'Features', icon: Sparkles },
    { id: 'ecosystem', label: 'Ecosystem', icon: GraduationCap },
    { id: 'testimonials', label: 'Community', icon: MessageSquare },
  ];

  const heroAnim = useScrollAnimation();
  const featuresAnim = useScrollAnimation();
  const storytellingAnim = useScrollAnimation();
  const ecosystemAnim = useScrollAnimation();
  const testimonialsAnim = useScrollAnimation();
  const footerAnim = useScrollAnimation();

  return (
    <div className="min-h-screen bg-[#0B0912] text-[#F5F0E8] overflow-x-hidden font-sans relative">
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-10%,#1B1526_0%,#0B0912_55%)]" />
        <div
          className="absolute w-[600px] h-[600px] rounded-full bg-[#E8A33D]/[0.07] blur-[130px] animate-drift-slow"
          style={{ top: '5%', left: '10%' }}
        />
        <div
          className="absolute w-[500px] h-[500px] rounded-full bg-[#2FA88A]/[0.06] blur-[120px] animate-drift-slower"
          style={{ top: '55%', right: '8%' }}
        />
        <div
          className="absolute w-[420px] h-[420px] rounded-full bg-[#E8735C]/[0.05] blur-[110px] animate-drift-slow"
          style={{ top: '110%', left: '30%' }}
        />
        <div
          className="absolute w-[480px] h-[480px] rounded-full bg-[#E8A33D]/[0.05] blur-[130px] animate-drift-slower"
          style={{ top: '160%', right: '15%' }}
        />
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03]">
          <svg className="absolute -bottom-20 left-0 w-full" viewBox="0 0 1440 320">
            <path
              fill="#E8A33D"
              d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            >
              <animate
                attributeName="d"
                dur="20s"
                repeatCount="indefinite"
                values="
                  M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z;
                  M0,160L48,144C96,128,192,96,288,96C384,96,480,128,576,144C672,160,768,160,864,144C960,128,1056,96,1152,96C1248,96,1344,128,1392,144L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z;
                  M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z
                "
              />
            </path>
          </svg>
        </div>
        <svg className="absolute inset-0 w-full h-full opacity-40" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="stars" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
              <circle cx="12" cy="18" r="1" fill="#F5F0E8" opacity="0.25" />
              <circle cx="60" cy="70" r="1.2" fill="#E8A33D" opacity="0.3" className="animate-twinkle" />
              <circle cx="95" cy="30" r="0.8" fill="#F5F0E8" opacity="0.2" />
              <circle cx="35" cy="95" r="1" fill="#2FA88A" opacity="0.25" className="animate-twinkle-delay" />
              <circle cx="105" cy="105" r="0.9" fill="#F5F0E8" opacity="0.18" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#stars)" />
        </svg>
        <svg className="absolute inset-0 w-full h-full mix-blend-overlay opacity-[0.05]">
          <filter id="grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#grain)" />
        </svg>
      </div>

      {/* Cover Section */}
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
          <FloatingShape className="top-10 left-[10%]" delay={0} type="diamond" />
          <FloatingShape className="bottom-20 right-[15%]" delay={2} type="circle" />
          <FloatingShape className="top-1/2 left-[5%]" delay={4} type="triangle" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle_at_center,rgba(232,163,61,0.08),transparent_70%)] animate-pulse-slow" />
        </div>

        <div className="inline-flex items-center gap-2 bg-[#E8A33D]/10 rounded-full px-4 py-1.5 border border-[#E8A33D]/20 mb-8 opacity-0 animate-cover-in" style={{ animationDelay: '0.1s' }}>
          <span className="w-2 h-2 bg-[#E8A33D] rounded-full animate-pulse" />
          <span className="text-[#F2C879] text-[10px] font-medium tracking-widest uppercase">Welcome to</span>
        </div>
        <h1
          className="text-5xl sm:text-7xl md:text-8xl font-bold leading-[1.05] tracking-tight"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          <span className="block opacity-0 animate-cover-in" style={{ animationDelay: '0.25s' }}>
            <span className="text-[#F5F0E8]">Centralized Tech Center</span>
          </span>
          <span className="block opacity-0 animate-cover-in" style={{ animationDelay: '0.42s' }}>
            <span className="text-[#F5F0E8]">Student</span>{' '}
            <span className="bg-gradient-to-r from-[#E8A33D] via-[#F2C879] to-[#E8735C] bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-shift">Self Service</span>
          </span>
          <span className="block opacity-0 animate-cover-in" style={{ animationDelay: '0.6s' }}>
            <span className="text-[#F5F0E8]">Portal</span>
          </span>
        </h1>
        <p
          className="mt-8 text-[#A79C8C] text-sm sm:text-base max-w-md opacity-0 animate-cover-in"
          style={{ animationDelay: '0.8s' }}
        >
          Your academic journey starts here. Track BYU-Idaho courses, connect with study partners, and manage your Tech Center participation in one secure workspace.
        </p>
        <button
          onClick={() => scrollToSection('hero')}
          aria-label="Scroll to explore"
          className="mt-14 flex flex-col items-center gap-2 text-[#A79C8C] hover:text-[#F2C879] transition-colors duration-300 opacity-0 animate-cover-in group"
          style={{ animationDelay: '1s' }}
        >
          <span className="text-[10px] tracking-[0.3em] uppercase">Scroll</span>
          <span className="w-6 h-10 rounded-full border border-[#2A2438] group-hover:border-[#E8A33D]/50 flex items-start justify-center p-1.5 transition-colors duration-300">
            <span className="w-1 h-1.5 rounded-full bg-[#E8A33D] animate-scroll-cue" />
          </span>
        </button>
      </section>

      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        showHeader ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3 pointer-events-none'
      } ${
        isScrolled
          ? 'bg-[#0B0912]/90 backdrop-blur-xl shadow-2xl border-b border-[#2A2438]'
          : 'bg-transparent border-b border-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <div className="flex items-center gap-2 sm:gap-3 group cursor-pointer flex-shrink-0" onClick={() => scrollToSection('hero')}>
              <div className="relative">
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-[#E8A33D] to-[#C97F1F] p-[2px] shadow-lg shadow-[#E8A33D]/20 group-hover:shadow-[#E8A33D]/40 transition-all duration-300">
                  <div className="w-full h-full rounded-xl bg-[#0B0912] flex items-center justify-center">
                    <img src="/freedom.png" alt="FCTC" className="w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-lg object-cover" />
                  </div>
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 sm:w-3 sm:h-3 bg-[#2FA88A] rounded-full animate-pulse border-2 border-[#0B0912]" />
              </div>
              <div className="flex flex-col min-w-0">
                <h1 className="text-[#F5F0E8] font-bold text-sm sm:text-base md:text-lg tracking-tight leading-tight truncate" style={{ fontFamily: 'var(--font-display)' }}>
                  Selfless CE Students Portal
                </h1>
                <div className="flex items-center gap-1 sm:gap-2">
                  <span className="text-[#E8A33D] text-[8px] sm:text-[10px] md:text-xs font-medium tracking-wider uppercase">Multi-Tenant</span>
                  <span className="w-0.5 h-0.5 sm:w-1 sm:h-1 bg-[#2A2438] rounded-full" />
                  <span className="text-[#6B6358] text-[8px] sm:text-[10px] md:text-xs truncate">BYU Idaho</span>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="hidden lg:flex items-center gap-1 bg-[#150F20]/60 backdrop-blur-sm rounded-full px-2 py-1 border border-[#2A2438]">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`px-3 xl:px-4 py-1.5 xl:py-2 text-xs xl:text-sm font-medium rounded-full transition-all duration-300 flex items-center gap-1.5 xl:gap-2 ${
                    activeSection === item.id
                      ? 'text-[#0B0912] bg-gradient-to-r from-[#E8A33D] to-[#F2C879] shadow-lg shadow-[#E8A33D]/25'
                      : 'text-[#A79C8C] hover:text-[#F5F0E8] hover:bg-[#2A2438]/50'
                  }`}
                >
                  <item.icon className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
                  {item.label}
                </button>
              ))}
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-1 sm:gap-2 md:gap-3 flex-shrink-0">
              {isAuthenticated && user ? (
                <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
                  <div className="hidden sm:flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 bg-[#150F20] rounded-full border border-[#2A2438]">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 bg-gradient-to-br from-[#E8A33D] to-[#C97F1F] rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold text-[#0B0912] shadow-lg shadow-[#E8A33D]/20">
                      {user?.firstName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="text-[#F5F0E8] text-xs sm:text-sm font-medium hidden md:inline">
                      {user?.firstName || 'User'}
                    </span>
                    <span className="text-[#6B6358] text-xs hidden lg:inline">
                      • {roleDisplayName}
                    </span>
                  </div>
                  <button
                    onClick={handleDashboard}
                    className="bg-gradient-to-r from-[#2FA88A] to-[#45C7A6] hover:from-[#45C7A6] hover:to-[#2FA88A] text-[#0B0912] text-[10px] sm:text-xs md:text-sm px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-full font-semibold transition-all duration-300 shadow-lg shadow-[#2FA88A]/20 hover:shadow-[#2FA88A]/40 hover:scale-105 whitespace-nowrap"
                  >
                    Dashboard
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2">
                  <button
                    onClick={handleSignIn}
                    className="text-[#A79C8C] hover:text-[#F5F0E8] text-[10px] sm:text-xs md:text-sm px-2 sm:px-3 py-1.5 sm:py-2 rounded-full transition-all duration-300 hover:bg-[#2A2438]/50 whitespace-nowrap"
                  >
                    Login
                  </button>
                  <button
                    onClick={handleRegister}
                    className="relative overflow-hidden bg-gradient-to-r from-[#E8A33D] to-[#C97F1F] hover:from-[#C97F1F] hover:to-[#E8A33D] text-[#0B0912] text-[10px] sm:text-xs md:text-sm px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-full font-semibold transition-all duration-300 shadow-lg shadow-[#E8A33D]/20 hover:shadow-[#E8A33D]/40 hover:scale-105 whitespace-nowrap group"
                  >
                    <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12" />
                    <span className="relative">Get Started</span>
                  </button>
                </div>
              )}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden text-[#A79C8C] hover:text-[#F5F0E8] p-1.5 sm:p-2 rounded-full hover:bg-[#2A2438]/50 transition-all duration-300"
              >
                {mobileMenuOpen ? <X size={18} className="sm:w-5 sm:h-5 md:w-6 md:h-6" /> : <Menu size={18} className="sm:w-5 sm:h-5 md:w-6 md:h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-3 sm:py-4 border-t border-[#2A2438] space-y-1 animate-in slide-in-from-top-2 duration-300">
              <div className="bg-[#150F20]/60 backdrop-blur-sm rounded-2xl p-2 border border-[#2A2438]">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`w-full flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium rounded-xl transition-all duration-300 ${
                      activeSection === item.id
                        ? 'text-[#0B0912] bg-gradient-to-r from-[#E8A33D] to-[#F2C879]'
                        : 'text-[#A79C8C] hover:text-[#F5F0E8] hover:bg-[#2A2438]/50'
                    }`}
                  >
                    <item.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    {item.label}
                  </button>
                ))}
                {isAuthenticated && user ? (
                  <div className="border-t border-[#2A2438] pt-2 mt-2">
                    <button
                      onClick={handleDashboard}
                      className="w-full flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-[#A79C8C] hover:text-[#F5F0E8] hover:bg-[#2A2438]/50 rounded-xl transition-all duration-300"
                    >
                      <User className="w-4 h-4 sm:w-5 sm:h-5" />
                      Dashboard
                    </button>
                    <div className="mt-2 px-3 py-1.5 text-xs text-[#6B6358] bg-[#2A2438]/30 rounded-lg">
                      Role: {roleDisplayName}
                    </div>
                  </div>
                ) : (
                  <div className="border-t border-[#2A2438] pt-2 mt-2 flex flex-col gap-2">
                    <button
                      onClick={() => { handleSignIn(); setMobileMenuOpen(false); }}
                      className="w-full py-2.5 text-sm text-[#A79C8C] hover:text-[#F5F0E8] hover:bg-[#2A2438]/50 rounded-xl transition-all duration-300"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => { handleRegister(); setMobileMenuOpen(false); }}
                      className="w-full py-2.5 text-sm bg-gradient-to-r from-[#E8A33D] to-[#C97F1F] text-[#0B0912] rounded-xl font-semibold"
                    >
                      Register
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <div
          className="h-[2px] bg-gradient-to-r from-[#E8A33D] via-[#F2C879] to-[#E8735C] transition-[width] duration-150 ease-out"
          style={{ width: `${scrollProgress * 100}%` }}
        />
      </header>

      {/* Hero Section */}
      <section
        id="hero"
        ref={(el) => { sectionRefs.current.hero = el; heroAnim.ref(el); }}
        onMouseMove={handleHeroMouseMove}
        className={`relative z-10 min-h-screen flex items-center pt-20 pb-10 overflow-hidden transition-all duration-1000 ${
          heroAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div
          className="absolute inset-0 pointer-events-none transition-[background] duration-300 ease-out"
          style={{
            background: `radial-gradient(500px circle at ${heroGlow.x}% ${heroGlow.y}%, rgba(232,163,61,0.10), transparent 45%)`
          }}
        />
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill="#E8A33D" opacity="0.3" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
        </div>

        {/* Floating Shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <FloatingShape className="top-20 left-[5%]" delay={1} type="diamond" />
          <FloatingShape className="bottom-32 right-[8%]" delay={3} type="circle" />
          <FloatingShape className="top-1/3 right-[20%]" delay={5} type="triangle" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full relative z-10 grid lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-[#E8A33D]/10 rounded-full px-4 py-1.5 border border-[#E8A33D]/20">
              <span className="w-2 h-2 bg-[#E8A33D] rounded-full animate-pulse" />
              <span className="text-[#F2C879] text-[10px] font-medium tracking-widest uppercase">Your Academic Journey Starts Here</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.1]" style={{ fontFamily: 'var(--font-display)' }}>
              <span className="text-[#F5F0E8]/90">Manage Your</span><br />
              <span className="text-[#F5F0E8]/90">Academic Journey</span><br />
              <span className="bg-gradient-to-r from-[#E8A33D] via-[#F2C879] to-[#E8735C] bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-shift">& Connect With Peers</span>
            </h1>
            <p className="text-[#A79C8C] text-base md:text-lg max-w-lg leading-relaxed">
              The Selfless CE Student Self Service Portal brings your courses, academic progress, tutor guidance, student collaboration, announcements, daily participation, and organizational resources together in one secure workspace.
            </p>
            <div className="flex flex-wrap gap-3">
              {isAuthenticated && user ? (
                <button
                  onClick={handleDashboard}
                  className="group bg-gradient-to-r from-[#2FA88A] to-[#45C7A6] hover:from-[#45C7A6] hover:to-[#2FA88A] text-[#0B0912] px-6 sm:px-8 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 shadow-lg shadow-[#2FA88A]/20 hover:shadow-[#2FA88A]/40 hover:scale-105 flex items-center gap-2"
                >
                  <span>Go to Dashboard</span>
                  <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:rotate-180 transition-transform duration-300" />
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSignIn}
                    className="relative overflow-hidden bg-gradient-to-r from-[#E8A33D] to-[#C97F1F] hover:from-[#C97F1F] hover:to-[#E8A33D] text-[#0B0912] px-6 sm:px-8 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 shadow-lg shadow-[#E8A33D]/20 hover:shadow-[#E8A33D]/40 hover:scale-105 group"
                  >
                    <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12" />
                    <span className="relative">Student Login</span>
                  </button>
                  <button
                    onClick={handleRegister}
                    className="border-2 border-[#2A2438] hover:border-[#E8A33D] bg-transparent hover:bg-[#2A2438]/40 text-[#F5F0E8] px-6 sm:px-8 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 hover:scale-105"
                  >
                    Register
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="relative w-[280px] h-[280px] sm:w-[380px] sm:h-[380px] md:w-[450px] md:h-[450px] animate-float">
              <svg viewBox="0 0 400 400" className="w-full h-full drop-shadow-2xl">
                <circle cx="200" cy="200" r="150" fill="none" stroke="#E8A33D" strokeWidth="0.8" strokeDasharray="3 8" opacity="0.5" />
                <circle cx="200" cy="200" r="120" fill="none" stroke="#E8A33D" strokeWidth="0.8" strokeDasharray="2 6" opacity="0.4" />
                <circle cx="200" cy="200" r="90" fill="none" stroke="#E8A33D" strokeWidth="0.8" strokeDasharray="1 4" opacity="0.3" />
                <ellipse cx="200" cy="200" rx="150" ry="40" fill="none" stroke="#2FA88A" strokeWidth="0.6" strokeDasharray="4 8" opacity="0.2" transform="rotate(-20 200 200)" />
                <ellipse cx="200" cy="200" rx="150" ry="40" fill="none" stroke="#E8735C" strokeWidth="0.6" strokeDasharray="4 8" opacity="0.2" transform="rotate(40 200 200)" />
                <circle cx="200" cy="200" r="10" fill="#E8A33D" opacity="0.3" />
                <circle cx="260" cy="140" r="4" fill="#F2C879" className="animate-bounce" />
                <circle cx="130" cy="260" r="4" fill="#45C7A6" className="animate-bounce [animation-delay:1.5s]" />
                <circle cx="290" cy="220" r="3" fill="#E8735C" className="animate-pulse" />
                <circle cx="110" cy="120" r="3" fill="#2FA88A" className="animate-pulse [animation-delay:2s]" />
              </svg>
            </div>
            <div className="absolute top-4 -right-6 sm:top-10 sm:right-0 bg-[#150F20]/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-[10px] sm:text-xs text-[#F5F0E8]/80 border border-[#E8A33D]/20 shadow-xl animate-pulse">
              📌 Student joined · 2 min ago
            </div>
            <div className="absolute bottom-12 -left-6 sm:bottom-16 sm:left-0 bg-[#150F20]/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-[10px] sm:text-xs text-[#F5F0E8]/80 border border-[#2FA88A]/20 shadow-xl">
              ✅ Course registered
            </div>
            <div className="absolute top-1/2 -translate-y-1/2 -left-10 sm:left-0 bg-[#150F20]/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-[10px] sm:text-xs text-[#F5F0E8]/80 border border-[#E8735C]/20 shadow-xl">
              📊 Credits tracked
            </div>
            <div className="absolute bottom-20 right-0 bg-[#150F20]/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-[10px] sm:text-xs text-[#F5F0E8]/80 border border-[#E8A33D]/20 shadow-xl">
              🤝 Study partner found
            </div>
          </div>
        </div>
      </section>

      {/* Platform Features Section */}
      <section
        ref={(el) => { storytellingAnim.ref(el); }}
        className={`relative z-10 py-20 border-t border-[#2A2438]/60 transition-all duration-1000 delay-300 ${
          storytellingAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
          <div className="text-center mb-12">
            <span className="text-[#E8A33D] text-xs font-semibold tracking-widest uppercase">✦ built around your academic journey</span>
            <DecorativeHeading>Everything You Need to Succeed</DecorativeHeading>
            <p className="text-[#A79C8C] max-w-2xl mx-auto mt-6">
              This is where Selfless CE students manage their academic journey and connect with one another.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: BookOpen, title: 'BYU–Idaho Course Tracking', desc: 'Register the courses you\'re taking each block, keep track of your academic journey, and make it easier for tutors to monitor your progress throughout your studies.' },
              { icon: CreditCard, title: 'Credit Tracking', desc: 'Record the credits you\'re taking each block and build a clear overview of your academic progress.' },
              { icon: Users, title: 'Find Study Partners', desc: 'Search for students taking the same BYU–Idaho courses, connect with them, and build meaningful study partnerships.' },
              { icon: Calendar, title: 'Daily Participation', desc: 'Choose your preferred participation days and stay organized with your responsibilities within your Tech Center.' },
              { icon: MessageSquare, title: 'Tutor Support', desc: 'Tutors can monitor your academic journey and provide guidance to help you stay on track throughout your studies.' },
              { icon: Megaphone, title: 'Announcements', desc: 'Stay informed with updates, notices, and important communication shared within your Tech Center.' },
              { icon: FileText, title: 'Policy Handbook', desc: 'Access the complete Selfless CE policy handbook anytime to stay informed about organizational expectations and guidelines.' },
            ].map((feature, i) => (
              <Card3D key={feature.title} className={`${
                storytellingAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`} style={{ transitionDelay: storytellingAnim.isVisible ? `${i * 100}ms` : '0ms' }}>
                <FeatureCard
                  icon={feature.icon}
                  title={feature.title}
                  desc={feature.desc}
                  index={i}
                  isVisible={storytellingAnim.isVisible}
                />
              </Card3D>
            ))}
          </div>
        </div>
      </section>

      {/* Learn Together Section */}
      <section
        ref={(el) => { ecosystemAnim.ref(el); }}
        className={`relative z-10 py-20 border-t border-[#2A2438]/60 transition-all duration-1000 delay-400 ${
          ecosystemAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-[#E8A33D] text-xs font-semibold tracking-widest uppercase">✦ learn together</span>
              <DecorativeHeading>Find Students Taking the Same Course</DecorativeHeading>
              <p className="text-[#A79C8C] text-lg">Learning is easier together.</p>
              <p className="text-[#A79C8C]">
                Search for students enrolled in the same BYU–Idaho courses, connect with them, exchange ideas, and support one another throughout each academic block.
              </p>
              <div className="flex flex-wrap gap-3">
                <span className="bg-[#150F20]/50 backdrop-blur-sm px-4 py-2 rounded-full text-sm border border-[#E8A33D]/20 hover:border-[#E8A33D]/50 transition-all duration-300 hover:scale-105 cursor-default">
                  👥 Find Study Partners
                </span>
                <span className="bg-[#150F20]/50 backdrop-blur-sm px-4 py-2 rounded-full text-sm border border-[#2FA88A]/20 hover:border-[#2FA88A]/50 transition-all duration-300 hover:scale-105 cursor-default">
                  💬 Direct Messaging
                </span>
                <span className="bg-[#150F20]/50 backdrop-blur-sm px-4 py-2 rounded-full text-sm border border-[#E8735C]/20 hover:border-[#E8735C]/50 transition-all duration-300 hover:scale-105 cursor-default">
                  📚 Course Groups
                </span>
              </div>
            </div>
            <div className="relative flex justify-center">
              <div className="relative w-64 h-64 sm:w-80 sm:h-80">
                <svg viewBox="0 0 300 300" className="w-full h-full">
                  <circle cx="150" cy="150" r="100" fill="none" stroke="#E8A33D" strokeWidth="1" strokeDasharray="4 6" opacity="0.3" />
                  <circle cx="150" cy="150" r="70" fill="none" stroke="#E8A33D" strokeWidth="1" strokeDasharray="3 5" opacity="0.2" />
                  <circle cx="150" cy="150" r="40" fill="none" stroke="#E8A33D" strokeWidth="1" strokeDasharray="2 4" opacity="0.15" />
                  <circle cx="150" cy="60" r="12" fill="#E8A33D" className="animate-pulse" />
                  <circle cx="80" cy="120" r="10" fill="#F2C879" className="animate-pulse [animation-delay:0.5s]" />
                  <circle cx="220" cy="120" r="10" fill="#2FA88A" className="animate-pulse [animation-delay:1s]" />
                  <circle cx="80" cy="200" r="10" fill="#E8735C" className="animate-pulse [animation-delay:1.5s]" />
                  <circle cx="220" cy="200" r="10" fill="#F2C879" className="animate-pulse [animation-delay:2s]" />
                  <circle cx="150" cy="240" r="12" fill="#E8A33D" className="animate-pulse [animation-delay:2.5s]" />
                  <line x1="150" y1="60" x2="80" y2="120" stroke="#E8A33D" strokeWidth="1.5" opacity="0.3">
                    <animate attributeName="stroke-dashoffset" from="0" to="100" dur="3s" repeatCount="indefinite" />
                  </line>
                  <line x1="150" y1="60" x2="220" y2="120" stroke="#E8A33D" strokeWidth="1.5" opacity="0.3">
                    <animate attributeName="stroke-dashoffset" from="0" to="100" dur="3.5s" repeatCount="indefinite" />
                  </line>
                  <line x1="80" y1="120" x2="80" y2="200" stroke="#F2C879" strokeWidth="1.5" opacity="0.3">
                    <animate attributeName="stroke-dashoffset" from="0" to="100" dur="4s" repeatCount="indefinite" />
                  </line>
                  <line x1="220" y1="120" x2="220" y2="200" stroke="#2FA88A" strokeWidth="1.5" opacity="0.3">
                    <animate attributeName="stroke-dashoffset" from="0" to="100" dur="4.5s" repeatCount="indefinite" />
                  </line>
                  <line x1="80" y1="200" x2="150" y2="240" stroke="#E8735C" strokeWidth="1.5" opacity="0.3">
                    <animate attributeName="stroke-dashoffset" from="0" to="100" dur="5s" repeatCount="indefinite" />
                  </line>
                  <line x1="220" y1="200" x2="150" y2="240" stroke="#F2C879" strokeWidth="1.5" opacity="0.3">
                    <animate attributeName="stroke-dashoffset" from="0" to="100" dur="5.5s" repeatCount="indefinite" />
                  </line>
                  <text x="140" y="55" fontSize="10" fill="#A79C8C">You</text>
                  <text x="50" y="125" fontSize="10" fill="#A79C8C">Peer</text>
                  <text x="210" y="125" fontSize="10" fill="#A79C8C">Peer</text>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section
        id="testimonials"
        ref={(el) => { sectionRefs.current.testimonials = el; testimonialsAnim.ref(el); }}
        className={`relative z-10 py-20 border-t border-[#2A2438]/60 transition-all duration-1000 delay-600 ${
          testimonialsAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="text-[#E8A33D] text-xs font-semibold tracking-widest uppercase">✦ voices</span>
            <DecorativeHeading>What students say</DecorativeHeading>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <Card3D>
              <div className={`bg-[#150F20]/50 backdrop-blur-sm p-6 rounded-2xl border border-[#E8A33D]/10 hover:border-[#E8A33D]/40 transition-all duration-500 hover:shadow-xl hover:shadow-[#E8A33D]/10 ${
                testimonialsAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`} style={{ transitionDelay: testimonialsAnim.isVisible ? '0ms' : '0ms' }}>
                <p className="text-[#A79C8C] text-sm">"Freedom City gave me mentorship and a community. I grew from student to mentor."</p>
                <p className="text-[#F5F0E8] font-semibold mt-3">— Nicholus Turyamureba</p>
              </div>
            </Card3D>
            <Card3D>
              <div className={`bg-[#150F20]/50 backdrop-blur-sm p-6 rounded-2xl border border-[#E8A33D]/10 hover:border-[#E8A33D]/40 transition-all duration-500 hover:shadow-xl hover:shadow-[#E8A33D]/10 ${
                testimonialsAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`} style={{ transitionDelay: testimonialsAnim.isVisible ? '150ms' : '0ms' }}>
                <p className="text-[#A79C8C] text-sm">"The course tracking and credit system helped me stay on top of everything."</p>
                <p className="text-[#F5F0E8] font-semibold mt-3">— Tonny Kiwanuka</p>
              </div>
            </Card3D>
            <Card3D>
              <div className={`bg-[#150F20]/50 backdrop-blur-sm p-6 rounded-2xl border border-[#E8A33D]/10 hover:border-[#E8A33D]/40 transition-all duration-500 hover:shadow-xl hover:shadow-[#E8A33D]/10 ${
                testimonialsAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`} style={{ transitionDelay: testimonialsAnim.isVisible ? '300ms' : '0ms' }}>
                <p className="text-[#A79C8C] text-sm">"I found study partners through the platform. Learning together made all the difference."</p>
                <p className="text-[#F5F0E8] font-semibold mt-3">— Amah Maria</p>
              </div>
            </Card3D>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <section
        id="footer-section"
        ref={(el) => { sectionRefs.current['footer-section'] = el; footerAnim.ref(el); }}
        className={`relative z-10 min-h-screen w-full overflow-hidden transition-all duration-1000 ${
          footerAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
        }`}
      >
        {/* Animated Africa Map Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B0912] via-[#1A1228] to-[#0B0912]">
          <div className="absolute inset-0 opacity-[0.08]">
            <svg viewBox="0 0 800 600" className="w-full h-full">
              <defs>
                <linearGradient id="mapGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#E8A33D" />
                  <stop offset="50%" stopColor="#E8735C" />
                  <stop offset="100%" stopColor="#2FA88A" />
                </linearGradient>
              </defs>
              <path
                d="M400,50 C380,50 360,60 350,80 C340,95 335,110 340,130 C345,150 360,165 380,175 C400,185 420,180 440,170 C460,160 470,140 475,120 C480,100 475,80 460,65 C445,52 420,50 400,50 Z M380,185 C370,190 355,200 345,215 C335,230 330,250 335,270 C340,290 350,305 365,315 C380,325 395,328 410,325 C425,322 435,312 440,295 C445,278 442,260 435,245 C428,230 415,220 400,215 C390,212 385,200 380,185 Z M340,280 C330,290 320,310 315,335 C310,360 315,390 325,420 C335,450 350,470 370,480 C390,490 410,490 425,480 C440,470 450,450 455,425 C460,400 458,375 450,355 C442,335 430,320 415,310 C400,300 385,295 370,295 C355,295 345,285 340,280 Z"
                fill="none"
                stroke="url(#mapGlow)"
                strokeWidth="1.5"
                className="animate-pulse"
              >
                <animate attributeName="stroke-dashoffset" from="1000" to="0" dur="20s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.3;0.8;0.3" dur="4s" repeatCount="indefinite" />
              </path>
              {[
                { x: 380, y: 120, label: '🌍' },
                { x: 350, y: 280, label: '📍' },
                { x: 420, y: 200, label: '✨' },
                { x: 390, y: 350, label: '🌟' },
                { x: 360, y: 420, label: '💫' },
                { x: 430, y: 380, label: '⭐' },
              ].map((marker, i) => (
                <g key={i}>
                  <circle
                    cx={marker.x}
                    cy={marker.y}
                    r="4"
                    fill="#E8A33D"
                    opacity="0.6"
                  >
                    <animate attributeName="r" values="2;6;2" dur={`${2 + i * 0.5}s`} repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.2;0.8;0.2" dur={`${2 + i * 0.5}s`} repeatCount="indefinite" />
                  </circle>
                  <text
                    x={marker.x + 10}
                    y={marker.y + 4}
                    fontSize="16"
                    className="animate-float"
                    style={{ animationDelay: `${i * 0.3}s` }}
                  >
                    {marker.label}
                  </text>
                </g>
              ))}
              {isClient && (
                <>
                  {[...Array(20)].map((_, i) => {
                    const cx = Math.random() * 800;
                    const cy = Math.random() * 600;
                    const cyValues = `${cy};${Math.random() * 600};${Math.random() * 600}`;
                    const duration = `${5 + Math.random() * 10}s`;
                    const opacityDuration = `${3 + Math.random() * 5}s`;
                    return (
                      <circle
                        key={`particle-${i}`}
                        cx={cx}
                        cy={cy}
                        r="1"
                        fill="#E8A33D"
                        opacity="0.2"
                      >
                        <animate
                          attributeName="cy"
                          values={cyValues}
                          dur={duration}
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="opacity"
                          values="0.1;0.4;0.1"
                          dur={opacityDuration}
                          repeatCount="indefinite"
                        />
                      </circle>
                    );
                  })}
                </>
              )}
            </svg>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 py-20">
          <div className="max-w-7xl mx-auto w-full">
            {/* Top Section: Africa Map Title */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-3 bg-[#E8A33D]/10 rounded-full px-6 py-2 border border-[#E8A33D]/20 mb-6">
                <Globe className="w-4 h-4 text-[#E8A33D]" />
                <span className="text-[#F2C879] text-xs font-medium tracking-widest uppercase">Powered by Africa</span>
              </div>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#F5F0E8] leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
                Building Africa's
                <span className="block bg-gradient-to-r from-[#E8A33D] via-[#F2C879] to-[#E8735C] bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-shift mt-2">
                  Digital Future
                </span>
              </h2>
              <p className="text-[#A79C8C] text-sm sm:text-base max-w-2xl mx-auto mt-4">
                Empowering the next generation of African tech leaders through education, mentorship, and community.
              </p>
            </div>

            {/* Grid: Footer Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-16">
              <div className="col-span-1 sm:col-span-2 lg:col-span-1">
                <h3 className="text-white font-bold text-lg mb-4" style={{ fontFamily: 'var(--font-display)' }}>
                  Selfless CE Portal
                </h3>
                <p className="text-[#8A8278] text-sm leading-relaxed">
                  The official centralized multi-tenant platform for all Selfless CE Tech Centers. Empowering students across Uganda with BYU-Idaho education and technical training.
                </p>
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm mb-3">Quick Links</h4>
                <ul className="space-y-2 text-sm text-[#8A8278]">
                  <li><button onClick={() => scrollToSection('hero')} className="hover:text-white transition-colors duration-300">About</button></li>
                  <li><button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors duration-300">Courses</button></li>
                  <li><button onClick={() => scrollToSection('ecosystem')} className="hover:text-white transition-colors duration-300">Mentorship</button></li>
                  <li><button onClick={() => scrollToSection('hero')} className="hover:text-white transition-colors duration-300">Blog</button></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm mb-3">Community</h4>
                <ul className="space-y-2 text-sm text-[#8A8278]">
                  <li><button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors duration-300">Students</button></li>
                  <li><button onClick={() => scrollToSection('ecosystem')} className="hover:text-white transition-colors duration-300">Alumni</button></li>
                  <li><button onClick={() => scrollToSection('hero')} className="hover:text-white transition-colors duration-300">Events</button></li>
                  <li><button onClick={() => scrollToSection('hero')} className="hover:text-white transition-colors duration-300">Partners</button></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm mb-3">Support</h4>
                <ul className="space-y-2 text-sm text-[#8A8278]">
                  <li><button onClick={() => scrollToSection('hero')} className="hover:text-white transition-colors duration-300">FAQ</button></li>
                  <li><button onClick={() => scrollToSection('hero')} className="hover:text-white transition-colors duration-300">Contact</button></li>
                  <li><button onClick={() => scrollToSection('hero')} className="hover:text-white transition-colors duration-300">Help Center</button></li>
                  <li><button onClick={() => scrollToSection('hero')} className="hover:text-white transition-colors duration-300">Privacy Policy</button></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm mb-3">Connect</h4>
                <div className="flex items-center gap-4">
                  <a
                    href="https://wa.me/256761996296"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-[#150F20]/50 border border-[#E8A33D]/20 hover:border-[#E8A33D]/50 hover:bg-[#E8A33D]/10 transition-all duration-300 hover:scale-110"
                    aria-label="WhatsApp"
                  >
                    <Phone className="w-5 h-5 text-[#E8A33D]" />
                  </a>
                  <a
                    href="mailto:turyamurebanicholus@gmail.com"
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-[#150F20]/50 border border-[#E8A33D]/20 hover:border-[#E8A33D]/50 hover:bg-[#E8A33D]/10 transition-all duration-300 hover:scale-110"
                    aria-label="Email"
                  >
                    <Mail className="w-5 h-5 text-[#E8A33D]" />
                  </a>
                </div>
              </div>
            </div>

            {/* Developer Section */}
            <div className="relative rounded-3xl overflow-hidden border border-[#E8A33D]/20 bg-gradient-to-br from-[#1A1228] to-[#0B0912] p-8 mb-8">
              <div className="absolute inset-0 opacity-5">
                <svg viewBox="0 0 800 200" className="w-full h-full">
                  <path
                    d="M0,100 Q100,50 200,100 T400,100 T600,100 T800,100"
                    stroke="#E8A33D"
                    strokeWidth="2"
                    fill="none"
                  >
                    <animate attributeName="d" values="M0,100 Q100,50 200,100 T400,100 T600,100 T800,100;M0,100 Q100,150 200,100 T400,100 T600,100 T800,100;M0,100 Q100,50 200,100 T400,100 T600,100 T800,100" dur="6s" repeatCount="indefinite" />
                  </path>
                  <text x="20" y="150" fontSize="14" fill="#E8A33D" opacity="0.3">✦</text>
                  <text x="750" y="150" fontSize="14" fill="#E8A33D" opacity="0.3">✦</text>
                  {isClient && (
                    <>
                      {[...Array(20)].map((_, i) => (
                        <circle
                          key={`dev-particle-${i}`}
                          cx={Math.random() * 800}
                          cy={Math.random() * 200}
                          r="1"
                          fill="#E8A33D"
                          opacity="0.2"
                        >
                          <animate attributeName="opacity" values="0.1;0.4;0.1" dur={`${2 + Math.random() * 3}s`} repeatCount="indefinite" />
                        </circle>
                      ))}
                    </>
                  )}
                </svg>
              </div>

              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                    <span className="text-2xl">👨‍💻</span>
                    <h3 className="text-xl sm:text-2xl font-bold text-white">
                      <span className="bg-gradient-to-r from-[#E8A33D] to-[#F2C879] bg-clip-text text-transparent">Freedom City Tech Center</span>
                      <span className="text-white"> Software Students</span>
                    </h3>
                  </div>
                  <p className="text-[#A79C8C] text-sm max-w-lg">
                    Build. Learn. Collaborate. — A dedicated space for software students at Freedom City Tech Center to collaborate on projects, contribute to shared repositories, and grow together as developers.
                  </p>
                  <div className="flex flex-wrap items-center gap-4 mt-3 justify-center md:justify-start">
                    <span className="flex items-center gap-1.5 text-xs text-[#8A8278]">
                      <Code className="w-3.5 h-3.5 text-[#E8A33D]" />
                      Full Stack Development
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-[#8A8278]">
                      <Heart className="w-3.5 h-3.5 text-[#E8735C]" />
                      Tech Education
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-[#8A8278]">
                      <Star className="w-3.5 h-3.5 text-[#F2C879]" />
                      Open Source
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-3">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-xs text-[#8A8278]">
                      <Award className="w-4 h-4 text-[#E8A33D]" />
                      <span>Resilient Mind</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#8A8278]">
                      <Zap className="w-4 h-4 text-[#E8A33D]" />
                      <span>Innovator</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#8A8278]">
                    <span className="w-2 h-2 rounded-full bg-[#E8A33D] animate-pulse" />
                    <span>Selfless CE • BYU Idaho</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#2A2438]/60 text-xs text-[#6B6358]">
              <p>
                © {new Date().getFullYear()} Selfless CE Organization. All rights reserved.
              </p>
              <div className="flex items-center gap-4">
                <span>Nurturing Resilient Minds</span>
                <span className="w-1 h-1 rounded-full bg-[#2A2438]" />
                <span className="text-[#E8A33D]">✦</span>
                <span>Built with ❤️ in Africa</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-[999] w-12 h-12 bg-gradient-to-r from-[#E8A33D] to-[#C97F1F] rounded-full shadow-2xl shadow-[#E8A33D]/30 flex items-center justify-center text-[#0B0912] hover:scale-110 transition-all duration-300 hover:shadow-[#E8A33D]/60"
        >
          <ChevronUp size={20} />
        </button>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={closeAuthModal}
        defaultType={authModalType}
      />

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }

        @keyframes drift-slow {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -20px) scale(1.08); }
        }
        .animate-drift-slow { animation: drift-slow 18s ease-in-out infinite; }
        .animate-drift-slower { animation: drift-slower 24s ease-in-out infinite; }

        @keyframes twinkle {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.6; }
        }
        .animate-twinkle { animation: twinkle 4s ease-in-out infinite; }
        .animate-twinkle-delay { animation: twinkle 5s ease-in-out infinite 1.5s; }

        @keyframes cover-in {
          0% { opacity: 0; transform: translateY(18px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-cover-in {
          animation: cover-in 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes scroll-cue {
          0% { transform: translateY(0); opacity: 1; }
          70% { opacity: 0; }
          100% { transform: translateY(14px); opacity: 0; }
        }
        .animate-scroll-cue { animation: scroll-cue 1.6s ease-in-out infinite; }

        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-shift {
          animation: gradient-shift 6s ease-in-out infinite;
        }

        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }

        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 6s ease-in-out infinite;
        }

        @keyframes draw-line {
          to { stroke-dashoffset: 0; }
        }
        .animate-draw-line {
          animation: draw-line 1.5s ease-out forwards;
        }

        .perspective-1000 {
          perspective: 1000px;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-float, .animate-drift-slow, .animate-drift-slower,
          .animate-twinkle, .animate-twinkle-delay,
          .animate-cover-in, .animate-scroll-cue,
          .animate-float-slow, .animate-pulse-slow,
          .animate-gradient-shift, .animate-draw-line {
            animation: none;
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}