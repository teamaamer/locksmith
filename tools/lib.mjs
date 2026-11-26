// Shared helpers + data loading for the static site generator.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (f) => JSON.parse(fs.readFileSync(path.join(ROOT, "data", f), "utf8"));
export const biz = read("business.json");
export const services = read("services.json");
export const locations = read("locations.json");
export const faqData = read("faqs.json");
export const reviews = read("reviews.json");
export const campaigns = read("campaigns.json");
export const instagram = read("instagram.json");
export const images = read("images.json");

export const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
export const svc = (slug) => services.find((s) => s.slug === slug);
export const activeLocations = (st) => locations.filter((l) => l.active && l.clientConfirmed && (!st || l.stateCode === st));
export const loc = (slug) => locations.find((l) => l.slug === slug && l.stateCode === "MA");
export const svcUrl = (slug) => `/services/${slug}/`;
export const cityUrl = (l) => `/areas/${l.state.toLowerCase()}/${l.slug}/`;
export const faqItem = (k) => faqData.items[k];

export function write(rel, html) {
  const out = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, html);
}

/** Responsive <img> from the optimised-image manifest. */
export function img(name, { sizes = "100vw", cls = "", eager = false, high = false, alt, maxW } = {}) {
  const m = images[name];
  if (!m) throw new Error("Unknown image " + name);
  const ws = m.widths.filter((w) => !maxW || w <= maxW);
  const use = ws.length ? ws : [m.widths[0]];
  const srcset = use.map((w) => `/assets/img/${m.group}/${name}-${w}.webp ${w}w`).join(", ");
  const base = use[Math.min(1, use.length - 1)];
  const h = Math.round((base * m.ratio[1]) / m.ratio[0]);
  return `<img${cls ? ` class="${cls}"` : ""} src="/assets/img/${m.group}/${name}-${base}.webp" srcset="${srcset}" sizes="${sizes}" width="${base}" height="${h}" alt="${esc(alt ?? m.alt)}"${eager ? "" : ' loading="lazy"'}${high ? ' fetchpriority="high"' : ""} decoding="async">`;
}
export const ic = (n, cls = "") => `<svg class="ic${cls ? " " + cls : ""}" aria-hidden="true"><use href="#i-${n}"/></svg>`;

export const phoneLink = (cls = "", label = biz.phone, loc_ = "link") =>
  `<a${cls ? ` class="${cls}"` : ""} href="tel:${biz.phoneTel}" data-track="phone_click" data-cta="${loc_}">${label}</a>`;
