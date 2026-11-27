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
export const campaigns = read("campaigns.json");

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
