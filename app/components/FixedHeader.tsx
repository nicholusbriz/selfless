// components/home/FixedHeader.tsx

"use client";

import { useState, useEffect } from "react";
import { Menu, X, Home, Sparkles, GraduationCap, MessageSquare, User } from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import AuthModal from "@/components/auth/AuthModal";
import { useRouter } from "next/navigation";

const navItems = [
  { id: 'cover', label: 'Home', icon: Home },
  { id: 'overview', label: 'Overview', icon: Sparkles },
  { id: 'academic', label: 'Academic', icon: GraduationCap },
  { id: 'community', label: 'Community', icon: MessageSquare },
  { id: 'testimonials', label: 'Testimonials', icon: MessageSquare },
  { id: 'faq', label: 'FAQ', icon: MessageSquare },
];

export default function FixedHeader() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalType, setAuthModalType] = useState<'login' | 'register'>('login');
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(800);
  const [scrollProgress, setScrollProgress] = useState(0);

  const closeAuthModal = () => {
    setShowAuthModal(false);
  };

  useEffect(() => {
    const updateViewport = () => setViewportHeight(window.innerHeight);
    updateViewport();
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      setScrollY(window.scrollY);

      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0);

      const coverProgress = Math.min(scrollY / (viewportHeight * 0.85 || 700), 1);
      const showHeader = coverProgress > 0.55;
      setIsVisible(showHeader);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [viewportHeight, scrollY]);

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      const offset = 80;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
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

  const handleDashboard = () => router.push('/dashboard');

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3 pointer-events-none'
        } ${
          isScrolled
            ? 'bg-[#0B0912]/80 backdrop-blur-md border-b border-[#2A2438]/50'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => scrollToSection('hero')}>
              <div className="w-9 h-9 rounded-lg overflow-hidden">
                <img src="/freedom.png" alt="FCTC" className="w-full h-full object-cover" />
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
                  className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 text-[#A79C8C] hover:text-[#F5F0E8] hover:bg-[#2A2438]/30"
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
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all text-[#A79C8C] hover:text-[#F5F0E8] hover:bg-[#2A2438]/30"
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

      <AuthModal
        isOpen={showAuthModal}
        onClose={closeAuthModal}
        defaultType={authModalType}
      />
    </>
  );
}
