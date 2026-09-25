import { SiteSettings } from '../models/SiteSettings.js';
import { ContactMessage } from '../models/ContactMessage.js';
import { AdminActivity } from '../models/AdminActivity.js';
import { Project } from '../models/Project.js';
import { Post } from '../models/Post.js';
import { AnalyticsEvent } from '../models/AnalyticsEvent.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { getOverview, getRecentActivity, resolveRange } from '../services/analytics.js';
import { buildReport, reportToCsv, REPORT_TYPES } from '../services/reports.js';
import { logActivity } from '../services/activityLog.js';

const deepMerge = (target, source) => {
  Object.entries(source || {}).forEach(([key, value]) => {
    if (value === undefined) return;
    if (value && typeof value === 'object' && !Array.isArray(value) && target[key]) {
      deepMerge(target[key], value);
    } else {
      target[key] = value;
    }
  });
  return target;
};

export const getSettings = asyncHandler(async (req, res) => {
  const settings = await SiteSettings.getSingleton();
  res.json({ settings });
});

export const updateSettings = asyncHandler(async (req, res) => {
  const settings = await SiteSettings.getSingleton();

  if (req.body.socialLinks) {
    settings.socialLinks = req.body.socialLinks.map((link, index) => ({
      ...link,
      order: link.order ?? index,
    }));
  }

  const { socialLinks, ...rest } = req.body;
  deepMerge(settings, rest);
  await settings.save();

  await logActivity(req.admin, 'settings_updated', {
    targetType: 'settings',
    detail: `Updated ${Object.keys(req.body).join(', ')}`,
  });

  res.json({ settings });
});

export const dashboardSummary = asyncHandler(async (req, res) => {
  const window = resolveRange(req.validatedQuery);

  const [overview, activity, unread, counts] = await Promise.all([
    getOverview(window),
    getRecentActivity(10),
    ContactMessage.countDocuments({ status: 'unread' }),
    Promise.all([
      Project.countDocuments(),
      Project.countDocuments({ published: true }),
      Post.countDocuments(),
      Post.countDocuments({ published: true }),
      ContactMessage.countDocuments(),
    ]),
  ]);

  const [projects, publishedProjects, posts, publishedPosts, messages] = counts;

  res.json({
    overview,
    recentActivity: activity,
    content: { projects, publishedProjects, posts, publishedPosts, messages, unread },
  });
});

export const analyticsOverview = asyncHandler(async (req, res) => {
  const window = resolveRange(req.validatedQuery);
  const overview = await getOverview(window);
  res.json({ overview });
});

export const recentActivityFeed = asyncHandler(async (req, res) => {
  const activity = await getRecentActivity(20);
  res.json({ items: activity });
});

export const getReport = asyncHandler(async (req, res) => {
  const { type } = req.params;
  if (!REPORT_TYPES.includes(type)) throw ApiError.badRequest('Unknown report type');

  const window = resolveRange(req.validatedQuery);
  const report = await buildReport(type, window);

  if (req.validatedQuery?.format === 'csv') {
    const fileName = `${type}-report-${new Date().toISOString().slice(0, 10)}.csv`;
    await logActivity(req.admin, 'report_exported', { targetType: 'report', targetLabel: type });
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    return res.send(reportToCsv(report));
  }

  return res.json({ report });
});

export const listActivity = asyncHandler(async (req, res) => {
  const { page = 1, limit = 30, search } = req.validatedQuery || {};
  const filter = {};
  if (search) {
    const pattern = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ action: pattern }, { targetLabel: pattern }, { detail: pattern }];
  }

  const [items, total] = await Promise.all([
    AdminActivity.find(filter)
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    AdminActivity.countDocuments(filter),
  ]);

  res.json({ items, total, page, limit });
});

export const listMessages = asyncHandler(async (req, res) => {
  const { status, search, page = 1, limit = 20 } = req.validatedQuery || {};
  const filter = {};
  if (status) filter.status = status;
  if (search) {
    const pattern = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ name: pattern }, { email: pattern }, { subject: pattern }, { message: pattern }];
  }

  const [items, total, counts] = await Promise.all([
    ContactMessage.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    ContactMessage.countDocuments(filter),
    ContactMessage.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
  ]);

  res.json({
    items,
    total,
    page,
    limit,
    counts: Object.fromEntries(counts.map((row) => [row._id, row.count])),
  });
});

export const updateMessageStatus = asyncHandler(async (req, res) => {
  const message = await ContactMessage.findById(req.params.id);
  if (!message) throw ApiError.notFound('Message not found');

  message.status = req.body.status;
  if (req.body.status === 'read' && !message.readAt) message.readAt = new Date();
  await message.save();

  await logActivity(req.admin, 'message_updated', {
    targetType: 'message',
    targetId: message._id,
    targetLabel: message.name,
    detail: `Marked as ${req.body.status}`,
  });

  res.json({ item: message });
});

export const deleteMessage = asyncHandler(async (req, res) => {
  const message = await ContactMessage.findByIdAndDelete(req.params.id);
  if (!message) throw ApiError.notFound('Message not found');

  await logActivity(req.admin, 'message_deleted', {
    targetType: 'message',
    targetId: message._id,
    targetLabel: message.name,
  });

  res.json({ message: 'Message deleted' });
});

/** Clears analytics older than the configured retention window. */
export const pruneAnalytics = asyncHandler(async (req, res) => {
  const settings = await SiteSettings.getSingleton();
  const days = settings.analytics?.retentionDays || 365;
  const cutoff = new Date(Date.now() - days * 86_400_000);

  const result = await AnalyticsEvent.deleteMany({ timestamp: { $lt: cutoff } });

  await logActivity(req.admin, 'analytics_pruned', {
    targetType: 'analytics',
    detail: `Removed ${result.deletedCount} events older than ${days} days`,
  });

  res.json({ removed: result.deletedCount, cutoff });
});
