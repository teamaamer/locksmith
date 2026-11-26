// Page chrome + reusable components. Every page is rendered from these so markup is never duplicated by hand.
import { biz, services, locations, faqItem, esc, img, ic, svcUrl, cityUrl, activeLocations, instagram, reviews } from "./lib.mjs";
import { sprite } from "./icons.mjs";

const PHONE = (label = biz.phone, cls = "", where = "link") =>
  `<a${cls ? ` class="${cls}"` : ""} href="tel:${biz.phoneTel}" data-track="phone_click" data-cta="${where}">${label}</a>`;
export const callBtn = (label = `Call Now: ${biz.phone}`, where = "hero", cls = "btn btn-cta btn-lg") =>
  `<a class="${cls}" href="tel:${biz.phoneTel}" data-track="phone_click" data-cta="${where}">${ic("phone")}${label}</a>`;
export const quoteBtn = (label = "Get a Free Quote", href = "#quote", cls = "btn btn-outline btn-lg") =>
  `<a class="${cls}" href="${href}" data-track="quote_cta" >${label}${ic("arrow")}</a>`;

/* ---------- <head> ---------- */
export function head({ title, desc, path, robots = "index, follow, max-image-preview:large", ogImage = "/assets/og-image.jpg", jsonld = [], preload = "" }) {
  const url = biz.url + path;
  const t = biz.tracking;
  // Tracking is queued immediately but the gtag.js library loads after the page is interactive (keeps TBT/LCP low).
  const gtag = t.ga4 || t.googleAds
    ? `<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());${t.ga4 ? `gtag('config','${t.ga4}');` : ""}${t.googleAds ? `gtag('config','${t.googleAds}');` : ""}addEventListener('load',function(){setTimeout(function(){var s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id=${t.ga4 || t.googleAds}';document.head.appendChild(s)},2000)})</script>`
    : "";
  return `<!doctype html>
<html lang="en-US">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}">
  <meta name="robots" content="${robots}">
  <link rel="canonical" href="${url}">
  <meta name="author" content="${esc(biz.name)}">
  <meta name="format-detection" content="telephone=yes">
  <meta name="theme-color" content="#111111">
  <meta name="geo.region" content="US-MA">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${esc(biz.shortName)}">
  <meta property="og:locale" content="en_US">
  <meta property="og:url" content="${url}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:image" content="${biz.url}${ogImage}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32.png">
  <link rel="icon" type="image/png" sizes="192x192" href="/assets/favicon-192.png">
  <link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
  <link rel="manifest" href="/site.webmanifest">
  <link rel="preload" href="/assets/fonts/archivo-latin-wdth-normal.woff2" as="font" type="font/woff2" crossorigin>
  ${preload}
  <link rel="stylesheet" href="/css/styles.css">
  ${jsonld.map((j) => `<script type="application/ld+json">${JSON.stringify(j)}</script>`).join("\n  ")}
  ${gtag}
</head>`;
}

/* ---------- Header ---------- */
const navLinks = (cur) => {
  const a = (href, label, key) => `<a href="${href}"${cur === key ? ' aria-current="page" class="active"' : ""}>${label}</a>`;
  const dd = (id, label, key, items) => `<div class="has-dd${cur === key ? " active" : ""}"><button type="button" class="dd-btn" aria-expanded="false" aria-haspopup="true" aria-controls="${id}">${label}${ic("chevron")}</button><div class="dd" id="${id}">${items}</div></div>`;
  return `${a("/", "Home", "home")}
${dd("dd-services", "Services", "services", services.map((s) => `<a href="${svcUrl(s.slug)}">${ic(s.icon)}${s.name}</a>`).join("") + `<a class="dd-all" href="/services/">View All Services${ic("arrow")}</a>`)}
${a(svcUrl("residential-locksmith"), "Residential", "residential")}
${a(svcUrl("commercial-locksmith"), "Commercial", "commercial")}
${a(svcUrl("automotive-locksmith"), "Automotive", "automotive")}
${dd("dd-areas", "Areas We Serve", "areas", `<a href="/areas/massachusetts/">${ic("pin")}Massachusetts</a><a href="/areas/connecticut/">${ic("pin")}Connecticut</a><div class="dd-sub">Confirmed cities</div>${activeLocations("MA").slice(0, 6).map((l) => `<a href="${cityUrl(l)}">${l.city}, MA</a>`).join("")}<a class="dd-all" href="/areas/">View All Service Areas${ic("arrow")}</a>`)}
${a("/about/", "About Us", "about")}
${a("/faq/", "FAQ", "faq")}
${a("/contact/", "Contact", "contact")}`;
};

export function topbar({ city } = {}) {
  return `<div class="topbar"><div class="container">
  <span class="tb-item">${ic("clock")}<span class="tb-long">24/7 Emergency Locksmith</span><span class="tb-short">24/7 Emergency Locksmith</span></span>
  <span class="tb-item tb-mid">${ic("pin")}${city ? `Serving ${city} &amp; Nearby Areas` : "Serving Massachusetts &amp; Connecticut"}</span>
  <span class="tb-right">
    <a class="tb-item" href="tel:${biz.phoneTel}" data-track="phone_click" data-cta="topbar">${ic("phone")}<strong>${biz.phone}</strong></a>
    <a class="tb-item tb-mail" href="mailto:${biz.email}">${ic("mail")}${biz.email}</a>
  </span></div></div>`;
}

export function header(cur) {
  return `<header class="header" id="header"><div class="container hd">
  <a class="brand" href="/" aria-label="${esc(biz.shortName)} — home"><picture><source srcset="${biz.logoWebp}" type="image/webp"><img src="${biz.logo}" alt="${esc(biz.shortName)} logo" width="214" height="50"></picture></a>
  <nav class="nav" aria-label="Main">${navLinks(cur)}</nav>
  <div class="hd-cta">
    <a class="btn btn-cta btn-sm hd-call" href="tel:${biz.phoneTel}" data-track="phone_click" data-cta="header">${ic("phone")}Call Now</a>
    <button class="menu-btn" id="menuBtn" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="mobileNav">${ic("menu", "i-open")}${ic("x", "i-close")}</button>
  </div></div></header>
<nav class="mobile-nav" id="mobileNav" aria-label="Mobile">
  <a href="/">Home</a>
  <details><summary>Services${ic("chevron")}</summary>${services.map((s) => `<a href="${svcUrl(s.slug)}">${s.name}</a>`).join("")}</details>
  <a href="${svcUrl("residential-locksmith")}">Residential</a><a href="${svcUrl("commercial-locksmith")}">Commercial</a><a href="${svcUrl("automotive-locksmith")}">Automotive</a>
  <details><summary>Areas We Serve${ic("chevron")}</summary><a href="/areas/massachusetts/">Massachusetts</a><a href="/areas/connecticut/">Connecticut</a>${activeLocations("MA").map((l) => `<a href="${cityUrl(l)}">${l.city}, MA</a>`).join("")}<a href="/areas/">View All Service Areas</a></details>
  <a href="/about/">About Us</a><a href="/faq/">FAQ</a><a href="/contact/">Contact</a>
  <a class="btn btn-cta btn-lg" href="tel:${biz.phoneTel}" data-track="phone_click" data-cta="mobile-menu">${ic("phone")}Call ${biz.phone}</a>
</nav>`;
}

/* ---------- Quote form ---------- */
const SERVICE_OPTIONS = ["Emergency Lockout", "Residential Locksmith", "Commercial Locksmith", "Automotive Locksmith", "Car Key Replacement", "Car Key Programming", "Lock Change", "Lock Rekeying", "Keypad Installation", "Safe Locksmith", "Other"];
export function quoteForm({ id = "quote", title = "Get a Free Quote", sub = "Tell us what you need and our team will contact you to discuss your service request.", city = "", state = "", service = "", kind = "general", source = "", btn = "Request My Quote", compact = false, labels = false } = {}) {
  const p = id;
  const opt = SERVICE_OPTIONS.map((o) => `<option${o === service ? " selected" : ""}>${o}</option>`).join("");
  const field = (name, label, icn, attrs, extra = "") => `<div class="field"><label for="${p}-${name}">${label}</label><div class="f-ic">${ic(icn)}<input class="input" id="${p}-${name}" name="${name}" ${attrs}></div><p class="err" id="${p}-${name}-err" role="alert"></p>${extra}</div>`;
  return `<div class="form-card${compact ? " compact" : ""}${labels ? "" : " nolabels"}" id="${p}">
  <form class="lead-form" data-form-name="${esc(title)}" data-city="${esc(city)}" data-state="${esc(state)}" data-source="${esc(source)}" novalidate>
    <h2 class="form-title">${ic("tag", "ft-ic")}${title}</h2>
    <p class="sub">${sub}</p>
    ${field("full_name", "Full name", "user", 'type="text" autocomplete="name" placeholder="Your name" required')}
    ${field("phone", "Phone number", "phone", 'type="tel" inputmode="tel" autocomplete="tel" placeholder="(413) 555-0123" required')}
    ${field("email", 'Email <span class="opt">(optional)</span>', "mail", 'type="email" autocomplete="email" placeholder="you@email.com"')}
    ${field("zip", "ZIP code", "hash", `type="text" inputmode="numeric" autocomplete="postal-code" maxlength="5" placeholder="01103" required`)}
    ${kind === "carkey" ? `<div class="field-row3">${field("vehicle_year", "Year", "calendar", 'type="text" inputmode="numeric" maxlength="4" placeholder="2019"')}${field("vehicle_make", "Make", "car", 'type="text" placeholder="Honda"')}${field("vehicle_model", "Model", "car", 'type="text" placeholder="Civic"')}</div>` : ""}
    <div class="field"><label for="${p}-service">Service needed</label><div class="f-ic">${ic("list")}<select class="select" id="${p}-service" name="service" required><option value="">Choose a service…</option>${opt}</select></div><p class="err" id="${p}-service-err" role="alert"></p></div>
    <div class="field"><label for="${p}-message">How can we help? <span class="opt">(optional)</span></label><div class="f-ic ta">${ic("message")}<textarea class="textarea" id="${p}-message" name="message" rows="${compact ? 2 : 3}" placeholder="Describe the problem"></textarea></div></div>
    <input class="hp" type="text" name="company_website" tabindex="-1" autocomplete="off" aria-hidden="true">
    <label class="consent"><input type="checkbox" name="sms_consent" value="yes"><span>I agree to receive calls and text messages from ${esc(biz.shortName)} about my request. Msg frequency varies; msg &amp; data rates may apply. Reply STOP to opt out. <a href="/privacy-policy/">Privacy Policy</a></span></label>
    <button class="btn btn-cta btn-block btn-lg" type="submit"><span class="spinner" aria-hidden="true"></span><span class="btn-label">${btn}</span>${ic("arrow")}</button>
    <p class="form-status" role="status" aria-live="polite"></p>
    <p class="form-foot">${ic("check-circle")}For urgent assistance, call ${PHONE(biz.phone, "", "form")}.</p>
  </form>
  <div class="form-success" role="status" aria-live="polite" hidden>
    <div class="check">${ic("check")}</div>
    <h3>Request received<span class="success-name"></span>!</h3>
    <p>Thank you. A member of our team will contact you to discuss your request. Locked out right now? Call us directly.</p>
    ${callBtn(`Call ${biz.phone}`, "form-success", "btn btn-cta btn-block")}
  </div></div>`;
}

/* ---------- Shared sections ---------- */
export const eyebrow = (t, light = false) => `<span class="eyebrow${light ? " on-dark" : ""}">${t}</span>`;
export const sectionHead = (eb, h2, sub = "", { center = true, light = false } = {}) =>
  `<div class="section-head${center ? " center" : ""} reveal">${eyebrow(eb, light)}<h2 class="h2${light ? " on-dark" : ""}">${h2}</h2>${sub ? `<p class="lead${light ? " on-dark" : ""}">${sub}</p>` : ""}</div>`;

export function breadcrumbs(items) {
  return `<nav class="crumbs" aria-label="Breadcrumb"><div class="container"><ol>${items.map((it, i) => (i === items.length - 1 ? `<li aria-current="page">${esc(it.name)}</li>` : `<li><a href="${it.href}">${esc(it.name)}</a></li>`)).join("")}</ol></div></nav>`;
}
export const crumbsLd = (items) => ({ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: biz.url + it.href })) });

export function faqSection(keys, { heading = "Frequently Asked Locksmith Questions", image = "home-and-car-keys", extra = [], eb = "FAQ", sub = "" } = {}) {
  const items = [...keys.map(faqItem), ...extra];
  return `<section class="section faq-sec"><div class="container faq-wrap">
  <div class="faq-side reveal">${eyebrow(eb)}<h2 class="h2">${heading}</h2>${sub ? `<p class="lead">${sub}</p>` : ""}${image ? `<div class="faq-img">${img(image, { sizes: "(max-width: 900px) 100vw, 420px", maxW: 800 })}</div>` : ""}</div>
  <div class="faq">${items.map((f, i) => `<details${i === 0 ? " open" : ""}><summary><span>${esc(f.q)}</span><i class="pm" aria-hidden="true"></i></summary><div class="answer"><p>${esc(f.a)}</p></div></details>`).join("")}</div>
  </div></section>`;
}
export const faqLd = (keys, extra = []) => ({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: [...keys.map(faqItem), ...extra].map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) });

export function trustStrip(items) {
  return `<section class="strip" aria-label="Highlights"><div class="container strip-in">${items.map(([i, t]) => `<div class="strip-item">${ic(i)}<span>${t}</span></div>`).join("")}</div></section>`;
}
export const HOME_STRIP = [["van", "Mobile Locksmith Service"], ["clock", "24/7 Emergency Support"], ["shield", "Home, Business &amp; Vehicle Services"], ["pin", "Massachusetts &amp; Connecticut Coverage"]];

export function serviceCard(s, { size = "h" } = {}) {
  return `<article class="svc-card reveal"><a class="svc-img" href="${svcUrl(s.slug)}" tabindex="-1" aria-hidden="true" data-track="service_card_click" data-service="${s.slug}">${img(s.cardImage, { sizes: "(max-width: 700px) 45vw, (max-width: 1100px) 30vw, 180px", maxW: 480 })}</a>
  <div class="svc-body"><div class="svc-title"><span class="svc-ic">${ic(s.icon)}</span><h3><a href="${svcUrl(s.slug)}" data-track="service_card_click" data-service="${s.slug}">${s.name}</a></h3></div>
  <p>${s.card}</p><a class="more" href="${svcUrl(s.slug)}" data-track="service_card_click" data-service="${s.slug}">Learn More<span class="sr-only"> about ${s.name}</span> ${ic("arrow")}</a></div></article>`;
}
export const servicesGrid = (list = services) => `<div class="svc-grid">${list.map((s) => serviceCard(s)).join("")}</div>`;

export function emergencyBanner({ eb = "24/7 EMERGENCY LOCKSMITH HELP", h = "Locked Out? Don't Let It Ruin Your Day.", p = `Whether you're locked out of your car, home, or business, contact ${biz.shortName} for mobile emergency locksmith assistance across our Massachusetts and Connecticut service areas.`, image = "mobile-emergency-locksmith" } = {}) {
  return `<section class="emerg"><div class="emerg-img">${img(image, { sizes: "(max-width: 900px) 100vw, 55vw", maxW: 1280 })}</div>
  <div class="emerg-copy reveal"><span class="pill">${eb}</span><h2>${h}</h2><p>${p}</p>
  <div class="emerg-act">${callBtn(`Call ${biz.phone}`, "emergency-banner", "btn btn-cta btn-lg")}<span class="emerg-note">${ic("zap")}<span>Available 24 Hours a Day,<br>7 Days a Week</span></span></div></div></section>`;
}

export function whyChoose(list) {
  const L = list || [
    ["clock", "24/7 Availability", "Emergency locksmith assistance during the day, at night, and on weekends."],
    ["award", "Professional Service", "Practical locksmith solutions for residential, commercial, and automotive needs."],
    ["van", "Mobile Response", "Service at your location throughout our confirmed coverage areas."],
    ["tag", "Clear Pricing", "Discuss your locksmith needs and request pricing before authorizing work."],
    ["shield", "Careful Access Assistance", "Professional service focused on restoring access while protecting your property where possible."],
    ["pin", "Local Coverage", "Serving communities across Massachusetts and Connecticut."],
  ];
  return `<div class="why-grid">${L.map(([i, t, d]) => `<div class="why reveal"><span class="why-ic">${ic(i)}</span><h3>${t}</h3><p>${d}</p></div>`).join("")}</div>`;
}

export function howItWorks(steps) {
  const S = steps || [["phone", "Contact Our Team", "Call us or submit an online service request."], ["pin", "Share Your Location", "Tell us where you are and describe your locksmith problem."], ["van", "Technician Assistance", "Our team discusses availability and arranges the appropriate mobile service."], ["check-circle", "Get Back to Your Day", "Once service is completed, regain access or improve your property's security."]];
  return `<div class="steps">${S.map(([i, t, d], n) => `<div class="step reveal"><span class="step-n">${n + 1}</span><span class="step-ic">${ic(i)}</span><div><h3>${t}</h3><p>${d}</p></div></div>`).join("")}</div>`;
}

export function propertyTypes() {
  const P = [
    ["residential-home", "home", "Security for Your Home", "Professional residential lock repairs, lock changes, rekeying, smart lock installation, and emergency home lockout assistance.", "Explore Residential Services", svcUrl("residential-locksmith"), "Home Locksmith"],
    ["commercial-building", "building", "Protect Your Business", "Locksmith solutions for offices, retail spaces, commercial buildings, and business access requirements.", "Explore Commercial Services", svcUrl("commercial-locksmith"), "Business Locksmith"],
    ["luxury-vehicle", "car", "Get Back Into Your Vehicle", "Mobile automotive locksmith assistance, replacement car keys, vehicle lockouts, and compatible key programming.", "Explore Automotive Services", svcUrl("automotive-locksmith"), "Vehicle Locksmith"],
  ];
  return `<div class="prop-grid">${P.map(([im, i, h, d, b, href, label]) => `<article class="prop reveal">${img(im, { sizes: "(max-width: 900px) 100vw, 400px", maxW: 800 })}<div class="prop-cap"><span class="prop-lbl">${ic(i)}${label}</span><h3>${h}</h3><p>${d}</p><a class="btn btn-cta btn-sm" href="${href}">${b}${ic("arrow")}</a></div></article>`).join("")}</div>`;
}

export function stateCards() {
  const ma = activeLocations("MA");
  return `<div class="state-grid">
  <article class="state reveal">${img("massachusetts-illustrative", { sizes: "(max-width: 900px) 100vw, 40vw", maxW: 800 })}<div class="state-body"><h3>${ic("pin")}Massachusetts</h3><p>Serving cities across Western Massachusetts, including:</p>
    <div class="pills">${ma.slice(0, 8).map((l) => `<a href="${cityUrl(l)}" data-track="location_page_click" data-city="${l.city}" data-state="MA">${l.city}</a>`).join("")}<a class="pill-more" href="/areas/massachusetts/">+${ma.length - 8} more</a></div>
    <a class="btn btn-cta btn-sm" href="/areas/massachusetts/">View Massachusetts Service Areas${ic("arrow")}</a></div></article>
  <article class="state reveal">${img("connecticut-illustrative", { sizes: "(max-width: 900px) 100vw, 40vw", maxW: 800 })}<div class="state-body"><h3>${ic("pin")}Connecticut</h3><p>Mobile service in our Connecticut service areas. Specific towns are being confirmed, so call to check your address.</p>
    <div class="pills"><a href="/areas/connecticut/">Connecticut service areas</a></div>
    <a class="btn btn-cta btn-sm" href="/areas/connecticut/">View Connecticut Service Areas${ic("arrow")}</a></div></article></div>`;
}

export function reviewsSection() {
  const has = reviews.length > 0;
  return `<section class="section alt"><div class="container">${sectionHead("REVIEWS", "What Our Customers Say", has ? "" : "Read genuine customer feedback on our Google Business Profile.")}
  ${has ? `<div class="rev-grid">${reviews.map((r) => `<figure class="rev reveal"><blockquote>${esc(r.text)}</blockquote><figcaption>${esc(r.name)}${r.source ? ` · ${esc(r.source)}` : ""}</figcaption></figure>`).join("")}</div>` : ""}
  <div class="rev-cta reveal"><span class="rev-ic">${ic("google")}</span><div><h3>See what customers say about us on Google</h3><p>We only display reviews that customers have posted themselves.</p></div><a class="btn btn-cta" href="${biz.googleReviewsUrl}" target="_blank" rel="noopener" data-gbp-link data-track="google_reviews_click">Read Our Google Reviews${ic("arrow")}</a></div></div></section>`;
}

export function instagramSection() {
  const handle = biz.social.instagram;
  return `<section class="section ig" aria-labelledby="igTitle"><div class="container">
  <div class="section-head center reveal">${eyebrow("INSTAGRAM")}<h2 class="h2" id="igTitle">${instagram.heading}</h2><p class="lead">Behind-the-scenes mobile locksmith work, key and lock tips, and service updates.</p></div>
  <div class="ig-grid">${instagram.tiles.map((t) => {
    const inner = `${img(t.image, { sizes: "(max-width: 700px) 33vw, 200px", maxW: 480, alt: t.caption })}<span class="ig-ov">${ic("instagram")}<span>${esc(t.caption)}</span></span>`;
    return handle ? `<a class="ig-tile reveal" href="${handle}" target="_blank" rel="noopener" data-track="instagram_click">${inner}</a>` : `<figure class="ig-tile reveal">${inner}</figure>`;
  }).join("")}</div>
  ${handle ? `<p class="ig-cta reveal"><a class="btn btn-cta" href="${handle}" target="_blank" rel="noopener" data-track="instagram_click">${ic("instagram")}Follow on Instagram</a></p>` : ""}
  </div></section>`;
}

export function finalCta({ h = "Need a Locksmith Right Now?", p = "Emergency lockout, lost keys, or a security problem? Contact Locksmith Express MK for professional mobile locksmith assistance.", sub = "Serving Massachusetts &amp; Connecticut" } = {}) {
  return `<section class="final"><div class="final-bg">${img("emergency-cta-background", { sizes: "100vw", maxW: 1280 })}</div><div class="container final-in reveal">
  <div><h2>${h}</h2><p>${p}</p><span class="final-sub">${ic("pin")}${sub}</span></div>
  <div class="final-act">${callBtn(`Call Now: ${biz.phone}`, "final-cta", "btn btn-cta btn-xl")}<a class="btn btn-outline-light btn-lg" href="#quote" data-track="quote_cta">Get a Free Quote</a></div></div></section>`;
}

/* ---------- Footer + mobile bar ---------- */
export function footer() {
  const ma = activeLocations("MA");
  return `<footer class="footer"><div class="container">
  <div class="foot-grid">
    <div><a class="brand" href="/" aria-label="${esc(biz.shortName)} — home"><picture><source srcset="${biz.logoWebp}" type="image/webp"><img src="${biz.logo}" alt="${esc(biz.shortName)}" width="240" height="56" loading="lazy"></picture></a>
      <p>Mobile locksmith for cars, homes and businesses. Available 24/7 across our service areas in Massachusetts and Connecticut.</p></div>
    <div><p class="foot-h">Locksmith Services</p><ul>${services.map((s) => `<li><a href="${svcUrl(s.slug)}">${s.name}</a></li>`).join("")}</ul></div>
    <div><p class="foot-h">Service Areas</p><ul><li><a href="/areas/massachusetts/">Massachusetts</a></li><li><a href="/areas/connecticut/">Connecticut</a></li>${ma.slice(0, 4).map((l) => `<li><a href="${cityUrl(l)}">${l.city}, MA</a></li>`).join("")}<li><a href="/areas/">View all service areas</a></li></ul></div>
    <div><p class="foot-h">Contact</p>${PHONE(biz.phone, "f-phone", "footer")}<ul><li><a href="mailto:${biz.email}">${biz.email}</a></li><li>Open 24/7 for emergencies</li><li><a href="/contact/">Request a quote</a></li>${biz.social.instagram ? `<li><a href="${biz.social.instagram}" target="_blank" rel="noopener">Instagram</a></li>` : ""}</ul></div>
  </div>
  <div class="foot-bottom"><span>© <span id="year">${new Date().getFullYear()}</span> ${esc(biz.name)}. All rights reserved.</span><span class="fb-links"><a href="/privacy-policy/">Privacy Policy</a><a href="/terms-of-service/">Terms of Service</a><a href="/contact/">Accessibility: contact us</a></span></div>
  </div></footer>
<div class="mobile-cta"><a class="btn btn-cta" href="tel:${biz.phoneTel}" data-track="phone_click" data-cta="mobile-bar">${ic("phone")}Call Now</a><a class="btn btn-dark" href="#quote" data-track="quote_cta">Get a Quote</a></div>`;
}

export function page({ cur = "", body, city, bodyClass = "", lp = false }) {
  return `<body class="${bodyClass}">
<a class="skip-link" href="#main">Skip to content</a>
${sprite}
${lp ? "" : topbar({ city })}
${lp ? lpHeader() : header(cur)}
<main id="main">
${body}
</main>
${lp ? lpFooter() : footer()}
<script src="/js/main.js" defer></script>
</body>
</html>`;
}

function lpHeader() {
  return `<header class="header lp-header"><div class="container hd"><a class="brand" href="/" aria-label="${esc(biz.shortName)} — home"><picture><source srcset="${biz.logoWebp}" type="image/webp"><img src="${biz.logo}" alt="${esc(biz.shortName)} logo" width="214" height="50"></picture></a>
  <div class="lp-call"><small>24/7 Emergency</small>${PHONE(biz.phone, "lp-phone", "lp-header")}</div></div></header>`;
}
function lpFooter() {
  return `<footer class="footer footer-lp"><div class="container"><div class="foot-bottom"><span>© ${new Date().getFullYear()} ${esc(biz.name)} · ${PHONE(biz.phone, "", "lp-footer")} · <a href="mailto:${biz.email}">${biz.email}</a></span><span class="fb-links"><a href="/privacy-policy/">Privacy Policy</a><a href="/terms-of-service/">Terms of Service</a></span></div></div></footer>
<div class="mobile-cta"><a class="btn btn-cta" href="tel:${biz.phoneTel}" data-track="phone_click" data-cta="mobile-bar">${ic("phone")}Call Now</a><a class="btn btn-dark" href="#quote" data-track="quote_cta">Get a Quote</a></div>`;
}

export const localBusinessLd = (extra = {}) => ({
  "@context": "https://schema.org", "@type": "Locksmith", "@id": biz.url + "/#business", name: biz.name, alternateName: "Locksmith Express MK", url: biz.url, logo: biz.url + biz.logo, image: biz.url + "/assets/og-image.jpg", telephone: "+1-413-433-1135", email: biz.email,
  description: "24/7 mobile locksmith serving Springfield and Western Massachusetts, with service areas in Connecticut: lockouts, car keys, rekeying, lock changes, commercial and safe locksmith services.",
  openingHoursSpecification: [{ "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], opens: "00:00", closes: "23:59" }],
  areaServed: activeLocations("MA").map((l) => ({ "@type": "City", name: `${l.city}, MA` })).concat([{ "@type": "State", name: "Connecticut" }]),
  address: { "@type": "PostalAddress", addressRegion: "MA", addressCountry: "US" }, ...extra,
});
