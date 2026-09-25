import mongoose from 'mongoose';

export const POST_CATEGORIES = [
  'Development',
  'Projects',
  'Learning',
  'Career',
  'Technology',
  'Lessons Learned',
];

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    excerpt: { type: String, trim: true, default: '', maxlength: 320 },
    content: { type: String, default: '' },
    coverImage: { type: String, trim: true, default: '' },
    coverImageAlt: { type: String, trim: true, default: '' },
    category: { type: String, trim: true, default: 'Development' },
    tags: { type: [String], default: [] },
    readingTime: { type: Number, default: 1 },
    author: { type: String, trim: true, default: 'Hamza Idiris' },
    published: { type: Boolean, default: false },
    featured: { type: Boolean, default: false },
    publishedAt: { type: Date, default: null },
    seoTitle: { type: String, trim: true, default: '' },
    seoDescription: { type: String, trim: true, default: '' },
  },
  { timestamps: true },
);

postSchema.index({ published: 1, publishedAt: -1 });
postSchema.index({ category: 1, published: 1 });
postSchema.index({ tags: 1 });

/** Roughly 200 words per minute, matching how the reading time is presented. */
export function estimateReadingTime(content = '') {
  const words = String(content)
    .replace(/<[^>]*>/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

postSchema.pre('save', async function setReadingTime() {
  if (this.isModified('content')) {
    this.readingTime = estimateReadingTime(this.content);
  }
  if (this.isModified('published') && this.published && !this.publishedAt) {
    this.publishedAt = new Date();
  }
});

export const Post = mongoose.model('Post', postSchema);
