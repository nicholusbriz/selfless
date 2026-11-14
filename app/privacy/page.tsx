import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Footer from "@/app/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Selfless Student Portal",
  description:
    "How the Selfless Student Portal collects, uses, and protects your information across the tech-center network.",
  alternates: { canonical: "/privacy" },
};

const sections = [
  {
    title: "Information we use",
    body: "The portal may use account details, profile information, academic records, course and credit information, tutor feedback, tech-center membership, messages, announcements, notifications, activity participation, and information you provide when requesting support.",
  },
  {
    title: "How information supports your experience",
    body: "We use this information to authenticate users, provide role-appropriate dashboards, organize courses and academic progress, deliver announcements and notifications, connect students with tutors and communities, support tech-center operations, and improve portal assistance.",
  },
  {
    title: "Who may access information",
    body: "Access is limited according to the responsibilities associated with your account. Students, tutors, teachers, administrators, and other authorized Selfless personnel may see information needed for their work within the portal.",
  },
  {
    title: "Messages and AI assistance",
    body: "Messages, support requests, and questions submitted to Atbriz AI may be processed to provide the requested service, maintain conversation context, improve answers, and support platform navigation. Do not submit passwords or other secrets in messages.",
  },
  {
    title: "Your choices",
    body: "Keep your profile information accurate and contact the support team when you need help with account access, personal information, or portal data. You can reach support through the Help page.",
  },
];

const INK = "#111827";
const BODY = "#111827";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#F7F6F2] text-[#111827]">
      <main>
        {/* =====================================================
            SINGLE SECTION
        ====================================================== */}
        <section className="px-5 pb-16 pt-10 sm:px-8 sm:pb-20 sm:pt-14 lg:px-12 lg:pb-24">
          <div className="mx-auto w-full max-w-5xl">
            {/* Header */}
            <div className="flex items-center gap-3">
              <p
                className="text-[10px] font-bold uppercase tracking-[0.22em]"
                style={{ color: INK }}
              >
                Legal — Privacy
              </p>
            </div>

            <h1
              className="mt-6 max-w-4xl text-5xl font-bold leading-[0.98] tracking-[-0.045em] sm:text-6xl lg:text-[4.2rem]"
              style={{ color: INK }}
            >
              Privacy and responsible information use.
            </h1>

            <p
              className="mt-6 max-w-2xl text-base leading-7 sm:text-lg sm:leading-8"
              style={{ color: BODY }}
            >
              This page explains how the Selfless Student Portal uses
              information to provide academic services, communication, and
              support across the tech-center network.
            </p>

            {/* Summary */}
            <div className="mt-14 grid gap-8 sm:grid-cols-3">
              {[
                {
                  title: "Purpose",
                  text: "Education, operations, communication, and support.",
                },
                {
                  title: "Access",
                  text: "Information is available according to account responsibilities.",
                },
                {
                  title: "Your role",
                  text: "Keep your information accurate and contact support when needed.",
                },
              ].map((item) => (
                <div key={item.title}>
                  <h3
                    className="text-[15px] font-bold tracking-[-0.015em]"
                    style={{ color: INK }}
                  >
                    {item.title}
                  </h3>
                  <p className="mt-2 text-[13px] leading-6" style={{ color: BODY }}>
                    {item.text}
                  </p>
                </div>
              ))}
            </div>

            {/* Policy sections */}
            <div className="mt-14">
              <p
                className="text-[11px] font-bold uppercase tracking-[0.2em]"
                style={{ color: "#111827" }}
              >
                Information practices
              </p>

              <h2
                className="mt-3 text-2xl font-bold tracking-[-0.03em] sm:text-3xl"
                style={{ color: INK }}
              >
                How information is handled
              </h2>

              <div
                className="mt-8"
              >
                {sections.map((section) => (
                  <div
                    key={section.title}
                    className="grid gap-3 py-7 sm:grid-cols-[220px_1fr] sm:gap-6"
                  >
                    <h3
                      className="text-[16px] font-bold leading-6 tracking-[-0.015em] sm:text-[17px]"
                      style={{ color: INK }}
                    >
                      {section.title}
                    </h3>

                    <p className="max-w-2xl text-[13px] leading-6.5 sm:text-sm sm:leading-7" style={{ color: BODY }}>
                      {section.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Support note */}
            <div className="mt-14 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between sm:gap-10">
              <div className="max-w-2xl">
                <p
                  className="text-[11px] font-bold uppercase tracking-[0.2em]"
                  style={{ color: "#111827" }}
                >
                  Need assistance?
                </p>

                <h2
                  className="mt-2 text-xl font-bold tracking-[-0.02em]"
                  style={{ color: INK }}
                >
                  Questions about your information or account?
                </h2>

                <p className="mt-2 text-[13px] leading-6.5 sm:text-sm sm:leading-7" style={{ color: BODY }}>
                  Visit the Help page for account support, privacy questions,
                  and guidance when using the portal.
                </p>
              </div>

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

            {/* Document note */}
            <p className="mt-10 max-w-3xl text-[11px] leading-5.5" style={{ color: "#111827" }}>
              This information is provided as a practical description of the
              portal’s current practices and may be updated as the platform
              evolves.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
