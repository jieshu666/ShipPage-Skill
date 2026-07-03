// Shared KV helpers. ShipPage stores one metadata value per page under the
// `page:` prefix. Reading them one-await-at-a-time in a loop is what made
// /showcase and /sitemap.xml hang (an unbounded N+1 of serial cross-region
// reads). These helpers paginate the key list and read values in bounded
// parallel batches instead.

interface KVListKey {
  name: string;
  metadata?: unknown;
}

// List every key under a prefix, following the cursor so results past the
// first 1000 are not silently dropped. `cap` bounds worst-case work (and the
// Workers per-invocation subrequest budget) for pathological key counts.
export async function listAllKeys(
  meta: KVNamespace,
  prefix: string,
  cap = 2000,
): Promise<KVListKey[]> {
  const keys: KVListKey[] = [];
  let cursor: string | undefined;
  do {
    const res: KVNamespaceListResult<unknown> = await meta.list({ prefix, limit: 1000, cursor });
    keys.push(...res.keys);
    cursor = res.list_complete ? undefined : res.cursor;
    if (keys.length >= cap) break;
  } while (cursor);
  return keys;
}

// Read many KV values concurrently in fixed-size chunks. Returns values in the
// same order as `names` (null for missing keys).
export async function batchGet(
  meta: KVNamespace,
  names: string[],
  chunkSize = 30,
): Promise<(string | null)[]> {
  const out: (string | null)[] = [];
  for (let i = 0; i < names.length; i += chunkSize) {
    const chunk = names.slice(i, i + chunkSize);
    const vals = await Promise.all(chunk.map((n) => meta.get(n)));
    out.push(...vals);
  }
  return out;
}

// The subset of page metadata we attach to each KV key's *list metadata* at
// write time. Reading it comes free with list() — no per-key get() — which is
// what keeps /showcase, /sitemap.xml, and the cleanup cron under the Workers
// per-invocation subrequest budget as the page count grows past 1000.
export interface PageMetaLite {
  slug: string;
  title?: string;
  agent_id?: string;
  created_at?: string;
  expires_at?: string;
  is_public?: boolean;
  password_protected?: boolean;
  views?: number;
}

// Build the compact list-metadata blob from a full page-meta object. KV list
// metadata is capped at 1024 bytes, so the title is truncated.
export function toPageMetaLite(meta: any): PageMetaLite {
  return {
    slug: meta.slug,
    title: typeof meta.title === 'string' ? meta.title.slice(0, 120) : undefined,
    agent_id: meta.agent_id,
    created_at: meta.created_at,
    expires_at: meta.expires_at,
    is_public: meta.is_public === true,
    password_protected: !!meta.password_protected,
    views: meta.views || 0,
  };
}

// Read page metadata for a set of keys, preferring the free list metadata and
// only falling back to a bounded batch of get()s for legacy keys written before
// list metadata existed. This keeps the subrequest count ~O(pages/1000) for
// pages that carry list metadata, instead of one get() per page.
export async function readPageMetas(
  meta: KVNamespace,
  keys: { name: string; metadata?: unknown }[],
  fallbackCap = 300,
): Promise<PageMetaLite[]> {
  const out: PageMetaLite[] = [];
  const needGet: string[] = [];
  for (const k of keys) {
    const m = k.metadata as PageMetaLite | undefined;
    if (m && typeof m === 'object' && typeof m.slug === 'string') {
      out.push(m);
    } else {
      needGet.push(k.name);
    }
  }
  if (needGet.length) {
    const vals = await batchGet(meta, needGet.slice(0, fallbackCap));
    for (const v of vals) {
      if (!v) continue;
      try { out.push(toPageMetaLite(JSON.parse(v))); } catch { /* skip */ }
    }
  }
  return out;
}
