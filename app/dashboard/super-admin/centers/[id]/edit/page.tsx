// app/dashboard/super-admin/centers/[id]/edit/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Save,
  Loader2,
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { techCentersApi } from '@/lib/api/tech-centers';

export default function EditTechCenterPage() {
  const router = useRouter();
  const params = useParams();
  const techCenterId = params.id as string;
  const queryClient = useQueryClient();

  // --------------------------------------------------------------------------
  // Form state
  // --------------------------------------------------------------------------

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    countryId: '',
    city: '',
    address: '',
    phone: '',
    email: '',
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // --------------------------------------------------------------------------
  // Query
  // --------------------------------------------------------------------------

  const {
    data: techCenter,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['techCenter', techCenterId],
    queryFn: () => techCentersApi.getTechCenterById(techCenterId),
    enabled: !!techCenterId,
  });

  // --------------------------------------------------------------------------
  // Populate form when data loads
  // --------------------------------------------------------------------------

  useEffect(() => {
    if (techCenter) {
      setFormData({
        name: techCenter.name || '',
        code: techCenter.code || '',
        description: techCenter.description || '',
        countryId: techCenter.countryId || '',
        city: techCenter.city || '',
        address: techCenter.address || '',
        phone: techCenter.phone || '',
        email: techCenter.email || '',
        isActive: techCenter.isActive,
      });
    }
  }, [techCenter]);

  // --------------------------------------------------------------------------
  // Countries
  // --------------------------------------------------------------------------

  const { data: countries = [] } = useQuery({
    queryKey: ['countries'],
    queryFn: techCentersApi.getCountries,
  });

  // --------------------------------------------------------------------------
  // Update mutation
  // --------------------------------------------------------------------------

  const updateMutation = useMutation({
    mutationFn: (data: typeof formData) =>
      fetch(`/api/admin/tech-centers/${techCenterId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }).then(async (res) => {
        if (!res.ok) {
          const error = await res.json();
          throw new Error(
            error.error || 'Failed to update tech center'
          );
        }

        return res.json();
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['techCenter', techCenterId],
      });

      queryClient.invalidateQueries({
        queryKey: ['techCenters'],
      });

      router.push(
        `/dashboard/super-admin/centers/${techCenterId}`
      );
    },

    onError: (error: Error) => {
      setErrors({
        submit: error.message || 'Failed to update tech center',
      });
    },
  });

  // --------------------------------------------------------------------------
  // Loading
  // --------------------------------------------------------------------------

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-7 flex items-center gap-3">
            <div className="h-10 w-10 animate-pulse rounded-lg bg-[#E8EBEF]" />

            <div className="space-y-2">
              <div className="h-5 w-48 animate-pulse rounded bg-[#E8EBEF]" />
              <div className="h-3 w-32 animate-pulse rounded bg-[#E8EBEF]" />
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-[#E1E5EA] bg-white shadow-sm">
            <div className="space-y-3 border-b border-[#E8EBEF] p-5 sm:p-6">
              <div className="h-6 w-56 animate-pulse rounded bg-[#E8EBEF]" />
              <div className="h-4 w-72 animate-pulse rounded bg-[#E8EBEF]" />
            </div>

            <div className="space-y-8 p-5 sm:p-6">
              {[1, 2, 3, 4].map((section) => (
                <div key={section} className="space-y-4">
                  <div className="h-4 w-32 animate-pulse rounded bg-[#E8EBEF]" />

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="h-11 animate-pulse rounded-lg bg-[#F2F4F6]" />
                    <div className="h-11 animate-pulse rounded-lg bg-[#F2F4F6]" />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 border-t border-[#E8EBEF] p-4 sm:px-6">
              <div className="h-10 w-20 animate-pulse rounded-lg bg-[#E8EBEF]" />
              <div className="h-10 w-32 animate-pulse rounded-lg bg-[#E8EBEF]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // Error
  // --------------------------------------------------------------------------

  if (error) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] px-4 py-10 sm:px-6">
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="w-full max-w-md rounded-xl border border-[#E1E5EA] bg-white p-7 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#FEF1EF]">
              <span className="text-xl">⚠️</span>
            </div>

            <h3 className="mb-2 text-lg font-semibold text-[#172033]">
              Failed to Load
            </h3>

            <p className="text-sm leading-6 text-[#667085]">
              {(error as Error)?.message ||
                'An error occurred while loading the tech center.'}
            </p>

            <button
              onClick={() => router.back()}
              className="mt-5 rounded-lg bg-[#12203B] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1C2E4E] focus:outline-none focus:ring-2 focus:ring-[#12203B]/20"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // Submit
  // --------------------------------------------------------------------------

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setErrors({});

    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.code.trim()) {
      newErrors.code = 'Code is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    updateMutation.mutate(formData);
  };

  // --------------------------------------------------------------------------
  // Input changes
  // --------------------------------------------------------------------------

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // --------------------------------------------------------------------------
  // Shared input styles
  // --------------------------------------------------------------------------

  const inputBase =
    'w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-[#344054] outline-none transition-colors placeholder:text-[#98A2B3] focus:ring-2 focus:ring-[#12203B]/10';

  const normalInput =
    `${inputBase} border-[#DCE1E7] focus:border-[#12203B]`;

  const errorInput =
    `${inputBase} border-[#D16B55] focus:border-[#B54732] focus:ring-[#B54732]/10`;

  // --------------------------------------------------------------------------
  // Main
  // --------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-[#F7F8FA] px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">

        {/* ------------------------------------------------------------------ */}
        {/* Header                                                             */}
        {/* ------------------------------------------------------------------ */}

        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">

            <button
              onClick={() => router.back()}
              aria-label="Go back"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#DCE1E7] bg-white text-[#667085] shadow-sm transition-colors hover:bg-[#F8FAFC] hover:text-[#12203B] focus:outline-none focus:ring-2 focus:ring-[#12203B]/10"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            <button
              onClick={() =>
                router.push(
                  `/dashboard/super-admin/centers/${techCenterId}`
                )
              }
              aria-label="View tech center"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#DCE1E7] bg-white text-[#667085] shadow-sm transition-colors hover:bg-[#F8FAFC] hover:text-[#12203B] focus:outline-none focus:ring-2 focus:ring-[#12203B]/10"
            >
              <Building2 className="h-4 w-4" />
            </button>

            <div className="mx-1 hidden h-7 w-px bg-[#DCE1E7] sm:block" />

            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#D9DEE5] bg-white">
                <Building2 className="h-5 w-5 text-[#12203B]" />
              </div>

              <div className="min-w-0">
                <h1
                  className="text-xl font-semibold text-[#172033] sm:text-2xl"
                  style={{
                    fontFamily: 'var(--font-display)',
                  }}
                >
                  Edit Tech Center
                </h1>

                <p className="truncate text-sm text-[#667085]">
                  {techCenter?.name || 'Loading...'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* Form Card                                                          */}
        {/* ------------------------------------------------------------------ */}

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="overflow-hidden rounded-xl border border-[#E1E5EA] bg-white shadow-sm"
        >
          <form onSubmit={handleSubmit}>

            {/* -------------------------------------------------------------- */}
            {/* Form content                                                   */}
            {/* -------------------------------------------------------------- */}

            <div className="p-5 sm:p-6">

              {/* Basic Information */}

              <section className="space-y-4">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-[#7A8494]">
                    Basic Information
                  </h3>

                  <p className="mt-1 text-sm text-[#667085]">
                    Update the main information for this tech center.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                  {/* Name */}

                  <div>
                    <label
                      htmlFor="name"
                      className="mb-1.5 block text-sm font-medium text-[#344054]"
                    >
                      Name <span className="text-[#B54732]">*</span>
                    </label>

                    <input
                      id="name"
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={errors.name ? errorInput : normalInput}
                      placeholder="Tech center name"
                    />

                    {errors.name && (
                      <p className="mt-1.5 text-xs text-[#B54732]">
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Code */}

                  <div>
                    <label
                      htmlFor="code"
                      className="mb-1.5 block text-sm font-medium text-[#344054]"
                    >
                      Code <span className="text-[#B54732]">*</span>
                    </label>

                    <input
                      id="code"
                      type="text"
                      name="code"
                      value={formData.code}
                      onChange={handleChange}
                      className={errors.code ? errorInput : normalInput}
                      placeholder="TC001"
                    />

                    {errors.code && (
                      <p className="mt-1.5 text-xs text-[#B54732]">
                        {errors.code}
                      </p>
                    )}
                  </div>
                </div>

                {/* Description */}

                <div>
                  <label
                    htmlFor="description"
                    className="mb-1.5 block text-sm font-medium text-[#344054]"
                  >
                    Description
                  </label>

                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className={`${normalInput} resize-none`}
                    placeholder="Brief description of the tech center"
                  />
                </div>
              </section>

              {/* Location */}

              <section className="mt-8 space-y-4 border-t border-[#E8EBEF] pt-7">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F4F6F8]">
                    <MapPin className="h-4 w-4 text-[#12203B]" />
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-[#7A8494]">
                      Location
                    </h3>

                    <p className="mt-1 text-sm text-[#667085]">
                      Set the location details for this center.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                  {/* Country */}

                  <div>
                    <label
                      htmlFor="countryId"
                      className="mb-1.5 block text-sm font-medium text-[#344054]"
                    >
                      Country
                    </label>

                    <div className="relative">
                      <Globe className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98A2B3]" />

                      <select
                        id="countryId"
                        name="countryId"
                        value={formData.countryId}
                        onChange={handleChange}
                        className={`${normalInput} appearance-none pl-10`}
                      >
                        <option value="">Select country</option>

                        {countries.map((country) => (
                          <option
                            key={country.id}
                            value={country.id}
                          >
                            {country.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* City */}

                  <div>
                    <label
                      htmlFor="city"
                      className="mb-1.5 block text-sm font-medium text-[#344054]"
                    >
                      City
                    </label>

                    <input
                      id="city"
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className={normalInput}
                      placeholder="City name"
                    />
                  </div>
                </div>

                {/* Address */}

                <div>
                  <label
                    htmlFor="address"
                    className="mb-1.5 block text-sm font-medium text-[#344054]"
                  >
                    Address
                  </label>

                  <input
                    id="address"
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className={normalInput}
                    placeholder="Street address"
                  />
                </div>
              </section>

              {/* Contact Information */}

              <section className="mt-8 space-y-4 border-t border-[#E8EBEF] pt-7">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F4F6F8]">
                    <Phone className="h-4 w-4 text-[#12203B]" />
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-[#7A8494]">
                      Contact Information
                    </h3>

                    <p className="mt-1 text-sm text-[#667085]">
                      Add contact details for the tech center.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                  {/* Phone */}

                  <div>
                    <label
                      htmlFor="phone"
                      className="mb-1.5 block text-sm font-medium text-[#344054]"
                    >
                      Phone
                    </label>

                    <div className="relative">
                      <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98A2B3]" />

                      <input
                        id="phone"
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`${normalInput} pl-10`}
                        placeholder="+256 700 000 000"
                      />
                    </div>
                  </div>

                  {/* Email */}

                  <div>
                    <label
                      htmlFor="email"
                      className="mb-1.5 block text-sm font-medium text-[#344054]"
                    >
                      Email
                    </label>

                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98A2B3]" />

                      <input
                        id="email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`${normalInput} pl-10`}
                        placeholder="contact@example.com"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Status */}

              <section className="mt-8 border-t border-[#E8EBEF] pt-7">
                <div className="mb-4">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-[#7A8494]">
                    Status
                  </h3>

                  <p className="mt-1 text-sm text-[#667085]">
                    Control whether this tech center is currently active.
                  </p>
                </div>

                <label
                  htmlFor="isActive"
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-[#E1E5EA] bg-[#FAFBFC] px-4 py-3 transition-colors hover:bg-[#F7F8FA]"
                >
                  <input
                    id="isActive"
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-[#C8CFD8] text-[#12203B] focus:ring-2 focus:ring-[#12203B]/20"
                  />

                  <span>
                    <span className="block text-sm font-medium text-[#344054]">
                      Active tech center
                    </span>

                    <span className="mt-0.5 block text-xs text-[#667085]">
                      This center is available for normal system use.
                    </span>
                  </span>
                </label>
              </section>

              {/* Submit error */}

              {errors.submit && (
                <div className="mt-6 rounded-lg border border-[#F0D7D2] bg-[#FEF4F2] px-4 py-3">
                  <p className="text-sm text-[#A4462F]">
                    {errors.submit}
                  </p>
                </div>
              )}
            </div>

            {/* ---------------------------------------------------------------- */}
            {/* Footer                                                           */}
            {/* ---------------------------------------------------------------- */}

            <div className="flex flex-col-reverse gap-2.5 border-t border-[#E8EBEF] bg-[#FAFBFC] px-5 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-6">

              <button
                type="button"
                onClick={() => router.back()}
                disabled={updateMutation.isPending}
                className="rounded-lg border border-[#DCE1E7] bg-white px-4 py-2.5 text-sm font-medium text-[#475467] transition-colors hover:bg-[#F8FAFC] hover:text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#12203B]/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#12203B] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1C2E4E] focus:outline-none focus:ring-2 focus:ring-[#12203B]/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}