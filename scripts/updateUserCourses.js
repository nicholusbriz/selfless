const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Your real course data
const studentCourseData = [
  {
    name: "ayamo mary",
    courses: [
      { name: "Spread sheet Essentials", credits: 3 },
      { name: "University skills", credits: 2 }
    ],
    takesReligion: true,
    totalCredits: 5
  },
  {
    name: "Maria Akumu",
    courses: [
      { name: "Advanced Writing in Professional Contexts", credits: 3 },
      { name: "Web Backend Development", credits: 3 },
      { name: "Family Leadership and Resource Management", credits: 3 },
      { name: "Conflict and Peace", credits: 3 }
    ],
    takesReligion: false,
    totalCredits: 12
  },
  {
    name: "Nabulo Rosemary",
    courses: [
      { name: "Introduction to Finance Management", credits: 3 },
      { name: "Advanced writing in professional contexts", credits: 3 },
      { name: "Business Finance", credits: 3 }
    ],
    takesReligion: true,
    totalCredits: 9
  },
  {
    name: "Ayesigwa Skemper",
    courses: [
      { name: "Agile Project Management", credits: 3 },
      { name: "Introduction to Supply Chain management", credits: 3 }
    ],
    takesReligion: true,
    totalCredits: 6
  },
  {
    name: "Dira Luke",
    courses: [
      { name: "Introduction to Programming", credits: 2 },
      { name: "Web Fundamentals", credits: 2 },
      { name: "Writing in Professional Contexts", credits: 2 },
      { name: "Teachings and Doctrine of the Book of Mormon A", credits: 1 }
    ],
    takesReligion: true,
    totalCredits: 7
  },
  {
    name: "Turyamureba Nicholus",
    courses: [
      { name: "Family leadership and resource management", credits: 3 },
      { name: "Math for the real world", credits: 3 }
    ],
    takesReligion: true,
    totalCredits: 6
  },
  {
    name: "Kintu Isaac",
    courses: [
      { name: "Business Finance", credits: 3 },
      { name: "Sustaining Human Life", credits: 3 }
    ],
    takesReligion: true,
    totalCredits: 6
  },
  {
    name: "Majok Manytil",
    courses: [
      { name: "ACCTG 180 Survey of Accounting", credits: 3 },
      { name: "BUS 321 Organizational Leadership", credits: 3 },
      { name: "ECON 100 Essentials of Economics", credits: 3 }
    ],
    takesReligion: true,
    totalCredits: 9
  },
  {
    name: "Majok Aguer",
    courses: [
      { name: "Maths for the real world", credits: 3 },
      { name: "Web services", credits: 3 }
    ],
    takesReligion: true,
    totalCredits: 6
  },
  {
    name: "Nabirye Ruth",
    courses: [
      { name: "Communication Career Workshop", credits: 1 },
      { name: "Communication Capstone", credits: 1 },
      { name: "Disciple Leadership Capstone", credits: 1 }
    ],
    takesReligion: true,
    totalCredits: 3
  }
  // Add all your other students here...
];

async function updateUsersWithCourses() {
  console.log('\n=== STARTING COURSE UPDATE FOR USERS ===\n');
  
  try {
    // Step 1: Get all users with their student profiles
    const users = await prisma.user.findMany({
      include: {
        studentProfile: true
      }
    });
    
    console.log(`📊 Found ${users.length} total users in database`);
    console.log(`📚 Processing ${studentCourseData.length} students from course data\n`);
    
    let matchedCount = 0;
    let unmatchedStudents = [];
    let updatedCount = 0;
    
    // Step 2: Process each student from your course data
    for (const studentData of studentCourseData) {
      // Try to find matching user (case-insensitive)
      const matchingUser = users.find(user => {
        const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
        const searchName = studentData.name.toLowerCase();
        
        // Check for various matching patterns
        return fullName === searchName || 
               fullName.includes(searchName) || 
               searchName.includes(fullName);
      });
      
      if (matchingUser) {
        console.log(`✅ MATCHED: "${studentData.name}" -> ${matchingUser.firstName} ${matchingUser.lastName}`);
        
        // Check if user has a student profile
        if (!matchingUser.studentProfile) {
          console.log(`   ⚠️  No student profile found for ${matchingUser.firstName} ${matchingUser.lastName}, creating one...`);
          
          // Create student profile if it doesn't exist
          const newProfile = await prisma.studentProfile.create({
            data: {
              userId: matchingUser.id,
              takesReligion: studentData.takesReligion
            }
          });
          matchingUser.studentProfile = newProfile;
          console.log(`   ✅ Created student profile`);
        } else {
          // Update existing student profile
          await prisma.studentProfile.update({
            where: { id: matchingUser.studentProfile.id },
            data: { takesReligion: studentData.takesReligion }
          });
          console.log(`   ✅ Updated religion preference: ${studentData.takesReligion}`);
        }
        
        // Step 3: Delete existing enrolled courses for this student (to avoid duplicates)
        const existingCourses = await prisma.enrolledCourse.findMany({
          where: { studentId: matchingUser.studentProfile.id }
        });
        
        if (existingCourses.length > 0) {
          await prisma.enrolledCourse.deleteMany({
            where: { studentId: matchingUser.studentProfile.id }
          });
          console.log(`   🗑️  Removed ${existingCourses.length} existing courses`);
        }
        
        // Step 4: Add new enrolled courses
        for (const course of studentData.courses) {
          await prisma.enrolledCourse.create({
            data: {
              studentId: matchingUser.studentProfile.id,
              courseName: course.name,
              credits: course.credits,
              status: 'active'
            }
          });
        }
        
        console.log(`   📚 Added ${studentData.courses.length} courses (Total credits: ${studentData.totalCredits})`);
        matchedCount++;
        updatedCount++;
        
      } else {
        console.log(`❌ NO MATCH: "${studentData.name}"`);
        unmatchedStudents.push(studentData.name);
      }
      console.log('---');
    }
    
    // Step 5: Summary
    console.log('\n=== MIGRATION SUMMARY ===');
    console.log(`✅ Successfully updated: ${matchedCount} students`);
    console.log(`❌ Unmatched students: ${unmatchedStudents.length}`);
    console.log(`📚 Total courses added: ${studentCourseData.reduce((sum, s) => sum + s.courses.length, 0)}`);
    
    if (unmatchedStudents.length > 0) {
      console.log('\n⚠️  UNMATCHED STUDENTS:');
      unmatchedStudents.forEach(name => console.log(`   - ${name}`));
    }
    
    // Step 6: Verification - Show updated students
    console.log('\n=== VERIFICATION: RECENTLY UPDATED STUDENTS ===');
    const updatedUsers = await prisma.user.findMany({
      where: {
        studentProfile: {
          isNot: null
        }
      },
      include: {
        studentProfile: {
          include: {
            enrolledCourses: true
          }
        }
      },
      take: 10 // Show first 10
    });
    
    console.log(`\n📊 Sample of ${updatedUsers.length} students with courses:\n`);
    updatedUsers.forEach(user => {
      console.log(`👤 ${user.firstName} ${user.lastName}`);
      console.log(`   📧 ${user.email}`);
      console.log(`   🙏 Takes Religion: ${user.studentProfile.takesReligion}`);
      console.log(`   📚 Courses (${user.studentProfile.enrolledCourses.length}):`);
      user.studentProfile.enrolledCourses.forEach(course => {
        console.log(`      - ${course.courseName} (${course.credits} credits)`);
      });
      console.log('---');
    });
    
    await prisma.$disconnect();
    console.log('\n✅ Course update completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during update:', error);
    await prisma.$disconnect();
    throw error;
  }
}

// Run the update
updateUsersWithCourses()
  .then(() => {
    console.log('\n🎉 Script finished successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  });