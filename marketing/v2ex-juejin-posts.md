# V2EX 帖子

**节点：** /go/share 或 /go/create

**标题：** 做了个小工具：一个 API call 把 HTML 变成公网 URL（给 AI Agent 用的）

**内容：**

## 痛点

用 AI 生成 HTML（报告、产品页、数据看板）之后，想换个设备看，或者发给别人，发现没有一个顺手的方案。微信打不开本地 HTML，截图又丢了交互。

## 解决

做了 ShipPage，一个 API 调用进去，一个公网 URL 出来：

```bash
curl -X POST https://shippage.ai/v1/publish \
  -H "Content-Type: application/json" \
  -d '{"html": "<h1>Hello World</h1>", "title": "Test"}'
```

返回：
```json
{
  "url": "https://shippage.ai/p/abc123",
  "slug": "abc123",
  "expires_at": "2026-04-06T..."
}
```

## 技术架构

- 后端：Cloudflare Workers + Hono 框架
- 存储：R2（HTML 文件）+ KV（元数据、agent 身份、页面索引）
- 零注册：第一次调用自动创建 agent 身份，API key 存本地，类似 EvoMap 的 agent identity 模型
- 密码保护：SHA-256 hash，不存明文
- 定时清理：每天 cron job 删过期页面
- 成本：一万用户大概 $5/月

## 集成方式

- OpenClaw Skill：`clawhub install shippage`（对 agent 说"发布这个"就行）
- MCP Server：`npx shippage-mcp`（Claude Desktop / Cursor 用）
- 直接 API：curl 调用

## 免费额度

每月 20 次发布，14 天保留，500KB 上限。

主页：https://shippage.ai
GitHub：https://github.com/jieshu666/ShipPage-Skill

欢迎反馈。

---

# 掘金文章

**标题：** 用 Cloudflare Workers 做了一个 AI Agent 的 HTML 发布服务（零成本起步）

**内容：**

## 背景

AI Agent 现在能生成各种 HTML 内容——报告、landing page、数据看板。但生成完之后呢？HTML 文件躺在本地，手机打不开，发给别人只能截图。

我想做一个最简单的解决方案：一个 API 调用进去，一个公网 URL 出来。

## 架构设计

整个服务跑在 Cloudflare Workers 上，总共三个存储组件：

### 1. Cloudflare R2 — HTML 文件存储

每次发布，HTML 内容存到 R2 bucket。Key 用 `pages/{slug}.html` 格式。R2 的免费额度是 10GB 存储 + 每月 1000 万次读取，对这个场景绰绰有余。

### 2. Cloudflare KV — 元数据存储

三类 KV 数据：
- `page:{slug}` — 页面元数据（标题、创建时间、过期时间、密码 hash）
- `agent:{agentId}` — Agent 身份（API key、创建时间、发布计数）
- `agent:{agentId}:pages` — 页面索引（用于列表查询）

### 3. Worker 本身 — 路由和逻辑

用 Hono 框架，几个核心路由：
- `POST /v1/publish` — 发布页面
- `GET /v1/pages` — 列出页面
- `PUT /v1/pages/:slug` — 更新页面
- `DELETE /v1/pages/:slug` — 删除页面
- `GET /p/:slug` — 访问页面

## 零注册的 Agent 身份系统

这是最有意思的部分。传统 SaaS 的流程是：注册 → 获取 API key → 配置 → 使用。但 AI Agent 不会注册。

借鉴了 EvoMap 的 agent identity 模型，实现了自动注册：

1. Agent 第一次调用 `/v1/publish`，不带任何认证
2. 服务端自动创建一个 agent 身份，生成 API key
3. 把凭证放在响应的 `_registration` 字段里返回
4. Agent（或 skill）把凭证存到 `~/.shippage/credentials.json`
5. 后续请求自动带上 API key

人类用户完全不需要出现在注册流程里。如果你想管理页面或升级套餐，访问 claim_url 用邮箱认领就行。

## 密码保护

可选功能。发布时带 `password` 字段，存储的是 SHA-256 hash。访问时弹出密码输入框，前端做 hash 后跟后端比对。

## 定时清理

Cloudflare Workers 支持 Cron Triggers。每天凌晨 3 点跑一次，扫描所有过期页面（默认 14 天），删除 R2 文件和 KV 记录。

## 成本测算

| 组件 | 免费额度 | 超出费用 |
|------|---------|---------|
| Workers 请求 | 10 万次/天 | $0.50/百万次 |
| R2 存储 | 10GB | $0.015/GB/月 |
| R2 读取 | 1000 万次/月 | $0.36/百万次 |
| KV 读取 | 10 万次/天 | $0.50/百万次 |

按每个页面平均 50KB，1 万个用户每月发布 20 页 = 20 万页 = 10GB。刚好在免费额度边缘。实际上大部分用户不会用满额度，所以大概 $5/月 能撑住。

## 集成生态

做了三种接入方式：
- **OpenClaw Skill**：`clawhub install shippage`
- **MCP Server**：给 Claude Desktop / Cursor 用
- **直接 API**：curl 就能调

## 总结

Cloudflare Workers 做这种轻量级 API 服务非常合适：全球边缘部署、冷启动快、免费额度够用、R2+KV 组合能覆盖大多数存储场景。

代码开源：https://github.com/jieshu666/ShipPage-Skill
主页：https://shippage.ai
