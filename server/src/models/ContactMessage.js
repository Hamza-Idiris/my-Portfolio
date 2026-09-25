import mongoose from 'mongoose';

export const MESSAGE_STATUSES = ['unread', 'read', 'archived'];

const contactMessageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 200 },
    subject: { type: String, trim: true, default: '', maxlength: 200 },
    message: { type: String, required: true, trim: true, maxlength: 5000 },
    projectType: { type: String, trim: true, default: '' },
    budget: { type: String, trim: true, default: '' },
    timeline: { type: String, trim: true, default: '' },
    status: { type: String, enum: MESSAGE_STATUSES, default: 'unread', index: true },
    readAt: { type: Date, default: null },
    // Coarse context only; no IP addresses or fingerprints are stored.
    source: {
      referrerCategory: { type: String, default: 'direct' },
      deviceCategory: { type: String, default: 'unknown' },
    },
    notificationSent: { type: Boolean, default: false },
  },
  { timestamps: true },
);

contactMessageSchema.index({ createdAt: -1 });
contactMessageSchema.index({ status: 1, createdAt: -1 });

export const ContactMessage = mongoose.model('ContactMessage', contactMessageSchema);
