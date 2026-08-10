// app/page.tsx

"use client";

import { useState } from 'react';
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

  return (
    <>
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