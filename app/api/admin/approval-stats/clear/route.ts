import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma/client';
import { publishApprovalInvalidation } from '@/lib/partykit-server';

export async function DELETE() {
  try {
    const user = await requireAuth();
    if (user.role?.name !== 'dev') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const result = await prisma.user.updateMany({
      where: {
        isVerified: true,
        verificationStatus: 'APPROVED',
        verifiedById: { not: null },
      },
      data: {
        verifiedById: null,
        verifiedAt: null,
      },
    });

    await publishApprovalInvalidation();

    return NextResponse.json({ clearedCount: result.count });
  } catch (error) {
    console.error('Clear approval history failed:', error);
    return NextResponse.json(
      { error: 'Failed to clear approval history' },
      { status: 500 },
    );
  }
}