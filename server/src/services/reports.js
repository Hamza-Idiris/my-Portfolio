import { ContactMessage } from '../models/ContactMessage.js';
import { getOverview } from './analytics.js';

/**
 * Report definitions. Each returns tabular rows, which the UI renders and the
 * CSV exporter serialises. Keeping one shape means a PDF exporter can be added
 * later without touching any of the queries.
 */

const percentage = (part, total) => (total ? `${((part / total) * 100).toFixed(1)}%` : '0.0%');

export const REPORT_TYPES = [
  'traffic',
  'projects',
  'content',
  'conversion',
  'technology',
  'contact',
];

async function trafficReport(window) {
  const overview = await getOverview(window);
  const totalReferrals = overview.referrers.reduce((sum, row) => sum + row.count, 0);

  return {
    title: 'Traffic report',
    summary: [
      { label: 'Page views', value: overview.totals.pageViews },
      { label: 'Unique visitors', value: overview.totals.uniqueVisitors },
      { label: 'Sessions', value: overview.totals.sessions },
      { label: 'Total events', value: overview.totals.totalEvents },
    ],
    sections: [
      {
        title: 'Most visited pages',
        columns: ['Page', 'Views', 'Share'],
        rows: overview.topPages.map((row) => [
          row.name,
          row.count,
          percentage(row.count, overview.totals.pageViews),
        ]),
      },
      {
        title: 'Traffic sources',
        columns: ['Source', 'Events', 'Share'],
        rows: overview.referrers.map((row) => [
          row.name,
          row.count,
          percentage(row.count, totalReferrals),
        ]),
      },
      {
        title: 'Devices',
        columns: ['Device', 'Events'],
        rows: overview.devices.map((row) => [row.name, row.count]),
      },
      {
        title: 'Browsers',
        columns: ['Browser', 'Events'],
        rows: overview.browsers.map((row) => [row.name, row.count]),
      },
      {
        title: 'Daily page views',
        columns: ['Date', 'Views', 'Visitors'],
        rows: overview.series.map((row) => [row.date, row.views, row.visitors]),
      },
    ],
  };
}

async function projectsReport(window) {
  const overview = await getOverview(window);
  return {
    title: 'Project performance report',
    summary: [
      { label: 'Project views', value: overview.totals.projectViews },
      { label: 'Live demo clicks', value: overview.totals.demoClicks },
      { label: 'Repository clicks', value: overview.totals.externalClicks },
    ],
    sections: [
      {
        title: 'Most viewed projects',
        columns: ['Project', 'Views', 'Share'],
        rows: overview.topProjects.map((row) => [
          row.name,
          row.count,
          percentage(row.count, overview.totals.projectViews),
        ]),
      },
    ],
  };
}

async function contentReport(window) {
  const overview = await getOverview(window);
  return {
    title: 'Content report',
    summary: [
      { label: 'Update views', value: overview.totals.updateViews },
      { label: 'Project views', value: overview.totals.projectViews },
      { label: 'Most popular project', value: overview.topProjects[0]?.name || 'No data yet' },
      { label: 'Most popular update', value: overview.topPosts[0]?.name || 'No data yet' },
    ],
    sections: [
      {
        title: 'Most read updates',
        columns: ['Update', 'Views'],
        rows: overview.topPosts.map((row) => [row.name, row.count]),
      },
      {
        title: 'Call to action clicks',
        columns: ['Call to action', 'Clicks'],
        rows: overview.ctaClicks.map((row) => [row.name || 'Unlabelled', row.count]),
      },
    ],
  };
}

async function conversionReport(window) {
  const overview = await getOverview(window);
  const { totals } = overview;

  return {
    title: 'Conversion report',
    summary: [
      { label: 'Contact submissions', value: totals.contactSubmissions },
      { label: 'CV downloads', value: totals.cvDownloads },
      { label: 'Contact page opens', value: totals.contactOpens },
      {
        label: 'Visitor to contact rate',
        value: percentage(totals.contactSubmissions, totals.uniqueVisitors),
      },
    ],
    sections: [
      {
        title: 'Conversion events',
        columns: ['Event', 'Count', 'Per unique visitor'],
        rows: [
          ['Contact form opened', totals.contactOpens, percentage(totals.contactOpens, totals.uniqueVisitors)],
          ['Contact form submitted', totals.contactSubmissions, percentage(totals.contactSubmissions, totals.uniqueVisitors)],
          ['CV downloaded', totals.cvDownloads, percentage(totals.cvDownloads, totals.uniqueVisitors)],
          ['GitHub opened', totals.githubClicks, percentage(totals.githubClicks, totals.uniqueVisitors)],
          ['LinkedIn opened', totals.linkedinClicks, percentage(totals.linkedinClicks, totals.uniqueVisitors)],
          ['Live demo opened', totals.demoClicks, percentage(totals.demoClicks, totals.uniqueVisitors)],
        ],
      },
    ],
  };
}

async function technologyReport(window) {
  const overview = await getOverview(window);
  const total = overview.totals.totalEvents;
  const share = (rows) => rows.map((row) => [row.name || 'unknown', row.count, percentage(row.count, total)]);

  return {
    title: 'Technology report',
    summary: [
      { label: 'Events measured', value: total },
      { label: 'Most common device', value: overview.devices[0]?.name || 'No data yet' },
      { label: 'Most common browser', value: overview.browsers[0]?.name || 'No data yet' },
      { label: 'Most common platform', value: overview.operatingSystems[0]?.name || 'No data yet' },
    ],
    sections: [
      { title: 'Devices', columns: ['Device', 'Events', 'Share'], rows: share(overview.devices) },
      { title: 'Browsers', columns: ['Browser', 'Events', 'Share'], rows: share(overview.browsers) },
      {
        title: 'Operating systems',
        columns: ['Platform', 'Events', 'Share'],
        rows: share(overview.operatingSystems),
      },
    ],
  };
}

async function contactReport({ start, end }) {
  const messages = await ContactMessage.find({ createdAt: { $gte: start, $lte: end } })
    .sort({ createdAt: -1 })
    .lean();

  const byStatus = messages.reduce((accumulator, message) => {
    accumulator[message.status] = (accumulator[message.status] || 0) + 1;
    return accumulator;
  }, {});

  return {
    title: 'Contact report',
    summary: [
      { label: 'Messages received', value: messages.length },
      { label: 'Unread', value: byStatus.unread || 0 },
      { label: 'Read', value: byStatus.read || 0 },
      { label: 'Archived', value: byStatus.archived || 0 },
    ],
    sections: [
      {
        title: 'Messages',
        // Message bodies are intentionally excluded from exports.
        columns: ['Received', 'Name', 'Subject', 'Project type', 'Status'],
        rows: messages.map((message) => [
          new Date(message.createdAt).toISOString().slice(0, 16).replace('T', ' '),
          message.name,
          message.subject || '—',
          message.projectType || '—',
          message.status,
        ]),
      },
    ],
  };
}

const BUILDERS = {
  traffic: trafficReport,
  projects: projectsReport,
  content: contentReport,
  conversion: conversionReport,
  technology: technologyReport,
  contact: contactReport,
};

export async function buildReport(type, window) {
  const builder = BUILDERS[type] || BUILDERS.traffic;
  const report = await builder(window);
  return {
    type,
    generatedAt: new Date().toISOString(),
    range: { start: window.start, end: window.end },
    ...report,
  };
}

const csvCell = (value) => {
  const text = value === null || value === undefined ? '' : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

export function reportToCsv(report) {
  const lines = [
    `${report.title}`,
    `Generated,${new Date(report.generatedAt).toISOString()}`,
    `Range,${new Date(report.range.start).toISOString().slice(0, 10)} to ${new Date(report.range.end)
      .toISOString()
      .slice(0, 10)}`,
    '',
    'Summary',
    'Metric,Value',
    ...report.summary.map((row) => [csvCell(row.label), csvCell(row.value)].join(',')),
  ];

  report.sections.forEach((section) => {
    lines.push('', csvCell(section.title));
    lines.push(section.columns.map(csvCell).join(','));
    if (!section.rows.length) {
      lines.push('No data for this range');
    } else {
      section.rows.forEach((row) => lines.push(row.map(csvCell).join(',')));
    }
  });

  return lines.join('\r\n');
}
