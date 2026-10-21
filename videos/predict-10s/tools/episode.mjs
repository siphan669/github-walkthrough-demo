// Episode additions for "What If You Could Predict Everything 10 Seconds Before It Happened?"
// Registers cast members, backgrounds and close-up objects with the shared art module.
// Accent for this episode: amber (C.warm) = future sight.
import { BG, C, CAST, OBJ, H, W, GROUND, frame, ground, rng, sky, skyline, stars, chandelier, windowsRow } from "./art.mjs";

const A = C.warm;

Object.assign(CAST, {
  kai: { jacket: "#f59e0b", rim: A, scale: 1 },
  rosa: { jacket: "#7c5aa6", rim: "#c4b5fd", scale: 0.92, bun: "#cbd5e1", glasses: "#e5e7eb" },
  vale: { jacket: "#5b1e2d", rim: "#e0b84a", scale: 1.1, slick: "#3a3f4a", tie: "#e0b84a" },
  thug: { jacket: "#2a2f3a", rim: "#7d8ba3", scale: 1.08 },
  detective: { jacket: "#8a6a44", rim: A, scale: 1.02, hat: "#3a2a18" },
  nurse: { jacket: "#60a5fa", rim: "#93c5fd", scale: 0.95 },
  dealer: { jacket: "#1f2937", rim: "#9ca3af", scale: 1, tie: C.danger },
});

// ---------- backgrounds ----------
Object.assign(BG, {
  cardroom: () => sky("#0d0b0a", "#17120d", "gc") +
    `<path d="M960 0 L640 620 L1280 620 Z" fill="${A}" opacity="0.07"/><line x1="960" x2="960" y1="0" y2="120" stroke="#3a3020" stroke-width="5"/><path d="M900 120 h120 l30 40 h-180 z" fill="#2a2418"/><ellipse cx="960" cy="166" rx="60" ry="10" fill="${A}"/>` +
    `<ellipse cx="960" cy="${GROUND - 40}" rx="620" ry="120" fill="#0f3d24" stroke="#5a3a1a" stroke-width="22"/>` +
    [[700, 3], [760, 5], [1150, 4], [1210, 2]].map(([x, n]) => Array.from({ length: n }, (_, k) => `<ellipse cx="${x}" cy="${GROUND - 60 - k * 9}" rx="26" ry="8" fill="${k % 2 ? C.danger : "#e9eef6"}" stroke="#111" stroke-width="2"/>`).join("")).join("") +
    ground("#0c0a08", GROUND + 60),
  hospitalroom: () => sky("#0b1220", "#121b2c", "ghr") +
    `<rect x="1260" y="140" width="420" height="360" fill="#0d2240" stroke="#33445f" stroke-width="12"/><circle cx="1560" cy="230" r="40" fill="#e9eef6" opacity="0.8"/>` +
    `<rect x="160" y="240" width="200" height="640" fill="#1b2434" stroke="#33445f" stroke-width="6"/><rect x="200" y="290" width="120" height="50" rx="6" fill="#0b1220"/><text x="260" y="327" text-anchor="middle" class="mono" font-size="32" fill="${C.ink}">412</text>` +
    `<rect x="760" y="640" width="560" height="70" rx="14" fill="#c9d6e6"/><rect x="760" y="600" width="140" height="60" rx="20" fill="#e9eef6"/><rect x="760" y="710" width="22" height="170" fill="#6a849c"/><rect x="1298" y="710" width="22" height="170" fill="#6a849c"/>` +
    `<rect x="1380" y="560" width="190" height="130" rx="10" fill="#05080f" stroke="#33445f" stroke-width="6"/><path d="M1395 630 h40 l12 -30 l14 60 l12 -40 l10 10 h60" stroke="${C.ok}" stroke-width="5" fill="none" data-pulse="0.9"/><line x1="1475" x2="1475" y1="690" y2="${GROUND}" stroke="#33445f" stroke-width="10"/>` +
    ground("#101826"),
  exchange: () => sky("#15130f", "#0c0b09", "gx") +
    [220, 700, 1220, 1700].map((x) => `<rect x="${x - 36}" y="110" width="72" height="${GROUND - 110}" fill="#26221a" stroke="#4a4030" stroke-width="4"/>`).join("") +
    chandelier(960, 90) + `<rect x="700" y="230" width="520" height="90" fill="#1a170f" stroke="#e0b84a" stroke-width="4"/><text x="960" y="292" text-anchor="middle" class="display" font-size="64" fill="#e0b84a" letter-spacing="10">MERIDIAN</text>` +
    ground("#14110c"),
  vault: (r, o) => sky("#0c1117", "#06090d", "gv") +
    Array.from({ length: 8 }, (_, i) => `<line x1="${i * 260}" x2="${i * 260}" y1="0" y2="${GROUND}" stroke="#1d2733" stroke-width="6"/>`).join("") +
    `<circle cx="1440" cy="520" r="300" fill="#1b2430" stroke="#4a5a6e" stroke-width="18"/><circle cx="1440" cy="520" r="230" fill="none" stroke="#33404f" stroke-width="10"/>` +
    Array.from({ length: 8 }, (_, i) => `<circle cx="${1440 + Math.cos(i * Math.PI / 4) * 265}" cy="${520 + Math.sin(i * Math.PI / 4) * 265}" r="16" fill="#5a6a7e"/>`).join("") +
    `<g data-spin="${o.open ? 180 : 0}" data-org="1440 520"><circle cx="1440" cy="520" r="70" fill="none" stroke="#8aa0b8" stroke-width="12"/><line x1="1440" x2="1440" y1="450" y2="590" stroke="#8aa0b8" stroke-width="12"/><line x1="1370" x2="1510" y1="520" y2="520" stroke="#8aa0b8" stroke-width="12"/></g>` +
    `<rect x="1350" y="150" width="180" height="56" rx="6" fill="#05080f" stroke="${C.danger}" stroke-width="3"/><text x="1440" y="190" text-anchor="middle" class="mono" font-size="32" fill="${C.danger}">${o.time || "02:59:50"}</text>` +
    (o.lasers ? Array.from({ length: 7 }, (_, i) => `<line x1="0" x2="1100" y1="${330 + i * 80}" y2="${330 + ((i * 37) % 5) * 70}" stroke="${C.danger}" stroke-width="4" opacity="0.85" data-pulse="${(0.6 + i * 0.1).toFixed(1)}"/>`).join("") : "") +
    ground("#080b10"),
  hallnight: () => sky("#0d1422", "#09101b", "gn") +
    [300, 900, 1500].map((x) => `<rect x="${x - 90}" y="40" width="180" height="14" fill="#cfe0f5" opacity="0.6"/>`).join("") +
    [560, 1240].map((x, i) => `<rect x="${x - 80}" y="400" width="160" height="480" fill="#1b2434" stroke="#33445f" stroke-width="5"/><rect x="${x - 50}" y="440" width="100" height="44" rx="5" fill="#0b1220"/><text x="${x}" y="474" text-anchor="middle" class="mono" font-size="28" fill="${C.ink}">${i ? "412" : "411"}</text>`).join("") +
    ground("#0f1624"),
});
const homeBG = BG.home;
BG.home = (r, o) => homeBG(r, o) + (o.cake ? `<rect x="1180" y="700" width="420" height="24" fill="#5a3a2a"/><rect x="1200" y="724" width="20" height="156" fill="#5a3a2a"/><rect x="1560" y="724" width="20" height="156" fill="#5a3a2a"/><rect x="1300" y="610" width="180" height="90" rx="12" fill="#f4d6e0" stroke="#c98aa0" stroke-width="5"/>${[1340, 1390, 1440].map((x) => `<line x1="${x}" x2="${x}" y1="610" y2="570" stroke="#fff" stroke-width="7"/><ellipse cx="${x}" cy="560" rx="7" ry="12" fill="${A}" data-pulse="0.4"/>`).join("")}` : "");

// ---------- close-up objects ----------
const plus10 = (x = 1700, y = 120) => `<text x="${x}" y="${y}" text-anchor="end" class="mono" font-size="44" fill="${A}" data-pulse="0.8">+10s</text>`;

Object.assign(OBJ, {
  coin: (v) => {
    const coin = (x, y, op, label) => `<g opacity="${op}"><circle cx="${x}" cy="${y}" r="190" fill="#c99a2e" stroke="#7a5a14" stroke-width="16"/><circle cx="${x}" cy="${y}" r="150" fill="none" stroke="#f3d27a" stroke-width="6"/><text x="${x}" y="${y + 40}" text-anchor="middle" class="display" font-size="130" fill="#7a5a14">${label}</text></g>`;
    return frame(`<g data-flip="0.2">${coin(760, 520, 1, "H")}</g><g data-in="fade" data-delay="0.1">${coin(1240, 470, 0.35, "H")}<circle cx="1240" cy="470" r="200" fill="none" stroke="${A}" stroke-width="5" stroke-dasharray="14 12"/></g>${plus10()}<text x="1240" y="760" text-anchor="middle" class="mono" font-size="40" fill="${A}" data-in="up" data-delay="0.6">HEADS. AGAIN.</text>`, { scan: false, label: v.label });
  },
  cards: (v) => {
    const suits = ["♠", "♠", "♠", "♠", "♠"], ranks = ["10", "J", "Q", "K", "A"];
    let s = "";
    ranks.forEach((rk, i) => {
      const a = (i - 2) * 12;
      s += `<g transform="rotate(${a} 960 1000)" data-in="up" data-delay="${(0.2 + i * 0.15).toFixed(2)}"><rect x="860" y="280" width="200" height="290" rx="16" fill="#f4f1ea" stroke="#111" stroke-width="4"/><text x="885" y="340" class="display" font-size="56" fill="#111">${rk}</text><text x="960" y="470" text-anchor="middle" font-size="90" fill="#111">${suits[i]}</text></g>`;
    });
    s += `<text x="960" y="160" text-anchor="middle" class="display" font-size="110" fill="${C.ink}" data-in="fade" data-delay="1.1"><tspan data-count="40,1.1">0</tspan> / 40 HANDS</text>`;
    return frame(s, { scan: false, grid: false, bg: "#0b2a19", label: v.label });
  },
  bill: (v) => frame(`<g transform="rotate(-3 960 540)"><rect x="560" y="110" width="800" height="860" fill="#f4f1ea"/><text x="620" y="200" class="mono" font-size="34" fill="#333">ST. MARY'S HOSPITAL</text><line x1="620" x2="1300" y1="230" y2="230" stroke="#999" stroke-width="3"/>` +
    ["PATIENT: ROSA M.", "PROCEDURE: CARDIAC SURGERY", "INSURANCE: NOT COVERED"].map((t, i) => `<text x="620" y="${310 + i * 60}" class="mono" font-size="30" fill="#333">${t}</text>`).join("") +
    `<text x="620" y="580" class="mono" font-size="36" fill="#333">AMOUNT DUE</text><text x="620" y="770" class="display" font-size="150" fill="${C.danger}" data-in="up" data-delay="0.4">$60,000</text></g>` +
    `<g data-in="scale" data-delay="1"><rect x="1150" y="110" width="380" height="120" rx="10" fill="none" stroke="${C.danger}" stroke-width="10" transform="rotate(12 1340 170)"/><text x="1340" y="200" text-anchor="middle" class="display" font-size="90" fill="${C.danger}" transform="rotate(12 1340 170)">DENIED</text></g>`, { grid: false, scan: false, bg: "#0d0b0a" }),
  lasers: (v) => {
    let s = "";
    for (let i = 0; i < 9; i++) s += `<line x1="0" x2="${W}" y1="${120 + i * 100}" y2="${120 + ((i * 3) % 9) * 100}" stroke="${C.danger}" stroke-width="6" opacity="0.9" data-pulse="${(0.5 + (i % 3) * 0.15).toFixed(2)}"/>`;
    s += `<path d="M80 980 C400 900 380 700 640 640 S1000 520 1100 420 S1500 200 1840 120" stroke="${A}" stroke-width="10" fill="none" stroke-dasharray="26 18" data-in="fade" data-delay="0.5"/>`;
    s += `<text x="960" y="70" text-anchor="middle" class="mono" font-size="36" fill="${A}" data-in="up" data-delay="0.8">NEW PATTERN EVERY 10 SECONDS</text>`;
    return frame(s, { label: v.label });
  },
  vaultdoor: (v) => {
    let s = `<circle cx="960" cy="520" r="380" fill="#1b2430" stroke="#5a6a7e" stroke-width="24"/><circle cx="960" cy="520" r="300" fill="none" stroke="#33404f" stroke-width="12"/>`;
    s += `<g data-spin="${v.open ? 270 : 0}" data-org="960 520"><circle cx="960" cy="520" r="110" fill="none" stroke="#9fb4cc" stroke-width="16"/>${[0, 60, 120].map((a) => `<line x1="960" y1="380" x2="960" y2="660" stroke="#9fb4cc" stroke-width="16" transform="rotate(${a} 960 520)"/>`).join("")}</g>`;
    s += `<rect x="810" y="40" width="300" height="80" rx="8" fill="#05080f" stroke="${v.open ? C.ok : C.danger}" stroke-width="4"/><text x="960" y="96" text-anchor="middle" class="mono" font-size="46" fill="${v.open ? C.ok : C.danger}">${v.time || "03:00:00"}</text>`;
    return frame(s, { scan: false, label: v.open ? "OPEN FOR 10 SECONDS" : v.label });
  },
  bullet: (v) => {
    let s = `<g data-in="right" data-delay="0.1"><rect x="160" y="500" width="120" height="44" rx="6" fill="#b08a3a"/><path d="M280 500 q60 22 0 44 z" fill="#d9b25a"/></g>`;
    s += `<line x1="320" x2="1780" y1="522" y2="522" stroke="${A}" stroke-width="6" stroke-dasharray="20 16" data-in="draw" data-delay="0.3" data-drawdur="1.2"/>`;
    s += `<g opacity="0.35"><circle cx="1300" cy="430" r="52" fill="none" stroke="${A}" stroke-width="6"/><line x1="1300" x2="1300" y1="482" y2="700" stroke="${A}" stroke-width="10"/></g><g data-in="right" data-delay="0.9"><circle cx="1420" cy="430" r="52" fill="#121826" stroke="${A}" stroke-width="6"/><line x1="1420" x2="1420" y1="482" y2="700" stroke="#e9eef6" stroke-width="12"/></g>`;
    s += plus10() + `<text x="960" y="820" text-anchor="middle" class="mono" font-size="40" fill="${A}" data-in="up" data-delay="1.2">YOU'RE ALREADY MOVING</text>`;
    return frame(s, { label: v.label });
  },
  chess: (v) => {
    let s = "";
    for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) s += `<rect x="${600 + i * 90}" y="${170 + j * 90}" width="90" height="90" fill="${(i + j) % 2 ? "#3a2a1a" : "#c9a87a"}"/>`;
    const pcs = [[1, 6, "#f4f1ea"], [2, 6, "#f4f1ea"], [4, 7, "#f4f1ea"], [3, 1, "#111"], [5, 0, "#111"], [6, 1, "#111"]];
    pcs.forEach(([i, j, c]) => { s += `<circle cx="${645 + i * 90}" cy="${225 + j * 90}" r="30" fill="${c}" stroke="#555" stroke-width="3"/>`; });
    s += `<path d="M825 765 L825 495 L1005 405 L1095 225" stroke="${A}" stroke-width="8" fill="none" stroke-dasharray="18 12" data-in="fade" data-delay="0.5"/>`;
    s += `<text x="960" y="130" text-anchor="middle" class="mono" font-size="40" fill="${A}" data-in="up" data-delay="0.8">${v.caption || "TEN MOVES AHEAD"}</text>`;
    return frame(s, { grid: false, scan: false, bg: "#120d0a" });
  },
  letter: (v) => {
    let s = `<rect width="${W}" height="${H}" fill="#120d0a"/>`;
    if (v.envelope) {
      s += `<g transform="rotate(-3 960 540)"><rect x="500" y="260" width="920" height="560" fill="#e8dcc0"/><path d="M500 260 L960 560 L1420 260" stroke="#b9a57e" stroke-width="5" fill="none"/>` +
        `<text x="960" y="660" text-anchor="middle" font-size="46" class="kid" fill="#5a3a2a">For Kai.</text><text x="960" y="730" text-anchor="middle" font-size="40" class="kid" fill="#5a3a2a">Open on your 19th birthday.</text><text x="1340" y="320" text-anchor="end" class="mono" font-size="30" fill="#8a6a44">2015</text></g>`;
    } else {
      s += `<g transform="rotate(-2 960 540)"><rect x="520" y="80" width="880" height="920" fill="#f4ecd8"/>` +
        ["Mijo,", "I know you see things", "before they happen.", "So I wrote this", "eleven years early.", "Let's see you see", "this one coming.", "Love, Grandma"].map((t, i) => `<text x="600" y="${180 + i * 100}" font-size="54" class="kid" fill="#3a3a8a" data-in="fade" data-delay="${(0.3 + i * 0.35).toFixed(2)}">${t}</text>`).join("") + `</g>`;
    }
    return frame(s, { grid: false, scan: false, bg: "#120d0a" });
  },
  ecg: (v) => {
    const flat = v.flat;
    const d = flat ? `M0 540 H${W}` : `M0 540 H500 l40 -90 l40 180 l40 -250 l40 160 H1000 l40 -90 l40 180 l40 -250 l40 160 H${W}`;
    return frame(`<path d="${d}" stroke="${flat ? C.danger : C.ok}" stroke-width="8" fill="none" data-in="draw" data-drawdur="2"/><text x="960" y="880" text-anchor="middle" class="display" font-size="120" fill="${flat ? C.danger : C.ok}" data-in="up" data-delay="0.5">${v.text || ""}</text>`, { scan: false });
  },
});
