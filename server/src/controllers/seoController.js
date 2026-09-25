import { Project } from '../models/Project.js';
import { Post } from '../models/Post.js';
import { env } from '../config/env.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const STATIC_ROUTES = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/projects', priority: '0.9', changefreq: 'weekly' },
  { path: '/about', priority: '0.8', changefreq: 'monthly' },
  { path: '/updates', priority: '0.8', changefreq: 'weekly' },
  { path: '/contact', priority: '0.7', changefreq: 'monthly' },
  { path: '/resume', priority: '0.6', changefreq: 'monthly' },
];

const escapeXml = (value = '') =>
  String(value).replace(/[<>&'"]/g, (char) => `&${{ '<': 'lt', '>': 'gt', '&': 'amp', "'": 'apos', '"': 'quot' }[char]};`);

const urlEntry = ({ loc, lastmod, changefreq, priority }) =>
  `  <url>
    <loc>${escapeXml(loc)}</loc>${lastmod ? `\n    <lastmod>${new Date(lastmod).toISOString().slice(0, 10)}</lastmod>` : ''}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;

export const sitemap = asyncHandler(async (req, res) => {
  const base = env.siteUrl.replace(/\/$/, '');

  const [projects, posts] = await Promise.all([
    Project.find({ published: true }).select('slug updatedAt').lean(),
    Post.find({ published: true }).select('slug updatedAt publishedAt').lean(),
  ]);

  const entries = [
    ...STATIC_ROUTES.map((route) => ({
      loc: `${base}${route.path === '/' ? '' : route.path}` || base,
      changefreq: route.changefreq,
      priority: route.priority,
    })),
    ...projects.map((project) => ({
      loc: `${base}/projects/${project.slug}`,
      lastmod: project.updatedAt,
      changefreq: 'monthly',
      priority: '0.8',
    })),
    ...posts.map((post) => ({
      loc: `${base}/updates/${post.slug}`,
      lastmod: post.updatedAt || post.publishedAt,
      changefreq: 'monthly',
      priority: '0.7',
    })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map(urlEntry).join('\n')}
</urlset>`;

  res.type('application/xml').send(xml);
});

export const robots = (req, res) => {
  const base = env.siteUrl.replace(/\/$/, '');
  res.type('text/plain').send(
    `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/

Sitemap: ${base}/sitemap.xml
`,
  );
};
