import {
  BookOpen,
  Code2,
  MessageCircle,
  ArrowRight,
} from 'lucide-react';
import SpinningGlobe from '@/components/SpinningGlobe';

const features = [
  {
    icon: BookOpen,
    title: 'Learn',
    description: 'Get clear, patient help with your studies.',
  },
  {
    icon: Code2,
    title: 'Create',
    description: 'Explore ideas and build real skills.',
  },
  {
    icon: MessageCircle,
    title: 'Ask',
    description: 'Find answers and keep moving forward.',
  },
];

export default function AIDashboardPage() {
  return (
    <main className="relative min-h-[calc(100vh-5rem)] bg-[#F8F9FA] px-3 py-8 text-[#1A2B4C] sm:px-5 sm:py-12">
      <div className="mx-auto max-w-5xl">
        <section className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
          <div className="grid items-center gap-8 px-5 py-10 sm:px-8 sm:py-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12 lg:px-10">

            {/* LEFT — copy */}
            <div className="max-w-xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6B7280]">
                Launching soon
              </p>

              <h1 className="mt-5 text-3xl font-bold leading-[1.1] tracking-tight text-[#1A2B4C] sm:text-4xl lg:text-5xl">
                A smarter way to learn,
                <span className="block text-[#1A2B4C]">built for you.</span>
              </h1>

              <p className="mt-4 max-w-md text-[13.5px] leading-6 text-[#6B7280] sm:text-[14.5px]">
                We&apos;re building an assistant that helps you study, build, and
                ask better questions — without the noise. It&apos;s almost ready.
              </p>

              <div className="mt-7 border-t border-[#F3F4F6] pt-5">
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
                  What to expect
                </p>
                <ul className="mt-3 space-y-2.5">
                  {features.map(({ icon: Icon, title, description }) => (
                    <li key={title} className="flex items-start gap-2.5">
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[#E5E7EB] bg-[#F8F9FA] text-[#1A2B4C]">
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[12.5px] font-semibold text-[#1A2B4C]">
                          {title}
                        </p>
                        <p className="text-[11.5px] leading-5 text-[#6B7280]">
                          {description}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* RIGHT — globe */}
            <div className="relative mx-auto aspect-square w-full max-w-[300px] overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#05070D] shadow-[0_16px_40px_rgba(26,43,76,0.12)]">
              <SpinningGlobe />
            </div>
          </div>

          {/* Footer strip */}
          <div className="flex flex-col items-start justify-between gap-3 border-t border-[#E5E7EB] bg-[#F8F9FA] px-5 py-3.5 sm:flex-row sm:items-center sm:px-8 lg:px-10">
            <p className="text-[11.5px] text-[#6B7280]">
              Want early access?{' '}
              <span className="font-medium text-[#4B5646]">
                Keep an eye on your dashboard.
              </span>
            </p>
            <button
              type="button"
              disabled
              className="inline-flex items-center gap-1.5 rounded-md border border-[#E5E7EB] bg-white px-2.5 py-1.5 text-[11.5px] font-medium text-[#9CA3AF]"
              title="Available on launch"
            >
              Notify me
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}