# terrys-kit-box — Design Spec

Date: 2026-05-18
Author: Terry Feng
Context: A small, polished, honest browser-diagnostics single-page tool, hosted on
GitHub Pages, used as a personable showcase for a Virtuozzo Technical L1 Support
(cloud / infrastructure) HR interview.

## 1. Goal & audience

The primary viewer is an HR recruiter, who will likely:

- Open the link on a phone, expecting it to work instantly with zero setup.
- Form a first impression within ~10 seconds.
- Possibly forward it to the technical team, so it must survive an engineer's
  second look.

The tool's job is therefore not technical depth for its own sake, but to signal:
initiative, professionalism, honesty about runtime boundaries, and basic awareness
of what the company's domain (connectivity / infrastructure) is about. It is
deliberately a light "dessert" project, not an over-engineered one.

## 2. Honesty principle (core design constraint)

A static page runs in the visitor's browser sandbox. It is honest about what it
can and cannot measure, and never fakes data:

- It CAN read the visitor's public IP / ISP / ASN / geo via a third-party
  public API, and measure latency / jitter / approximate download speed from the
  visitor's own browser.
- It CANNOT see other tabs, other tabs' memory, OS-level metrics, or any
  ISP-wide historical / peak-congestion data. The page does not pretend
  otherwise.
- Any time-of-day insight is based only on the visitor's own measurements
  stored locally, plus a clearly-labeled general rule-of-thumb. It is never
  presented as measured ISP telemetry.

## 3. Scope

In scope:

- Typewriter intro with skip.
- Card A — Your Connection.
- Card B — Speed & Latency.
- Card C — Connection Over Time (local timeline + general peak-hours note).
- Footer with personal attribution.

Out of scope (explicitly cut):

- Any "see your other tabs / their memory" feature.
- Any backend, build step, framework, or dependency beyond one no-key public
  IP API.
- Any architecture/monitoring explainer text (kept light on purpose).
- Emoji anywhere in the UI.

## 4. UX flow

1. Page loads. A typewriter effect prints a short, warm-but-professional intro,
   in the spirit of: "Hi — this is Terry's little kit box. You're probably the
   recruiter looking at my application. Let me show you a bit about your
   connection and this browser, the honest way." Exact wording finalized during
   implementation; tone is friendly and concise, no emoji.
2. A persistent "skip" control immediately reveals the cards and stops the
   typewriter (respects a recruiter in a hurry). Skip state is not persisted;
   each visit replays the intro unless skipped.
3. After the intro (or on skip), the three cards fade in.

## 5. Components

### Card A — Your Connection

- Fields: public IP, ISP / carrier, ASN + organization, city / country,
  connection type (`navigator.connection.effectiveType` when available).
- Each field shows its data source label.
- Data source: one free, HTTPS, CORS-enabled, no-key public IP-info provider,
  with one backup provider for failover. Provider selection finalized during
  implementation.
- Privacy disclosure line: states that this data comes from a third-party
  public API and that the page itself stores nothing and uploads nothing.
- Graceful degradation: if both providers fail, fields show "unavailable";
  the page does not error or break.

### Card B — Speed & Latency

- Live latency probe: periodically times a lightweight request to a fast
  endpoint; displays min / avg / jitter and a small sparkline.
- Manual one-shot download speed test: runs only when the user clicks a button
  (no automatic bandwidth usage). Fetches a known-size CDN resource with
  cache-busting and reports approximate Mbps, labeled "approximate".
- Graceful degradation: probe failures are shown as "unavailable" rather than
  crashing.

### Card C — Connection Over Time

- Local timeline: latency samples are appended to `localStorage` so repeat
  visits / a long-open tab build a small chart of "your measured connection at
  the times you checked". Clearly labeled as the visitor's own local
  measurements only.
- General peak-hours note: a short, explicitly-labeled rule-of-thumb (e.g.,
  residential broadband tends to be busiest roughly 19:00–23:00 local; large
  downloads are smoother off-peak). Explicitly stated as general guidance, NOT
  measured from the visitor's ISP.
- No backend / monitoring-architecture explanation (intentionally kept light).
- `localStorage` access is wrapped defensively (private mode / disabled storage
  degrades to a session-only chart).

### Footer

- Name, "Built for the Virtuozzo L1 Support interview · 2026", link to the
  GitHub repository.

## 6. Technical approach

- Pure HTML + CSS + vanilla JS. Zero build, zero framework, zero npm. Push to a
  GitHub Pages repo and it works.
- Mobile-first responsive layout: single column on phones, two-column grid on
  wider screens. No emoji.
- Visual quality bar: the design must look polished and high-end, not a plain
  utility page. This is an explicit success criterion. Specifics:
  - A cohesive dark theme with a refined, restrained palette (one accent color,
    a deliberate neutral scale), not default browser styling.
  - Typographic care: a clean modern typeface, a clear type scale, generous
    spacing and alignment; numeric readouts use tabular figures so live values
    don't jitter.
  - Cards are visually crafted (subtle elevation/borders, soft gradients or
    glass-like surfaces, rounded corners) and consistent.
  - Smooth, tasteful micro-animations: typewriter intro, card fade/stagger-in,
    eased sparkline/gauge updates. Motion is subtle and never gimmicky.
  - Honors `prefers-reduced-motion` (reduced or no animation) and keeps
    readable contrast (accessibility = part of "high-end").
  - Looks equally polished on a phone and on a wide screen.
- Only external dependency: one no-key public IP-info API plus a backup
  provider. All other measurement is done client-side.
- Robust failure handling everywhere: every external/optional API is wrapped so
  failure yields "unavailable", never a broken page.
- File structure (kept minimal):
  - `index.html` — markup and structure.
  - `style.css` — all styling, mobile-first.
  - `app.js` — intro/typewriter, the three cards' logic, storage, failover.
  - `README.md` — what it is, why it exists, how to enable GitHub Pages, and an
    explicit note on the honesty principle and browser-sandbox boundaries.

## 7. Project location

New standalone folder and git repository at
`C:\Users\X1\desktop\terrys-kit-box\` (separate from the unrelated Godot project
in the current working directory). This repo is what gets pushed to GitHub Pages.

## 8. Success criteria

- Opens on a phone with no setup and shows meaningful data within seconds.
- Every displayed value is real or honestly labeled; nothing is faked.
- A degraded network / blocked API still yields a coherent, non-broken page.
- An engineer reviewing the source sees clean, dependency-free, readable code.
- The honesty framing is visible and is the memorable takeaway.
- The page looks visibly polished and high-end at first glance, on both phone
  and desktop — a non-negotiable requirement, not a nice-to-have.
