import { marked } from 'marked';

// 配置 marked：启用 GFM
marked.setOptions({ gfm: true, breaks: false });

/** 从 Markdown 中提取第一个 h1 标题 */
export function extractTitle(markdown: string): string | null {
  const match = markdown.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : null;
}

/** 将 Markdown 转为带样式的完整 HTML 页面 */
export function renderMarkdown(markdown: string, title?: string): string {
  const resolvedTitle = title || extractTitle(markdown) || 'Untitled';
  const htmlContent = marked.parse(markdown) as string;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(resolvedTitle)}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 32px 24px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
      font-size: 16px;
      line-height: 1.6;
      color: #24292f;
      background: #fff;
    }
    .markdown-body {
      max-width: 800px;
      margin: 0 auto;
    }
    /* Headings */
    .markdown-body h1, .markdown-body h2, .markdown-body h3,
    .markdown-body h4, .markdown-body h5, .markdown-body h6 {
      margin-top: 24px;
      margin-bottom: 16px;
      font-weight: 600;
      line-height: 1.25;
    }
    .markdown-body h1 { font-size: 2em; padding-bottom: 0.3em; border-bottom: 1px solid #d1d9e0; }
    .markdown-body h2 { font-size: 1.5em; padding-bottom: 0.3em; border-bottom: 1px solid #d1d9e0; }
    .markdown-body h3 { font-size: 1.25em; }
    .markdown-body h4 { font-size: 1em; }
    /* Paragraphs & lists */
    .markdown-body p, .markdown-body ul, .markdown-body ol { margin-top: 0; margin-bottom: 16px; }
    .markdown-body ul, .markdown-body ol { padding-left: 2em; }
    .markdown-body li + li { margin-top: 0.25em; }
    /* Links */
    .markdown-body a { color: #0969da; text-decoration: none; }
    .markdown-body a:hover { text-decoration: underline; }
    /* Code */
    .markdown-body code {
      padding: 0.2em 0.4em;
      font-size: 85%;
      background: #f6f8fa;
      border-radius: 6px;
      font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
    }
    .markdown-body pre {
      padding: 16px;
      overflow-x: auto;
      font-size: 85%;
      line-height: 1.45;
      background: #f6f8fa;
      border-radius: 6px;
      margin-bottom: 16px;
    }
    .markdown-body pre code {
      padding: 0;
      background: transparent;
      border-radius: 0;
      font-size: 100%;
    }
    /* Blockquote */
    .markdown-body blockquote {
      margin: 0 0 16px 0;
      padding: 0 1em;
      color: #656d76;
      border-left: 0.25em solid #d1d9e0;
    }
    /* Table */
    .markdown-body table {
      border-collapse: collapse;
      width: 100%;
      margin-bottom: 16px;
      overflow-x: auto;
      display: block;
    }
    .markdown-body th, .markdown-body td {
      padding: 6px 13px;
      border: 1px solid #d1d9e0;
    }
    .markdown-body th { font-weight: 600; background: #f6f8fa; }
    .markdown-body tr:nth-child(even) { background: #f6f8fa; }
    /* Images */
    .markdown-body img { max-width: 100%; height: auto; }
    /* Horizontal rule */
    .markdown-body hr {
      height: 0.25em;
      padding: 0;
      margin: 24px 0;
      background: #d1d9e0;
      border: 0;
    }
    /* Responsive */
    @media (max-width: 768px) {
      body { padding: 16px 12px; font-size: 15px; }
    }
  </style>
</head>
<body>
  <article class="markdown-body">
    ${htmlContent}
  </article>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
