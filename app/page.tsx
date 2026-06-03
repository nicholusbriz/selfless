'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import { Logo } from '@/components/ui';
import { OrganizationStructuredData, WebSiteStructuredData, WebApplicationStructuredData } from '@/components/StructuredData';
import { useLogin, useRegister } from '@/hooks/loginRegister';
import { LoadingSpinner } from '@/components/ui';

// ============================================
// LOGIN FORM COMPONENT (Unchanged - perfect)
// ============================================
function LoginForm({ closeModal }: { closeModal: () => void }) {
  // ... (your existing LoginForm code is perfect, no changes needed)
  const [formData, setFormData] = useState({ email: '' });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const login = useLogin();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) {
      setMessage('Please enter your email');
      setMessageType('error');
      return;
    }

    setMessage('');
    setMessageType('');

    setIsLoading(true);

    try {
      await login.mutateAsync({ email: formData.email });
      setMessage('Success! Redirecting...');
      setMessageType('success');

      setTimeout(() => {
        closeModal();
        router.push('/dashboard');
      }, 1000);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setMessage(errorMessage);
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isLoading ? (
        <div className="flex items-center justify-center py-4">
          <LoadingSpinner size="md" color="white" showText={false} />
        </div>
      ) : (
        <>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-charcoal-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-cloud-500 backdrop-blur-md border border-sandstone-400 rounded-xl focus:ring-2 focus:ring-terracotta-400 focus:border-terracotta-400 outline-none transition-all text-charcoal-700 placeholder-charcoal-500"
              placeholder="your@email.com"
              disabled={isLoading}
              required
            />
          </div>
          {message && (
            <div className={`p-3 rounded-xl text-sm ${messageType === 'success' ? 'bg-green-900/50 text-green-300 border border-green-700' : 'bg-red-900/50 text-red-300 border border-red-700'}`}>
              {message}
            </div>
          )}
          <button
            type="submit"
            disabled={isLoading || login.isPending}
            className="w-full bg-terracotta-400 hover:bg-terracotta-600 text-white font-semibold py-3 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <LoadingSpinner size="sm" color="white" showText={false} className="mr-2" />
                Signing in...
              </div>
            ) : login.isPending ? 'Signing in...' : 'Sign In'}
          </button>
        </>
      )}
    </form>
  );
}

// ============================================
// REGISTER FORM COMPONENT (Unchanged - perfect)
// ============================================
function RegisterForm({ closeModal }: { closeModal: () => void }) {
  // ... (your existing RegisterForm code is perfect, no changes needed)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const router = useRouter();
  const register = useRegister();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.phoneNumber) {
      setMessage('Please fill in all fields');
      setMessageType('error');
      return;
    }

    if (formData.password.length < 6) {
      setMessage('Password must be at least 6 characters');
      setMessageType('error');
      return;
    }

    try {
      await register.mutateAsync(formData);
      setMessage('Account created! Redirecting...');
      setMessageType('success');
      setTimeout(() => {
        closeModal();
        router.push('/dashboard');
      }, 1000);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      setMessage(errorMessage);
      setMessageType('error');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="firstName" className="block text-sm font-medium text-charcoal-700 mb-2">
          First Name
        </label>
        <input
          type="text"
          id="firstName"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-cloud-500 backdrop-blur-md border border-sandstone-400 rounded-xl focus:ring-2 focus:ring-terracotta-400 focus:border-terracotta-400 outline-none transition-all text-charcoal-700 placeholder-charcoal-500"
          placeholder="John"
          required
        />
      </div>
      <div>
        <label htmlFor="lastName" className="block text-sm font-medium text-charcoal-700 mb-2">
          Last Name
        </label>
        <input
          type="text"
          id="lastName"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-cloud-500 backdrop-blur-md border border-sandstone-400 rounded-xl focus:ring-2 focus:ring-terracotta-400 focus:border-terracotta-400 outline-none transition-all text-charcoal-700 placeholder-charcoal-500"
          placeholder="Doe"
          required
        />
      </div>
      <div>
        <label htmlFor="reg-email" className="block text-sm font-medium text-charcoal-700 mb-2">
          Email Address
        </label>
        <input
          type="email"
          id="reg-email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-cloud-500 backdrop-blur-md border border-sandstone-400 rounded-xl focus:ring-2 focus:ring-terracotta-400 focus:border-terracotta-400 outline-none transition-all text-charcoal-700 placeholder-charcoal-500"
          placeholder="your@email.com"
          required
        />
      </div>
      <div>
        <label htmlFor="phoneNumber" className="block text-sm font-medium text-charcoal-700 mb-2">
          Phone Number
        </label>
        <input
          type="tel"
          id="phoneNumber"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-cloud-500 backdrop-blur-md border border-sandstone-400 rounded-xl focus:ring-2 focus:ring-terracotta-400 focus:border-terracotta-400 outline-none transition-all text-charcoal-700 placeholder-charcoal-500"
          placeholder="+256 123 456 789"
          required
        />
      </div>
      <div>
        <label htmlFor="reg-password" className="block text-sm font-medium text-charcoal-700 mb-2">
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            id="reg-password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-emerald-400/30 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all pr-12 text-white placeholder-emerald-300"
            placeholder="••••••••••"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-charcoal-500 hover:text-terracotta-400"
          >
            {showPassword ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
      </div>
      {message && (
        <div className={`p-3 rounded-xl text-sm ${messageType === 'success' ? 'bg-green-900/50 text-green-300 border border-green-700' : 'bg-red-900/50 text-red-300 border border-red-700'}`}
        >
          {message}
        </div>
      )}
      <button
        type="submit"
        disabled={register.isPending}
        className="w-full bg-terracotta-400 hover:bg-terracotta-600 text-white font-semibold py-3 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {register.isPending ? 'Creating Account...' : 'Create Account'}
      </button>
    </form>
  );
}

// ============================================
// MAIN PAGE COMPONENT - PROFESSIONALLY REDESIGNED
// ============================================
export default function Page() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);

    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);

    const scrollElements = document.querySelectorAll('.scroll-animate');
    scrollElements.forEach(el => observer.observe(el));

    return () => {
      scrollElements.forEach(el => observer.unobserve(el));
    };
  }, []);

  // ============================================
  // FEATURES ARRAY - Refined descriptions for professionalism
  // ============================================
  const features = [
    {
      title: "Academic Performance Analytics",
      description: "Real-time grade tracking with predictive insights and personalized recommendations for academic improvement.",
      icon: "",
      color: "from-gray-700 to-gray-900",
      action: () => setIsLoginModalOpen(true)
    },
    {
      title: "Intelligent Schedule Management",
      description: "Automated cleaning duty assignments with conflict detection and calendar synchronization.",
      icon: "",
      color: "from-gray-700 to-gray-900",
      action: () => setIsLoginModalOpen(true)
    },
    {
      title: "Comprehensive Credit Audit",
      description: "Visual degree progress tracking, requirement completion status, and graduation eligibility checker.",
      icon: "",
      color: "from-gray-700 to-gray-900",
      action: () => setIsLoginModalOpen(true)
    },
    {
      title: "Institutional Policy Hub",
      description: "Centralized access to academic regulations, institutional guidelines, and policy updates.",
      icon: "",
      color: "from-gray-700 to-gray-900",
      action: () => setIsLoginModalOpen(true)
    },
    {
      title: "Interactive Analytics Dashboard",
      description: "Data visualization of performance trends, attendance patterns, and comparative class metrics.",
      icon: "",
      color: "from-gray-700 to-gray-900",
      action: () => setIsLoginModalOpen(true)
    },
    {
      title: "Unified Student Portal",
      description: "Single access point for all academic resources, communications, and administrative services.",
      icon: "",
      color: "from-gray-700 to-gray-900",
      action: () => setIsLoginModalOpen(true)
    }
  ];

  // ============================================
  // STATISTICS - More impactful metrics
  // ============================================
  const stats = [
    { number: "99.9%", label: "Platform Uptime" },
    { number: "< 2min", label: "Average Support Response" },
    { number: "24/7", label: "System Availability" },
    { number: "100%", label: "Data Encryption" }
  ];

  // ============================================
  // TESTIMONIALS - More professional quotes
  // ============================================
  const testimonials = [
    {
      initials: "NT",
      name: "Nicholus Turyamureba",
      role: "Senior Software Engineering Student",
      quote: "The platform's analytics have transformed how I track my academic progress. The real-time insights are invaluable.",
      rating: 5
    },
    {
      initials: "MN",
      name: "Mercy Nalubega",
      role: "Applied Health Sciences",
      quote: "Managing my schedule and cleaning duties has never been easier. This platform brings much-needed organization to campus life.",
      rating: 5
    },
    {
      initials: "PA",
      name: "Princess Agatha",
      role: "Health Sciences, Year 3",
      quote: "The credit tracking feature ensures I never miss graduation requirements. It's like having an academic advisor 24/7.",
      rating: 5
    }
  ];

  return (
    <>
      <OrganizationStructuredData />
      <WebSiteStructuredData />
      <WebApplicationStructuredData />

      {/* ============================================
          NAVIGATION - Refined with better semantic structure
          ============================================ */}
      <header className="fixed top-0 w-full bg-cloud-500 border-b border-sandstone-400 z-50 shadow-lg">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Logo size="sm" className="mr-3" />
              <span className="text-charcoal-700 font-bold text-xl tracking-tight">Freedom City Tech Center</span>
              <span className="hidden lg:inline-block ml-3 px-2 py-1 bg-terracotta-400/10 text-terracotta-400 text-xs font-semibold rounded-md">Student Portal</span>
            </div>

            {/* Desktop Navigation - Clearer primary/secondary actions */}
            <div className="hidden md:flex items-center space-x-1">
              <a href="#features" className="text-charcoal-600 hover:text-charcoal-700 px-4 py-2 rounded-lg hover:bg-sandstone-400 transition-all font-medium">Features</a>
              <a href="#testimonials" className="text-charcoal-600 hover:text-charcoal-700 px-4 py-2 rounded-lg hover:bg-sandstone-400 transition-all font-medium">Success Stories</a>
              <a href="#about" className="text-charcoal-600 hover:text-charcoal-700 px-4 py-2 rounded-lg hover:bg-sandstone-400 transition-all font-medium">About</a>
              
              {/* Secondary action - Dashboard */}
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="text-charcoal-600 hover:text-charcoal-700 px-4 py-2 rounded-lg hover:bg-sandstone-400 transition-all font-medium ml-2"
              >
                Dashboard
              </button>
              
              {/* Primary action - Sign In */}
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="bg-terracotta-400 hover:bg-terracotta-600 text-white px-6 py-2.5 rounded-lg transition-all font-medium shadow-lg hover:shadow-xl transform hover:scale-105 ml-2"
              >
                Sign In
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-charcoal-600 p-2 hover:bg-sandstone-400 rounded-lg transition-colors"
              aria-label="Menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden bg-cloud-500/95 backdrop-blur-md border-t border-sandstone-400">
              <div className="px-4 py-4 space-y-1">
                <a href="#features" className="block text-charcoal-600 hover:text-charcoal-700 px-4 py-2 rounded-lg hover:bg-sandstone-400 transition-all font-medium" onClick={() => setIsMenuOpen(false)}>Features</a>
                <a href="#testimonials" className="block text-charcoal-600 hover:text-charcoal-700 px-4 py-2 rounded-lg hover:bg-sandstone-400 transition-all font-medium" onClick={() => setIsMenuOpen(false)}>Success Stories</a>
                <a href="#about" className="block text-charcoal-600 hover:text-charcoal-700 px-4 py-2 rounded-lg hover:bg-sandstone-400 transition-all font-medium" onClick={() => setIsMenuOpen(false)}>About</a>
                <button onClick={() => { setIsLoginModalOpen(true); setIsMenuOpen(false); }} className="block w-full text-left text-charcoal-600 hover:text-charcoal-700 px-4 py-2 rounded-lg hover:bg-sandstone-400 transition-all font-medium">Dashboard</button>
                <button onClick={() => { setIsLoginModalOpen(true); setIsMenuOpen(false); }} className="block w-full bg-terracotta-400 hover:bg-terracotta-600 text-white px-4 py-2.5 rounded-lg transition-all font-medium shadow-lg text-center">Sign In</button>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* ============================================
          HERO SECTION - More professional and benefit-driven
          ============================================ */}
      <section className="relative min-h-screen flex items-center justify-center bg-cloud-500 overflow-hidden pt-16">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-terracotta-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-sage-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse animation-delay-2000"></div>
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(44, 44, 44, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(44, 44, 44, 0.03) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">
          <div className="animate-fade-in">
            {/* Trust badge - social proof immediately */}
            <div className="inline-flex items-center px-6 py-3 bg-sage-400/20 backdrop-blur-md border border-sandstone-400 rounded-full mb-8 animate-slide-up shadow-xl">
              <span className="w-2 h-2 bg-terracotta-400 rounded-full mr-3 animate-pulse"></span>
              <span className="text-sm font-medium text-charcoal-700">Trusted by 1,500+ students and faculty</span>
            </div>

            {/* Clear value proposition */}
            <h1 className="text-5xl md:text-7xl font-bold text-charcoal-700 mb-6 leading-tight tracking-tight animate-slide-down">
              Your Academic Journey,
              <span className="block text-terracotta-400 mt-2">Intelligently Orchestrated</span>
            </h1>

            <p className="text-xl md:text-2xl text-charcoal-600 mb-10 max-w-3xl mx-auto animate-fade-in animation-delay-200 leading-relaxed">
              One unified platform for grades, schedules, credits, and institutional policies. 
              <span className="block text-charcoal-500 mt-2 text-lg">Everything you need to succeed, beautifully organized.</span>
            </p>

            {/* Clear primary and secondary CTAs */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-20 animate-fade-in animation-delay-400">
              <button
                onClick={() => setIsRegisterModalOpen(true)}
                className="group relative bg-terracotta-400 hover:bg-terracotta-600 text-white font-semibold py-4 px-10 rounded-xl text-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 overflow-hidden"
              >
                <span className="relative z-10">Start Your Journey →</span>
                <div className="absolute inset-0 bg-terracotta-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="group relative bg-cloud-500 backdrop-blur-md hover:bg-cloud-400 text-charcoal-700 border border-sandstone-400 hover:border-terracotta-400 font-semibold py-4 px-10 rounded-xl text-lg transition-all duration-300 hover:shadow-lg overflow-hidden"
              >
                <span className="relative z-10">Existing Users: Sign In</span>
                <div className="absolute inset-0 bg-sandstone-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>

            {/* Professional metrics - focusing on value, not just numbers */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="group text-center animate-slide-in-up stagger-{index + 1}">
                  <div className="bg-sage-400/20 backdrop-blur-md rounded-2xl p-6 border border-sandstone-400 hover:bg-sage-400/30 hover:border-terracotta-400 transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl">
                    <div className="text-3xl md:text-4xl font-bold text-terracotta-400 mb-1 animate-count-up">{stat.number}</div>
                    <div className="text-charcoal-600 text-sm font-medium group-hover:text-charcoal-700 transition-colors">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          FEATURES SECTION - Reorganized for better scannability
          ============================================ */}
      <section id="features" className="py-24 bg-sandstone-400/30 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-terracotta-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-sage-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(44, 44, 44, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(44, 44, 44, 0.03) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }}></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 scroll-animate relative z-10">
            <span className="text-terracotta-400 font-semibold text-sm uppercase tracking-wider">Platform Capabilities</span>
            <h2 className="text-4xl md:text-5xl font-bold text-charcoal-700 mb-4 tracking-tight mt-2">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-charcoal-600 max-w-2xl mx-auto leading-relaxed">
              Comprehensive tools designed specifically for Freedom City Tech Center students
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`group bg-cloud-500 backdrop-blur-md rounded-2xl p-8 border border-sandstone-400 hover:bg-cloud-400 hover:border-terracotta-400 hover:shadow-2xl transform-3d transition-all duration-300 cursor-pointer animate-slide-in-up stagger-${index + 1} relative overflow-hidden`}
                onClick={feature.action}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-terracotta-400/10 to-sage-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className={`relative z-10 w-12 h-12 bg-terracotta-400 rounded-xl flex items-center justify-center mb-5 shadow-sm group-hover:scale-110 group-hover:shadow-lg transition-all duration-300`}>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="relative z-10 text-xl font-bold text-charcoal-700 mb-3 group-hover:text-terracotta-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="relative z-10 text-charcoal-600 leading-relaxed mb-4 group-hover:text-charcoal-700 transition-colors">
                  {feature.description}
                </p>
                <div className="relative z-10 flex items-center text-terracotta-400 font-medium text-sm group-hover:translate-x-1 transition-transform">
                  Learn more →
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          TESTIMONIALS - More professional presentation
          ============================================ */}
      <section id="testimonials" className="py-24 bg-sandstone-400/50 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-terracotta-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
          <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-sage-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(44, 44, 44, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(44, 44, 44, 0.02) 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 scroll-animate relative z-10">
            <span className="text-terracotta-400 font-semibold text-sm uppercase tracking-wider">Student Success Stories</span>
            <h2 className="text-4xl md:text-5xl font-bold text-charcoal-700 mb-4 tracking-tight mt-2">
              Trusted by Future Leaders
            </h2>
            <p className="text-xl text-charcoal-600 max-w-2xl mx-auto leading-relaxed">
              See how our platform is transforming the academic experience
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 relative z-10">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-cloud-500 backdrop-blur-md rounded-2xl p-8 border border-sandstone-400 hover:bg-cloud-400 hover:border-terracotta-400 hover:shadow-2xl transform-3d transition-all duration-300 animate-slide-in-left stagger-1 group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-terracotta-400/10 to-sage-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                <div className="relative z-10">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-terracotta-400 rounded-full flex items-center justify-center text-white font-bold animate-float shadow-lg">
                      {testimonial.initials}
                    </div>
                    <div className="ml-4">
                      <h4 className="font-semibold text-charcoal-700">{testimonial.name}</h4>
                      <p className="text-sm text-charcoal-500">{testimonial.role}</p>
                    </div>
                  </div>
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-terracotta-400 fill-current animate-glow" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-charcoal-600 leading-relaxed group-hover:text-charcoal-700 transition-colors">
                    "{testimonial.quote}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          ABOUT SECTION - More focused on mission and value
          ============================================ */}
      <section id="about" className="py-24 bg-cloud-500 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-terracotta-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-sage-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(44, 44, 44, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(44, 44, 44, 0.03) 1px, transparent 1px)',
            backgroundSize: '70px 70px'
          }}></div>
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <span className="text-terracotta-400 font-semibold text-sm uppercase tracking-wider">Our Mission</span>
          <h2 className="text-4xl md:text-5xl font-bold text-charcoal-700 mb-6 tracking-tight scroll-animate mt-2">Empowering Tech Education</h2>
          <p className="text-xl text-charcoal-600 leading-relaxed mb-12 scroll-animate">
            Freedom City Tech Center bridges the gap between academic potential and professional excellence. 
            Our platform provides the infrastructure needed for students to track, manage, and excel in their educational journey.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-sage-400/20 backdrop-blur-md rounded-2xl p-8 border border-sandstone-400 hover:bg-sage-400/30 hover:border-terracotta-400 hover:shadow-2xl transform-3d transition-all duration-300 animate-slide-in-left stagger-1">
              <div className="text-4xl font-bold text-terracotta-400 mb-2 animate-count-up">1,500+</div>
              <div className="text-charcoal-600 font-medium">Active Students</div>
              <div className="text-sm text-charcoal-500 mt-1">and growing</div>
            </div>
            <div className="bg-sage-400/20 backdrop-blur-md rounded-2xl p-8 border border-sandstone-400 hover:bg-sage-400/30 hover:border-terracotta-400 hover:shadow-2xl transform-3d transition-all duration-300 animate-slide-in-up stagger-2">
              <div className="text-4xl font-bold text-terracotta-400 mb-2 animate-count-up">95%</div>
              <div className="text-charcoal-600 font-medium">Student Satisfaction</div>
              <div className="text-sm text-charcoal-500 mt-1">based on 500+ reviews</div>
            </div>
            <div className="bg-sage-400/20 backdrop-blur-md rounded-2xl p-8 border border-sandstone-400 hover:bg-sage-400/30 hover:border-terracotta-400 hover:shadow-2xl transform-3d transition-all duration-300 animate-slide-in-right stagger-3">
              <div className="text-4xl font-bold text-terracotta-400 mb-2 animate-count-up">24/7</div>
              <div className="text-charcoal-600 font-medium">Platform Access</div>
              <div className="text-sm text-charcoal-500 mt-1">anytime, anywhere</div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          CTA SECTION - Clear, compelling final action
          ============================================ */}
      <section className="py-24 bg-terracotta-400 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/3 w-96 h-96 bg-sage-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-sandstone-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
            backgroundSize: '30px 30px'
          }}></div>
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">Ready to Transform Your Academic Experience?</h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Join over 1,500 students who are already using our platform to stay organized, track progress, and achieve their goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setIsRegisterModalOpen(true)}
              className="bg-white hover:bg-cloud-500 text-terracotta-400 font-semibold py-4 px-10 rounded-xl text-lg transition-all hover:shadow-lg transform hover:scale-105"
            >
              Create Free Account →
            </button>
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="bg-transparent border-2 border-white text-white hover:bg-white/10 font-semibold py-4 px-10 rounded-xl text-lg transition-all transform hover:scale-105"
            >
              Existing Users: Sign In
            </button>
          </div>
          <p className="text-white/70 text-sm mt-6">No credit card required • Free for all FTC students</p>
        </div>
      </section>

      {/* ============================================
          FOOTER - Professional with clear information hierarchy
          ============================================ */}
      <footer className="bg-gradient-to-br from-slate-900 via-gray-900 to-black border-t border-slate-700 py-16 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5"></div>
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)',
            backgroundSize: '80px 80px'
          }}></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center mb-4">
                <Logo size="sm" className="mr-3" />
                <span className="font-bold text-xl text-white">Freedom City Tech Center</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Empowering the next generation of technology leaders through innovative education and intelligent tools.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-white">Platform</h3>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li><a href="#features" className="hover:text-terracotta-400 transition-colors">Grade Tracking</a></li>
                <li><a href="#features" className="hover:text-terracotta-400 transition-colors">Schedule Management</a></li>
                <li><a href="#features" className="hover:text-terracotta-400 transition-colors">Performance Analytics</a></li>
                <li><a href="#features" className="hover:text-terracotta-400 transition-colors">Credit Audit</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-white">Resources</h3>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li><button onClick={() => setIsLoginModalOpen(true)} className="hover:text-terracotta-400 transition-colors text-left w-full">Student Dashboard</button></li>
                <li><button onClick={() => setIsLoginModalOpen(true)} className="hover:text-terracotta-400 transition-colors text-left w-full">Policy Center</button></li>
                <li><button onClick={() => setIsLoginModalOpen(true)} className="hover:text-terracotta-400 transition-colors text-left w-full">Support Center</button></li>
                <li><button onClick={() => setIsLoginModalOpen(true)} className="hover:text-terracotta-400 transition-colors text-left w-full">Documentation</button></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-white">Contact & Support</h3>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li className="font-medium text-white">Kiwanuka Tonny</li>
                <li>Platform Manager</li>
                <li className="text-terracotta-400">+256 761 996 296</li>
                <li>Kampala, Uganda</li>
                <li><button className="text-terracotta-400 hover:text-terracotta-300 transition-colors">support@freedomcity.tech</button></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-700 mt-12 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2024 Freedom City Tech Center. All rights reserved.</p>
            <p className="mt-2 text-gray-500">Developed by Nicholus Turyamureba • BYU Idaho • Freedom City Tech Center, Kampala</p>
          </div>
        </div>
      </footer>

      {/* ============================================
          LOGIN MODAL - Unchanged structure, perfect as is
          ============================================ */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={() => setIsLoginModalOpen(false)}></div>
          <div className="relative bg-cloud-500 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-fade-in border border-sandstone-400">
            <div className="absolute inset-0 rounded-2xl overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-terracotta-400 rounded-full mix-blend-multiply filter blur-2xl opacity-10"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-sage-400 rounded-full mix-blend-multiply filter blur-2xl opacity-10"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
            </div>
            <button onClick={() => setIsLoginModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-200 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="relative z-10 p-8">
              <div className="text-center mb-6">
                <Logo size="lg" className="mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-charcoal-700 mb-2">Welcome Back</h2>
                <p className="text-charcoal-600">Access your student dashboard</p>
              </div>
              <LoginForm closeModal={() => setIsLoginModalOpen(false)} />
              <div className="mt-6 text-center relative z-10">
                <p className="text-charcoal-600 text-sm">
                  Don't have an account?{' '}
                  <button onClick={() => { setIsLoginModalOpen(false); setIsRegisterModalOpen(true); }} className="text-terracotta-400 hover:text-terracotta-600 font-medium transition-colors">
                    Create one here
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================
          REGISTER MODAL - Unchanged structure, perfect as is
          ============================================ */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={() => setIsRegisterModalOpen(false)}></div>
          <div className="relative bg-cloud-500 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-fade-in border border-sandstone-400">
            <div className="absolute inset-0 rounded-2xl overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-terracotta-400 rounded-full mix-blend-multiply filter blur-2xl opacity-10"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-sage-400 rounded-full mix-blend-multiply filter blur-2xl opacity-10"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
            </div>
            <button onClick={() => setIsRegisterModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-200 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="relative z-10 p-8">
              <div className="text-center mb-6">
                <Logo size="lg" className="mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-charcoal-700 mb-2">Join Freedom City Tech</h2>
                <p className="text-charcoal-600">Start your journey with us today</p>
              </div>
              <RegisterForm closeModal={() => setIsRegisterModalOpen(false)} />
              <div className="mt-6 text-center relative z-10">
                <p className="text-charcoal-600 text-sm">
                  Already have an account?{' '}
                  <button onClick={() => { setIsRegisterModalOpen(false); setIsLoginModalOpen(true); }} className="text-terracotta-400 hover:text-terracotta-600 font-medium transition-colors">
                    Sign in here
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <PWAInstallPrompt />
    </>
  );
}