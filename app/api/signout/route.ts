import { NextResponse } from 'next/server';
import { AUTH_CONSTANTS } from '@/config/constants';

export async function POST() {
  try {
    const response = NextResponse.json({
      success: true,
      message: 'Signed out successfully'
    });

    // Clear the auth cookie
    response.cookies.set(AUTH_CONSTANTS.TOKEN_NAME, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0, // Expire immediately
      path: '/'
    });

    return response;

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Error during signout'
    }, { status: 500 });
  }
}
