// app/page.tsx

"use client";

import { useState, useEffect } from 'react';
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
import { useTenant } from "@/lib/contexts/TenantContext";

export default function HomePage() {
  const { currentTechCenter, isTenantView } = useTenant();
  const [isLoading, setIsLoading] = useState(true);

  return (
    <>
      <LoadingScreen 
        onComplete={() => setIsLoading(false)} 
        delay={4000}
      />
      
      <main className="bg-background text-foreground pt-16" style={{ opacity: isLoading ? 0 : 1, transition: 'opacity 0.5s ease-in' }}>

      {/* ========================================================= */}
      {/* HERO */}
      {/* ========================================================= */}

      <section id="cover">
        {isTenantView ? (
          <div className="relative min-h-[600px] flex items-center justify-center px-4 py-20">
            <div 
              className="absolute inset-0 opacity-10"
              style={{
                background: `radial-gradient(circle at center, ${currentTechCenter?.color} 0%, transparent 70%)`
              }}
            />
            <div className="relative z-10 text-center max-w-4xl mx-auto">
              <div className="mb-6">
                <span 
                  className="inline-block px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wider"
                  style={{
                    backgroundColor: `${currentTechCenter?.color}20`,
                    color: currentTechCenter?.color,
                    border: `1px solid ${currentTechCenter?.color}40`
                  }}
                >
                  {currentTechCenter?.displayName} Tech Center
                </span>
              </div>
              <h1 
                className="text-4xl md:text-6xl font-bold mb-6"
                style={{ color: currentTechCenter?.color }}
              >
                Welcome to {currentTechCenter?.displayName}
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Your gateway to BYU-Idaho education and technical excellence at {currentTechCenter?.description}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  className="px-8 py-4 rounded-lg font-semibold text-primary-foreground transition-all"
                  style={{ backgroundColor: currentTechCenter?.color }}
                  onClick={() => window.location.href = '/login'}
                >
                  Get Started
                </button>
                <button
                  className="px-8 py-4 rounded-lg font-semibold border-2 transition-all hover:bg-secondary/50"
                  style={{
                    borderColor: currentTechCenter?.color,
                    color: currentTechCenter?.color
                  }}
                  onClick={() => document.getElementById('overview')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Learn More
                </button>
              </div>
            </div>
          </div>
        ) : (
          <CoverSection />
        )}
      </section>

      {/* ========================================================= */}
      {/* COVER BUTTONS */}
      {/* ========================================================= */}

      {/* ========================================================= */}
      {/* TRUSTED TECH CENTERS */}
      {/* ========================================================= */}

      <section id="trusted">
        <TrustedSection />
      </section>

      {/* ========================================================= */}
      {/* PLATFORM OVERVIEW */}
      {/* ========================================================= */}

      <section id="overview">
        <PortalOverview />
      </section>

      {/* ========================================================= */}
      {/* STUDENT JOURNEY */}
      {/* ========================================================= */}

      <section id="journey">
        <StudentJourney />
      </section>

      {/* ========================================================= */}
      {/* ACADEMIC FEATURES */}
      {/* ========================================================= */}

      <section id="academic">
        <AcademicFeatures />
      </section>

      {/* ========================================================= */}
      {/* COMMUNITY */}
      {/* ========================================================= */}

      <section id="community">
        <CommunityFeatures />
      </section>

      {/* ========================================================= */}
      {/* DASHBOARD PREVIEW */}
      {/* ========================================================= */}

      <section id="dashboard-preview">
        <DashboardPreview />
      </section>

      {/* ========================================================= */}
      {/* TWO-COLUMN LAYOUT */}
      {/* ========================================================= */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Sticky Why Choose */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-20">
              <section id="why-choose">
                <WhyChoosePortal />
              </section>
            </div>
          </div>

          {/* Right Column - Scrollable Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* ========================================================= */}
            {/* TESTIMONIALS */}
            {/* ========================================================= */}

            <section id="testimonials">
              <Testimonials />
            </section>

            {/* ========================================================= */}
            {/* FAQ */}
            {/* ========================================================= */}

            <section id="faq">
              <FAQ />
            </section>

            {/* ========================================================= */}
            {/* CALL TO ACTION */}
            {/* ========================================================= */}

            <section id="cta">
              <CTASection />
            </section>
          </div>
        </div>
      </div>

    </main>
    </>
  );
}