import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function PublicPageHero({
  eyebrow,
  title,
  description,
  backgroundVideo,
  backgroundPoster,
  backgroundImage,
  actionHref = "/",
  actionLabel = "Back to home",
}: {
  eyebrow: string;
  title: string;
  description: string;
  backgroundVideo?: string;
  backgroundPoster?: string;
  backgroundImage?: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <section
      className="relative isolate overflow-hidden border-b border-white/10 bg-[#0D1117] px-6 pb-20 pt-16 sm:pb-24 sm:pt-20"
      style={backgroundImage ? { backgroundImage: `url("${backgroundImage}")`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
    >
      {backgroundVideo ? (
        <video
          className="pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          poster={backgroundPoster}
          aria-hidden="true"
        >
          <source src={backgroundVideo} type="video/mp4" />
        </video>
      ) : null}

      <div className="pointer-events-none absolute inset-0 -z-[5] bg-[linear-gradient(90deg,rgba(7,16,24,0.94),rgba(7,16,24,0.7),rgba(7,16,24,0.5)),linear-gradient(0deg,rgba(7,16,24,0.8),transparent_55%)]" />

      <div className="mx-auto max-w-5xl">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#E8A33D]">{eyebrow}</p>
        <h1 className="mt-5 max-w-3xl text-4xl font-bold leading-tight tracking-tight text-white sm:text-6xl">{title}</h1>
        <p className="mt-6 max-w-2xl text-base leading-8 text-slate-400 sm:text-lg">{description}</p>
        <Link href={actionHref} className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#E8A33D] transition hover:text-[#f2b24b]">
          {actionLabel} <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}
