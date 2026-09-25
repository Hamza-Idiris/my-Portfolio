import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const signSessionToken = (admin) =>
  jwt.sign(
    { sub: String(admin._id), username: admin.username, role: admin.role },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn },
  );

export const verifySessionToken = (token) => jwt.verify(token, env.jwtSecret);

export const cookieOptions = () => ({
  httpOnly: true,
  secure: env.isProduction || env.crossSiteCookies,
  sameSite: env.isProduction || env.crossSiteCookies ? 'none' : 'lax',
  path: '/',
  ...(env.cookieDomain ? { domain: env.cookieDomain } : {}),
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

export function setSessionCookie(res, token) {
  res.cookie(env.cookieName, token, cookieOptions());
}

export function clearSessionCookie(res) {
  const { maxAge, ...options } = cookieOptions();
  res.clearCookie(env.cookieName, options);
}
