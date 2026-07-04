#!/usr/bin/env bash
# ShipPage — one-shot finish: deploy the merged code + publish npm 1.2.1.
# Run this once. It will pause for two logins that only you can do
# (Cloudflare browser consent, then npm). Everything else is automatic.
set -e
cd "$(dirname "$0")"

# The local HTTP(S) proxy breaks wrangler's localhost OAuth callback — drop it
# for this session only.
unset HTTP_PROXY HTTPS_PROXY http_proxy https_proxy

echo ""
echo "================================================================"
echo " 1/4  Cloudflare login — a browser tab will open; click ALLOW"
echo "================================================================"
npx wrangler login

echo ""
echo "================================================================"
echo " 2/4  Deploy to production (shippage.ai)"
echo "================================================================"
npx wrangler deploy

echo ""
echo "================================================================"
echo " 3/4  npm login — enter your username / password / OTP"
echo "================================================================"
cd shippage-mcp
npm login

echo ""
echo "================================================================"
echo " 4/4  Publish shippage-mcp@1.2.1  (adds --otp if 2FA prompts)"
echo "================================================================"
npm publish || npm publish  # second attempt lets you retry with an OTP
cd ..

echo ""
echo "================================================================"
echo " Verifying the live site"
echo "================================================================"
sleep 4
for p in / /showcase /docs /docs/api /pricing /sitemap.xml /favicon.svg /og.png; do
  printf "  %-16s " "$p"
  curl -s -o /dev/null -w "HTTP %{http_code}  (%{time_total}s)\n" --max-time 15 "https://shippage.ai$p"
done
echo ""
echo "npm live version:"
npm view shippage-mcp version 2>/dev/null || true
echo ""
echo "Done. Tell Claude 'deployed' and it will finish the MCP registry"
echo "submissions and reopen the awesome-mcp-servers PR."
