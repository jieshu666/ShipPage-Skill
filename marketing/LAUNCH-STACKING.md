# Launch Stacking — 5 Days Playbook

> Final, publish-ready copy for 9 channels. Execute in this exact order over 5 days. Do not re-post the same content afterwards — move to passive mode (awesome-lists + blog + SEO).

## Pre-flight checklist

- [ ] Deploy confirmed live: `curl -I https://shippage.ai/` → 200, OG meta present
- [ ] Blog posts live: `/blog/how-to-publish-html-from-claude`, `/blog/shippage-vs-vercel-netlify-pagedrop`
- [ ] Templates page live: `/templates`
- [ ] Showcase page live: `/showcase`
- [ ] 1200×630 OG SVG renders: `/og.svg`
- [ ] 30s demo GIF recorded (curl → URL → open on phone). Host on imgur or Cloudflare R2.

## Day-by-day schedule

| Day | Time (PT) | Channel | Submit URL |
|---|---|---|---|
| **Mon** | **10:00** | **Show HN** | https://news.ycombinator.com/submit |
| Mon | 10:05 | OpenClaw Discord #showcase | [#showcase](https://discord.gg/openclaw) |
| Tue | 00:01 | Product Hunt | https://www.producthunt.com/posts/new |
| Tue | 09:00 | Twitter/X post | compose new tweet |
| Wed | 09:00 | Reddit r/ClaudeAI | https://reddit.com/r/ClaudeAI/submit |
| Wed | 09:05 | Reddit r/mcp | https://reddit.com/r/mcp/submit |
| Wed | 09:10 | Reddit r/LocalLLaMA | https://reddit.com/r/LocalLLaMA/submit |
| Thu | 10:00 | V2EX | https://www.v2ex.com/new |
| Thu | 10:05 | 即刻 | Jike app → 写想法 |
| Thu | 10:10 | 掘金 | https://juejin.cn/editor/drafts |
| Fri | 09:00 | 微信公众号 | mp.weixin.qq.com |
| Fri | 09:05 | WaytoAGI | https://waytoagi.com |

**Why this order**: HN is the anchor — PH/Reddit/Twitter echo it. Chinese channels on Thu–Fri to ride the weekend read. Each post feeds the next platform's algorithm via referral traffic.

---

## 1. Show HN — Monday 10:00 PT

**Title (80 chars max)**:
```
Show HN: ShipPage – Zero-config HTML publishing for AI agents
```

**URL field**: `https://shippage.ai`

**Text (first comment, post immediately after submitting)**:

```
Hi HN,

I built ShipPage because I kept hitting the same wall: AI agents generate great HTML — reports, dashboards, one-pagers — but there's no simple way to share the output.

Local HTML files don't open on phones. Can't send via WeChat or iMessage. Google Drive strips interactivity.

ShipPage is one endpoint: POST HTML, get a public URL.

- clawhub install shippage   # OpenClaw skill
- npx shippage-mcp           # MCP server for Claude Desktop / Cursor
- curl -X POST https://shippage.ai/v1/publish -d '{"html":"..."}'

The twist: zero registration. Agents auto-register on first call (inspired by EvoMap's agent identity pattern). Credentials get saved locally; humans only show up when they want to manage pages or upgrade.

Infra: single Cloudflare Worker + R2 + KV. Cost: ~$5/mo at 10K users.

Free tier: 20 publishes/month, 14-day retention, 500KB/page. Optional `"public": true` opts a page into shippage.ai/sitemap.xml so Google/Bing can index it.

Open source (MIT): https://github.com/jieshu666/ShipPage-Skill
Comparison vs Vercel/Netlify/PageDrop: https://shippage.ai/blog/shippage-vs-vercel-netlify-pagedrop

Two questions I'd love feedback on:
1. Is auto-registration the right default for agent-first services, or does it create spam risk I'm underestimating?
2. The 14-day expiry keeps costs down but burns SEO value. Any clever middle grounds you've seen?
```

**Tips**:
- Submit at 10:00 AM PT sharp (highest HN audience)
- Don't share the link elsewhere until the first few upvotes land naturally
- Respond to every comment within 30 min for the first 2 hrs
- Never ask for upvotes — it's auto-flagged

---

## 2. Product Hunt — Tuesday 00:01 PT (pre-schedule)

**Name**: ShipPage
**Tagline (60 chars max)**: `HTML in. URL out. Zero-config publishing for AI agents.`

**Description**:
```
ShipPage turns any HTML or Markdown into a public URL with one HTTP POST. No signup. No API keys. AI agents auto-register on first call.

Install as an OpenClaw skill (`clawhub install shippage`) or MCP server (`npx shippage-mcp`) for Claude Desktop, Cursor, or any HTTP client.

Free tier: 20 publishes/month, 14-day retention, 500KB/page. Built on Cloudflare Workers for sub-100ms edge response.
```

**Topics** (pick 3): `Developer Tools`, `Artificial Intelligence`, `Open Source`

**Links**:
- Main: https://shippage.ai
- GitHub: https://github.com/jieshu666/ShipPage-Skill
- npm: https://www.npmjs.com/package/shippage-mcp

**Gallery assets**:
1. Thumbnail: Use `https://shippage.ai/og.svg` (already 1200×630)
2. Screenshots: landing hero, `/templates`, `/blog`, curl→URL GIF
3. Demo video (optional): 30s screen recording of "tell Claude to publish this" → URL comes back

**Maker's comment (first comment)**:
```
Hey PH 👋

I made ShipPage because my agents kept producing content I couldn't share. Claude would make a beautiful HTML report, and it'd just sit there on my disk.

Now I just say "publish this" and get back a shippage.ai/p/... URL I can open on my phone or send on WeChat.

Three things that make it different from existing hosts:
- Zero signup (agents auto-register)
- MCP + OpenClaw skill = AI can invoke it directly
- Selective indexing — pages are noindex by default; pass "public": true when you want Google to find them

Would love your feedback — what would make you use this over manual Vercel deploys?
```

---

## 3. Twitter / X — Tuesday 09:00 PT

**Main tweet** (275 chars):
```
Your AI agent can generate HTML.
But it can't publish it.

Built ShipPage — one API call in, one public URL out.
Zero config. Agent auto-registers on first use.

clawhub install shippage
npx shippage-mcp

https://shippage.ai

#BuildInPublic #MCP #ClaudeAI
```

**Attach**: 30s demo GIF (curl → URL → phone open)

**Reply thread** (post as self-reply, 2 tweets):

Reply 1:
```
Why I built it: AI gives you HTML. Phones don't open HTML files. WeChat doesn't. iMessage doesn't. Google Drive strips interactivity.

The last-mile delivery problem for AI-generated content was unsolved. So: one POST, one URL, done.
```

Reply 2:
```
Tech: single Cloudflare Worker + R2 + KV. Sub-100ms edge response. ~$5/mo at 10K users.

Open source (MIT): https://github.com/jieshu666/ShipPage-Skill

Comparison with Vercel / Netlify / PageDrop: https://shippage.ai/blog/shippage-vs-vercel-netlify-pagedrop
```

---

## 4. OpenClaw Discord — Monday 10:05 PT

**Channel**: `#showcase` (or appropriate channel per server rules)

```
**ShipPage — Instant HTML publishing for AI agents** 🚀

Just shipped. One API call in, one public URL out.

`clawhub install shippage`

Then tell Claude "publish this as a webpage" → you get `shippage.ai/p/xxx` instantly. Works with HTML or Markdown.

• Zero config (auto-registers on first call)
• Password protect, custom slugs, full CRUD
• Optional `"public": true` for Google indexing
• Free tier: 20 pages/month, 14 day retention

Demo: [attach 30s GIF]
Site: https://shippage.ai
Repo: https://github.com/jieshu666/ShipPage-Skill

Would love eyeballs on the agent auto-registration flow — feels right for our ecosystem but open to pushback.
```

---

## 5. Reddit r/ClaudeAI — Wednesday 09:00 PT

**Title**: `I built a zero-config HTML publishing service for Claude — no signup, one API call, returns a URL`

**Body**:
```
Hey everyone — building in public, wanted to share.

Problem: Claude generates great HTML (reports, landing pages, one-pagers), but then what? Local files don't share well — phones, WeChat, iMessage all choke on raw HTML.

I built **ShipPage** (https://shippage.ai) to solve the last-mile delivery problem.

## How it works

One HTTP POST turns any HTML or Markdown into a public URL at `shippage.ai/p/{slug}`.

Claude Code users:
```
clawhub install shippage
```
Then just say "publish this as a webpage" in any conversation. The skill calls the API, returns the URL.

Claude Desktop / Cursor users: add the MCP server:
```json
{"mcpServers":{"shippage":{"command":"npx","args":["shippage-mcp"]}}}
```

## What makes it different

- **Zero signup** — agents auto-register on first call, credentials saved locally. No API keys to configure.
- **Selective indexing** — default pages are noindex, but pass `"public": true` when you want Google to find them.
- **Full CRUD** — list, update, delete pages via the API or claim URL.
- **Markdown-native** — the Skill can publish Markdown and renders it as a styled webpage.

## Tech + economics

Cloudflare Workers + R2 + KV. Sub-100ms response globally. Costs about $5/month to serve 10K users.

Free tier: 20 publishes/month, 14-day retention, 500KB per page. MIT open source: https://github.com/jieshu666/ShipPage-Skill

Comparison vs. Vercel / Netlify / PageDrop: https://shippage.ai/blog/shippage-vs-vercel-netlify-pagedrop

Happy to answer questions. Particularly interested in feedback on the auto-registration flow — is it the right default or does it create spam risk?
```

**For r/mcp**: Shorten, lean heavier on MCP server angle. Emphasize `publish_html`, `publish_markdown`, `list_pages`, `delete_page` tool surface.

**For r/LocalLLaMA**: Emphasize the API angle (works with any HTTP client = works with local models too). Note it's MIT and self-hostable if they want (fork the Worker).

**Posting tips**:
- Each subreddit has a different vibe — re-read the top 5 posts before submitting
- Never cross-post the same title within 15 min
- Respond to comments within 1 hr for the first 3 hrs
- Don't DM mods asking for promotion

---

## 6. V2EX — Thursday 10:00 PT

**节点**: `/go/create` 或 `/go/share`

**标题**: `做了个小工具：一个 API call 把 HTML 变成公网 URL（给 AI Agent 用的）`

**正文**:
```
## 痛点

用 AI 生成 HTML（报告、产品页、数据看板）之后，想换个设备看或发给别人，发现没有顺手方案。微信打不开本地 HTML，截图又丢了交互。

## 解决

做了 ShipPage，一个 API 调用进去，一个公网 URL 出来：

```bash
curl -X POST https://shippage.ai/v1/publish \
  -H "Content-Type: application/json" \
  -d '{"html": "<h1>Hello</h1>", "title": "Test", "public": true}'
```

返回：
```json
{"ok":true,"url":"https://shippage.ai/p/abc123","slug":"abc123","expires_at":"2026-05-03T..."}
```

## 技术架构

- 后端：Cloudflare Workers + Hono
- 存储：R2 存 HTML + KV 存元数据
- 零注册：第一次调用自动创建 agent 身份，API key 存本地
- 选择性收录：默认 noindex；传 `"public": true` 才放进 sitemap 让 Google 索引
- 成本：一万用户大概 $5/月

## 集成方式

- OpenClaw Skill：`clawhub install shippage`
- MCP Server：`npx shippage-mcp`（Claude Desktop / Cursor）
- 直接 API：curl 即可

## 免费额度

每月 20 次发布，14 天保留，500KB 上限。

主页：https://shippage.ai
博客（技术对比）：https://shippage.ai/blog/shippage-vs-vercel-netlify-pagedrop
GitHub：https://github.com/jieshu666/ShipPage-Skill

欢迎反馈。特别想听听对自动注册这个模式的看法——在国内场景合适吗？
```

---

## 7. 即刻 — Thursday 10:05 PT

**内容**:
```
AI 生成的 HTML，换个设备就废了。微信里打不开，发给别人只能截图。

所以做了个小工具：一个 API call 进去，一个公网 URL 出来。

给 OpenClaw 做了 skill，对 agent 说"publish this"就完事了。

零注册，零配置，agent 装了就能用。现在加了「公开索引」开关，想被 Google 收录就传 "public": true。

clawhub install shippage
shippage.ai
```

**tag**: `#AI工具` `#独立开发` `#OpenClaw` `#出海产品`

**图片** (3 张):
1. curl 调用 + 返回 URL 的终端截图
2. 手机浏览器打开页面的截图
3. shippage.ai/templates 截图（展示模板库）

---

## 8. 掘金 — Thursday 10:10 PT

**标题**: `用 Cloudflare Workers 做了一个 AI Agent 的 HTML 发布服务（零成本起步，附完整架构）`

**分类**: 后端 / 前端（发布时双选）

**正文**: 用 `marketing/v2ex-juejin-posts.md` 里的掘金版本，末尾追加：

```

## 补充：GEO 优化细节

这次上线时额外做了几个面向 LLM 索引的细节：

1. **`/llms.txt` 和 `/llms-full.txt`** — llmstxt.org 标准，专为 LLM 爬虫设计，列出 API 端点 + 核心文档
2. **`/sitemap.xml`** — 自动包含 blog、templates、showcase + 所有 `public: true` 的用户页面
3. **结构化数据** — 落地页用 SoftwareApplication + FAQPage + HowTo 三套 JSON-LD，15 条 FAQ 都是用户会问 AI 的原话（"How do I publish HTML from Claude Code?"）
4. **博客 + 模板画廊 + 展示墙** — 给 LLM 提供可引用的内容 URL

想让发布的页面出现在 Google 搜索里？在 POST body 传 `"public": true` 就行。

主页: https://shippage.ai
博客: https://shippage.ai/blog
模板: https://shippage.ai/templates
GitHub: https://github.com/jieshu666/ShipPage-Skill
```

---

## 9. 微信公众号（杰叔的AI笔记）— Friday 09:00 PT

**标题**: `Agent 能生成万物，但它生成完了放哪？`

用 `marketing/wechat-article.md` 原文，末尾追加：

```
---

## 补充几个细节

这次重写这篇，是因为上周 ShipPage 有了一波大更新，顺便把思路整理下。

新做的几件事：
- `/blog`、`/templates`、`/showcase` 三块内容中心，各自独立路由
- 发布时可以传 `"public": true` 让页面进 sitemap，Google 能索引
- 支持 Plausible 分析（通过 env var 开启，默认关）
- 一套面向 AI 搜索的 `/llms.txt` / `/llms-full.txt`

底层判断没变：**生成能力正在被拉平，交付层才是下一个价差。**

shippage.ai/blog 上写了一篇 《How to publish HTML from Claude, Cursor, or any AI agent》，是我目前看到的最完整的一个教程。

shippage.ai
```

**配图**:
1. 封面：og.svg 样式的深色 + 橙色图
2. 三张截图：curl → URL、手机打开、`/templates` 画廊

---

## 10. WaytoAGI — Friday 09:05 PT

用 `marketing/waytoagi-post.md` 原文，末尾追加：

```

**更新（2026-04）**：这周做了一波升级
- 加了 `/blog`、`/templates`、`/showcase` 三个内容页
- 新增 `"public": true` 字段，发布页可选进 Google 索引
- 落地页结构化数据扩到 15 条 FAQ + HowTo schema，更容易被 LLM 引用
- 完整技术对比：shippage.ai/blog/shippage-vs-vercel-netlify-pagedrop

欢迎来玩、来 PR。
```

---

## After the 5 days — what to do next

1. **Stop posting the same copy.** If you get feedback on a specific channel, engage there; don't re-broadcast.
2. **Monitor inbound for 7 days.** Check Plausible, GitHub stars, awesome-list PR comments, HN/PH threads.
3. **Reply to every single comment** on HN and PH for 72 hrs. This drives second-order traffic when people check back.
4. **Move to passive mode**: the blog + templates + showcase will keep pulling GEO traffic without more effort.
5. **Track monthly GEO**: ask ChatGPT / Claude / Perplexity / Gemini the 20-query list (see plan file) on the 1st of each month.

---

## Common pitfalls

- **Don't ask for upvotes** — auto-flagged on HN and downranked on PH
- **Don't cross-post same text within 24 hrs** — Reddit spam filter
- **Don't DM journalists** until you have 200+ stars or a credible launch
- **Don't run paid ads for Week 1** — organic signal is what awesome-lists/LLMs learn from; ads pollute the attribution
- **Don't use AI to write comment replies** — people can tell, and it kills your credibility permanently
