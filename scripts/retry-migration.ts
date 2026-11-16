import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function retryFailedUser() {
  const userId = '6ad5d054aa4fce60aaeb6721';

  console.log('🔄 Retrying migration for failed user...\n');

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      profileImageUrl: true,
      profileImageUrls: true,
    },
  });

  if (!user) {
    console.log('❌ User not found');
    return;
  }

  if (!user.profileImageUrl) {
    console.log('❌ User has no profile image');
    return;
  }

  const existingUrls = user.profileImageUrls || [];
  const newUrls = [...existingUrls, user.profileImageUrl];

  await prisma.user.update({
    where: { id: userId },
    data: { profileImageUrls: newUrls },
  });

  console.log(`✅ Successfully migrated ${user.email}`);
}

async function main() {
  try {
    await retryFailedUser();
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
