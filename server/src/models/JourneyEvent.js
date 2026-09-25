import mongoose from 'mongoose';

const journeyEventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 140 },
    description: { type: String, trim: true, default: '', maxlength: 600 },
    // Free text rather than a Date, so entries like "2024" or "Ongoing" work.
    period: { type: String, trim: true, default: '' },
    order: { type: Number, default: 0 },
    current: { type: Boolean, default: false },
    published: { type: Boolean, default: true },
  },
  { timestamps: true },
);

journeyEventSchema.index({ published: 1, order: 1 });

export const JourneyEvent = mongoose.model('JourneyEvent', journeyEventSchema);
