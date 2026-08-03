import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting AI Knowledge Base seeding...');

  // Clear existing knowledge base
  await prisma.aIKnowledgeBase.deleteMany({});
  console.log('🗑️  Cleared existing knowledge base');

  const knowledgeData = [
    // Developer & Creator Information
    {
      category: 'developer',
      subcategory: 'creator',
      title: 'Atbriz Ai Creator - Nicholus Turyamureba',
      content: 'NICHOLUS TURYAMUREBA (ATBRIZ) is the Full Stack Software Engineer who developed the entire Selfless CE platform and Atbriz Ai assistant. He is based in Kampala, Uganda, and can be contacted at turyamurebanicholus@gmail.com or +256 761 996 296. Portfolio: https://nicholusbriz.vercel.app, GitHub: https://github.com/nicholusbriz, LinkedIn: https://www.linkedin.com/in/nicholus-turyamureba-194363378. He has a Bachelor\'s degree in Software Development from BYU–Idaho and specializes in building digital ecosystems that connect communities.',
      summary: 'Information about Nicholus Turyamureba (Atbriz), the creator of the Selfless CE platform and Atbriz Ai',
      tags: ['developer', 'creator', 'atbriz', 'nicholus', 'turyamureba', 'portfolio'],
      difficulty: 'beginner',
      priority: 10
    },
    {
      category: 'developer',
      subcategory: 'skills',
      title: 'Developer Technical Skills Overview',
      content: 'Nicholus Turyamureba (Atbriz) has comprehensive technical expertise: 80+ technical skills across 5 disciplines, 25 university courses completed, 3 certificates earned, and 1 Bachelor\'s degree. Core expertise in Full-Stack Development Ecosystem. Disciplines include Programming Languages (8 skills), Frontend Development (10 skills), Backend Development (8 skills), Databases (8 skills), Software Engineering (8 skills), and Developer Tools (10 skills). Expert-level skills include JavaScript, HTML5, CSS3, React, SQL Queries, Git, GitHub, VS Code, Chrome DevTools, REST APIs, and Object-Oriented Programming.',
      summary: 'Overview of developer\'s comprehensive technical skills and expertise',
      tags: ['developer', 'skills', 'technical', 'expertise', 'overview'],
      difficulty: 'intermediate',
      priority: 9
    },
    {
      category: 'developer',
      subcategory: 'programming',
      title: 'Programming Languages Expertise',
      content: 'Programming Languages Expertise: Python (Advanced, 4yrs), JavaScript (Advanced, 5yrs), TypeScript (Advanced, 3yrs), C# (Advanced, 3yrs), SQL (Advanced, 4yrs), Java (Intermediate, 2yrs), PHP (Intermediate, 2yrs), Ruby (Intermediate, 2yrs). Strong foundation in multiple programming languages with expert-level proficiency in JavaScript, Python, C#, SQL, and TypeScript. Experience spans 2-5 years depending on language, with strong emphasis on web development languages.',
      summary: 'Detailed programming languages expertise with years of experience',
      tags: ['developer', 'skills', 'programming', 'languages', 'python', 'javascript'],
      difficulty: 'intermediate',
      priority: 8
    },
    {
      category: 'developer',
      subcategory: 'frontend',
      title: 'Frontend Development Expertise',
      content: 'Frontend Development Expertise: React (Advanced, 4yrs), Next.js (Advanced, 3yrs), HTML5 (Expert, 5yrs), CSS3 (Expert, 5yrs), Tailwind CSS (Advanced, 4yrs), Angular (Intermediate, 2yrs), Vue.js (Intermediate, 2yrs), Responsive Design (Expert, 5yrs), Web Accessibility (Advanced, 3yrs), DOM Manipulation (Expert, 5yrs). Expert-level proficiency in core web technologies with strong React and Next.js experience. Comprehensive understanding of responsive design and web accessibility standards.',
      summary: 'Frontend development skills with expertise levels and years of experience',
      tags: ['developer', 'skills', 'frontend', 'react', 'nextjs', 'html', 'css'],
      difficulty: 'intermediate',
      priority: 8
    },
    {
      category: 'developer',
      subcategory: 'backend',
      title: 'Backend Development Expertise',
      content: 'Backend Development Expertise: Node.js (Advanced, 4yrs), Express.js (Advanced, 4yrs), Python (Advanced, 4yrs), C#/.NET (Advanced, 3yrs), REST APIs (Expert, 4yrs), JWT Authentication (Advanced, 3yrs), MVC Architecture (Advanced, 4yrs), Microservices (Intermediate, 2yrs). Strong backend development skills with expert-level API design and authentication. Proficient in both JavaScript (Node.js) and Python ecosystems, with solid C#/.NET experience.',
      summary: 'Backend development expertise including APIs, authentication, and architecture',
      tags: ['developer', 'skills', 'backend', 'nodejs', 'api', 'authentication'],
      difficulty: 'intermediate',
      priority: 8
    },
    {
      category: 'developer',
      subcategory: 'database',
      title: 'Database Expertise',
      content: 'Database Expertise: MongoDB (Advanced, 4yrs), PostgreSQL (Advanced, 4yrs), MySQL (Advanced, 4yrs), Database Design (Advanced, 4yrs), SQL Queries (Expert, 4yrs), Database Normalization (Advanced, 3yrs), Redis (Intermediate, 2yrs), Elasticsearch (Intermediate, 2yrs). Expert-level database skills with strong proficiency in both SQL and NoSQL databases. Comprehensive understanding of database design principles, query optimization, and data modeling.',
      summary: 'Database expertise covering SQL, NoSQL, design, and optimization',
      tags: ['developer', 'skills', 'database', 'mongodb', 'postgresql', 'mysql'],
      difficulty: 'intermediate',
      priority: 8
    },
    {
      category: 'developer',
      subcategory: 'engineering',
      title: 'Software Engineering Principles',
      content: 'Software Engineering Expertise: Object-Oriented Programming (Expert, 5yrs), Data Structures (Advanced, 4yrs), Algorithms (Advanced, 4yrs), Software Testing (Advanced, 4yrs), Agile/Scrum (Advanced, 4yrs), SOLID Principles (Advanced, 3yrs), Design Patterns (Advanced, 3yrs), System Design (Intermediate, 3yrs). Strong foundation in software engineering principles with expert-level OOP and solid understanding of software architecture, testing methodologies, and development processes.',
      summary: 'Software engineering principles and development methodologies expertise',
      tags: ['developer', 'skills', 'engineering', 'oop', 'agile', 'testing'],
      difficulty: 'intermediate',
      priority: 8
    },
    {
      category: 'developer',
      subcategory: 'tools',
      title: 'Developer Tools Expertise',
      content: 'Developer Tools Expertise: Git (Expert, 5yrs), GitHub (Expert, 5yrs), VS Code (Expert, 5yrs), Visual Studio (Advanced, 3yrs), Postman (Advanced, 4yrs), Chrome DevTools (Expert, 5yrs), Docker (Intermediate, 3yrs), Jest (Advanced, 4yrs), PyTest (Advanced, 4yrs), Swagger/OpenAPI (Advanced, 4yrs). Expert-level proficiency in essential development tools with strong Git/GitHub workflow mastery. Comprehensive testing experience with Jest and PyTest frameworks.',
      summary: 'Developer tools expertise including version control, testing, and development environments',
      tags: ['developer', 'skills', 'tools', 'git', 'github', 'testing', 'docker'],
      difficulty: 'intermediate',
      priority: 8
    },
    {
      category: 'developer',
      subcategory: 'learning',
      title: 'Learning Journey and Education',
      content: 'Learning Journey: 2022 - Web & Computer Programming Certificate (Introductory programming logic and web fundamentals). 2023 - Web Development Associate Degree (Full-stack development with databases and services). 2024 - Software Development Bachelor\'s Degree (Advanced engineering, testing, and capstone). 2025 - Bachelor\'s Completed from BYU–Idaho with BSc in Software Development. Completed three certificates in Software Development track with senior capstone project applying full SDLC.',
      summary: 'Educational journey from introductory certificates to bachelor\'s degree completion',
      tags: ['developer', 'education', 'learning', 'byu-idaho', 'certificates'],
      difficulty: 'beginner',
      priority: 8
    },
    {
      category: 'developer',
      subcategory: 'strengths',
      title: 'Professional Strengths and Soft Skills',
      content: 'Professional Strengths: Problem Solving (Breaking down complex problems into elegant solutions), Team Collaboration (Leading and contributing to high-performing teams), Technical Communication (Explaining complex concepts clearly to stakeholders), Critical Thinking (Analyzing problems from multiple perspectives), Clean Code (Writing maintainable, readable, and efficient code), Continuous Learning (Staying current with emerging technologies and best practices). These strengths enable effective project delivery and team leadership.',
      summary: 'Professional strengths and soft skills that complement technical expertise',
      tags: ['developer', 'strengths', 'soft-skills', 'problem-solving', 'collaboration'],
      difficulty: 'beginner',
      priority: 7
    },
    {
      category: 'developer',
      subcategory: 'contact',
      title: 'Developer Contact and Availability',
      content: 'Nicholus Turyamureba (Atbriz) is available for freelance projects, contributions, full-time positions, technical consulting, remote work, and mentorship. Contact: turyamurebanicholus@gmail.com, Phone: +256 761 996 296. Portfolio: https://nicholusbriz.vercel.app. GitHub: https://github.com/nicholusbriz. LinkedIn: https://www.linkedin.com/in/nicholus-turyamureba-194363378. Leadership roles include Developer Community Leader, Technical Mentor, Open Source Contributor, Tech Workshop Facilitator, and Community Advocate.',
      summary: 'Contact information and availability for collaboration opportunities',
      tags: ['developer', 'contact', 'availability', 'collaboration', 'mentorship'],
      difficulty: 'beginner',
      priority: 9
    },
    {
      category: 'developer',
      subcategory: 'creator',
      title: 'Atbriz Ai Creator - Nicholus Turyamureba',
      content: 'NICHOLUS TURYAMUREBA (ATBRIZ) is the Full Stack Software Engineer who developed the entire Selfless CE platform and Atbriz Ai assistant. He is based in Kampala, Uganda, and can be contacted at turyamurebanicholus@gmail.com or +256 761 996 296. Portfolio: https://nicholusbriz.vercel.app, GitHub: https://github.com/nicholusbriz, LinkedIn: https://www.linkedin.com/in/nicholus-turyamureba-194363378. He has a Bachelor\'s degree in Software Development from BYU–Idaho and specializes in building digital ecosystems that connect communities.',
      summary: 'Information about Nicholus Turyamureba (Atbriz), the creator of the Selfless CE platform and Atbriz Ai',
      tags: ['developer', 'creator', 'atbriz', 'nicholus', 'turyamureba', 'portfolio'],
      difficulty: 'beginner',
      priority: 10
    },
    {
      category: 'developer',
      subcategory: 'skills',
      title: 'Developer Technical Skills and Expertise',
      content: 'Nicholus Turyamureba (Atbriz) is expert in JavaScript, React, Node.js, Git, HTML5, CSS3, Tailwind CSS, and VS Code. Advanced in TypeScript, Next.js, Express.js, Python, C#/.NET, REST APIs, JWT Auth, MVC Architecture, MongoDB, PostgreSQL, MySQL, Database Design, and Query Optimization. Intermediate in AWS, Docker, Kubernetes, Jenkins, Redis, Elasticsearch, Angular, Vue.js, Java, PHP, Postman, Jest, and PyTest. He has experience across frontend, backend, databases, cloud & DevOps, and various tools.',
      summary: 'Complete technical skills and expertise of the platform developer',
      tags: ['developer', 'skills', 'technical', 'programming', 'expertise'],
      difficulty: 'intermediate',
      priority: 8
    },
    {
      category: 'developer',
      subcategory: 'experience',
      title: 'Developer Professional Experience',
      content: 'Software Developer at Freedom City Tech Center (2023–Present): Designed and developed full-stack web applications, built role-based dashboards, developed secure REST APIs with JWT authentication, optimized database performance, mentored junior developers, implemented responsive interfaces, and integrated analytics. Developer Community Leader at Ugandan Tech Community (2023–Present): Built and led inclusive developer communities, organized technical workshops, advocated for fairness in teamwork, mentored students and junior developers, facilitated open source contributions.',
      summary: 'Professional experience and leadership roles of the platform developer',
      tags: ['developer', 'experience', 'leadership', 'freedom-city', 'tech-community'],
      difficulty: 'intermediate',
      priority: 8
    },
    {
      category: 'developer',
      subcategory: 'projects',
      title: 'Featured Projects by Developer',
      content: 'Avora Pig Farming Platform (2025): Comprehensive farm management system with real-time tracking. Freedom City Tech Center Management System (2024): Multi-tenant management system for tech education centers with role-based dashboards. Liahona Tourism Booking Platform (2024): Tourism booking website with booking system and payment integration. Community Engagement Platform (2024): Community platform with user profiles, discussion forums, events management, and real-time messaging. All projects built with Next.js, React, Tailwind CSS, Node.js, Express, and MongoDB.',
      summary: 'Featured projects developed by the platform creator including tech management systems',
      tags: ['developer', 'projects', 'portfolio', 'applications', 'full-stack'],
      difficulty: 'intermediate',
      priority: 7
    },
    {
      category: 'developer',
      subcategory: 'education',
      title: 'Developer Education and Certifications',
      content: 'Bachelor of Science in Software Development from Brigham Young University–Idaho (2022–2025). Certificates: Web & Computer Programming (Python, C#, Web Fundamentals, Data Structures), Web Development (Full-stack, Databases, REST APIs, MEAN Stack), Software Development (Advanced Engineering, Testing, .NET, Agile Methodologies). Capstone Project (CSE 499): Applied full Software Development Life Cycle from planning through deployment.',
      summary: 'Educational background and certifications of the platform developer',
      tags: ['developer', 'education', 'byu-idaho', 'certifications', 'software-development'],
      difficulty: 'intermediate',
      priority: 7
    },
    {
      category: 'developer',
      subcategory: 'contact',
      title: 'Developer Contact and Availability',
      content: 'Nicholus Turyamureba (Atbriz) is available for freelance projects, contributions, full-time positions, technical consulting, remote work, and mentorship. Contact: turyamurebanicholus@gmail.com, Phone: +256 761 996 296. Portfolio: https://nicholusbriz.vercel.app. GitHub: https://github.com/nicholusbriz. LinkedIn: https://www.linkedin.com/in/nicholus-turyamureba-194363378. Leadership roles include Developer Community Leader, Technical Mentor, Open Source Contributor, Tech Workshop Facilitator, and Community Advocate.',
      summary: 'Contact information and availability for collaboration opportunities',
      tags: ['developer', 'contact', 'availability', 'collaboration', 'mentorship'],
      difficulty: 'beginner',
      priority: 9
    },
    // Organization Foundation
    {
      category: 'organization',
      subcategory: 'mission',
      title: 'Selfless CE Purpose and Mission',
      content: 'The mission of SELFLESS CE is to Support Efforts to Lead Families and Individuals toward Lifelong Education and Self-Sufficiency (SELFLESS). We aim to foster a safe and supportive learning environment where young adults can access educational opportunities that empower them to achieve self-sufficiency. By doing so, we strive to inspire these individuals to support their families and contribute to uplifting others in their communities.',
      summary: 'Core mission and purpose of Selfless CE organization',
      tags: ['mission', 'purpose', 'selfless', 'education', 'self-sufficiency'],
      difficulty: 'beginner',
      priority: 10
    },
    {
      category: 'organization',
      subcategory: 'vision',
      title: 'Selfless CE Vision and Values',
      content: 'Our Vision: Nurturing Resilient Minds to empower families and individuals to long lasting self sufficiency. Our Mission: To empower people with the tools and resources to become self-sufficient. Our Values: S - Support, E - Efforts, L - Lead, F - Families, L - Lifelong, E - Empowerment, S - Self-sufficiency. Our Goals: Improve lives, Empower individuals, Build stronger communities, Promote education and self-improvement. Core Values: Integrity, Service, Compassion, Faith, Education, Self-Reliance, Community, Hope.',
      summary: 'Vision, mission, values, and goals of Selfless CE',
      tags: ['vision', 'values', 'goals', 'core-values', 'integrity', 'service'],
      difficulty: 'beginner',
      priority: 10
    },
    {
      category: 'organization',
      subcategory: 'leadership',
      title: 'Board Members and Leadership Structure',
      content: 'Current SELFLESS CE board members: Rachael Namuge (Board Member), Douglas W. Kasozi (Secretary), Anigo Agnes Mary (Board Member), Atong Khur Aguto (Treasurer). Board Advisors: Abraham Hwang, Jeanie Conrad. SELFLESS Board Members: Jan Hwang (President), Audrey Hwang (Treasurer), Leena Barnum (Secretary). Board members hold one vote in organizational decisions. In case of tie, board advisors cast deciding vote. Initiatives approved by SELFLESS CE Board are submitted to SELFLESS Board for final approval.',
      summary: 'Current board members and organizational leadership structure',
      tags: ['board', 'leadership', 'governance', 'management', 'decision-making'],
      difficulty: 'intermediate',
      priority: 9
    },
    {
      category: 'organization',
      subcategory: 'programs',
      title: 'Selfless CE Programs Overview',
      content: 'Selfless CE offers three main programs: College Assistance Program (CAP) - provides tuition support, weekly stipend, and performance rewards for qualifying individuals. Missionary Assistance Program (MAP) - offers financial assistance to young men and women aspiring to serve full-time missions for the Church of Jesus Christ of Latter-day Saints. Temple Attendance Assistance (TAA) - provides financial assistance to members attending the temple for spiritual nourishment. Application deadlines: CAP (November 20), MAP (December 20), TAA (December 20).',
      summary: 'Overview of all Selfless CE assistance programs and application deadlines',
      tags: ['programs', 'cap', 'map', 'taa', 'assistance', 'deadlines'],
      difficulty: 'beginner',
      priority: 10
    },
    // Applicant Requirements
    {
      category: 'admissions',
      subcategory: 'requirements',
      title: 'New Applicant Qualification Requirements',
      content: 'All new applicants must complete an application and receive approval from the SELFLESS CE Board. Applications must be submitted at least 30 days before the start of the following block. Church membership requirement: Must be members of The Church of Jesus Christ of Latter-day Saints for minimum 12 months. If not, must be good friends (1+ year) of current student in good standing, taught all missionary discussions, and have ecclesiastical endorsement. Age requirement: Must be under 30 or turned 30 in year of joining. Marital status: Must be single with no children upon entering. Married applicants require special conditions and additional review.',
      summary: 'Complete requirements for new applicants including age, church membership, and marital status',
      tags: ['admissions', 'requirements', 'application', 'eligibility', 'qualifications'],
      difficulty: 'intermediate',
      priority: 10
    },
    {
      category: 'admissions',
      subcategory: 'special-cases',
      title: 'Special Applicant Cases - Married Students',
      content: 'Married applicants or those with children may qualify under special conditions: Space must be available after all qualified students are considered. Must apply minimum 60 days before start date. Application needs review by US SELFLESS Board. They only qualify for transportation reimbursement (not stipend). These additional requirements ensure fair allocation of limited resources while providing opportunities for those who may need additional support.',
      summary: 'Special requirements and conditions for married applicants and students with children',
      tags: ['admissions', 'married', 'special-cases', 'transportation', 'exceptions'],
      difficulty: 'intermediate',
      priority: 7
    },
    // Tech Centers Information
    {
      category: 'tech-centers',
      subcategory: 'locations',
      title: 'Technology Centers Complete Information',
      content: 'Selfless CE operates 7 technology centers across Uganda. Ntinda Tech Center (Headquarters): Location Ntinda, Contact +256 771 357 067, Office Manager Atong Khur. Freedom City Tech Center: Location Freedom City, Contact +256 709 904 397, Office Manager Tonny Kiwanuka. Jinja Tech Center: Location Jinja, Contact +256 757 815 034, Office Manager Anigo Marry. Masaka Tech Center: Location Masaka Kijjabwemi, Contact +256 701 976 330, Office Manager Douglas Wasswa Kasozi. Seeta Tech Center: Location Seeta, Contact +256 779 747 139, Office Manager Maria Kyobijja. Lira Tech Center: Location Lira, Contact +256 782 345 6789, Office Manager Apori Zaina. Mbale Tech Center: Location Mbale, Contact +256 782 345 6789, Office Manager Kevin Wangoda.',
      summary: 'Complete contact information and managers for all 7 Selfless CE tech centers',
      tags: ['tech-centers', 'locations', 'contacts', 'managers', 'uganda'],
      difficulty: 'beginner',
      priority: 10
    },
    {
      category: 'tech-centers',
      subcategory: 'facilities',
      title: 'Technology Center Facilities and Costs',
      content: 'Jinja Center: 148 SQM, Cost 2,000,000 UGX/month (13,500/SQM), Owner Mohamed Omar Muhamed, Plot 09 Acacia Ave, Tel +256 751 700759. Masaka Center: 115 SQM, Cost 1,200,000 UGX/month (10,500/SQM), Owner Ernest M. Ntanda, Tel +256 743 110721. Freedom City Center: 173 SQM, Cost 1,500,000 UGX/month (8,600/SQM), Owner Betty Kiguli, Tel +256 758 411339. Ntinda Center: 43 SQM, Cost 1,400,000 UGX/month (32,500/SQM), Owner Kimbowa Stanley, Tel +256 782 829930. Seeta Center: 63 SQM, Cost 600,000 UGX/month (9,500/SQM), Owner Bonny Walker Lubowa, Tel +256 789225437. Lira Center: 30 SQM, Cost 500,000 UGX/month (16,500/SQM), Owner Charles Ojede, Tel +256772794258.',
      summary: 'Detailed facility specifications, costs, and owner information for each tech center',
      tags: ['tech-centers', 'facilities', 'costs', 'rent', 'specifications'],
      difficulty: 'intermediate',
      priority: 8
    },
    {
      category: 'tech-centers',
      subcategory: 'operations',
      title: 'Food and Snack Allocation',
      content: 'Monthly food and snack allocation per tech center (subject to change based on student attendance): Sseta - 1,600,000 UGX, Jinja - 3,200,000 UGX, Masaka - 1,100,000 UGX, Freedom - 2,000,000 UGX, Ntinda - 2,700,000 UGX, Lira - 800,000 UGX. These allocations cover food and snacks for students attending each tech center and are adjusted based on actual attendance numbers to ensure efficient resource utilization.',
      summary: 'Monthly food and snack budget allocation for each tech center',
      tags: ['tech-centers', 'food', 'budget', 'allocation', 'operations'],
      difficulty: 'intermediate',
      priority: 7
    },
    // Financial Policies
    {
      category: 'financial',
      subcategory: 'stipends',
      title: 'Stipend Requirements and Policies',
      content: 'Full-time students (6+ non-religion core credits, GPA 3.0+): Paid tuition, 40K per week stipend, 3 days/week tech center attendance required, 10K deducted for each day below three. Part-time students (5 or fewer core credits): No stipend qualification. Pathway Connect students (5 or fewer core credits): No stipend qualification. Stipends are performance-based and require maintaining academic standards and attendance requirements.',
      summary: 'Complete stipend policies for full-time, part-time, and pathway students',
      tags: ['stipends', 'financial', 'full-time', 'part-time', 'requirements'],
      difficulty: 'intermediate',
      priority: 10
    },
    {
      category: 'financial',
      subcategory: 'transportation',
      title: 'Transportation Reimbursement Policies',
      content: 'Full-time students with internships: 30K maximum weekly transportation reimbursement, must meet internship tasks and hours, 5K deduction per missed hour. Full-time students without internships: 50K maximum weekly, 10K per day attending 90-minute English Course (up to 5 days/week). Part-time students: 10K per day attending English Course (up to 3 days/week). Pathway Connect students: 10K per day attending English Course (up to 2 days/week). Transportation reimbursements require attendance and participation requirements.',
      summary: 'Transportation reimbursement policies for different student types and internship status',
      tags: ['transportation', 'reimbursement', 'financial', 'internship', 'english-course'],
      difficulty: 'intermediate',
      priority: 10
    },
    {
      category: 'financial',
      subcategory: 'internships',
      title: 'Internship and English Hub Requirements',
      content: 'All students must be enrolled in either SELFLESS CE English Program or an internship program. Internship options include: Tutorship, Tech center manager, Assistant tech center manager, Internal SELFLESS CE internship, Off-site internship related to major (director approval required), Off-site internship enhancing English (director approval required). English Program provides alternative to internships for students who need additional language support.',
      summary: 'Mandatory requirements for internships and English program participation',
      tags: ['internships', 'english-hub', 'requirements', 'programs', 'mandatory'],
      difficulty: 'intermediate',
      priority: 9
    },
    // Academic Policies
    {
      category: 'academic',
      subcategory: 'probation',
      title: 'Academic Probation Policy - Full-Time Students',
      content: 'Full-time students (6+ credits, GPA 3.0+) who fall below 3.0 GPA but maintain above 2.0: First-time probation - no stipend but transportation reimbursement available, tuition covered for one additional block. To regain eligibility, must enroll in 6 core credits and achieve GPA exceeding 3.0. Second-time suspension - no stipend or transportation, tuition not covered unless GPA 3.0+ achieved in following block with maximum 6 credits. Past tuition reimbursed if GPA 3.0+ achieved for that block.',
      summary: 'Academic probation policies for full-time students falling below GPA requirements',
      tags: ['academic', 'probation', 'gpa', 'suspension', 'full-time'],
      difficulty: 'intermediate',
      priority: 10
    },
    {
      category: 'academic',
      subcategory: 'probation',
      title: 'Academic Probation Policy - Part-Time Students',
      content: 'Part-time students (5 or fewer credits) who fall below 3.0 GPA but exceed 2.0: First-time probation - one additional opportunity to remain part-time with 3 credits and transportation stipend eligibility. Second-time suspension - no transportation reimbursement, tuition not covered unless GPA 3.0+ achieved with maximum 3 credits. To regain eligibility, must enroll in 3 core credits and achieve GPA exceeding 3.0. Past tuition reimbursed if GPA 3.0+ achieved. Students below 2.0 GPA: no transportation reimbursement, tuition not covered unless GPA 3.0+ with maximum 3 credits.',
      summary: 'Academic probation policies specifically for part-time and pathway students',
      tags: ['academic', 'probation', 'part-time', 'pathway', 'gpa'],
      difficulty: 'intermediate',
      priority: 9
    },
    {
      category: 'academic',
      subcategory: 'tutors',
      title: 'Tutor Academic Performance Requirements',
      content: 'Tutors who do not meet 3.5 GPA requirement but maintain GPA exceeding 2.5: No longer serve as tutors but transition to regular student status, eligible for 40K weekly stipend for following block. Tutors who do not meet 2.5 GPA requirement: No longer serve as tutors, transition to regular student status, eligible for weekly transportation reimbursement for following block, tuition covered for one additional block. To requalify for 40K stipend, must enroll in 6 core credits and exceed GPA 3.0.',
      summary: 'Academic performance requirements and consequences for tutors',
      tags: ['academic', 'tutors', 'gpa', 'requirements', 'performance'],
      difficulty: 'intermediate',
      priority: 8
    },
    // Disciplinary Policies
    {
      category: 'disciplinary',
      subcategory: 'dropped-classes',
      title: 'Disciplinary Action for Dropped Classes',
      content: 'Full-time students dropping before tuition deadline: If remains in 6+ credits, no action. If drops below 6 credits, only qualifies for transportation reimbursement, stipends must be recovered through future transportation reimbursements. Dropping after tuition deadline: If remains in 6+ credits, only forfeited tuition recovered, stipends withheld until repaid. If drops below 6 credits, only transportation reimbursement eligible, must repay forfeited tuition, future reimbursements withheld until balance paid. Part-time and pathway students have similar but adjusted policies based on credit requirements.',
      summary: 'Policies and consequences for dropping classes before and after tuition deadlines',
      tags: ['disciplinary', 'dropped-classes', 'tuition', 'stipend', 'deadlines'],
      difficulty: 'intermediate',
      priority: 9
    },
    {
      category: 'disciplinary',
      subcategory: 'conduct',
      title: 'Disciplinary Action for Insubordination and Harassment',
      content: 'Violations for insubordination, trolling, or cyberbullying are categorized as serious with three possible outcomes: 1) Suspension for remainder of current block - for one offense and acceptance of tech center manager decision. 2) Suspension for current and next block - for two or more offenses, or one offense challenged with Director of Student Affairs unsuccessfully. 3) Immediate suspension, can reapply after two blocks with no guarantee of acceptance - for two or more offenses, or one/two offenses challenged with SELFLESS CE/SELFLESS Board unsuccessfully. Suspension results in no stipend, transportation, or tuition payments.',
      summary: 'Three-tier disciplinary system for insubordination, trolling, and cyberbullying',
      tags: ['disciplinary', 'insubordination', 'cyberbullying', 'suspension', 'conduct'],
      difficulty: 'intermediate',
      priority: 10
    },
    {
      category: 'disciplinary',
      subcategory: 'honor-code',
      title: 'Honor Code Violations - Serious and Minor',
      content: 'Serious violations (lifetime consequences): Sexual harassment, hate crimes, theft of property exceeding $20, property damage exceeding $100, altercations resulting in medical injuries, actions leading to incarceration. Minor violations (12-month tracking): Cheating, lying, use of foul language, theft under $20, property damage under $100, misuse of SELFLESS CE property, possession/use of pornography, minor altercations. Consequences: First serious - suspension for current and following two blocks. Second serious - termination for 2 years with board approval for reacceptance. First minor - 4 weeks probation (loss of stipend/transportation). Second minor - 8 weeks probation. Third minor - probation for remainder of block and following two blocks.',
      summary: 'Classification and consequences for serious and minor honor code violations',
      tags: ['disciplinary', 'honor-code', 'violations', 'serious', 'minor', 'consequences'],
      difficulty: 'intermediate',
      priority: 10
    },
    // Tech Center Policies
    {
      category: 'tech-centers',
      subcategory: 'access',
      title: 'Tech Center Access Policy',
      content: 'Full-time students (6+ non-religion core credits): First rights to tech center and computers, can attend every day. Part-time students (3-5 credits): Can attend up to 3 days each week. Less than 3 credit hours: Can attend up to 2 days each week. If free computers available, students may use them only for schoolwork but must plan weeks and reserve specific time. Access policies ensure fair resource allocation and prioritize full-time students while providing opportunities for part-time students.',
      summary: 'Tech center access policies based on student enrollment status and credit hours',
      tags: ['tech-centers', 'access', 'attendance', 'full-time', 'part-time'],
      difficulty: 'beginner',
      priority: 9
    },
    // Employment Policies
    {
      category: 'employment',
      subcategory: 'compensation',
      title: 'Selfless CE Employee Compensation Structure',
      content: 'Directors Full-time: 1M UGX per month. Director Part-time: 5-10K UGX per hour. Manager Full-time: 700K UGX per month. Manager Part-time: 3-5K UGX per hour. Directors Students: 400K UGX per month plus stipend. Office Managers: 200K UGX per month plus stipend. Tutors: 200K UGX per month plus stipend. Administrative Staff: 200K UGX per month plus stipend. Compensation structure values both full-time professional staff and student employees, with student positions providing additional stipend support.',
      summary: 'Complete compensation structure for all Selfless CE employee positions',
      tags: ['employment', 'compensation', 'salary', 'staff', 'wages'],
      difficulty: 'intermediate',
      priority: 8
    },
    {
      category: 'employment',
      subcategory: 'duration',
      title: 'Employment Length Guidelines',
      content: 'Employment purpose: provide valuable experience for students/recent graduates to pursue better opportunities outside SELFLESS CE. Directors Full-time: Maximum 3 years after graduation. Director Part-time: Maximum 3 years after graduation. Manager Full-time: 3 years maximum. Manager Part-time: 3 years maximum. Directors (Full-time student): Until graduation. Office Managers (Full-time student): 2 years maximum. Administrative Staff (Full-time student): 2 years maximum. Tutors (Full-time student): 4 blocks maximum. Termination possible for unsatisfactory performance or immoral conduct violating BYU-Idaho Honor Code.',
      summary: 'Maximum employment duration for different staff positions and student roles',
      tags: ['employment', 'duration', 'guidelines', 'termination', 'performance'],
      difficulty: 'intermediate',
      priority: 7
    },
    {
      category: 'employment',
      subcategory: 'bonuses',
      title: 'Employee Bonus Benefits Structure',
      content: 'Bonus requirements: Employees must provide proof of securing alternative employment, demonstrate fulfilled duties, and effectively train replacements. Directors Full-time: 5,000,000 UGX bonus after 24-36 months after graduation, otherwise 2,000,000 UGX. Director Part-time: 3,000,000 UGX bonus after 24-36 months, otherwise 1,000,000 UGX. Manager Full-time: 3,000,000 UGX bonus after 24 months before graduation, otherwise 1,000,000 UGX. Manager Part-time: 2,000,000 UGX bonus after 24-36 months, otherwise 1,000,000 UGX. Bonuses withheld for unsatisfactory performance or immoral conduct.',
      summary: 'Bonus structure and requirements for all employee positions',
      tags: ['employment', 'bonuses', 'benefits', 'performance', 'training'],
      difficulty: 'intermediate',
      priority: 7
    },
    {
      category: 'employment',
      subcategory: 'reimbursement',
      title: 'Expense Reimbursement Policy for Full-Time Employees',
      content: 'Meal reimbursement: Maximum 5,000 UGX for one meal if staying overnight at tech facility or traveling to tech center other than home center. Travel time compensation: Compensated for travel time beyond first hour if paid hourly and traveling to other than home center. Example: 3-hour travel = 2 hours compensation each way. Transportation recording: Daily based on reasonable travel costs. Receipts required: All expenses must submit receipts to finance department, even handwritten. Receipts must include date, total travel amount, and signature if handwritten.',
      summary: 'Complete expense reimbursement policies for full-time employees including meals and travel',
      tags: ['employment', 'reimbursement', 'expenses', 'travel', 'meals'],
      difficulty: 'intermediate',
      priority: 7
    },
    // Security and Internet Policies
    {
      category: 'policies',
      subcategory: 'internet',
      title: 'Internet and Security Policy',
      content: 'Internet access is expensive and limited to academic purposes. Pornography strictly prohibited, social media only for school-related activities. Internet Rules: Password must change at least monthly, only Steven and office managers should know password, students must ask office managers for access and have them remove access by selecting "forget device" before leaving. Tutor monitoring: Tutor available at all times, must walk around every 10 minutes to monitor computer and phone usage. Security: At least one male or two female tutors/office managers must be present. All students must check in and check out with office managers.',
      summary: 'Internet usage rules and security policies for tech centers',
      tags: ['policies', 'internet', 'security', 'monitoring', 'access'],
      difficulty: 'intermediate',
      priority: 9
    },
    {
      category: 'policies',
      subcategory: 'equipment',
      title: 'Equipment Usage and Security Policies',
      content: 'Equipment check-in/check-out: Students must check in and check out all equipment, office managers responsible for recording. Missing equipment consequences: If equipment goes missing or stolen and student not identified, all students\' stipends and transportation reimbursements reduced by half until equipment paid in full. Funds used to repurchase stolen equipment. Equipment security measures ensure accountability and collective responsibility for tech center resources.',
      summary: 'Equipment usage policies and consequences for lost or stolen equipment',
      tags: ['policies', 'equipment', 'security', 'check-in', 'accountability'],
      difficulty: 'intermediate',
      priority: 8
    },
    // Website and Programs
    {
      category: 'organization',
      subcategory: 'programs-detail',
      title: 'College Assistance Program (CAP) Details',
      content: 'College Assistance Program (CAP) helps individuals achieve lifelong self-sufficiency by providing supplemental funds to attend 4-year universities and individualized career coaching. Benefits include: Tuition Support, Weekly Stipend, Performance Rewards. Application deadline: November 20. Program focuses on supporting students through their educational journey with financial assistance and mentorship. Rewards provided to outstanding and best performing students to encourage academic excellence.',
      summary: 'Detailed information about College Assistance Program benefits and application process',
      tags: ['programs', 'cap', 'college', 'tuition', 'stipend', 'rewards'],
      difficulty: 'beginner',
      priority: 9
    },
    {
      category: 'organization',
      subcategory: 'programs-detail',
      title: 'Missionary Assistance Program (MAP) Details',
      content: 'Missionary Assistance Program (MAP) provides financial assistance to young men and women aspiring to serve full-time missions for the Church of Jesus Christ of Latter-day Saints. Benefits include: Mission Support, Church Service opportunities, Spiritual Growth development. Application deadline: December 20. Program supports individuals in their religious service while providing financial assistance for mission-related expenses and preparation.',
      summary: 'Complete information about Missionary Assistance Program and benefits',
      tags: ['programs', 'map', 'missionary', 'church', 'spiritual', 'service'],
      difficulty: 'beginner',
      priority: 8
    },
    {
      category: 'organization',
      subcategory: 'programs-detail',
      title: 'Temple Attendance Assistance (TAA) Details',
      content: 'Temple Attendance Assistance (TAA) provides financial assistance to members of The Church of Jesus Christ of Latter-day Saints attending the temple for spiritual nourishment. Benefits include: Temple Visit support, Spiritual guidance, Financial Aid for temple attendance. Application deadline: December 20. Program supports members in their spiritual development and temple participation by covering associated costs.',
      summary: 'Information about Temple Attendance Assistance Program and spiritual benefits',
      tags: ['programs', 'taa', 'temple', 'spiritual', 'financial-aid', 'worship'],
      difficulty: 'beginner',
      priority: 8
    },
    {
      category: 'organization',
      subcategory: 'contact',
      title: 'Selfless CE Contact Information',
      content: 'Organization Contact: Plot 123, Example Road, Kampala, Uganda. Phone: +256 700 000 000. Email: admin@selfless-ce.org. Tech Center Contacts: Ntinda (+256 771 357 067), Freedom City (+256 709 904 397), Jinja (+256 757 815 034), Masaka (+256 701 976 330), Seeta (+256 779 747 139), Lira (+256 782 345 6789), Mbale (+256 782 345 6789). Office managers available at each location for direct support and assistance.',
      summary: 'Complete contact information for Selfless CE headquarters and all tech centers',
      tags: ['contact', 'headquarters', 'tech-centers', 'phone', 'email', 'location'],
      difficulty: 'beginner',
      priority: 10
    },
    {
      category: 'organization',
      subcategory: 'faq',
      title: 'Frequently Asked Questions',
      content: 'What is Selfless CE? Non-profit organization empowering young single adults to become self-sufficient through online education (BYU Pathway Worldwide) and self-improvement. Focus on education and self-improvement as keys to self-sufficiency. How can I join? Complete application process through appropriate program (CAP, MAP, TAA) with required documentation and approvals. What are the benefits? Tuition support, stipends, transportation reimbursement, career coaching, spiritual support. What are registration requirements? Church membership, age under 30, single status, academic qualifications, application approval.',
      summary: 'Answers to frequently asked questions about Selfless CE programs and membership',
      tags: ['faq', 'questions', 'joining', 'benefits', 'requirements', 'information'],
      difficulty: 'beginner',
      priority: 9
    },
    // Additional Organization Details
    {
      category: 'tech-centers',
      subcategory: 'jinja',
      title: 'Jinja Tech Center Details',
      content: 'Jinja Tech Center: 148 SQM space, Cost 2,000,000 UGX per month (13,500 per SQM). Owner: Mohamed Omar Muhamed, Address: Plot 09 Acacia Ave, Tel: +256 751 700759, Email: twaha67@gmail.com. Monthly food allocation: 3,200,000 UGX. Office Manager: Anigo Marry, Contact: +256 757 815 034. Located in Jinja with full computer facilities and study spaces for students.',
      summary: 'Complete details about Jinja Tech Center including costs, ownership, and management',
      tags: ['tech-centers', 'jinja', 'facilities', 'costs', 'management'],
      difficulty: 'intermediate',
      priority: 7
    },
    {
      category: 'tech-centers',
      subcategory: 'masaka',
      title: 'Masaka Tech Center Details',
      content: 'Masaka Tech Center: 115 SQM space, Cost 1,200,000 UGX per month (10,500 per SQM). Owner: Ernest M. Ntanda, Tel: +256 743 110721, Email: ernestmntanda@gmail.com. Location: Masaka, Kijjabwemi. Monthly food allocation: 1,100,000 UGX. Office Manager: Douglas Wasswa Kasozi, Contact: +256 701 976 330. Provides educational facilities and resources for Masaka area students.',
      summary: 'Complete details about Masaka Tech Center including costs, ownership, and management',
      tags: ['tech-centers', 'masaka', 'facilities', 'costs', 'management'],
      difficulty: 'intermediate',
      priority: 7
    },
    {
      category: 'tech-centers',
      subcategory: 'freedom-city',
      title: 'Freedom City Tech Center Details',
      content: 'Freedom City Tech Center: 173 SQM space, Cost 1,500,000 UGX per month (8,600 per SQM). Owner: Betty Kiguli, Tel: +256 758 411339. Monthly food allocation: 2,000,000 UGX. Office Manager: Tonny Kiwanuka, Contact: +256 709 904 397. Large facility in Freedom City serving many students with comprehensive resources.',
      summary: 'Complete details about Freedom City Tech Center including costs, ownership, and management',
      tags: ['tech-centers', 'freedom-city', 'facilities', 'costs', 'management'],
      difficulty: 'intermediate',
      priority: 7
    },
    {
      category: 'tech-centers',
      subcategory: 'ntinda',
      title: 'Ntinda Tech Center Details',
      content: 'Ntinda Tech Center (Headquarters): 43 SQM space (1st Room: 21.8 x 12.5, 2nd Room: 15 x 12.5), Cost 1,400,000 UGX per month (32,500 per SQM). Owner: Kimbowa Stanley, Tel: +256 782 829930. Monthly food allocation: 2,700,000 UGX. Office Manager: Atong Khur, Contact: +256 771 357 067. Main headquarters with dual-room setup for maximum student capacity.',
      summary: 'Complete details about Ntinda Tech Center headquarters including costs and layout',
      tags: ['tech-centers', 'ntinda', 'headquarters', 'facilities', 'costs'],
      difficulty: 'intermediate',
      priority: 7
    },
    {
      category: 'tech-centers',
      subcategory: 'seeta',
      title: 'Seeta Tech Center Details',
      content: 'Seeta Tech Center: 63 SQM space, Cost 600,000 UGX per month (9,500 per SQM). Owner: Bonny Walker Lubowa, Tel: +256 789225437. Monthly food allocation: 1,600,000 UGX. Office Manager: Maria Kyobijja, Contact: +256 779 747 139. Cost-effective facility serving Seeta area students with quality educational resources.',
      summary: 'Complete details about Seeta Tech Center including costs, ownership, and management',
      tags: ['tech-centers', 'seeta', 'facilities', 'costs', 'management'],
      difficulty: 'intermediate',
      priority: 7
    },
    {
      category: 'tech-centers',
      subcategory: 'lira',
      title: 'Lira Tech Center Details',
      content: 'Lira Tech Center: 30 SQM space (5.5x5.5sqm), Cost 500,000 UGX per month (16,500 per SQM). Owner: 3rd Party (Charles Ojede), Tel: +256772794258. Monthly food allocation: 800,000 UGX. Office Manager: Apori Zaina, Contact: +256 782 345 6789. Compact facility serving Lira area with focused educational support.',
      summary: 'Complete details about Lira Tech Center including costs, ownership, and management',
      tags: ['tech-centers', 'lira', 'facilities', 'costs', 'management'],
      difficulty: 'intermediate',
      priority: 7
    },
    {
      category: 'tech-centers',
      subcategory: 'mbale',
      title: 'Mbale Tech Center Details',
      content: 'Mbale Tech Center: Recently established facility serving Mbale area. Office Manager: Kevin Wangoda, Contact: +256 782 345 6789. Part of the expanding network of Selfless CE technology centers across Uganda. Provides same educational resources and support as other centers.',
      summary: 'Details about Mbale Tech Center and its services',
      tags: ['tech-centers', 'mbale', 'facilities', 'management', 'new-center'],
      difficulty: 'beginner',
      priority: 6
    },
    {
      category: 'admissions',
      subcategory: 'process',
      title: 'Application Process and Timeline',
      content: 'Application process: 1) Complete application form, 2) Submit to SELFLESS CE Board at least 30 days before start of following block, 3) Office managers evaluate qualifications, 4) Board review and approval, 5) Notification of acceptance/rejection. Timeline: Applications must be submitted 30 days in advance, board review occurs before block start, office managers conduct preliminary evaluation. Late applications may not be considered for upcoming block.',
      summary: 'Step-by-step application process and required timeline for Selfless CE programs',
      tags: ['admissions', 'application', 'process', 'timeline', 'deadlines'],
      difficulty: 'beginner',
      priority: 9
    },
    {
      category: 'financial',
      subcategory: 'participation',
      title: 'English Program Participation Requirements',
      content: 'English Program is alternative to internships for students. Students attend 90-minute English courses to qualify for transportation reimbursement. Full-time students without internships: 10K per day for English attendance (up to 5 days/week, maximum 50K weekly). Part-time students: 10K per day (up to 3 days/week). Pathway Connect students: 10K per day (up to 2 days/week). Program designed to enhance English skills for academic and professional success.',
      summary: 'English program participation requirements and transportation reimbursement structure',
      tags: ['financial', 'english-program', 'participation', 'reimbursement', 'requirements'],
      difficulty: 'intermediate',
      priority: 8
    },
    {
      category: 'academic',
      subcategory: 'credits',
      title: 'Credit Requirements and Definitions',
      content: 'Full-time students: Enrolled in 6 or more credits of core, non-religion courses. Part-time students: Enrolled in 5 or fewer credits of core, non-religion courses. Pathway Connect students: Enrolled in 5 or fewer credits of core, non-religion courses. Core courses are non-religion academic courses. Religion courses are optional and not counted toward core credit requirements. Credit status affects stipend eligibility, tech center access, and transportation reimbursement.',
      summary: 'Definitions and requirements for full-time, part-time, and pathway student status',
      tags: ['academic', 'credits', 'full-time', 'part-time', 'pathway', 'requirements'],
      difficulty: 'intermediate',
      priority: 9
    },
    {
      category: 'disciplinary',
      subcategory: 'process',
      title: 'Disciplinary Process and Appeals',
      content: 'Disciplinary process: Tech center manager makes initial decision for minor offenses. Students can challenge decisions to Director of Student Affairs (for some offenses) or SELFLESS CE/SELFLESS Board (for serious offenses). Challenge process: Student who challenges and fails receives harsher penalty (longer suspension). Board advisors make final decisions in tie votes. All disciplinary actions result in loss of stipend, transportation, and tuition during suspension period.',
      summary: 'Complete disciplinary process including initial decisions and appeal procedures',
      tags: ['disciplinary', 'process', 'appeals', 'decisions', 'board'],
      difficulty: 'intermediate',
      priority: 8
    },
    {
      category: 'employment',
      subcategory: 'roles',
      title: 'Employee Roles and Responsibilities',
      content: 'Directors: Overall management and strategic direction. Managers: Day-to-day tech center operations. Office Managers: Student check-in/out, equipment management, attendance tracking. Tutors: Academic support, student monitoring, facility supervision. Administrative Staff: Administrative support and operations. Student employees (Directors, Office Managers, Tutors, Admin Staff): Must be students, have employment duration limits, receive stipend plus salary.',
      summary: 'Roles and responsibilities for different employee positions at Selfless CE',
      tags: ['employment', 'roles', 'responsibilities', 'management', 'staff'],
      difficulty: 'intermediate',
      priority: 7
    },
    {
      category: 'organization',
      subcategory: 'history',
      title: 'Selfless CE Background and History',
      content: 'Selfless CE is a non-profit organization focusing on education and self-improvement as keys to self-sufficiency. The organization operates technology centers across Uganda providing BYU Pathway Worldwide education opportunities. Founded with the belief that "SELFLESS begins with self" - empowering individuals to build stronger families and communities through personal development. Programs include College Assistance, Missionary Assistance, and Temple Attendance support.',
      summary: 'Background and history of Selfless CE organization and its founding principles',
      tags: ['organization', 'history', 'background', 'founding', 'principles'],
      difficulty: 'beginner',
      priority: 8
    },
    {
      category: 'organization',
      subcategory: 'impact',
      title: 'Selfless CE Impact and Reach',
      content: 'Selfless CE operates across Uganda with 7 technology centers: Ntinda (Headquarters), Freedom City, Jinja, Masaka, Seeta, Lira, and Mbale. Serves hundreds of students through College Assistance Program, Missionary Assistance Program, and Temple Attendance Assistance. Provides technology access, tuition support, stipends, and career coaching. Building stronger communities through education and self-improvement initiatives.',
      summary: 'Impact and reach of Selfless CE programs across Uganda',
      tags: ['organization', 'impact', 'reach', 'students', 'uganda'],
      difficulty: 'beginner',
      priority: 8
    },
    // Platform Overview & Organization
    {
      category: 'platform',
      subcategory: 'overview',
      title: 'Selfless CE Platform Overview',
      content: 'Selfless CE is an educational organization operating multiple tech centers across Uganda, providing BYU-Idaho academic programs and technical education through a centralized student self-service portal. The platform serves students across Freedom City, Mbale, Masaka, Jinja, Ntinda, Sseta, Lira, Seeta, Kololo, and Kaboowa Tech Centers. Founder: Nicholus Turyamureba (also known as Atbriz). Contact: turyamurebanicholus@gmail.com, +256761996296.',
      summary: 'Centralized educational platform for Selfless CE tech centers across Uganda',
      tags: ['platform', 'overview', 'selfless ce', 'tech centers', 'uganda', 'founder', 'contact'],
      difficulty: 'beginner',
      priority: 10
    },
    {
      category: 'platform',
      subcategory: 'organization',
      title: 'Organization Structure and Leadership',
      content: 'Selfless CE was founded in 2020 by Nicholus Turyamureba (also known as Atbriz) who serves as Founder & Director. The organization operates as an educational non-profit providing technical education and BYU-Idaho academic programs across Uganda. Development team is led by turyamurebanicholus@gmail.com with project management at +256 761996296. System administration is handled by Nicholus Turyamureba.',
      summary: 'Leadership and organizational structure of Selfless CE',
      tags: ['organization', 'leadership', 'founder', 'team', 'management'],
      difficulty: 'beginner',
      priority: 9
    },
    {
      category: 'platform',
      subcategory: 'tech-centers',
      title: 'Tech Centers Locations',
      content: 'Selfless CE operates 10 tech centers across Uganda: Freedom City Tech Center (main), Mbale Tech Center, Masaka Tech Center, Jinja Tech Center, Ntinda Tech Center, Sseta Tech Center, Lira Tech Center, Seeta Tech Center, Kololo Tech Center, and Kaboowa Tech Center. Each center provides the same educational programs and follows standardized curriculum while serving local communities.',
      summary: 'All Selfless CE tech center locations across Uganda',
      tags: ['tech-centers', 'locations', 'uganda', 'freedom-city', 'mbale', 'masaka', 'jinja'],
      difficulty: 'beginner',
      priority: 9
    },
    {
      category: 'platform',
      subcategory: 'navigation',
      title: 'Dashboard Navigation Guide',
      content: 'The main dashboard provides access to all platform features. Key sections include: Courses (BYU-Idaho course management), Grades (academic performance tracking), Cleaning (weekly schedules), Internships (opportunities and applications), Support Groups (peer collaboration), Temple Trips (educational trips), Announcements (important updates), Notifications (personal alerts), Profile (personal settings), and Students (student directory for admins/teachers). Use the sidebar for quick navigation between sections. Main navigation paths: /dashboard (overview), /dashboard/courses, /dashboard/grades, /dashboard/cleaning, /dashboard/internships, /dashboard/support-groups, /dashboard/temple-trips, /dashboard/announcements, /dashboard/notifications, /dashboard/students, /dashboard/profile.',
      summary: 'Complete navigation guide for the dashboard with all available sections',
      tags: ['navigation', 'dashboard', 'guide', 'how-to', 'routes', 'paths'],
      difficulty: 'beginner',
      priority: 10
    },
    {
      category: 'platform',
      subcategory: 'roles',
      title: 'User Roles and Permissions',
      content: 'The platform has three main user roles: Admin (full system access, user management, role assignment, system oversight), Teacher (student management, grade assignment, tutoring capabilities), and Student (view own data, course enrollment, cleaning registration, grade tracking). Admin and Teacher roles have additional dashboard sections: /dashboard/admin/* for admin features and /dashboard/teacher/* for teacher-specific features. Each role has appropriate permissions and access levels.',
      summary: 'User roles and their respective permissions in the platform',
      tags: ['roles', 'permissions', 'admin', 'teacher', 'student', 'access'],
      difficulty: 'beginner',
      priority: 9
    },
    {
      category: 'platform',
      subcategory: 'features',
      title: 'Platform Features Overview',
      content: 'The Selfless CE platform includes: Student Dashboard (academic tracking, course management, grade viewing), Course Management (BYU-Idaho course enrollment and credit tracking), Cleaning Management (weekly cleaning schedules and student participation), Internship Programs (application tracking and management), Support Groups (student collaboration and peer support), Temple Trips (organized educational and spiritual trips), Announcements (important updates and notifications), Notifications (real-time alerts and reminders), Profile Management (user settings and personal information), Grades (academic performance tracking and GPA calculation), and Football Team (sports team registration and management).',
      summary: 'Complete overview of all platform features and capabilities',
      tags: ['features', 'platform', 'capabilities', 'overview', 'tools'],
      difficulty: 'beginner',
      priority: 9
    },
    {
      category: 'academic',
      subcategory: 'courses',
      title: 'BYU-Idaho Course Management',
      content: 'Students can enroll in BYU-Idaho courses through the Courses section (/dashboard/courses). Each course has credits (typically 3), course units, and can include religious courses if opted. Course enrollment status can be Active, Completed, or Dropped. Grades are tracked per course and contribute to GPA calculation. Course codes follow BYU-Idaho format. Students should consult with their tech center administration before dropping courses. Course enrollment requires approval from academic advisors.',
      summary: 'Comprehensive BYU-Idaho course enrollment and management information',
      tags: ['courses', 'byu-idaho', 'enrollment', 'academic', 'credits', 'course-codes'],
      difficulty: 'intermediate',
      priority: 10
    },
    {
      category: 'academic',
      subcategory: 'courses',
      title: 'Course Credits and Units',
      content: 'Most BYU-Idaho courses offered through Selfless CE are 3-credit courses. Credits represent the academic weight and time commitment required. Course units indicate the specific BYU-Idaho course identification. Religious courses are optional and can be included based on student preference. Total credits per semester should be discussed with academic advisors to ensure appropriate workload. Credits directly impact GPA calculation and academic progress.',
      summary: 'Understanding course credits, units, and academic workload',
      tags: ['courses', 'credits', 'units', 'academic', 'workload', 'byu-idaho'],
      difficulty: 'intermediate',
      priority: 7
    },
    {
      category: 'academic',
      subcategory: 'enrollment',
      title: 'Course Enrollment Process',
      content: 'To enroll in courses: 1) Log into dashboard, 2) Navigate to Courses section, 3) Browse available courses, 4) Select desired courses, 5) Submit enrollment request, 6) Wait for approval from academic advisor, 7) Receive confirmation. Students must meet prerequisites for advanced courses. Enrollment deadlines are strictly enforced. Late enrollment requires special permission. Drops must be processed within first 2 weeks to avoid academic penalties.',
      summary: 'Step-by-step guide for enrolling in courses',
      tags: ['enrollment', 'courses', 'process', 'how-to', 'deadlines', 'approval'],
      difficulty: 'intermediate',
      priority: 8
    },
    {
      category: 'academic',
      subcategory: 'grades',
      title: 'Grade System and GPA Calculation',
      content: 'Grades are assigned for each enrolled course using letter grades (A, B, C, D, F) with corresponding grade points (4.0, 3.0, 2.0, 1.0, 0.0). Plus/minus grades may have adjusted point values. GPA is calculated by dividing total grade points by total credits attempted. Students can view their grades in the Grades section (/dashboard/grades), which shows individual course grades, overall GPA, and academic progress. Teachers assign grades through the teacher dashboard. Students can track their academic performance over time and identify areas needing improvement.',
      summary: 'Complete grading system, letter grades, grade points, and GPA calculation',
      tags: ['grades', 'gpa', 'academic', 'performance', 'evaluation', 'calculation'],
      difficulty: 'intermediate',
      priority: 10
    },
    {
      category: 'academic',
      subcategory: 'grades',
      title: 'Grade Point System Details',
      content: 'Standard grade point values: A = 4.0 (excellent), B = 3.0 (good), C = 2.0 (satisfactory), D = 1.0 (poor), F = 0.0 (failing). Plus/minus variations: A- = 3.7, B+ = 3.3, B- = 2.7, C+ = 2.3, C- = 1.7, D+ = 1.3. Some courses may be pass/fail. GPA affects academic standing, probation status, and eligibility for activities. Students should maintain GPA above 2.0 for good academic standing.',
      summary: 'Detailed grade point values and academic standing requirements',
      tags: ['grades', 'grade-points', 'gpa', 'academic-standing', 'requirements'],
      difficulty: 'intermediate',
      priority: 7
    },
    {
      category: 'academic',
      subcategory: 'policies',
      title: 'Academic Policies and Guidelines',
      content: 'Students are expected to maintain academic integrity, attend classes regularly, and meet assignment deadlines. Plagiarism and cheating are serious violations that can result in course failure and disciplinary action. Course drop policies vary by program - consult administration before making changes. Grade appeals must be submitted within specified timeframes (usually 2 weeks after grade posting). Students should familiarize themselves with all academic policies to ensure successful completion. Academic probation occurs when GPA falls below 2.0.',
      summary: 'Key academic policies, integrity standards, and student expectations',
      tags: ['policies', 'academic', 'integrity', 'guidelines', 'rules', 'probation'],
      difficulty: 'intermediate',
      priority: 9
    },
    {
      category: 'operations',
      subcategory: 'cleaning',
      title: 'Cleaning Schedule System',
      content: 'The cleaning system manages weekly cleaning schedules for tech centers. Students can register for cleaning duties through the Cleaning section (/dashboard/cleaning). Each week has specific cleaning days that can be Open (available for registration), Closed (no longer accepting registrations), or Full (all slots filled). Students receive attendance records for their cleaning participation. This system helps maintain clean facilities while teaching responsibility and community service. Admins can manually assign cleaning duties and manage attendance.',
      summary: 'Weekly cleaning schedule management and student participation',
      tags: ['cleaning', 'schedule', 'duties', 'attendance', 'responsibility', 'registration'],
      difficulty: 'beginner',
      priority: 8
    },
    {
      category: 'operations',
      subcategory: 'cleaning',
      title: 'Cleaning Registration Process',
      content: 'To register for cleaning duties: 1) Go to Cleaning section, 2) View available cleaning days for current week, 3) Select preferred day, 4) Confirm registration. Students can change their assigned day by requesting a change through the platform. Attendance is tracked and recorded. Failure to attend assigned cleaning without valid reason may affect standing. Students can view their cleaning history and attendance records.',
      summary: 'How to register for cleaning duties and manage assignments',
      tags: ['cleaning', 'registration', 'process', 'attendance', 'change-day'],
      difficulty: 'beginner',
      priority: 7
    },
    {
      category: 'activities',
      subcategory: 'internships',
      title: 'Internship Programs',
      content: 'Selfless CE offers internship opportunities to help students gain practical experience. Students can browse available internships, submit applications, and track their application status through the Internships section (/dashboard/internships). Internships provide real-world experience and networking opportunities in various fields including technology, business, education, and community development. Students should regularly check for new opportunities and meet application deadlines. Internship applications require resume, cover letter, and sometimes interviews.',
      summary: 'Internship opportunities, application process, and career development',
      tags: ['internships', 'careers', 'experience', 'applications', 'opportunities', 'resume'],
      difficulty: 'intermediate',
      priority: 8
    },
    {
      category: 'activities',
      subcategory: 'internships',
      title: 'Internship Application Process',
      content: 'To apply for internships: 1) Browse available opportunities in Internships section, 2) Review requirements and deadlines, 3) Prepare application materials (resume, cover letter), 4) Submit application through platform, 5) Track application status, 6) Prepare for interviews if selected. Application materials should highlight relevant skills and experiences. Tech center staff can provide guidance on applications. Successful internships can lead to job opportunities and career advancement.',
      summary: 'Step-by-step internship application guidance',
      tags: ['internships', 'applications', 'process', 'resume', 'interview', 'career'],
      difficulty: 'intermediate',
      priority: 7
    },
    {
      category: 'activities',
      subcategory: 'support-groups',
      title: 'Support Groups and Peer Collaboration',
      content: 'Support Groups facilitate peer learning and collaboration among students. Students can join or create study groups through the Support Groups section (/dashboard/support-groups). Groups can be organized by subject, interest, or study goals. Students can share resources, discuss concepts, and help each other academically. This feature promotes community learning and provides additional support outside formal classes. Active participation in support groups can enhance understanding and build lasting relationships. Groups can meet virtually or in person.',
      summary: 'Peer learning, study groups, and academic collaboration features',
      tags: ['support-groups', 'collaboration', 'peer-learning', 'community', 'study', 'groups'],
      difficulty: 'beginner',
      priority: 7
    },
    {
      category: 'activities',
      subcategory: 'temple-trips',
      title: 'Temple Trips and Educational Excursions',
      content: 'Temple trips are organized educational and spiritual excursions for students. These trips provide opportunities for spiritual growth, cultural education, and community building. Information about upcoming trips, registration, and requirements is available in the Temple Trips section (/dashboard/temple-trips). Students should plan ahead and meet all registration requirements. Trips may include visits to religious sites, historical locations, or educational institutions. Participation is optional but encouraged for holistic development.',
      summary: 'Educational and spiritual trips for student development',
      tags: ['temple-trips', 'excursions', 'spiritual', 'education', 'trips', 'activities'],
      difficulty: 'beginner',
      priority: 6
    },
    {
      category: 'activities',
      subcategory: 'temple-trips',
      title: 'Temple Trips and Educational Excursions',
      content: 'Temple trips are organized educational and spiritual excursions for students. These trips provide opportunities for spiritual growth, cultural education, and community building. Information about upcoming trips, registration, and requirements is available in the Temple Trips section. Students should plan ahead and meet all registration requirements.',
      summary: 'Educational and spiritual trips for students',
      tags: ['temple-trips', 'excursions', 'spiritual', 'education', 'trips'],
      difficulty: 'beginner',
      priority: 6
    },
    {
      category: 'activities',
      subcategory: 'sports',
      title: 'Sports Teams - Football and Other Activities',
      content: 'Students can participate in various sports teams including football, volleyball, netball, basketball, and athletics. Team registration is available through the platform. Students can join as players, coaches, kit managers, cheerleaders, team managers, medical staff, or referees. Sports activities promote physical fitness, teamwork, and school spirit. Regular practices and competitions are organized. Football team has dedicated registration and management features.',
      summary: 'Sports team participation, roles, and athletic activities',
      tags: ['sports', 'football', 'teams', 'athletics', 'activities', 'volleyball', 'basketball'],
      difficulty: 'beginner',
      priority: 6
    },
    {
      category: 'communication',
      subcategory: 'announcements',
      title: 'Announcements System',
      content: 'Important updates, events, and information are shared through the Announcements section (/dashboard/announcements). Students should regularly check announcements for deadline reminders, schedule changes, policy updates, and special events. Announcements can be targeted to specific tech centers or sent globally. Mark important announcements for follow-up. Admins and teachers can create announcements. Announcement badges show unread count.',
      summary: 'Platform announcements and important updates for students',
      tags: ['announcements', 'updates', 'communication', 'information', 'events', 'notifications'],
      difficulty: 'beginner',
      priority: 9
    },
    {
      category: 'communication',
      subcategory: 'notifications',
      title: 'Personal Notifications',
      content: 'The notification system provides personalized alerts for each student. Notifications include grade updates, assignment reminders, cleaning schedule changes, and important deadlines. Students can manage notification preferences and mark notifications as read. Regular notification checking helps students stay informed and organized. Notification badges in the header show unread count. Notifications can be filtered by read/unread status.',
      summary: 'Personalized alert system for important student notifications',
      tags: ['notifications', 'alerts', 'reminders', 'personal', 'updates', 'management'],
      difficulty: 'beginner',
      priority: 8
    },
    {
      category: 'communication',
      subcategory: 'announcements',
      title: 'Announcements System',
      content: 'Important updates, events, and information are shared through the Announcements section. Students should regularly check announcements for deadline reminders, schedule changes, policy updates, and special events. Announcements can be targeted to specific tech centers or sent globally. Mark important announcements for follow-up.',
      summary: 'Platform for important updates and information',
      tags: ['announcements', 'updates', 'communication', 'information', 'events'],
      difficulty: 'beginner',
      priority: 8
    },
    {
      category: 'communication',
      subcategory: 'notifications',
      title: 'Personal Notifications',
      content: 'The notification system provides personalized alerts for each student. Notifications include grade updates, assignment reminders, cleaning schedule changes, and important deadlines. Students can manage notification preferences and mark notifications as read. Regular notification checking helps students stay informed and organized.',
      summary: 'Personalized alert system for students',
      tags: ['notifications', 'alerts', 'reminders', 'personal', 'updates'],
      difficulty: 'beginner',
      priority: 7
    },
    {
      category: 'technical',
      subcategory: 'help',
      title: 'Technical Support and Troubleshooting',
      content: 'For technical issues with the platform, students should first try basic troubleshooting: clear browser cache, ensure stable internet connection, try a different browser (Chrome, Firefox, Edge), and check if the issue is browser-specific. If issues persist, contact tech center administration or use the support contact information (turyamurebanicholus@gmail.com, +256 761996296). Common issues include login problems, page loading errors, and data synchronization delays. Report bugs with screenshots and detailed descriptions.',
      summary: 'Technical support guidance and troubleshooting steps for platform issues',
      tags: ['technical', 'support', 'troubleshooting', 'help', 'issues', 'contact'],
      difficulty: 'intermediate',
      priority: 7
    },
    {
      category: 'technical',
      subcategory: 'account',
      title: 'Account Management and Security',
      content: 'Students should keep their login credentials secure and never share passwords. Password changes can be made through Profile settings. If account is locked or password forgotten, use the reset functionality or contact administration. Enable two-factor authentication when available. Keep profile information updated including current contact details. Report suspicious account activity immediately. Regular password changes are recommended for security.',
      summary: 'Account security, password management, and profile maintenance',
      tags: ['account', 'security', 'password', 'profile', 'login', 'credentials'],
      difficulty: 'beginner',
      priority: 8
    },
    {
      category: 'policies',
      subcategory: 'conduct',
      title: 'Code of Conduct',
      content: 'All students are expected to maintain respectful behavior, support fellow students, and represent Selfless CE positively. Discrimination, harassment, or disruptive behavior are not tolerated and will result in disciplinary action. Attendance at tech center activities is expected unless excused. Students should follow dress codes and facility usage guidelines. Respect for staff, fellow students, and facilities is required. Positive community engagement is encouraged.',
      summary: 'Behavioral expectations, community standards, and disciplinary policies',
      tags: ['conduct', 'behavior', 'community', 'respect', 'guidelines', 'disciplinary'],
      difficulty: 'beginner',
      priority: 9
    },
    {
      category: 'policies',
      subcategory: 'attendance',
      title: 'Attendance Policies',
      content: 'Regular attendance is expected for all classes, tech center activities, and assigned duties. Excused absences require prior notification or valid documentation (medical, family emergency). Unexcused absences may affect grades and standing. Cleaning duty attendance is tracked and impacts community responsibilities. Students should communicate with instructors about planned absences. Excessive absences may lead to academic probation or required make-up work.',
      summary: 'Attendance requirements for classes, activities, and cleaning duties',
      tags: ['attendance', 'policies', 'absences', 'excused', 'requirements'],
      difficulty: 'beginner',
      priority: 8
    },
    {
      category: 'resources',
      subcategory: 'learning',
      title: 'Learning Resources and Study Tips',
      content: 'Maximize learning by attending all classes, participating in discussions, and forming study groups. Use the platform to track progress and identify areas needing improvement. Take advantage of teacher feedback and support group resources. Practice time management and create study schedules. Utilize available library and online resources. Regular review of material helps retention. Active learning techniques include summarizing material, teaching concepts to others, and practice problems.',
      summary: 'Effective learning strategies, study techniques, and available resources',
      tags: ['learning', 'study', 'resources', 'tips', 'strategies', 'time-management'],
      difficulty: 'beginner',
      priority: 7
    },
    {
      category: 'resources',
      subcategory: 'academic',
      title: 'Academic Support Services',
      content: 'Selfless CE provides various academic support services including tutoring, study groups, and teacher consultation hours. Students struggling with courses should seek help early. Teachers are available for questions and additional explanation. Peer tutoring through support groups can provide different perspectives. Academic advisors can help with course planning and career guidance. Don\'t hesitate to ask for help - it\'s encouraged and shows commitment to success.',
      summary: 'Available academic support services and how to access them',
      tags: ['support', 'tutoring', 'academic-help', 'resources', 'guidance'],
      difficulty: 'beginner',
      priority: 8
    },
    {
      category: 'admin',
      subcategory: 'features',
      title: 'Admin Dashboard Features',
      content: 'Admin users have access to comprehensive management features including: User management (create, edit, deactivate users), Role assignment (admin, teacher, student), Tech center management (create and manage centers), Cleaning oversight (manage schedules and assignments), Grade oversight (review academic performance), Activity logs (monitor system usage), and System settings. Admin can access these through /dashboard/admin/* paths. Admin responsibilities include maintaining data integrity and supporting users.',
      summary: 'Admin-specific dashboard features and management capabilities',
      tags: ['admin', 'management', 'dashboard', 'features', 'oversight'],
      difficulty: 'intermediate',
      priority: 8
    },
    {
      category: 'teacher',
      subcategory: 'features',
      title: 'Teacher Dashboard Features',
      content: 'Teacher users have access to educational management features including: Student management (view assigned students), Grade assignment (assign and update student grades), Student progress tracking (monitor academic performance), and Tutoring capabilities (provide additional support). Teachers can access these through /dashboard/teacher/* paths. Teacher responsibilities include accurate grading, providing feedback, supporting student learning, and communicating with administration about student progress.',
      summary: 'Teacher-specific dashboard features and educational tools',
      tags: ['teacher', 'education', 'grading', 'students', 'tutoring'],
      difficulty: 'intermediate',
      priority: 8
    },
    {
      category: 'technical',
      subcategory: 'platform',
      title: 'Platform Technical Information',
      content: 'The Selfless CE platform is built with Next.js 16, React 19, TypeScript, and MongoDB database. It uses Prisma ORM for database operations and NextAuth for authentication. The platform supports Progressive Web App (PWA) features for offline access. Tech stack includes TailwindCSS for styling, Framer Motion for animations, and React Query for data fetching. The platform is deployed on Vercel with MongoDB Atlas database. Regular updates ensure security and performance improvements.',
      summary: 'Technical details about the platform architecture and technology',
      tags: ['technical', 'platform', 'architecture', 'technology', 'nextjs', 'mongodb'],
      difficulty: 'advanced',
      priority: 5
    }
  ];

  // Insert knowledge base entries
  for (const data of knowledgeData) {
    await prisma.aIKnowledgeBase.create({
      data
    });
  }

  console.log(`✅ Successfully seeded ${knowledgeData.length} knowledge base entries`);
  console.log('📚 Knowledge base categories:', [...new Set(knowledgeData.map(k => k.category))]);
  console.log('🎯 Knowledge base subcategories:', [...new Set(knowledgeData.map(k => k.subcategory))]);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding knowledge base:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });