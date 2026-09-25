/**
 * Derives coarse, non-identifying context from a request. Only broad families
 * are kept, deliberately avoiding full user-agent strings, IP addresses and
 * anything that could be used to fingerprint an individual visitor.
 */

export function deviceCategory(userAgent = '', screenWidth) {
  const ua = userAgent.toLowerCase();
  if (/ipad|tablet|playbook|silk/.test(ua) || (/android/.test(ua) && !/mobile/.test(ua))) {
    return 'tablet';
  }
  if (/mobi|iphone|ipod|android|blackberry|windows phone/.test(ua)) return 'mobile';
  if (ua) return 'desktop';

  if (typeof screenWidth === 'number') {
    if (screenWidth < 640) return 'mobile';
    if (screenWidth < 1024) return 'tablet';
    return 'desktop';
  }
  return 'unknown';
}

export function browserCategory(userAgent = '') {
  const ua = userAgent.toLowerCase();
  if (/edg\//.test(ua)) return 'Edge';
  if (/opr\/|opera/.test(ua)) return 'Opera';
  if (/samsungbrowser/.test(ua)) return 'Samsung Internet';
  if (/firefox|fxios/.test(ua)) return 'Firefox';
  if (/chrome|crios/.test(ua)) return 'Chrome';
  if (/safari/.test(ua)) return 'Safari';
  return 'Other';
}

export function osCategory(userAgent = '') {
  const ua = userAgent.toLowerCase();
  if (/windows/.test(ua)) return 'Windows';
  if (/android/.test(ua)) return 'Android';
  if (/iphone|ipad|ipod/.test(ua)) return 'iOS';
  if (/mac os x|macintosh/.test(ua)) return 'macOS';
  if (/linux/.test(ua)) return 'Linux';
  return 'Other';
}

/**
 * Region comes from a hosting provider header when present (Vercel, Cloudflare).
 * It is a country-level hint only, and is left blank when unavailable.
 */
export function regionFromHeaders(headers = {}) {
  const country =
    headers['x-vercel-ip-country'] ||
    headers['cf-ipcountry'] ||
    headers['x-country-code'] ||
    '';
  return String(country).slice(0, 4).toUpperCase();
}

export function requestContext(req, screenWidth) {
  const userAgent = req.get('user-agent') || '';
  return {
    deviceCategory: deviceCategory(userAgent, screenWidth),
    browserCategory: browserCategory(userAgent),
    osCategory: osCategory(userAgent),
    region: regionFromHeaders(req.headers),
  };
}

const BOT_PATTERN =
  /bot|crawler|spider|crawling|slurp|bingpreview|facebookexternalhit|lighthouse|headlesschrome|pingdom|uptime/i;

export const isLikelyBot = (userAgent = '') => BOT_PATTERN.test(userAgent);
