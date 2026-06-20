'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Menu, X, Sparkles, Users, Calendar, Award, ChevronRight,
  Star, Heart, Shield, Clock, MapPin, Phone, Mail, ArrowUp,
  Cpu, Globe, Code, Home, Info, Briefcase, Contact, Send, CheckCircle, AlertCircle,
  TrendingUp, BookOpen, GraduationCap, Zap, Flame, Target, Building,
  Coffee, Wifi, Monitor, DollarSign, FileCheck, Briefcase as BriefcaseIcon,
  GraduationCap as GraduationCapIcon, School, Users as UsersIcon, 
  MapPin as MapPinIcon, Phone as PhoneIcon, Mail as MailIcon, 
  Clock as ClockIcon, Award as AwardIcon, CheckCircle as CheckCircleIcon,
  ExternalLink, Book, PenTool, MessageCircle, ThumbsUp, Laptop, WifiOff,
  Rocket, Compass
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import axios from '@/lib/axios';
import { useQueryClient } from '@tanstack/react-query';

export default function HomePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, logout, isAuthenticated, fetchUser } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  // Check for active token on page load
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const [animatedStats, setAnimatedStats] = useState<{ [key: string]: number }>({});
  
  // Animate statistics on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const stats = [
              { id: 'centers', value: 7 },
              { id: 'students', value: 2847 },
              { id: 'graduates', value: 156 },
              { id: 'success', value: 94 }
            ];
            
            stats.forEach((stat) => {
              const duration = 2000;
              const steps = 60;
              const increment = stat.value / steps;
              let current = 0;
              
              const timer = setInterval(() => {
                current += increment;
                if (current >= stat.value) {
                  current = stat.value;
                  clearInterval(timer);
                }
                setAnimatedStats((prev) => ({
                  ...prev,
                  [stat.id]: Math.floor(current)
                }));
              }, duration / steps);
            });
          }
        });
      },
      { threshold: 0.5 }
    );
    
    const statsSection = document.getElementById('stats-section');
    if (statsSection) {
      observer.observe(statsSection);
    }
    
    return () => observer.disconnect();
  }, []);

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
  const techCentersRef = useRef<HTMLElement>(null);
  const programsRef = useRef<HTMLElement>(null);
  const contactRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 300], [1, 0.95]);
  const heroY = useTransform(scrollY, [0, 300], [0, -50]);
  const navBackground = useTransform(scrollY, [0, 50], ['rgba(0,0,0,0)', 'rgba(0,0,0,0.95)']);

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

  // Track active section based on scroll position
  useEffect(() => {
    const handleScrollActive = () => {
      const sections = [
        { id: 'home', ref: homeRef },
        { id: 'about', ref: aboutRef },
        { id: 'techcenters', ref: techCentersRef },
        { id: 'programs', ref: programsRef },
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
    { id: 'techcenters', name: 'Tech Centers', ref: techCentersRef, icon: <Building className="w-4 h-4" /> },
    { id: 'programs', name: 'Programs', ref: programsRef, icon: <BookOpen className="w-4 h-4" /> },
    { id: 'services', name: 'Services', ref: servicesRef, icon: <Briefcase className="w-4 h-4" /> },
    { id: 'contact', name: 'Contact', ref: contactRef, icon: <Contact className="w-4 h-4" /> },
  ];

  // Tech Centers Data - Updated without money
  const techCenters = [
    {
      id: 'jinja',
      name: 'Jinja Center',
      location: 'Plot 09 Acacia Ave, Jinja',
      size: '148 SQM',
      capacity: 'Up to 40 students daily',
      features: ['Full access for qualified students', 'Tutoring services', 'High-speed internet'],
      icon: <Building className="w-6 h-6" />,
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'masaka',
      name: 'Masaka Center',
      location: 'Masaka Town',
      size: '115 SQM',
      capacity: 'Up to 30 students daily',
      features: ['Part-time student access', 'English Hub program', 'Study resources'],
      icon: <School className="w-6 h-6" />,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'freedom',
      name: 'Freedom City Center',
      location: 'Kampala',
      size: '173 SQM',
      capacity: 'Up to 50 students daily',
      features: ['Full tech hub', 'Daily attendance', 'Collaborative workspace'],
      icon: <Globe className="w-6 h-6" />,
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'ntinda',
      name: 'Ntinda Center',
      location: 'Ntinda, Kampala',
      size: '43 SQM',
      capacity: 'Up to 20 students daily',
      features: ['Quiet study space', 'Computer access', 'Group study rooms'],
      icon: <Coffee className="w-6 h-6" />,
      color: 'from-orange-500 to-red-500'
    },
    {
      id: 'sseta',
      name: 'Sseta Center',
      location: 'Sseta',
      size: '63 SQM',
      capacity: 'Up to 25 students daily',
      features: ['Community access', 'Learning resource center', 'Affordable programs'],
      icon: <Users className="w-6 h-6" />,
      color: 'from-pink-500 to-rose-500'
    },
    {
      id: 'lira',
      name: 'Lira Center',
      location: 'Lira Town',
      size: '30 SQM',
      capacity: 'Up to 15 students daily',
      features: ['Focused learning environment', 'Computer lab', 'Community hub'],
      icon: <MapPinIcon className="w-6 h-6" />,
      color: 'from-cyan-500 to-blue-500'
    },
    {
      id: 'mbale',
      name: 'Mbale Center',
      location: 'Mbale Town',
      size: '55 SQM',
      capacity: 'Up to 25 students daily',
      features: ['Eastern region hub', 'Digital skills training', 'Community outreach'],
      icon: <Compass className="w-6 h-6" />,
      color: 'from-yellow-500 to-orange-500'
    }
  ];

  // Programs Data
  const programs = [
    {
      id: 'full-time',
      title: 'Full-Time Student Program',
      description: 'For students enrolled in 6+ credits with 3.0+ GPA',
      benefits: ['Paid tuition covered', 'Weekly stipend', 'Daily tech center access'],
      icon: <GraduationCapIcon className="w-8 h-8" />,
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'part-time',
      title: 'Part-Time Student Program',
      description: 'For students enrolled in 5 or fewer credits',
      benefits: ['Transportation reimbursement', 'Flexible access days', 'English Hub included'],
      icon: <BookOpen className="w-8 h-8" />,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'internship',
      title: 'Internship Program',
      description: 'Hands-on experience in tech and education',
      benefits: ['Tutoring opportunities', 'Leadership development', 'Professional growth'],
      icon: <BriefcaseIcon className="w-8 h-8" />,
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'english-hub',
      title: 'English Hub Program',
      description: 'Improve English speaking and writing skills',
      benefits: ['Daily 90-min sessions', 'Transportation support', 'Pathway to success'],
      icon: <MessageCircle className="w-8 h-8" />,
      color: 'from-orange-500 to-red-500'
    },
    {
      id: 'tutoring',
      title: 'Tutoring Program',
      description: 'Academic support and mentorship',
      benefits: ['Monthly compensation', 'Teaching experience', 'Leadership skills'],
      icon: <PenTool className="w-8 h-8" />,
      color: 'from-pink-500 to-rose-500'
    },
    {
      id: 'pathway',
      title: 'Pathway Connect',
      description: 'Bridge program for skill development',
      benefits: ['Flexible attendance', 'Transportation reimbursement', 'Skill building'],
      icon: <Zap className="w-8 h-8" />,
      color: 'from-cyan-500 to-blue-500'
    }
  ];

  // Services Data
  const services = [
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "Easy Registration",
      description: "Simple and quick application process for new students",
      features: ["30-day application window", "Board approval", "Clear requirements"],
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Flexible Scheduling",
      description: "Choose your preferred learning schedule",
      features: ["Full-time attendance", "Part-time options", "Weekend availability"],
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Academic Support",
      description: "Comprehensive academic guidance and tutoring",
      features: ["Expert tutors", "Academic probation support", "Performance tracking"],
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Safe Environment",
      description: "Secure and supportive learning environment",
      features: ["Honor code enforcement", "Safe tech access", "Community respect"],
      color: "from-orange-500 to-red-500"
    }
  ];

  // Real testimonials with actual student names
  const testimonials = [
    {
      id: 1,
      name: "Steven Sebuma",
      role: "Full-Time Student • 2025 Graduate",
      avatar: "",
      content: "When I joined SELFLESS CE, I had no idea how much my life would change. The full-time program gave me access to resources I never thought possible. The weekly stipend allowed me to focus entirely on my studies, and the tutors were always there to help. Today, I'm proud to say I graduated with a 3.8 GPA and now work as a software developer at a tech company in Kampala. This program truly changed my life and gave me hope for a better future.",
      rating: 5,
      date: "2025-01-15"
    },
    {
      id: 2,
      name: "Lisa Nyangoma",
      role: "Part-Time Student • Current Student",
      avatar: "",
      content: "Balancing work and studies was always challenging for me. The part-time program at Freedom City Tech Center was exactly what I needed. The flexible schedule allowed me to attend classes while working, and the transportation reimbursement made it affordable. The English Hub program improved my communication skills tremendously. I'm currently preparing to transition to full-time studies, and I couldn't be more grateful for the support I've received.",
      rating: 5,
      date: "2025-02-10"
    },
    {
      id: 3,
      name: "Agatha Natamba",
      role: "Tutoring Program • Current Student",
      avatar: "",
      content: "The tutoring program at SELFLESS CE was a game-changer for me. I started as a student struggling with my courses, but with the help of dedicated tutors, I improved my grades significantly. I eventually became a tutor myself, helping other students overcome their challenges. The experience taught me leadership and communication skills that I now use as a project manager. I'm proud to say that I'm still part of the SELFLESS CE community, giving back as a mentor.",
      rating: 5,
      date: "2024-12-01"
    },
    {
      id: 4,
      name: "Nicholus Turyamureba",
      role: "Internship Program • Current Student",
      avatar: "",
      content: "The internship program gave me my first real experience in the tech industry. I interned at a local tech company while receiving support from SELFLESS CE. The hands-on experience combined with the academic support I received was invaluable. I learned so much about teamwork, problem-solving, and professional communication. Today, I'm a full-time developer, and I owe it all to the opportunities SELFLESS CE provided me.",
      rating: 5,
      date: "2025-03-05"
    },
    {
      id: 5,
      name: "Kenneth Lubuulwa",
      role: "English Hub Program • Current Student",
      avatar: "",
      content: "When I first joined the English Hub program, I could barely speak English confidently. The daily 90-minute sessions were challenging at first, but the instructors were patient and supportive. Within months, I noticed a huge improvement in my speaking and writing skills. This program opened doors for me that I never thought possible. I'm now pursuing further education and am confident in my ability to succeed.",
      rating: 5,
      date: "2025-02-20"
    },
    {
      id: 6,
      name: "Tonny Kiwanuka",
      role: "Pathway Connect • 2024 Graduate",
      avatar: "",
      content: "The Pathway Connect program was the stepping stone I needed to get my life on track. I had been out of school for years, but this program gave me a second chance. The flexible schedule and support system made it possible for me to balance my responsibilities while building my skills. I'm now enrolled in full-time studies and am working toward my degree. SELFLESS CE didn't just give me education—they gave me hope.",
      rating: 5,
      date: "2024-11-15"
    }
  ];

  // Floating particles animation
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; duration: number; delay: number }>>([]);

  useEffect(() => {
    setParticles(Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 20 + 10,
      delay: Math.random() * 10,
    })));
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* Animated Background Particles */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full bg-purple-500/20"
            style={{
              width: particle.size,
              height: particle.size,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
            }}
            animate={{
              y: [0, -100, 0],
              x: [0, 50, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <motion.div 
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(139, 92, 246, 0.15) 0%, transparent 60%)`,
        }}
      />

      {/* Navigation */}
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
              <motion.div 
                className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <img src="/freedom.png" alt="Logo" className="w-8 h-8 object-contain" />
              </motion.div>
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
                  <motion.span 
                    className="text-white text-sm px-2 py-1 bg-white/10 rounded-full"
                    whileHover={{ scale: 1.05 }}
                  >
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
              className="md:hidden text-white p-3 sm:p-4 rounded-lg hover:bg-white/10 transition"
              whileTap={{ scale: 0.9 }}
            >
              {mobileMenuOpen ? <X size={32} /> : <Menu size={32} />}
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden fixed inset-0 bg-black/50 z-40"
          />
        )}
      </AnimatePresence>

      {/* Mobile Sliding Sidebar */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="md:hidden fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] bg-black/95 backdrop-blur-xl border-r border-white/10"
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <img src="/freedom.png" alt="Logo" className="w-8 h-8 object-contain" />
                  </div>
                  <span className="text-white font-bold text-lg">Freedom City Tech</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg text-gray-300 hover:bg-white/10"
                >
                  <X size={24} />
                </button>
              </div>

              <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
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
              </nav>
            </div>
          </motion.aside>
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

        <motion.div 
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10 text-center"
          style={{ y: heroY }}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-purple-500/20 rounded-full px-4 py-2 mb-6 backdrop-blur-sm"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-4 h-4 text-purple-400" />
              </motion.div>
              <span className="text-purple-300 text-base sm:text-base">SELFLESS CE Initiative</span>
            </motion.div>

            <motion.h1 
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <motion.span 
                className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent block"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Freedom City
              </motion.span>
              <motion.span 
                className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent block"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                Tech Center
              </motion.span>
            </motion.h1>
            
            <motion.p 
              className="text-lg sm:text-lg md:text-xl lg:text-2xl text-gray-300 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              Supporting Efforts to Lead Families and Individuals toward Lifelong Education and Self-Sufficiency. 
              Empowering the next generation of tech leaders in Uganda.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              {user && isAuthenticated ? (
                <motion.button
                  onClick={handleDashboard}
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold text-base sm:text-lg cursor-pointer hover:shadow-xl transition relative overflow-hidden"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                  <span className="relative z-10">Go to Dashboard</span>
                </motion.button>
              ) : (
                <>
                  <motion.button
                    onClick={handleSignIn}
                    className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold text-base sm:text-lg cursor-pointer hover:shadow-xl transition relative overflow-hidden"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: 0 }}
                      transition={{ duration: 0.3 }}
                    />
                    <span className="relative z-10">Sign In</span>
                  </motion.button>
                  <motion.button
                    onClick={handleGetStarted}
                    className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl font-semibold text-base sm:text-lg border border-white/20 cursor-pointer hover:bg-white/20 transition relative overflow-hidden"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-white/20"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: 0 }}
                      transition={{ duration: 0.3 }}
                    />
                    <span className="relative z-10">Get Started</span>
                  </motion.button>
                </>
              )}
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
        </motion.div>
      </section>

      {/* Stats Section */}
      <section id="stats-section" className="relative py-20 bg-gradient-to-b from-transparent to-black/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 bg-purple-500/20 rounded-full px-4 py-1 mb-4"
            >
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <span className="text-purple-300 text-sm">Our Impact</span>
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Numbers That Speak</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto" />
          </motion.div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { id: 'centers', label: 'Tech Centers', value: 7, icon: Building, color: 'from-purple-500 to-pink-500', suffix: '' },
              { id: 'students', label: 'Students Supported', value: 2847, icon: Users, color: 'from-blue-500 to-cyan-500', suffix: '+' },
              { id: 'graduates', label: 'Program Graduates', value: 156, icon: Award, color: 'from-green-500 to-emerald-500', suffix: '+' },
              { id: 'success', label: 'Success Rate', value: 94, icon: TrendingUp, color: 'from-orange-500 to-red-500', suffix: '%' }
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.id}
                  className="group relative bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300"
                  initial={{ opacity: 0, y: 80, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.7, delay: index * 0.12, ease: "easeOut" }}
                  whileHover={{ y: -10, scale: 1.05 }}
                >
                  <motion.div 
                    className={`w-14 h-14 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center mb-4 text-white shadow-lg mx-auto`}
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Icon className="w-7 h-7" />
                  </motion.div>
                  <p className="text-3xl md:text-4xl font-bold text-white mb-2 text-center">
                    {animatedStats[stat.id] || 0}{stat.suffix}
                  </p>
                  <p className="text-gray-400 text-sm text-center">{stat.label}</p>
                  <motion.div 
                    className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-b-2xl"
                    initial={{ width: 0 }}
                    whileHover={{ width: "100%" }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section ref={aboutRef} id="about" className="relative py-24 bg-black/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 bg-purple-500/20 rounded-full px-4 py-1 mb-4"
            >
              <Heart className="w-4 h-4 text-purple-400" />
              <span className="text-purple-300 text-sm">About SELFLESS CE</span>
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Empowering Communities Through Education</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto" />
          </motion.div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, x: -100 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <motion.p 
                className="text-gray-300 text-lg leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <strong className="text-purple-300">SELFLESS CE</strong> (Supporting Efforts to Lead Families and Individuals toward Lifelong Education and Self-Sufficiency) is dedicated to fostering a safe and supportive learning environment where young adults can access educational opportunities that empower them to achieve self-sufficiency.
              </motion.p>
              <motion.p 
                className="text-gray-300 text-lg leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <strong className="text-purple-300">Freedom City Tech Center</strong> is one of seven SELFLESS CE technology centers across Uganda, providing cutting-edge technology access, tutoring, and educational support to students from various institutions.
              </motion.p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Heart, text: "Community Driven", color: "purple" },
                  { icon: Shield, text: "Safe & Supportive", color: "pink" },
                  { icon: Users, text: "Expert Instructors", color: "blue" },
                  { icon: Star, text: "Excellence in Education", color: "green" }
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
                    <span className="text-gray-300 text-sm">{item.text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            <motion.div 
              className="relative"
              initial={{ opacity: 0, x: 100, scale: 0.8 }}
              whileInView={{ opacity: 1, x: 0, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            >
              <motion.div
                className="absolute -inset-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur-2xl opacity-30"
                animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              <motion.img
                src="/freedomcity.jpeg"
                alt="Freedom City Tech Center"
                className="rounded-2xl shadow-2xl relative z-10 w-full h-auto"
                loading="lazy"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Tech Centers Section */}
      <section ref={techCentersRef} id="techcenters" className="relative py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 bg-purple-500/20 rounded-full px-4 py-1 mb-4"
            >
              <Building className="w-4 h-4 text-purple-400" />
              <span className="text-purple-300 text-sm">Our Network</span>
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">SELFLESS CE Tech Centers Uganda</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto" />
            <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
              Seven technology centers across Uganda providing access to education, technology, and community support
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {techCenters.map((center, index) => (
              <motion.div
                key={center.id}
                className="group relative bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300"
                initial={{ opacity: 0, y: 80, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, delay: index * 0.12, ease: "easeOut" }}
                whileHover={{ y: -10, scale: 1.02, boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}
              >
                <div className="flex items-start gap-4 mb-4">
                  <motion.div 
                    className={`w-14 h-14 bg-gradient-to-r ${center.color} rounded-xl flex items-center justify-center text-white shadow-lg flex-shrink-0`}
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                  >
                    {center.icon}
                  </motion.div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white">{center.name}</h3>
                    <div className="flex items-center gap-1 text-gray-400 text-sm mt-1">
                      <MapPinIcon className="w-3 h-3" />
                      <span>{center.location}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-400">Size:</span>
                    <span className="text-white">{center.size}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-400">Capacity:</span>
                    <span className="text-purple-300">{center.capacity}</span>
                  </div>
                </div>
                
                <div className="space-y-1">
                  {center.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-300">
                      <CheckCircleIcon className="w-3 h-3 text-purple-400" />
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

      {/* Programs Section */}
      <section ref={programsRef} id="programs" className="relative py-24 bg-black/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 bg-purple-500/20 rounded-full px-4 py-1 mb-4"
            >
              <BookOpen className="w-4 h-4 text-purple-400" />
              <span className="text-purple-300 text-sm">Our Programs</span>
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Educational Programs</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto" />
            <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
              Comprehensive programs designed to support students at every stage of their educational journey
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((program, index) => (
              <motion.div
                key={program.id}
                className="group relative bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300"
                initial={{ opacity: 0, y: 80, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, delay: index * 0.12, ease: "easeOut" }}
                whileHover={{ y: -10, scale: 1.02, boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}
              >
                <motion.div 
                  className={`w-16 h-16 bg-gradient-to-r ${program.color} rounded-xl flex items-center justify-center mb-4 text-white shadow-lg`}
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                >
                  {program.icon}
                </motion.div>
                <h3 className="text-xl font-bold text-white mb-2">{program.title}</h3>
                <p className="text-gray-400 text-sm mb-4">{program.description}</p>
                <div className="space-y-2">
                  {program.benefits.map((benefit, i) => (
                    <motion.div 
                      key={i} 
                      className="flex items-center gap-2 text-sm text-gray-300"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: i * 0.1 }}
                    >
                      <CheckCircleIcon className="w-4 h-4 text-purple-400" />
                      <span>{benefit}</span>
                    </motion.div>
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

      {/* Services Section */}
      <section ref={servicesRef} id="services" className="relative py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 bg-purple-500/20 rounded-full px-4 py-1 mb-4"
            >
              <Briefcase className="w-4 h-4 text-purple-400" />
              <span className="text-purple-300 text-sm">Services</span>
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Our Services</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto" />
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <motion.div
                key={index}
                className="group relative bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300"
                initial={{ opacity: 0, y: 80, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, delay: index * 0.12, ease: "easeOut" }}
                whileHover={{ y: -10, scale: 1.02, boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}
              >
                <motion.div 
                  className={`w-16 h-16 bg-gradient-to-r ${service.color} rounded-xl flex items-center justify-center mb-4 text-white shadow-lg`}
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                >
                  {service.icon}
                </motion.div>
                <h3 className="text-lg font-bold text-white mb-2">{service.title}</h3>
                <p className="text-gray-400 text-sm mb-4">{service.description}</p>
                <div className="space-y-1">
                  {service.features.map((feature, i) => (
                    <motion.div 
                      key={i} 
                      className="flex items-center gap-2 text-xs text-gray-300"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: i * 0.1 }}
                    >
                      <CheckCircleIcon className="w-3 h-3 text-purple-400" />
                      <span>{feature}</span>
                    </motion.div>
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

      {/* Testimonials Section */}
      <section className="relative py-24 bg-black/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 bg-purple-500/20 rounded-full px-4 py-1 mb-4"
            >
              <Star className="w-4 h-4 text-purple-400" />
              <span className="text-purple-300 text-sm">Student Testimonials</span>
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Real Stories from Our Students</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto" />
            <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
              Hear from students whose lives have been transformed through SELFLESS CE programs
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.slice(0, 6).map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                className="group relative bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300"
                initial={{ opacity: 0, y: 80, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: index * 0.15, ease: "easeOut" }}
                whileHover={{ y: -10, scale: 1.02 }}
              >
                <div className="flex items-start gap-4 mb-4">
                  <motion.div 
                    className="w-14 h-14 rounded-full border-2 border-purple-500/30 bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                    initial={{ scale: 0, rotate: -180 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
                  >
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </motion.div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-lg">{testimonial.name}</h3>
                    <p className="text-purple-400 text-sm">{testimonial.role}</p>
                    <div className="flex gap-1 mt-2">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>
                <motion.p 
                  className="text-gray-300 text-sm leading-relaxed mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  "{testimonial.content}"
                </motion.p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{new Date(testimonial.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                  <motion.div
                    className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center"
                    whileHover={{ scale: 1.2, rotate: 180 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronRight className="w-4 h-4 text-purple-400" />
                  </motion.div>
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

      {/* Contact Section */}
      <section ref={contactRef} id="contact" className="relative py-24 bg-black/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
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
              initial={{ opacity: 0, x: -80 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              {[
                { icon: MapPin, label: "Visit Us", value: "Freedom City Tech Center, Kampala, Uganda", detail: "Monday - Friday, 9am - 6pm" },
                { icon: Phone, label: "Call Us", value: "+256 761 996 296", detail: "Available 24/7 for support" },
                { icon: Mail, label: "Email Us", value: "turyamurebanicholus@gmail.com", detail: "We'll respond within 24 hours" }
              ].map((item, index) => (
                <motion.div 
                  key={index}
                  className="flex items-start space-x-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300"
                  initial={{ opacity: 0, y: 40, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: index * 0.15, ease: "easeOut" }}
                  whileHover={{ x: 10, scale: 1.02 }}
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
              <p className="text-gray-400 text-sm">Empowering the next generation through technology education under SELFLESS CE.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><button onClick={scrollToTop} className="hover:text-purple-400 transition">Home</button></li>
                <li><button onClick={() => scrollToSection(aboutRef, 'about')} className="hover:text-purple-400 transition">About</button></li>
                <li><button onClick={() => scrollToSection(techCentersRef, 'techcenters')} className="hover:text-purple-400 transition">Tech Centers</button></li>
                <li><button onClick={() => scrollToSection(programsRef, 'programs')} className="hover:text-purple-400 transition">Programs</button></li>
                <li><button onClick={() => scrollToSection(servicesRef, 'services')} className="hover:text-purple-400 transition">Services</button></li>
                <li><button onClick={() => scrollToSection(contactRef, 'contact')} className="hover:text-purple-400 transition">Contact</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="/policies" className="hover:text-purple-400 transition">Policies</a></li>
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
              © 2025 Freedom City Tech Center - SELFLESS CE. Created by Atbriz Nicholus. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            onClick={scrollToTop}
            className="fixed bottom-20 right-4 sm:bottom-24 sm:right-8 z-50 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg group"
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