// Static QA: node tools/qa.mjs — checks internal links/images, titles, descriptions, H1s, canonicals, alt text.
import fs from "node:fs"; import path from "node:path";
import { ROOT } from "./lib.mjs";
const files = []; const walk = (d) => { for (const f of fs.readdirSync(d)) { if (["node_modules", ".git", "assets", "data", "design-references", "tools", "api", "css", "js"].includes(f)) continue; const p = path.join(d, f); fs.statSync(p).isDirectory() ? walk(p) : p.endsWith(".html") && files.push(p); } };
walk(ROOT);
const titles = new Map(), descs = new Map(); const problems = [];
const exists = (u) => { u = u.split("#")[0].split("?")[0]; if (!u || u === "/") return true; const p = path.join(ROOT, u); return fs.existsSync(p) && (fs.statSync(p).isFile() || fs.existsSync(path.join(p, "index.html"))); };
for (const f of files) {
  const rel = path.relative(ROOT, f); const h = fs.readFileSync(f, "utf8");
  const t = (h.match(/<title>([^<]*)/) || [])[1], d = (h.match(/<meta name="description" content="([^"]*)"/) || [])[1];
  const h1 = (h.match(/<h1[ >]/g) || []).length;
  if (h1 !== 1) problems.push(`${rel}: ${h1} h1`);
  if (!t) problems.push(`${rel}: no title`); else (titles.get(t) || titles.set(t, []).get(t)).push(rel);
  if (!d) problems.push(`${rel}: no description`); else (descs.get(d) || descs.set(d, []).get(d)).push(rel);
  if (!/<link rel="canonical"/.test(h)) problems.push(`${rel}: no canonical`);
  for (const m of h.matchAll(/(?:href|src)="(\/[^"#]*)[^"]*"/g)) if (!/^\/\//.test(m[1]) && !exists(m[1])) problems.push(`${rel}: broken ${m[1]}`);
  for (const m of h.matchAll(/srcset="([^"]+)"/g)) for (const s of m[1].split(",")) { const u = s.trim().split(" ")[0]; if (u.startsWith("/") && !exists(u)) problems.push(`${rel}: broken srcset ${u}`); }
  for (const m of h.matchAll(/<img\b[^>]*>/g)) { if (!/ alt="/.test(m[0])) problems.push(`${rel}: img missing alt`); if (!/ width="/.test(m[0]) || !/ height="/.test(m[0])) problems.push(`${rel}: img missing size`); }
}
for (const [k, v] of titles) if (v.length > 1) problems.push(`duplicate title (${v.join(", ")}): ${k}`);
for (const [k, v] of descs) if (v.length > 1 && !v.every((x) => x.startsWith("lp"))) problems.push(`duplicate description (${v.join(", ")})`);
console.log(`${files.length} pages checked`); console.log(problems.length ? problems.join("\n") : "no problems");
process.exit(problems.length ? 1 : 0);
