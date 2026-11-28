# UI Features Reference

Single reference for every custom visual/interactive widget in this portfolio:
what it does, which files own it, the animation mechanism, and the constants
that matter if you're tuning it. See root `CLAUDE.md` for repo-wide gotchas
(theming, CSS traps, React traps) — this file goes one level deeper on each
specific widget.

---

## 1. Preloader (loading screen) — `src/components/Preloader.jsx`

Full-screen splash on first paint. 15 skill-icon chips orbit a central
monogram as three tilted "electron shells"; the core then flares into a
black hole and each chip breaks orbit to spiral inward before the screen
cuts to black and fades to reveal the page.

**Phases (state machine):** `orbit → birth → absorb → blackout → reveal`,
driven by an async sequence in a `useEffect` gated on `orbitDone && ready`
(not a fixed timer alone — orbit has a floor of `ORBIT_MIN_MS = 1300`, and
`ready` waits on `DOMContentLoaded` with a `MAX_WAIT_MS = 3000` ceiling).

**Key constants:**
- `BIRTH_MS=340`, `DIVE_STAGGER_MS=380`, `SETTLE_MS=120`, `BLACKOUT_MS=170`, `REVEAL_MS=420`
- Dive physics: `DIVE_PULL=1300000`, `DIVE_SOFT=70`, `DIVE_DRAG=2.4`, `DIVE_KICK=1.55`, `DIVE_SHRINK_START=90`
- `SHELLS`: 3 rings, each with its own `radius`, `squash`, `tilt`, `speed` — rolled to a distinct tilt angle each so the rings visually cross rather than nest into a "dartboard."

**Mechanism:** Pure rAF physics loop, **not CSS keyframes** — a chip's dive
curve depends on where/how fast it was at breakaway, which a keyframe can't
know ahead of time. Positions/velocities are integrated per frame and
written straight to DOM node `style` via `translate3d`/`rotate`/`scale`
(bypasses React state to hold 60fps; running this through state would
re-render the whole splash 60×/sec). The ring geometry is one static SVG
(`pl-shells`); the core (`pl-core`) is a DOM box with glow/ring layers;
progress-percent text is also written directly to a ref'd node.

**Gotchas:**
- The orbit-done gate is a plain `setTimeout`, deliberately decoupled from
  the rAF loop, so a stalled rAF can never leave the site hidden forever.
- The handover effect must not depend on `phase` — see root CLAUDE.md.
- Gated on `DOMContentLoaded`, not `load` (see root CLAUDE.md).
- Shell height at a given tilt follows `sqrt((a·sinθ)² + (b·cosθ)²)`; a
  steeply tilted outer shell overruns the caption below it.

---

## 2. Skills solar system / atomic view — `src/components/sections/SkillsSection.jsx`

`SkillSolarSystem` — a literal atomic/solar-system view rendered above the
regular skill-pill lists: a glowing "sun" (Ruby on Rails icon) sits at the
center with 3 rings of tech icons orbiting around it like electrons.

**Key constants:** `RINGS` array defines, per ring, `radius` (92/168/244),
`duration` (18/32/48s), `size`, `iconSize`, `incline` (66–72°), `tilt`
(-20°/42°/8°), and its icon set. `incline` + `tilt` are set per-ring
(instead of a shared `rotateX`) specifically so the rings cross each other
at different angles rather than nesting into a "dartboard" look — same
design idea as the preloader's shells.

**Mechanism:** CSS `perspective` + `transform-style: preserve-3d`, animated
with Framer Motion (`animate={{ rotate: 360 }}`, linear loop) — this one
*is* CSS/FM-driven, not rAF. Each icon counter-rotates (`spinBack`) to stay
upright as its ring spins, and a `faceViewer` transform undoes the ring's
own incline/tilt so icons always face the camera. `useSolarScale` shrinks
the whole system proportionally on narrow viewports. Animation only runs
while `active` (via `useInView`), and the whole system renders `null` under
reduced motion. The sun's pulsing glow is a separate absolutely-positioned
layer animating opacity/scale — not `box-shadow`, which doesn't composite
smoothly.

---

## 3. Coverflow (project cards slider) — `src/components/Coverflow.jsx`

Generic 3D carousel, reused for both Projects and Case Studies. Cards are
absolutely positioned (centered via `left: 50%` + negative margin) and
offset by `wrappedOffset(i)` — the shortest wrap-around index distance from
`activeIdx`.

**Per-card transform:** `translateX(offset*spacing) rotateY(-offset*angle) scale(...)`.
Scale shrinks with distance from active (`max(0.8, 1 - abs*0.12)`); opacity
drops to 0.45 off-center and to 0 beyond `maxVisibleOffset`. Container has
`perspective: 1400`.

**Default props:** `cardWidth=340`, `spacing=260`, `angle=30`, `height=400`,
`maxVisibleOffset=2`.

**Navigation:** prev/next buttons, dot indicators, arrow keys, swipe
(touch delta > 50px). On narrow screens (`containerWidth < 640`),
spacing/angle scale down and only 1 side card shows instead of 2, to avoid
unreadable slivers. Transitions are CSS (`transform 0.5s cubic-bezier`),
not JS-animated. Clicking a non-active card re-centers on it; clicking the
already-active card is a no-op in Coverflow itself — the parent section
handles it by opening a modal instead.

**Consumers:**
- `ProjectsSection.jsx` → `PersonalProjectCard` (`cardWidth=280, height=400`); falls back to `AutoProjectImage` if the screenshot fails to load; clicking the active card opens `ProjectModal`.
- `CaseStudiesSection.jsx` → `CaseStudyCard` (`cardWidth=300`), images via `getScreenshotUrl()`; same active-card-opens-modal pattern.

Both section wrappers are thin — all slider logic lives in `Coverflow.jsx`.

---

## 4. FlipCard — `src/components/FlipCard.jsx`

Classic CSS 3D flip card, used as a general-purpose primitive (gem/skill/
experience detail flips).

**Mechanism:** Outer wrapper sets `perspective: 1200`. Inner wrapper has
`transform-style: preserve-3d` and toggles `rotateY(0deg)` ↔
`rotateY(180deg) scale(1.04)` on a `flipped` boolean, via a CSS transition
(`transform 0.55s cubic-bezier`). Both faces use
`backface-visibility: hidden`; the front sits in normal flow (it sizes the
card), the back is `position: absolute; inset: 0; transform: rotateY(180deg)`
so it overlays exactly.

**Trigger:** hover (`mouseEnter`/`mouseLeave`) on fine-pointer devices
(`usePointerFine`); click-toggle on touch devices. Reduced motion sets
`transition: none`, so the flip becomes instant instead of animated.

---

## 5. GitHub 3D contribution graph — `src/components/sections/GitHubSection.jsx`

Renders a 3D "pillar" contribution heatmap plus a LeetCode stats panel.
(See also the higher-level summary in root `CLAUDE.md`.)

**Board tilt:** `rotateX(TILT = 30deg) rotateZ(YAW = -7deg)` under
`perspective: PERSPECTIVE = 2200` — a deliberately long lens so pillars rise
nearly straight up instead of fanning out sideways.

**Sizing:** cells fit-to-width via `fitCell()`, clamped `MIN_CELL=9` /
`MAX_CELL=26` (`BASE_CELL=12` fallback). `boardMetrics(cell)` derives:
- `GAP = cell * 0.42` (must stay in sync with `fitCell`'s assumed ratio — see root CLAUDE.md)
- `MAX_Z = min(cell*3.6, 52)` — pillar height cap, so top-tier days don't become masking pillars
- `MIN_Z = cell * 0.55`
- `HEADROOM` — space reserved above the grid for risen tiles
- `FORESHORTEN` — negative-margin correction, since tilting reduces on-screen height but not layout height
- `YAW_DROP` — compensates the yaw rotation's bottom-corner drop (see root CLAUDE.md)

**Tile rendering:** each day is a flush-base "socket" plus an optional lit
`.gh-tile` (the raised pillar; a custom `--z` CSS var drives its 3D height)
and a light-beam glow (`.gh-beam`). Color is keyed to commit-count
percentile (95th-percentile scaling, curved `^0.62`) rather than GitHub's
flat 5-level buckets. `shade()` lightens/darkens hex per-channel to fake a
lit top edge vs. shaded side walls.

**Color themes:** `GH.dark` / `GH.light` — real GitHub hex palette, with
`empty` deliberately one step brighter than GitHub's own so the grid keeps
contrast. `LC.dark` / `LC.light` — LeetCode easy/medium/hard colors, with
the light variant darkened since the brand colors wash out on white.

**Gotchas:**
- `parseDay()` manually parses `y-m-d` component-wise to dodge the
  UTC/local timezone shift from `new Date("iso")` (see root CLAUDE.md).
- Animation is pure CSS (the `--z` custom property drives transform/height
  via the stylesheet) — no JS/rAF loop. Tiles only "bob" (`gh-live` class)
  while on screen, gated by `IntersectionObserver`.

---

## 6. Project / detail modals — `src/components/ProjectModal.jsx`, `src/components/DetailModal.jsx`

Both are centered overlay dialogs rendered via
`createPortal(..., document.body)` — required so a `position: fixed` modal
escapes `Section`'s `overflow: hidden`, which would otherwise clip it.

**Entrance (Framer Motion):** backdrop fades `opacity 0 → 1`; dialog
animates `rotateY: 180 → 0` + `scale: 0.6 → 1` under `perspective: 1200` —
a "card flipping into view" effect echoing the FlipCard/solar-system
motifs elsewhere in the site. Closes on Escape or backdrop click.

- **`ProjectModal`** — screenshot (thumbnail strip if `images.length > 1`),
  flagship badge, problem/description, metrics checklist, tech-tag pills,
  external link. Triggered by clicking the active card in `Coverflow`
  (Projects / Case Studies sections).
- **`DetailModal`** — generic version (icon, eyebrow, title, subtitle,
  children, links). Triggered from `Card` clicks in `RailsShowcaseSection`
  and `GemsSection`.

---

## 7. AutoProjectImage (fallback card art) — `src/components/AutoProjectImage.jsx`

Generated placeholder image used when a project has no real screenshot, or
the screenshot fails to load. Deterministically picks one of 6 dark
gradient `PALETTES` from a string hash of the project name (so a given
project always gets the same color), overlays a large faded
(`opacity: 0.18`, `scale(3.4)`) brand icon for its primary tech, and a small
pill label with the project name centered on top. Static — no animation.

---

## 8. System flowchart (tech stack topology) — `src/components/SystemFlowchart.jsx`

Used by `TechStackSection`. An interactive system-topology diagram: a
gold-bordered "core engine" box (Rails) sits at the center of a CSS grid,
connected by glowing SVG paths to 5 tech clusters (infra, frontend,
integrations, data, payments) arranged around it. Clicking a tech icon
selects it and populates a "telemetry" sidebar with role/deployment notes;
hovering a cluster or icon highlights it and dims the rest.

**Mechanism:** layout is CSS Grid (`gridTemplateAreas`); the connector
lines are computed imperatively — `measure()` (in a `useLayoutEffect` +
`ResizeObserver`) reads real DOM positions via `getBoundingClientRect()`,
then builds one SVG path per cluster. `CORE_SIDE_MAP` assigns each cluster
a distinct edge/point on the core box so lines never visually merge into
one trunk; an L-shaped bend is used when start/end aren't aligned. No
animation loop — hover/select state drives CSS transitions
(border/box-shadow/opacity), plus a static SVG glow filter
(`feGaussianBlur` + `feMerge`) toggled by `active`.

**Gotchas:**
- Must **not** be wrapped in `FadeUp` or any mount-time-transform wrapper —
  doing so would capture the `getBoundingClientRect()` measurements
  mid-animation and permanently desync the SVG lines from the nodes.
- Uses `filterUnits="userSpaceOnUse"` on the glow filter, since the default
  `objectBoundingBox` units collapse to nothing for the near-vertical
  "payments" connector.

---

## 9. Other sections (no unique visual widget)

- **`RailsShowcaseSection.jsx`** — static `Card` grid of proficiency
  pillars; click opens `DetailModal` with a bullet list. Only `FadeUp`
  entrance + hover states.
- **`GemsSection.jsx`** — static grid of gem cards (live RubyGems download
  counts via `useGemStatsContext`); click opens `DetailModal`.
- **`TechStackSection.jsx`** — thin wrapper rendering `SystemFlowchart`
  (§8) — notable only for the "don't wrap in `FadeUp`" constraint.
- **`CaseStudiesSection.jsx`** — thin wrapper around `Coverflow` (§3), no
  slider logic of its own.

---

## Quick index

| Feature | File | Animation driver |
|---|---|---|
| Loading screen / black hole | `Preloader.jsx` | rAF physics loop |
| Solar system / atomic skills view | `sections/SkillsSection.jsx` | Framer Motion + CSS 3D |
| Project cards slider (coverflow) | `Coverflow.jsx` | CSS transition |
| Flip card | `FlipCard.jsx` | CSS transition (rotateY) |
| GitHub 3D contribution graph | `sections/GitHubSection.jsx` | CSS custom property (`--z`) |
| Project/detail modals | `ProjectModal.jsx`, `DetailModal.jsx` | Framer Motion |
| Fallback card art | `AutoProjectImage.jsx` | static |
| Tech stack topology diagram | `SystemFlowchart.jsx` | SVG + CSS transitions |
