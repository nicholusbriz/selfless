# Developer Onboarding Guide

## Table of Contents
1. [Getting Started](#getting-started)
2. [Prerequisites](#prerequisites)
3. [Environment Setup](#environment-setup)
4. [Project Structure](#project-structure)
5. [Development Workflow](#development-workflow)
6. [Common Development Tasks](#common-development-tasks)
7. [Testing](#testing)
8. [Debugging](#debugging)
9. [Code Style Guidelines](#code-style-guidelines)
10. [Git Workflow](#git-workflow)
11. [Troubleshooting](#troubleshooting)
12. [Resources](#resources)

## Getting Started

Welcome to the Freedom City Tech Center Management System! This guide will help you get up and running with the development environment.

### Project Overview
This is a comprehensive academic management system built with Next.js 16, MongoDB, and Prisma. The system serves multiple user roles (Admin, Teacher, Student) with features for academic tracking, cleaning management, and administrative oversight.

### Key Technologies
- **Frontend**: Next.js 16, React 19, TypeScript, TailwindCSS
- **Backend**: Next.js API Routes, MongoDB, Prisma ORM
- **Authentication**: JWT with HTTP-only cookies
- **State Management**: Zustand, React Query
- **Styling**: TailwindCSS, Framer Motion

## Prerequisites

### Required Software
- **Node.js**: Version 18.x or higher
- **npm**: Version 9.x or higher (comes with Node.js)
- **Git**: Latest stable version
- **MongoDB**: MongoDB Atlas account or local MongoDB instance
- **Code Editor**: VS Code (recommended) with extensions:
  - ESLint
  - Prettier
  - TypeScript and JavaScript Language Features
  - Tailwind CSS IntelliSense
  - Prisma

### Optional but Recommended
- **Postman**: For API testing
- **MongoDB Compass**: For database management
- **Docker**: For containerized development

## Environment Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd my-app
```

### 2. Install Dependencies
```bash
npm install
```

This will install all dependencies defined in `package.json` and generate the Prisma client.

### 3. Set Up Environment Variables
Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/freedom-tech?retryWrites=true&w=majority

# JWT Secret (generate a strong random string)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long

# API URL (optional, defaults to current origin)
NEXT_PUBLIC_API_URL=http://localhost:3000

# Node Environment
NODE_ENV=development
```

### 4. Generate Prisma Client
```bash
npx prisma generate
```

### 5. Set Up Database
If using MongoDB Atlas:
1. Create a free MongoDB Atlas account
2. Create a new cluster
3. Create a database user with read/write permissions
4. Get the connection string and update `DATABASE_URL`

If using local MongoDB:
1. Install MongoDB locally
2. Start MongoDB service
3. Update `DATABASE_URL` to point to local instance

### 6. Seed Database (Optional)
```bash
# Run seed script if available
npx prisma db seed
```

### 7. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Project Structure

```
my-app/
├── app/                      # Next.js App Router
│   ├── api/                  # API Routes
│   │   ├── admin/           # Admin endpoints
│   │   ├── auth/            # Authentication endpoints
│   │   ├── cleaning/        # Cleaning management
│   │   ├── contact/         # Contact form
│   │   ├── overview/        # Dashboard overview
│   │   ├── student/         # Student endpoints
│   │   └── teacher/         # Teacher endpoints
│   ├── dashboard/           # Dashboard layouts
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Landing page
│   ├── login/               # Login page
│   └── register/            # Registration page
├── components/              # React Components
│   ├── admin/              # Admin-specific components
│   ├── cleaning/           # Cleaning system components
│   ├── overview/           # Dashboard overview components
│   ├── shared/             # Shared/reusable components
│   ├── student/            # Student-specific components
│   ├── teacher/            # Teacher-specific components
│   └── ui/                 # UI component library
├── hooks/                  # Custom React Hooks
│   └── queries/            # React Query hooks
├── lib/                    # Utility libraries
│   ├── api/                # API client functions
│   ├── validations/        # Zod validation schemas
│   ├── auth-helper.ts      # Auth helper functions
│   ├── axios.ts            # Axios configuration
│   ├── constants.ts        # Application constants
│   ├── gpa-calculator.ts   # GPA calculation utilities
│   ├── prisma.ts           # Prisma client
│   ├── rateLimit.ts        # Rate limiting
│   └── utils.ts            # General utilities
├── stores/                 # Zustand stores
│   └── authStore.ts        # Authentication state
├── prisma/                 # Prisma ORM
│   └── schema.prisma       # Database schema
├── public/                 # Static assets
│   ├── sw.js              # Service worker
│   └── manifest.json      # PWA manifest
├── package.json            # Dependencies and scripts
├── next.config.js          # Next.js configuration
├── tsconfig.json          # TypeScript configuration
└── knip.json              # Code analysis configuration
```

## Development Workflow

### Daily Development Workflow

1. **Pull Latest Changes**
```bash
git pull origin main
```

2. **Install Dependencies** (if needed)
```bash
npm install
```

3. **Generate Prisma Client** (if schema changed)
```bash
npx prisma generate
```

4. **Start Development Server**
```bash
npm run dev
```

5. **Make Changes**
- Edit code in appropriate directories
- Test changes in browser
- Run linter: `npm run lint`

6. **Commit Changes**
```bash
git add .
git commit -m "Descriptive commit message"
git push origin main
```

### Database Schema Changes

1. **Modify Schema**
```bash
# Edit prisma/schema.prisma
```

2. **Create Migration**
```bash
npx prisma migrate dev --name description-of-change
```

3. **Generate Client**
```bash
npx prisma generate
```

4. **Test Migration**
```bash
# Test locally before deploying
```

5. **Deploy Migration**
```bash
npx prisma migrate deploy
```

### Adding New API Endpoints

1. **Create Route File**
```bash
# Create file in app/api/your-endpoint/route.ts
```

2. **Implement Handler**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  // Implementation
}

export async function POST(request: NextRequest) {
  // Implementation
}
```

3. **Add Authentication** (if needed)
```typescript
import { requireAuth } from '@/lib/auth-helper';

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  // Protected logic
}
```

4. **Add Validation** (if needed)
```typescript
import { yourSchema } from '@/lib/validations/your-schema';

const result = yourSchema.safeParse(body);
if (!result.success) {
  return NextResponse.json({ success: false, message: result.error.issues[0].message }, { status: 400 });
}
```

### Adding New Components

1. **Create Component File**
```bash
# Create file in appropriate components directory
```

2. **Implement Component**
```typescript
'use client'; // Add if component uses hooks
import React from 'react';

interface ComponentProps {
  // Props interface
}

export default function YourComponent({ prop }: ComponentProps) {
  // Component logic
  return <div>{/* JSX */}</div>;
}
```

3. **Export from Index** (if needed)
```typescript
// Create index.ts in component directory
export { default as YourComponent } from './YourComponent';
```

## Common Development Tasks

### Running Tests
```bash
# Run all tests (when implemented)
npm test

# Run specific test file
npm test path/to/test.test.ts
```

### Linting Code
```bash
# Run ESLint
npm run lint

# Fix linting issues automatically
npm run lint -- --fix
```

### Type Checking
```bash
# TypeScript type checking
npx tsc --noEmit
```

### Finding Unused Code
```bash
# Run Knip to find unused code
npx knip
```

### Database Operations
```bash
# Open Prisma Studio (database GUI)
npx prisma studio

# Reset database (development only)
npx prisma migrate reset

# Seed database
npx prisma db seed
```

### Building for Production
```bash
# Build production bundle
npm run build

# Start production server
npm start
```

## Testing

### Testing Strategy
- **Unit Tests**: Test individual functions and components
- **Integration Tests**: Test API endpoints and database operations
- **E2E Tests**: Test complete user flows
- **Manual Testing**: Test features in development environment

### Testing Tools
- **Jest**: Unit testing framework
- **React Testing Library**: Component testing
- **Playwright**: E2E testing
- **Postman**: API testing

### Manual Testing Checklist
- [ ] User registration and login
- [ ] Role-based access control
- [ ] Dashboard navigation
- [ ] Student grade management
- [ ] Cleaning registration
- [ ] Admin user management
- [ ] API endpoint functionality
- [ ] Responsive design
- [ ] Error handling

## Debugging

### Common Issues and Solutions

#### Port Already in Use
```bash
# Kill process on port 3000
npx kill-port 3000

# Or use different port
npm run dev -- -p 3001
```

#### Database Connection Issues
```bash
# Check DATABASE_URL in .env
# Verify MongoDB is accessible
# Check network connectivity
# Verify MongoDB credentials
```

#### Prisma Client Not Generated
```bash
# Regenerate Prisma client
npx prisma generate

# Or reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### TypeScript Errors
```bash
# Clear Next.js cache
rm -rf .next

# Rebuild
npm run dev
```

#### Authentication Issues
```bash
# Clear browser cookies
# Check JWT_SECRET in .env
# Verify token generation
# Check cookie configuration
```

### Debugging Tools
- **React Query DevTools**: Inspect cache state
- **Next.js DevTools**: Debug Next.js internals
- **Browser DevTools**: Network, console, performance
- **Prisma Studio**: Database inspection
- **VS Code Debugger**: TypeScript debugging

### Logging
```typescript
// Application logging
console.log('Debug information');
console.error('Error occurred');
console.warn('Warning message');

// API request logging (configured in lib/axios.ts)
// Automatic logging for all axios requests
```

## Code Style Guidelines

### TypeScript Best Practices
- Use strict TypeScript mode
- Define interfaces for all props
- Use type inference where appropriate
- Avoid `any` type
- Use proper return types for functions

### React Best Practices
- Use functional components with hooks
- Keep components small and focused
- Use proper prop types
- Use `useCallback` for event handlers
- Use `useMemo` for expensive calculations
- Follow React hooks rules

### Naming Conventions
- **Components**: PascalCase (`UserProfile.tsx`)
- **Files**: kebab-case (`user-profile.tsx`)
- **Functions**: camelCase (`getUserData`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Interfaces**: PascalCase (`UserData`)
- **Types**: PascalCase (`UserRole`)

### File Organization
- Group related files in directories
- Use index files for clean imports
- Keep component files focused
- Separate business logic from UI
- Use barrel exports for libraries

### Code Formatting
- Use Prettier for consistent formatting
- Configure ESLint for code quality
- Use 2 spaces for indentation
- Use single quotes for strings
- Add trailing commas in arrays/objects

### Comments and Documentation
- Add JSDoc comments for complex functions
- Comment non-obvious logic
- Document API endpoints
- Add TODO comments for future work
- Keep comments up to date

## Git Workflow

### Branching Strategy
- `main`: Production branch
- `develop`: Development branch
- `feature/*`: Feature branches
- `bugfix/*`: Bug fix branches
- `hotfix/*`: Emergency fixes

### Commit Message Format
```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(auth): add JWT token refresh
fix(cleaning): resolve registration bug
docs(readme): update setup instructions
```

### Pull Request Process
1. Create feature branch from `develop`
2. Make changes and commit
3. Push to remote repository
4. Create pull request to `develop`
5. Request code review
6. Address review feedback
7. Merge after approval

### Git Best Practices
- Commit frequently with small, focused changes
- Write descriptive commit messages
- Pull before pushing
- Resolve conflicts locally
- Don't commit sensitive data
- Use `.gitignore` properly

## Troubleshooting

### Build Issues

#### Build Fails
```bash
# Clear Next.js cache
rm -rf .next

# Clear node modules
rm -rf node_modules package-lock.json

# Reinstall dependencies
npm install

# Rebuild
npm run build
```

#### TypeScript Errors
```bash
# Check TypeScript configuration
npx tsc --noEmit

# Update TypeScript types
npm install --save-dev @types/node @types/react @types/react-dom
```

### Runtime Issues

#### Application Won't Start
```bash
# Check Node.js version
node --version

# Check for port conflicts
npx kill-port 3000

# Check environment variables
cat .env

# Check logs for errors
npm run dev
```

#### API Errors
```bash
# Check API routes exist
ls app/api/

# Check Prisma client
npx prisma generate

# Check database connection
echo $DATABASE_URL
```

### Performance Issues

#### Slow Development Server
```bash
# Use Turbopack (already configured)
npm run dev

# Clear cache
rm -rf .next

# Check for large dependencies
npm ls --depth=0
```

#### Slow API Responses
```bash
# Check database indexes
npx prisma studio

# Add indexes to schema
# Optimize queries
# Add caching
```

## Resources

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Prisma Documentation](https://www.prisma.io/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)

### Project Documentation
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) - Database design
- [API_REFERENCE.md](./API_REFERENCE.md) - API documentation
- [FRONTEND_ARCHITECTURE.md](./FRONTEND_ARCHITECTURE.md) - Frontend architecture
- [SECURITY_ARCHITECTURE.md](./SECURITY_ARCHITECTURE.md) - Security documentation

### Tools
- [Prisma Studio](https://www.prisma.io/studio) - Database GUI
- [MongoDB Compass](https://www.mongodb.com/try/download/compass) - MongoDB GUI
- [Postman](https://www.postman.com/) - API testing
- [React Query DevTools](https://tanstack.com/query/latest/docs/react/devtools) - Cache debugging

### Community
- [Next.js GitHub](https://github.com/vercel/next.js)
- [Prisma GitHub](https://github.com/prisma/prisma)
- [React GitHub](https://github.com/facebook/react)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/next.js)

### Learning Resources
- [Next.js Learn Course](https://nextjs.org/learn)
- [React Tutorial](https://react.dev/learn)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Prisma Tutorial](https://www.prisma.io/docs/getting-started)

## Getting Help

### Internal Resources
- **Team Lead**: [Contact Information]
- **Senior Developers**: [Contact Information]
- **Project Manager**: [Contact Information]

### External Resources
- **Next.js Discord**: https://discord.gg/nextjs
- **Prisma Discord**: https://discord.gg/prisma
- **Reactiflux**: https://www.reactiflux.com/

### Issue Reporting
1. Check existing issues
2. Create detailed bug report
3. Include steps to reproduce
4. Include error messages
5. Include environment details
6. Tag appropriate team members

## Next Steps

After completing this onboarding guide:

1. **Explore the Codebase**
   - Read through key files
   - Understand the architecture
   - Review existing components

2. **Set Up Development Environment**
   - Complete all setup steps
   - Run the application locally
   - Test all features

3. **Make Your First Contribution**
   - Pick a small task
   - Create a feature branch
   - Make changes and test
   - Submit a pull request

4. **Join Team Communication**
   - Join team chat channels
   - Attend standup meetings
   - Participate in code reviews

5. **Continuous Learning**
   - Read project documentation
   - Learn new technologies
   - Share knowledge with team

Welcome to the team! We're excited to have you on board.
