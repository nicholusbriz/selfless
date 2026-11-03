import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateMediaToDashboard() {
  try {
    console.log('Updating media to dashboard category...');
    
    // Update all media with category 'gallery' to 'dashboard'
    const updated = await prisma.media.updateMany({
      where: {
        isActive: true,
        isDeleted: false,
        category: 'gallery',
      },
      data: {
        category: 'dashboard',
      },
    });

    console.log(`✅ Successfully updated ${updated.count} media items to 'dashboard' category`);
    
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
    console.error('❌ Update failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

updateMediaToDashboard();
