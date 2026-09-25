import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api.js';
import { SITE_DEFAULTS } from '../lib/siteDefaults.js';

const mergeSettings = (data) => {
  if (!data) return SITE_DEFAULTS;
  return {
    ...SITE_DEFAULTS,
    ...data,
    profile: { ...SITE_DEFAULTS.profile, ...(data.profile || {}) },
    resume: { ...SITE_DEFAULTS.resume, ...(data.resume || {}) },
    contact: { ...SITE_DEFAULTS.contact, ...(data.contact || {}) },
    home: { ...SITE_DEFAULTS.home, ...(data.home || {}) },
    seo: { ...SITE_DEFAULTS.seo, ...(data.seo || {}) },
    socialLinks:
      Array.isArray(data.socialLinks) && data.socialLinks.length
        ? data.socialLinks
        : SITE_DEFAULTS.socialLinks,
  };
};

export function useSiteSettings() {
  const query = useQuery({
    queryKey: ['site-settings'],
    queryFn: () => api.get('/api/settings'),
    staleTime: 5 * 60_000,
  });

  return {
    ...query,
    settings: mergeSettings(query.data),
  };
}

export function findSocial(socialLinks, platform) {
  return (socialLinks || []).find(
    (link) => String(link.platform || '').toLowerCase() === platform,
  );
}
