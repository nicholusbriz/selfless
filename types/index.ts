// User account information
export interface User {
  _id: string;
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  fullName?: string;
  createdAt: Date;
  updatedAt: Date;
}

import { User as AuthUser } from '@/lib/auth';

// Flexible user type for different authentication contexts
export type FlexibleUser = AuthUser | {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isAdmin?: boolean;
  isSuperAdmin?: boolean;
  isRegistered?: boolean;
  fullName?: string;
  phoneNumber?: string;
  createdAt?: string | Date;
};

// Cleaning day registration information
export interface CleaningDay {
  _id: string;
  id: string;
  date: Date;
  dayName: string;
  week: number;
  maxSlots: number;
  registeredUsers: User[];
  registeredCount: number;
  isFull: boolean;
  formattedDate: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Weeks {
  [key: number]: CleaningDay[];
}

export interface UserRegistration {
  id: string;
  dayName: string;
  formattedDate: string;
  registeredCount: number;
  maxSlots: number;
  week?: number;
  date?: Date;
  userId?: string;
  dayId?: string;
}

// Course registration information for display (student-centric)
export interface CourseRegistration {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  courses: Array<{ name: string; credits: number }>;
  totalCredits: number;
  takesReligion: boolean;
  submittedAt: string;
  status: 'approved' | 'pending' | 'rejected';
}

// Raw course registration data from API (before transformation)
export interface RawCourseRegistration {
  id: string;
  userId: string;
  user?: { fullName?: string; firstName?: string; lastName?: string };
  takesReligion?: boolean;
  courses?: Array<{ name: string }>;
  totalCredits?: number;
  registrationDate?: string;
  createdAt?: string;
  status?: string;
}

// Message status types
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';

// Message reaction types
export interface MessageReaction {
  emoji: string;
  userId: string;
  userName: string;
  timestamp: Date;
}

// Messaging system types
export interface Message {
  id?: string;
  _id?: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  read: boolean;
  messageType: 'text';
  senderName: string;
  receiverName: string;
  status?: MessageStatus;
  reactions?: MessageReaction[];
}

export interface Conversation {
  id: string;
  participants: {
    userId: string;
    userName: string;
    userAvatar?: string;
    lastSeen?: Date;
    isOnline?: boolean;
  }[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isOnline?: boolean;
  lastSeen?: Date;
  isAdmin?: boolean;
  isTutor?: boolean;
}

export interface ChatState {
  conversations: Conversation[];
  activeConversation?: Conversation;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  onlineUsers: string[];
}
