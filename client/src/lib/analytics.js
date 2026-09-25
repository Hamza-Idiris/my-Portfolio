import { apiUrl } from './api.js';

/**
 * First-party, privacy-conscious analytics.
 *
 * What is sent: an ephemeral random session id (sessionStorage only, cleared
 * when the tab closes), the event name, the path, and a coarse referrer
 * category. Screen width is sent only so the server can bucket the device into
 * desktop/tablet/mobile. No cookies, no cross-site identifiers, no
 * fingerprinting, and no form content.
 */

const SESSION_KEY = 'hi_analytics_session';
const ENDPOINT = '/api/analytics/event';

const canTrack = () =>
  typeof window !== 'undefined' &&
  window.navigator?.doNotTrack !== '1' &&
  window.doNotTrack !== '1';

function getSessionId() {
  try {
    let id = window.sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `s_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
      window.sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    // Storage can be blocked; fall back to a per-page-load id.
    return 'ephemeral';
  }
}

function referrerCategory() {
  const referrer = document.referrer;
  if (!referrer) return 'direct';
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, '');
    if (host === window.location.hostname) return 'internal';
    if (/google|bing|duckduckgo|yahoo|ecosia|brave/.test(host)) return 'search';
    if (/linkedin|twitter|x\.com|facebook|instagram|reddit|t\.co|threads|mastodon/.test(host)) {
      return 'social';
    }
    if (/github|gitlab|dev\.to|medium|hashnode|stackoverflow/.test(host)) return 'developer';
    return 'referral';
  } catch {
    return 'referral';
  }
}

export function trackEvent(eventType, { path, projectId, postId, meta } = {}) {
  if (!canTrack()) return;

  const payload = {
    sessionId: getSessionId(),
    eventType,
    path: path || window.location.pathname,
    referrer: referrerCategory(),
    screenWidth: window.innerWidth,
    ...(projectId ? { projectId } : {}),
    ...(postId ? { postId } : {}),
    ...(meta ? { meta } : {}),
  };

  const url = apiUrl(ENDPOINT);
  const body = JSON.stringify(payload);

  // sendBeacon survives page unload, which matters for outbound link clicks.
  if (navigator.sendBeacon) {
    const sent = navigator.sendBeacon(url, new Blob([body], { type: 'application/json' }));
    if (sent) return;
  }

  fetch(url, {
    method: 'POST',
    keepalive: true,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body,
  }).catch(() => {
    // Analytics must never interfere with the visitor's experience.
  });
}

export const trackPageView = (path) => trackEvent('page_view', { path });
