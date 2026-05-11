'use client';



import { useRouter } from 'next/navigation';

import { useState, useEffect } from 'react';

import PWAInstallPrompt from '@/components/PWAInstallPrompt';

import { Logo } from '@/components/ui';

import { OrganizationStructuredData, WebSiteStructuredData, WebApplicationStructuredData } from '@/components/StructuredData';

import { useLogin, useRegister } from '@/hooks/loginRegister';

import { LoadingSpinner } from '@/components/ui';



// ============================================

// LOGIN FORM COMPONENT

// ============================================

// Purpose: Handles user authentication within a modal

// Features:

// - Email input field only

// - Form validation (email required)

// - Success/error message display

// - Integration with useLogin hook

// - Auto-redirect to dashboard on success

// ============================================

function LoginForm({ closeModal }: { closeModal: () => void }) {

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

            <label htmlFor="email" className="block text-sm font-medium text-byu-navy-700 mb-2">

              Email Address

            </label>

            <input

              type="email"

              id="email"

              name="email"

              value={formData.email}

              onChange={handleChange}

              className="w-full px-4 py-3 border border-byu-navy-300 rounded-xl focus:ring-2 focus:ring-byu-gold-500 focus:border-byu-gold-500 outline-none transition-all"

              placeholder="your@email.com"

              disabled={isLoading}

              required

            />

          </div>

          {message && (

            <div className={`p-3 rounded-xl text-sm ${messageType === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>

              {message}

            </div>

          )}

          <button

            type="submit"

            disabled={isLoading || login.isPending}

            className="w-full bg-byu-navy-900 hover:bg-byu-navy-800 text-white font-semibold py-3 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"

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

// REGISTER FORM COMPONENT

// ============================================

// Purpose: Handles new user registration within a modal

// Features:

// - Full name fields (first & last name)

// - Email address input

// - Phone number input

// - Password with visibility toggle

// - Form validation (all fields required, min 6 char password)

// - Success/error message display

// - Integration with useRegister hook

// - Auto-redirect to dashboard on success

// ============================================

function RegisterForm({ closeModal }: { closeModal: () => void }) {

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

        <label htmlFor="firstName" className="block text-sm font-medium text-byu-navy-700 mb-2">

          First Name

        </label>

        <input

          type="text"

          id="firstName"

          name="firstName"

          value={formData.firstName}

          onChange={handleChange}

          className="w-full px-4 py-3 border border-byu-navy-300 rounded-xl focus:ring-2 focus:ring-byu-gold-500 focus:border-byu-gold-500 outline-none transition-all"

          placeholder="John"

          required

        />

      </div>

      <div>

        <label htmlFor="lastName" className="block text-sm font-medium text-byu-navy-700 mb-2">

          Last Name

        </label>

        <input

          type="text"

          id="lastName"

          name="lastName"

          value={formData.lastName}

          onChange={handleChange}

          className="w-full px-4 py-3 border border-byu-navy-300 rounded-xl focus:ring-2 focus:ring-byu-gold-500 focus:border-byu-gold-500 outline-none transition-all"

          placeholder="Doe"

          required

        />

      </div>

      <div>

        <label htmlFor="reg-email" className="block text-sm font-medium text-byu-navy-700 mb-2">

          Email Address

        </label>

        <input

          type="email"

          id="reg-email"

          name="email"

          value={formData.email}

          onChange={handleChange}

          className="w-full px-4 py-3 border border-byu-navy-300 rounded-xl focus:ring-2 focus:ring-byu-gold-500 focus:border-byu-gold-500 outline-none transition-all"

          placeholder="your@email.com"

          required

        />

      </div>

      <div>

        <label htmlFor="phoneNumber" className="block text-sm font-medium text-byu-navy-700 mb-2">

          Phone Number

        </label>

        <input

          type="tel"

          id="phoneNumber"

          name="phoneNumber"

          value={formData.phoneNumber}

          onChange={handleChange}

          className="w-full px-4 py-3 border border-byu-navy-300 rounded-xl focus:ring-2 focus:ring-byu-gold-500 focus:border-byu-gold-500 outline-none transition-all"

          placeholder="+256 123 456 789"

          required

        />

      </div>

      <div>

        <label htmlFor="reg-password" className="block text-sm font-medium text-byu-navy-700 mb-2">

          Password

        </label>

        <div className="relative">

          <input

            type={showPassword ? 'text' : 'password'}

            id="reg-password"

            name="password"

            value={formData.password}

            onChange={handleChange}

            className="w-full px-4 py-3 border border-byu-navy-300 rounded-xl focus:ring-2 focus:ring-byu-gold-500 focus:border-byu-gold-500 outline-none transition-all pr-12"

            placeholder="••••••••"

            required

          />

          <button

            type="button"

            onClick={() => setShowPassword(!showPassword)}

            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-byu-navy-400 hover:text-byu-navy-600"

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

        <div className={`p-3 rounded-xl text-sm ${messageType === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'

          }`}>

          {message}

        </div>

      )}

      <button

        type="submit"

        disabled={register.isPending}

        className="w-full bg-byu-navy-900 hover:bg-byu-navy-800 text-white font-semibold py-3 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"

      >

        {register.isPending ? 'Creating Account...' : 'Create Account'}

      </button>

    </form>

  );

}



// ============================================

// MAIN PAGE COMPONENT

// ============================================

export default function Page() {

  const router = useRouter();

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const [isVisible, setIsVisible] = useState(false);



  useEffect(() => {

    setIsVisible(true);



    // Scroll-triggered animations

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



    // Observe all scroll-animate elements

    const scrollElements = document.querySelectorAll('.scroll-animate');

    scrollElements.forEach(el => observer.observe(el));



    return () => {

      scrollElements.forEach(el => observer.unobserve(el));

    };

  }, []);



  // ============================================

  // PLATFORM FEATURES ARRAY

  // ============================================

  // Defines the 6 main features of the platform:

  // 1. Grade Tracking - Monitor academic performance

  // 2. Cleaning Day Management - Schedule cleaning duties

  // 3. Performance Analytics - Visualize progress with charts

  // 4. Credit Tracking - Track credits and graduation requirements

  // 5. Policy Center - Access institutional policies

  // 6. Student Dashboard - Centralized hub for all info

  // Each feature includes: title, description, icon, color gradient, and action

  // ============================================

  const features = [

    {

      title: "Grade Tracking",

      description: "Monitor your academic performance with real-time grade updates and detailed progress reports",

      icon: "",

      color: "from-byu-navy-600 to-byu-navy-800",

      action: () => setIsLoginModalOpen(true)

    },

    {

      title: "Cleaning Day Management",

      description: "Schedule and track cleaning duties efficiently with our automated assignment system",

      icon: "",

      color: "from-byu-navy-600 to-byu-navy-800",

      action: () => setIsLoginModalOpen(true)

    },

    {

      title: "Performance Analytics",

      description: "Visualize your academic progress with interactive charts and detailed analytics",

      icon: "",

      color: "from-byu-navy-600 to-byu-navy-800",

      action: () => setIsLoginModalOpen(true)

    },

    {

      title: "Credit Tracking",

      description: "Keep track of your academic credits and graduation requirements in real-time",

      icon: "",

      color: "from-byu-navy-600 to-byu-navy-800",

      action: () => setIsLoginModalOpen(true)

    },

    {

      title: "Policy Center",

      description: "Access all institutional policies, guidelines, and academic regulations in one place",

      icon: "",

      color: "from-byu-navy-600 to-byu-navy-800",

      action: () => setIsLoginModalOpen(true)

    },

    {

      title: "Student Dashboard",

      description: "Centralized hub for all your academic information and quick access to all features",

      icon: "",

      color: "from-byu-navy-600 to-byu-navy-800",

      action: () => setIsLoginModalOpen(true)

    }

  ];



  // ============================================

  // PLATFORM STATISTICS

  // ============================================

  // Key metrics displayed on the homepage:

  // - 1500+ Active Students using the platform

  // - 10,000+ Grades tracked in the system

  // - 500+ Cleaning duties managed

  // - 99.9% System uptime reliability

  // ============================================

  const stats = [

    { number: "1500+", label: "Active Students" },

    { number: "10,000+", label: "Grades Tracked" },

    { number: "500+", label: "Cleaning Duties" },

    { number: "99.9%", label: "Uptime" }

  ];





  return (

    <>

      {/* ============================================

          STRUCTURED DATA FOR SEO

          ============================================

          Helps search engines understand:

          - Organization information

          - Website metadata

          - Web application details

          ============================================ */}

      <OrganizationStructuredData />

      <WebSiteStructuredData />

      <WebApplicationStructuredData />



      {/* ============================================

          NAVIGATION HEADER

          ============================================

          Professional header with:

          - Logo and institution name

          - Navigation links (Features, About, Testimonials)

          - Dashboard button (opens login modal)

          - Sign In button (opens login modal)

          - Mobile hamburger menu

          - Professional navy background

          - Enhanced shadow effects

          - ============================================ */}

      <header className="fixed top-0 w-full bg-byu-navy-900 border-b border-byu-navy-800 z-50 shadow-lg">

        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex justify-between items-center h-16">

            {/* Logo */}

            <div className="flex items-center">

              <Logo size="sm" className="mr-3" />

              <span className="text-white font-bold text-xl tracking-tight">Freedom City Tech Center</span>

            </div>



            {/* Desktop Navigation */}

            <div className="hidden md:flex items-center space-x-1">

              <a href="#features" className="text-byu-navy-100 hover:text-white px-4 py-2 rounded-lg hover:bg-byu-navy-800 transition-all font-medium">Features</a>

              <a href="#about" className="text-byu-navy-100 hover:text-white px-4 py-2 rounded-lg hover:bg-byu-navy-800 transition-all font-medium">About</a>

              <a href="#testimonials" className="text-byu-navy-100 hover:text-white px-4 py-2 rounded-lg hover:bg-byu-navy-800 transition-all font-medium">Testimonials</a>

              <button

                onClick={() => setIsLoginModalOpen(true)}

                className="text-byu-navy-100 hover:text-white px-4 py-2 rounded-lg hover:bg-byu-navy-800 transition-all font-medium"

              >

                Dashboard

              </button>

              <button

                onClick={() => setIsLoginModalOpen(true)}

                className="bg-byu-gold-500 hover:bg-byu-gold-600 text-white px-5 py-2.5 rounded-lg transition-all font-medium shadow-lg hover:shadow-xl transform hover:scale-105"

              >

                Sign In

              </button>

            </div>



            {/* Mobile menu button */}

            <button

              onClick={() => setIsMenuOpen(!isMenuOpen)}

              className="md:hidden text-byu-navy-100 p-2 hover:bg-byu-navy-800 rounded-lg transition-colors"

            >

              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />

              </svg>

            </button>

          </div>



          {/* Mobile Menu */}

          {isMenuOpen && (

            <div className="md:hidden bg-byu-navy-900/95 backdrop-blur-md border-t border-byu-navy-800">

              <div className="px-4 py-4 space-y-1">

                <a

                  href="#features"

                  className="block text-byu-navy-100 hover:text-white px-4 py-2 rounded-lg hover:bg-byu-navy-800 transition-all font-medium"

                  onClick={() => setIsMenuOpen(false)}

                >

                  Features

                </a>

                <a

                  href="#about"

                  className="block text-byu-navy-100 hover:text-white px-4 py-2 rounded-lg hover:bg-byu-navy-800 transition-all font-medium"

                  onClick={() => setIsMenuOpen(false)}

                >

                  About

                </a>

                <a

                  href="#testimonials"

                  className="block text-byu-navy-100 hover:text-white px-4 py-2 rounded-lg hover:bg-byu-navy-800 transition-all font-medium"

                  onClick={() => setIsMenuOpen(false)}

                >

                  Testimonials

                </a>

                <button

                  onClick={() => {

                    setIsLoginModalOpen(true);

                    setIsMenuOpen(false);

                  }}

                  className="block text-byu-navy-100 hover:text-white px-4 py-2 rounded-lg hover:bg-byu-navy-800 transition-all font-medium"

                >

                  Dashboard

                </button>

                <button

                  onClick={() => {

                    setIsLoginModalOpen(true);

                    setIsMenuOpen(false);

                  }}

                  className="block bg-byu-gold-500 hover:bg-byu-gold-600 text-white px-4 py-2.5 rounded-lg transition-all font-medium shadow-lg hover:shadow-xl transform hover:scale-105 w-full"

                >

                  Sign In

                </button>

              </div>

            </div>

          )}

        </nav>

      </header>



      {/* ============================================

          HERO SECTION

          ============================================

          Professional university landing section with:

          - Trust badge showing user count

          - Bold headline with professional branding

          - Value proposition description

          - Two CTA buttons (Get Started, Sign Up)

          - Statistics grid (4 key metrics)

          - Professional navy background

          - Subtle gold accents

          - Responsive design for all screen sizes

          ============================================ */}

      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-byu-navy-900 via-byu-navy-800 to-byu-navy-900 overflow-hidden">

        {/* Subtle Background Pattern */}

        <div className="absolute inset-0 opacity-20">

          <div className="absolute inset-0" style={{

            backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(196, 160, 0, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(196, 160, 0, 0.05) 0%, transparent 50%)'

          }}></div>

        </div>

        <div className="absolute inset-0" style={{

          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)',

          backgroundSize: '64px 64px'

        }}></div>



        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">

          <div className="animate-fade-in">

            {/* Badge */}

            <div className="inline-flex items-center px-4 py-2 bg-byu-navy-800 border border-byu-gold-500/30 rounded-full mb-8 animate-slide-up">

              <span className="w-2 h-2 bg-byu-gold-500 rounded-full mr-2 animate-pulse"></span>

              <span className="text-sm font-medium text-byu-gold-500">Trusted by 1500+ students</span>

            </div>



            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight tracking-tight animate-slide-down">

              Freedom City Tech Center

              <span className="block bg-gradient-to-r from-byu-gold-400 via-byu-gold-500 to-byu-gold-600 bg-clip-text text-transparent mt-2">Tracking System</span>

            </h1>



            <p className="text-xl md:text-2xl text-byu-navy-100 mb-10 max-w-3xl mx-auto animate-fade-in animation-delay-200 leading-relaxed font-normal">

              Track grades, manage schedules, and access everything you need in one powerful platform.

              <span className="block text-byu-navy-200 mt-2 text-lg">Your academic journey, streamlined.</span>

            </p>



            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20 animate-fade-in animation-delay-400">

              <button

                onClick={() => setIsLoginModalOpen(true)}

                className="group bg-byu-gold-500 hover:bg-byu-gold-600 text-white font-semibold py-4 px-8 rounded-xl text-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"

              >

                Get Started Free

                <svg className="inline-block w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />

                </svg>

              </button>

              <button

                onClick={() => setIsRegisterModalOpen(true)}

                className="group bg-byu-navy-800 hover:bg-byu-navy-700 text-white border-2 border-byu-navy-600 hover:border-byu-gold-500 font-semibold py-4 px-8 rounded-xl text-lg transition-all duration-300 hover:shadow-md"

              >

                <svg className="inline-block w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />

                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />

                </svg>

                Sign Up

              </button>

            </div>



            {/* Modern Stats */}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">

              {stats.map((stat, index) => (

                <div key={index} className="group text-center animate-slide-in-up stagger-{index + 1}">

                  <div className="bg-byu-navy-800/50 backdrop-blur-sm rounded-2xl p-6 border border-byu-navy-700 hover:border-byu-gold-500/50 hover-glow transition-all duration-300">

                    <div className="text-3xl md:text-4xl font-bold text-white mb-1 animate-count-up">{stat.number}</div>

                    <div className="text-byu-navy-200 text-sm font-medium">{stat.label}</div>

                  </div>

                </div>

              ))}

            </div>

          </div>

        </div>

      </section>







      {/* ============================================

          PLATFORM FEATURES SECTION

          ============================================

          Showcases the 6 main platform features:

          - Clean card-based layout

          - Each card has gradient icon, title, description

          - Hover effects with border and shadow changes

          - Clicking opens login modal to access feature

          - Responsive grid (1 col mobile, 2 col tablet, 3 col desktop)

          - Modern gradient background

          ============================================ */}

      <section id="features" className="py-24 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center mb-16 scroll-animate">

            <h2 className="text-4xl md:text-5xl font-bold text-byu-navy-900 mb-4 tracking-tight">

              Everything you need

            </h2>

            <p className="text-xl text-byu-navy-600 max-w-2xl mx-auto leading-relaxed">

              Powerful features designed to streamline your academic journey

            </p>

          </div>



          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

            {features.map((feature, index) => (

              <div

                key={index}

                className={`group bg-white rounded-2xl p-6 border border-byu-navy-200 hover:border-byu-gold-500 hover:shadow-lg hover-lift transform-3d transition-all duration-300 cursor-pointer animate-slide-in-up stagger-${index + 1}`}

                onClick={feature.action}

              >

                <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300`}>

                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />

                  </svg>

                </div>

                <h3 className="text-xl font-bold text-byu-navy-900 mb-2 group-hover:text-byu-gold-600 transition-colors">

                  {feature.title}

                </h3>

                <p className="text-byu-navy-600 leading-relaxed mb-4">

                  {feature.description}

                </p>

                <div className="flex items-center text-byu-gold-600 font-medium text-sm group-hover:translate-x-1 transition-transform">

                  Learn more

                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />

                  </svg>

                </div>

              </div>

            ))}

          </div>

        </div>

      </section>



      {/* ============================================

          TESTIMONIALS SECTION

          ============================================

          Displays student success stories:

          - 3 testimonial cards with avatar initials

          - 5-star rating display

          - Student name and role

          - Personal quote/experience

          - Professional color-coded avatars

          - Hover shadow effects with gold accents

          ============================================ */}

      <section id="testimonials" className="py-24 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center mb-16 scroll-animate">

            <h2 className="text-4xl md:text-5xl font-bold text-byu-navy-900 mb-4 tracking-tight">

              Loved by students

            </h2>

            <p className="text-xl text-byu-navy-600 max-w-2xl mx-auto leading-relaxed">

              See what our community has to say

            </p>

          </div>



          <div className="grid md:grid-cols-3 gap-6">

            <div className="bg-byu-navy-50 rounded-2xl p-8 shadow-sm hover:shadow-lg hover:border-byu-gold-500 border border-byu-navy-200 hover-lift transform-3d transition-all duration-300 animate-slide-in-left stagger-1">

              <div className="flex items-center mb-4">

                <div className="w-12 h-12 bg-byu-navy-200 rounded-full flex items-center justify-center text-byu-navy-800 font-bold animate-float">

                  NT

                </div>

                <div className="ml-4">

                  <h4 className="font-semibold text-byu-navy-900">Nicholus Turyamureba</h4>

                  <p className="text-sm text-byu-navy-600">Software Engineer expert  </p>

                </div>

              </div>

              <div className="flex mb-4">

                {[...Array(5)].map((_, i) => (

                  <svg key={i} className="w-5 h-5 text-byu-gold-500 fill-current animate-glow" viewBox="0 0 20 20">

                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />

                  </svg>

                ))}

              </div>

              <p className="text-byu-navy-700 leading-relaxed">

                "The grade tracking system helps me monitor my progress in real-time. It's been a game-changer for my studies!"

              </p>

            </div>



            <div className="bg-byu-navy-50 rounded-2xl p-8 shadow-sm hover:shadow-lg hover:border-byu-gold-500 border border-byu-navy-200 hover-lift transform-3d transition-all duration-300 animate-slide-in-up stagger-2">

              <div className="flex items-center mb-4">

                <div className="w-12 h-12 bg-byu-navy-200 rounded-full flex items-center justify-center text-byu-navy-800 font-bold animate-float">

                  MN

                </div>

                <div className="ml-4">

                  <h4 className="font-semibold text-byu-navy-900">Mercy Nalubega</h4>

                  <p className="text-sm text-byu-navy-600">Applied Health Student</p>

                </div>

              </div>

              <div className="flex mb-4">

                {[...Array(5)].map((_, i) => (

                  <svg key={i} className="w-5 h-5 text-byu-gold-500 fill-current animate-glow" viewBox="0 0 20 20">

                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />

                  </svg>

                ))}

              </div>

              <p className="text-byu-navy-700 leading-relaxed">

                "The course registration system is so intuitive! I can easily manage my schedule. This platform has made my academic life easier."

              </p>

            </div>



            <div className="bg-byu-navy-50 rounded-2xl p-8 shadow-sm hover:shadow-lg hover:border-byu-gold-500 border border-byu-navy-200 hover-lift transform-3d transition-all duration-300 animate-slide-in-right stagger-3">

              <div className="flex items-center mb-4">

                <div className="w-12 h-12 bg-byu-navy-200 rounded-full flex items-center justify-center text-byu-navy-800 font-bold animate-float">

                  PA

                </div>

                <div className="ml-4">

                  <h4 className="font-semibold text-byu-navy-900">Princess Agatha</h4>

                  <p className="text-sm text-byu-navy-600">Applied Health Student</p>

                </div>

              </div>

              <div className="flex mb-4">

                {[...Array(5)].map((_, i) => (

                  <svg key={i} className="w-5 h-5 text-byu-gold-500 fill-current animate-glow" viewBox="0 0 20 20">

                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />

                  </svg>

                ))}

              </div>

              <p className="text-byu-navy-700 leading-relaxed">

                "Finding tutors has been incredible. The personalized support helped me master difficult concepts. I feel more confident."

              </p>

            </div>

          </div>

        </div>

      </section>



      {/* ============================================

          ABOUT SECTION

          ============================================

          Institution information with:

          - Mission statement and description

          - 3 key statistics in card format:

            * 1500+ Students Enrolled

            * 50+ Expert Faculty

            * 95% Employment Rate

          - Clean, centered layout

          - Modern gradient background

          ============================================ */}

      <section id="about" className="py-24 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

          <h2 className="text-4xl md:text-5xl font-bold text-byu-navy-900 mb-6 tracking-tight scroll-animate">About Freedom City Tech Center</h2>

          <p className="text-xl text-byu-navy-600 leading-relaxed mb-12 scroll-animate">

            Where innovation meets opportunity in technology education. We empower the next generation of tech leaders through cutting-edge programs and hands-on learning experiences.

          </p>

          <div className="grid md:grid-cols-3 gap-8">

            <div className="bg-white rounded-2xl p-8 border border-byu-navy-200 hover:border-byu-gold-500 hover-lift transform-3d transition-all duration-300 animate-slide-in-left stagger-1">

              <div className="text-4xl font-bold text-byu-navy-900 mb-2 animate-count-up">1500+</div>

              <div className="text-byu-navy-600 font-medium">Students Enrolled</div>

            </div>

            <div className="bg-white rounded-2xl p-8 border border-byu-navy-200 hover:border-byu-gold-500 hover-lift transform-3d transition-all duration-300 animate-slide-in-up stagger-2">

              <div className="text-4xl font-bold text-byu-navy-900 mb-2 animate-count-up">50+</div>

              <div className="text-byu-navy-600 font-medium">Expert Faculty</div>

            </div>

            <div className="bg-white rounded-2xl p-8 border border-byu-navy-200 hover:border-byu-gold-500 hover-lift transform-3d transition-all duration-300 animate-slide-in-right stagger-3">

              <div className="text-4xl font-bold text-byu-navy-900 mb-2 animate-count-up">95%</div>

              <div className="text-byu-navy-600 font-medium">Employment Rate</div>

            </div>

          </div>

        </div>

      </section>



      {/* ============================================

          CALL-TO-ACTION (CTA) SECTION

          ============================================

          Final conversion section with:

          - Professional navy background for contrast

          - Compelling headline

          - Supporting text

          - Two action buttons:

            * Get Started Free (gold, primary)

            * Learn More (outlined, secondary)

          - Both open modals (register/login)

          ============================================ */}

      <section className="py-24 bg-byu-navy-900">

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">Ready to get started?</h2>

          <p className="text-xl text-byu-navy-200 mb-10 max-w-2xl mx-auto">

            Join thousands of students already transforming their academic journey with our platform.

          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">

            <button

              onClick={() => setIsRegisterModalOpen(true)}

              className="bg-byu-gold-500 text-white hover:bg-byu-gold-600 font-semibold py-4 px-8 rounded-xl text-lg transition-all hover:shadow-lg"

            >

              Get Started Free

            </button>

            <button

              onClick={() => setIsLoginModalOpen(true)}

              className="bg-transparent border-2 border-byu-gold-500 text-byu-gold-500 hover:bg-byu-gold-500 hover:text-white font-semibold py-4 px-8 rounded-xl text-lg transition-all"

            >

              Learn More

            </button>

          </div>

        </div>

      </section>



      {/* ============================================

          FOOTER

          ============================================

          Site footer with 4 columns:

          - Column 1: Logo and tagline

          - Column 2: Feature links

          - Column 3: Resource links

          - Column 4: Contact information

          - Copyright notice at bottom

          - Modern gradient background

          - ============================================ */}

      <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-t border-slate-700 py-16">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="grid md:grid-cols-4 gap-12">

            <div>

              <div className="flex items-center mb-4">

                <Logo size="sm" className="mr-3" />

                <span className="font-bold text-xl text-white">Freedom City Tech Center</span>

              </div>

              <p className="text-slate-300 text-sm leading-relaxed">

                Leading technology education for tomorrow's innovators.

              </p>

            </div>

            <div>

              <h3 className="font-semibold mb-4 text-white">Features</h3>

              <ul className="space-y-3 text-slate-400 text-sm">

                <li><a href="#features" className="hover:text-white transition-colors">Grade Tracking</a></li>

                <li><a href="#features" className="hover:text-white transition-colors">Cleaning Days</a></li>

                <li><a href="#features" className="hover:text-white transition-colors">Performance Analytics</a></li>

                <li><a href="#features" className="hover:text-white transition-colors">Credit Tracking</a></li>

              </ul>

            </div>

            <div>

              <h3 className="font-semibold mb-4 text-white">Resources</h3>

              <ul className="space-y-3 text-slate-400 text-sm">

                <li><button onClick={() => setIsLoginModalOpen(true)} className="hover:text-white transition-colors text-left w-full">Student Dashboard</button></li>

                <li><button onClick={() => setIsLoginModalOpen(true)} className="hover:text-white transition-colors text-left w-full">Policy Center</button></li>

                <li><button onClick={() => setIsLoginModalOpen(true)} className="hover:text-white transition-colors text-left w-full">Cleaning Schedule</button></li>

                <li><button onClick={() => setIsLoginModalOpen(true)} className="hover:text-white transition-colors text-left w-full">My Grades</button></li>

              </ul>

            </div>

            <div>

              <h3 className="font-semibold mb-4 text-white">Contact</h3>

              <ul className="space-y-3 text-slate-400 text-sm">

                <li className="font-medium text-white">Kiwanuka Tonny</li>

                <li>Manager, Freedom City Tech Center</li>

                <li>Graduate, BYU Idaho</li>

                <li>+256 761996296</li>

                <li>Kampala, Uganda</li>

              </ul>

            </div>

          </div>

          <div className="border-t border-slate-700 mt-12 pt-8 text-center text-slate-400 text-sm">

            <p>&copy; 2024 Freedom City Tech Center. All rights reserved.</p>

            <p className="mt-2 text-slate-500">Developed by Nicholus Turyamureba • Student at BYU Idaho Freedom City Tech Center • Kampala, Uganda</p>

          </div>

        </div>

      </footer>



      {/* ============================================

          LOGIN MODAL

          ============================================

          Overlay modal for user authentication:

          - Backdrop with blur effect

          - Close button (X) in corner

          - Logo and header

          - LoginForm component

          - Link to switch to register modal

          - Responsive sizing (max-md on mobile)

          - Scrollable on small screens

          - Closes on backdrop click

          ============================================ */}

      {isLoginModalOpen && (

        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

          <div

            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"

            onClick={() => setIsLoginModalOpen(false)}

          ></div>

          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-fade-in border border-byu-navy-200">

            <button

              onClick={() => setIsLoginModalOpen(false)}

              className="absolute top-4 right-4 text-byu-navy-400 hover:text-byu-navy-600 transition-colors"

            >

              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />

              </svg>

            </button>

            <div className="p-8">

              <div className="text-center mb-6">

                <Logo size="lg" className="mx-auto mb-4" />

                <h2 className="text-2xl font-bold text-byu-navy-900 mb-2">Welcome Back</h2>

                <p className="text-byu-navy-600">Sign in to access your dashboard</p>

              </div>

              <LoginForm closeModal={() => setIsLoginModalOpen(false)} />

              <div className="mt-6 text-center">

                <p className="text-byu-navy-600 text-sm">

                  Don't have an account?{' '}

                  <button

                    onClick={() => {

                      setIsLoginModalOpen(false);

                      setIsRegisterModalOpen(true);

                    }}

                    className="text-byu-gold-600 hover:text-byu-gold-700 font-medium"

                  >

                    Sign up

                  </button>

                </p>

              </div>

            </div>

          </div>

        </div>

      )}



      {/* ============================================

          REGISTER MODAL

          ============================================

          Overlay modal for new user registration:

          - Backdrop with blur effect

          - Close button (X) in corner

          - Logo and header

          - RegisterForm component with all fields

          - Link to switch to login modal

          - Responsive sizing (max-lg on mobile)

          - Scrollable on small screens

          - Closes on backdrop click

          ============================================ */}

      {isRegisterModalOpen && (

        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

          <div

            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"

            onClick={() => setIsRegisterModalOpen(false)}

          ></div>

          <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-fade-in border border-byu-navy-200">

            <button

              onClick={() => setIsRegisterModalOpen(false)}

              className="absolute top-4 right-4 text-byu-navy-400 hover:text-byu-navy-600 transition-colors"

            >

              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />

              </svg>

            </button>

            <div className="p-8">

              <div className="text-center mb-6">

                <Logo size="lg" className="mx-auto mb-4" />

                <h2 className="text-2xl font-bold text-byu-navy-900 mb-2">Create Account</h2>

                <p className="text-byu-navy-600">Join our community today</p>

              </div>

              <RegisterForm closeModal={() => setIsRegisterModalOpen(false)} />

              <div className="mt-6 text-center">

                <p className="text-byu-navy-600 text-sm">

                  Already have an account?{' '}

                  <button

                    onClick={() => {

                      setIsRegisterModalOpen(false);

                      setIsLoginModalOpen(true);

                    }}

                    className="text-byu-gold-600 hover:text-byu-gold-700 font-medium"

                  >

                    Sign in

                  </button>

                </p>

              </div>

            </div>

          </div>

        </div>

      )}



      {/* ============================================

          PWA INSTALL PROMPT

          ============================================

          Progressive Web App component that:

          - Detects if app can be installed

          - Shows install prompt to users

          - Enables app installation on mobile devices

          - ============================================ */}

      <PWAInstallPrompt />

    </>

  );

}

