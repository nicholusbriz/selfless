'use client';

import { useCallback, useRef, useState } from 'react';
import {
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  X,
  FileVideo,
  Image as ImageIcon,
  Video,
} from 'lucide-react';
import { getApiErrorMessage, isJsonObject, readJsonObject } from '@/lib/api-response';
import { useAuth } from '@/lib/hooks/useAuth';

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

interface SasTokenResponse {
  success: boolean;
  uploadUrl: string;
  publicUrl: string;
  blobName: string;
  error?: string;
}

interface SavedMediaResponse {
  success: boolean;
  media: { id: string };
  error?: string;
}

function isSasTokenResponse(value: unknown): value is SasTokenResponse {
  return (
    isJsonObject(value) &&
    typeof value.success === 'boolean' &&
    typeof value.uploadUrl === 'string' &&
    typeof value.publicUrl === 'string' &&
    typeof value.blobName === 'string' &&
    (value.error === undefined || typeof value.error === 'string')
  );
}

function isSavedMediaResponse(value: unknown): value is SavedMediaResponse {
  return (
    isJsonObject(value) &&
    typeof value.success === 'boolean' &&
    isJsonObject(value.media) &&
    typeof value.media.id === 'string' &&
    (value.error === undefined || typeof value.error === 'string')
  );
}

interface AzureMediaUploadProps {
  onUploadComplete?: (media: UploadedMedia) => void;
  onUploadError?: (message: string) => void;
  onAllUploadsComplete?: (count: number) => void;
  accept?: string;
  label?: string;
  className?: string;
  defaultCategory?: string;
  showFormWhenEmpty?: boolean;
  submitLabel?: string;
  allowMultiple?: boolean;
  allowAudio?: boolean;
}

export default function AzureMediaUpload({
  onUploadComplete,
  onUploadError,
  onAllUploadsComplete,
  accept = 'image/*,audio/*,video/*',
  label = 'Drop files here, or click to browse',
  className = '',
  defaultCategory = 'gallery',
  showFormWhenEmpty = false,
  submitLabel = 'Upload',
  allowMultiple = true,
  allowAudio = true,
}: AzureMediaUploadProps) {
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);

  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploaded, setUploaded] = useState<UploadedMedia | null>(null);

  // File & metadata
  const [files, setFiles] = useState<File[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string>(defaultCategory);

  // Track upload progress for each file
  const [uploadProgress, setUploadProgress] = useState<{ [fileName: string]: number }>({});
  const [uploadedFiles, setUploadedFiles] = useState<UploadedMedia[]>([]);

  const resetAll = () => {
    setFiles([]);
    setTitle('');
    setDescription('');
    setCategory(user?.role === 'dev' ? defaultCategory : 'gallery');
    setProgress(0);
    setError(null);
    setUploaded(null);
    setUploadProgress({});
    setUploadedFiles([]);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleFileSelected = (selected: File | File[]) => {
    // Local error reporting (kept out of the useCallback to avoid deps)
    const showError = (message: string) => {
      setError(message);
      onUploadError?.(message);
    };

    const selectedFiles = Array.isArray(selected) ? selected : [selected];

    if (!allowMultiple && selectedFiles.length > 1) {
      showError('Choose one photo or video per post.');
      return;
    }

    // Validate all files
    const validFiles = selectedFiles.filter((file) => {
      if (!allowAudio && file.type.startsWith('audio/')) {
        showError(`File "${file.name}" is not supported. Choose a photo or video.`);
        return false;
      }
      if (!ALLOWED_MEDIA_TYPES.has(file.type)) {
        showError(`File "${file.name}" is not supported. Only image, audio, and video files are allowed.`);
        return false;
      }
      if (file.size <= 0 || file.size > MAX_FILE_SIZE) {
        showError(`File "${file.name}" must be between 1 byte and 100 MB.`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setError(null);
    setFiles(validFiles);

    // Prefill title with the first file name (without extension) if empty
    if (!title && validFiles.length > 0) {
      setTitle(validFiles[0].name.replace(/\.[^.]+$/, ''));
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
    const dropped = Array.from(e.dataTransfer.files || []);
    if (dropped.length > 0) handleFileSelected(dropped);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files || []);
    if (picked.length > 0) handleFileSelected(picked);
  };

  const handleUpload = useCallback(async () => {
    // Inline error reporter — avoids the ESLint exhaustive-deps warning
    const fail = (message: string) => {
      setError(message);
      onUploadError?.(message);
    };

    if (files.length === 0) {
      fail('Please choose files first');
      return;
    }
    if (!title.trim()) {
      fail('Please add a title before uploading');
      return;
    }
    const uploadCategory = user?.role === 'dev' ? category : 'gallery';
    if (!uploadCategory) {
      fail('Please select a category before uploading');
      return;
    }

    setUploading(true);
    setProgress(0);
    setError(null);
    setUploadedFiles([]);

    if (!allowMultiple && files.length > 1) {
      fail('Choose one photo or video per post.');
      setUploading(false);
      return;
    }

    const totalFiles = files.length;
    let completedFiles = 0;
    let firstUploaded: UploadedMedia | null = null;
    let uploadFailure: unknown;

    try {
      // Upload files sequentially
      for (const file of files) {
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
          const tokenData = await readJsonObject(tokenRes);
          if (!tokenRes.ok || !isSasTokenResponse(tokenData) || !tokenData.success) {
            throw new Error(getApiErrorMessage(tokenData, 'Could not prepare upload'));
          }
          const { uploadUrl, publicUrl, blobName } = tokenData;

          // 2. Upload directly to Azure
          const xhr = new XMLHttpRequest();
          xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
              const fileProgress = Math.round((e.loaded / e.total) * 100);
              setUploadProgress((prev) => ({ ...prev, [file.name]: fileProgress }));
              // Overall progress
              const overallProgress = Math.round(((completedFiles + fileProgress / 100) / totalFiles) * 100);
              setProgress(overallProgress);
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
              category: uploadCategory,
            }),
          });
          const saveData = await readJsonObject(saveRes);
          if (!saveRes.ok || !isSavedMediaResponse(saveData) || !saveData.success) {
            throw new Error(
              getApiErrorMessage(saveData, 'Uploaded to Azure, but metadata failed to save'),
            );
          }

          // 4. Track successful upload
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

          firstUploaded ??= result;
          setUploadedFiles((prev) => [...prev, result]);
          onUploadComplete?.(result);
          completedFiles++;
        } catch (err) {
          console.error(`Failed to upload ${file.name}:`, err);
          uploadFailure = err;
        }
      }

      if (completedFiles === 0 && uploadFailure) {
        fail(uploadFailure instanceof Error ? uploadFailure.message : 'Upload failed');
        return;
      }

      // Report completion
      onAllUploadsComplete?.(completedFiles);
      setUploaded(firstUploaded);
      setFiles([]);
    } catch (err) {
      fail(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }, [
    files,
    title,
    description,
    category,
    defaultCategory,
    allowMultiple,
    user?.role,
    onUploadComplete,
    onUploadError,
    onAllUploadsComplete,
  ]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => !uploading && files.length === 0 && inputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !uploading && files.length === 0) {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={handleDragOver}
        onDragEnter={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={[
          'group relative flex min-h-[180px] cursor-pointer flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border-2 border-dashed p-7 text-center transition-all',
          dragging
            ? 'border-[#1A2B4C] bg-[#F0F4FA] shadow-inner'
            : 'border-[#D9E0EA] bg-gradient-to-b from-[#FAFBFD] to-[#F4F6F9] hover:border-[#9AAAC0] hover:from-white hover:to-[#F3F6FA]',
          uploading ? 'pointer-events-none opacity-70' : '',
        ].join(' ')}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={allowMultiple}
          onChange={handleInputChange}
          className="hidden"
        />
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#1A2B4C] shadow-sm ring-1 ring-[#E5EAF1] transition-transform group-hover:-translate-y-0.5">
          <UploadCloud className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm font-semibold text-[#172033]">{label}</p>
          <p className="mt-1 text-xs text-[#687386]">
            {allowAudio ? 'Photos, audio, or video' : 'Photos or videos'}
            {' · Up to 100 MB'}
            {allowMultiple ? ' · Multiple files allowed' : ' · One file per post'}
          </p>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-medium text-[#687386]">
          {!allowAudio && (
            <>
              <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 shadow-sm ring-1 ring-[#E5EAF1]">
                <ImageIcon className="h-3.5 w-3.5 text-[#8A6A2F]" />
                Photo
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 shadow-sm ring-1 ring-[#E5EAF1]">
                <Video className="h-3.5 w-3.5 text-[#8A6A2F]" />
                Video
              </span>
            </>
          )}
        </div>
        <p className="text-xs text-[#8A93A2]">
          {dragging ? 'Drop your file to attach it' : 'Click to browse or drag and drop'}
        </p>
      </div>

      {/* Metadata form — appears once files are selected */}
      {(files.length > 0 || showFormWhenEmpty) && !uploading && !uploaded && (
        <div className="space-y-5 rounded-2xl border border-[#E5EAF1] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-3 border-b border-[#EEF1F5] pb-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F0F4FA] text-[#1A2B4C]">
              <FileVideo className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#172033]">Post details</h3>
              <p className="mt-0.5 text-xs leading-5 text-[#687386]">
                Add a title and description, then attach {allowMultiple ? 'your file(s)' : 'one photo or video'} to share with the community.
              </p>
            </div>
          </div>
          {files.length > 0 ? (
            <>
              <div className="flex items-center gap-2 text-sm text-[#172033]">
                <span className="font-semibold">{files.length} file{files.length !== 1 ? 's' : ''} attached</span>
                <span className="ml-auto text-xs text-[#687386]">
                  {(files.reduce((acc, f) => acc + f.size, 0) / 1024 / 1024).toFixed(2)} MB total
                </span>
              </div>
              <div className="max-h-32 space-y-1.5 overflow-y-auto">
                {files.map((file, index) => (
                  <div key={`${file.name}-${index}`} className="flex items-center gap-2 rounded-lg bg-[#F7F8FA] px-3 py-2 text-xs text-[#526078]">
                    <span className="flex-1 truncate font-medium">{file.name}</span>
                    <span className="text-[#8A93A2]">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="rounded-xl bg-[#F7F8FA] px-4 py-3 text-sm text-[#687386]">
              Attach {allowMultiple ? 'at least one photo or video' : 'one photo or video'} above to enable posting.
            </p>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[#344054]">
              Title <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your post a title"
              maxLength={120}
              className="w-full rounded-xl border border-[#D9E0EA] bg-white px-3.5 py-2.5 text-sm text-[#172033] outline-none transition placeholder:text-[#9AA3B1] focus:border-[#1A2B4C] focus:ring-2 focus:ring-[#1A2B4C]/10"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[#344054]">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Talk about this post"
              rows={3}
              maxLength={200}
              className="w-full resize-none rounded-xl border border-[#D9E0EA] bg-white px-3.5 py-2.5 text-sm text-[#172033] outline-none transition placeholder:text-[#9AA3B1] focus:border-[#1A2B4C] focus:ring-2 focus:ring-[#1A2B4C]/10"
            />
            <p className="mt-1 text-right text-xs text-[#8A93A2]">
              {description.length}/200
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[#344054]">
              Category <span className="text-red-600">*</span>
            </label>
            {user?.role === 'dev' ? (
              <>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-[#D9E0EA] bg-white px-3.5 py-2.5 text-sm text-[#172033] outline-none transition focus:border-[#1A2B4C] focus:ring-2 focus:ring-[#1A2B4C]/10"
                >
                  <option value="">Select a category...</option>
                  <option value="dashboard">Dashboard (Video Player)</option>
                  <option value="gallery">Gallery (Videos & Photos)</option>
                </select>
                <p className="mt-1 text-xs text-slate-500">
                  {category === 'dashboard'
                    ? 'This will appear in the dashboard video player'
                    : category === 'gallery'
                    ? 'This will appear in the gallery page'
                    : 'Choose where this content will be displayed'}
                </p>
              </>
            ) : (
              <>
                <div className="rounded-xl bg-[#F7F8FA] px-3.5 py-2.5 text-sm text-[#526078]">
                  Gallery (Videos & Photos)
                </div>
              </>
            )}
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-[#EEF1F5] pt-4 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={handleUpload}
              disabled={files.length === 0 || !title.trim() || (user?.role === 'dev' && !category)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1A2B4C] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#263D66] disabled:cursor-not-allowed disabled:opacity-45 sm:ml-auto"
            >
              {submitLabel}
            </button>
            <button
              type="button"
              onClick={resetAll}
              className="rounded-xl border border-[#D9E0EA] px-4 py-2.5 text-sm font-semibold text-[#526078] transition hover:bg-[#F7F8FA]"
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
            Uploading {files.length} file{files.length !== 1 ? 's' : ''}… {progress}%
          </p>
          {Object.keys(uploadProgress).length > 0 && (
            <div className="mt-3 max-h-32 overflow-y-auto space-y-1">
              {files.map((file) => (
                <div key={file.name} className="flex items-center gap-2 text-xs text-slate-600">
                  <span className="truncate flex-1">{file.name}</span>
                  <span className="text-slate-400">
                    {uploadProgress[file.name] || 0}%
                  </span>
                </div>
              ))}
            </div>
          )}
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
                {(user?.role === 'dev' || user?.role === 'super_admin')
                  ? 'Post created successfully'
                  : 'Your post has been created and will appear on the Posts page after review.'}
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