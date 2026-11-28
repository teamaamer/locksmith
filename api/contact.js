// Vercel serverless function: POST /api/contact
// Validates, rate-limits and forwards quote requests. Secrets come from environment variables only.
//   CONTACT_EMAIL      where leads are delivered (default: business email)
//   RESEND_API_KEY     Resend API key (https://resend.com) — enables email delivery
//   EMAIL_FROM         verified sender, e.g. "Locksmith Express MK <leads@locksmithexpressmk.com>"
//   GHL_WEBHOOK_URL    optional GoHighLevel inbound webhook (kept from the previous site)
//   ALLOWED_ORIGINS    comma-separated extra origins (default: production + *.vercel.app + localhost)
//   DEV_DRY_RUN=1      local preview only: accept and log the lead without delivering it
const hits = new Map(); // best-effort per-instance rate limit
const WINDOW = 10 * 60 * 1000, MAX = 5;
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const clean = (s, n = 500) => String(s ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, n);

function validate(b) {
  const out = {
    full_name: clean(b.full_name, 80), phone: clean(b.phone, 20), email: clean(b.email, 120), zip: clean(b.zip, 5), service: clean(b.service, 60),
    city: clean(b.city, 60), state: clean(b.state, 2), message: clean(b.message, 1000), vehicle_year: clean(b.vehicle_year, 4), vehicle_make: clean(b.vehicle_make, 40), vehicle_model: clean(b.vehicle_model, 40),
    sms_consent: b.sms_consent === true, source_page: clean(b.source_page, 200), form_name: clean(b.form_name, 60),
    utm_source: clean(b.utm_source, 80), utm_medium: clean(b.utm_medium, 80), utm_campaign: clean(b.utm_campaign, 120), gclid: clean(b.gclid, 200),
  };
  if (out.full_name.length < 2) return { error: "name" };
  if (!/^\+1\d{10}$/.test(out.phone.replace(/[^\d+]/g, ""))) return { error: "phone" };
  if (out.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(out.email)) return { error: "email" };
  if (!/^\d{5}$/.test(out.zip)) return { error: "zip" };
  if (!out.service) return { error: "service" };
  return { data: out };
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "method" });
  const origin = req.headers.origin || "";
  const allowed = (process.env.ALLOWED_ORIGINS || "").split(",").filter(Boolean).concat(["https://www.locksmithexpressmk.com", "https://locksmithexpressmk.com"]);
  if (origin && !allowed.includes(origin) && !/^https:\/\/[\w-]+\.vercel\.app$/.test(origin) && !/^http:\/\/localhost(:\d+)?$/.test(origin)) return res.status(403).json({ ok: false, error: "origin" });

  const ip = String(req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "").split(",")[0].trim();
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < WINDOW);
  if (arr.length >= MAX) return res.status(429).json({ ok: false, error: "rate" });
  arr.push(now); hits.set(ip, arr);

  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = null; } }
  if (!body || typeof body !== "object" || JSON.stringify(body).length > 6000) return res.status(400).json({ ok: false, error: "body" });
  if (body.company_website) return res.status(200).json({ ok: true }); // honeypot: pretend success to bots
  const v = validate(body);
  if (v.error) return res.status(422).json({ ok: false, error: v.error });
  const d = v.data;

  const to = process.env.CONTACT_EMAIL || "locksmithexpressmk@gmail.com";
  const rows = Object.entries({ Name: d.full_name, Phone: d.phone, Email: d.email, ZIP: d.zip, Service: d.service, City: d.city && `${d.city}, ${d.state}`, Vehicle: [d.vehicle_year, d.vehicle_make, d.vehicle_model].filter(Boolean).join(" "), Message: d.message, "SMS consent": d.sms_consent ? "yes" : "no", Page: d.source_page, Form: d.form_name, "UTM source": d.utm_source, "UTM campaign": d.utm_campaign }).filter(([, val]) => val);
  const html = `<h2>New quote request</h2><table cellpadding="6">${rows.map(([k, val]) => `<tr><td><b>${esc(k)}</b></td><td>${esc(val)}</td></tr>`).join("")}</table>`;
  const text = rows.map(([k, val]) => `${k}: ${val}`).join("\n");

  let delivered = false;
  try {
    if (process.env.RESEND_API_KEY && process.env.EMAIL_FROM) {
      const r = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" }, body: JSON.stringify({ from: process.env.EMAIL_FROM, to: [to], subject: `New quote request: ${d.service}${d.city ? " — " + d.city : ""}`, html, text, reply_to: d.email || undefined }) });
      if (!r.ok) { const j = await r.json().catch(() => ({})); const err = new Error(`email ${r.status} ${j.name || ""}: ${j.message || ""}`); err.detail = `${r.status} ${j.name || ""}`.trim(); throw err; }
      delivered = true;
    }
    if (process.env.GHL_WEBHOOK_URL) {
      const r = await fetch(process.env.GHL_WEBHOOK_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) });
      if (!r.ok) throw new Error("webhook " + r.status);
      delivered = true;
    }
  } catch (e) {
    console.error("[contact] delivery failed:", e.message);
    return res.status(502).json({ ok: false, error: "delivery", detail: e.detail || "" });
  }
  if (!delivered && process.env.DEV_DRY_RUN === "1") { console.log("[contact] DRY RUN lead:\n" + text); delivered = true; }
  if (!delivered) { console.error("[contact] not configured: set RESEND_API_KEY+EMAIL_FROM or GHL_WEBHOOK_URL"); return res.status(503).json({ ok: false, error: "not_configured" }); }
  return res.status(200).json({ ok: true });
}
