import { describe, it, expect } from 'vitest';
import { injectWatermark } from '../src/utils/watermark';

const opts = (isPublic: boolean) => ({ siteUrl: 'https://shippage.ai', slug: 'abc', isPublic, title: 'T' });

describe('injectWatermark — noindex guarantee', () => {
  it('injects noindex for a private page with a normal <head>', () => {
    const out = injectWatermark('<html><head><title>x</title></head><body>hi</body></html>', opts(false));
    expect(out).toMatch(/<meta name="robots" content="noindex,nofollow">/);
  });
  it('injects index,follow for a public page', () => {
    const out = injectWatermark('<html><head></head><body>hi</body></html>', opts(true));
    expect(out).toMatch(/<meta name="robots" content="index,follow">/);
  });
  it('still injects robots meta when there is no <head>', () => {
    const out = injectWatermark('<html><body>hi</body></html>', opts(false));
    expect(out).toContain('content="noindex,nofollow"');
  });
  it('still injects robots meta for a bare fragment (no <html>)', () => {
    const out = injectWatermark('<p>just a fragment</p>', opts(false));
    expect(out).toContain('content="noindex,nofollow"');
    expect(out).toContain('<head>');
  });
  it('adds the canonical link and the ShipPage badge', () => {
    const out = injectWatermark('<html><head></head><body>hi</body></html>', opts(true));
    expect(out).toContain('<link rel="canonical" href="https://shippage.ai/p/abc">');
    expect(out).toMatch(/Made with .*ShipPage/);
  });
});

describe('injectWatermark — idempotency', () => {
  it('does not inject a second time on already-watermarked HTML', () => {
    const once = injectWatermark('<html><head></head><body>hi</body></html>', opts(false));
    const twice = injectWatermark(once, opts(false));
    // Exactly one generator meta, one robots meta, one badge.
    expect((twice.match(/name="generator" content="ShipPage"/g) || []).length).toBe(1);
    expect((twice.match(/name="robots"/g) || []).length).toBe(1);
    expect(twice).toBe(once);
  });
  it('does not flip a private page to indexable on re-publish', () => {
    const priv = injectWatermark('<html><head></head><body>hi</body></html>', opts(false));
    // Re-running (even with isPublic=true) must not add a conflicting index meta.
    const again = injectWatermark(priv, opts(true));
    expect(again).not.toContain('content="index,follow"');
    expect((again.match(/name="robots"/g) || []).length).toBe(1);
  });
});
