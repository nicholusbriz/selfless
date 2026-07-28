// prisma/seed.js
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('🌱 SEEDING DATABASE');
  console.log('='.repeat(60) + '\n');

  try {
    // ============================================
    // 1. SEED COUNTRIES
    // ============================================
    console.log('🌍 1. Seeding countries...');
    
    const uganda = await prisma.country.upsert({
      where: { name: 'Uganda' },
      update: {},
      create: { name: 'Uganda', code: 'UG', isActive: true },
    });
    
    const liberia = await prisma.country.upsert({
      where: { name: 'Liberia' },
      update: {},
      create: { name: 'Liberia', code: 'LR', isActive: true },
    });
    
    console.log(`  ✅ Created ${await prisma.country.count()} countries`);

    // ============================================
    // 2. SEED ROLES
    // ============================================
    console.log('\n🎭 2. Seeding roles...');

    const roles = [
      {
        name: 'super_admin',
        displayName: 'Super Admin',
        description: 'Global system administrator with full access',
        permissions: ['*']
      },
      {
        name: 'admin',
        displayName: 'Tech Center Admin',
        description: 'Administrator for a specific tech center',
        permissions: [
          'manage_users',
          'manage_courses',
          'manage_cleaning',
          'manage_announcements',
          'view_reports',
          'assign_teachers'
        ]
      },
      {
        name: 'teacher',
        displayName: 'Teacher',
        description: 'Can assign grades to students in their tech center',
        permissions: [
          'manage_grades',
          'manage_attendance',
          'view_students',
          'view_courses',
          'view_teachers'
        ]
      },
      {
        name: 'student',
        displayName: 'Student',
        description: 'Can submit courses, view grades, and register for cleaning',
        permissions: [
          'submit_courses',
          'view_grades',
          'register_cleaning',
          'view_announcements'
        ]
      }
    ];

    for (const role of roles) {
      await prisma.role.upsert({
        where: { name: role.name },
        update: {},
        create: role,
      });
    }
    console.log(`  ✅ Created ${await prisma.role.count()} roles`);

    // ============================================
    // 3. SEED GRADE SCALE
    // ============================================
    console.log('\n📊 3. Seeding grade scale...');

    const gradeScales = [
      { gradeLetter: 'A', minScore: 90, maxScore: 100, gradePoints: 4.0 },
      { gradeLetter: 'A-', minScore: 85, maxScore: 89, gradePoints: 3.7 },
      { gradeLetter: 'B+', minScore: 80, maxScore: 84, gradePoints: 3.4 },
      { gradeLetter: 'B', minScore: 75, maxScore: 79, gradePoints: 3.0 },
      { gradeLetter: 'B-', minScore: 70, maxScore: 74, gradePoints: 2.7 },
      { gradeLetter: 'C+', minScore: 65, maxScore: 69, gradePoints: 2.4 },
      { gradeLetter: 'C', minScore: 60, maxScore: 64, gradePoints: 2.0 },
      { gradeLetter: 'C-', minScore: 55, maxScore: 59, gradePoints: 1.7 },
      { gradeLetter: 'D+', minScore: 50, maxScore: 54, gradePoints: 1.4 },
      { gradeLetter: 'D', minScore: 45, maxScore: 49, gradePoints: 1.0 },
      { gradeLetter: 'D-', minScore: 40, maxScore: 44, gradePoints: 0.7 },
      { gradeLetter: 'E', minScore: 35, maxScore: 39, gradePoints: 0.0 },
      { gradeLetter: 'F', minScore: 0, maxScore: 34, gradePoints: 0.0 }
    ];

    for (const grade of gradeScales) {
      await prisma.gradeScale.upsert({
        where: { gradeLetter: grade.gradeLetter },
        update: {},
        create: grade,
      });
    }
    console.log(`  ✅ Created ${gradeScales.length} grade scale levels`);

    // ============================================
    // 4. SEED TECH CENTERS (LINKED TO COUNTRIES)
    // ============================================
    console.log('\n🏢 4. Seeding tech centers...');

    // Create Freedom City Tech Center (Linked to Uganda)
    const fct = await prisma.techCenter.upsert({
      where: { code: 'FCT' },
      update: {},
      create: {
        name: 'Freedom City Tech Center',
        code: 'FCT',
        description: 'Main tech center in Kampala, Uganda',
        countryId: uganda.id,  // ← Linked to Uganda
        city: 'Kampala',
        address: 'Namasuba, Stella, Kabowa',
        phone: '+256-700-123456',
        email: 'info@freedomcity.tech',
        isActive: true,
      },
    });
    console.log(`  ✅ Created ${fct.name} (${fct.code}) → ${uganda.name}`);

    // Create Liberty Tech Center (Linked to Liberia)
    const lbt = await prisma.techCenter.upsert({
      where: { code: 'LBT' },
      update: {},
      create: {
        name: 'Liberty Tech Center',
        code: 'LBT',
        description: 'Tech center in Monrovia, Liberia',
        countryId: liberia.id,  // ← Linked to Liberia
        city: 'Monrovia',
        address: '123 Broad Street',
        phone: '+231-777-123456',
        email: 'info@libertytech.lr',
        isActive: true,
      },
    });
    console.log(`  ✅ Created ${lbt.name} (${lbt.code}) → ${liberia.name}`);

    // ============================================
    // 5. NO SUPER ADMIN SEEDED
    // ============================================
    console.log('\n👑 5. No super admin seeded');
    console.log('  ℹ️  First user who registers will need to be promoted to super admin manually');

    // ============================================
    // SUMMARY
    // ============================================
    console.log('\n' + '='.repeat(60));
    console.log('✅ SEEDING COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(60));

    console.log('\n📊 Summary:');
    console.log(`  🌍 Countries: ${await prisma.country.count()}`);
    console.log(`  🎭 Roles: ${await prisma.role.count()}`);
    console.log(`  📊 Grade Scale: ${await prisma.gradeScale.count()}`);
    console.log(`  🏢 Tech Centers: ${await prisma.techCenter.count()}`);
    console.log(`  👥 Users: ${await prisma.user.count()}`);

    console.log('\n📌 Tech Centers with Countries:');
    const centers = await prisma.techCenter.findMany({
      include: { country: true }
    });
    centers.forEach(center => {
      console.log(`  - ${center.name} (${center.code}) → ${center.country?.name || 'No country'}`);
    });

    console.log('\n📝 Next Steps:');
    console.log('  1. Register a user through the signup page');
    console.log('  2. User selects tech center → Country is automatically determined');
    console.log('  3. Promote first user to super_admin in the database');

    console.log('\n' + '='.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();