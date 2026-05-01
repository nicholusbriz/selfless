import { useState } from 'react';
import { User } from '@/lib/auth';
import { useRefetchControls } from './useApi';

interface Course {
  id: string;
  name: string;
  credits: string;
}

interface RegisteredCourse {
  id: string;
  name: string;
  credits: number;
}

interface CourseFormState {
  currentCourse: Course;
  courses: Course[];
  takesReligion: boolean;
  isLoading: boolean;
  message: string;
  messageType: 'success' | 'error' | '';
}

interface CourseFormActions {
  addCourse: () => void;
  removeCourse: (id: string) => void;
  updateCourse: (field: 'name' | 'credits', value: string) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  calculateTotalCredits: () => number;
  resetForm: () => void;
  setTakesReligion: (value: boolean) => void;
  setMessage: (value: string) => void;
  setMessageType: (value: 'success' | 'error' | '') => void;
}

export const useCourseForm = (user: User | null, router: { push: (path: string) => void }): CourseFormState & CourseFormActions => {
  const [currentCourse, setCurrentCourse] = useState<Course>({ id: '', name: '', credits: '' });
  const [courses, setCourses] = useState<Course[]>([]);
  const [takesReligion, setTakesReligion] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  const { refetchCourses } = useRefetchControls();

  const addCourse = () => {
    // Validate input
    if (!currentCourse.name.trim() || !currentCourse.credits.trim()) {
      setMessage('Please fill in both course name and credits');
      setMessageType('error');
      return;
    }

    // Check for duplicate course names
    if (courses.some(course => course.name.toLowerCase().trim() === currentCourse.name.toLowerCase().trim())) {
      setMessage('A course with this name already exists');
      setMessageType('error');
      return;
    }

    // Create new course object with unique ID
    const newCourse: Course = {
      id: crypto.randomUUID(),
      name: currentCourse.name.trim(),
      credits: currentCourse.credits.trim()
    };

    // Add the course to the list
    setCourses([...courses, newCourse]);

    // Clear the input fields
    setCurrentCourse({ id: '', name: '', credits: '' });
    setMessage('');
    setMessageType('');
  };

  const removeCourse = (id: string) => {
    // Remove the course from the courses array
    setCourses(courses.filter(course => course.id !== id));

    // Remove the course from the single course card
    if (currentCourse.id === id) {
      // Clear the current course
      setCurrentCourse({ id: '', name: '', credits: '' });
    }
  };

  const updateCourse = (field: 'name' | 'credits', value: string) => {
    setCurrentCourse({ ...currentCourse, [field]: value });
  };

  const calculateTotalCredits = () => {
    return courses.reduce((total, course) => total + (parseInt(course.credits) || 0), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate user is logged in
    if (!user || !user.id) {
      setMessage('User session expired. Please log in again.');
      setMessageType('error');
      // Redirect to home
      setTimeout(() => {
        router.push('/');
      }, 2000);
      return;
    }

    // Validate at least one course is added
    if (courses.length === 0) {
      setMessage('Please add at least one course before submitting');
      setMessageType('error');
      return;
    }

    // Validate credits are numbers
    const invalidCredits = courses.find(course => isNaN(parseInt(course.credits)));
    if (invalidCredits) {
      setMessage('Please enter valid numbers for all credits');
      setMessageType('error');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
          courses: courses.map(course => ({
            name: course.name.trim(),
            credits: parseInt(course.credits) || 0
          })),
          takesReligion: takesReligion
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save courses');
      }

      const data = await response.json();

      if (data.success) {
        setMessage(data.message || `Successfully registered ${courses.length} course(s) with ${calculateTotalCredits()} total credits!`);
        setMessageType('success');

        // Refresh the course registrations list to show the new registration immediately
        refetchCourses();

        // Reset form after successful submission
        resetForm();
      } else {
        setMessage(data.message || 'Failed to register courses');
        setMessageType('error');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Network error. Please try again.';
      setMessage(errorMessage);
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setCurrentCourse({ id: '', name: '', credits: '' });
    setCourses([]);
    setTakesReligion(false);
    setMessage('');
    setMessageType('');
  };

  return {
    // State
    currentCourse,
    courses,
    takesReligion,
    isLoading,
    message,
    messageType,

    // Actions
    addCourse,
    removeCourse,
    updateCourse,
    handleSubmit,
    calculateTotalCredits,
    resetForm,
    setTakesReligion,
    setMessage,
    setMessageType,
  };
};

export type { Course, RegisteredCourse };
