// scripts/checkRoles.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkRoles() {
  const roles = await prisma.role.findMany();
  console.log('Available roles:', roles);
  
  const userWithRole = await prisma.user.findFirst({
    where: { email: 'kiwanukatonny@gmail.com' },
    include: { role: true }
  });
  
  console.log('User role:', userWithRole?.role);
  await prisma.$disconnect();
}

checkRoles();