import Image from 'next/image';
import { BookOpen, Code2, MessageCircle } from 'lucide-react';

const features = [
  {
    icon: BookOpen,
    title: 'Learn',
    description: 'Get clear help with your studies.',
  },
  {
    icon: Code2,
    title: 'Create',
    description: 'Explore ideas and build your skills.',
  },
  {
    icon: MessageCircle,
    title: 'Ask',
    description: 'Find answers and keep moving forward.',
  },
];

export default function AIDashboardPage() {
  return (
    <main className="relative min-h-[calc(100vh-5rem)] overflow-hidden bg-[#F6F7FB] px-4 py-10 text-[#172033] sm:px-6 sm:py-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -left-40 top-0 h-[28rem] w-[28rem] rounded-full bg-violet-300/25 blur-[120px]" />
        <div className="absolute -right-36 top-28 h-[30rem] w-[30rem] rounded-full bg-cyan-200/35 blur-[130px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.9),transparent_55%)]" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <section className="overflow-hidden rounded-[2rem] border border-[#E5E8EF] bg-white/90 shadow-[0_24px_70px_rgba(24,39,75,0.10)] backdrop-blur-xl">
          <div className="grid items-center gap-8 px-6 py-10 sm:px-10 sm:py-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:px-14">
            <div className="max-w-2xl">
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3.5 py-2 text-xs font-semibold tracking-wide text-violet-800">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-500" />
                </span>
                COMING SOON
              </div>

              <h1 className="text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
                Your next big idea
                <span className="mt-1 block bg-gradient-to-r from-fuchsia-600 via-violet-600 to-cyan-600 bg-clip-text text-transparent">
                  starts with a question.
                </span>
              </h1>

              <p className="mt-5 max-w-md text-sm leading-6 text-[#687386] sm:text-base">
                A smarter way to learn and create is on its way.
              </p>
            </div>

            <div className="mx-auto w-full max-w-[300px] overflow-hidden rounded-2xl border border-[#E5E8EF] bg-[#05070D] shadow-[0_16px_40px_rgba(24,39,75,0.16)]">
              <Image
                src="/atbriz.png"
                alt="Atbriz AI"
                width={1254}
                height={1254}
                priority
                className="h-auto w-full"
              />
            </div>
          </div>
          <div className="grid gap-3 border-t border-[#E9ECF2] bg-[#FAFBFD] px-6 py-6 sm:grid-cols-3 sm:px-10 lg:px-14">
            {features.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="flex items-center gap-3 rounded-xl border border-[#E9ECF2] bg-white px-4 py-3 shadow-sm"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-100 to-cyan-100 text-violet-700">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-[#172033]">{title}</h2>
                  <p className="mt-0.5 text-xs leading-5 text-[#687386]">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
