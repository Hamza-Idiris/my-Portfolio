import mongoose from 'mongoose';

export const SKILL_CATEGORIES = ['Frontend', 'Backend', 'Database', 'Mobile', 'Tools', 'Other'];

const skillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    category: { type: String, trim: true, default: 'Other' },
    description: { type: String, trim: true, default: '' },
    icon: { type: String, trim: true, default: '' },
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
    primary: { type: Boolean, default: false },
  },
  { timestamps: true },
);

skillSchema.index({ category: 1, order: 1 });
skillSchema.index({ published: 1, order: 1 });

export const Skill = mongoose.model('Skill', skillSchema);
