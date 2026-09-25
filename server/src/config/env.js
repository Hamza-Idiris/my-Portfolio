import dotenv from 'dotenv';

dotenv.config();

const bool = (value, fallback = false) => {
  if (value === undefined || value === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
};

const list = (value, fallback = []) => {
  if (!value) return fallback;
  return String(value)
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
};

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  port: Number(process.env.PORT) || 5050,

  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hamza_portfolio',

  jwtSecret: process.env.JWT_SECRET || 'dev-only-insecure-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  cookieName: process.env.COOKIE_NAME || 'hi_session',
  cookieDomain: process.env.COOKIE_DOMAIN || undefined,
  // Cross-site cookies (separate frontend/backend hosts) require SameSite=None + Secure.
  crossSiteCookies: bool(process.env.CROSS_SITE_COOKIES, false),

  clientOrigins: list(process.env.CLIENT_ORIGINS, [
    'http://localhost:5180',
    'http://127.0.0.1:5180',
    'https://hamzaldiris.com',
    'https://www.hamzaldiris.com',
  ]),
  siteUrl: process.env.SITE_URL || 'http://localhost:5180',

  storageDriver: process.env.STORAGE_DRIVER || 'local',
  uploadDir: process.env.UPLOAD_DIR || 'uploads',
  maxUploadBytes: Number(process.env.MAX_UPLOAD_BYTES) || 8 * 1024 * 1024,
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
    folder: process.env.CLOUDINARY_FOLDER || 'hamza-portfolio',
  },

  email: {
    driver: process.env.EMAIL_DRIVER || 'console',
    apiKey: process.env.EMAIL_API_KEY || '',
    from: process.env.EMAIL_FROM || 'Portfolio <onboarding@resend.dev>',
    notifyTo: process.env.EMAIL_NOTIFY_TO || '',
    smtp: {
      host: process.env.SMTP_HOST || '',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: bool(process.env.SMTP_SECURE, false),
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
  },

  seedAdmin: {
    username: process.env.SEED_ADMIN_USERNAME || 'hamza',
    email: process.env.SEED_ADMIN_EMAIL || 'admin@example.com',
    password: process.env.SEED_ADMIN_PASSWORD || '',
  },

  analyticsEnabled: bool(process.env.ANALYTICS_ENABLED, true),
  trustProxy: process.env.TRUST_PROXY !== undefined ? bool(process.env.TRUST_PROXY) : process.env.NODE_ENV === 'production',
};

const insecureDefaults = [];
if (env.isProduction) {
  if (env.jwtSecret === 'dev-only-insecure-secret-change-me') {
    insecureDefaults.push('JWT_SECRET is using the insecure development default.');
  }
  if (env.storageDriver === 'local') {
    insecureDefaults.push(
      'STORAGE_DRIVER=local in production: uploaded files are lost when the host restarts.',
    );
  }
  if (insecureDefaults.some((message) => message.includes('JWT_SECRET'))) {
    throw new Error(`Refusing to start in production. ${insecureDefaults.join(' ')}`);
  }
  insecureDefaults.forEach((message) => console.warn(`[config] ${message}`));
}
