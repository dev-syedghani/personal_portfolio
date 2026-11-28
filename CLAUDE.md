# CLAUDE.md

Guidance for working in this repo. Focuses on things that aren't obvious from
reading the code — the rest you can discover by reading it.

## What this is

Personal portfolio for a Ruby on Rails / Shopify / React engineer. Vite + React
(JSX, no TypeScript), hand-written CSS in `src/site/site.css`. Deployed to
GitHub Pages at `syedghani.is-a.dev` (`public/CNAME` holds the domain; the
`is-a.dev` record lives in the external `is-a-dev/register` repo, not here).

```bash
npm run dev       # vite dev server, port 3000 (falls back to 3001+ if taken)
npm run build     # prebuild (contributions snapshot + OG image) then vite build
npm run deploy    # predeploy → build, then gh-pages -d dist
npm run previews  # screenshot live client sites → public/previews + src/data/previews.json
npm run portrait  # render public/syed_ghani.svg → public/hero-portrait.jpg
```

**`npm run build` is the fastest reliable correctness check.** Prefer it over
fighting the browser preview (see "Verifying changes"). There is no lint, test,
typecheck, or format script — `build` is the only automated gate.

## Architecture at a glance

`src/index.jsx` → `src/site/SiteApp.jsx`. One page plus one hash route:
`#/projects` swaps the main page for the project archive (hash-based so it works
on GitHub Pages with no server rewrite). `SiteApp` owns theme (`.dark`/`.light`
on `<html>`), the preloader, the dock, Lenis smooth scroll, off-screen animation
pausing and lite-mode detection.

- **Sections** — `src/site/sections/*.jsx`, rendered in order by `SiteApp`:
  Hero, Marquee (`Glance`), About, Work, Expertise + Experience (`Depth`),
  Toolbox (+ `ToolboxOrbit`), Activity (+ `ContributionCalendar`), Playground,
  Contact, Footer. `ProjectsArchive` + `ProjectSheet` are the archive view.
  Playground, ProjectsArchive and ToolboxOrbit are `lazy()`-loaded and
  prefetched on idle.
- **Shared parts** — `src/site/parts.jsx` (`Reveal`, `SectionHead`, `Tilt`),
  `src/components/Icons.jsx` (`IconForTech`, pass `colored={false}` for the
  monochrome style the site uses), `src/components/reactbits/*` (vendored React
  Bits components, some modified). Reuse these before writing new wrappers.
- **Content** — `src/utils/resumeData.js` is the single content store (jobs,
  projects with `highlights`/`metrics`, skills, gems, testimonials).
  `src/site/projects.js` derives `GALLERY` (client + personal + gems) from it.
  `src/utils/flowchartData.js` holds the Toolbox groups and per-tech copy.
- **Styling** — almost everything is in `src/site/site.css`, scoped under
  `.site`, reading theme tokens defined on `:root`/`html.light` at its top.
  `src/index.css` is a thin base. Tailwind is configured but barely used.
- **Build-time** — `prebuild` runs `scripts/fetch-contributions.mjs` (GitHub
  snapshot → `public/contributions.json`) and `scripts/generate-og-image.mjs`
  (satori + resvg). `vite.config.js` bakes the live RubyGems total into
  `index.html` and splits `react` / `motion` into their own cached chunks. CI
  (`.github/workflows/deploy.yml`) redeploys on push to `master` and daily.
- `api/leetcode.js` is a Vercel-style function that never runs in production.

## Theming

Two themes as CSS custom properties at the top of `site.css`. Palette is
"Ruby fire": ruby `--accent` → ember `--accent-2`, combined in
`--accent-grad`, on a warm near-black. `--accent` fills things and carries
`--accent-ink` (white) on top; `--accent-text` is accent used as ink on the
page and is the variant that passes contrast — they are not interchangeable.
`--ok` stays green on purpose: it's the "online" status dot, not branding.
Fonts: Bricolage Grotesque (`--display`), Fraunces italic (`--serif`), Geist
(body), Geist Mono.

The site deliberately does **not** share palette, fonts or section copy with
razaali.is-a.dev, which was built from the same template — keep it that way.

Colours that canvas/JS/build scripts need as real hex values are duplicated
outside the tokens and must be changed together with them: `Hero.jsx` (DotGrid),
`Glance.jsx` (spotlight), `Cursor.jsx`, `Footer.jsx` (the Bit mascot),
`FunLayer.jsx` (click sparks), `scripts/generate-og-image.mjs`,
`scripts/generate-icons.mjs`, `scripts/render-portrait.mjs` (portrait glow),
and the `theme-color` meta in `index.html`.

## Performance rules

The site has to stay smooth on mid-range Windows laptops, not just Macs.

- Bands off screen get `is-offscreen` and every CSS animation inside pauses.
  Infinite animations are fine *only* because of this.
- rAF loops must sleep when idle (Cursor) or stop off screen (ToolboxOrbit,
  DotGrid, LogoLoop). Don't add an always-running loop.
- Never animate hundreds of elements individually — the calendar used to run
  370 per-tile animations; it now floats the board as one element.
- `html.lite` is set after measuring real frame times (remembered in
  localStorage as `lite-mode`). It drops backdrop blurs, the grain overlay,
  shine sweeps and decorative loops. Add new purely-decorative effects to it.
- Images: no multi-MB assets on the first screen. The portrait SVG embeds a
  2.9 MB PNG; the site uses the rendered `hero-portrait.jpg` instead.

## The 3D contribution calendar (`src/site/sections/ContributionCalendar.jsx`)

Tiles rise out of a board tilted with `rotateX`; height per level is `--hmax`,
and `--rise` (0→1, a registered `@property`) grows them in a wave on reveal and
sinks them for the Flat view. `--lift` is the cursor's pull. Each tile's front
wall is its `::before`, rotated −90° about X.

- Dates are parsed component-wise, not `new Date(iso)`. `new Date("2025-01-01")`
  is parsed as UTC midnight but read back in local time, so anyone west of UTC
  sees every date land a day early — which shifts the weekday the grid pads to.
- The grid pads its first column to the first day's real weekday. Chunking days
  into sevens blindly shears every row off its true day.
- In 3D, nothing on a tile may hold `opacity` or `filter` (see CSS traps) —
  hover dimming uses `--shade`, a colour mix.

## The Toolbox orbit (`src/site/sections/ToolboxOrbit.jsx`)

Each tech group orbits the core "nucleus" on a tilted ring. Positions are
integrated per frame and written straight to the chips (no React state per
frame). Only the selected group's ring shows labels; the rest are icon bubbles
— five labelled rings at once was unreadable. Inner rings need enough radius
*and* tilt (`ry = r·sin(tilt)`) to clear the nucleus vertically, or a ring cuts
straight through it. Selection lives in a ref inside the loop so picking a chip
doesn't restart the effect.

## CSS traps hit in this codebase

Each of these caused a real, visible bug here. They're easy to reintroduce.

- **`border-image` makes the browser ignore `border-radius`** and draw the border
  as a rectangle. On a rotated element that becomes a visible parallelogram. Use a
  masked gradient (`mask: radial-gradient(...)`) for a round gradient ring.
- **`inset: 0; margin: auto` does not centre an over-constrained absolutely
  positioned box.** With `left`, `right` and `width` all set, the spec drops
  `right` and resolves `margin-left` to 0, pinning the element's left edge and
  letting it hang off to one side. Use `left/top: 50%` with negative *percentage*
  margins (they resolve against the containing block's **width** on both axes, so
  the container must be square).
- **A grid track sized `auto` grows to its largest child.** A big child in a
  shared single-cell grid inflates the track and the growth is anchored top-left,
  so everything "centred in the cell" is centred on the wrong box. Pin the track
  (`grid-template-columns/rows: 100%`).
- **`overflow-x: auto` promotes `overflow-y: visible` to `auto`**, producing a
  vertical scrollbar you never asked for.
- **`clip-path` is evaluated in the element's own box, before its transform.**
  Useful — it's how the black hole's rings are split into near/far halves that
  sit on either side of the sphere in z-order.
- **A `mask` clips the element's entire rendering, `box-shadow` included.** A glow
  on a masked ring gets cut away with everything outside the band; use a separate
  blurred copy.
- **CSS animations outrank inline styles.** Handy when a keyframe needs to take
  over from a JS-written transform, surprising when it isn't intended.
- An animation that holds `opacity` (even a finished one with `fill: both` at
  1) flattens a `preserve-3d` element in Chrome, exactly like `filter` does.
  The 3D contribution tiles lost their walls this way; reveal them without
  touching opacity, and dim with colour (`--shade`) rather than `filter`.
- `transform-style: preserve-3d` must be unbroken down the whole chain. One
  `flat` element anywhere between the rotated ancestor and the 3D children
  collapses them into a plane and the effect silently renders as nothing.

## React traps hit here

- Listing a state value in an effect's dep array **and** setting it from inside
  that effect re-runs the effect; its cleanup then cancels whatever it scheduled.
  Hit twice: the preloader's phase machine, and a resize handler that restarted
  the whole simulation on every resize. Use a ref for values the effect reads but
  shouldn't restart on.
- `useLayoutEffect` for measurements that affect the first paint. The contribution
  graph measured its cell size in a passive `useEffect` and visibly painted once
  at a fallback size before snapping — the "glitch on load".

## Verifying changes

The Browser pane in this environment is unreliable in a specific way: it often
reports `document.hidden: true` and stops compositing. When that happens
**`requestAnimationFrame` does not run at all** and `setTimeout` is throttled, so:

- rAF-driven animation can't be observed, and a screenshot will error or lag.
- **Never trust a wall-clock duration measured there.** A sequence whose constants
  sum to ~3.2s measured 8.7s. Probe `document.hidden` and compare a requested vs
  actual `setTimeout` before believing any timing number.
- `performance.getEntriesByType('navigation' | 'resource')` *is* still reliable —
  recorded by the network stack, not by timers.
- Don't use rAF inside verification scripts either; it hangs the call.
- Static DOM queries (`getBoundingClientRect`, `getComputedStyle`, computed
  geometry) stay accurate and are the best substitute. To read a transitioned
  property's target value without waiting on the compositor: set
  `transition: none`, force a reflow, read, restore.

Stale HMR errors are common after a burst of edits — verify against a fresh
reload and a clean `npm run build` before chasing anything in the console.

## Repo hygiene

- The git remote must **not** embed a personal access token in its URL. Use a
  credential helper or SSH. (A token was previously committed to the remote URL
  and had to be revoked.)
- Third-party APIs used at runtime (`github-contributions-api.jogruber.de`,
  LeetCode proxies, `rubygems.org`) are unauthenticated and rate-limit readily —
  429s in the console during development are usually that, not a bug. Hooks cache
  per-key to avoid re-fetching.
