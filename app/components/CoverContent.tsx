import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { 
  GraduationCap, 
  BookOpen, 
  CheckCircle2, 
  ArrowRight, 
  Clock, 
  Sparkles,
  Award,
  Bell,
  Building2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTenant } from '@/lib/contexts/TenantContext';

export default function CoverContent() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  const title1Ref = useRef<HTMLHeadingElement>(null);
  const title2Ref = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<HTMLDivElement>(null);
  const techCenterTextRef = useRef<HTMLSpanElement>(null);

  const { currentTechCenter } = useTenant();
  const [techCenterIndex, setTechCenterIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [activityIndex, setActivityIndex] = useState(0);

  const techCenters = [
    'FreedomCity Tech Center',
    'Jinja Tech Center',
    'Mbale Tech Center',
    'Sseta Tech Center',
    'Masaka Tech Center',
    'Lira Tech Center',
    'Ntinda Tech Center'
  ];

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
    const currentTechCenter = techCenters[techCenterIndex];
    const typingSpeed = 100;
    const deletingSpeed = 50;
    const pauseAfterType = 2000;
    const pauseAfterDelete = 500;

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
  }, [displayText, isDeleting, techCenterIndex, techCenters]);

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
  }, []);

  const dynamicColor = currentTechCenter?.color || '#E8A33D';

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

      {/* Hero Container */}
      <div className="relative max-w-6xl w-full mx-auto flex flex-col items-center z-10">

        {/* Main 3D Card Glass Structure */}
        <div
          ref={cardRef}
          style={{ transformStyle: 'preserve-3d' }}
          className="relative w-full rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-6 sm:p-10 shadow-2xl transition-all duration-300"
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
                  className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400"
                >
                  All Education In One Place
                </h1>
              </div>

              <p ref={descRef} className="text-base sm:text-lg text-slate-400 max-w-xl">
                Your centralized multi-tenant platform for managing BYU-Idaho courses, tracking academic progress, receiving tutor feedback, and connecting across the Selfless Tech Center Network.
              </p>

              {/* Action Buttons */}
              <div ref={ctaRef} className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  className="px-6 py-3.5 rounded-xl font-semibold text-white flex items-center gap-2 shadow-lg hover:opacity-90 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                  style={{ backgroundColor: dynamicColor }}
                >
                  <span>Access Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button className="px-6 py-3.5 rounded-xl font-semibold text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 transition-all">
                  Course Catalog
                </button>
              </div>
            </div>

            {/* Right Side 3D Device Showcase - Increased Phone Size */}
            <div className="lg:col-span-6 relative flex justify-center items-center">

              {/* Mockup Phone Frame - Larger size */}
              <div
                ref={phoneRef}
                className="w-full max-w-[380px] rounded-[36px] bg-slate-950 p-3 border-4 border-slate-800 shadow-2xl relative z-10"
              >
                <div className="w-full rounded-[28px] bg-slate-900 border border-white/5 overflow-hidden p-6 space-y-6">

                  {/* Phone Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-white/5">
                    <div className="flex items-center gap-3">
                      <GraduationCap className="w-6 h-6" style={{ color: dynamicColor }} />
                      <span className="text-sm font-bold text-white">Tech Centers</span>
                    </div>
                    <span className="text-xs text-slate-500">Network</span>
                  </div>

                  {/* Typing Tech Center Animation - Larger */}
                  <div className="p-6 rounded-xl bg-white/5 border border-white/5 text-center space-y-3">
                    <p className="text-xs uppercase tracking-wider text-slate-400">Current Location</p>
                    <div className="flex items-center justify-center gap-3">
                      <Building2 className="w-5 h-5" style={{ color: dynamicColor }} />
                      <span ref={techCenterTextRef} className="text-2xl font-bold text-white">
                        {displayText}
                      </span>
                      <span className="animate-pulse text-white text-2xl">|</span>
                    </div>
                  </div>

                  {/* Scrolling Activities Animation - Larger */}
                  <div className="p-6 rounded-xl bg-white/5 border border-white/5 text-center space-y-3">
                    <p className="text-xs uppercase tracking-wider text-slate-400">Quick Actions</p>
                    <div className="h-12 overflow-hidden relative">
                      <div
                        className="transition-transform duration-500 ease-in-out"
                        style={{ transform: `translateY(-${activityIndex * 48}px)` }}
                      >
                        {activities.map((activity, index) => (
                          <div
                            key={index}
                            className="h-12 flex items-center justify-center text-base font-semibold text-white"
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

      </div>
    </div>
  );
};