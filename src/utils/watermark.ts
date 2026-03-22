export function injectWatermark(html: string, siteUrl: string): string {
  const watermark = `
<div style="text-align:center;padding:12px 0 8px;font-family:-apple-system,sans-serif;font-size:11px;color:#999;border-top:1px solid #eee;margin-top:40px;">
  <a href="${siteUrl}" target="_blank" rel="noopener" style="color:#999;text-decoration:none;">Hosted by ShipPage</a>
</div>`;

  // 尝试在 </body> 前插入
  if (html.includes('</body>')) {
    return html.replace('</body>', `${watermark}</body>`);
  }
  // 没有 body 标签就直接追加
  return html + watermark;
}
