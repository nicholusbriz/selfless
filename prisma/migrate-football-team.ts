// Migration script to migrate existing FootballTeam users to TeamMembership system
// Run with: npx ts-node prisma/migrate-football-team.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateFootballTeam() {
  console.log('Starting Football Team migration...');

  try {
    // 1. Get all existing football team members
    const existingFootballMembers = await prisma.footballTeam.findMany({
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        },
        techCenter: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });

    console.log(`Found ${existingFootballMembers.length} existing football team members`);

    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    // 2. For each existing member, create a TeamMembership record
    for (const member of existingFootballMembers) {
      try {
        // Check if TeamMembership already exists
        const existingMembership = await prisma.teamMembership.findFirst({
          where: {
            userId: member.userId,
            techCenterId: member.techCenterId,
            teamType: 'FOOTBALL',
            teamRole: 'PLAYER'
          }
        });

        if (existingMembership) {
          console.log(`Skipping ${member.user.firstName} ${member.user.lastName} - already migrated`);
          skippedCount++;
          continue;
        }

        // Create new TeamMembership record
        await prisma.teamMembership.create({
          data: {
            userId: member.userId,
            techCenterId: member.techCenterId,
            teamType: 'FOOTBALL',
            teamRole: 'PLAYER', // Default all existing members to PLAYER role
            jerseyNumber: member.jerseyNumber,
            position: member.position,
            isActive: member.isActive,
            joinedAt: member.joinedAt,
            notes: 'Migrated from FootballTeam system'
          }
        });

        console.log(`✓ Migrated ${member.user.firstName} ${member.user.lastName} from ${member.techCenter.name}`);
        migratedCount++;
      } catch (error) {
        console.error(`✗ Error migrating ${member.user.firstName} ${member.user.lastName}:`, error);
        errorCount++;
      }
    }

    console.log('\n=== Migration Summary ===');
    console.log(`Total existing members: ${existingFootballMembers.length}`);
    console.log(`Successfully migrated: ${migratedCount}`);
    console.log(`Skipped (already migrated): ${skippedCount}`);
    console.log(`Errors: ${errorCount}`);
    console.log('\nMigration complete!');

  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
migrateFootballTeam()
  .then(() => {
    console.log('Migration script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration script failed:', error);
    process.exit(1);
  });