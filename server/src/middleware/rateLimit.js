import rateLimit from 'express-rate-limit';

const jsonMessage = (message) => ({ error: { message } });

const base = {
  standardHeaders: 'draft-7',
  legacyHeaders: false,
};

export const apiLimiter = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  limit: 600,
  message: jsonMessage('Too many requests. Please slow down.'),
});

export const loginLimiter = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  limit: 8,
  skipSuccessfulRequests: true,
  message: jsonMessage('Too many login attempts. Try again in a few minutes.'),
});

export const contactLimiter = rateLimit({
  ...base,
  windowMs: 60 * 60 * 1000,
  limit: 5,
  message: jsonMessage('You have sent several messages already. Please try again later.'),
});

export const analyticsLimiter = rateLimit({
  ...base,
  windowMs: 60 * 1000,
  limit: 120,
  message: jsonMessage('Too many events.'),
});

export const uploadLimiter = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  limit: 60,
  message: jsonMessage('Too many uploads. Please wait a moment.'),
});
