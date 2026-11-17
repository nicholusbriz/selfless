import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkProfileImages() {
  console.log('🔍 Checking profile image data...\n');

  // 1. Check users with current profile images
  const usersWithProfileImage = await prisma.user.findMany({
    where: {
      profileImageUrl: { not: null },
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      profileImageUrl: true,
      profileImageUrls: true,
    },
  });

  console.log(`📊 Users with current profile image: ${usersWithProfileImage.length}`);

  // 2. Check profile images in Media table
  const profileImagesInMedia = await prisma.media.findMany({
    where: {
      category: 'profile',
      approvalStatus: 'APPROVED',
      isActive: true,
      isDeleted: false,
    },
    select: {
      id: true,
      userId: true,
      publicUrl: true,
      title: true,
      createdAt: true,
    },
  });

  console.log(`📊 Profile images in Media table: ${profileImagesInMedia.length}`);

  // 3. Group by user
  const imagesByUser = new Map<string, string[]>();
  profileImagesInMedia.forEach((media) => {
    if (!imagesByUser.has(media.userId)) {
      imagesByUser.set(media.userId, []);
    }
    imagesByUser.get(media.userId)!.push(media.publicUrl);
  });

  console.log(`📊 Users with profile images in Media: ${imagesByUser.size}`);

  // 4. Check for potential issues
  console.log('\n🔍 Potential migration issues:\n');

  let issues = 0;

  // Users with profileImageUrl but no Media entries
  for (const user of usersWithProfileImage) {
    const userMediaImages = imagesByUser.get(user.id) || [];
    if (userMediaImages.length === 0) {
      console.log(`⚠️  User ${user.email} has profileImageUrl but no Media entries`);
      issues++;
    }
  }

  // Users with Media entries but no profileImageUrl
  for (const [userId, urls] of imagesByUser) {
    const user = usersWithProfileImage.find((u) => u.id === userId);
    if (!user || !user.profileImageUrl) {
      console.log(`⚠️  User ${userId} has Media profile images but no profileImageUrl`);
      issues++;
    }
  }

  // Users with existing profileImageUrls array
  const usersWithArray = usersWithProfileImage.filter(
    (u) => u.profileImageUrls && u.profileImageUrls.length > 0
  );
  if (usersWithArray.length > 0) {
    console.log(`⚠️  ${usersWithArray.length} users already have profileImageUrls array`);
    issues++;
  }

  if (issues === 0) {
    console.log('✅ No potential issues detected');
  }

  console.log('\n📋 Migration plan:\n');
  console.log('1. For each user with profileImageUrl:');
  console.log('   - Add current image to profileImageUrls array');
  console.log('   - Add all Media profile images to profileImageUrls array');
  console.log('   - Remove duplicates');
  console.log('2. Ensure current profileImageUrl is at the end of array');
  console.log('3. No data will be deleted - only copied to new field\n');

  return {
    usersWithProfileImage,
    profileImagesInMedia,
    imagesByUser,
    issues,
  };
}

async function migrateProfileImages() {
  console.log('🚀 Starting migration...\n');

  const { usersWithProfileImage, imagesByUser } = await checkProfileImages();

  let migrated = 0;
  let skipped = 0;

  for (const user of usersWithProfileImage) {
    const mediaImages = imagesByUser.get(user.id) || [];
    const existingUrls = user.profileImageUrls || [];

    // Combine: existing + media images + current profile image
    const allUrls = new Set([
      ...existingUrls,
      ...mediaImages,
      user.profileImageUrl!,
    ]);

    const newUrls = Array.from(allUrls);

    // Skip if no change needed
    if (existingUrls.length === newUrls.length &&
        existingUrls.every((url, i) => url === newUrls[i])) {
      skipped++;
      continue;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { profileImageUrls: newUrls },
    });

    migrated++;
    console.log(`✅ Migrated ${user.email}: ${newUrls.length} images`);
  }

  console.log(`\n🎉 Migration complete!`);
  console.log(`   Migrated: ${migrated} users`);
  console.log(`   Skipped: ${skipped} users`);
  console.log(`   Total: ${usersWithProfileImage.length} users\n`);
}

// Run migration
async function main() {
  try {
    await migrateProfileImages();
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
