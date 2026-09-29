import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️  Deleting existing temple trip...');

  // Delete the existing trip
  const deletedTrip = await prisma.templeTrip.deleteMany({
    where: {
      title: 'Nairobi Kenya Temple Trip'
    }
  });

  console.log(`✅ Deleted ${deletedTrip.count} existing trip(s)`);

  console.log('🌱 Starting Temple Trips seeding...');

  // Find an admin user to create the trip
  const adminUser = await prisma.user.findFirst({
    where: {
      role: {
        name: {
          in: ['admin', 'super_admin', 'dev']
        }
      }
    }
  });

  if (!adminUser) {
    console.error('❌ No admin user found. Please create an admin user first.');
    return;
  }

  console.log(`✅ Found admin user: ${adminUser.firstName} ${adminUser.lastName}`);

  // Create the temple trip with the original data from the page (global trip - no tech center)
  const templeTrip = await prisma.templeTrip.create({
    data: {
      title: 'Nairobi Kenya Temple Trip',
      description: 'We are pleased to announce that during the last week of the next block, we will be having another Temple Trip to the Nairobi Kenya Temple from 15th to 18th December 2026. This will be a wonderful opportunity for members to worship in the temple, strengthen their faith, and participate in sacred ordinances.',
      coordinatorName: 'Kiwanuka Tonny',
      dateRange: '15th – 18th December 2026',
      location: 'Nairobi Kenya Temple',
      flag: '🇰🇪',
      subtitle: 'December 2026',
      closingText: 'Thank you, and we look forward to worshipping together in Nairobi.',
      requirements: [
        'Be a member of The Church of Jesus Christ of Latter-day Saints.',
        'Have a valid Temple Recommend, approved by an authorized Church leader such as a Bishop, Branch President, Mission President, District President, or Stake President.',
        'Have attended Temple Preparation classes.',
        'Have a valid passport or National ID.',
        'Have a valid Yellow Fever vaccination certificate/card.',
        'Contribute UGX 100,000 toward the trip starting this week.',
        'Be an active student enrolled in the program.',
        'Priority will be given to those attending the temple for the first time.',
      ],
      createdById: adminUser.id,
      techCenterId: null, // Global trip - no tech center restriction
      isActive: true,
    }
  });

  console.log('✅ Temple trip created successfully:');
  console.log(`   Title: ${templeTrip.title}`);
  console.log(`   Coordinator: ${templeTrip.coordinatorName}`);
  console.log(`   Date: ${templeTrip.dateRange}`);
  console.log(`   Location: ${templeTrip.location}`);
  console.log(`   Requirements: ${templeTrip.requirements.length} items`);
  console.log(`   Tech Center: None (Global Trip)`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
