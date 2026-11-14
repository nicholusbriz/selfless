import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Footer from "@/app/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use | Selfless Student Portal",
  description:
    "Terms and guidelines for using the Selfless Student Portal responsibly and securely.",
  alternates: { canonical: "/terms" },
};

const sections = [
  {
    title: "Using the portal",
    body: "Use the Selfless CE Student Portal for its intended educational, communication, community, and tech-center support purposes. You are responsible for the accuracy of information you submit and for keeping your account credentials private.",
  },
  {
    title: "Your account",
    body: "Accounts are intended for the person they represent. Do not share access, impersonate another user, attempt to access restricted areas, or use the portal to interfere with another student’s learning or privacy.",
  },
  {
    title: "Academic and community content",
    body: "You remain responsible for the content you submit, including messages, feedback, applications, and activity information. Keep content respectful, relevant, and consistent with the responsibilities of a Selfless CE learning community.",
  },
  {
    title: "Acceptable use",
    body: "Do not upload malicious code, abuse automated services, attempt to bypass role-based access, scrape private information, disrupt the service, or use portal data for harassment, fraud, or unauthorized commercial purposes.",
  },
  {
    title: "Availability and updates",
    body: "Features, records, activities, and support services may change as the portal develops. We may temporarily limit access for maintenance, security, infrastructure, or operational reasons.",
  },
  {
    title: "Support",
    body: "Questions about your account, access, or use of the portal should be directed to the Selfless CE support team through the Help page. Serious access or security concerns should be reported promptly.",
  },
];

const INK = "#111827";
const BODY = "#111827";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#F7F6F2] text-[#111827]">
      <main>
        {/* =====================================================
            SINGLE SECTION
        ====================================================== */}
        <section className="px-5 pb-16 pt-10 sm:px-8 sm:pb-20 sm:pt-14 lg:px-12 lg:pb-24">
          <div className="mx-auto w-full max-w-4xl">
            {/* Header */}
            <div className="flex items-center gap-3">
              <span className="h-px w-8" style={{ backgroundColor: INK }} />
              <p
                className="text-[10px] font-bold uppercase tracking-[0.22em]"
                style={{ color: INK }}
              >
                Legal — Terms
              </p>
            </div>

            <h1
              className="mt-6 max-w-4xl text-5xl font-bold leading-[0.98] tracking-[-0.045em] sm:text-6xl lg:text-[4.2rem]"
              style={{ color: INK }}
            >
              Terms for using the student portal.
            </h1>

            <p
              className="mt-6 max-w-2xl text-base leading-7 sm:text-lg sm:leading-8"
              style={{ color: BODY }}
            >
              These guidelines help keep the Selfless CE Student Portal
              useful, respectful, and secure for students and the teams
              supporting them.
            </p>

            <p className="mt-8 max-w-2xl text-sm leading-7" style={{ color: BODY }}>
              By using the portal, you agree to use it responsibly and to
              follow the requirements that apply to your role within the
              Selfless CE network.
            </p>

            {/* Terms sections */}
            <div
              className="mt-10 divide-y"
              style={{ borderColor: "rgba(17,24,39,0.12)" }}
            >
              {sections.map((section) => (
                <section
                  key={section.title}
                  className="border-t py-7 first:border-t-0 sm:py-8"
                  style={{ borderColor: "rgba(17,24,39,0.12)" }}
                >
                  <h2
                    className="text-xl font-bold tracking-[-0.02em]"
                    style={{ color: INK }}
                  >
                    {section.title}
                  </h2>
                  <p className="mt-3 text-sm leading-7" style={{ color: BODY }}>
                    {section.body}
                  </p>
                </section>
              ))}
            </div>

            {/* Support note */}
            <div className="mt-12 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between sm:gap-10">
              <p className="max-w-2xl text-[13px] leading-6.5" style={{ color: "#111827" }}>
                Questions about your account, access, or use of the portal
                can be directed to the support team through the Help page.
              </p>

              <Link
                href="/help"
                className="group inline-flex w-fit shrink-0 items-center gap-2 rounded-lg px-5 py-3 text-[13px] font-bold transition-opacity hover:opacity-80"
                style={{ backgroundColor: INK, color: "#F7F6F2" }}
              >
                Visit Help

                <ArrowRight
                  size={15}
                  strokeWidth={1.9}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </Link>
            </div>

            <p className="mt-8 text-xs leading-6" style={{ color: "#111827" }}>
              These terms describe the current intended use of the portal and
              may be updated as services and responsibilities change.
              Continued use of the portal after an update means you should
              review the revised information.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
