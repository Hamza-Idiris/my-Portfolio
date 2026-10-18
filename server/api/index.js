import { createApp } from '../src/app.js';
import { connectDatabase } from '../src/config/database.js';

let appInstance = null;

export default async function handler(req, res) {
  try {
    await connectDatabase();
    if (!appInstance) {
      appInstance = createApp();
    }
    return appInstance(req, res);
  } catch (error) {
    console.error('[serverless handler error]:', error);
    res.status(500).json({
      error: {
        message: 'Internal server error while initializing database or application.',
      },
    });
  }
}
