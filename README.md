# Locksmith Express MK 24/7 — website

Static multi-page site generated from data files. No runtime framework.

```
data/*.json        business, services, locations, faqs, reviews, campaigns, instagram, images manifest
tools/build.mjs    generator (node tools/build.mjs) → writes index.html, /services, /areas, /lp, etc. + sitemap.xml, robots.txt
tools/layout.mjs   shared header/footer/forms/sections      tools/qa.mjs  link/SEO checks
tools/optimize-images.py  PNG sources → assets/img/*.webp
api/contact.js     Vercel serverless lead endpoint (see .env.example)
server.mjs         local preview: node server.mjs → http://localhost:8765 (dry-run leads)
docs/              reports: implementation checklist, asset + route inventory, security audit
design-references/ the two supplied mockups
```

Workflow: edit `data/*.json` or `tools/*.mjs` → `node tools/build.mjs` → `node tools/qa.mjs` → commit generated HTML.

Lead delivery needs `RESEND_API_KEY` + `EMAIL_FROM` (or `GHL_WEBHOOK_URL`) in Vercel — see `.env.example`.
