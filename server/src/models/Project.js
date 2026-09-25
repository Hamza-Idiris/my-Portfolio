import mongoose from 'mongoose';

export const PROJECT_STATUSES = ['completed', 'in-progress', 'planned', 'archived'];

const screenshotSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, trim: true },
    alt: { type: String, trim: true, default: '' },
    caption: { type: String, trim: true, default: '' },
    storageId: { type: String, trim: true, default: '' },
  },
  { _id: false },
);

const linkedRepoSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: '' },
    description: { type: String, trim: true, default: '' },
    language: { type: String, trim: true, default: '' },
    url: { type: String, trim: true, default: '' },
    stars: { type: Number, default: null },
    lastUpdated: { type: Date, default: null },
  },
  { _id: false },
);

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    tagline: { type: String, trim: true, default: '', maxlength: 160 },
    shortDescription: { type: String, trim: true, default: '', maxlength: 400 },
    fullDescription: { type: String, trim: true, default: '' },

    problem: { type: String, trim: true, default: '' },
    solution: { type: String, trim: true, default: '' },
    architecture: { type: String, trim: true, default: '' },
    process: { type: String, trim: true, default: '' },
    outcome: { type: String, trim: true, default: '' },

    features: { type: [String], default: [] },
    challenges: { type: [String], default: [] },
    lessonsLearned: { type: [String], default: [] },
    technologies: { type: [String], default: [] },
    users: { type: [String], default: [] },

    category: { type: String, trim: true, default: 'Web' },
    status: { type: String, enum: PROJECT_STATUSES, default: 'completed' },

    coverImage: { type: String, trim: true, default: '' },
    coverImageAlt: { type: String, trim: true, default: '' },
    screenshots: { type: [screenshotSchema], default: [] },
    videoUrl: { type: String, trim: true, default: '' },

    githubUrl: { type: String, trim: true, default: '' },
    liveUrl: { type: String, trim: true, default: '' },
    repository: { type: linkedRepoSchema, default: () => ({}) },

    featured: { type: Boolean, default: false },
    published: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    year: { type: String, trim: true, default: '' },

    seoTitle: { type: String, trim: true, default: '' },
    seoDescription: { type: String, trim: true, default: '' },
  },
  { timestamps: true },
);

projectSchema.index({ published: 1, order: 1 });
projectSchema.index({ published: 1, featured: -1, order: 1 });
projectSchema.index({ title: 'text', shortDescription: 'text', technologies: 'text' });

export const Project = mongoose.model('Project', projectSchema);
