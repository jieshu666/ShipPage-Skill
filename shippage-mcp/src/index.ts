#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { renderMarkdown, extractTitle } from './markdown.js';
import { join } from 'path';
import { homedir } from 'os';

const CREDENTIALS_PATH = join(homedir(), '.shippage', 'credentials.json');
const API_BASE = 'https://shippage.ai';

// 读取本地 credentials
function getApiKey(): string | null {
  // 环境变量优先
  if (process.env.SHIPPAGE_API_KEY) return process.env.SHIPPAGE_API_KEY;
  // 本地文件
  if (existsSync(CREDENTIALS_PATH)) {
    const data = JSON.parse(readFileSync(CREDENTIALS_PATH, 'utf-8'));
    return data.api_key || null;
  }
  return null;
}

// 保存 credentials
function saveCredentials(registration: any) {
  const dir = join(homedir(), '.shippage');
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(CREDENTIALS_PATH, JSON.stringify(registration, null, 2));
}

// API 调用
async function apiCall(method: string, path: string, body?: any) {
  const apiKey = getApiKey();
  const headers: any = { 'Content-Type': 'application/json' };
  if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();

  // 如果有自动注册信息，保存到本地
  if (data._registration) {
    saveCredentials(data._registration);
  }

  return data;
}

// 创建 MCP Server
const server = new Server(
  { name: 'shippage-mcp', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

// 定义工具
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'publish_html',
      description: 'Publish HTML content to a public URL accessible from any device. Zero config — auto-registers on first use. Returns a public URL that can be opened on any device, including mobile phones and WeChat.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          html: { type: 'string', description: 'The HTML content to publish' },
          title: { type: 'string', description: 'Page title for display (optional)' },
          slug: { type: 'string', description: 'Custom URL path, e.g. "my-page" (optional)' },
          password: { type: 'string', description: 'Access password to protect the page (optional)' },
        },
        required: ['html'],
      },
    },
    {
      name: 'list_pages',
      description: 'List all pages published by this agent. Shows URLs, titles, view counts, and expiry dates.',
      inputSchema: { type: 'object' as const, properties: {} },
    },
    {
      name: 'publish_markdown',
      description: 'Publish Markdown content as a beautifully styled web page. Converts Markdown to HTML with GitHub-flavored styling, then publishes to a public URL. Supports headings, code blocks, tables, images, lists, blockquotes, and more.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          markdown: { type: 'string', description: 'The Markdown content to publish' },
          title: { type: 'string', description: 'Page title (optional, auto-extracted from first # heading if omitted)' },
          slug: { type: 'string', description: 'Custom URL path, e.g. "my-page" (optional)' },
          password: { type: 'string', description: 'Access password to protect the page (optional)' },
        },
        required: ['markdown'],
      },
    },
    {
      name: 'delete_page',
      description: 'Delete a published page by its slug.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          slug: { type: 'string', description: 'The slug of the page to delete' },
        },
        required: ['slug'],
      },
    },
  ],
}));

// 格式化发布响应
function formatPublishResponse(result: any): string {
  if (result.ok) {
    let text = `Published! URL: ${result.url}`;
    if (result._registration) {
      text += `\n\nFirst-time setup complete. Credentials saved automatically.`;
      text += `\nManage your pages at: ${result._registration.claim_url} (optional)`;
    }
    return text;
  }
  let text = `Error: ${result.error}`;
  if (result.upgrade_url) text += `\nUpgrade at: ${result.upgrade_url}`;
  return text;
}

// 处理工具调用
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'publish_html': {
      const result = await apiCall('POST', '/v1/publish', args);
      return { content: [{ type: 'text', text: formatPublishResponse(result) }] };
    }

    case 'publish_markdown': {
      const { markdown, title, slug, password } = args as any;
      const resolvedTitle = title || extractTitle(markdown) || undefined;
      const html = renderMarkdown(markdown, resolvedTitle);

      const result = await apiCall('POST', '/v1/publish', {
        html,
        title: resolvedTitle,
        slug,
        password,
      });
      return { content: [{ type: 'text', text: formatPublishResponse(result) }] };
    }

    case 'list_pages': {
      const result = await apiCall('GET', '/v1/pages');
      if (!result.pages) {
        return { content: [{ type: 'text', text: `Error: ${result.error || 'Unknown error'}` }] };
      }
      const text = result.pages.length === 0
        ? 'No pages published yet.'
        : result.pages.map((p: any) =>
            `• ${p.title} — ${p.url} (${p.views} views, expires ${p.expires_at})`
          ).join('\n') + `\n\nUsage: ${result.usage.used}/${result.usage.limit} this month`;

      return { content: [{ type: 'text', text }] };
    }

    case 'delete_page': {
      const result = await apiCall('DELETE', `/v1/pages/${(args as any).slug}`);
      return {
        content: [{ type: 'text', text: result.ok ? `Deleted: ${(args as any).slug}` : `Error: ${result.error}` }],
      };
    }

    default:
      return { content: [{ type: 'text', text: `Unknown tool: ${name}` }] };
  }
});

// 启动
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
main().catch(console.error);
