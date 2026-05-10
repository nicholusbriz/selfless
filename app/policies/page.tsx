'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BackgroundImage, PageLoader } from '@/components/ui';

function PoliciesPage() {
  const [activeSection, setActiveSection] = useState('purpose');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();

  // Policies are publicly accessible - no authentication required
  useEffect(() => {
    setTimeout(() => {
      setCheckingAuth(false);
      setIsAuthenticated(true); // Allow all users to view policies
    }, 0);
  }, []);

  // Scroll to bottom if URL contains #bottom
  useEffect(() => {
    if (window.location.hash === '#bottom') {
      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }, 500);
    }
  }, []);

  const policies = {
    purpose: {
      title: "I. SELFLESS CE Purpose and Mission",
      content: `The mission of SELFLESS CE is to Support Efforts to Lead Families and Individuals toward Lifelong Education and Self-Sufficiency (SELFLESS). We aim to foster a safe and supportive learning environment where young adults can access educational opportunities that empower them to achieve self-sufficiency. By doing so, we strive to inspire these individuals to support their families and contribute to uplifting others in their communities.`
    },
    board: {
      title: "II. Board Members and Function (as of 12/09/2025)",
      content: `The SELFLESS CE board member plays a critical role in upholding the organization's integrity and ensuring that the perspectives of both students and leaders are valued. This is a voluntary position appointed by the SELFLESS Board, and as such, it is not compensated for their role as a board member. Each SELFLESS CE board member holds one vote in all organizational decisions. In the event of a tie, the board advisors will cast the deciding vote. Initiatives approved by the SELFLESS CE Board will be submitted to the SELFLESS Board for final approval.`,
      subsections: {
        current: {
          title: "1. Current SELFLESS CE board members",
          content: [
            "a. Rachael Namuge – Board Member",
            "b. Douglas W. Kasozi – Secretary",
            "c. Anigo Agnes Mary – Board Member",
            "d. Atong Khur Aguto – Treasurer (Currently not an official board member, but recognized as a decision maker by the SELFLESS Board)"
          ]
        },
        advisors: {
          title: "2. Board Advisors",
          content: [
            "a. Abraham Hwang",
            "b. Jeanie Conrad"
          ]
        },
        selfless: {
          title: "3. SELFLESS Board Members",
          content: [
            "a. Jan Hwang (President)",
            "b. Audrey Hwang (Treasurer)",
            "c. Leena Barnum (Secretary)"
          ]
        }
      }
    },
    qualifications: {
      title: "III. New Applicant Qualification Requirements",
      content: `All new applicants must complete an application and receive approval from the SELFLESS CE Board. All applications must be prepared and submitted to the Board at least 30 days before the start of the following block. Before the board review, office managers thoroughly evaluate each applicant's qualifications to ensure eligibility.`,
      subsections: {
        requirements: {
          title: "Qualification Requirements",
          content: [
            "1. Applicants must be members of The Church of Jesus Christ of Latter-day Saints for a minimum of 6 months.",
            "2. If not a member of The Church of Jesus Christ of Latter-day Saints, applicants must meet the following conditions:",
            "  a. They must be good friends (friends for over 1 year) of a current student in good standing, both ethically and academically.",
            "  b. They must have been taught all missionary discussions.",
            "  c. They must have received an ecclesiastical endorsement from their local leaders.",
            "3. Applicants must be under 30 or have turned 30 in the year of joining.",
            "4. Applicants must be single and have no children upon entering the program. If married or with children, additional conditions apply:",
            "  a. Space must be available after all qualified students are considered.",
            "  b. They must apply a minimum of 60 days before their start date.",
            "  c. Their application needs to be reviewed by the US SELFLESS Board.",
            "  d. They only qualify for transportation reimbursement."
          ]
        }
      }
    },
    stipend: {
      title: "V. Stipend Requirements",
      subsections: {
        fulltime: {
          title: "1. Full-time students at BYU-Idaho or Ensign College (enrolled in six or more credits of core, non-religion courses) who maintain a GPA of 3.0 or higher:",
          content: [
            "a. Paid tuition",
            "b. 40K per week stipend",
            "c. 3 days a week, tech-center attendance required",
            "d. 10K is deducted from the 40K for every day below three"
          ]
        },
        parttime: {
          title: "2. Part-time students at BYU-Idaho, Ensign College, and Pathway students (enrolled in five or fewer credits of core, non-religion courses):",
          content: [
            "Does not qualify for any stipend"
          ]
        }
      }
    },
    internship: {
      title: "VI. Internship and 'English Hub' Program Requirement",
      content: `Full-time, Part-time, and Pathway Connect students – It is required that every student either be enrolled in the SELFLESS CE English Program or an internship program. Internships include, but are not limited to,`,
      subsections: {
        types: {
          title: "1. Internship Types",
          content: [
            "a. Tutorship",
            "b. Tech center manager",
            "c. Assistant tech center manager",
            "d. An internal SELFLESS CE internship opportunity",
            "e. An off-site internship that relates to the student's major, if approved by the director",
            "f. An off-site internship that enhances English speaking and writing, if approved by the director"
          ]
        }
      }
    },
    probation: {
      title: "Academic Probation Policy",
      subsections: {
        fulltime_probation: {
          title: "Full-time students who do not meet 3.0 GPA or 6 credits but maintain GPA above 2.0",
          content: [
            "First-time Probation:",
            "  • No stipend will be provided, but qualified transportation reimbursement is available.",
            "  • Tuition will continue to be covered for one additional block.",
            "  • To regain eligibility for the 40K weekly stipend, students must have enrolled in 6 core credits and achieve a GPA exceeding 3.0 during the previous probation block."
          ]
        }
      }
    },
    disciplinary: {
      title: "Disciplinary Action for Insubordination, Trolling, or Cyberbullying",
      content: `All violations will be categorized as serious and will result in one of three outcomes, depending on the action and the student's remorse. Suspension results in no stipend, transportation, or tuition payments.`,
      subsections: {
        outcomes: {
          title: "Disciplinary Outcomes",
          content: [
            "1. Suspension for the remainder of the current block:",
            "  • If the student commits one offense",
            "  • If the student accepts the decision made by the tech center manager or assistant manager."
          ]
        }
      }
    },
    honor: {
      title: "Honor Code Violations",
      content: `All violations will be categorized as serious or minor, with specific definitions outlined below. In cases of uncertainty, the SELFLESS CE Board will recommend to the SELFLESS Board, which will make the final determination.`,
      subsections: {
        serious: {
          title: "Serious Violations",
          content: [
            "Serious violations include, but are not limited to:",
            "  • Sexual harassment",
            "  • Hate crimes",
            "  • Theft of property exceeding $20",
            "  • Property damage exceeding $100",
            "  • Altercations resulting in medical injuries",
            "  • Actions leading to incarceration by Ugandan authorities"
          ]
        },
        minor: {
          title: "Minor Violations",
          content: [
            "Minor violations include all infractions not classified as serious, such as:",
            "  • Cheating",
            "  • Lying",
            "  • Use of foul language",
            "  • Theft of property valued at less than $20",
            "  • Property damage valued at less than $100",
            "  • Misuse of SELFLESS CE property",
            "  • Possession or use of pornography",
            "  • Minor altercations"
          ]
        }
      }
    },
    access: {
      title: "Tech Center Access Policy",
      subsections: {
        fulltime_access: {
          title: "Full-time students (6 non-religion core block credits or more)",
          content: [
            "First rights to the tech center and its computers",
            "They can attend the tech center every day"
          ]
        },
        parttime_access: {
          title: "Part-Time Students",
          content: [
            "3-5 Credit Students:",
            "  • You can attend the tech center for up to 3 days each week.",
            "Less than three credit hours:",
            "  • Can attend the tech center for up to 2 days only each week."
          ]
        }
      }
    }
  };

  const navigationItems = [
    { id: 'purpose', title: 'Purpose & Mission', icon: '🎯' },
    { id: 'board', title: 'Board Members', icon: '👥' },
    { id: 'qualifications', title: 'Qualifications', icon: '📋' },
    { id: 'stipend', title: 'Stipend', icon: '💵' },
    { id: 'internship', title: 'Internship', icon: '💼' },
    { id: 'probation', title: 'Academic Probation', icon: '⚠️' },
    { id: 'disciplinary', title: 'Disciplinary Action', icon: '🚫' },
    { id: 'honor', title: 'Honor Code', icon: '⚖️' },
    { id: 'access', title: 'Tech Center Access', icon: '🏢' }
  ];

  const renderContent = (content: string | string[], isList: boolean = false) => {
    if (Array.isArray(content)) {
      return (
        <div className={isList ? "space-y-3" : "space-y-2"}>
          {content.map((item, index) => (
            <div key={index} className="text-slate-100 leading-relaxed">
              {isList && item.startsWith('•') ? (
                <div className="flex items-start space-x-3">
                  <span className="text-purple-400 mt-1">•</span>
                  <span className="flex-1">{item.replace('•', '').trim()}</span>
                </div>
              ) : item.startsWith('  •') ? (
                <div className="flex items-start space-x-3 ml-4">
                  <span className="text-purple-400 mt-1">•</span>
                  <span className="flex-1">{item.replace('  •', '').trim()}</span>
                </div>
              ) : item.match(/^\d+\./) ? (
                <div className="flex items-start space-x-3">
                  <span className="text-purple-400 font-semibold">{item.split('.')[0]}.</span>
                  <span className="flex-1">{item.split('.').slice(1).join('.').trim()}</span>
                </div>
              ) : (
                <div className="flex-1">{item}</div>
              )}
            </div>
          ))}
        </div>
      );
    }

    return <p className="text-slate-100 leading-relaxed">{content}</p>;
  };

  const renderSection = (sectionKey: string, section: { content?: string | string[]; subsections?: Record<string, { title: string; content?: string | string[]; list?: string }> }) => {
    return (
      <div className="space-y-6">
        {section.content && renderContent(section.content)}

        {section.subsections && Object.entries(section.subsections).map(([subKey, subsection]: [string, { title: string; content?: string | string[]; list?: string }]) => (
          <div key={subKey} className="bg-slate-700/50 rounded-xl p-6 border border-slate-600/50">
            <h3 className="text-lg font-semibold text-slate-100 mb-4">{subsection.title}</h3>
            {subsection.content && renderContent(subsection.content, true)}
            {subsection.list && renderContent(subsection.list, true)}
            {subsection.content && typeof subsection.content === 'string' && renderContent(subsection.content)}
          </div>
        ))}
      </div>
    );
  };

  // Show loading while checking authentication
  if (checkingAuth) {
    return <PageLoader text="Verifying Access" color="purple" />;
  }

  // Only render content if authenticated
  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <BackgroundImage className="min-h-screen relative">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-indigo-950/80 to-slate-900/80 backdrop-blur-sm"></div>
      <div className="relative z-10 container mx-auto px-4 py-6">
        {/* Professional Header */}
        <header className="mb-8">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center space-x-2 text-sm text-slate-400 mb-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="hover:text-slate-200 transition-colors"
            >
              Dashboard
            </button>
            <span>/</span>
            <span className="text-slate-200">Policies</span>
          </nav>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 via-indigo-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-xl shadow-purple-500/30">
                <Image
                  src="/freedom.png"
                  alt="Freedom City Tech Center"
                  className="w-10 h-10 object-contain"
                  width={40}
                  height={40}
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-100">SELFLESS CE Policies</h1>
                <p className="text-slate-400">Freedom City Tech Center • Organization Guidelines</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 rounded-lg border border-slate-700/50 transition-colors"
              >
                ← Back
              </button>
            </div>
          </div>
        </header>

        {/* Navigation and Content Container */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Navigation */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-lg">
              <div className="p-6 border-b border-slate-700/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <span className="text-purple-400 text-sm">📋</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-100">Policy Sections</h2>
                    <p className="text-slate-400 text-sm">Navigate guidelines</p>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <nav className="space-y-2">
                  {navigationItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 ${activeSection === item.id
                        ? 'bg-purple-600/20 border border-purple-500/30 text-purple-300'
                        : 'bg-slate-700/50 border border-slate-600/50 text-slate-300 hover:bg-slate-600/50 hover:border-purple-500/30'
                        }`}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span className="font-medium">{item.title}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="lg:hidden bg-slate-800/60 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-lg p-4 mb-6">
            <div className="grid grid-cols-3 gap-3">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`p-3 rounded-xl transition-all duration-200 flex flex-col items-center gap-2 ${activeSection === item.id
                    ? 'bg-purple-600/20 border border-purple-500/30 text-purple-300'
                    : 'bg-slate-700/50 border border-slate-600/50 text-slate-300'
                    }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-xs font-medium text-center">{item.title.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-lg">
              <div className="p-6 border-b border-slate-700/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <span className="text-purple-400 text-sm">📄</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-100">{policies[activeSection as keyof typeof policies].title}</h2>
                    <p className="text-slate-400 text-sm">Current policy section</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="prose prose-invert max-w-none">
                  {renderSection(activeSection, policies[activeSection as keyof typeof policies])}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BackgroundImage>
  );
}

export default PoliciesPage;
