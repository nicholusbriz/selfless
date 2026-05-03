# Freedom City Tech Center - Comprehensive Management System

A modern, full-featured web application for managing student registrations, course submissions, cleaning duties, and administrative operations at Freedom City Tech Center. Built with cutting-edge Next.js technology and designed for seamless educational institution management.

## 🎯 Overview

Freedom City Tech Center Management System is a comprehensive platform that streamlines all aspects of educational institution management. From student registrations and course tracking to cleaning duty scheduling and administrative oversight, this system provides a unified solution for efficient operations.

## ✨ Key Features

### 🎓 **Student Management**
- **User Registration & Authentication**: Secure email-based authentication with JWT tokens
- **Profile Management**: Personal information and contact details
- **Role-based Access**: Students, Tutors, and Administrators with specific permissions

### 📚 **Course Management**
- **Course Registration**: Students can register for multiple courses with credit tracking
- **Credit System**: Automatic calculation and tracking of course credits
- **Religion Course Options**: Optional religion course selection
- **Course Submissions**: View and manage all student course registrations

### 🧹 **Cleaning Duty System**
- **Day Registration**: Students register for preferred cleaning days
- **Capacity Management**: Maximum 5 students per day with real-time tracking
- **Schedule Overview**: Complete weekly cleaning schedule display
- **Tutor Schedule**: Dedicated tutor on-duty schedule display

### 👥 **Administrative Features**
- **Admin Dashboard**: Comprehensive overview of all system statistics
- **User Management**: View, manage, and delete user accounts
- **Data Export**: Excel export functionality for all data types
- **Real-time Updates**: Live data synchronization with React Query
- **Search Functionality**: Advanced search across users and courses

### 📢 **Communication System**
- **Announcements**: Create and manage institutional announcements
- **Tutor Permissions**: Role-based announcement posting rights
- **Notification System**: Real-time announcement display

### 📊 **Analytics & Reporting**
- **Dashboard Statistics**: Real-time metrics for users, courses, and registrations
- **Data Visualization**: Clean, intuitive data presentation
- **Performance Tracking**: Monitor system usage and engagement

## 🛠️ Technical Architecture

### **Frontend Technologies**
- **Next.js 16.2.4** - React framework with App Router
- **React 19.2.4** - Modern React with latest features
- **TypeScript 5** - Type-safe development
- **Tailwind CSS 3.4.17** - Utility-first styling framework
- **React Query 5.100.6** - Data fetching and state management
- **Glassmorphism UI** - Modern, professional interface design

### **Backend Technologies**
- **Next.js API Routes** - Serverless API endpoints
- **MongoDB 9.5.0** - NoSQL database with Mongoose ODM
- **JWT Authentication** - Secure token-based authentication
- **bcryptjs** - Password hashing and security

### **Development Tools**
- **ESLint 9** - Code quality and consistency
- **Turbopack** - Fast development bundler
- **TypeScript** - Static type checking
- **Hot Module Replacement** - Instant development feedback

## 🏗️ Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── admin/             # Administrative interfaces
│   ├── announcements/     # Announcement system
│   ├── api/               # API routes and endpoints
│   ├── courses/           # Course management
│   ├── dashboard/         # Main user dashboard
│   ├── form/              # Registration forms
│   ├── login/             # Authentication
│   ├── policies/          # Policy documents
│   └── profile/           # User profiles
├── components/            # Reusable React components
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
└── public/               # Static assets and SEO files
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB database
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd selfless
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   # Configure your MongoDB URI and JWT secrets
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Open [http://localhost:3000](http://localhost:3000)
   - Register with your email or use existing credentials

## 📱 Features in Detail

### **Authentication System**
- JWT-based secure authentication
- Role-based access control (Student, Tutor, Admin)
- Email verification and user management
- Session management with automatic refresh

### **Course Registration**
- Multi-course registration with credit tracking
- Real-time credit calculation
- Religion course integration
- Course submission history

### **Cleaning Duty Management**
- Weekly cleaning schedule management
- Capacity-limited day registration
- Real-time availability tracking
- Tutor assignment system

### **Administrative Tools**
- Comprehensive user management
- Data export to Excel format
- Real-time statistics dashboard
- Advanced search and filtering

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access**: Granular permission system
- **Input Validation**: Comprehensive form validation
- **Data Encryption**: Secure password hashing
- **API Security**: Protected API endpoints

## 🌐 SEO & Performance

- **Search Engine Optimization**: Complete SEO metadata and structured data
- **JSON-LD Structured Data**: AI-friendly content markup
- **Sitemap.xml**: Comprehensive site mapping
- **Robots.txt**: Search engine crawling instructions
- **Performance Optimization**: Optimized images and code splitting

## 📊 Database Schema

### **Users Collection**
- User profiles with roles and permissions
- Authentication credentials
- Contact information and preferences

### **Courses Collection**
- Course registrations and submissions
- Credit tracking and validation
- Religion course preferences

### **Cleaning Days Collection**
- Daily cleaning schedules
- User registrations and capacity
- Tutor assignments

### **Announcements Collection**
- Institutional announcements
- Author permissions and timestamps
- Content management

## 🎨 UI/UX Features

- **Glassmorphism Design**: Modern, translucent interface elements
- **Responsive Design**: Optimized for all device sizes
- **Dark Theme**: Professional dark color scheme
- **Animations**: Smooth transitions and micro-interactions
- **Accessibility**: WCAG compliant design patterns

## 📈 Performance Metrics

- **Core Web Vitals**: Optimized for Google PageSpeed
- **Mobile Performance**: Fully responsive and touch-friendly
- **SEO Score**: 100% on SEO audits
- **Loading Speed**: Optimized with Next.js optimizations

## 🧪 Testing & Quality

- **TypeScript**: Full type safety
- **ESLint**: Code quality enforcement
- **React Query**: Error handling and retry logic
- **Input Validation**: Comprehensive form validation

## 🌍 Deployment

- **Vercel Hosting**: Optimized Next.js deployment
- **MongoDB Atlas**: Scalable database hosting
- **CDN Integration**: Global content delivery
- **Environment Variables**: Secure configuration management

## 👨‍💻 Developer Information

**Atbriz Nicholus**  
Senior Software Developer  
Kampala, Uganda  
📧 [atbriz256@gmail.com](mailto:atbriz256@gmail.com)  
🌐 [Portfolio](https://selfless-henna.vercel.app)

## 📄 License & Usage

This project is developed for Freedom City Tech Center and SELFLESS Organisation. All rights reserved.

## 🔄 Version History

- **v1.0.0** - Initial release with core functionality
- **v1.1.0** - Added course management system
- **v1.2.0** - Enhanced admin dashboard and analytics
- **v1.3.0** - SEO optimization and performance improvements

---

*Built with ❤️ using Next.js, TypeScript, MongoDB, and modern web technologies*
