// prisma/check-data.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('🔍 CHECKING DATABASE DATA');
  console.log('='.repeat(60) + '\n');

  try {
    // Count all records
    console.log('📊 Record Counts:');
    console.log(`  🌍 Countries: ${await prisma.country.count()}`);
    console.log(`  🎭 Roles: ${await prisma.role.count()}`);
    console.log(`  📊 Grade Scale: ${await prisma.gradeScale.count()}`);
    console.log(`  🏢 Tech Centers: ${await prisma.techCenter.count()}`);
    console.log(`  👥 Users: ${await prisma.user.count()}`);
    console.log(`  📚 Student Courses: ${await prisma.studentCourse.count()}`);
    console.log(`  📝 Grades: ${await prisma.grade.count()}`);
    console.log(`  🧹 Cleaning Days: ${await prisma.cleaningDay.count()}`);
    console.log(`  📋 Cleaning Registrations: ${await prisma.cleaningRegistration.count()}`);
    console.log(`  ✅ Attendance Records: ${await prisma.attendanceRecord.count()}`);
    console.log(`  📢 Announcements: ${await prisma.announcement.count()}`);
    console.log(`  🔔 Notifications: ${await prisma.notification.count()}`);
    console.log(`  ⚽ Football Teams: ${await prisma.footballTeam.count()}`);
    console.log(`  👨‍👩‍👧‍👦 Team Memberships: ${await prisma.teamMembership.count()}`);
    console.log(`  🤖 AI Conversations: ${await prisma.aIConversation.count()}`);
    console.log(`  🧠 AI Learning Profiles: ${await prisma.aILearningProfile.count()}`);
    console.log(`  📚 AI Knowledge Base: ${await prisma.aIKnowledgeBase.count()}`);
    console.log(`  💬 Conversations: ${await prisma.conversation.count()}`);
    console.log(`  📨 Messages: ${await prisma.message.count()}`);

    // Show sample data from key tables
    console.log('\n' + '='.repeat(60));
    console.log('📋 SAMPLE DATA');
    console.log('='.repeat(60) + '\n');

    // Countries
    console.log('🌍 Countries:');
    const countries = await prisma.country.findMany({ take: 5 });
    countries.forEach(c => console.log(`  - ${c.name} (${c.code})`));

    // Roles
    console.log('\n🎭 Roles:');
    const roles = await prisma.role.findMany({ take: 5 });
    roles.forEach(r => console.log(`  - ${r.name} (${r.displayName})`));

    // Grade Scale
    console.log('\n📊 Grade Scale:');
    const gradeScales = await prisma.gradeScale.findMany({ take: 5 });
    gradeScales.forEach(g => console.log(`  - ${g.gradeLetter}: ${g.minScore}-${g.maxScore} (${g.gradePoints} pts)`));

    // Tech Centers
    console.log('\n🏢 Tech Centers:');
    const techCenters = await prisma.techCenter.findMany({ 
      take: 5,
      include: { country: true }
    });
    techCenters.forEach(tc => console.log(`  - ${tc.name} (${tc.code}) → ${tc.country?.name || 'No country'}`));

    // Users
    console.log('\n👥 Users (first 5):');
    const users = await prisma.user.findMany({ 
      take: 5,
      include: { role: true, techCenter: true }
    });
    users.forEach(u => console.log(`  - ${u.firstName} ${u.lastName} (${u.email}) - Role: ${u.role?.name || 'None'} - Tech Center: ${u.techCenter?.name || 'None'}`));

    // Student Courses
    console.log('\n📚 Student Courses (first 5):');
    const courses = await prisma.studentCourse.findMany({ 
      take: 5,
      include: { student: true }
    });
    courses.forEach(c => console.log(`  - ${c.name} (${c.code}) - Student: ${c.student?.firstName || 'Unknown'}`));

    // Cleaning Days
    console.log('\n🧹 Cleaning Days (first 5):');
    const cleaningDays = await prisma.cleaningDay.findMany({ take: 5 });
    cleaningDays.forEach(cd => console.log(`  - ${cd.dayOfWeek} (${cd.cleaningDate.toISOString().split('T')[0]}) - Status: ${cd.status}`));

    console.log('\n' + '='.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Error checking database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
