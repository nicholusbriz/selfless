import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        email: true,
        password: true,
        isVerified: true,
        verificationStatus: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        country: true,
        city: true,
        techCenter: { select: { name: true, code: true } },
      },
    });

    if (!user?.password || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 },
      );
    }

    if (user.isVerified && user.verificationStatus === 'APPROVED') {
      return NextResponse.json(
        { error: 'Account is already approved' },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        requiresApproval: true,
        user: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          techCenter: user.techCenter || undefined,
          country: user.country,
          city: user.city,
        },
      },
      { status: 403, headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    console.error('Pending approval lookup failed:', error);
    return NextResponse.json(
      { error: 'Unable to check account approval status' },
      { status: 500 },
    );
  }
}