'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Menu, X, Sparkles, Users, Calendar, Award, ChevronRight,
  Star, Heart, Shield, Clock, MapPin, Phone, Mail, ArrowUp,
  Cpu, Globe, Code, Home, Info, Briefcase, Contact, Send, CheckCircle, AlertCircle,
  Music, Headphones, Radio, PlayCircle
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import axios from '@/lib/axios';
import { useQueryClient } from '@tanstack/react-query';
import { fetchWithPrefetch } from '@/hooks/queries/useYouTubeMusicWithCache';

export default function HomePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, logout, clearAuth, isAuthenticated, fetchUser } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  
  // Contact form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });

  const homeRef = useRef<HTMLElement>(null);
  const aboutRef = useRef<HTMLElement>(null);
  const servicesRef = useRef<HTMLElement>(null);
  const contactRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 300], [1, 0.95]);
  const navBackground = useTransform(scrollY, [0, 50], ['rgba(0,0,0,0)', 'rgba(0,0,0,0.95)']);

  // ✅ FIXED: Use the store's fetchUser method instead of direct axios call
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Use the store's fetchUser method which handles cookies automatically
        await fetchUser();
      } catch (error) {
        console.error('Auth check failed:', error);
        clearAuth();
      } finally {
        setIsAuthChecked(true);
      }
    };
    
    checkAuth();
  }, [fetchUser, clearAuth]);

  // Prefetch music videos on page load for instant playback
  useEffect(() => {
    const prefetchVideos = async () => {
      const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      try {
        // Prefetch the default 'all' category
        await queryClient.prefetchQuery({
          queryKey: ['youtube-videos', 'all'],
          queryFn: () => fetchWithPrefetch('all', userId),
          staleTime: 30 * 60 * 1000, // 30 minutes
        });
        // Prefetch trending category as well
        await queryClient.prefetchQuery({
          queryKey: ['youtube-videos', 'trending'],
          queryFn: () => fetchWithPrefetch('trending', userId),
          staleTime: 30 * 60 * 1000,
        });
      } catch (error) {
        console.log('Video prefetch failed (non-critical):', error);
      }
    };

    // Prefetch after a short delay to not block initial render
    const timer = setTimeout(prefetchVideos, 1000);
    return () => clearTimeout(timer);
  }, [queryClient]);

  // Track active section based on scroll position
  useEffect(() => {
    const handleScrollActive = () => {
      const sections = [
        { id: 'home', ref: homeRef },
        { id: 'about', ref: aboutRef },
        { id: 'services', ref: servicesRef },
        { id: 'contact', ref: contactRef }
      ];

      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        if (section.ref.current) {
          const element = section.ref.current;
          const offsetTop = element.offsetTop;
          const offsetHeight = element.offsetHeight;

          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScrollActive);
    return () => window.removeEventListener('scroll', handleScrollActive);
  }, []);

  useEffect(() => {
    const video = document.createElement('video');
    video.src = '/freedomvideo.mp4';
    video.onloadeddata = () => setVideoLoaded(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      });
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const scrollToSection = (ref: React.RefObject<HTMLElement | null>, sectionId: string) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
    setActiveSection(sectionId);
    setMobileMenuOpen(false);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setActiveSection('home');
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const handleSignIn = () => {
    router.push('/login');
  };

  const handleGetStarted = () => {
    router.push('/register');
  };

  const handleDashboard = () => {
    router.push('/dashboard/overview');
  };

  const handleOpenMusicPlayer = () => {
    // Find and click the global music button
    const musicButton = document.querySelector('.global-music-button');
    if (musicButton) {
      (musicButton as HTMLButtonElement).click();
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone || !formData.message) {
      setSubmitStatus({ type: 'error', message: 'Please fill in all fields' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setSubmitStatus({ type: 'error', message: 'Please enter a valid email address' });
      return;
    }

    const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
    if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      setSubmitStatus({ type: 'error', message: 'Please enter a valid phone number' });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: '' });

    try {
      // ✅ FIXED: Use full API path with /api prefix
      const response = await axios.post('/api/contact', {
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phone,
        message: formData.message
      });
      
      if (response.data.success) {
        setSubmitStatus({ type: 'success', message: 'Message sent successfully! We\'ll get back to you soon.' });
        setFormData({ name: '', email: '', phone: '', message: '' });
      } else {
        setSubmitStatus({ type: 'error', message: response.data.message || 'Failed to send message. Please try again.' });
      }
    } catch (error) {
      console.error('Contact form error:', error);
      setSubmitStatus({ type: 'error', message: 'Network error. Please try again later.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const navLinks = [
    { id: 'home', name: 'Home', ref: homeRef, icon: <Home className="w-4 h-4" /> },
    { id: 'about', name: 'About', ref: aboutRef, icon: <Info className="w-4 h-4" /> },
    { id: 'services', name: 'Services', ref: servicesRef, icon: <Briefcase className="w-4 h-4" /> },
    { id: 'contact', name: 'Contact', ref: contactRef, icon: <Contact className="w-4 h-4" /> },
  ];

  // ✅ FIXED: Better loading state
  if (!isAuthChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-purple-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      <motion.div 
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(139, 92, 246, 0.15) 0%, transparent 60%)`,
        }}
      />

      <motion.nav 
        style={{ background: navBackground }}
        className="fixed top-0 w-full z-50 backdrop-blur-xl border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 md:h-20">
            {/* Logo */}
            <motion.div 
              className="flex items-center space-x-3 cursor-pointer"
              whileHover={{ scale: 1.05 }}
              onClick={scrollToTop}
            >
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <img src="/freedom.png" alt="Logo" className="w-8 h-8 object-contain" />
              </div>
              <span className="text-white font-bold text-base sm:text-lg md:text-xl">Freedom City Tech</span>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => (
                <motion.button
                  key={link.id}
                  onClick={() => scrollToSection(link.ref, link.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                    activeSection === link.id
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {link.icon}
                  <span className="text-sm font-medium">{link.name}</span>
                </motion.button>
              ))}
              
              <div className="w-px h-6 bg-white/20 mx-2"></div>
              
              {user && isAuthenticated ? (
                <div className="flex items-center space-x-3 ml-2">
                  <motion.span className="text-white text-sm px-2 py-1 bg-white/10 rounded-full">
                    👋 {user.firstName}
                  </motion.span>
                  <motion.button
                    onClick={handleDashboard}
                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-sm font-medium cursor-pointer hover:shadow-lg transition"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Dashboard
                  </motion.button>
                  <motion.button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-500/20 text-red-300 rounded-lg text-sm font-medium cursor-pointer hover:bg-red-500/30 transition"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Logout
                  </motion.button>
                </div>
              ) : (
                <div className="flex items-center space-x-3 ml-2">
                  <motion.button
                    onClick={handleSignIn}
                    className="px-4 py-2 text-gray-300 hover:text-white text-sm font-medium cursor-pointer hover:bg-white/10 rounded-lg transition"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Sign In
                  </motion.button>
                  <motion.button
                    onClick={handleGetStarted}
                    className="px-5 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-sm font-medium cursor-pointer hover:shadow-lg transition"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Get Started
                  </motion.button>
                </div>
              )}
            </div>

            <motion.button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-white p-3 rounded-lg hover:bg-white/10 transition"
              whileTap={{ scale: 0.9 }}
            >
              {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden fixed top-16 left-0 right-0 bg-black/95 backdrop-blur-xl border-t border-white/10 z-40"
          >
            <div className="px-4 py-6 space-y-2">
              {navLinks.map((link) => (
                <motion.button
                  key={link.id}
                  onClick={() => scrollToSection(link.ref, link.id)}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-all duration-300 ${
                    activeSection === link.id
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                  whileTap={{ scale: 0.98 }}
                >
                  {link.icon}
                  <span className="text-sm font-medium">{link.name}</span>
                </motion.button>
              ))}
              
              <div className="h-px bg-white/10 my-3"></div>
              
              {user && isAuthenticated ? (
                <>
                  <div className="px-4 py-2">
                    <p className="text-white text-sm">Signed in as</p>
                    <p className="text-purple-300 text-sm font-medium">{user.firstName} {user.lastName}</p>
                  </div>
                  <button
                    onClick={handleDashboard}
                    className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-center font-medium"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-3 bg-red-500/20 text-red-300 rounded-lg text-center font-medium"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleSignIn}
                    className="w-full px-4 py-3 text-white border border-white/20 rounded-lg text-center font-medium"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={handleGetStarted}
                    className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-center font-medium"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section ref={homeRef} id="home" className="relative min-h-screen flex items-center justify-center pt-20">
        <div className="absolute inset-0 z-0">
          {videoLoaded ? (
            <video
              ref={videoRef}
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
              style={{ filter: 'brightness(0.35)' }}
            >
              <source src="/freedomvideo.mp4" type="video/mp4" />
            </video>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-purple-900/50 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-purple-500/20 rounded-full px-4 py-2 mb-6"
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-purple-300 text-base sm:text-base">Welcome to Selfless CE</span>
            </motion.div>

            <h1 className="text-5xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                Freedom City
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Tech Center
              </span>
            </h1>
            
            <p className="text-lg sm:text-lg md:text-xl lg:text-2xl text-gray-300 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed">
              Empowering the next generation of tech leaders through innovative education, 
              hands-on experience, and community collaboration.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
              {user && isAuthenticated ? (
                <motion.button
                  onClick={handleDashboard}
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold text-base sm:text-lg cursor-pointer hover:shadow-xl transition"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Go to Dashboard
                </motion.button>
              ) : (
                <>
                  <motion.button
                    onClick={handleSignIn}
                    className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold text-base sm:text-lg cursor-pointer hover:shadow-xl transition"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Sign In
                  </motion.button>
                  <motion.button
                    onClick={handleGetStarted}
                    className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl font-semibold text-base sm:text-lg border border-white/20 cursor-pointer hover:bg-white/20 transition"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Get Started
                  </motion.button>
                </>
              )}
              
              {/* Relax Button - Beautiful Design */}
              <motion.button
                onClick={handleOpenMusicPlayer}
                className="relative w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold text-base sm:text-lg cursor-pointer transition-all duration-300 flex items-center justify-center gap-3 overflow-hidden group"
                whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  className="relative z-10"
                >
                  <Headphones className="w-5 h-5" />
                </motion.div>
                <span className="relative z-10">Relax & Unwind</span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                />
                <motion.div
                  className="absolute inset-0 bg-white/20"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.5 }}
                />
              </motion.button>
            </div>

            {/* Music Features Badges */}
            <motion.div
              className="flex flex-wrap items-center justify-center gap-3 mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full backdrop-blur-sm border border-white/10">
                <Radio className="w-3 h-3 text-green-400" />
                <span className="text-xs text-gray-300">Trending Music</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full backdrop-blur-sm border border-white/10">
                <PlayCircle className="w-3 h-3 text-green-400" />
                <span className="text-xs text-gray-300">Play in Background</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full backdrop-blur-sm border border-white/10">
                <Music className="w-3 h-3 text-green-400" />
                <span className="text-xs text-gray-300">Unlimited Access</span>
              </div>
            </motion.div>

            <motion.div
              className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
                <motion.div
                  animate={{ y: [0, 15, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-1 h-2 bg-white/50 rounded-full mt-2"
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section ref={aboutRef} id="about" className="relative py-24 bg-black/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 bg-purple-500/20 rounded-full px-4 py-1 mb-4"
            >
              <Heart className="w-4 h-4 text-purple-400" />
              <span className="text-purple-300 text-sm">About Us</span>
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">About Us</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto" />
          </motion.div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <p className="text-gray-300 text-lg leading-relaxed">
                Freedom City Tech Center is dedicated to providing quality tech education and resources to our community. 
                Our state-of-the-art facility and expert instructors create an environment where innovation thrives.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Heart, text: "Community Driven", color: "purple" },
                  { icon: Shield, text: "Safe & Clean", color: "pink" },
                  { icon: Users, text: "Expert Instructors", color: "blue" },
                  { icon: Star, text: "Excellence", color: "green" }
                ].map((item, index) => (
                  <motion.div 
                    key={index}
                    className="flex items-center space-x-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ scale: 1.05, x: 5 }}
                  >
                    <div className={`w-10 h-10 bg-${item.color}-500/20 rounded-lg flex items-center justify-center`}>
                      <item.icon className={`w-5 h-5 text-${item.color}-400`} />
                    </div>
                    <span className="text-gray-300">{item.text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            <motion.div 
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                className="absolute -inset-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur-2xl opacity-30"
                animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              <img
                src="/freedomcity.jpeg"
                alt="Freedom City Tech Center"
                className="rounded-2xl shadow-2xl relative z-10 w-full h-auto"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section ref={servicesRef} id="services" className="relative py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 bg-purple-500/20 rounded-full px-4 py-1 mb-4"
            >
              <Award className="w-4 h-4 text-purple-400" />
              <span className="text-purple-300 text-sm">Our Services</span>
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Our Services</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto" />
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Calendar className="w-8 h-8" />,
                title: "Easy Registration",
                description: "Simple and quick cleaning schedule registration system",
                features: ["24/7 Access", "Instant Confirmation", "Email Updates"],
                color: "from-purple-500 to-pink-500"
              },
              {
                icon: <Clock className="w-8 h-8" />,
                title: "Flexible Scheduling",
                description: "Choose your preferred learning slots that fit your schedule",
                features: ["Morning Classes", "Evening Sessions", "Weekend Workshops"],
                color: "from-blue-500 to-cyan-500"
              },
              {
                icon: <Award className="w-8 h-8" />,
                title: "Recognition Program",
                description: "Earn certificates and rewards for your dedication",
                features: ["Industry Recognized", "Project Based", "Career Support"],
                color: "from-orange-500 to-red-500"
              }
            ].map((service, index) => (
              <motion.div
                key={index}
                className="group relative bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all duration-300"
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -10, boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}
              >
                <motion.div 
                  className={`w-16 h-16 bg-gradient-to-r ${service.color} rounded-xl flex items-center justify-center mb-6 text-white shadow-lg`}
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                >
                  {service.icon}
                </motion.div>
                <h3 className="text-xl font-bold text-white mb-3">{service.title}</h3>
                <p className="text-gray-400 mb-4">{service.description}</p>
                <div className="space-y-2">
                  {service.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-500">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                <motion.div 
                  className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-b-2xl"
                  initial={{ width: 0 }}
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section with Form */}
      <section ref={contactRef} id="contact" className="relative py-24 bg-black/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 bg-purple-500/20 rounded-full px-4 py-1 mb-4"
            >
              <Mail className="w-4 h-4 text-purple-400" />
              <span className="text-purple-300 text-sm">Get In Touch</span>
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Contact Us</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto" />
          </motion.div>
          
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Info */}
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              {[
                { icon: MapPin, label: "Visit Us", value: "Freedom City Tech Center, Kampala, Uganda", detail: "Monday - Friday, 9am - 6pm" },
                { icon: Phone, label: "Call Us", value: "+256 761 996 296", detail: "Available 24/7 for support" },
                { icon: Mail, label: "Email Us", value: "turyamurebanicholus@gmail.com", detail: "We'll respond within 24 hours" }
              ].map((item, index) => (
                <motion.div 
                  key={index}
                  className="flex items-start space-x-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ x: 10 }}
                >
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-gray-300 font-semibold text-lg">{item.label}</p>
                    <p className="text-white text-base">{item.value}</p>
                    <p className="text-gray-500 text-sm mt-1">{item.detail}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
            
            {/* Contact Form */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <form onSubmit={handleSubmit} className="space-y-4 p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
                <AnimatePresence>
                  {submitStatus.type && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`p-3 rounded-lg flex items-center gap-2 ${
                        submitStatus.type === 'success' 
                          ? 'bg-green-500/20 border border-green-500/50 text-green-300' 
                          : 'bg-red-500/20 border border-red-500/50 text-red-300'
                      }`}
                    >
                      {submitStatus.type === 'success' ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <AlertCircle className="w-4 h-4" />
                      )}
                      <span className="text-sm">{submitStatus.message}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div>
                  <label className="block text-base font-medium text-gray-300 mb-2">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+256 123 456 789"
                    className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Message *</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Tell us how we can help you..."
                    className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
                    required
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Send Message</span>
                    </>
                  )}
                </motion.button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src="/freedom.png" alt="Logo" className="w-8 h-8" />
                <span className="text-white font-bold">Freedom City Tech</span>
              </div>
              <p className="text-gray-400 text-sm">Empowering the next generation through technology education.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><button onClick={scrollToTop} className="hover:text-purple-400 transition">Home</button></li>
                <li><button onClick={() => scrollToSection(aboutRef, 'about')} className="hover:text-purple-400 transition">About</button></li>
                <li><button onClick={() => scrollToSection(servicesRef, 'services')} className="hover:text-purple-400 transition">Services</button></li>
                <li><button onClick={() => scrollToSection(contactRef, 'contact')} className="hover:text-purple-400 transition">Contact</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-purple-400 transition">Blog</a></li>
                <li><a href="#" className="hover:text-purple-400 transition">FAQs</a></li>
                <li><a href="#" className="hover:text-purple-400 transition">Support</a></li>
                <li><a href="#" className="hover:text-purple-400 transition">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Follow Us</h4>
              <div className="flex gap-3">
                {["FB", "TW", "LI", "IG"].map((social, i) => (
                  <motion.a
                    key={i}
                    href="#"
                    className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-purple-500/50 transition-colors"
                    whileHover={{ scale: 1.1 }}
                  >
                    <span className="text-xs text-white">{social}</span>
                  </motion.a>
                ))}
              </div>
            </div>
          </div>
          <div className="text-center pt-8 border-t border-white/10">
            <p className="text-gray-400 text-sm">
              © 2024 Freedom City Tech Center. Created by Atbriz Nicholus. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            onClick={scrollToTop}
            className="fixed bottom-24 right-8 z-50 w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg group"
            initial={{ opacity: 0, scale: 0, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0, y: 100 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ArrowUp className="w-5 h-5 text-white" />
            </motion.div>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}