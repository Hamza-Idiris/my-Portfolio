import { Admin } from '../models/Admin.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { clearSessionCookie, setSessionCookie, signSessionToken } from '../services/tokens.js';
import { logActivity } from '../services/activityLog.js';

const publicAdmin = (admin) => ({
  id: admin._id,
  username: admin.username,
  email: admin.email,
  name: admin.name,
  role: admin.role,
  lastLogin: admin.lastLogin,
  mustChangePassword: admin.mustChangePassword,
});

export const login = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;

  const admin = await Admin.findOne({
    $or: [{ username: identifier.toLowerCase() }, { email: identifier.toLowerCase() }],
  }).select('+passwordHash');

  // Same message for unknown accounts and wrong passwords, so the endpoint
  // cannot be used to discover which usernames exist.
  const invalid = ApiError.unauthorized('Incorrect username or password');
  if (!admin) throw invalid;

  const matches = await admin.verifyPassword(password);
  if (!matches) throw invalid;

  admin.lastLogin = new Date();
  await admin.save();

  setSessionCookie(res, signSessionToken(admin));
  await logActivity(admin, 'login', { targetType: 'session' });

  res.json({ admin: publicAdmin(admin) });
});

export const logout = asyncHandler(async (req, res) => {
  clearSessionCookie(res);
  if (req.admin) await logActivity(req.admin, 'logout', { targetType: 'session' });
  res.json({ message: 'Signed out' });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ admin: publicAdmin(req.admin) });
});

export const updateAccount = asyncHandler(async (req, res) => {
  const { username, email, name, currentPassword, newPassword } = req.body;

  const admin = await Admin.findById(req.admin._id).select('+passwordHash');
  if (!admin) throw ApiError.unauthorized();

  const wantsSensitiveChange =
    (username && username !== admin.username) ||
    (email && email !== admin.email) ||
    Boolean(newPassword);

  if (wantsSensitiveChange) {
    if (!currentPassword) {
      throw ApiError.badRequest('Enter your current password to confirm this change', [
        { field: 'currentPassword', message: 'Current password is required' },
      ]);
    }
    const matches = await admin.verifyPassword(currentPassword);
    if (!matches) {
      throw ApiError.badRequest('Current password is incorrect', [
        { field: 'currentPassword', message: 'Current password is incorrect' },
      ]);
    }
  }

  const changes = [];

  if (username && username !== admin.username) {
    const taken = await Admin.exists({ username, _id: { $ne: admin._id } });
    if (taken) throw ApiError.conflict('That username is already in use');
    admin.username = username;
    changes.push('username');
  }

  if (email && email !== admin.email) {
    const taken = await Admin.exists({ email, _id: { $ne: admin._id } });
    if (taken) throw ApiError.conflict('That email is already in use');
    admin.email = email;
    changes.push('email');
  }

  if (name !== undefined && name !== admin.name) {
    admin.name = name;
    changes.push('display name');
  }

  if (newPassword) {
    if (await admin.verifyPassword(newPassword)) {
      throw ApiError.badRequest('Choose a password different from your current one', [
        { field: 'newPassword', message: 'New password must be different' },
      ]);
    }
    admin.passwordHash = await Admin.hashPassword(newPassword);
    admin.passwordChangedAt = new Date();
    admin.mustChangePassword = false;
    changes.push('password');
  }

  await admin.save();

  // Re-issue the cookie so the current session survives the password change.
  if (newPassword) setSessionCookie(res, signSessionToken(admin));

  await logActivity(admin, newPassword ? 'password_changed' : 'account_updated', {
    targetType: 'account',
    targetId: admin._id,
    targetLabel: admin.username,
    detail: changes.length ? `Updated ${changes.join(', ')}` : 'No changes',
  });

  res.json({ admin: publicAdmin(admin), changed: changes });
});
