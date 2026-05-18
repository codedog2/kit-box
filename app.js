"use strict";

/* ---------- helpers ---------- */
const $ = (sel, root = document) => root.querySelector(sel);
const PREFERS_REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- intro typewriter ---------- */
const INTRO = "Hi — this is Terry's little kit box. You're probably the recruiter looking at my application. Let me show you a bit about your connection, the honest way.";

function revealCards() {
  const cards = $("#cards");
  if (!cards.hidden) return;
  cards.hidden = false;
  cards.classList.add("in");
}

function runIntro() {
  const el = $("#typed");
  const skip = $("#skip");
  let i = 0;
  let timer = null;

  function finish() {
    if (timer) clearInterval(timer);
    el.textContent = INTRO;
    revealCards();
  }

  skip.addEventListener("click", finish, { once: true });

  if (PREFERS_REDUCED) { finish(); return; }

  timer = setInterval(() => {
    i += 1;
    el.textContent = INTRO.slice(0, i);
    if (i >= INTRO.length) {
      clearInterval(timer);
      timer = null;
      setTimeout(revealCards, 350);
    }
  }, 28);
}

/* ---------- Card A: connection ---------- */
function setField(name, value) {
  const el = document.querySelector(`[data-field="${name}"]`);
  if (el) el.textContent = value;
}

// Providers verified to work client-side: HTTPS, CORS-enabled, no API key.
// (ipwho.is / ipapi.co were dropped: their free tiers block browser CORS or
// rate-limit aggressively, so they fail from a real visitor's browser.)
const IP_PROVIDERS = [
  {
    name: "ipinfo.io",
    url: "https://ipinfo.io/json",
    map: (d) => {
      if (!d || !d.ip) return null;
      const m = (d.org || "").match(/^(AS\d+)\s+(.*)$/);
      const orgName = m ? m[2] : d.org;
      return {
        ip: d.ip,
        isp: orgName || null,
        asn: m ? (m[1] + (orgName ? " · " + orgName : "")) : (d.org || null),
        loc: [d.city, d.region !== d.city ? d.region : null, d.country].filter(Boolean).join(", ")
      };
    }
  },
  {
    name: "geojs.io",
    url: "https://get.geojs.io/v1/ip/geo.json",
    map: (d) => (d && d.ip) ? {
      ip: d.ip,
      isp: d.organization_name || null,
      asn: d.asn
        ? "AS" + d.asn + (d.organization_name ? " · " + d.organization_name : "")
        : (d.organization || null),
      loc: [d.city, d.region, d.country].filter(Boolean).join(", ")
    } : null
  },
  {
    name: "ipify.org",
    url: "https://api.ipify.org?format=json",
    map: (d) => (d && d.ip) ? { ip: d.ip, isp: null, asn: null, loc: null } : null
  }
];

async function loadConnection() {
  const conn = navigator.connection;
  setField("conn", (conn && conn.effectiveType) ? conn.effectiveType : "unavailable");

  for (const p of IP_PROVIDERS) {
    try {
      const res = await fetch(p.url, { cache: "no-store" });
      if (!res.ok) continue;
      const data = p.map(await res.json());
      if (!data || !data.ip) continue;
      setField("ip", data.ip || "unavailable");
      setField("isp", data.isp || "unavailable");
      setField("asn", data.asn || "unavailable");
      setField("loc", data.loc || "unavailable");
      $("#conn-src").textContent = "source: " + p.name;
      return;
    } catch (_) { /* fall through to next provider */ }
  }

  ["ip", "isp", "asn", "loc"].forEach((f) => setField(f, "unavailable"));
  $("#conn-src").textContent = "source: unavailable (both providers failed)";
}

/* ---------- boot ---------- */
document.addEventListener("DOMContentLoaded", function boot() {
  runIntro();
  loadConnection();
});
