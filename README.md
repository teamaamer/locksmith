# Locksmith Express MK — website

Static site (HTML + CSS + JS, no build step). Open the folder in VS Code and run it with the **Live Server** extension.

```
index.html          Home page (hero lead form, services, areas map, FAQ, contact form)
privacy.html        Privacy Policy + SMS terms (needed for GoHighLevel A2P / SMS approval)
css/styles.css      All styles (brand colors are CSS variables at the top)
js/main.js          Menu, animations, form validation + submission  ← CONFIG is at the top
assets/             Logo, icons, share image (og-image.jpg), self-hosted font
assets/images/locksmith/  Photographic WebP assets (hero-keys, automotive, residential, commercial, emergency, keys-leather; -520/-900/-1000 are responsive sizes)
robots.txt, sitemap.xml, site.webmanifest
```

## 1. Connect the forms to GoHighLevel + the business email

Both forms (hero "Get help fast" and the contact form) send the same JSON to one URL.

1. In GoHighLevel: **Automation → Workflows → Create workflow → Trigger: Inbound Webhook**. Copy the webhook URL.
2. Paste it in `js/main.js`:
   ```js
   WEBHOOK_URL: "https://services.leadconnectorhq.com/hooks/....",
   ```
3. Submit a test lead from the site so GHL captures the sample data, then add actions:
   - **Create/Update Contact** → map `first_name`, `last_name`, `phone`, `email`, and custom fields `service`, `location`, `urgency`, `message`, `utm_*`, `gclid`.
   - **Send Internal Notification (Email)** → `locksmithexpressmk@gmail.com` with the lead details.
   - Optional: SMS auto-reply (only if `sms_consent` is `true`), create an Opportunity, assign to a user.
4. If the browser console shows a CORS error on submit, use GHL's native form instead (Sites → Forms → embed code) inside the `.form-card`, or route through a small serverless function.

Fields sent: `form_name, full_name, first_name, last_name, phone (+1XXXXXXXXXX), email, service, location, urgency, message, sms_consent, page_url, submitted_at, landing_page, referrer, utm_source, utm_medium, utm_campaign, utm_term, utm_content, gclid, fbclid, msclkid`.

Spam protection: hidden honeypot field (`company_website`). Without a webhook URL the forms run in **preview mode** (they show the success message and log the data to the console).

## 2. Tracking (ads)

Paste Google Tag Manager / GA4 / Meta Pixel code in `<head>` where marked. Each successful form submit pushes `generate_lead` to `dataLayer` and fires `fbq('track','Lead')` — use these as conversions. Optional: set `THANK_YOU_URL` in `CONFIG` to redirect to a thank-you page.

## 3. Before launch — confirm with the client

- **Google reviews**: the homepage links to the supplied Google Business Profile, where customers can read or leave a review.
- **Logo**: `assets/logo.png/.webp` was cut from a screenshot. Swap in the original logo file for the sharpest result.
- **Schema (`<script type="application/ld+json">`)**: add the city/street address exactly as on the Google Business Profile (if shown publicly) and a `"sameAs": [...]` list with the Facebook / Instagram / Google profile URLs.
- Claims used come from the client's current site and posts: 24/7, mobile, no-damage entry, keys made & programmed on-site, free consultations, quality products. Remove any that don't apply.
- `privacy.html` is a standard template — have the client review it.

## 4. Going live (replacing the current WordPress site)

- Upload the folder to the hosting (or deploy to Netlify / Vercel / Cloudflare Pages) and point the domain.
- **Keep rankings:** list every URL of the old site (Search Console → Pages) and 301-redirect each one to the matching new section, e.g. `/services/automotive-locksmith/ → /#automotive`, and the other service / contact pages to `/#residential`, `/#commercial`, `/#contact`.
- Submit `sitemap.xml` in Google Search Console and test the page in Google's Rich Results Test.
- SEO next step: dedicated pages per service and per town (e.g. `/car-locksmith-springfield-ma/`, `/locksmith-chicopee-ma/`) and add them to `sitemap.xml`.
