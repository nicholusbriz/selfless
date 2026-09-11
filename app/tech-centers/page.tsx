
import {
  ArrowRight,
  Clock3,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import PublicPageHero from "@/app/components/PublicPageHero";
import PublicPageShell from "@/app/components/PublicPageShell";

const centers = [
  { name: "Freedom City Tech Center", location: "Kampala" },
  { name: "Jinja Tech Center", location: "Jinja" },
  { name: "Lira Tech Center", location: "Northern Uganda" },
  { name: "Masaka Tech Center", location: "Central Uganda" },
  { name: "Mbale Tech Center", location: "Eastern Uganda" },
  { name: "Ntinda Tech Center", location: "Kampala" },
  { name: "Sseta Tech Center", location: "Central Region" },
];

const networkPoints = [
  {
    number: "01",
    title: "One intelligent system",
    description:
      "Every participating tech center works within one connected digital environment, making it easier to coordinate students, academic information, communication, activities, and support.",
  },
  {
    number: "02",
    title: "Connected wherever you learn",
    description:
      "Your tech center remains your local connection while the portal gives you access to the wider SELFLESS CE student community and its shared resources.",
  },
  {
    number: "03",
    title: "A consistent student experience",
    description:
      "The same dependable portal experience helps students find important information, stay connected, and manage their journey without depending on where their center is located.",
  },
];

export default function TechCentersPage() {
  return (
    <PublicPageShell>
      <PublicPageHero
        eyebrow="SELFLESS CE Tech Center Network"
        title="One intelligent system connecting every tech center."
        description="SELFLESS CE brings its tech centers together through one connected student portal, giving students a consistent place to manage learning, communication, community, and support."
        backgroundVideo="/tech center.mp4"
        backgroundPoster="/student-portal-image.png"
        actionHref="/features"
        actionLabel="Access portal features"
      />

      {/* =====================================================
          ONE CONNECTED SYSTEM
      ====================================================== */}
      <section className="bg-[#F1F1EC] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-20">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-[#B98A3E]" />

                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#B98A3E]">
                  One connected network
                </p>
              </div>

              <h2 className="mt-5 max-w-xl text-3xl font-semibold leading-tight tracking-[-0.035em] text-[#12203B] sm:text-4xl lg:text-5xl">
                Different centers.
                <br />
                One intelligent system.
              </h2>

              <p className="mt-6 max-w-xl text-base leading-8 text-[#4B564C] sm:text-lg">
                SELFLESS CE is designed so that each tech center can serve its
                students locally while remaining part of one larger,
                coordinated student network.
              </p>

              <p className="mt-4 max-w-xl text-base leading-8 text-[#6B7268]">
                Instead of students and support teams working across scattered
                systems, the portal brings the important parts of the student
                experience into one organized environment.
              </p>

              <Link
                href="/features"
                className="group mt-8 inline-flex items-center gap-2 text-sm font-bold text-[#55705B] transition-colors duration-300 hover:text-[#B98A3E]"
              >
                See what the portal offers
                <ArrowRight
                  size={16}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>
            </div>

            <div className="border-y border-[#DADCD3]">
              {networkPoints.map((item) => (
                <div
                  key={item.number}
                  className="grid gap-4 border-b border-[#DADCD3] py-7 last:border-b-0 sm:grid-cols-[60px_1fr] sm:gap-6"
                >
                  <span className="font-mono text-xs font-bold tracking-[0.16em] text-[#B98A3E]">
                    {item.number}
                  </span>

                  <div>
                    <h3 className="text-lg font-semibold tracking-[-0.015em] text-[#12203B]">
                      {item.title}
                    </h3>

                    <p className="mt-2 max-w-2xl text-sm leading-7 text-[#626A62]">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          TECH CENTERS
      ====================================================== */}
      <section className="border-y border-[#DADCD3] bg-white px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.65fr_1.35fr] lg:items-end lg:gap-20">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-[#55705B]" />

                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#55705B]">
                  Some of our tech centers
                </p>
              </div>

              <h2 className="mt-5 text-3xl font-semibold leading-tight tracking-[-0.035em] text-[#12203B] sm:text-4xl">
                Local centers.
                <br />
                Connected experience.
              </h2>

              <p className="mt-5 max-w-md text-base leading-8 text-[#626A62]">
                Our tech centers provide local learning and support while the
                SELFLESS CE portal keeps the wider network connected.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {centers.map((center, index) => (
                <article
                  key={center.name}
                  className="group flex items-start gap-4 border border-[#DADCD3] bg-[#F7F6F2] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#B98A3E]/50 hover:bg-white hover:shadow-[0_10px_28px_rgba(18,32,59,0.05)]"
                >
                  <span className="pt-0.5 font-mono text-xs font-bold tracking-[0.16em] text-[#B98A3E]">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <div className="min-w-0">
                    <h3 className="font-semibold leading-6 text-[#12203B]">
                      {center.name}
                    </h3>

                    <p className="mt-1.5 flex items-center gap-1.5 text-sm text-[#6B7268]">
                      <MapPin
                        size={14}
                        strokeWidth={1.8}
                        className="shrink-0 text-[#55705B]"
                      />
                      {center.location}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          24/7 ACCESS
      ====================================================== */}
      <section className="relative isolate overflow-hidden bg-[#0D1117] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-28">
        <video
          className="pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          poster="/student-portal-image.png"
          aria-hidden="true"
        >
          <source src="/tech center 1.mp4" type="video/mp4" />
        </video>
        <div className="pointer-events-none absolute inset-0 -z-[5] bg-[#071018]/80" />

        <div className="relative mx-auto max-w-7xl">
          <div className="border-y border-white/20 py-10 sm:py-12 lg:flex lg:items-center lg:justify-between lg:gap-16">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3">
                <Clock3
                  size={19}
                  strokeWidth={1.8}
                  className="text-[#E8A33D]"
                />

                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#E8A33D]">
                  Portal access
                </p>
              </div>

              <h2 className="mt-5 text-3xl font-semibold leading-tight tracking-[-0.035em] text-white sm:text-4xl">
                Your portal is available 24/7.
              </h2>

              <p className="mt-5 max-w-2xl text-base leading-8 text-white/70">
                Your student experience does not have to stop when you leave
                your tech center. Access your portal whenever you need to
                check your academic information, communication, opportunities,
                or other available student services.
              </p>
            </div>

            <div className="mt-8 flex shrink-0 items-center gap-4 lg:mt-0">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10">
                <ShieldCheck
                  size={22}
                  strokeWidth={1.8}
                  className="text-[#E8A33D]"
                />
              </div>

              <div>
                <p className="text-sm font-bold text-white">
                  Always within reach
                </p>

                <p className="mt-1 text-sm text-white/60">
                  Wherever your learning takes you.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          CLOSING CTA
      ====================================================== */}
      <section className="bg-[#12203B] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#E8A33D]">
              Connected by one platform
            </p>

            <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.035em] text-white sm:text-4xl">
              Wherever your tech center is,
              <span className="text-[#E8A33D]"> your portal stays with you.</span>
            </h2>

            <p className="mt-4 max-w-xl text-base leading-7 text-white/65">
              Explore the tools and services that make the SELFLESS CE student
              experience more connected.
            </p>
          </div>

          <Link
            href="/features"
            className="group inline-flex shrink-0 items-center justify-center gap-2.5 rounded-xl bg-[#E8A33D] px-5 py-3.5 text-sm font-bold text-[#12203B] transition-all duration-300 hover:bg-[#F2B359] active:scale-[0.98]"
          >
            Explore portal features
            <ArrowRight
              size={16}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </div>
      </section>
    </PublicPageShell>
  );
}
