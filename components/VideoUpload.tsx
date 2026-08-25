'use client';

import { useState, useCallback } from 'react';
import { Upload, X, Video as VideoIcon, CheckCircle, AlertCircle } from 'lucide-react';

interface VideoUploadProps {
  onUploadComplete?: (videoUrl: string) => void;
  onError?: (error: string) => void;
}

export default function VideoUpload({ onUploadComplete, onError }: VideoUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const videoFile = files.find(file => file.type.startsWith('video/'));

    if (videoFile) {
      uploadVideo(videoFile);
    } else {
      setError('Please drop a valid video file');
      onError?.('Please drop a valid video file');
    }
  }, [onError]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      uploadVideo(file);
    } else {
      setError('Please select a valid video file');
      onError?.('Please select a valid video file');
    }
  }, [onError]);

  const uploadVideo = async (file: File) => {
    // Validate file size (max 100MB)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      setError('Video file too large. Maximum size is 100MB.');
      onError?.('Video file too large. Maximum size is 100MB.');
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccess(false);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('video', file);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch('/api/videos/upload', {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header - let the browser set it automatically with the proper boundary
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        let errorMessage = 'Upload failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          errorMessage = `Upload failed with status ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        throw new Error('Failed to parse server response');
      }

      if (!data.videoUrl) {
        throw new Error('No video URL returned from server');
      }

      setUploadedVideoUrl(data.videoUrl);
      setSuccess(true);
      setUploadProgress(100);
      onUploadComplete?.(data.videoUrl);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to upload video';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setUploadedVideoUrl(null);
    setError(null);
    setSuccess(false);
    setUploadProgress(0);
  };

  return (
    <div className="w-full">
      {!uploadedVideoUrl ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-xl p-8
            transition-all duration-200
            ${isDragging ? 'border-[#1A365D] bg-[#EEF5FB]' : 'border-[#D9E2EC] bg-white'}
            ${isUploading ? 'pointer-events-none opacity-60' : 'cursor-pointer hover:border-[#1A365D] hover:bg-[#F8FAFC]'}
          `}
        >
          <input
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isUploading}
          />

          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <div
              className={`
                flex h-16 w-16 items-center justify-center rounded-full
                transition-colors
                ${isDragging ? 'bg-[#1A365D] text-white' : 'bg-[#EEF5FB] text-[#1A365D]'}
              `}
            >
              {isUploading ? (
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#1A365D] border-t-transparent" />
              ) : (
                <Upload className="h-8 w-8" />
              )}
            </div>

            <div>
              <p className="text-sm font-semibold text-[#0F2440]">
                {isUploading ? 'Uploading video...' : 'Drag and drop your video here'}
              </p>
              <p className="mt-1 text-xs text-[#64788A]">
                or click to browse • MP4, WebM, OGG • Max 100MB
              </p>
            </div>

            {isUploading && (
              <div className="w-full max-w-xs">
                <div className="h-2 w-full overflow-hidden rounded-full bg-[#E7EDF3]">
                  <div
                    className="h-full bg-[#1A365D] transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-[#64788A]">{uploadProgress}%</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="relative rounded-xl border border-[#D9E2EC] bg-white p-4">
          <button
            onClick={handleReset}
            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg bg-[#F6F8FB] text-[#64788A] transition-colors hover:bg-[#E7EDF3] hover:text-[#0F2440]"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#E8F6F3] text-[#087F6C]">
              <CheckCircle className="h-6 w-6" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[#0F2440]">Video uploaded successfully!</p>
              <p className="mt-1 text-xs text-[#64788A]">Your video is ready to be displayed on the dashboard.</p>
              
              <div className="mt-3 rounded-lg border border-[#E7EDF3] bg-[#F8FAFC] p-3">
                <div className="flex items-center gap-2">
                  <VideoIcon className="h-4 w-4 text-[#1A365D]" />
                  <p className="text-xs font-medium text-[#0F2440]">Video URL:</p>
                </div>
                <p className="mt-1 text-xs text-[#64788A] break-all">{uploadedVideoUrl}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-[#FED7D7] bg-[#FEF2F2] p-3">
          <AlertCircle className="h-4 w-4 shrink-0 text-[#DC2626]" />
          <p className="text-xs text-[#DC2626]">{error}</p>
        </div>
      )}

      {success && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-[#D1FAE5] bg-[#ECFDF5] p-3">
          <CheckCircle className="h-4 w-4 shrink-0 text-[#059669]" />
          <p className="text-xs text-[#059669]">Video uploaded successfully and is now available on your dashboard.</p>
        </div>
      )}
    </div>
  );
}
