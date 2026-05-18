# Terry's Kit Box Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a polished, honest, zero-dependency single-page browser-diagnostics tool for a Virtuozzo L1 Support HR interview, hosted on GitHub Pages.

**Architecture:** Three static files (`index.html`, `style.css`, `app.js`) plus `README.md`. `app.js` is a plain-script module with isolated sections: typewriter intro, Card A (connection info via a public IP API with failover), Card B (live latency probe + manual download speed test), Card C (localStorage connection timeline + a labeled general peak-hours note). No build step, no framework, no npm. Only external call is a no-key public IP-info API plus a backup provider; all measurement is client-side.

**Tech Stack:** Vanilla HTML5 + CSS3 (CSS custom properties, grid, `prefers-reduced-motion`) + ES2017 JavaScript. Inline SVG for charts. `localStorage` for the timeline. Verified manually in a browser via a local static server.

---

## Conventions

- **No test framework** (the spec mandates zero dependencies / zero build). "Verification" = serve the folder and observe a stated behavior in a browser.
- **Local server for verification:** from `C:\Users\X1\desktop\terrys-kit-box\`, run `python -m http.server 8080`, then open `http://localhost:8080/`. (Serving over http, not `file://`, keeps `fetch` behavior realistic.) Stop the server with Ctrl+C.
- **Commit after every task.** Working directory for all `git` commands: `C:\Users\X1\desktop\terrys-kit-box\`.
- Spec reference: `docs/superpowers/specs/2026-05-18-terrys-kit-box-design.md`.

---

## File Structure

- `index.html` — semantic markup: intro section, three `<article>` cards, footer. One responsibility: structure.
- `style.css` — full dark, high-end theme: palette tokens, typography, card surfaces, responsive grid, animations, reduced-motion. One responsibility: presentation.
- `app.js` — behavior, organized top-to-bottom in clearly separated sections (helpers → intro → Card A → Card B → Card C → boot). One responsibility: client logic.
- `README.md` — what it is, why it exists, how to enable GitHub Pages, explicit honesty/sandbox note.
- `.nojekyll` — empty file so GitHub Pages serves the files verbatim.
- `.gitignore` — ignore OS cruft.

---

### Task 1: Project scaffold

**Files:**
- Create: `index.html`
- Create: `style.css`
- Create: `app.js`
- Create: `.nojekyll`
- Create: `.gitignore`

- [ ] **Step 1: Create `.gitignore`**

```
.DS_Store
Thumbs.db
*.log
```

- [ ] **Step 2: Create empty `.nojekyll`**

Create `.nojekyll` with no content (empty file).

- [ ] **Step 3: Create `index.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="dark">
  <meta name="description" content="A small honest browser-diagnostics tool by Terry Feng.">
  <title>Terry's Kit Box</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <main class="wrap">
    <section id="intro" class="intro">
      <p id="typed" class="typed" aria-live="polite"></p>
      <button id="skip" class="skip" type="button">skip</button>
    </section>

    <section id="cards" class="cards" hidden>
      <article class="card" id="card-conn">
        <h2 class="card__title">Your Connection</h2>
        <dl class="kv">
          <div><dt>Public IP</dt><dd data-field="ip">…</dd></div>
          <div><dt>ISP / Carrier</dt><dd data-field="isp">…</dd></div>
          <div><dt>ASN / Org</dt><dd data-field="asn">…</dd></div>
          <div><dt>Location</dt><dd data-field="loc">…</dd></div>
          <div><dt>Connection type</dt><dd data-field="conn">…</dd></div>
        </dl>
        <p class="src" id="conn-src">source: —</p>
        <p class="note">This comes from a third-party public API. This page stores nothing and uploads nothing.</p>
      </article>

      <article class="card" id="card-speed">
        <h2 class="card__title">Speed &amp; Latency</h2>
        <div class="metrics">
          <div class="metric"><span class="metric__val" id="lat-avg">—</span><span class="metric__lbl">avg ms</span></div>
          <div class="metric"><span class="metric__val" id="lat-min">—</span><span class="metric__lbl">min ms</span></div>
          <div class="metric"><span class="metric__val" id="lat-jit">—</span><span class="metric__lbl">jitter ms</span></div>
        </div>
        <svg class="spark" id="spark" viewBox="0 0 300 60" preserveAspectRatio="none" aria-hidden="true"></svg>
        <button id="speedtest" class="btn" type="button">Run download speed test</button>
        <p class="src" id="speed-out">approximate · click to measure</p>
      </article>

      <article class="card" id="card-time">
        <h2 class="card__title">Connection Over Time</h2>
        <svg class="timeline" id="timeline" viewBox="0 0 300 90" preserveAspectRatio="none" aria-hidden="true"></svg>
        <p class="src" id="time-out">your own local measurements only</p>
        <p class="note">General rule of thumb (not measured from your ISP): home broadband is usually busiest around 19:00–23:00 local time. Large downloads tend to go smoother off-peak.</p>
      </article>
    </section>

    <footer class="foot">
      <span class="foot__name">Terry Feng</span>
      <span class="foot__sub">Built for the Virtuozzo L1 Support interview · 2026</span>
      <a id="repo" class="foot__link" href="https://github.com/terry-feng/terrys-kit-box" rel="noopener" target="_blank">source on GitHub</a>
    </footer>
  </main>
  <script src="app.js" defer></script>
</body>
</html>
```

- [ ] **Step 4: Create `style.css`**

```css
:root {
  --bg: #0b0f17;
  --bg-2: #0f1622;
  --surface: rgba(255, 255, 255, 0.035);
  --surface-brd: rgba(255, 255, 255, 0.08);
  --text: #e8edf6;
  --text-dim: #93a0b5;
  --accent: #57d6c4;
  --radius: 16px;
  --gap: clamp(14px, 2.5vw, 22px);
  --maxw: 880px;
  --font: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

html, body { height: 100%; }

body {
  font-family: var(--font);
  color: var(--text);
  background:
    radial-gradient(1100px 600px at 80% -10%, rgba(87, 214, 196, 0.10), transparent 60%),
    radial-gradient(900px 500px at 0% 110%, rgba(120, 140, 255, 0.08), transparent 60%),
    linear-gradient(180deg, var(--bg), var(--bg-2));
  background-attachment: fixed;
  -webkit-font-smoothing: antialiased;
  line-height: 1.5;
  font-feature-settings: "tnum" 1;
}

.wrap {
  max-width: var(--maxw);
  margin: 0 auto;
  padding: clamp(24px, 6vw, 64px) clamp(16px, 5vw, 40px);
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

.intro {
  min-height: 30vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 18px;
  margin-bottom: var(--gap);
}

.typed {
  font-size: clamp(1.05rem, 3.4vw, 1.6rem);
  font-weight: 500;
  letter-spacing: 0.1px;
  max-width: 40ch;
  min-height: 4.5em;
}
.typed::after {
  content: "▍";
  color: var(--accent);
  animation: blink 1.05s steps(1) infinite;
}
@keyframes blink { 50% { opacity: 0; } }

.skip {
  align-self: flex-start;
  background: transparent;
  border: 1px solid var(--surface-brd);
  color: var(--text-dim);
  padding: 7px 16px;
  border-radius: 999px;
  font: inherit;
  font-size: 0.85rem;
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s, transform 0.15s;
}
.skip:hover { color: var(--text); border-color: var(--accent); transform: translateY(-1px); }

.cards {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--gap);
}
@media (min-width: 680px) {
  .cards { grid-template-columns: 1fr 1fr; }
  #card-time { grid-column: 1 / -1; }
}

.card {
  background: var(--surface);
  border: 1px solid var(--surface-brd);
  border-radius: var(--radius);
  padding: clamp(18px, 3.5vw, 28px);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  box-shadow: 0 1px 0 rgba(255,255,255,0.04) inset, 0 18px 40px -28px rgba(0,0,0,0.9);
}

.card__title {
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--text-dim);
  margin-bottom: 16px;
}

.kv { display: grid; gap: 12px; }
.kv > div { display: flex; justify-content: space-between; gap: 16px; align-items: baseline; }
.kv dt { color: var(--text-dim); font-size: 0.9rem; }
.kv dd { font-weight: 600; text-align: right; word-break: break-all; }

.metrics { display: flex; gap: 22px; margin-bottom: 14px; }
.metric { display: flex; flex-direction: column; }
.metric__val { font-size: clamp(1.6rem, 6vw, 2.2rem); font-weight: 700; font-variant-numeric: tabular-nums; }
.metric__lbl { font-size: 0.72rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-dim); }

.spark { width: 100%; height: 60px; display: block; opacity: 0.95; }
.timeline { width: 100%; height: 90px; display: block; margin-bottom: 12px; }

.btn {
  margin: 4px 0 12px;
  background: linear-gradient(180deg, rgba(87,214,196,0.18), rgba(87,214,196,0.08));
  border: 1px solid rgba(87,214,196,0.35);
  color: var(--text);
  padding: 10px 18px;
  border-radius: 10px;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.15s, border-color 0.2s, background 0.2s;
}
.btn:hover:not(:disabled) { transform: translateY(-1px); border-color: var(--accent); }
.btn:disabled { opacity: 0.55; cursor: progress; }

.src { font-size: 0.78rem; color: var(--text-dim); margin-top: 4px; }
.note {
  font-size: 0.8rem;
  color: var(--text-dim);
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed var(--surface-brd);
}

.foot {
  margin-top: auto;
  padding-top: 36px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px 18px;
  align-items: baseline;
  font-size: 0.82rem;
  color: var(--text-dim);
}
.foot__name { color: var(--text); font-weight: 600; }
.foot__link { color: var(--accent); text-decoration: none; }
.foot__link:hover { text-decoration: underline; }

.cards.in .card { animation: rise 0.55s cubic-bezier(.2,.7,.2,1) both; }
.cards.in .card:nth-child(2) { animation-delay: 0.08s; }
.cards.in .card:nth-child(3) { animation-delay: 0.16s; }
@keyframes rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }

@media (prefers-reduced-motion: reduce) {
  .typed::after { animation: none; }
  .cards.in .card { animation: none; }
  * { scroll-behavior: auto !important; }
}
```

- [ ] **Step 5: Create `app.js` (boot stub only)**

```js
"use strict";

document.addEventListener("DOMContentLoaded", function boot() {
  const cards = document.getElementById("cards");
  cards.hidden = false;
  cards.classList.add("in");
});
```

- [ ] **Step 6: Verify scaffold renders**

Run: `python -m http.server 8080` in `C:\Users\X1\desktop\terrys-kit-box\`, open `http://localhost:8080/`.
Expected: dark gradient page; three cards visible (intro empty for now); footer shows name + interview line + GitHub link; two-column layout on a wide window, single column when narrowed; no console errors. Stop the server.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: project scaffold (html, css, js, pages config)"
```

---

### Task 2: Typewriter intro with skip

**Files:**
- Modify: `app.js` (replace boot stub)

- [ ] **Step 1: Replace `app.js` entire contents**

```js
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

/* ---------- boot ---------- */
document.addEventListener("DOMContentLoaded", function boot() {
  runIntro();
});
```

- [ ] **Step 2: Verify typewriter + skip**

Serve and open `http://localhost:8080/`.
Expected: text types out character-by-character with a blinking caret; cards stay hidden until typing finishes, then fade/stagger in. Reload and click "skip" mid-type: typing stops, full sentence shows immediately, cards appear at once. No console errors.

- [ ] **Step 3: Commit**

```bash
git add app.js
git commit -m "feat: typewriter intro with skip"
```

---

### Task 3: Card A — connection info with provider failover

**Files:**
- Modify: `app.js` (add Card A section + call from boot)

- [ ] **Step 1: Add the connection section above the boot block**

Insert this block in `app.js` immediately after the `runIntro` function and before the `/* ---------- boot ---------- */` comment:

```js
/* ---------- Card A: connection ---------- */
function setField(name, value) {
  const el = document.querySelector(`[data-field="${name}"]`);
  if (el) el.textContent = value;
}

const IP_PROVIDERS = [
  {
    name: "ipwho.is",
    url: "https://ipwho.is/",
    map: (d) => (d && d.success !== false) ? {
      ip: d.ip,
      isp: d.connection && d.connection.isp,
      asn: d.connection && (d.connection.asn
        ? "AS" + d.connection.asn + (d.connection.org ? " · " + d.connection.org : "")
        : d.connection.org),
      loc: [d.city, d.country].filter(Boolean).join(", ")
    } : null
  },
  {
    name: "ipapi.co",
    url: "https://ipapi.co/json/",
    map: (d) => (d && !d.error) ? {
      ip: d.ip,
      isp: d.org,
      asn: [d.asn, d.org].filter(Boolean).join(" · "),
      loc: [d.city, d.country_name].filter(Boolean).join(", ")
    } : null
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
```

- [ ] **Step 2: Call it from boot**

Replace the boot block with:

```js
/* ---------- boot ---------- */
document.addEventListener("DOMContentLoaded", function boot() {
  runIntro();
  loadConnection();
});
```

- [ ] **Step 3: Verify connection card**

Serve and open `http://localhost:8080/`. Skip the intro.
Expected: "Your Connection" fills with a real public IP, ISP/carrier, ASN/org, city + country, and a connection type (or "unavailable" if the browser lacks `navigator.connection`). `source:` shows `ipwho.is` (or `ipapi.co` on fallback). No console errors.

- [ ] **Step 4: Verify graceful failure**

In DevTools, block `ipwho.is` and `ipapi.co` (DevTools → Network → request blocking, add `*ipwho.is*` and `*ipapi.co*`), then reload.
Expected: fields show "unavailable", `source:` shows "unavailable (both providers failed)", page does not break. Remove the blocks afterward.

- [ ] **Step 5: Commit**

```bash
git add app.js
git commit -m "feat: connection card with provider failover and graceful degradation"
```

---

### Task 4: Card B — live latency probe + sparkline

**Files:**
- Modify: `app.js` (add latency section + boot call)

- [ ] **Step 1: Add the latency section before the boot block**

Insert after `loadConnection` and before `/* ---------- boot ---------- */`:

```js
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

function startLatencyLoop() {
  async function tick() {
    const ms = await pingOnce();
    if (ms != null) pushLatency(ms);
  }
  tick();
  setInterval(tick, 4000);
}
```

- [ ] **Step 2: Call it from boot**

Replace the boot block with:

```js
/* ---------- boot ---------- */
document.addEventListener("DOMContentLoaded", function boot() {
  runIntro();
  loadConnection();
  startLatencyLoop();
});
```

- [ ] **Step 3: Verify latency probe**

Serve, open `http://localhost:8080/`, skip intro, wait ~20 seconds.
Expected: avg/min/jitter ms values appear and update roughly every 4 s; the sparkline draws and grows; values use tabular figures (digits do not shift width). No console errors.

- [ ] **Step 4: Commit**

```bash
git add app.js
git commit -m "feat: live latency probe with sparkline"
```

---

### Task 5: Card B — manual download speed test

**Files:**
- Modify: `app.js` (add speed test + wire button in boot)

- [ ] **Step 1: Add the speed-test function before the boot block**

Insert after `startLatencyLoop`:

```js
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
```

- [ ] **Step 2: Wire the button in boot**

Replace the boot block with:

```js
/* ---------- boot ---------- */
document.addEventListener("DOMContentLoaded", function boot() {
  runIntro();
  loadConnection();
  startLatencyLoop();
  $("#speedtest").addEventListener("click", speedTest);
});
```

- [ ] **Step 3: Verify speed test**

Serve, open, skip intro, click "Run download speed test".
Expected: button disables and shows "measuring…", then within a few seconds shows `≈ <n> Mbps (<n> KB in <n> s · approximate)`; button re-enables. Clicking again re-runs. No console errors.

- [ ] **Step 4: Verify speed-test failure path**

Block `*cdn.jsdelivr.net*` in DevTools, click the button.
Expected: shows "speed test unavailable", button re-enables, page intact. Remove the block afterward.

- [ ] **Step 5: Commit**

```bash
git add app.js
git commit -m "feat: manual download speed test"
```

---

### Task 6: Card C — local connection timeline

**Files:**
- Modify: `app.js` (add storage helper + timeline; record from latency loop; draw on boot)

- [ ] **Step 1: Add a defensive storage helper in the helpers section**

In `app.js`, immediately after the `PREFERS_REDUCED` line, add:

```js
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
```

- [ ] **Step 2: Add the timeline section before the boot block**

Insert after `speedTest`:

```js
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
```

- [ ] **Step 3: Record timeline from the latency loop**

In `startLatencyLoop`, replace the `tick` function body so it records and redraws the timeline. The full replacement for `startLatencyLoop`:

```js
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
```

- [ ] **Step 4: Draw any stored timeline on boot**

Replace the boot block with:

```js
/* ---------- boot ---------- */
document.addEventListener("DOMContentLoaded", function boot() {
  runIntro();
  loadConnection();
  startLatencyLoop();
  $("#speedtest").addEventListener("click", speedTest);
  drawTimeline(store.get(TIMELINE_KEY, []));
});
```

- [ ] **Step 5: Verify timeline persists**

Serve, open, skip intro, wait ~30 s so several samples accumulate. Note the "N local samples" text. Reload the page.
Expected: after reload the timeline chart immediately shows the previously stored points (count continues upward, not reset to 0); the general peak-hours note is visible under it. In a private window with storage unavailable, it degrades to "keep this open to build your timeline" without errors.

- [ ] **Step 6: Commit**

```bash
git add app.js
git commit -m "feat: local connection timeline with persistence"
```

---

### Task 7: Visual polish & cross-device pass

**Files:**
- Modify: `style.css` (only if a defect is found)
- Modify: `index.html` (only if a defect is found)

- [ ] **Step 1: Wide-screen review**

Serve, open at a wide window, let it run ~20 s, run a speed test.
Expected: cohesive dark theme, single accent color, generous spacing, aligned cards, equal card heights in the top row, tabular numerics that do not jitter as values update, smooth stagger-in. Fix any spacing/alignment/contrast defect in `style.css`; if none, make no change.

- [ ] **Step 2: Mobile review**

In DevTools device toolbar, select a phone preset (e.g., iPhone SE width 375) and reload.
Expected: single-column cards, no horizontal scroll, IP/ASN long strings wrap (do not overflow), tap targets comfortable, intro text readable. Fix defects in `style.css`/`index.html`; if none, make no change.

- [ ] **Step 3: Reduced-motion review**

DevTools → Rendering → emulate `prefers-reduced-motion: reduce`, reload.
Expected: no typewriter animation (full text shown at once), no caret blink, cards appear without the rise animation, everything still functional and legible. Fix in `style.css` if violated; if none, make no change.

- [ ] **Step 4: Commit (only if changes were made)**

```bash
git add -A
git commit -m "polish: visual and cross-device refinements"
```

If no changes were needed in Steps 1–3, skip this commit and note "no polish changes required" in the task summary.

---

### Task 8: README + GitHub Pages enablement

**Files:**
- Create: `README.md`
- Modify: `index.html:` footer repo link (only if the real repo URL differs from the default)

- [ ] **Step 1: Create `README.md`**

```markdown
# Terry's Kit Box

A small, honest, single-page browser-diagnostics tool. No build, no framework,
no dependencies — just `index.html`, `style.css`, `app.js`.

Built as a personable showcase for a Virtuozzo Technical L1 Support
(cloud / infrastructure) interview.

## What it shows

- **Your Connection** — public IP, ISP/carrier, ASN/org, location, and the
  browser-reported connection type. Sourced from a third-party public IP API
  (`ipwho.is`, with `ipapi.co` as failover). The page stores nothing and
  uploads nothing.
- **Speed & Latency** — a live latency probe (avg / min / jitter + sparkline)
  and a manual, click-to-run approximate download speed test.
- **Connection Over Time** — a timeline built only from your own measurements,
  saved locally in your browser, plus a clearly-labeled general rule of thumb
  about residential peak hours.

## The honesty principle

A static page runs inside the browser sandbox. It can read the visitor's
public IP via a public API and measure latency/throughput from the visitor's
own browser. It **cannot** see other tabs, other tabs' memory, OS-level
metrics, or any ISP-wide historical/peak data — the browser deliberately
forbids this. This tool never fakes those numbers; the "over time" view is
explicitly the visitor's own local measurements, and the peak-hours note is
explicitly general guidance, not measured ISP telemetry.

## Run locally

```
python -m http.server 8080
```

Then open `http://localhost:8080/`.

## Hosting on GitHub Pages

1. Create a GitHub repository and push this folder to the default branch.
2. Repository → Settings → Pages → Build and deployment → Source:
   "Deploy from a branch", branch: default branch, folder: `/ (root)`.
3. Wait for the Pages build, then open the published URL.

The repository link in the page footer points to
`https://github.com/terry-feng/terrys-kit-box`; update it in `index.html`
if the real repository path differs.
```

- [ ] **Step 2: Align the footer link with the real repo (conditional)**

If the actual GitHub repository URL differs from `https://github.com/terry-feng/terrys-kit-box`, edit the `id="repo"` anchor `href` in `index.html` to the real URL. Otherwise leave it unchanged.

- [ ] **Step 3: Final full review**

Serve, open `http://localhost:8080/`, walk all three cards end to end.
Expected: intro types and skips; connection populates; latency runs; speed test works; timeline persists across reload; footer link points to the intended repo; no console errors.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "docs: README with honesty note and GitHub Pages instructions"
```

- [ ] **Step 5: Tag the release**

```bash
git tag v1.0
git log --oneline
```

---

## Self-Review

**1. Spec coverage:**
- Goal/audience (mobile-first, instant, honest) → Tasks 1, 7; honesty note → Tasks 6, 8.
- Honesty principle (real or labeled, never faked) → Card A source labels (T3), Card C "local only" + general-rule label (T6), README note (T8).
- Scope — in: typewriter+skip (T2), Card A (T3), Card B latency (T4) + speed (T5), Card C (T6), footer (T1). Out: tabs/memory feature — not present; no backend/build/deps — only IP API + jsDelivr asset, no npm/framework; no architecture explainer — not present; no emoji — markup/CSS contain none.
- UX flow (typewriter → skip → fade-in cards) → T2 + CSS `.cards.in` stagger (T1).
- Components A/B/C + footer → T3/T4/T5/T6/T1, each with graceful "unavailable" paths (T3 S4, T5 S4, T6 S5).
- Technical approach (pure static, failover, defensive storage, minimal files) → T1 file set, T3 failover, T6 `store` wrapper.
- Visual quality bar (cohesive dark theme, one accent, tabular figures, crafted cards, subtle motion, reduced-motion, mobile parity) → T1 CSS + T7 dedicated pass.
- Project location → repo already initialized at `C:\Users\X1\desktop\terrys-kit-box\`; all paths consistent.
- Success criteria → covered by T7 + T8 S3 final review.

No spec requirement is left without a task.

**2. Placeholder scan:** No "TBD/TODO/handle edge cases/similar to Task N". Every code step contains complete code. The only conditional steps (T7 S4, T8 S2) state an explicit, checkable condition and the exact change.

**3. Type/name consistency:** `setField` (T3) used only in T3. `drawLine(svgEl, values, padY)` defined in T4, reused in T6 with matching signature; height branch keys off `$("#timeline")` which exists from T1 markup. `pushLatency` returns `avg`, consumed by `recordTimeline` in T6. `store` defined in T6 S1 before first use in T6 S2/S4. `TIMELINE_KEY`, `LAT_URL`, `SPEED_URL`, `INTRO`, `IP_PROVIDERS` each defined once and referenced consistently. DOM ids in `app.js` (`#typed`, `#skip`, `#cards`, `[data-field]`, `#conn-src`, `#lat-avg/min/jit`, `#spark`, `#speedtest`, `#speed-out`, `#timeline`, `#time-out`, `#repo`) all exist in the Task 1 `index.html`.

No outstanding issues; the earlier malformed `--accent` line was removed so the Task 1 CSS is valid as written.
