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
