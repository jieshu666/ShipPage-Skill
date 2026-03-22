# ShipPage

**HTML in. URL out. Zero config.**

AI Agent 的一键 HTML 发布服务。Agent 装了就能用，首次调用自动注册，零配置。

## 使用方式

### Claude Code (OpenClaw Skill)

```bash
clawhub install shippage
```

### MCP Server (Claude Desktop / Cursor / 其他)

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

### 直接 API 调用

```bash
# 首次调用自动注册，返回 api_key + 页面 URL
curl -X POST https://shippage.ai/v1/publish \
  -H "Content-Type: application/json" \
  -d '{"html": "<html><body><h1>Hello!</h1></body></html>", "title": "My Page"}'
```

## API

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/v1/publish` | 发布 HTML，返回公开 URL |
| GET | `/v1/pages` | 列出已发布的页面 |
| PUT | `/v1/pages/:slug` | 更新页面 |
| DELETE | `/v1/pages/:slug` | 删除页面 |
| GET | `/p/:slug` | 访问已发布的页面 |

### POST /v1/publish 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `html` | ✅ | HTML 内容 |
| `title` | | 页面标题 |
| `slug` | | 自定义 URL 路径 |
| `password` | | 访问密码 |
| `expires_in` | | 过期秒数（默认 14 天） |

## 免费额度

- 20 次发布 / 月
- 500KB / 页面
- 14 天自动过期

## 技术栈

- Cloudflare Workers + Hono
- Cloudflare R2（HTML 存储）
- Cloudflare KV（元数据）
- TypeScript

## License

MIT
