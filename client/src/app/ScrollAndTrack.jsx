import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../lib/analytics.js';

/**
 * Resets scroll on navigation and records one page view per path change.
 * Admin routes are excluded so the owner's own usage never pollutes analytics.
 */
export function ScrollAndTrack() {
  const { pathname, hash } = useLocation();
  const lastTracked = useRef(null);

  useEffect(() => {
    if (hash) {
      const target = document.getElementById(hash.slice(1));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  }, [pathname, hash]);

  useEffect(() => {
    if (pathname.startsWith('/admin')) return;
    if (lastTracked.current === pathname) return;
    lastTracked.current = pathname;
    trackPageView(pathname);
  }, [pathname]);

  return null;
}
