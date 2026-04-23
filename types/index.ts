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
