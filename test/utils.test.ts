import { describe, it, expect } from 'vitest';
import { escapeHtml } from '../src/utils/escape';
import { toPageMetaLite, readPageMetas } from '../src/utils/kv';
import { signValue, verifyValue } from '../src/auth/session';
import { sha256Hex } from '../src/utils/crypto';

describe('sha256Hex', () => {
  it('matches the known SHA-256 of "abc"', async () => {
    expect(await sha256Hex('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  });
  it('hashes the empty string to the known digest', async () => {
    expect(await sha256Hex('')).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  });
  it('is deterministic and produces 64 hex chars', async () => {
    const a = await sha256Hex('hunter2');
    const b = await sha256Hex('hunter2');
    expect(a).toBe(b);
    expect(a).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe('escapeHtml', () => {
  it('escapes the five HTML-significant characters', () => {
    expect(escapeHtml(`<script>alert("x")&'`)).toBe('&lt;script&gt;alert(&quot;x&quot;)&amp;&#39;');
  });
  it('handles null/undefined/numbers without throwing', () => {
    expect(escapeHtml(null)).toBe('');
    expect(escapeHtml(undefined)).toBe('');
    expect(escapeHtml(42)).toBe('42');
  });
});

describe('toPageMetaLite', () => {
  it('projects the fields showcase/sitemap/cron need and truncates title', () => {
    const lite = toPageMetaLite({
      slug: 'abc', title: 'x'.repeat(200), agent_id: 'ag_1',
      created_at: '2026-07-01', expires_at: '2026-07-15',
      is_public: true, password_protected: false, views: 3, extra: 'dropped',
    });
    expect(lite.slug).toBe('abc');
    expect(lite.title!.length).toBe(120);
    expect(lite.is_public).toBe(true);
    expect(lite.views).toBe(3);
    expect((lite as any).extra).toBeUndefined();
  });
  it('coerces truthiness for booleans and defaults views', () => {
    const lite = toPageMetaLite({ slug: 's' });
    expect(lite.is_public).toBe(false);
    expect(lite.password_protected).toBe(false);
    expect(lite.views).toBe(0);
  });
});

// Minimal in-memory KVNamespace stub for readPageMetas.
function fakeKV(values: Record<string, string>) {
  return {
    get: async (name: string) => values[name] ?? null,
  } as any;
}

describe('readPageMetas', () => {
  it('prefers list metadata and never calls get() for those keys', async () => {
    let gets = 0;
    const kv = {
      get: async () => { gets++; return null; },
    } as any;
    const keys = [
      { name: 'page:a', metadata: { slug: 'a', is_public: true } },
      { name: 'page:b', metadata: { slug: 'b', is_public: false } },
    ];
    const metas = await readPageMetas(kv, keys);
    expect(metas.map((m) => m.slug).sort()).toEqual(['a', 'b']);
    expect(gets).toBe(0);
  });
  it('falls back to get() for legacy keys without metadata', async () => {
    const kv = fakeKV({ 'page:legacy': JSON.stringify({ slug: 'legacy', title: 'Old', is_public: true }) });
    const keys = [{ name: 'page:legacy' }];
    const metas = await readPageMetas(kv, keys);
    expect(metas).toHaveLength(1);
    expect(metas[0].slug).toBe('legacy');
    expect(metas[0].title).toBe('Old');
  });
  it('skips corrupt legacy values without throwing', async () => {
    const kv = fakeKV({ 'page:bad': '{not json' });
    const metas = await readPageMetas(kv, [{ name: 'page:bad' }]);
    expect(metas).toEqual([]);
  });
});

describe('signValue / verifyValue (HMAC password-grant cookies)', () => {
  const secret = 'test-secret-please-change';
  it('round-trips a valid signature', async () => {
    const sig = await signValue('pwgrant:abc', secret);
    expect(await verifyValue('pwgrant:abc', sig, secret)).toBe(true);
  });
  it('rejects a forged/static value (the old bypass)', async () => {
    expect(await verifyValue('pwgrant:abc', 'authorized', secret)).toBe(false);
  });
  it('rejects a signature bound to a different slug', async () => {
    const sig = await signValue('pwgrant:abc', secret);
    expect(await verifyValue('pwgrant:xyz', sig, secret)).toBe(false);
  });
  it('rejects a signature made with a different secret', async () => {
    const sig = await signValue('pwgrant:abc', 'other-secret');
    expect(await verifyValue('pwgrant:abc', sig, secret)).toBe(false);
  });
});
