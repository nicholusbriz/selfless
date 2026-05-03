import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import { API_ENDPOINTS } from '@/config/constants';
import { FlexibleUser, CourseRegistration, RawCourseRegistration } from '@/types';

interface RegisteredCourse {
  name: string;
  credits: number;
}

// API fetch functions
const fetchCourseRegistrations = async (): Promise<{ success: boolean; registrations: CourseRegistration[] }> => {
  const response = await fetch(API_ENDPOINTS.COURSES);
  if (!response.ok) throw new Error('Failed to fetch course registrations');
  return response.json();
};

// Course registration hooks
export const useCourseRegistrations = () => {
  return useQuery({
    queryKey: ['course-registrations'],
    queryFn: fetchCourseRegistrations,
    staleTime: 2 * 60 * 1000, // 2 minutes
    select: (data) => {
      const registrations = data.registrations || [];

      interface ApiRegistration {
        id: string;
        userId: string;
        user?: {
          fullName?: string;
          firstName?: string;
          lastName?: string;
          email?: string;
        };
        courses?: RegisteredCourse[];
        takesReligion?: boolean;
        registrationDate?: string;
        createdAt?: string;
      }

      interface CourseRegistration {
        id: string;
        userId: string;
        userName: string;
        userEmail: string;
        courses: Course[];
        totalCredits: number;
        takesReligion: boolean;
        createdAt?: string;
        updatedAt?: string;
      }

      interface Course {
        id: string;
        name: string;
        credits: number;
      }

      interface RegisteredCourse {
        id?: string;
        name: string;
        credits: number;
      }

      // Transform API data to show each student with their course list
      const transformedRegistrations = registrations.map((reg: ApiRegistration) => {
        // Calculate total credits
        const totalCredits = reg.courses?.reduce((sum: number, course: RegisteredCourse) => sum + (course.credits || 0), 0) || 0;

        return {
          id: reg.id, // Use registration ID as the unique key
          userId: reg.userId,
          userName: reg.user?.fullName || `${reg.user?.firstName || ''} ${reg.user?.lastName || ''}`.trim() || 'Unknown',
          userEmail: reg.user?.email || '',
          courses: reg.courses || [], // Keep the full course array
          totalCredits: totalCredits,
          takesReligion: reg.takesReligion || false,
          submittedAt: reg.registrationDate || reg.createdAt || new Date().toISOString(),
          status: "approved" as const
        };
      });

      console.log('Original registrations:', registrations.length);
      console.log('Student registrations (each with course list):', transformedRegistrations.length);

      // Remove any duplicates based on the registration ID
      const uniqueRegistrations = transformedRegistrations.filter((reg, index, arr) =>
        arr.findIndex(r => r.id === reg.id) === index
      );

      console.log('Unique student registrations:', uniqueRegistrations.length);

      return uniqueRegistrations;
    },
  });
};

export const useSubmitCourseRegistration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (registrationData: {
      courses: { name: string }[];
      takesReligion: boolean;
    }) => {
      const response = await fetch(API_ENDPOINTS.COURSES, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit course registration');
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-registrations'] });
    },
  });
};

export const useClearCourseSubmission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (submissionId: string) => {
      const response = await fetch(`/api/courses?submissionId=${submissionId}`, {
        method: 'DELETE',
        credentials: 'include', // Include cookies for authentication
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to clear course submission');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-registrations'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
};

// Course search hook
export const useCourseRegistrationSearch = (courseSubmissions: CourseRegistration[]) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSubmissions = useMemo(() => {
    if (!searchTerm.trim()) {
      return courseSubmissions;
    }

    const term = searchTerm.toLowerCase();
    return courseSubmissions.filter(submission =>
      submission.userName?.toLowerCase().includes(term) ||
      submission.courses?.some((course: RegisteredCourse) => course.name?.toLowerCase().includes(term)) ||
      (submission.takesReligion ? 'yes' : 'no').includes(term) ||
      submission.id?.toLowerCase().includes(term)
    );
  }, [courseSubmissions, searchTerm]);

  return {
    searchTerm,
    setSearchTerm,
    filteredSubmissions,
  };
};

// Course management hook
export const useCourseManagement = ({
  user,
  isAdmin = false
}: {
  user: FlexibleUser | null;
  isAdmin?: boolean;
}) => {
  const { data: courseSubmissions = [], isLoading: courseRegistrationsLoading } = useCourseRegistrations();
  const clearCourseSubmissionMutation = useClearCourseSubmission();

  // Find user's own registration if not admin
  const userRegistration = user && !isAdmin ? courseSubmissions.find(reg => reg.userId === user.id) : null;

  // Check if user has registered courses
  const hasRegisteredCourses = Boolean(userRegistration);

  // For CourseRegistration from types/index.ts, use the courses array
  const registeredCourses: RegisteredCourse[] = userRegistration ? userRegistration.courses : [];

  // Handle clearing course submission
  const handleClearCourseSubmission = async (submissionId: string) => {
    try {
      await clearCourseSubmissionMutation.mutateAsync(submissionId);
      // Success feedback
      alert('✅ Course registration cleared successfully! You can now register for new courses.');
    } catch (error) {
      console.error('Failed to clear course submission:', error);
      // Error feedback
      alert('❌ Failed to clear course registration. Please try again.');
    }
  };

  return {
    courseSubmissions,
    isLoading: courseRegistrationsLoading,
    clearCourseSubmission: clearCourseSubmissionMutation.isPending,
    setClearCourseSubmission: () => { }, // Placeholder for compatibility
    handleClearCourseSubmission,
    hasRegisteredCourses,
    registeredCourses,
    userRegistration,
  };
};

// User course checking hook
export const useCheckUserCourses = (userId?: string, email?: string) => {
  return useQuery({
    queryKey: ['user-courses', userId, email],
    queryFn: async () => {
      if (!userId || !email) return null;

      const response = await fetch(`/api/courses?userId=${userId}&email=${encodeURIComponent(email)}`);

      if (!response.ok) {
        throw new Error('Failed to check user courses');
      }

      return response.json();
    },
    enabled: Boolean(userId && email),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};
