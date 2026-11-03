import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateMedia() {
  try {
    console.log('Starting media migration...');
    
    // Migrate existing media to 'dashboard' category
    const updated = await prisma.media.updateMany({
      where: {
        isActive: true,
        isDeleted: false,
        category: null,
      },
      data: {
        category: 'dashboard',
      },
    });

    console.log(`✅ Successfully migrated ${updated.count} media items to 'dashboard' category`);
    
    // Show summary
    const dashboardCount = await prisma.media.count({
      where: { category: 'dashboard' },
    });
    
    const galleryCount = await prisma.media.count({
      where: { category: 'gallery' },
    });
    
    console.log(`\nSummary:`);
    console.log(`- Dashboard media: ${dashboardCount}`);
    console.log(`- Gallery media: ${galleryCount}`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

migrateMedia();
