import mongoose from 'mongoose';
import { env } from './env.js';

mongoose.set('strictQuery', true);

export async function connectDatabase(uri = env.mongoUri) {
  if (mongoose.connection.readyState === 1) return mongoose.connection;

  mongoose.connection.on('error', (error) => {
    console.error('[database] connection error:', error.message);
  });
  mongoose.connection.on('disconnected', () => {
    console.warn('[database] disconnected');
  });

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
    autoIndex: !env.isProduction,
  });

  console.log(`[database] connected to ${mongoose.connection.name}`);
  return mongoose.connection;
}

export async function disconnectDatabase() {
  if (mongoose.connection.readyState === 0) return;
  await mongoose.disconnect();
}
