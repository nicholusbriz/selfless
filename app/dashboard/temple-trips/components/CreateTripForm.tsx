'use client';

import { useState, useEffect } from 'react';
import { X, User } from 'lucide-react';

interface CreateTripFormProps {
  onSubmit: (data: TripFormData) => Promise<void>;
  onCancel: () => void;
  isPending: boolean;
  submitLabel?: string;
  initialData?: TripFormData;
  isEdit?: boolean;
}

export interface TripFormData {
  title: string;
  description: string;
  coordinatorName: string;
  requirements: string;
  closingText: string;
}

const INITIAL_FORM: TripFormData = {
  title: '',
  description: '',
  coordinatorName: '',
  requirements: '',
  closingText: '',
};

export function CreateTripForm({
  onSubmit,
  onCancel,
  isPending,
  submitLabel = 'Create Trip',
  initialData,
  isEdit = false,
}: CreateTripFormProps) {
  const [formData, setFormData] = useState<TripFormData>(
    initialData || INITIAL_FORM
  );

  // Update form data when initialData changes (for edit mode)
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate requirements
    if (!formData.requirements || formData.requirements.trim() === '') {
      alert('Please add requirements');
      return;
    }

    // Validate closing text
    if (!formData.closingText || formData.closingText.trim() === '') {
      alert('Please add closing text');
      return;
    }

    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#1A365D]">
          {isEdit ? 'Edit Temple Trip' : 'Create Temple Trip'}
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E2E8F0] text-[#64748B] transition-all hover:border-[#CBD5E1] hover:bg-[#F8FAFC] hover:text-[#1A365D]"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-5">
        {/* Title */}
        <div>
          <label htmlFor="title" className="mb-2 block text-sm font-medium text-[#1E293B]">
            Trip Title *
          </label>
          <input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., Nairobi Kenya Temple Trip"
            className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-2.5 text-sm text-[#1E293B] placeholder:text-[#94A3B8] focus:border-[#3182CE] focus:outline-none focus:ring-2 focus:ring-[#3182CE]/20 transition-all"
            required
          />
        </div>

        {/* Coordinator Name */}
        <div>
          <label htmlFor="coordinatorName" className="mb-2 block text-sm font-medium text-[#1E293B]">
            Coordinator Name *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <input
              id="coordinatorName"
              type="text"
              value={formData.coordinatorName}
              onChange={(e) => setFormData({ ...formData, coordinatorName: e.target.value })}
              placeholder="e.g., Kiwanuka Tonny"
              className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] pl-10 pr-4 py-2.5 text-sm text-[#1E293B] placeholder:text-[#94A3B8] focus:border-[#3182CE] focus:outline-none focus:ring-2 focus:ring-[#3182CE]/20 transition-all"
              required
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="mb-2 block text-sm font-medium text-[#1E293B]">
            Description *
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe the trip details... (Formatting and emojis supported)"
            rows={4}
            className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-2.5 text-sm text-[#1E293B] placeholder:text-[#94A3B8] focus:border-[#3182CE] focus:outline-none focus:ring-2 focus:ring-[#3182CE]/20 transition-all resize-none whitespace-pre-wrap"
            required
          />
        </div>

        {/* Requirements */}
        <div>
          <label htmlFor="requirements" className="mb-2 block text-sm font-medium text-[#1E293B]">
            Requirements *
          </label>
          <textarea
            id="requirements"
            value={formData.requirements || ''}
            onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
            placeholder="Paste your requirements with formatting preserved (Formatting and emojis supported)"
            rows={8}
            className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-2.5 text-sm text-[#1E293B] placeholder:text-[#94A3B8] focus:border-[#3182CE] focus:outline-none focus:ring-2 focus:ring-[#3182CE]/20 transition-all resize-none whitespace-pre-wrap"
            required
          />
        </div>

        {/* Closing Text */}
        <div>
          <label htmlFor="closingText" className="mb-2 block text-sm font-medium text-[#1E293B]">
            Closing Text *
          </label>
          <textarea
            id="closingText"
            value={formData.closingText || ''}
            onChange={(e) => setFormData({ ...formData, closingText: e.target.value })}
            placeholder="Any closing message (Required - Formatting and emojis supported)"
            rows={2}
            className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-2.5 text-sm text-[#1E293B] placeholder:text-[#94A3B8] focus:border-[#3182CE] focus:outline-none focus:ring-2 focus:ring-[#3182CE]/20 transition-all resize-none whitespace-pre-wrap"
            required
          />
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-[#E2E8F0] bg-white px-4 py-2.5 text-sm font-medium text-[#64748B] transition-all hover:border-[#CBD5E1] hover:bg-[#F8FAFC] hover:text-[#1A365D]"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-[#1A365D] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#153475] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? 'Creating...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
