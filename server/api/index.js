import { createApp } from '../src/app.js';
import { connectDatabase } from '../src/config/database.js';

let appInstance = null;

export default async function handler(req, res) {
  try {
    // If Vercel rewrote the destination path to /api/index.js or /api, restore the original incoming path
    const originalUrl = req.headers['x-forwarded-uri'] || req.headers['x-matched-path'];
    if (originalUrl && (req.url === '/api/index.js' || req.url === '/api')) {
      req.url = originalUrl;
    }

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
