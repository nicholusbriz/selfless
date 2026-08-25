// app/dashboard/profile/page.tsx
'use client';

import { useState, useRef } from 'react';
import {
  ArrowLeft,
  User,
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
  BookOpen,
  Calendar,
  Users,
  Home,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import {
  uploadProfileImage,
  deleteProfileImage,
} from '@/lib/supabase';
import Link from 'next/link';

export default function ProfilePage() {
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

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
    gender: user?.gender || '',
    projectUrls: user?.projectUrls || [],
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  /* ============================================================
     IMAGE
  ============================================================ */

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];

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
      setPreviewImage(reader.result as string);
    };

    reader.readAsDataURL(file);

    try {
      setIsLoading(true);
      setError('');
      setSuccess('');

      if (user?.profileImageUrl) {
        await deleteProfileImage(user.profileImageUrl);
      }

      const imageUrl = await uploadProfileImage(
        file,
        user?.id || '',
      );

      await updateUser({
        profileImageUrl: imageUrl,
      });

      setSuccess('Profile image updated successfully');
      setPreviewImage(null);
    } catch (err: any) {
      setError(
        err.message || 'Failed to update profile image',
      );
      setPreviewImage(null);
    } finally {
      setIsLoading(false);
    }
  };

  /* ============================================================
     FORM
  ============================================================ */

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleProjectUrlsChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const urls = e.target.value
      .split(',')
      .map((url) => url.trim())
      .filter((url) => url.length > 0);

    setFormData({
      ...formData,
      projectUrls: urls,
    });
  };

  /* ============================================================
     SAVE
  ============================================================ */

  const handleSave = async () => {
    try {
      setIsLoading(true);
      setError('');
      setSuccess('');

      if (formData.newPassword) {
        if (!formData.currentPassword) {
          setError(
            'Current password is required to change password',
          );
          return;
        }

        if (
          formData.newPassword !==
          formData.confirmPassword
        ) {
          setError('New passwords do not match');
          return;
        }

        if (formData.newPassword.length < 6) {
          setError(
            'New password must be at least 6 characters',
          );
          return;
        }

        const passwordResponse = await fetch(
          '/api/user/change-password',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              currentPassword: formData.currentPassword,
              newPassword: formData.newPassword,
            }),
          },
        );

        const passwordData =
          await passwordResponse.json();

        if (!passwordResponse.ok) {
          setError(
            passwordData.error ||
              'Failed to change password',
          );
          return;
        }
      }

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
        gender: formData.gender,
        projectUrls: formData.projectUrls,
      });

      setSuccess('Profile updated successfully');
      setIsEditing(false);

      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err: any) {
      setError(
        err.message || 'Failed to update profile',
      );
    } finally {
      setIsLoading(false);
    }
  };

  /* ============================================================
     CANCEL
  ============================================================ */

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

  /* ============================================================
     AVATAR
  ============================================================ */

  const getInitials = () => {
    const first = formData.firstName
      .charAt(0)
      .toUpperCase();

    const last = formData.lastName
      .charAt(0)
      .toUpperCase();

    return first + last;
  };

  const getAvatarColor = () => {
    const colors = [
      'bg-[#1A365D]',
      'bg-[#3182CE]',
      'bg-[#087F6C]',
      'bg-[#6842C2]',
      'bg-[#C85B00]',
      'bg-[#087C95]',
    ];

    const hash =
      formData.firstName.charCodeAt(0) +
      formData.lastName.charCodeAt(0);

    return colors[Math.abs(hash) % colors.length];
  };

  /* ============================================================
     INPUT CLASS
  ============================================================ */

  const inputClass = `
    w-full rounded-xl border border-[#D9E2EC]
    bg-white px-4 py-3
    text-sm text-[#0F2440]
    placeholder:text-[#94A8BD]
    outline-none
    transition-all duration-200
    focus:border-[#3182CE]
    focus:ring-4 focus:ring-[#3182CE]/10
    disabled:cursor-not-allowed
    disabled:bg-[#F3F6F9]
    disabled:text-[#64788A]
  `;

  const labelClass = `
    mb-2 block text-sm font-semibold text-[#34495E]
  `;

  return (
    <div className="min-h-screen bg-[#F6F8FB]">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">

        {/* ======================================================
            HEADER
        ====================================================== */}

        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-2">

            <button
              onClick={() => router.back()}
              className="
                flex h-10 w-10 items-center justify-center
                rounded-lg border border-[#D9E2EC]
                bg-white text-[#64788A]
                transition-all duration-200
                hover:border-[#1A365D]
                hover:bg-[#F4F7FA]
                hover:text-[#1A365D]
              "
              aria-label="Go back"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            <Link
              href="/dashboard"
              className="
                flex h-10 w-10 items-center justify-center
                rounded-lg border border-[#D9E2EC]
                bg-white text-[#64788A]
                transition-all duration-200
                hover:border-[#1A365D]
                hover:bg-[#F4F7FA]
                hover:text-[#1A365D]
              "
              aria-label="Go to dashboard"
            >
              <Home className="h-4 w-4" />
            </Link>

            <Link
              href="/dashboard/courses"
              className="
                flex h-10 w-10 items-center justify-center
                rounded-lg border border-[#D9E2EC]
                bg-white text-[#64788A]
                transition-all duration-200
                hover:border-[#1A365D]
                hover:bg-[#F4F7FA]
                hover:text-[#1A365D]
              "
              aria-label="Go to courses"
            >
              <BookOpen className="h-4 w-4" />
            </Link>

            <Link
              href="/dashboard/cleaning"
              className="
                flex h-10 w-10 items-center justify-center
                rounded-lg border border-[#D9E2EC]
                bg-white text-[#64788A]
                transition-all duration-200
                hover:border-[#1A365D]
                hover:bg-[#F4F7FA]
                hover:text-[#1A365D]
              "
              aria-label="Go to cleaning schedule"
            >
              <Calendar className="h-4 w-4" />
            </Link>

            <Link
              href="/dashboard/students"
              className="
                flex h-10 w-10 items-center justify-center
                rounded-lg border border-[#D9E2EC]
                bg-white text-[#64788A]
                transition-all duration-200
                hover:border-[#1A365D]
                hover:bg-[#F4F7FA]
                hover:text-[#1A365D]
              "
              aria-label="Go to students"
            >
              <Users className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-6 flex items-start gap-4">
            <div
              className="
                flex h-12 w-12 shrink-0 items-center
                justify-center rounded-xl
                border border-[#D9E2EC]
                bg-white text-[#1A365D]
                shadow-sm
              "
            >
              <User className="h-6 w-6" />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#64788A]">
                Account
              </p>

              <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#0F2440] sm:text-3xl">
                My Profile
              </h1>

              <p className="mt-1 text-sm text-[#64788A]">
                View and manage your personal information.
              </p>
            </div>
          </div>
        </div>

        {/* ======================================================
            ALERTS
        ====================================================== */}

        {error && (
          <div
            className="
              mb-5 flex items-start gap-3 rounded-xl
              border border-[#F3B5B5]
              bg-[#FFF5F5] p-4
            "
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FDE8E8]">
              <AlertCircle className="h-4 w-4 text-[#C53030]" />
            </div>

            <div>
              <p className="text-sm font-semibold text-[#9B2C2C]">
                Something went wrong
              </p>

              <p className="mt-0.5 text-sm text-[#C53030]">
                {error}
              </p>
            </div>
          </div>
        )}

        {success && (
          <div
            className="
              mb-5 flex items-start gap-3 rounded-xl
              border border-[#B7E4D8]
              bg-[#F0FAF7] p-4
            "
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#DDF5EE]">
              <Check className="h-4 w-4 text-[#087F6C]" />
            </div>

            <div>
              <p className="text-sm font-semibold text-[#087F6C]">
                Success
              </p>

              <p className="mt-0.5 text-sm text-[#2C7A6A]">
                {success}
              </p>
            </div>
          </div>
        )}

        {/* ======================================================
            MAIN PROFILE CARD
        ====================================================== */}

        <div
          className="
            overflow-hidden rounded-2xl
            border border-[#D9E2EC]
            bg-white shadow-sm
          "
        >
          {/* Navy profile banner */}

          <div className="border-t-4 border-[#1A365D]">
            <div
              className="
                border-b border-[#E7EDF3]
                bg-[#F8FAFC]
                px-5 py-6 sm:px-8
              "
            >
              <div className="flex flex-col items-center gap-5 sm:flex-row">

                {/* Profile Image */}

                <div className="relative shrink-0">
                  <div
                    onClick={handleImageClick}
                    className="
                      group relative h-28 w-28 cursor-pointer
                      overflow-hidden rounded-full
                      border-4 border-white
                      bg-[#EEF5FB]
                      shadow-md
                      ring-1 ring-[#D9E2EC]
                      sm:h-32 sm:w-32
                    "
                  >
                    {previewImage ||
                    user?.profileImageUrl ? (
                      <img
                        src={
                          previewImage ||
                          user?.profileImageUrl ||
                          ''
                        }
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div
                        className={`
                          flex h-full w-full
                          items-center justify-center
                          ${getAvatarColor()}
                        `}
                      >
                        <span className="text-3xl font-bold text-white sm:text-4xl">
                          {getInitials()}
                        </span>
                      </div>
                    )}

                    <div
                      className="
                        absolute inset-0 flex items-center
                        justify-center
                        bg-[#0F2440]/60
                        opacity-0
                        transition-opacity duration-200
                        group-hover:opacity-100
                      "
                    >
                      <Camera className="h-7 w-7 text-white" />
                    </div>

                    {isLoading && (
                      <div
                        className="
                          absolute inset-0 flex items-center
                          justify-center
                          bg-[#0F2440]/70
                        "
                      >
                        <div
                          className="
                            h-7 w-7 animate-spin rounded-full
                            border-2 border-white
                            border-t-transparent
                          "
                        />
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

                {/* Profile Summary */}

                <div className="min-w-0 flex-1 text-center sm:text-left">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#64788A]">
                    Personal Profile
                  </p>

                  <h2 className="mt-1 truncate text-xl font-bold text-[#0F2440]">
                    {formData.firstName}{' '}
                    {formData.lastName}
                  </h2>

                  <p className="mt-1 flex items-center justify-center gap-2 text-sm text-[#64788A] sm:justify-start">
                    <Mail className="h-4 w-4 shrink-0" />
                    <span className="truncate">
                      {formData.email || 'No email available'}
                    </span>
                  </p>

                  <button
                    onClick={handleImageClick}
                    disabled={isLoading}
                    className="
                      mt-3 inline-flex items-center gap-2
                      rounded-lg border border-[#C9D5E1]
                      bg-white px-3.5 py-2
                      text-sm font-semibold
                      text-[#1A365D]
                      transition-all duration-200
                      hover:border-[#1A365D]
                      hover:bg-[#F4F7FA]
                      disabled:cursor-not-allowed
                      disabled:opacity-50
                    "
                  >
                    <Camera className="h-4 w-4" />
                    {isLoading
                      ? 'Uploading...'
                      : 'Change Photo'}
                  </button>

                  <p className="mt-2 text-xs text-[#94A8BD]">
                    Maximum 5MB · JPG, PNG or GIF
                  </p>
                </div>

                {/* Edit */}

                {!isEditing && (
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setError('');
                      setSuccess('');
                    }}
                    className="
                      inline-flex shrink-0 items-center
                      justify-center gap-2
                      rounded-lg
                      bg-[#1A365D]
                      px-4 py-2.5
                      text-sm font-semibold text-white
                      transition-all duration-200
                      hover:bg-[#153475]
                    "
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit Profile
                  </button>
                )}
              </div>
            </div>

            {/* ==================================================
                FORM
            ================================================== */}

            <div className="p-5 sm:p-8">
              <div className="space-y-8">

                {/* PERSONAL INFORMATION */}

                <section>
                  <div className="mb-5">
                    <h3 className="text-base font-bold text-[#0F2440]">
                      Personal Information
                    </h3>

                    <p className="mt-1 text-sm text-[#64788A]">
                      Keep your personal details up to date.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                    {/* First Name */}

                    <div>
                      <label
                        htmlFor="firstName"
                        className={labelClass}
                      >
                        First Name
                      </label>

                      <input
                        id="firstName"
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={inputClass}
                      />
                    </div>

                    {/* Last Name */}

                    <div>
                      <label
                        htmlFor="lastName"
                        className={labelClass}
                      >
                        Last Name
                      </label>

                      <input
                        id="lastName"
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={inputClass}
                      />
                    </div>

                    {/* Email */}

                    <div className="md:col-span-2">
                      <label
                        htmlFor="email"
                        className={labelClass}
                      >
                        <span className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-[#1A365D]" />
                          Email Address
                        </span>
                      </label>

                      <input
                        id="email"
                        type="email"
                        name="email"
                        value={formData.email}
                        disabled
                        className={inputClass}
                      />

                      <p className="mt-1.5 text-xs text-[#94A8BD]">
                        Your email address cannot be changed.
                      </p>
                    </div>

                    {/* Phone */}

                    <div>
                      <label
                        htmlFor="phoneNumber"
                        className={labelClass}
                      >
                        <span className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-[#1A365D]" />
                          Phone Number
                        </span>
                      </label>

                      <input
                        id="phoneNumber"
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="+256 700 000 000"
                        className={inputClass}
                      />
                    </div>

                    {/* Gender */}

                    <div>
                      <label
                        htmlFor="gender"
                        className={labelClass}
                      >
                        Gender
                      </label>

                      <select
                        id="gender"
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={inputClass}
                      >
                        <option value="">
                          Select gender
                        </option>
                        <option value="male">Male</option>
                        <option value="female">
                          Female
                        </option>
                      </select>
                    </div>
                  </div>
                </section>

                {/* LOCATION */}

                <section className="border-t border-[#E7EDF3] pt-8">
                  <div className="mb-5">
                    <h3 className="text-base font-bold text-[#0F2440]">
                      Location Information
                    </h3>

                    <p className="mt-1 text-sm text-[#64788A]">
                      Add your current location details.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                    {/* Country */}

                    <div>
                      <label
                        htmlFor="country"
                        className={labelClass}
                      >
                        <span className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-[#1A365D]" />
                          Country
                        </span>
                      </label>

                      <input
                        id="country"
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="Uganda"
                        className={inputClass}
                      />
                    </div>

                    {/* City */}

                    <div>
                      <label
                        htmlFor="city"
                        className={labelClass}
                      >
                        City
                      </label>

                      <input
                        id="city"
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="Kampala"
                        className={inputClass}
                      />
                    </div>

                    {/* Town */}

                    <div>
                      <label
                        htmlFor="town"
                        className={labelClass}
                      >
                        Town
                      </label>

                      <input
                        id="town"
                        type="text"
                        name="town"
                        value={formData.town}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="Makindye"
                        className={inputClass}
                      />
                    </div>

                    {/* Street */}

                    <div>
                      <label
                        htmlFor="street"
                        className={labelClass}
                      >
                        Street Address
                      </label>

                      <input
                        id="street"
                        type="text"
                        name="street"
                        value={formData.street}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="123 Main Street"
                        className={inputClass}
                      />
                    </div>
                  </div>
                </section>

                {/* EDUCATION */}

                <section className="border-t border-[#E7EDF3] pt-8">
                  <div className="mb-5">
                    <h3 className="text-base font-bold text-[#0F2440]">
                      Education
                    </h3>

                    <p className="mt-1 text-sm text-[#64788A]">
                      Your academic information.
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="generalCourse"
                      className={labelClass}
                    >
                      <span className="flex items-center gap-2">
                        <Book className="h-4 w-4 text-[#1A365D]" />
                        General Course
                      </span>
                    </label>

                    <input
                      id="generalCourse"
                      type="text"
                      name="generalCourse"
                      value={formData.generalCourse}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="Computer Science"
                      className={inputClass}
                    />
                  </div>
                </section>

                {/* PROFESSIONAL INFORMATION */}

                <section className="border-t border-[#E7EDF3] pt-8">
                  <div className="mb-5">
                    <h3 className="text-base font-bold text-[#0F2440]">
                      Professional Information
                    </h3>

                    <p className="mt-1 text-sm text-[#64788A]">
                      Add links to your professional profiles
                      and projects.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                    {/* LinkedIn */}

                    <div>
                      <label
                        htmlFor="linkedinUrl"
                        className={labelClass}
                      >
                        LinkedIn Profile
                      </label>

                      <input
                        id="linkedinUrl"
                        type="url"
                        name="linkedinUrl"
                        value={formData.linkedinUrl}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="https://linkedin.com/in/username"
                        className={inputClass}
                      />
                    </div>

                    {/* GitHub */}

                    <div>
                      <label
                        htmlFor="githubUrl"
                        className={labelClass}
                      >
                        GitHub Profile
                      </label>

                      <input
                        id="githubUrl"
                        type="url"
                        name="githubUrl"
                        value={formData.githubUrl}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="https://github.com/username"
                        className={inputClass}
                      />
                    </div>

                    {/* Projects */}

                    <div className="md:col-span-2">
                      <label
                        htmlFor="projectUrls"
                        className={labelClass}
                      >
                        Project URLs
                      </label>

                      <input
                        id="projectUrls"
                        type="text"
                        name="projectUrls"
                        value={formData.projectUrls.join(
                          ', ',
                        )}
                        onChange={handleProjectUrlsChange}
                        disabled={!isEditing}
                        placeholder="https://project1.com, https://project2.com"
                        className={inputClass}
                      />

                      <p className="mt-1.5 text-xs text-[#94A8BD]">
                        Enter multiple URLs separated by
                        commas.
                      </p>
                    </div>
                  </div>
                </section>

                {/* ==================================================
                    PASSWORD
                ================================================== */}

                {isEditing && (
                  <section className="border-t border-[#E7EDF3] pt-8">
                    <div className="mb-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EEF5FB] text-[#1A365D]">
                          <Lock className="h-4 w-4" />
                        </div>

                        <div>
                          <h3 className="text-base font-bold text-[#0F2440]">
                            Change Password
                          </h3>

                          <p className="mt-0.5 text-sm text-[#64788A]">
                            Leave these fields empty if you do
                            not want to change your password.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                      {/* Current */}

                      <div>
                        <label
                          htmlFor="currentPassword"
                          className={labelClass}
                        >
                          Current Password
                        </label>

                        <div className="relative">
                          <input
                            id="currentPassword"
                            type={
                              showCurrentPassword
                                ? 'text'
                                : 'password'
                            }
                            name="currentPassword"
                            value={
                              formData.currentPassword
                            }
                            onChange={handleInputChange}
                            placeholder="Enter current password"
                            className={`${inputClass} pr-12`}
                          />

                          <button
                            type="button"
                            onClick={() =>
                              setShowCurrentPassword(
                                !showCurrentPassword,
                              )
                            }
                            className="
                              absolute right-3 top-1/2
                              -translate-y-1/2
                              text-[#94A8BD]
                              transition-colors
                              hover:text-[#1A365D]
                            "
                          >
                            {showCurrentPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* New */}

                      <div>
                        <label
                          htmlFor="newPassword"
                          className={labelClass}
                        >
                          New Password
                        </label>

                        <div className="relative">
                          <input
                            id="newPassword"
                            type={
                              showNewPassword
                                ? 'text'
                                : 'password'
                            }
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleInputChange}
                            placeholder="Enter new password"
                            className={`${inputClass} pr-12`}
                          />

                          <button
                            type="button"
                            onClick={() =>
                              setShowNewPassword(
                                !showNewPassword,
                              )
                            }
                            className="
                              absolute right-3 top-1/2
                              -translate-y-1/2
                              text-[#94A8BD]
                              transition-colors
                              hover:text-[#1A365D]
                            "
                          >
                            {showNewPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Confirm */}

                      <div className="md:col-span-2">
                        <label
                          htmlFor="confirmPassword"
                          className={labelClass}
                        >
                          Confirm New Password
                        </label>

                        <div className="relative">
                          <input
                            id="confirmPassword"
                            type={
                              showConfirmPassword
                                ? 'text'
                                : 'password'
                            }
                            name="confirmPassword"
                            value={
                              formData.confirmPassword
                            }
                            onChange={handleInputChange}
                            placeholder="Confirm new password"
                            className={`${inputClass} pr-12`}
                          />

                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword(
                                !showConfirmPassword,
                              )
                            }
                            className="
                              absolute right-3 top-1/2
                              -translate-y-1/2
                              text-[#94A8BD]
                              transition-colors
                              hover:text-[#1A365D]
                            "
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </section>
                )}

                {/* ==================================================
                    ACTIONS
                ================================================== */}

                {isEditing && (
                  <div
                    className="
                      flex flex-col-reverse gap-3
                      border-t border-[#E7EDF3]
                      pt-6
                      sm:flex-row sm:justify-end
                    "
                  >
                    <button
                      onClick={handleCancel}
                      disabled={isLoading}
                      className="
                        inline-flex items-center
                        justify-center gap-2
                        rounded-lg
                        border border-[#C9D5E1]
                        bg-white
                        px-5 py-2.5
                        text-sm font-semibold
                        text-[#526678]
                        transition-all duration-200
                        hover:border-[#94A8BD]
                        hover:bg-[#F4F7FA]
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                      "
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </button>

                    <button
                      onClick={handleSave}
                      disabled={isLoading}
                      className="
                        inline-flex items-center
                        justify-center gap-2
                        rounded-lg
                        bg-[#1A365D]
                        px-5 py-2.5
                        text-sm font-semibold text-white
                        transition-all duration-200
                        hover:bg-[#153475]
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                      "
                    >
                      {isLoading ? (
                        <>
                          <div
                            className="
                              h-4 w-4 animate-spin
                              rounded-full
                              border-2 border-white
                              border-t-transparent
                            "
                          />
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
                )}

                {/* ==================================================
                    ACCOUNT INFORMATION
                ================================================== */}

                <section className="border-t border-[#E7EDF3] pt-8">
                  <div className="mb-5">
                    <h3 className="text-base font-bold text-[#0F2440]">
                      Account Information
                    </h3>

                    <p className="mt-1 text-sm text-[#64788A]">
                      Basic information about your account.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

                    {/* Role */}

                    <div
                      className="
                        rounded-xl border border-[#E7EDF3]
                        bg-[#F8FAFC] p-4
                      "
                    >
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#94A8BD]">
                        Role
                      </p>

                      <p className="mt-2 text-sm font-semibold capitalize text-[#0F2440]">
                        {user?.role?.replace(
                          '_',
                          ' ',
                        ) || 'Student'}
                      </p>
                    </div>

                    {/* ID */}

                    <div
                      className="
                        rounded-xl border border-[#E7EDF3]
                        bg-[#F8FAFC] p-4
                      "
                    >
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#94A8BD]">
                        Student ID
                      </p>

                      <p
                        className="
                          mt-2 truncate text-sm
                          font-semibold text-[#0F2440]
                        "
                        title={user?.id || 'N/A'}
                      >
                        {user?.id || 'N/A'}
                      </p>
                    </div>

                    {/* Status */}

                    <div
                      className="
                        rounded-xl border border-[#B7E4D8]
                        bg-[#F0FAF7] p-4
                      "
                    >
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#087F6C]">
                        Account Status
                      </p>

                      <div className="mt-2 flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-[#087F6C]" />

                        <p className="text-sm font-semibold text-[#087F6C]">
                          Active
                        </p>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================
            FOOTER NOTE
        ====================================================== */}

        <div className="mt-5 text-center">
          <p className="text-xs text-[#94A8BD]">
            Keep your profile information accurate so your
            student community can identify you easily.
          </p>
        </div>
      </div>
    </div>
  );
}