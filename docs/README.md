# Selfless CE Freedom City Tech Center
# Cleaning Duty Registration System

A modern web application for managing cleaning duty registrations at the Selfless CE Freedom City Tech Center. Built with Next.js and designed for efficient volunteer coordination.

## About

This system helps manage cleaning duty registrations for volunteers at the Selfless CE Freedom City Tech Center in Kampala, Uganda. Volunteers can register for their preferred cleaning days, and administrators can view and manage all registrations.

## Features

- **Email-based Authentication**: Secure access for authorized volunteers only
- **One-Time Registration**: Simple, straightforward registration process
- **Admin Dashboard**: Comprehensive view of all registrations
- **Real-time Updates**: Live registration status and capacity tracking
- **Excel Export**: Download registration data in spreadsheet format
- **Responsive Design**: Works seamlessly on all devices
- **Modern UI**: Clean, professional interface with glassmorphism effects

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose ODM
- **Styling**: Tailwind CSS with custom animations
- **Authentication**: Email-based access control with glassmorphism effects
- **Responsive Design**: Works perfectly on all devices
- **Registration Management**: Users can register for their preferred cleaning day

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB database

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Add your MongoDB URI and authorized emails
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## Usage

### For Volunteers

1. Enter your authorized email to access the system
2. Select your preferred cleaning day
3. Complete registration - one-time only

### For Administrators

1. Access admin dashboard with authorized email
2. View all registrations in real-time
3. Export data to Excel for reporting
4. Monitor cleaning day capacity

## Features Details

### Authentication System
- Email-based access control
- Authorized users: `atbriz256@gmail.com`, `kiwanukatonny@gmail.com`
- Auto-user creation for authorized emails
- No password required

### Registration System
- One-time registration per volunteer
- Maximum 5 volunteers per day
- Real-time capacity tracking
- No changes allowed after registration

### Admin Dashboard
- Excel-style data display
- Chronological date ordering
- Copy-to-clipboard functionality
- Real-time updates every 5 minutes

## Developer

**Atbriz Nicholus**  
Software Developer  
Zana, Kampala, Uganda  
Email: [atbriz256@gmail.com](mailto:atbriz256@gmail.com)

---

*Built with Next.js, TypeScript, MongoDB, and Tailwind CSS*
