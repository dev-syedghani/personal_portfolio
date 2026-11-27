// Snapshots the GitHub contribution calendar into public/contributions.json.
//
// Why not just call an API from the browser? github.com doesn't allow
// cross-origin requests, and the free proxy the site used before caches
// responses for an hour or more, so it kept showing stale totals. This reads
// the same calendar GitHub renders on the profile (private contributions
// included, as long as "Include private contributions" is on) and bakes it in
// at build time. The deploy workflow rebuilds on a schedule to keep it fresh.
//
// Never fails the build: if GitHub can't be reached, the previous snapshot (if
// any) is left in place and the site falls back to the live API.

import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const USER = "dev-syedghani";
const FIRST_YEAR = 2022; // earliest year GitHub lists activity for dev-syedghani
const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public", "contributions.json");

async function fetchCalendar(query = "") {
  const res = await fetch(`https://github.com/users/${USER}/contributions${query}`, {
    headers: { "User-Agent": "portfolio-contributions-snapshot" },
  });
  if (!res.ok) throw new Error(`GitHub responded ${res.status}`);
  return parse(await res.text());
}

function parse(html) {
  // Day cells carry the date and the 0–4 shade; the exact count lives in a
  // separate tooltip that points back at the cell by id.
  const days = new Map();
  for (const m of html.matchAll(/<td\b[^>]*ContributionCalendar-day[^>]*>/g)) {
    const tag = m[0];
    const id = tag.match(/\bid="([^"]+)"/)?.[1];
    const date = tag.match(/data-date="([^"]+)"/)?.[1];
    const level = Number(tag.match(/data-level="(\d)"/)?.[1] ?? 0);
    if (id && date) days.set(id, { date, count: 0, level });
  }
  for (const m of html.matchAll(/<tool-tip\b[^>]*\bfor="([^"]+)"[^>]*>([^<]*)<\/tool-tip>/g)) {
    const day = days.get(m[1]);
    const n = m[2].match(/^(\d[\d,]*) contribution/);
    if (day && n) day.count = Number(n[1].replace(/,/g, ""));
  }

  const contributions = [...days.values()].sort((a, b) => a.date.localeCompare(b.date));
  if (contributions.length === 0) throw new Error("No calendar cells found (GitHub markup may have changed)");
  const total = contributions.reduce((sum, d) => sum + d.count, 0);
  return { total, contributions };
}

async function main() {
  const now = new Date();
  const last = await fetchCalendar();
  const years = {};
  for (let y = now.getUTCFullYear(); y >= FIRST_YEAR; y--) {
    const cal = await fetchCalendar(`?from=${y}-01-01&to=${y}-12-31`);
    // GitHub pads the grid to whole weeks; keep only days inside the year.
    cal.contributions = cal.contributions.filter((d) => d.date.startsWith(`${y}-`));
    cal.total = cal.contributions.reduce((sum, d) => sum + d.count, 0);
    years[y] = { total: { [y]: cal.total }, contributions: cal.contributions };
  }

  const snapshot = {
    user: USER,
    generatedAt: now.toISOString(),
    last: { total: { lastYear: last.total }, contributions: last.contributions },
    years,
  };
  await mkdir(path.dirname(OUT), { recursive: true });
  await writeFile(OUT, JSON.stringify(snapshot));
  console.log(`contributions: ${last.total} in the last year → public/contributions.json`);
}

main().catch((err) => {
  console.warn(`contributions: snapshot skipped (${err.message}); the site will use the live API instead.`);
});
