import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";

import PublicPageHero from "@/app/components/PublicPageHero";
import PublicPageShell from "@/app/components/PublicPageShell";

const sections = [
  {
    number: "01",
    title: "Information we use",
    body: "The portal may use account details, profile information, academic records, course and credit information, tutor feedback, tech-center membership, messages, announcements, notifications, activity participation, and information you provide when requesting support.",
  },
  {
    number: "02",
    title: "How information supports your experience",
    body: "We use this information to authenticate users, provide role-appropriate dashboards, organize courses and academic progress, deliver announcements and notifications, connect students with tutors and communities, support tech-center operations, and improve portal assistance.",
  },
  {
    number: "03",
    title: "Who may access information",
    body: "Access is limited according to the responsibilities associated with your account. Students, tutors, teachers, administrators, and other authorized Selfless CE personnel may see information needed for their work within the portal.",
  },
  {
    number: "04",
    title: "Messages and AI assistance",
    body: "Messages, support requests, and questions submitted to Atbriz AI may be processed to provide the requested service, maintain conversation context, improve answers, and support platform navigation. Do not submit passwords or other secrets in messages.",
  },
  {
    number: "05",
    title: "Your choices",
    body: "Keep your profile information accurate and contact the support team when you need help with account access, personal information, or portal data. You can reach support through the Help page.",
  },
];

export default function PrivacyPage() {
  return (
    <PublicPageShell>
      <PublicPageHero
        eyebrow="Legal"
        title="Privacy and responsible information use."
        description="This page explains how the Selfless CE Student Portal uses information to provide academic services, communication, and support across the tech-center network."
      />

      <main className="bg-[#F1F1EC]">
        {/* =====================================================
            INTRODUCTION
        ====================================================== */}
        <section className="px-5 py-10 sm:px-8 sm:py-12 lg:px-12 lg:py-14">
          <div className="mx-auto max-w-5xl">
            <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-start lg:gap-16">
              <div>
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="h-px w-8 bg-[#B98A3E]"
                  />

                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B98A3E]">
                    Privacy overview
                  </p>
                </div>

                <div className="mt-4 flex items-start gap-3">
                  <ShieldCheck
                    size={19}
                    strokeWidth={1.8}
                    className="mt-1 shrink-0 text-[#55705B]"
                  />

                  <div>
                    <h2 className="text-lg font-semibold tracking-[-0.02em] text-[#12203B]">
                      Information should have a clear purpose.
                    </h2>

                    <p className="mt-2 text-[13px] leading-6 text-[#6B7268]">
                      The portal is designed to support students and the teams
                      who serve them.
                    </p>
                  </div>
                </div>
              </div>

              <div className="max-w-3xl">
                <p className="text-[15px] leading-7 text-[#4B564C] sm:text-base sm:leading-8">
                  We aim to collect and use information for clear educational,
                  operational, and support purposes. Access to information is
                  organized around the responsibilities associated with each
                  account.
                </p>

                <p className="mt-3 text-[13px] leading-6.5 text-[#6B7268] sm:text-sm sm:leading-7">
                  The sections below provide a practical overview of how
                  information may be used within the Selfless CE Student
                  Portal.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            QUICK SUMMARY
        ====================================================== */}
        <section className="border-y border-[#DADCD3] bg-white px-5 sm:px-8 lg:px-12">
          <div className="mx-auto grid max-w-5xl divide-y divide-[#DADCD3] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            <PrivacySummary
              number="01"
              title="Purpose"
              text="Education, operations, communication, and support."
            />

            <PrivacySummary
              number="02"
              title="Access"
              text="Information is available according to account responsibilities."
            />

            <PrivacySummary
              number="03"
              title="Your role"
              text="Keep your information accurate and contact support when needed."
            />
          </div>
        </section>

        {/* =====================================================
            PRIVACY SECTIONS
        ====================================================== */}
        <section className="px-5 py-10 sm:px-8 sm:py-12 lg:px-12 lg:py-14">
          <div className="mx-auto max-w-5xl">
            <div className="mb-7 flex items-end justify-between gap-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#55705B]">
                  Information practices
                </p>

                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#12203B] sm:text-3xl">
                  How information is handled
                </h2>
              </div>

              <span className="hidden font-mono text-[10px] font-bold tracking-[0.16em] text-[#8A9088] sm:block">
                SELFLESS CE
              </span>
            </div>

            <div className="border-y border-[#DADCD3]">
              {sections.map((section) => (
                <section
                  key={section.number}
                  className="grid gap-4 border-b border-[#DADCD3] py-7 last:border-b-0 sm:grid-cols-[54px_190px_1fr] sm:gap-6 sm:py-8"
                >
                  <span className="font-mono text-[10px] font-bold tracking-[0.16em] text-[#B98A3E]">
                    {section.number}
                  </span>

                  <h3 className="text-[16px] font-semibold leading-6 tracking-[-0.015em] text-[#12203B] sm:text-[17px]">
                    {section.title}
                  </h3>

                  <p className="max-w-2xl text-[13px] leading-6.5 text-[#626A62] sm:text-sm sm:leading-7">
                    {section.body}
                  </p>
                </section>
              ))}
            </div>
          </div>
        </section>

        {/* =====================================================
            SUPPORT NOTE
        ====================================================== */}
        <section className="border-t border-[#DADCD3] bg-[#F7F6F2] px-5 py-10 sm:px-8 sm:py-12 lg:px-12 lg:py-14">
          <div className="mx-auto max-w-5xl">
            <div className="flex flex-col gap-5 border-l-2 border-[#B98A3E] pl-5 sm:flex-row sm:items-center sm:justify-between sm:gap-10">
              <div className="max-w-2xl">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B98A3E]">
                  Need assistance?
                </p>

                <h2 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-[#12203B]">
                  Questions about your information or account?
                </h2>

                <p className="mt-2 text-[13px] leading-6.5 text-[#6B7268] sm:text-sm sm:leading-7">
                  Visit the Help page for account support, privacy questions,
                  and guidance when using the portal.
                </p>
              </div>

              <Link
                href="/help"
                className="
                  group
                  inline-flex
                  w-fit
                  shrink-0
                  items-center
                  gap-2
                  rounded-lg
                  bg-[#12203B]
                  px-5
                  py-3
                  text-[13px]
                  font-semibold
                  text-white
                  outline-none
                  transition-all
                  duration-200
                  hover:bg-[#55705B]
                  focus-visible:ring-2
                  focus-visible:ring-[#12203B]
                  focus-visible:ring-offset-2
                  focus-visible:ring-offset-[#F7F6F2]
                "
              >
                Visit Help

                <ArrowRight
                  size={15}
                  strokeWidth={1.9}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </Link>
            </div>
          </div>
        </section>

        {/* =====================================================
            DOCUMENT NOTE
        ====================================================== */}
        <section className="bg-[#F1F1EC] px-5 py-8 sm:px-8 sm:py-10 lg:px-12">
          <div className="mx-auto max-w-5xl">
            <p className="max-w-3xl text-[11px] leading-5.5 text-[#7A8179]">
              This information is provided as a practical description of the
              portal’s current practices and may be updated as the platform
              evolves.
            </p>
          </div>
        </section>
      </main>
    </PublicPageShell>
  );
}

/* =========================================================
   PRIVACY SUMMARY
========================================================= */

function PrivacySummary({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="px-0 py-5 sm:px-6 sm:py-6 first:sm:pl-0 last:sm:pr-0">
      <div className="flex items-center gap-3">
        <span className="font-mono text-[9px] font-bold tracking-[0.18em] text-[#B98A3E]">
          {number}
        </span>

        <span
          aria-hidden="true"
          className="h-px w-5 bg-[#DADCD3]"
        />
      </div>

      <h3 className="mt-3 text-[14px] font-semibold text-[#12203B]">
        {title}
      </h3>

      <p className="mt-1.5 text-[12px] leading-5.5 text-[#6B7268]">
        {text}
      </p>
    </div>
  );
}