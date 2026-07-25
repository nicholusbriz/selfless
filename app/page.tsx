'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Sora, Inter } from 'next/font/google';
import {
  Menu, X, ChevronUp, Sparkles, LogIn, UserPlus, Home,
  GraduationCap, MessageSquare, Heart, MapPin, Phone, Mail,
  User, ChevronDown
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import AuthDialog from '@/components/auth/AuthDialog';

/* ============================================================
   DESIGN TOKENS
   Warm, plum-black atmosphere · marigold primary · jade secondary
   · coral accent. Replaces the generic navy/blue "SaaS dark mode".
   ============================================================ */
const sora = Sora({ subsets: ['latin'], weight: ['600', '700', '800'], variable: '--font-display' });
const inter = Inter({ subsets: ['latin'], variable: '--font-body' });

// --bg-base:      #0B0912   deep plum-black
// --bg-mid:       #150F20   panel base
// --panel:        #1B1526   card surface
// --border:       #2A2438   hairline
// --accent:       #E8A33D   marigold (primary)
// --accent-dark:  #C97F1F
// --accent-light: #F2C879
// --teal:         #2FA88A   jade (success / positive)
// --teal-light:   #45C7A6
// --coral:        #E8735C   rare third accent
// --text:         #F5F0E8   warm white
// --text-dim:     #A79C8C   warm gray
// --text-mute:    #6B6358

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

// Animates a number from 0 up to `target` once `start` becomes true.
function useCountUp(target: number, start: boolean, duration = 1400) {
  const [value, setValue] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!start || startedRef.current) return;
    startedRef.current = true;
    const startTime = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
      setValue(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [start, target, duration]);

  return value;
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
  const [scrollY, setScrollY] = useState(0);
  const [heroGlow, setHeroGlow] = useState({ x: 50, y: 50 });
  const [viewportHeight, setViewportHeight] = useState(800);
  const [scrollProgress, setScrollProgress] = useState(0);
  const hasFetchedUser = useRef(false);
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});
  const rafRef = useRef<number | null>(null);

  // Cover intro dissolves as the user scrolls through it; the header
  // stays hidden until the cover is mostly scrolled past, then eases in.
  const coverProgress = Math.min(scrollY / (viewportHeight * 0.85 || 700), 1);
  const coverOpacity = Math.max(1 - coverProgress * 1.15, 0);
  const coverTranslate = scrollY * 0.35;
  const showHeader = coverProgress > 0.55;

  useEffect(() => {
    const updateViewport = () => setViewportHeight(window.innerHeight);
    updateViewport();
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  useEffect(() => {
    if (!user && !isLoading && !hasFetchedUser.current) {
      hasFetchedUser.current = true;
      fetchUser().catch(() => {
        console.log('User not authenticated');
      });
    }
  }, [user, isLoading, fetchUser]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
      setIsScrolled(window.scrollY > 50);
      setScrollY(window.scrollY);

      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0);

      const sections = ['cover', 'hero', 'features', 'ecosystem', 'testimonials'];
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

  // Subtle cursor-reactive glow for the hero only — light-touch interactivity
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

  const handleSignIn = () => { setAuthTab('login'); setShowAuthDialog(true); };
  const handleRegister = () => { setAuthTab('register'); setShowAuthDialog(true); };
  const handleDashboard = () => router.push('/dashboard/overview');

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
  const countersAnim = useScrollAnimation();
  const testimonialsAnim = useScrollAnimation();
  const contactAnim = useScrollAnimation();

  const coursesCount = useCountUp(24, countersAnim.isVisible);
  const studentsCount = useCountUp(156, countersAnim.isVisible);
  const tutorsCount = useCountUp(12, countersAnim.isVisible);
  const projectsCount = useCountUp(48, countersAnim.isVisible);

  return (
    <div className={`${sora.variable} ${inter.variable} min-h-screen bg-[#0B0912] text-[#F5F0E8] overflow-x-hidden font-sans relative`}>

      {/* ========== CONTINUOUS BACKGROUND ATMOSPHERE ==========
          One fixed layer behind every section: grain + drifting
          amber/teal blobs + a faint constellation field. This is
          what replaces the old per-section solid colors + hard
          divider lines, so the page reads as one place. */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-10%,#1B1526_0%,#0B0912_55%)]" />

        {/* drifting color blobs, tied to scroll for gentle parallax */}
        <div
          className="absolute w-[600px] h-[600px] rounded-full bg-[#E8A33D]/[0.07] blur-[130px] animate-drift-slow"
          style={{ top: '5%', left: '10%', transform: `translateY(${scrollY * 0.08}px)` }}
        />
        <div
          className="absolute w-[500px] h-[500px] rounded-full bg-[#2FA88A]/[0.06] blur-[120px] animate-drift-slower"
          style={{ top: '55%', right: '8%', transform: `translateY(${scrollY * -0.05}px)` }}
        />
        <div
          className="absolute w-[420px] h-[420px] rounded-full bg-[#E8735C]/[0.05] blur-[110px] animate-drift-slow"
          style={{ top: '110%', left: '30%', transform: `translateY(${scrollY * 0.06}px)` }}
        />
        <div
          className="absolute w-[480px] h-[480px] rounded-full bg-[#E8A33D]/[0.05] blur-[130px] animate-drift-slower"
          style={{ top: '160%', right: '15%', transform: `translateY(${scrollY * -0.04}px)` }}
        />

        {/* faint star / constellation field */}
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

        {/* grain overlay for texture, avoids the "flat gradient" look */}
        <svg className="absolute inset-0 w-full h-full mix-blend-overlay opacity-[0.05]">
          <filter id="grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#grain)" />
        </svg>
      </div>

      {/* ========== COVER INTRO ==========
          Full-screen title screen the visitor scrolls through. It sits
          in normal document flow (so scrolling it away is real scroll,
          not a fixed overlay hack) and dissolves + drifts upward as it
          goes, while the header stays hidden until it's mostly gone. */}
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
        <div className="inline-flex items-center gap-2 bg-[#E8A33D]/10 rounded-full px-4 py-1.5 border border-[#E8A33D]/20 mb-8 opacity-0 animate-cover-in" style={{ animationDelay: '0.1s' }}>
          <span className="w-2 h-2 bg-[#E8A33D] rounded-full animate-pulse" />
          <span className="text-[#F2C879] text-[10px] font-medium tracking-widest uppercase">Welcome to</span>
        </div>

        <h1
          className="text-5xl sm:text-7xl md:text-8xl font-bold leading-[1.05] tracking-tight"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          <span className="block opacity-0 animate-cover-in" style={{ animationDelay: '0.25s' }}>
            <span className="text-[#F5F0E8]">Freedom</span>
          </span>
          <span className="block opacity-0 animate-cover-in" style={{ animationDelay: '0.42s' }}>
            <span className="text-[#F5F0E8]">City</span>{' '}
            <span className="bg-gradient-to-r from-[#E8A33D] via-[#F2C879] to-[#E8735C] bg-clip-text text-transparent">Tech</span>
          </span>
          <span className="block opacity-0 animate-cover-in" style={{ animationDelay: '0.6s' }}>
            <span className="text-[#F5F0E8]">Center</span>
          </span>
        </h1>

        <p
          className="mt-8 text-[#A79C8C] text-sm sm:text-base max-w-md opacity-0 animate-cover-in"
          style={{ animationDelay: '0.8s' }}
        >
          Scroll to step inside the community — courses, mentors, and projects, all in one place.
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

        <p
          className="absolute bottom-6 sm:bottom-8 text-[10px] sm:text-xs text-[#6B6358] tracking-wide opacity-0 animate-cover-in"
          style={{ animationDelay: '1.15s' }}
        >
          Built by <span className="text-[#A79C8C] font-medium">Atbriz</span> · Software Engineering student, BYU–Idaho
        </p>
      </section>

      {/* ========== HEADER ========== */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        showHeader ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3 pointer-events-none'
      } ${
        isScrolled
          ? 'bg-[#0B0912]/90 backdrop-blur-xl shadow-2xl border-b border-[#2A2438]'
          : 'bg-transparent border-b border-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
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
                  Freedom City Tech
                </h1>
                <div className="flex items-center gap-1 sm:gap-2">
                  <span className="text-[#E8A33D] text-[8px] sm:text-[10px] md:text-xs font-medium tracking-wider uppercase">Selfless CE</span>
                  <span className="w-0.5 h-0.5 sm:w-1 sm:h-1 bg-[#2A2438] rounded-full" />
                  <span className="text-[#6B6358] text-[8px] sm:text-[10px] md:text-xs truncate">BYU University</span>
                </div>
              </div>
            </div>

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

            <div className="flex items-center gap-1 sm:gap-2 md:gap-3 flex-shrink-0">
              {isAuthenticated ? (
                <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
                  <div className="hidden sm:flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 bg-[#150F20] rounded-full border border-[#2A2438]">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 bg-gradient-to-br from-[#E8A33D] to-[#C97F1F] rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold text-[#0B0912] shadow-lg shadow-[#E8A33D]/20">
                      {user?.firstName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="text-[#F5F0E8] text-xs sm:text-sm font-medium hidden md:inline">{user?.firstName || 'User'}</span>
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
                {isAuthenticated && (
                  <div className="border-t border-[#2A2438] pt-2 mt-2">
                    <button
                      onClick={handleDashboard}
                      className="w-full flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-[#A79C8C] hover:text-[#F5F0E8] hover:bg-[#2A2438]/50 rounded-xl transition-all duration-300"
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
        {/* scroll progress bar */}
        <div
          className="h-[2px] bg-gradient-to-r from-[#E8A33D] via-[#F2C879] to-[#E8735C] transition-[width] duration-150 ease-out"
          style={{ width: `${scrollProgress * 100}%` }}
        />
      </header>

      {/* ========== HERO ========== */}
      <section
        id="hero"
        ref={(el) => { sectionRefs.current.hero = el; heroAnim.ref(el); }}
        onMouseMove={handleHeroMouseMove}
        className={`relative z-10 min-h-screen flex items-center pt-20 pb-10 overflow-hidden transition-all duration-1000 ${
          heroAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        {/* cursor-reactive glow — the one interactive flourish in the hero */}
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

        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full relative z-10 grid lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-[#E8A33D]/10 rounded-full px-4 py-1.5 border border-[#E8A33D]/20">
              <span className="w-2 h-2 bg-[#E8A33D] rounded-full animate-pulse" />
              <span className="text-[#F2C879] text-[10px] font-medium tracking-widest uppercase">Live · 156 students active</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.1]" style={{ fontFamily: 'var(--font-display)' }}>
              <span className="text-[#F5F0E8]/90">Build.</span><br />
              <span className="text-[#F5F0E8]/90">Learn.</span><br />
              <span className="text-[#F5F0E8]/90">Collaborate.</span><br />
              <span className="bg-gradient-to-r from-[#E8A33D] via-[#F2C879] to-[#E8735C] bg-clip-text text-transparent">Graduate.</span>
            </h1>
            <p className="text-[#A79C8C] text-base md:text-lg max-w-lg leading-relaxed">
              One intelligent platform for the entire Freedom City community. Real-time attendance, mentorship, projects & more.
            </p>
            <div className="flex flex-wrap gap-3">
              {isAuthenticated ? (
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
            <div className="flex flex-wrap gap-6 text-xs text-[#6B6358]">
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-[#E8A33D] rounded-full" /> 24+ Courses</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-[#2FA88A] rounded-full" /> 156 Students</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-[#E8735C] rounded-full" /> 94% Success</span>
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
              ✅ Assignment submitted
            </div>
            <div className="absolute top-1/2 -translate-y-1/2 -left-10 sm:left-0 bg-[#150F20]/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-[10px] sm:text-xs text-[#F5F0E8]/80 border border-[#E8735C]/20 shadow-xl">
              📊 Attendance 98%
            </div>
            <div className="absolute bottom-20 right-0 bg-[#150F20]/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-[10px] sm:text-xs text-[#F5F0E8]/80 border border-[#E8A33D]/20 shadow-xl">
              🤖 AI Assistant active
            </div>
          </div>
        </div>
      </section>

      {/* ========== FEATURES ========== */}
      <section
        id="features"
        ref={(el) => { sectionRefs.current.features = el; featuresAnim.ref(el); }}
        className={`relative z-10 py-20 transition-all duration-1000 delay-200 ${
          featuresAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <span className="text-[#E8A33D] text-xs font-semibold tracking-widest uppercase">✦ ecosystem features</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#F5F0E8]" style={{ fontFamily: 'var(--font-display)' }}>Everything connected.</h2>
              <p className="text-[#A79C8C]">Live attendance · course tracking · AI mentorship · community feed · all in one.</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#150F20]/50 backdrop-blur-sm p-4 rounded-xl border border-[#E8A33D]/10 hover:border-[#E8A33D]/30 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#E8A33D]/10">
                  <span className="text-2xl">📚</span>
                  <p className="text-sm font-medium mt-1 text-[#F5F0E8]">Course Mgmt</p>
                  <p className="text-[10px] text-[#A79C8C]">97% completion</p>
                </div>
                <div className="bg-[#150F20]/50 backdrop-blur-sm p-4 rounded-xl border border-[#E8A33D]/10 hover:border-[#E8A33D]/30 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#E8A33D]/10">
                  <span className="text-2xl">📅</span>
                  <p className="text-sm font-medium mt-1 text-[#F5F0E8]">Attendance</p>
                  <p className="text-[10px] text-[#A79C8C]">98% this month</p>
                </div>
              </div>
            </div>
            <div className="relative flex justify-center">
              <div className="w-64 h-64 bg-[#150F20]/50 backdrop-blur-sm rounded-3xl border border-[#E8A33D]/20 p-4 flex items-center justify-center hover:border-[#E8A33D]/40 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-[#E8A33D]/10">
                <div className="text-center">
                  <span className="text-6xl block">📊</span>
                  <p className="text-[#F5F0E8]/70 text-sm mt-2">Live dashboard</p>
                  <div className="flex gap-2 mt-2 text-xs text-[#A79C8C]">
                    <span>● 24 courses</span>
                    <span>● 156 students</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== STICKY STORYTELLING ========== */}
      <section
        ref={(el) => { storytellingAnim.ref(el); }}
        className={`relative z-10 py-20 border-t border-[#2A2438]/60 transition-all duration-1000 delay-300 ${
          storytellingAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full flex flex-col md:flex-row items-center gap-10">
          <div className="md:w-1/2 space-y-6">
            <span className="text-[#E8A33D] text-xs font-semibold tracking-widest uppercase">✦ journey</span>
            <div className="space-y-4 text-2xl sm:text-3xl font-bold text-[#F5F0E8]" style={{ fontFamily: 'var(--font-display)' }}>
              <p className="border-l-4 border-[#E8A33D] pl-4 transition-all duration-300 hover:pl-6 hover:border-l-8">Track Attendance</p>
              <p className="border-l-4 border-[#E8735C] pl-4 transition-all duration-300 hover:pl-6 hover:border-l-8">Manage Tuition</p>
              <p className="border-l-4 border-[#2FA88A] pl-4 transition-all duration-300 hover:pl-6 hover:border-l-8">Join Communities</p>
              <p className="border-l-4 border-[#F2C879] pl-4 transition-all duration-300 hover:pl-6 hover:border-l-8">Monitor Performance</p>
              <p className="border-l-4 border-[#E8A33D] pl-4 transition-all duration-300 hover:pl-6 hover:border-l-8">Graduate 🎓</p>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <div className="relative w-48 h-80 sm:w-56 sm:h-96 bg-[#150F20]/70 rounded-3xl border border-[#2A2438] shadow-2xl shadow-[#E8A33D]/10 p-3 flex items-center justify-center hover:shadow-[#E8A33D]/30 transition-all duration-500 hover:scale-105">
              <div className="w-full h-full bg-[#0B0912] rounded-2xl flex flex-col items-center justify-center gap-2 text-[#F5F0E8]/70 text-xs">
                <span className="text-3xl">📱</span>
                <span className="font-semibold text-[#F5F0E8]">Dashboard</span>
                <div className="w-3/4 h-1 bg-[#E8A33D]/30 rounded-full" />
                <div className="w-3/4 h-1 bg-[#E8A33D]/20 rounded-full" />
                <div className="w-1/2 h-1 bg-[#E8735C]/30 rounded-full" />
                <span className="text-[10px] text-[#A79C8C]">Attendance 98%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== ECOSYSTEM ========== */}
      <section
        id="ecosystem"
        ref={(el) => { sectionRefs.current.ecosystem = el; ecosystemAnim.ref(el); }}
        className={`relative z-10 py-20 border-t border-[#2A2438]/60 transition-all duration-1000 delay-400 ${
          ecosystemAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <span className="text-[#E8A33D] text-xs font-semibold tracking-widest uppercase">✦ live ecosystem</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#F5F0E8]" style={{ fontFamily: 'var(--font-display)' }}>Connected community</h2>
              <p className="text-[#A79C8C]">Mentors, students, tutors, projects — all linked in real time.</p>
              <div className="flex flex-wrap gap-3 text-sm">
                <span className="bg-[#150F20]/50 backdrop-blur-sm px-3 py-1 rounded-full border border-[#E8A33D]/20 hover:border-[#E8A33D]/50 transition-all duration-300 hover:scale-105">👨‍🏫 12 Mentors</span>
                <span className="bg-[#150F20]/50 backdrop-blur-sm px-3 py-1 rounded-full border border-[#E8735C]/20 hover:border-[#E8735C]/50 transition-all duration-300 hover:scale-105">👥 156 Students</span>
                <span className="bg-[#150F20]/50 backdrop-blur-sm px-3 py-1 rounded-full border border-[#2FA88A]/20 hover:border-[#2FA88A]/50 transition-all duration-300 hover:scale-105">📁 48 Projects</span>
              </div>
            </div>
            <div className="relative flex justify-center h-64">
              <svg viewBox="0 0 300 200" className="w-full max-w-xs">
                <circle cx="80" cy="100" r="24" fill="none" stroke="#E8A33D" strokeWidth="2" strokeDasharray="4 4" className="animate-pulse">
                  <animate attributeName="r" values="20;26;20" dur="3s" repeatCount="indefinite" />
                </circle>
                <circle cx="200" cy="60" r="20" fill="none" stroke="#F2C879" strokeWidth="2" strokeDasharray="4 4" className="animate-pulse">
                  <animate attributeName="r" values="16;22;16" dur="3.5s" repeatCount="indefinite" />
                </circle>
                <circle cx="220" cy="140" r="18" fill="none" stroke="#E8735C" strokeWidth="2" strokeDasharray="4 4" className="animate-pulse">
                  <animate attributeName="r" values="14;20;14" dur="4s" repeatCount="indefinite" />
                </circle>
                <circle cx="140" cy="160" r="22" fill="none" stroke="#2FA88A" strokeWidth="2" strokeDasharray="4 4" className="animate-pulse">
                  <animate attributeName="r" values="18;24;18" dur="3.8s" repeatCount="indefinite" />
                </circle>
                <line x1="80" y1="100" x2="200" y2="60" stroke="#E8A33D" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6">
                  <animate attributeName="stroke-dashoffset" from="0" to="100" dur="3s" repeatCount="indefinite" />
                </line>
                <line x1="80" y1="100" x2="220" y2="140" stroke="#E8A33D" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6">
                  <animate attributeName="stroke-dashoffset" from="0" to="100" dur="4s" repeatCount="indefinite" />
                </line>
                <line x1="200" y1="60" x2="140" y2="160" stroke="#F2C879" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6">
                  <animate attributeName="stroke-dashoffset" from="0" to="100" dur="3.5s" repeatCount="indefinite" />
                </line>
                <text x="70" y="105" fontSize="8" fill="#A79C8C">Student</text>
                <text x="190" y="65" fontSize="8" fill="#A79C8C">Mentor</text>
                <text x="210" y="145" fontSize="8" fill="#A79C8C">Tutor</text>
                <text x="130" y="165" fontSize="8" fill="#A79C8C">Projects</text>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* ========== ANIMATED COUNTERS ========== */}
      <section
        ref={(el) => { countersAnim.ref(el); }}
        className={`relative z-10 py-20 border-t border-[#2A2438]/60 transition-all duration-1000 delay-500 ${
          countersAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="text-[#E8A33D] text-xs font-semibold tracking-widest uppercase">✦ impact</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#F5F0E8] mt-2" style={{ fontFamily: 'var(--font-display)' }}>Numbers that move</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            <div
              className={`bg-[#150F20]/50 backdrop-blur-sm p-6 rounded-2xl border border-[#E8A33D]/10 text-center hover:border-[#E8A33D]/40 transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-[#E8A33D]/10 ${
                countersAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
              style={{ transitionDelay: countersAnim.isVisible ? '0ms' : '0ms' }}
            >
              <span className="text-4xl font-bold text-[#E8A33D]" style={{ fontFamily: 'var(--font-display)' }}>{coursesCount}</span>
              <p className="text-[#A79C8C] text-sm">Courses</p>
            </div>
            <div
              className={`bg-[#150F20]/50 backdrop-blur-sm p-6 rounded-2xl border border-[#E8A33D]/10 text-center hover:border-[#E8A33D]/40 transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-[#E8A33D]/10 ${
                countersAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
              style={{ transitionDelay: countersAnim.isVisible ? '100ms' : '0ms' }}
            >
              <span className="text-4xl font-bold text-[#F2C879]" style={{ fontFamily: 'var(--font-display)' }}>{studentsCount}</span>
              <p className="text-[#A79C8C] text-sm">Students</p>
            </div>
            <div
              className={`bg-[#150F20]/50 backdrop-blur-sm p-6 rounded-2xl border border-[#E8A33D]/10 text-center hover:border-[#E8A33D]/40 transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-[#E8A33D]/10 ${
                countersAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
              style={{ transitionDelay: countersAnim.isVisible ? '200ms' : '0ms' }}
            >
              <span className="text-4xl font-bold text-[#E8735C]" style={{ fontFamily: 'var(--font-display)' }}>{tutorsCount}</span>
              <p className="text-[#A79C8C] text-sm">Tutors</p>
            </div>
            <div
              className={`bg-[#150F20]/50 backdrop-blur-sm p-6 rounded-2xl border border-[#E8A33D]/10 text-center hover:border-[#E8A33D]/40 transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-[#E8A33D]/10 ${
                countersAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
              style={{ transitionDelay: countersAnim.isVisible ? '300ms' : '0ms' }}
            >
              <span className="text-4xl font-bold text-[#2FA88A]" style={{ fontFamily: 'var(--font-display)' }}>{projectsCount}</span>
              <p className="text-[#A79C8C] text-sm">Projects</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========== TESTIMONIALS ========== */}
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
            <h2 className="text-3xl sm:text-4xl font-bold text-[#F5F0E8] mt-2" style={{ fontFamily: 'var(--font-display)' }}>What students say</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div
              className={`bg-[#150F20]/50 backdrop-blur-sm p-6 rounded-2xl border border-[#E8A33D]/10 hover:border-[#E8A33D]/40 transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-[#E8A33D]/10 ${
                testimonialsAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
              style={{ transitionDelay: testimonialsAnim.isVisible ? '0ms' : '0ms' }}
            >
              <p className="text-[#A79C8C] text-sm">"Freedom City gave me mentorship and a community. I grew from student to mentor."</p>
              <p className="text-[#F5F0E8] font-semibold mt-3">— Aisha, CS</p>
            </div>
            <div
              className={`bg-[#150F20]/50 backdrop-blur-sm p-6 rounded-2xl border border-[#E8A33D]/10 hover:border-[#E8A33D]/40 transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-[#E8A33D]/10 ${
                testimonialsAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
              style={{ transitionDelay: testimonialsAnim.isVisible ? '150ms' : '0ms' }}
            >
              <p className="text-[#A79C8C] text-sm">"The live dashboard and attendance tracking helped me stay on top of everything."</p>
              <p className="text-[#F5F0E8] font-semibold mt-3">— James, Engineering</p>
            </div>
            <div
              className={`bg-[#150F20]/50 backdrop-blur-sm p-6 rounded-2xl border border-[#E8A33D]/10 hover:border-[#E8A33D]/40 transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-[#E8A33D]/10 ${
                testimonialsAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
              style={{ transitionDelay: testimonialsAnim.isVisible ? '300ms' : '0ms' }}
            >
              <p className="text-[#A79C8C] text-sm">"I landed my first internship through the ecosystem. It's more than a school."</p>
              <p className="text-[#F5F0E8] font-semibold mt-3">— Grace, Design</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========== CONTACT ========== */}
      <section
        ref={(el) => { contactAnim.ref(el); }}
        className={`relative z-10 py-20 border-t border-[#2A2438]/60 transition-all duration-1000 delay-700 ${
          contactAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid md:grid-cols-2 gap-10">
          <div>
            <span className="text-[#E8A33D] text-xs font-semibold tracking-widest uppercase">✦ connect</span>
            <h2 className="text-3xl font-bold text-[#F5F0E8] mt-2" style={{ fontFamily: 'var(--font-display)' }}>Get in touch</h2>
            <div className="space-y-4 mt-6 text-[#A79C8C]">
              <p className="hover:text-[#F5F0E8] transition-colors duration-300"><span className="inline-block w-8">📍</span> Namasuba, Stella, Kabowa, Kampala</p>
              <p className="hover:text-[#F5F0E8] transition-colors duration-300"><span className="inline-block w-8">📞</span> 0761996296</p>
              <p className="hover:text-[#F5F0E8] transition-colors duration-300"><span className="inline-block w-8">✉️</span> turyamurebanicholus@gmail.com</p>
              <div className="flex gap-4 mt-4">
                <span className="bg-[#150F20]/50 backdrop-blur-sm px-3 py-1 rounded-full text-xs border border-[#E8A33D]/20 hover:border-[#E8A33D]/60 transition-all duration-300 hover:scale-105 cursor-pointer">WhatsApp</span>
                <span className="bg-[#150F20]/50 backdrop-blur-sm px-3 py-1 rounded-full text-xs border border-[#E8A33D]/20 hover:border-[#E8A33D]/60 transition-all duration-300 hover:scale-105 cursor-pointer">Email</span>
                <span className="bg-[#150F20]/50 backdrop-blur-sm px-3 py-1 rounded-full text-xs border border-[#E8A33D]/20 hover:border-[#E8A33D]/60 transition-all duration-300 hover:scale-105 cursor-pointer">Office Hours</span>
              </div>
            </div>
          </div>
          <div className="h-64 rounded-2xl overflow-hidden border border-[#2A2438] bg-[#150F20] hover:border-[#E8A33D]/30 transition-all duration-500 hover:shadow-xl hover:shadow-[#E8A33D]/10">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31918.08877867205!2d32.525365583003335!3d0.3068647019174247!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x177dbb06c47502b1%3A0xaf67246fe5cb34bb!2sFreedom%20city!5e0!3m2!1sen!2sug!4v1782328514193!5m2!1sen!2sug&output=embed&z=15"
              className="w-full h-full"
              style={{ border: 0 }}
              loading="lazy"
              title="Location Map"
            />
          </div>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="relative z-10 border-t border-[#2A2438]/60 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-2 sm:grid-cols-4 gap-8 text-sm">
          <div>
            <h4 className="text-[#F5F0E8] font-semibold mb-2">Freedom City</h4>
            <p className="text-[#6B6358] text-xs">Selfless CE · BYU</p>
          </div>
          <div>
            <h4 className="text-[#F5F0E8] font-semibold mb-2">Products</h4>
            <ul className="text-[#6B6358] text-xs space-y-1">
              <li className="hover:text-[#F5F0E8] transition-colors duration-300 cursor-pointer">Courses</li>
              <li className="hover:text-[#F5F0E8] transition-colors duration-300 cursor-pointer">Mentorship</li>
              <li className="hover:text-[#F5F0E8] transition-colors duration-300 cursor-pointer">Dashboard</li>
            </ul>
          </div>
          <div>
            <h4 className="text-[#F5F0E8] font-semibold mb-2">Community</h4>
            <ul className="text-[#6B6358] text-xs space-y-1">
              <li className="hover:text-[#F5F0E8] transition-colors duration-300 cursor-pointer">Students</li>
              <li className="hover:text-[#F5F0E8] transition-colors duration-300 cursor-pointer">Alumni</li>
              <li className="hover:text-[#F5F0E8] transition-colors duration-300 cursor-pointer">Events</li>
            </ul>
          </div>
          <div>
            <h4 className="text-[#F5F0E8] font-semibold mb-2">Support</h4>
            <ul className="text-[#6B6358] text-xs space-y-1">
              <li className="hover:text-[#F5F0E8] transition-colors duration-300 cursor-pointer">FAQ</li>
              <li className="hover:text-[#F5F0E8] transition-colors duration-300 cursor-pointer">Contact</li>
              <li className="hover:text-[#F5F0E8] transition-colors duration-300 cursor-pointer">Newsletter</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-8 pt-6 border-t border-[#2A2438]/60 flex flex-col sm:flex-row justify-between text-xs text-[#6B6358]">
          <p>© 2026 Freedom City Tech · Developed by Nicholus Turyamureba</p>
          <p>Powered by Tech Rise Africa</p>
        </div>
      </footer>

      {/* ========== SCROLL TO TOP ========== */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-[999] w-12 h-12 bg-gradient-to-r from-[#E8A33D] to-[#C97F1F] rounded-full shadow-2xl shadow-[#E8A33D]/30 flex items-center justify-center text-[#0B0912] hover:scale-110 transition-all duration-300 hover:shadow-[#E8A33D]/60"
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
        .animate-float { animation: float 6s ease-in-out infinite; }

        @keyframes drift-slow {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -20px) scale(1.08); }
        }
        @keyframes drift-slower {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-25px, 25px) scale(1.05); }
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

        @media (prefers-reduced-motion: reduce) {
          .animate-float, .animate-drift-slow, .animate-drift-slower,
          .animate-twinkle, .animate-twinkle-delay,
          .animate-cover-in, .animate-scroll-cue { animation: none; opacity: 1; }
        }
      `}</style>
    </div>
  );
}