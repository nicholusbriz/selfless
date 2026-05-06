/**
 * Application-wide constants
 * Centralized to avoid magic strings and improve maintainability
 */

// API Endpoints
export const API_ENDPOINTS = {
  USERS: '/api/users',
  COURSES: '/api/courses',
  CLEANING_FORM: '/api/cleaning-form',  // Updated unified endpoint
  ANNOUNCEMENTS: '/api/announcements',
  USER_STATUS: '/api/user-status',
  SIGNIN: '/api/login',
  SIGNOUT: '/api/signout',
  REGISTER: '/api/users',
  ADMINS: '/api/admins',  // Updated unified endpoint
  TUTORS: '/api/tutors',
} as const;

// Chat API endpoints
export const CHAT_ENDPOINTS = {
  CONVERSATIONS: '/api/chat/conversations',
  MESSAGES: '/api/chat/messages',
  SEND_MESSAGE: '/api/chat/send',
  USERS: '/api/chat/users',
} as const;

// Authentication
export const AUTH_CONSTANTS = {
  TOKEN_NAME: 'auth-token',
  COOKIE_MAX_AGE: 7 * 24 * 60 * 60, // 7 days in seconds
  MIN_PASSWORD_LENGTH: 6,
} as const;

// Database Validation
export const VALIDATION_RULES = {
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  EMAIL_REGEX: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
  PHONE_REGEX: /^\+?[\d\s\-\(\)]+$/,
  MAX_USERS_PER_DAY: 5,
  MAX_CREDITS_PER_COURSE: 10,
} as const;

// UI Messages
export const MESSAGES = {
  AUTH: {
    INVALID_CREDENTIALS: 'Invalid email or password',
    ACCESS_DENIED: 'Access denied. You must be an administrator.',
    TOKEN_EXPIRED: 'Your session has expired. Please log in again.',
    VERIFICATION_REQUIRED: 'Email verification required',
  },
  USERS: {
    DELETE_CONFIRMATION: 'Are you sure you want to permanently delete this user?',
    DELETE_SUCCESS: 'User deleted successfully',
    DELETE_ERROR: 'Failed to delete user',
  },
  COURSES: {
    SUBMIT_SUCCESS: 'Course submitted successfully',
    SUBMIT_ERROR: 'Failed to submit course',
    CLEAR_CONFIRMATION: 'Are you sure you want to clear this course submission?',
    CLEAR_SUCCESS: 'Course submission cleared successfully',
    DUPLICATE_COURSE: 'A course with this name already exists',
  },
  CLEANING_DAYS: {
    REGISTRATION_SUCCESS: 'Successfully registered for cleaning day',
    REGISTRATION_ERROR: 'Failed to register for cleaning day',
    REMOVE_CONFIRMATION: 'Are you sure you want to remove this user from this cleaning day?',
    REMOVE_SUCCESS: 'User removed from cleaning day successfully',
    DAY_FULL: 'This cleaning day is already full',
  },
  VALIDATION: {
    REQUIRED_FIELD: 'This field is required',
    INVALID_EMAIL: 'Please enter a valid email address',
    INVALID_PHONE: 'Please enter a valid phone number',
    PASSWORD_TOO_SHORT: `Password must be at least ${AUTH_CONSTANTS.MIN_PASSWORD_LENGTH} characters long`,
    NAME_TOO_SHORT: `Name must be at least ${VALIDATION_RULES.NAME_MIN_LENGTH} characters`,
    NAME_TOO_LONG: `Name cannot exceed ${VALIDATION_RULES.NAME_MAX_LENGTH} characters`,
  },
} as const;

// Dashboard Sections
export const DASHBOARD_SECTIONS = {
  OVERVIEW: 'overview',
  USERS: 'users',
  COURSES: 'courses',
  REGISTERED_DAYS: 'registered-days',
  ANNOUNCEMENTS: 'announcements',
  TUTORS: 'tutors',
  ADMINS: 'admins',
  SEARCH: 'search',
  SYSTEM: 'system',
  COMMUNICATION: 'communication',
  SECURITY: 'security',
  REPORTING: 'reporting',
} as const;

// User Roles
export const USER_ROLES = {
  STUDENT: 'student',
  TUTOR: 'tutor',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
} as const;

// File Paths
export const PATHS = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  ADMIN: '/admin',
  COURSES: '/courses',
  FORM: '/form',
  POLICIES: '/policies',
  PROFILE: '/profile',
  ANNOUNCEMENTS: '/announcements',
} as const;

// Time Constants
export const TIME_CONSTANTS = {
  AUTO_REFRESH_INTERVAL: 5 * 60 * 1000, // 5 minutes
  TOAST_DURATION: 3000, // 3 seconds
  DEBOUNCE_DELAY: 300, // 300ms
  ANIMATION_DURATION: 300, // 300ms
} as const;

// Export Types
export type ApiEndpoint = typeof API_ENDPOINTS[keyof typeof API_ENDPOINTS];
export type DashboardSection = typeof DASHBOARD_SECTIONS[keyof typeof DASHBOARD_SECTIONS];
export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];
export type AppPath = typeof PATHS[keyof typeof PATHS];
