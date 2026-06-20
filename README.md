# Freedom City Tech Center Management System

A comprehensive academic management system built with Next.js 16, MongoDB, and Prisma ORM. The system serves multiple user roles (Admin, Teacher, Student) with features for academic tracking, cleaning management, and administrative oversight.

## 🚀 Features

### Core Functionality
- **Multi-Role Authentication**: Secure JWT-based authentication with role-based access control
- **Dashboard System**: Role-specific dashboards for Admin, Teacher, and Student users
- **Academic Management**: Course enrollment, grade tracking, GPA calculation, tuition management
- **Cleaning Management**: Weekly cleaning schedules, student registration, attendance tracking
- **Admin Panel**: User management, role assignment, system reporting, oversight capabilities
- **Real-time Updates**: Live data updates with React Query caching
- **PWA Support**: Progressive Web App with service worker and offline capabilities

### User Roles
- **Admin**: Full system access, user management, role assignment, system oversight
- **Teacher**: Student management, grade assignment, tutoring capabilities
- **Student**: View own data, course enrollment, cleaning registration, grade tracking

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5.9.3
- **UI Library**: React 19
- **Styling**: TailwindCSS 3.4.17
- **State Management**: Zustand 5.0.14
- **Data Fetching**: TanStack React Query 5.0.0
- **Animations**: Framer Motion 12.40.0
- **Charts**: Recharts 3.8.1
- **Icons**: Lucide React 1.17.0
- **Forms**: Zod 4.4.3 (validation)

### Backend
- **Runtime**: Next.js API Routes (Edge & Node.js)
- **Database**: MongoDB
- **ORM**: Prisma 5.22.0
- **Authentication**: JWT (jsonwebtoken 9.0.2, jose 6.2.3)
- **Password Hashing**: bcryptjs 2.4.3
- **HTTP Client**: Axios 1.17.0

### Development Tools
- **Package Manager**: npm
- **Build Tool**: Turbopack (Next.js 16)
- **Linting**: ESLint 9
- **Code Analysis**: Knip 6.16.1
- **Type Checking**: TypeScript strict mode

## 📋 Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher
- MongoDB Atlas account or local MongoDB instance
- Git

## 🚦 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd my-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/freedom-tech?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
NEXT_PUBLIC_API_URL=http://localhost:3000
NODE_ENV=development
```

### 4. Generate Prisma Client

```bash
npx prisma generate
```

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
my-app/
├── app/                      # Next.js App Router
│   ├── api/                  # API Routes
│   ├── dashboard/           # Dashboard layouts
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Landing page
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
│   ├── prisma.ts           # Prisma client
│   └── utils.ts            # General utilities
├── stores/                 # Zustand stores
│   └── authStore.ts        # Authentication state
├── prisma/                 # Prisma ORM
│   └── schema.prisma       # Database schema
└── public/                 # Static assets
    ├── sw.js              # Service worker
    └── manifest.json      # PWA manifest
```

## 🏗️ Architecture

### System Architecture
The application follows a modern architecture with clear separation of concerns:

- **Frontend**: Next.js App Router with React 19
- **Backend**: Next.js API Routes with MongoDB
- **Authentication**: JWT with HTTP-only cookies
- **State Management**: Zustand (client) + React Query (server)
- **Database**: MongoDB with Prisma ORM

For detailed architecture documentation, see:
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Complete system architecture
- [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) - Database design with ERD
- [API_REFERENCE.md](./API_REFERENCE.md) - Complete API documentation
- [FRONTEND_ARCHITECTURE.md](./FRONTEND_ARCHITECTURE.md) - Frontend architecture
- [SECURITY_ARCHITECTURE.md](./SECURITY_ARCHITECTURE.md) - Security documentation

## 🔐 Security

### Security Features
- **JWT Authentication**: Secure token-based authentication
- **HTTP-only Cookies**: Prevents XSS attacks
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: Prevents brute force attacks
- **Input Validation**: Zod schema validation
- **Role-Based Access Control**: Multi-role authorization
- **SQL Injection Prevention**: Prisma ORM parameterized queries

For detailed security documentation, see [SECURITY_ARCHITECTURE.md](./SECURITY_ARCHITECTURE.md).

## 🧪 Testing

### Running Tests
```bash
# Run all tests (when implemented)
npm test

# Run linting
npm run lint

# Type checking
npx tsc --noEmit

# Find unused code
npx knip
```

## 📊 Database

### Database Management
```bash
# Open Prisma Studio (database GUI)
npx prisma studio

# Create migration
npx prisma migrate dev --name description

# Deploy migration
npx prisma migrate deploy

# Generate client
npx prisma generate

# Reset database (development only)
npx prisma migrate reset
```

For detailed database documentation, see [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md).

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

### Environment Variables for Production
```env
DATABASE_URL=mongodb+srv://...
JWT_SECRET=strong-random-secret-key
NEXT_PUBLIC_API_URL=https://your-domain.com
NODE_ENV=production
```

For detailed deployment documentation, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## 📚 Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture overview
- [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) - Database schema and ERD
- [API_REFERENCE.md](./API_REFERENCE.md) - Complete API reference
- [FRONTEND_ARCHITECTURE.md](./FRONTEND_ARCHITECTURE.md) - Frontend architecture
- [SECURITY_ARCHITECTURE.md](./SECURITY_ARCHITECTURE.md) - Security architecture
- [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) - Developer onboarding guide

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Workflow
- Follow the commit message format
- Write tests for new features
- Update documentation as needed
- Ensure code passes linting
- Test thoroughly before submitting

## 📝 License

This project is private and proprietary. All rights reserved.

## 👥 Team

- **Development Team**: [turyamurebanicholus@gmail.com]
- **Project Manager**: [+256 761996296]
- **System Administrator**: [Nicholus Turyamureba]

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation first

## 🔗 Links

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [React Documentation](https://react.dev)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)

## 📈 Roadmap

### Planned Features
- [ ] Password reset functionality
- [ ] Email notifications
- [ ] Advanced reporting
- [ ] Mobile app
- [ ] Integration with external systems
- [ ] Enhanced analytics
- [ ] Two-factor authentication

### Improvements
- [ ] Performance optimization
- [ ] Enhanced testing coverage
- [ ] Better error handling
- [ ] Improved accessibility
- [ ] Internationalization support

## 📞 Contact

For inquiries and support:
- **Email**: [turyamurebanicholus@gmail.com]
- **Website**: [https://selfless-henna.vercel.app/]
- **Address**: [Kampala Uganda]

---

Built with ❤️ using Next.js, MongoDB, and Prisma
