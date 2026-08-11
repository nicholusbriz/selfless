"use client";

import { motion } from "framer-motion";
import {
  GraduationCap,
  BookOpen,
  Users,
  TrendingUp,
  ShieldCheck,
  Globe,
  Clock,
  Award,
  MessageSquare,
  Calendar,
  Bell,
  Building2
} from "lucide-react";

export default function PortalExplanation() {
  const primaryColor = '#E8A33D';

  const portalFeatures = [
    {
      icon: BookOpen,
      title: "Course Management",
      description: "Register for courses, track academic progress, view grades, and manage your entire academic journey from one centralized platform."
    },
    {
      icon: Users,
      title: "Tech Center Network",
      description: "Connect with students across multiple Selfless Tech Centers including FreedomCity, Jinja, Mbale, and more."
    },
    {
      icon: TrendingUp,
      title: "Real-Time Analytics",
      description: "Monitor your GPA, credits, attendance, and academic performance with live updates and detailed reports."
    },
    {
      icon: ShieldCheck,
      title: "Secure & Private",
      description: "Your academic records and personal information are securely managed with enterprise-grade security protocols."
    },
    {
      icon: Globe,
      title: "Global Community",
      description: "Join study groups, participate in discussions, and collaborate with students across the entire network."
    },
    {
      icon: Clock,
      title: "24/7 Access",
      description: "Access your portal anytime, anywhere from any device - desktop, tablet, or mobile."
    }
  ];

  const portalActivities = [
    '📚 Register for Courses',
    '📊 Track Academic Progress',
    '🎓 View Your Grades',
    '🏆 Check GPA & Credits',
    '📅 Manage Your Schedule',
    '📬 Read Announcements',
    '💬 Chat with AI Assistant',
    '👥 Connect with Students',
    '📢 Create Announcements',
    '🧹 Register for Cleaning Day',
    '⚽ Join Football Team',
    '🏐 Join Volleyball Team',
    '🏀 Join Netball Team',
    '🏃 Join Athletics Team',
    '💼 Find Internships',
    '✈️ Register for Temple Trips',
    '🔔 Check Notifications',
    '👤 Update Your Profile',
    '⚙️ Manage Settings',
    '📖 Access Course Materials',
    '✅ Submit Assignments',
    '📝 Track Attendance',
    '🎯 Set Academic Goals',
    '🤝 Join Study Groups',
    '📈 View Performance Analytics',
    '🌐 Access Tech Center Network',
    '🏅 View Achievements',
    '📚 Browse Course Catalog',
    '🎓 Academic Excellence Portal'
  ];

  return (
    <section className="relative overflow-hidden bg-[#101826] py-16 sm:py-20">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(232,163,61,.06),transparent_55%)]" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto mb-12 sm:mb-16"
        >
          <span className="inline-flex rounded-full border-2 border-[#E8A33D]/30 bg-[#E8A33D]/10 px-4 py-1.5 text-xs uppercase tracking-[0.25em] text-[#F2C879]">
            About The Portal
          </span>

          <h2 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-black text-white">
            Your Complete
            <span className="block text-[#E8A33D]">
              Academic Companion
            </span>
          </h2>

          <p className="mt-4 text-base sm:text-lg leading-7 text-gray-400">
            The Selfless Student Self Service Portal is designed to simplify your educational journey 
            by bringing all academic tools, resources, and connections into one intelligent platform.
          </p>
        </motion.div>

        {/* Why It Exists */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 sm:mb-16"
        >
          <div className="rounded-2xl border-2 border-[#E8A33D]/20 p-6 sm:p-8"
            style={{
              backgroundImage: `
                linear-gradient(135deg, rgba(232, 163, 61, 0.03) 0%, transparent 50%),
                url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='paperNoise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23paperNoise)' opacity='0.06'/%3E%3C/svg%3E")
              `,
              backgroundSize: 'cover, 400px 400px'
            }}
          >
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4 flex items-center gap-3">
              <GraduationCap className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: primaryColor }} />
              Why This Portal Exists
            </h3>
            <p className="text-gray-400 leading-relaxed text-sm sm:text-base">
              The Selfless Student Self Service Portal was created to solve the challenge of managing 
              academic information across multiple systems. Students often struggle with scattered 
              resources, disconnected communication channels, and difficulty tracking their progress. 
              This portal centralizes everything—course registration, grades, announcements, 
              extracurricular activities, and community connections—into one seamless experience. 
              It empowers students to take control of their education, stay informed, and connect 
              with their tech center community effortlessly.
            </p>
          </div>
        </motion.div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-12 sm:mb-16"
        >
          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <Clock className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: primaryColor }} />
            How It Works
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                step: "1",
                title: "Access",
                description: "Log in with your credentials to access your personalized dashboard"
              },
              {
                step: "2",
                title: "Navigate",
                description: "Explore courses, grades, announcements, and community features"
              },
              {
                step: "3",
                title: "Engage",
                description: "Register for courses, join activities, and connect with peers"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 + 0.2, duration: 0.4 }}
                className="rounded-xl border-2 border-[#E8A33D]/20 bg-[#1a1610] p-4 sm:p-6 text-center"
                style={{
                  backgroundImage: `
                    linear-gradient(135deg, rgba(232, 163, 61, 0.03) 0%, transparent 50%),
                    url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='paperNoise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23paperNoise)' opacity='0.06'/%3E%3C/svg%3E")
                  `,
                  backgroundSize: 'cover, 400px 400px'
                }}
              >
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full mx-auto mb-3 sm:mb-4 flex items-center justify-center text-xl sm:text-2xl font-bold"
                  style={{ backgroundColor: primaryColor, color: '#000' }}
                >
                  {item.step}
                </div>
                <h4 className="text-lg sm:text-xl font-bold text-white mb-2">{item.title}</h4>
                <p className="text-gray-400 text-sm">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Portal Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12 sm:mb-16"
        >
          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <Award className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: primaryColor }} />
            Key Features
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {portalFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 + 0.3, duration: 0.4 }}
                  className="rounded-xl border-2 border-[#E8A33D]/20 bg-[#1a1610] p-4 sm:p-5 transition-all duration-300 hover:border-[#E8A33D]/40 hover:-translate-y-1"
                  style={{
                    backgroundImage: `
                      linear-gradient(135deg, rgba(232, 163, 61, 0.03) 0%, transparent 50%),
                      url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='paperNoise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23paperNoise)' opacity='0.06'/%3E%3C/svg%3E")
                    `,
                    backgroundSize: 'cover, 400px 400px'
                  }}
                >
                  <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-[#E8A33D]/10 text-[#E8A33D] border border-[#E8A33D]/30">
                    <Icon size={20} />
                  </div>
                  <h4 className="mt-3 sm:mt-4 text-base sm:text-lg font-bold text-white">
                    {feature.title}
                  </h4>
                  <p className="mt-2 leading-6 text-gray-400 text-xs sm:text-sm">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* All Portal Activities */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <MessageSquare className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: primaryColor }} />
            Everything You Can Do
          </h3>
          <div className="rounded-2xl border-2 border-[#E8A33D]/20 bg-[#1a1610] p-4 sm:p-6"
            style={{
              backgroundImage: `
                linear-gradient(135deg, rgba(232, 163, 61, 0.03) 0%, transparent 50%),
                url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='paperNoise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23paperNoise)' opacity='0.06'/%3E%3C/svg%3E")
              `,
              backgroundSize: 'cover, 400px 400px'
            }}
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
              {portalActivities.map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.02 + 0.4, duration: 0.3 }}
                  className="p-2 sm:p-3 rounded-lg border border-[#E8A33D]/20 bg-[#E8A33D]/5 text-center hover:bg-[#E8A33D]/10 transition-colors"
                >
                  <p className="text-[10px] sm:text-xs font-semibold" style={{ color: primaryColor }}>
                    {activity}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
