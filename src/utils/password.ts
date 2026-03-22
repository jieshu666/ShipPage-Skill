export function generatePasswordPage(slug: string, siteUrl: string, error?: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Required - ShipPage</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #0a0a0a; color: #fff; font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
    .card { background: #141414; border: 1px solid #222; border-radius: 12px; padding: 40px; max-width: 380px; width: 90%; }
    h1 { font-size: 18px; font-weight: 600; margin-bottom: 8px; }
    p { font-size: 13px; color: #888; margin-bottom: 24px; }
    .error { color: #ff4444; font-size: 13px; margin-bottom: 16px; }
    input { width: 100%; padding: 12px 16px; background: #0a0a0a; border: 1px solid #333; border-radius: 8px; color: #fff; font-size: 14px; outline: none; margin-bottom: 16px; }
    input:focus { border-color: #f97316; }
    button { width: 100%; padding: 12px; background: #f97316; color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; }
    button:hover { background: #ea580c; }
    .footer { text-align: center; margin-top: 24px; font-size: 11px; color: #555; }
    .footer a { color: #555; text-decoration: none; }
  </style>
</head>
<body>
  <div class="card">
    <h1>🔒 Password Required</h1>
    <p>This page is protected. Enter the password to continue.</p>
    ${error ? `<div class="error">${error}</div>` : ''}
    <form method="POST" action="/p/${slug}/verify">
      <input type="password" name="password" placeholder="Enter password" autofocus required>
      <button type="submit">Unlock</button>
    </form>
    <div class="footer"><a href="${siteUrl}">ShipPage</a></div>
  </div>
</body>
</html>`;
}
