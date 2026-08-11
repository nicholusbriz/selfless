import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import {
  GraduationCap,
  BookOpen,
  ArrowRight,
  Bell,
  Building2,
  Users,
  MessageSquare,
  Calendar,
  Award,
  Clock,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import AuthModal from '@/components/auth/AuthModal';

export default function CoverContent() {
  const containerRef = useRef<HTMLDivElement>(null);
  const tvRef = useRef<HTMLDivElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  
  // Content refs for animation
  const headerRef = useRef<HTMLDivElement>(null);
  const title1Ref = useRef<HTMLHeadingElement>(null);
  const title2Ref = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  const [techCenterIndex, setTechCenterIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [activityIndex, setActivityIndex] = useState(0);
  const [infoIndex, setInfoIndex] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalType, setAuthModalType] = useState<'login' | 'register'>('login');

  const { isAuthenticated } = useAuth();
  const dynamicColor = '#E8A33D';

  const activities = [
    '📚 Register for Courses',
    '📊 Track Academic Progress',
    '🎓 View Your Grades',
    '🏆 Check GPA & Credits',
    '📅 Manage Your Schedule',
    '📬 Read Announcements',
    '💬 Chat with AI Assistant',
    '👥 Connect with Students',
    '📢 Create Announcements',
    '🧹 Register for Cleaning Day',
    '⚽ Join Football Team',
    '🏐 Join Volleyball Team',
    '🏀 Join Netball Team',
    '🏃 Join Athletics Team',
    '💼 Find Internships',
    '✈️ Register for Temple Trips',
    '🔔 Check Notifications',
    '👤 Update Your Profile',
    '⚙️ Manage Settings',
    '📖 Access Course Materials',
    '✅ Submit Assignments',
    '📝 Track Attendance',
    '🎯 Set Academic Goals',
    '🤝 Join Study Groups',
    '📈 View Performance Analytics',
    '🌐 Access Tech Center Network',
    '🏅 View Achievements',
    '📚 Browse Course Catalog',
    '🎓 Academic Excellence Portal'
  ];

  const portalInfoItems = [
    {
      title: 'Why This Portal Exists',
      content: 'Centralizes academic tools, tracks progress, and connects students across Tech Centers.'
    },
    {
      title: 'Course Management',
      content: 'Register for courses, track academic progress, and manage your entire academic journey.'
    },
    {
      title: 'Tech Center Network',
      content: 'Connect with students across FreedomCity, Jinja, Mbale, and other Selfless Tech Centers.'
    },
    {
      title: 'Real-Time Analytics',
      content: 'Monitor your GPA, credits, attendance, and academic performance with live updates.'
    },
    {
      title: '24/7 Access',
      content: 'Access your portal anytime, anywhere from any device - desktop, tablet, or mobile.'
    },
    {
      title: 'AI-Powered Support',
      content: 'Chat with AI assistant for instant help with courses, assignments, and portal navigation.'
    },
    {
      title: 'Secure & Private',
      content: 'Your academic records and personal information are securely managed with enterprise-grade security.'
    },
    {
      title: 'Global Community',
      content: 'Join study groups, participate in discussions, and collaborate with students across the network.'
    },
    {
      title: 'Achievement Tracking',
      content: 'Earn badges, track milestones, and celebrate your academic accomplishments.'
    },
    {
      title: 'Smart Notifications',
      content: 'Stay updated with real-time alerts for assignments, announcements, and important deadlines.'
    }
  ];

  // Typing animation effect
  useEffect(() => {
    const techCenters = [
      'FreedomCity Tech Center',
      'Jinja Tech Center',
      'Mbale Tech Center',
      'Sseta Tech Center',
      'Masaka Tech Center',
      'Lira Tech Center',
      'Ntinda Tech Center'
    ];

    const currentTechCenter = techCenters[techCenterIndex];
    const typingSpeed = 100;
    const deletingSpeed = 50;
    const pauseAfterType = 2000;

    const timeout = setTimeout(() => {
      if (!isDeleting && displayText === currentTechCenter) {
        setTimeout(() => setIsDeleting(true), pauseAfterType);
      } else if (isDeleting && displayText === '') {
        setIsDeleting(false);
        setTechCenterIndex((prev) => (prev + 1) % techCenters.length);
      } else {
        setDisplayText((prev) => {
          if (isDeleting) {
            return prev.slice(0, -1);
          } else {
            return currentTechCenter.slice(0, prev.length + 1);
          }
        });
      }
    }, isDeleting ? deletingSpeed : typingSpeed);

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, techCenterIndex]);

  const openAuthModal = (type: 'login' | 'register') => {
    setAuthModalType(type);
    setShowAuthModal(true);
  };

  // Activity scrolling animation
  useEffect(() => {
    const interval = setInterval(() => {
      setActivityIndex((prev) => (prev + 1) % activities.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [activities.length]);

  // Portal info scrolling animation
  useEffect(() => {
    const interval = setInterval(() => {
      setInfoIndex((prev) => (prev + 1) % portalInfoItems.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [portalInfoItems.length]);

  // Main animation - TV stays fixed
  useEffect(() => {
    const ctx = gsap.context(() => {
      // TV remains fixed, only content inside animates
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 3 });

      // 1. Content fade-in sequence (0-2s)
      tl.fromTo(
        [headerRef.current, title1Ref.current, title2Ref.current, descRef.current, ctaRef.current, sidebarRef.current],
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, stagger: 0.2, ease: 'power3.out' }
      )
      // 2. Screen glow pulse (2-4s)
      .to(screenRef.current, {
        boxShadow: `0 0 60px ${dynamicColor}40, inset 0 0 60px ${dynamicColor}15`,
        duration: 1.5,
        ease: 'power2.inOut'
      })
      .to(screenRef.current, {
        boxShadow: '0 0 20px rgba(0,0,0,0.5), inset 0 0 30px rgba(0,0,0,0.3)',
        duration: 1.5,
        ease: 'power2.inOut'
      })
      // 3. Content subtle lift (4-5.5s)
      .to([title1Ref.current, title2Ref.current], {
        y: -5,
        duration: 0.8,
        ease: 'power2.inOut'
      })
      .to([title1Ref.current, title2Ref.current], {
        y: 0,
        duration: 0.8,
        ease: 'power2.inOut'
      })
      // 4. Tech center text pulse (5.5-7s)
      .to('.tech-center-text', {
        color: dynamicColor,
        scale: 1.05,
        duration: 0.6,
        ease: 'power2.inOut'
      })
      .to('.tech-center-text', {
        color: '#ffffff',
        scale: 1,
        duration: 0.6,
        ease: 'power2.inOut'
      })
      // 5. Final content settle (7-8s)
      .to([headerRef.current, title1Ref.current, title2Ref.current, descRef.current, ctaRef.current], {
        opacity: 0.95,
        duration: 0.6,
        ease: 'power2.inOut'
      })
      .to([headerRef.current, title1Ref.current, title2Ref.current, descRef.current, ctaRef.current], {
        opacity: 1,
        duration: 0.6,
        ease: 'power2.inOut'
      });
    }, containerRef);

    return () => ctx.revert();
  }, [dynamicColor]);

  return (
    <div
      ref={containerRef}
      className="relative w-full min-h-screen bg-[#0D1117] text-white overflow-x-hidden flex items-center justify-center py-12 sm:py-16 px-4 sm:px-6 lg:px-8"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04] mix-blend-overlay" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
      }} />

      {/* Vignette effect */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: `radial-gradient(ellipse at center, transparent 0%, rgba(13, 17, 23, 0.8) 100%)`
      }} />

      {/* Main gradient background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30 blur-3xl"
        style={{
          background: `radial-gradient(circle at 30% 40%, ${dynamicColor}20, transparent 50%), radial-gradient(circle at 70% 60%, ${dynamicColor}15, transparent 50%)`
        }}
      />

      {/* Floating orbs */}
      <div
        className="absolute top-1/5 left-1/5 w-96 h-96 rounded-full blur-3xl opacity-15 animate-float pointer-events-none"
        style={{ backgroundColor: dynamicColor }}
      />
      <div
        className="absolute bottom-1/4 right-1/5 w-[28rem] h-[28rem] rounded-full blur-3xl opacity-10 animate-float pointer-events-none"
        style={{ backgroundColor: dynamicColor, animationDelay: '2s' }}
      />

      {/* TV Container - Full component */}
      <div className="relative w-full max-w-7xl mx-auto flex items-center">
        <div
          ref={tvRef}
          className="w-full relative"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* TV Body with Frame */}
          <div
            ref={screenRef}
            className="w-full bg-[#1a1610] rounded-3xl border-4 border-[#E8A33D]/50 shadow-2xl p-4 sm:p-6 lg:p-8 lg:aspect-video transition-all duration-500"
            style={{
              backgroundImage: `
                linear-gradient(135deg, rgba(232, 163, 61, 0.08) 0%, transparent 50%),
                url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='paperNoise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23paperNoise)' opacity='0.08'/%3E%3C/svg%3E")
              `,
              backgroundSize: 'cover, 400px 400px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(232, 163, 61, 0.1)'
            }}
          >
            {/* TV Stand - Hidden on mobile */}
            <div className="hidden lg:block absolute -bottom-10 left-1/2 transform -translate-x-1/2 w-24 h-12 bg-[#1a1610] border-2 border-[#E8A33D]/40 rounded-b-lg" style={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)' }} />
            <div className="hidden lg:block absolute -bottom-12 left-1/2 transform -translate-x-1/2 w-48 h-3 bg-[#1a1610] border-2 border-[#E8A33D]/40 rounded-full" style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }} />
            
            {/* TV Screen Content */}
            <div className="w-full rounded-xl bg-[#0f0c08] border-2 border-[#E8A33D]/30 overflow-hidden p-4 sm:p-5 lg:p-10" style={{
              backgroundImage: `linear-gradient(180deg, rgba(232, 163, 61, 0.03) 0%, transparent 100%)`
            }}>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-10">
                
                {/* Left Column - Main Content */}
                <div className="lg:col-span-8 space-y-5 sm:space-y-8">
                  {/* Header */}
                  <div ref={headerRef} className="flex items-center gap-3 sm:gap-4 pb-4 border-b border-[#E8A33D]/30">
                    <GraduationCap className="w-6 h-6 sm:w-9 sm:h-9" style={{ color: dynamicColor }} />
                    <span className="text-sm sm:text-xl font-bold text-white tracking-wide">Student Self Service Portal</span>
                  </div>

                  {/* Main Headings */}
                  <div className="space-y-3 sm:space-y-4">
                    <h1 ref={title1Ref} className="text-2xl sm:text-4xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight" style={{ letterSpacing: '-0.02em' }}>
                      Student Self Service Portal
                    </h1>
                    <h1
                      ref={title2Ref}
                      className="text-2xl sm:text-4xl lg:text-6xl font-extrabold tracking-tight leading-tight"
                      style={{
                        background: `linear-gradient(135deg, #ffffff, ${dynamicColor})`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        letterSpacing: '-0.02em'
                      }}
                    >
                      All Education In One Place
                    </h1>
                  </div>

                  {/* Description */}
                  <p ref={descRef} className="text-sm sm:text-base lg:text-xl text-[#A79C8C] max-w-2xl leading-relaxed" style={{ lineHeight: '1.8' }}>
                    Your centralized platform for managing BYU-Idaho courses, tracking academic progress, 
                    receiving tutor feedback, and connecting across the Selfless Tech Center Network.
                  </p>

                  {/* Action Buttons */}
                  <div ref={ctaRef} className="flex flex-col sm:flex-wrap sm:flex-row items-center gap-4 sm:gap-5 pt-4">
                    {isAuthenticated ? (
                      <>
                        <Link
                          href="/dashboard"
                          className="w-full sm:w-auto px-6 py-4 sm:px-8 sm:py-4 rounded-xl font-semibold text-white flex items-center justify-center sm:justify-start gap-3 transition-all transform hover:-translate-y-1 active:translate-y-0 text-sm sm:text-base"
                          style={{ 
                            backgroundColor: dynamicColor,
                            boxShadow: `0 4px 14px ${dynamicColor}40, 0 2px 4px rgba(0,0,0,0.2)`
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.boxShadow = `0 6px 20px ${dynamicColor}60, 0 4px 8px rgba(0,0,0,0.3)`
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.boxShadow = `0 4px 14px ${dynamicColor}40, 0 2px 4px rgba(0,0,0,0.2)`
                          }}
                        >
                          <span>Go to Dashboard</span>
                          <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link
                          href="/dashboard/courses"
                          className="w-full sm:w-auto px-6 py-4 sm:px-8 sm:py-4 rounded-xl font-semibold text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-sm sm:text-base"
                          style={{ backdropFilter: 'blur(10px)' }}
                        >
                          Course Catalog
                        </Link>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => openAuthModal('login')}
                          className="w-full sm:w-auto px-6 py-4 sm:px-8 sm:py-4 rounded-xl font-semibold text-white flex items-center justify-center sm:justify-start gap-3 transition-all transform hover:-translate-y-1 active:translate-y-0 text-sm sm:text-base"
                          style={{ 
                            backgroundColor: dynamicColor,
                            boxShadow: `0 4px 14px ${dynamicColor}40, 0 2px 4px rgba(0,0,0,0.2)`
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.boxShadow = `0 6px 20px ${dynamicColor}60, 0 4px 8px rgba(0,0,0,0.3)`
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.boxShadow = `0 4px 14px ${dynamicColor}40, 0 2px 4px rgba(0,0,0,0.2)`
                          }}
                        >
                          <span>Access Portal</span>
                          <ArrowRight className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => openAuthModal('register')}
                          className="w-full sm:w-auto px-6 py-4 sm:px-8 sm:py-4 rounded-xl font-semibold text-slate-300 bg-[#E8A33D]/10 hover:bg-[#E8A33D]/20 border border-[#E8A33D]/30 transition-all text-sm sm:text-base"
                          style={{ backdropFilter: 'blur(10px)' }}
                        >
                          Get Started
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Right Column - Sidebar */}
                <div ref={sidebarRef} className="lg:col-span-4 space-y-4 sm:space-y-5">
                  {/* Tech Center Animation */}
                  <div className="p-4 sm:p-5 rounded-xl bg-[#E8A33D]/5 border border-[#E8A33D]/30 text-center space-y-3 transition-all hover:border-[#E8A33D]/50">
                    <p className="text-[10px] sm:text-xs uppercase tracking-widest text-[#6B6358]">Current Location</p>
                    <div className="flex items-center justify-center gap-2">
                      <Building2 className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 animate-pulse" style={{ color: dynamicColor }} />
                      <span className="tech-center-text text-xs sm:text-base lg:text-lg font-bold text-white">
                        {displayText}
                      </span>
                      <span className="animate-pulse text-white text-xs sm:text-base lg:text-lg">|</span>
                    </div>
                  </div>

                  {/* Scrolling Activities */}
                  <div className="p-4 sm:p-5 rounded-xl bg-[#E8A33D]/5 border border-[#E8A33D]/30 text-center space-y-3 transition-all hover:border-[#E8A33D]/50">
                    <p className="text-[10px] sm:text-xs uppercase tracking-widest text-[#6B6358]">Quick Actions</p>
                    <div className="h-16 sm:h-28 overflow-hidden relative">
                      <div
                        className="transition-transform duration-700 ease-in-out"
                        style={{ transform: `translateY(-${activityIndex * 32}px)` }}
                      >
                        {activities.map((activity, index) => (
                          <div
                            key={index}
                            className="h-8 flex items-center justify-center text-[10px] sm:text-xs font-semibold transition-all hover:scale-105"
                            style={{ color: dynamicColor }}
                          >
                            {activity}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Scrolling Portal Info */}
                  <div className="p-4 sm:p-5 rounded-xl bg-[#E8A33D]/5 border border-[#E8A33D]/30 text-center space-y-3 transition-all hover:border-[#E8A33D]/50">
                    <p className="text-[10px] sm:text-xs uppercase tracking-widest text-[#6B6358]">Portal Features</p>
                    <div className="h-28 sm:h-36 overflow-hidden relative">
                      <div
                        className="transition-all duration-700 ease-in-out"
                        style={{ transform: `translateY(-${infoIndex * 44}px)` }}
                      >
                        {portalInfoItems.map((item, index) => (
                          <div
                            key={index}
                            className="h-11 flex flex-col items-center justify-center px-3 transition-all hover:scale-105"
                          >
                            <p className="text-[10px] sm:text-xs font-bold text-white mb-1">{item.title}</p>
                            <p className="text-[9px] sm:text-[11px] text-gray-400 leading-tight text-center">{item.content}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultType={authModalType}
      />
    </div>
  );
}