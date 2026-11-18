import type { Prisma, PrismaClient } from '@prisma/client';

type SessionInvalidationClient = Pick<PrismaClient, 'role' | 'user'>;

export async function invalidateUserSessions(
  client: SessionInvalidationClient,
  techCenterId: string | null,
) {
  const devRole = await client.role.findUnique({
    where: { name: 'dev' },
    select: { id: true },
  });

  const where: Prisma.UserWhereInput = {
    ...(devRole ? { NOT: { roleId: devRole.id } } : {}),
    ...(techCenterId ? { techCenterId } : {}),
    isActive: true,
  };

  return client.user.updateMany({
    where,
    data: {
      tokenVersion: {
        increment: 1,
      },
    },
  });
}
