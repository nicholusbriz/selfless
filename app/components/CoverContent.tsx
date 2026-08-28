"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import {
  GraduationCap,
  ArrowRight,
  Building2,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import AuthModal from "@/components/auth/AuthModal";

export default function CoverContent() {
  const containerRef = useRef<HTMLDivElement>(null);
  const accentLineRef = useRef<HTMLDivElement>(null);
  const techCenterTextRef = useRef<HTMLSpanElement>(null);
  const activityTrackRef = useRef<HTMLDivElement>(null);
  const infoTrackRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);

  const headerRef = useRef<HTMLDivElement>(null);
  const title1Ref = useRef<HTMLHeadingElement>(null);
  const title2Ref = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalType, setAuthModalType] =
    useState<"login" | "register">("login");

  const { isAuthenticated } = useAuth();

  const dynamicColor = "#E8A33D";

  const openAuthModal = (type: "login" | "register") => {
    setAuthModalType(type);
    setShowAuthModal(true);
  };

  const activities = [
    "📚 Register for Courses",
    "📊 Track Academic Progress",
    "🎓 View Your Grades",
    "🏆 Check GPA & Credits",
    "📅 Manage Your Schedule",
    "📬 Read Announcements",
    "💬 Chat with AI Assistant",
    "👥 Connect with Students",
    "📢 Create Announcements",
    "🧹 Register for Cleaning Day",
    "⚽ Join Football Team",
    "🏐 Join Volleyball Team",
    "🏀 Join Netball Team",
    "🏃 Join Athletics Team",
    "💼 Find Internships",
    "✈️ Register for Temple Trips",
    "🔔 Check Notifications",
    "👤 Update Your Profile",
    "⚙️ Manage Settings",
    "📖 Access Course Materials",
    "✅ Submit Assignments",
    "📝 Track Attendance",
    "🎯 Set Academic Goals",
    "🤝 Join Study Groups",
    "📈 View Performance Analytics",
    "🌐 Access Tech Center Network",
    "🏅 View Achievements",
    "📚 Browse Course Catalog",
    "🎓 Academic Excellence Portal",
  ];

  const portalInfoItems = [
    {
      title: "Why This Portal Exists",
      content:
        "Centralizes academic tools, tracks progress, and connects students across Tech Centers.",
    },
    {
      title: "Course Management",
      content:
        "Register for courses, track academic progress, and manage your entire academic journey.",
    },
    {
      title: "Tech Center Network",
      content:
        "Connect with students across FreedomCity, Jinja, Mbale, and other Selfless Tech Centers.",
    },
    {
      title: "Real-Time Analytics",
      content:
        "Monitor your GPA, credits, attendance, and academic performance with live updates.",
    },
    {
      title: "24/7 Access",
      content:
        "Access your portal anytime, anywhere from any device - desktop, tablet, or mobile.",
    },
    {
      title: "AI-Powered Support",
      content:
        "Chat with AI assistant for instant help with courses, assignments, and portal navigation.",
    },
    {
      title: "Secure & Private",
      content:
        "Your academic records and personal information are securely managed with enterprise-grade security.",
    },
    {
      title: "Global Community",
      content:
        "Join study groups, participate in discussions, and collaborate with students across the network.",
    },
    {
      title: "Achievement Tracking",
      content:
        "Earn badges, track milestones, and celebrate your academic accomplishments.",
    },
    {
      title: "Smart Notifications",
      content:
        "Stay updated with real-time alerts for assignments, announcements, and important deadlines.",
    },
  ];

  const techCenters = [
    "FreedomCity Tech Center",
    "Jinja Tech Center",
    "Mbale Tech Center",
    "Sseta Tech Center",
    "Masaka Tech Center",
    "Lira Tech Center",
    "Ntinda Tech Center",
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      /*
       * IMPORTANT:
       * The main screen/container is intentionally NOT animated.
       *
       * There is no:
       * gsap.to(screenRef.current, ...)
       *
       * This keeps the entire component visually stable.
       */

      // ---------------------------------------------------------
      // 1. SUBTLE BACKGROUND GLOW
      // ---------------------------------------------------------
      if (glowRef.current) {
        gsap.to(glowRef.current, {
          opacity: 0.55,
          scale: 1.18,
          duration: 3.5,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }

      // ---------------------------------------------------------
      // 2. LIGHTWEIGHT FLOATING PARTICLES
      // ---------------------------------------------------------
      if (particlesRef.current) {
        const particleCount = 18;

        for (let i = 0; i < particleCount; i++) {
          const particle = document.createElement("div");

          particle.className =
            "absolute h-1 w-1 rounded-full pointer-events-none";

          particle.style.backgroundColor = dynamicColor;
          particle.style.opacity = (
            Math.random() * 0.18 +
            0.06
          ).toString();
          particle.style.left = `${Math.random() * 100}%`;
          particle.style.top = `${Math.random() * 100}%`;

          particlesRef.current.appendChild(particle);

          gsap.to(particle, {
            x: gsap.utils.random(-60, 60),
            y: gsap.utils.random(-60, 60),
            opacity: 0,
            duration: gsap.utils.random(5, 9),
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: gsap.utils.random(0, 4),
          });
        }
      }

      // ---------------------------------------------------------
      // 3. CLEAN CONTENT ENTRANCE
      // ---------------------------------------------------------
      const tl = gsap.timeline({
        defaults: {
          ease: "power3.out",
        },
      });

      tl.fromTo(
        headerRef.current,
        {
          opacity: 0,
          y: 18,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.65,
        }
      )
        .fromTo(
          title1Ref.current,
          {
            opacity: 0,
            x: -18,
          },
          {
            opacity: 1,
            x: 0,
            duration: 0.7,
          },
          "-=0.35"
        )
        .fromTo(
          title2Ref.current,
          {
            opacity: 0,
            x: 18,
          },
          {
            opacity: 1,
            x: 0,
            duration: 0.7,
          },
          "-=0.5"
        )
        .fromTo(
          descRef.current,
          {
            opacity: 0,
            y: 12,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
          },
          "-=0.35"
        )
        .fromTo(
          ctaRef.current,
          {
            opacity: 0,
            y: 10,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.55,
          },
          "-=0.3"
        )
        .fromTo(
          sidebarRef.current,
          {
            opacity: 0,
            x: 20,
          },
          {
            opacity: 1,
            x: 0,
            duration: 0.7,
          },
          "-=0.45"
        );

      // ---------------------------------------------------------
      // 4. ACCENT LINE ENTRANCE
      // ---------------------------------------------------------
      if (accentLineRef.current) {
        gsap.fromTo(
          accentLineRef.current,
          {
            scaleX: 0,
            transformOrigin: "left center",
          },
          {
            scaleX: 1,
            duration: 1,
            ease: "power2.out",
          }
        );

        // Very subtle opacity breathing only.
        // No movement of the component itself.
        gsap.to(accentLineRef.current, {
          opacity: 0.65,
          duration: 2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: 1,
        });
      }

      // ---------------------------------------------------------
      // 5. TITLE CHARACTER REVEAL - Updated for single line
      // ---------------------------------------------------------
      if (title1Ref.current && title2Ref.current) {
        // Clear both titles
        title1Ref.current.innerHTML = "";
        title2Ref.current.innerHTML = "";

        const title1Text = "Student Self Service Portal";
        const title2Text = "All Education In One Place";

        // Create first title with character animation
        const chars1 = title1Text.split("");
        chars1.forEach((char, index) => {
          const span = document.createElement("span");
          span.textContent = char === " " ? "\u00A0" : char;
          span.style.display = "inline-block";
          span.style.opacity = "0";
          span.style.transform = "translateY(12px)";
          title1Ref.current?.appendChild(span);

          gsap.to(span, {
            opacity: 1,
            y: 0,
            duration: 0.3,
            delay: 0.35 + index * 0.025,
            ease: "power2.out",
          });
        });

        // Create second title with character animation
        const chars2 = title2Text.split("");
        chars2.forEach((char, index) => {
          const span = document.createElement("span");
          span.textContent = char === " " ? "\u00A0" : char;
          span.style.display = "inline-block";
          span.style.opacity = "0";
          span.style.transform = "translateY(12px)";
          title2Ref.current?.appendChild(span);

          gsap.to(span, {
            opacity: 1,
            y: 0,
            duration: 0.3,
            delay: 0.35 + index * 0.025,
            ease: "power2.out",
          });
        });
      }

      // ---------------------------------------------------------
      // 6. FEATURE CARDS - ENTRANCE ONLY
      // ---------------------------------------------------------
      const cards = gsap.utils.toArray<HTMLElement>(
        ".cover-feature-card"
      );

      cards.forEach((card, index) => {
        gsap.fromTo(
          card,
          {
            opacity: 0,
            y: 18,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.55,
            delay: 0.9 + index * 0.12,
            ease: "power2.out",
          }
        );

        // Hover tilt only.
        // No continuous floating animation.
        const handleMouseMove = (event: MouseEvent) => {
          const rect = card.getBoundingClientRect();

          const x =
            (event.clientX - rect.left) / rect.width - 0.5;

          const y =
            (event.clientY - rect.top) / rect.height - 0.5;

          gsap.to(card, {
            rotationY: x * 3,
            rotationX: y * -3,
            duration: 0.35,
            ease: "power2.out",
            overwrite: true,
          });
        };

        const handleMouseLeave = () => {
          gsap.to(card, {
            rotationY: 0,
            rotationX: 0,
            duration: 0.4,
            ease: "power2.out",
            overwrite: true,
          });
        };

        card.addEventListener("mousemove", handleMouseMove);
        card.addEventListener("mouseleave", handleMouseLeave);

        // Store cleanup references on the element.
        (
          card as HTMLElement & {
            __coverCleanup?: () => void;
          }
        ).__coverCleanup = () => {
          card.removeEventListener(
            "mousemove",
            handleMouseMove
          );

          card.removeEventListener(
            "mouseleave",
            handleMouseLeave
          );
        };
      });

      // ---------------------------------------------------------
      // 7. TECH CENTER TYPEWRITER
      // ---------------------------------------------------------
      if (techCenterTextRef.current) {
        const techText = techCenterTextRef.current;

        let centerIndex = 0;
        let charIndex = 0;
        let deleting = false;

        gsap.to(".cursor-blink", {
          opacity: 0,
          duration: 0.5,
          repeat: -1,
          yoyo: true,
          ease: "steps(1)",
        });

        const typeTechCenter = () => {
          const current = techCenters[centerIndex];

          if (!deleting) {
            charIndex = Math.min(
              charIndex + 1,
              current.length
            );

            techText.textContent = current.slice(
              0,
              charIndex
            );

            if (charIndex === current.length) {
              gsap.delayedCall(2.2, () => {
                deleting = true;

                gsap.delayedCall(
                  0.5,
                  typeTechCenter
                );
              });

              return;
            }
          } else {
            charIndex = Math.max(charIndex - 1, 0);

            techText.textContent = current.slice(
              0,
              charIndex
            );

            if (charIndex === 0) {
              deleting = false;

              centerIndex =
                (centerIndex + 1) % techCenters.length;

              gsap.delayedCall(
                0.25,
                typeTechCenter
              );

              return;
            }
          }

          gsap.delayedCall(
            deleting ? 0.02 : 0.055,
            typeTechCenter
          );
        };

        gsap.delayedCall(1.2, typeTechCenter);
      }

      // ---------------------------------------------------------
      // 8. QUICK ACTIONS SCROLL
      // ---------------------------------------------------------
      if (activityTrackRef.current) {
        gsap.to(activityTrackRef.current, {
          y: -(32 * (activities.length - 1)),
          duration: activities.length * 0.65,
          repeat: -1,
          yoyo: true,
          ease: "power1.inOut",
        });

        const activityItems =
          activityTrackRef.current.children;

        let currentIndex = 0;

        const activityTimeline = gsap.timeline({
          repeat: -1,
          duration: activities.length * 0.65 * 2,
          ease: "none",
        });

        activityTimeline.eventCallback(
          "onUpdate",
          () => {
            const progress =
              activityTimeline.progress();

            const newIndex =
              Math.floor(
                progress * activities.length * 2
              ) % activities.length;

            if (
              newIndex !== currentIndex &&
              activityItems[currentIndex]
            ) {
              gsap.to(
                activityItems[currentIndex],
                {
                  scale: 0.94,
                  opacity: 0.55,
                  duration: 0.25,
                  ease: "power2.out",
                }
              );

              currentIndex = newIndex;

              if (activityItems[currentIndex]) {
                gsap.to(
                  activityItems[currentIndex],
                  {
                    scale: 1,
                    opacity: 1,
                    duration: 0.25,
                    ease: "power2.out",
                  }
                );
              }
            }
          }
        );
      }

      // ---------------------------------------------------------
      // 9. PORTAL FEATURES SCROLL
      // ---------------------------------------------------------
      if (infoTrackRef.current) {
        const infoItems =
          infoTrackRef.current.children;

        Array.from(infoItems).forEach((item, index) => {
          gsap.fromTo(
            item,
            {
              opacity: 0,
              y: 10,
            },
            {
              opacity: 1,
              y: 0,
              duration: 0.4,
              delay: 1.2 + index * 0.04,
              ease: "power2.out",
            }
          );
        });

        gsap.to(infoTrackRef.current, {
          y: -(44 * (portalInfoItems.length - 1)),
          duration: portalInfoItems.length * 0.75,
          repeat: -1,
          yoyo: true,
          ease: "power1.inOut",
        });
      }

      // ---------------------------------------------------------
      // 10. BUTTON HOVER
      // ---------------------------------------------------------
      const buttons = gsap.utils.toArray<HTMLElement>(
        ".action-button"
      );

      buttons.forEach((button) => {
        const handleEnter = () => {
          gsap.to(button, {
            scale: 1.025,
            y: -1,
            duration: 0.25,
            ease: "power2.out",
            overwrite: true,
          });
        };

        const handleLeave = () => {
          gsap.to(button, {
            scale: 1,
            y: 0,
            duration: 0.25,
            ease: "power2.out",
            overwrite: true,
          });
        };

        button.addEventListener(
          "mouseenter",
          handleEnter
        );

        button.addEventListener(
          "mouseleave",
          handleLeave
        );

        (
          button as HTMLElement & {
            __buttonCleanup?: () => void;
          }
        ).__buttonCleanup = () => {
          button.removeEventListener(
            "mouseenter",
            handleEnter
          );

          button.removeEventListener(
            "mouseleave",
            handleLeave
          );
        };
      });

      // ---------------------------------------------------------
      // 11. TOP SHIMMER
      // ---------------------------------------------------------
      gsap.to(".shimmer", {
        x: "100%",
        duration: 2.2,
        repeat: -1,
        ease: "none",
        delay: 0.5,
      });
    }, containerRef);

    return () => {
      // Clean custom event listeners before GSAP context cleanup.
      const cards = gsap.utils.toArray<HTMLElement>(
        ".cover-feature-card"
      );

      cards.forEach((card) => {
        const element =
          card as HTMLElement & {
            __coverCleanup?: () => void;
          };

        element.__coverCleanup?.();
        delete element.__coverCleanup;
      });

      const buttons = gsap.utils.toArray<HTMLElement>(
        ".action-button"
      );

      buttons.forEach((button) => {
        const element =
          button as HTMLElement & {
            __buttonCleanup?: () => void;
          };

        element.__buttonCleanup?.();
        delete element.__buttonCleanup;
      });

      ctx.revert();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#0D1117] px-4 py-10 text-white sm:px-6 sm:py-12 lg:px-8"
    >
      <div className="relative mx-auto w-full max-w-6xl">
        {/* 
         * This outer portal shell stays completely still.
         * Only its internal elements animate.
         */}
        <div className="relative w-full overflow-hidden rounded-2xl bg-[#151B24] shadow-[0_24px_70px_rgba(0,0,0,0.32)]">
          {/* Background glow */}
          <div
            ref={glowRef}
            className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full opacity-20"
            style={{
              background: `radial-gradient(circle, ${dynamicColor}33, transparent 70%)`,
            }}
          />

          {/* Floating particles */}
          <div
            ref={particlesRef}
            className="pointer-events-none absolute inset-0 overflow-hidden"
          />

          {/* Top shimmer - THINNER */}
          <div className="absolute left-0 right-0 top-0 h-px overflow-hidden bg-[#E8A33D]/20">
            <div className="shimmer absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-[#E8A33D] to-transparent" />
          </div>

          {/* Accent line */}
          <div
            ref={accentLineRef}
            className="absolute left-8 top-0 h-0.5 w-40 bg-[#E8A33D] sm:left-12 sm:w-64"
          />

          <div className="w-full overflow-hidden bg-[#111720] p-5 sm:p-7 lg:p-10">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-10">
              {/* Main content */}
              <div className="space-y-5 lg:col-span-8 sm:space-y-7">
                <div
                  ref={headerRef}
                  className="flex items-center gap-3 border-b border-[#E8A33D]/10 pb-4 sm:gap-4"
                >
                  <GraduationCap
                    className="h-6 w-6 flex-shrink-0 sm:h-9 sm:w-9"
                    style={{ color: dynamicColor }}
                  />

                  <span className="text-sm font-bold tracking-wide text-white sm:text-xl">
                    Student Self Service Portal
                  </span>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <h1
                    ref={title1Ref}
                    className="text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl lg:text-6xl whitespace-nowrap"
                    style={{ letterSpacing: "-0.02em" }}
                  >
                    Student Self Service Portal
                  </h1>

                  <h1
                    ref={title2Ref}
                    className="text-2xl font-extrabold leading-tight tracking-tight text-[#E8A33D] sm:text-4xl lg:text-6xl whitespace-nowrap"
                    style={{ letterSpacing: "-0.02em" }}
                  >
                    All Education In One Place
                  </h1>
                </div>

                <p
                  ref={descRef}
                  className="max-w-2xl text-sm leading-relaxed text-[#A79C8C] sm:text-base lg:text-xl"
                  style={{ lineHeight: "1.8" }}
                >
                  Your centralized platform for managing BYU-Idaho
                  courses, tracking academic progress, receiving tutor
                  feedback, and connecting across the Selfless Tech Center
                  Network.
                </p>

                <div
                  ref={ctaRef}
                  className="flex flex-col items-center gap-4 pt-4 sm:flex-row sm:flex-wrap sm:gap-5"
                >
                  {isAuthenticated ? (
                    <>
                      <Link
                        href="/dashboard"
                        className="action-button group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-xl px-6 py-4 text-sm font-semibold text-white transition-all sm:w-auto sm:px-8 sm:text-base"
                        style={{
                          backgroundColor: dynamicColor,
                          boxShadow: `0 4px 14px ${dynamicColor}35`,
                        }}
                      >
                        <span className="relative z-10">
                          Go to Dashboard
                        </span>

                        <ArrowRight className="relative z-10 h-5 w-5 transition-transform group-hover:translate-x-1" />

                        <div className="absolute inset-0 bg-white opacity-0 transition-opacity duration-300 group-hover:opacity-20" />
                      </Link>

                      <Link
                        href="/dashboard/courses"
                        className="action-button w-full rounded-xl border border-white/5 bg-[#1A222D] px-6 py-4 text-sm font-semibold text-slate-300 transition-colors hover:bg-[#222C38] sm:w-auto sm:px-8 sm:text-base"
                      >
                        Course Catalog
                      </Link>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() =>
                          openAuthModal("login")
                        }
                        className="action-button group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-xl px-6 py-4 text-sm font-semibold text-white transition-all sm:w-auto sm:px-8 sm:text-base"
                        style={{
                          backgroundColor: dynamicColor,
                          boxShadow: `0 4px 14px ${dynamicColor}35`,
                        }}
                      >
                        <span className="relative z-10">
                          Access Portal
                        </span>

                        <ArrowRight className="relative z-10 h-5 w-5 transition-transform group-hover:translate-x-1" />

                        <div className="absolute inset-0 bg-white opacity-0 transition-opacity duration-300 group-hover:opacity-20" />
                      </button>

                      <button
                        onClick={() =>
                          openAuthModal("register")
                        }
                        className="action-button w-full rounded-xl border border-[#E8A33D]/15 bg-[#1A222D] px-6 py-4 text-sm font-semibold text-[#E8A33D] transition-colors hover:bg-[#222C38] sm:w-auto sm:px-8 sm:text-base"
                      >
                        Get Started
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div
                ref={sidebarRef}
                className="space-y-4 lg:col-span-4 sm:space-y-5"
              >
                {/* Current Location */}
                <div className="cover-feature-card cursor-pointer space-y-3 rounded-xl border border-[#E8A33D]/10 bg-[#151B24] p-4 text-center transition-colors hover:border-[#E8A33D]/20 sm:p-5">
                  <p className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest text-[#6B6358] sm:text-xs">
                    <Sparkles
                      className="h-3 w-3"
                      style={{ color: dynamicColor }}
                    />

                    Current Location

                    <Sparkles
                      className="h-3 w-3"
                      style={{ color: dynamicColor }}
                    />
                  </p>

                  <div className="flex min-w-0 items-center justify-center gap-2">
                    <Building2
                      className="h-5 w-5 flex-shrink-0 sm:h-6 sm:w-6"
                      style={{ color: dynamicColor }}
                    />

                    <span
                      ref={techCenterTextRef}
                      className="tech-center-text min-w-0 truncate text-xs font-bold text-white sm:text-base lg:text-lg"
                    >
                      FreedomCity Tech Center
                    </span>

                    <span className="cursor-blink text-xs text-[#E8A33D] sm:text-base lg:text-lg">
                      |
                    </span>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="cover-feature-card cursor-pointer space-y-3 rounded-xl border border-[#E8A33D]/10 bg-[#151B24] p-4 text-center transition-colors hover:border-[#E8A33D]/20 sm:p-5">
                  <p className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest text-[#6B6358] sm:text-xs">
                    <ChevronRight
                      className="h-3 w-3"
                      style={{ color: dynamicColor }}
                    />

                    Quick Actions

                    <ChevronRight
                      className="h-3 w-3"
                      style={{ color: dynamicColor }}
                    />
                  </p>

                  <div className="relative h-16 overflow-hidden sm:h-28">
                    <div
                      ref={activityTrackRef}
                      className="will-change-transform"
                    >
                      {activities.map(
                        (activity, index) => (
                          <div
                            key={index}
                            className="flex h-8 items-center justify-center text-[10px] font-semibold sm:text-xs"
                            style={{
                              color: dynamicColor,
                            }}
                          >
                            {activity}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>

                {/* Portal Features */}
                <div className="cover-feature-card cursor-pointer space-y-3 rounded-xl border border-[#E8A33D]/10 bg-[#151B24] p-4 text-center transition-colors hover:border-[#E8A33D]/20 sm:p-5">
                  <p className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest text-[#6B6358] sm:text-xs">
                    <Sparkles
                      className="h-3 w-3"
                      style={{ color: dynamicColor }}
                    />

                    Portal Features

                    <Sparkles
                      className="h-3 w-3"
                      style={{ color: dynamicColor }}
                    />
                  </p>

                  <div className="relative h-28 overflow-hidden sm:h-36">
                    <div
                      ref={infoTrackRef}
                      className="will-change-transform"
                    >
                      {portalInfoItems.map(
                        (item, index) => (
                          <div
                            key={index}
                            className="flex h-11 flex-col items-center justify-center px-3"
                          >
                            <p className="mb-1 text-[10px] font-bold text-white sm:text-xs">
                              {item.title}
                            </p>

                            <p className="text-center text-[9px] leading-tight text-gray-400 sm:text-[11px]">
                              {item.content}
                            </p>
                          </div>
                        )
                      )}
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