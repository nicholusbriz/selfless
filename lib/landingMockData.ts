// Mock data generators for landing page demo

export interface Statistic {
  id: string;
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  icon: string;
  color: string;
  trend?: number;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  avatar: string;
  content: string;
  rating: number;
  date: string;
}

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  stats?: { label: string; value: string }[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  students: number;
  rating: number;
  image: string;
  category: string;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  image: string;
  attendees: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: number;
}

// Mock data generators
export const generateMockStatistics = (): Statistic[] => [
  {
    id: 'students',
    label: 'Active Students',
    value: 2847,
    icon: 'users',
    color: 'purple',
    trend: 12.5
  },
  {
    id: 'courses',
    label: 'Courses Available',
    value: 156,
    icon: 'book',
    color: 'blue',
    trend: 8.3
  },
  {
    id: 'instructors',
    label: 'Expert Instructors',
    value: 42,
    icon: 'award',
    color: 'green',
    trend: 5.2
  },
  {
    id: 'success',
    label: 'Success Rate',
    value: 94,
    suffix: '%',
    icon: 'star',
    color: 'orange',
    trend: 2.1
  },
  {
    id: 'hours',
    label: 'Learning Hours',
    value: 125000,
    icon: 'clock',
    color: 'pink',
    trend: 15.7
  },
  {
    id: 'countries',
    label: 'Countries Reached',
    value: 28,
    icon: 'globe',
    color: 'cyan',
    trend: 3.8
  }
];

export const generateMockTestimonials = (): Testimonial[] => [
  {
    id: '1',
    name: 'Nicholus Turyamureba',
    role: 'Software Developer',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    content: 'Freedom City Tech Center transformed my career. The hands-on approach and expert instructors gave me the confidence to land my dream job at a top tech company.',
    rating: 5,
    date: '2024-01-15'
  },
  {
    id: '2',
    name: 'Lisa Nyangoma',
    role: 'Bussiness Management',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
    content: 'The curriculum is cutting-edge and constantly updated. I learned skills that are directly applicable to real-world projects. Best investment I ever made.',
    rating: 5,
    date: '2024-01-10'
  },
  {
    id: '3',
    name: 'Chris Bwambale',
    role: 'UX Designer',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
    content: 'The community here is incredible. Everyone is supportive and collaborative. I\'ve made lifelong connections and grown both personally and professionally.',
    rating: 4,
    date: '2024-01-05'
  },
  {
    id: '4',
    name: 'Majok Aru',
    role: 'Full Stack Developer',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    content: 'From zero coding experience to building complex applications in just 6 months. The structured learning path and mentorship made all the difference.',
    rating: 5,
    date: '2023-12-28'
  },
  {
    id: '5',
    name: 'Oliver Kagabane',
    role: 'Product Manager',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aisha',
    content: 'The business-focused tech courses helped me bridge the gap between technical and business teams. Highly recommended for anyone in tech leadership.',
    rating: 5,
    date: '2023-12-20'
  },
  {
    id: '6',
    name: 'Maria Akumu',
    role: 'DevOps Engineer',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
    content: 'The practical projects and real-world scenarios prepared me perfectly for my current role. The instructors are industry veterans who know what matters.',
    rating: 4,
    date: '2023-12-15'
  }
];

export const generateMockFeatures = (): Feature[] => [
  {
    id: '1',
    title: 'Interactive Learning',
    description: 'Hands-on projects and real-world scenarios that make learning engaging and effective.',
    icon: 'cpu',
    color: 'purple',
    stats: [
      { label: 'Projects', value: '500+' },
      { label: 'Completion Rate', value: '92%' }
    ]
  },
  {
    id: '2',
    title: 'Expert Mentorship',
    description: 'Learn from industry professionals with years of experience in top tech companies.',
    icon: 'graduation-cap',
    color: 'blue',
    stats: [
      { label: 'Mentors', value: '50+' },
      { label: 'Avg Experience', value: '10+ years' }
    ]
  },
  {
    id: '3',
    title: 'Flexible Schedule',
    description: 'Learn at your own pace with 24/7 access to course materials and live sessions.',
    icon: 'clock',
    color: 'green',
    stats: [
      { label: 'Live Sessions', value: '200+/month' },
      { label: 'Flexibility', value: '100%' }
    ]
  },
  {
    id: '4',
    title: 'Career Support',
    description: 'Resume building, interview prep, and job placement assistance to launch your career.',
    icon: 'briefcase',
    color: 'orange',
    stats: [
      { label: 'Placements', value: '95%' },
      { label: 'Avg Salary', value: '$85k+' }
    ]
  },
  {
    id: '5',
    title: 'Community Network',
    description: 'Connect with thousands of learners, alumni, and industry professionals worldwide.',
    icon: 'users',
    color: 'pink',
    stats: [
      { label: 'Members', value: '10k+' },
      { label: 'Events', value: '50+/year' }
    ]
  },
  {
    id: '6',
    title: 'Certification',
    description: 'Earn industry-recognized certificates that validate your skills to employers.',
    icon: 'award',
    color: 'cyan',
    stats: [
      { label: 'Certificates', value: '8k+' },
      { label: 'Recognition', value: 'Global' }
    ]
  }
];

export const generateMockCourses = (): Course[] => [
  {
    id: '1',
    title: 'Full Stack Web Development',
    description: 'Master modern web development with React, Node.js, and databases. Build real-world applications from scratch.',
    level: 'Intermediate',
    duration: '12 weeks',
    students: 847,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800',
    category: 'Web Development'
  },
  {
    id: '2',
    title: 'Data Science & Machine Learning',
    description: 'Learn Python, statistics, and machine learning algorithms to analyze data and build predictive models.',
    level: 'Advanced',
    duration: '16 weeks',
    students: 623,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
    category: 'Data Science'
  },
  {
    id: '3',
    title: 'Mobile App Development',
    description: 'Build native iOS and Android apps using React Native and Flutter. Publish your apps to app stores.',
    level: 'Intermediate',
    duration: '10 weeks',
    students: 512,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800',
    category: 'Mobile Development'
  },
  {
    id: '4',
    title: 'Cloud Computing & DevOps',
    description: 'Master AWS, Docker, Kubernetes, and CI/CD pipelines to deploy and manage cloud infrastructure.',
    level: 'Advanced',
    duration: '14 weeks',
    students: 434,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
    category: 'Cloud & DevOps'
  },
  {
    id: '5',
    title: 'UI/UX Design Fundamentals',
    description: 'Learn design principles, user research, prototyping, and create stunning user interfaces.',
    level: 'Beginner',
    duration: '8 weeks',
    students: 756,
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800',
    category: 'Design'
  },
  {
    id: '6',
    title: 'Cybersecurity Essentials',
    description: 'Understand security threats, learn ethical hacking, and implement security best practices.',
    level: 'Intermediate',
    duration: '12 weeks',
    students: 389,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800',
    category: 'Security'
  }
];

export const generateMockEvents = (): Event[] => [
  {
    id: '1',
    title: 'Tech Innovation Summit 2024',
    date: '2024-03-15',
    time: '9:00 AM - 6:00 PM',
    location: 'Main Auditorium, Freedom City Tech Center',
    description: 'Join industry leaders for a day of insights on emerging technologies, networking, and innovation.',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    attendees: 450
  },
  {
    id: '2',
    title: 'Hackathon: Build the Future',
    date: '2024-03-22',
    time: '10:00 AM - 10:00 PM',
    location: 'Innovation Lab',
    description: '24-hour coding challenge to build innovative solutions. Prizes worth $10,000!',
    image: 'https://images.unsplash.com/photo-1504384308090-c54be3852f33?w=800',
    attendees: 120
  },
  {
    id: '3',
    title: 'Career Fair & Networking',
    date: '2024-04-05',
    time: '2:00 PM - 7:00 PM',
    location: 'Conference Hall',
    description: 'Meet top tech companies hiring now. Bring your resume and portfolio.',
    image: 'https://images.unsplash.com/photo-1559223607-a43c990c692c?w=800',
    attendees: 300
  }
];

export const generateMockAchievements = (): Achievement[] => [
  {
    id: '1',
    title: 'First Steps',
    description: 'Complete your first course module',
    icon: 'star',
    unlocked: true
  },
  {
    id: '2',
    title: 'Quick Learner',
    description: 'Complete 5 courses in a month',
    icon: 'zap',
    unlocked: true
  },
  {
    id: '3',
    title: 'Code Master',
    description: 'Submit 50 coding challenges',
    icon: 'code',
    unlocked: false,
    progress: 32
  },
  {
    id: '4',
    title: 'Community Hero',
    description: 'Help 100 fellow students',
    icon: 'heart',
    unlocked: false,
    progress: 67
  },
  {
    id: '5',
    title: 'Perfect Score',
    description: 'Get 100% on 10 assignments',
    icon: 'award',
    unlocked: true
  },
  {
    id: '6',
    title: 'Streak Master',
    description: 'Maintain a 30-day learning streak',
    icon: 'flame',
    unlocked: false,
    progress: 18
  }
];

// Generate complete mock data set
export const generateLandingMockData = () => {
  return {
    statistics: generateMockStatistics(),
    testimonials: generateMockTestimonials(),
    features: generateMockFeatures(),
    courses: generateMockCourses(),
    events: generateMockEvents(),
    achievements: generateMockAchievements()
  };
};
