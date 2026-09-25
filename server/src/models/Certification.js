import mongoose from 'mongoose';

const certificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 140 },
    issuer: { type: String, required: true, trim: true, maxlength: 120 },
    issueDate: { type: String, trim: true, default: '' },
    expirationDate: { type: String, trim: true, default: '' },
    credentialId: { type: String, trim: true, default: '' },
    credentialUrl: { type: String, trim: true, default: '' },
    image: { type: String, trim: true, default: '' },
    pdfUrl: { type: String, trim: true, default: '' },
    description: { type: String, trim: true, default: '' },
    skills: [{ type: String, trim: true }],
    order: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    published: { type: Boolean, default: true },
  },
  { timestamps: true },
);

certificationSchema.index({ published: 1, order: 1, createdAt: -1 });

export const Certification = mongoose.model('Certification', certificationSchema);
