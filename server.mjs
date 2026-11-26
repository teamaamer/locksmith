// Local preview server: node server.mjs  → http://localhost:8765
// Serves the static site and runs api/contact.js in DEV_DRY_RUN mode (leads are logged, not emailed).
import http from "node:http"; import fs from "node:fs"; import path from "node:path"; import { fileURLToPath } from "node:url";
process.env.DEV_DRY_RUN ??= "1";
const ROOT = path.dirname(fileURLToPath(import.meta.url));
const { default: contact } = await import("./api/contact.js");
const types = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".json": "application/json", ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".xml": "application/xml", ".txt": "text/plain", ".webmanifest": "application/manifest+json" };
http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://x");
  if (url.pathname === "/api/contact") {
    let raw = ""; for await (const c of req) raw += c;
    req.body = raw; res.status = (n) => ((res.statusCode = n), res); res.json = (o) => (res.setHeader("Content-Type", "application/json"), res.end(JSON.stringify(o)));
    return contact(req, res);
  }
  let p = path.join(ROOT, decodeURIComponent(url.pathname));
  if (!p.startsWith(ROOT)) { res.statusCode = 403; return res.end(); }
  if (fs.existsSync(p) && fs.statSync(p).isDirectory()) p = path.join(p, "index.html");
  if (!fs.existsSync(p)) { res.statusCode = 404; res.setHeader("Content-Type", "text/html"); return res.end(fs.readFileSync(path.join(ROOT, "404.html"))); }
  res.setHeader("Content-Type", types[path.extname(p)] || "application/octet-stream");
  fs.createReadStream(p).pipe(res);
}).listen(8765, () => console.log("Preview: http://localhost:8765"));
