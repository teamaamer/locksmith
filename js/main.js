/* ==========================================================================
   Locksmith Express MK — site script
   ========================================================================== */

/* ---------------------------------------------------------------
   CONFIG — fill these in when you connect the forms (VS Code step)
   --------------------------------------------------------------- */
const CONFIG = {
  // GoHighLevel: Automations → Workflows → Trigger "Inbound Webhook" → copy the URL here.
  // Every form submission is POSTed to it as JSON (contact + service + UTM data).
  // In that workflow: Create/Update Contact → Send Email to locksmithexpressmk@gmail.com → (optional) SMS / opportunity.
  WEBHOOK_URL: "",

  // Optional: redirect to a thank-you page after submit (good for ad conversion tracking), e.g. "/thank-you.html".
  THANK_YOU_URL: "",

  BUSINESS_PHONE: "(413) 433-1135",
};

(function () {
  "use strict";

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Year ---------- */
  const y = $("#year");
  if (y) y.textContent = new Date().getFullYear();

  /* ---------- Header on scroll + floating call ---------- */
  const header = $("#header");
  const floatCall = $("#floatCall");
  const onScroll = () => {
    const sc = window.scrollY;
    header && header.classList.toggle("scrolled", sc > 10);
    floatCall && floatCall.classList.toggle("show", sc > window.innerHeight * 0.9);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Mobile menu ---------- */
  const menuBtn = $("#menuBtn");
  const mobileNav = $("#mobileNav");
  const setMenu = (open) => {
    document.body.classList.toggle("menu-open", open);
    menuBtn && menuBtn.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
  };
  menuBtn && menuBtn.addEventListener("click", () => setMenu(!document.body.classList.contains("menu-open")));
  mobileNav && $$("a", mobileNav).forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => e.key === "Escape" && setMenu(false));

  /* ---------- Reveal on scroll ---------- */
  const reveals = $$(".reveal");
  if (!reduceMotion && "IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("in"));
  }

  /* ---------- Card spotlight follows the cursor ---------- */
  $$(".card").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", e.clientX - r.left + "px");
      card.style.setProperty("--my", e.clientY - r.top + "px");
    });
  });

  /* ---------- FAQ: one open at a time ---------- */
  const faqs = $$(".faq details");
  faqs.forEach((d) => d.addEventListener("toggle", () => {
    if (d.open) faqs.forEach((o) => o !== d && (o.open = false));
  }));

  /* ---------- Lead tracking data (UTMs, click IDs, landing page) ---------- */
  const TRACK_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid", "msclkid"];
  const params = new URLSearchParams(location.search);
  let stored = {};
  try { stored = JSON.parse(sessionStorage.getItem("lemk_attr") || "{}"); } catch (_) {}
  TRACK_KEYS.forEach((k) => { if (params.get(k)) stored[k] = params.get(k); });
  if (!stored.landing_page) stored.landing_page = location.href;
  if (!stored.referrer) stored.referrer = document.referrer || "";
  try { sessionStorage.setItem("lemk_attr", JSON.stringify(stored)); } catch (_) {}

  /* ---------- Phone formatting ---------- */
  const formatPhone = (v) => {
    let d = v.replace(/\D/g, "");
    if (d.length > 10 && d[0] === "1") d = d.slice(1);
    d = d.slice(0, 10);
    if (d.length < 4) return d;
    if (d.length < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
    return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  };
  $$('input[type="tel"]').forEach((inp) => inp.addEventListener("input", () => {
    inp.value = formatPhone(inp.value);
  }));

  /* ---------- Forms ---------- */
  const validators = {
    full_name: (v) => v.trim().length >= 2,
    phone: (v) => v.replace(/\D/g, "").replace(/^1(?=\d{10}$)/, "").length === 10,
    email: (v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()),
    service: (v) => !!v,
    location: (v) => v.trim().length >= 2,
  };

  const validate = (form) => {
    let firstBad = null;
    $$("input, select, textarea", form).forEach((el) => {
      const fn = validators[el.name];
      if (!fn) return;
      const field = el.closest(".field");
      const ok = fn(el.value || "");
      field && field.classList.toggle("invalid", !ok);
      if (!ok && !firstBad) firstBad = el;
    });
    if (firstBad) firstBad.focus({ preventScroll: false });
    return !firstBad;
  };

  $$(".lead-form").forEach((form) => {
    // clear error as the user fixes a field
    $$("input, select, textarea", form).forEach((el) => {
      const evt = el.tagName === "SELECT" ? "change" : "input";
      el.addEventListener(evt, () => {
        const field = el.closest(".field");
        if (field && field.classList.contains("invalid") && validators[el.name] && validators[el.name](el.value || "")) {
          field.classList.remove("invalid");
        }
      });
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!validate(form)) return;

      const fd = new FormData(form);
      if (fd.get("company_website")) return; // spam bot (honeypot filled)

      const fullName = (fd.get("full_name") || "").toString().trim();
      const [firstName, ...rest] = fullName.split(/\s+/);
      const payload = {
        form_name: form.dataset.formName || "Website Form",
        full_name: fullName,
        first_name: firstName || "",
        last_name: rest.join(" "),
        phone: "+1" + (fd.get("phone") || "").toString().replace(/\D/g, "").slice(-10),
        email: (fd.get("email") || "").toString().trim(),
        service: fd.get("service") || "",
        location: fd.get("location") || "",
        urgency: fd.get("urgency") || "",
        message: fd.get("message") || "",
        sms_consent: fd.get("sms_consent") === "yes",
        source: "Website — locksmithexpressmk.com",
        page_url: location.href,
        submitted_at: new Date().toISOString(),
        ...stored,
      };

      const btn = $('button[type="submit"]', form);
      btn.disabled = true;
      btn.classList.add("loading");

      try {
        if (CONFIG.WEBHOOK_URL) {
          const res = await fetch(CONFIG.WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (!res.ok) throw new Error("Webhook responded " + res.status);
        } else {
          // Preview mode — no webhook yet. Simulate a short send.
          await new Promise((r) => setTimeout(r, 700));
          console.info("[Locksmith Express MK] Preview mode — lead payload:", payload);
        }

        // Ad / analytics conversion events
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ event: "generate_lead", form_name: payload.form_name, service: payload.service });
        if (typeof window.fbq === "function") window.fbq("track", "Lead", { content_name: payload.service });
        if (typeof window.gtag === "function") window.gtag("event", "generate_lead", { form_name: payload.form_name });

        if (CONFIG.THANK_YOU_URL) { location.href = CONFIG.THANK_YOU_URL; return; }

        const card = form.closest(".form-card");
        const nameSlot = card && $(".success-name", card);
        if (nameSlot) nameSlot.textContent = firstName ? ", " + firstName : "";
        card && card.classList.add("sent");
        form.reset();
      } catch (err) {
        console.error(err);
        alert("Sorry — something went wrong sending your request. Please call us 24/7 at " + CONFIG.BUSINESS_PHONE + ".");
      } finally {
        btn.disabled = false;
        btn.classList.remove("loading");
      }
    });
  });
})();
