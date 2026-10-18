import path from 'node:path';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { apiLimiter } from './middleware/rateLimit.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { ApiError } from './utils/ApiError.js';
import routes from './routes/index.js';

export function createApp() {
  const app = express();

  if (env.trustProxy) app.set('trust proxy', 1);
  app.disable('x-powered-by');
  // "simple" keeps query values as strings, so `?status[$ne]=` can never reach Mongo.
  app.set('query parser', 'simple');

  app.use(
    helmet({
      // The API only serves JSON and static uploads; the SPA is hosted separately,
      // so nothing here is ever meant to execute or embed scripts.
      contentSecurityPolicy: {
        useDefaults: false,
        directives: {
          'default-src': ["'none'"],
          'img-src': ["'self'", 'data:'],
          'frame-ancestors': ["'none'"],
          'base-uri': ["'none'"],
          'form-action': ["'none'"],
        },
      },
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      referrerPolicy: { policy: 'no-referrer' },
    }),
  );

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin) return callback(null, true);
        const normalizedOrigin = origin.replace(/\/$/, '');
        const isAllowed =
          env.clientOrigins.some(
            (allowed) => allowed.replace(/\/$/, '') === normalizedOrigin,
          ) ||
          /\.vercel\.app$/.test(new URL(origin).hostname) ||
          normalizedOrigin.includes('localhost') ||
          normalizedOrigin.includes('127.0.0.1');

        if (isAllowed) return callback(null, true);
        return callback(ApiError.forbidden(`Origin ${origin} is not allowed`));
      },
      credentials: true,
    }),
  );

  app.use(compression());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(cookieParser());

  if (!env.isProduction) app.use(morgan('dev'));

  app.use(
    `/${env.uploadDir}`,
    express.static(path.resolve(process.cwd(), env.uploadDir), {
      maxAge: env.isProduction ? '30d' : 0,
      fallthrough: true,
    }),
  );

  app.get('/', (req, res) => {
    res.json({ status: 'ok', name: 'Hamza Idiris Portfolio API', version: 1 });
  });

  app.get('/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime(), environment: env.nodeEnv });
  });

  app.use('/api', apiLimiter, routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
