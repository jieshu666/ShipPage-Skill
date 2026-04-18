export interface ChangelogEntry {
  version: string;
  date: string;
  summary?: string;
  sections: Partial<Record<'added' | 'changed' | 'fixed' | 'removed' | 'security', string[]>>;
}

// Most-recent-first. New entries are prepended by .github/workflows/changelog-on-release.yml.
export const changelog: ChangelogEntry[] = [
  {
    version: '0.2.0',
    date: '2026-04-19',
    summary: 'GEO-first growth infrastructure: blog, templates, showcase, structured data.',
    sections: {
      added: [
        'Public blog at /blog with RSS feed and full Article + BreadcrumbList JSON-LD',
        'Templates gallery at /templates with five copy-paste HTML templates and CreativeWork JSON-LD',
        'Public showcase at /showcase listing pages published with the new `public: true` flag',
        'SEO routes: /robots.txt, /sitemap.xml (auto-includes blog + templates + public pages), /llms.txt and /llms-full.txt for LLM ingestion, /og.svg for social previews',
        '`public: boolean` flag on POST /v1/publish — opts a page into search-engine indexing, canonical link, WebPage JSON-LD, and /sitemap.xml inclusion',
        'Optional Plausible Analytics integration via PLAUSIBLE_DOMAIN env var — injects script on landing, blog, templates, and showcase',
      ],
      changed: [
        'Landing page FAQ expanded from 6 to 15 verbatim-query entries; added HowTo JSON-LD; upgraded Twitter card to summary_large_image',
        'Landing page gained hreflang alternates for en / zh-CN / x-default',
        'Published-page watermark upgraded to a branded "Made with ShipPage" badge; injects canonical, WebPage JSON-LD, and generator meta',
        'README opening rewritten with three atomic positioning sentences optimised for LLM extraction',
      ],
    },
  },
];
// CHANGELOG_END
