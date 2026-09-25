import { Admin } from '../models/Admin.js';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { verifySessionToken } from '../services/tokens.js';

export async function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.[env.cookieName];
    if (!token) throw ApiError.unauthorized('Please sign in to continue');

    let payload;
    try {
      payload = verifySessionToken(token);
    } catch {
      throw ApiError.unauthorized('Your session has expired. Please sign in again.');
    }

    const admin = await Admin.findById(payload.sub);
    if (!admin) throw ApiError.unauthorized('Your session is no longer valid');

    // Any password change invalidates tokens issued before it.
    if (admin.passwordChangedAt && payload.iat * 1000 < admin.passwordChangedAt.getTime()) {
      throw ApiError.unauthorized('Your password changed. Please sign in again.');
    }

    req.admin = admin;
    return next();
  } catch (error) {
    return next(error);
  }
}

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.admin || !roles.includes(req.admin.role)) {
    return next(ApiError.forbidden('You do not have access to this action'));
  }
  return next();
};
