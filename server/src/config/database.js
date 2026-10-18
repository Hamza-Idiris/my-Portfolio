import mongoose from 'mongoose';
import { env } from './env.js';

mongoose.set('strictQuery', true);

let cachedConnection = null;

export async function connectDatabase(uri = env.mongoUri) {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  mongoose.connection.on('error', (error) => {
    console.error('[database] connection error:', error.message);
  });
  mongoose.connection.on('disconnected', () => {
    console.warn('[database] disconnected');
  });

  cachedConnection = await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
    autoIndex: !env.isProduction,
  });

  console.log(`[database] connected to ${mongoose.connection.name}`);
  return cachedConnection;
}

export async function disconnectDatabase() {
  if (mongoose.connection.readyState === 0) return;
  await mongoose.disconnect();
}
