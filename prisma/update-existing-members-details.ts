// Migration script to ensure existing team members have jersey numbers and positions
// Run with: npx ts-node prisma/update-existing-members-details.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateExistingMembers() {
  console.log('Updating existing team members with jersey numbers and positions...');

  try {
    // Get all team members without jersey numbers or positions
    const membersWithoutDetails = await prisma.teamMembership.findMany({
      where: {
        OR: [
          { jerseyNumber: null },
          { position: null }
        ]
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    console.log(`Found ${membersWithoutDetails.length} members without complete details`);

    let updatedCount = 0;

    // Update each member with default values
    for (const member of membersWithoutDetails) {
      const jerseyNum = member.jerseyNumber || Math.floor(Math.random() * 99) + 1;
      const pos = member.position || 'Player';
      
      await prisma.teamMembership.update({
        where: { id: member.id },
        data: {
          jerseyNumber: jerseyNum,
          position: pos
        }
      });
      console.log(`✓ Updated ${member.user.firstName} ${member.user.lastName} - Jersey #${jerseyNum}, Position: ${pos}`);
      updatedCount++;
    }

    console.log('\n=== Update Summary ===');
    console.log(`Total members updated: ${updatedCount}`);
    console.log('Update complete!');

  } catch (error) {
    console.error('Update failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the update
updateExistingMembers()
  .then(() => {
    console.log('Update script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Update script failed:', error);
    process.exit(1);
  });