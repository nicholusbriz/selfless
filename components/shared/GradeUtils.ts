// Shared grade and GPA utility functions for all dashboards

export const GRADE_COLORS: Record<string, string> = {
  'A': 'text-green-400',
  'A-': 'text-green-300',
  'B+': 'text-blue-400',
  'B': 'text-blue-300',
  'B-': 'text-blue-200',
  'C+': 'text-yellow-400',
  'C': 'text-yellow-300',
  'C-': 'text-yellow-200',
  'D+': 'text-orange-400',
  'D': 'text-orange-300',
  'D-': 'text-orange-200',
  'E': 'text-red-400',
  'F': 'text-red-500',
};

export const GRADE_BG_COLORS: Record<string, string> = {
  'A': 'bg-green-400/10',
  'A-': 'bg-green-300/10',
  'B+': 'bg-blue-400/10',
  'B': 'bg-blue-300/10',
  'B-': 'bg-blue-200/10',
  'C+': 'bg-yellow-400/10',
  'C': 'bg-yellow-300/10',
  'C-': 'bg-yellow-200/10',
  'D+': 'bg-orange-400/10',
  'D': 'bg-orange-300/10',
  'D-': 'bg-orange-200/10',
  'E': 'bg-red-400/10',
  'F': 'bg-red-500/10',
};

export function getGradeColor(gradeLetter: string): string {
  return GRADE_COLORS[gradeLetter] || 'text-gray-400';
}

export function getGradeBgColor(gradeLetter: string): string {
  return GRADE_BG_COLORS[gradeLetter] || 'bg-white/10';
}

export function getGpaColor(gpa: number): string {
  if (gpa >= 3.5) return 'text-green-400';
  if (gpa >= 3.0) return 'text-blue-400';
  if (gpa >= 2.5) return 'text-yellow-400';
  if (gpa >= 2.0) return 'text-orange-400';
  return 'text-red-400';
}

export function getGpaBarColor(gpa: number): string {
  if (gpa >= 3.5) return 'bg-green-400';
  if (gpa >= 3.0) return 'bg-blue-400';
  if (gpa >= 2.5) return 'bg-yellow-400';
  if (gpa >= 2.0) return 'bg-orange-400';
  return 'bg-red-400';
}

export function getGpaCategory(gpa: number): string {
  if (gpa >= 3.5) return 'Excellent';
  if (gpa >= 3.0) return 'Good';
  if (gpa >= 2.5) return 'Satisfactory';
  if (gpa >= 2.0) return 'Fair';
  return 'Needs Improvement';
}

export function getGpaCategoryColor(gpa: number): string {
  return getGpaColor(gpa);
}

export function formatGPA(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value)) {
    return '0.00';
  }
  return value.toFixed(2);
}

export function formatPercentage(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value)) {
    return '0';
  }
  return value.toFixed(1);
}