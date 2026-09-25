const SITE_URL = (import.meta.env.VITE_SITE_URL || window.location.origin).replace(/\/$/, '');

const DEFAULTS = {
  siteName: 'Hamza Idiris',
  title: 'Hamza Idiris — Full Stack Web & Mobile Developer',
  description:
    'Hamza Idiris builds practical digital products that solve real-world problems, using the MERN stack and Flutter.',
  image: '/og-image.svg',
  type: 'website',
};

const setMeta = (selector, attribute, key, content) => {
  if (!content) return;
  let tag = document.head.querySelector(selector);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attribute, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
};

const setLink = (rel, href) => {
  if (!href) return;
  let tag = document.head.querySelector(`link[rel="${rel}"]`);
  if (!tag) {
    tag = document.createElement('link');
    tag.setAttribute('rel', rel);
    document.head.appendChild(tag);
  }
  tag.setAttribute('href', href);
};

export const absoluteUrl = (path = '/') =>
  path.startsWith('http') ? path : `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;

export const siteUrl = SITE_URL;

/**
 * Imperatively syncs document metadata. React 19 hoists <title>/<meta> rendered
 * in components, but doing it here keeps a single source of truth including
 * canonical URLs, Open Graph, Twitter cards and JSON-LD.
 */
export function applySeo({
  title,
  description,
  path,
  image,
  type = DEFAULTS.type,
  noIndex = false,
  publishedTime,
  tags,
  structuredData,
} = {}) {
  const fullTitle = title
    ? title.includes('Hamza Idiris')
      ? title
      : `${title} — Hamza Idiris`
    : DEFAULTS.title;
  const desc = description || DEFAULTS.description;
  const canonical = absoluteUrl(path || window.location.pathname);
  const ogImage = absoluteUrl(image || DEFAULTS.image);

  document.title = fullTitle;

  setMeta('meta[name="description"]', 'name', 'description', desc);
  setMeta(
    'meta[name="robots"]',
    'name',
    'robots',
    noIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large',
  );
  setLink('canonical', canonical);

  setMeta('meta[property="og:site_name"]', 'property', 'og:site_name', DEFAULTS.siteName);
  setMeta('meta[property="og:title"]', 'property', 'og:title', fullTitle);
  setMeta('meta[property="og:description"]', 'property', 'og:description', desc);
  setMeta('meta[property="og:type"]', 'property', 'og:type', type);
  setMeta('meta[property="og:url"]', 'property', 'og:url', canonical);
  setMeta('meta[property="og:image"]', 'property', 'og:image', ogImage);

  setMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
  setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', fullTitle);
  setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', desc);
  setMeta('meta[name="twitter:image"]', 'name', 'twitter:image', ogImage);

  if (publishedTime) {
    setMeta(
      'meta[property="article:published_time"]',
      'property',
      'article:published_time',
      publishedTime,
    );
  }

  document.head
    .querySelectorAll('meta[property="article:tag"]')
    .forEach((node) => node.remove());
  (tags || []).forEach((tag) => {
    const node = document.createElement('meta');
    node.setAttribute('property', 'article:tag');
    node.setAttribute('content', tag);
    document.head.appendChild(node);
  });

  applyStructuredData(structuredData);
}

export function applyStructuredData(data) {
  document.head
    .querySelectorAll('script[data-seo="structured-data"]')
    .forEach((node) => node.remove());
  if (!data) return;
  const entries = Array.isArray(data) ? data : [data];
  entries.filter(Boolean).forEach((entry) => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.dataset.seo = 'structured-data';
    script.textContent = JSON.stringify(entry);
    document.head.appendChild(script);
  });
}
