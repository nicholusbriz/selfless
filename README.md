# Selfless Student Portal

A multi-tenant academic management system built with Next.js 16, MongoDB, and Prisma ORM. The platform serves multiple tech centers with role-based access for Super Admins, Admins, Teachers, and Students, providing comprehensive tools for academic management, student interaction, and administrative oversight.

## Project Overview

The Selfless Student Portal is a centralized multi-tenant platform for students across all Selfless CE Tech Centers. Students can track BYU-Idaho courses and credits, receive tutor feedback, participate in daily chores, communicate with peers, access organizational policies, receive announcements, and manage their academic journey through one centralized student portal.

## Technology Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5.9.3
- **UI Library**: React 19
- **Styling**: TailwindCSS 3.4.17
- **State Management**: Zustand 5.0.14
- **Data Fetching**: TanStack React Query 5.0.0
- **Animations**: Framer Motion 12.42.2
- **Charts**: Recharts 3.8.1
- **Icons**: Lucide React 1.17.0
- **Forms**: Zod 4.4.3 (validation)

### Backend
- **Runtime**: Next.js API Routes (Edge & Node.js)
- **Database**: MongoDB
- **ORM**: Prisma 5.22.0
- **Authentication**: JWT (jsonwebtoken 9.0.2, jose 6.2.3) + NextAuth 4.24.11
- **Password Hashing**: bcryptjs 2.4.3
- **HTTP Client**: Axios 1.18.1
- **AI Integration**: LangChain 0.1.0, Transformers 2.17.2

## Project Structure and Folder Connections

```
my-app/
├── app/                                    # Next.js App Router (Main Application)
│   ├── api/                                # API Routes (Backend Endpoints)
│   │   ├── admin/                         # Admin-specific APIs
│   │   │   ├── cleaning/                  # Cleaning management endpoints
│   │   │   │   ├── route.ts              # Main cleaning endpoint
│   │   │   │   ├── assign/               # Student assignment
│   │   │   │   ├── attendance/           # Attendance tracking
│   │   │   │   ├── change/               # Change assignments
│   │   │   │   ├── days/[dayId]/         # Specific day management
│   │   │   │   ├── manual-assign/        # Manual assignment override
│   │   │   │   ├── remove/[userId]/      # Remove user assignment
│   │   │   │   ├── remove-student/       # Remove student
│   │   │   │   └── weeks/[weekId]/       # Week management
│   │   │   ├── countries/                # Country management
│   │   │   ├── embed-knowledge/          # AI knowledge embedding
│   │   │   ├── logs/                     # System activity logs
│   │   │   ├── tech-centers/             # Tech center management
│   │   │   │   ├── route.ts             # Main tech centers endpoint
│   │   │   │   ├── [id]/                 # Specific tech center
│   │   │   │   ├── me/                   # Current user's tech center
│   │   │   │   │   ├── route.ts         # Tech center info
│   │   │   │   │   ├── edit/            # Edit tech center
│   │   │   │   │   └── stats/           # Tech center statistics
│   │   │   │   └── users/               # Tech center users
│   │   │   │       ├── route.ts         # Get tech center users
│   │   │   │       └── [userId]/        # User management
│   │   │   │           ├── route.ts     # User details
│   │   │   │           ├── role/        # Update user role
│   │   │   │           └── status/      # Update user status
│   │   │   └── users/                   # Global user management
│   │   │       ├── route.ts             # Get all users
│   │   │       └── [userId]/            # User operations
│   │   │           ├── route.ts         # User details
│   │   │           ├── role/            # Update role
│   │   │           └── status/          # Update status
│   │   ├── ai/                           # AI Assistant APIs
│   │   │   ├── chat/                    # Chat endpoint
│   │   │   ├── conversation-history/    # Chat history
│   │   │   ├── knowledge-base/          # Knowledge management
│   │   │   │   ├── route.ts            # Knowledge CRUD
│   │   │   │   ├── search/              # Search knowledge
│   │   │   │   └── [id]/                # Specific knowledge
│   │   │   ├── log-usage/               # AI usage logging
│   │   │   ├── status/                  # AI service status
│   │   │   └── user-context/            # User context for AI
│   │   ├── announcements/               # Announcement system
│   │   │   ├── route.ts                 # Get/create announcements
│   │   │   └── [announcementId]/        # Announcement operations
│   │   ├── auth/                         # Authentication (NextAuth + JWT)
│   │   │   ├── login/                   # User login
│   │   │   ├── logout/                  # User logout
│   │   │   ├── me/                      # Current user info
│   │   │   └── register/                # User registration
│   │   ├── cleaning/                     # Student cleaning operations
│   │   │   ├── change-day/              # Change cleaning day
│   │   │   ├── register/                # Register for cleaning
│   │   │   └── student/                 # Student cleaning info
│   │   ├── football-team/                # Sports team management
│   │   │   ├── leave/                   # Leave football team
│   │   │   ├── register/                # Register for team
│   │   │   ├── update/                  # Update team info
│   │   │   └── [techCenterId]/          # Team by tech center
│   │   ├── notifications/                # Notification system
│   │   │   ├── route.ts                 # Get notifications
│   │   │   ├── mark-all-read/           # Mark all as read
│   │   │   └── [notificationId]/        # Notification operations
│   │   ├── student-courses/              # Academic course management
│   │   │   ├── route.ts                 # Get/create courses
│   │   │   └── [courseId]/              # Course operations
│   │   ├── students/                     # Student data operations
│   │   │   ├── route.ts                 # Get all students
│   │   │   └── [studentId]/             # Student details
│   │   ├── team/                         # General team management
│   │   │   ├── register/                # Register for team
│   │   │   └── [techCenterId]/          # Team operations
│   │   │       └── [teamType]/          # Team by type
│   │   ├── tech-centers/                 # Public tech center info
│   │   └── user/                         # User profile operations
│   │       ├── academic-settings/       # Academic settings
│   │       ├── change-password/         # Password change
│   │       └── update/                  # Profile update
│   ├── dashboard/                        # Dashboard Pages (Frontend)
│   │   ├── layout.tsx                    # Dashboard layout
│   │   ├── page.tsx                      # Dashboard home
│   │   ├── admin/                       # Admin dashboard pages
│   │   │   ├── page.tsx                # Admin home
│   │   │   ├── cleaning/               # Cleaning management
│   │   │   ├── components/              # Admin components
│   │   │   │   └── TechCenterStats.tsx # Stats component
│   │   │   ├── teachers/                # Teacher management
│   │   │   ├── tech-centers/            # Tech center management
│   │   │   │   ├── page.tsx            # Tech centers list
│   │   │   │   └── edit/               # Edit tech center
│   │   │   └── users/                  # User management
│   │   ├── super-admin/                 # Super admin pages
│   │   │   ├── page.tsx                # Super admin home
│   │   │   ├── centers/                # Center management
│   │   │   │   ├── page.tsx            # Centers list
│   │   │   │   └── create/             # Create center
│   │   │   ├── knowledge-base/          # AI knowledge management
│   │   │   ├── logs/                   # System logs
│   │   │   ├── settings/               # System settings
│   │   │   └── users/                  # User management
│   │   ├── teacher/                     # Teacher dashboard pages
│   │   │   ├── page.tsx                # Teacher home
│   │   │   ├── grades/                 # Grade management
│   │   │   └── students/               # Student management
│   │   ├── ai/                          # AI chat interface
│   │   ├── announcements/               # Announcements page
│   │   ├── cleaning/                    # Cleaning management page
│   │   ├── courses/                     # Course management page
│   │   ├── football-team/               # Football team page
│   │   ├── grades/                      # Grades page
│   │   ├── internships/                 # Internship page
│   │   │   └── applications/           # Internship applications
│   │   ├── notifications/               # Notifications page
│   │   ├── overview/                    # Overview page
│   │   ├── profile/                     # User profile page
│   │   ├── settings/                    # Settings page
│   │   ├── students/                    # Students listing page
│   │   │   └── [studentId]/            # Student details
│   │   ├── support-groups/              # Support groups page
│   │   └── temple-trips/                # Temple trips page
│   ├── components/                       # Landing page components
│   │   ├── AcademicFeatures.tsx         # Academic features section
│   │   ├── CommunityFeatures.tsx        # Community features
│   │   ├── CoverContent.tsx            # Cover content
│   │   ├── CTASection.tsx              # Call to action
│   │   ├── DashboardPreview.tsx        # Dashboard preview
│   │   ├── FAQ.tsx                     # FAQ section
│   │   ├── FixedHeader.tsx             # Fixed header
│   │   ├── Footer.tsx                  # Footer component
│   │   ├── PortalOverview.tsx          # Portal overview
│   │   ├── StudentJourney.tsx          # Student journey
│   │   ├── Testimonials.tsx            # Testimonials
│   │   ├── TrustedSection.tsx          # Trusted section
│   │   └── WhyChoosePortal.tsx         # Why choose section
│   ├── layout.tsx                       # Root layout with providers
│   ├── page.tsx                         # Landing page
│   ├── providers.tsx                    # React Query & Session providers
│   ├── globals.css                      # Global styles
│   ├── favicon.ico                      # Favicon
│   ├── not-found.tsx                    # 404 page
│   ├── robots.ts                        # Robots.txt
│   └── sitemap.ts                       # Sitemap
├── components/                           # Shared React Components
│   ├── auth/                           # Authentication components
│   │   ├── AuthModal.tsx              # Authentication modal
│   │   └── TeamRoleSelector.tsx       # Team role selector
│   ├── CleaningRota.tsx                # Cleaning rota component
│   ├── PWAInstall.tsx                  # PWA install component
│   └── QueryProvider.tsx               # Query provider
├── hooks/                               # Custom React Hooks
│   ├── useAdminUsers.ts               # Admin users hook
│   ├── useAIKnowledgeBase.ts          # AI knowledge base hook
│   ├── useAIUserData.ts               # AI user data hook
│   ├── useCleaning.ts                 # Cleaning data hook
│   ├── useCleaningStudent.ts          # Cleaning student hook
│   ├── useCourses.ts                  # Course data hook
│   ├── useDebounce.ts                 # Debounce utility
│   ├── useFootballTeam.ts             # Football team hook
│   ├── useNotifications.ts             # Notifications hook
│   ├── useSuperAdminUsers.ts          # Super admin users hook
│   └── useTeam.ts                     # Team management hook
├── lib/                                 # Utility Libraries & Services
│   ├── api/                           # API client functions
│   │   ├── admin-tech-center-users.ts # Admin tech center users
│   │   ├── admin-tech-center.ts       # Admin tech center
│   │   ├── admin-users.ts             # Admin users
│   │   ├── tech-center-users.ts       # Tech center users
│   │   └── tech-centers.ts            # Tech centers
│   ├── auth/                          # Authentication utilities
│   │   ├── nextauth.ts                # NextAuth configuration
│   │   ├── server.ts                  # Server-side auth
│   │   └── types.ts                   # Auth types
│   ├── hooks/                         # Library hooks
│   │   └── useAuth.ts                 # Auth hook
│   ├── services/                      # Business Logic Services
│   │   ├── embedding-service.ts       # AI embeddings
│   │   ├── knowledge-retriever.ts    # Knowledge retrieval
│   │   └── rag-service.ts             # RAG AI service
│   ├── prisma/                        # Prisma database client
│   │   └── client.ts                  # Prisma client singleton
│   ├── axios.ts                       # Axios HTTP client configuration
│   ├── gpa-calculator.ts              # GPA calculation logic
│   ├── logger.ts                      # Logging utility
│   ├── notifications.ts               # Notification utilities
│   ├── profile-completeness.ts       # Profile completion logic
│   ├── supabase.ts                    # Supabase integration
│   └── utils.ts                       # General utilities
├── prisma/                             # Database Schema & Migrations
│   ├── schema.prisma                  # Database schema definition
│   ├── seed-ai-knowledge.ts           # AI knowledge base seeding
│   ├── migrate-football-team.ts        # Football team migration
│   ├── test-database.js               # Database testing
│   ├── update-all-users-football.ts   # Update users for football
│   └── update-existing-members-details.ts # Update member details
├── public/                             # Static Assets
│   ├── icon-*.png                     # App icons (various sizes)
│   ├── favicon.ico                    # Favicon
│   ├── manifest.json                  # PWA manifest
│   ├── sw.js                          # Service worker
│   ├── robots.txt                     # Robots.txt
│   ├── sitemap.xml                    # Sitemap
│   ├── seo-data.json                  # SEO data
│   ├── structured-data.json            # Structured data
│   ├── *.png                          # Various images (atbriz, freedom, etc.)
│   └── *.mp4                          # Video files
├── scripts/                            # Utility Scripts
│   ├── check-knowledge.ts             # Check knowledge base
│   └── test-ai-apis.js                # Test AI APIs
├── supabase/                           # Supabase Configuration
│   ├── 01-create-bucket.sql           # Create storage bucket
│   ├── 02-storage-policies.sql       # Storage policies
│   └── README.md                      # Supabase documentation
├── .env                                # Environment variables
├── .env.local                          # Local environment variables
├── .gitignore                          # Git ignore file
├── eslint.config.mjs                   # ESLint configuration
├── knip.json                           # Knip configuration
├── next-env.d.ts                       # Next.js environment types
├── next.config.js                      # Next.js configuration
├── package.json                       # Project dependencies
├── package-lock.json                   # Dependency lock file
│   ├── postcss.config.js               # PostCSS configuration
├── proxy.ts                            # Proxy configuration
├── tailwind.config.ts                  # TailwindCSS configuration
├── tsconfig.json                       # TypeScript configuration
├── vercel.json                         # Vercel deployment config
├── ATBRIZ_AI_GUIDE.md                  # AI guide documentation
├── DATABASE_ONLY_AI_SUMMARY.md         # AI summary documentation
└── README.md                           # Project documentation
```

### How Folders Connect

**Data Flow Architecture:**

1. **Frontend Pages** (`app/dashboard/`) → **Custom Hooks** (`hooks/`) → **API Routes** (`app/api/`) → **Database** (via Prisma)

2. **API Routes** (`app/api/`) → **Service Layer** (`lib/services/`) → **Database Client** (`lib/prisma/client.ts`) → **MongoDB**

3. **Authentication Flow:**
   - `app/api/auth/` → `lib/auth/nextauth.ts` → NextAuth configuration
   - `lib/hooks/useAuth.ts` → Authentication state management
   - `stores/authStore.ts` → Global auth state (Zustand)

4. **AI Integration:**
   - `app/api/ai/chat/route.ts` → `lib/services/rag-service.ts` → `lib/services/knowledge-retriever.ts` → `lib/services/embedding-service.ts`
   - Knowledge stored in MongoDB, retrieved via Prisma

5. **Data Fetching:**
   - Components use hooks from `hooks/` 
   - Hooks use React Query to call API routes
   - API routes use Prisma client to query MongoDB
   - Lib functions in `lib/api/` provide reusable API call logic

## API Endpoints

### Authentication Endpoints

#### `/api/auth/login` (POST)
- **Purpose**: User login with email and password
- **Request**: `{ email, password }`
- **Response**: `{ user, token }`

#### `/api/auth/register` (POST)
- **Purpose**: New user registration
- **Request**: `{ firstName, lastName, email, password, ... }`
- **Response**: `{ user, token }`

#### `/api/auth/logout` (POST)
- **Purpose**: User logout
- **Response**: `{ message }`

#### `/api/auth/me` (GET)
- **Purpose**: Get current authenticated user
- **Response**: `{ user }`

#### `/api/auth/[...nextauth]` (ALL)
- **Purpose**: NextAuth OAuth handling (GitHub, Google)
- **Response**: Session data

### Admin Endpoints

#### `/api/admin/users` (GET, POST)
- **Purpose**: Get all users or create new user
- **Response**: `{ users }` or `{ user }`

#### `/api/admin/users/[userId]` (GET, PUT, DELETE)
- **Purpose**: Manage specific user
- **Response**: `{ user }`

#### `/api/admin/users/[userId]/role` (PUT)
- **Purpose**: Update user role
- **Request**: `{ roleId }`
- **Response**: `{ user }`

#### `/api/admin/users/[userId]/status` (PUT)
- **Purpose**: Update user status
- **Request**: `{ status }`
- **Response**: `{ user }`

#### `/api/admin/tech-centers` (GET, POST)
- **Purpose**: Get all tech centers or create new one
- **Response**: `{ techCenters }` or `{ techCenter }`

#### `/api/admin/tech-centers/[id]` (GET, PUT, DELETE)
- **Purpose**: Manage specific tech center
- **Response**: `{ techCenter }`

#### `/api/admin/tech-centers/users` (GET)
- **Purpose**: Get users in tech center
- **Response**: `{ users }`

#### `/api/admin/tech-centers/users/[userId]` (GET, PUT, DELETE)
- **Purpose**: Manage tech center user
- **Response**: `{ user }`

#### `/api/admin/tech-centers/users/[userId]/role` (PUT)
- **Purpose**: Update tech center user role
- **Response**: `{ user }`

#### `/api/admin/tech-centers/users/[userId]/status` (PUT)
- **Purpose**: Update tech center user status
- **Response**: `{ user }`

#### `/api/admin/cleaning` (GET, POST)
- **Purpose**: Get cleaning schedule or create cleaning day
- **Response**: `{ cleaningDays }` or `{ cleaningDay }`

#### `/api/admin/cleaning/weeks` (GET, POST)
- **Purpose**: Manage cleaning weeks
- **Response**: `{ weeks }` or `{ week }`

#### `/api/admin/cleaning/weeks/[weekId]` (GET, PUT, DELETE)
- **Purpose**: Manage specific week
- **Response**: `{ week }`

#### `/api/admin/cleaning/days/[dayId]` (GET, PUT, DELETE)
- **Purpose**: Manage specific cleaning day
- **Response**: `{ cleaningDay }`

#### `/api/admin/cleaning/assign` (POST)
- **Purpose**: Assign student to cleaning day
- **Request**: `{ studentId, dayId }`
- **Response**: `{ assignment }`

#### `/api/admin/cleaning/manual-assign` (POST)
- **Purpose**: Manual assignment override
- **Request**: `{ studentId, dayId }`
- **Response**: `{ assignment }`

#### `/api/admin/cleaning/remove-student` (POST)
- **Purpose**: Remove student from cleaning
- **Request**: `{ studentId }`
- **Response**: `{ message }`

#### `/api/admin/cleaning/remove/[userId]` (DELETE)
- **Purpose**: Remove user assignment
- **Response**: `{ message }`

#### `/api/admin/cleaning/change` (POST)
- **Purpose**: Change cleaning assignment
- **Request**: `{ studentId, newDayId }`
- **Response**: `{ assignment }`

#### `/api/admin/cleaning/attendance` (POST)
- **Purpose**: Record cleaning attendance
- **Request**: `{ studentId, dayId, status }`
- **Response**: `{ attendance }`

#### `/api/admin/countries` (GET, POST)
- **Purpose**: Get countries or create country
- **Response**: `{ countries }` or `{ country }`

#### `/api/admin/logs` (GET)
- **Purpose**: Get system activity logs
- **Response**: `{ logs }`

#### `/api/admin/embed-knowledge` (POST)
- **Purpose**: Embed knowledge for AI
- **Request**: `{ knowledge }`
- **Response**: `{ embeddings }`

### AI Endpoints

#### `/api/ai/chat` (POST)
- **Purpose**: Chat with AI assistant
- **Request**: `{ message, conversationId }`
- **Response**: `{ response, conversationId }`

#### `/api/ai/knowledge-base` (GET, POST)
- **Purpose**: Get all knowledge or add new knowledge
- **Response**: `{ knowledge }` or `{ knowledge }`

#### `/api/ai/knowledge-base/[id]` (GET, PUT, DELETE)
- **Purpose**: Manage specific knowledge entry
- **Response**: `{ knowledge }`

#### `/api/ai/knowledge-base/search` (POST)
- **Purpose**: Search knowledge base
- **Request**: `{ query }`
- **Response**: `{ results }`

#### `/api/ai/conversation-history` (GET)
- **Purpose**: Get user conversation history
- **Response**: `{ conversations }`

#### `/api/ai/user-context` (GET)
- **Purpose**: Get user context for AI
- **Response**: `{ context }`

#### `/api/ai/log-usage` (POST)
- **Purpose**: Log AI usage
- **Request**: `{ interactionData }`
- **Response**: `{ success }`

#### `/api/ai/status` (GET)
- **Purpose**: Check AI service status
- **Response**: `{ status }`

### Announcement Endpoints

#### `/api/announcements` (GET, POST)
- **Purpose**: Get announcements or create announcement
- **Response**: `{ announcements }` or `{ announcement }`

#### `/api/announcements/[announcementId]` (GET, PUT, DELETE)
- **Purpose**: Manage specific announcement
- **Response**: `{ announcement }`

### Student Endpoints

#### `/api/students` (GET)
- **Purpose**: Get all students grouped by tech center
- **Response**: `{ studentsByTechCenter, techCenters, totalStudents }`

#### `/api/students/[studentId]` (GET)
- **Purpose**: Get specific student details
- **Response**: `{ student }`

### Course Endpoints

#### `/api/student-courses` (GET, POST)
- **Purpose**: Get student courses or add course
- **Response**: `{ courses }` or `{ course }`

#### `/api/student-courses/[courseId]` (GET, PUT, DELETE)
- **Purpose**: Manage specific course
- **Response**: `{ course }`

### Cleaning Endpoints

#### `/api/cleaning/register` (POST)
- **Purpose**: Student registers for cleaning
- **Request**: `{ preferredDay }`
- **Response**: `{ registration }`

#### `/api/cleaning/change-day` (POST)
- **Purpose**: Change cleaning day
- **Request**: `{ newDayId }`
- **Response**: `{ registration }`

#### `/api/cleaning/student` (GET)
- **Purpose**: Get student cleaning info
- **Response**: `{ cleaningInfo }`

### Football Team Endpoints

#### `/api/football-team/register` (POST)
- **Purpose**: Register for football team
- **Request**: `{ teamType, role }`
- **Response**: `{ membership }`

#### `/api/football-team/[techCenterId]` (GET)
- **Purpose**: Get football team for tech center
- **Response**: `{ team }`

#### `/api/football-team/update` (PUT)
- **Purpose**: Update football team info
- **Request**: `{ teamData }`
- **Response**: `{ team }`

#### `/api/football-team/leave` (POST)
- **Purpose**: Leave football team
- **Response**: `{ message }`

### Team Endpoints

#### `/api/team/register` (POST)
- **Purpose**: Register for general team
- **Request**: `{ teamType, role }`
- **Response**: `{ membership }`

#### `/api/team/[techCenterId]/[teamType]` (GET)
- **Purpose**: Get team by type
- **Response**: `{ team }`

### Notification Endpoints

#### `/api/notifications` (GET)
- **Purpose**: Get user notifications
- **Response**: `{ notifications }`

#### `/api/notifications/[notificationId]` (PUT)
- **Purpose**: Mark notification as read
- **Response**: `{ notification }`

#### `/api/notifications/mark-all-read` (POST)
- **Purpose**: Mark all notifications as read
- **Response**: `{ success }`

### User Management Endpoints

#### `/api/user/update` (PUT)
- **Purpose**: Update user profile
- **Request**: `{ profileData }`
- **Response**: `{ user }`

#### `/api/user/change-password` (POST)
- **Purpose**: Change user password
- **Request**: `{ currentPassword, newPassword }`
- **Response**: `{ success }`

#### `/api/user/academic-settings` (PUT)
- **Purpose**: Update academic settings
- **Request**: `{ academicData }`
- **Response**: `{ user }`

### Tech Center Endpoints

#### `/api/tech-centers` (GET)
- **Purpose**: Get all tech centers
- **Response**: `{ techCenters }`

## Database Schema

The platform uses MongoDB with Prisma ORM. Key models include:

### Core Models
- **User**: Users with roles, tech center associations, academic info
- **Role**: Role definitions (super_admin, admin, teacher, student)
- **TechCenter**: Multi-tenant tech center management
- **Country**: Geographic organization

### Academic Models
- **StudentCourse**: Course enrollment and tracking
- **Grade**: Academic performance tracking

### Operations Models
- **CleaningRegistration**: Cleaning schedule management
- **AttendanceRecord**: Attendance tracking
- **FootballTeam**: Sports team management
- **TeamMembership**: Team membership system
- **Announcement**: Communication system
- **Notification**: User notifications

### AI Models
- **AIConversation**: Chat history
- **AILearningProfile**: Personalized AI profiles
- **AIKnowledgeBase**: Database-driven knowledge management

### Authentication Models
- **Account/Session**: NextAuth OAuth integration
- **VerificationToken**: Email verification and password reset
- **ActivityLog**: System audit trail

## Step-by-Step Setup Guide

### Prerequisites
- Node.js 18.x or higher
- npm 9.x or higher
- MongoDB Atlas account or local MongoDB instance
- Git

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd my-app
```

### Step 2: Install Dependencies

```bash
npm install
```

This installs all required packages including:
- Next.js 16 and React 19
- TypeScript and TailwindCSS
- Prisma ORM and MongoDB client
- NextAuth for authentication
- React Query for data fetching
- AI libraries (LangChain, Transformers)
- Other utility libraries

### Step 3: Set Up Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database Connection
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/selfless-portal?retryWrites=true&w=majority
```
**Purpose**: Connection string to your MongoDB database. Required for all database operations.

```env
# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
```
**Purpose**: Secret key for JWT token generation and validation. Must be at least 32 characters for security. Used for user authentication.

```env
# API URL
NEXT_PUBLIC_API_URL=http://localhost:3000
```
**Purpose**: Public API URL accessible from the browser. Used for frontend API calls. Change to production domain when deploying.

```env
# Environment
NODE_ENV=development
```
**Purpose**: Sets the environment mode. Use 'development' for local development and 'production' for deployment.

```env
# NextAuth Configuration (Optional - for OAuth)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key
```
**Purpose**: NextAuth configuration for OAuth providers (GitHub, Google). Required if using OAuth authentication.

### Step 4: Generate Prisma Client

```bash
npx prisma generate
```

**Purpose**: Generates the Prisma client based on your schema. This creates the TypeScript types and database client used throughout the application.

### Step 5: Run Database Migrations

```bash
npx prisma migrate dev --name init
```

**Purpose**: Creates the database schema in MongoDB based on your Prisma schema file. Only needed for initial setup or schema changes.

### Step 6: Seed AI Knowledge Base (Optional)

```bash
npm run seed:ai
```

**Purpose**: Populates the AI knowledge base with initial knowledge entries. This enables the AI assistant to provide helpful responses.

### Step 7: Start Development Server

```bash
npm run dev
```

**Purpose**: Starts the Next.js development server with Turbopack for fast refresh. The application will be available at http://localhost:3000

### Step 8: Access the Application

Open your browser and navigate to:
- **Main Application**: http://localhost:3000
- **API Endpoints**: http://localhost:3000/api/*
- **Dashboard**: http://localhost:3000/dashboard (after login)

## Database Management Commands

```bash
# Open Prisma Studio (database GUI)
npx prisma studio

# Create a new migration
npx prisma migrate dev --name description

# Deploy migrations to production
npx prisma migrate deploy

# Regenerate Prisma client
npx prisma generate

# Reset database (development only - WARNING: deletes all data)
npx prisma migrate reset

# Pull database schema from database
npx prisma db pull

# Push schema changes to database (development only)
npx prisma db push
```

## Build and Deployment

### Build for Production

```bash
npm run build
```

**Purpose**: Creates an optimized production build of the application. This includes:
- TypeScript compilation
- Code optimization and minification
- Asset generation
- Server-side bundle creation

### Start Production Server

```bash
npm start
```

**Purpose**: Starts the production server. Requires running `npm run build` first.

### Production Environment Variables

For production deployment, update your `.env` file:

```env
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/selfless-portal?retryWrites=true&w=majority
JWT_SECRET=strong-random-production-secret-key-minimum-32-characters
NEXT_PUBLIC_API_URL=https://your-domain.com
NODE_ENV=production
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=strong-nextauth-production-secret
```

## Security Features

- JWT Authentication with secure token handling
- HTTP-only cookies to prevent XSS attacks
- Password hashing with bcrypt
- Role-based access control across all features
- Input validation with Zod schemas
- Prisma ORM parameterized queries to prevent injection
- Activity logging for audit trails
- NextAuth integration for OAuth providers

## Troubleshooting

### Common Issues

**Prisma Client Not Generated**
```bash
npx prisma generate
```

**Database Connection Issues**
- Verify your DATABASE_URL is correct
- Check MongoDB Atlas whitelist settings
- Ensure database user has proper permissions

**NextAuth Errors**
- Verify NEXTAUTH_URL and NEXTAUTH_SECRET are set
- Check callback URLs in OAuth provider settings

**Build Errors**
- Clear Next.js cache: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npx tsc --noEmit`

## Support

For support and questions:
- Email: turyamurebanicholus@gmail.com
- Phone: +256 761996296
- Create an issue in the repository

## License

This project is private and proprietary. All rights reserved.

## Team

- Development Team: turyamurebanicholus@gmail.com
- Project Manager: +256 761996296
- System Administrator: Nicholus Turyamureba
- Founder: Atbriz
- Publisher: Cyber Touch
