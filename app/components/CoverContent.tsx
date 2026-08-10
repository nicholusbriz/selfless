import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import {
  GraduationCap,
  BookOpen,
  ArrowRight,
  Bell,
  Building2
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import AuthModal from '@/components/auth/AuthModal';

export default function CoverContent() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  const title1Ref = useRef<HTMLHeadingElement>(null);
  const title2Ref = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const techCenterTextRef = useRef<HTMLSpanElement>(null);

  const [techCenterIndex, setTechCenterIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [activityIndex, setActivityIndex] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalType, setAuthModalType] = useState<'login' | 'register'>('login');

  const { isAuthenticated } = useAuth();

  const dynamicColor = '#E8A33D';

  const activities = [
    'Submit Courses',
    'Submit Credits',
    'Track Your Grades',
    'Are You Taking Religion Course',
    'Join Football Team',
    'Join Volleyball Team',
    'Join Netball Team',
    'Join Athletics Team',
    'Chat with Atbriz AI Assistant',
    'Connect with Students',
    'Message Your Fellow Students',
    'Create Global and Tech Center annoucements',
    'Register for Cleaning Day',
    'Find Internships',
    'Register for Trips',
    'All in one intelligent portal'
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
        // Finished typing, pause then delete
        setTimeout(() => setIsDeleting(true), pauseAfterType);
      } else if (isDeleting && displayText === '') {
        // Finished deleting, move to next tech center
        setIsDeleting(false);
        setTechCenterIndex((prev) => (prev + 1) % techCenters.length);
      } else {
        // Continue typing or deleting
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
    }, 2500); // Change every 2.5 seconds

    return () => clearInterval(interval);
  }, [activities.length]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Extended 20-second animation timeline
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 3 });

      // 1. Initial Card Tilt & Lift (0-2s)
      tl.fromTo(
        cardRef.current,
        {
          rotateX: 25,
          rotateY: -10,
          scale: 0.85,
          y: 80,
          opacity: 0,
        },
        {
          rotateX: 0,
          rotateY: 0,
          scale: 1,
          y: 0,
          opacity: 1,
          duration: 1.5,
          ease: 'power3.out',
        }
      )
        // 2. Parallax Phone Screen (2-3.5s)
        .fromTo(
          phoneRef.current,
          { y: 60, rotateZ: -5, opacity: 0 },
          { y: -15, rotateZ: 0, opacity: 1, duration: 1, ease: 'back.out(1.4)' },
          '-=0.8'
        )
        // 3. Text & CTA Reveals (3.5-5s)
        .fromTo(
          [title1Ref.current, title2Ref.current, descRef.current, ctaRef.current],
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: 'power2.out' },
          '-=0.6'
        )
        // 4. Phone content animation - Course progress (5-7s)
        .to(phoneRef.current, { y: -25, duration: 1, ease: 'power2.inOut' }, '+=0.5')
        // 5. Card subtle rotation (7-9s)
        .to(cardRef.current, { rotateY: 5, rotateX: -2, duration: 1.5, ease: 'power2.inOut' })
        .to(cardRef.current, { rotateY: -5, rotateX: 2, duration: 1.5, ease: 'power2.inOut' })
        .to(cardRef.current, { rotateY: 0, rotateX: 0, duration: 0.5, ease: 'power2.inOut' })
        // 6. Phone return to center (9-10s)
        .to(phoneRef.current, { y: -15, duration: 0.8, ease: 'power2.inOut' })
        // 7. Scale up phone for focus (10-12s)
        .to(phoneRef.current, { scale: 1.1, duration: 1, ease: 'power2.inOut' })
        .to(phoneRef.current, { scale: 1, duration: 1, ease: 'power2.inOut' })
        // 8. Card glow effect (14-16s)
        .to(cardRef.current, { boxShadow: `0 0 60px ${dynamicColor}40`, duration: 1, ease: 'power2.inOut' })
        .to(cardRef.current, { boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', duration: 1, ease: 'power2.inOut' })
        // 9. Final settle (16-18s)
        .to([title1Ref.current, title2Ref.current], { y: -5, duration: 0.5, ease: 'power2.inOut' })
        .to([title1Ref.current, title2Ref.current], { y: 0, duration: 0.5, ease: 'power2.inOut' })
        // 10. Fade out for repeat (18-20s)
        .to(cardRef.current, { opacity: 0.8, scale: 0.95, duration: 1, ease: 'power2.inOut' })
        .to(cardRef.current, { opacity: 1, scale: 1, duration: 1, ease: 'power2.inOut' });
    }, containerRef);

    return () => ctx.revert();
  }, [dynamicColor]);

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen w-full bg-[#0D1117] text-white overflow-hidden flex items-center justify-center py-10 px-4 sm:px-6"
    >
      {/* Noise Texture Overlay for organic feel */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
      }} />

      {/* Radial Ambient Glow */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20 blur-3xl"
        style={{
          background: `radial-gradient(circle at 50% 30%, ${dynamicColor}, transparent 70%)`
        }}
      />

      {/* Subtle grid pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02]" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
        backgroundSize: '50px 50px'
      }} />

      {/* Floating background orbs */}
      <div
        className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full blur-3xl opacity-10 animate-float pointer-events-none"
        style={{ backgroundColor: dynamicColor }}
      />
      <div
        className="absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-[0.07] animate-float pointer-events-none"
        style={{ backgroundColor: dynamicColor, animationDelay: '1s' }}
      />
      <div
        className="absolute top-2/3 left-1/2 w-64 h-64 rounded-full blur-3xl opacity-[0.05] animate-float pointer-events-none"
        style={{ backgroundColor: dynamicColor, animationDelay: '2s' }}
      />

      {/* Hero Container */}
      <div className="relative max-w-6xl w-full mx-auto flex flex-col items-center z-10">

        {/* Main 3D Card Glass Structure */}
        <div
          ref={cardRef}
          style={{ transformStyle: 'preserve-3d' }}
          className="relative w-full rounded-3xl border border-white/10 bg-[#0D1117]/60 backdrop-blur-xl p-6 sm:p-10 shadow-2xl transition-all duration-300"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

            {/* Left Content Side */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <div className="space-y-2">
                <h1 ref={title1Ref} className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white">
                  Student Self Service Portal
                </h1>
                <h1
                  ref={title2Ref}
                  className="text-4xl sm:text-6xl font-extrabold tracking-tight"
                  style={{
                    background: `linear-gradient(135deg, #ffffff, ${dynamicColor})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  All Education In One Place
                </h1>
              </div>

              <p ref={descRef} className="text-base sm:text-lg text-[#A79C8C] max-w-xl">
                Your centralized platform for managing BYU-Idaho courses, tracking academic progress, 
                receiving tutor feedback, and connecting across the Selfless Tech Center Network.
              </p>

              {/* Trust pills */}
              <div className="flex flex-wrap items-center gap-2">
                {['Free to use', 'Real-time tracking', 'AI-Powered'].map((label) => (
                  <span
                    key={label}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-[#A79C8C]"
                  >
                    <span style={{ color: dynamicColor }}>✓</span>
                    {label}
                  </span>
                ))}
              </div>

              {/* Action Buttons */}
              <div ref={ctaRef} className="flex flex-wrap items-center gap-4 pt-2">
                {isAuthenticated ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="px-6 py-3.5 rounded-xl font-semibold text-white flex items-center gap-2 shadow-lg hover:opacity-90 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                      style={{ backgroundColor: dynamicColor }}
                    >
                      <span>Go to Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      href="/dashboard/courses"
                      className="px-6 py-3.5 rounded-xl font-semibold text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                    >
                      Course Catalog
                    </Link>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => openAuthModal('login')}
                      className="px-6 py-3.5 rounded-xl font-semibold text-white flex items-center gap-2 shadow-lg hover:opacity-90 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                      style={{ backgroundColor: dynamicColor }}
                    >
                      <span>Access Portal</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openAuthModal('register')}
                      className="px-6 py-3.5 rounded-xl font-semibold text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                    >
                      Get Started
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Right Side 3D Device Showcase */}
            <div className="flex lg:col-span-6 relative justify-center items-center">

              {/* Mockup Phone Frame - Larger size */}
              <div
                ref={phoneRef}
                className="w-full max-w-[320px] sm:max-w-[380px] rounded-[36px] bg-[#0B0912] p-3 border-4 border-[#2A2438] shadow-2xl relative z-10"
              >
                <div className="w-full rounded-[28px] bg-[#150F20] border border-white/5 overflow-hidden p-6 space-y-4">

                  {/* Phone Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-white/5">
                    <div className="flex items-center gap-3">
                      <GraduationCap className="w-6 h-6" style={{ color: dynamicColor }} />
                      <span className="text-sm font-bold text-white">Tech Centers</span>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400">Network</span>
                  </div>

                  {/* Typing Tech Center Animation */}
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center space-y-2">
                    <p className="text-xs uppercase tracking-wider text-[#6B6358]">Current Location</p>
                    <div className="flex items-center justify-center gap-2">
                      <Building2 className="w-5 h-5 flex-shrink-0" style={{ color: dynamicColor }} />
                      <span ref={techCenterTextRef} className="text-lg font-bold text-white">
                        {displayText}
                      </span>
                      <span className="animate-pulse text-white text-lg">|</span>
                    </div>
                  </div>

                  {/* Mini grade/credits card */}
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 flex-shrink-0" style={{ color: dynamicColor }} />
                      <span className="text-xs text-[#6B6358]">Academic Progress</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/10">
                      <div
                        className="h-1.5 rounded-full"
                        style={{ width: '72%', backgroundColor: dynamicColor }}
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-[#A79C8C]">Credits: 24/30</span>
                      <span className="text-xs text-[#A79C8C]">GPA: 3.8</span>
                    </div>
                  </div>

                  {/* Notification row */}
                  <div className="flex justify-between items-center px-3 py-2 rounded-lg bg-white/5 border border-white/5">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4" style={{ color: dynamicColor }} />
                      <span className="text-xs text-[#A79C8C]">3 new announcements</span>
                    </div>
                    <span
                      className="text-white text-[10px] rounded-full px-1.5 py-0.5 font-semibold"
                      style={{ backgroundColor: dynamicColor }}
                    >
                      3
                    </span>
                  </div>

                  {/* Scrolling Activities Animation */}
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center space-y-2">
                    <p className="text-xs uppercase tracking-wider text-[#6B6358]">Quick Actions</p>
                    <div className="h-10 overflow-hidden relative">
                      <div
                        className="transition-transform duration-500 ease-in-out"
                        style={{ transform: `translateY(-${activityIndex * 40}px)` }}
                      >
                        {activities.map((activity, index) => (
                          <div
                            key={index}
                            className="h-10 flex items-center justify-center text-sm font-semibold"
                            style={{ color: dynamicColor }}
                          >
                            {activity}
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

        {/* Scroll indicator */}
        <div className="mt-10 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-xs text-slate-500 tracking-widest uppercase">Scroll</span>
          <svg width="16" height="24" viewBox="0 0 16 24" fill="none" className="opacity-40">
            <path d="M8 0v20M1 13l7 7 7-7" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          defaultType={authModalType}
        />

      </div>
    </div>
  );
}