/* Locksmith Express MK — site behaviour (no dependencies). Mirrors the legacy theme's interactions. */
(function () {
  "use strict";
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- analytics (no personal data) ---------- */
  var params = new URLSearchParams(location.search);
  var KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid", "msclkid"];
  var attr = {};
  try { attr = JSON.parse(sessionStorage.getItem("lemk_attr") || "{}"); } catch (e) {}
  KEYS.forEach(function (k) { if (params.get(k)) attr[k] = params.get(k); });
  attr.landing_page = attr.landing_page || location.pathname;
  attr.referrer = attr.referrer || document.referrer || "";
  try { sessionStorage.setItem("lemk_attr", JSON.stringify(attr)); } catch (e) {}
  function track(event, data) {
    data = data || {};
    var payload = Object.assign({ event: event, page_path: location.pathname, traffic_source: attr.utm_source || (attr.gclid ? "google_ads" : ""), campaign_id: attr.utm_campaign || "" }, data);
    window.dataLayer = window.dataLayer || []; window.dataLayer.push(payload);
    if (typeof window.gtag === "function" && event !== "phone_click") window.gtag("event", event, data);
  }
  document.addEventListener("click", function (e) {
    var a = e.target.closest("[data-track]"); if (!a) return;
    track(a.dataset.track, { cta_location: a.dataset.cta || "", city: a.dataset.city || "", state: a.dataset.state || "" });
  });

  /* ---------- mobile menu (legacy classes: .menu-toggle.active / .main-navigation.toggled) ---------- */
  var nav = $(".main-navigation"), toggle = $(".menu-toggle"), header = $(".main-header");
  function setMenu(open) {
    if (!nav || !toggle) return;
    toggle.classList.toggle("active", open); nav.classList.toggle("toggled", open);
    toggle.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
  }
  if (toggle) toggle.addEventListener("click", function () { setMenu(!nav.classList.contains("toggled")); });
  $$(".mobile-menu-close, .mobile-menu-overlay").forEach(function (b) { b.addEventListener("click", function () { setMenu(false); }); });
  $$(".primary-menu a").forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
  if (header) window.addEventListener("scroll", function () { header.classList.toggle("scrolled", window.scrollY > 100); }, { passive: true });

  /* ---------- search modal ---------- */
  var modal = $("#fullscreenSearchModal"), sBtn = $(".header-search-toggle"), sInput = modal && $(".search-field", modal), sList = $("#searchResults"), index = null;
  function openSearch(open) {
    if (!modal) return;
    modal.classList.toggle("is-active", open); modal.setAttribute("aria-hidden", String(!open));
    document.body.classList.toggle("search-modal-open", open); document.body.style.overflow = open ? "hidden" : "";
    if (sBtn) sBtn.setAttribute("aria-expanded", String(open));
    if (open) {
      setTimeout(function () { sInput && sInput.focus(); }, 100);
      if (!index) fetch("/search.json").then(function (r) { return r.json(); }).then(function (j) { index = j; render(); }).catch(function () {});
    } else if (sBtn) sBtn.focus();
  }
  function render() {
    if (!sList || !index) return;
    var q = (sInput.value || "").trim().toLowerCase();
    var hits = index.filter(function (p) { return !q || p.t.toLowerCase().indexOf(q) > -1; }).slice(0, 12);
    sList.innerHTML = hits.map(function (p) { return '<li><a href="' + p.u + '">' + p.t.replace(/[<>&]/g, "") + "</a></li>"; }).join("") || '<li><a href="tel:+14134331135">No match — call (413) 433-1135</a></li>';
  }
  if (sBtn) sBtn.addEventListener("click", function () { openSearch(true); });
  if (modal) {
    $(".search-modal-close", modal).addEventListener("click", function () { openSearch(false); });
    sInput.addEventListener("input", render);
    $(".search-form", modal).addEventListener("submit", function (e) { e.preventDefault(); var a = $("a", sList); if (a) location.href = a.getAttribute("href"); });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (modal && modal.classList.contains("is-active")) openSearch(false);
    if (nav && nav.classList.contains("toggled")) { setMenu(false); toggle.focus(); }
  });

  /* ---------- FAQ accordion (one open at a time) ---------- */
  $$(".faq-question").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var open = btn.getAttribute("aria-expanded") === "true";
      $$(".faq-question").forEach(function (b) {
        b.setAttribute("aria-expanded", "false");
        var ans = b.nextElementSibling; if (ans) ans.hidden = true;
        var i = $("i", b); if (i) { i.classList.remove("fa-chevron-up"); i.classList.add("fa-chevron-down"); }
      });
      if (!open) {
        btn.setAttribute("aria-expanded", "true"); btn.nextElementSibling.hidden = false;
        var ic = $("i", btn); if (ic) { ic.classList.remove("fa-chevron-down"); ic.classList.add("fa-chevron-up"); }
      }
    });
  });

  /* ---------- stats counters ---------- */
  var counters = $$(".s-stat-counter");
  function count(el) {
    if (el.dataset.done) return; el.dataset.done = "1";
    var target = parseInt(el.getAttribute("data-target"), 10); if (isNaN(target) || reduce) { el.textContent = target; return; }
    var start = performance.now(), dur = 2500;
    (function step(t) {
      var p = Math.min((t - start) / dur, 1), ease = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      el.textContent = Math.round(target * ease); if (p < 1) requestAnimationFrame(step);
    })(start);
  }
  if (counters.length && "IntersectionObserver" in window) {
    var co = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { count(en.target); co.unobserve(en.target); } }); }, { threshold: 0.4 });
    counters.forEach(function (c) { co.observe(c); });
  }

  /* ---------- service-area map (Leaflet + OpenStreetMap, loaded only when near the viewport) ---------- */
  var mapEl = $("#svcMap");
  function loadMap() {
    if (mapEl.dataset.loaded) return; mapEl.dataset.loaded = "1";
    var css = document.createElement("link"); css.rel = "stylesheet"; css.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    css.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="; css.crossOrigin = ""; document.head.appendChild(css);
    var s = document.createElement("script"); s.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    s.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="; s.crossOrigin = "";
    s.onload = function () {
      var L = window.L, pts = JSON.parse(mapEl.getAttribute("data-points"));
      var map = L.map(mapEl, { scrollWheelZoom: false, attributionControl: true });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 18, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' }).addTo(map);
      var bounds = [];
      pts.forEach(function (p) {
        if (!p.c) return; bounds.push(p.c);
        var size = p.big ? 30 : 20;
        var m = L.marker(p.c, { icon: L.divIcon({ className: "svc-pin", iconSize: [size, size] }), title: p.n, alt: p.n + " service area" }).addTo(map);
        m.bindTooltip(p.n, { className: "svc-tip", direction: "top", offset: [0, -size / 2] });
        m.on("click", function () { track("location_page_click", { city: p.n, state: "MA", cta_location: "map" }); location.href = p.u; });
      });
      if (bounds.length) map.fitBounds(bounds, { padding: [40, 40] });
    };
    document.head.appendChild(s);
  }
  if (mapEl) {
    if ("IntersectionObserver" in window) {
      var mo = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { loadMap(); mo.disconnect(); } }, { rootMargin: "300px" });
      mo.observe(mapEl);
    } else loadMap();
  }

  /* ---------- quote forms → /api/contact/ ---------- */
  var digits = function (v) { return v.replace(/\D/g, ""); };
  function fmtPhone(v) {
    var d = digits(v); if (d.length > 10 && d[0] === "1") d = d.slice(1); d = d.slice(0, 10);
    if (d.length < 4) return d; if (d.length < 7) return "(" + d.slice(0, 3) + ") " + d.slice(3);
    return "(" + d.slice(0, 3) + ") " + d.slice(3, 6) + "-" + d.slice(6);
  }
  $$('.lead-form input[type="tel"]').forEach(function (i) { i.addEventListener("input", function () { i.value = fmtPhone(i.value); }); });
  $$('.lead-form input[name="zip"], .lead-form input[name="vehicle_year"]').forEach(function (i) { i.addEventListener("input", function () { i.value = digits(i.value); }); });
  var RULES = {
    full_name: [function (v) { return v.trim().length >= 2; }, "Please enter your name."],
    phone: [function (v) { return digits(v).replace(/^1(?=\d{10}$)/, "").length === 10; }, "Please enter a valid 10-digit phone number."],
    email: [function (v) { return !v || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()); }, "Please check your email address."],
    zip: [function (v) { return /^\d{5}$/.test(v.trim()); }, "Please enter a 5-digit ZIP code."],
  };
  function setErr(el, msg) {
    var f = el.closest(".field"); if (!f) return;
    f.classList.toggle("invalid", !!msg);
    var p = $(".err", f); if (p) p.textContent = msg || "";
    el.setAttribute("aria-invalid", msg ? "true" : "false");
    if (p) el.setAttribute("aria-describedby", p.id);
  }
  function validate(form) {
    var first = null;
    $$("input, textarea", form).forEach(function (el) {
      var r = RULES[el.name]; if (!r) return;
      var ok = r[0](el.value || ""); setErr(el, ok ? "" : r[1]); if (!ok && !first) first = el;
    });
    if (first) first.focus();
    return !first;
  }
  $$(".lead-form").forEach(function (form) {
    var started = false, sending = false, status = $(".form-status", form), btn = $('[type="submit"]', form), label = btn.value;
    form.addEventListener("focusin", function () { if (!started) { started = true; track("quote_form_start", { city: form.dataset.city, state: form.dataset.state }); } });
    $$("input, textarea", form).forEach(function (el) { el.addEventListener("input", function () { var r = RULES[el.name]; if (r && el.closest(".field.invalid") && r[0](el.value || "")) setErr(el, ""); }); });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (sending || !validate(form)) return;
      var fd = new FormData(form); if (fd.get("company_website")) return;
      var d = {}; fd.forEach(function (v, k) { d[k] = v; });
      var full = (d.full_name || "").trim();
      var payload = Object.assign({
        form_name: form.dataset.formName, full_name: full, phone: "+1" + digits(d.phone).slice(-10), email: (d.email || "").trim(), zip: d.zip.trim(),
        service: d.service || "General Request", city: form.dataset.city || "", state: form.dataset.state || "", message: d.message || "",
        vehicle_year: d.vehicle_year || "", vehicle_make: d.vehicle_make || "", vehicle_model: d.vehicle_model || "",
        sms_consent: d.sms_consent === "yes", source_page: form.dataset.source || location.pathname, page_url: location.href, submitted_at: new Date().toISOString(),
      }, attr);
      sending = true; btn.disabled = true; btn.value = "Sending…"; status.textContent = "";
      track("quote_form_submit", { service_type: payload.service, city: payload.city, state: payload.state });
      fetch("/api/contact/", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
        .then(function (res) { return res.json().catch(function () { return {}; }).then(function (j) { if (!res.ok || !j.ok) throw new Error(j.error || "failed"); }); })
        .then(function () {
          track("quote_form_success", { service_type: payload.service, city: payload.city, state: payload.state });
          if (typeof window.gtag === "function") window.gtag("event", "generate_lead", { form_name: payload.form_name });
          var wrap = form.parentNode, ok = $(".form-success", wrap);
          $(".success-name", ok).textContent = full ? ", " + full.split(/\s+/)[0] : "";
          form.hidden = true; ok.hidden = false; ok.focus();
        })
        .catch(function () { track("quote_form_error", { service_type: payload.service }); status.textContent = "Sorry, we couldn't send your request. Please call us at (413) 433-1135."; })
        .then(function () { sending = false; btn.disabled = false; btn.value = label; });
    });
  });
  // "Request Assistance" / quote links scroll to the nearest form
  $$('a[href="#quote"]').forEach(function (a) { a.addEventListener("click", function (e) { var f = $(".lead-form input"); if (f) { e.preventDefault(); f.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" }); f.focus({ preventScroll: true }); } }); });
})();
