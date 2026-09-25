import mongoose from 'mongoose';

export const EVENT_TYPES = [
  'page_view',
  'project_view',
  'project_demo_click',
  'project_repo_click',
  'github_click',
  'linkedin_click',
  'cv_download',
  'contact_form_open',
  'contact_form_submit',
  'update_view',
  'cta_click',
  'email_click',
];

export const CONVERSION_EVENTS = [
  'contact_form_submit',
  'cv_download',
  'github_click',
  'linkedin_click',
  'project_demo_click',
  'contact_form_open',
];

const analyticsEventSchema = new mongoose.Schema(
  {
    // Random per-tab identifier from sessionStorage. Not linked to a person.
    anonymousSessionId: { type: String, required: true, index: true },
    eventType: { type: String, required: true, enum: EVENT_TYPES },
    page: { type: String, default: '/' },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', default: null },
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', default: null },
    label: { type: String, default: '' },
    deviceCategory: {
      type: String,
      enum: ['desktop', 'tablet', 'mobile', 'unknown'],
      default: 'unknown',
    },
    browserCategory: { type: String, default: 'other' },
    osCategory: { type: String, default: 'other' },
    referrerCategory: {
      type: String,
      enum: ['direct', 'search', 'social', 'developer', 'referral', 'internal'],
      default: 'direct',
    },
    region: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: false, versionKey: false },
);

analyticsEventSchema.index({ timestamp: -1 });
analyticsEventSchema.index({ eventType: 1, timestamp: -1 });
analyticsEventSchema.index({ anonymousSessionId: 1, timestamp: -1 });
analyticsEventSchema.index({ projectId: 1, timestamp: -1 });
analyticsEventSchema.index({ page: 1, timestamp: -1 });

export const AnalyticsEvent = mongoose.model('AnalyticsEvent', analyticsEventSchema);
