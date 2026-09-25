import mongoose from 'mongoose';

const socialLinkSchema = new mongoose.Schema(
  {
    platform: { type: String, trim: true, required: true },
    label: { type: String, trim: true, required: true },
    url: { type: String, trim: true, required: true },
    order: { type: Number, default: 0 },
  },
  { _id: false },
);

const siteSettingsSchema = new mongoose.Schema(
  {
    // Singleton guard: only one settings document may exist.
    key: { type: String, default: 'site', unique: true, immutable: true },

    profile: {
      name: { type: String, trim: true, default: 'Hamza Idiris' },
      title: { type: String, trim: true, default: 'Full Stack Web & Mobile Developer' },
      tagline: {
        type: String,
        trim: true,
        default: 'I build practical digital products that solve real-world problems.',
      },
      shortBio: { type: String, trim: true, default: '' },
      bio: { type: String, trim: true, default: '' },
      philosophy: { type: String, trim: true, default: '' },
      whatIBuild: { type: String, trim: true, default: '' },
      currentFocus: { type: String, trim: true, default: '' },
      futureGoals: { type: String, trim: true, default: '' },
      location: { type: String, trim: true, default: '' },
      email: { type: String, trim: true, default: '' },
      avatarUrl: { type: String, trim: true, default: '' },
      avatarStorageId: { type: String, trim: true, default: '' },
      availability: { type: String, trim: true, default: 'Open to opportunities' },
      availabilityEnabled: { type: Boolean, default: true },
      currentlyBuilding: { type: String, trim: true, default: '' },
    },

    socialLinks: { type: [socialLinkSchema], default: [] },

    resume: {
      url: { type: String, trim: true, default: '' },
      fileName: { type: String, trim: true, default: '' },
      storageId: { type: String, trim: true, default: '' },
      updatedAt: { type: Date, default: null },
      summary: { type: String, trim: true, default: '' },
    },

    contact: {
      email: { type: String, trim: true, default: '' },
      responseTime: { type: String, trim: true, default: '' },
      formEnabled: { type: Boolean, default: true },
      intro: { type: String, trim: true, default: '' },
    },

    home: {
      ctaTitle: { type: String, trim: true, default: 'Have an idea, project, or opportunity?' },
      ctaDescription: { type: String, trim: true, default: "Let's build something useful." },
      whatIBuildIntro: { type: String, trim: true, default: '' },
    },

    seo: {
      defaultTitle: { type: String, trim: true, default: '' },
      defaultDescription: { type: String, trim: true, default: '' },
      ogImage: { type: String, trim: true, default: '' },
      keywords: { type: [String], default: [] },
    },

    analytics: {
      enabled: { type: Boolean, default: true },
      retentionDays: { type: Number, default: 365 },
    },
  },
  { timestamps: true },
);

siteSettingsSchema.statics.getSingleton = async function getSingleton() {
  const existing = await this.findOne({ key: 'site' });
  if (existing) return existing;
  return this.create({ key: 'site' });
};

export const SiteSettings = mongoose.model('SiteSettings', siteSettingsSchema);
