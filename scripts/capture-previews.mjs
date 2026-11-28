// Screenshots every live project site into public/previews/ and records which
// ones succeeded in src/data/previews.json. Run by hand (`npm run previews`),
// not in prebuild: client sites go down or change, and a deploy shouldn't.
import { chromium } from "playwright-core";
import { mkdir, writeFile } from "node:fs/promises";
import resumeData from "../src/utils/resumeData.js";

const OUT = "public/previews";
const MANIFEST = "src/data/previews.json";

const projects = [
  ...resumeData.experience.flatMap((e) => e.projects ?? []),
  ...resumeData.projects,
].filter((p) => p.url && !/github\.com/.test(p.url));

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
const manifest = {};

for (const p of projects) {
  const file = `${slug(p.name)}.jpg`;
  try {
    await page.goto(p.url, { waitUntil: "networkidle", timeout: 45000 }).catch(() => {});
    await page.waitForTimeout(2000);
    if (/log-?in|sign[-_]?in|auth/i.test(new URL(page.url()).pathname)) throw new Error("lands on a login page");
    const text = await page.locator("body").innerText().catch(() => "");
    if (/access denied|forbidden|not available in your region/i.test(text.slice(0, 600))) throw new Error("blocked");
    const decline = page.getByRole("button", { name: /^(decline|reject all|reject)$/i }).first();
    if (await decline.isVisible().catch(() => false)) {
      await decline.click().catch(() => {});
      await page.waitForTimeout(800);
    }
    await page.screenshot({ path: `${OUT}/${file}`, type: "jpeg", quality: 78 });
    manifest[p.name] = `/previews/${file}`;
    console.log(`ok    ${p.name}`);
  } catch (err) {
    console.log(`fail  ${p.name}: ${err.message.split("\n")[0]}`);
  }
}

await browser.close();
await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
console.log(`${Object.keys(manifest).length}/${projects.length} previews → ${OUT}`);
