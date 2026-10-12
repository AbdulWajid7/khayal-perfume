#!/usr/bin/env node
/**
 * slides.mjs - render KHAYAL carousel slides, stories and square posts to PNG
 * in the house style (Bodoni Moda + Jost, the gold خیال mark, the three bottle
 * colours). Used by kh-carousel and kh-story.
 *
 * Usage
 *   node slides.mjs deck.json            # writes PNGs next to the JSON, or to "out" in the file
 *
 * deck.json
 *   {
 *     "name": "silk-notes",              // file prefix
 *     "format": "carousel",              // carousel 1080x1350 | story 1080x1920 | square 1080x1080 | pin 1000x1500
 *     "theme": "silk",                   // gentleman | silk | oud | cream | ink
 *     "out": "../out/silk-notes",        // optional, relative to the JSON file
 *     "slides": [
 *       { "type": "cover", "kicker": "For her", "title": "Saffron. Silk. <i>Tuberose.</i>", "image": "https://.../silk.jpg" },
 *       { "type": "text",  "kicker": "01", "title": "Wear it at night", "body": "Two sprays on the collar..." },
 *       { "type": "notes", "title": "SILK ROYALE", "top": ["Saffron"], "heart": ["Tuberose"], "base": ["Vanilla"] },
 *       { "type": "cta",   "title": "Try it free", "body": "Sat 17 & Sun 18 Oct · The Terrace Cafe", "url": "khayalparfum.com" }
 *     ]
 *   }
 *
 * Images: an https URL or a path relative to the JSON file. Use real product
 * photos only; never AI-generated bottles (the bottle shape and the three
 * colours must be exact).
 *
 * Needs a Chromium. Set CHROMIUM_PATH, or install once with
 *   cd marketing/social-kit && npm install && npx playwright-core install chromium
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ASSETS = path.join(HERE, "..", "assets");

const SIZES = { carousel: [1080, 1350], story: [1080, 1920], square: [1080, 1080], pin: [1000, 1500] };
const THEMES = {
  gentleman: { bg: "#0B0F17", ink: "#FAF9F7", accent: "#BFD3E6", mark: "mark-gold.png" },
  silk: { bg: "#1E1611", ink: "#FAF9F7", accent: "#E8D5A8", mark: "mark-gold.png" },
  oud: { bg: "#10201E", ink: "#FAF9F7", accent: "#D9B26F", mark: "mark-gold.png" },
  ink: { bg: "#111111", ink: "#FAF9F7", accent: "#C9A96E", mark: "mark-gold.png" },
  cream: { bg: "#F4EFE8", ink: "#2A1A22", accent: "#8A6A3B", mark: "mark-plum.png" },
};

const esc = (s = "") =>
  String(s).replace(/&(?!amp;|lt;|gt;|#)/g, "&amp;").replace(/<(?!\/?(i|em|b|strong|br)\b)/g, "&lt;");

function imageUrl(src, base) {
  if (!src) return null;
  if (/^https?:\/\//.test(src)) return src;
  return pathToFileURL(path.resolve(base, src)).href;
}

function css(t, [w, h]) {
  const font = (f) => pathToFileURL(path.join(ASSETS, f)).href;
  return `
@font-face{font-family:Bodoni;src:url(${font("bodoni-moda-latin-400-normal.woff2")})}
@font-face{font-family:Bodoni;font-style:italic;src:url(${font("bodoni-moda-latin-400-italic.woff2")})}
@font-face{font-family:Jost;font-weight:400;src:url(${font("jost-latin-400-normal.woff2")})}
@font-face{font-family:Jost;font-weight:500;src:url(${font("jost-latin-500-normal.woff2")})}
*{box-sizing:border-box;margin:0}
html,body{width:${w}px;height:${h}px;overflow:hidden;background:${t.bg};color:${t.ink};font-family:Jost;position:relative}
.serif{font-family:Bodoni}
i,em{color:${t.accent}}
.kicker{font-size:26px;letter-spacing:.32em;text-transform:uppercase;color:${t.accent};font-weight:500}
.word{position:absolute;left:0;right:0;text-align:center;font-family:Bodoni;letter-spacing:.55em;font-size:30px}
.page{position:absolute;right:70px;font-size:22px;letter-spacing:.2em;opacity:.6}
.mark{background:url(${pathToFileURL(path.join(ASSETS, t.mark)).href}) center/contain no-repeat;aspect-ratio:680/1118}
`;
}

function slideHtml(s, t, size, i, n, base, safeTop, safeBottom) {
  const [, h] = size;
  const top = `<div class="word" style="top:${safeTop}px">KHAYAL</div>`;
  const page = n > 1 && s.type !== "cta" ? `<div class="page" style="bottom:${h - safeBottom + 10}px">${i + 1} / ${n}</div>` : "";
  const img = imageUrl(s.image, base);
  if (s.type === "cover") {
    return `${img ? `<div style="position:absolute;inset:0;background:url('${img}') center/cover"></div>
      <div style="position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,0,0,.55),rgba(0,0,0,0) 30%,rgba(0,0,0,0) 45%,${t.bg} 92%)"></div>` : ""}
      ${top}
      <div style="position:absolute;left:80px;right:80px;bottom:${h - safeBottom + 70}px">
        ${s.kicker ? `<div class="kicker">${esc(s.kicker)}</div>` : ""}
        <div class="serif" style="font-size:${s.size || 92}px;line-height:1.02;margin-top:22px">${esc(s.title)}</div>
        ${s.body ? `<div style="font-size:32px;line-height:1.45;margin-top:26px;opacity:.9">${esc(s.body)}</div>` : ""}
      </div>${page}`;
  }
  if (s.type === "notes") {
    const row = (label, list) =>
      list?.length
        ? `<div style="margin-top:46px"><div class="kicker">${label}</div><div class="serif" style="font-size:54px;line-height:1.15;margin-top:12px">${list.map(esc).join(" · ")}</div></div>`
        : "";
    return `${top}<div style="position:absolute;left:90px;right:90px;top:${safeTop + 150}px">
      <div class="serif" style="font-size:76px;letter-spacing:.04em">${esc(s.title)}</div>
      ${s.body ? `<div style="font-size:30px;line-height:1.5;margin-top:18px;opacity:.85">${esc(s.body)}</div>` : ""}
      ${row("Top", s.top)}${row("Heart", s.heart)}${row("Base", s.base)}</div>${page}`;
  }
  if (s.type === "cta") {
    return `<div class="mark" style="position:absolute;left:50%;top:${safeTop + 90}px;transform:translateX(-50%);height:${Math.round(h * 0.24)}px"></div>
      <div style="position:absolute;left:80px;right:80px;top:${safeTop + 120 + Math.round(h * 0.24)}px;text-align:center">
        <div class="serif" style="font-size:${s.size || 84}px;line-height:1.05">${esc(s.title)}</div>
        ${s.body ? `<div style="font-size:34px;line-height:1.5;margin-top:30px">${esc(s.body)}</div>` : ""}
      </div>
      <div style="position:absolute;left:0;right:0;bottom:${h - safeBottom + 20}px;text-align:center;font-size:30px;letter-spacing:.24em;text-transform:uppercase;color:${t.accent}">${esc(s.url || "khayalparfum.com")}</div>`;
  }
  // text
  return `${top}${img ? `<div style="position:absolute;left:80px;right:80px;top:${safeTop + 110}px;height:${Math.round(h * 0.36)}px;background:url('${img}') center/cover;border-radius:6px"></div>` : ""}
    <div style="position:absolute;left:90px;right:90px;${img ? `top:${safeTop + 160 + Math.round(h * 0.36)}px` : `top:${safeTop + 200}px`}">
      ${s.kicker ? `<div class="kicker">${esc(s.kicker)}</div>` : ""}
      <div class="serif" style="font-size:${s.size || 70}px;line-height:1.06;margin-top:18px">${esc(s.title)}</div>
      ${s.body ? `<div style="font-size:34px;line-height:1.5;margin-top:28px;opacity:.9">${esc(s.body)}</div>` : ""}
    </div>${page}`;
}

async function launch() {
  let chromium;
  try {
    ({ chromium } = await import("playwright-core"));
  } catch {
    ({ chromium } = await import("playwright"));
  }
  const candidates = [
    process.env.CHROMIUM_PATH,
    "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  ].filter(Boolean);
  const executablePath = candidates.find((p) => fs.existsSync(p));
  return chromium.launch(executablePath ? { executablePath } : {});
}

async function main() {
  const file = process.argv[2];
  if (!file) {
    console.error("usage: node slides.mjs deck.json");
    process.exit(2);
  }
  const deck = JSON.parse(fs.readFileSync(file, "utf8"));
  const base = path.dirname(path.resolve(file));
  const size = SIZES[deck.format || "carousel"];
  const t = THEMES[deck.theme || "ink"];
  if (!size || !t) throw new Error(`unknown format or theme: ${deck.format} / ${deck.theme}`);
  // Stories: the app covers the top ~250px and bottom ~250px.
  const safeTop = deck.format === "story" ? 260 : 80;
  const safeBottom = deck.format === "story" ? size[1] - 300 : size[1] - 70;
  const out = path.resolve(base, deck.out || ".");
  fs.mkdirSync(out, { recursive: true });

  const browser = await launch();
  const page = await browser.newPage({ viewport: { width: size[0], height: size[1] } });
  const files = [];
  for (const [i, s] of deck.slides.entries()) {
    const html = `<!doctype html><html><head><meta charset="utf-8"><style>${css(t, size)}</style></head><body>${slideHtml(s, t, size, i, deck.slides.length, base, safeTop, safeBottom)}</body></html>`;
    const tmp = path.join(out, `.slide-${i}.html`);
    fs.writeFileSync(tmp, html);
    await page.goto(pathToFileURL(tmp).href, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    const name = path.join(out, `${deck.name || "slide"}-${String(i + 1).padStart(2, "0")}.png`);
    await page.screenshot({ path: name });
    fs.unlinkSync(tmp);
    files.push(name);
  }
  await browser.close();
  console.log(files.join("\n"));
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
