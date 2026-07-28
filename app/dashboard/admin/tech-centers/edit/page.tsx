// app/dashboard/admin/tech-centers/edit/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Home, 
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Loader2,
  Save,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminTechCenterApi, type TechCenter } from '@/lib/api/admin-tech-center';

export default function EditTechCenterPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    countryId: '',
    city: '',
    address: '',
    phone: '',
    email: '',
  });

  const [isDirty, setIsDirty] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Fetch tech center data
  const {
    data: techCenter,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['adminTechCenter'],
    queryFn: adminTechCenterApi.getTechCenter,
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: adminTechCenterApi.updateTechCenter,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['adminTechCenter'] });
      queryClient.invalidateQueries({ queryKey: ['adminTechCenterStats'] });
      setSaveMessage({ type: 'success', message: data.message || 'Tech center updated successfully!' });
      setIsDirty(false);
      setTimeout(() => {
        router.push('/dashboard/admin/tech-centers');
      }, 2000);
    },
    onError: (error: any) => {
      setSaveMessage({ type: 'error', message: error.message || 'Failed to update tech center' });
    },
  });

  // Populate form when data loads
  useEffect(() => {
    if (techCenter) {
      setFormData({
        name: techCenter.name || '',
        description: techCenter.description || '',
        countryId: techCenter.countryId || '',
        city: techCenter.city || '',
        address: techCenter.address || '',
        phone: techCenter.phone || '',
        email: techCenter.email || '',
      });
    }
  }, [techCenter]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setIsDirty(true);
    setSaveMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveMessage(null);
    
    // Check if any changes were made
    if (!isDirty) {
      setSaveMessage({ type: 'error', message: 'No changes to save' });
      return;
    }

    // Validate
    if (!formData.name.trim()) {
      setSaveMessage({ type: 'error', message: 'Center name is required' });
      return;
    }

    updateMutation.mutate(formData);
  };

  const handleCancel = () => {
    router.push('/dashboard/admin/tech-centers');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#E8A33D] animate-spin mx-auto mb-4" />
          <p className="text-[#A79C8C]">Loading tech center...</p>
        </div>
      </div>
    );
  }

  if (error || !techCenter) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-[#F87171]/10 flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-[#F87171]" />
          </div>
          <h3 className="text-xl font-semibold text-[#F5F0E8] mb-2">Failed to Load</h3>
          <p className="text-[#A79C8C]">{(error as Error)?.message || 'Tech center not found'}</p>
          <button
            onClick={() => router.push('/dashboard/admin/tech-centers')}
            className="mt-4 px-6 py-2 bg-[#E8A33D] text-[#0B0912] rounded-lg hover:bg-[#C97F1F] transition-colors"
          >
            Go Back
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
          onClick={handleCancel}
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
            <Building2 className="w-6 h-6 text-[#E8A33D]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#F5F0E8]" style={{ fontFamily: 'var(--font-display)' }}>
              Edit Tech Center
            </h1>
            <p className="text-sm text-[#A79C8C]">Update your tech center information</p>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#150F20] border border-[#2A2438] rounded-2xl p-6"
      >
        {/* Save Message */}
        {saveMessage && (
          <div className={`flex items-center gap-3 p-4 rounded-lg mb-6 ${saveMessage.type === 'success' ? 'bg-[#34D399]/10 border border-[#34D399]/30 text-[#34D399]' : 'bg-[#F87171]/10 border border-[#F87171]/30 text-[#F87171]'}`}>
            {saveMessage.type === 'success' ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <span>{saveMessage.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#A79C8C] mb-1.5">
              Center Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="e.g., Freedom City Tech Center"
              className="w-full px-4 py-2.5 bg-[#0B0912] border border-[#2A2438] rounded-lg text-[#F5F0E8] placeholder-[#6B6358] focus:outline-none focus:ring-2 focus:ring-[#E8A33D]/40 focus:border-[#E8A33D]/40 transition-colors duration-200 text-sm sm:text-base"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#A79C8C] mb-1.5">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              placeholder="Brief description of the tech center..."
              className="w-full px-4 py-2.5 bg-[#0B0912] border border-[#2A2438] rounded-lg text-[#F5F0E8] placeholder-[#6B6358] focus:outline-none focus:ring-2 focus:ring-[#E8A33D]/40 focus:border-[#E8A33D]/40 transition-colors duration-200 resize-none text-sm sm:text-base"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#A79C8C] mb-1.5">
                City
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="e.g., Kampala"
                className="w-full px-4 py-2.5 bg-[#0B0912] border border-[#2A2438] rounded-lg text-[#F5F0E8] placeholder-[#6B6358] focus:outline-none focus:ring-2 focus:ring-[#E8A33D]/40 focus:border-[#E8A33D]/40 transition-colors duration-200 text-sm sm:text-base"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#A79C8C] mb-1.5">
                Country
              </label>
              <select
                name="countryId"
                value={formData.countryId}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-[#0B0912] border border-[#2A2438] rounded-lg text-[#F5F0E8] focus:outline-none focus:ring-2 focus:ring-[#E8A33D]/40 focus:border-[#E8A33D]/40 transition-colors duration-200 text-sm sm:text-base"
              >
                <option value="">Select country</option>
                {techCenter.country && (
                  <option value={techCenter.country.id}>{techCenter.country.name}</option>
                )}
              </select>
              <p className="text-xs text-[#6B6358] mt-1">Note: Country selection requires additional setup</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#A79C8C] mb-1.5">
              Address
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="e.g., Plot 123, Street Name"
              className="w-full px-4 py-2.5 bg-[#0B0912] border border-[#2A2438] rounded-lg text-[#F5F0E8] placeholder-[#6B6358] focus:outline-none focus:ring-2 focus:ring-[#E8A33D]/40 focus:border-[#E8A33D]/40 transition-colors duration-200 text-sm sm:text-base"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#A79C8C] mb-1.5">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="e.g., +256 700 123 456"
                className="w-full px-4 py-2.5 bg-[#0B0912] border border-[#2A2438] rounded-lg text-[#F5F0E8] placeholder-[#6B6358] focus:outline-none focus:ring-2 focus:ring-[#E8A33D]/40 focus:border-[#E8A33D]/40 transition-colors duration-200 text-sm sm:text-base"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#A79C8C] mb-1.5">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="e.g., info@fctc.com"
                className="w-full px-4 py-2.5 bg-[#0B0912] border border-[#2A2438] rounded-lg text-[#F5F0E8] placeholder-[#6B6358] focus:outline-none focus:ring-2 focus:ring-[#E8A33D]/40 focus:border-[#E8A33D]/40 transition-colors duration-200 text-sm sm:text-base"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-[#2A2438]">
            <button
              type="button"
              onClick={handleCancel}
              className="w-full sm:flex-1 px-4 py-2.5 bg-[#2A2438] text-[#A79C8C] rounded-lg hover:bg-[#3A3448] hover:text-[#F5F0E8] transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending || !isDirty}
              className="w-full sm:flex-1 px-4 py-2.5 bg-gradient-to-r from-[#E8A33D] to-[#C97F1F] text-[#0B0912] font-medium rounded-lg hover:shadow-lg hover:shadow-[#E8A33D]/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>

          {!isDirty && !saveMessage && (
            <p className="text-sm text-[#6B6358] text-center">No changes to save</p>
          )}
        </form>
      </motion.div>
    </div>
  );
}