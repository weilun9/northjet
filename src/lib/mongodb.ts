import mongoose from 'mongoose';

/* eslint-disable @typescript-eslint/no-explicit-any */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

function getMongoUri() {
  return process.env.MONGODB_URI;
}

export function hasMongoUri() {
  return Boolean(getMongoUri());
}

async function connectDB() {
  const mongoUri = getMongoUri();

  if (!mongoUri) {
    throw new Error(
      'MONGODB_URI is not set. Add it in Vercel > Settings > Environment Variables and redeploy.'
    );
  }

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(mongoUri, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10_000,
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
