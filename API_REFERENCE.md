# API Reference Documentation

## Table of Contents
1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Admin API](#admin-api)
4. [Student API](#student-api)
5. [Teacher API](#teacher-api)
6. [Cleaning Management API](#cleaning-management-api)
7. [Contact API](#contact-api)
8. [Overview API](#overview-api)
9. [Error Handling](#error-handling)
10. [Rate Limiting](#rate-limiting)

## Overview

### Base URL
- Development: `http://localhost:3000`
- Production: `https://selfless-henna.vercel.app`

### Authentication
All protected endpoints require authentication via HTTP-only JWT cookie. The authentication middleware sets the following headers:
- `x-user-id`: User ID from decoded JWT
- `x-user-role`: User role from decoded JWT

### Response Format
All API responses follow this structure:

**Success Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

### HTTP Status Codes
- `200 OK`: Successful GET/PUT/DELETE
- `201 Created`: Successful POST
- `400 Bad Request`: Invalid input or validation error
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

## Authentication

### POST /api/auth/login
Authenticate user with email and receive JWT token.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "user_id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phoneNumber": "+256761996296",
    "role": {
      "id": "role_id",
      "name": "student",
      "permissions": ["read", "submit_assignments", "view_grades"]
    },
    "studentProfile": {
      "id": "profile_id",
      "studentId": "STU2024001",
      "takesReligion": false,
      "tuition": null,
      "tuitionPaid": false,
      "currentGPA": 0,
      "totalCredits": 0
    }
  }
}
```

**Headers:**
- `Set-Cookie`: `token=<jwt_token>; HttpOnly; Secure; SameSite=lax; Max-Age=604800; Path=/`

**Rate Limiting:** 5 requests per minute per IP/email

### POST /api/auth/register
Register a new user account (creates student profile by default).

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "phoneNumber": "+256761996296"
}
```

**Validation Rules:**
- Email: Valid email format, converted to lowercase
- Password: Minimum 6 characters, at least 1 letter and 1 number
- Phone Number: Digits, spaces, hyphens, plus signs, parentheses only
- Name: 2-50 characters, letters, spaces, hyphens, apostrophes only

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Registration successful",
  "user": {
    "id": "user_id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": {
      "id": "role_id",
      "name": "student"
    },
    "studentProfile": {
      "id": "profile_id",
      "studentId": "STU2024001",
      "takesReligion": false,
      "tuition": null,
      "tuitionPaid": false,
      "currentGPA": 0,
      "totalCredits": 0
    }
  }
}
```

**Headers:**
- `Set-Cookie`: `token=<jwt_token>; HttpOnly; Secure; SameSite=lax; Max-Age=604800; Path=/`

**Rate Limiting:** 5 requests per minute per IP/email

### GET /api/auth/me
Get current authenticated user information.

**Authentication:** Required

**Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": {
      "id": "role_id",
      "name": "student"
    },
    "studentProfile": { ... }
  }
}
```

### POST /api/auth/logout
Logout user and clear authentication cookie.

**Authentication:** Required

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Headers:**
- `Set-Cookie`: `token=; HttpOnly; Secure; SameSite=lax; Max-Age=0; Path=/`

## Admin API

### GET /api/admin/students
Get all students with optional filters.

**Authentication:** Required (Admin, Teacher, or Student)

**Query Parameters:**
- `gpaMin` (number, optional): Minimum GPA filter
- `gpaMax` (number, optional): Maximum GPA filter
- `search` (string, optional): Search in name or email
- `role` (string, optional): Filter by role ("student", "teacher", "admin", "all")

**Response (200 OK):**
```json
{
  "students": [
    {
      "id": "user_id",
      "name": "John Doe",
      "studentId": "STU2024001",
      "studentProfileId": "profile_id",
      "email": "john@example.com",
      "phoneNumber": "+256761996296",
      "roleId": "role_id",
      "role": {
        "id": "role_id",
        "name": "student"
      },
      "currentGPA": 3.5,
      "totalCredits": 12,
      "coursesCount": 4,
      "tuition": 500000,
      "tuitionPaid": true,
      "enrolledCourses": [ ... ],
      "existingGrades": [ ... ]
    }
  ]
}
```

### PUT /api/admin/students?id={id}
Update student information.

**Authentication:** Required (Admin only)

**Query Parameters:**
- `id` (string, required): Student profile ID or user ID

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phoneNumber": "+256761996296"
}
```

**Response (200 OK):**
```json
{
  "user": {
    "id": "user_id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phoneNumber": "+256761996296"
  }
}
```

### DELETE /api/admin/students?id={id}
Delete a student and all associated data.

**Authentication:** Required (Admin only)

**Query Parameters:**
- `id` (string, required): Student profile ID or user ID

**Response (200 OK):**
```json
{
  "message": "Student deleted successfully"
}
```

**Note:** This cascades and deletes grades, enrolled courses, teacher-student assignments, profiles, and user record.

### GET /api/admin/reports/gpa-distribution
Get GPA distribution statistics.

**Authentication:** Required (Admin only)

**Response (200 OK):**
```json
{
  "distribution": {
    "3.5-4.0": 15,
    "3.0-3.49": 20,
    "2.5-2.99": 10,
    "2.0-2.49": 5,
    "Below 2.0": 2
  }
}
```

### GET /api/admin/reports/weekly-progress
Get weekly progress statistics.

**Authentication:** Required (Admin only)

**Response (200 OK):**
```json
{
  "weeklyProgress": [
    {
      "week": 1,
      "averageGPA": 3.2,
      "studentsGraded": 45
    }
  ]
}
```

### GET /api/admin/roles
Get all available roles.

**Authentication:** Required (Admin only)

**Response (200 OK):**
```json
{
  "roles": [
    {
      "id": "role_id",
      "name": "admin",
      "permissions": ["read", "write", "delete", "manage_users"]
    }
  ]
}
```

## Student API

### GET /api/student/grades
Get all grades for the authenticated student.

**Authentication:** Required (Student or Admin)

**Response (200 OK):**
```json
{
  "grades": [
    {
      "id": "grade_id",
      "studentId": "profile_id",
      "courseId": "course_id",
      "week": 1,
      "gradeLetter": "A",
      "gradePoints": 4.0,
      "assignedBy": "teacher_id",
      "assignedAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

### GET /api/student/courses
Get all enrolled courses for the authenticated student.

**Authentication:** Required (Student)

**Response (200 OK):**
```json
{
  "courses": [
    {
      "id": "course_id",
      "courseName": "Introduction to Programming",
      "credits": 3,
      "status": "active"
    }
  ]
}
```

### GET /api/student/profile
Get student profile information.

**Authentication:** Required (Student)

**Response (200 OK):**
```json
{
  "profile": {
    "id": "profile_id",
    "studentId": "STU2024001",
    "takesReligion": false,
    "tuition": 500000,
    "tuitionPaid": true,
    "currentGPA": 3.5,
    "totalCredits": 12
  }
}
```

## Teacher API

### GET /api/teacher/students
Get students assigned to the authenticated teacher.

**Authentication:** Required (Teacher or Admin)

**Response (200 OK):**
```json
{
  "students": [
    {
      "id": "user_id",
      "name": "John Doe",
      "studentId": "STU2024001",
      "email": "john@example.com",
      "currentGPA": 3.5
    }
  ]
}
```

### GET /api/teacher/assignments
Get assignments for the authenticated teacher.

**Authentication:** Required (Teacher)

**Response (200 OK):**
```json
{
  "assignments": [
    {
      "id": "assignment_id",
      "title": "Week 1 Assignment",
      "dueDate": "2024-01-20T23:59:59Z"
    }
  ]
}
```

### GET /api/teacher/grades
Get grades submitted by students.

**Authentication:** Required (Teacher)

**Response (200 OK):**
```json
{
  "grades": [
    {
      "id": "grade_id",
      "student": {
        "id": "user_id",
        "name": "John Doe",
        "studentId": "STU2024001"
      },
      "course": "Introduction to Programming",
      "week": 1,
      "gradeLetter": "A",
      "gradePoints": 4.0
    }
  ]
}
```

## Cleaning Management API

### GET /api/cleaning/weeks
Get all cleaning weeks.

**Authentication:** Required

**Response (200 OK):**
```json
{
  "weeks": [
    {
      "id": "week_id",
      "startDate": "2024-01-15T00:00:00Z",
      "endDate": "2024-01-19T23:59:59Z",
      "weekLabel": "Week 3 - January 2024",
      "isActive": true,
      "registrationEnabled": true,
      "registrationDeadline": "2024-01-14T23:59:59Z"
    }
  ]
}
```

### POST /api/cleaning/weeks
Create a new cleaning week.

**Authentication:** Required (Admin)

**Request Body:**
```json
{
  "startDate": "2024-01-22T00:00:00Z",
  "endDate": "2024-01-26T23:59:59Z",
  "weekLabel": "Week 4 - January 2024",
  "registrationDeadline": "2024-01-21T23:59:59Z"
}
```

**Response (201 Created):**
```json
{
  "week": {
    "id": "week_id",
    "startDate": "2024-01-22T00:00:00Z",
    "endDate": "2024-01-26T23:59:59Z",
    "weekLabel": "Week 4 - January 2024",
    "isActive": true,
    "registrationEnabled": true,
    "registrationDeadline": "2024-01-21T23:59:59Z"
  }
}
```

### POST /api/cleaning/register
Register student for a cleaning day.

**Authentication:** Required (Student)

**Request Body:**
```json
{
  "cleaningDayId": "day_id"
}
```

**Response (201 Created):**
```json
{
  "id": "registration_id",
  "userId": "user_id",
  "cleaningDayId": "day_id",
  "registeredAt": "2024-01-14T10:00:00Z",
  "cleaningDay": { ... }
}
```

**Validation Rules:**
- Student can only register for one day globally
- Registration must be enabled for the week
- Registration deadline must not have passed
- Day must be open and not full
- Capacity must not be exceeded

### DELETE /api/cleaning/register
Unregister student from cleaning day.

**Authentication:** Required (Student)

**Response (200 OK):**
```json
{
  "success": true
}
```

### GET /api/cleaning/student
Get student's cleaning registration.

**Authentication:** Required (Student)

**Response (200 OK):**
```json
{
  "registration": {
    "id": "registration_id",
    "cleaningDayId": "day_id",
    "registeredAt": "2024-01-14T10:00:00Z",
    "cleaningDay": { ... }
  }
}
```

### POST /api/cleaning/attendance
Mark attendance for a cleaning day.

**Authentication:** Required (Admin or Teacher)

**Request Body:**
```json
{
  "cleaningDayId": "day_id",
  "userId": "user_id",
  "status": "ATTENDED",
  "notes": "Optional notes"
}
```

**Response (201 Created):**
```json
{
  "attendance": {
    "id": "attendance_id",
    "userId": "user_id",
    "cleaningDayId": "day_id",
    "status": "ATTENDED",
    "markedBy": "admin_id",
    "markedAt": "2024-01-15T14:00:00Z"
  }
}
```

**Attendance Status Values:**
- `PENDING`: Not yet marked
- `ATTENDED`: Student attended
- `NO_SHOW`: Student did not attend

## Contact API

### POST /api/contact
Submit contact form message.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phoneNumber": "+256761996296",
  "message": "I have a question about the program"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Contact form submitted successfully"
}
```

## Overview API

### GET /api/overview
Get overview dashboard data with statistics.

**Authentication:** Required

**Response (200 OK):**
```json
{
  "students": [
    {
      "id": "user_id",
      "name": "John Doe",
      "studentId": "STU2024001",
      "currentGPA": 3.5,
      "totalCredits": 12,
      "coursesCount": 4,
      "tuition": 500000,
      "tuitionPaid": true,
      "takesReligion": false,
      "tutor": { ... },
      "hasTutor": true
    }
  ],
  "statistics": {
    "totalStudents": 52,
    "studentsWithTutor": 45,
    "studentsWithoutTutor": 7,
    "tuitionPaidCount": 40,
    "tuitionUnpaidCount": 12,
    "gpaDistribution": { ... },
    "courseDepartments": { ... },
    "tutorGroups": { ... },
    "averageGPA": "3.42",
    "attendanceRate": "85.5"
  }
}
```

## Error Handling

### Standard Error Response
```json
{
  "success": false,
  "message": "Human-readable error message",
  "error": "Technical error details (in development)"
}
```

### Common Error Scenarios

**400 Bad Request:**
- Invalid input data
- Validation errors
- Missing required fields

**401 Unauthorized:**
- Missing authentication cookie
- Invalid or expired JWT token
- Token verification failed

**403 Forbidden:**
- Insufficient permissions for requested action
- Role-based access control violation

**404 Not Found:**
- Resource does not exist
- Invalid ID or reference

**429 Too Many Requests:**
```json
{
  "success": false,
  "message": "Too many requests. Please try again later.",
  "resetTime": "2024-01-15T10:05:00Z"
}
```

**500 Internal Server Error:**
- Unexpected server error
- Database connection issues
- External service failures

## Rate Limiting

### Rate Limiting Strategy
- **Authentication endpoints**: 5 requests per minute per IP/email
- **General API endpoints**: No rate limiting (handled by authentication)
- **Identifier-based**: Uses IP address and email for rate limit keys

### Rate Limit Response
When rate limit is exceeded:
```json
{
  "success": false,
  "message": "Too many requests. Please try again later.",
  "resetTime": "2024-01-15T10:05:00Z"
}
```

### Implementation
Rate limiting is implemented in `lib/rateLimit.ts` using in-memory storage. For production, consider using Redis for distributed rate limiting.

## API Route Structure

```mermaid
graph TD
    A[/api/auth] --> A1[POST /login]
    A --> A2[POST /register]
    A --> A3[GET /me]
    A --> A4[POST /logout]
    
    B[/api/admin] --> B1[GET /students]
    B --> B2[PUT /students?id]
    B --> B3[DELETE /students?id]
    B --> B4[GET /reports/gpa-distribution]
    B --> B5[GET /reports/weekly-progress]
    B --> B6[GET /roles]
    B --> B7[GET /teachers]
    
    C[/api/student] --> C1[GET /grades]
    C --> C2[GET /courses]
    C --> C3[GET /courses/id]
    C --> C4[GET /profile]
    
    D[/api/teacher] --> D1[GET /students]
    D --> D2[GET /assignments]
    D --> D3[GET /assignments/id]
    D --> D4[GET /grades]
    
    E[/api/cleaning] --> E1[GET /weeks]
    E --> E2[POST /weeks]
    E --> E3[GET /weeks/id]
    E --> E4[GET /days/id]
    E --> E5[PUT /days/id]
    E --> E6[POST /register]
    E --> E7[DELETE /register]
    E --> E8[GET /student]
    E --> E9[GET /teacher]
    E --> E10[GET /admin]
    E --> E11[POST /attendance]
    E --> E12[POST /manual-assign]
    
    F[/api/contact] --> F1[POST /]
    F --> F2[GET /id]
    
    G[/api/overview] --> G1[GET /]
```
