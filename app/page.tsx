// app/page.tsx

import CoverSection from "@/components/CoverContent";
import TrustedSection from "@/components/TrustedSection";
import PortalOverview from "@/components/PortalOverview";
import StudentJourney from "@/components/StudentJourney";
import AcademicFeatures from "@/components/AcademicFeatures";
import CommunityFeatures from "@/components/CommunityFeatures";
import DashboardPreview from "@/components/DashboardPreview";
import WhyChoosePortal from "@/components/WhyChoosePortal";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import FixedHeader from "@/components/FixedHeader";

export default function HomePage() {
  return (
    <main className="overflow-hidden bg-[#0D1117] text-white">

      {/* ========================================================= */}
      {/* FIXED HEADER */}
      {/* ========================================================= */}

      <FixedHeader />

      {/* ========================================================= */}
      {/* HERO */}
      {/* ========================================================= */}

      <section id="cover">
        <CoverSection />
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
      {/* WHY CHOOSE THE PORTAL */}
      {/* ========================================================= */}

      <section id="why-choose">
        <WhyChoosePortal />
      </section>

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

      {/* ========================================================= */}
      {/* FOOTER */}
      {/* ========================================================= */}

      <Footer />

    </main>
  );
}