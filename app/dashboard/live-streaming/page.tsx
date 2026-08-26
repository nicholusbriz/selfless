'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Eye,
  Monitor,
  Music,
  Play,
  RefreshCw,
  Search,
  Sparkles,
  X,
} from 'lucide-react';

import {
  useEnglishLearningVideos,
  useMusicVideos,
} from '@/hooks/useYouTube';

type VideoItem = {
  id: string;
  title?: string;
  description?: string;
  thumbnail?: string;
  duration?: string;
  viewCount?: string | number;
  channelTitle?: string;
  channelId?: string;
  publishedAt?: string;
  categoryId?: string;
};

type TabType = 'english' | 'music';

const TOKENS = `
  [data-streaming-scope] {
    --ink: #10192b;
    --ink-2: #3d4a61;
    --ink-3: #6b7789;
    --ink-4: #98a2b3;

    --surface: #ffffff;
    --surface-2: #f7f8fa;
    --surface-3: #eef1f5;

    --line: #e2e6ec;
    --line-strong: #cfd6e0;

    --brand: #1a365d;
    --brand-hover: #14294a;
    --brand-soft: #eef2f8;

    --music-brand: #7c3aed;
    --music-brand-hover: #6d28d9;
    --music-brand-soft: #ede9fe;

    --ok: #17734b;
    --ok-soft: #eaf6f0;

    --bad: #a52121;
    --bad-soft: #fdeeee;

    --radius: 12px;
    --radius-sm: 8px;

    font-variant-numeric: tabular-nums;
    font-feature-settings: 'tnum' 1, 'cv05' 1;
  }
`;

const focusRing =
  'outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-2)]';

const panel =
  'rounded-[var(--radius)] border border-[var(--line)] bg-[var(--surface)]';

const buttonBase = `
  inline-flex items-center justify-center gap-2
  rounded-[var(--radius-sm)]
  px-3.5 py-2
  text-sm font-medium
  transition-colors duration-200
  disabled:cursor-not-allowed
  disabled:opacity-50
  ${focusRing}
`;

const primaryButton = `
  ${buttonBase}
  bg-[var(--brand)]
  text-white
  hover:bg-[var(--brand-hover)]
`;

const musicButton = `
  ${buttonBase}
  bg-[var(--music-brand)]
  text-white
  hover:bg-[var(--music-brand-hover)]
`;

const englishCategories = [
  {
    id: 'all',
    label: 'All Content',
    query: 'English language learning',
  },
  {
    id: 'grammar',
    label: 'Grammar',
    query: 'English grammar tutorial',
  },
  {
    id: 'pronunciation',
    label: 'Pronunciation',
    query: 'English pronunciation guide',
  },
  {
    id: 'conversation',
    label: 'Conversation',
    query: 'conversational English',
  },
  {
    id: 'vocabulary',
    label: 'Vocabulary',
    query: 'English vocabulary',
  },
  {
    id: 'listening',
    label: 'Listening',
    query: 'English listening practice',
  },
  {
    id: 'beginners',
    label: 'For Beginners',
    query: 'English for beginners',
  },
  {
    id: 'series',
    label: 'TV Series',
    query: 'English TV series educational',
  },
] as const;

const musicCategories = [
  {
    id: 'trending',
    label: 'Trending',
    query: 'trending music videos 2026',
  },
  {
    id: 'rnb',
    label: 'R&B',
    query: 'R&B music videos lyrics',
  },
  {
    id: 'hiphop',
    label: 'Hip Hop',
    query: 'hip hop music videos lyrics',
  },
  {
    id: 'gospel',
    label: 'Gospel',
    query: 'gospel music videos lyrics',
  },
  {
    id: 'pop',
    label: 'Pop',
    query: 'pop music videos lyrics',
  },
  {
    id: 'afrobeats',
    label: 'Afrobeats',
    query: 'afrobeats music videos',
  },
  {
    id: 'reggae',
    label: 'Reggae',
    query: 'reggae music videos lyrics',
  },
  {
    id: 'classic',
    label: 'Classic',
    query: 'classic music videos lyrics',
  },
] as const;

function safeText(value: unknown, fallback = ''): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (value == null) return fallback;

  try {
    return String(value);
  } catch {
    return fallback;
  }
}

function formatViews(value: unknown): string {
  const raw = safeText(value, '0');

  if (!raw) return '0 views';

  const numeric = Number(raw.replace(/,/g, ''));

  if (!Number.isNaN(numeric)) {
    if (numeric >= 1_000_000) {
      return `${(numeric / 1_000_000).toFixed(1).replace('.0', '')}M views`;
    }

    if (numeric >= 1_000) {
      return `${(numeric / 1_000).toFixed(1).replace('.0', '')}K views`;
    }

    return `${numeric} views`;
  }

  return `${raw} views`;
}

function VideoCard({
  video,
  onSelect,
  isMusic = false,
}: {
  video: VideoItem;
  onSelect: (video: VideoItem) => void;
  isMusic?: boolean;
}) {
  const title = safeText(video.title, 'Untitled video');
  const description = safeText(
    video.description,
    'Explore this video and discover something useful.'
  );
  const duration = safeText(video.duration, '');
  const channel = safeText(video.channelTitle, 'YouTube');
  const views = formatViews(video.viewCount);

  return (
    <article
      className={`${panel} group overflow-hidden transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-[var(--line-strong)] hover:shadow-md`}
    >
      <button
        type="button"
        onClick={() => onSelect(video)}
        className={`block w-full text-left ${focusRing}`}
        aria-label={`Watch ${title}`}
      >
        <div className="relative aspect-video overflow-hidden bg-[var(--surface-3)]">
          {video.thumbnail ? (
            <img
              src={video.thumbnail}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.025]"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              {isMusic ? (
                <Music className="h-10 w-10 text-[var(--ink-4)]" />
              ) : (
                <Monitor className="h-10 w-10 text-[var(--ink-4)]" />
              )}
            </div>
          )}

          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-200 group-hover:bg-black/20">
            <span
              className="flex h-11 w-11 translate-y-1 items-center justify-center rounded-full bg-white text-[var(--brand)] opacity-0 shadow-lg transition-[opacity,transform] duration-200 group-hover:translate-y-0 group-hover:opacity-100"
              style={{
                color: isMusic
                  ? 'var(--music-brand)'
                  : 'var(--brand)',
              }}
            >
              <Play
                className="ml-0.5 h-5 w-5 fill-current"
                aria-hidden
              />
            </span>
          </div>

          {duration && (
            <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-md bg-black/80 px-2 py-1 text-[11px] font-semibold text-white">
              <Clock className="h-3 w-3" aria-hidden />
              {duration}
            </span>
          )}

          <span
            className="absolute left-2 top-2 rounded-md bg-white/95 px-2 py-1 text-[11px] font-semibold shadow-sm"
            style={{
              color: isMusic
                ? 'var(--music-brand)'
                : 'var(--brand)',
            }}
          >
            {isMusic ? 'Music' : 'Learning'}
          </span>
        </div>
      </button>

      <div className="p-4">
        <h3 className="line-clamp-2 min-h-[40px] text-[15px] font-semibold leading-5 text-[var(--ink)]">
          {title}
        </h3>

        <p className="mt-2 line-clamp-2 text-sm leading-5 text-[var(--ink-3)]">
          {description}
        </p>

        <div className="mt-4 border-t border-[var(--line)] pt-3">
          <div className="flex min-w-0 items-center justify-between gap-3 text-xs">
            <span className="inline-flex min-w-0 items-center gap-1.5 truncate text-[var(--ink-3)]">
              <Eye
                className="h-3.5 w-3.5 shrink-0"
                aria-hidden
              />
              {views}
            </span>

            <span
              className="max-w-[55%] truncate font-semibold"
              style={{
                color: isMusic
                  ? 'var(--music-brand)'
                  : 'var(--brand)',
              }}
            >
              {channel}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

function VideoPlayer({
  video,
  isMusic,
  onClose,
}: {
  video: VideoItem;
  isMusic: boolean;
  onClose: () => void;
}) {
  const title = safeText(
    video.title,
    isMusic ? 'Music video' : 'Learning video'
  );

  const description = safeText(
    video.description,
    'No description available.'
  );

  const channel = safeText(video.channelTitle, 'YouTube');

  return (
    <section
      className={`${panel} mb-8 overflow-hidden`}
      aria-label="Selected video"
    >
      <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className="h-2 w-2 rounded-full"
            style={{
              backgroundColor: isMusic
                ? 'var(--music-brand)'
                : 'var(--brand)',
            }}
          />

          <span className="truncate text-xs font-semibold uppercase tracking-[0.08em] text-[var(--ink-3)]">
            Now playing
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className={`${buttonBase} shrink-0 border border-[var(--line)] bg-[var(--surface)] px-2.5 text-[var(--ink-2)] hover:bg-[var(--surface-2)]`}
          aria-label="Close video"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.8fr)]">
        <div className="relative aspect-video bg-black lg:aspect-auto lg:min-h-[420px]">
          <iframe
            src={`https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0&modestbranding=1&controls=1&iv_load_policy=3`}
            title={title}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        <div className="flex flex-col justify-center p-5 sm:p-6 lg:p-7">
          <div className="mb-4 flex items-center gap-2">
            <span
              className="rounded-md px-2 py-1 text-[11px] font-semibold"
              style={{
                backgroundColor: isMusic
                  ? 'var(--music-brand-soft)'
                  : 'var(--brand-soft)',
                color: isMusic
                  ? 'var(--music-brand)'
                  : 'var(--brand)',
              }}
            >
              {isMusic ? 'Music' : 'English Learning'}
            </span>
          </div>

          <h2 className="text-lg font-semibold leading-6 text-[var(--ink)] sm:text-xl">
            {title}
          </h2>

          <p className="mt-3 line-clamp-5 text-sm leading-6 text-[var(--ink-3)]">
            {description}
          </p>

          <div className="mt-5 border-t border-[var(--line)] pt-4">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--ink-4)]">
              Channel
            </p>

            <p
              className="mt-1 truncate text-sm font-semibold"
              style={{
                color: isMusic
                  ? 'var(--music-brand)'
                  : 'var(--brand)',
              }}
            >
              {channel}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`${buttonBase} mt-6 w-full border border-[var(--line-strong)] bg-[var(--surface)] text-[var(--ink-2)] hover:bg-[var(--surface-2)]`}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to videos
          </button>
        </div>
      </div>
    </section>
  );
}

function FeaturedVideo({
  video,
  isMusic,
  onSelect,
}: {
  video: VideoItem;
  isMusic: boolean;
  onSelect: (video: VideoItem) => void;
}) {
  const title = safeText(
    video.title,
    isMusic ? 'Featured music' : 'Featured learning video'
  );

  const description = safeText(
    video.description,
    isMusic
      ? 'Discover music selected for your listening experience.'
      : 'Explore useful English learning content and build your skills.'
  );

  const channel = safeText(video.channelTitle, 'YouTube');
  const duration = safeText(video.duration, '');

  return (
    <section
      className={`${panel} mb-8 overflow-hidden`}
      aria-label="Featured video"
    >
      <div className="grid lg:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.85fr)]">
        <button
          type="button"
          onClick={() => onSelect(video)}
          className={`group relative block aspect-video overflow-hidden bg-[var(--surface-3)] text-left lg:aspect-auto lg:min-h-[360px] ${focusRing}`}
          aria-label={`Watch featured video: ${title}`}
        >
          {video.thumbnail ? (
            <img
              src={video.thumbnail}
              alt={title}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.025]"
              loading="eager"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              {isMusic ? (
                <Music className="h-16 w-16 text-[var(--ink-4)]" />
              ) : (
                <Monitor className="h-16 w-16 text-[var(--ink-4)]" />
              )}
            </div>
          )}

          <div className="absolute inset-0 bg-black/25 transition-colors duration-300 group-hover:bg-black/35" />

          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-xl transition-transform duration-200 group-hover:scale-105"
              style={{
                color: isMusic
                  ? 'var(--music-brand)'
                  : 'var(--brand)',
              }}
            >
              <Play className="ml-1 h-7 w-7 fill-current" />
            </span>
          </div>

          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
            <span className="rounded-md bg-black/70 px-2.5 py-1.5 text-xs font-semibold text-white">
              Featured
            </span>

            {duration && (
              <span className="inline-flex items-center gap-1 rounded-md bg-black/70 px-2.5 py-1.5 text-xs font-semibold text-white">
                <Clock className="h-3.5 w-3.5" />
                {duration}
              </span>
            )}
          </div>
        </button>

        <div className="flex flex-col justify-center p-6 sm:p-8">
          <div className="flex items-center gap-2">
            <span
              className="rounded-md px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.07em]"
              style={{
                backgroundColor: isMusic
                  ? 'var(--music-brand-soft)'
                  : 'var(--brand-soft)',
                color: isMusic
                  ? 'var(--music-brand)'
                  : 'var(--brand)',
              }}
            >
              {isMusic ? 'Music' : 'English Learning'}
            </span>

            <span className="text-xs text-[var(--ink-4)]">
              Featured selection
            </span>
          </div>

          <h2 className="mt-4 text-xl font-semibold leading-7 text-[var(--ink)] sm:text-2xl">
            {title}
          </h2>

          <p className="mt-3 line-clamp-4 text-sm leading-6 text-[var(--ink-3)]">
            {description}
          </p>

          <div className="mt-5 flex items-center gap-2 text-sm font-medium text-[var(--ink-2)]">
            <span
              className="h-2 w-2 rounded-full"
              style={{
                backgroundColor: isMusic
                  ? 'var(--music-brand)'
                  : 'var(--brand)',
              }}
            />

            <span className="truncate">{channel}</span>
          </div>

          <button
            type="button"
            onClick={() => onSelect(video)}
            className={`${
              isMusic ? musicButton : primaryButton
            } mt-6 w-fit`}
          >
            <Play className="h-4 w-4 fill-current" />
            Watch now
          </button>
        </div>
      </div>
    </section>
  );
}

function CategoryNavigation({
  categories,
  selectedCategory,
  activeTab,
  onChange,
}: {
  categories:
    | readonly {
        id: string;
        label: string;
        query: string;
      }[];
  selectedCategory: string;
  activeTab: TabType;
  onChange: (category: {
    id: string;
    label: string;
    query: string;
  }) => void;
}) {
  return (
    <section className="mb-7" aria-label="Browse categories">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--ink-4)]">
            Explore
          </p>

          <h2 className="mt-1 text-base font-semibold text-[var(--ink)]">
            {activeTab === 'english'
              ? 'Browse English topics'
              : 'Browse music'}
          </h2>
        </div>
      </div>

      <div className="overflow-x-auto pb-1">
        <div className="flex min-w-max gap-1 border-b border-[var(--line)]">
          {categories.map((category) => {
            const active = selectedCategory === category.id;

            return (
              <button
                key={category.id}
                type="button"
                onClick={() => onChange(category)}
                aria-pressed={active}
                className={`
                  relative whitespace-nowrap px-3 py-3 text-sm font-medium
                  transition-colors duration-200
                  ${focusRing}
                  ${
                    active
                      ? 'text-[var(--brand)]'
                      : 'text-[var(--ink-3)] hover:text-[var(--ink)]'
                  }
                `}
                style={
                  active && activeTab === 'music'
                    ? { color: 'var(--music-brand)' }
                    : undefined
                }
              >
                {category.label}

                {active && (
                  <span
                    className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full"
                    style={{
                      backgroundColor:
                        activeTab === 'music'
                          ? 'var(--music-brand)'
                          : 'var(--brand)',
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function LoadingGrid() {
  return (
    <section
      className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3"
      aria-busy="true"
      aria-live="polite"
    >
      {[0, 1, 2, 3, 4, 5].map((item) => (
        <div
          key={item}
          className={`${panel} overflow-hidden`}
        >
          <div className="aspect-video animate-pulse bg-[var(--surface-3)]" />

          <div className="space-y-3 p-4">
            <div className="h-4 w-4/5 animate-pulse rounded bg-[var(--surface-3)]" />
            <div className="h-3 w-full animate-pulse rounded bg-[var(--surface-3)]" />
            <div className="h-3 w-3/5 animate-pulse rounded bg-[var(--surface-3)]" />

            <div className="mt-4 border-t border-[var(--line)] pt-3">
              <div className="h-3 w-2/5 animate-pulse rounded bg-[var(--surface-3)]" />
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}

export default function StreamingPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] =
    useState<TabType>('english');

  const [searchQuery, setSearchQuery] = useState(
    'English language learning'
  );

  const [selectedCategory, setSelectedCategory] =
    useState('all');

  const [selectedVideo, setSelectedVideo] =
    useState<VideoItem | null>(null);

  const categories =
    activeTab === 'english'
      ? englishCategories
      : musicCategories;

  const englishHook = useEnglishLearningVideos(
    activeTab === 'english' ? searchQuery : '',
    12
  );

  const musicHook = useMusicVideos(
    activeTab === 'music' ? searchQuery : '',
    12
  );

  const {
    data,
    isLoading,
    error,
    refetch,
  } =
    activeTab === 'english'
      ? englishHook
      : musicHook;

  const videos = useMemo<VideoItem[]>(() => {
    if (!data || !Array.isArray(data.videos)) {
      return [];
    }

    return data.videos;
  }, [data]);

  const featuredVideo = videos[0] ?? null;

  const gridVideos = selectedVideo
    ? videos.filter((video) => video.id !== selectedVideo.id)
    : videos.slice(1);

  const handleCategoryChange = (category: {
    id: string;
    label: string;
    query: string;
  }) => {
    setSelectedCategory(category.id);
    setSearchQuery(category.query);
    setSelectedVideo(null);
  };

  const handleSearch = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setSelectedVideo(null);
  };

  const handleVideoClick = (video: VideoItem) => {
    setSelectedVideo(video);

    window.requestAnimationFrame(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    });
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSelectedCategory(
      tab === 'english' ? 'all' : 'trending'
    );
    setSelectedVideo(null);

    setSearchQuery(
      tab === 'english'
        ? 'English language learning'
        : 'trending music videos 2026'
    );
  };

  const handleClosePlayer = () => {
    setSelectedVideo(null);
  };

  const isMusic = activeTab === 'music';

  return (
    <div
      data-streaming-scope
      className="min-h-screen bg-[var(--surface-2)] text-[var(--ink)] antialiased"
    >
      <style
        dangerouslySetInnerHTML={{
          __html: TOKENS,
        }}
      />

      <main className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8">
        {/* =====================================================
            HEADER
        ====================================================== */}
        <header className="mb-7">
          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              aria-label="Go back"
              className={`${buttonBase} mt-0.5 shrink-0 border border-[var(--line-strong)] bg-[var(--surface)] px-2.5 text-[var(--ink-2)] shadow-sm hover:bg-[var(--surface-2)] hover:text-[var(--ink)]`}
            >
              <ArrowLeft
                className="h-4 w-4"
                aria-hidden
              />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--brand)]">
                  Learning & Media
                </span>

                <span className="h-1 w-1 rounded-full bg-[var(--line-strong)]" />

                <span className="text-[11px] font-medium text-[var(--ink-4)]">
                  Student Hub
                </span>
              </div>

              <h1 className="mt-2 text-2xl font-bold tracking-[-0.025em] text-[var(--ink)] sm:text-3xl">
                Streaming Hub
              </h1>

              <p className="mt-1.5 max-w-2xl text-sm leading-6 text-[var(--ink-3)] sm:text-[15px]">
                Learn, explore and take a break with carefully
                organized English learning and music content.
              </p>
            </div>
          </div>
        </header>

        {/* =====================================================
            EXPERIENCE SWITCHER
        ====================================================== */}
        <section
          className={`${panel} mb-7 p-1.5 shadow-sm`}
          aria-label="Choose content type"
        >
          <div className="grid grid-cols-2 gap-1">
            <button
              type="button"
              onClick={() => handleTabChange('english')}
              aria-pressed={activeTab === 'english'}
              className={`
                ${focusRing}
                flex min-h-[58px] items-center justify-center gap-3
                rounded-[9px]
                px-3 py-2
                text-left
                transition-colors duration-200
                sm:justify-start sm:px-5
                ${
                  activeTab === 'english'
                    ? 'bg-[var(--brand)] text-white'
                    : 'text-[var(--ink-2)] hover:bg-[var(--surface-2)]'
                }
              `}
            >
              <span
                className={`
                  flex h-9 w-9 shrink-0 items-center justify-center rounded-lg
                  ${
                    activeTab === 'english'
                      ? 'bg-white/10'
                      : 'bg-[var(--brand-soft)]'
                  }
                `}
              >
                <BookOpen className="h-4 w-4" />
              </span>

              <span className="min-w-0">
                <span className="block text-sm font-semibold">
                  English Learning
                </span>

                <span
                  className={`mt-0.5 hidden text-xs sm:block ${
                    activeTab === 'english'
                      ? 'text-white/70'
                      : 'text-[var(--ink-4)]'
                  }`}
                >
                  Improve your language skills
                </span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('music')}
              aria-pressed={activeTab === 'music'}
              className={`
                ${focusRing}
                flex min-h-[58px] items-center justify-center gap-3
                rounded-[9px]
                px-3 py-2
                text-left
                transition-colors duration-200
                sm:justify-start sm:px-5
                ${
                  activeTab === 'music'
                    ? 'bg-[var(--music-brand)] text-white'
                    : 'text-[var(--ink-2)] hover:bg-[var(--surface-2)]'
                }
              `}
            >
              <span
                className={`
                  flex h-9 w-9 shrink-0 items-center justify-center rounded-lg
                  ${
                    activeTab === 'music'
                      ? 'bg-white/10'
                      : 'bg-[var(--music-brand-soft)]'
                  }
                `}
              >
                <Music className="h-4 w-4" />
              </span>

              <span className="min-w-0">
                <span className="block text-sm font-semibold">
                  Music
                </span>

                <span
                  className={`mt-0.5 hidden text-xs sm:block ${
                    activeTab === 'music'
                      ? 'text-white/70'
                      : 'text-[var(--ink-4)]'
                  }`}
                >
                  Discover music and lyrics
                </span>
              </span>
            </button>
          </div>
        </section>

        {/* =====================================================
            SELECTED VIDEO
        ====================================================== */}
        {selectedVideo && (
          <VideoPlayer
            video={selectedVideo}
            isMusic={isMusic}
            onClose={handleClosePlayer}
          />
        )}

        {/* =====================================================
            SEARCH
        ====================================================== */}
        <section className={`${panel} mb-7 p-4 sm:p-5`}>
          <div className="mb-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--ink-4)]">
              Find something
            </p>

            <p className="mt-1 text-sm text-[var(--ink-3)]">
              Search across the current {isMusic ? 'music' : 'learning'} collection.
            </p>
          </div>

          <form
            onSubmit={handleSearch}
            className="flex flex-col gap-2.5 sm:flex-row"
          >
            <div className="relative min-w-0 flex-1">
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-4)]"
                aria-hidden
              />

              <input
                type="search"
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(event.target.value)
                }
                placeholder={
                  isMusic
                    ? 'Search music, artists or songs...'
                    : 'Search lessons, topics or English skills...'
                }
                aria-label={
                  isMusic
                    ? 'Search music videos'
                    : 'Search English learning videos'
                }
                className={`h-11 w-full rounded-[var(--radius-sm)] border border-[var(--line-strong)] bg-[var(--surface)] pl-10 pr-4 text-sm text-[var(--ink)] placeholder:text-[var(--ink-4)] transition-colors ${
                  isMusic
                    ? 'focus:border-[var(--music-brand)]'
                    : 'focus:border-[var(--brand)]'
                } ${focusRing}`}
              />
            </div>

            <button
              type="submit"
              className={`${
                isMusic ? musicButton : primaryButton
              } h-11 shrink-0 px-5`}
            >
              <Search
                className="h-4 w-4"
                aria-hidden
              />
              Search
            </button>
          </form>
        </section>

        {/* =====================================================
            LOADING
        ====================================================== */}
        {isLoading && <LoadingGrid />}

        {/* =====================================================
            ERROR
        ====================================================== */}
        {!isLoading && error && (
          <section
            className={`${panel} p-8 text-center sm:p-12`}
            role="alert"
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--bad-soft)]">
              <Monitor
                className="h-6 w-6 text-[var(--bad)]"
                aria-hidden
              />
            </div>

            <h2 className="mt-4 text-base font-semibold text-[var(--ink)]">
              {isMusic ? 'Music' : 'Learning videos'} could not be loaded
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--ink-3)]">
              We could not retrieve the content right now.
              Please check your connection and try again.
            </p>

            <button
              type="button"
              onClick={() => {
                if (typeof refetch === 'function') {
                  refetch();
                }
              }}
              className={`${
                isMusic ? musicButton : primaryButton
              } mt-5`}
            >
              <RefreshCw
                className="h-4 w-4"
                aria-hidden
              />
              Try again
            </button>
          </section>
        )}

        {/* =====================================================
            EMPTY
        ====================================================== */}
        {!isLoading && !error && videos.length === 0 && (
          <section
            className={`${panel} p-8 text-center sm:p-12`}
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--brand-soft)]">
              {isMusic ? (
                <Music
                  className="h-7 w-7 text-[var(--music-brand)]"
                  aria-hidden
                />
              ) : (
                <Monitor
                  className="h-7 w-7 text-[var(--brand)]"
                  aria-hidden
                />
              )}
            </div>

            <h2 className="mt-4 text-lg font-semibold text-[var(--ink)]">
              No {isMusic ? 'music' : 'learning videos'} found
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--ink-3)]">
              Try another search phrase or select a different
              category.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearchQuery(
                  isMusic
                    ? 'trending music videos 2026'
                    : 'English language learning'
                );

                setSelectedCategory(
                  isMusic ? 'trending' : 'all'
                );
              }}
              className={`${
                isMusic ? musicButton : primaryButton
              } mt-5`}
            >
              Reset search
            </button>
          </section>
        )}

        {/* =====================================================
            CONTENT
        ====================================================== */}
        {!isLoading && !error && videos.length > 0 && (
          <>
            {/* Featured */}
            {!selectedVideo && featuredVideo && (
              <FeaturedVideo
                video={featuredVideo}
                isMusic={isMusic}
                onSelect={handleVideoClick}
              />
            )}

            {/* Categories */}
            <CategoryNavigation
              categories={categories}
              selectedCategory={selectedCategory}
              activeTab={activeTab}
              onChange={handleCategoryChange}
            />

            {/* Results Header */}
            <section
              aria-label={
                isMusic
                  ? 'Music videos'
                  : 'English learning videos'
              }
            >
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles
                      className="h-4 w-4"
                      style={{
                        color: isMusic
                          ? 'var(--music-brand)'
                          : 'var(--brand)',
                      }}
                      aria-hidden
                    />

                    <h2 className="text-base font-semibold text-[var(--ink)]">
                      {isMusic
                        ? 'Music videos'
                        : 'Learning videos'}
                    </h2>
                  </div>

                  <p className="mt-1 text-sm text-[var(--ink-3)]">
                    {videos.length}{' '}
                    {isMusic ? 'songs and videos' : 'videos'} available
                  </p>
                </div>

                <div className="text-xs font-medium text-[var(--ink-4)]">
                  Powered by YouTube
                </div>
              </div>

              {gridVideos.length > 0 ? (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {gridVideos.map((video) => (
                    <VideoCard
                      key={video.id}
                      video={video}
                      onSelect={handleVideoClick}
                      isMusic={isMusic}
                    />
                  ))}
                </div>
              ) : (
                <div
                  className={`${panel} p-8 text-center`}
                >
                  <p className="text-sm text-[var(--ink-3)]">
                    Select another video to continue exploring.
                  </p>
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}