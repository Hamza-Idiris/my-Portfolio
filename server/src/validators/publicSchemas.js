import { z } from 'zod';
import { EVENT_TYPES } from '../models/AnalyticsEvent.js';
import { PROJECT_STATUSES } from '../models/Project.js';

const boolish = z
  .enum(['true', 'false', '1', '0'])
  .transform((value) => value === 'true' || value === '1');

export const projectQuerySchema = z.object({
  featured: boolish.optional(),
  category: z.string().trim().max(60).optional(),
  status: z.enum(PROJECT_STATUSES).optional(),
  technology: z.string().trim().max(60).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
});

export const postQuerySchema = z.object({
  category: z.string().trim().max(60).optional(),
  tag: z.string().trim().max(60).optional(),
  featured: boolish.optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
});

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name').max(120),
  email: z.string().trim().toLowerCase().email('Please enter a valid email address').max(200),
  subject: z.string().trim().max(200).optional().default(''),
  message: z
    .string()
    .trim()
    .min(10, 'Please write at least a sentence or two')
    .max(5000, 'Message is too long'),
  projectType: z.string().trim().max(80).optional().default(''),
  budget: z.string().trim().max(80).optional().default(''),
  timeline: z.string().trim().max(80).optional().default(''),
  // Honeypot: real visitors never fill this hidden field.
  website: z.string().max(0).optional().default(''),
});

export const analyticsEventSchema = z.object({
  sessionId: z.string().trim().min(4).max(64),
  eventType: z.enum(EVENT_TYPES),
  path: z.string().trim().max(300).optional().default('/'),
  referrer: z
    .enum(['direct', 'search', 'social', 'developer', 'referral', 'internal'])
    .optional()
    .default('direct'),
  screenWidth: z.coerce.number().int().min(120).max(10000).optional(),
  projectId: z.string().trim().max(40).optional(),
  postId: z.string().trim().max(40).optional(),
  meta: z.record(z.string(), z.unknown()).optional(),
});
