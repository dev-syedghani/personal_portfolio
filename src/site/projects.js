import resumeData from "../utils/resumeData";
import previews from "../data/previews.json";

/**
 * One project list, shared by the Work section and the full archive page.
 *
 * Ordered the way the résumé reads: current employer first, then previous
 * employers in résumé order, then personal work. The two sources have
 * different shapes — client work carries `problem`/`metrics`, personal work
 * carries `badge`/`image` — so entries are tagged with their group and left
 * otherwise intact; the renderers guard the fields that may be absent.
 */
const CLIENT_GROUPS = resumeData.experience
  .filter((e) => e.projects?.length)
  .map((e) => ({ group: e.company, items: e.projects }));

const PERSONAL_GROUP = resumeData.projects?.length
  ? [{ group: "Personal & open source", items: resumeData.projects }]
  : [];

export const GROUPS = [...CLIENT_GROUPS, ...PERSONAL_GROUP];

export const ALL_PROJECTS = GROUPS.flatMap((g) => g.items.map((p) => ({ ...p, group: g.group })));

const localImage = (src) => (typeof src === "string" && src.startsWith("/") ? src : null);

/**
 * Everything the archive gallery shows: client and personal builds plus the
 * published gems. Client work gets its live-site screenshot (see
 * scripts/capture-previews.mjs); stock photos are dropped in favour of
 * generated art, since they say nothing about the actual product.
 */
export const GALLERY = [
  ...CLIENT_GROUPS.flatMap((g) =>
    g.items.map((p) => ({ ...p, kind: "client", group: g.group, preview: previews[p.name] ?? null, live: p.url })),
  ),
  ...(resumeData.projects ?? []).map((p) => ({
    ...p,
    kind: "personal",
    group: "Personal",
    preview: localImage(p.image),
    github: p.url,
  })),
  ...resumeData.openSource.gems.map((g) => ({
    name: g.name,
    kind: "gem",
    group: "Ruby gem",
    badge: g.badge,
    version: g.version,
    description: g.tagline,
    tech: g.tech,
    github: g.github,
    rubygems: g.rubygems,
  })),
];

/** How many land on the home page before the archive takes over. */
export const FEATURED_COUNT = 5;

export const FEATURED_PROJECTS = ALL_PROJECTS.slice(0, FEATURED_COUNT);

/** Hash route for the archive. Hash-based so it works on GitHub Pages with no
 *  server-side rewrite — a real URL that deep-links and survives a refresh. */
export const ARCHIVE_HASH = "#/projects";
