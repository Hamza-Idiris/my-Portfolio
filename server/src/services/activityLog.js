import { AdminActivity } from '../models/AdminActivity.js';

/**
 * Records an administrative action. Failures are swallowed on purpose: an audit
 * write must never block the operation the admin actually asked for.
 */
export async function logActivity(admin, action, { targetType, targetId, targetLabel, detail } = {}) {
  try {
    await AdminActivity.create({
      adminId: admin?._id || null,
      adminUsername: admin?.username || '',
      action,
      targetType: targetType || '',
      targetId: targetId ? String(targetId) : '',
      targetLabel: targetLabel || '',
      detail: detail || '',
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('[activity] could not record action:', error.message);
  }
}
