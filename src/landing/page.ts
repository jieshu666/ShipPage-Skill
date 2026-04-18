type Lang = 'en' | 'zh';

const t = (lang: Lang, en: string, zh: string) => lang === 'zh' ? zh : en;

export function generateLandingPage(lang: Lang = 'en', plausibleDomain?: string): string {
  const otherLang = lang === 'zh' ? 'en' : 'zh';
  const otherLabel = lang === 'zh' ? 'EN' : '中文';
  const htmlLang = lang === 'zh' ? 'zh-CN' : 'en';
  const plausibleScript = plausibleDomain
    ? `<script defer data-domain="${plausibleDomain}" src="https://plausible.io/js/script.outbound-links.js"></script>`
    : '';

  return `<!DOCTYPE html>
<html lang="${htmlLang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ShipPage — Instant HTML Publishing for AI Agents | Zero Config</title>
  ${plausibleScript}
  <meta name="description" content="Publish HTML to a public URL in seconds. Zero config, zero registration. Install the OpenClaw Skill or MCP Server and your AI agent can publish web pages instantly. Free tier: 20 publishes/month.">
  <meta name="keywords" content="HTML publishing, AI agent, MCP server, OpenClaw, Claude, Cursor, web publishing, zero config, instant deploy">
  <meta name="robots" content="index,follow">
  <link rel="canonical" href="https://shippage.ai${lang === 'zh' ? '/?lang=zh' : '/'}">
  <link rel="alternate" hreflang="en" href="https://shippage.ai/">
  <link rel="alternate" hreflang="zh-CN" href="https://shippage.ai/?lang=zh">
  <link rel="alternate" hreflang="x-default" href="https://shippage.ai/">

  <!-- Open Graph -->
  <meta property="og:title" content="ShipPage — HTML in. URL out. Zero config.">
  <meta property="og:description" content="Instant HTML publishing for AI agents. No registration. No config. Install and go. Free tier: 20 publishes/month.">
  <meta property="og:url" content="https://shippage.ai${lang === 'zh' ? '/?lang=zh' : '/'}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="ShipPage">
  <meta property="og:image" content="https://shippage.ai/og.svg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:locale" content="${lang === 'zh' ? 'zh_CN' : 'en_US'}">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="ShipPage — HTML in. URL out. Zero config.">
  <meta name="twitter:description" content="Instant HTML publishing for AI agents. No registration. No config. Install and go.">
  <meta name="twitter:image" content="https://shippage.ai/og.svg">

  <!-- JSON-LD: SoftwareApplication -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "ShipPage",
    "description": "Instant HTML publishing service for AI agents. Zero config, zero registration. Publish HTML to a public URL with a single API call.",
    "url": "https://shippage.ai",
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "description": "Free tier: 20 publishes/month, 14-day retention, 500KB per page"
    },
    "featureList": [
      "Zero-config AI agent publishing",
      "Auto-registration on first API call",
      "Password protection for published pages",
      "Full CRUD API (create, read, update, delete)",
      "OpenClaw Skill integration",
      "MCP Server support for Claude Desktop and Cursor",
      "Custom URL slugs",
      "Automatic page expiry and cleanup"
    ]
  }
  </script>

  <!-- JSON-LD: FAQPage -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is ShipPage?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "ShipPage is a zero-config HTML publishing service designed for AI agents. It turns any HTML content into a public URL with a single API call. No registration, no setup — your AI agent auto-registers on the first publish and receives an API key automatically."
        }
      },
      {
        "@type": "Question",
        "name": "How do I install ShipPage?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "For Claude Code, run 'clawhub install shippage'. For Claude Desktop or Cursor, add the MCP server config with 'npx shippage-mcp'. No API keys or environment variables needed."
        }
      },
      {
        "@type": "Question",
        "name": "Is ShipPage free?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. The free tier includes 20 publishes per month, 14-day page retention, and up to 500KB per page. No credit card required."
        }
      },
      {
        "@type": "Question",
        "name": "How is ShipPage different from PageDrop?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "ShipPage provides an agent identity system, full CRUD operations (create, read, update, delete pages), password protection, custom URL slugs, and integration with the OpenClaw and MCP ecosystems. PageDrop is anonymous-only with no page management capabilities."
        }
      },
      {
        "@type": "Question",
        "name": "Can I password-protect my published pages?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. Pass a 'password' parameter when publishing and visitors will need to enter the password to view the page. The password is hashed with SHA-256 and stored securely."
        }
      },
      {
        "@type": "Question",
        "name": "What happens when my free pages expire?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Free-tier pages expire after 14 days and are automatically cleaned up by a daily cron job. You can publish again to create a new version, or upgrade to Pro (coming soon) for permanent pages."
        }
      },
      {
        "@type": "Question",
        "name": "How do I publish HTML from Claude Code?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Install the ShipPage skill with 'clawhub install shippage'. Then in any Claude Code session, ask Claude to 'publish this HTML as a webpage' and it will call the ShipPage API and return a public URL. No API keys or environment variables are required — the skill auto-registers on first use."
        }
      },
      {
        "@type": "Question",
        "name": "How do I share a webpage that Claude, Cursor, or ChatGPT generated?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Install ShipPage as an MCP server ('npx shippage-mcp') in Claude Desktop or Cursor, or use the OpenClaw skill in Claude Code. Your AI agent can then call the publish tool to turn any HTML or Markdown content into a shareable URL at shippage.ai/p/{slug} in under a second."
        }
      },
      {
        "@type": "Question",
        "name": "What is an MCP server for publishing web pages?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "An MCP (Model Context Protocol) server is a tool provider that AI assistants like Claude Desktop and Cursor can invoke. The ShipPage MCP server ('npx shippage-mcp') exposes publish_html, publish_markdown, list_pages, and delete_page tools, letting the AI publish and manage web pages directly from the conversation."
        }
      },
      {
        "@type": "Question",
        "name": "Is ShipPage a zero-config alternative to Vercel or Netlify?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "For AI-generated HTML, yes. Vercel and Netlify require accounts, git repositories, and build configuration. ShipPage publishes an HTML string to a public URL with one HTTP POST — no account, no repo, no build. It is purpose-built for AI agents that need instant, ephemeral web delivery rather than a full CI/CD pipeline."
        }
      },
      {
        "@type": "Question",
        "name": "Can I publish Markdown directly to a webpage?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. Both the OpenClaw skill and the MCP server accept Markdown and convert it to a styled, mobile-friendly HTML page with GitHub-flavored formatting before publishing. The published page renders headings, lists, code blocks, tables, and links automatically."
        }
      },
      {
        "@type": "Question",
        "name": "How do I make my published page appear in Google search results?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Pass 'public': true in the publish request body. Public pages receive index,follow robots directives, a canonical link, and are included in shippage.ai/sitemap.xml. Default pages are noindex to prevent spam; opt in per page when you want discoverability."
        }
      },
      {
        "@type": "Question",
        "name": "Does ShipPage work with any HTTP client?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. The /v1/publish endpoint is a standard REST endpoint. Any HTTP client — curl, Python requests, Node fetch, Go net/http — can publish by POSTing JSON with an 'html' field. The skill and MCP server are convenience wrappers; the raw API is always available."
        }
      },
      {
        "@type": "Question",
        "name": "Is ShipPage open source?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. ShipPage is MIT-licensed and hosted on GitHub at github.com/jieshu666/ShipPage-Skill. The Cloudflare Workers backend, the OpenClaw skill, and the MCP server implementation are all open source."
        }
      }
    ]
  }
  </script>

  <!-- JSON-LD: HowTo -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to publish HTML from an AI agent in 30 seconds",
    "description": "Turn HTML generated by Claude, Cursor, or any AI agent into a public URL using ShipPage.",
    "totalTime": "PT30S",
    "tool": [
      { "@type": "HowToTool", "name": "Claude Code, Claude Desktop, Cursor, or any HTTP client" }
    ],
    "step": [
      {
        "@type": "HowToStep",
        "position": 1,
        "name": "Install ShipPage",
        "text": "Run 'clawhub install shippage' for Claude Code, or add 'npx shippage-mcp' to your Claude Desktop or Cursor MCP config. No API keys required."
      },
      {
        "@type": "HowToStep",
        "position": 2,
        "name": "Ask your AI to publish",
        "text": "Tell your AI agent: 'publish this as a webpage'. The agent generates HTML (or Markdown) and calls the ShipPage publish tool automatically."
      },
      {
        "@type": "HowToStep",
        "position": 3,
        "name": "Share the URL",
        "text": "ShipPage returns a public URL at shippage.ai/p/{slug}. On first use, the agent also receives an api_key and claim_url for future page management."
      }
    ]
  }
  </script>

  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
    :root {
      --bg: #0a0a0a; --bg-card: #141414; --bg-code: #0d1117;
      --border: #222; --border-light: #333;
      --text: #f0f0f0; --text-muted: #888; --text-dim: #555;
      --accent: #f97316; --accent-hover: #ea580c;
      --green: #4ade80; --cyan: #22d3ee; --purple: #a78bfa; --yellow: #fbbf24;
      --max-w: 1080px;
      --font: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      --mono: 'SF Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace;
    }
    html { scroll-behavior: smooth; }
    body { background: var(--bg); color: var(--text); font-family: var(--font); line-height: 1.6; -webkit-font-smoothing: antialiased; }
    a { color: var(--accent); text-decoration: none; }
    a:hover { text-decoration: underline; }
    .wrap { max-width: var(--max-w); margin: 0 auto; padding: 0 24px; }
    section { padding: 80px 0; }
    h2 { font-size: 32px; font-weight: 700; margin-bottom: 16px; text-align: center; }
    .section-sub { text-align: center; color: var(--text-muted); font-size: 16px; max-width: 600px; margin: 0 auto 48px; }
    nav { position: sticky; top: 0; z-index: 100; background: rgba(10,10,10,0.85); backdrop-filter: blur(12px); border-bottom: 1px solid var(--border); }
    nav .wrap { display: flex; align-items: center; justify-content: space-between; height: 56px; }
    .nav-logo { font-size: 18px; font-weight: 700; color: var(--text); }
    .nav-logo span { color: var(--accent); }
    .nav-links { display: flex; gap: 24px; font-size: 14px; align-items: center; }
    .nav-links a { color: var(--text-muted); }
    .nav-links a:hover { color: var(--text); text-decoration: none; }
    .lang-btn { background: var(--bg-card); border: 1px solid var(--border); color: var(--text-muted); padding: 4px 10px; border-radius: 4px; font-size: 12px; cursor: pointer; text-decoration: none; }
    .lang-btn:hover { border-color: var(--accent); color: var(--accent); text-decoration: none; }
    #hero { padding: 120px 0 80px; text-align: center; }
    #hero h1 { font-size: 52px; font-weight: 800; letter-spacing: -1.5px; line-height: 1.1; margin-bottom: 20px; }
    #hero h1 span { color: var(--accent); }
    #hero .hero-desc { font-size: 18px; color: var(--text-muted); max-width: 560px; margin: 0 auto 36px; line-height: 1.7; }
    .hero-ctas { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-bottom: 24px; }
    .btn { display: inline-flex; align-items: center; gap: 8px; padding: 12px 28px; border-radius: 8px; font-size: 15px; font-weight: 600; cursor: pointer; border: none; transition: all 0.2s; text-decoration: none; }
    .btn-primary { background: var(--accent); color: #fff; }
    .btn-primary:hover { background: var(--accent-hover); text-decoration: none; }
    .btn-secondary { background: transparent; color: var(--text); border: 1px solid var(--border-light); }
    .btn-secondary:hover { border-color: var(--text-muted); text-decoration: none; }
    .hero-trust { font-size: 13px; color: var(--text-dim); }
    .steps-grid { display: grid; grid-template-columns: 1fr; gap: 24px; }
    .step-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 32px; text-align: center; }
    .step-num { display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 50%; background: var(--accent); color: #fff; font-weight: 700; font-size: 16px; margin-bottom: 16px; }
    .step-card h3 { font-size: 18px; margin-bottom: 8px; }
    .step-card p { color: var(--text-muted); font-size: 14px; }
    .demo-grid { display: grid; grid-template-columns: 1fr; gap: 16px; }
    .code-block { background: var(--bg-code); border: 1px solid var(--border); border-radius: 10px; overflow: hidden; }
    .code-header { display: flex; align-items: center; justify-content: space-between; padding: 10px 16px; border-bottom: 1px solid var(--border); font-size: 12px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
    .copy-btn { background: transparent; border: 1px solid var(--border); color: var(--text-muted); padding: 4px 10px; border-radius: 4px; font-size: 11px; cursor: pointer; font-family: var(--font); }
    .copy-btn:hover { border-color: var(--text-muted); color: var(--text); }
    .copy-btn.copied { border-color: var(--green); color: var(--green); }
    pre { padding: 16px; overflow-x: auto; font-family: var(--mono); font-size: 13px; line-height: 1.6; }
    .s-str { color: var(--green); } .s-key { color: var(--cyan); } .s-num { color: var(--yellow); } .s-bool { color: var(--purple); } .s-comment { color: var(--text-dim); font-style: italic; } .s-method { color: var(--accent); font-weight: 600; }
    .install-grid { display: grid; grid-template-columns: 1fr; gap: 16px; }
    .install-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 24px; }
    .install-card h3 { font-size: 16px; margin-bottom: 4px; }
    .install-card .install-sub { font-size: 12px; color: var(--text-dim); margin-bottom: 16px; }
    .install-card .install-note { font-size: 12px; color: var(--green); margin-top: 12px; }
    .table-wrap { overflow-x: auto; border-radius: 12px; border: 1px solid var(--border); }
    table { width: 100%; border-collapse: collapse; font-size: 14px; }
    th { background: var(--bg-card); padding: 12px 16px; text-align: left; font-weight: 600; border-bottom: 1px solid var(--border); white-space: nowrap; }
    td { padding: 12px 16px; border-bottom: 1px solid var(--border); color: var(--text-muted); }
    tr:last-child td { border-bottom: none; }
    .check { color: var(--green); } .cross { color: #ef4444; }
    .specs-grid { display: grid; grid-template-columns: 1fr; gap: 1px; background: var(--border); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
    .spec-item { display: flex; gap: 16px; padding: 16px 20px; background: var(--bg-card); }
    .spec-label { color: var(--text-muted); font-size: 14px; min-width: 140px; flex-shrink: 0; }
    .spec-value { font-size: 14px; font-family: var(--mono); color: var(--text); }
    details { background: var(--bg-card); border: 1px solid var(--border); border-radius: 10px; margin-bottom: 8px; }
    summary { padding: 16px 20px; cursor: pointer; font-weight: 600; font-size: 15px; list-style: none; display: flex; justify-content: space-between; align-items: center; }
    summary::after { content: '+'; color: var(--text-muted); font-size: 20px; transition: transform 0.2s; }
    details[open] summary::after { content: '−'; }
    summary::-webkit-details-marker { display: none; }
    details .faq-body { padding: 0 20px 16px; color: var(--text-muted); font-size: 14px; line-height: 1.7; }
    .pricing-grid { display: grid; grid-template-columns: 1fr; gap: 24px; max-width: 700px; margin: 0 auto; }
    .price-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 32px; }
    .price-card.featured { border-color: var(--accent); position: relative; }
    .price-badge { position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: var(--accent); color: #fff; font-size: 11px; font-weight: 700; padding: 4px 14px; border-radius: 20px; text-transform: uppercase; }
    .price-card h3 { font-size: 20px; margin-bottom: 4px; }
    .price-amount { font-size: 36px; font-weight: 800; margin: 16px 0 4px; }
    .price-amount span { font-size: 14px; font-weight: 400; color: var(--text-muted); }
    .price-card ul { list-style: none; margin: 20px 0; }
    .price-card li { padding: 6px 0; font-size: 14px; color: var(--text-muted); }
    .price-card li::before { content: '✓ '; color: var(--green); font-weight: 700; }
    .claim-banner { background: linear-gradient(135deg, #1a1a2e, #16213e); border: 1px solid #2a2a4a; border-radius: 16px; padding: 48px 32px; text-align: center; }
    .claim-banner h2 { margin-bottom: 12px; }
    .claim-banner p { color: var(--text-muted); margin-bottom: 24px; }
    footer { border-top: 1px solid var(--border); padding: 32px 0; }
    .footer-inner { display: flex; flex-direction: column; align-items: center; gap: 16px; text-align: center; }
    .footer-links { display: flex; gap: 20px; font-size: 13px; }
    .footer-links a { color: var(--text-dim); }
    .footer-links a:hover { color: var(--text); }
    .footer-copy { font-size: 12px; color: var(--text-dim); }
    .facts { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 28px 32px; }
    .facts ul { list-style: none; display: grid; grid-template-columns: 1fr; gap: 14px; }
    .facts li { color: var(--text-muted); font-size: 15px; line-height: 1.6; padding-left: 24px; position: relative; }
    .facts li::before { content: '▸'; color: var(--accent); position: absolute; left: 0; top: 0; font-size: 14px; }
    .facts li strong { color: var(--text); font-weight: 600; }
    @media (min-width: 768px) {
      .facts ul { grid-template-columns: 1fr 1fr; }
    }
    @media (min-width: 768px) {
      .steps-grid { grid-template-columns: repeat(3, 1fr); }
      .demo-grid { grid-template-columns: 1fr 1fr; }
      .install-grid { grid-template-columns: 1fr 1fr; }
      .pricing-grid { grid-template-columns: 1fr 1fr; }
      .specs-grid { grid-template-columns: 1fr 1fr; }
      .footer-inner { flex-direction: row; justify-content: space-between; }
    }
    @media (min-width: 1024px) { #hero h1 { font-size: 64px; } }
  </style>
</head>
<body>

  <nav>
    <div class="wrap">
      <a href="/" class="nav-logo">Ship<span>Page</span></a>
      <div class="nav-links">
        <a href="/blog">${t(lang, 'Blog', '博客')}</a>
        <a href="/templates">${t(lang, 'Templates', '模板')}</a>
        <a href="/showcase">${t(lang, 'Showcase', '展示')}</a>
        <a href="${lang === 'zh' ? '?lang=zh' : '/'}#install">${t(lang, 'Install', '安装')}</a>
        <a href="https://github.com/jieshu666/ShipPage-Skill" target="_blank">GitHub</a>
        <a href="?lang=${otherLang}" class="lang-btn">${otherLabel}</a>
      </div>
    </div>
  </nav>

  <main>
    <section id="hero">
      <div class="wrap">
        <h1>HTML in. <span>URL out.</span><br>${t(lang, 'Zero config.', '零配置。')}</h1>
        <p class="hero-desc">${t(lang,
          'ShipPage is an instant publishing service for AI agents. Your agent sends HTML, gets back a public URL. No registration, no API keys to configure — it just works on the first call.',
          'ShipPage 是为 AI Agent 打造的即时发布服务。你的 Agent 发送 HTML，即刻获得一个公网 URL。无需注册，无需配置 API Key —— 首次调用即刻生效。'
        )}</p>
        <div class="hero-ctas">
          <a href="#install" class="btn btn-primary">${t(lang, 'Install Skill', '安装 Skill')}</a>
          <a href="https://github.com/jieshu666/ShipPage-Skill" target="_blank" class="btn btn-secondary">${t(lang, 'View on GitHub', '查看源码')}</a>
        </div>
        <p class="hero-trust">${t(lang, 'Free · 20 publishes/month · No credit card required', '免费 · 每月 20 次发布 · 无需信用卡')}</p>
      </div>
    </section>

    <section id="quick-facts" style="padding-top:40px;padding-bottom:40px;">
      <div class="wrap">
        <div class="facts">
          <ul>
            <li><strong>${t(lang, 'ShipPage is a zero-config HTML publishing service for AI agents, built on Cloudflare Workers.', 'ShipPage 是一个为 AI Agent 设计的零配置 HTML 发布服务，基于 Cloudflare Workers 构建。')}</strong></li>
            <li><strong>${t(lang, 'One HTTP POST turns any HTML or Markdown into a public URL — no account, no setup, no build step.', '一次 HTTP POST 就能把任意 HTML 或 Markdown 变成公网 URL —— 无账号、无配置、无构建步骤。')}</strong></li>
            <li><strong>${t(lang, 'Installs as an OpenClaw skill (clawhub install shippage) or an MCP server (npx shippage-mcp).', '以 OpenClaw Skill（clawhub install shippage）或 MCP Server（npx shippage-mcp）形式安装。')}</strong></li>
            <li><strong>${t(lang, 'Works with Claude Code, Claude Desktop, Cursor, or any HTTP client via the /v1/publish endpoint.', '支持 Claude Code、Claude Desktop、Cursor，以及任意 HTTP 客户端通过 /v1/publish 接口调用。')}</strong></li>
            <li><strong>${t(lang, 'Auto-registers your agent on the first publish call — no signup, no form, no email verification.', '首次调用自动注册你的 Agent —— 无需注册、无需填表、无需邮箱验证。')}</strong></li>
            <li><strong>${t(lang, 'Free tier: 20 publishes per month, 14-day retention, 500KB per page. MIT-licensed.', '免费版：每月 20 次发布、14 天保留、每页 500KB。MIT 协议开源。')}</strong></li>
          </ul>
        </div>
      </div>
    </section>

    <section id="how-it-works">
      <div class="wrap">
        <h2>${t(lang, 'How It Works', '如何使用')}</h2>
        <p class="section-sub">${t(lang, 'Three steps. No registration. Your AI agent handles everything.', '三步完成。无需注册。AI Agent 全自动处理。')}</p>
        <div class="steps-grid">
          <div class="step-card">
            <div class="step-num">1</div>
            <h3>${t(lang, 'Install', '安装')}</h3>
            <p>${t(lang, 'Add the ShipPage skill or MCP server. One command, zero environment variables.', '添加 ShipPage Skill 或 MCP Server。一条命令，零环境变量。')}</p>
          </div>
          <div class="step-card">
            <div class="step-num">2</div>
            <h3>${t(lang, 'Describe', '描述')}</h3>
            <p>${t(lang, 'Tell your AI: "publish this as a webpage." It generates HTML and calls the API automatically.', '告诉你的 AI："把这个发布成网页。" 它会自动生成 HTML 并调用 API。')}</p>
          </div>
          <div class="step-card">
            <div class="step-num">3</div>
            <h3>${t(lang, 'Get a URL', '获得链接')}</h3>
            <p>${t(lang, 'Instantly receive a public URL. Share it anywhere — phone, WeChat, email, Slack.', '即刻获得公网 URL。随处分享 —— 手机、微信、邮件、Slack。')}</p>
          </div>
        </div>
      </div>
    </section>

    <section id="demo">
      <div class="wrap">
        <h2>${t(lang, 'See It in Action', '实际效果')}</h2>
        <p class="section-sub">${t(lang, 'One API call. Auto-registers your agent. Returns a live URL.', '一次 API 调用。自动注册你的 Agent。返回在线 URL。')}</p>
        <div class="demo-grid">
          <div class="code-block">
            <div class="code-header">
              <span>Request</span>
              <button class="copy-btn" data-copy="curl -X POST https://shippage.ai/v1/publish \\
  -H &quot;Content-Type: application/json&quot; \\
  -d '{&quot;html&quot;: &quot;<html><body><h1>Hello!</h1></body></html>&quot;, &quot;title&quot;: &quot;My Page&quot;}'">Copy</button>
            </div>
            <pre><span class="s-method">POST</span> https://shippage.ai/v1/publish
Content-Type: application/json

{
  <span class="s-key">"html"</span>: <span class="s-str">"&lt;html&gt;&lt;body&gt;&lt;h1&gt;Hello!&lt;/h1&gt;&lt;/body&gt;&lt;/html&gt;"</span>,
  <span class="s-key">"title"</span>: <span class="s-str">"My Page"</span>
}</pre>
          </div>
          <div class="code-block">
            <div class="code-header"><span>Response</span></div>
            <pre>{
  <span class="s-key">"ok"</span>: <span class="s-bool">true</span>,
  <span class="s-key">"url"</span>: <span class="s-str">"https://shippage.ai/p/x7k2m9"</span>,
  <span class="s-key">"slug"</span>: <span class="s-str">"x7k2m9"</span>,
  <span class="s-key">"expires_at"</span>: <span class="s-str">"2026-04-05T14:30:00Z"</span>,
  <span class="s-key">"_registration"</span>: {
    <span class="s-key">"api_key"</span>: <span class="s-str">"sk_..."</span>,
    <span class="s-key">"claim_url"</span>: <span class="s-str">"https://shippage.ai/claim/ABCD-1234"</span>
  }
}</pre>
          </div>
        </div>
        <p style="text-align:center;color:var(--text-dim);font-size:13px;margin-top:16px;">${t(lang, 'First call auto-registers your agent. No API key needed to start.', '首次调用自动注册你的 Agent。无需 API Key 即可开始。')}</p>
      </div>
    </section>

    <section id="install">
      <div class="wrap">
        <h2>${t(lang, 'Get Started in Seconds', '秒级上手')}</h2>
        <p class="section-sub">${t(lang, 'Choose your preferred integration method. All zero-config.', '选择你喜欢的集成方式。全部零配置。')}</p>
        <div class="install-grid">
          <div class="install-card">
            <h3>OpenClaw Skill</h3>
            <p class="install-sub">${t(lang, 'For Claude Code', '用于 Claude Code')}</p>
            <div class="code-block">
              <div class="code-header"><span>Terminal</span><button class="copy-btn" data-copy="clawhub install shippage">Copy</button></div>
              <pre>clawhub install shippage</pre>
            </div>
            <p class="install-note">${t(lang, 'Zero env vars. Works immediately.', '零环境变量。即装即用。')}</p>
          </div>
          <div class="install-card">
            <h3>MCP Server</h3>
            <p class="install-sub">${t(lang, 'For Claude Desktop / Cursor', '用于 Claude Desktop / Cursor')}</p>
            <div class="code-block">
              <div class="code-header"><span>claude_desktop_config.json</span><button class="copy-btn" data-copy='{"mcpServers":{"shippage":{"command":"npx","args":["shippage-mcp"]}}}'>Copy</button></div>
              <pre>{
  <span class="s-key">"mcpServers"</span>: {
    <span class="s-key">"shippage"</span>: {
      <span class="s-key">"command"</span>: <span class="s-str">"npx"</span>,
      <span class="s-key">"args"</span>: [<span class="s-str">"shippage-mcp"</span>]
    }
  }
}</pre>
            </div>
            <p class="install-note">${t(lang, 'No API key config needed.', '无需配置 API Key。')}</p>
          </div>
        </div>
        <div style="margin-top:16px;">
          <div class="install-card">
            <h3>Direct API</h3>
            <p class="install-sub">${t(lang, 'For any HTTP client', '用于任意 HTTP 客户端')}</p>
            <div class="code-block">
              <div class="code-header"><span>cURL</span><button class="copy-btn" data-copy="curl -X POST https://shippage.ai/v1/publish -H 'Content-Type: application/json' -d '{&quot;html&quot;: &quot;<html><body>Hello</body></html>&quot;}'">Copy</button></div>
              <pre>curl -X POST https://shippage.ai/v1/publish \\
  -H <span class="s-str">"Content-Type: application/json"</span> \\
  -d <span class="s-str">'{"html": "&lt;html&gt;&lt;body&gt;Hello&lt;/body&gt;&lt;/html&gt;"}'</span></pre>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="comparison">
      <div class="wrap">
        <h2>${t(lang, 'Why ShipPage?', '为什么选 ShipPage？')}</h2>
        <p class="section-sub">${t(lang, 'Purpose-built for AI agents, not just another file host.', '专为 AI Agent 打造，不只是文件托管。')}</p>
        <div class="table-wrap">
          <table>
            <thead><tr><th>${t(lang, 'Feature', '功能')}</th><th>ShipPage</th><th>PageDrop</th><th>${t(lang, 'Manual Deploy', '手动部署')}</th></tr></thead>
            <tbody>
              <tr><td>${t(lang, 'Zero config', '零配置')}</td><td class="check">✓</td><td class="check">✓</td><td class="cross">✗</td></tr>
              <tr><td>${t(lang, 'Agent identity system', 'Agent 身份系统')}</td><td class="check">✓</td><td class="cross">✗</td><td class="cross">✗</td></tr>
              <tr><td>${t(lang, 'Page management (CRUD)', '页面管理 (CRUD)')}</td><td class="check">✓</td><td class="cross">✗</td><td>${t(lang, 'Varies', '视情况')}</td></tr>
              <tr><td>${t(lang, 'Password protection', '密码保护')}</td><td class="check">✓</td><td class="cross">✗</td><td>${t(lang, 'Varies', '视情况')}</td></tr>
              <tr><td>${t(lang, 'Custom URL slugs', '自定义 URL')}</td><td class="check">✓</td><td class="cross">✗</td><td class="check">✓</td></tr>
              <tr><td>${t(lang, 'OpenClaw + MCP ecosystem', 'OpenClaw + MCP 生态')}</td><td class="check">✓</td><td class="cross">✗</td><td class="cross">✗</td></tr>
              <tr><td>${t(lang, 'Auto-expiry & cleanup', '自动过期清理')}</td><td class="check">✓</td><td class="check">✓</td><td class="cross">✗</td></tr>
              <tr><td>${t(lang, 'Free tier', '免费额度')}</td><td>20/${t(lang, 'month', '月')}</td><td>${t(lang, 'Unlimited', '无限')}</td><td>${t(lang, 'Varies', '视情况')}</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <section id="specs">
      <div class="wrap">
        <h2>${t(lang, 'Technical Specs', '技术参数')}</h2>
        <p class="section-sub">${t(lang, 'Everything you need to integrate ShipPage into your workflow.', '集成 ShipPage 所需的一切信息。')}</p>
        <div class="specs-grid">
          <div class="spec-item"><span class="spec-label">API Endpoint</span><span class="spec-value">https://shippage.ai/v1/publish</span></div>
          <div class="spec-item"><span class="spec-label">Method</span><span class="spec-value">POST (JSON body)</span></div>
          <div class="spec-item"><span class="spec-label">${t(lang, 'Authentication', '认证')}</span><span class="spec-value">${t(lang, 'Auto-register on first call', '首次调用自动注册')}</span></div>
          <div class="spec-item"><span class="spec-label">${t(lang, 'Max page size', '最大页面大小')}</span><span class="spec-value">500 KB (free) / 5 MB (pro)</span></div>
          <div class="spec-item"><span class="spec-label">${t(lang, 'Retention', '保留时间')}</span><span class="spec-value">${t(lang, '14 days (free) / permanent (pro)', '14 天 (free) / 永久 (pro)')}</span></div>
          <div class="spec-item"><span class="spec-label">${t(lang, 'Rate limit', '速率限制')}</span><span class="spec-value">${t(lang, '20 publishes/month (free)', '20 次/月 (free)')}</span></div>
          <div class="spec-item"><span class="spec-label">${t(lang, 'Infrastructure', '基础设施')}</span><span class="spec-value">Cloudflare Workers + R2 + KV</span></div>
          <div class="spec-item"><span class="spec-label">${t(lang, 'Response time', '响应时间')}</span><span class="spec-value">&lt;100ms (${t(lang, 'edge-deployed globally', '全球边缘部署')})</span></div>
        </div>
      </div>
    </section>

    <section id="faq">
      <div class="wrap">
        <h2>${t(lang, 'Frequently Asked Questions', '常见问题')}</h2>
        <p class="section-sub">${t(lang, 'Quick answers to common questions about ShipPage.', '关于 ShipPage 的常见问题快速解答。')}</p>

        <details>
          <summary>${t(lang, 'What is ShipPage?', 'ShipPage 是什么？')}</summary>
          <div class="faq-body">${t(lang,
            'ShipPage is a zero-config HTML publishing service designed for AI agents. It turns any HTML content into a public URL with a single API call. No registration, no setup — your AI agent auto-registers on the first publish and receives an API key automatically.',
            'ShipPage 是一个为 AI Agent 设计的零配置 HTML 发布服务。一次 API 调用即可将任意 HTML 内容转换为公网 URL。无需注册，无需配置 —— 你的 AI Agent 在首次发布时自动注册并获得 API Key。'
          )}</div>
        </details>
        <details>
          <summary>${t(lang, 'How do I install ShipPage?', '如何安装 ShipPage？')}</summary>
          <div class="faq-body">${t(lang,
            'For Claude Code, run <code>clawhub install shippage</code>. For Claude Desktop or Cursor, add the MCP server config with <code>npx shippage-mcp</code> in your settings. No API keys or environment variables are needed — everything is handled automatically on first use.',
            '如果你使用 Claude Code，运行 <code>clawhub install shippage</code>。如果使用 Claude Desktop 或 Cursor，在配置中添加 MCP Server <code>npx shippage-mcp</code>。无需 API Key 或环境变量 —— 首次使用时一切自动搞定。'
          )}</div>
        </details>
        <details>
          <summary>${t(lang, 'Is ShipPage free?', 'ShipPage 免费吗？')}</summary>
          <div class="faq-body">${t(lang,
            'Yes. The free tier includes 20 publishes per month, 14-day page retention, and up to 500KB per page. No credit card required. A Pro tier with unlimited publishes, permanent retention, and larger pages is coming soon.',
            '是的。免费版包含每月 20 次发布、14 天页面保留、每页最大 500KB。无需信用卡。Pro 版本（无限发布、永久保留、更大页面）即将推出。'
          )}</div>
        </details>
        <details>
          <summary>${t(lang, 'How is ShipPage different from PageDrop?', 'ShipPage 和 PageDrop 有什么区别？')}</summary>
          <div class="faq-body">${t(lang,
            'ShipPage provides an agent identity system, full CRUD operations (create, read, update, delete pages), password protection, custom URL slugs, and deep integration with the OpenClaw and MCP ecosystems. PageDrop is anonymous-only with no page management or agent identity capabilities.',
            'ShipPage 提供 Agent 身份系统、完整的 CRUD 操作（增删改查）、密码保护、自定义 URL，以及与 OpenClaw 和 MCP 生态的深度集成。PageDrop 仅支持匿名上传，没有页面管理和 Agent 身份功能。'
          )}</div>
        </details>
        <details>
          <summary>${t(lang, 'Can I password-protect my published pages?', '可以给发布的页面加密码吗？')}</summary>
          <div class="faq-body">${t(lang,
            'Yes. Pass a <code>password</code> parameter when publishing and visitors will need to enter the password to view the page. The password is hashed with SHA-256 and stored securely. Access is managed via secure HTTP-only cookies.',
            '可以。发布时传入 <code>password</code> 参数，访客需要输入密码才能查看页面。密码使用 SHA-256 哈希安全存储，通过 HTTP-only Cookie 管理访问权限。'
          )}</div>
        </details>
        <details>
          <summary>${t(lang, 'What happens when my free pages expire?', '免费页面过期后会怎样？')}</summary>
          <div class="faq-body">${t(lang,
            'Free-tier pages expire after 14 days and are automatically cleaned up by a daily cron job. You can re-publish at any time to create a fresh page. Upgrade to Pro (coming soon) for permanent pages that never expire.',
            '免费版页面在 14 天后过期，由每日定时任务自动清理。你可以随时重新发布来创建新页面。升级到 Pro 版本（即将推出）可获得永不过期的页面。'
          )}</div>
        </details>
        <details>
          <summary>${t(lang, 'How do I publish HTML from Claude Code?', '如何在 Claude Code 里发布 HTML？')}</summary>
          <div class="faq-body">${t(lang,
            'Install the ShipPage skill with <code>clawhub install shippage</code>. Then ask Claude: <em>"publish this HTML as a webpage"</em>. Claude generates the HTML and calls the ShipPage API automatically — no API keys, no env vars. The first call registers your agent and returns a public URL plus an api_key for future use.',
            '使用 <code>clawhub install shippage</code> 安装 ShipPage Skill。然后告诉 Claude：<em>"把这段 HTML 发布成网页"</em>。Claude 会生成 HTML 并自动调用 ShipPage API —— 无需 API Key，无需环境变量。首次调用会自动注册 Agent 并返回公网 URL 以及后续使用的 api_key。'
          )}</div>
        </details>
        <details>
          <summary>${t(lang, 'What is an MCP server for publishing web pages?', '用来发布网页的 MCP Server 是什么？')}</summary>
          <div class="faq-body">${t(lang,
            'An MCP (Model Context Protocol) server is a tool provider that Claude Desktop and Cursor can invoke during a conversation. The ShipPage MCP server (<code>npx shippage-mcp</code>) exposes <code>publish_html</code>, <code>publish_markdown</code>, <code>list_pages</code>, and <code>delete_page</code> tools — the AI calls them directly and returns the resulting URL.',
            'MCP（Model Context Protocol）Server 是 Claude Desktop 和 Cursor 可以在对话中调用的工具提供方。ShipPage MCP Server（<code>npx shippage-mcp</code>）暴露 <code>publish_html</code>、<code>publish_markdown</code>、<code>list_pages</code>、<code>delete_page</code> 四个工具 —— AI 直接调用并返回 URL。'
          )}</div>
        </details>
        <details>
          <summary>${t(lang, 'How do I make my published page show up in Google search?', '怎么让发布的页面出现在 Google 搜索里？')}</summary>
          <div class="faq-body">${t(lang,
            'Pass <code>"public": true</code> in the publish request body. Public pages receive <code>index,follow</code> robots directives, a canonical link pointing to their shippage.ai URL, and are included in <code>shippage.ai/sitemap.xml</code>. Default pages are <code>noindex,nofollow</code> to prevent spam — opt in per page when you want discoverability.',
            '在 publish 请求 body 里传 <code>"public": true</code>。公开页面会得到 <code>index,follow</code> 的 robots 指令、指向 shippage.ai URL 的 canonical 链接，并被包含在 <code>shippage.ai/sitemap.xml</code> 中。默认页面是 <code>noindex,nofollow</code> 防止垃圾 —— 需要被检索时按页面开启。'
          )}</div>
        </details>
        <details>
          <summary>${t(lang, 'Is ShipPage an alternative to Vercel or Netlify?', 'ShipPage 是 Vercel 或 Netlify 的替代吗？')}</summary>
          <div class="faq-body">${t(lang,
            'For AI-generated HTML, yes. Vercel and Netlify require accounts, git repositories, and build configuration. ShipPage publishes an HTML string to a public URL with one HTTP POST — no account, no repo, no build. It is purpose-built for AI agents delivering one-shot content, not a full CI/CD pipeline.',
            '对于 AI 生成的 HTML，是的。Vercel 和 Netlify 需要账号、git 仓库和构建配置。ShipPage 一次 HTTP POST 就能把 HTML 字符串发布到公网 URL —— 无账号、无仓库、无构建。它专为需要一次性交付内容的 AI Agent 设计，而不是完整的 CI/CD 流水线。'
          )}</div>
        </details>
      </div>
    </section>

    <section id="claim">
      <div class="wrap">
        <div class="claim-banner">
          <h2>${t(lang, 'Already using ShipPage?', '已经在用 ShipPage？')}</h2>
          <p>${t(lang,
            'If your AI agent has already published pages, use your claim code to take ownership and manage them from the web.',
            '如果你的 AI Agent 已经发布了页面，使用 Claim Code 来认领并在网页上管理它们。'
          )}</p>
          <a href="/claim" class="btn btn-primary">${t(lang, 'Claim My Pages', '认领我的页面')}</a>
        </div>
      </div>
    </section>

    <section id="pricing">
      <div class="wrap">
        <h2>${t(lang, 'Pricing', '价格')}</h2>
        <p class="section-sub">${t(lang, 'Start free. Upgrade when you need more.', '免费开始。按需升级。')}</p>
        <div class="pricing-grid">
          <div class="price-card">
            <h3>Free</h3>
            <p style="color:var(--text-muted);font-size:14px;">${t(lang, 'For getting started', '入门使用')}</p>
            <div class="price-amount">$0<span> / ${t(lang, 'month', '月')}</span></div>
            <ul>
              <li>${t(lang, '20 publishes per month', '每月 20 次发布')}</li>
              <li>${t(lang, '14-day page retention', '14 天页面保留')}</li>
              <li>${t(lang, '500KB per page', '每页 500KB')}</li>
              <li>${t(lang, 'Password protection', '密码保护')}</li>
              <li>${t(lang, 'Custom URL slugs', '自定义 URL')}</li>
              <li>${t(lang, 'Full API access', '完整 API 访问')}</li>
            </ul>
            <a href="#install" class="btn btn-primary" style="width:100%;justify-content:center;">${t(lang, 'Get Started Free', '免费开始')}</a>
          </div>
          <div class="price-card featured">
            <div class="price-badge">Coming Soon</div>
            <h3>Pro</h3>
            <p style="color:var(--text-muted);font-size:14px;">${t(lang, 'For power users', '高级用户')}</p>
            <div class="price-amount" style="font-size:24px;margin:20px 0 8px;">Pricing TBD</div>
            <ul>
              <li>${t(lang, 'Unlimited publishes', '无限次发布')}</li>
              <li>${t(lang, 'Permanent retention', '永久保留')}</li>
              <li>${t(lang, '5MB per page', '每页 5MB')}</li>
              <li>${t(lang, 'Custom domains', '自定义域名')}</li>
              <li>${t(lang, 'No watermark', '无水印')}</li>
              <li>${t(lang, 'Priority support', '优先支持')}</li>
            </ul>
            <form id="waitlist-form" style="margin-top:8px;">
              <input type="email" name="email" placeholder="your@email.com" required
                style="width:100%;padding:10px 14px;background:var(--bg);border:1px solid var(--border-light);border-radius:6px;color:var(--text);font-size:14px;outline:none;margin-bottom:8px;font-family:var(--font);">
              <button type="submit" class="btn btn-primary" style="width:100%;justify-content:center;">Join Waitlist</button>
            </form>
            <p id="waitlist-msg" style="display:none;text-align:center;font-size:13px;margin-top:8px;"></p>
          </div>
        </div>
      </div>
    </section>
  </main>

  <footer>
    <div class="wrap">
      <div class="footer-inner">
        <span class="footer-copy">© 2026 ShipPage · ${t(lang, 'Built on Cloudflare Workers', '基于 Cloudflare Workers 构建')}</span>
        <div class="footer-links">
          <a href="/blog">${t(lang, 'Blog', '博客')}</a>
          <a href="/templates">${t(lang, 'Templates', '模板')}</a>
          <a href="/showcase">${t(lang, 'Showcase', '展示')}</a>
          <a href="/changelog">${t(lang, 'Changelog', '更新日志')}</a>
          <a href="https://github.com/jieshu666/ShipPage-Skill" target="_blank">GitHub</a>
          <a href="/health">API Status</a>
        </div>
      </div>
    </div>
  </footer>

  <script>
    document.querySelectorAll('.copy-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const text = btn.getAttribute('data-copy');
        if (!text) return;
        try {
          await navigator.clipboard.writeText(text);
          btn.textContent = 'Copied!';
          btn.classList.add('copied');
          setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 2000);
        } catch (e) {
          btn.textContent = 'Failed';
          setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
        }
      });
    });
    const wf = document.getElementById('waitlist-form');
    const wm = document.getElementById('waitlist-msg');
    if (wf) wf.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = wf.querySelector('input[name="email"]').value;
      const btn = wf.querySelector('button');
      btn.textContent = 'Submitting...';
      btn.disabled = true;
      try {
        const res = await fetch('/v1/waitlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        const data = await res.json();
        wm.style.display = 'block';
        if (data.ok) {
          wm.style.color = 'var(--green)';
          wm.textContent = data.message;
          wf.style.display = 'none';
        } else {
          wm.style.color = '#ef4444';
          wm.textContent = data.error;
          btn.textContent = 'Join Waitlist';
          btn.disabled = false;
        }
      } catch (err) {
        wm.style.display = 'block';
        wm.style.color = '#ef4444';
        wm.textContent = 'Network error, please try again.';
        btn.textContent = 'Join Waitlist';
        btn.disabled = false;
      }
    });
  </script>

</body>
</html>`;
}
