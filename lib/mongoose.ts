import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

// Cached connection for Next.js serverless hot-reload
interface MongooseCache { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null; }
let cached = (global as unknown as { mongoose: MongooseCache }).mongoose as {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
};

if (!cached) {
    cached = (global as unknown as { mongoose: MongooseCache }).mongoose = { conn: null, promise: null };
}

export async function connectDB() {
    if (cached.conn) return cached.conn;

    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URI).then((m) => m);
    }

    cached.conn = await cached.promise;
    return cached.conn;
}
