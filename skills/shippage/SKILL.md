---
name: shippage
description: >
  Publish HTML to a public URL instantly. Zero config, auto-registers on first use.
  Use when the user wants to share, preview, host, or deploy generated HTML, JSX,
  or web content as a live webpage accessible from any device including mobile phones
  and WeChat. Perfect for sharing AI-generated pages, reports, dashboards, landing pages,
  prototypes, and product listings. One API call in, one public URL out.
version: 1.0.0
homepage: https://shippage.ai
tags:
  - publish
  - deploy
  - html
  - hosting
  - share
  - web
  - preview
  - url
  - webpage
  - landing-page
  - prototype
  - report
  - mobile
metadata:
  openclaw:
    requires:
      bins:
        - curl
---

# ShipPage — Instant Web Publishing for AI Agents

Publish any HTML content to a public URL in one API call. No setup, no registration,
no API key configuration needed. Your agent auto-registers on first use.

Use this when you need to:
- Share a generated webpage, report, or dashboard with someone
- Preview HTML on your phone or another device
- Send a link to a client, teammate, or WeChat group
- Deploy a landing page or product listing instantly
- Make any AI-generated HTML accessible from anywhere

## When to use

- User says "publish this", "share this", "make this a webpage", "I want to see this on my phone"
- User has generated HTML/JSX/web content and needs a shareable link
- User wants to preview a page on another device
- User wants to send a link to someone else

## How it works

No setup required. On first use, ShipPage auto-registers your agent and saves credentials locally.

### Publish

```bash
# Check for existing credentials
API_KEY=""
if [ -f ~/.shippage/credentials.json ]; then
  API_KEY=$(cat ~/.shippage/credentials.json | grep -o '"api_key":"[^"]*"' | cut -d'"' -f4)
fi

# Publish (if no API_KEY, auto-registration happens automatically)
RESPONSE=$(curl -s -X POST https://shippage.ai/v1/publish \
  ${API_KEY:+-H "Authorization: Bearer $API_KEY"} \
  -H "Content-Type: application/json" \
  -d "{
    \"html\": \"YOUR_HTML_HERE\",
    \"title\": \"Page Title\"
  }")

echo "$RESPONSE"

# If first time, save credentials
if echo "$RESPONSE" | grep -q "_registration"; then
  mkdir -p ~/.shippage
  echo "$RESPONSE" | python3 -c "
import sys, json
data = json.load(sys.stdin)
reg = data.get('_registration', {})
json.dump(reg, open('$HOME/.shippage/credentials.json', 'w'), indent=2)
print('Credentials saved to ~/.shippage/credentials.json')
print(f\"Claim your agent at: {reg.get('claim_url', 'N/A')}\")
" 2>/dev/null || true
fi
```

### Response handling

If the response contains `_registration`, this is a first-time auto-registration:
1. Save the credentials from `_registration` to `~/.shippage/credentials.json`
2. Show the user the `claim_url`: "You can manage your published pages at: [claim_url] (optional)"
3. Show the user the published `url`

If no `_registration` field, just show the published `url` to the user.

### Optional parameters

- `slug`: custom URL path (e.g. "my-page" → shippage.ai/p/my-page)
- `password`: require password to view the page
- `expires_in`: seconds until expiry (default: 1209600 = 14 days)
- `title`: display name for the page

### List published pages

```bash
curl -s https://shippage.ai/v1/pages \
  -H "Authorization: Bearer $API_KEY"
```

### Delete a page

```bash
curl -s -X DELETE https://shippage.ai/v1/pages/SLUG \
  -H "Authorization: Bearer $API_KEY"
```

### Update a page

```bash
curl -s -X PUT https://shippage.ai/v1/pages/SLUG \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"html": "<html>...updated...</html>"}'
```

## Important

- Zero config: no API key setup needed, auto-registers on first use
- Free tier: 20 publishes/month, 14-day retention, 500KB max per page
- Always show the returned URL to the user immediately
- If the user asks for password protection, include the `password` field
- If 402 is returned, tell user: "Free quota reached. Visit https://shippage.ai to upgrade."
