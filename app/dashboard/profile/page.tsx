// app/dashboard/profile/page.tsx
'use client';

import { useState, useRef } from 'react';
import { ArrowLeft, User, Camera, Mail, Lock, Edit2, Save, X, Check, AlertCircle, MapPin, Phone, Book, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { uploadProfileImage, deleteProfileImage } from '@/lib/supabase';
import axios from 'axios';

export default function ProfilePage() {
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Password visibility toggles
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    country: user?.country || '',
    city: user?.city || '',
    town: user?.town || '',
    street: user?.street || '',
    generalCourse: user?.generalCourse || '',
    linkedinUrl: user?.linkedinUrl || '',
    githubUrl: user?.githubUrl || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    // Show preview immediately for live feel
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload image
    try {
      setIsLoading(true);
      setError('');
      
      // Delete old image if exists
      if (user?.profileImageUrl) {
        await deleteProfileImage(user.profileImageUrl);
      }

      // Upload new image
      const imageUrl = await uploadProfileImage(file, user?.id || '');

      // Update user profile with new image URL (this will update the session)
      await updateUser({ profileImageUrl: imageUrl });
      
      setSuccess('Profile image updated successfully');
      
      // Clear preview - the session update will refresh the user data with new image
      setPreviewImage(null);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile image');
      setPreviewImage(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Validate password change if provided
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

        // Change password via API
        const passwordResponse = await axios.post('/api/user/change-password', {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        });

        if (passwordResponse.status !== 200) {
          setError(passwordResponse.data.error || 'Failed to change password');
          return;
        }
      }

      // Update user profile
      await updateUser({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        country: formData.country,
        city: formData.city,
        town: formData.town,
        street: formData.street,
        generalCourse: formData.generalCourse,
        linkedinUrl: formData.linkedinUrl,
        githubUrl: formData.githubUrl,
      });

      setSuccess('Profile updated successfully');
      setIsEditing(false);

      // Clear password fields
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
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
      country: user?.country || '',
      city: user?.city || '',
      town: user?.town || '',
      street: user?.street || '',
      generalCourse: user?.generalCourse || '',
      linkedinUrl: user?.linkedinUrl || '',
      githubUrl: user?.githubUrl || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setError('');
    setSuccess('');
    setPreviewImage(null);
  };

  const getInitials = () => {
    const first = formData.firstName.charAt(0).toUpperCase();
    const last = formData.lastName.charAt(0).toUpperCase();
    return first + last;
  };

  const getAvatarColor = () => {
    const colors = [
      'from-[#E8A33D] to-[#C97F1F]',
      'from-[#14B8A6] to-[#0D9488]',
      'from-[#FB7185] to-[#E11D48]',
      'from-[#6366F1] to-[#4F46E5]',
      'from-[#34D399] to-[#059669]',
      'from-[#F59E0B] to-[#D97706]',
      'from-[#8B5CF6] to-[#7C3AED]',
      'from-[#EC4899] to-[#BE185D]',
    ];
    const hash = formData.firstName.charCodeAt(0) + formData.lastName.charCodeAt(0);
    return colors[Math.abs(hash) % colors.length];
  };

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
        
        <div className="h-8 w-px bg-[#2A2438]" />
        
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#E8A33D]/20 to-[#C97F1F]/10 border border-[#E8A33D]/20">
            <User className="w-6 h-6 text-[#E8A33D]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#F5F0E8]" style={{ fontFamily: 'var(--font-display)' }}>
              My Profile
            </h1>
            <p className="text-sm text-[#A79C8C]">View and manage your personal information</p>
          </div>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-6 p-4 bg-[#FB7185]/10 border border-[#FB7185]/30 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-[#FB7185]" />
          <p className="text-sm text-[#FB7185]">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-[#2FA88A]/10 border border-[#2FA88A]/30 rounded-xl flex items-center gap-3">
          <Check className="w-5 h-5 text-[#2FA88A]" />
          <p className="text-sm text-[#2FA88A]">{success}</p>
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-[#150F20] border border-[#2A2438] rounded-2xl p-6 md:p-8">
        {/* Profile Image Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative group cursor-pointer" onClick={handleImageClick}>
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-[#2A2438] shadow-2xl">
              {previewImage || user?.profileImageUrl ? (
                <img
                  src={previewImage || user?.profileImageUrl || ''}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className={`w-full h-full bg-gradient-to-br ${getAvatarColor()} flex items-center justify-center`}>
                  <span className="text-4xl md:text-5xl font-bold text-[#0B0912]">
                    {getInitials()}
                  </span>
                </div>
              )}
            </div>
            
            {/* Camera Overlay */}
            <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
              <Camera className="w-8 h-8 text-white" />
            </div>

            {isLoading && (
              <div className="absolute inset-0 rounded-full bg-black/70 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-[#E8A33D] border-t-transparent rounded-full animate-spin" />
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

          {/* Edit Profile Image Button */}
          <button
            onClick={handleImageClick}
            disabled={isLoading}
            className="mt-4 px-4 py-2 bg-gradient-to-r from-[#E8A33D] to-[#C97F1F] text-[#0B0912] font-semibold rounded-lg hover:from-[#F2C879] hover:to-[#E8A33D] transition-all duration-300 flex items-center gap-2 shadow-lg shadow-[#E8A33D]/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Camera className="w-4 h-4" />
            <span>{isLoading ? 'Uploading...' : 'Edit Profile Image'}</span>
          </button>
          
          <p className="mt-2 text-xs text-[#6B6358]">Max size: 5MB • JPG, PNG, GIF</p>
        </div>

        {/* Profile Information */}
        <div className="space-y-6">
          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#E8A33D] to-[#C97F1F] text-[#0B0912] rounded-lg font-medium hover:shadow-lg hover:shadow-[#E8A33D]/20 transition-all duration-200"
              >
                <Edit2 className="w-4 h-4" />
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-4 py-2 bg-[#2A2438] text-[#A79C8C] rounded-lg font-medium hover:bg-[#3A3448] hover:text-[#F5F0E8] transition-all duration-200"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#2FA88A] to-[#45C7A6] text-[#0B0912] rounded-lg font-medium hover:shadow-lg hover:shadow-[#2FA88A]/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[#0B0912] border-t-transparent rounded-full animate-spin" />
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
            )}
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-[#A79C8C] mb-2">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-4 py-3 bg-[#0B0912] border border-[#2A2438] rounded-lg text-[#F5F0E8] focus:outline-none focus:border-[#E8A33D] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-[#A79C8C] mb-2">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-4 py-3 bg-[#0B0912] border border-[#2A2438] rounded-lg text-[#F5F0E8] focus:outline-none focus:border-[#E8A33D] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              />
            </div>

            {/* Email - Disabled and not editable */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#A79C8C] mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={true}
                className="w-full px-4 py-3 bg-[#0B0912] border border-[#2A2438] rounded-lg text-[#6B6358] cursor-not-allowed transition-all duration-200"
              />
              <p className="mt-1 text-xs text-[#6B6358]">Email cannot be changed</p>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-[#A79C8C] mb-2 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Phone Number
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="+256 700 000 000"
                className="w-full px-4 py-3 bg-[#0B0912] border border-[#2A2438] rounded-lg text-[#F5F0E8] focus:outline-none focus:border-[#E8A33D] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              />
            </div>

            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-[#A79C8C] mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Country
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Uganda"
                className="w-full px-4 py-3 bg-[#0B0912] border border-[#2A2438] rounded-lg text-[#F5F0E8] focus:outline-none focus:border-[#E8A33D] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              />
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-[#A79C8C] mb-2">
                City
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Kampala"
                className="w-full px-4 py-3 bg-[#0B0912] border border-[#2A2438] rounded-lg text-[#F5F0E8] focus:outline-none focus:border-[#E8A33D] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              />
            </div>

            {/* Town */}
            <div>
              <label className="block text-sm font-medium text-[#A79C8C] mb-2">
                Town
              </label>
              <input
                type="text"
                name="town"
                value={formData.town}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Makindye"
                className="w-full px-4 py-3 bg-[#0B0912] border border-[#2A2438] rounded-lg text-[#F5F0E8] focus:outline-none focus:border-[#E8A33D] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              />
            </div>

            {/* Street */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#A79C8C] mb-2">
                Street Address
              </label>
              <input
                type="text"
                name="street"
                value={formData.street}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="123 Main Street"
                className="w-full px-4 py-3 bg-[#0B0912] border border-[#2A2438] rounded-lg text-[#F5F0E8] focus:outline-none focus:border-[#E8A33D] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              />
            </div>

            {/* General Course */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#A79C8C] mb-2 flex items-center gap-2">
                <Book className="w-4 h-4" />
                General Course
              </label>
              <input
                type="text"
                name="generalCourse"
                value={formData.generalCourse}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Computer Science"
                className="w-full px-4 py-3 bg-[#0B0912] border border-[#2A2438] rounded-lg text-[#F5F0E8] focus:outline-none focus:border-[#E8A33D] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              />
            </div>

            {/* LinkedIn URL */}
            <div>
              <label className="block text-sm font-medium text-[#A79C8C] mb-2">
                LinkedIn Profile
              </label>
              <input
                type="url"
                name="linkedinUrl"
                value={formData.linkedinUrl}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="https://linkedin.com/in/username"
                className="w-full px-4 py-3 bg-[#0B0912] border border-[#2A2438] rounded-lg text-[#F5F0E8] focus:outline-none focus:border-[#E8A33D] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              />
            </div>

            {/* GitHub URL */}
            <div>
              <label className="block text-sm font-medium text-[#A79C8C] mb-2">
                GitHub Profile
              </label>
              <input
                type="url"
                name="githubUrl"
                value={formData.githubUrl}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="https://github.com/username"
                className="w-full px-4 py-3 bg-[#0B0912] border border-[#2A2438] rounded-lg text-[#F5F0E8] focus:outline-none focus:border-[#E8A33D] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              />
            </div>

            {/* Password Change Section */}
            {isEditing && (
              <>
                <div className="md:col-span-2 pt-4 border-t border-[#2A2438]">
                  <h3 className="text-lg font-semibold text-[#F5F0E8] mb-4 flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    Change Password
                  </h3>
                </div>

                {/* Current Password with Toggle */}
                <div>
                  <label className="block text-sm font-medium text-[#A79C8C] mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleInputChange}
                      placeholder="Enter current password"
                      className="w-full px-4 py-3 bg-[#0B0912] border border-[#2A2438] rounded-lg text-[#F5F0E8] focus:outline-none focus:border-[#E8A33D] transition-all duration-200 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A79C8C] hover:text-[#F5F0E8] transition-colors duration-200"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* New Password with Toggle */}
                <div>
                  <label className="block text-sm font-medium text-[#A79C8C] mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      placeholder="Enter new password"
                      className="w-full px-4 py-3 bg-[#0B0912] border border-[#2A2438] rounded-lg text-[#F5F0E8] focus:outline-none focus:border-[#E8A33D] transition-all duration-200 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A79C8C] hover:text-[#F5F0E8] transition-colors duration-200"
                    >
                      {showNewPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password with Toggle */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[#A79C8C] mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm new password"
                      className="w-full px-4 py-3 bg-[#0B0912] border border-[#2A2438] rounded-lg text-[#F5F0E8] focus:outline-none focus:border-[#E8A33D] transition-all duration-200 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A79C8C] hover:text-[#F5F0E8] transition-colors duration-200"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Account Info */}
          <div className="pt-6 border-t border-[#2A2438]">
            <h3 className="text-sm font-medium text-[#6B6358] mb-3">Account Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-[#6B6358]">Role</p>
                <p className="text-[#F5F0E8] font-medium capitalize">
                  {user?.role?.replace('_', ' ') || 'Student'}
                </p>
              </div>
              <div>
                <p className="text-[#6B6358]">Student ID</p>
                <p className="text-[#F5F0E8] font-medium">
                  {user?.id || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-[#6B6358]">Status</p>
                <p className="text-[#2FA88A] font-medium">Active</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}