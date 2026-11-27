#!/usr/bin/env node
// Static site generator (no dependencies):  node tools/build.mjs
// Design = the legacy Locksmith Express MK WordPress theme, reproduced exactly from data/legacy/*
// (mirrored by tools/mirror-legacy.mjs) and extended with city, state, area and ad landing pages.
import fs from "node:fs";
import path from "node:path";
import { biz, services, locations, faqData, campaigns, esc, write, ROOT } from "./lib.mjs";

const LEG = (k) => JSON.parse(fs.readFileSync(path.join(ROOT, "data/legacy", k + ".json"), "utf8"));
const chrome = LEG("chrome");
const TEL = biz.phoneTel;
const PHONE = biz.phone;
const MA = locations.filter((l) => l.active && l.clientConfirmed && l.stateCode === "MA");
const cityUrl = (l) => `/areas/${l.state.toLowerCase()}/${l.slug}/`;
const routes = [];
const emit = (url, html, { indexable = true, kind = "page", file, title = "" } = {}) => {
  routes.push({ url, indexable, kind, title });
  write(file ?? path.join(url.replace(/^\//, ""), "index.html"), html);
};

/* ---------- one CSS bundle from the legacy theme (+ our small additions) ---------- */
const cssList = JSON.parse(fs.readFileSync(path.join(ROOT, "data/legacy/css.json"), "utf8")).filter((f) => f !== "all.min.css");
const bundle = [...cssList.map((f) => `/* ${f} */\n` + fs.readFileSync(path.join(ROOT, "css/legacy", f), "utf8")), "/* customizer */\n" + fs.readFileSync(path.join(ROOT, "css/legacy/customizer.css"), "utf8"), "/* site additions */\n" + fs.readFileSync(path.join(ROOT, "css/site.css"), "utf8")].join("\n\n");
write("css/theme.css", bundle);
const cssVer = Buffer.from(String(bundle.length)).toString("base64url").slice(0, 8);

/* ---------- text fixes applied to all legacy markup ---------- */
const fix = (h) => h
  .replace(/(?<!["'])tel:\+14134331135(?=\s*<\/a>)/g, PHONE)
  .replace(/Phone Numper/g, "Phone Number")
  .replace(/>westfield</g, ">Westfield<")
  .replace(/&#038;/g, "&amp;")
  .replace(/<img src="(\/assets\/legacy\/2026\/03\/[\w-]+_60dp_[\w-]+\.png)"/g, '<img src="$1" width="60" height="60"');

/* ---------- JSON-LD ---------- */
const localBusinessLd = () => ({
  "@context": "https://schema.org", "@type": "Locksmith", "@id": biz.url + "/#business", name: biz.name, alternateName: "Locksmith Express MK", url: biz.url,
  logo: biz.url + LOGO, image: biz.url + "/assets/legacy/2026/03/hero-Locksmith-Express-MK-1920x800.webp", telephone: "+1-413-433-1135", email: biz.email,
  description: "24/7 mobile locksmith serving Springfield and Western Massachusetts, with service areas in Connecticut: lockouts, car keys, rekeying, lock changes, commercial and safe locksmith services.",
  openingHoursSpecification: [{ "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], opens: "00:00", closes: "23:59" }],
  areaServed: MA.map((l) => ({ "@type": "City", name: `${l.city}, MA` })).concat([{ "@type": "State", name: "Connecticut" }]),
  address: { "@type": "PostalAddress", addressRegion: "MA", addressCountry: "US" },
});
const crumbsLd = (items) => ({ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: biz.url + it.href })) });
const faqLd = (items) => ({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) });
const LOGO = "/assets/legacy/2026/03/cropped-cropped-logo-Locksmith-Express-mk.png";

/* ---------- <head> ---------- */
function head({ title, desc, url, robots = "index, follow, max-image-preview:large", jsonld = [], preload = "" }) {
  const t = biz.tracking;
  const gtag = t.ga4 || t.googleAds
    ? `<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());${t.ga4 ? `gtag('config','${t.ga4}');` : ""}${t.googleAds ? `gtag('config','${t.googleAds}');` : ""}addEventListener('load',function(){setTimeout(function(){var s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id=${t.ga4 || t.googleAds}';document.head.appendChild(s)},2000)})</script>`
    : "";
  const full = biz.url + url;
  return `<!doctype html>
<html lang="en-US">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}">
  <meta name="robots" content="${robots}">
  <link rel="canonical" href="${full}">
  <meta name="format-detection" content="telephone=yes">
  <meta name="theme-color" content="#2C3E50">
  <meta name="geo.region" content="US-MA">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Locksmith Express MK">
  <meta property="og:locale" content="en_US">
  <meta property="og:url" content="${full}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:image" content="${biz.url}/assets/og-image.jpg">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32.png">
  <link rel="icon" type="image/png" sizes="192x192" href="/assets/favicon-192.png">
  <link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
  <link rel="manifest" href="/site.webmanifest">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  ${preload}
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&amp;family=Roboto:wght@300;400;500;700&amp;display=swap">
  <link rel="stylesheet" href="/assets/fa/all.min.css">
  <link rel="stylesheet" href="/css/theme.css?v=${cssVer}">
  ${jsonld.map((j) => `<script type="application/ld+json">${JSON.stringify(j)}</script>`).join("\n  ")}
  ${gtag}
</head>`;
}

/* ---------- header / footer (legacy markup) ---------- */
const NAV = { home: "/", residential: "/services/residential-locksmith/", commercial: "/services/commercial-locksmith/", automotive: "/services/automotive-locksmith/" };
function header(cur, { lp = false } = {}) {
  let h = fix(chrome.header)
    .replace(/ current-menu-item current_page_item menu-item-home/, " menu-item-home")
    .replace(/ aria-current="page"/g, "")
    .replace(/href="\/" class="custom-logo-link"/, 'href="/" class="custom-logo-link" aria-label="Locksmith Express MK home"')
    .replace(/<a href="mailto:[^"]*" class="email-link">[^<]*<\/a>/, `<a href="mailto:${biz.email}" class="email-link">${biz.email}</a>`)
    .replace(/<a href="tel:\+14134331135" class="phone-link">/g, `<a href="tel:${TEL}" class="phone-link" data-track="phone_click" data-cta="topbar">`)
    .replace(/<a href="tel:\+14134331135" class="btn btn-primary">/, `<a href="tel:${TEL}" class="btn btn-primary" data-track="phone_click" data-cta="header">`);
  h = h.replace('<a href="/">Home</a>', '<a href="/">Home</a>');
  if (cur && NAV[cur]) {
    const href = NAV[cur];
    h = h.replace(new RegExp(`(<li id="menu-item-\\d+" class="[^"]*)("><a href="${href.replace(/\//g, "\\/")}")`), `$1 current-menu-item$2 aria-current="page"`);
  }
  if (lp) h = h.replace(/<nav id="site-navigation"[\s\S]*?<\/nav><!-- #site-navigation -->/, "").replace(/<button class="header-search-toggle"[\s\S]*?<\/button>/, "");
  return h + `
<div class="fullscreen-search-modal" id="fullscreenSearchModal" aria-hidden="true" role="dialog" aria-label="Search">
  <button class="search-modal-close" aria-label="Close Search"><i class="fas fa-times" aria-hidden="true"></i></button>
  <div class="search-modal-content">
    <form role="search" class="search-form" action="/" onsubmit="return false">
      <label for="search-form-1"><span class="screen-reader-text">Search for:</span></label>
      <div class="search-field-wrapper"><input type="search" id="search-form-1" class="search-field" placeholder="Search &hellip;" autocomplete="off"><button type="submit" class="search-submit"><i class="fas fa-search" aria-hidden="true"></i><span class="screen-reader-text">Search</span></button></div>
    </form>
    <p class="search-modal-hint">Type a service or a town</p>
    <ul class="search-results" id="searchResults"></ul>
  </div>
</div>
${fix(chrome.floating).replace('href="tel:+14134331135" class="floating-cta-btn"', `href="tel:${TEL}" class="floating-cta-btn" data-track="phone_click" data-cta="floating-bar"`)}`;
}
function footer({ lp = false } = {}) {
  const qb = fix(chrome.quickbar).replace(/<a href="mailto:[^"]*" class="email-link">[^<]*<\/a>/, `<a href="mailto:${biz.email}" class="email-link">${biz.email}</a>`);
  const ft = fix(chrome.footer)
    .replace(/<a href="mailto:[^"]*" class="email-link">[^<]*<\/a>/, `<a href="mailto:${biz.email}" class="email-link">${biz.email}</a>`)
    .replace(/ aria-current="page"/g, "")
    .replace(/&copy; \d{4}/, `&copy; ${new Date().getFullYear()}`)
    .replace(/<div class="footer-bottom-right">\s*<\/div>/, `<div class="footer-bottom-right"><a href="/privacy-policy/">Privacy Policy</a><a href="/terms-of-service/">Terms of Service</a>${lp ? "" : '<a href="/areas/">Areas We Serve</a><a href="/faq/">FAQ</a><a href="/contact/">Contact</a>'}</div>`);
  return (lp ? "" : qb) + ft;
}
function page({ cur = "", body, bodyClass = "", lp = false }) {
  return `<body class="${bodyClass} wp-custom-logo ltr">
<div id="page" class="site">
<a class="skip-link screen-reader-text" href="#primary">Skip to content</a>
${header(cur, { lp })}
${body}
${footer({ lp })}
</div>
<script src="/js/site.js" defer></script>
</body>
</html>`;
}

/* ---------- quote form (Contact Form 7 markup so the theme styles it identically) ---------- */
let formN = 0;
function cf7Form({ service = "General Request", city = "", state = "", source = "", kind = "general", name = "Quote Request", btn = "Submit" } = {}) {
  const p = `f${++formN}`;
  const f = (label, nm, attrs, tag = "input") => `<p class="field"><label for="${p}-${nm}"> ${label}<br><span class="wpcf7-form-control-wrap">${tag === "textarea" ? `<textarea class="wpcf7-form-control wpcf7-textarea" id="${p}-${nm}" name="${nm}" ${attrs}></textarea>` : `<input class="wpcf7-form-control wpcf7-text" id="${p}-${nm}" name="${nm}" ${attrs}>`}</span></label><span class="err" id="${p}-${nm}-err" role="alert"></span></p>`;
  return `<div class="wpcf7 lead-wrap" id="quote-${p}">
<form class="wpcf7-form lead-form" data-form-name="${esc(name)}" data-city="${esc(city)}" data-state="${esc(state)}" data-source="${esc(source)}" novalidate>
${f("Name", "full_name", 'type="text" autocomplete="name" maxlength="80" required')}
${f("Email", "email", 'type="email" autocomplete="email" maxlength="120"')}
${f("Phone Number", "phone", 'type="tel" inputmode="tel" autocomplete="tel" maxlength="20" required')}
${f("Zip Code", "zip", 'type="text" inputmode="numeric" autocomplete="postal-code" maxlength="5" required')}
${kind === "carkey" ? f("Vehicle Year", "vehicle_year", 'type="text" inputmode="numeric" maxlength="4"') + f("Vehicle Make", "vehicle_make", 'type="text" maxlength="40"') + f("Vehicle Model", "vehicle_model", 'type="text" maxlength="40"') : ""}
${f("How Can We Help?", "message", 'cols="40" rows="10" maxlength="2000"', "textarea")}
<input type="hidden" name="service" value="${esc(service)}">
<input class="hp" type="text" name="company_website" tabindex="-1" autocomplete="off" aria-hidden="true">
<p class="consent"><label><input type="checkbox" name="sms_consent" value="yes"><span>I agree to receive calls and text messages from Locksmith Express MK about my request. Msg &amp; data rates may apply. Reply STOP to opt out. <a href="/privacy-policy/">Privacy Policy</a></span></label></p>
<p><input class="wpcf7-form-control wpcf7-submit" type="submit" value="${esc(btn)}"></p>
<p class="form-status" role="status" aria-live="polite"></p>
</form>
<div class="form-success" role="status" aria-live="polite" hidden tabindex="-1"><i class="fas fa-check-circle" aria-hidden="true"></i><h4>Request received<span class="success-name"></span>!</h4><p>Thank you. Our team will contact you shortly. Locked out right now? Call us directly.</p><a class="hero-btn hero-btn-primary" href="tel:${TEL}" data-track="phone_click" data-cta="form-success"><i class="fas fa-phone-alt" aria-hidden="true"></i><span>Call ${PHONE}</span></a></div>
</div>`;
}
const swapForms = (html, opts) => html.replace(/<div class="wpcf7 no-js"[\s\S]*?<\/form>\s*<\/div>/g, () => cf7Form(opts));

/* ---------- legacy homepage sections, reused across pages ---------- */
const HOME = fix(LEG("home").main);
const sec = (cls) => (HOME.match(new RegExp(`<section class="${cls}[^"]*"[\\s\\S]*?</section>`)) || [""])[0];
const SERVICES_SEC = sec("services-section");
const ABOUT_SEC = sec("about-section");
const WHY_SEC = sec("why-section");
const HOW_SEC = (HOME.match(/<section id="how-it-works"[\s\S]*?<\/section>/) || [""])[0];
const STATS_SEC = sec("s-stats-section").replace(/<span class="s-stat-counter" data-target="(\d+)">0<\/span>/g, '<span class="s-stat-counter" data-target="$1">$1</span>');
const TESTI_SEC = sec("testimonials-section");
const LEGACY_FAQS = [...HOME.matchAll(/<span>([^<]+)<\/span>\s*<i class="fas fa-chevron-down"[^>]*><\/i>\s*<\/button>\s*<div class="faq-answer" hidden>\s*<p>([\s\S]*?)<\/p>/g)].map((m) => ({ q: m[1].trim(), a: m[2].trim() }));

function heroSection({ h1, sub, features = ["24/7 Availability", "Licensed &amp; Certified", "Fast Response"], form, formTitle = "Get a Free Quote" }) {
  return `<section class="hero-section" style="background-image: url(/assets/legacy/2026/03/hero-Locksmith-Express-MK-1920x800.webp);">
  <div class="hero-overlay" style="background: rgba(44, 62, 80, 0.85);"></div>
  <div class="container"><div class="hero-content">
    <div class="hero-text">
      <h1 class="hero-title">${h1}</h1>
      <p class="hero-subtitle">${sub}</p>
      <ul class="hero-features">${features.map((f) => `<li class="hero-feature"><i class="fas fa-check-circle" aria-hidden="true"></i><span>${f}</span></li>`).join("")}</ul>
      <div class="hero-cta-buttons">
        <a href="tel:${TEL}" class="hero-btn hero-btn-primary" data-track="phone_click" data-cta="hero"><i class="fas fa-phone-alt" aria-hidden="true"></i><span>Call ${PHONE}</span></a>
        <a href="#services" class="hero-btn hero-btn-secondary"><span>Our Services</span><i class="fas fa-arrow-right" aria-hidden="true"></i></a>
      </div>
    </div>
    <div class="hero-form"><h2 class="form-title">${formTitle}</h2>${form}</div>
  </div></div>
  <div class="hero-shapes"><div class="hero-shape hero-shape-1"></div><div class="hero-shape hero-shape-2"></div><div class="hero-shape hero-shape-3"></div></div>
</section>`;
}
const sectionHeader = (sub, title, desc = "") => `<div class="section-header text-center"><span class="section-subtitle">${sub}</span><h2 class="section-title">${title}</h2>${desc ? `<p class="section-description">${desc}</p>` : ""}</div>`;
function faqSection(items, { sub = "FAQ", title = "Frequently Asked Questions" } = {}) {
  return `<section class="faq-section"><div class="container">${sectionHeader(sub, title)}<div class="faq-container">${items.map((f) => `<div class="faq-item"><button class="faq-question" aria-expanded="false"><span>${esc(f.q)}</span><i class="fas fa-chevron-down" aria-hidden="true"></i></button><div class="faq-answer" hidden><p>${esc(f.a)}</p></div></div>`).join("")}</div></div></section>`;
}
function coverageSection(list, { sub = "Areas We Serve", title = "Service Coverage", state = "Massachusetts", extra = "" } = {}) {
  return `<section class="service-coverage-section section-padding" id="coverage"><div class="container">
  <div class="section-header text-center mb-5"><span class="subtitle">${sub}</span><h2 class="title h1">${title}</h2></div>
  <div class="coverage-grid states-count-1"><div class="coverage-state-block"><h3 class="state-title text-center mb-4">${state}</h3>
  <div class="locations-grid">${list.map((l) => `<a class="location-card" href="${cityUrl(l)}" style="background-color: rgba(255, 255, 255, 0.05);" data-track="location_page_click" data-city="${esc(l.city)}" data-state="MA"><span class="location-name">${esc(l.city)}</span><span class="location-badge"><i class="fas fa-circle"></i> 24/7 Available</span></a>`).join("")}</div></div></div>${extra}
  </div></section>`;
}
// Approximate town centres (public geographic data) — markers are service areas, not office locations.
const COORDS = { springfield: [42.1015, -72.5898], chicopee: [42.1487, -72.6079], agawam: [42.0695, -72.6148], "east-longmeadow": [42.0645, -72.5126], granville: [42.0668, -72.8615], holyoke: [42.2043, -72.6162], hampden: [42.064, -72.4312], ludlow: [42.1601, -72.4759], montgomery: [42.2009, -72.824], palmer: [42.1584, -72.3287], russell: [42.1912, -72.8551], southwick: [42.0548, -72.7704], "west-springfield": [42.107, -72.6204], westfield: [42.1251, -72.7495], wilbraham: [42.1237, -72.4318] };
function mapSection() {
  const pts = MA.map((l) => ({ n: l.city, u: cityUrl(l), c: COORDS[l.slug], big: ["springfield", "chicopee", "holyoke", "westfield", "west-springfield"].includes(l.slug) }));
  return `<section class="service-map-section section-padding" id="service-map"><div class="container">
  ${sectionHeader("SERVICE AREA MAP", "Where We Work", "Mobile locksmith service across Springfield and Western Massachusetts. Tap a town to see local service details.")}
  <div class="svc-map-card"><span class="svc-map-badge">Service areas, not office locations</span>
  <div class="svc-map" id="svcMap" data-points='${esc(JSON.stringify(pts))}' role="region" aria-label="Map of Locksmith Express MK service areas">
    <noscript><p class="svc-map-fallback">Service areas: ${MA.map((l) => esc(l.city)).join(", ")}.</p></noscript>
  </div></div>
  <p class="svc-map-note">Locksmith Express MK is a mobile, service-area business &mdash; call <a href="tel:${TEL}" data-track="phone_click" data-cta="map">${PHONE}</a> to confirm coverage at your exact location.</p>
  </div></section>`;
}
function pageHero(title, crumbs) {
  return `<div class="page-hero-wrap page-hero-wrap--plain"><div class="container"><div class="page-hero-inner">
  <nav class="page-breadcrumb" aria-label="Breadcrumb"><a href="/"><i class="fas fa-home" aria-hidden="true"></i> Home</a>${crumbs.slice(1, -1).map((c) => ` <i class="fas fa-chevron-right" aria-hidden="true"></i> <a href="${c.href}">${esc(c.name)}</a>`).join("")} <i class="fas fa-chevron-right" aria-hidden="true"></i> <span aria-current="page">${esc(crumbs.at(-1).name)}</span></nav>
  <h1 class="page-hero-title">${title}</h1></div></div></div>`;
}
const staticPage = (crumbs, title, content) => `<main id="primary" class="site-main static-page" role="main">${pageHero(title, crumbs)}
<div class="page-body"><div class="container"><div class="page-layout"><article class="page-content-area"><div class="page-entry-content">${content}</div></article></div></div></div></main>`;

/* ================= HOME ================= */
function home() {
  let main = HOME
    .replace(/<div class="wpcf7 no-js"[\s\S]*?<\/form>\s*<\/div>/, cf7Form({ source: "/", name: "Homepage Quote" }))
    .replace(/<h3 class="form-title">/, '<h2 class="form-title">').replace(/(Get a Free Quote\s*)<\/h3>/, "$1</h2>")
    .replace(/<section class="blog-section[\s\S]*?<\/section>/, "")
    .replace(/<section class="s-stats-section[\s\S]*?<\/section>/, STATS_SEC)
    .replace(/<a href="tel:\+14134331135" class="hero-btn hero-btn-primary">/, `<a href="tel:${TEL}" class="hero-btn hero-btn-primary" data-track="phone_click" data-cta="hero">`)
    .replace(/<a href="tel:\+14134331135" class="about-btn">/, `<a href="tel:${TEL}" class="about-btn" data-track="phone_click" data-cta="about">`);
  main = main.replace(/<section class="service-coverage-section[\s\S]*?<\/section>/, coverageSection(MA) + mapSection());
  const html = head({ title: "24/7 Locksmith in Springfield, MA & Western Massachusetts | Locksmith Express MK", desc: "Locked out? Need a key replacement? Locksmith Express MK provides 24/7 residential, commercial and automotive locksmith service in Springfield and Western Massachusetts. Call (413) 433-1135.", url: "/", jsonld: [localBusinessLd(), { "@context": "https://schema.org", "@type": "WebSite", "@id": biz.url + "/#website", url: biz.url, name: "Locksmith Express MK" }, faqLd(LEGACY_FAQS)], preload: `<link rel="preload" as="image" href="/assets/legacy/2026/03/hero-Locksmith-Express-MK-1920x800.webp" fetchpriority="high">` });
  emit("/", html + page({ cur: "home", body: main, bodyClass: "home" }), { file: "index.html", title: "Home" });
}

/* ================= SERVICES ================= */
const SVC_META = Object.fromEntries(services.map((s) => [s.slug, s]));
const LEGACY_SERVICES = ["residential-locksmith", "commercial-locksmith", "automotive-locksmith", "safe-locksmith", "lockout-service", "lock-change-service", "keypad-installation", "lock-rekey-service", "car-key-programming", "chevrolet-gmc-cadillac-buick-locksmith", "ford-lincoln-locksmith", "honda-acura-locksmith", "hyundai-kia-locksmith", "jeep-dodge-chrysler-ram-locksmith", "mazda-mitsubishi-locksmith", "nissan-infiniti-locksmith"];
const decodeT = (s) => s.replace(/&amp;/g, "&").replace(/&#0?38;/g, "&");
function servicePages() {
  for (const slug of LEGACY_SERVICES) {
    const L = LEG(slug);
    const url = `/services/${slug}/`;
    const name = decodeT((L.main.match(/<h1 class="service-hero-title">\s*([\s\S]*?)\s*<\/h1>/) || [])[1] || slug).replace(/\s+/g, " ").trim();
    const nice = name === name.toUpperCase() ? name.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) : name;
    const main = swapForms(fix(L.main), { service: nice, source: url, name: `${nice} Quote` })
      .replace(/<a href="tel:\+14134331135" class="btn-primary-call">/, `<a href="tel:${TEL}" class="btn-primary-call" data-track="phone_click" data-cta="service-hero">`)
      .replace(/<a href="tel:\+14134331135" class="btn-sidebar-call">/, `<a href="tel:${TEL}" class="btn-sidebar-call" data-track="phone_click" data-cta="service-sidebar">`)
      .replace(/>SAFE LOCKSMITH</g, ">Safe Locksmith<");
    const m = SVC_META[slug];
    const faqs = [...main.matchAll(/<summary>\s*<span>([\s\S]*?)<\/span>[\s\S]*?<div class="faq-answer">\s*<p>([\s\S]*?)<\/p>/g)].map((x) => ({ q: decodeT(x[1].trim()), a: decodeT(x[2].replace(/<[^>]+>/g, "").trim()) }));
    const crumbs = [{ name: "Home", href: "/" }, { name: "Our Services", href: "/services/" }, { name: nice, href: url }];
    const title = m ? m.metaTitle : `${decodeT(L.title).replace(/\s*-\s*Locksmith Express MK$/, "")} | Locksmith Express MK`;
    const desc = m ? m.metaDesc : (L.desc || `${nice} from Locksmith Express MK — 24/7 mobile automotive locksmith service in Springfield and Western Massachusetts. Call (413) 433-1135.`);
    const cur = { "residential-locksmith": "residential", "commercial-locksmith": "commercial", "automotive-locksmith": "automotive" }[slug] || "";
    emit(url, head({ title, desc, url, jsonld: [crumbsLd(crumbs), { "@context": "https://schema.org", "@type": "Service", name: nice, serviceType: nice, provider: { "@id": biz.url + "/#business" }, areaServed: MA.map((l) => ({ "@type": "City", name: `${l.city}, MA` })) }, ...(faqs.length ? [faqLd(faqs)] : [])] }) + page({ cur, body: main, bodyClass: "single single-service" }), { title: nice });
  }
  // archive
  const more = (fix(LEG("services-2").main).match(/<article id="post-\d+" class="service-card[\s\S]*?<\/article>/g) || []).join("\n");
  const A = fix(LEG("services").main).replace(/<nav class="navigation pagination"[\s\S]*?<\/nav>/, "").replace(/(<article id="post-\d+" class="service-card[\s\S]*<\/article>)/, `$1\n${more}`).replace(/<main id="primary" class="site-main service-archive-page" role="main">/, `<main id="primary" class="site-main service-archive-page" role="main">${pageHero("Our Services", [{ name: "Home", href: "/" }, { name: "Our Services", href: "/services/" }])}`).replace(/>SAFE LOCKSMITH</g, ">Safe Locksmith<");
  const crumbs = [{ name: "Home", href: "/" }, { name: "Our Services", href: "/services/" }];
  emit("/services/", head({ title: "Locksmith Services | Residential, Commercial & Automotive | Locksmith Express MK", desc: "All locksmith services from Locksmith Express MK: residential, commercial, automotive, lockouts, lock change, rekeying, keypad, safe, car key programming and vehicle-brand key services.", url: "/services/", jsonld: [crumbsLd(crumbs)] }) + page({ body: A, bodyClass: "archive post-type-archive" }), { title: "Our Services" });
}

/* ================= AREAS ================= */
function areas() {
  const crumbs = [{ name: "Home", href: "/" }, { name: "Areas We Serve", href: "/areas/" }];
  const body = `<main id="primary" class="site-main homepage" role="main">${pageHero("Areas We Serve", crumbs)}${coverageSection(MA, { extra: `<p class="coverage-note">Connecticut: we also provide mobile service in parts of Connecticut near our Massachusetts base. <a href="/areas/connecticut/">See Connecticut coverage</a>.</p>` })}${mapSection()}${WHY_SEC}</main>`;
  emit("/areas/", head({ title: "Areas We Serve | Springfield & Western Massachusetts Locksmith | Locksmith Express MK", desc: "Locksmith Express MK mobile locksmith service areas: Springfield, Chicopee, Holyoke, Westfield, West Springfield, Agawam and more in Western Massachusetts, plus Connecticut.", url: "/areas/", jsonld: [crumbsLd(crumbs)] }) + page({ body, bodyClass: "page" }), { title: "Areas We Serve" });

  // Massachusetts
  let c = [{ name: "Home", href: "/" }, { name: "Areas We Serve", href: "/areas/" }, { name: "Massachusetts", href: "/areas/massachusetts/" }];
  const maFaqs = [{ q: "Which Massachusetts communities do you serve?", a: `Our Massachusetts service areas are ${MA.map((l) => l.city).join(", ")}. Call to confirm availability for your address.` }, { q: "Do response times differ across Massachusetts?", a: "Yes. Time depends on technician availability, distance and traffic, and hill towns can be farther from Springfield. Call for an estimated response time." }, faqData.items["247"], faqData.items.ownership];
  emit("/areas/massachusetts/", head({ title: "24/7 Locksmith in Western Massachusetts | Locksmith Express MK", desc: "Mobile residential, commercial and automotive locksmith service across Springfield and Western Massachusetts, 24/7. Call (413) 433-1135.", url: "/areas/massachusetts/", jsonld: [crumbsLd(c), faqLd(maFaqs)] }) + page({ body: `<main id="primary" class="site-main homepage" role="main">
${heroSection({ h1: "Professional Locksmith Services in Massachusetts", sub: "Locked out? Need a key replacement? Locksmith Express MK provides mobile residential, commercial and automotive locksmith help across Springfield and Western Massachusetts, 24/7.", form: cf7Form({ state: "MA", source: "/areas/massachusetts/", name: "Massachusetts Quote" }) })}
${coverageSection(MA)}${mapSection()}${SERVICES_SEC}${WHY_SEC}${faqSection(maFaqs, { title: "Massachusetts Locksmith FAQ" })}</main>`, bodyClass: "page" }), { title: "Massachusetts" });

  // Connecticut
  c = [{ name: "Home", href: "/" }, { name: "Areas We Serve", href: "/areas/" }, { name: "Connecticut", href: "/areas/connecticut/" }];
  const ctFaqs = [{ q: "Which Connecticut towns do you serve?", a: "We provide mobile service in parts of Connecticut near our Massachusetts base. Please call (413) 433-1135 or send your ZIP code so we can confirm your address." }, { q: "Do you cover all of Connecticut?", a: "No. We do not claim statewide coverage. Contact us to find out whether your location is within our service area." }, faqData.items["247"]];
  emit("/areas/connecticut/", head({ title: "Mobile Locksmith Services in Connecticut | Locksmith Express MK", desc: "Contact Locksmith Express MK for residential, commercial and automotive locksmith assistance in our Connecticut service areas near Springfield, MA.", url: "/areas/connecticut/", jsonld: [crumbsLd(c), faqLd(ctFaqs)] }) + page({ body: `<main id="primary" class="site-main homepage" role="main">
${heroSection({ h1: "Mobile Locksmith Services in Connecticut", sub: "Locksmith Express MK provides mobile locksmith help in parts of Connecticut near our Springfield, MA base. Tell us your address or ZIP code and we will confirm coverage and an estimated response time.", form: cf7Form({ state: "CT", source: "/areas/connecticut/", name: "Connecticut Quote" }) })}
${SERVICES_SEC}${HOW_SEC}${faqSection(ctFaqs, { title: "Connecticut Locksmith FAQ" })}</main>`, bodyClass: "page" }), { title: "Connecticut" });

  for (const l of MA) cityPage(l);
}

function cityPage(l) {
  const url = cityUrl(l);
  const crumbs = [{ name: "Home", href: "/" }, { name: "Areas We Serve", href: "/areas/" }, { name: "Massachusetts", href: "/areas/massachusetts/" }, { name: `${l.city}, MA`, href: url }];
  const near = l.nearbyCities.map((n) => MA.find((m) => m.city === n)).filter(Boolean);
  const faqs = [l.localFaq, faqData.items["247"], faqData.items.arrival, faqData.items.ownership];
  const local = `<section class="about-section section-padding" id="about"><div class="container">
  ${sectionHeader(`${l.city.toUpperCase()}, MASSACHUSETTS`, `Your Local Locksmith in ${l.city}`)}
  <div class="about-content-grid">
    <div class="about-image-wrapper"><div class="about-image-container"><img width="1024" height="683" src="/assets/legacy/2024/11/lockout-service-1024x683.webp" class="about-image" alt="Locksmith opening a locked door in ${esc(l.city)}, MA" loading="lazy" decoding="async"><div class="about-badge"><div class="badge-content"><i class="fas fa-shield-alt" aria-hidden="true"></i><span>24/7</span><span>Service</span></div></div></div></div>
    <div class="about-text-wrapper"><p class="about-description">Mobile Locksmith Service in ${esc(l.city)}, MA</p><p class="about-extra-text">${esc(l.localDescription)}</p>
      <div class="about-features-grid">${l.needs.slice(0, 4).map((n) => `<div class="about-feature-item"><div class="feature-icon"><i class="fas fa-check" aria-hidden="true"></i></div><span class="feature-text">${esc(n)}</span></div>`).join("")}</div>
      ${l.kind === "rural" ? `<p class="about-extra-text">${esc(l.city)} is farther from our Springfield-area base than most communities, so response times can be longer. Call ${PHONE} for an estimated time.</p>` : ""}
      <div class="about-cta"><a href="tel:${TEL}" class="about-btn" data-track="phone_click" data-cta="city-about"><i class="fas fa-phone-alt" aria-hidden="true"></i><span>Call ${PHONE}</span></a></div></div>
  </div></div></section>`;
  const body = `<main id="primary" class="site-main homepage" role="main">
${heroSection({ h1: `Locksmith in ${l.city}, MA &mdash; We&rsquo;ve Got You Covered!`, sub: `Locked out? Need a key replacement? Locksmith Express MK provides 24/7 mobile locksmith help for homes, businesses and vehicles in ${esc(l.city)}, Massachusetts.`, form: cf7Form({ city: l.city, state: "MA", source: url, name: `${l.city} Quote` }) })}
${SERVICES_SEC.replace(/<h2 class="section-title">[\s\S]*?<\/h2>/, `<h2 class="section-title">Locksmith Services in ${esc(l.city)}, MA</h2>`)}
${local}
${WHY_SEC}${HOW_SEC}
${faqSection(faqs, { title: `${esc(l.city)} Locksmith FAQ` })}
${near.length ? coverageSection(near, { sub: "Nearby Areas", title: `Also Serving Near ${esc(l.city)}` }).replace(' id="coverage"', "") : ""}
</main>`;
  emit(url, head({ title: l.seoTitle, desc: l.metaDescription, url, jsonld: [crumbsLd(crumbs), faqLd(faqs), { "@context": "https://schema.org", "@type": "Service", name: `Locksmith services in ${l.city}, MA`, provider: { "@id": biz.url + "/#business" }, areaServed: { "@type": "City", name: `${l.city}, MA` } }] }) + page({ body, bodyClass: "page" }), { title: `${l.city}, MA` });
}

/* ================= AD LANDING PAGES ================= */
function lpPage(c) {
  const url = `/lp/${c.slug}/`;
  const near = [c.city, ...(locations.find((l) => l.city === c.city)?.nearbyCities || [])].map((n) => MA.find((m) => m.city === n)).filter(Boolean);
  const body = `<main id="primary" class="site-main homepage" role="main">
${heroSection({ h1: c.title, sub: c.sub, features: c.bullets.slice(0, 3), formTitle: "Request Assistance", form: cf7Form({ city: c.city, state: c.state, service: c.service, kind: c.formKind === "carkey" ? "carkey" : "general", source: url, name: c.title, btn: "Request Assistance" }) }).replace('href="#services" class="hero-btn hero-btn-secondary"><span>Our Services</span>', 'href="#quote" class="hero-btn hero-btn-secondary lp-quote"><span>Request Assistance</span>')}
${WHY_SEC}${HOW_SEC}
${faqSection(c.faqs, { title: "Quick Answers" })}
${coverageSection(near, { sub: "Coverage", title: `Serving ${esc(c.city)}, MA &amp; Nearby` })}
</main>`;
  emit(url, head({ title: c.metaTitle, desc: c.sub, url, robots: "noindex, follow", jsonld: [faqLd(c.faqs)] }) + page({ body, bodyClass: "page lp", lp: true }), { indexable: false, kind: "lp" });
}

/* ================= INFO PAGES ================= */
function infoPages() {
  // About — legacy page shell, legacy copy
  let crumbs = [{ name: "Home", href: "/" }, { name: "About", href: "/about/" }];
  const aboutIntro = `<section class="about-section section-padding about-story"><div class="container">${sectionHeader("OUR STORY", "Helping You Stay Safe with Expert Locksmith Solutions")}
  <div class="about-content-grid"><div class="about-image-wrapper"><div class="about-image-container"><img width="1024" height="683" src="/assets/legacy/2024/11/key-duplicate-1024x683.webp" class="about-image" alt="Key duplication by Locksmith Express MK" loading="lazy" decoding="async"><div class="about-badge"><div class="badge-content"><i class="fas fa-shield-alt" aria-hidden="true"></i><span>Trusted</span><span>Service</span></div></div></div></div>
  <div class="about-text-wrapper"><p class="about-description">At Locksmith Express MK we offer a comprehensive range of locksmith services 24/7.</p><p class="about-extra-text">We provide tailored solutions with the latest locksmith mechanisms. Our priority is a quick response to your needs. We are here to alleviate your concerns and address any lock-related issues swiftly &mdash; our team of skilled locksmiths delivers a wide array of top-tier security services tailored to your home, business and vehicle.</p>
  <div class="about-features-grid">${["Fast Response", "Open 24/7", "Cost-Effective", "Upfront Pricing", "Top Technologies", "Quality Service"].map((t) => `<div class="about-feature-item"><div class="feature-icon"><i class="fas fa-check" aria-hidden="true"></i></div><span class="feature-text">${t}</span></div>`).join("")}</div>
  <div class="about-cta"><a href="tel:${TEL}" class="about-btn" data-track="phone_click" data-cta="about-page"><i class="fas fa-phone-alt" aria-hidden="true"></i><span>Contact Us Now</span></a></div></div></div></div></section>`;
  const aboutWhy = `<section class="why-section section-padding" id="why-choose-us"><div class="why-overlay"></div><div class="container">${sectionHeader("EXPERIENCED LOCKSMITHS YOU CAN RELY ON", "Expert Locksmith Solutions, Whenever You Need", "Locksmith Express MK is committed to superior locksmith services for homes, businesses and vehicles.")}
  <div class="why-grid">${[["verified", "Trustworthy Experts", "Our team brings years of knowledge and expertise to each job, so you receive the ideal solution."], ["license", "Advanced Technology", "We use the latest technology and tools to deliver efficient, accurate and quick solutions."], ["24fps_select", "Always Available", "With 24/7 availability, our locksmiths are ready to help you anytime you need us."], ["call", "Customized Solutions", "We assess your locks and security requirements to suggest the best solution for you."]].map(([i, t, d]) => `<div class="why-card"><div class="why-icon"><img src="/assets/legacy/2026/03/${i}_60dp_FFFFFF_FILL0_wght400_GRAD0_opsz48${i === "license" ? "-1" : ""}.png" width="60" height="60" class="why-icon-image" alt="" loading="lazy" decoding="async"></div><h3 class="why-title">${t}</h3><p class="why-desc">${d}</p></div>`).join("")}</div></div></section>`;
  emit("/about/", head({ title: "About Locksmith Express MK | 24/7 Locksmith in Springfield, MA", desc: "Locksmith Express MK offers a comprehensive range of 24/7 residential, commercial and automotive locksmith services across Springfield and Western Massachusetts.", url: "/about/", jsonld: [crumbsLd(crumbs)] }) + page({ body: `<main id="primary" class="site-main homepage static-page" role="main">${pageHero("About", crumbs)}${aboutIntro}${SERVICES_SEC}${aboutWhy}${STATS_SEC}${TESTI_SEC}</main>`, bodyClass: "page" }), { title: "About" });

  // Contact — legacy page with working form
  crumbs = [{ name: "Home", href: "/" }, { name: "Contact", href: "/contact/" }];
  const C = swapForms(fix(LEG("contact").main), { source: "/contact/", name: "Contact Page" });
  emit("/contact/", head({ title: "Contact Locksmith Express MK | Call (413) 433-1135", desc: "Contact Locksmith Express MK for 24/7 mobile locksmith service in Springfield and Western Massachusetts. Call (413) 433-1135 or request a quote online.", url: "/contact/", jsonld: [crumbsLd(crumbs)] }) + page({ body: C, bodyClass: "page" }), { title: "Contact" });

  // FAQ
  crumbs = [{ name: "Home", href: "/" }, { name: "FAQ", href: "/faq/" }];
  const all = [...LEGACY_FAQS, ...faqData.home.map((k) => faqData.items[k])];
  emit("/faq/", head({ title: "Locksmith FAQ | Locksmith Express MK", desc: "Answers to common locksmith questions: rekeying, lock repair, master locks, high-security locks, car keys, availability and service areas.", url: "/faq/", jsonld: [crumbsLd(crumbs), faqLd(all)] }) + page({ body: `<main id="primary" class="site-main homepage static-page" role="main">${pageHero("Frequently Asked Questions", crumbs)}${faqSection(all, { title: "Common Locksmith Questions" })}</main>`, bodyClass: "page" }), { title: "FAQ" });

  // Legal
  crumbs = [{ name: "Home", href: "/" }, { name: "Privacy Policy", href: "/privacy-policy/" }];
  emit("/privacy-policy/", head({ title: "Privacy Policy | Locksmith Express MK", desc: "How Locksmith Express MK collects, uses and protects your information, including SMS terms.", url: "/privacy-policy/" }) + page({ body: staticPage(crumbs, "Privacy Policy", fs.readFileSync(path.join(ROOT, "data/legal-privacy.html"), "utf8")), bodyClass: "page" }), { title: "Privacy Policy" });
  crumbs = [{ name: "Home", href: "/" }, { name: "Terms of Service", href: "/terms-of-service/" }];
  emit("/terms-of-service/", head({ title: "Terms of Service | Locksmith Express MK", desc: "Terms of use for the Locksmith Express MK website and service requests.", url: "/terms-of-service/" }) + page({ body: staticPage(crumbs, "Terms of Service", `<p><em>Draft &mdash; requires client and legal review before launch.</em></p>
<h2>Using this website</h2><p>This website provides information about the mobile locksmith services offered by ${esc(biz.name)}. Submitting a form is a request to be contacted; it is not a booking or a guarantee of service availability, arrival time or price.</p>
<h2>Quotes and pricing</h2><p>Pricing depends on the service, location, hardware, vehicle and other job details. We discuss pricing with you before work is authorized.</p>
<h2>Proof of ownership or authorization</h2><p>For everyone's security, we may require proof of ownership or authorization before providing access-related locksmith services for a home, business, vehicle or safe.</p>
<h2>Service areas</h2><p>Service is available in the areas we confirm with you. Listing a town on this website does not guarantee availability at a specific address or time.</p>
<h2>Contact</h2><p>Questions? Call <a href="tel:${TEL}">${PHONE}</a> or email <a href="mailto:${biz.email}">${biz.email}</a>.</p>`), bodyClass: "page" }), { title: "Terms of Service" });

  // Thank-you & 404
  const callBlock = `<p><a href="tel:${TEL}" class="about-btn" data-track="phone_click" data-cta="utility"><i class="fas fa-phone-alt" aria-hidden="true"></i><span>Call ${PHONE}</span></a></p>`;
  emit("/thank-you/", head({ title: "Thank You | Locksmith Express MK", desc: "Thank you for contacting Locksmith Express MK.", url: "/thank-you/", robots: "noindex, nofollow" }) + page({ body: staticPage([{ name: "Home", href: "/" }, { name: "Thank You", href: "/thank-you/" }], "Thank You", `<p>Your request was received. Our team will contact you shortly. Need help right now?</p>${callBlock}`), bodyClass: "page" }), { indexable: false });
  write("404.html", head({ title: "Page Not Found | Locksmith Express MK", desc: "The page you are looking for could not be found.", url: "/404.html", robots: "noindex, nofollow" }) + page({ body: staticPage([{ name: "Home", href: "/" }, { name: "Page Not Found", href: "/404.html" }], "Page Not Found", `<p>That page does not exist, but we can still help you. <a href="/">Back to the homepage</a> or call us 24/7.</p>${callBlock}`), bodyClass: "error404" }));
}

/* ================= RUN ================= */
home(); servicePages(); areas(); campaigns.forEach(lpPage); infoPages();

const sm = routes.filter((r) => r.indexable).map((r) => `  <url><loc>${biz.url}${r.url}</loc></url>`).join("\n");
write("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sm}\n</urlset>\n`);
write("robots.txt", `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${biz.url}/sitemap.xml\n`);
write("search.json", JSON.stringify(routes.filter((r) => r.indexable && r.title).map((r) => ({ t: r.title, u: r.url }))));
write("data/route-inventory.json", JSON.stringify(routes.map(({ title, ...r }) => r), null, 1));
console.log(`built ${routes.length} routes (${routes.filter((r) => r.indexable).length} in sitemap)`);
