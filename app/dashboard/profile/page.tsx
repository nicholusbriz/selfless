'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { motion } from 'framer-motion';
import { User, Mail, Shield, Settings, Edit, Camera, Award, Calendar, ArrowLeft, Phone, X, MessageSquare, MapPin, BookOpen, Building2, Link, Plus, Upload } from 'lucide-react';
import axios from '@/lib/axios';
import LoadingState from '@/components/shared/LoadingState';
import ErrorState from '@/components/shared/ErrorState';
import { uploadProfileImage, deleteProfileImage } from '@/lib/supabase';
import UserAvatar from '@/components/shared/UserAvatar';
import { useQueryClient } from '@tanstack/react-query';

export default function ProfilePage() {
  const { user, fetchUser, setAuth } = useAuthStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [viewingUserId, setViewingUserId] = useState<string | null>(null);
  const [viewedUser, setViewedUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    country: '',
    city: '',
    town: '',
    street: '',
    generalCourse: '',
    techCenter: '',
    linkedinUrl: '',
    githubUrl: '',
    projectUrls: [] as string[],
    profileImageUrl: ''
  });
  const [newProjectUrl, setNewProjectUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleEdit = () => {
    setEditForm({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phoneNumber: user?.phoneNumber || '',
      country: user?.country || 'Uganda',
      city: user?.city || '',
      town: user?.town || '',
      street: user?.street || '',
      generalCourse: user?.generalCourse || '',
      techCenter: user?.techCenter || 'Freedom City Tech Center',
      linkedinUrl: user?.linkedinUrl || '',
      githubUrl: user?.githubUrl || '',
      projectUrls: user?.projectUrls || [],
      profileImageUrl: user?.profileImageUrl || ''
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // Delete old image if exists and uploading new one
      if (imageFile && user?.profileImageUrl) {
        try {
          await deleteProfileImage(user.profileImageUrl);
        } catch (error) {
          console.error('Failed to delete old image:', error);
          // Continue with upload even if delete fails
        }
      }
      
      // Upload image if there's a new one
      let imageUrl = editForm.profileImageUrl;
      if (imageFile && user?.id) {
        try {
          imageUrl = await uploadProfileImage(imageFile, user.id);
          setEditForm({ ...editForm, profileImageUrl: imageUrl });
        } catch (error) {
          console.error('Image upload failed:', error);
          setError('Failed to upload image');
          return;
        }
      }
      
      const response = await axios.put('/api/user/profile', {
        ...editForm,
        profileImageUrl: imageUrl
      });
      
      if (response.data.success) {
        // Update local user state
        setAuth(response.data.user);
        // Refresh user data to ensure profileImageUrl is loaded
        await fetchUser();
        // Invalidate teacher-assignments and all-teachers queries to refresh assigned students tab
        queryClient.invalidateQueries({ queryKey: ['teacher-assignments'] });
        queryClient.invalidateQueries({ queryKey: ['all-teachers'] });
        // Invalidate student profile queries
        queryClient.invalidateQueries({ queryKey: ['student'] });
        setIsEditing(false);
        setImageFile(null);
        setImagePreview(null);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phoneNumber: user?.phoneNumber || '',
      country: user?.country || 'Uganda',
      city: user?.city || '',
      town: user?.town || '',
      street: user?.street || '',
      generalCourse: user?.generalCourse || '',
      techCenter: user?.techCenter || 'Freedom City Tech Center',
      linkedinUrl: user?.linkedinUrl || '',
      githubUrl: user?.githubUrl || '',
      projectUrls: user?.projectUrls || [],
      profileImageUrl: user?.profileImageUrl || ''
    });
    setNewProjectUrl('');
    setImageFile(null);
    setImagePreview(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
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
      setImageFile(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      setError(null);
    }
  };

  const addProjectUrl = () => {
    if (newProjectUrl.trim()) {
      setEditForm({
        ...editForm,
        projectUrls: [...editForm.projectUrls, newProjectUrl.trim()]
      });
      setNewProjectUrl('');
    }
  };

  const removeProjectUrl = (index: number) => {
    setEditForm({
      ...editForm,
      projectUrls: editForm.projectUrls.filter((_, i) => i !== index)
    });
  };

  const handleBack = () => {
    const from = searchParams.get('from');
    if (from === 'students') {
      router.push('/dashboard/overview?tab=students');
    } else {
      router.push('/dashboard/overview');
    }
  };

  // Check if viewing another user's profile
  useEffect(() => {
    const userId = searchParams.get('id');
    if (userId && userId !== user?.id) {
      setViewingUserId(userId);
      fetchUserProfile(userId);
    } else {
      setViewingUserId(null);
      setViewedUser(null);
    }
  }, [searchParams, user?.id]);

  const fetchUserProfile = async (userId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get(`/api/students/${userId}`);
      setViewedUser(response.data.student);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user && !viewingUserId) {
      fetchUser();
    }
  }, [user, viewingUserId, fetchUser]);

  // Determine which user to display
  const displayUser = viewedUser || user;
  const isViewingOther = !!viewingUserId;

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  if (!displayUser) return <ErrorState message="Profile not found" />;

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Header Section */}
      <motion.div 
        className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-lg rounded-2xl p-6 sm:p-8 border border-white/20"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center gap-4 mb-4">
          {isViewingOther && (
            <>
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm">Back</span>
              </button>
              <button
                onClick={() => router.push('/dashboard/overview?tab=messages')}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg text-blue-300 text-sm font-medium transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Message</span>
              </button>
            </>
          )}
          <motion.h1 
            className="text-2xl sm:text-3xl font-bold text-white"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {isViewingOther ? 'Student Profile' : 'Profile'}
          </motion.h1>
        </div>
        <motion.p 
          className="text-gray-300 text-sm sm:text-base"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {isViewingOther ? 'View student information' : 'View and manage your profile information'}
        </motion.p>
        {!isViewingOther && !isEditing && (
          <motion.p 
            className="text-purple-300 text-sm mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            Click on "Edit Profile" to update your profile picture and profile information
          </motion.p>
        )}
      </motion.div>

      {displayUser && (
        <>
          {/* Profile Card */}
          <motion.div
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 sm:p-8 border border-white/20"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="flex flex-col md:flex-row items-center md:items-start gap-4 sm:gap-6">
              {/* Avatar */}
              <motion.div 
                className="relative"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                {imagePreview ? (
                  <img 
                    src={imagePreview} 
                    alt="Profile Preview" 
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover shadow-lg"
                  />
                ) : (
                  <UserAvatar 
                    user={displayUser} 
                    size="lg"
                  />
                )}
                {!isViewingOther && isEditing && (
                  <>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="profile-image-input"
                    />
                    <motion.button 
                      onClick={() => document.getElementById('profile-image-input')?.click()}
                      className="absolute bottom-0 right-0 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white shadow-lg"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Camera className="w-4 h-4" />
                    </motion.button>
                  </>
                )}
              </motion.div>

              {/* User Info */}
              <div className="flex-1 text-center md:text-left">
                <motion.h2 
                  className="text-xl sm:text-2xl font-bold text-white mb-1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  {displayUser.firstName} {displayUser.lastName}
                </motion.h2>
                <motion.p 
                  className="text-gray-400 text-sm sm:text-base mb-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                >
                  {displayUser.phoneNumber || 'No phone number'}
                </motion.p>
                <motion.div 
                  className="flex flex-wrap gap-2 justify-center md:justify-start"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                >
                  <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm border border-purple-500/30">
                    {displayUser.role?.name || 'Volunteer'}
                  </span>
                  <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm border border-green-500/30">
                    Active
                  </span>
                </motion.div>
              </div>

              {/* Edit Button */}
              {!isViewingOther && !isEditing && (
                <motion.button
                  onClick={handleEdit}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium flex items-center space-x-2 text-sm sm:text-base"
                  whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(168, 85, 247, 0.5)" }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.9 }}
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit Profile</span>
                </motion.button>
              )}
              {isEditing && (
                <div className="flex gap-2">
                  <motion.button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium flex items-center space-x-2 text-sm sm:text-base disabled:opacity-50"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span>{isSaving ? 'Saving...' : 'Save'}</span>
                  </motion.button>
                  <motion.button
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg font-medium flex items-center space-x-2 text-sm sm:text-base disabled:opacity-50"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>

          {/* User Details */}
          <motion.div
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 sm:p-6 border border-white/20"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          >
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6 flex items-center">
              <User className="w-5 h-5 mr-2 text-purple-400" />
              User Information
            </h3>
            
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">First Name</label>
                  <input
                    type="text"
                    value={editForm.firstName}
                    onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Last Name</label>
                  <input
                    type="text"
                    value={editForm.lastName}
                    onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Phone Number</label>
                  <input
                    type="text"
                    value={editForm.phoneNumber}
                    onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="border-t border-white/10 pt-4 mt-4">
                  <h4 className="text-white font-medium mb-3">Location Information</h4>
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Country</label>
                  <select
                    value={editForm.country}
                    onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="Uganda">Uganda</option>
                    <option value="Liberia">Liberia</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">City</label>
                  <input
                    type="text"
                    value={editForm.city}
                    onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                    placeholder="Enter city"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Town</label>
                  <input
                    type="text"
                    value={editForm.town}
                    onChange={(e) => setEditForm({ ...editForm, town: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                    placeholder="Enter town"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Street</label>
                  <input
                    type="text"
                    value={editForm.street}
                    onChange={(e) => setEditForm({ ...editForm, street: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                    placeholder="Enter street address"
                  />
                </div>
                <div className="border-t border-white/10 pt-4 mt-4">
                  <h4 className="text-white font-medium mb-3">Academic Information</h4>
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">General Course</label>
                  <input
                    type="text"
                    value={editForm.generalCourse}
                    onChange={(e) => setEditForm({ ...editForm, generalCourse: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                    placeholder="Enter your general course"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Tech Center</label>
                  <input
                    type="text"
                    value={editForm.techCenter}
                    onChange={(e) => setEditForm({ ...editForm, techCenter: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                    placeholder="Enter tech center"
                  />
                </div>
                <div className="border-t border-white/10 pt-4 mt-4">
                  <h4 className="text-white font-medium mb-3">Social Links</h4>
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">LinkedIn URL</label>
                  <input
                    type="text"
                    value={editForm.linkedinUrl}
                    onChange={(e) => setEditForm({ ...editForm, linkedinUrl: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">GitHub URL</label>
                  <input
                    type="text"
                    value={editForm.githubUrl}
                    onChange={(e) => setEditForm({ ...editForm, githubUrl: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                    placeholder="https://github.com/yourusername"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Project URLs</label>
                  <div className="space-y-2">
                    {editForm.projectUrls.map((url, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={url}
                          readOnly
                          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => removeProjectUrl(index)}
                          className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newProjectUrl}
                        onChange={(e) => setNewProjectUrl(e.target.value)}
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                        placeholder="Add project URL"
                      />
                      <button
                        type="button"
                        onClick={addProjectUrl}
                        className="px-3 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                {[
                  { icon: User, label: "Full Name", value: `${displayUser.firstName} ${displayUser.lastName}` },
                  { icon: Phone, label: "Phone Number", value: displayUser.phoneNumber || 'Not provided' },
                  { icon: MapPin, label: "Country", value: displayUser.country || 'Not provided' },
                  { icon: MapPin, label: "City", value: displayUser.city || 'Not provided' },
                  { icon: MapPin, label: "Town", value: displayUser.town || 'Not provided' },
                  { icon: MapPin, label: "Street", value: displayUser.street || 'Not provided' },
                  { icon: BookOpen, label: "General Course", value: displayUser.generalCourse || 'Not provided' },
                  { icon: Building2, label: "Tech Center", value: displayUser.techCenter || 'Not provided' },
                  { icon: Link, label: "LinkedIn", value: displayUser.linkedinUrl || 'Not provided' },
                  { icon: Link, label: "GitHub", value: displayUser.githubUrl || 'Not provided' },
                  { icon: Shield, label: "Role", value: displayUser.role?.name || 'N/A' },
                  { icon: Award, label: "Status", value: "Active" }
                ].map((item, index) => (
                <motion.div
                  key={index}
                  className="bg-white/5 rounded-xl p-4 border border-white/10"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1.1 + index * 0.1 }}
                  whileHover={{ scale: 1.02, borderColor: "rgba(168, 85, 247, 0.3)" }}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <item.icon className="w-4 h-4 text-purple-400" />
                    <label className="text-gray-400 text-sm">{item.label}</label>
                  </div>
                  <p className="text-white font-medium break-all">{item.value}</p>
                </motion.div>
              ))}
              {displayUser.projectUrls && displayUser.projectUrls.length > 0 && (
                <motion.div
                  className="bg-white/5 rounded-xl p-4 border border-white/10 sm:col-span-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1.3 }}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <Link className="w-4 h-4 text-purple-400" />
                    <label className="text-gray-400 text-sm">Project URLs</label>
                  </div>
                  <div className="space-y-1">
                    {displayUser.projectUrls.map((url: string, index: number) => (
                      <p key={index} className="text-white font-medium break-all text-sm">{url}</p>
                    ))}
                  </div>
                </motion.div>
              )}
              </div>
            )}
          </motion.div>

          {!isViewingOther && (
            <motion.div
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 sm:p-6 border border-white/20"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.5 }}
            >
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6 flex items-center">
                <Settings className="w-5 h-5 mr-2 text-purple-400" />
                Profile Settings
              </h3>
              <div className="space-y-4">
                {[
                  { label: "Change Password", icon: Shield },
                  { label: "Notification Preferences", icon: Mail },
                  { label: "Privacy Settings", icon: User }
                ].map((setting, index) => (
                <motion.button
                  key={index}
                  className="w-full bg-white/5 rounded-xl p-4 border border-white/10 flex items-center justify-between hover:bg-white/10 transition-all duration-300"
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 1.6 + index * 0.1 }}
                >
                  <div className="flex items-center space-x-3">
                    <setting.icon className="w-5 h-5 text-purple-400" />
                    <span className="text-white">{setting.label}</span>
                  </div>
                  <span className="text-gray-400">→</span>
                </motion.button>
              ))}
            </div>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
}
