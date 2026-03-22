# ShipPage — HTML 进去，URL 出来。零配置。

[![npm version](https://img.shields.io/npm/v/shippage-mcp)](https://www.npmjs.com/package/shippage-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> 为 AI Agent 打造的即时 HTML 发布服务。一次 API 调用即可将任意 HTML 发布为公网 URL。无需注册，无需配置 —— 首次调用自动完成一切。

[English](./README.md) | [中文](#)

---

## ShipPage 是什么？

ShipPage 是一个零配置的 HTML 发布服务，专为 AI Agent 设计。它可以通过一次 API 调用将任意 HTML 内容转换为可公开访问的 URL。当 AI Agent 首次调用发布接口时，ShipPage 会自动注册 Agent、签发 API Key 并返回在线 URL —— 全部在一次请求中完成，无需人工配置。

ShipPage 基于 Cloudflare Workers、R2 和 KV 构建，全球边缘部署，响应时间 <100ms。支持密码保护页面、自定义 URL、完整的增删改查管理，并与 OpenClaw 和 MCP 生态深度集成。

## 快速开始

### 方式一：OpenClaw Skill（Claude Code）

```bash
clawhub install shippage
```

然后告诉你的 AI：*"把这个发布成网页"* —— 搞定。

### 方式二：MCP Server（Claude Desktop / Cursor）

在 `claude_desktop_config.json` 中添加：

```json
{
  "mcpServers": {
    "shippage": {
      "command": "npx",
      "args": ["shippage-mcp"]
    }
  }
}
```

无需 API Key，无需环境变量。

### 方式三：直接 API 调用

```bash
curl -X POST https://shippage.ai/v1/publish \
  -H "Content-Type: application/json" \
  -d '{
    "html": "<html><body><h1>你好世界！</h1></body></html>",
    "title": "我的页面"
  }'
```

响应：

```json
{
  "ok": true,
  "url": "https://shippage.ai/p/x7k2m9",
  "slug": "x7k2m9",
  "expires_at": "2026-04-05T14:30:00Z",
  "_registration": {
    "api_key": "sk_...",
    "claim_url": "https://shippage.ai/claim/ABCD-1234"
  }
}
```

保存 `api_key` 用于后续请求。`claim_url` 可让用户在网页上管理页面（可选）。

## API 接口

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| `POST` | `/v1/publish` | 发布 HTML，返回公网 URL | 可选（无 Key 则自动注册） |
| `GET` | `/v1/pages` | 列出所有已发布页面 | 必需 |
| `PUT` | `/v1/pages/:slug` | 更新页面 | 必需 |
| `DELETE` | `/v1/pages/:slug` | 删除页面 | 必需 |
| `GET` | `/p/:slug` | 访问已发布的页面 | 无需 |

### POST /v1/publish 参数

| 参数 | 必填 | 类型 | 说明 |
|------|------|------|------|
| `html` | 是 | string | 要发布的 HTML 内容 |
| `title` | 否 | string | 页面标题 |
| `slug` | 否 | string | 自定义 URL 路径（如 `my-page` → `shippage.ai/p/my-page`） |
| `password` | 否 | string | 设置访问密码 |
| `expires_in` | 否 | number | 过期秒数（默认 1,209,600 = 14 天） |

## 功能对比

| 功能 | ShipPage | PageDrop | 手动部署 |
|------|----------|----------|---------|
| 零配置 | ✅ | ✅ | ❌ |
| Agent 身份系统 | ✅ | ❌ | ❌ |
| 页面管理（增删改查） | ✅ | ❌ | 视情况 |
| 密码保护 | ✅ | ❌ | 视情况 |
| 自定义 URL | ✅ | ❌ | ✅ |
| OpenClaw + MCP 生态 | ✅ | ❌ | ❌ |
| 自动过期清理 | ✅ | ✅ | ❌ |

## 免费额度

| 限制 | 值 |
|------|-----|
| 每月发布次数 | 20 次 |
| 最大页面大小 | 500 KB |
| 页面保留时间 | 14 天 |
| 密码保护 | ✅ 包含 |
| 自定义 URL | ✅ 包含 |

无需信用卡。

## 常见问题

**Q: 使用前需要注册吗？**
A: 不需要。ShipPage 在首次 API 调用时自动注册你的 AI Agent。无需注册、无需表单、无需邮箱验证。

**Q: 页面过期后会怎样？**
A: 免费版页面 14 天后过期并自动清理。你可以随时重新发布。Pro 版本（即将推出）提供永久页面。

**Q: 不用 Claude 可以用 ShipPage 吗？**
A: 可以。ShipPage 支持任意 HTTP 客户端。API 是标准的 REST 接口 —— 可以从任何 AI Agent、脚本或工具调用。

**Q: ShipPage 开源吗？**
A: 是的。源代码在 [github.com/Uncle-Jacky/ShipPage-Skill](https://github.com/Uncle-Jacky/ShipPage-Skill)，MIT 协议开源。

## 技术栈

- **运行时**：[Cloudflare Workers](https://workers.cloudflare.com/) + [Hono](https://hono.dev/)
- **存储**：[Cloudflare R2](https://www.cloudflare.com/r2/)（HTML 文件）
- **元数据**：[Cloudflare KV](https://www.cloudflare.com/kv/)（Agent 记录、页面元数据）
- **语言**：TypeScript

## 贡献

欢迎贡献！请提 Issue 或提交 Pull Request。

## 开源协议

[MIT](LICENSE)
