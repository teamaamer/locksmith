/* Locksmith Express MK — site script (no dependencies). */
(function () {
  "use strict";
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Analytics helper (no personal data is ever sent) ---------- */
  const params = new URLSearchParams(location.search);
  const TRACK = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid", "msclkid"];
  let attr = {};
  try { attr = JSON.parse(sessionStorage.getItem("lemk_attr") || "{}"); } catch (_) {}
  TRACK.forEach((k) => params.get(k) && (attr[k] = params.get(k)));
  attr.landing_page = attr.landing_page || location.pathname;
  attr.referrer = attr.referrer || document.referrer || "";
  try { sessionStorage.setItem("lemk_attr", JSON.stringify(attr)); } catch (_) {}
  const track = (event, data = {}) => {
    const payload = Object.assign({ event, page_path: location.pathname, traffic_source: attr.utm_source || (attr.gclid ? "google_ads" : ""), campaign_id: attr.utm_campaign || "" }, data);
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(payload);
    if (typeof window.gtag === "function" && event !== "phone_click") window.gtag("event", event, data);
  };
  document.addEventListener("click", (e) => {
    const a = e.target.closest("[data-track]");
    if (!a) return;
    const d = a.dataset;
    track(d.track, { cta_location: d.cta || "", service_type: d.service || "", city: d.city || "", state: d.state || "" });
  });

  /* ---------- Header / menus ---------- */
  const body = document.body;
  const menuBtn = $("#menuBtn");
  const setMenu = (open) => {
    body.classList.toggle("menu-open", open);
    if (menuBtn) { menuBtn.setAttribute("aria-expanded", String(open)); menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu"); }
    body.style.overflow = open ? "hidden" : "";
  };
  menuBtn && menuBtn.addEventListener("click", () => setMenu(!body.classList.contains("menu-open")));
  $$("#mobileNav a").forEach((a) => a.addEventListener("click", () => setMenu(false)));

  const closeDd = (except) => $$(".has-dd.open").forEach((d) => { if (d !== except) { d.classList.remove("open"); $(".dd-btn", d).setAttribute("aria-expanded", "false"); } });
  $$(".has-dd").forEach((dd) => {
    const btn = $(".dd-btn", dd);
    btn.addEventListener("click", () => { const open = !dd.classList.contains("open"); closeDd(dd); dd.classList.toggle("open", open); btn.setAttribute("aria-expanded", String(open)); });
    dd.addEventListener("mouseenter", () => btn.setAttribute("aria-expanded", "true"));
    dd.addEventListener("mouseleave", () => { if (!dd.classList.contains("open")) btn.setAttribute("aria-expanded", "false"); });
  });
  document.addEventListener("click", (e) => { if (!e.target.closest(".has-dd")) closeDd(); });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    const open = $(".has-dd.open");
    closeDd();
    if (open) $(".dd-btn", open).focus();
    setMenu(false);
  });

  /* ---------- Reveal on scroll ---------- */
  const reveals = $$(".reveal");
  if (!reduce && "IntersectionObserver" in window) {
    const io = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } }), { rootMargin: "0px 0px -6% 0px", threshold: 0.05 });
    reveals.forEach((el) => io.observe(el));
  } else reveals.forEach((el) => el.classList.add("in"));

  /* ---------- FAQ: one open at a time ---------- */
  const faqs = $$(".faq details");
  faqs.forEach((d) => d.addEventListener("toggle", () => { if (d.open) faqs.forEach((o) => o !== d && (o.open = false)); }));

  /* ---------- Forms ---------- */
  const fmtPhone = (v) => {
    let d = v.replace(/\D/g, ""); if (d.length > 10 && d[0] === "1") d = d.slice(1); d = d.slice(0, 10);
    if (d.length < 4) return d; if (d.length < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
    return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  };
  $$('input[type="tel"]').forEach((i) => i.addEventListener("input", () => (i.value = fmtPhone(i.value))));
  $$('input[name="zip"], input[name="vehicle_year"]').forEach((i) => i.addEventListener("input", () => (i.value = i.value.replace(/\D/g, ""))));

  const rules = {
    full_name: [(v) => v.trim().length >= 2, "Please enter your name."],
    phone: [(v) => v.replace(/\D/g, "").replace(/^1(?=\d{10}$)/, "").length === 10, "Please enter a valid 10-digit phone number."],
    email: [(v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()), "Please check your email address."],
    zip: [(v) => /^\d{5}$/.test(v.trim()), "Please enter a 5-digit ZIP code."],
    service: [(v) => !!v, "Please choose a service."],
  };
  const setErr = (el, msg) => {
    const f = el.closest(".field"); if (!f) return;
    f.classList.toggle("invalid", !!msg);
    const p = $(".err", f); if (p) p.textContent = msg || "";
    el.setAttribute("aria-invalid", msg ? "true" : "false");
    if (p && p.id) el.setAttribute("aria-describedby", p.id);
  };
  const validate = (form) => {
    let first = null;
    $$("input, select, textarea", form).forEach((el) => {
      const r = rules[el.name]; if (!r) return;
      const ok = r[0](el.value || ""); setErr(el, ok ? "" : r[1]);
      if (!ok && !first) first = el;
    });
    first && first.focus();
    return !first;
  };

  $$(".lead-form").forEach((form) => {
    let started = false, sending = false;
    const status = $(".form-status", form);
    const sel = $('select[name="service"]', form);
    // honour ?service= and keep the preselected service if provided
    form.addEventListener("focusin", () => { if (!started) { started = true; track("quote_form_start", { city: form.dataset.city || "", state: form.dataset.state || "" }); } });
    $$("input, select, textarea", form).forEach((el) => el.addEventListener(el.tagName === "SELECT" ? "change" : "input", () => { const r = rules[el.name]; if (r && el.closest(".field.invalid") && r[0](el.value || "")) setErr(el, ""); }));

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (sending) return;
      if (!validate(form)) return;
      const fd = new FormData(form);
      if (fd.get("company_website")) return;
      const data = Object.fromEntries(fd.entries());
      const full = (data.full_name || "").trim();
      const payload = {
        form_name: form.dataset.formName, full_name: full, phone: "+1" + data.phone.replace(/\D/g, "").slice(-10), email: (data.email || "").trim(), zip: data.zip.trim(),
        service: data.service, city: form.dataset.city || "", state: form.dataset.state || "", message: data.message || "",
        vehicle_year: data.vehicle_year || "", vehicle_make: data.vehicle_make || "", vehicle_model: data.vehicle_model || "",
        sms_consent: data.sms_consent === "yes", source_page: form.dataset.source || location.pathname, page_url: location.href, submitted_at: new Date().toISOString(), ...attr,
      };
      const btn = $('button[type="submit"]', form);
      sending = true; btn.disabled = true; btn.classList.add("loading"); status.textContent = "";
      track("quote_form_submit", { service_type: payload.service, city: payload.city, state: payload.state });
      try {
        const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || !json.ok) throw new Error(json.error || "failed");
        track("quote_form_success", { service_type: payload.service, city: payload.city, state: payload.state });
        if (typeof window.gtag === "function") window.gtag("event", "generate_lead", { form_name: payload.form_name });
        const card = form.closest(".form-card");
        const ok = $(".form-success", card);
        $(".success-name", card).textContent = full ? ", " + full.split(/\s+/)[0] : "";
        ok.hidden = false; card.classList.add("sent"); form.reset(); ok.focus && ok.setAttribute("tabindex", "-1"); ok.focus();
      } catch (err) {
        track("quote_form_error", { service_type: payload.service });
        status.textContent = "Sorry, we couldn't send your request. Please call us at (413) 433-1135.";
      } finally { sending = false; btn.disabled = false; btn.classList.remove("loading"); }
    });
  });
})();
