'use client';

import { ArrowLeft, Home, Code, FileCode, ScrollText, Wrench, Zap, Database, Settings, Activity } from 'lucide-react';
import { useRouter } from 'next/navigation';

const TOKENS = {
  brand: '#1a365d',
  brandHover: '#14294a',
  brandLight: '#2c5282',
  brandSoft: '#eef2f8',
  success: '#17734b',
  successSoft: '#edf7f2',
  warning: '#8a5a00',
  warningSoft: '#fff8e7',
  danger: '#a52121',
  dangerSoft: '#fdf0f0',
  border: '#dfe5ec',
  borderStrong: '#cbd5e1',
  surface: '#ffffff',
  surfaceMuted: '#f8fafc',
  page: '#f4f6f9',
  text: '#172033',
  textMuted: '#64748b',
  textSoft: '#94a3b8',
};

const focusRing =
  'focus:outline-none focus:ring-2 focus:ring-[#1a365d]/20 focus:ring-offset-2';

interface DevTool {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  path: string;
  status: 'active' | 'beta' | 'coming-soon';
  category: 'core' | 'monitoring' | 'documentation' | 'tools';
}

const devTools: DevTool[] = [
  {
    id: 'dev-dashboard',
    title: 'Developer Dashboard',
    description: 'Overview of all developer tools and system status',
    icon: Code,
    path: '/dashboard/dev',
    status: 'active',
    category: 'core',
  },
  {
    id: 'api-docs',
    title: 'API Documentation',
    description: 'Complete API reference and integration guides',
    icon: FileCode,
    path: '/dashboard/dev/api-docs',
    status: 'active',
    category: 'documentation',
  },
  {
    id: 'system-logs',
    title: 'System Logs',
    description: 'Real-time system logs and error tracking',
    icon: ScrollText,
    path: '/dashboard/dev/logs',
    status: 'active',
    category: 'monitoring',
  },
  {
    id: 'developer-tools',
    title: 'Developer Tools',
    description: 'Utilities and tools for development workflows',
    icon: Wrench,
    path: '/dashboard/dev/tools',
    status: 'beta',
    category: 'tools',
  },
];

const getStatusBadge = (status: DevTool['status']) => {
  switch (status) {
    case 'active':
      return {
        label: 'Active',
        className: 'bg-[#edf7f2] text-[#17734b] border-[#c8e7d8]',
      };
    case 'beta':
      return {
        label: 'Beta',
        className: 'bg-[#fff8e7] text-[#8a5a00] border-[#f5e6c8]',
      };
    case 'coming-soon':
      return {
        label: 'Coming Soon',
        className: 'bg-[#f1f5f9] text-[#64748b] border-[#dbe2ea]',
      };
  }
};

const getCategoryColor = (category: DevTool['category']) => {
  switch (category) {
    case 'core':
      return 'bg-[#eef2f8] text-[#1a365d]';
    case 'monitoring':
      return 'bg-[#edf7f2] text-[#17734b]';
    case 'documentation':
      return 'bg-[#fff8e7] text-[#8a5a00]';
    case 'tools':
      return 'bg-[#fdf0f0] text-[#a52121]';
  }
};

export default function DevDashboardPage() {
  const router = useRouter();

  const activeTools = devTools.filter(tool => tool.status === 'active').length;
  const betaTools = devTools.filter(tool => tool.status === 'beta').length;

  return (
    <main
      className="min-h-screen bg-[#f4f6f9] text-[#172033]"
      style={
        {
          '--brand': TOKENS.brand,
          '--brand-hover': TOKENS.brandHover,
          '--border': TOKENS.border,
        } as React.CSSProperties
      }
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Page navigation */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => router.back()}
            className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#dfe5ec] bg-white text-[#64748b] shadow-sm transition-colors hover:border-[#cbd5e1] hover:bg-[#f8fafc] hover:text-[#1a365d] ${focusRing}`}
            aria-label="Go back"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
          </button>

          <div className="mx-1 hidden h-6 w-px bg-[#dfe5ec] sm:block" />

          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-[0.08em] text-[#94a3b8]">
              Developers
            </p>
            <h1 className="truncate text-xl font-bold tracking-tight text-[#172033] sm:text-2xl">
              Developer Dashboard
            </h1>
          </div>
        </div>

        {/* Stats overview */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-[#dfe5ec] bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#eef2f8] text-[#1a365d]">
                <Code className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-[#94a3b8]">
                  Total Tools
                </p>
                <p className="mt-0.5 text-lg font-bold text-[#172033]">
                  {devTools.length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[#c8e7d8] bg-[#edf7f2] p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#17734b] text-white">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-[#17734b]">
                  Active
                </p>
                <p className="mt-0.5 text-lg font-bold text-[#17734b]">
                  {activeTools}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[#f5e6c8] bg-[#fff8e7] p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#8a5a00] text-white">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-[#8a5a00]">
                  Beta
                </p>
                <p className="mt-0.5 text-lg font-bold text-[#8a5a00]">
                  {betaTools}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[#dfe5ec] bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#eef2f8] text-[#1a365d]">
                <Database className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-[#94a3b8]">
                  System Status
                </p>
                <p className="mt-0.5 text-lg font-bold text-[#17734b]">
                  Online
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main tools grid */}
        <section className="overflow-hidden rounded-xl border border-[#dfe5ec] bg-white shadow-sm">
          {/* Section header */}
          <div className="border-b border-[#dfe5ec] px-5 py-5 sm:px-7">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#eef2f8] text-[#1a365d]">
                <Code className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <h2 className="text-lg font-bold text-[#172033] sm:text-xl">
                  Developer Tools
                </h2>
                <p className="mt-1 text-sm leading-6 text-[#64748b]">
                  Access developer resources, API documentation, and system monitoring tools.
                </p>
              </div>
            </div>
          </div>

          {/* Tools grid */}
          <div className="p-5 sm:p-7">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {devTools.map((tool) => {
                const ToolIcon = tool.icon;
                const statusBadge = getStatusBadge(tool.status);
                const categoryColor = getCategoryColor(tool.category);

                return (
                  <button
                    key={tool.id}
                    type="button"
                    onClick={() => router.push(tool.path)}
                    disabled={tool.status === 'coming-soon'}
                    className={`
                      group relative overflow-hidden rounded-xl border border-[#dfe5ec] bg-white p-5 text-left shadow-sm
                      transition-all duration-200
                      hover:border-[#cbd5e1] hover:shadow-md
                      disabled:opacity-50 disabled:cursor-not-allowed
                      ${focusRing}
                    `}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#eef2f8] text-[#1a365d] group-hover:bg-[#1a365d] group-hover:text-white transition-colors">
                        <ToolIcon className="h-5 w-5" />
                      </div>

                      <span
                        className={`inline-flex shrink-0 items-center rounded-md border px-2 py-1 text-[11px] font-semibold ${statusBadge.className}`}
                      >
                        {statusBadge.label}
                      </span>
                    </div>

                    <div className="mt-4">
                      <h3 className="text-base font-semibold text-[#172033] group-hover:text-[#1a365d] transition-colors">
                        {tool.title}
                      </h3>
                      <p className="mt-1.5 text-sm leading-5 text-[#64748b]">
                        {tool.description}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide ${categoryColor}`}
                      >
                        {tool.category}
                      </span>
                    </div>

                    {tool.status === 'coming-soon' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm">
                        <span className="text-sm font-medium text-[#64748b]">
                          Coming Soon
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Quick access section */}
        <section className="mt-6 overflow-hidden rounded-xl border border-[#dfe5ec] bg-white shadow-sm">
          <div className="border-b border-[#dfe5ec] px-5 py-5 sm:px-7">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#eef2f8] text-[#1a365d]">
                <Settings className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <h2 className="text-lg font-bold text-[#172033] sm:text-xl">
                  Quick Access
                </h2>
                <p className="mt-1 text-sm leading-6 text-[#64748b]">
                  Frequently used developer resources and external links.
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-7">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <a
                href="https://nextjs.org/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 rounded-lg border border-[#dfe5ec] bg-[#f8fafc] px-4 py-3 text-sm font-medium text-[#172033] transition-colors hover:border-[#cbd5e1] hover:bg-white"
              >
                <FileCode className="h-4 w-4 text-[#64748b]" />
                Next.js Documentation
              </a>

              <a
                href="https://www.prisma.io/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 rounded-lg border border-[#dfe5ec] bg-[#f8fafc] px-4 py-3 text-sm font-medium text-[#172033] transition-colors hover:border-[#cbd5e1] hover:bg-white"
              >
                <Database className="h-4 w-4 text-[#64748b]" />
                Prisma Documentation
              </a>

              <a
                href="https://react.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 rounded-lg border border-[#dfe5ec] bg-[#f8fafc] px-4 py-3 text-sm font-medium text-[#172033] transition-colors hover:border-[#cbd5e1] hover:bg-white"
              >
                <Code className="h-4 w-4 text-[#64748b]" />
                React Documentation
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}