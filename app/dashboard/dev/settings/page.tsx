'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Home, LayoutDashboard, Activity, Database, Cpu, Server, RefreshCw, CheckCircle, XCircle, AlertCircle, BookOpen, Zap, Clock, TrendingUp, Users, MessageSquare, Settings, Trash2, Plus, Video, Upload, Play } from 'lucide-react';
import { useRouter } from 'next/navigation';
import VideoUpload from '@/components/VideoUpload';

interface ProviderStatus {
  provider: string;
  configured: boolean;
  status: 'working' | 'quota_exceeded' | 'error' | 'not_configured';
  model?: string;
  error?: string;
}

interface EmbeddingStats {
  total: number;
  withEmbeddings: number;
  withoutEmbeddings: number;
  chunked: number;
  totalChunks: number;
  percentageEmbedded: number;
}

interface AIUsageStats {
  totalQueries: number;
  ragQueries: number;
  cacheHits: number;
  cacheMisses: number;
  avgResponseTime: number;
  totalTokensUsed: number;
}

export default function SystemSettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'providers' | 'knowledge' | 'usage' | 'endpoints' | 'videos'>('overview');
  const [loading, setLoading] = useState(true);
  const [providerStatus, setProviderStatus] = useState<any>(null);
  const [embeddingStats, setEmbeddingStats] = useState<EmbeddingStats | null>(null);
  const [ragEnabled, setRagEnabled] = useState(false);
  const [generatingEmbeddings, setGeneratingEmbeddings] = useState(false);
  const [embeddingProgress, setEmbeddingProgress] = useState<any>(null);
  
  // Video management state
  const [showVideoUpload, setShowVideoUpload] = useState(false);
  const [videos, setVideos] = useState<string[]>([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadAIStatus();
    fetchVideos();
  }, []);

  const loadAIStatus = async () => {
    setLoading(true);
    try {
      const [statusRes, embeddingRes] = await Promise.all([
        fetch('/api/ai/status'),
        fetch('/api/admin/embed-knowledge')
      ]);

      if (statusRes.ok) {
        const statusData = await statusRes.json();
        setProviderStatus(statusData.data);
        setRagEnabled(statusData.data.ragAvailable || false);
      }

      if (embeddingRes.ok) {
        const embeddingData = await embeddingRes.json();
        setEmbeddingStats(embeddingData.data);
      }
    } catch (error) {
      console.error('Failed to load AI status:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshStatus = () => {
    loadAIStatus();
  };

  // Video management functions
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

  const generateEmbeddings = async () => {
    setGeneratingEmbeddings(true);
    try {
      const response = await fetch('/api/admin/embed-knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          forceRegenerate: false,
          chunkLargeDocuments: true,
          limit: 100
        })
      });

      const data = await response.json();
      if (data.success) {
        setEmbeddingProgress(data.data);
        await loadAIStatus();
      }
    } catch (error) {
      console.error('Failed to generate embeddings:', error);
    } finally {
      setGeneratingEmbeddings(false);
    }
  };

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: LayoutDashboard },
    { id: 'providers' as const, label: 'AI Providers', icon: Server },
    { id: 'knowledge' as const, label: 'Knowledge Base', icon: Database },
    { id: 'usage' as const, label: 'Usage Stats', icon: Activity },
    { id: 'endpoints' as const, label: 'API Endpoints', icon: Settings },
    { id: 'videos' as const, label: 'Video Management', icon: Video },
  ];

  const endpoints = [
    { method: 'GET', path: '/api/ai/status', description: 'Check AI provider status and RAG availability' },
    { method: 'GET', path: '/api/ai/user-context', description: 'Fetch user context for AI personalization' },
    { method: 'POST', path: '/api/ai/chat', description: 'Main chat endpoint with RAG integration' },
    { method: 'GET', path: '/api/ai/chat', description: 'Fetch conversation history' },
    { method: 'GET', path: '/api/ai/knowledge-base', description: 'Fetch all knowledge base entries' },
    { method: 'POST', path: '/api/ai/knowledge-base', description: 'Create new knowledge base entry with embeddings' },
    { method: 'GET', path: '/api/ai/knowledge-base/search', description: 'Search knowledge base (semantic/keyword/hybrid)' },
    { method: 'POST', path: '/api/ai/log-usage', description: 'Log AI chat usage with RAG metrics' },
    { method: 'GET', path: '/api/admin/embed-knowledge', description: 'Get embedding statistics' },
    { method: 'POST', path: '/api/admin/embed-knowledge', description: 'Generate embeddings for existing knowledge' },
  ];

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
          AI System Settings
        </h1>

        <button
          onClick={refreshStatus}
          className="ml-auto p-2 rounded-lg bg-[#2A2438]/50 hover:bg-[#2A2438] text-[#A79C8C] hover:text-[#F5F0E8] transition-all duration-200"
          disabled={loading}
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#E8A33D] text-white'
                  : 'bg-[#2A2438]/50 text-[#A79C8C] hover:bg-[#2A2438] hover:text-[#F5F0E8]'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="bg-[#150F20] border border-[#2A2438] rounded-2xl p-6 md:p-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 text-[#E8A33D] animate-spin" />
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-[#F5F0E8] mb-4">System Overview</h2>
                
                {/* Status Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-[#0A0615] border border-[#2A2438] rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-lg ${ragEnabled ? 'bg-[#14B8A6]/20' : 'bg-[#FB7185]/20'}`}>
                        {ragEnabled ? <CheckCircle className="w-5 h-5 text-[#14B8A6]" /> : <XCircle className="w-5 h-5 text-[#FB7185]" />}
                      </div>
                      <span className="text-[#A79C8C] text-sm">RAG Status</span>
                    </div>
                    <p className={`text-lg font-semibold ${ragEnabled ? 'text-[#14B8A6]' : 'text-[#FB7185]'}`}>
                      {ragEnabled ? 'Active' : 'Inactive'}
                    </p>
                  </div>

                  <div className="bg-[#0A0615] border border-[#2A2438] rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-[#E8A33D]/20">
                        <Server className="w-5 h-5 text-[#E8A33D]" />
                      </div>
                      <span className="text-[#A79C8C] text-sm">Active Providers</span>
                    </div>
                    <p className="text-lg font-semibold text-[#F5F0E8]">
                      {providerStatus?.summary?.working || 0} / {providerStatus?.summary?.total || 0}
                    </p>
                  </div>

                  <div className="bg-[#0A0615] border border-[#2A2438] rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-[#14B8A6]/20">
                        <Database className="w-5 h-5 text-[#14B8A6]" />
                      </div>
                      <span className="text-[#A79C8C] text-sm">Knowledge Entries</span>
                    </div>
                    <p className="text-lg font-semibold text-[#F5F0E8]">
                      {embeddingStats?.total || 0}
                    </p>
                  </div>

                  <div className="bg-[#0A0615] border border-[#2A2438] rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-[#8B5CF6]/20">
                        <Zap className="w-5 h-5 text-[#8B5CF6]" />
                      </div>
                      <span className="text-[#A79C8C] text-sm">Embeddings</span>
                    </div>
                    <p className="text-lg font-semibold text-[#F5F0E8]">
                      {embeddingStats?.percentageEmbedded?.toFixed(1) || 0}%
                    </p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-[#0A0615] border border-[#2A2438] rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-[#F5F0E8] mb-4">Quick Actions</h3>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={generateEmbeddings}
                      disabled={generatingEmbeddings}
                      className="flex items-center gap-2 px-4 py-2 bg-[#E8A33D] hover:bg-[#FB7185] text-white rounded-lg transition-all duration-200 disabled:opacity-50"
                    >
                      {generatingEmbeddings ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4" />
                          Generate Embeddings
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => router.push('/dashboard/ai')}
                      className="flex items-center gap-2 px-4 py-2 bg-[#2A2438] hover:bg-[#3A3448] text-[#F5F0E8] rounded-lg transition-all duration-200"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Test AI Chat
                    </button>
                  </div>
                  
                  {embeddingProgress && (
                    <div className="mt-4 p-4 bg-[#140E24] rounded-lg">
                      <p className="text-sm text-[#A79C8C] mb-2">Embedding Progress:</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-[#A79C8C]">Processed:</span>
                          <span className="ml-2 text-[#F5F0E8]">{embeddingProgress.processed}</span>
                        </div>
                        <div>
                          <span className="text-[#A79C8C]">Embedded:</span>
                          <span className="ml-2 text-[#14B8A6]">{embeddingProgress.embedded}</span>
                        </div>
                        <div>
                          <span className="text-[#A79C8C]">Chunked:</span>
                          <span className="ml-2 text-[#E8A33D]">{embeddingProgress.chunked}</span>
                        </div>
                        <div>
                          <span className="text-[#A79C8C]">Errors:</span>
                          <span className="ml-2 text-[#FB7185]">{embeddingProgress.errors}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'providers' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-[#F5F0E8] mb-4">AI Provider Status</h2>
                
                {providerStatus?.providers?.map((provider: ProviderStatus) => (
                  <div key={provider.provider} className="bg-[#0A0615] border border-[#2A2438] rounded-xl p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          provider.status === 'working' ? 'bg-[#14B8A6]/20' :
                          provider.status === 'quota_exceeded' ? 'bg-[#FB7185]/20' :
                          provider.status === 'not_configured' ? 'bg-[#A79C8C]/20' :
                          'bg-[#E8A33D]/20'
                        }`}>
                          {provider.status === 'working' ? <CheckCircle className="w-5 h-5 text-[#14B8A6]" /> :
                           provider.status === 'quota_exceeded' ? <AlertCircle className="w-5 h-5 text-[#FB7185]" /> :
                           provider.status === 'not_configured' ? <XCircle className="w-5 h-5 text-[#A79C8C]" /> :
                           <AlertCircle className="w-5 h-5 text-[#E8A33D]" />}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-[#F5F0E8] capitalize">{provider.provider}</h3>
                          <p className={`text-sm ${
                            provider.status === 'working' ? 'text-[#14B8A6]' :
                            provider.status === 'quota_exceeded' ? 'text-[#FB7185]' :
                            provider.status === 'not_configured' ? 'text-[#A79C8C]' :
                            'text-[#E8A33D]'
                          }`}>
                            {provider.status.replace('_', ' ').toUpperCase()}
                          </p>
                        </div>
                      </div>
                      {provider.model && (
                        <span className="px-3 py-1 bg-[#2A2438] rounded-full text-xs text-[#A79C8C]">
                          {provider.model}
                        </span>
                      )}
                    </div>
                    
                    {provider.error && (
                      <div className="mt-3 p-3 bg-[#FB7185]/10 border border-[#FB7185]/20 rounded-lg">
                        <p className="text-sm text-[#FB7185]">{provider.error}</p>
                      </div>
                    )}
                  </div>
                ))}

                {providerStatus?.summary && (
                  <div className="bg-[#140E24] border border-[#2A2438] rounded-xl p-4">
                    <h4 className="text-sm font-semibold text-[#A79C8C] mb-3">Summary</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-[#A79C8C]">Total:</span>
                        <span className="ml-2 text-[#F5F0E8]">{providerStatus.summary.total}</span>
                      </div>
                      <div>
                        <span className="text-[#A79C8C]">Working:</span>
                        <span className="ml-2 text-[#14B8A6]">{providerStatus.summary.working}</span>
                      </div>
                      <div>
                        <span className="text-[#A79C8C]">Quota Exceeded:</span>
                        <span className="ml-2 text-[#FB7185]">{providerStatus.summary.quotaExceeded}</span>
                      </div>
                      <div>
                        <span className="text-[#A79C8C]">Not Configured:</span>
                        <span className="ml-2 text-[#A79C8C]">{providerStatus.summary.notConfigured}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'knowledge' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-[#F5F0E8] mb-4">Knowledge Base Statistics</h2>
                
                {embeddingStats && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="bg-[#0A0615] border border-[#2A2438] rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <Database className="w-5 h-5 text-[#E8A33D]" />
                          <span className="text-[#A79C8C] text-sm">Total Entries</span>
                        </div>
                        <p className="text-2xl font-bold text-[#F5F0E8]">{embeddingStats.total}</p>
                      </div>

                      <div className="bg-[#0A0615] border border-[#2A2438] rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <Zap className="w-5 h-5 text-[#14B8A6]" />
                          <span className="text-[#A79C8C] text-sm">With Embeddings</span>
                        </div>
                        <p className="text-2xl font-bold text-[#14B8A6]">{embeddingStats.withEmbeddings}</p>
                      </div>

                      <div className="bg-[#0A0615] border border-[#2A2438] rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <AlertCircle className="w-5 h-5 text-[#FB7185]" />
                          <span className="text-[#A79C8C] text-sm">Without Embeddings</span>
                        </div>
                        <p className="text-2xl font-bold text-[#FB7185]">{embeddingStats.withoutEmbeddings}</p>
                      </div>

                      <div className="bg-[#0A0615] border border-[#2A2438] rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <BookOpen className="w-5 h-5 text-[#8B5CF6]" />
                          <span className="text-[#A79C8C] text-sm">Chunked Documents</span>
                        </div>
                        <p className="text-2xl font-bold text-[#8B5CF6]">{embeddingStats.chunked}</p>
                      </div>

                      <div className="bg-[#0A0615] border border-[#2A2438] rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <TrendingUp className="w-5 h-5 text-[#E8A33D]" />
                          <span className="text-[#A79C8C] text-sm">Total Chunks</span>
                        </div>
                        <p className="text-2xl font-bold text-[#E8A33D]">{embeddingStats.totalChunks}</p>
                      </div>

                      <div className="bg-[#0A0615] border border-[#2A2438] rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <Cpu className="w-5 h-5 text-[#14B8A6]" />
                          <span className="text-[#A79C8C] text-sm">Embedding Coverage</span>
                        </div>
                        <p className="text-2xl font-bold text-[#14B8A6]">{embeddingStats.percentageEmbedded.toFixed(1)}%</p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="bg-[#0A0615] border border-[#2A2438] rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-[#A79C8C]">Embedding Progress</span>
                        <span className="text-sm font-semibold text-[#F5F0E8]">{embeddingStats.percentageEmbedded.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-[#2A2438] rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-[#E8A33D] to-[#14B8A6] h-2 rounded-full transition-all duration-500"
                          style={{ width: `${embeddingStats.percentageEmbedded}%` }}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === 'usage' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-[#F5F0E8] mb-4">Usage Statistics</h2>
                
                <div className="bg-[#0A0615] border border-[#2A2438] rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Activity className="w-5 h-5 text-[#E8A33D]" />
                    <h3 className="text-lg font-semibold text-[#F5F0E8]">Real-time Monitoring</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-[#140E24] rounded-lg p-4">
                      <p className="text-sm text-[#A79C8C] mb-1">Total AI Queries</p>
                      <p className="text-2xl font-bold text-[#F5F0E8]">--</p>
                    </div>
                    <div className="bg-[#140E24] rounded-lg p-4">
                      <p className="text-sm text-[#A79C8C] mb-1">RAG Queries</p>
                      <p className="text-2xl font-bold text-[#14B8A6]">--</p>
                    </div>
                    <div className="bg-[#140E24] rounded-lg p-4">
                      <p className="text-sm text-[#A79C8C] mb-1">Cache Hit Rate</p>
                      <p className="text-2xl font-bold text-[#E8A33D]">--</p>
                    </div>
                    <div className="bg-[#140E24] rounded-lg p-4">
                      <p className="text-sm text-[#A79C8C] mb-1">Avg Response Time</p>
                      <p className="text-2xl font-bold text-[#8B5CF6]">--</p>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-[#E8A33D]/10 border border-[#E8A33D]/20 rounded-lg">
                    <p className="text-sm text-[#E8A33D]">
                      <Clock className="w-4 h-4 inline mr-2" />
                      Detailed usage metrics will be available after implementing analytics collection
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'endpoints' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-[#F5F0E8] mb-4">API Endpoints</h2>
                
                <div className="space-y-3">
                  {endpoints.map((endpoint) => (
                    <div key={endpoint.path} className="bg-[#0A0615] border border-[#2A2438] rounded-xl p-4">
                      <div className="flex items-start gap-4">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          endpoint.method === 'GET' ? 'bg-[#14B8A6]/20 text-[#14B8A6]' :
                          endpoint.method === 'POST' ? 'bg-[#E8A33D]/20 text-[#E8A33D]' :
                          'bg-[#A79C8C]/20 text-[#A79C8C]'
                        }`}>
                          {endpoint.method}
                        </span>
                        <div className="flex-1">
                          <code className="text-sm text-[#F5F0E8] font-mono">{endpoint.path}</code>
                          <p className="text-sm text-[#A79C8C] mt-1">{endpoint.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-[#140E24] border border-[#2A2438] rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-[#A79C8C] mb-2">Endpoint Features</h4>
                  <ul className="space-y-2 text-sm text-[#A79C8C]">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#14B8A6]" />
                      All endpoints include detailed JSDoc comments
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#14B8A6]" />
                      Authentication required for user-specific endpoints
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#14B8A6]" />
                      Comprehensive error handling and logging
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#14B8A6]" />
                      Rate limiting and input validation
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'videos' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-[#F5F0E8] mb-4">Video Management</h2>
                
                <div className="bg-[#150F20] border border-[#2A2438] rounded-2xl p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-[#E8A33D]/10 border border-[#E8A33D]/20 flex items-center justify-center">
                      <Video className="w-6 h-6 text-[#E8A33D]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#F5F0E8]">
                        Dashboard Videos
                      </h3>
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
            )}
          </>
        )}
      </div>
    </div>
  );
}