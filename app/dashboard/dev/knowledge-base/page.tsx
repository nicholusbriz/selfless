'use client';

import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2, 
  RefreshCw, 
  Database, 
  Zap, 
  AlertCircle,
  Search,
  Filter,
  BookOpen,
  Tag,
  FileText,
  CheckCircle,
  XCircle,
  Server,
  Cpu,
  Activity,
  Clock,
  Code,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface KnowledgeEntry {
  id: string;
  category: string;
  subcategory: string | null;
  title: string;
  content: string;
  summary: string | null;
  tags: string[];
  difficulty: string | null;
  priority: number;
  isActive: boolean;
  // embedding: number[] | null; // Excluded to avoid MongoDB memory issues
  embeddingGeneratedAt: Date | null;
  isChunked: boolean;
  createdAt: Date;
  lastUpdated: Date;
}

interface EmbeddingStats {
  total: number;
  withEmbeddings: number;
  withoutEmbeddings: number;
  chunked: number;
  totalChunks: number;
  percentageEmbedded: number;
}

interface AIStatus {
  ragAvailable: boolean;
  providers: Array<{ provider: string; status: string; model?: string; error?: string }>;
}

interface UsageStats {
  totalQueries: number;
  recentQueries: number;
  activeUsers: number;
}

const KNOWLEDGE_CATEGORIES = [
  ['platform', 'Platform & navigation'],
  ['organization', 'Organization & mission'],
  ['courses', 'Courses & enrollment'],
  ['academic', 'Academic guidance'],
  ['grades', 'Grades & GPA'],
  ['assignments', 'Assignments & homework'],
  ['attendance', 'Attendance'],
  ['cleaning', 'Cleaning rota'],
  ['communication', 'Messages & announcements'],
  ['activities', 'Activities & teams'],
  ['policies', 'Policies & procedures'],
  ['resources', 'Resources & support'],
  ['account', 'Accounts & security'],
  ['technical', 'Technical help'],
  ['developer', 'Developer information'],
  ['admin', 'Admin guidance'],
  ['teacher', 'Teacher guidance'],
  ['page-dashboard', 'Page guide: Dashboard home'],
  ['page-overview', 'Page guide: Overview'],
  ['page-courses', 'Page guide: Courses'],
  ['page-grades', 'Page guide: Grades and GPA'],
  ['page-cleaning', 'Page guide: Cleaning rota'],
  ['page-messages', 'Page guide: Messages'],
  ['page-announcements', 'Page guide: Announcements'],
  ['page-notifications', 'Page guide: Notifications'],
  ['page-profile', 'Page guide: Profile'],
  ['page-students', 'Page guide: Students'],
  ['page-internships', 'Page guide: Internships'],
  ['page-support', 'Page guide: Support'],
  ['page-support-groups', 'Page guide: Support groups'],
  ['page-policies', 'Page guide: Policies'],
  ['page-english-hub', 'Page guide: English hub'],
  ['page-temple-trips', 'Page guide: Temple trips'],
  ['page-football-team', 'Page guide: Football team'],
  ['page-gallery', 'Page guide: Gallery'],
  ['page-live-streaming', 'Page guide: Live streaming'],
  ['page-ai-chat', 'Page guide: AI chat'],
  ['page-admin', 'Page guide: Admin dashboard'],
  ['page-admin-cleaning', 'Page guide: Admin cleaning'],
  ['page-admin-users', 'Page guide: Admin users'],
  ['page-admin-teachers', 'Page guide: Admin teachers'],
  ['page-admin-tuition', 'Page guide: Admin tuition'],
  ['page-admin-tech-centers', 'Page guide: Admin tech centers'],
  ['page-developer', 'Page guide: Developer dashboard'],
  ['page-developer-knowledge', 'Page guide: Knowledge base'],
  ['page-developer-logs', 'Page guide: Developer logs'],
  ['page-developer-password-resets', 'Page guide: Password resets'],
  ['page-super-admin', 'Page guide: Super admin dashboard'],
  ['page-super-admin-users', 'Page guide: Super admin users'],
  ['page-super-admin-centers', 'Page guide: Super admin centers'],
  ['page-student-detail', 'Page guide: Student profile detail'],
  ['page-teacher-grades', 'Page guide: Teacher grades'],
  ['page-admin-tech-center-edit', 'Page guide: Edit tech center'],
  ['page-super-admin-center-detail', 'Page guide: Super admin center detail'],
  ['page-super-admin-center-edit', 'Page guide: Edit super admin center'],
  ['page-super-admin-center-create', 'Page guide: Create tech center'],
  ['page-public-home', 'Page guide: Public home'],
  ['page-about', 'Page guide: About'],
  ['page-features', 'Page guide: Features'],
  ['page-help', 'Page guide: Help'],
  ['page-privacy', 'Page guide: Privacy'],
  ['page-terms', 'Page guide: Terms'],
  ['page-tech-centers', 'Page guide: Public tech centers'],
  ['other', 'Other'],
] as const;

export default function KnowledgeBaseManagementPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<KnowledgeEntry | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'with-embedding' | 'without-embedding'>('all');
  const [generatingEmbedding, setGeneratingEmbedding] = useState<string | null>(null);
  const [bulkRegenerating, setBulkRegenerating] = useState(false);
  const [embeddingStats, setEmbeddingStats] = useState<EmbeddingStats | null>(null);
  const [aiStatus, setAIStatus] = useState<AIStatus | null>(null);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [aiStatusLoading, setAIStatusLoading] = useState(true);

  const endpoints = [
    ['GET', '/api/ai/status', 'Provider and RAG status'],
    ['GET', '/api/ai/knowledge-base', 'Knowledge entries'],
    ['POST', '/api/ai/knowledge-base', 'Create plain knowledge content'],
    ['POST', '/api/ai/knowledge-base/:id/embedding', 'Generate one embedding'],
    ['POST', '/api/admin/embed-knowledge', 'Bulk embedding generation'],
    ['GET', '/api/ai/knowledge-base/search', 'Semantic or keyword search'],
    ['POST', '/api/ai/chat', 'Database-only chatbot'],
  ];

  useEffect(() => {
    loadEntries();
    loadAIControlData();
  }, []);

  const loadAIControlData = async () => {
    setAIStatusLoading(true);
    try {
      const [statusResponse, embeddingsResponse, usageResponse] = await Promise.all([
        fetch('/api/ai/status'),
        fetch('/api/admin/embed-knowledge'),
        fetch('/api/admin/ai/usage'),
      ]);
      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        setAIStatus(statusData.data || null);
      }
      if (embeddingsResponse.ok) {
        const embeddingData = await embeddingsResponse.json();
        setEmbeddingStats(embeddingData.data || null);
      }
      if (usageResponse.ok) {
        const usageData = await usageResponse.json();
        setUsageStats(usageData.data || null);
      }
    } catch (error) {
      console.error('Failed to load AI control data:', error);
    } finally {
      setAIStatusLoading(false);
    }
  };

  const loadEntries = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/knowledge-base');
      const data = await response.json();
      if (data.success) {
        setEntries(data.data || []);
      }
    } catch (error) {
      console.error('Failed to load entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;

    try {
      const response = await fetch(`/api/ai/knowledge-base/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        loadEntries();
        loadAIControlData();
      } else {
        alert('Failed to delete entry: ' + data.error);
      }
    } catch (error) {
      console.error('Failed to delete entry:', error);
      alert('Failed to delete entry');
    }
  };

  const handleGenerateEmbedding = async (id: string) => {
    setGeneratingEmbedding(id);
    try {
      const response = await fetch(`/api/ai/knowledge-base/${id}/embedding`, {
        method: 'POST',
      });
      const data = await response.json();
      if (data.success) {
        loadEntries();
      } else {
        alert('Failed to generate embedding: ' + data.error);
      }
    } catch (error) {
      console.error('Failed to generate embedding:', error);
      alert('Failed to generate embedding');
    } finally {
      setGeneratingEmbedding(null);
    }
  };

  const handleBulkRegenerate = async () => {
    if (!confirm('This will regenerate embeddings for all entries. This may take several minutes. Continue?')) return;

    setBulkRegenerating(true);
    try {
      const response = await fetch('/api/admin/embed-knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          forceRegenerate: true,
          chunkLargeDocuments: true,
          limit: 100
        })
      });
      const data = await response.json();
      if (data.success) {
        alert(`Regeneration complete! Processed ${data.data.processed} entries, generated ${data.data.embedded} embeddings, created ${data.data.totalChunks} chunks.`);
        loadEntries();
      } else {
        alert('Failed to regenerate embeddings: ' + data.error);
      }
    } catch (error) {
      console.error('Failed to regenerate embeddings:', error);
      alert('Failed to regenerate embeddings');
    } finally {
      setBulkRegenerating(false);
    }
  };

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = 
      entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = !filterCategory || entry.category === filterCategory;
    
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'with-embedding' && entry.embeddingGeneratedAt) ||
      (filterStatus === 'without-embedding' && !entry.embeddingGeneratedAt);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = [...new Set(entries.map(e => e.category))];

  return (
    <div className="min-h-screen bg-[#0A0615] p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/dashboard/dev')}
          className="flex items-center gap-2 text-[#A89F96] hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Developer Dashboard</span>
        </button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#F5F0E8] mb-2">Knowledge Base Management</h1>
            <p className="text-[#A89F96]">Manage your AI knowledge base entries and embeddings</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleBulkRegenerate}
              disabled={bulkRegenerating}
              className="flex items-center gap-2 bg-[#14B8A6] text-white px-4 py-2 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${bulkRegenerating ? 'animate-spin' : ''}`} />
              <span>{bulkRegenerating ? 'Regenerating...' : 'Regenerate All'}</span>
            </button>
            <button
              onClick={() => {
                setEditingEntry(null);
                setShowForm(true);
              }}
              className="flex items-center gap-2 bg-gradient-to-r from-[#E8A33D] to-[#FB7185] text-white px-4 py-2 rounded-xl hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              <span>Add Entry</span>
            </button>
          </div>
        </div>
      </div>

      <section className="mb-6 rounded-xl border border-[#2A2438] bg-[#140E24] p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-[#F5F0E8]">AI control center</h2>
            <p className="text-sm text-[#A79C8C]">All AI status, embedding, usage, and API controls live here.</p>
          </div>
          <button
            type="button"
            onClick={loadAIControlData}
            disabled={aiStatusLoading}
            className="inline-flex items-center gap-2 rounded-lg border border-[#2A2438] bg-[#0A0615] px-3 py-2 text-sm text-[#F5F0E8] disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${aiStatusLoading ? 'animate-spin' : ''}`} />
            Refresh AI data
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-lg bg-[#0A0615] p-3">
            <Server className="h-4 w-4 text-[#14B8A6]" />
            <p className="mt-2 text-xs text-[#A79C8C]">RAG status</p>
            <p className="font-semibold text-[#F5F0E8]">{aiStatus?.ragAvailable ? 'Ready' : 'Needs embeddings'}</p>
          </div>
          <div className="rounded-lg bg-[#0A0615] p-3">
            <Cpu className="h-4 w-4 text-[#E8A33D]" />
            <p className="mt-2 text-xs text-[#A79C8C]">Embedding coverage</p>
            <p className="font-semibold text-[#F5F0E8]">{embeddingStats?.percentageEmbedded ?? 0}%</p>
          </div>
          <div className="rounded-lg bg-[#0A0615] p-3">
            <BookOpen className="h-4 w-4 text-[#8B5CF6]" />
            <p className="mt-2 text-xs text-[#A79C8C]">Chunks</p>
            <p className="font-semibold text-[#F5F0E8]">{embeddingStats?.totalChunks ?? 0}</p>
          </div>
          <div className="rounded-lg bg-[#0A0615] p-3">
            <Activity className="h-4 w-4 text-[#14B8A6]" />
            <p className="mt-2 text-xs text-[#A79C8C]">AI queries</p>
            <p className="font-semibold text-[#F5F0E8]">{usageStats?.totalQueries ?? 0}</p>
          </div>
          <div className="rounded-lg bg-[#0A0615] p-3">
            <Clock className="h-4 w-4 text-[#FB7185]" />
            <p className="mt-2 text-xs text-[#A79C8C]">Last 30 days</p>
            <p className="font-semibold text-[#F5F0E8]">{usageStats?.recentQueries ?? 0}</p>
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-[#2A2438] bg-[#0A0615] p-4">
            <h3 className="mb-3 flex items-center gap-2 font-semibold text-[#F5F0E8]"><Server className="h-4 w-4" /> Providers</h3>
            {aiStatus?.providers?.length ? aiStatus.providers.map((provider) => (
              <div key={provider.provider} className="flex items-center justify-between border-b border-[#2A2438] py-2 text-sm last:border-0">
                <span className="text-[#A79C8C]">{provider.provider}{provider.model ? ` · ${provider.model}` : ''}</span>
                <span className={provider.status === 'working' ? 'text-[#14B8A6]' : 'text-[#FB7185]'}>{provider.status.replace('_', ' ')}</span>
              </div>
            )) : <p className="text-sm text-[#A79C8C]">No provider data available.</p>}
          </div>
          <div className="rounded-lg border border-[#2A2438] bg-[#0A0615] p-4">
            <h3 className="mb-3 flex items-center gap-2 font-semibold text-[#F5F0E8]"><Code className="h-4 w-4" /> API endpoints</h3>
            <div className="max-h-48 overflow-y-auto">
              {endpoints.map(([method, path, description]) => (
                <div key={`${method}-${path}`} className="border-b border-[#2A2438] py-2 last:border-0">
                  <code className="text-xs text-[#E8A33D]">{method} {path}</code>
                  <p className="text-xs text-[#A79C8C]">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#140E24] border border-[#2A2438] rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <Database className="w-5 h-5 text-[#E8A33D]" />
            <span className="text-[#A79C8C] text-sm">Total Entries</span>
          </div>
          <p className="text-2xl font-bold text-[#F5F0E8]">{entries.length}</p>
        </div>

        <div className="bg-[#140E24] border border-[#2A2438] rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="w-5 h-5 text-[#14B8A6]" />
            <span className="text-[#A79C8C] text-sm">With Embeddings</span>
          </div>
          <p className="text-2xl font-bold text-[#14B8A6]">
            {entries.filter(e => e.embeddingGeneratedAt).length}
          </p>
        </div>

        <div className="bg-[#140E24] border border-[#2A2438] rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="w-5 h-5 text-[#FB7185]" />
            <span className="text-[#A79C8C] text-sm">Without Embeddings</span>
          </div>
          <p className="text-2xl font-bold text-[#FB7185]">
            {entries.filter(e => !e.embeddingGeneratedAt).length}
          </p>
        </div>

        <div className="bg-[#140E24] border border-[#2A2438] rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-5 h-5 text-[#8B5CF6]" />
            <span className="text-[#A79C8C] text-sm">Categories</span>
          </div>
          <p className="text-2xl font-bold text-[#8B5CF6]">{categories.length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#140E24] border border-[#2A2438] rounded-xl p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A89F96]" />
              <input
                type="text"
                placeholder="Search entries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#0A0615] border border-[#2A2438] rounded-lg pl-10 pr-4 py-2 text-[#F5F0E8] placeholder-[#A89F96] focus:outline-none focus:border-[#E8A33D]"
              />
            </div>
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-[#0A0615] border border-[#2A2438] rounded-lg px-4 py-2 text-[#F5F0E8] focus:outline-none focus:border-[#E8A33D]"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="bg-[#0A0615] border border-[#2A2438] rounded-lg px-4 py-2 text-[#F5F0E8] focus:outline-none focus:border-[#E8A33D]"
          >
            <option value="all">All Status</option>
            <option value="with-embedding">With Embeddings</option>
            <option value="without-embedding">Without Embeddings</option>
          </select>

          <button
            onClick={loadEntries}
            className="flex items-center gap-2 bg-[#0A0615] border border-[#2A2438] text-[#F5F0E8] px-4 py-2 rounded-lg hover:bg-[#1A1228] transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-[#140E24] border border-[#2A2438] rounded-xl p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-[#E8A33D] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-[#A89F96]">Loading entries...</p>
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="bg-[#140E24] border border-[#2A2438] rounded-xl p-8 text-center">
          <Database className="w-12 h-12 text-[#A89F96] mx-auto mb-4" />
          <p className="text-[#A89F96] mb-4">No entries found</p>
          <button
            onClick={() => {
              setEditingEntry(null);
              setShowForm(true);
            }}
            className="text-[#E8A33D] hover:underline"
          >
            Add your first entry
          </button>
        </div>
      ) : (
        <div className="bg-[#140E24] border border-[#2A2438] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2A2438]">
                  <th className="text-left p-4 text-[#A89F96] font-medium">Title</th>
                  <th className="text-left p-4 text-[#A89F96] font-medium">Category</th>
                  <th className="text-left p-4 text-[#A89F96] font-medium">Tags</th>
                  <th className="text-left p-4 text-[#A89F96] font-medium">Embedding</th>
                  <th className="text-left p-4 text-[#A89F96] font-medium">Updated</th>
                  <th className="text-right p-4 text-[#A89F96] font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map((entry) => (
                  <tr key={entry.id} className="border-b border-[#2A2438] hover:bg-[#0A0615] transition-colors">
                    <td className="p-4">
                      <div className="flex items-start gap-3">
                        <FileText className="w-5 h-5 text-[#E8A33D] mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-[#F5F0E8] font-medium">{entry.title}</p>
                          {entry.summary && (
                            <p className="text-[#A89F96] text-sm mt-1 line-clamp-1">{entry.summary}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="bg-[#0A0615] border border-[#2A2438] text-[#A89F96] px-2 py-1 rounded text-sm">
                        {entry.category}
                      </span>
                      {entry.subcategory && (
                        <span className="ml-2 text-[#A89F96] text-sm">› {entry.subcategory}</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {entry.tags.slice(0, 3).map((tag, i) => (
                          <span key={i} className="bg-[#0A0615] border border-[#2A2438] text-[#A89F96] px-2 py-0.5 rounded text-xs">
                            {tag}
                          </span>
                        ))}
                        {entry.tags.length > 3 && (
                          <span className="text-[#A89F96] text-xs">+{entry.tags.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      {entry.embeddingGeneratedAt ? (
                        <div className="flex items-center gap-2 text-[#14B8A6]">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm">Generated</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-[#FB7185]">
                          <XCircle className="w-4 h-4" />
                          <span className="text-sm">Not Generated</span>
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-[#A89F96] text-sm">
                      {new Date(entry.lastUpdated).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingEntry(entry);
                            setShowForm(true);
                          }}
                          className="p-2 text-[#A89F96] hover:text-white hover:bg-[#0A0615] rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleGenerateEmbedding(entry.id)}
                          disabled={generatingEmbedding === entry.id}
                          className="p-2 text-[#14B8A6] hover:text-white hover:bg-[#0A0615] rounded-lg transition-colors disabled:opacity-50"
                          title={entry.embeddingGeneratedAt ? 'Regenerate Embedding' : 'Generate Embedding'}
                        >
                          {generatingEmbedding === entry.id ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Zap className="w-4 h-4" />
                          )}
                        </button>
                        
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className="p-2 text-[#FB7185] hover:text-white hover:bg-[#0A0615] rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#140E24] border border-[#2A2438] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#F5F0E8]">
                  {editingEntry ? 'Edit Entry' : 'Add New Entry'}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingEntry(null);
                  }}
                  className="text-[#A89F96] hover:text-white"
                >
                  ✕
                </button>
              </div>

              <KnowledgeForm
                entry={editingEntry}
                onSuccess={() => {
                  setShowForm(false);
                  setEditingEntry(null);
                  loadEntries();
                }}
                onCancel={() => {
                  setShowForm(false);
                  setEditingEntry(null);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function KnowledgeForm({ 
  entry, 
  onSuccess, 
  onCancel 
}: { 
  entry: KnowledgeEntry | null;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    category: entry?.category || '',
    title: entry?.title || '',
    content: entry?.content || '',
    summary: entry?.summary || '',
    tags: entry?.tags.join(', ') || '',
    difficulty: entry?.difficulty || '',
    priority: entry?.priority || 0,
    isActive: entry?.isActive ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const tags = formData.tags.split(',').map(t => t.trim()).filter(t => t);
      
      const payload = {
        ...formData,
        tags,
        generateEmbedding: false,
      };

      const url = entry 
        ? `/api/ai/knowledge-base/${entry.id}`
        : '/api/ai/knowledge-base';
      
      const method = entry ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (data.success) {
        onSuccess();
      } else {
        alert('Failed to save entry: ' + data.error);
      }
    } catch (error) {
      console.error('Failed to save entry:', error);
      alert('Failed to save entry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-[#A89F96] text-sm mb-2">Category *</label>
        <select
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          className="w-full bg-[#0A0615] border border-[#2A2438] rounded-lg px-4 py-2 text-[#F5F0E8] focus:outline-none focus:border-[#E8A33D]"
          required
        >
          <option value="">Select category</option>
          {KNOWLEDGE_CATEGORIES.map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {entry && <div>
        <label className="block text-[#A89F96] text-sm mb-2">Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full bg-[#0A0615] border border-[#2A2438] rounded-lg px-4 py-2 text-[#F5F0E8] focus:outline-none focus:border-[#E8A33D]"
          placeholder="Entry title"
        />
      </div>}

      <div>
        <label className="block text-[#A89F96] text-sm mb-2">Content *</label>
        <textarea
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          className="w-full bg-[#0A0615] border border-[#2A2438] rounded-lg px-4 py-2 text-[#F5F0E8] focus:outline-none focus:border-[#E8A33D] min-h-[200px]"
          required
          placeholder="Paste the information here. The system will generate the title, summary, tags, chunks, and embedding automatically."
        />
      </div>

      {entry && <div>
        <label className="block text-[#A89F96] text-sm mb-2">Summary</label>
        <textarea
          value={formData.summary}
          onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
          className="w-full bg-[#0A0615] border border-[#2A2438] rounded-lg px-4 py-2 text-[#F5F0E8] focus:outline-none focus:border-[#E8A33D] min-h-[80px]"
          placeholder="Brief summary for quick reference"
        />
      </div>}

      {entry && <div>
        <label className="block text-[#A89F96] text-sm mb-2">Tags</label>
        <input
          type="text"
          value={formData.tags}
          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          className="w-full bg-[#0A0615] border border-[#2A2438] rounded-lg px-4 py-2 text-[#F5F0E8] focus:outline-none focus:border-[#E8A33D]"
          placeholder="Comma-separated tags (e.g., web, html, css)"
        />
      </div>}

      <div>
        <label className="block text-[#A89F96] text-sm mb-2">Difficulty</label>
        <select
          value={formData.difficulty}
          onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
          className="w-full bg-[#0A0615] border border-[#2A2438] rounded-lg px-4 py-2 text-[#F5F0E8] focus:outline-none focus:border-[#E8A33D]"
        >
          <option value="">Not specified</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>

      <div>
        <label className="block text-[#A89F96] text-sm mb-2">Priority</label>
        <input
          type="number"
          value={formData.priority}
          onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
          className="w-full bg-[#0A0615] border border-[#2A2438] rounded-lg px-4 py-2 text-[#F5F0E8] focus:outline-none focus:border-[#E8A33D]"
          min="0"
          max="100"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isActive"
          checked={formData.isActive}
          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
          className="w-4 h-4"
        />
        <label htmlFor="isActive" className="text-[#A89F96] text-sm">Active</label>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-[#2A2438]">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-[#A89F96] hover:text-white transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-[#E8A33D] to-[#FB7185] text-white px-6 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? 'Saving...' : (entry ? 'Update' : 'Create')}
        </button>
      </div>
    </form>
  );
}
