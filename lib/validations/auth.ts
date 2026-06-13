import { z } from 'zod';

// Email validation schema
const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Invalid email format')
  .transform((val) => val.toLowerCase());

// Password validation schema (min 6 chars, at least 1 letter and 1 number)
const passwordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters long')
  .regex(
    /^(?=.*[A-Za-z])(?=.*\d)/,
    'Password must contain at least 1 letter and 1 number'
  );

// Phone number validation schema
const phoneNumberSchema = z
  .string()
  .min(1, 'Phone number is required')
  .regex(
    /^[\d\s\-\+\(\)]+$/,
    'Phone number can only contain digits, spaces, hyphens, plus signs, and parentheses'
  );

// Name validation schema
const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .min(2, 'Name must be at least 2 characters long')
  .max(50, 'Name must be less than 50 characters')
  .regex(
    /^[a-zA-Z\s\-']+$/,
    'Name can only contain letters, spaces, hyphens, and apostrophes'
  );

// Login schema (email only)
export const loginSchema = z.object({
  email: emailSchema,
});

// Register schema
export const registerSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  phoneNumber: phoneNumberSchema,
});
