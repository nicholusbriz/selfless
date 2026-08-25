'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Home, LayoutDashboard, Video, Upload, Trash2, Play } from 'lucide-react';
import { useRouter } from 'next/navigation';
import VideoUpload from '@/components/VideoUpload';

export default function SuperAdminOverviewPage() {
  const router = useRouter();
  const [showVideoUpload, setShowVideoUpload] = useState(false);
  const [videos, setVideos] = useState<string[]>([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setIsLoadingVideos(true);
      const response = await fetch('/api/videos');

      if (response.ok) {
        const data = await response.json();
        setVideos(data.videos || []);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setIsLoadingVideos(false);
    }
  };

  const handleVideoUploadComplete = (videoUrl: string) => {
    setUploadMessage({ type: 'success', text: 'Video uploaded successfully!' });
    setShowVideoUpload(false);
    fetchVideos();
    setTimeout(() => setUploadMessage(null), 5000);
  };

  const handleUploadError = (error: string) => {
    setUploadMessage({ type: 'error', text: error });
    setTimeout(() => setUploadMessage(null), 5000);
  };

  const handleDeleteVideo = async (videoUrl: string) => {
    try {
      const response = await fetch('/api/videos/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoUrl }),
      });

      if (response.ok) {
        fetchVideos();
      } else {
        console.error('Failed to delete video');
      }
    } catch (error) {
      console.error('Error deleting video:', error);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header with navigation */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg bg-[#2A2438]/50 hover:bg-[#2A2438] text-[#A79C8C] hover:text-[#F5F0E8] transition-all duration-200"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        
        <button
          onClick={() => router.push('/')}
          className="p-2 rounded-lg bg-[#2A2438]/50 hover:bg-[#2A2438] text-[#A79C8C] hover:text-[#F5F0E8] transition-all duration-200"
          aria-label="Go home"
        >
          <Home className="w-5 h-5" />
        </button>
        
        <div className="h-8 w-px bg-[#2A2438]" />
        
        <h1 className="text-2xl font-bold text-[#F5F0E8]" style={{ fontFamily: 'var(--font-display)' }}>
          Super Admin Overview
        </h1>
      </div>

      {/* Video Management Section */}
      <div className="bg-[#150F20] border border-[#2A2438] rounded-2xl p-8 md:p-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-[#E8A33D]/10 border border-[#E8A33D]/20 flex items-center justify-center">
            <Video className="w-6 h-6 text-[#E8A33D]" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-[#F5F0E8]">
              Video Management
            </h2>
            <p className="text-[#A79C8C] text-sm">
              Upload and manage videos for the dashboard
            </p>
          </div>
        </div>

        {!showVideoUpload ? (
          <button
            onClick={() => setShowVideoUpload(true)}
            className="
              inline-flex items-center justify-center gap-2
              rounded-lg bg-[#E8A33D] px-6 py-3
              text-sm font-semibold text-[#150F20]
              transition-colors hover:bg-[#D69235]
            "
          >
            <Upload className="w-4 h-4" />
            Upload New Video
          </button>
        ) : (
          <>
            {uploadMessage && (
              <div
                className={`mb-4 flex items-start gap-2 rounded-lg border p-3 ${
                  uploadMessage.type === 'success'
                    ? 'border-green-500/20 bg-green-500/10 text-green-400'
                    : 'border-red-500/20 bg-red-500/10 text-red-400'
                }`}
              >
                {uploadMessage.type === 'success' ? (
                  <Play className="w-4 h-4 mt-0.5" />
                ) : (
                  <Upload className="w-4 h-4 mt-0.5" />
                )}
                <p className="text-sm">{uploadMessage.text}</p>
              </div>
            )}
            <VideoUpload
              onUploadComplete={handleVideoUploadComplete}
              onError={handleUploadError}
            />
          </>
        )}

        {/* Video List */}
        {videos.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-[#F5F0E8] mb-4">
              Current Videos ({videos.length})
            </h3>
            <div className="grid gap-4">
              {videos.map((videoUrl, index) => (
                <div
                  key={videoUrl}
                  className="bg-[#2A2438]/30 border border-[#2A2438] rounded-xl p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Play className="w-4 h-4 text-[#E8A33D]" />
                        <p className="text-sm font-medium text-[#F5F0E8]">
                          Video {index + 1}
                        </p>
                      </div>
                      <p className="text-xs text-[#A79C8C] break-all mb-3">
                        {videoUrl}
                      </p>
                      <video
                        controls
                        preload="metadata"
                        className="w-full rounded-lg border border-[#2A2438]"
                      >
                        <source src={videoUrl} type="video/mp4" />
                        Your browser does not support the video element.
                      </video>
                    </div>
                    <button
                      onClick={() => handleDeleteVideo(videoUrl)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
