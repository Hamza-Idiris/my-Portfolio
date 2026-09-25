import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, trim: true, default: '', maxlength: 400 },
    detailedDescription: { type: String, trim: true, default: '' },
    // Name of a lucide-react icon, resolved on the client.
    icon: { type: String, trim: true, default: 'Code2' },
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
  },
  { timestamps: true },
);

serviceSchema.index({ published: 1, order: 1 });

export const Service = mongoose.model('Service', serviceSchema);
