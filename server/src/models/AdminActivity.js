import mongoose from 'mongoose';

const adminActivitySchema = new mongoose.Schema(
  {
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
    adminUsername: { type: String, default: '' },
    action: { type: String, required: true },
    targetType: { type: String, default: '' },
    targetId: { type: String, default: '' },
    targetLabel: { type: String, default: '' },
    // Human readable summary only. Credentials are never recorded here.
    detail: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now },
  },
  { versionKey: false },
);

adminActivitySchema.index({ timestamp: -1 });
adminActivitySchema.index({ action: 1, timestamp: -1 });

export const AdminActivity = mongoose.model('AdminActivity', adminActivitySchema);
