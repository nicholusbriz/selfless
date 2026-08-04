Selfless Student Portal
A comprehensive multi-tenant student management system built with Next.js, MongoDB, and Prisma.

Overview
The Selfless Student Portal is a multi-tenant platform designed to streamline student management, academic tracking, and community engagement. The system supports multiple tech centers (tenants) with independent data isolation while maintaining a unified user experience.

Key Features
Student Management
User Profiles - Complete student profiles with personal information, academic details, and social links

Role-Based Access - Super admin, admin, teacher, and student roles with granular permissions

OAuth Support - GitHub and Google authentication integration

Multi-Tenant Architecture - Each tech center operates independently with isolated data

Academic Features
Course Enrollment - Students can enroll in courses with tuition tracking

Grade Management - Teachers can assign and manage student grades

Course Unit Tracking - Monitor course credits and academic progress

Academic Status - Track enrollment status (active, completed, dropped)

Cleaning Management
Weekly Schedule - Manage cleaning schedules on a weekly basis

Day Registration - Students can register for specific cleaning days

Capacity Management - Set and track capacity limits for each cleaning day

Attendance Tracking - Mark attendance with PENDING, ATTENDED, or NO_SHOW status

Communication
Announcements - Create and publish announcements (global or tech-center specific)

Notifications - Real-time user notifications

Activity Logging - Complete audit trail of user actions

Sports & Teams
Football Team Management - Track players, jersey numbers, and positions

General Team Memberships - Support for multiple sports (football, volleyball, netball, basketball, athletics)

Team Roles - Players, coaches, kit managers, cheerleaders, team managers, medical staff, referees

AI Assistant Integration
AI Conversations - Persistent chat history with context tracking

Learning Profiles - Track user learning patterns and preferences

Knowledge Base - Custom data storage with vector embeddings for semantic search

Document Chunking - Efficient document processing for RAG (Retrieval-Augmented Generation)

Database Schema
The system uses MongoDB as the primary database with Prisma as the ORM. Key schema components include:

Core Tables
User - Main user table with OAuth support, role assignments, and tech center associations

Role - Role definitions with granular permissions

TechCenter - Multi-tenant isolation with country associations

Country - Country definitions for tech center organization

Academic Tables
StudentCourse - Student course enrollments with status tracking

Grade - Grade assignments with teacher and student relationships

GradeScale - Standardized grading system

Cleaning Management Tables
Week - Weekly schedule management

CleaningDay - Individual day scheduling with capacity and registration tracking

CleaningRegistration - Student registrations for cleaning days

AttendanceRecord - Attendance tracking with status management

Communication & Analytics Tables
Announcement - System announcements with scheduling and expiration

Notification - User notifications with read status

ActivityLog - Complete audit trail of system actions

Sports Tables
FootballTeam - Football-specific player tracking

TeamMembership - General team memberships with sport and role definitions

AI Tables
AIConversation - Chat history with message storage

AILearningProfile - User learning patterns and preferences

AIKnowledgeBase - Custom knowledge base with embeddings

AIKnowledgeChunk - Document chunks for efficient retrieval

Technology Stack
Next.js - Full-stack React framework

MongoDB - NoSQL database for flexible schema

Prisma - Type-safe database ORM

NextAuth.js - Authentication with OAuth support

TypeScript - Type-safe development

Multi-Tenant Architecture
The platform implements a true multi-tenant architecture where:

Each tech center has complete data isolation

Users can be assigned to specific tech centers

All major entities (courses, announcements, cleaning) are scoped to tech centers

Super admins can manage all tech centers while regular admins operate within their tech center

Getting Started
Clone the repository

Install dependencies: npm install

Configure environment variables (DATABASE_URL, NEXTAUTH_SECRET, etc.)

Run database migrations: npx prisma db push

Start development server: npm run dev

Deployment
The application is ready for deployment on any platform that supports Next.js applications, including Vercel, Netlify, or traditional hosting environments.

License
This project is proprietary and confidential.