// Generates the `seemantk` brand-variant assets (favicon, PWA/OG images, and
// the 12 public illustrations) from the seemantk.com palette:
//   blue #4361ee · dark #3a0ca3 · yellow #ffd60a · red #e63946 · ink #121212
//
// Compositions mirror the default illustrations (calendar scenes, badge rings,
// banner) with the SK monogram replacing the default mark, so swapping
// BRAND_VARIANT=seemantk at image build restyles every placement at once.
//
// Run from the repo root:  node scripts/gen-seemantk-brand.mjs
// Outputs are committed - this only needs re-running to iterate on the art.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "apps/web/brand-variants/seemantk");

// seemantk.com palette
const BLUE = "#4361ee"; // primary line art / brand tile
const BLUE_DARK = "#3a0ca3"; // icon strokes (his --sk-blue-dark)
const BLUE_MID = "#3a56d4"; // hover / decorative darker blue
const BLUE_SOFT = "#c7d2fe"; // placeholder bars, banner subtitle
const YELLOW = "#ffd60a"; // accents (his --sk-yellow)
const YELLOW_PALE = "#fff6d9"; // soft decorative circle
const INK = "#121212"; // dark surfaces / badge icon fallback
const BG = "#f0f3ff"; // light scene ground (blue-tinted neutral)
const PALE = "#e3eafd"; // pale decorative circle
const GREY_BAR = "#d1d5db";
const WHITE = "#ffffff";
const FONT = "Helvetica, Arial, sans-serif";

const svg = (w, h, body) =>
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`,
  );

// Rounded-corner alpha mask (matches the default art's ~7% corner radius).
const roundedMask = (w, h, r) =>
  Buffer.from(
    `<svg width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="${r}" ry="${r}" fill="#fff"/></svg>`,
  );

async function writePng(name, w, h, body, { radius = 0 } = {}) {
  const dest = path.join(OUT, name);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  // Supersample at density 384, then snap back to the exact logical size the
  // default art uses (density alone scales past the SVG's width/height).
  let img = sharp(svg(w, h, body), { density: 384 }).resize(w, h, { fit: "fill" });
  if (radius > 0) {
    img = img.composite([{ input: roundedMask(w, h, radius), blend: "dest-in" }]);
  }
  await img.png().toFile(dest);
  console.log("wrote", path.relative(ROOT, dest), `${w}x${h}`);
}

// The SK monogram tile: rounded square + bold letters. Absolute coordinates
// only - sharp's SVG renderer mis-sizes <text> inside scale() transforms, and
// the manual baseline (center + ~0.36em) keeps glyphs centered everywhere.
function skMark(x, y, size) {
  const fontSize = size * 0.54;
  const baseline = y + size * (0.5 + 0.54 * 0.36);
  return `<rect x="${x}" y="${y}" width="${size}" height="${size}" rx="${size * 0.23}" fill="${BLUE}"/>
    <text x="${x + size / 2}" y="${baseline}" fill="${WHITE}" font-family="${FONT}" font-size="${fontSize}" font-weight="800" letter-spacing="${-size * 0.02}" text-anchor="middle">SK</text>`;
}

// Shared scene decor: pale circles + the bright-blue corner wedge.
function decor(w, h, { paleBlue, paleYellow, wedge = true } = {}) {
  let s = "";
  if (paleBlue) {
    s += `<circle cx="${paleBlue[0]}" cy="${paleBlue[1]}" r="${paleBlue[2]}" fill="${PALE}"/>`;
  }
  if (paleYellow) {
    s += `<circle cx="${paleYellow[0]}" cy="${paleYellow[1]}" r="${paleYellow[2]}" fill="${YELLOW_PALE}"/>`;
  }
  if (wedge) s += `<path d="M${w - 90} 0 A90 90 0 0 1 ${w} 90 L${w} 0 Z" fill="${BLUE}"/>`;
  return s;
}

const radiusFor = (w, h, pct = 0.07) => Math.round(Math.min(w, h) * pct);

// ---------------------------------------------------------------- scenes

async function plan() {
  const w = 592;
  const h = 584;
  const cells = [];
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 3; c++) {
      const active = r === 1 && c === 1;
      cells.push(
        `<rect x="${176 + c * 88}" y="${236 + r * 62}" width="56" height="44" rx="10" fill="${active ? YELLOW : PALE}"/>`,
      );
    }
  }
  const body = `${decor(w, h, { paleBlue: [505, 60, 140], paleYellow: [30, 555, 135], wedge: false })}
    <path d="M25 470 Q95 545 195 565" fill="none" stroke="${YELLOW}" stroke-width="6" stroke-linecap="round"/>
    <!-- calendar card: blue shell + inset white body leaves a blue border/header -->
    <rect x="146" y="150" width="300" height="215" rx="22" fill="${BLUE}"/>
    <rect x="153" y="204" width="286" height="154" rx="16" fill="${WHITE}"/>
    ${cells.join("")}
    ${skMark(246, 318, 100)}`;
  await writePng("public/brand/illustrations/otter-plan.png", w, h, body, {
    radius: radiusFor(w, h),
  });
}

async function relax() {
  const w = 592;
  const h = 584;
  // disc pedestal: two stacked ellipses read as a 3D rim
  const body = `${decor(w, h, { paleBlue: [520, 70, 135], paleYellow: [25, 555, 140] })}
    <ellipse cx="296" cy="388" rx="182" ry="62" fill="${WHITE}" stroke="${BLUE}" stroke-width="5"/>
    <ellipse cx="296" cy="368" rx="182" ry="62" fill="${WHITE}" stroke="${BLUE}" stroke-width="5"/>
    ${skMark(248, 214, 96)}
    <path d="M212 478 Q296 522 380 478" fill="none" stroke="${YELLOW}" stroke-width="7" stroke-linecap="round"/>`;
  await writePng("public/brand/illustrations/otter-relax.png", w, h, body, {
    radius: radiusFor(w, h),
  });
}

async function focus() {
  const w = 389;
  const h = 596;
  const body = `${decor(w, h, { paleBlue: [360, 45, 115], wedge: false })}
    <circle cx="330" cy="112" r="16" fill="${YELLOW}"/>
    <circle cx="194" cy="230" r="138" fill="none" stroke="${BLUE}" stroke-width="5"/>
    ${skMark(146, 152, 96)}
    <!-- head-and-shoulders silhouette under the orb -->
    <path d="M95 500 V412 a99 99 0 0 1 198 0 V500" fill="none" stroke="${BLUE}" stroke-width="5"/>
    <path d="M148 520 Q194 552 240 520" fill="none" stroke="${YELLOW}" stroke-width="6" stroke-linecap="round"/>`;
  await writePng("public/brand/illustrations/otter-focus.png", w, h, body, {
    radius: radiusFor(w, h),
  });
}

async function agenda() {
  const w = 380;
  const h = 596;
  const card = (y, stroke, bar) =>
    `<rect x="45" y="${y}" width="290" height="74" rx="14" fill="${WHITE}" stroke="${stroke}" stroke-width="4"/>
     <rect x="67" y="${y + 20}" width="124" height="14" rx="7" fill="${bar}"/>
     <rect x="67" y="${y + 44}" width="82" height="12" rx="6" fill="${GREY_BAR}"/>`;
  const body = `${decor(w, h, { paleBlue: [355, 55, 110] })}
    ${skMark(143, 48, 96)}
    ${card(196, BLUE, BLUE_SOFT)}
    ${card(296, YELLOW, "#ffe38a")}
    ${card(396, BLUE, BLUE_SOFT)}`;
  await writePng("public/brand/illustrations/otter-agenda.png", w, h, body, {
    radius: radiusFor(w, h),
  });
}

async function remind() {
  const w = 391;
  const h = 596;
  const body = `${decor(w, h, { paleBlue: [360, 55, 110], paleYellow: [25, 560, 120] })}
    ${skMark(148, 60, 96)}
    <!-- bell outline + alert badge -->
    <path d="M118 385 V300 a77 77 0 0 1 154 0 V385" fill="none" stroke="${BLUE}" stroke-width="5"/>
    <path d="M98 385 H292" fill="none" stroke="${BLUE}" stroke-width="5" stroke-linecap="round"/>
    <path d="M170 415 a25 18 0 0 0 50 0" fill="none" stroke="${BLUE}" stroke-width="5" stroke-linecap="round"/>
    <circle cx="288" cy="272" r="32" fill="${YELLOW}"/>
    <text x="288" y="${272 + 15}" fill="${INK}" font-family="${FONT}" font-size="42" font-weight="800" text-anchor="middle">!</text>`;
  await writePng("public/brand/illustrations/otter-remind.png", w, h, body, {
    radius: radiusFor(w, h),
  });
}

async function banner() {
  const w = 1819;
  const h = 448;
  const body = `<rect width="${w}" height="${h}" fill="${BLUE}"/>
    <circle cx="1580" cy="60" r="310" fill="${BLUE_MID}"/>
    <circle cx="250" cy="470" r="250" fill="${BLUE_MID}" opacity="0.6"/>
    ${skMark(120, 126, 196)}
    <text x="368" y="232" fill="${WHITE}" font-family="${FONT}" font-size="94" font-weight="800" letter-spacing="-2">Seemant Kulleen</text>
    <text x="372" y="306" fill="${BLUE_SOFT}" font-family="${FONT}" font-size="40" font-weight="500">Schedule a call.</text>`;
  await writePng("public/brand/illustrations/otter-banner.png", w, h, body, {
    radius: radiusFor(w, h),
  });
}

// ---------------------------------------------------------------- badges

async function badge(name, icon) {
  const w = 204;
  const h = 204;
  const body = `<rect width="${w}" height="${h}" fill="${BG}"/>
    <circle cx="102" cy="102" r="70" fill="none" stroke="${BLUE}" stroke-width="5"/>
    <circle cx="158" cy="48" r="14" fill="${YELLOW}"/>
    ${icon}`;
  await writePng(`public/brand/illustrations/badge-${name}.png`, w, h, body, {
    radius: radiusFor(w, h, 0.1),
  });
}

async function badges() {
  const st = `fill="none" stroke="${BLUE_DARK}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"`;
  await badge(
    "scheduling",
    `<circle cx="86" cy="112" r="30" fill="none" stroke="${BLUE_DARK}" stroke-width="9"/>
     <circle cx="120" cy="92" r="30" fill="none" stroke="${BLUE}" stroke-width="9"/>`,
  );
  await badge(
    "balance",
    `<circle cx="102" cy="102" r="34" fill="none" stroke="${BLUE_DARK}" stroke-width="9"/>
     <circle cx="126" cy="102" r="27" fill="${BG}"/>`,
  );
  await badge(
    "reminders",
    `<path d="M80 130 V104 a22 22 0 0 1 44 0 V130" ${st}/>
     <path d="M70 130 H134" ${st}/>
     <path d="M92 144 a10 8 0 0 0 20 0" ${st}/>`,
  );
  await badge(
    "secure",
    `<path d="M102 66 L136 80 V106 c0 22 -16 34 -34 42 c-18 -8 -34 -20 -34 -42 V80 Z" ${st}/>
     <path d="M86 106 l12 12 l24 -26" ${st}/>`,
  );
  await badge(
    "timezone",
    `<circle cx="102" cy="102" r="34" ${st}/>
     <ellipse cx="102" cy="102" rx="14" ry="34" ${st}/>
     <path d="M68 102 H136" ${st}/>`,
  );
  await badge(
    "track",
    `<rect x="70" y="82" width="64" height="56" rx="8" ${st}/>
     <path d="M86 72 V84 M118 72 V84" ${st}/>
     <path d="M84 112 l12 12 l24 -26" ${st}/>`,
  );
}

// ---------------------------------------------------------- app / OG art

async function appIcons() {
  // PWA / push notification icon: full-bleed tile (no transparency).
  await writePng(
    "public/brand/notification-icon.png",
    192,
    192,
    `<rect width="192" height="192" rx="44" fill="${BLUE}"/>
     <text x="96" y="${96 + 96 * 0.36}" fill="${WHITE}" font-family="${FONT}" font-size="96" font-weight="800" letter-spacing="-3" text-anchor="middle">SK</text>`,
  );

  // Static OG image (app/opengraph-image.png - Next file convention, NOT public/).
  const w = 1200;
  const h = 630;
  const dest = path.join(OUT, "app/opengraph-image.png");
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  const ogBody = `<rect width="${w}" height="${h}" fill="${INK}"/>
    <circle cx="1040" cy="110" r="270" fill="#1a2350"/>
    <circle cx="140" cy="580" r="210" fill="#181818"/>
    ${skMark(90, 215, 200)}
    <circle cx="282" cy="248" r="18" fill="${YELLOW}"/>
    <text x="352" y="318" fill="${WHITE}" font-family="${FONT}" font-size="86" font-weight="800" letter-spacing="-2">Seemant Kulleen</text>
    <text x="355" y="378" fill="#9ca3af" font-family="${FONT}" font-size="34" font-weight="500">VP/Director of Product · Org builder</text>`;
  await sharp(svg(w, h, ogBody), { density: 384 })
    .resize(w, h, { fit: "fill" })
    .png()
    .toFile(dest);
  console.log("wrote", path.relative(ROOT, dest), `${w}x${h}`);

  // Favicon / app icon: vector so it stays crisp at 16px.
  const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512" role="img" aria-labelledby="title">
<title id="title">Seemant Kulleen</title>
<rect width="512" height="512" rx="118" fill="${BLUE}"/>
<text x="256" y="${256 + 270 * 0.36}" fill="${WHITE}" font-family="ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="270" font-weight="800" letter-spacing="-10" text-anchor="middle">SK</text>
</svg>
`;
  const iconDest = path.join(OUT, "public/brand/icon.svg");
  fs.mkdirSync(path.dirname(iconDest), { recursive: true });
  fs.writeFileSync(iconDest, iconSvg);
  console.log("wrote", path.relative(ROOT, iconDest));
}

await plan();
await relax();
await focus();
await agenda();
await remind();
await banner();
await badges();
await appIcons();
console.log("done ->", path.relative(ROOT, OUT));
