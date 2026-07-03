export interface ChangelogEntry {
  version: string;
  date: string;
  summary?: string;
  sections: Partial<Record<'added' | 'changed' | 'fixed' | 'removed' | 'security', string[]>>;
}

// Most-recent-first. New entries are prepended by .github/workflows/changelog-on-release.yml.
export const changelog: ChangelogEntry[] = [
  {
    version: '1.3.0',
    date: '2026-07-03',
    summary: 'Reliability, SEO, and security hardening pass.',
    sections: {
      fixed: [
        '/showcase and /sitemap.xml no longer hang: replaced the unbounded per-key KV read loop with a cursor-paginated, batched read',
        'Daily cleanup cron now paginates the full key space, so expired pages beyond the first 1000 are actually removed',
        '/claim now serves a real claim-code entry page instead of a raw JSON 404; browsers get a branded HTML 404 site-wide',
        'Sitemap no longer lists the robots-disallowed /claim path, and lastmod reflects real content-change dates instead of "today"',
      ],
      added: [
        'SVG favicon at /favicon.svg (with /favicon.ico redirect)',
        'Organization + WebSite JSON-LD with sameAs links to GitHub and npm for stronger entity signals',
        'Branded "tombstone" pages for expired/missing pages with a re-publish call to action',
      ],
      changed: [
        'Chinese homepage (?lang=zh) now localizes title, meta description, and social-card tags',
        'Social-preview image switched from SVG to a rasterized PNG so link previews render on every platform',
      ],
      security: [
        'Published pages are served under a CSP sandbox so page scripts can no longer make same-origin credentialed requests to the app',
        'Password-protected pages use a signed (HMAC) access cookie instead of a static, forgeable value; password comparison is constant-time',
        'Custom slugs are validated (charset + reserved names) and expires_in is clamped to the free-tier maximum',
        'Escaped user- and agent-controlled values in the account and claim management UIs; constrained OAuth redirect targets to same-origin paths',
      ],
    },
  },
  {
    version: '1.2.0',
    date: '2026-04-19',
    summary: 'GEO-first growth infrastructure: blog, templates, showcase, structured data.',
    sections: {
      added: [
        'Public blog at /blog with RSS feed and full Article + BreadcrumbList JSON-LD',
        'Templates gallery at /templates with five copy-paste HTML templates and CreativeWork JSON-LD',
        'Public showcase at /showcase listing pages published with the new `public: true` flag',
        'SEO routes: /robots.txt, /sitemap.xml (auto-includes blog + templates + public pages), /llms.txt and /llms-full.txt for LLM ingestion',
        '`public: boolean` flag on POST /v1/publish — opts a page into search-engine indexing, canonical link, WebPage JSON-LD, and /sitemap.xml inclusion',
        'Optional Plausible Analytics integration via PLAUSIBLE_DOMAIN env var',
      ],
      changed: [
        'Landing page FAQ expanded to 15 verbatim-query entries; added HowTo JSON-LD; upgraded Twitter card to summary_large_image',
        'Landing page gained hreflang alternates for en / zh-CN / x-default',
        'Published-page watermark upgraded to a branded "Made with ShipPage" badge; injects canonical, WebPage JSON-LD, and generator meta',
      ],
    },
  },
  {
    version: '1.1.0',
    date: '2026-03-26',
    summary: 'Markdown publishing and self-updating skill.',
    sections: {
      added: [
        'Markdown publishing: the OpenClaw skill and MCP server render Markdown to a styled, mobile-friendly page automatically',
        'Skill auto-update: the ShipPage skill checks for and installs new versions on first use each session',
      ],
    },
  },
  {
    version: '1.0.0',
    date: '2026-03-22',
    summary: 'Initial release — zero-config HTML publishing for AI agents.',
    sections: {
      added: [
        'POST /v1/publish — one API call turns HTML into a public URL, auto-registering the agent on first use',
        'Full page CRUD (list / update / delete), password protection, custom slugs, and automatic 14-day expiry',
        'OpenClaw skill and MCP server (shippage-mcp) distribution channels',
      ],
    },
  },
];
// CHANGELOG_END
