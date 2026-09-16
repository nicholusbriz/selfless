'use client';

import { useEffect, useState } from 'react';
import {
  Trash2,
  Video,
  AlertCircle,
  Loader2,
  RefreshCw,
} from 'lucide-react';

interface MediaItem {
  id: string;
  publicUrl: string;
  blobName: string;
  contentType: string;
  size: number;
  title: string;
  description: string | null;
  category: string | null;
  createdAt: string;
}

export default function AzureVideoGallery({
  category,
}: {
  category?: string;
}) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setError(null);

      try {
        const url = category
          ? `/api/media/list?category=${encodeURIComponent(category)}`
          : '/api/media/list';

        const res = await fetch(url, { signal: controller.signal });
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data?.error ?? 'Could not load media');
        }

        if (!cancelled) setItems(data.items ?? []);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Could not load media');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [refreshKey, category]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this file permanently?')) return;

    setDeletingId(id);
    try {
      const res = await fetch('/api/media/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaId: id }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.error ?? 'Delete failed');
      }
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading media…
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-3">
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
        <button
          type="button"
          onClick={() => setRefreshKey((k) => k + 1)}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <RefreshCw className="h-4 w-4" />
          Try again
        </button>
      </div>
    );
  }

  const videos = items.filter((item) =>
    item.contentType.startsWith('video/'),
  );

  if (videos.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
        <Video className="mx-auto mb-3 h-8 w-8 text-slate-400" />
        <p className="text-sm font-medium text-slate-700">
          No videos uploaded yet
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Use the Azure Media Upload section above to add your first file.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {videos.length} {videos.length === 1 ? 'video' : 'videos'}
        </p>
        <button
          type="button"
          onClick={() => setRefreshKey((k) => k + 1)}
          className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          <RefreshCw className="h-3 w-3" />
          Refresh
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((item) => (
          <div
            key={item.id}
            className="overflow-hidden rounded-lg border border-[#dfe5ec] bg-white shadow-sm"
          >
            <video
              src={item.publicUrl}
              controls
              playsInline
              preload="metadata"
              className="aspect-video w-full bg-black"
            />

            <div className="p-4">
              <p className="text-sm font-semibold text-[#172033]">
                {item.title}
              </p>

              {item.description && (
                <p className="mt-1 line-clamp-2 text-xs text-[#64748b]">
                  {item.description}
                </p>
              )}

              <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-[#94a3b8]">
                <span>{(item.size / 1024 / 1024).toFixed(2)} MB</span>
                <span>
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleDelete(item.id)}
                disabled={deletingId === item.id}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-red-600 hover:text-red-800 disabled:opacity-50"
              >
                {deletingId === item.id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}