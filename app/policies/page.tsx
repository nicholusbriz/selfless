'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useState } from 'react';

function PoliciesPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('purpose');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Check authentication
  useEffect(() => {
    const checkAuthentication = async () => {
      // Get user data from URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const userId = urlParams.get('userId');
      const email = urlParams.get('email');

      if (!userId || !email) {
        // No auth params, redirect to home
        router.push('/');
        return;
      }

      try {
        // Verify user exists in database
        const response = await fetch('/api/user-status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId, email }),
        });

        if (!response.ok) {
          // User not found, redirect to home
          router.push('/');
          return;
        }

        const data = await response.json();

        if (data.success && data.user) {
          setIsAuthenticated(true);
        } else {
          // User not found, redirect to home
          router.push('/');
        }
      } catch {
        router.push('/');
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuthentication();
  }, [router]);

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
        <div className={isList ? "space-y-2" : "space-y-1"}>
          {content.map((item, index) => (
            <div key={index} className="text-gray-700 leading-relaxed">
              {isList && item.startsWith('•') ? (
                <div className="flex items-start space-x-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>{item.replace('•', '').trim()}</span>
                </div>
              ) : item.startsWith('  •') ? (
                <div className="flex items-start space-x-2 ml-4">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>{item.replace('  •', '').trim()}</span>
                </div>
              ) : item.match(/^\d+\./) ? (
                <div className="flex items-start space-x-2">
                  <span className="text-blue-500 font-semibold">{item.split('.')[0]}.</span>
                  <span>{item.split('.').slice(1).join('.').trim()}</span>
                </div>
              ) : (
                <div>{item}</div>
              )}
            </div>
          ))}
        </div>
      );
    }

    return <p className="text-gray-700 leading-relaxed">{content}</p>;
  };

  const renderSection = (sectionKey: string, section: { content?: string | string[]; subsections?: Record<string, { title: string; content?: string | string[]; list?: string }> }) => {
    return (
      <div className="space-y-6">
        {section.content && renderContent(section.content)}

        {section.subsections && Object.entries(section.subsections).map(([subKey, subsection]: [string, { title: string; content?: string | string[]; list?: string }]) => (
          <div key={subKey} className="bg-blue-50 rounded-lg p-6 border border-blue-200">
            <h3 className="text-xl font-semibold text-blue-900 mb-4">{subsection.title}</h3>
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
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
        <div className="text-center relative z-10">
          <div className="mb-8">
            <div className="relative inline-flex items-center justify-center">
              <div className="absolute inset-0 w-24 h-24 border-4 border-purple-500/30 rounded-full animate-spin"></div>
              <div className="absolute inset-2 w-20 h-20 border-4 border-indigo-500/50 rounded-full animate-spin animation-reverse"></div>
              <div className="absolute inset-4 w-16 h-16 border-4 border-pink-500/70 rounded-full animate-spin animation-delay-1000"></div>
              <div className="relative w-12 h-12 bg-gradient-to-br from-purple-600 via-indigo-600 to-pink-600 rounded-full shadow-2xl shadow-purple-500/50 flex items-center justify-center animate-bounce-in">
                <Image
                  src="/freedom.png"
                  alt="Freedom Logo"
                  width={32}
                  height={32}
                  className="w-8 h-8 object-contain animate-glow"
                />
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-300 via-indigo-300 to-pink-300 bg-clip-text text-transparent animate-gradient-shift">
            Verifying Access
          </h1>
          <p className="text-purple-200 text-lg font-medium mt-4">
            Please wait while we verify your credentials...
          </p>
        </div>
      </div>
    );
  }

  // Only render content if authenticated
  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pb-20 md:pb-0">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full p-1.5">
                <Image src="/freedom.png" alt="Logo" width={20} height={20} className="w-full h-full object-contain" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">SELFLESS CE Policies</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="grid grid-cols-3 gap-2">
          {navigationItems.slice(0, 9).map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`px-2 py-2 rounded-lg text-xs font-medium transition-colors text-center ${activeSection === item.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              <div className="text-lg mb-1">{item.icon}</div>
              <div className="leading-tight">{item.title.split(' ')[0]}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Policy Sections</h2>
              <nav className="space-y-2">
                {navigationItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center space-x-3 ${activeSection === item.id
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-gray-100 text-gray-700'
                      }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="font-medium">{item.title}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 lg:p-8">
              <div className="mb-6">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
                  {policies[activeSection as keyof typeof policies].title}
                </h1>
                <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full w-20"></div>
              </div>

              <div className="prose prose-lg max-w-none">
                {renderSection(activeSection, policies[activeSection as keyof typeof policies])}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Go to Dashboard Button */}
      <div className="text-center mt-8">
        <button
          onClick={() => {
            // Preserve URL parameters when redirecting to dashboard
            const urlParams = new URLSearchParams(window.location.search);
            router.push(`/dashboard?${urlParams.toString()}`);
          }}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25 flex items-center justify-center gap-3"
        >
          <span className="text-xl">🏠</span>
          <span className="text-lg">Back to Dashboard</span>
        </button>
      </div>
    </div>
  );
}

export default PoliciesPage;
