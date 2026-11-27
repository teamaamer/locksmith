# Locksmith Express MK 24/7 — website

Static multi-page site generated from data files. No runtime framework.
The design is the original Locksmith Express MK WordPress theme, reproduced exactly and self-hosted.

```
data/legacy/*.json    pages, header/footer copied from the original site (tools/mirror-legacy.mjs)
data/*.json           business, services, locations, faqs, campaigns (city, state & ad pages)
css/legacy/*.css      original theme CSS  → bundled with css/site.css into css/theme.css by the build
assets/legacy/        original site images and logo      assets/fa/  Font Awesome (self-hosted)
tools/build.mjs       generator (npm run generate) → index.html, /services, /areas, /lp, … + sitemap.xml, robots.txt, search.json
tools/mirror-legacy.mjs  re-copy design/content from the old WordPress site (npm run mirror) — only while it is still online
tools/qa.mjs          link/SEO checks
js/site.js            menu, search, FAQ, counters, service-area map, quote forms
api/contact.js        Vercel serverless lead endpoint (see .env.example)
server.mjs            local preview: node server.mjs → http://localhost:8765 (dry-run leads)
```

Workflow: edit `data/*.json`, `css/site.css` or `tools/build.mjs` → `npm run generate` → `node tools/qa.mjs` → commit generated HTML.

Lead delivery needs `RESEND_API_KEY` + `EMAIL_FROM` (or `GHL_WEBHOOK_URL`) in Vercel — see `.env.example`.
