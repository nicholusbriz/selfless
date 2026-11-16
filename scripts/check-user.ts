import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUser() {
  const email = 'turyamurebanicholus@gmail.com';

  console.log(`🔍 Checking user: ${email}\n`);

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      profileImageUrl: true,
      profileImageUrls: true,
    },
  });

  if (!user) {
    console.log('❌ User not found');
    return;
  }

  console.log('📊 User data:');
  console.log(`   Name: ${user.firstName} ${user.lastName}`);
  console.log(`   profileImageUrl: ${user.profileImageUrl}`);
  console.log(`   profileImageUrls: ${JSON.stringify(user.profileImageUrls, null, 2)}`);
  console.log(`   Array length: ${user.profileImageUrls?.length || 0}\n`);

  if (!user.profileImageUrls || user.profileImageUrls.length === 0) {
    console.log('⚠️  profileImageUrls array is empty or null');
    console.log('💡 This user needs migration');
  } else {
    console.log('✅ profileImageUrls has data');
  }
}

async function main() {
  try {
    await checkUser();
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
