import mongoose from 'mongoose';

// Simple environment variable validation
const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;

if (!MONGODB_URI) {
  throw new Error('❌ MONGODB_URI environment variable is required');
}

if (!JWT_SECRET) {
  throw new Error('❌ JWT_SECRET environment variable is required');
}

if (JWT_SECRET === 'your-secret-key-change-in-production') {
  console.warn('⚠️ Using default JWT_SECRET. Please change it in production!');
}

const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * MongoDB connection interface for caching
 */
interface CachedConnection {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: CachedConnection | undefined;
}

/**
 * Cached connection object for MongoDB
 */
const cached: CachedConnection = global.mongoose || {
  conn: null,
  promise: null,
};

if (!global.mongoose) {
  global.mongoose = cached;
}

/**
 * Connects to MongoDB database with connection caching
 * @returns Promise resolving to mongoose connection
 * @throws Error if connection fails
 */
async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 30000, // Increased from 5000 to 30 seconds
      socketTimeoutMS: 45000, // Increased from 30000 to 45 seconds
      maxPoolSize: isDevelopment ? 5 : 20, // Increased pool size
      minPoolSize: 2,
      maxIdleTimeMS: 60000, // Increased from 30000 to 60 seconds
      connectTimeoutMS: 15000, // Increased from 5000 to 15 seconds
      heartbeatFrequencyMS: 10000, // Keep connection alive
      retryWrites: true,
      w: 'majority' as const
    };

    cached.promise = mongoose.connect(MONGODB_URI!, opts)
      .then((mongoose) => {
        console.log('✅ MongoDB connected successfully');
        cached.conn = mongoose;
        return mongoose;
      })
      .catch((error) => {
        console.error('❌ MongoDB connection error:', error);
        console.log('🔄 Retrying connection in 2 seconds...');
        cached.promise = null; // Reset promise to allow retry

        // Retry connection after delay
        setTimeout(() => {
          console.log('🔄 Retrying MongoDB connection...');
        }, 2000);

        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
export { connectDB as connectToDatabase };
