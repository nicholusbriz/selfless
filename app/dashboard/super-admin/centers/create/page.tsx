// app/dashboard/super-admin/centers/create/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Home,
  Plus,
  Loader2,
  AlertCircle,
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

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

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

  const inputClass =
    'w-full rounded-lg border border-[#D9DEE7] bg-white px-4 py-2.5 text-sm text-[#172033] placeholder-[#8A93A3] outline-none transition-all duration-200 hover:border-[#C5CCD8] focus:border-[#1A365D] focus:ring-2 focus:ring-[#1A365D]/10 disabled:cursor-not-allowed disabled:bg-[#F5F7FA] disabled:opacity-70 sm:text-base';

  const labelClass =
    'mb-1.5 block text-sm font-medium text-[#344054]';

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#172033]">
      <div className="mx-auto w-full max-w-5xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3 sm:mb-8">
          <button
            type="button"
            onClick={handleCancel}
            aria-label="Back to tech centers"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#D9DEE7] bg-white text-[#526071] shadow-sm transition-all duration-200 hover:border-[#C5CCD8] hover:bg-[#F8FAFC] hover:text-[#1A365D] focus:outline-none focus:ring-2 focus:ring-[#1A365D]/15"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="mx-1 hidden h-7 w-px bg-[#D9DEE7] sm:block" />

          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#E5D5B8] bg-[#FBF7EF]">
              <Plus className="h-5 w-5 text-[#A67A34]" />
            </div>

            <div className="min-w-0">
              <h1
                className="truncate text-xl font-semibold tracking-tight text-[#12203B] sm:text-2xl"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Create Tech Center
              </h1>

              <p className="mt-0.5 text-sm text-[#667085]">
                Add a new tech center to the platform
              </p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="overflow-hidden rounded-xl border border-[#DCE1E8] bg-white shadow-[0_1px_3px_rgba(16,24,40,0.05)]"
        >
          {/* Card Header */}
          <div className="border-b border-[#E6E9EE] px-5 py-4 sm:px-6">
            <h2 className="text-sm font-semibold text-[#172033]">
              Center Information
            </h2>
            <p className="mt-0.5 text-xs text-[#7A8494]">
              Provide the basic information for this tech center.
            </p>
          </div>

          <div className="px-5 py-5 sm:px-6 sm:py-6">
            {/* Error Message */}
            {error && (
              <div
                role="alert"
                className="mb-5 flex items-start gap-3 rounded-lg border border-[#E8C9C2] bg-[#FCF3F0] px-4 py-3 text-sm text-[#A4462F]"
              >
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name + Code */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className={labelClass}>
                    Center Name <span className="text-[#A4462F]">*</span>
                  </label>

                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Freedom City Tech Center"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="code" className={labelClass}>
                    Center Code <span className="text-[#A4462F]">*</span>
                  </label>

                  <input
                    id="code"
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., FCT-001"
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className={labelClass}>
                  Description
                </label>

                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Brief description of the tech center..."
                  className={`${inputClass} resize-none`}
                />
              </div>

              {/* Country + City */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="countryId" className={labelClass}>
                    Country
                  </label>

                  <select
                    id="countryId"
                    name="countryId"
                    value={formData.countryId}
                    onChange={handleInputChange}
                    disabled={loadingCountries}
                    className={inputClass}
                  >
                    <option value="">Select country</option>

                    {countries.map((country) => (
                      <option key={country.id} value={country.id}>
                        {country.name}
                      </option>
                    ))}
                  </select>

                  {loadingCountries && (
                    <p className="mt-1.5 text-xs text-[#7A8494]">
                      Loading countries...
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="city" className={labelClass}>
                    City
                  </label>

                  <input
                    id="city"
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="e.g., Kampala"
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label htmlFor="address" className={labelClass}>
                  Address
                </label>

                <input
                  id="address"
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="e.g., Plot 123, Street Name"
                  className={inputClass}
                />
              </div>

              {/* Phone + Email */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="phone" className={labelClass}>
                    Phone
                  </label>

                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="e.g., +256 700 123 456"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="email" className={labelClass}>
                    Email
                  </label>

                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="e.g., info@fctc.com"
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col-reverse gap-3 border-t border-[#E6E9EE] pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="w-full rounded-lg border border-[#D5DAE2] bg-white px-5 py-2.5 text-sm font-medium text-[#475467] transition-all duration-200 hover:border-[#C5CCD8] hover:bg-[#F8FAFC] hover:text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#1A365D]/10 sm:w-auto"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#1A365D] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-[#153475] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#1A365D]/20 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Create Center
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

