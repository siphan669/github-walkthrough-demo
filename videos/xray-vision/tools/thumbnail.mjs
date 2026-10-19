// Render out/thumbnail.png (1280x720) from the same art as the video.
import { readFileSync } from "node:fs";
import { chromium } from "/opt/node22/lib/node_modules/playwright/index.mjs";
import { C, eye, tower } from "./art.mjs";

const font = (p) => readFileSync(p).toString("base64");
const lg = font("/root/.cache/hyperframes/fonts/league-gothic/400-normal-abec064218a9.woff2");
const sm = font("/root/.cache/hyperframes/fonts/space-mono/700-normal-c1e734394b10.woff2");
const html = `<html><head><style>
@font-face { font-family: LG; src: url(data:font/woff2;base64,${lg}); }
@font-face { font-family: SM; src: url(data:font/woff2;base64,${sm}); }
body { margin:0; width:1920px; height:1080px; position:relative; overflow:hidden; background:${C.bg0}; }
.layer, .art { position:absolute; inset:0; width:100%; height:100%; }
.left { position:absolute; left:-260px; top:60px; width:1300px; height:732px; }
.right { position:absolute; right:-380px; top:0; width:1920px; height:1080px; }
.scan, .callout { display:none; }
.title { position:absolute; left:70px; bottom:60px; font-family:LG; font-size:235px; line-height:0.88; color:#fff; text-shadow:0 8px 0 #000, 0 0 50px rgba(95,227,255,0.5); }
.title b { color:${C.xray}; font-weight:400; }
.badge { position:absolute; right:70px; top:70px; font-family:SM; font-size:52px; color:#fff; background:${C.danger}; padding:14px 28px; transform:rotate(3deg); }
</style></head><body>
<div class="right">${tower({ xray: true, hl: 31, fail: true }, 4)}</div>
<div class="left">${eye({ state: "glow" })}</div>
<div class="badge">3,000 PEOPLE INSIDE</div>
<div class="title">WHAT IF YOU HAD<br><b>X-RAY VISION?</b></div>
</body></html>`;
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 2 / 3 });
await p.setContent(html);
await p.evaluate(() => document.fonts.ready);
await p.screenshot({ path: "out/thumbnail.png" });
await b.close();
console.log("out/thumbnail.png");
