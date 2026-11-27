import resumeData from "../utils/resumeData";

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

/** How many land on the home page before the archive takes over. */
export const FEATURED_COUNT = 5;

export const FEATURED_PROJECTS = ALL_PROJECTS.slice(0, FEATURED_COUNT);

/** Hash route for the archive. Hash-based so it works on GitHub Pages with no
 *  server-side rewrite — a real URL that deep-links and survives a refresh. */
export const ARCHIVE_HASH = "#/projects";
