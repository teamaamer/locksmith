#!/usr/bin/env node
// One-off: copies the design + content of the legacy WordPress site (www.locksmithexpressmk.com)
// into the repo so the static generator can reproduce it exactly, fully self-hosted.
//   node tools/mirror-legacy.mjs
// Outputs: data/legacy/*.json, css/legacy/*.css, assets/legacy/**, assets/fa/**
import fs from "node:fs";
import path from "node:path";
import { ROOT } from "./lib.mjs";

const ORIGIN = "https://www.locksmithexpressmk.com";
const UA = { "User-Agent": "Mozilla/5.0 (Macintosh) site-migration" };
const PAGES = {
  home: "/", services: "/services/", "services-2": "/services/page/2/", about: "/about/", contact: "/contact/",
  "residential-locksmith": "/services/residential-locksmith/", "commercial-locksmith": "/services/commercial-locksmith/",
  "automotive-locksmith": "/services/automotive-locksmith/", "safe-locksmith": "/services/safe-locksmith/",
  "lockout-service": "/services/lockout-service/", "lock-change-service": "/services/lock-change-service/",
  "keypad-installation": "/services/keypad-installation/", "lock-rekey-service": "/services/lock-rekey-service/",
  "car-key-programming": "/services/car-key-programming/",
  "chevrolet-gmc-cadillac-buick-locksmith": "/services/chevrolet-gmc-cadillac-buick-locksmith/",
  "ford-lincoln-locksmith": "/services/ford-lincoln-locksmith/", "honda-acura-locksmith": "/services/honda-acura-locksmith/",
  "hyundai-kia-locksmith": "/services/hyundai-kia-locksmith/", "jeep-dodge-chrysler-ram-locksmith": "/services/jeep-dodge-chrysler-ram-locksmith/",
  "mazda-mitsubishi-locksmith": "/services/mazda-mitsubishi-locksmith/", "nissan-infiniti-locksmith": "/services/nissan-infiniti-locksmith/",
};

const out = (rel) => { const p = path.join(ROOT, rel); fs.mkdirSync(path.dirname(p), { recursive: true }); return p; };
const get = async (url, bin = false) => {
  const r = await fetch(url, { headers: UA, redirect: "follow" });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return bin ? Buffer.from(await r.arrayBuffer()) : r.text();
};
const decode = (s) => s.replace(/&#0*(\d+);/g, (_, n) => String.fromCharCode(+n)).replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)));

const downloaded = new Map();
async function localAsset(u) {
  const clean = decode(u).split("?")[0];
  if (downloaded.has(clean)) return downloaded.get(clean);
  const rel = clean.replace(ORIGIN + "/wp-content/uploads/", "assets/legacy/").replace(/[^\w\-./]/g, (c) => encodeURIComponent(c).replace(/%/g, ""));
  const local = "/" + rel;
  downloaded.set(clean, local);
  if (!fs.existsSync(path.join(ROOT, rel))) fs.writeFileSync(out(rel), await get(encodeURI(clean).replace(/%25/g, "%"), true));
  return local;
}
async function rewrite(html) {
  html = html.replace(/<script\b[\s\S]*?<\/script>/g, "").replace(/\s(srcset|sizes)="[^"]*"/g, "").replace(/\sdata-aos(-[\w-]+)?="[^"]*"/g, "");
  const ups = [...new Set(html.match(/https?:\/\/www\.locksmithexpressmk\.com\/wp-content\/uploads\/[^"'\s)]+/g) || [])];
  for (const u of ups) html = html.split(u).join(await localAsset(u));
  return html.replace(/https?:\/\/www\.locksmithexpressmk\.com\/?/g, "/").replace(/href="\/\/+/g, 'href="/');
}

const cssFiles = new Set();
const inlineCss = new Map();
let chrome;
for (const [key, p] of Object.entries(PAGES)) {
  const html = await get(ORIGIN + p);
  const title = decode((html.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || "").trim();
  const desc = decode((html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || "");
  const bodyClass = (html.match(/<body class="([^"]*)"/) || [])[1] || "";
  const main = html.match(/<main\b[\s\S]*<\/main>/)[0];
  for (const m of html.matchAll(/href=['"](https:\/\/www\.locksmithexpressmk\.com\/wp-content\/themes\/service-locksmith\/[^'"]+\.css)/g)) cssFiles.add(m[1].split("?")[0]);
  for (const m of html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) {
    const s = m[1].trim();
    if (!s || /wp--preset|wp-block-synced|contain-intrinsic-size|Font Awesome 6 Free/.test(s)) continue;
    inlineCss.set(s, true);
  }
  fs.writeFileSync(out(`data/legacy/${key}.json`), JSON.stringify({ url: p, title, desc, bodyClass, main: await rewrite(main) }, null, 1));
  if (key === "home") {
    const header = html.match(/<header id="masthead"[\s\S]*?<\/header>/)[0];
    const fcta = html.match(/<div class="floating-cta-wrap"[\s\S]*?<\/div><!-- \.floating-cta-wrap -->/)[0];
    const qcb = html.match(/<div class="quick-contact-bar[\s\S]*?(?=<footer)/)[0];
    const footer = html.match(/<footer id="colophon"[\s\S]*?<\/footer>/)[0];
    chrome = { header: await rewrite(header), floating: await rewrite(fcta), quickbar: await rewrite(qcb), footer: await rewrite(footer) };
  }
  console.log("page", key, title);
}
fs.writeFileSync(out("data/legacy/chrome.json"), JSON.stringify(chrome, null, 1));

// Theme CSS (self-hosted, uploads rewritten)
const names = [];
for (const u of cssFiles) {
  if (/aos\.css$/.test(u)) continue; // scroll-animation library not used (content must never be hidden)
  let css = await get(u);
  const ups = [...new Set(css.match(/https?:\/\/www\.locksmithexpressmk\.com\/wp-content\/uploads\/[^"'\s)]+/g) || [])];
  for (const x of ups) css = css.split(x).join(await localAsset(x));
  const name = path.basename(u);
  fs.writeFileSync(out(`css/legacy/${name}`), css);
  names.push(name);
}
let inl = [...inlineCss.keys()].join("\n\n");
for (const x of [...new Set(inl.match(/https?:\/\/www\.locksmithexpressmk\.com\/wp-content\/uploads\/[^"'\s)]+/g) || [])]) inl = inl.split(x).join(await localAsset(x));
fs.writeFileSync(out("css/legacy/customizer.css"), inl);
fs.writeFileSync(out("data/legacy/css.json"), JSON.stringify(names, null, 1));

// Font Awesome 6 (solid/regular/brands, woff2 only)
const FA = ORIGIN + "/wp-content/themes/service-locksmith/assets/vendor/fontawesome";
let fa = await get(FA + "/css/all.min.css");
fa = fa.replace(/,url\(\.\.\/webfonts\/[^)]+\.ttf\) format\("truetype"\)/g, "").replace(/url\(\.\.\/webfonts\//g, "url(/assets/fa/webfonts/");
fs.writeFileSync(out("assets/fa/all.min.css"), fa);
for (const f of ["fa-solid-900", "fa-regular-400", "fa-brands-400"]) fs.writeFileSync(out(`assets/fa/webfonts/${f}.woff2`), await get(`${FA}/webfonts/${f}.woff2`, true));

// Every image the legacy site exposes in its uploads that the pages use, plus favicon
console.log("css:", names.join(", "), "| assets:", downloaded.size);
