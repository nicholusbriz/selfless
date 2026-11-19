import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const gifts = [
  // Tier 1 - Budget (10-30 credits)
  { name: 'Rose', emoji: '🌸', cost: 10, tier: 1, description: 'A beautiful rose' },
  { name: 'Heart', emoji: '🎀', cost: 15, tier: 1, description: 'Spread the love' },
  { name: 'Star', emoji: '🌟', cost: 20, tier: 1, description: 'Shine bright' },
  { name: 'Love Letter', emoji: '💝', cost: 30, tier: 1, description: 'Send your love' },
  
  // Tier 2 - Mid (50-100 credits)
  { name: 'Gift Box', emoji: '🎁', cost: 50, tier: 2, description: 'Surprise gift' },
  { name: 'Trophy', emoji: '🏆', cost: 75, tier: 2, description: 'For the winner' },
  { name: 'Circus Tent', emoji: '🎪', cost: 80, tier: 2, description: 'Fun times' },
  { name: 'Art Palette', emoji: '🎨', cost: 100, tier: 2, description: 'Creative gift' },
  
  // Tier 3 - Premium (200-400 credits)
  { name: 'Lion', emoji: '🦁', cost: 200, tier: 3, description: 'Majestic lion' },
  { name: 'Castle', emoji: '🏰', cost: 300, tier: 3, description: 'Royal castle' },
  { name: 'Rocket', emoji: '🚀', cost: 350, tier: 3, description: 'Blast off!' },
  { name: 'Guitar', emoji: '🎸', cost: 400, tier: 3, description: 'Rock on!' },
  
  // Tier 4 - Rare (500-1000 credits)
  { name: 'Crown', emoji: '👑', cost: 500, tier: 4, description: 'For royalty' },
  { name: 'Diamond', emoji: '💎', cost: 750, tier: 4, description: 'Precious gem' },
  { name: 'Rainbow', emoji: '🌈', cost: 900, tier: 4, description: 'Colorful joy' },
  { name: 'Mask', emoji: '🎭', cost: 1000, tier: 4, description: 'Mysterious' },
];

async function main() {
  console.log('Seeding gifts...');

  for (const gift of gifts) {
    const existing = await prisma.gift.findFirst({
      where: { name: gift.name },
    });

    if (!existing) {
      await prisma.gift.create({
        data: gift,
      });
    }
  }

  console.log('Gifts seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
