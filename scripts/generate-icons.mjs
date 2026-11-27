// Builds the favicon set from one SVG monogram: an emerald "SG" tile that
// matches the logo badge in the site header. The letters are drawn as strokes
// (not text), so they render identically everywhere, even at 16px.
//
//   node scripts/generate-icons.mjs
//
// Writes public/favicon.svg, favicon-32.png, apple-touch-icon.png,
// logo192.png and logo512.png.
// Rasterised with @resvg/resvg-js, already a devDependency here for the OG
// image — upstream used `sharp`, which this project does not carry.
import { Resvg } from "@resvg/resvg-js";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PUBLIC_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public");

const LETTERS = `
    <path d="M27 26C27 22.4 23.9 19.5 20 19.5S13 22.4 13 26C13 32.8 27 31.7 27 38.5C27 42.1 23.9 45 20 45S13 42.1 13 38.5" />
    <path d="M51.5 26.5C49.9 22.3 47.2 19.5 43.8 19.5C39.5 19.5 36 25.2 36 32.25S39.5 45 43.8 45C48.1 45 51.5 40.6 51.5 34.5H45" />`;

// rounded: browser tab icon with its own rounded corners.
// full-bleed: home-screen icons, where iOS/Android apply their own mask.
const svg = ({ rounded }) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#6ee7b7"/>
      <stop offset="0.55" stop-color="#34d399"/>
      <stop offset="1" stop-color="#059669"/>
    </linearGradient>
    <linearGradient id="shine" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.35"/>
      <stop offset="0.5" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="${rounded ? 15 : 0}" fill="url(#g)"/>
  <rect width="64" height="64" rx="${rounded ? 15 : 0}" fill="url(#shine)"/>
  <g fill="none" stroke="#032116" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round">${LETTERS}
  </g>
</svg>
`;

const tab = svg({ rounded: true });
const bleed = svg({ rounded: false });

await writeFile(path.join(PUBLIC_DIR, "favicon.svg"), tab);
const png = (src, size, file) => {
  const data = new Resvg(src, { fitTo: { mode: "width", value: size } }).render().asPng();
  return writeFile(path.join(PUBLIC_DIR, file), data);
};
await png(tab, 32, "favicon-32.png");
await png(bleed, 180, "apple-touch-icon.png");
await png(bleed, 192, "logo192.png");
await png(bleed, 512, "logo512.png");
console.log("icons: favicon.svg, favicon-32.png, apple-touch-icon.png, logo192.png, logo512.png");
