import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting cleaning management seed...');

  // Get existing users with student profiles
  const students = await prisma.user.findMany({
    where: {
      studentProfile: {
        isNot: null,
      },
    },
    include: {
      studentProfile: true,
    },
  });

  console.log(`Found ${students.length} students`);

  if (students.length === 0) {
    console.log('⚠️  No students found. Please create students first.');
    return;
  }

  // Create a sample week starting from next Monday
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysUntilMonday = (8 - dayOfWeek) % 7 || 7;
  const nextMonday = new Date(today);
  nextMonday.setDate(today.getDate() + daysUntilMonday);
  nextMonday.setHours(0, 0, 0, 0);

  const weekStartDate = nextMonday;
  const weekEndDate = new Date(weekStartDate);
  weekEndDate.setDate(weekEndDate.getDate() + 6);
  weekEndDate.setHours(23, 59, 59, 999);

  const registrationDeadline = new Date(weekStartDate);
  registrationDeadline.setDate(registrationDeadline.getDate() - 1);
  registrationDeadline.setHours(23, 59, 59, 999);

  // Create the week
  const week = await prisma.week.create({
    data: {
      startDate: weekStartDate,
      endDate: weekEndDate,
      weekLabel: 'Week 1',
      isActive: true,
      registrationEnabled: true,
      registrationDeadline,
    },
  });

  console.log(`✅ Created week: ${week.weekLabel} (${weekStartDate.toDateString()} - ${weekEndDate.toDateString()})`);

  // Create days for the week (Monday to Friday)
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const capacityLimit = 5;

  const days = [];
  for (let i = 0; i < 5; i++) {
    const cleaningDate = new Date(weekStartDate);
    cleaningDate.setDate(weekStartDate.getDate() + i);
    cleaningDate.setHours(0, 0, 0, 0);

    const day = await prisma.cleaningDay.create({
      data: {
        weekId: week.id,
        dayOfWeek: dayNames[i],
        cleaningDate,
        capacityLimit,
        currentRegistrations: 0,
        isOpen: true,
        isFull: false,
      },
    });

    days.push(day);
    console.log(`✅ Created day: ${day.dayOfWeek} (${cleaningDate.toDateString()})`);
  }

  // Register students for days (round-robin distribution)
  for (let i = 0; i < students.length; i++) {
    const student = students[i];
    const dayIndex = i % days.length;
    const day = days[dayIndex];

    // Check if day has capacity
    const currentRegistrations = await prisma.cleaningRegistration.count({
      where: { cleaningDayId: day.id },
    });

    if (currentRegistrations < capacityLimit) {
      // Register student
      await prisma.cleaningRegistration.create({
        data: {
          userId: student.id,
          cleaningDayId: day.id,
        },
      });

      // Update day's current registrations
      const newCount = currentRegistrations + 1;
      await prisma.cleaningDay.update({
        where: { id: day.id },
        data: {
          currentRegistrations: newCount,
          isFull: newCount >= capacityLimit,
        },
      });

      console.log(`✅ Registered ${student.firstName} ${student.lastName} for ${day.dayOfWeek}`);
    }
  }

  console.log('🎉 Cleaning management seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding cleaning management:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
