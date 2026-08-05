// app/components/ui/header-2.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { Home, ChevronDown, Sparkles, LayoutDashboard, LogOut, X } from 'lucide-react';
import AuthModal from '@/components/auth/AuthModal';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/hooks/useAuth';
import { useTenant } from '@/lib/contexts/TenantContext';

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();
  const { currentTechCenter, isTenantView, getAllTechCenters } = useTenant();
  
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalType, setAuthModalType] = useState<'login' | 'register'>('login');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [logoGlow, setLogoGlow] = useState({ x: 0, y: 0 });
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const techCenters = getAllTechCenters();
  const techCenterColor = currentTechCenter?.color || '#E8A33D';

  // Get current page display name
  const getCurrentPageName = () => {
    if (pathname === '/') return 'Home';
    
    // Check if we're on a tech center page
    for (const tc of techCenters) {
      if (pathname === `/tech-center/${tc.slug}`) {
        return tc.displayName;
      }
    }
    
    // Check dashboard
    if (pathname === '/dashboard') return 'Dashboard';
    
    // Default fallback
    return 'Portal';
  };

  // Links
  interface LinkItem {
    label: string;
    href: string;
    icon?: React.ComponentType<{ className?: string }>;
    slug?: string;
    color?: string;
  }

  const homeLink: LinkItem = { label: 'Home', href: '/', icon: Home };
  const techCenterLinks: LinkItem[] = techCenters.map((tc) => ({
    label: tc.displayName,
    href: `/tech-center/${tc.slug}`,
    slug: tc.slug,
    color: tc.color,
  }));
  const allLinks: LinkItem[] = [homeLink, ...techCenterLinks];

  // Scroll handler - just for background blur
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Entrance animation
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Mobile menu body lock
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const navigateToPath = (path: string) => {
    router.push(path);
    setMobileMenuOpen(false);
  };

  const handleAuth = (type: 'login' | 'register') => {
    setAuthModalType(type);
    setShowAuthModal(true);
    setMobileMenuOpen(false);
  };

  const handleDashboard = () => {
    router.push('/dashboard');
    setMobileMenuOpen(false);
  };

  // Logo glow tracking
  const handleLogoMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 20;
    setLogoGlow({ x, y });
  };

  const handleLogoMouseLeave = () => {
    setLogoGlow({ x: 0, y: 0 });
  };

  // Header classes - floating glass
  const headerClasses = cn(
    'fixed top-3 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-32px)] max-w-7xl transition-all duration-700 ease-out',
    'rounded-2xl md:rounded-full backdrop-blur-xl border transition-all h-16',
    scrolled ? 'bg-[#0D1117]/95 border-[#2A2438]/40 shadow-2xl shadow-black/20 backdrop-blur-2xl' : 'bg-[#0D1117]/30 border-white/5 shadow-sm backdrop-blur-sm',
    isVisible ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 -translate-y-8 blur-xl',
    'duration-1000'
  );

  // Animated active indicator
  const ActiveIndicator = ({ isActive }: { isActive: boolean }) => (
    <span className={cn(
      'absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] bg-[#E8A33D] transition-all duration-500 rounded-full',
      isActive ? 'w-4 opacity-100' : 'w-0 opacity-0'
    )} />
  );

  return (
    <>
      {/* Ambient glow effect */}
      <div 
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] pointer-events-none z-40 opacity-10"
        style={{
          backgroundImage: `radial-gradient(ellipse at center, ${techCenterColor}60 0%, transparent 70%)`,
          filter: 'blur(50px)',
        }}
      />

      <header className={headerClasses}>
        <div className="flex items-center justify-between px-3 md:px-4 w-full h-16">
          {/* Logo - Enhanced with 3D and glow */}
          <div 
            className="flex items-center gap-2 cursor-pointer group flex-shrink-0"
            onClick={() => navigateToPath('/')}
            onMouseMove={handleLogoMouseMove}
            onMouseLeave={handleLogoMouseLeave}
          >
            <div className="relative">
              <div 
                className="w-8 h-8 rounded-lg overflow-hidden border transition-all duration-500 relative flex-shrink-0 group-hover:rotate-2"
                style={{
                  borderColor: techCenterColor,
                  transform: `perspective(200px) rotateX(${logoGlow.y * 0.1}deg) rotateY(${logoGlow.x * 0.1}deg)`,
                }}
              >
                <Image 
                  src="/freedom.png" 
                  alt="FCTC" 
                  fill
                  className="object-cover"
                  sizes="32px"
                />
                {/* Logo glow overlay */}
                <div 
                  className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                  style={{
                    backgroundImage: `radial-gradient(circle at ${50 + logoGlow.x * 0.5}% ${50 + logoGlow.y * 0.5}%, ${techCenterColor}80 0%, transparent 70%)`,
                  }}
                />
              </div>
              {/* Shine border */}
              <div 
                className="absolute -inset-px rounded-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                style={{
                  backgroundImage: `linear-gradient(120deg, transparent 0%, ${techCenterColor}60 50%, transparent 100%)`,
                  backgroundSize: '200% auto',
                  animation: 'shimmer 3s linear infinite',
                }}
              />
            </div>

            <div>
              <h1 className="text-base font-bold tracking-tight text-[#F5F0E8]">
                {isTenantView
                  ? `${currentTechCenter?.displayName} Portal`
                  : 'Selfless CE Student Portal'}
              </h1>
              <div className="flex items-center gap-1.5">
                <span
                  className="text-[8px] font-medium tracking-wider uppercase"
                  style={{ color: techCenterColor }}
                >
                  {isTenantView ? currentTechCenter?.displayName : 'Multi-Tenant'}
                </span>
                <span className="w-0.5 h-0.5 bg-[#2A2438] rounded-full" />
                <span className="text-[7px] text-[#6B6358]">
                  BYU Idaho
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Links - Enhanced with hover effects */}
          <div className="hidden lg:flex items-center gap-0.5">
            {allLinks.map((link) => {
              const techCenter = techCenters.find((tc) => tc.slug === link.slug);
              const itemColor = techCenter?.color || (link.label === 'Home' ? '#E8A33D' : '#A79C8C');
              const Icon = link.icon;
              const isActive = pathname === link.href;
              const isHovered = hoveredNav === link.href;

              return (
                <button
                  key={link.href}
                  onClick={() => navigateToPath(link.href)}
                  onMouseEnter={() => setHoveredNav(link.href)}
                  onMouseLeave={() => setHoveredNav(null)}
                  className={cn(
                    'relative rounded-lg transition-all duration-300 font-medium px-3 py-1.5 text-sm',
                    'hover:-translate-y-0.5',
                    isActive ? 'text-white' : 'text-[#A79C8C] hover:text-white',
                    isHovered && !isActive && 'bg-[#2A2438]/20'
                  )}
                >
                  <span className="flex items-center gap-1.5">
                    {Icon && (
                      <Icon 
                        className={cn(
                          'w-3.5 h-3.5 transition-all duration-300',
                          isHovered && 'translate-x-0.5'
                        )} 
                      />
                    )}
                    {link.label}
                    {techCenter && (
                      <span
                        className="w-1.5 h-1.5 rounded-full transition-all duration-300"
                        style={{ 
                          backgroundColor: itemColor,
                          transform: isHovered ? 'scale(1.2)' : 'scale(1)'
                        }}
                      />
                    )}
                  </span>
                  <ActiveIndicator isActive={isActive} />
                  {isHovered && !isActive && (
                    <span 
                      className="absolute inset-0 rounded-lg opacity-10 blur-md"
                      style={{ backgroundColor: itemColor }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Desktop Auth - Enhanced */}
          <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                {/* User avatar */}
                <div
                  className="w-7 h-7 rounded-full bg-gradient-to-br from-[#E8A33D] to-[#C97F1F] flex items-center justify-center font-bold text-[#0B0912] text-[10px] transition-all duration-300"
                >
                  {user?.firstName?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="hidden xl:block text-left">
                  <p className="text-xs text-[#F5F0E8] font-medium">
                    {user?.firstName || 'User'}
                  </p>
                  <p className="text-[8px] text-[#6B6358]">Student</p>
                </div>
                
                {/* Dashboard button */}
                <button
                  onClick={handleDashboard}
                  className="flex items-center gap-1.5 rounded-lg transition-all duration-300 hover:scale-105 px-3 py-1.5 text-xs text-[#A79C8C] hover:text-white hover:bg-[#2A2438]/30"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Dashboard</span>
                </button>
                
                {/* Logout button - only show on dashboard and other pages, not home */}
                {pathname !== '/' && (
                  <button
                    onClick={() => navigateToPath('/logout')}
                    className="flex items-center gap-1.5 rounded-lg transition-all duration-300 hover:scale-105 px-3 py-1.5 text-xs text-[#EF4444] hover:text-[#EF4444]/80 hover:bg-[#2A2438]/30"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleAuth('login')}
                  className="text-[#A79C8C] hover:text-white rounded-md transition-all duration-200 hover:scale-105 px-2.5 py-1 text-xs"
                >
                  Login
                </button>
                <button
                  onClick={() => handleAuth('register')}
                  className="relative rounded-md text-[#0B0912] font-semibold transition-all duration-300 overflow-hidden hover:scale-105 hover:shadow-lg px-4 py-1.5 text-sm"
                  style={{ backgroundColor: techCenterColor }}
                >
                  <span className="relative z-10 flex items-center gap-1">
                    Get Started
                    <Sparkles className="w-3 h-3" />
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-700" />
                </button>
              </div>
            )}
          </div>

          {/* Mobile Navigation - Fixed */}
          <div className="lg:hidden flex items-center gap-2 flex-1 justify-end">
            {/* Mobile Menu Button - TechCenters */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={cn(
                'rounded-lg border border-[#2A2438] bg-[#150F20]/50 text-[#A79C8C] hover:text-[#F5F0E8] hover:bg-[#2A2438]/40 transition-all duration-300 flex items-center gap-1.5 px-3 py-1.5 hover:scale-105',
                mobileMenuOpen && 'bg-[#2A2438]/40 text-[#F5F0E8]'
              )}
              aria-label="Toggle menu"
            >
              <span className="text-xs font-medium">TechCenters</span>
              <ChevronDown className={cn(
                'w-3 h-3 transition-transform duration-300',
                mobileMenuOpen && 'rotate-180'
              )} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer - Enhanced */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-[#0D1117]/80 backdrop-blur-xl lg:hidden transition-all duration-500',
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setMobileMenuOpen(false)}
      >
        <div 
          className={cn(
            'fixed right-0 top-0 h-full w-80 max-w-[85%] bg-[#0D1117] border-l border-[#2A2438]/50',
            'transform transition-all duration-500 ease-out',
            mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col h-full overflow-y-auto">
            {/* Mobile header */}
            <div className="flex items-center justify-between p-4 border-b border-[#2A2438]/30">
              <span className="text-sm font-medium text-[#6B6358]">TechCenters</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-full p-1 hover:bg-[#2A2438]/30 transition-colors"
              >
                <X className="w-5 h-5 text-[#A79C8C]" />
              </button>
            </div>

            {/* User section in mobile */}
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3 p-4 m-4 bg-[#150F20] rounded-xl border border-[#2A2438]">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E8A33D] to-[#C97F1F] flex items-center justify-center text-sm font-bold text-[#0B0912]">
                  {user?.firstName?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1">
                  <p className="text-[#F5F0E8] font-medium">{user?.firstName || 'User'}</p>
                  <p className="text-[#6B6358] text-xs">Signed in</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2 p-4">
                <button
                  onClick={() => handleAuth('login')}
                  className="w-full rounded-xl border border-[#2A2438] bg-[#150F20] text-[#A79C8C] hover:text-[#F5F0E8] hover:bg-[#2A2438]/40 transition-all duration-200 px-4 py-3 text-sm"
                >
                  Login
                </button>
                <button
                  onClick={() => handleAuth('register')}
                  className="w-full rounded-xl text-[#0B0912] font-semibold transition-all duration-300 hover:scale-[1.02] px-4 py-3 text-sm"
                  style={{ backgroundColor: techCenterColor }}
                >
                  Get Started
                </button>
              </div>
            )}

            {/* Mobile navigation with current page highlight */}
            <nav className="flex-1 px-4 space-y-1">
              <div className="px-4 py-2">
                <span className="text-[10px] uppercase tracking-wider text-[#6B6358] font-medium">
                  Navigation
                </span>
              </div>
              {allLinks.map((link, index) => {
                const techCenter = techCenters.find((tc) => tc.slug === link.slug);
                const itemColor = techCenter?.color || (link.label === 'Home' ? '#E8A33D' : '#A79C8C');
                const Icon = link.icon;
                const isActive = pathname === link.href;

                return (
                  <button
                    key={link.href}
                    onClick={() => navigateToPath(link.href)}
                    className={cn(
                      'w-full text-left px-4 py-3 rounded-xl transition-all duration-300 flex items-center gap-3',
                      'hover:translate-x-2',
                      isActive 
                        ? 'bg-[#2A2438]/40 text-white' 
                        : 'text-[#A79C8C] hover:bg-[#2A2438]/20 hover:text-white'
                    )}
                    style={{
                      animation: mobileMenuOpen ? `fadeInUp 0.3s ease-out ${index * 0.05}s forwards` : 'none',
                      opacity: mobileMenuOpen ? 0 : 1,
                    }}
                  >
                    {Icon && (
                      <span style={{ color: isActive ? itemColor : undefined }}>
                        <Icon className="w-5 h-5" />
                      </span>
                    )}
                    <span className="font-medium">{link.label}</span>
                    {isActive && (
                      <span
                        className="w-1.5 h-1.5 rounded-full ml-auto"
                        style={{ backgroundColor: itemColor }}
                      />
                    )}
                    {techCenter && !isActive && (
                      <span
                        className="w-1.5 h-1.5 rounded-full ml-auto opacity-30"
                        style={{ backgroundColor: itemColor }}
                      />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Mobile footer */}
            <div className="p-4 mt-auto border-t border-[#2A2438]/30">
              {isAuthenticated && (
                <button
                  className="w-full rounded-xl bg-[#2A2438]/20 text-[#A79C8C] hover:bg-[#2A2438]/40 hover:text-white transition-all duration-200 px-4 py-3 text-sm"
                  onClick={handleDashboard}
                >
                  Go to Dashboard
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        defaultType={authModalType}
      />

      {/* Animation keyframes */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes dropdownIn {
          from { opacity: 0; transform: scale(0.95) translateY(-10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </>
  );
}