/**
 * Fallback content used before the settings request resolves, and if the API is
 * unreachable. Everything here is also stored in the SiteSettings document and
 * is editable from Admin -> Profile / Settings.
 */
export const SITE_DEFAULTS = {
  profile: {
    name: 'Hamza Idiris',
    title: 'Full Stack Web & Mobile Developer',
    tagline: 'I build practical digital products that solve real-world problems.',
    shortBio:
      'I develop modern web and mobile applications with the MERN stack and Flutter, from database and API design through to the interface people actually use.',
    bio: '',
    location: '',
    email: '',
    avatarUrl: '',
    availability: 'Open to opportunities',
    availabilityEnabled: true,
    currentFocus: '',
    currentlyBuilding:
      'Currently building and improving full-stack applications with MERN and Flutter.',
  },
  socialLinks: [
    { platform: 'github', label: 'GitHub', url: 'https://github.com/Hamza-Idiris' },
    {
      platform: 'linkedin',
      label: 'LinkedIn',
      url: 'https://www.linkedin.com/in/hamza-mohamed-93b7343a5',
    },
  ],
  resume: { url: '', fileName: '', updatedAt: null },
  contact: { email: '', responseTime: 'I usually reply within a couple of days.' },
  home: {
    ctaTitle: 'Have an idea, project, or opportunity?',
    ctaDescription: "Let's build something useful.",
  },
  seo: {
    defaultTitle: 'Hamza Idiris — Full Stack Web & Mobile Developer',
    defaultDescription:
      'Hamza Idiris builds practical digital products that solve real-world problems, using the MERN stack and Flutter.',
    ogImage: '',
  },
};

export const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/projects', label: 'Projects' },
  { to: '/certifications', label: 'Certifications' },
  { to: '/updates', label: 'Updates' },
  { to: '/contact', label: 'Contact' },
];
