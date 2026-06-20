'use client';

import { motion } from 'framer-motion';
import { 
  AlertTriangle, Shield, Users, Monitor, GraduationCap, 
  BookOpen, Clock, DollarSign, XCircle, CheckCircle, Sparkles,
  FileCheck, Building, Utensils, Award, Wifi, Key, Lock,
  Briefcase, Globe, Star, Calendar, UserCheck, MapPin, Home,
  Coffee, ShoppingBag, Truck, Receipt, Smartphone, Eye, Settings,
  FileText, PenTool, ExternalLink, TrendingUp, RefreshCw, AlertOctagon
} from 'lucide-react';

export default function PoliciesTab() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Policies & Guidelines</h1>
        <p className="text-gray-400 text-sm sm:text-base">SELFLESS CE Handbook - Official Policies and Guidelines</p>
      </motion.div>

      {/* SECTION I: SELFLESS CE Purpose and Mission */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-lg border border-purple-500/20 rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          I. SELFLESS CE Purpose and Mission
        </h3>
        <div className="space-y-4 text-gray-300 text-sm">
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-gray-400 leading-relaxed">
              The mission of SELFLESS CE is to <strong className="text-purple-300">Support Efforts to Lead Families and Individuals toward Lifelong Education and Self-Sufficiency (SELFLESS)</strong>. We aim to foster a safe and supportive learning environment where young adults can access educational opportunities that empower them to achieve self-sufficiency. By doing so, we strive to inspire these individuals to support their families and contribute to uplifting others in their communities.
            </p>
          </div>
        </div>
      </motion.div>

      {/* SECTION II: Board Members and Function */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-400" />
          II. Board Members and Function (as of 12/09/2025)
        </h3>
        <p className="text-gray-400 text-sm mb-4">
          The SELFLESS CE board member plays a critical role in upholding the organization's integrity and ensuring that the perspectives of both students and leaders are valued. This is a voluntary position appointed by the SELFLESS Board, and as such, it is not compensated for their role as a board member. Each SELFLESS CE board member holds one vote in all organizational decisions. In the event of a tie, the board advisors will cast the deciding vote. Initiatives approved by the SELFLESS CE Board will be submitted to the SELFLESS Board for final approval.
        </p>

        {/* Current SELFLESS CE board members */}
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4 mb-4">
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" />
            1. Current SELFLESS CE Board Members
          </h4>
          <div className="space-y-2 text-gray-300 text-sm">
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-purple-400 text-xs font-bold">a</span>
              </div>
              <p>Rachael Namuge – Board Member</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-purple-400 text-xs font-bold">b</span>
              </div>
              <p>Douglas W. Kasozi – Secretary</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-purple-400 text-xs font-bold">c</span>
              </div>
              <p>Anigo Agnes Mary – Board Member</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-purple-400 text-xs font-bold">d</span>
              </div>
              <p>Atong Khur Aguto – Treasurer (Currently not an official board member, but recognized as a decision maker by the SELFLESS Board)</p>
            </div>
          </div>
        </div>

        {/* Board Advisors */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-4">
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-400" />
            2. Board Advisors
          </h4>
          <div className="space-y-2 text-gray-300 text-sm">
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-400 text-xs font-bold">a</span>
              </div>
              <p>Abraham Hwang</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-400 text-xs font-bold">b</span>
              </div>
              <p>Jeanie Conrad</p>
            </div>
          </div>
        </div>

        {/* SELFLESS Board Members */}
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-green-400" />
            3. SELFLESS Board Members
          </h4>
          <div className="space-y-2 text-gray-300 text-sm">
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-green-400 text-xs font-bold">a</span>
              </div>
              <p>Jan Hwang (President)</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-green-400 text-xs font-bold">b</span>
              </div>
              <p>Audrey Hwang (Treasurer)</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-green-400 text-xs font-bold">c</span>
              </div>
              <p>Leena Barnum (Secretary)</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* SECTION III: New Applicant Qualification Requirements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.25 }}
        className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-emerald-400" />
          III. New Applicant Qualification Requirements
        </h3>
        <p className="text-gray-400 text-sm mb-4">
          All new applicants must complete an application and receive approval from the SELFLESS CE Board. All applications must be prepared and submitted to the Board at least 30 days before the start of the following block. Before the board review, office managers thoroughly evaluate each applicant's qualifications to ensure eligibility.
        </p>

        <div className="space-y-3">
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-emerald-400 text-xs font-bold">1</span>
              </div>
              <p className="text-gray-300 text-sm">Applicants must be members of The Church of Jesus Christ of Latter-day Saints for a minimum of 6 months.</p>
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-400 text-xs font-bold">2</span>
              </div>
              <div className="space-y-2 text-gray-300 text-sm">
                <p className="font-medium text-white">If not a member of The Church of Jesus Christ of Latter-day Saints, applicants must meet the following conditions:</p>
                <div className="space-y-1 pl-4">
                  <div className="flex items-start gap-2">
                    <span className="text-blue-400 text-xs font-bold">a.</span>
                    <p>They must be good friends (friends for over 1 year) of a current student in good standing, both ethically and academically.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-400 text-xs font-bold">b.</span>
                    <p>They must have been taught all missionary discussions.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-400 text-xs font-bold">c.</span>
                    <p>They must have received an ecclesiastical endorsement from their local leaders.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-purple-400 text-xs font-bold">3</span>
              </div>
              <p className="text-gray-300 text-sm">Applicants must be under 30 or have turned 30 in the year of joining.</p>
            </div>
          </div>

          <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-orange-400 text-xs font-bold">4</span>
              </div>
              <div className="space-y-2 text-gray-300 text-sm">
                <p>Applicants must be single and have no children upon entering the program. If married or with children, additional conditions apply:</p>
                <div className="space-y-1 pl-4">
                  <div className="flex items-start gap-2">
                    <span className="text-orange-400 text-xs font-bold">a.</span>
                    <p>Space must be available after all qualified students are considered.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-orange-400 text-xs font-bold">b.</span>
                    <p>They must apply a minimum of 60 days before their start date.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-orange-400 text-xs font-bold">c.</span>
                    <p>Their application needs to be reviewed by the US SELFLESS Board.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-orange-400 text-xs font-bold">d.</span>
                    <p>They only qualify for transportation reimbursement.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* SECTION IV: Technology Center Major Expenditures */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Building className="w-5 h-5 text-cyan-400" />
          IV. Technology Center Major Expenditures
        </h3>

        {/* Rent Section */}
        <div className="mb-6">
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Home className="w-5 h-5 text-cyan-400" />
            1. Rent
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Jinja */}
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
              <h5 className="text-purple-300 font-medium mb-2">a. Jinja</h5>
              <div className="space-y-1 text-gray-300 text-sm">
                <p><span className="text-gray-400">Size:</span> 148 SQM</p>
                <p><span className="text-gray-400">Cost:</span> 2,000,000 UGX per month (13,500/SQM)</p>
                <p><span className="text-gray-400">Owner:</span> Mohamed Omar Muhamed</p>
                <p><span className="text-gray-400">Address:</span> Plot 09 Acacia Ave</p>
                <p><span className="text-gray-400">Tel:</span> +256 751 700759</p>
                <p><span className="text-gray-400">Email:</span> twaha67@gmail.com</p>
              </div>
            </div>

            {/* Masaka */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <h5 className="text-blue-300 font-medium mb-2">b. Masaka</h5>
              <div className="space-y-1 text-gray-300 text-sm">
                <p><span className="text-gray-400">Size:</span> 115 SQM</p>
                <p><span className="text-gray-400">Cost:</span> 1,200,000 UGX per month (10,500/SQM)</p>
                <p><span className="text-gray-400">Owner:</span> Ernest M. Ntanda</p>
                <p><span className="text-gray-400">Tel:</span> +256 743 110721</p>
                <p><span className="text-gray-400">Email:</span> ernestmntanda@gmail.com</p>
              </div>
            </div>

            {/* Freedom City */}
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <h5 className="text-green-300 font-medium mb-2">c. Freedom City</h5>
              <div className="space-y-1 text-gray-300 text-sm">
                <p><span className="text-gray-400">Size:</span> 173 SQM</p>
                <p><span className="text-gray-400">Cost:</span> 1,500,000 UGX per month (8,600/SQM)</p>
                <p><span className="text-gray-400">Owner:</span> Betty Kiguli</p>
                <p><span className="text-gray-400">Tel:</span> +256 758 411339</p>
              </div>
            </div>

            {/* Ntinda */}
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
              <h5 className="text-orange-300 font-medium mb-2">d. Ntinda</h5>
              <div className="space-y-1 text-gray-300 text-sm">
                <p><span className="text-gray-400">Size:</span> 43 SQM (1st Room: 21.8 x 12.5, 2nd Room: 15 x 12.5)</p>
                <p><span className="text-gray-400">Cost:</span> 1,400,000 UGX per month (32,500/SQM)</p>
                <p><span className="text-gray-400">Owner:</span> Kimbowa Stanley</p>
                <p><span className="text-gray-400">Tel:</span> +256 782 829930</p>
              </div>
            </div>

            {/* Sseta */}
            <div className="bg-pink-500/10 border border-pink-500/20 rounded-lg p-4">
              <h5 className="text-pink-300 font-medium mb-2">e. Sseta</h5>
              <div className="space-y-1 text-gray-300 text-sm">
                <p><span className="text-gray-400">Size:</span> 63 SQM</p>
                <p><span className="text-gray-400">Cost:</span> 600,000 UGX per month (9,500/SQM)</p>
                <p><span className="text-gray-400">Owner:</span> Bonny Walker Lubowa</p>
                <p><span className="text-gray-400">Tel:</span> +256 789225437</p>
              </div>
            </div>

            {/* Lira */}
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
              <h5 className="text-amber-300 font-medium mb-2">f. Lira</h5>
              <div className="space-y-1 text-gray-300 text-sm">
                <p><span className="text-gray-400">Size:</span> 30 SQM (5.5x5.5sqm)</p>
                <p><span className="text-gray-400">Cost:</span> 500,000 UGX per month (16,500/SQM)</p>
                <p><span className="text-gray-400">Owner:</span> Charles Ojede</p>
                <p><span className="text-gray-400">Tel:</span> +256 772794258</p>
              </div>
            </div>
          </div>
        </div>

        {/* Food and Snack Allocation */}
        <div>
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Utensils className="w-5 h-5 text-cyan-400" />
            2. Food and Snack allocation per whole month (As of 11/01/25)
          </h4>
          <p className="text-gray-400 text-sm mb-3">Subject to change based on the number of students attending the tech center.</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <p className="text-purple-300 font-medium">Sseta</p>
              <p className="text-gray-300 text-sm">1,600,000 UGX</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <p className="text-purple-300 font-medium">Jinja</p>
              <p className="text-gray-300 text-sm">3,200,000 UGX</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <p className="text-purple-300 font-medium">Masaka</p>
              <p className="text-gray-300 text-sm">1,100,000 UGX</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <p className="text-purple-300 font-medium">Freedom</p>
              <p className="text-gray-300 text-sm">2,000,000 UGX</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <p className="text-purple-300 font-medium">Ntinda</p>
              <p className="text-gray-300 text-sm">2,700,000 UGX</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <p className="text-purple-300 font-medium">Lira</p>
              <p className="text-gray-300 text-sm">800,000 UGX</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* SECTION V: Stipend Requirements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.35 }}
        className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-yellow-400" />
          V. Stipend Requirements
        </h3>

        <div className="space-y-4">
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-green-400" />
              1. Full-time students at BYU-Idaho or Ensign College
            </h4>
            <p className="text-gray-400 text-sm mb-2">Enrolled in six or more credits of core, non-religion courses who maintain a GPA of 3.0 or higher:</p>
            <div className="space-y-2 text-gray-300 text-sm">
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                </div>
                <p>Paid tuition</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                </div>
                <p>40K per week stipend</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                </div>
                <p>3 days a week, tech-center attendance required</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                </div>
                <p>10K is deducted from the 40K for every day below three</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-400" />
              2. Part-time students at BYU-Idaho, Ensign College, and Pathway students
            </h4>
            <p className="text-gray-400 text-sm">Enrolled in five or fewer credits of core, non-religion courses: <span className="text-red-400 font-medium">Does not qualify for any stipend</span></p>
          </div>

          <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Globe className="w-5 h-5 text-purple-400" />
              3. Pathway Connect students at BYU-Idaho, Ensign College, and Pathway students
            </h4>
            <p className="text-gray-400 text-sm">Enrolled in five or fewer credits of core, non-religion courses: <span className="text-red-400 font-medium">Does not qualify for any stipend</span></p>
          </div>
        </div>
      </motion.div>

      {/* SECTION VI: Internship and "English Hub" Program Requirement */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-teal-400" />
          VI. Internship and "English Hub" Program Requirement
        </h3>

        <div className="space-y-4">
          <div className="bg-teal-500/10 border border-teal-500/20 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-teal-400" />
              1. Full-time, Part-time, and Pathway Connect students
            </h4>
            <p className="text-gray-400 text-sm mb-3">It is required that every student either be enrolled in the SELFLESS CE English Program or an internship program. Internships include, but are not limited to:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-gray-300 text-sm">
              <div className="flex items-start gap-2 bg-white/5 rounded-lg p-2">
                <span className="text-teal-400 text-xs font-bold">a.</span>
                <p>Tutorship</p>
              </div>
              <div className="flex items-start gap-2 bg-white/5 rounded-lg p-2">
                <span className="text-teal-400 text-xs font-bold">b.</span>
                <p>Tech center manager</p>
              </div>
              <div className="flex items-start gap-2 bg-white/5 rounded-lg p-2">
                <span className="text-teal-400 text-xs font-bold">c.</span>
                <p>Assistant tech center manager</p>
              </div>
              <div className="flex items-start gap-2 bg-white/5 rounded-lg p-2">
                <span className="text-teal-400 text-xs font-bold">d.</span>
                <p>An internal SELFLESS CE internship opportunity</p>
              </div>
              <div className="flex items-start gap-2 bg-white/5 rounded-lg p-2">
                <span className="text-teal-400 text-xs font-bold">e.</span>
                <p>An off-site internship that relates to the student's major, if approved by the director</p>
              </div>
              <div className="flex items-start gap-2 bg-white/5 rounded-lg p-2">
                <span className="text-teal-400 text-xs font-bold">f.</span>
                <p>An off-site internship that enhances English speaking and writing, if approved by the director</p>
              </div>
            </div>
          </div>

          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Truck className="w-5 h-5 text-green-400" />
              2. Full-time student - Transportation Reimbursement
            </h4>
            <div className="space-y-3 text-gray-300 text-sm">
              <div className="bg-white/5 rounded-lg p-3">
                <h5 className="text-green-300 font-medium mb-2">a. Students with internships</h5>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-green-400 text-xs font-bold">i</span>
                    </div>
                    <p>30K maximum weekly transportation reimbursement can be earned</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-green-400 text-xs font-bold">ii</span>
                    </div>
                    <p>They must meet all the internship-required tasks and hours.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 bg-yellow-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-yellow-400 text-xs font-bold">iii</span>
                    </div>
                    <p>5K will be deducted from the 30K transportation reimbursement for every hour missed until the complete 30K has been depleted. The hiring manager can approve exceptions in advance.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-400 text-xs font-bold">iv</span>
                    </div>
                    <p>The determination of these qualifications will be made by the internship manager, with feedback from the tech center managers as needed.</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-3">
                <h5 className="text-blue-300 font-medium mb-2">b. Students with no internships</h5>
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-400 text-xs font-bold">i</span>
                  </div>
                  <p>50K maximum weekly transportation reimbursement can be earned</p>
                </div>
                <div className="flex items-start gap-2 mt-2">
                  <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-400 text-xs font-bold">ii</span>
                  </div>
                  <p>10K in transportation reimbursement for each day the student attends the 90-minute English Course, up to 5 days a week.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-400" />
              3. Part-time students and Pathway Connect Students
            </h4>
            <div className="space-y-2 text-gray-300 text-sm">
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-purple-400 text-xs font-bold">i</span>
                </div>
                <p>Part-time students will receive 10K in transportation reimbursement for each day they attend the 90-minute English Course, up to 3 days a week.</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-purple-400 text-xs font-bold">ii</span>
                </div>
                <p>Pathway Connect students will receive 10K in transportation reimbursement for each day they attend the 90-minute English Course, up to 2 days a week.</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* SECTION VII: Academic Probation Policy */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.45 }}
        className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-purple-400" />
          VII. Academic Probation Policy
        </h3>

        {/* Full-time students 3.0+ GPA */}
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4 mb-4">
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-purple-400" />
            1. Full-time students at BYU-Idaho or Ensign College who do not meet the 3.0 GPA or the minimum requirement of six credits in core, non-religion courses but maintain a GPA above 2.0
          </h4>
          
          {/* First-time Probation */}
          <div className="bg-white/5 rounded-lg p-3 mb-3">
            <h5 className="text-purple-300 font-medium mb-2">a. First-time Probation</h5>
            <div className="space-y-2 text-gray-300 text-sm">
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-purple-400 text-xs font-bold">i</span>
                </div>
                <p>No stipend will be provided, but qualified transportation reimbursement is available</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-purple-400 text-xs font-bold">ii</span>
                </div>
                <p>Tuition will continue to be covered for one additional block</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-purple-400 text-xs font-bold">iii</span>
                </div>
                <p>To regain eligibility for the 40K weekly stipend, students must have enrolled in 6 core credits and achieve a GPA exceeding 3.0 during the previous probation block</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-purple-400 text-xs font-bold">iv</span>
                </div>
                <p>If enrolled in fewer than six credits during the probation block but achieved a GPA exceeding 3.0, then the student will only qualify for transportation reimbursement. This will continue for the following blocks until the student can demonstrate a block with 6 credits and maintain a GPA of 3.0 or higher</p>
              </div>
            </div>
          </div>

          {/* Second-time Suspension */}
          <div className="bg-white/5 rounded-lg p-3">
            <h5 className="text-red-300 font-medium mb-2">b. Second-time Suspension</h5>
            <div className="space-y-2 text-gray-300 text-sm">
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-red-400 text-xs font-bold">i</span>
                </div>
                <p>No stipend or transportation reimbursement will be provided</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-red-400 text-xs font-bold">ii</span>
                </div>
                <p>Tuition will not be covered unless the student achieves a GPA of 3.0 or higher while enrolled in a minimum of three credits in the following block</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-red-400 text-xs font-bold">iii</span>
                </div>
                <p>To regain eligibility for the 40K weekly stipend & transportation reimbursement, students must achieve a GPA exceeding 3.0 and have enrolled in six core credits. If fewer than three core credits, the student will only qualify for transportation for the following block. This will continue for the following blocks until the student can demonstrate a block with six credits and maintain a GPA of 3.0 or higher</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-red-400 text-xs font-bold">iv</span>
                </div>
                <p>Past tuition for the block will be reimbursed if the student attains a GPA of 3.0 or higher for that block</p>
              </div>
            </div>
          </div>
        </div>

        {/* Full-time students below 2.0 GPA */}
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-400" />
            2. Full-time students at BYU-Idaho or Ensign College who do not meet the 2.0 GPA or the minimum requirement of six core, non-religion courses
          </h4>
          <div className="space-y-2 text-gray-300 text-sm">
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-red-400 text-xs font-bold">a</span>
              </div>
              <p>No stipend or transportation reimbursement will be provided</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-red-400 text-xs font-bold">b</span>
              </div>
              <p>Tuition will not be covered unless the student achieves a GPA of 3.0 or higher while enrolled in a minimum of three credits in the following block</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-red-400 text-xs font-bold">c</span>
              </div>
              <p>To regain eligibility for the 40K weekly stipend & transportation reimbursement, students must achieve a GPA exceeding 3.0 and have enrolled in six core credits. If fewer than three core credits, the student will only qualify for transportation for the following block. This will continue for the following blocks until the student can demonstrate a block with six credits and maintain a GPA of 3.0 or higher</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-red-400 text-xs font-bold">d</span>
              </div>
              <p>Past tuition for the block will be reimbursed if the student attains a GPA of 3.0 or higher for that block</p>
            </div>
          </div>
        </div>

        {/* Part-time students 3.0+ GPA */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-4">
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-400" />
            3. Part-time students at BYU-Idaho, Ensign College, and Pathway students (enrolled in 5 or fewer credits of core, non-religion courses) who do not meet the 3.0 GPA requirement but exceed a 2.0 GPA
          </h4>
          
          {/* First-time Probation */}
          <div className="bg-white/5 rounded-lg p-3 mb-3">
            <h5 className="text-blue-300 font-medium mb-2">a. First-time Probation</h5>
            <div className="space-y-2 text-gray-300 text-sm">
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-400 text-xs font-bold">i</span>
                </div>
                <p>The student will have one additional opportunity to remain part-time, taking three credits, with eligibility for a transportation stipend</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-400 text-xs font-bold">ii</span>
                </div>
                <p>To gain eligibility for the 40K weekly stipend & transportation reimbursement, students must achieve a GPA exceeding 3.0 and have enrolled in six core credits for a block</p>
              </div>
            </div>
          </div>

          {/* Second-time Suspension */}
          <div className="bg-white/5 rounded-lg p-3">
            <h5 className="text-red-300 font-medium mb-2">b. Second-time Suspension</h5>
            <div className="space-y-2 text-gray-300 text-sm">
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-red-400 text-xs font-bold">i</span>
                </div>
                <p>No transportation reimbursement will be provided</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-red-400 text-xs font-bold">ii</span>
                </div>
                <p>Tuition will not be covered unless the student achieves a GPA of 3.0 or higher while enrolled in a maximum of three credits in the following block</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-red-400 text-xs font-bold">iii</span>
                </div>
                <p>To regain eligibility for transportation reimbursement, students must have enrolled in three core credits and achieve a GPA exceeding 3.0</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-red-400 text-xs font-bold">iv</span>
                </div>
                <p>To gain eligibility for the 40K weekly stipend & transportation reimbursement, students must achieve a GPA exceeding 3.0 and have enrolled in six core credits for a block</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-red-400 text-xs font-bold">v</span>
                </div>
                <p>Past tuition for the block will be reimbursed if the student attains a GPA of 3.0 or higher for that block</p>
              </div>
            </div>
          </div>
        </div>

        {/* Part-time students below 2.0 GPA */}
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4 mb-4">
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
            4. Part-time students at BYU-Idaho, Ensign College, and Pathway students (enrolled in 5 or fewer credits of core, non-religion courses) who do not meet the 2.0 GPA requirement
          </h4>
          <div className="space-y-2 text-gray-300 text-sm">
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-orange-400 text-xs font-bold">a</span>
              </div>
              <p>No transportation reimbursement will be provided</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-orange-400 text-xs font-bold">b</span>
              </div>
              <p>Tuition will not be covered unless the student achieves a GPA of 3.0 or higher while enrolled in a maximum of three credits</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-orange-400 text-xs font-bold">c</span>
              </div>
              <p>To requalify for a 30K stipend, the student must complete three credit hours and exceed a GPA of 3.0</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-orange-400 text-xs font-bold">d</span>
              </div>
              <p>Past tuition for three credits will be reimbursed if the student achieves a GPA of 3.0 or higher</p>
            </div>
          </div>
        </div>

        {/* Tutors below 3.5 GPA */}
        <div className="bg-teal-500/10 border border-teal-500/20 rounded-lg p-4 mb-4">
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-400" />
            5. Tutors who do not meet the 3.5 GPA requirement but maintain a GPA exceeding 2.5
          </h4>
          <div className="space-y-2 text-gray-300 text-sm">
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-teal-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-teal-400 text-xs font-bold">a</span>
              </div>
              <p>They will no longer serve as tutors but transition to regular student status, becoming eligible for a 40K weekly stipend for the following block</p>
            </div>
          </div>
        </div>

        {/* Tutors below 2.5 GPA */}
        <div className="bg-pink-500/10 border border-pink-500/20 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            <XCircle className="w-5 h-5 text-pink-400" />
            6. Tutors who do not meet the 2.5 GPA requirement
          </h4>
          <div className="space-y-2 text-gray-300 text-sm">
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-pink-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-pink-400 text-xs font-bold">a</span>
              </div>
              <p>They will no longer serve as tutors but transition to regular student status, becoming eligible for weekly transportation reimbursement for the following block</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-pink-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-pink-400 text-xs font-bold">b</span>
              </div>
              <p>Tuition will be covered for one additional block</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-pink-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-pink-400 text-xs font-bold">c</span>
              </div>
              <p>To requalify for a 40K stipend, they must enroll in six core credits and exceed a GPA of 3.0</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* SECTION VIII: Disciplinary Action for Dropped Classes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          VIII. Disciplinary Action for Dropped Classes
        </h3>

        {/* BYU-Idaho and Ensign College Full-Time Students */}
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4 mb-4">
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-purple-400" />
            1. BYU-Idaho and Ensign College Full-Time Students
          </h4>
          <p className="text-gray-400 text-sm mb-3">
            Defined as students enrolled in six or more credits of core non-religion courses with a GPA of 3.0 or higher
          </p>

          {/* Before Tuition Deadline */}
          <div className="space-y-3">
            <div className="bg-white/5 rounded-lg p-3">
              <h5 className="text-purple-300 font-medium mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-400" />
                a. Dropping Classes Before the Tuition Deadline
              </h5>
              <div className="space-y-2 text-gray-300 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-400 text-xs font-bold">i</span>
                  </div>
                  <p>If the student remains enrolled in 6 or more credits, no action is required.</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-orange-400 text-xs font-bold">ii</span>
                  </div>
                  <p>If a student drops below six credits, he will only qualify for transportation reimbursement. Any stipends received for the block must be recovered through future transportation reimbursements.</p>
                </div>
              </div>
            </div>

            {/* After Tuition Deadline */}
            <div className="bg-white/5 rounded-lg p-3">
              <h5 className="text-red-300 font-medium mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                b. Dropping Classes After the Tuition Deadline
              </h5>
              <div className="space-y-2 text-gray-300 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-400 text-xs font-bold">i</span>
                  </div>
                  <p>If the student remains enrolled in six or more credits, only the forfeited tuition cost will be recovered. Stipends will be withheld until the forfeited tuition amount has been fully repaid.</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-red-400 text-xs font-bold">ii</span>
                  </div>
                  <p>If a student drops below six credits, he will only be eligible for transportation reimbursement. The student must repay any forfeited tuition, and future transportation reimbursements will be withheld until the outstanding balance is paid in full.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BYUI Part-time and Pathway Students */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-400" />
            2. BYUI Part-time and Pathway Students
          </h4>

          {/* Before Tuition Deadline */}
          <div className="space-y-3">
            <div className="bg-white/5 rounded-lg p-3">
              <h5 className="text-blue-300 font-medium mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" />
                a. Dropping Classes Before the Tuition Deadline
              </h5>
              <div className="space-y-2 text-gray-300 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-400 text-xs font-bold">i</span>
                  </div>
                  <p>No action is required if the student remains enrolled in three or more credits.</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-orange-400 text-xs font-bold">ii</span>
                  </div>
                  <p>If the student drops below three credits: (1) they will no longer qualify for transportation reimbursements, and (2) any transportation reimbursements already received for the block must be recovered through future transportation reimbursements or stipends in a subsequent block.</p>
                </div>
              </div>
            </div>

            {/* After Tuition Deadline */}
            <div className="bg-white/5 rounded-lg p-3">
              <h5 className="text-red-300 font-medium mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                b. Dropping Classes After the Tuition Deadline
              </h5>
              <div className="space-y-2 text-gray-300 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-400 text-xs font-bold">i</span>
                  </div>
                  <p>If the student remains enrolled in three or more credits, only the forfeited tuition cost will be recovered. Transportation reimbursements will be withheld until the forfeited tuition amount has been fully repaid.</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-red-400 text-xs font-bold">ii</span>
                  </div>
                  <p>Students who drop below three credits will no longer be eligible for transportation reimbursements. The student must repay any transportation reimbursements already received for the block, as well as the forfeited tuition.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* SECTION IX: Disciplinary Action for Insubordination, Trolling, or Cyberbullying */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.55 }}
        className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          IX. Disciplinary Action for Insubordination, Trolling, or Cyberbullying
        </h3>
        <p className="text-gray-400 text-sm mb-4">
          All violations will be categorized as serious and will result in one of three outcomes, depending on the action and the student's remorse. Suspension results in no stipend, transportation, or tuition payments.
        </p>

        {/* Outcome 1 */}
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4 mb-4">
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-400" />
            1. Suspension for the remainder of the current block
          </h4>
          <div className="space-y-2 text-gray-300 text-sm">
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-orange-400 text-xs font-bold">a</span>
              </div>
              <p>If the student commits one offense</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-orange-400 text-xs font-bold">b</span>
              </div>
              <p>If the student accepts the decision made by the tech center manager or assistant manager</p>
            </div>
          </div>
        </div>

        {/* Outcome 2 */}
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-400" />
            2. Suspension for the remainder of the current block and the next block
          </h4>
          <div className="space-y-2 text-gray-300 text-sm">
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-red-400 text-xs font-bold">a</span>
              </div>
              <p>If the student has two or more offenses</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-red-400 text-xs font-bold">b</span>
              </div>
              <p>Or if the student commits one offense and wants to challenge the decision of the center manager with the Director of Student Affairs, and is unsuccessful</p>
            </div>
          </div>
        </div>

        {/* Outcome 3 */}
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-purple-400" />
            3. Suspension immediately, and can reapply after the following two blocks
          </h4>
          <p className="text-gray-400 text-sm mb-3">There is no guarantee they will be accepted when they reapply.</p>
          <div className="space-y-2 text-gray-300 text-sm">
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-purple-400 text-xs font-bold">a</span>
              </div>
              <p>If the student has two or more offenses</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-purple-400 text-xs font-bold">b</span>
              </div>
              <p>Or if the student commits one offense or two offenses and wants to challenge the decision of the center manager with the SELFLESS CE or SELFLESS Board and is unsuccessful</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* SECTION X: Honor Code Violations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-400" />
          X. Honor Code Violations
        </h3>
        <p className="text-gray-400 text-sm mb-4">
          All violations will be categorized as serious or minor, with specific definitions outlined below. In cases of uncertainty, the SELFLESS CE Board will recommend to the SELFLESS Board, which will make the final determination.
        </p>

        {/* Serious Violations */}
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-400" />
            1. Serious Violations
          </h4>
          <p className="text-gray-400 text-sm mb-3">Serious violations include, but are not limited to:</p>
          <div className="space-y-2 text-gray-300 text-sm">
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-red-400 text-xs font-bold">a</span>
              </div>
              <p>Sexual harassment</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-red-400 text-xs font-bold">b</span>
              </div>
              <p>Hate crimes</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-red-400 text-xs font-bold">c</span>
              </div>
              <p>Theft of property exceeding $20</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-red-400 text-xs font-bold">d</span>
              </div>
              <p>Property damage exceeding $100</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-red-400 text-xs font-bold">e</span>
              </div>
              <p>Altercations resulting in medical injuries</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-red-400 text-xs font-bold">f</span>
              </div>
              <p>Actions leading to incarceration by Ugandan authorities</p>
            </div>
          </div>
        </div>

        {/* Minor Violations */}
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-4">
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            2. Minor Violations
          </h4>
          <p className="text-gray-400 text-sm mb-3">Minor violations include all infractions not classified as serious, such as:</p>
          <div className="space-y-2 text-gray-300 text-sm">
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-yellow-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-yellow-400 text-xs font-bold">a</span>
              </div>
              <p>Cheating</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-yellow-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-yellow-400 text-xs font-bold">b</span>
              </div>
              <p>Lying</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-yellow-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-yellow-400 text-xs font-bold">c</span>
              </div>
              <p>Use of foul language</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-yellow-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-yellow-400 text-xs font-bold">d</span>
              </div>
              <p>Theft of property valued at less than $20</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-yellow-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-yellow-400 text-xs font-bold">e</span>
              </div>
              <p>Property damage valued at less than $100</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-yellow-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-yellow-400 text-xs font-bold">f</span>
              </div>
              <p>Misuse of SELFLESS CE property</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-yellow-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-yellow-400 text-xs font-bold">g</span>
              </div>
              <p>Possession or use of pornography</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-yellow-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-yellow-400 text-xs font-bold">h</span>
              </div>
              <p>Minor altercations</p>
            </div>
          </div>
        </div>

        {/* Consequences */}
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-purple-400" />
            Consequences of Violations
          </h4>
          <div className="space-y-3 text-gray-300 text-sm">
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-red-400 text-xs font-bold">1</span>
              </div>
              <p><strong className="text-white">First Serious Violation (Lifetime)</strong> – Suspension from SELFLESS CE for the current block and the following two blocks</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-red-400 text-xs font-bold">2</span>
              </div>
              <p><strong className="text-white">Second Serious Violation (Lifetime)</strong> – Termination from SELFLESS CE for 2 years and reapplication with required board approval before reacceptance</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-yellow-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-yellow-400 text-xs font-bold">3</span>
              </div>
              <p><strong className="text-white">First Minor Violation (12 months)</strong> – Probation for 4 weeks, which is defined as the loss of stipend or transportation reimbursement for 4 weeks</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-orange-400 text-xs font-bold">4</span>
              </div>
              <p><strong className="text-white">Second Minor Violation (12 months)</strong> – Probation for 8 weeks, which is defined as the loss of stipend or transportation reimbursement for 8 weeks</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-red-400 text-xs font-bold">5</span>
              </div>
              <p><strong className="text-white">Third Minor Violation (12 Months)</strong> – Probation for the remainder of the block and the following two blocks</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* SECTION XI: Tech Center Access Policy */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.65 }}
        className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Monitor className="w-5 h-5 text-green-400" />
          XI. Tech Center Access Policy
        </h3>

        {/* Full-time students */}
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-4">
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Users className="w-5 h-5 text-green-400" />
            1. Full-time students (6 non-religion core block credits or more)
          </h4>
          <div className="space-y-2 text-gray-300 text-sm">
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-green-400 text-xs font-bold">a</span>
              </div>
              <p>First rights to the tech center and its computers</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-green-400 text-xs font-bold">b</span>
              </div>
              <p>They can attend the tech center every day</p>
            </div>
          </div>
        </div>

        {/* Part-Time Students */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-400" />
            2. Part-Time Students
          </h4>
          
          {/* 3-5 Credit Students */}
          <div className="bg-white/5 rounded-lg p-3 mb-3">
            <h5 className="text-blue-300 font-medium mb-2">a. 3-5 Credit Students</h5>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-400 text-xs font-bold">i</span>
              </div>
              <p className="text-gray-300 text-sm">You can attend the tech center for up to 3 days each week</p>
            </div>
          </div>

          {/* Less than three credit hours */}
          <div className="bg-white/5 rounded-lg p-3">
            <h5 className="text-blue-300 font-medium mb-2">b. Less than three credit hours</h5>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-400 text-xs font-bold">i</span>
              </div>
              <p className="text-gray-300 text-sm">Can attend the tech center for up to 2 days only each week</p>
            </div>
          </div>

          <p className="text-gray-400 text-sm mt-3">
            If there are free computers, students may use them only for schoolwork. However, they must plan their weeks out and reserve specific time to use the computer.
          </p>
        </div>
      </motion.div>

      {/* SECTION XII: SELFLESS CE Employee Compensation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
        className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-yellow-400" />
          XII. SELFLESS CE Employee Compensation
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-2">Directors</h4>
            <div className="space-y-1 text-gray-300 text-sm">
              <p><span className="text-gray-400">Full-time:</span> 1M a month</p>
              <p><span className="text-gray-400">Part-time:</span> 5-10K an hour</p>
              <p><span className="text-gray-400">Student Directors:</span> 400K a month plus stipend</p>
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-2">Managers</h4>
            <div className="space-y-1 text-gray-300 text-sm">
              <p><span className="text-gray-400">Full-time:</span> 700K a month</p>
              <p><span className="text-gray-400">Part-time:</span> 3-5K an hour</p>
              <p><span className="text-gray-400">Office Managers:</span> 400K a month plus stipend</p>
            </div>
          </div>

          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-2">Tutors</h4>
            <div className="space-y-1 text-gray-300 text-sm">
              <p>Tutors – 200K a month plus stipend</p>
            </div>
          </div>

          <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-2">Administrative Staff</h4>
            <div className="space-y-1 text-gray-300 text-sm">
              <p>Administrative Staff – 200K a month plus stipend</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* SECTION XIII: Employment Guidelines */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.75 }}
        className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-indigo-400" />
          XIII. Employment Guidelines
        </h3>

        <div className="space-y-4">
          <div>
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-400" />
              1. Length of Employment
            </h4>
            <p className="text-gray-400 text-sm mb-3">
              The following guidelines outline the length of employment at SELFLESS CE. The primary purpose of employment is to provide valuable experience for students or recent graduates to pursue better employment opportunities outside of SELFLESS CE. Employees may be terminated before their designated time limit if their performance is unsatisfactory or if they engage in immoral conduct that violates the BYU-Idaho Honor Code. Such decisions are at the discretion of the SELFLESS CE or SELFLESS Board.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-purple-300 font-medium">Directors</p>
                <p className="text-gray-300 text-sm">Full-time: Maximum 3 years after graduation</p>
                <p className="text-gray-300 text-sm">Part-time: Maximum 3 years after graduation</p>
                <p className="text-gray-300 text-sm">Student Directors: Until Graduation</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-blue-300 font-medium">Managers</p>
                <p className="text-gray-300 text-sm">Full-time: 3 years maximum employment</p>
                <p className="text-gray-300 text-sm">Part-time: 3 years maximum employment</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-green-300 font-medium">Office Managers</p>
                <p className="text-gray-300 text-sm">2 Years Maximum (Full-time student)</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-orange-300 font-medium">Administrative Staff</p>
                <p className="text-gray-300 text-sm">2 Years Maximum (Full-time student)</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3 md:col-span-2">
                <p className="text-teal-300 font-medium">Tutors</p>
                <p className="text-gray-300 text-sm">4 blocks Maximum (Full-time student)</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-400" />
              2. Bonus Benefits
            </h4>
            <p className="text-gray-400 text-sm mb-3">
              Employees must provide proof of securing alternative employment, demonstrate that they have fulfilled their duties, and effectively train their replacements to qualify for bonuses. Employees may be terminated before receiving their bonuses if their performance is unsatisfactory or if they engage in immoral conduct that violates the BYU-Idaho Honor Code. Such decisions are at the discretion of the SELFLESS CE or SELFLESS Board.
            </p>
            <div className="space-y-3">
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                <p className="text-white font-medium">a. Directors Full-time</p>
                <p className="text-gray-300 text-sm">5,000,000 UGX bonus after 24 months but before 36 months after graduation, otherwise, 2,000,000 UGX</p>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                <p className="text-white font-medium">b. Director Part-time</p>
                <p className="text-gray-300 text-sm">3,000,000 UGX bonus after 24 months but before 36 months after graduation, otherwise, 1,000,000 UGX</p>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                <p className="text-white font-medium">c. Manager Full-time</p>
                <p className="text-gray-300 text-sm">3,000,000 UGX bonus after 24 months but before 24 months after graduation, otherwise, 1,000,000 UGX</p>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                <p className="text-white font-medium">d. Manager Part-time</p>
                <p className="text-gray-300 text-sm">2,000,000 UGX bonus after 24 months but before 36 months, otherwise, 1,000,000 UGX</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* SECTION XIV: Expense Reimbursement Policy for Full-time Employees */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Receipt className="w-5 h-5 text-cyan-400" />
          XIV. Expense Reimbursement Policy for Full-time Employees
        </h3>

        <div className="space-y-3">
          <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-cyan-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-cyan-400 text-xs font-bold">1</span>
              </div>
              <div>
                <p className="text-white font-medium mb-1">Meal Reimbursement</p>
                <p className="text-gray-300 text-sm">One meal of a maximum of 5,000 UGX reimbursement is allowed if:</p>
                <div className="space-y-1 text-gray-300 text-sm mt-1 pl-4">
                  <div className="flex items-start gap-2">
                    <span className="text-cyan-400 text-xs font-bold">a.</span>
                    <p>You must stay overnight at a tech facility</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-cyan-400 text-xs font-bold">b.</span>
                    <p>Need to travel to a tech center other than their home tech center</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-400 text-xs font-bold">2</span>
              </div>
              <div>
                <p className="text-white font-medium mb-1">Travel Time Compensation</p>
                <p className="text-gray-300 text-sm">You will be compensated for travel time beyond the first hour if paid hourly and must travel to a tech center other than your home center. For example, if it takes 3 hours to travel to a tech center other than your home center, you will be compensated for 2 hours each way.</p>
              </div>
            </div>
          </div>

          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-green-400 text-xs font-bold">3</span>
              </div>
              <div>
                <p className="text-white font-medium mb-1">Transportation Recording</p>
                <p className="text-gray-300 text-sm">Transportation needs to be recorded daily based on reasonable travel costs.</p>
              </div>
            </div>
          </div>

          <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-purple-400 text-xs font-bold">4</span>
              </div>
              <div>
                <p className="text-white font-medium mb-1">Receipt Requirements</p>
                <p className="text-gray-300 text-sm">A receipt for all expenses must be submitted to the finance department, even if handwritten. The receipt should include the date, the total travel amount, and your signature if handwritten.</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* SECTION XV: Internet and Security Policy */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.85 }}
        className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-red-400" />
          XV. Internet and Security Policy
        </h3>
        <p className="text-gray-400 text-sm mb-4">
          To prevent further property loss and inappropriate Internet use, please be aware that Internet access is expensive and limited to those who require it for academic purposes. Pornography is strictly prohibited, and social media may only be used for school-related activities.
        </p>

        <div className="space-y-4">
          {/* Internet Rules */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Wifi className="w-5 h-5 text-blue-400" />
              1. Internet Rules
            </h4>
            <div className="space-y-3 text-gray-300 text-sm">
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-400 text-xs font-bold">a</span>
                </div>
                <p>The internet password at each location must be changed at least once a month.</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-400 text-xs font-bold">b</span>
                </div>
                <p>The only persons who should know the password are Steven and the office managers at each location.</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-400 text-xs font-bold">c</span>
                </div>
                <p>If students need internet access, they have to ask an office manager to give them access by entering the password into their phone. However, before they leave, the student will need to have the office manager remove access by selecting "forget device" on their phone so they no longer have access.</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-400 text-xs font-bold">d</span>
                </div>
                <p>A tutor should be available at all times and needs to walk around the office at least once every 10 minutes to monitor what everyone is doing on their computers and phones.</p>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Lock className="w-5 h-5 text-green-400" />
              2. Security
            </h4>
            <div className="space-y-3 text-gray-300 text-sm">
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-green-400 text-xs font-bold">a</span>
                </div>
                <p>There must always be at least one male or two female tutors or office managers. So please schedule tutor time appropriately. They don't have to be working, but they need to be there at least studying.</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-green-400 text-xs font-bold">b</span>
                </div>
                <p>Every student entering the tech center has to check in and check out with one of the office managers. You have to do this anyway since we are paying stipends and transportation.</p>
              </div>
            </div>
          </div>

          {/* SELFLESS CE Equipment Usage */}
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Monitor className="w-5 h-5 text-orange-400" />
              3. SELFLESS CE Equipment Usage
            </h4>
            <div className="space-y-3 text-gray-300 text-sm">
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-orange-400 text-xs font-bold">a</span>
                </div>
                <p>Students must check in and check out all equipment. Office managers are responsible for recording this.</p>
              </div>
              <div className="flex items-start gap-2 bg-red-500/10 rounded-lg p-3">
                <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-red-400 text-xs font-bold">b</span>
                </div>
                <div>
                  <p className="text-white font-medium">Important:</p>
                  <p>If any equipment goes missing or is stolen, unless the student is identified, all students' stipends and transportation reimbursements will be reduced by half until the equipment is paid for in full. Those funds will be used to repurchase the stolen equipment.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Footer Note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.9 }}
        className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-4 text-center"
      >
        <p className="text-gray-400 text-sm">
          <span className="text-purple-400 font-semibold">SELFLESS CE</span> — Official Handbook Policies
        </p>
        <p className="text-gray-500 text-xs mt-1">Last Updated: December 9, 2025</p>
      </motion.div>
    </motion.div>
  );
}