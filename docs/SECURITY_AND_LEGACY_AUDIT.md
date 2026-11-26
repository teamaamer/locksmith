# Legacy site audit & security notes

## Findings on the current production site (www.locksmithexpressmk.com, WordPress + Rank Math)
Read-only inspection of the public homepage and sitemaps on 2026-11-26.

| Finding | Evidence | Severity |
|---|---|---|
| Unrelated adult-content article is published and linked from the homepage | `/telegram-porn-indian/` appears in `post-sitemap.xml` and as a link in the homepage HTML | **High – likely SEO spam / possible compromise** (not proven; could also be a hijacked author account or plugin) |
| An unrelated Arabic-named image upload (`تصميم-بدون-عنوان-2`) in `/wp-content/uploads/2026/04/` | linked from the homepage | Low – review |
| Two Google tags on the site | `G-EKMMEP77NM` (GA4), `AW-18069138786` (Google Ads) | Info – these are the client's own; kept in `data/business.json` for confirmation |
| Page URLs differ from the sitemap spec | e.g. `/lock-changing/`, `/re-key/`, `/key-duplication/`, `/car-key-replacement/` | Handled with 301s in `vercel.json` |

Nothing from the legacy blog was migrated. The new site contains only business content, no WordPress, no blog.

## Remediation checklist for the OLD hosting/WordPress (do before or alongside cut-over)
1. Do **not** delete anything yet; export a full backup (files + database) first.
2. Log in to WordPress → Users: look for unknown administrators/authors; reset all passwords; enable 2FA.
3. Posts: unpublish/trash the unrelated post(s); check Drafts, Scheduled and Trash for more.
4. Plugins/themes: remove unused or nulled plugins; update everything; scan with a reputable malware scanner.
5. Check `wp-config.php`, `.htaccess`, `functions.php`, and `/wp-content/uploads` for injected code or `.php` files.
6. Google Search Console: review *Security issues*, *Manual actions*, and the indexed URL list; request removal of spam URLs.
7. Rotate hosting (GoDaddy) and FTP/SSH credentials; review hosting access logs.
8. After the new site goes live, the spam URL will simply 404 on the new host. Remove it from Search Console with the URL-removal tool.

## Security of the new site
- Forms post to `/api/contact` (serverless). Server-side validation, 6 KB size cap, control-character stripping, honeypot, origin check, best-effort per-IP rate limit (5 per 10 min), HTML-escaped email body, no secrets in the browser.
- The form shows success **only** after the API returns `ok` (delivery to email/webhook, or `DEV_DRY_RUN` locally).
- Security headers (HSTS, nosniff, frame-options, referrer policy, permissions policy) in `vercel.json`. A strict Content-Security-Policy is **not** set because gtag requires inline script; revisit if tracking is moved to GTM.
- No third-party scripts except Google tag (loaded after page load).
- The in-memory rate limit resets per serverless instance; for production-grade limiting add Vercel KV/Upstash.
- **Delivery is not live until you set `RESEND_API_KEY` + `EMAIL_FROM` (or `GHL_WEBHOOK_URL`) in Vercel.** Without them the API returns 503 and the form tells users to call.
