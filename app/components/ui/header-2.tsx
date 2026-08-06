// app/components/ui/header-2.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { Home, ChevronDown, Sparkles, LayoutDashboard, X } from 'lucide-react';
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
  const techCenterColor = currentTechCenter?.color || '#000000';

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
    scrolled ? 'bg-background/95 border-border shadow-2xl shadow-black/20 backdrop-blur-2xl' : 'bg-background/20 border-border/5 shadow-sm backdrop-blur-sm',
    isVisible ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 -translate-y-8 blur-xl',
    'duration-1000'
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
              <h1 className="text-base font-bold tracking-tight text-foreground">
                {isTenantView
                  ? `${currentTechCenter?.displayName} Portal`
                  : 'Selfless CE Student Portal'}
              </h1>
              <div className="flex items-center gap-1.5">
                <span
                  className="text-[10px] font-medium tracking-wider uppercase"
                  style={{ color: techCenterColor }}
                >
                  {isTenantView ? currentTechCenter?.displayName : 'Multi-Tenant'}
                </span>
                <span className="w-0.5 h-0.5 bg-muted-foreground/30 rounded-full" />
                <span className="text-[10px] text-muted-foreground">
                  BYU Idaho
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Links - Enhanced with hover effects */}
          <div className="hidden lg:flex items-center gap-0.5">
            {allLinks.map((link) => {
              const techCenter = techCenters.find((tc) => tc.slug === link.slug);
              const itemColor = techCenter?.color || (link.label === 'Home' ? techCenterColor : 'var(--muted-foreground)');
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
                    isActive
                      ? 'text-foreground bg-secondary/50 shadow-inner'
                      : 'text-muted-foreground hover:text-foreground',
                    isHovered && !isActive && 'bg-secondary/30'
                  )}
                >
                  <span className="flex items-center gap-1.5">
                    {isActive && (
                      <span
                        className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                        style={{ backgroundColor: itemColor }}
                      />
                    )}
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

          {/* Divider */}
          <div className="hidden lg:block w-px h-4 bg-border/50 flex-shrink-0" />

          {/* Desktop Auth - Enhanced */}
          <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                {/* User avatar */}
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-background text-[10px] transition-all duration-300"
                  style={{ background: `linear-gradient(135deg, ${techCenterColor}, ${techCenterColor}99)` }}
                >
                  {user?.firstName?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="hidden xl:block text-left">
                  <p className="text-xs text-foreground font-medium">
                    {user?.firstName || 'User'}
                  </p>
                  <p className="text-[8px] text-muted-foreground">Student</p>
                </div>

                {/* Dashboard button */}
                <button
                  onClick={handleDashboard}
                  className="flex items-center gap-1.5 rounded-lg transition-all duration-300 hover:scale-105 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/30"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Dashboard</span>
                </button>

              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleAuth('login')}
                  className="text-muted-foreground hover:text-foreground rounded-md transition-all duration-200 hover:scale-105 px-2.5 py-1 text-xs"
                >
                  Login
                </button>
                <button
                  onClick={() => handleAuth('register')}
                  className="group relative rounded-md text-primary-foreground font-semibold transition-all duration-300 overflow-hidden hover:scale-105 hover:shadow-lg px-4 py-1.5 text-sm"
                  style={{ backgroundColor: techCenterColor }}
                >
                  <span className="relative z-10 flex items-center gap-1">
                    Get Started
                    <Sparkles className="w-3 h-3" />
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </button>
              </div>
            )}
          </div>

          {/* Mobile Navigation - Fixed */}
          <div className="lg:hidden flex items-center gap-2 flex-1 justify-end">
            {/* Mobile auth in header bar */}
            {isAuthenticated && user ? (
              <button
                onClick={handleDashboard}
                className="flex items-center gap-1.5 rounded-full bg-secondary/30 border border-border px-2 py-1 transition-all duration-200 hover:bg-secondary/50"
                aria-label="Dashboard"
              >
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-background text-[9px] flex-shrink-0"
                  style={{ backgroundColor: techCenterColor }}
                >
                  {user?.firstName?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="text-[10px] text-foreground font-medium pr-0.5">
                  {user?.firstName || 'User'}
                </span>
              </button>
            ) : (
              <button
                onClick={() => handleAuth('login')}
                className="text-[10px] font-medium text-muted-foreground hover:text-foreground rounded-md border border-border px-2.5 py-1.5 bg-secondary/30 hover:bg-secondary/50 transition-all duration-200"
              >
                Login
              </button>
            )}

            {/* Mobile Menu Button - TechCenters */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={cn(
                'rounded-lg border border-border bg-secondary/30 text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all duration-300 flex items-center gap-1.5 px-3 py-1.5 hover:scale-105',
                mobileMenuOpen && 'bg-secondary/50 text-foreground'
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
          'fixed inset-0 z-40 bg-background/80 backdrop-blur-xl lg:hidden transition-all duration-500',
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setMobileMenuOpen(false)}
      >
        <div
          className={cn(
            'fixed right-0 top-0 h-full w-80 max-w-[85%] bg-background border-l border-border/50',
            'transform transition-all duration-500 ease-out',
            mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col h-full overflow-y-auto">
            {/* Mobile header */}
            <div className="flex items-center justify-between p-4 border-b border-border/30">
              <span className="text-sm font-medium text-muted-foreground">TechCenters</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-full p-1 hover:bg-secondary/30 transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* User section in mobile */}
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3 p-4 m-4 bg-secondary/30 rounded-xl border border-border">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-background"
                  style={{ background: `linear-gradient(135deg, ${techCenterColor}, ${techCenterColor}99)` }}
                >
                  {user?.firstName?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1">
                  <p className="text-foreground font-medium">{user?.firstName || 'User'}</p>
                  <p className="text-muted-foreground text-xs">Signed in</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2 p-4">
                <button
                  onClick={() => handleAuth('login')}
                  className="w-full rounded-xl border border-border bg-secondary/30 text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all duration-200 px-4 py-3 text-sm"
                >
                  Login
                </button>
                <button
                  onClick={() => handleAuth('register')}
                  className="w-full rounded-xl text-primary-foreground font-semibold transition-all duration-300 hover:scale-[1.02] px-4 py-3 text-sm"
                  style={{ backgroundColor: techCenterColor }}
                >
                  Get Started
                </button>
              </div>
            )}

            {/* Mobile navigation with current page highlight */}
            <nav className="flex-1 px-4 space-y-1">
              <div className="px-4 py-2">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                  Navigation
                </span>
              </div>
              {allLinks.map((link, index) => {
                const techCenter = techCenters.find((tc) => tc.slug === link.slug);
                const itemColor = techCenter?.color || (link.label === 'Home' ? techCenterColor : 'var(--muted-foreground)');
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
                        ? 'bg-secondary/50 text-foreground'
                        : 'text-muted-foreground hover:bg-secondary/30 hover:text-foreground'
                    )}
                    style={{
                      animation: mobileMenuOpen ? `fadeInUp 0.3s ease-out ${index * 0.05}s both` : 'none',
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
            <div className="p-4 mt-auto border-t border-border/30">
              {isAuthenticated && (
                <button
                  className="w-full rounded-xl bg-secondary/30 text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-all duration-200 px-4 py-3 text-sm"
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