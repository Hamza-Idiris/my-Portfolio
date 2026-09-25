import { AnalyticsEvent, CONVERSION_EVENTS } from '../models/AnalyticsEvent.js';
import { ContactMessage } from '../models/ContactMessage.js';
import { Project } from '../models/Project.js';
import { Post } from '../models/Post.js';

/** Resolves a named range (or explicit dates) into a concrete window. */
export function resolveRange({ range = '30d', from, to } = {}) {
  const end = to ? new Date(to) : new Date();
  end.setHours(23, 59, 59, 999);

  let start;
  if (range === 'custom' && from) {
    start = new Date(from);
  } else {
    start = new Date(end);
    const days = { today: 0, '7d': 6, '30d': 29, '90d': 89 }[range];
    if (range === 'year') {
      start = new Date(end.getFullYear(), 0, 1);
    } else {
      start.setDate(start.getDate() - (days ?? 29));
    }
  }
  start.setHours(0, 0, 0, 0);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    const fallbackEnd = new Date();
    const fallbackStart = new Date();
    fallbackStart.setDate(fallbackStart.getDate() - 29);
    return { start: fallbackStart, end: fallbackEnd, range: '30d' };
  }

  return { start, end, range };
}

/** Day buckets vs month buckets, chosen by window length. */
const bucketFormat = (start, end) => {
  const days = Math.ceil((end - start) / 86_400_000);
  return days > 120 ? '%Y-%m' : '%Y-%m-%d';
};

const fillSeries = (rows, start, end, format) => {
  const byKey = new Map(rows.map((row) => [row._id, row]));
  const series = [];
  const cursor = new Date(start);

  if (format === '%Y-%m') {
    cursor.setDate(1);
    while (cursor <= end) {
      const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`;
      const row = byKey.get(key);
      series.push({ date: key, views: row?.views || 0, visitors: row?.visitors?.length || 0 });
      cursor.setMonth(cursor.getMonth() + 1);
    }
    return series;
  }

  while (cursor <= end) {
    const key = cursor.toISOString().slice(0, 10);
    const row = byKey.get(key);
    series.push({ date: key, views: row?.views || 0, visitors: row?.visitors?.length || 0 });
    cursor.setDate(cursor.getDate() + 1);
  }
  return series;
};

const countBy = (field) => [
  { $group: { _id: `$${field}`, count: { $sum: 1 } } },
  { $sort: { count: -1 } },
  { $project: { _id: 0, name: '$_id', count: 1 } },
];

export async function getOverview(window) {
  const { start, end } = window;
  const match = { timestamp: { $gte: start, $lte: end } };
  const format = bucketFormat(start, end);

  const [facets] = await AnalyticsEvent.aggregate([
    { $match: match },
    {
      $facet: {
        totals: [
          {
            $group: {
              _id: null,
              events: { $sum: 1 },
              sessions: { $addToSet: '$anonymousSessionId' },
            },
          },
        ],
        // Unique visitors are counted from page views only, so server-side
        // events cannot inflate the number.
        visitors: [
          { $match: { eventType: 'page_view' } },
          { $group: { _id: null, sessions: { $addToSet: '$anonymousSessionId' } } },
        ],
        byType: countBy('eventType'),
        series: [
          { $match: { eventType: 'page_view' } },
          {
            $group: {
              _id: { $dateToString: { format, date: '$timestamp' } },
              views: { $sum: 1 },
              visitors: { $addToSet: '$anonymousSessionId' },
            },
          },
          { $sort: { _id: 1 } },
        ],
        topPages: [
          { $match: { eventType: 'page_view' } },
          { $group: { _id: '$page', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 8 },
          { $project: { _id: 0, name: '$_id', count: 1 } },
        ],
        devices: countBy('deviceCategory'),
        browsers: countBy('browserCategory'),
        operatingSystems: countBy('osCategory'),
        referrers: countBy('referrerCategory'),
        topProjects: [
          { $match: { eventType: 'project_view', projectId: { $ne: null } } },
          { $group: { _id: '$projectId', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 6 },
        ],
        topPosts: [
          { $match: { eventType: 'update_view', postId: { $ne: null } } },
          { $group: { _id: '$postId', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 6 },
        ],
        ctaClicks: [
          { $match: { eventType: 'cta_click' } },
          { $group: { _id: '$label', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 8 },
          { $project: { _id: 0, name: '$_id', count: 1 } },
        ],
      },
    },
  ]);

  const eventCounts = Object.fromEntries((facets.byType || []).map((row) => [row.name, row.count]));

  const [projects, posts, messageCount] = await Promise.all([
    Project.find({ _id: { $in: (facets.topProjects || []).map((row) => row._id) } })
      .select('title slug')
      .lean(),
    Post.find({ _id: { $in: (facets.topPosts || []).map((row) => row._id) } })
      .select('title slug')
      .lean(),
    ContactMessage.countDocuments({ createdAt: { $gte: start, $lte: end } }),
  ]);

  const nameById = (docs, field) =>
    new Map(docs.map((doc) => [String(doc._id), { name: doc[field], slug: doc.slug }]));

  const projectNames = nameById(projects, 'title');
  const postNames = nameById(posts, 'title');

  return {
    range: { start, end },
    totals: {
      pageViews: eventCounts.page_view || 0,
      uniqueVisitors: facets.visitors?.[0]?.sessions?.length || 0,
      sessions: facets.totals?.[0]?.sessions?.length || 0,
      projectViews: eventCounts.project_view || 0,
      updateViews: eventCounts.update_view || 0,
      cvDownloads: eventCounts.cv_download || 0,
      githubClicks: eventCounts.github_click || 0,
      linkedinClicks: eventCounts.linkedin_click || 0,
      demoClicks: eventCounts.project_demo_click || 0,
      contactOpens: eventCounts.contact_form_open || 0,
      contactSubmissions: eventCounts.contact_form_submit || 0,
      externalClicks:
        (eventCounts.github_click || 0) +
        (eventCounts.linkedin_click || 0) +
        (eventCounts.project_demo_click || 0) +
        (eventCounts.project_repo_click || 0),
      messages: messageCount,
      totalEvents: facets.totals?.[0]?.events || 0,
    },
    series: fillSeries(facets.series || [], start, end, format),
    topPages: facets.topPages || [],
    topProjects: (facets.topProjects || []).map((row) => ({
      id: String(row._id),
      name: projectNames.get(String(row._id))?.name || 'Removed project',
      slug: projectNames.get(String(row._id))?.slug || '',
      count: row.count,
    })),
    topPosts: (facets.topPosts || []).map((row) => ({
      id: String(row._id),
      name: postNames.get(String(row._id))?.name || 'Removed update',
      slug: postNames.get(String(row._id))?.slug || '',
      count: row.count,
    })),
    devices: facets.devices || [],
    browsers: facets.browsers || [],
    operatingSystems: facets.operatingSystems || [],
    referrers: facets.referrers || [],
    ctaClicks: facets.ctaClicks || [],
    conversions: CONVERSION_EVENTS.map((eventType) => ({
      name: eventType,
      count: eventCounts[eventType] || 0,
    })),
  };
}

const ACTIVITY_LABELS = {
  page_view: (event) => `viewed ${event.page}`,
  project_view: (event, names) => `viewed ${names.projects.get(String(event.projectId)) || 'a project'}`,
  project_demo_click: (event, names) =>
    `opened the live demo for ${names.projects.get(String(event.projectId)) || 'a project'}`,
  project_repo_click: (event, names) =>
    `opened the repository for ${names.projects.get(String(event.projectId)) || 'a project'}`,
  update_view: (event, names) => `read ${names.posts.get(String(event.postId)) || 'an update'}`,
  cv_download: () => 'downloaded the CV',
  github_click: () => 'opened GitHub',
  linkedin_click: () => 'opened LinkedIn',
  email_click: () => 'clicked the email link',
  contact_form_open: () => 'opened the contact page',
  contact_form_submit: () => 'sent a contact message',
  cta_click: (event) => `clicked ${event.label || 'a call to action'}`,
};

/** Recent events described in plain language, always as "Anonymous visitor". */
export async function getRecentActivity(limit = 12) {
  const events = await AnalyticsEvent.find()
    .sort({ timestamp: -1 })
    .limit(limit)
    .select('eventType page projectId postId label timestamp deviceCategory')
    .lean();

  const projectIds = events.map((event) => event.projectId).filter(Boolean);
  const postIds = events.map((event) => event.postId).filter(Boolean);

  const [projects, posts] = await Promise.all([
    Project.find({ _id: { $in: projectIds } }).select('title').lean(),
    Post.find({ _id: { $in: postIds } }).select('title').lean(),
  ]);

  const names = {
    projects: new Map(projects.map((doc) => [String(doc._id), doc.title])),
    posts: new Map(posts.map((doc) => [String(doc._id), doc.title])),
  };

  return events.map((event) => ({
    id: String(event._id),
    eventType: event.eventType,
    description: (ACTIVITY_LABELS[event.eventType] || (() => 'interacted with the site'))(
      event,
      names,
    ),
    device: event.deviceCategory,
    timestamp: event.timestamp,
  }));
}
