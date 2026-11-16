import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function bulkMigrateProfileImages() {
  console.log('🚀 Starting bulk migration...\n');

  // 1. Get all users with profileImageUrl
  const usersWithProfileImage = await prisma.user.findMany({
    where: {
      profileImageUrl: { not: null },
    },
    select: {
      id: true,
      email: true,
      profileImageUrl: true,
      profileImageUrls: true,
    },
  });

  console.log(`📊 Found ${usersWithProfileImage.length} users with profile images\n`);

  // 2. Get all profile images from Media table
  const profileImagesInMedia = await prisma.media.findMany({
    where: {
      category: 'profile',
      approvalStatus: 'APPROVED',
      isActive: true,
      isDeleted: false,
    },
    select: {
      userId: true,
      publicUrl: true,
    },
  });

  // 3. Group Media images by user
  const imagesByUser = new Map<string, string[]>();
  profileImagesInMedia.forEach((media) => {
    if (!imagesByUser.has(media.userId)) {
      imagesByUser.set(media.userId, []);
    }
    imagesByUser.get(media.userId)!.push(media.publicUrl);
  });

  console.log(`📊 Found ${profileImagesInMedia.length} profile images in Media table\n`);

  // 4. Prepare bulk updates
  const updates = usersWithProfileImage.map((user) => {
    const mediaImages = imagesByUser.get(user.id) || [];
    const existingUrls = user.profileImageUrls || [];

    // Combine: existing + media images + current profile image
    const allUrls = new Set([
      ...existingUrls,
      ...mediaImages,
      user.profileImageUrl!,
    ]);

    const newUrls = Array.from(allUrls);

    return {
      where: { id: user.id },
      data: { profileImageUrls: newUrls },
    };
  });

  console.log(`📊 Prepared ${updates.length} bulk updates\n`);

  // 5. Execute bulk updates in batches of 50
  const batchSize = 50;
  let migrated = 0;
  let skipped = 0;

  for (let i = 0; i < updates.length; i += batchSize) {
    const batch = updates.slice(i, i + batchSize);
    
    const results = await Promise.all(
      batch.map((update) =>
        prisma.user.update(update).catch((err) => {
          console.error(`❌ Failed to migrate ${update.where.id}:`, err.message);
          return null;
        })
      )
    );

    const successCount = results.filter((r) => r !== null).length;
    migrated += successCount;
    skipped += batch.length - successCount;

    console.log(`✅ Batch ${Math.floor(i / batchSize) + 1}: ${successCount}/${batch.length} users migrated`);
  }

  console.log(`\n🎉 Bulk migration complete!`);
  console.log(`   Migrated: ${migrated} users`);
  console.log(`   Skipped: ${skipped} users`);
  console.log(`   Total: ${usersWithProfileImage.length} users\n`);
}

async function main() {
  try {
    await bulkMigrateProfileImages();
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
