import { Project } from '../models/Project.js';
import { Post } from '../models/Post.js';
import { Skill } from '../models/Skill.js';
import { Service } from '../models/Service.js';
import { JourneyEvent } from '../models/JourneyEvent.js';
import { Certification } from '../models/Certification.js';
import { SiteSettings } from '../models/SiteSettings.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const PROJECT_LIST_FIELDS =
  'title slug tagline shortDescription technologies category status featured coverImage coverImageAlt liveUrl githubUrl year order updatedAt';

const POST_LIST_FIELDS =
  'title slug excerpt coverImage coverImageAlt category tags readingTime publishedAt featured author';

export const getSettings = asyncHandler(async (req, res) => {
  const settings = await SiteSettings.getSingleton();
  const { profile, socialLinks, resume, contact, home, seo } = settings.toObject();

  // Analytics configuration and retention settings stay server-side.
  res.json({
    profile,
    socialLinks: [...socialLinks].sort((a, b) => a.order - b.order),
    resume: { url: resume.url, fileName: resume.fileName, updatedAt: resume.updatedAt, summary: resume.summary },
    contact: { email: contact.email, responseTime: contact.responseTime, formEnabled: contact.formEnabled, intro: contact.intro },
    home,
    seo,
  });
});

export const listProjects = asyncHandler(async (req, res) => {
  const { featured, category, status, technology, limit } = req.validatedQuery || {};

  const filter = { published: true };
  if (featured !== undefined) filter.featured = featured;
  if (category) filter.category = category;
  if (status) filter.status = status;
  if (technology) filter.technologies = technology;

  const query = Project.find(filter)
    .select(PROJECT_LIST_FIELDS)
    .sort({ featured: -1, order: 1, createdAt: -1 })
    .lean();

  if (limit) query.limit(limit);

  const [items, categories, technologies] = await Promise.all([
    query,
    Project.distinct('category', { published: true }),
    Project.distinct('technologies', { published: true }),
  ]);

  res.json({
    items,
    facets: {
      categories: categories.filter(Boolean).sort(),
      technologies: technologies.filter(Boolean).sort(),
    },
  });
});

export const getProject = asyncHandler(async (req, res) => {
  const project = await Project.findOne({ slug: req.params.slug, published: true }).lean();
  if (!project) throw ApiError.notFound('That project does not exist or is not published yet');

  const [related, ordered] = await Promise.all([
    Project.find({
      published: true,
      _id: { $ne: project._id },
      $or: [{ category: project.category }, { technologies: { $in: project.technologies } }],
    })
      .select(PROJECT_LIST_FIELDS)
      .sort({ featured: -1, order: 1 })
      .limit(3)
      .lean(),
    Project.find({ published: true }).select('title slug').sort({ featured: -1, order: 1, createdAt: -1 }).lean(),
  ]);

  const index = ordered.findIndex((entry) => String(entry._id) === String(project._id));
  const next = index >= 0 ? ordered[(index + 1) % ordered.length] : null;

  res.json({
    project,
    related,
    next: next && String(next._id) !== String(project._id) ? next : null,
  });
});

export const listPosts = asyncHandler(async (req, res) => {
  const { category, tag, limit, featured } = req.validatedQuery || {};

  const filter = { published: true };
  if (category) filter.category = category;
  if (tag) filter.tags = tag;
  if (featured !== undefined) filter.featured = featured;

  const query = Post.find(filter).select(POST_LIST_FIELDS).sort({ publishedAt: -1, createdAt: -1 }).lean();
  if (limit) query.limit(limit);

  const [items, categories, tags] = await Promise.all([
    query,
    Post.distinct('category', { published: true }),
    Post.distinct('tags', { published: true }),
  ]);

  res.json({
    items,
    facets: { categories: categories.filter(Boolean).sort(), tags: tags.filter(Boolean).sort() },
  });
});

export const getPost = asyncHandler(async (req, res) => {
  const post = await Post.findOne({ slug: req.params.slug, published: true }).lean();
  if (!post) throw ApiError.notFound('That update does not exist or has not been published yet');

  const related = await Post.find({
    published: true,
    _id: { $ne: post._id },
    $or: [{ category: post.category }, { tags: { $in: post.tags } }],
  })
    .select(POST_LIST_FIELDS)
    .sort({ publishedAt: -1 })
    .limit(3)
    .lean();

  res.json({ post, related });
});

export const listSkills = asyncHandler(async (req, res) => {
  const skills = await Skill.find({ published: true }).sort({ order: 1, name: 1 }).lean();

  const grouped = skills.reduce((accumulator, skill) => {
    const key = skill.category || 'Other';
    accumulator[key] = accumulator[key] || [];
    accumulator[key].push(skill);
    return accumulator;
  }, {});

  res.json({ items: skills, grouped });
});

export const listServices = asyncHandler(async (req, res) => {
  const items = await Service.find({ published: true }).sort({ order: 1 }).lean();
  res.json({ items });
});

export const listJourney = asyncHandler(async (req, res) => {
  const items = await JourneyEvent.find({ published: true }).sort({ order: 1 }).lean();
  res.json({ items });
});

export const listCertifications = asyncHandler(async (req, res) => {
  const items = await Certification.find({ published: true }).sort({ order: 1, createdAt: -1 }).lean();
  res.json({ items });
});

/** Single request that fills the homepage, avoiding a waterfall of round trips. */
export const getHomeData = asyncHandler(async (req, res) => {
  const [settings, projects, posts, skills, services, journey, certifications] = await Promise.all([
    SiteSettings.getSingleton(),
    Project.find({ published: true, featured: true })
      .select(PROJECT_LIST_FIELDS)
      .sort({ order: 1, createdAt: -1 })
      .limit(3)
      .lean(),
    Post.find({ published: true })
      .select(POST_LIST_FIELDS)
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(3)
      .lean(),
    Skill.find({ published: true }).sort({ order: 1, name: 1 }).lean(),
    Service.find({ published: true }).sort({ order: 1 }).limit(6).lean(),
    JourneyEvent.find({ published: true }).sort({ order: 1 }).lean(),
    Certification.find({ published: true }).sort({ order: 1, createdAt: -1 }).lean(),
  ]);

  let featuredProjects = projects;
  if (!featuredProjects.length) {
    featuredProjects = await Project.find({ published: true })
      .select(PROJECT_LIST_FIELDS)
      .sort({ order: 1, createdAt: -1 })
      .limit(3)
      .lean();
  }

  const { profile, socialLinks, resume, contact, home, seo } = settings.toObject();

  res.json({
    settings: {
      profile,
      socialLinks: [...socialLinks].sort((a, b) => a.order - b.order),
      resume: { url: resume.url, fileName: resume.fileName, updatedAt: resume.updatedAt, summary: resume.summary },
      contact: { email: contact.email, responseTime: contact.responseTime, formEnabled: contact.formEnabled, intro: contact.intro },
      home,
      seo,
    },
    projects: featuredProjects,
    posts,
    skills,
    services,
    journey,
    certifications,
  });
});
