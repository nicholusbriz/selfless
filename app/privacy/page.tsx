import PublicPageHero from "@/app/components/PublicPageHero";
import PublicPageShell from "@/app/components/PublicPageShell";

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
    body: "Access is limited according to the responsibilities associated with your account. Students, tutors, teachers, administrators, and other authorized Selfless CE personnel may see information needed for their work within the portal.",
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

export default function PrivacyPage() {
  return (
    <PublicPageShell>
      <PublicPageHero
        eyebrow="Legal"
        title="Privacy and responsible information use."
        description="This page explains how the Selfless CE Student Portal uses information to provide academic services, communication, and support across the tech-center network."
      />

      <main className="bg-[#F1F1EC] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-28">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm leading-7 text-[#5F685F]">
            The portal is designed to support students and the teams who serve
            them. We aim to collect and use information for clear educational,
            operational, and support purposes.
          </p>

          <div className="mt-10 divide-y divide-[#DADCD3] border-y border-[#DADCD3]">
            {sections.map((section) => (
              <section key={section.title} className="py-7 sm:py-8">
                <h2 className="text-xl font-semibold text-[#12203B]">{section.title}</h2>
                <p className="mt-3 text-sm leading-7 text-[#626A62]">{section.body}</p>
              </section>
            ))}
          </div>

          <p className="mt-8 text-xs leading-6 text-[#7A8179]">
            For privacy questions or account support, visit the Help page. This
            information is provided as a practical description of the portal’s
            current practices and may be updated as the platform evolves.
          </p>
        </div>
      </main>
    </PublicPageShell>
  );
}
