import { NextResponse } from 'next/server';
import connectDB from '@/models/database';

export async function GET() {
  console.log('🏥 Health check API called');
  
  try {
    console.log('🔌 Testing database connection...');
    await connectDB();
    console.log('✅ Database connection successful');
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    });
    
  } catch (error) {
    console.error('❌ Health check failed:', error);
    console.error('❌ Error details:', error instanceof Error ? error.message : 'Unknown error');
    
    return NextResponse.json({
      success: false,
      message: 'Database connection failed',
      error: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : 'Unknown error' : undefined,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
