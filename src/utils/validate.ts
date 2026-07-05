// Pure input validators, extracted so they can be unit-tested without a Worker
// runtime. Used by the publish and auth routes.

// Custom slugs become R2 object keys, KV keys, and public URLs. Restrict them to
// a safe charset and length so a slug can't traverse paths or collide with a
// top-level route namespace.
const SLUG_RE = /^[a-z0-9-]{1,64}$/;

export const RESERVED_SLUGS = new Set([
  'admin', 'account', 'auth', 'claim', 'api', 'v1', 'blog', 'templates',
  'showcase', 'changelog', 'pricing', 'docs', 'health', 'p', 'sitemap',
  'robots', 'favicon', 'llms', 'og', 'shippage', 'www', 'about', 'terms',
  'privacy', 'compare',
]);

export function isValidSlug(slug: unknown): slug is string {
  return typeof slug === 'string' && SLUG_RE.test(slug);
}

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.has(slug);
}

export const MAX_TTL_SECONDS = 14 * 24 * 60 * 60; // free-tier max: 14 days
export const MIN_TTL_SECONDS = 60;

// Returns the clamped TTL, or null if the input is present but not a positive
// finite number. `undefined` yields the default (max) TTL.
export function clampTtl(expiresIn: unknown): number | null {
  if (expiresIn === undefined) return MAX_TTL_SECONDS;
  const n = Number(expiresIn);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.min(Math.max(Math.floor(n), MIN_TTL_SECONDS), MAX_TTL_SECONDS);
}

// Only allow same-origin relative redirect targets: a single leading slash, not
// "//host", a "/\" smuggle, or an absolute URL. Anything else falls back to "/".
export function safeRedirectPath(target: unknown): string {
  if (!target || typeof target !== 'string') return '/';
  if (!target.startsWith('/') || target.startsWith('//') || target.startsWith('/\\')) return '/';
  return target;
}
