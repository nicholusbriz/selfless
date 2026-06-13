import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  // Check environment variables
  const envVars = {
    DATABASE_URL: process.env.DATABASE_URL ? '✅ Set' : '❌ Missing',
    MONGODB_URI: process.env.MONGODB_URI ? '✅ Set' : '❌ Missing',
    JWT_SECRET: process.env.JWT_SECRET ? '✅ Set' : '❌ Missing',
    NODE_ENV: process.env.NODE_ENV,
  };

  // Test database connection
  let dbStatus = 'not tested';
  try {
    await prisma.$connect();
    dbStatus = '✅ Connected';
  } catch (error: any) {
    dbStatus = `❌ Failed: ${error.message}`;
  }

  return NextResponse.json({
    env: envVars,
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
}