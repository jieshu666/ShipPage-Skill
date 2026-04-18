export interface Template {
  slug: string;
  title: string;
  description: string;
  category: string;
  keywords: string[];
  html: string;
}

const baseCss = `<style>
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #0f172a; background: #fff; }
  h1, h2, h3 { letter-spacing: -0.02em; }
  a { color: #2563eb; }
</style>`;

export const templates: Template[] = [
  {
    slug: 'resume',
    title: 'One-page resume',
    description: 'Minimal personal resume with experience, skills, and contact sections. Printable, mobile-friendly.',
    category: 'Personal',
    keywords: ['resume', 'cv', 'personal', 'hiring'],
    html: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Your Name — Resume</title>${baseCss}<style>
      .wrap { max-width: 720px; margin: 0 auto; padding: 48px 24px; }
      header { border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 32px; }
      header h1 { font-size: 34px; font-weight: 700; }
      header p { color: #475569; margin-top: 4px; }
      header .contact { margin-top: 12px; font-size: 14px; color: #64748b; display: flex; gap: 16px; flex-wrap: wrap; }
      section { margin-bottom: 28px; }
      section h2 { font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b; margin-bottom: 12px; }
      .item { margin-bottom: 16px; }
      .item .row { display: flex; justify-content: space-between; gap: 12px; }
      .item .title { font-weight: 600; }
      .item .when { color: #94a3b8; font-size: 14px; }
      .item .where { color: #475569; font-size: 14px; margin-top: 2px; }
      .item ul { margin: 8px 0 0 20px; font-size: 14px; color: #334155; }
      .skills { display: flex; flex-wrap: wrap; gap: 8px; }
      .skill { background: #f1f5f9; padding: 6px 12px; border-radius: 4px; font-size: 13px; color: #334155; }
      @media print { .wrap { padding: 24px; } }
    </style></head><body><div class="wrap">
      <header>
        <h1>Your Name</h1>
        <p>Senior Something · Open to work</p>
        <div class="contact"><span>you@example.com</span><span>+1 (555) 123-4567</span><span>linkedin.com/in/you</span><span>github.com/you</span></div>
      </header>
      <section><h2>Experience</h2>
        <div class="item"><div class="row"><div class="title">Senior Engineer</div><div class="when">2023 — Present</div></div><div class="where">Acme Corp · Remote</div><ul><li>Led migration to Cloudflare Workers, cutting p99 latency by 60%.</li><li>Shipped payments pipeline processing $10M/month.</li><li>Mentored 4 engineers to senior level.</li></ul></div>
        <div class="item"><div class="row"><div class="title">Software Engineer</div><div class="when">2020 — 2023</div></div><div class="where">Widget Co · San Francisco</div><ul><li>Built real-time analytics platform used by 200+ customers.</li><li>Owned observability and on-call rotation.</li></ul></div>
      </section>
      <section><h2>Education</h2>
        <div class="item"><div class="row"><div class="title">B.S. Computer Science</div><div class="when">2016 — 2020</div></div><div class="where">University Name</div></div>
      </section>
      <section><h2>Skills</h2>
        <div class="skills"><span class="skill">TypeScript</span><span class="skill">Go</span><span class="skill">Python</span><span class="skill">React</span><span class="skill">PostgreSQL</span><span class="skill">AWS</span><span class="skill">Kubernetes</span></div>
      </section>
    </div></body></html>`,
  },
  {
    slug: 'landing',
    title: 'Startup landing page',
    description: 'Classic hero + features + CTA landing page for a SaaS product. Dark mode, accent color.',
    category: 'Marketing',
    keywords: ['landing', 'marketing', 'startup', 'saas'],
    html: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>ProductName — Do the thing, faster</title>${baseCss}<style>
      body { background: #0a0a0a; color: #f0f0f0; }
      .wrap { max-width: 1080px; margin: 0 auto; padding: 0 24px; }
      nav { height: 64px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #222; }
      .logo { font-weight: 700; font-size: 18px; } .logo span { color: #22d3ee; }
      .nav-links { display: flex; gap: 24px; font-size: 14px; color: #888; } .nav-links a { color: #888; text-decoration: none; }
      .hero { padding: 120px 0 80px; text-align: center; }
      .hero h1 { font-size: 56px; font-weight: 800; letter-spacing: -1.5px; line-height: 1.1; }
      .hero h1 span { color: #22d3ee; }
      .hero p { color: #888; font-size: 18px; max-width: 560px; margin: 24px auto 36px; }
      .cta { display: inline-flex; gap: 12px; }
      .btn { padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 15px; text-decoration: none; }
      .btn.primary { background: #22d3ee; color: #0a0a0a; }
      .btn.secondary { background: transparent; color: #fff; border: 1px solid #333; }
      .features { padding: 80px 0; }
      .features h2 { font-size: 32px; font-weight: 700; text-align: center; margin-bottom: 48px; }
      .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
      .feature { background: #141414; border: 1px solid #222; padding: 28px; border-radius: 12px; }
      .feature h3 { font-size: 18px; margin-bottom: 8px; }
      .feature p { color: #888; font-size: 14px; }
      footer { border-top: 1px solid #222; padding: 32px 0; color: #555; font-size: 13px; text-align: center; }
      @media (max-width: 768px) { .grid { grid-template-columns: 1fr; } .hero h1 { font-size: 36px; } }
    </style></head><body>
      <div class="wrap"><nav><div class="logo">Product<span>Name</span></div><div class="nav-links"><a href="#features">Features</a><a href="#pricing">Pricing</a><a href="#signup">Sign up</a></div></nav></div>
      <section class="hero"><div class="wrap">
        <h1>Do the thing. <span>Faster.</span></h1>
        <p>One-line value proposition that makes a prospect stop scrolling and keep reading.</p>
        <div class="cta"><a href="#signup" class="btn primary">Start free</a><a href="#demo" class="btn secondary">See demo</a></div>
      </div></section>
      <section class="features" id="features"><div class="wrap"><h2>What you get</h2>
        <div class="grid">
          <div class="feature"><h3>Ship in minutes</h3><p>Get from signup to production in under 5 minutes. No yaml, no pipeline.</p></div>
          <div class="feature"><h3>Scales with you</h3><p>From 10 requests to 10 million, same API, same cost model.</p></div>
          <div class="feature"><h3>Built for teams</h3><p>Role-based access, audit logs, SSO out of the box.</p></div>
        </div>
      </div></section>
      <footer><div class="wrap">© 2026 ProductName · Made for humans who ship.</div></footer>
    </body></html>`,
  },
  {
    slug: 'report',
    title: 'Data report / dashboard',
    description: 'KPIs, tables, and insight summary for a weekly or monthly metrics report.',
    category: 'Analytics',
    keywords: ['report', 'dashboard', 'metrics', 'kpi'],
    html: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Weekly metrics report</title>${baseCss}<style>
      body { background: #f8fafc; }
      .wrap { max-width: 960px; margin: 0 auto; padding: 40px 24px; }
      header { margin-bottom: 32px; }
      header h1 { font-size: 28px; font-weight: 700; }
      header p { color: #64748b; margin-top: 4px; }
      .kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
      .kpi { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; }
      .kpi .label { font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.08em; }
      .kpi .value { font-size: 28px; font-weight: 700; margin-top: 6px; }
      .kpi .delta { font-size: 13px; margin-top: 2px; }
      .delta.up { color: #16a34a; } .delta.down { color: #dc2626; }
      section { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 16px; }
      section h2 { font-size: 18px; margin-bottom: 16px; }
      table { width: 100%; border-collapse: collapse; font-size: 14px; }
      th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
      th { color: #64748b; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; }
      .insight { background: #fef3c7; border-left: 3px solid #f59e0b; padding: 16px; border-radius: 4px; font-size: 14px; color: #78350f; margin-top: 8px; }
      @media (max-width: 768px) { .kpis { grid-template-columns: 1fr 1fr; } }
    </style></head><body><div class="wrap">
      <header><h1>Weekly metrics — Apr 12–19, 2026</h1><p>Auto-generated by Claude · Published via ShipPage</p></header>
      <div class="kpis">
        <div class="kpi"><div class="label">MRR</div><div class="value">$48.2K</div><div class="delta up">▲ 8.4% WoW</div></div>
        <div class="kpi"><div class="label">Active users</div><div class="value">2,847</div><div class="delta up">▲ 12% WoW</div></div>
        <div class="kpi"><div class="label">Churn</div><div class="value">2.1%</div><div class="delta down">▼ 0.3 pp</div></div>
        <div class="kpi"><div class="label">NPS</div><div class="value">52</div><div class="delta up">▲ 4</div></div>
      </div>
      <section><h2>Top movers this week</h2>
        <table><thead><tr><th>Metric</th><th>Value</th><th>Delta</th><th>Why</th></tr></thead><tbody>
          <tr><td>Signups</td><td>389</td><td style="color:#16a34a">+41%</td><td>Launch post on Hacker News drove 2K visits</td></tr>
          <tr><td>Trial → paid</td><td>23%</td><td style="color:#16a34a">+6pp</td><td>Shortened onboarding cut drop-off</td></tr>
          <tr><td>API latency p99</td><td>142ms</td><td style="color:#dc2626">+18ms</td><td>Cache warmup issue after deploy; mitigated</td></tr>
        </tbody></table>
      </section>
      <section><h2>Takeaways</h2>
        <div class="insight"><strong>HN launch was a positive signal.</strong> 41% signup spike, 23% trial-to-paid conversion (up 6pp). Consider a second launch in 3 weeks with the new comparison post.</div>
      </section>
    </div></body></html>`,
  },
  {
    slug: 'meeting-notes',
    title: 'Meeting notes',
    description: 'Structured meeting notes with attendees, decisions, and action items. Shareable link.',
    category: 'Docs',
    keywords: ['meeting', 'notes', 'minutes', 'team'],
    html: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Meeting notes — 2026-04-19</title>${baseCss}<style>
      .wrap { max-width: 720px; margin: 0 auto; padding: 40px 24px; }
      header { border-bottom: 1px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 24px; }
      header h1 { font-size: 26px; font-weight: 700; }
      header .meta { color: #64748b; font-size: 14px; margin-top: 8px; display: flex; gap: 16px; flex-wrap: wrap; }
      h2 { font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b; margin: 24px 0 12px; }
      .attendees { display: flex; flex-wrap: wrap; gap: 8px; }
      .pill { background: #f1f5f9; padding: 4px 10px; border-radius: 999px; font-size: 13px; color: #334155; }
      .decision { background: #ecfccb; border-left: 3px solid #84cc16; padding: 12px 16px; border-radius: 4px; margin-bottom: 8px; font-size: 14px; color: #365314; }
      .action { padding: 10px 0; border-bottom: 1px solid #e2e8f0; display: flex; gap: 12px; align-items: start; font-size: 14px; }
      .action input { margin-top: 4px; }
      .action .owner { color: #2563eb; font-weight: 500; }
      .action .due { color: #94a3b8; font-size: 12px; margin-left: auto; }
      .notes { font-size: 14px; color: #334155; line-height: 1.7; }
      .notes ul { margin: 8px 0 16px 20px; }
    </style></head><body><div class="wrap">
      <header><h1>Pricing strategy sync</h1><div class="meta"><span>April 19, 2026 · 60 min</span><span>Remote · Zoom</span></div></header>
      <h2>Attendees</h2><div class="attendees"><span class="pill">Alice (Eng)</span><span class="pill">Bob (Product)</span><span class="pill">Carol (GTM)</span><span class="pill">Dan (Finance)</span></div>
      <h2>Decisions</h2>
      <div class="decision"><strong>Pricing:</strong> $29/mo starter, $99/mo team, custom enterprise. Launch April 30.</div>
      <div class="decision"><strong>Free tier:</strong> Kept at 20 publishes/month but upping retention to 30 days.</div>
      <h2>Action items</h2>
      <div class="action"><input type="checkbox"><div>Write pricing blog post <span class="owner">— Carol</span></div><span class="due">Apr 24</span></div>
      <div class="action"><input type="checkbox"><div>Build Stripe checkout flow <span class="owner">— Alice</span></div><span class="due">Apr 28</span></div>
      <div class="action"><input type="checkbox"><div>Update FAQ + landing page <span class="owner">— Bob</span></div><span class="due">Apr 30</span></div>
      <h2>Notes</h2>
      <div class="notes"><ul>
        <li>Team price is 3.4× starter — positioned for 3-5 person teams with a shared billing account.</li>
        <li>Considered usage-based pricing; deferred to Q3 once we have 100+ paying customers.</li>
        <li>Enterprise: start at $500/mo, custom SLA, SAML.</li>
      </ul></div>
    </div></body></html>`,
  },
  {
    slug: 'link-in-bio',
    title: 'Link-in-bio',
    description: 'Minimal vertical stack of links for social profiles. Mobile-first.',
    category: 'Personal',
    keywords: ['links', 'bio', 'linktree', 'social'],
    html: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>@yourname — Links</title>${baseCss}<style>
      body { background: linear-gradient(180deg, #0a0a0a, #1a1a2e); color: #f0f0f0; min-height: 100vh; }
      .wrap { max-width: 440px; margin: 0 auto; padding: 60px 24px; text-align: center; }
      .avatar { width: 96px; height: 96px; border-radius: 50%; margin: 0 auto 16px; background: linear-gradient(135deg, #f97316, #fbbf24); display: flex; align-items: center; justify-content: center; font-size: 36px; font-weight: 700; color: #0a0a0a; }
      h1 { font-size: 22px; margin-bottom: 4px; }
      .bio { color: #888; font-size: 14px; margin-bottom: 32px; }
      .link { display: flex; align-items: center; justify-content: center; padding: 16px 20px; background: rgba(255,255,255,0.05); border: 1px solid #222; color: #f0f0f0; border-radius: 12px; margin-bottom: 12px; font-weight: 500; text-decoration: none; transition: all 0.15s; }
      .link:hover { background: rgba(255,255,255,0.1); transform: translateY(-1px); }
      footer { margin-top: 40px; color: #555; font-size: 12px; }
    </style></head><body><div class="wrap">
      <div class="avatar">Y</div>
      <h1>@yourname</h1>
      <p class="bio">Builder · Writer · AI enthusiast</p>
      <a class="link" href="https://twitter.com/yourname" target="_blank" rel="noopener">Twitter / X</a>
      <a class="link" href="https://github.com/yourname" target="_blank" rel="noopener">GitHub</a>
      <a class="link" href="https://yourname.com" target="_blank" rel="noopener">Personal site</a>
      <a class="link" href="https://yourname.substack.com" target="_blank" rel="noopener">Newsletter</a>
      <a class="link" href="mailto:you@example.com">Email me</a>
      <footer>Made with ShipPage</footer>
    </div></body></html>`,
  },
];

export function findTemplate(slug: string): Template | undefined {
  return templates.find((t) => t.slug === slug);
}
