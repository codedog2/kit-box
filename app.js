"use strict";

/* ---------- helpers ---------- */
const $ = (sel, root = document) => root.querySelector(sel);
const PREFERS_REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const store = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (_) {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (_) {
      return false;
    }
  }
};

/* ---------- intro typewriter ---------- */
const INTRO = "Hi — this is Terry's little kit box. You're probably the recruiter looking at my application. Let me show you a bit about your connection.";

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

/* ---------- Card B: latency ---------- */
const LAT_URL = "https://cdn.jsdelivr.net/npm/jquery@3.7.1/package.json";
const latSamples = [];

async function pingOnce() {
  const t0 = performance.now();
  try {
    await fetch(LAT_URL + "?_=" + Date.now(), { cache: "no-store" });
    return performance.now() - t0;
  } catch (_) {
    return null;
  }
}

function drawLine(svgEl, values, padY) {
  if (!values.length) return;
  const W = 300;
  const H = svgEl === $("#timeline") ? 90 : 60;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = (max - min) || 1;
  const pts = values.map((v, idx) => {
    const x = values.length === 1 ? W : (idx / (values.length - 1)) * W;
    const y = H - ((v - min) / span) * (H - padY * 2) - padY;
    return x.toFixed(1) + "," + y.toFixed(1);
  }).join(" ");
  svgEl.innerHTML =
    '<polyline points="' + pts + '" fill="none" stroke="var(--accent)" ' +
    'stroke-width="2" stroke-linejoin="round" stroke-linecap="round" ' +
    'vector-effect="non-scaling-stroke"/>';
}

function pushLatency(ms) {
  latSamples.push(ms);
  if (latSamples.length > 40) latSamples.shift();

  const avg = latSamples.reduce((a, b) => a + b, 0) / latSamples.length;
  const mn = Math.min(...latSamples);
  let jit = 0;
  if (latSamples.length > 1) {
    let sum = 0;
    for (let k = 1; k < latSamples.length; k++) sum += Math.abs(latSamples[k] - latSamples[k - 1]);
    jit = sum / (latSamples.length - 1);
  }

  $("#lat-avg").textContent = avg.toFixed(0);
  $("#lat-min").textContent = mn.toFixed(0);
  $("#lat-jit").textContent = jit.toFixed(0);
  drawLine($("#spark"), latSamples, 4);
  return avg;
}

/* ---------- Card C: connection over time ---------- */
const TIMELINE_KEY = "tkb_timeline_v1";

function recordTimeline(avgMs) {
  const hist = store.get(TIMELINE_KEY, []);
  hist.push({ t: Date.now(), ms: Math.round(avgMs) });
  while (hist.length > 60) hist.shift();
  store.set(TIMELINE_KEY, hist);
  return hist;
}

function drawTimeline(hist) {
  const out = $("#time-out");
  if (!hist || hist.length < 2) {
    out.textContent = "keep this open to build your timeline · local only";
    return;
  }
  drawLine($("#timeline"), hist.map((p) => p.ms), 6);
  const vals = hist.map((p) => p.ms);
  out.textContent =
    hist.length + " local samples · min " +
    Math.min(...vals) + " / max " + Math.max(...vals) + " ms";
}

function startLatencyLoop() {
  async function tick() {
    const ms = await pingOnce();
    if (ms != null) {
      const avg = pushLatency(ms);
      drawTimeline(recordTimeline(avg));
    }
  }
  tick();
  setInterval(tick, 4000);
}

/* ---------- Card B: download speed test ---------- */
const SPEED_URL = "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js";

async function speedTest() {
  const btn = $("#speedtest");
  const out = $("#speed-out");
  btn.disabled = true;
  out.textContent = "measuring…";
  try {
    const t0 = performance.now();
    const res = await fetch(SPEED_URL + "?_=" + Date.now(), { cache: "no-store" });
    const buf = await res.arrayBuffer();
    const secs = (performance.now() - t0) / 1000;
    const mbps = (buf.byteLength * 8) / secs / 1e6;
    out.textContent =
      "≈ " + mbps.toFixed(1) + " Mbps  (" +
      (buf.byteLength / 1024).toFixed(0) + " KB in " +
      secs.toFixed(2) + " s · approximate)";
  } catch (_) {
    out.textContent = "speed test unavailable";
  } finally {
    btn.disabled = false;
  }
}

/* ---------- boot ---------- */
document.addEventListener("DOMContentLoaded", function boot() {
  runIntro();
  loadConnection();
  startLatencyLoop();
  $("#speedtest").addEventListener("click", speedTest);
  drawTimeline(store.get(TIMELINE_KEY, []));
});
