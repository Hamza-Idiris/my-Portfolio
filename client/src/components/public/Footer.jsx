import { Link } from 'react-router-dom';
import { Mail, ExternalLink } from 'lucide-react';
import { GithubIcon, LinkedinIcon } from '../ui/BrandIcons.jsx';
import { NAV_LINKS } from '../../lib/siteDefaults.js';
import { useSiteSettings } from '../../hooks/useSiteSettings.js';
import { Container } from '../ui/Section.jsx';
import { trackEvent } from '../../lib/analytics.js';

const ICONS = { github: GithubIcon, linkedin: LinkedinIcon, email: Mail };

export function Footer() {
  const { settings } = useSiteSettings();
  const { profile, socialLinks, contact } = settings;
  const year = new Date().getFullYear();
  const email = contact.email || profile.email;

  return (
    <footer className="border-t border-[var(--hairline)] bg-ink-950">
      <Container className="py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <p className="text-lg font-semibold text-ink-50">{profile.name}</p>
            <p className="mt-1 text-sm text-ink-400">{profile.title}</p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-500">{profile.tagline}</p>
          </div>

          <nav aria-label="Footer">
            <h2 className="font-mono text-xs uppercase tracking-[0.16em] text-ink-500">Explore</h2>
            <ul className="mt-4 space-y-2.5">
              {NAV_LINKS.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-ink-300 transition-colors hover:text-ink-50"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/resume" className="text-sm text-ink-300 transition-colors hover:text-ink-50">
                  Resume
                </Link>
              </li>
            </ul>
          </nav>

          <div>
            <h2 className="font-mono text-xs uppercase tracking-[0.16em] text-ink-500">Connect</h2>
            <ul className="mt-4 space-y-2.5">
              {socialLinks.map((link) => {
                const Icon = ICONS[String(link.platform).toLowerCase()] || ExternalLink;
                return (
                  <li key={link.url}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() =>
                        trackEvent(`${String(link.platform).toLowerCase()}_click`, {
                          meta: { location: 'footer' },
                        })
                      }
                      className="inline-flex items-center gap-2 text-sm text-ink-300 transition-colors hover:text-ink-50"
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      {link.label}
                    </a>
                  </li>
                );
              })}
              {email ? (
                <li>
                  <a
                    href={`mailto:${email}`}
                    className="inline-flex items-center gap-2 text-sm text-ink-300 transition-colors hover:text-ink-50"
                  >
                    <Mail className="h-4 w-4" aria-hidden="true" />
                    Email
                  </a>
                </li>
              ) : null}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-[var(--hairline)] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-ink-500">
            © {year} {profile.name}
          </p>
          <p className="font-mono text-xs text-ink-600">Build. Solve. Improve.</p>
        </div>
      </Container>
    </footer>
  );
}
