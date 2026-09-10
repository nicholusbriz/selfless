// app/page.tsx

"use client";

import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import CoverSection from "@/components/CoverContent";
import TrustedSection from "@/app/components/TrustedSection";
import PortalOverview from "@/components/PortalOverview";
import StudentJourney from "@/components/StudentJourney";
import AcademicFeatures from "@/components/AcademicFeatures";
import CommunityFeatures from "@/components/CommunityFeatures";
import DashboardPreview from "@/components/DashboardPreview";
import WhyChoosePortal from "@/components/WhyChoosePortal";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import CTASection from "@/components/CTASection";
import LoadingScreen from "@/app/components/LoadingScreen";
import Header2 from "@/app/components/ui/header-2";
import Footer from "@/app/components/Footer";

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {showBackToTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Back to top"
          title="Back to top"
          className="fixed bottom-5 left-3 z-50 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-[#12203B] text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-[#B98A3E] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B98A3E] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D1117] sm:left-5"
        >
          <ArrowUp className="h-4 w-4" strokeWidth={2.5} />
        </button>
      )}

      <LoadingScreen 
        onComplete={() => setIsLoading(false)} 
        delay={4000}
      />
      
      <Header2 />

      <main 
        className="bg-[#0D1117] text-white pt-24" 
        style={{ 
          opacity: isLoading ? 0 : 1, 
          transition: 'opacity 0.5s ease-in' 
        }}
      >
        {/* HERO */}
        <section id="cover">
          <CoverSection />
        </section>

        {/* TRUSTED TECH CENTERS */}
        <section id="trusted">
          <TrustedSection />
        </section>

        {/* PLATFORM OVERVIEW */}
        <section id="overview">
          <PortalOverview />
        </section>

        {/* STUDENT JOURNEY */}
        <section id="journey">
          <StudentJourney />
        </section>

        {/* ACADEMIC FEATURES */}
        <section id="academic">
          <AcademicFeatures />
        </section>

        {/* COMMUNITY */}
        <section id="community">
          <CommunityFeatures />
        </section>

        {/* DASHBOARD PREVIEW */}
        <section id="dashboard-preview">
          <DashboardPreview />
        </section>

        {/* WHY CHOOSE THE PORTAL */}
        <section id="why-choose">
          <WhyChoosePortal />
        </section>

        {/* TESTIMONIALS */}
        <section id="testimonials">
          <Testimonials />
        </section>

        {/* FAQ */}
        <section id="faq">
          <FAQ />
        </section>

        {/* CALL TO ACTION */}
        <section id="cta">
          <CTASection />
        </section>
      </main>

      <Footer />
    </>
  );
}