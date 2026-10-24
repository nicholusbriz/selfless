import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { getServerAuthUser } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma/client';

const COURSE_UNIT_ROLES = new Set([
  'student',
  'teacher',
  'admin',
  'dev',
  'super_admin',
]);
const ALL_CENTER_ROLES = new Set(['dev', 'super_admin']);

export async function GET() {
  try {
    const viewer = await getServerAuthUser();
    if (!viewer) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const roleName = viewer.role?.name;

    if (!roleName || !COURSE_UNIT_ROLES.has(roleName)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const canViewAllCenters = ALL_CENTER_ROLES.has(roleName);
    let scopedTechCenterId: string | undefined;
    if (!canViewAllCenters) {
      scopedTechCenterId = viewer.techCenterId ?? undefined;
      if (!scopedTechCenterId) {
        return NextResponse.json(
          { error: 'No tech center is assigned to this account' },
          { status: 403 },
        );
      }
    }

    const userWhere: Prisma.UserWhereInput = {
      isVerified: true,
      verificationStatus: 'APPROVED',
      role: {
        isNot: {
          name: { in: ['dev', 'super_admin'] },
        },
      },
      ...(scopedTechCenterId ? { techCenterId: scopedTechCenterId } : {}),
    };
    const techCenterWhere: Prisma.TechCenterWhereInput = scopedTechCenterId
      ? { id: scopedTechCenterId }
      : {};

    const [techCenters, students] = await Promise.all([
      prisma.techCenter.findMany({
        where: techCenterWhere,
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
      }),
      prisma.user.findMany({
        where: userWhere,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          role: { select: { name: true } },
          techCenter: { select: { id: true, name: true } },
          submittedCourses: {
            select: { id: true, courseUnit: true, credits: true },
          },
        },
        orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
      }),
    ]);

    const studentsByTechCenter: Record<
      string,
      Array<
        Omit<(typeof students)[number], 'submittedCourses'> & {
          studentCourses: (typeof students)[number]['submittedCourses'];
        }
      >
    > = {};

    for (const student of students) {
      const centerName = student.techCenter?.name ?? 'No Tech Center';
      const { submittedCourses, ...studentDetails } = student;
      (studentsByTechCenter[centerName] ??= []).push({
        ...studentDetails,
        studentCourses: submittedCourses,
      });
    }

    return NextResponse.json({ studentsByTechCenter, techCenters });
  } catch (error) {
    console.error('Failed to fetch course units:', error);
    return NextResponse.json(
      { error: 'Failed to fetch course units' },
      { status: 500 },
    );
  }
}
