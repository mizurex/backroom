import mongoose from 'mongoose';
import { env } from '../config/env';

export async function connectMongo(): Promise<void> {
  if (!env.mongoUri) throw new Error('Missing MONGO_URI');
  await mongoose.connect(env.mongoUri);
  console.log('Connected to MongoDB');
}

export function disconnectMongo(): Promise<void> {
  return mongoose.disconnect();
}

