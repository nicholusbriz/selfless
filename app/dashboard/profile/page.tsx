// app/dashboard/profile/page.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Camera,
  Mail,
  Lock,
  Edit2,
  Save,
  X,
  Check,
  AlertCircle,
  MapPin,
  Phone,
  Book,
  Eye,
  EyeOff,
  User as UserIcon,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import Link from 'next/link';
import { getResponseError, isRecord } from '../response-guards';
import AzureMediaUpload from '@/components/AzureMediaUpload';
import Image from 'next/image';

export default function ProfilePage() {
  const router = useRouter();
  const { user, updateUser, refreshUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [deletingImage, setDeletingImage] = useState<string | null>(null);
  const [settingImageUrl, setSettingImageUrl] = useState<string | null>(null);
  const [freshUser, setFreshUser] = useState(user);
  const [loadingFreshUser, setLoadingFreshUser] = useState(true);

  useEffect(() => {
    const fetchFreshUser = async () => {
      if (user?.id) {
        setLoadingFreshUser(true);
        try {
          const response = await fetch('/api/auth/me');
          const data = (await response.json()) as {
            user?: Parameters<typeof setFreshUser>[0];
          };
          if (data.user) setFreshUser(data.user);
        } catch (err) {
          console.error('Failed to fetch fresh user data:', err);
        } finally {
          setLoadingFreshUser(false);
        }
      } else {
        setLoadingFreshUser(false);
      }
    };
    fetchFreshUser();
  }, [user?.id]);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    bio: user?.bio || '',
    country: user?.country || '',
    city: user?.city || '',
    town: user?.town || '',
    street: user?.street || '',
    generalCourse: user?.generalCourse || '',
    linkedinUrl: user?.linkedinUrl || '',
    githubUrl: user?.githubUrl || '',
    gender: user?.gender || '',
    projectUrls: user?.projectUrls || [],
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  /* ================= IMAGE ================= */
  const handleImageClick = () => fileInputRef.current?.click();

  const handleSetProfileImage = async (imageUrl: string) => {
    setIsLoading(true);
    setSettingImageUrl(imageUrl);
    try {
      const res = await fetch('/api/user/set-profile-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || 'Failed to set profile image');

      const meRes = await fetch('/api/auth/me');
      const meData = (await meRes.json()) as { user?: Parameters<typeof setFreshUser>[0] };
      if (meData.user) setFreshUser(meData.user);

      await refreshUser();
      setSuccess('Profile image updated successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to set profile image');
    } finally {
      setIsLoading(false);
      setSettingImageUrl(null);
    }
  };

  const handleDeleteProfileImage = async (imageUrl: string) => {
    if (!confirm('Delete this profile image?')) return;
    setDeletingImage(imageUrl);
    try {
      const res = await fetch('/api/user/delete-profile-image', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error || 'Failed to delete image');
      }
      await refreshUser();
      setSuccess('Profile image deleted successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to delete image');
    } finally {
      setDeletingImage(null);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') setPreviewImage(reader.result);
    };
    reader.readAsDataURL(file);

    try {
      setIsLoading(true);
      setError('');
      setSuccess('');
      const form = new FormData();
      form.append('image', file);
      const res = await fetch('/api/user/upload-image', { method: 'POST', body: form });
      const data: unknown = await res.json();
      if (!res.ok) throw new Error(getResponseError(data, 'Failed to upload image'));
      if (!isRecord(data) || typeof data.imageUrl !== 'string') {
        throw new Error('Failed to upload image');
      }
      window.dispatchEvent(new Event('selfless:profile-gallery-changed'));
      await refreshUser();
      queryClient.invalidateQueries({ queryKey: ['dashboard-discover-students'] });
      setSuccess(
        data.previousImagePreserved === true
          ? 'Profile image updated. Your previous photo is in your profile gallery.'
          : 'Profile image updated successfully',
      );
      setPreviewImage(null);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile image');
      setPreviewImage(null);
    } finally {
      setIsLoading(false);
    }
  };

  /* ================= FORM ================= */
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleProjectUrlsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const urls = e.target.value.split(',').map(u => u.trim()).filter(Boolean);
    setFormData({ ...formData, projectUrls: urls });
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      setError('');
      setSuccess('');

      if (formData.newPassword) {
        if (!formData.currentPassword) {
          setError('Current password is required to change password');
          return;
        }
        if (formData.newPassword !== formData.confirmPassword) {
          setError('New passwords do not match');
          return;
        }
        if (formData.newPassword.length < 6) {
          setError('New password must be at least 6 characters');
          return;
        }
        const passwordResponse = await fetch('/api/user/change-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword,
          }),
        });
        const passwordData: unknown = await passwordResponse.json();
        if (!passwordResponse.ok) {
          setError(getResponseError(passwordData, 'Failed to change password'));
          return;
        }
      }

      await updateUser({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        bio: formData.bio,
        country: formData.country,
        city: formData.city,
        town: formData.town,
        street: formData.street,
        generalCourse: formData.generalCourse,
        linkedinUrl: formData.linkedinUrl,
        githubUrl: formData.githubUrl,
        gender: formData.gender,
        projectUrls: formData.projectUrls,
      });

      setSuccess('Profile updated successfully');
      setIsEditing(false);
      setFormData({ ...formData, currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '',
      bio: user?.bio || '',
      country: user?.country || '',
      city: user?.city || '',
      town: user?.town || '',
      street: user?.street || '',
      generalCourse: user?.generalCourse || '',
      linkedinUrl: user?.linkedinUrl || '',
      githubUrl: user?.githubUrl || '',
      gender: user?.gender || '',
      projectUrls: user?.projectUrls || [],
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setError('');
    setSuccess('');
    setPreviewImage(null);
  };

  /* ================= AVATAR ================= */
  const getInitials = () =>
    formData.firstName.charAt(0).toUpperCase() +
    formData.lastName.charAt(0).toUpperCase();

  const getAvatarColor = () => {
    const colors = [
      'bg-[#1A365D]', 'bg-[#3182CE]', 'bg-[#087F6C]',
      'bg-[#6842C2]', 'bg-[#C85B00]', 'bg-[#087C95]',
    ];
    const hash = formData.firstName.charCodeAt(0) + formData.lastName.charCodeAt(0);
    return colors[Math.abs(hash) % colors.length];
  };

  /* ================= STYLES ================= */
  const inputClass = `
    w-full rounded-lg border border-[#D9E2EC]
    bg-white px-3 py-2
    text-sm text-[#0F2440]
    placeholder:text-[#94A8BD]
    outline-none transition-all duration-200
    focus:border-[#3182CE]
    focus:ring-2 focus:ring-[#3182CE]/10
    disabled:cursor-not-allowed
    disabled:bg-[#F3F6F9]
    disabled:text-[#64788A]
  `;
  const labelClass = 'mb-1.5 block text-xs font-semibold text-[#34495E]';

  return (
    <div className="min-h-screen bg-[#F3F6FA]">
      <div className="mx-auto w-full max-w-4xl px-3 py-4 sm:px-5 sm:py-6">

        {/* ================= PAGE TITLE ================= */}
        <div className="mb-4 flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-bold text-[#0F2440] sm:text-xl">My Profile</h1>
            <p className="text-xs text-[#64788A]">Manage your personal information</p>
          </div>
        </div>

        {/* ================= ALERTS ================= */}
        {error && (
          <div className="mb-3 flex items-start gap-2 rounded-lg border border-[#F3B5B5] bg-[#FFF5F5] p-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#C53030]" />
            <p className="text-sm text-[#C53030]">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-3 flex items-start gap-2 rounded-lg border border-[#B7E4D8] bg-[#F0FAF7] p-3">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#087F6C]" />
            <p className="text-sm text-[#087F6C]">{success}</p>
          </div>
        )}

        {/* ================= MAIN CARD ================= */}
        <div className="overflow-hidden rounded-xl border border-[#D9E2EC] bg-white shadow-sm">
          {/* Header / Avatar row — more compact */}
          <div className="border-b border-[#E7EDF3] bg-[linear-gradient(120deg,#F8FAFC_0%,#FFFFFF_72%)] px-4 py-4 sm:px-6">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div
                  onClick={handleImageClick}
                  className="
                    group relative h-20 w-20 cursor-pointer overflow-hidden
                    rounded-full border-2 border-white bg-[#EEF5FB] shadow ring-2 ring-white
                    sm:h-24 sm:w-24
                  "
                >
                  {previewImage || freshUser?.profileImageUrl ? (
                    <img
                      src={previewImage || freshUser?.profileImageUrl || ''}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className={`flex h-full w-full items-center justify-center ${getAvatarColor()}`}>
                      <span className="text-2xl font-bold text-white">{getInitials()}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-[#0F2440]/60 opacity-0 transition-opacity group-hover:opacity-100">
                    <Camera className="h-5 w-5 text-white" />
                  </div>
                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#0F2440]/70">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>

              {/* Summary */}
              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 items-center gap-2">
                  <h2 className="min-w-0 truncate text-base font-bold text-[#0F2440] sm:text-lg">
                    {formData.firstName} {formData.lastName}
                  </h2>
                  {!isEditing && (
                    <button
                      type="button"
                      onClick={() => { setIsEditing(true); setError(''); setSuccess(''); }}
                      disabled={isLoading}
                      className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-[#1A365D] px-2.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#153475] disabled:cursor-not-allowed disabled:opacity-50 sm:px-3"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      Edit
                    </button>
                  )}
                </div>
                <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-[#64788A]">
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{formData.email || 'No email'}</span>
                </p>
                {formData.bio && (
                  <p className="mt-1 line-clamp-1 text-xs text-[#64788A]">{formData.bio}</p>
                )}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <button
                    onClick={handleImageClick}
                    disabled={isLoading}
                    className="
                      inline-flex items-center gap-1 rounded-md border border-[#C9D5E1]
                      bg-white px-2.5 py-1 text-[11px] font-semibold text-[#1A365D]
                      transition-all hover:border-[#1A365D] hover:bg-[#F4F7FA]
                      disabled:opacity-50
                    "
                  >
                    <Camera className="h-3 w-3" />
                    {isLoading ? 'Uploading…' : 'Change Photo'}
                  </button>
                  {user?.id && (
                    <Link
                      href={`/dashboard/students/${user.id}`}
                      className="
                        inline-flex items-center gap-1 rounded-md border border-[#C9D5E1]
                        bg-white px-2.5 py-1 text-[11px] font-semibold text-[#1A365D]
                        transition-all hover:border-[#1A365D] hover:bg-[#F4F7FA]
                      "
                    >
                      <Eye className="h-3 w-3" /> Public
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ================= FORM ================= */}
          <div className="p-4 sm:p-6">
            <div className="space-y-6">

              {/* PERSONAL */}
              <section>
                <h3 className="mb-3 text-sm font-bold text-[#0F2440]">Personal Information</h3>
                <div className="grid grid-cols-1 gap-x-4 gap-y-3 md:grid-cols-2">
                  <div>
                    <label htmlFor="firstName" className={labelClass}>First Name</label>
                    <input id="firstName" type="text" name="firstName" value={formData.firstName}
                      disabled className={inputClass} />
                  </div>
                  <div>
                    <label htmlFor="lastName" className={labelClass}>Last Name</label>
                    <input id="lastName" type="text" name="lastName" value={formData.lastName}
                      disabled className={inputClass} />
                    <p className="mt-1 text-[10px] text-[#94A8BD]">
                      Contact an administrator if your name needs to be changed.
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="email" className={labelClass}>
                      <span className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-[#1A365D]" /> Email Address
                      </span>
                    </label>
                    <input id="email" type="email" name="email" value={formData.email} disabled className={inputClass} />
                    <p className="mt-1 text-[10px] text-[#94A8BD]">Email cannot be changed.</p>
                  </div>
                  <div>
                    <label htmlFor="phoneNumber" className={labelClass}>
                      <span className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-[#1A365D]" /> Phone
                      </span>
                    </label>
                    <input id="phoneNumber" type="tel" name="phoneNumber" value={formData.phoneNumber}
                      onChange={handleInputChange} disabled={!isEditing}
                      placeholder="+256 700 000 000" className={inputClass} />
                  </div>
                  <div>
                    <label htmlFor="gender" className={labelClass}>Gender</label>
                    <select id="gender" name="gender" value={formData.gender}
                      onChange={handleInputChange} disabled={!isEditing} className={inputClass}>
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="bio" className={labelClass}>Bio</label>
                    <textarea id="bio" name="bio" rows={3} maxLength={500} value={formData.bio}
                      onChange={handleInputChange} disabled={!isEditing}
                      placeholder="Tell others a little about yourself" className={inputClass} />
                    <p className="mt-1 text-[10px] text-[#94A8BD]">{formData.bio.length}/500</p>
                  </div>
                </div>
              </section>

              {/* LOCATION */}
              <section className="border-t border-[#E7EDF3] pt-5">
                <h3 className="mb-3 text-sm font-bold text-[#0F2440]">Location</h3>
                <div className="grid grid-cols-1 gap-x-4 gap-y-3 md:grid-cols-2">
                  <div>
                    <label htmlFor="country" className={labelClass}>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-[#1A365D]" /> Country
                      </span>
                    </label>
                    <input id="country" type="text" name="country" value={formData.country}
                      onChange={handleInputChange} disabled={!isEditing}
                      placeholder="Uganda" className={inputClass} />
                  </div>
                  <div>
                    <label htmlFor="city" className={labelClass}>City</label>
                    <input id="city" type="text" name="city" value={formData.city}
                      onChange={handleInputChange} disabled={!isEditing}
                      placeholder="Kampala" className={inputClass} />
                  </div>
                  <div>
                    <label htmlFor="town" className={labelClass}>Town</label>
                    <input id="town" type="text" name="town" value={formData.town}
                      onChange={handleInputChange} disabled={!isEditing}
                      placeholder="Makindye" className={inputClass} />
                  </div>
                  <div>
                    <label htmlFor="street" className={labelClass}>Street</label>
                    <input id="street" type="text" name="street" value={formData.street}
                      onChange={handleInputChange} disabled={!isEditing}
                      placeholder="123 Main Street" className={inputClass} />
                  </div>
                </div>
              </section>

              {/* EDUCATION */}
              <section className="border-t border-[#E7EDF3] pt-5">
                <h3 className="mb-3 text-sm font-bold text-[#0F2440]">Education</h3>
                <div>
                  <label htmlFor="generalCourse" className={labelClass}>
                    <span className="flex items-center gap-1.5">
                      <Book className="h-3.5 w-3.5 text-[#1A365D]" /> General Course
                    </span>
                  </label>
                  <input id="generalCourse" type="text" name="generalCourse" value={formData.generalCourse}
                    onChange={handleInputChange} disabled={!isEditing}
                    placeholder="Computer Science" className={inputClass} />
                </div>
              </section>

              {/* PROFESSIONAL */}
              <section className="border-t border-[#E7EDF3] pt-5">
                <h3 className="mb-3 text-sm font-bold text-[#0F2440]">Professional</h3>
                <div className="grid grid-cols-1 gap-x-4 gap-y-3 md:grid-cols-2">
                  <div>
                    <label htmlFor="linkedinUrl" className={labelClass}>LinkedIn</label>
                    <input id="linkedinUrl" type="url" name="linkedinUrl" value={formData.linkedinUrl}
                      onChange={handleInputChange} disabled={!isEditing}
                      placeholder="https://linkedin.com/in/username" className={inputClass} />
                  </div>
                  <div>
                    <label htmlFor="githubUrl" className={labelClass}>GitHub</label>
                    <input id="githubUrl" type="url" name="githubUrl" value={formData.githubUrl}
                      onChange={handleInputChange} disabled={!isEditing}
                      placeholder="https://github.com/username" className={inputClass} />
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="projectUrls" className={labelClass}>Project URLs</label>
                    <input id="projectUrls" type="text" name="projectUrls"
                      value={formData.projectUrls.join(', ')}
                      onChange={handleProjectUrlsChange} disabled={!isEditing}
                      placeholder="https://project1.com, https://project2.com" className={inputClass} />
                    <p className="mt-1 text-[10px] text-[#94A8BD]">Separate multiple URLs with commas.</p>
                  </div>
                </div>
              </section>

              {/* PASSWORD */}
              {isEditing && (
                <section className="border-t border-[#E7EDF3] pt-5">
                  <div className="mb-3 flex items-center gap-2">
                    <Lock className="h-4 w-4 text-[#1A365D]" />
                    <h3 className="text-sm font-bold text-[#0F2440]">Change Password</h3>
                  </div>
                  <p className="mb-3 text-xs text-[#64788A]">Leave empty if you don't want to change it.</p>
                  <div className="grid grid-cols-1 gap-x-4 gap-y-3 md:grid-cols-2">
                    <div>
                      <label htmlFor="currentPassword" className={labelClass}>Current Password</label>
                      <div className="relative">
                        <input id="currentPassword" type={showCurrentPassword ? 'text' : 'password'}
                          name="currentPassword" value={formData.currentPassword}
                          onChange={handleInputChange} placeholder="Current password"
                          className={`${inputClass} pr-10`} />
                        <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-[#94A8BD] hover:text-[#1A365D]">
                          {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="newPassword" className={labelClass}>New Password</label>
                      <div className="relative">
                        <input id="newPassword" type={showNewPassword ? 'text' : 'password'}
                          name="newPassword" value={formData.newPassword}
                          onChange={handleInputChange} placeholder="New password"
                          className={`${inputClass} pr-10`} />
                        <button type="button" onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-[#94A8BD] hover:text-[#1A365D]">
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label htmlFor="confirmPassword" className={labelClass}>Confirm New Password</label>
                      <div className="relative">
                        <input id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'}
                          name="confirmPassword" value={formData.confirmPassword}
                          onChange={handleInputChange} placeholder="Confirm new password"
                          className={`${inputClass} pr-10`} />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-[#94A8BD] hover:text-[#1A365D]">
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* ACTIONS */}
              {isEditing && (
                <div className="flex flex-col-reverse gap-2 border-t border-[#E7EDF3] pt-4 sm:flex-row sm:justify-end">
                  <button onClick={handleCancel} disabled={isLoading}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#C9D5E1]
                      bg-white px-4 py-2 text-sm font-semibold text-[#526678]
                      transition-all hover:border-[#94A8BD] hover:bg-[#F4F7FA] disabled:opacity-50">
                    <X className="h-4 w-4" /> Cancel
                  </button>
                  <button onClick={handleSave} disabled={isLoading}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#1A365D]
                      px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-[#153475] disabled:opacity-50">
                    {isLoading ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Saving…
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" /> Save Changes
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* ACCOUNT INFO */}
              <section className="border-t border-[#E7EDF3] pt-5">
                <h3 className="mb-3 text-sm font-bold text-[#0F2440]">Account</h3>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <div className="rounded-lg border border-[#E7EDF3] bg-[#F8FAFC] p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-[#94A8BD]">Role</p>
                    <p className="mt-1 text-sm font-semibold capitalize text-[#0F2440]">
                      {user?.role === 'teacher' ? 'Tutor'
                        : user?.role === 'admin' ? 'Manager'
                          : user?.role === 'super_admin' || user?.role === 'superadmin' ? 'Director'
                            : user?.role?.replace('_', ' ') || 'Student'}
                    </p>
                  </div>
                  <div className="rounded-lg border border-[#E7EDF3] bg-[#F8FAFC] p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-[#94A8BD]">Student ID</p>
                    <p className="mt-1 truncate text-sm font-semibold text-[#0F2440]" title={user?.id || 'N/A'}>
                      {user?.id || 'N/A'}
                    </p>
                  </div>
                  <div className="rounded-lg border border-[#B7E4D8] bg-[#F0FAF7] p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-[#087F6C]">Status</p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#087F6C]" />
                      <p className="text-sm font-semibold text-[#087F6C]">Active</p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>

        {/* ================= GALLERY ================= */}
        <section id="profile-gallery" className="mt-4 rounded-xl border border-[#D9E2EC] bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-4 flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-[#1A365D]" />
            <h2 className="text-sm font-bold text-[#0F2440]">Profile Gallery</h2>
          </div>
          <p className="mb-3 text-xs text-[#64788A]">
            Upload photos to your gallery. Click "Set as Profile" on any photo to make it your profile image.
          </p>

          <AzureMediaUpload
            accept="image/jpeg,image/png,image/gif,image/webp,image/avif"
            allowAudio={false}
            allowVideo={false}
            allowMultiple={false}
            categoryLocked
            defaultCategory="profile"
            label="Add a photo to your profile gallery"
            submitLabel="Add photo"
          />

          <div className="mt-5 border-t border-[#E7EDF3] pt-4">
            <h3 className="mb-3 text-xs font-bold text-[#0F2440]">Your uploaded photos</h3>
            {loadingFreshUser ? (
              <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="overflow-hidden rounded-lg border border-[#dfe5ec] bg-white shadow-sm">
                    <div className="aspect-square animate-pulse bg-slate-200" />
                    <div className="p-2"><div className="h-3 w-16 animate-pulse rounded bg-slate-200" /></div>
                  </div>
                ))}
              </div>
            ) : freshUser?.profileImageUrls && freshUser.profileImageUrls.length > 0 ? (
              <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
                {freshUser.profileImageUrls.map((url, index) => (
                  <div key={url} className="overflow-hidden rounded-lg border border-[#dfe5ec] bg-white shadow-sm">
                    <div className="relative aspect-square bg-slate-100">
                      <Image src={url} alt={`Profile photo ${index + 1}`} fill className="object-cover"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" />
                      {url === freshUser.profileImageUrl && (
                        <div className="absolute top-1.5 right-1.5 rounded-full bg-green-500 px-1.5 py-0.5 text-[9px] font-semibold text-white">
                          Current
                        </div>
                      )}
                    </div>
                    <div className="p-2">
                      {url !== freshUser.profileImageUrl ? (
                        <div className="flex flex-col gap-1">
                          <button type="button" onClick={() => handleSetProfileImage(url)}
                            disabled={isLoading || settingImageUrl === url}
                            className="inline-flex items-center justify-center gap-1 rounded bg-blue-50 px-2 py-1 text-[10px] font-medium text-blue-700 hover:bg-blue-100 disabled:cursor-wait disabled:opacity-60">
                            {settingImageUrl === url ? (
                              <>
                                <Loader2 className="h-3 w-3 animate-spin" />
                                Changing profile image…
                              </>
                            ) : (
                              'Set as Profile'
                            )}
                          </button>
                          <button type="button" onClick={() => handleDeleteProfileImage(url)}
                            disabled={deletingImage === url}
                            className="rounded bg-red-50 px-2 py-1 text-[10px] font-medium text-red-700 hover:bg-red-100 disabled:opacity-50">
                            {deletingImage === url ? 'Deleting…' : 'Delete'}
                          </button>
                        </div>
                      ) : (
                        <span className="block text-center text-[10px] font-medium text-green-600">Current</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center">
                <ImageIcon className="mx-auto mb-2 h-6 w-6 text-slate-400" />
                <p className="text-xs font-medium text-slate-700">No profile photos uploaded yet</p>
                <p className="mt-0.5 text-[10px] text-slate-500">Upload a photo above to get started</p>
              </div>
            )}
          </div>
        </section>

        <p className="mt-4 text-center text-[10px] text-[#94A8BD]">
          Keep your profile information accurate so your community can identify you easily.
        </p>
      </div>

    </div>
  );
}