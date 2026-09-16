'use client';

import { useCallback, useRef, useState } from 'react';
import {
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  X,
  FileVideo,
} from 'lucide-react';

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB

const ALLOWED_MEDIA_TYPES = new Set([
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif',
  'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/mp4',
  'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime',
]);

export interface UploadedMedia {
  id: string;
  publicUrl: string;
  blobName: string;
  fileName: string;
  contentType: string;
  size: number;
  title: string;
  description: string;
}

interface AzureMediaUploadProps {
  onUploadComplete?: (media: UploadedMedia) => void;
  onUploadError?: (message: string) => void;
  accept?: string;
  label?: string;
  className?: string;
  defaultCategory?: string;
}

export default function AzureMediaUpload({
  onUploadComplete,
  onUploadError,
  accept = 'image/*,audio/*,video/*',
  label = 'Drop a file here, or click to browse',
  className = '',
  defaultCategory = 'gallery',
}: AzureMediaUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploaded, setUploaded] = useState<UploadedMedia | null>(null);

  // File & metadata
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const resetAll = () => {
    setFile(null);
    setTitle('');
    setDescription('');
    setProgress(0);
    setError(null);
    setUploaded(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleFileSelected = (selected: File) => {
    // Local error reporting (kept out of the useCallback to avoid deps)
    const showError = (message: string) => {
      setError(message);
      onUploadError?.(message);
    };

    if (!ALLOWED_MEDIA_TYPES.has(selected.type)) {
      showError('Only supported image, audio, and video files are allowed');
      return;
    }
    if (selected.size <= 0 || selected.size > MAX_FILE_SIZE) {
      showError('File must be between 1 byte and 100 MB');
      return;
    }

    setError(null);
    setFile(selected);

    // Prefill title with the file name (without extension) if empty
    if (!title) {
      setTitle(selected.name.replace(/\.[^.]+$/, ''));
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!uploading) setDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    if (uploading) return;
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) handleFileSelected(dropped);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0];
    if (picked) handleFileSelected(picked);
  };

  const handleUpload = useCallback(async () => {
    // Inline error reporter — avoids the ESLint exhaustive-deps warning
    const fail = (message: string) => {
      setError(message);
      onUploadError?.(message);
    };

    if (!file) {
      fail('Please choose a file first');
      return;
    }
    if (!title.trim()) {
      fail('Please add a title before uploading');
      return;
    }

    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      // 1. Get SAS token from our API
      const tokenRes = await fetch('/api/media/sas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
        }),
      });
      const tokenData = await tokenRes.json();
      if (!tokenRes.ok || !tokenData.success) {
        throw new Error(tokenData?.error ?? 'Could not prepare upload');
      }
      const { uploadUrl, publicUrl, blobName } = tokenData;

      // 2. Upload directly to Azure
      const xhr = new XMLHttpRequest();
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          setProgress(Math.round((e.loaded / e.total) * 100));
        }
      });

      await new Promise<void>((resolve, reject) => {
        xhr.open('PUT', uploadUrl, true);
        xhr.setRequestHeader('x-ms-blob-type', 'BlockBlob');
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error(`Upload failed with status ${xhr.status}`));
        };
        xhr.onerror = () => reject(new Error('Upload failed'));
        xhr.send(file);
      });

      // 3. Save metadata to MongoDB
      const saveRes = await fetch('/api/media/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blobName,
          publicUrl,
          fileName: file.name,
          contentType: file.type,
          size: file.size,
          title: title.trim(),
          description: description.trim(),
          category: defaultCategory,
        }),
      });
      const saveData = await saveRes.json();
      if (!saveRes.ok || !saveData.success) {
        throw new Error(
          saveData?.error ?? 'Uploaded to Azure, but metadata failed to save',
        );
      }

      // 4. Report success
      const result: UploadedMedia = {
        id: saveData.media.id,
        publicUrl,
        blobName,
        fileName: file.name,
        contentType: file.type,
        size: file.size,
        title: title.trim(),
        description: description.trim(),
      };

      setUploaded(result);
      onUploadComplete?.(result);
      setFile(null);
    } catch (err) {
      fail(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }, [
    file,
    title,
    description,
    defaultCategory,
    onUploadComplete,
    onUploadError,
  ]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => !uploading && !file && inputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !uploading && !file) {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={handleDragOver}
        onDragEnter={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={[
          'relative flex min-h-[160px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition-all',
          dragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-slate-100',
          uploading || file ? 'pointer-events-none opacity-70' : '',
        ].join(' ')}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
        />
        <UploadCloud className="h-8 w-8 text-slate-500" />
        <p className="text-sm font-semibold text-slate-800">
          {label}
        </p>
        <p className="text-xs text-slate-500">
          Images, audio, or video up to 100 MB
        </p>
      </div>

      {/* Metadata form — appears once a file is selected */}
      {file && !uploading && !uploaded && (
        <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-slate-700">
            <FileVideo className="h-4 w-4 text-slate-500" />
            <span className="font-medium">Selected:</span>
            <span className="truncate">{file.name}</span>
            <span className="ml-auto text-xs text-slate-500">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </span>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">
              Title <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give this file a title"
              maxLength={120}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a short description (optional)"
              rows={3}
              maxLength={500}
              className="w-full resize-none rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleUpload}
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Upload
            </button>
            <button
              type="button"
              onClick={resetAll}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Progress */}
      {uploading && (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-blue-600 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-xs font-medium text-slate-600">
            Uploading… {progress}%
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span className="flex-1">{error}</span>
        </div>
      )}

      {/* Success */}
      {uploaded && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-700" />
              <p className="text-sm font-semibold text-green-900">
                Uploaded successfully
              </p>
            </div>
            <button
              type="button"
              onClick={resetAll}
              aria-label="Dismiss"
              className="rounded p-1 text-green-800 hover:bg-green-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <p className="text-sm font-semibold text-green-900">
            {uploaded.title}
          </p>
          {uploaded.description && (
            <p className="mt-1 text-xs text-green-800">
              {uploaded.description}
            </p>
          )}

          {uploaded.contentType.startsWith('video/') && (
            <video
              src={uploaded.publicUrl}
              controls
              playsInline
              className="mt-3 aspect-video w-full rounded-lg bg-black"
            />
          )}
          {uploaded.contentType.startsWith('image/') && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={uploaded.publicUrl}
              alt={uploaded.title}
              className="mt-3 max-h-64 w-full rounded-lg object-contain"
            />
          )}
          {uploaded.contentType.startsWith('audio/') && (
            <div className="mt-3">
              <audio src={uploaded.publicUrl} controls className="w-full" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}