# Terry's Kit Box

A small, honest, single-page browser-diagnostics tool. No build, no framework,
no dependencies — just `index.html`, `style.css`, `app.js`.

Built as a personable showcase for a Virtuozzo Technical L1 Support
(cloud / infrastructure) interview.

## What it shows

- **Your Connection** — public IP, ISP/carrier, ASN/org, location, and the
  browser-reported connection type. Sourced from no-key public IP APIs:
  `ipinfo.io`, with `geojs.io` and `ipify.org` as failovers. The page stores
  nothing and uploads nothing.
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

Note: the originally planned `ipwho.is` / `ipapi.co` providers were dropped
during implementation because their free tiers block browser CORS or
rate-limit aggressively — i.e. they fail from a real visitor's browser. The
shipped chain (`ipinfo.io` → `geojs.io` → `ipify.org`) was verified to work
client-side with no API key.

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
