// app/dashboard/super-admin/centers/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Building2, 
  MapPin, 
  Phone, 
  Mail,
  Users,
  Check,
  Trash2,
  X,
  Globe,
  ArrowLeft,
  Home,
  School,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { techCentersApi, type TechCenter } from '@/lib/api/tech-centers';

export default function TechCentersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteForm, setShowDeleteForm] = useState<string | null>(null);
  const [selectedCenter, setSelectedCenter] = useState<TechCenter | null>(null);
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');
  
  // Queries
  const {
    data: techCenters = [],
    isLoading: loadingCenters,
    error: centersError,
  } = useQuery({
    queryKey: ['techCenters'],
    queryFn: techCentersApi.getTechCenters,
  });

  // Mutations
  const updateStatusMutation = useMutation({
    mutationFn: techCentersApi.updateTechCenterStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['techCenters'] });
    },
    onError: (error: any) => {
      alert(error.message || 'Failed to update tech center status');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: techCentersApi.deleteTechCenter,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['techCenters'] });
      setShowDeleteForm(null);
      setSelectedCenter(null);
    },
    onError: (error: any) => {
      alert(error.message || 'Failed to delete tech center');
    },
  });

  // Handlers
  const handleToggleActive = (center: TechCenter) => {
    updateStatusMutation.mutate({ id: center.id, isActive: !center.isActive });
  };

  const handleDeleteTechCenter = () => {
    if (selectedCenter) {
      deleteMutation.mutate(selectedCenter.id);
    }
  };

  const toggleDeleteForm = (centerId: string) => {
    if (showDeleteForm === centerId) {
      setShowDeleteForm(null);
      setSelectedCenter(null);
    } else {
      const center = techCenters.find(c => c.id === centerId);
      if (center) {
        setSelectedCenter(center);
        setShowDeleteForm(centerId);
      }
    }
  };

  // Filter tech centers
  const filteredCenters = techCenters.filter(center => {
    const matchesSearch = center.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         center.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (center.city && center.city.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filterActive === 'all' || 
                         (filterActive === 'active' && center.isActive) ||
                         (filterActive === 'inactive' && !center.isActive);
    
    return matchesSearch && matchesFilter;
  });

  // Statistics
  const totalCenters = techCenters.length;
  const activeCenters = techCenters.filter(c => c.isActive).length;
  const totalStudents = techCenters.reduce((acc, c) => acc + (c._count?.users || c.users?.length || 0), 0);

  // Loading state
  if (loadingCenters) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#E8A33D] animate-spin mx-auto mb-4" />
          <p className="text-[#A79C8C]">Loading tech centers...</p>
        </div>
      </div>
    );
  }

  if (centersError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-[#F87171]/10 flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-[#F87171]" />
          </div>
          <h3 className="text-xl font-semibold text-[#F5F0E8] mb-2">Failed to Load</h3>
          <p className="text-[#A79C8C]">{(centersError as Error)?.message || 'An error occurred'}</p>
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ['techCenters'] })}
            className="mt-4 px-6 py-2 bg-[#E8A33D] text-[#0B0912] rounded-lg hover:bg-[#C97F1F] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg bg-[#2A2438]/50 hover:bg-[#2A2438] text-[#A79C8C] hover:text-[#F5F0E8] transition-all duration-200"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        
        <button
          onClick={() => router.push('/')}
          className="p-2 rounded-lg bg-[#2A2438]/50 hover:bg-[#2A2438] text-[#A79C8C] hover:text-[#F5F0E8] transition-all duration-200"
        >
          <Home className="w-5 h-5" />
        </button>
        
        <div className="h-8 w-px bg-[#2A2438]" />
        
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#E8A33D]/20 to-[#C97F1F]/10 border border-[#E8A33D]/20">
            <School className="w-6 h-6 text-[#E8A33D]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#F5F0E8]" style={{ fontFamily: 'var(--font-display)' }}>
              Tech Centers
            </h1>
            <p className="text-sm text-[#A79C8C]">Manage all tech centers across the platform</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#150F20] border border-[#2A2438] rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#6B6358]">Total Centers</p>
              <p className="text-2xl font-bold text-[#F5F0E8] mt-1">{totalCenters}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#E8A33D]/10 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-[#E8A33D]" />
            </div>
          </div>
        </div>

        <div className="bg-[#150F20] border border-[#2A2438] rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#6B6358]">Active Centers</p>
              <p className="text-2xl font-bold text-[#34D399] mt-1">{activeCenters}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#34D399]/10 flex items-center justify-center">
              <Check className="w-6 h-6 text-[#34D399]" />
            </div>
          </div>
        </div>

        <div className="bg-[#150F20] border border-[#2A2438] rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#6B6358]">Inactive Centers</p>
              <p className="text-2xl font-bold text-[#F87171] mt-1">{totalCenters - activeCenters}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#F87171]/10 flex items-center justify-center">
              <X className="w-6 h-6 text-[#F87171]" />
            </div>
          </div>
        </div>

        <div className="bg-[#150F20] border border-[#2A2438] rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#6B6358]">Total Students</p>
              <p className="text-2xl font-bold text-[#F5F0E8] mt-1">{totalStudents}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#6366F1]/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-[#6366F1]" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6358]" />
          <input
            type="text"
            placeholder="Search tech centers by name, code, or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#150F20] border border-[#2A2438] rounded-lg text-[#F5F0E8] placeholder-[#6B6358] focus:outline-none focus:ring-2 focus:ring-[#E8A33D]/40 focus:border-[#E8A33D]/40 transition-colors duration-200"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value as 'all' | 'active' | 'inactive')}
            className="px-4 py-2.5 bg-[#150F20] border border-[#2A2438] rounded-lg text-[#F5F0E8] focus:outline-none focus:ring-2 focus:ring-[#E8A33D]/40 focus:border-[#E8A33D]/40 transition-colors duration-200"
          >
            <option value="all">All Centers</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <button
            onClick={() => router.push('/dashboard/super-admin/centers/create')}
            className="px-4 py-2.5 bg-gradient-to-r from-[#E8A33D] to-[#C97F1F] text-[#0B0912] font-medium rounded-lg hover:shadow-lg hover:shadow-[#E8A33D]/30 transition-all duration-200 flex items-center gap-2 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            New Center
          </button>
        </div>
      </div>

      {/* Tech Centers Grid */}
      {filteredCenters.length === 0 ? (
        <div className="bg-[#150F20] border border-[#2A2438] rounded-2xl p-12 text-center">
          <div className="w-20 h-20 rounded-2xl bg-[#E8A33D]/10 border border-[#E8A33D]/20 flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-10 h-10 text-[#E8A33D] opacity-60" />
          </div>
          <h3 className="text-xl font-semibold text-[#F5F0E8] mb-2">No Tech Centers Found</h3>
          <p className="text-[#A79C8C] mb-6">
            {searchTerm ? 'Try adjusting your search or filters' : 'Create your first tech center to get started'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => router.push('/dashboard/super-admin/centers/create')}
              className="px-6 py-2.5 bg-gradient-to-r from-[#E8A33D] to-[#C97F1F] text-[#0B0912] font-medium rounded-lg hover:shadow-lg hover:shadow-[#E8A33D]/30 transition-all duration-200"
            >
              Create Tech Center
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCenters.map((center) => (
            <div key={center.id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#150F20] border border-[#2A2438] rounded-2xl overflow-hidden hover:border-[#E8A33D]/30 transition-all duration-300 group"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-[#F5F0E8]">{center.name}</h3>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${center.isActive ? 'bg-[#34D399]/20 text-[#34D399]' : 'bg-[#F87171]/20 text-[#F87171]'}`}>
                          {center.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-sm text-[#6B6358] font-mono">{center.code}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleToggleActive(center)}
                        disabled={updateStatusMutation.isPending}
                        className="p-1.5 rounded-lg hover:bg-[#2A2438] text-[#6B6358] hover:text-[#F5F0E8] transition-colors duration-200 disabled:opacity-50"
                        title={center.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {updateStatusMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : center.isActive ? (
                          <Check className="w-4 h-4 text-[#34D399]" />
                        ) : (
                          <X className="w-4 h-4 text-[#F87171]" />
                        )}
                      </button>
                      <button
                        onClick={() => toggleDeleteForm(center.id)}
                        disabled={deleteMutation.isPending}
                        className={`p-1.5 rounded-lg hover:bg-[#2A2438] text-[#6B6358] hover:text-[#F87171] transition-colors duration-200 disabled:opacity-50 ${showDeleteForm === center.id ? 'bg-[#F87171]/10 text-[#F87171]' : ''}`}
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {center.description && (
                    <p className="text-sm text-[#A79C8C] mb-4 line-clamp-2">{center.description}</p>
                  )}

                  <div className="space-y-2 text-sm">
                    {center.country && (
                      <div className="flex items-center gap-2 text-[#A79C8C]">
                        <Globe className="w-4 h-4 text-[#6B6358]" />
                        <span>{center.country.name}</span>
                      </div>
                    )}
                    {center.city && (
                      <div className="flex items-center gap-2 text-[#A79C8C]">
                        <MapPin className="w-4 h-4 text-[#6B6358]" />
                        <span>{center.city}</span>
                      </div>
                    )}
                    {center.phone && (
                      <div className="flex items-center gap-2 text-[#A79C8C]">
                        <Phone className="w-4 h-4 text-[#6B6358]" />
                        <span>{center.phone}</span>
                      </div>
                    )}
                    {center.email && (
                      <div className="flex items-center gap-2 text-[#A79C8C]">
                        <Mail className="w-4 h-4 text-[#6B6358]" />
                        <span className="text-sm truncate">{center.email}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-[#2A2438] flex items-center justify-between text-xs text-[#6B6358]">
                    <div className="flex items-center gap-4">
                      <span>Created: {new Date(center.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-3 h-3" />
                      <span>{center._count?.users || center.users?.length || 0} students</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Inline Delete Confirmation */}
              <AnimatePresence>
                {showDeleteForm === center.id && selectedCenter && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden mt-2"
                  >
                    <div className="bg-[#F87171]/5 border border-[#F87171]/30 rounded-xl p-4 sm:p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#F87171]/10 flex items-center justify-center flex-shrink-0 mt-1">
                          <AlertTriangle className="w-5 h-5 text-[#F87171]" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-base font-semibold text-[#F5F0E8] mb-1">
                            Delete {selectedCenter.name}?
                          </h4>
                          <p className="text-sm text-[#A79C8C] mb-4">
                            This action cannot be undone. All associated data will be permanently removed.
                          </p>
                          <div className="flex flex-col sm:flex-row gap-3">
                            <button
                              onClick={() => toggleDeleteForm(center.id)}
                              className="w-full sm:flex-1 px-4 py-2 bg-[#2A2438] text-[#A79C8C] rounded-lg hover:bg-[#3A3448] hover:text-[#F5F0E8] transition-colors duration-200"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleDeleteTechCenter}
                              disabled={deleteMutation.isPending}
                              className="w-full sm:flex-1 px-4 py-2 bg-[#F87171] text-[#0B0912] font-medium rounded-lg hover:bg-[#EF4444] transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                              {deleteMutation.isPending ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  Deleting...
                                </>
                              ) : (
                                <>
                                  <Trash2 className="w-4 h-4" />
                                  Delete Center
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                        <button
                          onClick={() => toggleDeleteForm(center.id)}
                          className="p-1.5 rounded-lg hover:bg-[#2A2438] text-[#A79C8C] hover:text-[#F5F0E8] transition-colors duration-200 flex-shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}