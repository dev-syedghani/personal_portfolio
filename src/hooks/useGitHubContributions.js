import { useState, useEffect } from "react";
import { fetchWithTimeout } from "../utils/fetchWithTimeout";

const GITHUB_USERNAME = "dev-syedghani";
const apiUrl = (year) => `https://github-contributions-api.jogruber.de/v4/${GITHUB_USERNAME}?y=${year}`;

// Two sources, both shaped { total: { [key]: n }, contributions: [{ date, count, level }] }:
//
// 1. /contributions.json, snapshotted straight from GitHub at build time by
//    scripts/fetch-contributions.mjs. Same origin, so it's instant and never
//    rate-limited, and the deploy workflow rebuilds on a schedule to keep it fresh.
// 2. The public contributions API, fetched live. It caches for an hour or more,
//    so on its own it can lag well behind GitHub (it showed 67 while GitHub
//    showed 342), but it can also be newer than the last build.
//
// The snapshot renders first; the live result replaces it only if it reports
// more contributions, so whichever source is fresher wins.

let snapshotPromise = null;
function loadSnapshot() {
  snapshotPromise ??= fetchWithTimeout(`${import.meta.env.BASE_URL}contributions.json`, { cache: "no-cache" })
    .then((r) => (r.ok ? r.json() : null))
    .catch(() => null);
  return snapshotPromise;
}

const pick = (snapshot, year) => (snapshot ? (year === "last" ? snapshot.last : snapshot.years?.[year]) ?? null : null);
const totalOf = (json) => (json?.total ? Object.values(json.total).reduce((a, b) => a + b, 0) : -1);

// Finished results per year, so flipping between year buttons doesn't refetch.
const cache = new Map();

/**
 * The calendar years the build-time snapshot actually covers, newest first.
 *
 * Returned from the snapshot rather than a hardcoded start year so the year
 * picker follows the account itself: a new January adds a year with no code
 * change, and the list can never advertise a year GitHub has no data for.
 * Falls back to the current year until the snapshot resolves.
 */
export function useContributionYears() {
  const [years, setYears] = useState([]);
  useEffect(() => {
    let cancelled = false;
    loadSnapshot().then((snap) => {
      if (cancelled || !snap?.years) return;
      setYears(
        Object.keys(snap.years)
          .map(Number)
          .filter(Number.isFinite)
          .sort((a, b) => b - a)
      );
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return years.length ? years : [new Date().getFullYear()];
}

/** @param year a calendar year, or "last" for the rolling trailing-12-months view. */
export function useGitHubContributions(year = "last") {
  const [data, setData] = useState(() => cache.get(year) ?? null);
  const [loading, setLoading] = useState(() => !cache.has(year));
  const [error, setError] = useState(false);

  useEffect(() => {
    const cached = cache.get(year);
    if (cached) {
      setData(cached);
      setLoading(false);
      setError(false);
      return;
    }

    // Guards against a slow response for a year the user has already clicked away
    // from overwriting the calendar they're currently looking at.
    let cancelled = false;
    let best = null;
    const offer = (json) => {
      if (!json || totalOf(json) <= totalOf(best)) return;
      best = json;
      cache.set(year, json);
      if (cancelled) return;
      setData(json);
      setLoading(false);
      setError(false);
    };

    setLoading(true);
    setError(false);

    const fromSnapshot = loadSnapshot().then((snap) => offer(pick(snap, year)));
    const fromLive = fetchWithTimeout(apiUrl(year))
      .then((r) => (r.ok ? r.json() : null))
      .then(offer)
      .catch(() => {});

    Promise.allSettled([fromSnapshot, fromLive]).then(() => {
      if (cancelled || best) return;
      setError(true);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [year]);

  return { data, loading, error };
}
