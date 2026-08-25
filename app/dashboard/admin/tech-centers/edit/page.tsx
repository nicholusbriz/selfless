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
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  adminTechCenterApi,
} from '@/lib/api/admin-tech-center';

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
  const [saveMessage, setSaveMessage] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

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
      queryClient.invalidateQueries({
        queryKey: ['adminTechCenter'],
      });

      queryClient.invalidateQueries({
        queryKey: ['adminTechCenterStats'],
      });

      setSaveMessage({
        type: 'success',
        message:
          data.message || 'Tech center updated successfully!',
      });

      setIsDirty(false);

      setTimeout(() => {
        router.push('/dashboard/admin/tech-centers');
      }, 2000);
    },

    onError: (error: any) => {
      setSaveMessage({
        type: 'error',
        message:
          error.message || 'Failed to update tech center',
      });
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

    setIsDirty(true);
    setSaveMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveMessage(null);

    // Check if changes were made
    if (!isDirty) {
      setSaveMessage({
        type: 'error',
        message: 'No changes to save',
      });
      return;
    }

    // Validate center name
    if (!formData.name.trim()) {
      setSaveMessage({
        type: 'error',
        message: 'Center name is required',
      });
      return;
    }

    updateMutation.mutate(formData);
  };

  const handleCancel = () => {
    router.push('/dashboard/admin/tech-centers');
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#F8FAFC]">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#1A365D]/10 flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-7 h-7 text-[#1A365D] animate-spin" />
          </div>

          <h3 className="text-base font-semibold text-[#1E293B]">
            Loading Tech Center
          </h3>

          <p className="text-sm text-[#64748B] mt-1">
            Please wait while we retrieve the center information.
          </p>
        </div>
      </div>
    );
  }

  if (error || !techCenter) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#F8FAFC] px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-red-500" />
          </div>

          <h3 className="text-xl font-semibold text-[#1E293B] mb-2">
            Failed to Load
          </h3>

          <p className="text-sm text-[#64748B]">
            {(error as Error)?.message ||
              'Tech center not found'}
          </p>

          <button
            onClick={() =>
              router.push('/dashboard/admin/tech-centers')
            }
            className="mt-5 px-5 py-2.5 rounded-lg bg-[#1A365D] text-white font-medium hover:bg-[#153475] transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-5xl mx-auto">

        {/* =========================================
            PAGE HEADER
        ========================================== */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">

          <div className="flex items-center gap-3">
            {/* Back */}
            <button
              onClick={handleCancel}
              aria-label="Go back"
              className="
                w-10 h-10
                flex items-center justify-center
                rounded-lg
                bg-white
                border border-[#E2E8F0]
                text-[#64748B]
                shadow-sm
                hover:text-[#1A365D]
                hover:border-[#CBD5E1]
                hover:bg-[#F8FAFC]
                transition-all
              "
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="hidden sm:block h-8 w-px bg-[#E2E8F0]" />

            {/* Title */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-[#1A365D]/10 border border-[#1A365D]/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-[#1A365D]" />
              </div>

              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-[#1E293B]">
                  Edit Tech Center
                </h1>

                <p className="text-sm text-[#64748B] mt-0.5">
                  Update your tech center information
                </p>
              </div>
            </div>
          </div>

          {/* Current Center Status */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-[#E2E8F0] shadow-sm">
            <span
              className={`w-2 h-2 rounded-full ${
                techCenter.isActive
                  ? 'bg-emerald-500'
                  : 'bg-red-500'
              }`}
            />

            <span className="text-sm font-medium text-[#475569]">
              {techCenter.isActive ? 'Active Center' : 'Inactive Center'}
            </span>
          </div>
        </div>

        {/* =========================================
            MAIN FORM CARD
        ========================================== */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="
            bg-white
            border border-[#E2E8F0]
            rounded-2xl
            shadow-sm
            overflow-hidden
          "
        >
          {/* Card Header */}
          <div className="px-5 sm:px-7 py-5 border-b border-[#E2E8F0] bg-[#FFFFFF]">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#1A365D]/10 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-4 h-4 text-[#1A365D]" />
              </div>

              <div>
                <h2 className="text-base sm:text-lg font-semibold text-[#1E293B]">
                  Center Information
                </h2>

                <p className="text-sm text-[#64748B] mt-0.5">
                  Keep your technology center details accurate and up to date.
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-7">

            {/* =====================================
                SAVE MESSAGE
            ====================================== */}
            {saveMessage && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`
                  flex items-start gap-3
                  p-4
                  rounded-xl
                  mb-6
                  ${
                    saveMessage.type === 'success'
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                      : 'bg-red-50 border border-red-200 text-red-700'
                  }
                `}
              >
                {saveMessage.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                )}

                <span className="text-sm font-medium">
                  {saveMessage.message}
                </span>
              </motion.div>
            )}

            {/* =====================================
                FORM
            ====================================== */}
            <form
              onSubmit={handleSubmit}
              className="space-y-6"
            >

              {/* Center Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-semibold text-[#334155] mb-2"
                >
                  Center Name
                  <span className="text-red-500 ml-1">*</span>
                </label>

                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Freedom City Tech Center"
                  className="
                    w-full
                    px-4 py-3
                    bg-white
                    border border-[#CBD5E1]
                    rounded-lg
                    text-[#1E293B]
                    placeholder-[#94A3B8]
                    text-sm
                    outline-none
                    transition-all
                    focus:border-[#3182CE]
                    focus:ring-2
                    focus:ring-[#3182CE]/10
                    hover:border-[#94A3B8]
                  "
                />
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-semibold text-[#334155] mb-2"
                >
                  Description
                </label>

                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Brief description of the tech center..."
                  className="
                    w-full
                    px-4 py-3
                    bg-white
                    border border-[#CBD5E1]
                    rounded-lg
                    text-[#1E293B]
                    placeholder-[#94A3B8]
                    text-sm
                    outline-none
                    resize-none
                    transition-all
                    focus:border-[#3182CE]
                    focus:ring-2
                    focus:ring-[#3182CE]/10
                    hover:border-[#94A3B8]
                  "
                />
              </div>

              {/* Location Section */}
              <div className="pt-2">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-4 h-4 text-[#3182CE]" />

                  <h3 className="text-sm font-bold text-[#1E293B]">
                    Location
                  </h3>

                  <div className="h-px flex-1 bg-[#E2E8F0]" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  {/* City */}
                  <div>
                    <label
                      htmlFor="city"
                      className="block text-sm font-semibold text-[#475569] mb-2"
                    >
                      City
                    </label>

                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />

                      <input
                        id="city"
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="e.g., Kampala"
                        className="
                          w-full
                          pl-10 pr-4 py-3
                          bg-white
                          border border-[#CBD5E1]
                          rounded-lg
                          text-[#1E293B]
                          placeholder-[#94A3B8]
                          text-sm
                          outline-none
                          transition-all
                          focus:border-[#3182CE]
                          focus:ring-2
                          focus:ring-[#3182CE]/10
                        "
                      />
                    </div>
                  </div>

                  {/* Country */}
                  <div>
                    <label
                      htmlFor="countryId"
                      className="block text-sm font-semibold text-[#475569] mb-2"
                    >
                      Country
                    </label>

                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] pointer-events-none" />

                      <select
                        id="countryId"
                        name="countryId"
                        value={formData.countryId}
                        onChange={handleInputChange}
                        className="
                          w-full
                          pl-10 pr-4 py-3
                          bg-white
                          border border-[#CBD5E1]
                          rounded-lg
                          text-[#1E293B]
                          text-sm
                          outline-none
                          appearance-none
                          transition-all
                          focus:border-[#3182CE]
                          focus:ring-2
                          focus:ring-[#3182CE]/10
                        "
                      >
                        <option value="">
                          Select country
                        </option>

                        {techCenter.country && (
                          <option value={techCenter.country.id}>
                            {techCenter.country.name}
                          </option>
                        )}
                      </select>
                    </div>

                    <p className="text-xs text-[#94A3B8] mt-1.5">
                      Country selection requires additional setup.
                    </p>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div>
                <label
                  htmlFor="address"
                  className="block text-sm font-semibold text-[#475569] mb-2"
                >
                  Address
                </label>

                <div className="relative">
                  <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-[#94A3B8]" />

                  <input
                    id="address"
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="e.g., Plot 123, Street Name"
                    className="
                      w-full
                      pl-10 pr-4 py-3
                      bg-white
                      border border-[#CBD5E1]
                      rounded-lg
                      text-[#1E293B]
                      placeholder-[#94A3B8]
                      text-sm
                      outline-none
                      transition-all
                      focus:border-[#3182CE]
                      focus:ring-2
                      focus:ring-[#3182CE]/10
                    "
                  />
                </div>
              </div>

              {/* Contact Section */}
              <div className="pt-2">
                <div className="flex items-center gap-2 mb-4">
                  <Phone className="w-4 h-4 text-[#3182CE]" />

                  <h3 className="text-sm font-bold text-[#1E293B]">
                    Contact Information
                  </h3>

                  <div className="h-px flex-1 bg-[#E2E8F0]" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  {/* Phone */}
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-semibold text-[#475569] mb-2"
                    >
                      Phone
                    </label>

                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />

                      <input
                        id="phone"
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="e.g., +256 700 123 456"
                        className="
                          w-full
                          pl-10 pr-4 py-3
                          bg-white
                          border border-[#CBD5E1]
                          rounded-lg
                          text-[#1E293B]
                          placeholder-[#94A3B8]
                          text-sm
                          outline-none
                          transition-all
                          focus:border-[#3182CE]
                          focus:ring-2
                          focus:ring-[#3182CE]/10
                        "
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-semibold text-[#475569] mb-2"
                    >
                      Email
                    </label>

                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />

                      <input
                        id="email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="e.g., info@fctc.com"
                        className="
                          w-full
                          pl-10 pr-4 py-3
                          bg-white
                          border border-[#CBD5E1]
                          rounded-lg
                          text-[#1E293B]
                          placeholder-[#94A3B8]
                          text-sm
                          outline-none
                          transition-all
                          focus:border-[#3182CE]
                          focus:ring-2
                          focus:ring-[#3182CE]/10
                        "
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* =====================================
                  ACTIONS
              ====================================== */}
              <div className="pt-6 border-t border-[#E2E8F0]">
                <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">

                  <button
                    type="button"
                    onClick={handleCancel}
                    className="
                      w-full sm:w-auto
                      min-w-[120px]
                      px-5 py-2.5
                      bg-white
                      border border-[#CBD5E1]
                      text-[#475569]
                      rounded-lg
                      font-medium
                      text-sm
                      hover:bg-[#F8FAFC]
                      hover:border-[#94A3B8]
                      transition-all
                    "
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={
                      updateMutation.isPending ||
                      !isDirty
                    }
                    className="
                      w-full sm:w-auto
                      min-w-[150px]
                      px-5 py-2.5
                      bg-[#1A365D]
                      text-white
                      rounded-lg
                      font-medium
                      text-sm
                      shadow-sm
                      hover:bg-[#153475]
                      hover:shadow-md
                      transition-all
                      disabled:opacity-50
                      disabled:cursor-not-allowed
                      flex items-center justify-center gap-2
                    "
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
                  <p className="text-xs text-[#94A3B8] text-right mt-3">
                    No changes to save
                  </p>
                )}
              </div>
            </form>
          </div>
        </motion.div>

        {/* Bottom information */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-4 px-1">
          <p className="text-xs text-[#94A3B8]">
            Changes will be reflected across the admin dashboard.
          </p>

          {isDirty && (
            <div className="flex items-center gap-2 text-xs text-[#3182CE]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3182CE]" />
              Unsaved changes
            </div>
          )}
        </div>
      </div>
    </div>
  );
}