// HTML-escape untrusted values before interpolating them into markup.
// Used across every renderer that echoes agent- or user-controlled strings
// (titles, display names, slugs, Google profile fields).
export function escapeHtml(s: unknown): string {
  return String(s ?? '').replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!),
  );
}
