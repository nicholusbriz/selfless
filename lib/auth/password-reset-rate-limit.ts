import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma/client';

const REQUEST_LIMIT = 3;
const WINDOW_MS = 24 * 60 * 60 * 1000;

export async function claimPasswordResetRequest(email: string): Promise<boolean> {
  const now = new Date();
  const cutoff = new Date(now.getTime() - WINDOW_MS);
  const slots: Array<{
    where: Prisma.UserWhereInput;
    data: Prisma.UserUpdateManyMutationInput;
  }> = [
    {
      where: {
        OR: [
          { passwordResetRequest1At: null },
          { passwordResetRequest1At: { lte: cutoff } },
        ],
      },
      data: { passwordResetRequest1At: now },
    },
    {
      where: {
        OR: [
          { passwordResetRequest2At: null },
          { passwordResetRequest2At: { lte: cutoff } },
        ],
      },
      data: { passwordResetRequest2At: now },
    },
    {
      where: {
        OR: [
          { passwordResetRequest3At: null },
          { passwordResetRequest3At: { lte: cutoff } },
        ],
      },
      data: { passwordResetRequest3At: now },
    },
  ];

  for (const slot of slots.slice(0, REQUEST_LIMIT)) {
    const result = await prisma.user.updateMany({
      where: { email, ...slot.where },
      data: slot.data,
    });

    if (result.count === 1) return true;
  }

  return false;
}
