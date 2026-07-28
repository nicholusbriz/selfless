// app/dashboard/super-admin/centers/create/page.tsx
'use client';

import { useState } from 'react';
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
  Plus,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { techCentersApi } from '@/lib/api/tech-centers';

export default function CreateTechCenterPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    countryId: '',
    city: '',
    address: '',
    phone: '',
    email: '',
  });

  const [error, setError] = useState<string | null>(null);

  // Fetch countries
  const {
    data: countries = [],
    isLoading: loadingCountries,
  } = useQuery({
    queryKey: ['countries'],
    queryFn: techCentersApi.getCountries,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: techCentersApi.createTechCenter,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['techCenters'] });
      router.push('/dashboard/super-admin/centers');
    },
    onError: (error: any) => {
      setError(error.message || 'Failed to create tech center');
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate
    if (!formData.name.trim()) {
      setError('Center name is required');
      return;
    }
    if (!formData.code.trim()) {
      setError('Center code is required');
      return;
    }

    createMutation.mutate(formData);
  };

  const handleCancel = () => {
    router.push('/dashboard/super-admin/centers');
  };

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
            <Plus className="w-6 h-6 text-[#E8A33D]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#F5F0E8]" style={{ fontFamily: 'var(--font-display)' }}>
              Create Tech Center
            </h1>
            <p className="text-sm text-[#A79C8C]">Add a new tech center to the platform</p>
          </div>
        </div>
      </div>

      {/* Create Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#150F20] border border-[#2A2438] rounded-2xl p-6"
      >
        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-3 p-4 rounded-lg mb-6 bg-[#F87171]/10 border border-[#F87171]/30 text-[#F87171]">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                Center Code *
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                required
                placeholder="e.g., FCT-001"
                className="w-full px-4 py-2.5 bg-[#0B0912] border border-[#2A2438] rounded-lg text-[#F5F0E8] placeholder-[#6B6358] focus:outline-none focus:ring-2 focus:ring-[#E8A33D]/40 focus:border-[#E8A33D]/40 transition-colors duration-200 text-sm sm:text-base"
              />
            </div>
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
                Country
              </label>
              <select
                name="countryId"
                value={formData.countryId}
                onChange={handleInputChange}
                disabled={loadingCountries}
                className="w-full px-4 py-2.5 bg-[#0B0912] border border-[#2A2438] rounded-lg text-[#F5F0E8] focus:outline-none focus:ring-2 focus:ring-[#E8A33D]/40 focus:border-[#E8A33D]/40 transition-colors duration-200 text-sm sm:text-base disabled:opacity-50"
              >
                <option value="">Select country</option>
                {countries.map((country) => (
                  <option key={country.id} value={country.id}>
                    {country.name}
                  </option>
                ))}
              </select>
              {loadingCountries && (
                <p className="text-xs text-[#6B6358] mt-1">Loading countries...</p>
              )}
            </div>

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
              disabled={createMutation.isPending}
              className="w-full sm:flex-1 px-4 py-2.5 bg-gradient-to-r from-[#E8A33D] to-[#C97F1F] text-[#0B0912] font-medium rounded-lg hover:shadow-lg hover:shadow-[#E8A33D]/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Create Center
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}