/**
 * @fileoverview User Model
 * 
 * This file defines the User schema for the Selfless platform.
 * It handles user authentication, roles, and profile information.
 * 
 * Key Features:
 * - Password hashing with bcrypt
 * - Role-based access control (admin, tutor, user)
 * - Email validation and uniqueness
 * - Phone number validation
 * - Registration status tracking
 * 
 * User Roles:
 * - User: Basic registered user
 * - Tutor: Can manage courses and announcements
 * - Admin: Full system access
 * - Super Admin: Ultimate system control (email-based)
 */

import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * Interface defining the User document structure
 * Extends Mongoose Document for TypeScript support
 */
export interface IUser extends Document {
  firstName: string;        // User's first name
  lastName: string;         // User's last name
  email: string;            // User's email (unique identifier)
  password: string;         // Hashed password
  phoneNumber?: string;     // Optional phone number
  isAdmin: boolean;         // Admin role flag
  isSuperAdmin: boolean;    // Super admin role (email-based)
  isTutor: boolean;         // Tutor role flag
  isRegistered: boolean;     // Registration completion status
  comparePassword(candidatePassword: string): Promise<boolean>; // Password comparison method
  createdAt: Date;          // Account creation timestamp
  updatedAt: Date;          // Last update timestamp
}

/**
 * Mongoose schema for User documents
 * 
 * This schema defines the structure and validation rules for user accounts.
 * It includes comprehensive validation and security features.
 */
const UserSchema: Schema = new Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    minlength: [2, 'First name must be at least 2 characters'],
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    minlength: [2, 'Last name must be at least 2 characters'],
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,  // Ensures email uniqueness across all users
    trim: true,
    lowercase: true,  // Normalize email to lowercase
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  phoneNumber: {
    type: String,
    trim: true,
    default: '',  // Default to empty string
  },
  // Role-based access control flags
  isAdmin: {
    type: Boolean,
    default: false,  // Default to regular user
  },
  isSuperAdmin: {
    type: Boolean,
    default: false,  // Set based on email domain during registration
  },
  isTutor: {
    type: Boolean,
    default: false,  // Set by admin promotion
  },
  isRegistered: {
    type: Boolean,
    default: false,  // Set to true after registration completion
  },
}, {
  timestamps: true,  // Automatically add createdAt and updatedAt fields
});

// Database indexes for performance optimization
// Note: email field already has unique index from unique: true
UserSchema.index({ createdAt: -1 });       // User listing by date
UserSchema.index({ isRegistered: 1 });     // Filter registered users
UserSchema.index({ isAdmin: 1 });          // Admin user queries
UserSchema.index({ isTutor: 1 });          // Tutor user queries
UserSchema.index({ firstName: 1, lastName: 1 }); // Name search

/**
 * Password comparison method for authentication
 * 
 * This method securely compares a plaintext password candidate
 * with the stored hashed password using bcrypt.
 * 
 * @param candidatePassword - The plaintext password to verify
 * @returns Promise resolving to boolean indicating match
 */
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
