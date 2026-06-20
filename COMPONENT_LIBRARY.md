# Component Library Documentation

## Table of Contents
1. [Overview](#overview)
2. [Shared Components](#shared-components)
3. [Admin Components](#admin-components)
4. [Student Components](#student-components)
5. [Teacher Components](#teacher-components)
6. [Cleaning Components](#cleaning-components)
7. [Overview Components](#overview-components)
8. [UI Components](#ui-components)
9. [Component Patterns](#component-patterns)
10. [Styling Guidelines](#styling-guidelines)

## Overview

The component library is organized by feature and reusability. Components follow React best practices with TypeScript for type safety and TailwindCSS for styling.

### Component Organization
```
components/
├── admin/              # Admin-specific components
├── cleaning/           # Cleaning system components
├── overview/           # Dashboard overview components
├── shared/             # Shared/reusable components
├── student/            # Student-specific components
├── teacher/            # Teacher-specific components
└── ui/                 # UI component library
```

## Shared Components

### DashboardTabs
**Location**: `components/shared/DashboardTabs.tsx`

**Purpose**: Tab navigation for dashboard pages

**Props**:
```typescript
interface DashboardTabsProps {
  tabs: Array<{
    id: string;
    label: string;
    icon: React.ReactNode;
  }>;
  activeTab: string;
  onTabChange: (tabId: string) => void;
}
```

**Usage**:
```typescript
<DashboardTabs
  tabs={TABS}
  activeTab={activeTab}
  onTabChange={setActiveTab}
/>
```

### LoadingState
**Location**: `components/shared/LoadingState.tsx`

**Purpose**: Loading skeleton component for data loading states

**Props**:
```typescript
interface LoadingStateProps {
  message?: string;
}
```

**Usage**:
```typescript
<LoadingState message="Loading data..." />
```

### ErrorState
**Location**: `components/shared/ErrorState.tsx`

**Purpose**: Error display component for error states

**Props**:
```typescript
interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}
```

**Usage**:
```typescript
<ErrorState message="Failed to load data" onRetry={refetch} />
```

### StatsCard
**Location**: `components/shared/StatsCard.tsx`

**Purpose**: Display a single statistic with icon and styling

**Props**:
```typescript
interface StatsCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtitle?: string;
  iconColor?: string;
  gradient?: string;
  valueClassName?: string;
}
```

**Usage**:
```typescript
<StatsCard
  icon={<Users />}
  title="Total Students"
  value={52}
  subtitle="+5 this week"
  iconColor="text-blue-400"
  gradient="from-blue-500/20 to-blue-600/20"
/>
```

### StatsGrid
**Location**: `components/shared/StatsGrid.tsx`

**Purpose**: Grid layout for StatsCard components

**Props**:
```typescript
interface StatsGridProps {
  stats: StatsCardProps[];
  columns?: number;
  loading?: boolean;
}
```

**Usage**:
```typescript
<StatsGrid
  stats={statistics}
  columns={4}
  loading={isLoading}
/>
```

### GradeBadge
**Location**: `components/shared/GradeBadge.tsx`

**Purpose**: Display a colored badge for grades

**Props**:
```typescript
interface GradeBadgeProps {
  grade: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}
```

**Usage**:
```typescript
<GradeBadge grade="A" showIcon size="md" />
```

### SharedGradesTab
**Location**: `components/shared/SharedGradesTab.tsx`

**Purpose**: Shared grades display component

**Props**:
```typescript
interface SharedGradesTabProps {
  students: Student[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  isEditable?: boolean;
}
```

**Usage**:
```typescript
<SharedGradesTab
  students={students}
  searchTerm={searchTerm}
  onSearchChange={setSearchTerm}
  isEditable={true}
/>
```

### StudentGradesList
**Location**: `components/shared/StudentGradesList.tsx`

**Purpose**: Display list of student grades

**Props**:
```typescript
interface StudentGradesListProps {
  students: Student[];
  selectedWeek: number;
  onGradeAssign: (studentId: string, grade: string) => void;
  isEditable: boolean;
}
```

**Usage**:
```typescript
<StudentGradesList
  students={students}
  selectedWeek={1}
  onGradeAssign={handleGradeAssign}
  isEditable={true}
/>
```

### GradeUtils
**Location**: `components/shared/GradeUtils.ts`

**Purpose**: Utility functions for grade calculations and colors

**Functions**:
```typescript
getGpaColor(gpa: number): string
getGpaBarColor(gpa: number): string
formatGPA(gpa: number): string
getGradeColor(grade: string): string
getGradeBgColor(grade: string): string
calculateGPA(grades: Grade[]): number
```

**Usage**:
```typescript
import { getGpaColor, formatGPA } from '@/components/shared/GradeUtils';

const color = getGpaColor(3.5);
const formatted = formatGPA(3.456);
```

### Toast
**Location**: `components/shared/Toast.tsx`

**Purpose**: Toast notification component

**Props**:
```typescript
interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose?: () => void;
}
```

**Usage**:
```typescript
<Toast
  message="Operation successful"
  type="success"
  duration={3000}
/>
```

### EmptyState
**Location**: `components/shared/EmptyState.tsx`

**Purpose**: Display empty state message

**Props**:
```typescript
interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}
```

**Usage**:
```typescript
<EmptyState
  icon={<Inbox />}
  title="No data found"
  description="There are no items to display"
  action={{ label: "Create item", onClick: handleCreate }}
/>
```

## Admin Components

### AdminStudentTable
**Location**: `components/admin/AdminStudentTable.tsx`

**Purpose**: Table display for admin student management

**Props**:
```typescript
interface AdminStudentTableProps {
  students: Student[];
  onEdit: (studentId: string) => void;
  onDelete: (studentId: string) => void;
  onTuitionToggle: (studentId: string, status: boolean) => void;
}
```

### AdminTuitionList
**Location**: `components/admin/AdminTuitionList.tsx`

**Purpose**: List display for tuition management

**Props**:
```typescript
interface AdminTuitionListProps {
  students: Student[];
  onTuitionToggle: (studentId: string, status: boolean) => void;
}
```

### AdminAssignmentManager
**Location**: `components/admin/AdminAssignmentManager.tsx`

**Purpose**: Manage teacher-student assignments

**Props**:
```typescript
interface AdminAssignmentManagerProps {
  students: Student[];
  teachers: Teacher[];
  onAssign: (teacherId: string, studentId: string) => void;
  onUnassign: (assignmentId: string) => void;
}
```

### ApplicationsTab
**Location**: `components/admin/ApplicationsTab.tsx`

**Purpose**: Display and manage student applications

**Props**:
```typescript
interface ApplicationsTabProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
}
```

### AdminCleaningManagement
**Location**: `components/admin/AdminCleaningManagement.tsx`

**Purpose**: Admin interface for cleaning management

**Props**:
```typescript
interface AdminCleaningManagementProps {
  weeks: Week[];
  onWeekCreate: (week: WeekData) => void;
  onWeekUpdate: (weekId: string, data: WeekData) => void;
}
```

## Student Components

### StudentGPATimeline
**Location**: `components/student/StudentGPATimeline.tsx`

**Purpose**: Display student GPA progress over weeks

**Props**:
```typescript
interface StudentGPATimelineProps {
  weeklyGPAs: Array<{
    week: number;
    gpa: number;
  }>;
}
```

**Usage**:
```typescript
<StudentGPATimeline weeklyGPAs={weeklyGPAs} />
```

### StudentGradeLegend
**Location**: `components/student/StudentGradeLegend.tsx`

**Purpose**: Display legend for grade colors

**Props**: None

**Usage**:
```typescript
<StudentGradeLegend />
```

## Teacher Components

### TeacherAssignmentList
**Location**: `components/teacher/TeacherAssignmentList.tsx`

**Purpose**: Display teacher's assignments

**Props**:
```typescript
interface TeacherAssignmentListProps {
  assignments: Assignment[];
  onGrade: (assignmentId: string, grade: string) => void;
}
```

### TeacherStudentList
**Location**: `components/teacher/TeacherStudentList.tsx`

**Purpose**: Display teacher's assigned students

**Props**:
```typescript
interface TeacherStudentListProps {
  students: Student[];
  onStudentSelect: (studentId: string) => void;
}
```

## Cleaning Components

### CleaningRegistration
**Location**: `components/cleaning/CleaningRegistration.tsx`

**Purpose**: Student interface for cleaning registration

**Props**:
```typescript
interface CleaningRegistrationProps {
  weeks: Week[];
  onRegister: (dayId: string) => void;
  onUnregister: () => void;
  currentRegistration: Registration | null;
}
```

### CleaningAttendance
**Location**: `components/cleaning/CleaningAttendance.tsx`

**Purpose**: Admin/Teacher interface for attendance marking

**Props**:
```typescript
interface CleaningAttendanceProps {
  day: CleaningDay;
  registrations: Registration[];
  onMarkAttendance: (userId: string, status: AttendanceStatus) => void;
}
```

### CleaningSchedule
**Location**: `components/cleaning/CleaningSchedule.tsx`

**Purpose**: Display weekly cleaning schedule

**Props**:
```typescript
interface CleaningScheduleProps {
  week: Week;
  onDaySelect: (dayId: string) => void;
}
```

## Overview Components

### EnhancedStatistics
**Location**: `components/overview/EnhancedStatistics.tsx`

**Purpose**: Display enhanced statistics with charts

**Props**:
```typescript
interface EnhancedStatisticsProps {
  statistics: {
    totalStudents: number;
    studentsWithTutor: number;
    tuitionPaidCount: number;
    gpaDistribution: Record<string, number>;
    courseDepartments: Record<string, number>;
    averageGPA: string;
    attendanceRate: string;
  };
}
```

**Usage**:
```typescript
<EnhancedStatistics statistics={statistics} />
```

### TutorSchedule
**Location**: `components/overview/TutorSchedule.tsx`

**Purpose**: Display tutor schedule

**Props**:
```typescript
interface TutorScheduleProps {
  schedule: ScheduleItem[];
}
```

### TutorAssignments
**Location**: `components/overview/TutorAssignments.tsx`

**Purpose**: Display tutor-student assignments

**Props**:
```typescript
interface TutorAssignmentsProps {
  tutorGroups: TutorGroup[];
  currentUserId?: string;
  currentUserRole?: string;
}
```

### RoleBasedQuickLinks
**Location**: `components/overview/RoleBasedQuickLinks.tsx`

**Purpose**: Display role-based quick action links

**Props**:
```typescript
interface RoleBasedQuickLinksProps {
  userRole: string;
}
```

## UI Components

### GradeFilterBar
**Location**: `components/ui/GradeFilterBar.tsx`

**Purpose**: Filter bar for grade filtering

**Props**:
```typescript
interface GradeFilterBarProps {
  filters: GradeFilters;
  onFilterChange: (filters: GradeFilters) => void;
}
```

### WeekSelector
**Location**: `components/ui/WeekSelector.tsx` (unused)

**Purpose**: Select week from dropdown

**Props**:
```typescript
interface WeekSelectorProps {
  weeks: number[];
  selectedWeek: number;
  onWeekChange: (week: number) => void;
}
```

### ReligionSelector
**Location**: `components/ui/ReligionSelector.tsx` (unused)

**Purpose**: Toggle religion course enrollment

**Props**:
```typescript
interface ReligionSelectorProps {
  takesReligion: boolean;
  onToggle: (takesReligion: boolean) => void;
}
```

### TuitionInput
**Location**: `components/ui/TuitionInput.tsx` (unused)

**Purpose**: Input for tuition amount

**Props**:
```typescript
interface TuitionInputProps {
  value: number;
  onChange: (value: number) => void;
}
```

### CourseForm
**Location**: `components/ui/CourseForm.tsx` (unused)

**Purpose**: Form for course creation/editing

**Props**:
```typescript
interface CourseFormProps {
  course?: Course;
  onSubmit: (course: CourseData) => void;
}
```

### GradeAssignmentCard
**Location**: `components/ui/GradeAssignmentCard.tsx` (unused)

**Purpose**: Card for grade assignment

**Props**:
```typescript
interface GradeAssignmentCardProps {
  student: Student;
  course: string;
  week: number;
  onGradeAssign: (grade: string) => void;
}
```

## Component Patterns

### Container/Presentational Pattern
```typescript
// Container component (handles logic)
export default function AdminDashboard() {
  const { data, isLoading } = useAdminStudents();
  return <AdminStudentTable students={data} />;
}

// Presentational component (handles display)
export default function AdminStudentTable({ students }) {
  // Display logic only
}
```

### Compound Component Pattern
```typescript
// Parent component
export default function StatsGrid({ stats, columns = 4 }) {
  return (
    <div className={`grid grid-cols-${columns} gap-6`}>
      {stats.map(stat => <StatsCard key={stat.id} {...stat} />)}
    </div>
  );
}

// Child component
export default function StatsCard({ icon, title, value }) {
  return (
    <div className="bg-white rounded-lg p-6">
      {/* Card content */}
    </div>
  );
}
```

### Higher-Order Component Pattern
```typescript
// HOC for authentication
function withAuth<P>(Component: React.ComponentType<P>) {
  return (props: P) => {
    const { isAuthenticated } = useAuthStore();
    if (!isAuthenticated) return <Navigate to="/login" />;
    return <Component {...props} />;
  };
}

// Usage
export default withAuth(ProtectedComponent);
```

### Custom Hook Pattern
```typescript
// Custom hook for data fetching
function useStudents(filters?: StudentFilters) {
  return useQuery({
    queryKey: ['students', filters],
    queryFn: () => fetchStudents(filters),
  });
}

// Usage in component
export default function StudentList() {
  const { data, isLoading } = useStudents();
  // Component logic
}
```

## Styling Guidelines

### TailwindCSS Usage
- Use utility classes for styling
- Follow mobile-first responsive design
- Use semantic color names
- Maintain consistent spacing scale
- Use Tailwind's arbitrary values sparingly

### Color Palette
```css
/* Primary Colors */
bg-blue-500 text-blue-500
bg-green-500 text-green-500
bg-red-500 text-red-500
bg-yellow-500 text-yellow-500

/* Neutral Colors */
bg-gray-100 text-gray-900
bg-white text-white
bg-black text-black

/* Semantic Colors */
bg-success text-success
bg-error text-error
bg-warning text-warning
```

### Spacing Scale
```css
/* Tailwind spacing scale */
p-1 (4px)
p-2 (8px)
p-4 (16px)
p-6 (24px)
p-8 (32px)
```

### Typography Scale
```css
/* Font sizes */
text-xs (12px)
text-sm (14px)
text-base (16px)
text-lg (18px)
text-xl (20px)
text-2xl (24px)
```

### Responsive Design
```css
/* Mobile-first approach */
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4"

/* Breakpoints */
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

### Animation Guidelines
- Use Framer Motion for animations
- Keep animations subtle and purposeful
- Respect user's motion preferences
- Provide loading states
- Use transitions for smooth interactions

```typescript
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
>
  {/* Content */}
</motion.div>
```

## Component Best Practices

### Performance
- Use React.memo for expensive components
- Use useMemo for expensive calculations
- Use useCallback for stable function references
- Avoid unnecessary re-renders
- Lazy load heavy components

### Accessibility
- Use semantic HTML elements
- Add ARIA attributes where needed
- Ensure keyboard navigation
- Provide alt text for images
- Maintain color contrast ratios

### Type Safety
- Define TypeScript interfaces for props
- Use proper type annotations
- Avoid `any` type
- Use type guards for runtime checks
- Leverage TypeScript's type inference

### Error Handling
- Add error boundaries
- Provide fallback UI
- Log errors appropriately
- Show user-friendly error messages
- Implement retry mechanisms

### Testing
- Write unit tests for utilities
- Write integration tests for components
- Test component props
- Test user interactions
- Mock external dependencies

## Component Development Workflow

### Creating a New Component

1. **Create Component File**
```bash
# Create in appropriate directory
touch components/shared/YourComponent.tsx
```

2. **Define Component Interface**
```typescript
interface YourComponentProps {
  // Props interface
}
```

3. **Implement Component**
```typescript
'use client'; // Add if using hooks
import React from 'react';

export default function YourComponent({ prop }: YourComponentProps) {
  // Component logic
  return <div>{/* JSX */}</div>;
}
```

4. **Add Styling**
```typescript
return (
  <div className="flex items-center gap-4 p-4 bg-white rounded-lg">
    {/* Content */}
  </div>
);
```

5. **Export from Index** (if needed)
```typescript
// Create index.ts
export { default as YourComponent } from './YourComponent';
```

6. **Add Documentation**
```typescript
/**
 * YourComponent - Brief description
 * 
 * @param prop - Description of prop
 * @returns JSX element
 */
```

7. **Test Component**
```typescript
// Write tests
import { render, screen } from '@testing-library/react';
import YourComponent from './YourComponent';

test('renders correctly', () => {
  render(<YourComponent prop="value" />);
  expect(screen.getByText('value')).toBeInTheDocument();
});
```

## Component Maintenance

### Updating Components
- Update TypeScript interfaces when props change
- Update documentation
- Add deprecation warnings for breaking changes
- Maintain backward compatibility when possible
- Update tests

### Deprecating Components
- Add deprecation notice in comments
- Document replacement component
- Update consuming code
- Remove after deprecation period
- Update documentation

## Resources

### Component Libraries
- [shadcn/ui](https://ui.shadcn.com/) - Component library inspiration
- [Radix UI](https://www.radix-ui.com/) - Unstyled components
- [Headless UI](https://headlessui.com/) - Unstyled components

### Documentation
- [React Documentation](https://react.dev)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [Framer Motion Documentation](https://www.framer.com/motion/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

### Tools
- [Storybook](https://storybook.js.org/) - Component development
- [React DevTools](https://react.dev/learn/react-developer-tools) - Debugging
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/) - Browser debugging
