import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma/client';

const MANAGER_ROLES = new Set(['admin', 'super_admin', 'dev']);

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ resourceId: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: { select: { name: true } } },
    });

    if (!MANAGER_ROLES.has(user?.role?.name ?? '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { resourceId } = await context.params;
    await prisma.supportResource.delete({ where: { id: resourceId } });

    return NextResponse.json({ message: 'Support resource deleted' });
  } catch (error) {
    console.error('Error deleting support resource:', error);
    return NextResponse.json(
      { error: 'Failed to delete support resource' },
      { status: 500 },
    );
  }
}