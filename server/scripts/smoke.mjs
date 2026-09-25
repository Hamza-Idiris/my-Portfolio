/**
 * End-to-end smoke test for the local API. Exercises the public routes, the
 * contact and analytics write paths, admin auth, CRUD, reports and CSV export
 * against a running dev server, then cleans up everything it created.
 *
 * Usage: node scripts/smoke.mjs <admin-password> [base-url]
 */

const BASE = process.argv[3] || 'http://127.0.0.1:5050';
const PASSWORD = process.argv[2];

if (!PASSWORD) {
  console.error('Usage: node scripts/smoke.mjs <admin-password> [base-url]');
  process.exit(1);
}

let cookie = '';
const results = [];

async function call(method, path, body, opts = {}) {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      ...(body ? { 'content-type': 'application/json' } : {}),
      ...(cookie ? { cookie } : {}),
      origin: 'http://localhost:5180',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const setCookie = res.headers.getSetCookie?.() || [];
  if (setCookie.length && !opts.ignoreCookie) {
    cookie = setCookie.map((c) => c.split(';')[0]).join('; ');
  }
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  return { status: res.status, data, headers: res.headers };
}

function check(name, ok, extra = '') {
  results.push({ name, ok, extra });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? '  -> ' + extra : ''}`);
}

let r = await call('GET', '/api/home');
check('public home', r.status === 200 && r.data.projects?.length === 3, `projects=${r.data.projects?.length}`);

r = await call('GET', '/api/projects?technology=React');
check('project filter by tech', r.status === 200 && r.data.items.length > 0, `items=${r.data.items?.length}`);

r = await call('GET', '/api/projects/qahwa-shop');
check('project detail', r.status === 200 && !!r.data.project?.title, r.data.project?.title);

r = await call('GET', '/api/projects/does-not-exist');
check('unknown project -> 404', r.status === 404);

r = await call('GET', '/api/robots.txt');
check('robots.txt', r.status === 200 && String(r.data).includes('Sitemap:'));

r = await call('GET', '/api/sitemap.xml');
check('sitemap.xml lists projects', r.status === 200 && String(r.data).includes('/projects/qahwa-shop'));

r = await call('POST', '/api/contact', {
  name: 'Smoke Test',
  email: 'smoke@example.com',
  subject: 'Automated verification',
  message: 'This message was created by the end-to-end verification script.',
});
check('contact submit', r.status === 201 || r.status === 200, JSON.stringify(r.data).slice(0, 120));

r = await call('POST', '/api/contact', { name: 'x', email: 'nope', message: 'short' });
check('contact validation rejects bad input', r.status === 400);

const sessionId = 'smoke-' + Date.now();
let analyticsOk = true;
for (const ev of [
  { eventType: 'page_view', path: '/' },
  { eventType: 'page_view', path: '/projects/qahwa-shop' },
  { eventType: 'project_view', path: '/projects/qahwa-shop' },
  { eventType: 'cv_download', path: '/resume' },
  { eventType: 'github_click', path: '/' },
  { eventType: 'contact_form_submit', path: '/contact' },
]) {
  r = await call(
    'POST',
    '/api/analytics/event',
    { ...ev, sessionId, referrer: 'search', screenWidth: 1440 },
    { ignoreCookie: true },
  );
  if (r.status >= 300) {
    analyticsOk = false;
    console.log('   event rejected:', ev.eventType, r.status, JSON.stringify(r.data).slice(0, 200));
  }
}
check('analytics ingestion accepted', analyticsOk);

r = await call('POST', '/api/admin/auth/login', { identifier: 'hamza', password: 'wrong-password-xyz' });
check('login rejects bad password', r.status === 401, String(r.status));

r = await call('POST', '/api/admin/auth/login', { identifier: 'hamza', password: PASSWORD });
check('login sets session cookie', r.status === 200 && cookie.includes('hi_session'), cookie ? 'cookie set' : 'no cookie');

r = await call('GET', '/api/admin/auth/me');
check('session /me', r.status === 200 && !!r.data.admin?.username, r.data.admin?.username);

r = await call('POST', '/api/admin/projects', {
  title: 'Smoke Test Project',
  shortDescription: 'Temporary project created by the verification script.',
  fullDescription: 'Temporary project created by the verification script.',
  technologies: ['React'],
  published: false,
});
const projectId = r.data.item?._id || r.data._id || r.data.project?._id;
check('create project', r.status === 201 && !!projectId, JSON.stringify(r.data).slice(0, 160));

r = await call('PATCH', `/api/admin/projects/${projectId}`, { featured: true, published: true });
check('update project', r.status === 200);

r = await call('GET', '/api/projects');
check('published project appears publicly', r.data.items.some((p) => p.title === 'Smoke Test Project'));

r = await call('POST', '/api/admin/projects/reorder', { items: [{ id: projectId, order: 0 }] });
check('reorder projects', r.status === 200 || r.status === 204, String(r.status));

r = await call('DELETE', `/api/admin/projects/${projectId}`);
check('delete project', r.status === 200 || r.status === 204);

r = await call('GET', '/api/projects');
check('deleted project gone from public API', !r.data.items.some((p) => p.title === 'Smoke Test Project'));

r = await call('POST', '/api/admin/updates', {
  title: 'Smoke Test Update',
  excerpt: 'Temporary post created by the verification script.',
  content: '## Heading\n\nSome body copy for the reading-time calculation. '.repeat(20),
  category: 'Engineering',
  tags: ['testing'],
  published: true,
});
const postId = r.data.item?._id || r.data._id;
check('create update', r.status === 201 && !!postId, JSON.stringify(r.data).slice(0, 160));

r = await call('GET', '/api/posts');
check('update appears publicly', r.data.items?.length > 0, `items=${r.data.items?.length}`);

const postSlug = r.data.items?.[0]?.slug;
r = await call('GET', `/api/posts/${postSlug}`);
check('update detail + reading time', r.status === 200 && !!r.data.post?.readingTime, `readingTime=${r.data.post?.readingTime}`);

r = await call('DELETE', `/api/admin/updates/${postId}`);
check('delete update', r.status === 200 || r.status === 204);

r = await call('GET', '/api/admin/dashboard?range=30d');
check('dashboard summary', r.status === 200, Object.keys(r.data || {}).join(','));

r = await call('GET', '/api/admin/analytics?range=30d');
check('analytics aggregation returns data', r.status === 200 && JSON.stringify(r.data).includes('qahwa-shop'));

r = await call('GET', '/api/admin/analytics/activity');
check('recent activity feed', r.status === 200);

r = await call('GET', '/api/admin/messages');
check('messages inbox has smoke message', r.status === 200 && r.data.items?.some((m) => m.email === 'smoke@example.com'));

const messageId = r.data.items?.find((m) => m.email === 'smoke@example.com')?._id;
r = await call('PATCH', `/api/admin/messages/${messageId}`, { status: 'read' });
check('mark message read', r.status === 200);
r = await call('DELETE', `/api/admin/messages/${messageId}`);
check('delete message', r.status === 200 || r.status === 204);

r = await call('GET', '/api/admin/activity');
check('admin activity log recorded changes', r.status === 200 && r.data.items?.length > 0, `entries=${r.data.items?.length}`);

let reportsOk = true;
for (const type of ['traffic', 'projects', 'content', 'conversion', 'technology']) {
  r = await call('GET', `/api/admin/reports/${type}?range=30d`);
  if (r.status !== 200) {
    reportsOk = false;
    console.log('   report failed:', type, r.status, JSON.stringify(r.data).slice(0, 160));
  }
}
check('all reports return json', reportsOk);

r = await call('GET', '/api/admin/reports/traffic?range=30d&format=csv');
check('csv export', r.status === 200 && String(r.data).includes(','), r.headers.get('content-type'));

const saved = cookie;
cookie = '';
r = await call('GET', '/api/admin/dashboard');
check('admin route rejects anonymous', r.status === 401, String(r.status));
cookie = saved;

r = await call('POST', '/api/admin/auth/logout');
check('logout', r.status === 200 || r.status === 204);

// The events above are synthetic, so remove them rather than let them skew the
// dashboard, which is only ever meant to show real visitor activity.
const { connectDatabase, disconnectDatabase } = await import('../src/config/database.js');
const { AnalyticsEvent } = await import('../src/models/AnalyticsEvent.js');
await connectDatabase();
const removed = await AnalyticsEvent.deleteMany({ anonymousSessionId: sessionId });
await disconnectDatabase();
console.log(`\nCleaned up ${removed.deletedCount} synthetic analytics events.`);

const failed = results.filter((x) => !x.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
if (failed.length) {
  console.log('FAILURES:');
  failed.forEach((f) => console.log(' - ' + f.name + ' ' + f.extra));
  process.exit(1);
}
