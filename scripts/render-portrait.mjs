// Renders public/syed_ghani.svg (a glow + an embedded 2.9 MB PNG) to a light
// JPEG for the hero. Browsers re-rasterize SVG images as they scale, so the
// tilting, zooming hero portrait was re-rendering that SVG over and over.
// Run with `npm run portrait` after replacing the SVG.
import { chromium } from "playwright-core";
import { readFile } from "node:fs/promises";

const SCALE = 2.4; // 500px-wide SVG → 1200px, ~2× the largest on-screen size
// The source SVG's backdrop glow is olive green; recolour it to the site's
// ruby so the portrait doesn't carry a green halo. Only the glow stops and the
// flat backdrop change — the photo itself is untouched.
const CENTER = [0x5e, 0x1a, 0x26];
const EDGE = [0x1a, 0x11, 0x11];
const mix = (t) => "#" + CENTER.map((c, i) => Math.round(c + (EDGE[i] - c) * t).toString(16).padStart(2, "0")).join("");
const svg = (await readFile("public/syed_ghani.svg", "utf8"))
  .replace(/<stop offset="([\d.]+)" stop-color="#[0-9a-fA-F]{6}"/g, (_, o) => `<stop offset="${o}" stop-color="${mix(Math.pow(Number(o), 1.1))}"`)
  .replace(/fill="#1c1c1c"/g, `fill="${mix(1)}"`);
const [, w, h] = /width="([\d.]+)" height="([\d.]+)"/.exec(svg);
const width = Math.round(w * SCALE);
const height = Math.round(h * SCALE);

const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width, height } });
await page.setContent(
  `<html><body style="margin:0"><img src="data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}" style="display:block;width:${width}px;height:${height}px"></body></html>`,
);
await page.waitForFunction(() => document.images[0].complete);
await page.screenshot({ path: "public/hero-portrait.jpg", type: "jpeg", quality: 84 });
await browser.close();
console.log(`hero-portrait.jpg ${width}×${height}`);
