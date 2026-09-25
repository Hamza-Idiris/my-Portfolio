import { z } from 'zod';
import { PROJECT_STATUSES } from '../models/Project.js';
import { MESSAGE_STATUSES } from '../models/ContactMessage.js';

const trimmed = (max) => z.string().trim().max(max);
const optionalText = (max) => trimmed(max).optional();
const stringArray = (max = 80) => z.array(z.string().trim().min(1).max(max)).optional();
const urlOrEmpty = z
  .union([z.string().trim().url('Enter a valid URL'), z.literal('')])
  .optional();

export const passwordSchema = z
  .string()
  .min(10, 'Use at least 10 characters')
  .max(128)
  .refine((value) => /[a-z]/.test(value) && /[A-Z]/.test(value) && /[0-9]/.test(value), {
    message: 'Include an uppercase letter, a lowercase letter and a number',
  });

export const loginSchema = z.object({
  identifier: z.string().trim().min(3, 'Enter your username or email').max(200),
  password: z.string().min(1, 'Enter your password').max(128),
});

export const accountSchema = z
  .object({
    username: z
      .string()
      .trim()
      .toLowerCase()
      .min(3)
      .max(32)
      .regex(/^[a-z0-9._-]+$/, 'Use letters, numbers, dots, dashes or underscores')
      .optional(),
    email: z.string().trim().toLowerCase().email('Enter a valid email').optional(),
    name: optionalText(120),
    currentPassword: z.string().max(128).optional(),
    newPassword: passwordSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: 'Nothing to update' });

export const projectSchema = z.object({
  title: trimmed(120).min(2, 'Give the project a title'),
  slug: optionalText(90),
  tagline: optionalText(160),
  shortDescription: optionalText(400),
  fullDescription: optionalText(8000),
  problem: optionalText(4000),
  solution: optionalText(4000),
  architecture: optionalText(4000),
  process: optionalText(4000),
  outcome: optionalText(4000),
  features: stringArray(200),
  challenges: stringArray(400),
  lessonsLearned: stringArray(400),
  technologies: stringArray(60),
  users: stringArray(120),
  category: optionalText(60),
  status: z.enum(PROJECT_STATUSES).optional(),
  coverImage: optionalText(500),
  coverImageAlt: optionalText(200),
  screenshots: z
    .array(
      z.object({
        url: trimmed(500).min(1),
        alt: optionalText(200),
        caption: optionalText(300),
        storageId: optionalText(200),
      }),
    )
    .optional(),
  videoUrl: urlOrEmpty,
  githubUrl: urlOrEmpty,
  liveUrl: urlOrEmpty,
  repository: z
    .object({
      name: optionalText(140),
      description: optionalText(400),
      language: optionalText(60),
      url: urlOrEmpty,
      stars: z.number().int().nullable().optional(),
      lastUpdated: z.union([z.string(), z.null()]).optional(),
    })
    .optional(),
  featured: z.boolean().optional(),
  published: z.boolean().optional(),
  order: z.number().int().optional(),
  year: optionalText(20),
  seoTitle: optionalText(120),
  seoDescription: optionalText(300),
});

export const postSchema = z.object({
  title: trimmed(160).min(2, 'Give the update a title'),
  slug: optionalText(90),
  excerpt: optionalText(320),
  content: z.string().max(60000).optional(),
  coverImage: optionalText(500),
  coverImageAlt: optionalText(200),
  category: optionalText(60),
  tags: stringArray(40),
  published: z.boolean().optional(),
  featured: z.boolean().optional(),
  publishedAt: z.union([z.string(), z.null()]).optional(),
  seoTitle: optionalText(160),
  seoDescription: optionalText(300),
});

export const skillSchema = z.object({
  name: trimmed(60).min(1, 'Name the technology'),
  category: optionalText(40),
  description: optionalText(300),
  icon: optionalText(60),
  order: z.number().int().optional(),
  published: z.boolean().optional(),
  primary: z.boolean().optional(),
});

export const serviceSchema = z.object({
  title: trimmed(100).min(2, 'Name the service'),
  description: optionalText(400),
  detailedDescription: optionalText(3000),
  icon: optionalText(60),
  order: z.number().int().optional(),
  published: z.boolean().optional(),
});

export const journeySchema = z.object({
  title: trimmed(140).min(2, 'Describe the milestone'),
  description: optionalText(600),
  period: optionalText(60),
  order: z.number().int().optional(),
  current: z.boolean().optional(),
  published: z.boolean().optional(),
});

export const certificationSchema = z.object({
  title: trimmed(140).min(2, 'Name the certification'),
  issuer: trimmed(120).min(2, 'Name the issuer'),
  issueDate: optionalText(60),
  expirationDate: optionalText(60),
  credentialId: optionalText(100),
  credentialUrl: urlOrEmpty,
  image: optionalText(500),
  pdfUrl: urlOrEmpty,
  description: optionalText(1200),
  skills: stringArray(60),
  order: z.number().int().optional(),
  featured: z.boolean().optional(),
  published: z.boolean().optional(),
});

export const reorderSchema = z.object({
  items: z.array(z.object({ id: z.string().min(1), order: z.number().int() })).min(1),
});

export const messageStatusSchema = z.object({
  status: z.enum(MESSAGE_STATUSES),
});

export const settingsSchema = z.object({
  profile: z
    .object({
      name: optionalText(120),
      title: optionalText(160),
      tagline: optionalText(240),
      shortBio: optionalText(600),
      bio: optionalText(6000),
      philosophy: optionalText(3000),
      whatIBuild: optionalText(3000),
      currentFocus: optionalText(1000),
      futureGoals: optionalText(2000),
      location: optionalText(120),
      email: z.union([z.string().trim().email(), z.literal('')]).optional(),
      avatarUrl: optionalText(500),
      avatarStorageId: optionalText(200),
      availability: optionalText(80),
      availabilityEnabled: z.boolean().optional(),
      currentlyBuilding: optionalText(400),
    })
    .optional(),
  socialLinks: z
    .array(
      z.object({
        platform: trimmed(40).min(1),
        label: trimmed(60).min(1),
        url: z.string().trim().url('Enter a valid URL'),
        order: z.number().int().optional(),
      }),
    )
    .optional(),
  resume: z
    .object({
      url: optionalText(500),
      fileName: optionalText(200),
      storageId: optionalText(200),
      summary: optionalText(1000),
    })
    .optional(),
  contact: z
    .object({
      email: z.union([z.string().trim().email(), z.literal('')]).optional(),
      responseTime: optionalText(200),
      formEnabled: z.boolean().optional(),
      intro: optionalText(600),
    })
    .optional(),
  home: z
    .object({
      ctaTitle: optionalText(200),
      ctaDescription: optionalText(300),
      whatIBuildIntro: optionalText(600),
    })
    .optional(),
  seo: z
    .object({
      defaultTitle: optionalText(160),
      defaultDescription: optionalText(320),
      ogImage: optionalText(500),
      keywords: stringArray(60),
    })
    .optional(),
  analytics: z
    .object({
      enabled: z.boolean().optional(),
      retentionDays: z.number().int().min(30).max(3650).optional(),
    })
    .optional(),
});

export const rangeSchema = z.object({
  range: z.enum(['today', '7d', '30d', '90d', 'year', 'custom']).optional().default('30d'),
  from: z.string().optional(),
  to: z.string().optional(),
});

export const listQuerySchema = z.object({
  search: optionalText(120),
  status: optionalText(40),
  category: optionalText(60),
  published: z.enum(['true', 'false']).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});
