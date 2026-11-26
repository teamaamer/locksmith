#!/usr/bin/env node
// Static site generator: node tools/build.mjs  (no dependencies)
import fs from "node:fs";
import path from "node:path";
import { biz, services, locations, campaigns, faqData, faqItem, esc, img, ic, svc, svcUrl, cityUrl, activeLocations, loc, write, ROOT } from "./lib.mjs";
import * as L from "./layout.mjs";
const { head, page, quoteForm, callBtn, quoteBtn, sectionHead, eyebrow, breadcrumbs, crumbsLd, faqSection, faqLd, trustStrip, HOME_STRIP, servicesGrid, serviceCard, emergencyBanner, whyChoose, howItWorks, propertyTypes, stateCards, reviewsSection, instagramSection, finalCta, localBusinessLd } = L;

const routes = []; // {url, indexable, kind}
const emit = (url, html, { indexable = true, kind = "page", file } = {}) => {
  routes.push({ url, indexable, kind });
  write(file ?? path.join(url.replace(/^\//, ""), "index.html"), html);
};
const websiteLd = { "@context": "https://schema.org", "@type": "WebSite", "@id": biz.url + "/#website", url: biz.url, name: biz.shortName, publisher: { "@id": biz.url + "/#business" } };
const MA = activeLocations("MA");
const hero = ({ eb, h1, accent, copy, bullets, image, form, imgPos = "right", cta = true, ctaPrimary }) => `<section class="hero"><div class="hero-bg">${img(image, { sizes: "100vw", eager: true, high: true })}</div>
<div class="container hero-grid"><div class="hero-copy">
  <span class="pill">${eb}</span>
  <h1>${h1}${accent ? `<br><em>${accent}</em>` : ""}</h1>
  <p class="hero-p">${copy}</p>
  ${bullets ? `<ul class="hero-bul">${bullets.map((b) => `<li>${ic("check")}${b}</li>`).join("")}</ul>` : ""}
  ${cta ? `<div class="hero-act">${ctaPrimary ?? callBtn(`Call Now: ${biz.phone}`, "hero")}${quoteBtn("Get a Free Quote", "#quote")}</div>` : ""}
</div>${form}</div></section>`;

/* ================= HOME ================= */
function home() {
  const body = `
${hero({ eb: "24/7 EMERGENCY LOCKSMITH SERVICES", h1: "Locked Out? Need a Key Replacement?", accent: "We've Got You Covered 24/7.",
  copy: "Get professional mobile locksmith assistance for your home, business, or vehicle. Locksmith Express MK serves communities across Massachusetts and Connecticut with emergency lockout assistance, lock repairs, key replacement, and security solutions.",
  bullets: ["Available 24/7", "Mobile locksmith assistance", "Residential, commercial and automotive", "Clear pricing communication"], image: "emergency-car-locksmith",
  form: quoteForm({ source: "/" }) })}
${trustStrip(HOME_STRIP)}
<section class="section" id="services"><div class="container">${sectionHead("OUR SERVICES", "Complete Locksmith Services", "From emergency lockouts to advanced security upgrades, Locksmith Express MK provides mobile locksmith solutions for homes, businesses, vehicles, and safes.")}${servicesGrid()}</div></section>
${emergencyBanner()}
<section class="section"><div class="container">${sectionHead("WHY CHOOSE US", "Professional Locksmith Help When You Need It")}${whyChoose()}</div></section>
<section class="section alt"><div class="container">${sectionHead("HOW IT WORKS", "Get Locksmith Help in Four Simple Steps")}${howItWorks()}<p class="center-cta reveal">${callBtn(`Call ${biz.phone}`, "how-it-works", "btn btn-cta btn-lg")}</p></div></section>
<section class="section"><div class="container">${sectionHead("SERVICES BY PROPERTY TYPE", "Locksmith Solutions for Every Need", "Expert locksmith services for your home, business, and vehicle — all in one place.")}${propertyTypes()}</div></section>
<section class="section keyfeat"><div class="container kf-grid"><div class="kf-img reveal">${img("car-key-fob", { sizes: "(max-width: 900px) 100vw, 520px", maxW: 800 })}<span class="kf-img2">${img("car-key-programming", { sizes: "260px", maxW: 480 })}</span></div>
  <div class="reveal">${eyebrow("SPARE CAR KEYS &amp; KEY PROGRAMMING")}<h2 class="h2">Lost Your Car Keys? Need a Spare?</h2>
  <p class="lead">Whether your keys are lost, damaged, or you simply need a spare, Locksmith Express MK provides automotive key services and compatible key fob programming at your location.</p>
  <ul class="ticks two">${["Replacement car keys", "Spare car keys", "Transponder keys", "Remote key fobs", "Car key programming", "Broken key assistance"].map((t) => `<li>${ic("check-circle")}${t}</li>`).join("")}</ul>
  <p class="note">Contact us with your vehicle's year, make, and model so we can confirm compatibility and availability.</p>
  <div class="row-btns"><a class="btn btn-cta btn-lg" href="${svcUrl("car-key-programming")}">Request Car Key Service${ic("arrow")}</a>${callBtn("Call Now", "car-key-feature", "btn btn-outline-dark btn-lg")}</div></div></div></section>
<section class="section alt"><div class="container">${sectionHead("AREAS WE SERVE", "Proudly Serving Massachusetts &amp; Connecticut", "Explore our mobile locksmith service areas and find assistance in your community.")}${stateCards()}</div></section>
<section class="section"><div class="container about"><div class="about-img reveal">${img("locksmith-customer-service", { sizes: "(max-width: 900px) 100vw, 520px", maxW: 800 })}<span class="img-note">Illustrative image</span></div>
  <div class="reveal">${eyebrow("ABOUT LOCKSMITH EXPRESS MK")}<h2 class="h2">Your Trusted Locksmith Partner</h2>
  <p class="lead">Locksmith Express MK provides mobile locksmith services for homeowners, businesses, and drivers across our service areas in Massachusetts and Connecticut. From unexpected lockouts to planned security improvements, our goal is to provide professional assistance that helps you regain access and protect your property.</p>
  <p>We understand that locksmith problems can happen at any time. That's why our services are designed to support residential, commercial, and automotive customers with emergency assistance and everyday security needs.</p>
  <ul class="ticks two">${["Residential and commercial solutions", "Automotive locksmith assistance", "Mobile service", "24/7 emergency availability"].map((t) => `<li>${ic("check-circle")}${t}</li>`).join("")}</ul>
  <a class="btn btn-cta" href="/about/">Learn More About Us${ic("arrow")}</a></div></div>
  <div class="container stats reveal">${[["clock", "24/7", "Emergency Availability"], ["map", "2", "States Served"], ["list", "9", "Core Service Categories"], ["van", "Mobile", "Locksmith Service"]].map(([i, n, t]) => `<div class="stat">${ic(i)}<strong>${n}</strong><span>${t}</span></div>`).join("")}</div></section>
${reviewsSection()}
${instagramSection()}
${faqSection(faqData.home.slice(0, 8), { sub: "" })}
${finalCta()}`;
  const html = head({ title: "24/7 Mobile Locksmith | Massachusetts & Connecticut | Locksmith Express MK", desc: "24/7 mobile locksmith for homes, businesses and vehicles in Massachusetts and Connecticut. Lockouts, lock repair, rekeying, car keys and more. Call (413) 433-1135.", path: "/", jsonld: [localBusinessLd(), websiteLd, faqLd(faqData.home.slice(0, 8))], preload: `<link rel="preload" as="image" href="/assets/img/hero/emergency-car-locksmith-1280.webp" imagesrcset="/assets/img/hero/emergency-car-locksmith-800.webp 800w, /assets/img/hero/emergency-car-locksmith-1280.webp 1280w, /assets/img/hero/emergency-car-locksmith-1672.webp 1672w" imagesizes="100vw" fetchpriority="high">` }) + page({ cur: "home", body });
  emit("/", html, { file: "index.html" });
}

/* ================= SERVICES ================= */
function servicesIndex() {
  const crumbs = [{ name: "Home", href: "/" }, { name: "Services", href: "/services/" }];
  const body = `${breadcrumbs(crumbs)}<section class="page-hero"><div class="container"><h1>Locksmith Services</h1><p class="lead">Mobile locksmith solutions for homes, businesses, vehicles and safes across Massachusetts and Connecticut.</p></div></section>
<section class="section"><div class="container">${servicesGrid()}</div></section>${finalCta()}`;
  emit("/services/", head({ title: "Locksmith Services | Residential, Commercial & Automotive | Locksmith Express MK", desc: "All locksmith services from Locksmith Express MK: residential, commercial, automotive, lockouts, lock change, rekeying, keypad, safe and car key programming.", path: "/services/", jsonld: [crumbsLd(crumbs)] }) + page({ cur: "services", body }));
}

function servicePage(s) {
  const crumbs = [{ name: "Home", href: "/" }, { name: "Services", href: "/services/" }, { name: s.name, href: svcUrl(s.slug) }];
  const rel = s.related.map(svc);
  const locs = MA.slice(0, 15);
  const body = `${breadcrumbs(crumbs)}
${hero({ eb: "24/7 MOBILE LOCKSMITH", h1: s.h1, copy: s.subtitle, bullets: s.options.slice(0, 4), image: s.heroImage, form: quoteForm({ service: serviceOpt(s), source: svcUrl(s.slug) }) })}
<section class="section"><div class="container two-col"><div class="reveal">${eyebrow("ABOUT THIS SERVICE")}<h2 class="h2">${s.name} From Locksmith Express MK</h2>${s.intro.map((p) => `<p class="lead">${p}</p>`).join("")}
  <div class="row-btns">${callBtn(`Call ${biz.phone}`, "service-intro", "btn btn-cta btn-lg")}<a class="btn btn-outline-dark btn-lg" href="#quote">Request a Quote</a></div></div>
  <div class="two-img reveal">${img(s.image2 === s.heroImage ? s.image : s.image2, { sizes: "(max-width: 900px) 100vw, 520px", maxW: 800 })}</div></div></section>
<section class="section alt"><div class="container"><div class="cols3">
  <div class="panel reveal"><h3>${ic("list")}What We Offer</h3><ul class="ticks">${s.options.map((t) => `<li>${ic("check-circle")}${t}</li>`).join("")}</ul></div>
  <div class="panel reveal"><h3>${ic("tool")}Common Problems We Address</h3><ul class="ticks">${s.problems.map((t) => `<li>${ic("check-circle")}${t}</li>`).join("")}</ul></div>
  <div class="panel reveal"><h3>${ic("users")}Who It's For</h3><ul class="ticks">${s.suited.map((t) => `<li>${ic("check-circle")}${t}</li>`).join("")}</ul></div></div></div></section>
<section class="section"><div class="container">${sectionHead("HOW IT WORKS", `How Our ${s.name} Requests Work`)}${howItWorks()}
  <div class="auth reveal">${ic("shield")}<p><strong>Security and authorization.</strong> ${s.authNote}</p></div></div></section>
<section class="section alt"><div class="container">${sectionHead("COVERAGE", "Where We Provide This Service", "Mobile service across our confirmed Massachusetts communities, plus our Connecticut service areas.")}
  <div class="pills big">${locs.map((l) => `<a href="${cityUrl(l)}" data-track="location_page_click" data-city="${l.city}" data-state="MA">${l.city}, MA</a>`).join("")}<a href="/areas/connecticut/">Connecticut service areas</a></div></div></section>
<section class="section"><div class="container">${sectionHead("RELATED SERVICES", "Other Locksmith Services")}<div class="svc-grid cols2">${rel.map((r) => serviceCard(r)).join("")}</div></div></section>
${faqSection([], { heading: `${s.name} FAQ`, image: s.gallery[0], extra: s.faqs, eb: "FAQ" })}
${finalCta()}`;
  emit(svcUrl(s.slug), head({ title: s.metaTitle, desc: s.metaDesc, path: svcUrl(s.slug), jsonld: [crumbsLd(crumbs), { "@context": "https://schema.org", "@type": "Service", name: s.name, serviceType: s.name, provider: { "@id": biz.url + "/#business" }, areaServed: [{ "@type": "State", name: "Massachusetts" }, { "@type": "State", name: "Connecticut" }], description: s.metaDesc }, faqLd([], s.faqs)] }) + page({ cur: ["residential-locksmith", "commercial-locksmith", "automotive-locksmith"].includes(s.slug) ? s.slug.split("-")[0] : "services", body }));
}
const serviceOpt = (s) => ({ "residential-locksmith": "Residential Locksmith", "commercial-locksmith": "Commercial Locksmith", "automotive-locksmith": "Automotive Locksmith", "lockout-service": "Emergency Lockout", "lock-change-service": "Lock Change", "lock-rekey-service": "Lock Rekeying", "keypad-installation": "Keypad Installation", "safe-locksmith": "Safe Locksmith", "car-key-programming": "Car Key Programming" }[s.slug]);

/* ================= AREAS ================= */
function areasIndex() {
  const crumbs = [{ name: "Home", href: "/" }, { name: "Areas We Serve", href: "/areas/" }];
  const body = `${breadcrumbs(crumbs)}<section class="page-hero"><div class="container"><h1>Areas We Serve</h1><p class="lead">Mobile locksmith service across Western Massachusetts and our Connecticut service areas.</p></div></section>
<section class="section"><div class="container">${stateCards()}</div></section>${finalCta()}`;
  emit("/areas/", head({ title: "Areas We Serve | Massachusetts & Connecticut Locksmith | Locksmith Express MK", desc: "Locksmith Express MK mobile service areas in Massachusetts and Connecticut.", path: "/areas/", jsonld: [crumbsLd(crumbs)] }) + page({ cur: "areas", body }));
}

function statePage(st) {
  const isMA = st === "MA";
  const name = isMA ? "Massachusetts" : "Connecticut";
  const url = `/areas/${name.toLowerCase()}/`;
  const crumbs = [{ name: "Home", href: "/" }, { name: "Areas We Serve", href: "/areas/" }, { name: name, href: url }];
  const faqs = isMA
    ? [{ q: "Which Massachusetts communities do you serve?", a: `Our advertised Massachusetts service areas are ${MA.map((l) => l.city).join(", ")}. Call to confirm availability for your address.` }, { q: "Do response times differ across Massachusetts?", a: "Yes. Time depends on technician availability, distance and traffic, and hill towns can be farther from Springfield. Call for an estimated response time." }]
    : [{ q: "Which Connecticut towns do you serve?", a: "We provide mobile service in our Connecticut service areas. Individual towns are being confirmed, so please call (413) 433-1135 or send your ZIP code to check your address." }, { q: "Do you cover all of Connecticut?", a: "No. We do not claim statewide coverage. Contact us to find out whether your location is within our service area." }];
  const body = `${breadcrumbs(crumbs)}
${hero({ eb: isMA ? "24/7 LOCKSMITH — MASSACHUSETTS" : "MOBILE LOCKSMITH — CONNECTICUT", h1: `Professional Locksmith Services in ${name}`, copy: isMA ? "Get mobile residential, commercial, and automotive locksmith assistance throughout our confirmed Massachusetts service areas." : "Contact Locksmith Express MK for residential, commercial, and automotive locksmith assistance in our Connecticut service areas.", bullets: ["Available 24/7", "Mobile service to your location", "Homes, businesses and vehicles", "Quote before work is authorized"], image: isMA ? "emergency-car-locksmith" : "locksmith-service-van", form: quoteForm({ state: st, source: url }) })}
${isMA ? `<section class="section"><div class="container">${sectionHead("CONFIRMED CITIES", "Massachusetts Service Areas", "Choose your city to see local information and request service.")}<div class="city-grid">${MA.map((l) => `<a class="city-card reveal" href="${cityUrl(l)}" data-track="location_page_click" data-city="${l.city}" data-state="MA">${ic("pin")}<span><strong>${l.city}, MA</strong><small>Mobile locksmith service</small></span>${ic("arrow")}</a>`).join("")}</div></div></section>` :
  `<section class="section"><div class="container two-col"><div class="reveal">${eyebrow("CONNECTICUT COVERAGE")}<h2 class="h2">Connecticut Service Areas</h2><p class="lead">Locksmith Express MK provides mobile service in parts of Connecticut near our Massachusetts base. Rather than list towns before they are verified, we confirm coverage when you contact us.</p><p>Tell us your address or ZIP code and we will let you know whether we can reach you and give an estimated response time.</p><div class="row-btns">${callBtn(`Call ${biz.phone}`, "ct-page", "btn btn-cta btn-lg")}<a class="btn btn-outline-dark btn-lg" href="#quote">Check My Address</a></div></div><div class="two-img reveal">${img("connecticut-illustrative", { sizes: "(max-width: 900px) 100vw, 520px", maxW: 800 })}<span class="img-note">Illustrative image</span></div></div></section>`}
<section class="section alt"><div class="container">${sectionHead("SERVICES", `Locksmith Services in ${name}`)}${servicesGrid()}</div></section>
<section class="section"><div class="container">${sectionHead("HOW IT WORKS", "Get Locksmith Help in Four Simple Steps")}${howItWorks()}</div></section>
${faqSection([ "247", "arrival", "ownership" ], { heading: `${name} Locksmith FAQ`, extra: faqs, image: isMA ? "massachusetts-illustrative" : "connecticut-illustrative" })}
${finalCta()}`;
  emit(url, head({ title: isMA ? "24/7 Mobile Locksmith in Massachusetts | Locksmith Express MK" : "Mobile Locksmith Services in Connecticut | Locksmith Express MK", desc: isMA ? "Get mobile residential, commercial, and automotive locksmith assistance throughout our confirmed Massachusetts service areas." : "Contact Locksmith Express MK for residential, commercial, and automotive locksmith assistance in our Connecticut service areas.", path: url, jsonld: [crumbsLd(crumbs), faqLd(["247", "arrival", "ownership"], faqs)] }) + page({ cur: "areas", body }));
}

function cityPage(l) {
  const url = cityUrl(l);
  const crumbs = [{ name: "Home", href: "/" }, { name: "Areas We Serve", href: "/areas/" }, { name: "Massachusetts", href: "/areas/massachusetts/" }, { name: `${l.city}, MA`, href: url }];
  const emph = l.emphasis.slice(0, 8).map(svc);
  const near = l.nearbyCities.map((n) => MA.find((m) => m.city === n)).filter(Boolean);
  const rural = l.kind === "rural";
  const cityKeys = ["247", "arrival", "ownership"];
  const body = `${breadcrumbs(crumbs)}
${hero({ eb: `24/7 LOCKSMITH — ${l.city.toUpperCase()}, MA`, h1: `Locked Out in ${l.city}, MA?`, accent: "Get Professional Locksmith Help 24/7.", copy: `Locksmith Express MK provides mobile locksmith assistance for homes, businesses, and vehicles in ${l.city}, Massachusetts. Contact our team for emergency lockouts, lock repairs, replacement keys, and security solutions.`, image: l.heroImage, ctaPrimary: callBtn(`Call ${biz.phone}`, "city-hero"), form: quoteForm({ city: l.city, state: "MA", source: url, title: "Get a Free Quote", sub: `Tell us what you need in ${l.city} and we'll get back to you.` }) })}
<section class="strip strip-city"><div class="container strip-in">${[["clock", "Available 24/7"], ["van", `Mobile service in ${l.city}`], ["shield", "Residential, commercial &amp; automotive"]].map(([i, t]) => `<div class="strip-item">${ic(i)}<span>${t}</span></div>`).join("")}</div></section>
<section class="band-line"><div class="container"><span>${ic("pin")}<strong>Emergency Locksmith in ${l.city}, MA</strong></span><span>${ic("map")}Service across ${l.city}${near.length ? ` and nearby areas including ${near.slice(0, 3).map((n) => n.city).join(", ")}` : ""}</span></div></section>
<section class="section"><div class="container">${sectionHead("OUR SERVICES IN " + l.city.toUpperCase(), `Most Requested in ${l.city}`, `Fast, reliable locksmith services for homes, businesses, and vehicles in ${l.city}, MA.`)}${servicesGrid(emph)}</div></section>
<section class="section alt"><div class="container two-col"><div class="reveal">${eyebrow(`${l.city.toUpperCase()}, MASSACHUSETTS`)}<h2 class="h2">Locksmith Help Around ${l.city}</h2><p class="lead">${l.localDescription}</p>
  <h3 class="h3">Situations we commonly help with</h3><ul class="ticks">${l.needs.map((t) => `<li>${ic("check-circle")}${t}</li>`).join("")}</ul>
  ${rural ? `<p class="note">${l.city} is farther from our Springfield-area base than most communities, so response times can be longer. Call ${biz.phone} for an estimated time.</p>` : ""}
  <div class="row-btns">${callBtn(`Call ${biz.phone}`, "city-local", "btn btn-cta btn-lg")}<a class="btn btn-outline-dark btn-lg" href="#quote">Request a Quote</a></div></div>
  <div class="two-img reveal">${img(l.heroImage === "emergency-car-locksmith" ? "locksmith-service-van" : l.heroImage, { sizes: "(max-width: 900px) 100vw, 520px", maxW: 800 })}<span class="img-note">Illustrative image</span></div></div></section>
<section class="section"><div class="container"><div class="cols3">
  <div class="panel reveal"><h3>${ic("home")}Residential in ${l.city}</h3><p>Home lockouts, rekeying, lock changes, deadbolts and smart locks for houses and apartments.</p><a class="more" href="${svcUrl("residential-locksmith")}">Residential locksmith ${ic("arrow")}</a></div>
  <div class="panel reveal"><h3>${ic("building")}Commercial in ${l.city}</h3><p>Lock repair, rekeying, master key systems and access hardware for local businesses.</p><a class="more" href="${svcUrl("commercial-locksmith")}">Commercial locksmith ${ic("arrow")}</a></div>
  <div class="panel reveal"><h3>${ic("car")}Automotive in ${l.city}</h3><p>Car lockouts, lost-key help, spare keys and compatible key fob programming.</p><a class="more" href="${svcUrl("automotive-locksmith")}">Automotive locksmith ${ic("arrow")}</a></div></div></div></section>
<section class="section alt"><div class="container">${sectionHead("WHY LOCAL CUSTOMERS CHOOSE US", "Why Choose Locksmith Express MK")}${whyChoose()}</div></section>
<section class="section"><div class="container two-col"><div class="reveal">${eyebrow("SERVICE AREA")}<h2 class="h2">Service Area Near ${l.city}</h2><p class="lead">Based in the Springfield area, Locksmith Express MK serves ${l.city} and surrounding communities across Western Massachusetts.</p>
  <div class="pills big"><a class="on" href="${url}">${l.city}, MA</a>${near.map((n) => `<a href="${cityUrl(n)}" data-track="location_page_click" data-city="${n.city}" data-state="MA">${n.city}, MA</a>`).join("")}<a href="/areas/massachusetts/">All Massachusetts areas</a></div></div>
  <div class="two-img reveal">${img("massachusetts-illustrative", { sizes: "(max-width: 900px) 100vw, 520px", maxW: 800 })}<span class="img-note">Illustrative image</span></div></div></section>
<section class="section alt"><div class="container">${sectionHead("HOW IT WORKS", "How Our Locksmith Service Works")}${howItWorks()}</div></section>
${faqSection(cityKeys, { heading: `${l.city} Locksmith FAQ`, extra: [l.localFaq], image: "home-and-car-keys" })}
${finalCta({ h: `Need an Emergency Locksmith in ${l.city}, MA?`, p: `Call now for mobile locksmith help in ${l.city}.`, sub: `Serving ${l.city} &amp; nearby Western Massachusetts` })}`;
  emit(url, head({ title: l.seoTitle, desc: l.metaDescription, path: url, jsonld: [crumbsLd(crumbs), faqLd(cityKeys, [l.localFaq]), { "@context": "https://schema.org", "@type": "Service", name: `Locksmith services in ${l.city}, MA`, provider: { "@id": biz.url + "/#business" }, areaServed: { "@type": "City", name: `${l.city}, MA` } }] }) + page({ cur: "areas", body, city: `${l.city}, MA` }));
}

/* ================= LANDING PAGES ================= */
function lpPage(c) {
  const url = `/lp/${c.slug}/`;
  const body = `<section class="hero lp-hero"><div class="hero-bg">${img(c.image, { sizes: "100vw", eager: true, high: true })}</div>
<div class="container hero-grid"><div class="hero-copy"><span class="pill">${c.eyebrow}</span><h1>${c.title}</h1><p class="hero-p">${c.sub}</p>
<ul class="hero-bul">${c.bullets.map((b) => `<li>${ic("check")}${b}</li>`).join("")}</ul>
<div class="hero-act">${callBtn(`Call Now: ${biz.phone}`, "lp-hero")}<a class="btn btn-outline btn-lg" href="#quote" data-track="quote_cta">Request Assistance</a></div></div>
${quoteForm({ city: c.city, state: c.state, service: c.service, kind: c.formKind, source: url, title: "Request Assistance", sub: "Tell us what you need and our team will contact you.", btn: "Request Assistance" })}</div></section>
${trustStrip([["clock", "24/7 Emergency Support"], ["van", "Mobile Service"], ["shield", "Cars, Homes &amp; Businesses"], ["pin", `${c.city}, MA &amp; Nearby`]])}
<section class="section"><div class="container two-col"><div class="reveal">${eyebrow("HOW IT WORKS")}<h2 class="h2">Get Help in Four Simple Steps</h2>${howItWorks()}</div></div></section>
<section class="section alt"><div class="container">${sectionHead("COVERAGE", "Confirmed Coverage Area", `Mobile service in ${c.city}, MA and nearby communities. Call to confirm your address.`)}<div class="pills big">${[c.city, ...loc(c.city.toLowerCase().replace(/ /g, "-")).nearbyCities].map((n) => `<span>${n}, MA</span>`).join("")}</div></div></section>
${faqSection(c.faqs, { heading: "Quick Answers", image: null })}
${finalCta({ h: "Need a Locksmith Right Now?", sub: `Serving ${c.city}, MA &amp; nearby` })}`;
  emit(url, head({ title: c.metaTitle, desc: c.sub, path: url, robots: "noindex, follow", jsonld: [faqLd(c.faqs)] }) + page({ body, lp: true, bodyClass: "lp" }), { indexable: false, kind: "lp" });
}

/* ================= INFO PAGES ================= */
function infoPages() {
  // About
  let crumbs = [{ name: "Home", href: "/" }, { name: "About Us", href: "/about/" }];
  emit("/about/", head({ title: "About Locksmith Express MK | Mobile Locksmith in MA & CT", desc: "Learn about Locksmith Express MK, a mobile locksmith serving homeowners, businesses and drivers in Massachusetts and Connecticut.", path: "/about/", jsonld: [crumbsLd(crumbs)] }) + page({ cur: "about", body: `${breadcrumbs(crumbs)}<section class="page-hero"><div class="container"><h1>About Locksmith Express MK</h1><p class="lead">A mobile locksmith for homes, businesses and vehicles across Massachusetts and Connecticut.</p></div></section>
<section class="section"><div class="container about"><div class="about-img reveal">${img("locksmith-team-illustrative", { sizes: "(max-width: 900px) 100vw, 520px", maxW: 800 })}<span class="img-note">Illustrative image — not our team</span></div><div class="reveal"><h2 class="h2">Your Trusted Locksmith Partner</h2><p class="lead">Locksmith Express MK provides mobile locksmith services for homeowners, businesses, and drivers across our service areas in Massachusetts and Connecticut. From unexpected lockouts to planned security improvements, our goal is to provide professional assistance that helps you regain access and protect your property.</p><p>We understand that locksmith problems can happen at any time. That's why our services are designed to support residential, commercial, and automotive customers with emergency assistance and everyday security needs.</p><p>Our service is mobile: we come to your home, business or vehicle. Call ${L.callBtn ? `<a href="tel:${biz.phoneTel}">${biz.phone}</a>` : ""} to discuss your situation.</p><ul class="ticks two">${["Residential and commercial solutions", "Automotive locksmith assistance", "Mobile service", "24/7 emergency availability"].map((t) => `<li>${ic("check-circle")}${t}</li>`).join("")}</ul></div></div></section>${finalCta()}` }));
  // Contact
  crumbs = [{ name: "Home", href: "/" }, { name: "Contact", href: "/contact/" }];
  emit("/contact/", head({ title: "Contact Locksmith Express MK | Call (413) 433-1135", desc: "Contact Locksmith Express MK for 24/7 mobile locksmith service in Massachusetts and Connecticut. Call (413) 433-1135 or request a quote online.", path: "/contact/", jsonld: [crumbsLd(crumbs)] }) + page({ cur: "contact", body: `${breadcrumbs(crumbs)}<section class="page-hero"><div class="container"><h1>Contact Us</h1><p class="lead">For lockouts and emergencies, calling is fastest. For everything else, send a request.</p></div></section>
<section class="section"><div class="container contact-grid"><ul class="contact-list reveal"><li><a class="contact-item" href="tel:${biz.phoneTel}" data-track="phone_click" data-cta="contact-page"><span class="ci">${ic("phone")}</span><div><small>Phone</small><strong>${biz.phone}</strong><span>Tap to call — 24/7</span></div></a></li><li><a class="contact-item" href="mailto:${biz.email}"><span class="ci">${ic("mail")}</span><div><small>Email</small><strong>${biz.email}</strong><span>Send us your details anytime</span></div></a></li><li><div class="contact-item"><span class="ci">${ic("clock")}</span><div><small>Hours</small><strong>24/7 emergency service</strong><span>Mon – Sun</span></div></div></li></ul>${quoteForm({ title: "Request Service", sub: "We'll get back to you right away.", source: "/contact/", labels: true })}</div></section>` }));
  // FAQ
  crumbs = [{ name: "Home", href: "/" }, { name: "FAQ", href: "/faq/" }];
  emit("/faq/", head({ title: "Locksmith FAQ | Locksmith Express MK", desc: "Answers to common locksmith questions about availability, service areas, car keys, rekeying, pricing and more.", path: "/faq/", jsonld: [crumbsLd(crumbs), faqLd(faqData.home)] }) + page({ cur: "faq", body: `${breadcrumbs(crumbs)}<section class="page-hero"><div class="container"><h1>Frequently Asked Locksmith Questions</h1></div></section>${faqSection(faqData.home, { heading: "Common questions", sub: `Still unsure? Call ${biz.phone} for a free consultation.` })}${finalCta()}` }));
  // Privacy
  const priv = fs.readFileSync(path.join(ROOT, "data/legal-privacy.html"), "utf8");
  crumbs = [{ name: "Home", href: "/" }, { name: "Privacy Policy", href: "/privacy-policy/" }];
  emit("/privacy-policy/", head({ title: "Privacy Policy | Locksmith Express MK", desc: "How Locksmith Express MK collects, uses and protects your information, including SMS terms.", path: "/privacy-policy/", jsonld: [] }) + page({ body: `${breadcrumbs(crumbs)}<section class="section legal"><div class="container wrap"><h1>Privacy Policy</h1>${priv}</div></section>` }));
  // Terms
  crumbs = [{ name: "Home", href: "/" }, { name: "Terms of Service", href: "/terms-of-service/" }];
  emit("/terms-of-service/", head({ title: "Terms of Service | Locksmith Express MK", desc: "Terms of use for the Locksmith Express MK website and service requests.", path: "/terms-of-service/", jsonld: [] }) + page({ body: `${breadcrumbs(crumbs)}<section class="section legal"><div class="container wrap"><h1>Terms of Service</h1><p class="updated">Draft — requires client and legal review before launch.</p>
<h2>Using this website</h2><p>This website provides information about the mobile locksmith services offered by ${esc(biz.name)}. Submitting a form is a request to be contacted; it is not a booking or a guarantee of service availability, arrival time or price.</p>
<h2>Quotes and pricing</h2><p>Pricing depends on the service, location, hardware, vehicle and other job details. We discuss pricing with you before work is authorized.</p>
<h2>Proof of ownership or authorization</h2><p>For everyone's security, we may require proof of ownership or authorization before providing access-related locksmith services for a home, business, vehicle or safe.</p>
<h2>Service areas</h2><p>Service is available in the areas we confirm with you. Listing a town on this website does not guarantee availability at a specific address or time.</p>
<h2>Contact</h2><p>Questions? Call <a href="tel:${biz.phoneTel}">${biz.phone}</a> or email <a href="mailto:${biz.email}">${biz.email}</a>.</p></div></section>` }), { indexable: true });
  // Thank-you & 404
  emit("/thank-you/", head({ title: "Thank You | Locksmith Express MK", desc: "Thank you for contacting Locksmith Express MK.", path: "/thank-you/", robots: "noindex, nofollow" }) + page({ body: `<section class="page-hero"><div class="container"><h1>Thank you</h1><p class="lead">Your request was received. Need help right now? Call us.</p><p>${callBtn(`Call ${biz.phone}`, "thank-you", "btn btn-cta btn-lg")}</p></div></section>` }), { indexable: false });
  write("404.html", head({ title: "Page Not Found | Locksmith Express MK", desc: "The page you are looking for could not be found.", path: "/404.html", robots: "noindex, nofollow" }) + page({ body: `<section class="page-hero"><div class="container"><h1>Page not found</h1><p class="lead">That page does not exist, but we can still help you.</p><p>${callBtn(`Call ${biz.phone}`, "404", "btn btn-cta btn-lg")} <a class="btn btn-outline-dark btn-lg" href="/">Back to home</a></p></div></section>` }));
}

/* ================= RUN ================= */
home(); servicesIndex(); services.forEach(servicePage); areasIndex(); statePage("MA"); statePage("CT"); MA.forEach(cityPage); campaigns.forEach(lpPage); infoPages();

// sitemap + robots
const sm = routes.filter((r) => r.indexable && r.url !== "/terms-of-service/" || r.url === "/terms-of-service/").filter((r) => r.indexable).map((r) => `  <url><loc>${biz.url}${r.url}</loc></url>`).join("\n");
write("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sm}\n</urlset>\n`);
write("robots.txt", `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${biz.url}/sitemap.xml\n`);
write("data/route-inventory.json", JSON.stringify(routes, null, 1));
console.log(`built ${routes.length} routes (${routes.filter((r) => r.indexable).length} in sitemap)`);
