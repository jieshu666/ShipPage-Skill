import { Hono } from 'hono';
import type { AppBindings } from '../types';

const pricing = new Hono<AppBindings>();

pricing.get('/pricing', (c) => {
  const s = c.env.SITE_URL;
  const plausible = c.env.PLAUSIBLE_DOMAIN
    ? `<script defer data-domain="${c.env.PLAUSIBLE_DOMAIN}" src="https://plausible.io/js/script.outbound-links.js"></script>`
    : '';
  const faq = [
    { q: 'Do I need an account or credit card?', a: 'No. ShipPage auto-registers your agent on the first publish and returns an API key. No signup, no card.' },
    { q: 'What happens when a free page expires?', a: 'Free-tier pages are kept for 14 days, then removed. You can re-publish at any time. Permanent pages are part of the upcoming Pro tier.' },
    { q: 'How much will Pro cost?', a: 'Pro is still in development and free during the beta. Join the early-access list and you will help set what it includes before it is priced.' },
    { q: 'Is there a rate limit?', a: 'The free tier allows 20 publishes per month, 500 KB per page. That resets monthly.' },
  ];
  const faqLd = `<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  })}</script>`;

  return c.html(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pricing — ShipPage</title>
  ${plausible}
  <meta name="description" content="ShipPage pricing. Free tier: 20 publishes/month, 14-day retention, 500KB per page, no credit card. A Pro tier with permanent pages and custom domains is in development.">
  <meta name="robots" content="index,follow">
  <link rel="canonical" href="${s}/pricing">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <meta property="og:title" content="Pricing — ShipPage">
  <meta property="og:description" content="Start free: 20 publishes/month, no credit card. Pro (permanent pages, custom domains) is in early access.">
  <meta property="og:url" content="${s}/pricing">
  <meta property="og:image" content="${s}/og.png">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:image" content="${s}/og.png">
  ${faqLd}
  <style>
    *,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
    :root{--bg:#0a0a0a;--panel:#141414;--border:#222;--border-light:#2e2e2e;--text:#f0f0f0;--muted:#9aa0a6;--dim:#5a6068;--accent:#f97316}
    body{background:var(--bg);color:var(--text);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;line-height:1.7;-webkit-font-smoothing:antialiased}
    a{color:var(--accent);text-decoration:none}a:hover{text-decoration:underline}
    nav.top{position:sticky;top:0;z-index:50;background:rgba(10,10,10,.85);backdrop-filter:blur(12px);border-bottom:1px solid var(--border)}
    nav.top .in{max-width:1000px;margin:0 auto;height:56px;display:flex;align-items:center;justify-content:space-between;padding:0 24px}
    .logo{font-size:18px;font-weight:700;color:var(--text)}.logo span{color:var(--accent)}
    nav.top .lk{display:flex;gap:22px;font-size:14px}nav.top .lk a{color:var(--muted)}nav.top .lk a:hover{color:var(--text);text-decoration:none}
    .wrap{max-width:1000px;margin:0 auto;padding:0 24px}
    header{text-align:center;padding:72px 0 32px}
    header h1{font-size:38px;font-weight:800;letter-spacing:-1px;margin-bottom:12px}
    header p{color:var(--muted);font-size:17px}
    .grid{display:grid;grid-template-columns:1fr;gap:16px;padding:24px 0 8px}
    .card{background:var(--panel);border:1px solid var(--border);border-radius:14px;padding:28px;position:relative}
    .card.featured{border-color:var(--accent)}
    .badge{position:absolute;top:-11px;left:28px;background:var(--accent);color:#fff;font-size:11px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;padding:4px 12px;border-radius:20px}
    .card h2{font-size:20px;margin-bottom:4px}
    .card .who{color:var(--muted);font-size:14px;margin-bottom:16px}
    .amount{font-size:38px;font-weight:800;margin-bottom:20px}.amount span{font-size:15px;color:var(--muted);font-weight:400}
    .amount.small{font-size:22px}
    ul{list-style:none;margin-bottom:24px}
    li{padding:7px 0 7px 26px;position:relative;color:#d6d9dd;font-size:14.5px;border-bottom:1px solid #191919}
    li::before{content:"→";position:absolute;left:0;color:var(--accent)}
    .btn{display:block;text-align:center;padding:12px;border-radius:8px;font-weight:600;font-size:14px}
    .btn-primary{background:var(--accent);color:#fff}.btn-primary:hover{background:#ea6a08;text-decoration:none}
    .btn-secondary{background:transparent;color:var(--text);border:1px solid var(--border-light)}.btn-secondary:hover{border-color:var(--muted);text-decoration:none}
    form input{width:100%;padding:11px 14px;background:var(--bg);border:1px solid var(--border-light);border-radius:8px;color:var(--text);font-size:14px;outline:none;margin-bottom:8px;font-family:inherit}
    form input:focus{border-color:var(--accent)}
    #msg{display:none;text-align:center;font-size:13px;margin-top:8px}
    .faq{padding:40px 0 24px}
    .faq h2{font-size:24px;margin-bottom:20px;text-align:center}
    .qa{border-top:1px solid var(--border);padding:18px 0}
    .qa h3{font-size:16px;margin-bottom:6px}
    .qa p{color:var(--muted);font-size:14.5px}
    footer{border-top:1px solid var(--border);padding:28px 24px;text-align:center;color:var(--dim);font-size:13px;margin-top:24px}
    footer a{color:var(--dim)}
    @media(min-width:760px){.grid{grid-template-columns:1fr 1fr}header h1{font-size:44px}}
  </style>
</head>
<body>
  <nav class="top"><div class="in">
    <a href="/" class="logo">Ship<span>Page</span></a>
    <div class="lk">
      <a href="/docs">Docs</a><a href="/templates">Templates</a><a href="/blog">Blog</a>
      <a href="/pricing">Pricing</a><a href="https://github.com/jieshu666/ShipPage-Skill" target="_blank" rel="noopener">GitHub</a>
    </div>
  </div></nav>

  <header>
    <div class="wrap">
      <h1>Simple, honest pricing</h1>
      <p>Start free — no account, no credit card. Pro is on the way.</p>
    </div>
  </header>

  <div class="wrap">
    <div class="grid">
      <div class="card">
        <h2>Free</h2>
        <div class="who">Everything you need to publish and share.</div>
        <div class="amount">$0<span> / month</span></div>
        <ul>
          <li>20 publishes per month</li>
          <li>14-day page retention</li>
          <li>500&nbsp;KB per page</li>
          <li>Password protection</li>
          <li>Custom URL slugs</li>
          <li>Full REST API + MCP + skill access</li>
        </ul>
        <a href="/docs/quickstart" class="btn btn-primary">Publish your first page</a>
      </div>

      <div class="card featured">
        <div class="badge">Early access</div>
        <h2>Pro</h2>
        <div class="who">In development — free while in beta.</div>
        <div class="amount small">Free during beta</div>
        <ul>
          <li>Permanent pages (no 14-day expiry)</li>
          <li>Larger pages &amp; higher monthly limits</li>
          <li>Custom domains</li>
          <li>Remove the ShipPage badge</li>
          <li>Page view analytics</li>
        </ul>
        <form id="wl">
          <input type="email" name="email" placeholder="your@email.com" required>
          <button type="submit" class="btn btn-primary">Get early access</button>
        </form>
        <p id="msg"></p>
      </div>
    </div>

    <section class="faq">
      <h2>Pricing FAQ</h2>
      ${faq.map((f) => `<div class="qa"><h3>${f.q}</h3><p>${f.a}</p></div>`).join('')}
    </section>
  </div>

  <footer><a href="/">← ShipPage</a> · <a href="/docs">Docs</a> · <a href="/blog">Blog</a></footer>

  <script>
    var f=document.getElementById('wl'),m=document.getElementById('msg');
    f.addEventListener('submit',async function(e){
      e.preventDefault();
      var email=f.email.value.trim();if(!email)return;
      var btn=f.querySelector('button');btn.disabled=true;btn.textContent='...';
      try{
        var r=await fetch('/v1/waitlist',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:email})});
        var d=await r.json();
        m.style.display='block';
        if(d.ok){m.style.color='#4ade80';m.textContent='You are on the list — thanks!';f.reset();}
        else{m.style.color='#ef4444';m.textContent=d.error||'Something went wrong.';}
      }catch(_){m.style.display='block';m.style.color='#ef4444';m.textContent='Network error.';}
      btn.disabled=false;btn.textContent='Get early access';
    });
  </script>
</body>
</html>`);
});

export default pricing;
