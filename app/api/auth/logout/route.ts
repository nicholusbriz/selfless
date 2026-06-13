import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Clear the token cookie
    const response = NextResponse.json({ 
      success: true, 
      message: 'Logged out successfully' 
    });

    response.cookies.delete('token');

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({
      success: false,
      message: 'Server error during logout',
    }, { status: 500 });
  }
}
