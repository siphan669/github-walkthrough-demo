// SVG art for the X-ray story: backgrounds, characters, close-up objects.
// Everything is generated deterministically (seeded PRNG) so renders are repeatable.
// Animation hooks are data-* attributes consumed by the runtime in tools/runtime.js.

export const C = {
  bg0: "#060a13", bg1: "#0d1626", ink: "#e9eef6", dim: "#7d8ba3",
  xray: "#5fe3ff", danger: "#ff4b4b", warm: "#ffb547", ok: "#57f2a0", nora: "#ffcf4a",
};

export function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

const W = 1920, H = 1080, GROUND = 880;
const svg = (body, cls = "") => `<svg class="art ${cls}" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">${body}</svg>`;

// ---------- backgrounds ----------
function sky(top, bottom, id) {
  return `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#${id})"/>`;
}
function stars(r, n = 70) {
  let s = "";
  for (let i = 0; i < n; i++) s += `<circle cx="${(r() * W) | 0}" cy="${(r() * 520) | 0}" r="${(r() * 1.8 + 0.4).toFixed(1)}" fill="#cfe3ff" opacity="${(r() * 0.6 + 0.2).toFixed(2)}"/>`;
  return s;
}
function skyline(r, base, color, minH, maxH, windows = true) {
  let s = "", x = -20;
  while (x < W + 40) {
    const w = 70 + r() * 120, h = minH + r() * (maxH - minH);
    s += `<rect x="${x | 0}" y="${(base - h) | 0}" width="${w | 0}" height="${h | 0}" fill="${color}"/>`;
    if (windows) for (let wy = base - h + 20; wy < base - 20; wy += 34) for (let wx = x + 12; wx < x + w - 16; wx += 26)
      if (r() < 0.32) s += `<rect x="${wx | 0}" y="${wy | 0}" width="10" height="14" fill="${C.warm}" opacity="${(0.25 + r() * 0.5).toFixed(2)}"/>`;
    x += w + 6;
  }
  return s;
}
function spire(x, base, h, w = 170) {
  let s = `<rect x="${x - w / 2}" y="${base - h}" width="${w}" height="${h}" fill="#101c30" stroke="#2c4466" stroke-width="3"/>`;
  for (let y = base - h + 14; y < base - 10; y += 16) s += `<line x1="${x - w / 2 + 8}" x2="${x + w / 2 - 8}" y1="${y}" y2="${y}" stroke="#ffd58a" stroke-opacity="0.18" stroke-width="5"/>`;
  s += `<line x1="${x}" x2="${x}" y1="${base - h - 90}" y2="${base - h}" stroke="#2c4466" stroke-width="6"/><circle cx="${x}" cy="${base - h - 92}" r="7" fill="${C.danger}" data-pulse="1.2"/>`;
  return s;
}
function ground(color = "#0a111d", y = GROUND) {
  return `<rect x="0" y="${y}" width="${W}" height="${H - y}" fill="${color}"/><line x1="0" x2="${W}" y1="${y}" y2="${y}" stroke="#24344f" stroke-width="3"/>`;
}
function lamp(x) {
  return `<line x1="${x}" x2="${x}" y1="${GROUND}" y2="${GROUND - 380}" stroke="#2a3a55" stroke-width="10"/><path d="M${x} ${GROUND - 380} q40 -10 60 10" stroke="#2a3a55" stroke-width="10" fill="none"/><ellipse cx="${x + 62}" cy="${GROUND - 362}" rx="22" ry="9" fill="${C.warm}"/><path d="M${x + 40} ${GROUND - 360} L${x - 60} ${GROUND} L${x + 190} ${GROUND} Z" fill="${C.warm}" opacity="0.07"/>`;
}
function windowsRow(x0, y0, w, h, n, glow = "#1c3a66") {
  let s = "";
  const gw = w / n;
  for (let i = 0; i < n; i++) s += `<rect x="${x0 + i * gw + 10}" y="${y0}" width="${gw - 20}" height="${h}" fill="${glow}" stroke="#35507a" stroke-width="4"/>`;
  return s;
}
function chandelier(x, y) {
  let s = `<line x1="${x}" x2="${x}" y1="0" y2="${y}" stroke="#6b5a35" stroke-width="3"/>`;
  for (let i = -3; i <= 3; i++) s += `<circle cx="${x + i * 26}" cy="${y + 20 + Math.abs(i) * -4}" r="7" fill="${C.warm}" opacity="0.9"/>`;
  return s + `<ellipse cx="${x}" cy="${y + 60}" rx="200" ry="60" fill="${C.warm}" opacity="0.06"/>`;
}
function screenPanel(mode) {
  const x = 610, y = 120, w = 700, h = 330;
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="#05080f" stroke="#3a4a66" stroke-width="8"/>`;
  if (mode === "proof") {
    s += `<g data-in="fade" data-delay="0.4"><rect x="${x + 8}" y="${y + 8}" width="${w - 16}" height="${h - 16}" fill="#0c2a4d"/>`;
    for (let i = 0; i < 9; i++) s += `<line x1="${x + 40}" x2="${x + 330}" y1="${y + 50 + i * 28}" y2="${y + 50 + i * 28}" stroke="${C.xray}" stroke-opacity="0.6" stroke-width="4"/>`;
    s += `<rect x="${x + 380}" y="${y + 40}" width="270" height="250" fill="none" stroke="${C.xray}" stroke-width="4"/><line x1="${x + 515}" x2="${x + 515}" y1="${y + 40}" y2="${y + 290}" stroke="${C.danger}" stroke-width="6"/>`;
    s += `<text x="${x + 40}" y="${y + 310}" class="mono" font-size="26" fill="${C.danger}">REAL BLUEPRINTS · LEDGER · BRIBE</text></g>`;
  }
  return s;
}
const BG = {
  street: (r) => sky("#0a1630", "#16223a", "gs") + stars(r) + skyline(r, GROUND, "#0c1526", 200, 520) + spire(1520, GROUND, 780) + lamp(260) + ground(),
  lobby: () => sky("#1a1712", "#0f0d0a", "gl") + [200, 760, 1160, 1720].map((x) => `<rect x="${x - 40}" y="90" width="80" height="${GROUND - 90}" fill="#2a251c" stroke="#4a4030" stroke-width="4"/>`).join("") + chandelier(960, 120) + `<rect x="1280" y="660" width="520" height="220" fill="#231d14" stroke="#5a4a30" stroke-width="5"/>` + ground("#15120d"),
  ballroom: (r, o) => sky("#0d1424", "#1a1a26", "gb") + windowsRow(60, 90, 1800, 520, 6, "#0f2547") + skyline(r, 610, "#0a1830", 80, 300) + chandelier(420, 60) + chandelier(1500, 60) + (o.screen ? screenPanel(o.screen) : "") + ground("#141420"),
  office: () => sky("#121a28", "#0b111b", "go") + windowsRow(1100, 120, 700, 460, 3) + `<rect x="160" y="560" width="260" height="320" rx="10" fill="#1c2636" stroke="#3a4a66" stroke-width="6"/><circle cx="290" cy="720" r="44" fill="none" stroke="#5a6d8c" stroke-width="8"/><rect x="560" y="700" width="560" height="30" fill="#2b2118"/><rect x="590" y="730" width="20" height="150" fill="#2b2118"/><rect x="1070" y="730" width="20" height="150" fill="#2b2118"/>` + ground("#0d131e"),
  hall: () => sky("#121926", "#0b1019", "gh") + [260, 760, 1260, 1760].map((x) => `<rect x="${x - 70}" y="420" width="140" height="460" fill="#1b2434" stroke="#33445f" stroke-width="5"/><circle cx="${x + 45}" cy="660" r="7" fill="#7d8ba3"/>`).join("") + [480, 1000, 1500].map((x) => `<rect x="${x - 90}" y="40" width="180" height="16" fill="#dfe8f5" opacity="0.8"/><path d="M${x - 90} 56 L${x - 220} 880 L${x + 220} 880 L${x + 90} 56 Z" fill="#dfe8f5" opacity="0.04"/>`).join("") + ground("#0e1420"),
  roof: (r, o) => sky("#050912", "#101b30", "gr") + stars(r, 110) + skyline(r, 1080, "#0a1426", 120, 300) + `<rect x="0" y="${GROUND}" width="${W}" height="${H - GROUND}" fill="#121a28"/><line x1="0" x2="${W}" y1="${GROUND - 70}" y2="${GROUND - 70}" stroke="#3a4a66" stroke-width="6"/>` + Array.from({ length: 25 }, (_, i) => `<line x1="${i * 80}" x2="${i * 80}" y1="${GROUND - 70}" y2="${GROUND}" stroke="#3a4a66" stroke-width="4"/>`).join("") + (o.crates ? crates(1450, GROUND) : ""),
  home: () => sky("#2a1d12", "#1a120b", "gm") + `<rect x="1200" y="180" width="440" height="340" fill="#3b5a7a" stroke="#5a4028" stroke-width="14"/><line x1="1420" x2="1420" y1="180" y2="520" stroke="#5a4028" stroke-width="10"/><rect x="160" y="640" width="560" height="160" rx="30" fill="#4a2f22"/><rect x="190" y="580" width="500" height="100" rx="30" fill="#5a3a2a"/><line x1="900" x2="900" y1="560" y2="${GROUND}" stroke="#6b5a35" stroke-width="6"/><path d="M850 560 h100 l-25 -70 h-50 z" fill="${C.warm}" opacity="0.8"/>` + ground("#22170e"),
  grave: (r) => sky("#3a2a40", "#e08a5a", "gg") + `<circle cx="1500" cy="640" r="120" fill="#ffcf8a" opacity="0.7"/><path d="M0 ${GROUND - 40} Q960 ${GROUND - 160} ${W} ${GROUND - 40} L${W} ${H} L0 ${H} Z" fill="#1c1622"/><path d="M300 ${GROUND - 70} v-260 M300 ${GROUND - 270} q-120 -60 -40 -170 q80 -80 160 0 q80 110 -40 170" stroke="#140f18" stroke-width="18" fill="#140f18"/><path d="M1060 ${GROUND - 92} v-170 a80 80 0 0 1 160 0 v170 z" fill="#2b2433" stroke="#4a3d55" stroke-width="5"/><line x1="1100" x2="1180" y1="${GROUND - 200}" y2="${GROUND - 200}" stroke="#6b5d7a" stroke-width="5"/><line x1="1100" x2="1180" y1="${GROUND - 175}" y2="${GROUND - 175}" stroke="#6b5d7a" stroke-width="5"/>`,
  stairs: () => sky("#0f1612", "#0a0f0c", "gt") + Array.from({ length: 12 }, (_, i) => `<rect x="${200 + i * 120}" y="${GROUND - i * 45}" width="${1720 - i * 120}" height="45" fill="#18221c" stroke="#2c3b31" stroke-width="3"/>`).join("") + `<rect x="1600" y="120" width="200" height="80" rx="6" fill="#0e3b22"/><text x="1700" y="175" text-anchor="middle" class="mono" font-size="40" fill="${C.ok}">EXIT</text>`,
  bridge: (r) => sky("#0e1a2e", "#26324a", "gd") + stars(r, 40) + `<rect x="0" y="${GROUND - 60}" width="${W}" height="40" fill="#2a3a55"/>` + Array.from({ length: 13 }, (_, i) => `<line x1="${i * 160}" x2="${i * 160 + 160}" y1="${GROUND - 60}" y2="${GROUND - 360}" stroke="#2a3a55" stroke-width="12"/><line x1="${i * 160 + 160}" x2="${i * 160 + 160}" y1="${GROUND - 60}" y2="${GROUND - 360}" stroke="#2a3a55" stroke-width="12"/>`).join("") + `<line x1="0" x2="${W}" y1="${GROUND - 360}" y2="${GROUND - 360}" stroke="#2a3a55" stroke-width="16"/><path d="M1180 ${GROUND - 60} l20 -14 l-12 -10 l24 -16" stroke="${C.danger}" stroke-width="6" fill="none" data-in="draw" data-delay="0.8"/><rect x="0" y="${GROUND - 20}" width="${W}" height="${H}" fill="#0b1424"/>`,
  hospital: () => sky("#dfe9f2", "#b9c9d8", "gp") + [300, 900, 1500].map((x) => `<rect x="${x - 90}" y="40" width="180" height="16" fill="#fff"/>`).join("") + `<rect x="1300" y="660" width="460" height="60" rx="10" fill="#8aa6c0"/><rect x="1300" y="720" width="20" height="160" fill="#6a849c"/><rect x="1740" y="720" width="20" height="160" fill="#6a849c"/>` + ground("#a8b8c8"),
  rubble: (r) => sky("#2a2a2e", "#4a4440", "gu") + Array.from({ length: 16 }, () => { const x = r() * W, y = GROUND - r() * 240, w = 120 + r() * 260, a = (r() * 50 - 25) | 0; return `<rect x="${x | 0}" y="${y | 0}" width="${w | 0}" height="${(40 + r() * 60) | 0}" fill="#3a3632" stroke="#55504a" stroke-width="4" transform="rotate(${a} ${x | 0} ${y | 0})"/>`; }).join("") + ground("#2e2a26"),
};
function crates(x, base) {
  let s = "";
  for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) s += `<rect x="${x + i * 120}" y="${base - 90 - j * 90}" width="110" height="86" fill="#3a2a1a" stroke="#7a5a30" stroke-width="5"/><text x="${x + i * 120 + 55}" y="${base - 38 - j * 90}" text-anchor="middle" class="mono" font-size="18" fill="${C.warm}">FIREWORKS</text>`;
  return s + `<rect x="${x - 170}" y="${base - 250}" width="130" height="250" fill="#141414" stroke="#444" stroke-width="5"/><circle cx="${x - 105}" cy="${base - 170}" r="40" fill="none" stroke="#555" stroke-width="8"/><circle cx="${x - 105}" cy="${base - 70}" r="28" fill="none" stroke="#555" stroke-width="8"/>`;
}

// ---------- characters ----------
// House style: navy egg-shaped head with a colored rim light, white pill eyes with lids,
// short colored jacket, thick rounded limbs. Limb angles in degrees (0 = straight down,
// negative swings forward for a right-facing body).
const POSES = {
  stand: { aF: [-10, -8], aB: [12, 6], lF: [-6, 4], lB: [6, 4] },
  walk: { aF: [-22, -15], aB: [22, -10], lF: [-22, 14], lB: [22, 6], swing: 22, period: 0.5 },
  run: { aF: [-50, -80], aB: [40, -70], lF: [-38, 30], lB: [34, 20], swing: 38, period: 0.32 },
  talk: { aF: [-45, -55], aB: [12, 6], lF: [-6, 4], lB: [6, 4], gesture: true, face: "talk" },
  point: { aF: [-88, -2], aB: [12, 6], lF: [-8, 4], lB: [8, 4], face: "smug" },
  wave: { aF: [-120, -55], aB: [12, 6], lF: [-6, 4], lB: [6, 4], wave: true, face: "happy" },
  sad: { aF: [3, 2], aB: [6, 2], lF: [-4, 2], lB: [4, 2], head: [6, 10], face: "sad" },
  phone: { aF: [-100, -134], aB: [12, 6], lF: [-6, 4], lB: [6, 4], head: [4, 0], face: "talk" },
  hold: { aF: [-70, -25], aB: [-55, -30], lF: [-10, 4], lB: [10, 4], face: "angry" },
  grabbed: { aF: [40, 25], aB: [50, 25], lF: [-10, 6], lB: [12, 6], head: [6, 8], face: "smug" },
  cuffed: { aF: [28, -20], aB: [34, -20], lF: [-4, 2], lB: [4, 2], head: [6, 10], face: "sad" },
  hug: { aF: [-75, -70], aB: [-62, -80], lF: [-6, 4], lB: [6, 4], face: "happy" },
};
// jacket = torso color, rim = head rim light, skin = head/limb ink
const CAST = {
  eli: { jacket: "#14b8a6", rim: C.xray, scale: 1 },
  nora: { jacket: C.nora, rim: C.nora, scale: 0.86, dress: true },
  crane: { jacket: "#2a2f3a", rim: C.danger, scale: 1.1, tie: C.danger },
  guard: { jacket: "#26385a", rim: "#7d8ba3", scale: 1.05, cap: "#1a2740" },
  ruiz: { jacket: "#6b4f35", rim: C.warm, scale: 1, hat: "#4a3420" },
  mayor: { jacket: "#3a2f55", rim: "#e0b84a", scale: 1.02, chain: "#e0b84a" },
  guest: { jacket: "#3a4458", rim: "#5f6d84", scale: 0.95, dim: true },
  tech: { jacket: "#3b4a5e", rim: C.warm, scale: 1, headset: C.warm },
  police: { jacket: "#1f3f8a", rim: "#3a6fd8", scale: 1.05, cap: "#14306e" },
  dad: { jacket: "#7a5a3a", rim: C.warm, scale: 1.05, mustache: true },
  patient: { jacket: "#7aa6d0", rim: "#7aa6d0", scale: 0.95 },
};
const INK = "#121826";
const HIP = -100, SHOULDER = -188, HEAD = -262;

const HALO = "rgba(200,215,240,0.45)";
function limb(ox, oy, len1, len2, [a1, a2], color, w, swing) {
  // upper segment rotates about (ox,oy); lower about the elbow/knee; static pose baked in.
  const ex = ox, ey = oy + len1;
  const sw = swing ? ` data-swing="${swing.amp},${swing.period},${swing.phase || 0}"` : "";
  return `<g transform="rotate(${a1} ${ox} ${oy})" data-rot="${a1}" data-org="${ox} ${oy}"${sw}><line x1="${ox}" y1="${oy}" x2="${ex}" y2="${ey}" stroke="${color}" stroke-width="${w}" stroke-linecap="round"/>` +
    `<g transform="rotate(${a2} ${ex} ${ey})" data-rot="${a2}" data-org="${ex} ${ey}"${swing?.lower ? ` data-swing="${swing.lower},${swing.period},${swing.phase || 0}"` : ""}><line x1="${ex}" y1="${ey}" x2="${ex}" y2="${ey + len2}" stroke="${color}" stroke-width="${w}" stroke-linecap="round"/><circle cx="${ex}" cy="${ey + len2}" r="${w * 0.62}" fill="${color}"/></g></g>`;
}

function face(hx, hy, mood, xrayEyes) {
  const eye = (x) => `<rect x="${x - 7}" y="${hy - 22}" width="14" height="24" rx="7" fill="#fff"/><circle cx="${x + 2}" cy="${hy - 9}" r="${xrayEyes ? 5 : 4.5}" fill="${xrayEyes ? C.xray : INK}"/>`;
  const e1 = hx + 4, e2 = hx + 28;
  let s = eye(e1) + eye(e2);
  // lids: head-colored shapes that cut the top of the eyes
  if (mood === "smug") s += `<rect x="${e1 - 9}" y="${hy - 26}" width="${e2 - e1 + 18}" height="12" fill="${INK}"/>`;
  if (mood === "sad") s += `<path d="M${e1 - 10} ${hy - 28} L${e1 + 9} ${hy - 20} L${e1 + 9} ${hy - 30} Z M${e2 + 10} ${hy - 28} L${e2 - 9} ${hy - 20} L${e2 - 9} ${hy - 30} Z" fill="${INK}"/>`;
  if (mood === "angry") s += `<path d="M${e1 - 10} ${hy - 20} L${e1 + 9} ${hy - 28} L${e1 - 10} ${hy - 30} Z M${e2 + 10} ${hy - 20} L${e2 - 9} ${hy - 28} L${e2 + 10} ${hy - 30} Z" fill="${INK}"/>`;
  const mx = hx + 16, my = hy + 18;
  if (mood === "talk") s += `<ellipse cx="${mx}" cy="${my}" rx="8" ry="6" fill="#fff" data-pulse="0.3"/>`;
  else if (mood === "sad") s += `<path d="M${mx - 9} ${my + 4} q9 -8 18 0" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  else if (mood === "smug") s += `<path d="M${mx - 8} ${my} q10 6 18 -4" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  else if (mood === "happy") s += `<path d="M${mx - 9} ${my - 2} q9 10 18 0" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  else s += `<line x1="${mx - 6}" x2="${mx + 6}" y1="${my}" y2="${my}" stroke="#fff" stroke-width="4" stroke-linecap="round"/>`;
  return s;
}

export function character(spec, xray, i) {
  const cast = CAST[spec.c];
  const p = POSES[spec.pose] || POSES.stand;
  const s = 1.3 * cast.scale * (spec.kid ? 0.72 : 1);
  const fc = spec.face || 1;
  const x = (spec.x / 100) * W;
  const [hdx, hdy] = p.head || [0, 0];
  const hx = hdx, hy = HEAD + hdy;
  const w = 15;
  const ink = xray ? "rgba(95,227,255,0.35)" : INK;
  const sw = p.swing ? { amp: p.swing, period: p.period } : null;
  const armSwing = sw ? { ...sw, phase: 0.5 } : p.gesture ? { amp: 12, period: 0.7, lower: 14 } : p.wave ? { amp: 4, period: 0.4, lower: 24 } : null;
  const op = cast.dim ? ' opacity="0.75"' : "";
  const jacketFill = xray ? "rgba(95,227,255,0.08)" : cast.jacket;
  const jacketStroke = xray ? ` stroke="${C.xray}" stroke-width="3"` : "";
  const torso = cast.dress
    ? `<path d="M-14 ${SHOULDER - 8} Q0 ${SHOULDER - 14} 14 ${SHOULDER - 8} L46 ${HIP + 12} Q0 ${HIP + 22} -46 ${HIP + 12} Z" fill="${jacketFill}"${jacketStroke}/>`
    : `<path d="M-24 ${SHOULDER - 6} Q0 ${SHOULDER - 16} 24 ${SHOULDER - 6} L30 ${HIP - 2} Q0 ${HIP + 8} -30 ${HIP - 2} Z" fill="${jacketFill}"${jacketStroke}/>`;
  let acc = "";
  if (!xray) {
    if (cast.tie) acc += `<path d="M-8 ${SHOULDER - 8} L0 ${SHOULDER + 4} L8 ${SHOULDER - 8} Z" fill="#e9eef6"/><path d="M0 ${SHOULDER} l-6 10 l6 44 l6 -44 z" fill="${cast.tie}"/>`;
    if (cast.chain) acc += `<path d="M-20 ${SHOULDER - 4} q20 40 40 0" stroke="${cast.chain}" stroke-width="6" fill="none"/><circle cx="0" cy="${SHOULDER + 32}" r="8" fill="${cast.chain}"/>`;
  }
  let hat = "";
  if (cast.cap) hat = `<path d="M${hx - 44} ${hy - 30} Q${hx} ${hy - 84} ${hx + 44} ${hy - 30} Z" fill="${cast.cap}"/><rect x="${hx + 10}" y="${hy - 36}" width="52" height="10" rx="5" fill="${cast.cap}"/>`;
  if (cast.hat) hat = `<rect x="${hx - 54}" y="${hy - 44}" width="108" height="10" rx="5" fill="${cast.hat}"/><path d="M${hx - 32} ${hy - 40} v-30 q32 -12 64 0 v30 z" fill="${cast.hat}"/>`;
  if (cast.headset) hat = `<path d="M${hx - 46} ${hy} a46 50 0 0 1 92 0" stroke="${cast.headset}" stroke-width="7" fill="none"/><rect x="${hx + 40}" y="${hy - 6}" width="12" height="22" rx="5" fill="${cast.headset}"/>`;
  if (cast.dress) hat = `<circle cx="${hx - 46}" cy="${hy - 22}" r="18" fill="${INK}"/><path d="M${hx - 58} ${hy - 12} q-22 30 -6 62" stroke="${INK}" stroke-width="14" fill="none" stroke-linecap="round"/><circle cx="${hx - 40}" cy="${hy - 30}" r="7" fill="${cast.rim}"/>`;
  if (spec.c === "crane") hat = `<path d="M${hx - 46} ${hy - 14} Q${hx - 20} ${hy - 72} ${hx + 44} ${hy - 30}" stroke="#4a5160" stroke-width="12" fill="none" stroke-linecap="round"/>`;
  const mood = spec.c === "eli" && xray ? "smug" : p.face || "neutral";
  const head = `<ellipse cx="${hx}" cy="${hy}" rx="48" ry="52" fill="${xray ? "rgba(6,10,19,0.55)" : INK}" stroke="${xray ? C.xray : HALO}" stroke-width="${xray ? 3 : 4}"/>` +
    `<path d="M${hx - 30} ${hy - 40} A48 52 0 0 0 ${hx - 34} ${hy + 36}" stroke="${cast.rim}" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.9"/>` +
    face(hx, hy, mood, spec.c === "eli" && xray) +
    (cast.mustache && !xray ? `<path d="M${hx + 6} ${hy + 10} q10 -6 20 0" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round"/>` : "");
  let skel = "";
  if (xray && !cast.dim) {
    skel = `<g class="skel"><line x1="0" y1="${SHOULDER - 6}" x2="0" y2="${HIP}" stroke="${C.xray}" stroke-width="5" stroke-dasharray="7 5"/>` +
      [0, 1, 2, 3].map((k) => `<path d="M-22 ${SHOULDER + 6 + k * 15} q22 10 44 0" stroke="${C.xray}" stroke-width="4" fill="none"/>`).join("") +
      `<path d="M8 ${SHOULDER + 18} c-10 -14 -26 -2 -12 12 l12 12 l12 -12 c14 -14 -2 -26 -12 -12 z" fill="${C.danger}" data-pulse="0.8"/></g>`;
  } else if (xray) {
    skel = `<path d="M8 ${SHOULDER + 18} c-10 -14 -26 -2 -12 12 l12 12 l12 -12 c14 -14 -2 -26 -12 -12 z" fill="${C.danger}" opacity="0.7" data-pulse="0.9"/>`;
  }
  const walk = spec.pose === "walk" || spec.pose === "run" ? ` data-walk="${spec.pose === "run" ? 200 : 110}"` : "";
  const bob = ` data-bob="${(i % 3) * 0.3}"`;
  // limbs: a light halo pass under everything, then the ink pass, so joints merge cleanly
  const limbs = (col, ww) => ({
    back: limb(-8, HIP, 52, 50, p.lB, col, ww, sw ? { ...sw, phase: 0.5 } : null) +
      limb(0, SHOULDER, 50, 46, p.aB, col, ww * 0.9, armSwing ? { ...armSwing, phase: 0.5 } : null) +
      limb(8, HIP, 52, 50, p.lF, col, ww, sw),
    front: limb(0, SHOULDER, 50, 46, p.aF, col, ww * 0.9, armSwing),
  });
  const halo = xray ? null : limbs(HALO, w + 7);
  const inkL = limbs(ink, w);
  const body = (halo ? halo.back + halo.front : "") + inkL.back + torso + acc + skel + hat + head + inkL.front;
  return `<g class="char"${op} transform="translate(${x} ${GROUND}) scale(${fc * s} ${s})"><g${walk}${bob}>${body}</g></g>`;
}

// ---------- full scene ----------
export function scene(v, seed) {
  const r = rng(seed);
  const bg = BG[v.bg](r, v);
  const chars = (v.chars || []).map((c, i) => character(c, false, i)).join("");
  let out = `<div class="layer">${svg(bg + chars, v.flash ? "flashback" : "")}</div>`;
  if (v.xray) {
    const r2 = rng(seed);
    const xchars = (v.chars || []).map((c, i) => character(c, true, i)).join("");
    out += `<div class="layer xray" data-xray="0.5">${svg(`<g class="xbg">${BG[v.bg](r2, v)}</g>${grid()}${xchars}`)}<div class="scan" data-scan="1"></div></div>`;
  }
  if (v.siren) out += `<div class="siren" data-pulse="0.5"></div>`;
  if (v.flash) out += `<div class="vignette"></div>`;
  if (v.label) out += `<div class="tag" data-in="up" data-delay="0.3">${v.label}</div>`;
  return out;
}
function grid() {
  let s = "";
  for (let x = 0; x <= W; x += 80) s += `<line x1="${x}" x2="${x}" y1="0" y2="${H}" stroke="${C.xray}" stroke-opacity="0.07"/>`;
  for (let y = 0; y <= H; y += 80) s += `<line y1="${y}" y2="${y}" x1="0" x2="${W}" stroke="${C.xray}" stroke-opacity="0.07"/>`;
  return s;
}

// ---------- tower ----------
export function tower(v, seed) {
  const r = rng(seed);
  const x = 960, base = 1000, h = 900, w = 240, floors = 60, fh = h / floors;
  const yOf = (f) => base - f * fh;
  const xr = v.xray;
  let s = sky("#050a16", "#121d34", "gt" + seed) + stars(r, 90) + skyline(r, 1000, "#0a1426", 120, 420, !xr);
  if (xr) s += grid();
  s += `<rect x="${x - w / 2}" y="${base - h}" width="${w}" height="${h}" fill="${xr ? "rgba(95,227,255,0.06)" : "#101c30"}" stroke="${xr ? C.xray : "#2c4466"}" stroke-width="4"/>`;
  for (let f = 1; f < floors; f++) {
    const y = yOf(f);
    s += xr ? `<line x1="${x - w / 2}" x2="${x + w / 2}" y1="${y}" y2="${y}" stroke="${C.xray}" stroke-opacity="0.35" stroke-width="2"/>`
      : `<line x1="${x - w / 2 + 10}" x2="${x + w / 2 - 10}" y1="${y - fh / 2}" y2="${y - fh / 2}" stroke="#ffd58a" stroke-opacity="${(0.08 + r() * 0.25).toFixed(2)}" stroke-width="${(fh * 0.55).toFixed(1)}"/>`;
  }
  if (xr) for (const cx of [x - w / 2 + 40, x, x + w / 2 - 40]) s += `<line x1="${cx}" x2="${cx}" y1="${base - h}" y2="${base}" stroke="${C.xray}" stroke-width="6" stroke-opacity="0.8"/>`;
  s += `<line x1="${x}" x2="${x}" y1="${base - h - 70}" y2="${base - h}" stroke="${xr ? C.xray : "#2c4466"}" stroke-width="6"/>`;
  if (v.plan) {
    s += `<path d="M300 ${base} H${x - w / 2} V${yOf(2)} H${x} V${yOf(58)} H${x + w / 2 + 80} V${base - h - 20}" stroke="${C.warm}" stroke-width="6" fill="none" stroke-dasharray="18 12" data-in="draw" data-delay="0.3" data-drawdur="3"/>`;
    s += `<path d="M1700 ${base} H${x + w / 2} V${yOf(31)} H${x - 60}" stroke="${C.danger}" stroke-width="5" fill="none" stroke-dasharray="10 10" data-in="draw" data-delay="1.5" data-drawdur="2"/>`;
  }
  let label = "";
  if (v.hl) {
    const y = v.hl >= 60 ? base - h + 4 : yOf(v.hl);
    const col = v.safe ? C.ok : v.hl === 58 ? C.nora : C.danger;
    const cx = v.hl === 31 ? x : x;
    s += `<rect x="${x - w / 2 - 14}" y="${y - fh - 6}" width="${w + 28}" height="${fh + 12}" fill="none" stroke="${col}" stroke-width="5" data-pulse="0.9"/>`;
    if (v.hl === 31) s += `<circle cx="${cx}" cy="${y - fh / 2}" r="16" fill="${col}" data-pulse="0.7"/>`;
    if (v.fail) s += `<path d="M${x} ${y} l-30 40 l22 30 l-34 60 l26 40 l-30 70" stroke="${C.danger}" stroke-width="7" fill="none" data-in="draw" data-delay="0.2" data-drawdur="1.2"/>`;
    const txt = v.hl === 31 ? (v.safe ? "COLUMN C · HOLDING" : "FLOOR 31 · COLUMN C") : v.hl === 58 ? "FLOOR 58 · NORA" : "ROOF";
    label = `<div class="callout" style="top:${(y / H) * 100 - 3}%;left:58%;color:${col};border-color:${col}" data-in="right" data-delay="0.4">${txt}</div>`;
  }
  return `<div class="layer${v.fail ? " shake" : ""}"${v.fail ? ' data-shake="1"' : ""}>${svg(s)}</div>${label}${xr ? '<div class="scan" data-scan="1"></div>' : ""}`;
}

// ---------- eye close-up ----------
export function eye(v) {
  const glow = v.state === "glow" || v.state === "off" ? C.xray : v.state === "warm" ? C.warm : "#8a96aa";
  let s = `<defs><radialGradient id="ir"><stop offset="0" stop-color="#000"/><stop offset="0.35" stop-color="${glow}"/><stop offset="1" stop-color="#0a1830"/></radialGradient><radialGradient id="halo"><stop offset="0" stop-color="${glow}" stop-opacity="0.5"/><stop offset="1" stop-color="${glow}" stop-opacity="0"/></radialGradient></defs><rect width="${W}" height="${H}" fill="${C.bg0}"/>`;
  if (v.state !== "glasses") s += `<circle cx="960" cy="540" r="520" fill="url(#halo)" data-pulse="1.4"/>`;
  if (v.state === "glow") for (let i = 0; i < 4; i++) s += `<circle cx="960" cy="540" r="260" fill="none" stroke="${C.xray}" stroke-width="3" data-ring="${i * 0.6}"/>`;
  s += `<path d="M360 540 Q960 120 1560 540 Q960 960 360 540 Z" fill="#f2efe9"/><g data-look="1"><circle cx="960" cy="540" r="190" fill="url(#ir)"/><circle cx="960" cy="540" r="78" fill="#020408"/><circle cx="1020" cy="480" r="30" fill="#fff" opacity="0.85"/></g>`;
  s += `<path d="M360 540 Q960 120 1560 540" stroke="#0a0f18" stroke-width="26" fill="none"/><path d="M360 540 Q960 960 1560 540" stroke="#0a0f18" stroke-width="14" fill="none"/>`;
  s += `<g data-blink="1"><path d="M330 540 Q960 60 1590 540 L1590 0 L330 0 Z" fill="${C.bg0}"/></g>`;
  if (v.state === "glasses" || v.state === "off") {
    const a = v.state === "off" ? ' data-glasses-off="0.6"' : "";
    s += `<g${a}><rect x="250" y="230" width="1420" height="620" rx="160" fill="#1a2232" fill-opacity="0.72" stroke="#0b0f17" stroke-width="44"/><line x1="0" x2="250" y1="420" y2="420" stroke="#0b0f17" stroke-width="40"/><line x1="1670" x2="1920" y1="420" y2="420" stroke="#0b0f17" stroke-width="40"/><path d="M380 330 l240 -40" stroke="#fff" stroke-opacity="0.18" stroke-width="22" stroke-linecap="round"/></g>`;
  }
  return `<div class="layer">${svg(s)}</div>`;
}

// ---------- objects ----------
function frame(inner, opts = {}) {
  return `<div class="layer">${svg(`<rect width="${W}" height="${H}" fill="${opts.bg || "#040910"}"/>${opts.grid === false ? "" : grid()}${inner}`)}</div>` +
    (opts.label ? `<div class="tag" data-in="up" data-delay="0.3">${opts.label}</div>` : "") + (opts.scan === false ? "" : `<div class="scan" data-scan="1"></div>`);
}
export function obj(v, seed) {
  const r = rng(seed);
  const X = C.xray;
  switch (v.o) {
    case "crack": {
      let s = `<rect x="760" y="0" width="400" height="${H}" fill="rgba(95,227,255,0.12)" stroke="${X}" stroke-width="6"/><rect x="700" y="0" width="520" height="70" fill="rgba(95,227,255,0.2)" stroke="${X}" stroke-width="4"/><rect x="700" y="1010" width="520" height="70" fill="rgba(95,227,255,0.2)" stroke="${X}" stroke-width="4"/>`;
      s += `<rect x="760" y="500" width="400" height="34" fill="rgba(255,181,71,0.25)" stroke="${C.warm}" stroke-width="3"/>`;
      let d = `M760 ${520}`;
      for (let x = 780; x <= 1160; x += 22) d += ` L${x} ${(512 + (r() - 0.5) * 34) | 0}`;
      s += `<path d="${d}" stroke="${C.danger}" stroke-width="9" fill="none" pathLength="1" data-in="draw" data-delay="0.4" data-drawdur="1.6"/><path d="${d}" stroke="${C.danger}" stroke-width="28" stroke-opacity="0.25" fill="none" data-pulse="1"/>`;
      return frame(s, { label: v.label });
    }
    case "bolts": {
      let s = `<rect x="560" y="200" width="800" height="680" rx="20" fill="rgba(95,227,255,0.08)" stroke="${X}" stroke-width="6"/>`;
      const hollow = new Set([0, 2, 3, 5, 6, 8, 9, 11]);
      for (let i = 0; i < 12; i++) {
        const cx = 700 + (i % 4) * 175, cy = 330 + Math.floor(i / 4) * 210;
        s += hollow.has(i)
          ? `<circle cx="${cx}" cy="${cy}" r="56" fill="none" stroke="${C.danger}" stroke-width="16" data-in="scale" data-delay="${(0.6 + i * 0.08).toFixed(2)}"/>`
          : `<circle cx="${cx}" cy="${cy}" r="56" fill="${X}" fill-opacity="0.85" data-in="scale" data-delay="${(0.6 + i * 0.08).toFixed(2)}"/>`;
      }
      s += `<text x="1420" y="400" class="mono" font-size="40" fill="${C.danger}" data-in="fade" data-delay="1.8">8 / 12 HOLLOW</text>`;
      return frame(s, { label: v.label });
    }
    case "wires": {
      let s = "";
      const n = v.live ? 40 : 7;
      for (let i = 0; i < n; i++) {
        const y = v.live ? 160 + i * 19 : 260 + i * 90;
        const live = v.live && i === 23;
        const col = live ? C.danger : X;
        if (v.cut) s += `<line x1="0" x2="900" y1="${y}" y2="${y}" stroke="${col}" stroke-width="16"/><line x1="1020" x2="${W}" y1="${y}" y2="${y}" stroke="${col}" stroke-width="16"/>`;
        else s += `<line x1="0" x2="${W}" y1="${y}" y2="${y}" stroke="${col}" stroke-width="${live ? 12 : v.live ? 6 : 16}" stroke-opacity="${live ? 1 : 0.55}"${live ? ' data-pulse="0.5"' : ""}/>`;
      }
      if (v.cut) s += `<rect x="900" y="200" width="120" height="680" fill="none" stroke="${C.danger}" stroke-width="5" stroke-dasharray="14 10" data-in="fade" data-delay="0.6"/><text x="960" y="170" text-anchor="middle" class="mono" font-size="40" fill="${C.danger}" data-in="fade" data-delay="0.8">CUT</text>`;
      if (v.live) s += `<text x="1500" y="${160 + 23 * 19 - 20}" class="mono" font-size="34" fill="${C.danger}" data-in="fade" data-delay="0.8">LIVE · #24</text>`;
      return frame(s, { label: v.label });
    }
    case "envelope": {
      let s = `<rect x="460" y="260" width="1000" height="560" rx="16" fill="rgba(95,227,255,0.06)" stroke="${X}" stroke-width="6"/><path d="M460 260 L960 600 L1460 260" stroke="${X}" stroke-width="5" fill="none"/>`;
      for (let i = 0; i < 6; i++) s += `<g data-in="right" data-delay="${(0.5 + i * 0.25).toFixed(2)}"><rect x="${560 + i * 22}" y="${330 + i * 66}" width="640" height="56" rx="6" fill="rgba(87,242,160,0.12)" stroke="${C.ok}" stroke-width="3"/><text x="${590 + i * 22}" y="${368 + i * 66}" class="mono" font-size="28" fill="${C.ok}">CR 4471 ${String(2201 + i).padStart(4, "0")} · SERIAL ${41 - i}</text></g>`;
      return frame(s, { label: v.label });
    }
    case "safe": {
      let s = `<rect x="600" y="180" width="720" height="720" rx="24" fill="#111a28" stroke="${X}" stroke-width="8"/>`;
      s += v.open
        ? `<g data-door="1"><rect x="640" y="220" width="640" height="640" rx="14" fill="#1a2638" stroke="${X}" stroke-width="5"/><circle cx="960" cy="540" r="120" fill="none" stroke="${X}" stroke-width="10"/></g><rect x="680" y="600" width="560" height="60" fill="#0c2a4d" stroke="${X}" stroke-width="3" data-in="fade" data-delay="0.6"/><rect x="700" y="540" width="520" height="56" fill="#3a2a1a" stroke="${C.warm}" stroke-width="3" data-in="fade" data-delay="0.7"/>`
        : `<rect x="640" y="220" width="640" height="640" rx="14" fill="#1a2638" stroke="${X}" stroke-width="5"/><g data-spin="300" data-org="960 540"><circle cx="960" cy="540" r="120" fill="none" stroke="${X}" stroke-width="10"/>${Array.from({ length: 24 }, (_, i) => `<line x1="960" y1="430" x2="960" y2="${i % 6 ? 448 : 462}" stroke="${X}" stroke-width="4" transform="rotate(${i * 15} 960 540)"/>`).join("")}</g><rect x="1180" y="500" width="40" height="80" rx="8" fill="${X}"/>`;
      return frame(s, { label: v.label });
    }
    case "dial": {
      let s = "";
      [0, 1, 2, 3].forEach((i) => {
        const cx = 420 + i * 360;
        s += `<g data-spin="${[-220, 160, -300, 140][i]}" data-org="${cx} 540" data-spindelay="${i * 0.8}"><circle cx="${cx}" cy="540" r="150" fill="rgba(95,227,255,0.06)" stroke="${X}" stroke-width="8"/><rect x="${cx - 18}" y="378" width="36" height="40" fill="#040910" stroke="${C.warm}" stroke-width="4" transform="rotate(${[220, -160, 300, -140][i]} ${cx} 540)"/></g>`;
      });
      s += `<line x1="200" x2="1720" y1="370" y2="370" stroke="${C.warm}" stroke-width="3" stroke-dasharray="12 10"/>`;
      return frame(s);
    }
    case "blueprint": {
      let s = `<rect x="0" y="0" width="${W}" height="${H}" fill="#0b2a52"/>`;
      for (let x = 0; x <= W; x += 60) s += `<line x1="${x}" x2="${x}" y1="0" y2="${H}" stroke="#5f9fe0" stroke-opacity="0.18"/>`;
      for (let y = 0; y <= H; y += 60) s += `<line y1="${y}" y2="${y}" x1="0" x2="${W}" stroke="#5f9fe0" stroke-opacity="0.18"/>`;
      s += `<rect x="560" y="120" width="420" height="840" fill="none" stroke="#cfe3ff" stroke-width="5" data-in="draw" data-drawdur="1.4"/>`;
      for (let i = 1; i < 12; i++) s += `<line x1="560" x2="980" y1="${120 + i * 70}" y2="${120 + i * 70}" stroke="#cfe3ff" stroke-width="2" stroke-opacity="0.6"/>`;
      s += `<line x1="770" x2="770" y1="120" y2="960" stroke="${C.danger}" stroke-width="6" data-in="draw" data-delay="0.8"/>`;
      s += `<g data-in="fade" data-delay="1"><text x="1080" y="300" class="mono" font-size="34" fill="#cfe3ff">COLUMN C — LOAD LIMIT</text><text x="1080" y="370" class="mono" font-size="52" fill="${C.danger}">FILED: 30 T</text><text x="1080" y="440" class="mono" font-size="52" fill="${C.danger}">REAL:  9 T</text></g>`;
      s += `<g data-in="scale" data-delay="1.6"><rect x="1100" y="540" width="420" height="140" rx="10" fill="none" stroke="${C.danger}" stroke-width="10" transform="rotate(-8 1310 610)"/><text x="1310" y="640" text-anchor="middle" class="display" font-size="110" fill="${C.danger}" transform="rotate(-8 1310 610)">THE REAL ONE</text></g>`;
      return frame(s, { grid: false, bg: "#0b2a52" });
    }
    case "fireworks": {
      let s = crates(820, 600) + `<text x="1010" y="690" text-anchor="middle" class="mono" font-size="40" fill="${C.warm}" data-in="fade" data-delay="0.5">400 KG + 2 T SPEAKERS</text>`;
      s += `<line x1="1010" x2="1010" y1="720" y2="850" stroke="${C.danger}" stroke-width="10" data-in="draw" data-delay="0.9"/><path d="M980 830 l30 40 l30 -40" stroke="${C.danger}" stroke-width="10" fill="none" data-in="fade" data-delay="1.4"/><text x="1080" y="860" class="mono" font-size="32" fill="${C.danger}" data-in="fade" data-delay="1.4">COLUMN C</text>`;
      return frame(s, { label: v.label });
    }
    case "chest": {
      let s = `<line x1="960" x2="960" y1="140" y2="960" stroke="${X}" stroke-width="18"/>`;
      for (let i = 0; i < 8; i++) s += `<path d="M960 ${220 + i * 80} q-300 30 -330 140" stroke="${X}" stroke-width="12" fill="none" stroke-opacity="0.8"/><path d="M960 ${220 + i * 80} q300 30 330 140" stroke="${X}" stroke-width="12" fill="none" stroke-opacity="0.8"/>`;
      s += `<ellipse cx="1110" cy="480" rx="80" ry="64" fill="#000" opacity="0.85" data-in="fade" data-delay="0.8"/><ellipse cx="1110" cy="480" rx="120" ry="100" fill="none" stroke="${C.danger}" stroke-width="5" stroke-dasharray="14 10" data-in="scale" data-delay="1.2"/>`;
      return frame(s);
    }
    case "heart": {
      let s = `<g data-beat="0.75"><path d="M960 760 C620 520 700 260 900 300 C940 310 955 340 960 360 C965 340 980 310 1020 300 C1220 260 1300 520 960 760 Z" fill="${C.danger}" fill-opacity="0.85"/></g>`;
      s += `<path d="M0 900 H600 l40 -80 l40 160 l40 -220 l40 140 H1100 l40 -80 l40 160 l40 -220 l40 140 H${W}" stroke="${C.ok}" stroke-width="6" fill="none" pathLength="1" data-in="draw" data-drawdur="2.4"/>`;
      return frame(s);
    }
    case "phone": {
      const scr = v.msg === "blank" ? "#000" : "#0d1626";
      let s = `<rect width="${W}" height="${H}" fill="#070b14"/><g data-shakeel="${v.ring ? 1 : ""}"><rect x="760" y="80" width="400" height="920" rx="60" fill="#1b2433" stroke="#3a4a66" stroke-width="10"/><rect x="790" y="140" width="340" height="800" rx="30" fill="${scr}"/>`;
      if (v.msg !== "blank") {
        s += `<text x="960" y="330" text-anchor="middle" class="mono" font-size="40" fill="${C.ink}">${v.name}</text>`;
        if (v.msg === "incoming" || v.msg === "call") s += `<text x="960" y="390" text-anchor="middle" class="mono" font-size="26" fill="${C.dim}">${v.msg === "call" ? "00:41" : "incoming call…"}</text><circle cx="880" cy="820" r="46" fill="${C.danger}"/><circle cx="1040" cy="820" r="46" fill="${C.ok}" data-pulse="0.6"/>`;
        if (v.msg === "voice message") s += Array.from({ length: 22 }, (_, i) => `<rect x="${822 + i * 13}" y="${520 - ((Math.sin(i * 1.7) + 1.4) * 40) | 0}" width="7" height="${((Math.sin(i * 1.7) + 1.4) * 80) | 0}" rx="3" fill="${C.nora}" data-pulse="${(0.4 + (i % 4) * 0.1).toFixed(1)}"/>`).join("");
        if (v.msg === "photo") s += `<rect x="810" y="420" width="300" height="300" fill="none" stroke="${C.ink}" stroke-width="4"/><circle cx="960" cy="860" r="44" fill="none" stroke="${C.ink}" stroke-width="8"/><rect x="790" y="140" width="340" height="800" rx="30" fill="#fff" data-flashel="0.8"/>`;
      }
      s += `</g>`;
      return frame(s, { grid: false, scan: false });
    }
    case "send": {
      let s = `<rect x="200" y="300" width="300" height="520" rx="40" fill="#1b2433" stroke="#3a4a66" stroke-width="8"/><text x="350" y="580" text-anchor="middle" class="mono" font-size="30" fill="${C.ok}">SENT</text>`;
      for (let i = 0; i < 6; i++) {
        const y = 170 + i * 140;
        s += `<path d="M520 560 C800 560 900 ${y + 40} 1200 ${y + 40}" stroke="${X}" stroke-width="4" fill="none" pathLength="1" data-in="draw" data-delay="${(0.3 + i * 0.25).toFixed(2)}"/><g data-in="right" data-delay="${(0.8 + i * 0.25).toFixed(2)}"><rect x="1220" y="${y}" width="460" height="80" rx="10" fill="rgba(95,227,255,0.08)" stroke="${X}" stroke-width="3"/><text x="1250" y="${y + 52}" class="mono" font-size="30" fill="${C.ink}">${["CITY NEWS DESK", "CHANNEL 7", "THE DAILY LEDGER", "METRO RADIO", "NEWSWIRE", "BALLROOM SCREEN"][i]} ✓</text></g>`;
      }
      return frame(s);
    }
    case "drawing": {
      let s = `<rect width="${W}" height="${H}" fill="#120d0a"/><g${v.folded ? ' data-unfold="1"' : ""}><rect x="420" y="120" width="1080" height="840" fill="#f4ecd8" transform="rotate(-2 960 540)"/>`;
      s += `<g transform="translate(0 -70) rotate(-2 960 540)" stroke="#3a3a8a" stroke-width="10" stroke-linecap="round" fill="none"><circle cx="760" cy="420" r="80"/><line x1="760" x2="760" y1="500" y2="720"/><line x1="760" x2="660" y1="560" y2="640"/><line x1="760" x2="870" y1="560" y2="620"/><line x1="760" x2="690" y1="720" y2="840"/><line x1="760" x2="840" y1="720" y2="840"/></g>`;
      s += `<g transform="translate(0 -70) rotate(-2 960 540)"><circle cx="735" cy="410" r="14" fill="${C.nora}"/><circle cx="785" cy="410" r="14" fill="${C.nora}"/><path d="M735 410 l-160 -60 M735 410 l-170 10 M785 410 l170 -60 M785 410 l180 10" stroke="${C.nora}" stroke-width="8" data-pulse="1.2"/><path d="M1180 420 l20 -60 l20 60 l-50 -36 h60 z" fill="#e05a5a"/></g>`;
      const msg = "my brother can see everything";
      s += `<g transform="translate(0 -45) rotate(-3 960 540)" data-layout-allow-overlap>${[...msg].map((ch, i) => `<text x="${520 + i * 31}" y="${890 + Math.sin(i * 1.3) * 8}" font-size="54" class="kid" fill="#c0392b" transform="rotate(${(Math.sin(i * 2.1) * 6).toFixed(1)} ${520 + i * 31} 890)">${ch === " " ? "" : ch}</text>`).join("")}</g></g>`;
      return frame(s, { grid: false, scan: false, bg: "#120d0a" });
    }
  }
  return frame("");
}
