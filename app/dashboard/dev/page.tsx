'use client';

import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Video,
  CloudUpload,
  ShieldAlert,
  ChevronDown,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import AzureMediaUpload, {
  type UploadedMedia,
} from '@/components/AzureMediaUpload';
import AzureVideoGallery from '@/components/AzureVideoGallery';
import { getApiErrorMessage, isJsonObject } from '@/lib/api-response';

interface TechCenterOption {
  id: string;
  name: string;
}

function isTechCenterOption(value: unknown): value is TechCenterOption {
  return (
    isJsonObject(value) &&
    typeof value.id === 'string' &&
    typeof value.name === 'string'
  );
}

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

export default function DevDashboardPage() {
  const router = useRouter();

  // State for the Azure Media Upload section
  const [azureMessage, setAzureMessage] = useState<string | null>(null);
  const [lastAzureUpload, setLastAzureUpload] =
    useState<UploadedMedia | null>(null);

  // Used to force-refresh the Azure gallery after an upload
  const [galleryRefreshKey, setGalleryRefreshKey] = useState(0);

  // State for session invalidation
  const [selectedTechCenter, setSelectedTechCenter] = useState<string>('');
  const [sessionMessage, setSessionMessage] = useState<string | null>(null);
  const [isInvalidating, setIsInvalidating] = useState(false);
  const [techCenters, setTechCenters] = useState<TechCenterOption[]>([]);

  // Load tech centers on mount
  useEffect(() => {
    fetch('/api/tech-centers')
      .then((res) => res.json())
      .then((data: unknown) => {
        if (Array.isArray(data) && data.every(isTechCenterOption)) {
          setTechCenters(data);
        }
      })
      .catch((err) => console.error('Failed to load tech centers:', err));
  }, []);

  const handleAzureUploadComplete = (media: UploadedMedia) => {
    setLastAzureUpload(media);
    setAzureMessage(`Uploaded: ${media.fileName}`);
    // Bump the gallery key so it re-fetches the newest file list
    setGalleryRefreshKey((key) => key + 1);
  };

  const handleAzureUploadError = (message: string) => {
    setAzureMessage(message);
  };

  const handleInvalidateSessions = async () => {
    setIsInvalidating(true);
    setSessionMessage(null);

    try {
      const response = await fetch('/api/dev/invalidate-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          techCenterId: selectedTechCenter || null,
        }),
      });

      const data: unknown = await response.json();
      const dataObject = isJsonObject(data) ? data : null;

      if (response.ok) {
        setSessionMessage(
          typeof dataObject?.message === 'string' ? dataObject.message : '',
        );
      } else {
        setSessionMessage(
          getApiErrorMessage(data, 'Failed to invalidate sessions'),
        );
      }
    } catch (error) {
      console.error('Error invalidating sessions:', error);
      setSessionMessage('Failed to invalidate sessions');
    } finally {
      setIsInvalidating(false);
    }
  };

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
            <h1 className="truncate text-xl font-bold tracking-tight text-[#172033] sm:text-2xl">
              Developer Dashboard
            </h1>
          </div>
        </div>

        {/* ==========================================================
            Session Invalidation
        ========================================================== */}
        <section className="overflow-hidden rounded-xl border border-[#dfe5ec] bg-white shadow-sm">
          <div className="border-b border-[#dfe5ec] px-5 py-5 sm:px-7">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#fdf0f0] text-[#a52121]">
                <ShieldAlert className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <h2 className="text-lg font-bold text-[#172033] sm:text-xl">
                  Session Invalidation
                </h2>
                <p className="mt-1 text-sm leading-6 text-[#64748b]">
                  Invalidate user sessions by tech center. This will force all
                  affected users to re-authenticate.
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-7">
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="tech-center-select"
                  className="block text-sm font-medium text-[#172033]"
                >
                  Select Tech Center
                </label>
                <div className="relative mt-2">
                  <select
                    id="tech-center-select"
                    value={selectedTechCenter}
                    onChange={(e) => setSelectedTechCenter(e.target.value)}
                    className={`w-full appearance-none rounded-lg border border-[#dfe5ec] bg-white px-4 py-2.5 pr-10 text-sm text-[#172033] shadow-sm focus:border-[#1a365d] focus:outline-none focus:ring-2 focus:ring-[#1a365d]/20 ${focusRing}`}
                  >
                    <option value="">All Tech Centers</option>
                    {techCenters.map((tc) => (
                      <option key={tc.id} value={tc.id}>
                        {tc.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <ChevronDown className="h-4 w-4 text-[#64748b]" />
                  </div>
                </div>
                <p className="mt-1.5 text-xs text-[#64748b]">
                  {selectedTechCenter
                    ? 'Will invalidate sessions for users in selected tech center only'
                    : 'Will invalidate sessions for all users across all tech centers'}
                </p>
              </div>

              <button
                type="button"
                onClick={handleInvalidateSessions}
                disabled={isInvalidating}
                className={`inline-flex items-center gap-2 rounded-lg bg-[#a52121] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#8a1a1a] disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`}
              >
                <ShieldAlert className="h-4 w-4" />
                {isInvalidating
                  ? 'Invalidating...'
                  : selectedTechCenter
                  ? 'Invalidate Sessions for Selected Tech Center'
                  : 'Invalidate All Sessions'}
              </button>

              {sessionMessage && (
                <p
                  className={`text-sm ${
                    sessionMessage.includes('Invalidated')
                      ? 'text-[#17734b]'
                      : 'text-[#a52121]'
                  }`}
                >
                  {sessionMessage}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* ==========================================================
            Azure Media Upload — drag & drop, preview, Azure-hosted
        ========================================================== */}
        <section className="mt-6 overflow-hidden rounded-xl border border-[#dfe5ec] bg-white shadow-sm">
          <div className="border-b border-[#dfe5ec] px-5 py-5 sm:px-7">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#eef2f8] text-[#1a365d]">
                <CloudUpload className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <h2 className="text-lg font-bold text-[#172033] sm:text-xl">
                  Azure Media Upload
                </h2>
                <p className="mt-1 text-sm leading-6 text-[#64748b]">
                  Drag a file onto the area below, or click to browse. Files
                  upload directly to Azure Blob Storage and preview instantly.
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-7">
            <AzureMediaUpload
              label="Drop a file here, or click to browse"
              accept="image/*,audio/*,video/*"
              onUploadComplete={handleAzureUploadComplete}
              onUploadError={handleAzureUploadError}
            />

            {azureMessage && (
              <p className="mt-4 text-sm font-medium text-[#17734b]">
                {azureMessage}
              </p>
            )}

            {lastAzureUpload && (
              <div className="mt-4 rounded-lg border border-[#dfe5ec] bg-[#f8fafc] p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-[#94a3b8]">
                  Last uploaded file
                </p>

                <dl className="mt-2 space-y-1 text-sm">
                  <div className="flex gap-2">
                    <dt className="font-medium text-[#172033]">Name:</dt>
                    <dd className="text-[#64748b]">
                      {lastAzureUpload.fileName}
                    </dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="font-medium text-[#172033]">Type:</dt>
                    <dd className="text-[#64748b]">
                      {lastAzureUpload.contentType}
                    </dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="font-medium text-[#172033]">Size:</dt>
                    <dd className="text-[#64748b]">
                      {(lastAzureUpload.size / 1024 / 1024).toFixed(2)} MB
                    </dd>
                  </div>
                  <div className="flex min-w-0 gap-2">
                    <dt className="shrink-0 font-medium text-[#172033]">
                      URL:
                    </dt>
                    <dd className="min-w-0">
                      <a
                        href={lastAzureUpload.publicUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="break-all text-[#1a365d] underline"
                      >
                        {lastAzureUpload.publicUrl}
                      </a>
                    </dd>
                  </div>
                </dl>
              </div>
            )}
          </div>
        </section>

        {/* ==========================================================
            Your Azure Videos — fetched from Azure and played inline
        ========================================================== */}
        <section className="mt-6 overflow-hidden rounded-xl border border-[#dfe5ec] bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-[#dfe5ec] px-5 py-5 sm:px-7">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#eef2f8] text-[#1a365d]">
              <Video className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#172033]">
                Your Azure Videos
              </h2>
              <p className="text-sm text-[#64748b]">
                Videos you have uploaded to Azure Blob Storage.
              </p>
            </div>
          </div>
          <div className="p-5 sm:p-7">
            <AzureVideoGallery key={galleryRefreshKey} />
          </div>
        </section>
      </div>
    </main>
  );
}