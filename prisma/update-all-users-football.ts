// Migration script to ensure all existing users have football teamType
// Run with: npx ts-node prisma/update-all-users-football.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateAllUsersFootball() {
  console.log('Updating all users to have football team preference...');

  try {
    // Get all users
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        preferredTeamType: true,
        preferredTeamRole: true
      }
    });

    console.log(`Found ${allUsers.length} users`);

    let updatedCount = 0;
    let skippedCount = 0;

    // Update users who don't have a preferred team type
    for (const user of allUsers) {
      if (!user.preferredTeamType) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            preferredTeamType: 'FOOTBALL',
            preferredTeamRole: 'PLAYER'
          }
        });
        console.log(`✓ Updated ${user.firstName} ${user.lastName} - set to Football Player`);
        updatedCount++;
      } else {
        console.log(`- Skipped ${user.firstName} ${user.lastName} - already has ${user.preferredTeamType}`);
        skippedCount++;
      }
    }

    console.log('\n=== Update Summary ===');
    console.log(`Total users: ${allUsers.length}`);
    console.log(`Updated: ${updatedCount}`);
    console.log(`Skipped: ${skippedCount}`);
    console.log('\nUpdate complete!');

  } catch (error) {
    console.error('Update failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the update
updateAllUsersFootball()
  .then(() => {
    console.log('Update script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Update script failed:', error);
    process.exit(1);
  });