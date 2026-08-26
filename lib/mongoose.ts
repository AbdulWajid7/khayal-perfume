import mongoose from "mongoose";

const { MONGODB_URI } = process.env;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const cached: MongooseCache = (global as unknown as { mongoose?: MongooseCache }).mongoose || {
  conn: null,
  promise: null,
};

if (!(global as unknown as { mongoose?: MongooseCache }).mongoose) {
  (global as unknown as { mongoose?: MongooseCache }).mongoose = cached;
}

export async function dbConnect() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI as string, { bufferCommands: false })
      .catch((err) => {
        cached.promise = null;
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (err) {
    cached.conn = null;
    throw err;
  }
}

export function toJSON<T>(doc: mongoose.Document<T> | mongoose.FlattenMaps<T> | null): T | null {
  if (!doc) return null;
  return JSON.parse(JSON.stringify(doc));
}
