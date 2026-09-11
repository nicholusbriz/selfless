import PublicPageHero from "@/app/components/PublicPageHero";
import PublicPageShell from "@/app/components/PublicPageShell";

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

export default function TermsPage() {
  return (
    <PublicPageShell>
      <PublicPageHero
        eyebrow="Legal"
        title="Terms for using the student portal."
        description="These guidelines help keep the Selfless CE Student Portal useful, respectful, and secure for students and the teams supporting them."
      />

      <main className="bg-[#F1F1EC] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-28">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm leading-7 text-[#5F685F]">
            By using the portal, you agree to use it responsibly and to follow
            the requirements that apply to your role within the Selfless CE
            network.
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
            These terms describe the current intended use of the portal and may
            be updated as services and responsibilities change. Continued use
            of the portal after an update means you should review the revised
            information.
          </p>
        </div>
      </main>
    </PublicPageShell>
  );
}
