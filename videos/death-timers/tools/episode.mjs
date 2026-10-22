// Episode additions for "What If You Knew Exactly When Everyone Would Die?"
// Registers cast members, backgrounds and close-up objects with the shared art module.
// Accent for this episode: rose red = death timers.
import { BG, C, CAST, OBJ, W, H, GROUND, character, frame, ground, rng, sky, skyline, stars } from "./art.mjs";

export const ACCENT = "#ff6b81";
const R = ACCENT;

Object.assign(CAST, {
  lena: { jacket: "#be123c", rim: R, scale: 0.96 },
  theo: { jacket: "#16a34a", rim: "#86efac", scale: 0.8 },
  walt: { jacket: "#334155", rim: "#93c5fd", scale: 1.08, cap: "#1e3a5f", mustache: true },
  pike: { jacket: "#3f3f46", rim: "#a1a1aa", scale: 1.05, slick: "#52525b", tie: "#a1a1aa" },
  fan: { jacket: "#2563eb", rim: "#60a5fa", scale: 0.95 },
});

// ---------- backgrounds ----------
function tankCar(x, y, w = 360) {
  return `<rect x="${x}" y="${y}" width="${w}" height="120" rx="60" fill="#2b2f36" stroke="#4b5563" stroke-width="5"/><rect x="${x + 20}" y="${y + 120}" width="${w - 40}" height="16" fill="#1f2328"/>` +
    `<circle cx="${x + 60}" cy="${y + 150}" r="20" fill="#111"/><circle cx="${x + w - 60}" cy="${y + 150}" r="20" fill="#111"/>` +
    `<g transform="translate(${x + w / 2} ${y + 60}) rotate(45)"><rect x="-26" y="-26" width="52" height="52" fill="#e5e7eb" stroke="#111" stroke-width="3"/></g><text x="${x + w / 2}" y="${y + 66}" text-anchor="middle" class="mono" font-size="16" font-weight="700" fill="#111">1017</text>`;
}
function rails(y) {
  return `<rect x="0" y="${y}" width="${W}" height="10" fill="#4b5563"/><rect x="0" y="${y + 22}" width="${W}" height="10" fill="#4b5563"/>` +
    Array.from({ length: 40 }, (_, i) => `<rect x="${i * 50}" y="${y - 6}" width="22" height="44" fill="#3a2a1a"/>`).join("");
}
function floodlight(x, y) {
  return `<line x1="${x}" x2="${x}" y1="${y}" y2="${GROUND}" stroke="#2a3446" stroke-width="12"/><rect x="${x - 50}" y="${y - 40}" width="100" height="40" fill="#e9eef6"/><path d="M${x - 50} ${y} L${x - 260} ${GROUND} L${x + 260} ${GROUND} L${x + 50} ${y} Z" fill="#e9eef6" opacity="0.05"/>`;
}
Object.assign(BG, {
  stadium: (r) => sky("#070a14", "#151b2e", "gs") + stars(r, 50) +
    `<path d="M200 ${GROUND - 40} Q960 120 1720 ${GROUND - 40} Z" fill="#1b2232" stroke="#334155" stroke-width="8"/>` +
    Array.from({ length: 220 }, () => `<circle cx="${(400 + r() * 1120) | 0}" cy="${(380 + r() * 380) | 0}" r="4" fill="${["#e9eef6", "#60a5fa", "#f87171", "#fbbf24"][(r() * 4) | 0]}" opacity="0.55"/>`).join("") +
    floodlight(260, 160) + floodlight(1660, 160) +
    `<rect x="830" y="190" width="260" height="110" rx="8" fill="#05080f" stroke="#475569" stroke-width="6"/><text x="960" y="262" text-anchor="middle" class="display" font-size="60" fill="#fbbf24">HOME 14 · 10</text>` +
    ground("#0c111c"),
  crossing: (r, o) => sky("#0a0f1c", "#18213a", "gx") + stars(r, 40) + skyline(r, 640, "#0b1426", 80, 240) +
    rails(760) + (o.train ? tankCar(-120, 610) + tankCar(270, 610) + tankCar(660, 610) + tankCar(1050, 610) + tankCar(1440, 610) : "") +
    `<line x1="1720" x2="1720" y1="${GROUND}" y2="520" stroke="#cbd5e1" stroke-width="10"/><g data-pulse="0.6"><circle cx="1690" cy="540" r="16" fill="${C.danger}"/><circle cx="1750" cy="540" r="16" fill="${C.danger}"/></g><rect x="1180" y="580" width="540" height="18" fill="#e9eef6" stroke="${C.danger}" stroke-width="4" stroke-dasharray="40 40"/>` +
    ground("#0b1220", GROUND + 30),
  station: (r) => sky("#0b1020", "#141c30", "gp") + skyline(r, 560, "#0b1426", 60, 200) +
    `<rect x="0" y="640" width="${W}" height="60" fill="#3b4252"/><rect x="0" y="640" width="${W}" height="10" fill="#fbbf24"/>` +
    `<rect x="980" y="380" width="900" height="260" rx="20" fill="#1e3a5f" stroke="#64748b" stroke-width="6"/><rect x="1040" y="420" width="220" height="110" fill="#fbbf24" opacity="0.4"/><circle cx="1830" cy="560" r="24" fill="#fef3c7"/>` +
    `<rect x="160" y="200" width="300" height="80" fill="#05080f" stroke="#475569" stroke-width="4"/><text x="310" y="252" text-anchor="middle" class="mono" font-size="32" fill="#fbbf24">MILLBROOK</text>` +
    ground("#2a303c", GROUND),
  cab: () => sky("#0b0f17", "#0b0f17", "gc") +
    `<rect x="160" y="100" width="1600" height="420" rx="30" fill="#0b1426" stroke="#334155" stroke-width="16"/><path d="M160 520 L960 300 L1760 520" stroke="#4b5563" stroke-width="6" fill="none"/>` +
    `<line x1="760" x2="940" y1="520" y2="300" stroke="#64748b" stroke-width="6"/><line x1="1160" x2="980" y1="520" y2="300" stroke="#64748b" stroke-width="6"/>` +
    `<rect x="160" y="600" width="1600" height="300" fill="#1f2937"/><circle cx="1500" cy="700" r="70" fill="#05080f" stroke="#94a3b8" stroke-width="6"/><line x1="1500" y1="700" x2="1450" y2="660" stroke="${C.danger}" stroke-width="6"/><rect x="420" y="640" width="60" height="160" rx="10" fill="${C.danger}"/>`,
  traintop: (r) => sky("#05070d", "#111827", "gt") + stars(r, 90) + skyline(r, 700, "#0a1220", 60, 260) +
    Array.from({ length: 5 }, (_, i) => `<rect x="${i * 420 - 40}" y="760" width="400" height="160" rx="70" fill="#2b2f36" stroke="#4b5563" stroke-width="5"/><g transform="translate(${i * 420 + 160} 740)"><circle r="34" fill="none" stroke="#9ca3af" stroke-width="8"/><line x1="-34" x2="34" y1="0" y2="0" stroke="#9ca3af" stroke-width="6"/><line x1="0" x2="0" y1="-34" y2="34" stroke="#9ca3af" stroke-width="6"/><line x1="0" x2="0" y1="34" y2="80" stroke="#9ca3af" stroke-width="8"/></g>`).join("") +
    Array.from({ length: 24 }, (_, i) => `<line x1="${(i * 97) % W}" x2="${((i * 97) % W) + 220}" y1="${120 + ((i * 53) % 500)}" y2="${120 + ((i * 53) % 500)}" stroke="#94a3b8" stroke-opacity="0.18" stroke-width="3"/>`).join(""),
  diner: () => sky("#1a0f14", "#120b0e", "gd") +
    `<rect x="120" y="120" width="1680" height="360" fill="#0d1a2a" stroke="#3f2a2a" stroke-width="14"/><text x="1500" y="230" text-anchor="middle" class="display" font-size="80" fill="${R}" data-pulse="1.6">OPEN 24H</text>` +
    `<rect x="0" y="640" width="${W}" height="80" fill="#7f1d1d"/><rect x="0" y="630" width="${W}" height="16" fill="#e5e7eb"/>` +
    [300, 700, 1100, 1500].map((x) => `<rect x="${x - 6}" y="720" width="12" height="160" fill="#9ca3af"/><ellipse cx="${x}" cy="716" rx="46" ry="12" fill="#b91c1c"/>`).join("") +
    ground("#1a1214"),
});

// ---------- close-up objects ----------
Object.assign(OBJ, {
  placard: (v) => frame(`<g transform="translate(960 470) rotate(45)"><rect x="-260" y="-260" width="520" height="520" fill="#e5e7eb" stroke="#111" stroke-width="14"/><rect x="-230" y="-230" width="460" height="460" fill="none" stroke="#111" stroke-width="5"/></g><text x="960" y="520" text-anchor="middle" class="display" font-size="190" fill="#111">1017</text>` +
    `<text x="960" y="880" text-anchor="middle" class="mono" font-size="40" fill="${R}" data-in="up" data-delay="0.5">CHLORINE · 30 TANK CARS</text>`, { grid: false, scan: false, label: v.label }),
  gauge: (v) => {
    let s = `<circle cx="960" cy="500" r="320" fill="#0b1220" stroke="#94a3b8" stroke-width="14"/>`;
    for (let i = 0; i <= 10; i++) { const a = -120 + i * 24; s += `<line x1="960" y1="200" x2="960" y2="${i % 5 ? 236 : 256}" stroke="#cbd5e1" stroke-width="6" transform="rotate(${a} 960 500)"/>`; }
    s += `<path d="M ${960 + 280 * Math.sin(-120 * Math.PI / 180)} ${500 - 280 * Math.cos(-120 * Math.PI / 180)} A280 280 0 0 1 ${960 + 280 * Math.sin(-72 * Math.PI / 180)} ${500 - 280 * Math.cos(-72 * Math.PI / 180)}" stroke="${C.danger}" stroke-width="22" fill="none"/>`;
    s += `<g data-spin="-70" data-org="960 500"><line x1="960" y1="500" x2="960" y2="230" stroke="${R}" stroke-width="12" stroke-linecap="round" transform="rotate(10 960 500)"/></g><circle cx="960" cy="500" r="26" fill="#cbd5e1"/>`;
    s += `<text x="960" y="700" text-anchor="middle" class="mono" font-size="40" fill="#cbd5e1">BRAKE PIPE · PSI</text>`;
    return frame(s, { scan: false, label: v.label });
  },
  map: (v) => {
    let s = `<rect width="${W}" height="${H}" fill="#0b1220"/><path d="M0 200 C400 260 700 120 1000 260 S1600 380 ${W} 300" stroke="#1d4ed8" stroke-width="70" fill="none" opacity="0.7"/>`;
    s += `<ellipse cx="900" cy="600" rx="140" ry="100" fill="#1f2937" stroke="#94a3b8" stroke-width="6"/><text x="900" y="612" text-anchor="middle" class="mono" font-size="28" fill="#e5e7eb">STADIUM</text>`;
    s += `<path d="M0 860 L700 860 Q1120 860 1180 560 L1260 0" stroke="#9ca3af" stroke-width="10" fill="none" stroke-dasharray="26 12"/>`;
    if (v.radius) s += `<circle cx="1040" cy="660" r="420" fill="${R}" fill-opacity="0.08" stroke="${R}" stroke-width="5" stroke-dasharray="20 14" data-in="scale" data-delay="0.4"/><text x="1440" y="300" class="mono" font-size="30" fill="${R}" data-in="fade" data-delay="0.8">9:47 PM ZONE</text>`;
    if (v.bend) s += `<circle cx="1150" cy="720" r="40" fill="none" stroke="${C.danger}" stroke-width="8" data-pulse="0.6"/><text x="1210" y="800" class="mono" font-size="30" fill="${C.danger}">THE BEND · 9:44</text>`;
    if (v.wind) s += `<g data-in="right" data-delay="0.5"><path d="M1600 760 L1150 680" stroke="#e5e7eb" stroke-width="10" fill="none"/><path d="M1180 650 L1130 676 L1172 712" stroke="#e5e7eb" stroke-width="10" fill="none"/><text x="1500" y="820" class="mono" font-size="30" fill="#e5e7eb">WIND</text></g>`;
    if (v.train) s += `<g data-walk="300"><rect x="200" y="842" width="160" height="36" rx="10" fill="#fbbf24"/></g>`;
    s += `<text x="300" y="140" class="mono" font-size="30" fill="#93c5fd">RIVER</text>`;
    return frame(s, { grid: false, scan: false, label: v.label });
  },
  handbrake: (v) => frame(`<g data-spin="${v.spin || 540}" data-org="960 460"><circle cx="960" cy="460" r="260" fill="none" stroke="#9ca3af" stroke-width="30"/>${[0, 45, 90, 135].map((a) => `<line x1="960" y1="200" x2="960" y2="720" stroke="#9ca3af" stroke-width="18" transform="rotate(${a} 960 460)"/>`).join("")}</g><circle cx="960" cy="460" r="40" fill="#6b7280"/>` +
    `<text x="960" y="860" text-anchor="middle" class="mono" font-size="40" fill="${R}" data-in="up" data-delay="0.6">${v.caption || "HANDBRAKE · CAR 12"}</text>`, { scan: false, label: v.label }),
  crowdtimers: (v) => {
    const r = rng(9);
    let s = `<rect width="${W}" height="${H}" fill="#070a14"/>`;
    const heads = [];
    for (let row = 0; row < 3; row++) for (let i = 0; i < 7; i++) heads.push([150 + i * 255 + (row % 2) * 100, 230 + row * 205]);
    heads.forEach(([x, y], i) => {
      const t = v.flip ? `${(12 + ((i * 37) % 70))} YRS` : v.time || "9:47 PM";
      const col = v.flip ? "#86efac" : R;
      s += `<circle cx="${x}" cy="${y + 70}" r="44" fill="#121826" stroke="rgba(200,215,240,0.45)" stroke-width="4"/><rect x="${x - 34}" y="${y + 116}" width="68" height="90" rx="20" fill="${["#2563eb", "#be123c", "#16a34a", "#a16207"][i % 4]}"/>` +
        `<g data-in="${v.flip ? "scale" : "fade"}" data-delay="${(0.2 + (v.flip ? i * 0.05 : r() * 0.6)).toFixed(2)}"><rect x="${x - 76}" y="${y - 20}" width="152" height="42" rx="8" fill="rgba(12,4,10,0.85)" stroke="${col}" stroke-width="3"/><text x="${x}" y="${y + 10}" text-anchor="middle" class="mono" font-size="26" font-weight="700" fill="${col}">${t}</text></g>`;
    });
    return frame(s, { grid: false, scan: false, label: v.label });
  },
  mirror: () => {
    const lena = character({ c: "lena", pose: "stand", x: 50 }, false, 0);
    return frame(`<rect width="${W}" height="${H}" fill="#0d0a0c"/><rect x="560" y="60" width="800" height="900" rx="400" fill="#1a2232" stroke="#9ca3af" stroke-width="18"/>` +
      `<g transform="translate(0 40)">${lena}</g><rect x="890" y="160" width="140" height="44" rx="8" fill="none" stroke="${R}" stroke-width="3" stroke-dasharray="10 8"/><text x="960" y="192" text-anchor="middle" class="mono" font-size="28" fill="${R}">?</text>`, { grid: false, scan: false });
  },
  speed: (v) => frame(`<rect x="300" y="300" width="520" height="520" rx="30" fill="#e5e7eb"/><rect x="330" y="330" width="460" height="460" rx="20" fill="none" stroke="#111" stroke-width="10"/><text x="560" y="480" text-anchor="middle" class="display" font-size="90" fill="#111">SPEED</text><text x="560" y="700" text-anchor="middle" class="display" font-size="220" fill="#111">25</text>` +
    `<g data-in="right" data-delay="0.5"><text x="1380" y="500" text-anchor="middle" class="mono" font-size="40" fill="#cbd5e1">TRAIN</text><text x="1380" y="700" text-anchor="middle" class="display" font-size="240" fill="${C.danger}">50</text></g>`, { scan: false, label: v.label }),
});
