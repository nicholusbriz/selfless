// lib/utils.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines multiple class names using clsx and tailwind-merge
 * 
 * This utility function allows you to conditionally join class names
 * and merge Tailwind CSS classes without conflicts.
 * 
 * @param inputs - Class values (strings, objects, arrays)
 * @returns Merged class name string
 * 
 * @example
 * cn('px-2 py-1', 'bg-blue-500', { 'text-white': true, 'hidden': false })
 * // Returns: 'px-2 py-1 bg-blue-500 text-white'
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}