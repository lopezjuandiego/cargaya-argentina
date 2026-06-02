import { chromium } from "playwright";
import { mkdir } from "fs/promises";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __dir = dirname(fileURLToPath(import.meta.url));
const PUBLIC = join(__dir, "../public");
const OUT    = join(PUBLIC, "ig-exports");

const JOBS = [
  {
    file:   "ig/casa/carousel-post.html",
    dir:    "casa/post",
    slides: ["s1", "s2", "s3", "s7", "s8", "s10"],
  },
  {
    file:   "ig/casa/carousel-story.html",
    dir:    "casa/story",
    slides: ["s1", "s2", "s3", "s7", "s8", "s10"],
  },
  {
    file:   "ig/patente/carousel-post.html",
    dir:    "patente/post",
    slides: ["s1", "s2", "s3", "s4", "s5", "s6"],
  },
  {
    file:   "ig/patente/carousel-story.html",
    dir:    "patente/story",
    slides: ["s1", "s2", "s3", "s4", "s5", "s6"],
  },
  {
    file:   "ig/san-isidro/carousel-post.html",
    dir:    "san-isidro/post",
    slides: ["s1", "s2", "s3", "s4", "s5", "s6"],
  },
  {
    file:   "ig/san-isidro/carousel-story.html",
    dir:    "san-isidro/story",
    slides: ["s1", "s2", "s3", "s4", "s5", "s6"],
  },
  {
    file:   "ig/tigre/carousel-post.html",
    dir:    "tigre/post",
    slides: ["s1", "s2", "s3", "s4", "s5", "s6"],
  },
  {
    file:   "ig/tigre/carousel-story.html",
    dir:    "tigre/story",
    slides: ["s1", "s2", "s3", "s4", "s5", "s6"],
  },
  {
    file:   "ig/cargadores-rapidos/carousel-post.html",
    dir:    "cargadores-rapidos/post",
    slides: ["s1", "s2", "s3", "s4", "s5", "s6"],
  },
  {
    file:   "ig/cargadores-rapidos/carousel-story.html",
    dir:    "cargadores-rapidos/story",
    slides: ["s1", "s2", "s3", "s4", "s5", "s6"],
  },
  {
    file:   "ig/ansiedad/carousel-post.html",
    dir:    "ansiedad/post",
    slides: ["s1", "s2", "s3", "s4", "s5", "s6"],
  },
  {
    file:   "ig/ansiedad/carousel-story.html",
    dir:    "ansiedad/story",
    slides: ["s1", "s2", "s3", "s4", "s5", "s6"],
  },
  {
    file:   "ig/costa-atlantica/carousel-post.html",
    dir:    "costa-atlantica/post",
    slides: ["s1", "s2", "s3", "s4", "s5", "s6"],
  },
  {
    file:   "ig/costa-atlantica/carousel-story.html",
    dir:    "costa-atlantica/story",
    slides: ["s1", "s2", "s3", "s4", "s5", "s6"],
  },
];

const browser = await chromium.launch({ args: ["--no-sandbox"] });

for (const job of JOBS) {
  const outDir = join(OUT, job.dir);
  await mkdir(outDir, { recursive: true });

  const page = await browser.newPage();
  await page.setViewportSize({ width: 1400, height: 2200 });
  await page.goto(`file://${PUBLIC}/${job.file}`);

  // wait for external images (Pexels / Gamma CDN) to load
  await page.waitForLoadState("networkidle").catch(() => {});
  // extra safety for slow CDNs
  await page.waitForTimeout(1500);

  for (const id of job.slides) {
    const el = await page.$(`#${id}`);
    if (!el) { console.warn(`  ⚠️  #${id} not found in ${job.file}`); continue; }
    const outPath = join(outDir, `${id}.png`);
    await el.screenshot({ path: outPath, type: "png" });
    console.log(`  ✅  ${job.dir}/${id}.png`);
  }

  await page.close();
}

await browser.close();
console.log(`\n🎉  Todos los slides en: ${OUT}`);
