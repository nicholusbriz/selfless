import { Mail, MessageCircle, Phone } from "lucide-react";
import FAQ from "@/app/components/FAQ";
import PublicPageHero from "@/app/components/PublicPageHero";
import PublicPageShell from "@/app/components/PublicPageShell";

export default function HelpPage() {
  return (
    <PublicPageShell>
      <PublicPageHero eyebrow="Support center" title="Need a hand? Start here." description="Find answers to common questions or contact the Selfless CE team for help with your account, courses, and portal access." />
      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="border border-white/10 bg-[#11161D] p-5 transition hover:border-[#E8A33D]/50">
            <a
              href="https://wa.me/256761996296"
              target="_blank"
              rel="noreferrer"
              aria-label="Open WhatsApp support chat"
              className="flex h-11 w-11 items-center justify-center rounded-lg border border-[#E8A33D]/20 bg-[#E8A33D]/[0.08] text-[#E8A33D] transition hover:bg-[#E8A33D]/20"
            >
              <MessageCircle size={21} />
            </a>
            <h2 className="mt-4 font-semibold text-white">WhatsApp</h2>
            <p className="mt-2 text-sm text-slate-400">Chat with the support team.</p>
          </div>

          <div className="border border-white/10 bg-[#11161D] p-5 transition hover:border-[#E8A33D]/50">
            <a
              href="tel:+256761996296"
              aria-label="Call the support team"
              className="flex h-11 w-11 items-center justify-center rounded-lg border border-[#E8A33D]/20 bg-[#E8A33D]/[0.08] text-[#E8A33D] transition hover:bg-[#E8A33D]/20"
            >
              <Phone size={21} />
            </a>
            <h2 className="mt-4 font-semibold text-white">Call us</h2>
            <p className="mt-2 text-sm text-slate-400">Speak with the support team.</p>
          </div>

          <div className="border border-white/10 bg-[#11161D] p-5 transition hover:border-[#E8A33D]/50">
            <a
              href="mailto:turyamurebanicholus@gmail.com"
              aria-label="Email the support team"
              className="flex h-11 w-11 items-center justify-center rounded-lg border border-[#E8A33D]/20 bg-[#E8A33D]/[0.08] text-[#E8A33D] transition hover:bg-[#E8A33D]/20"
            >
              <Mail size={21} />
            </a>
            <h2 className="mt-4 font-semibold text-white">Email</h2>
            <p className="mt-2 text-sm text-slate-400">Send a message to support.</p>
          </div>
        </div>
      </section>
      <FAQ />
    </PublicPageShell>
  );
}
