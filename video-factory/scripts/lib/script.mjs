// Loads videos/<name>/script.json (or script.txt), validates it and fills in
// defaults. Every problem is reported with the scene number and a fix.
import fs from "node:fs";
import path from "node:path";
import { UserError } from "./util.mjs";

export const SCENE_TYPES = ["title", "stickfigure", "map", "timeline", "chart", "stat", "quote", "list", "text", "question", "outro"];
const BACKGROUNDS = ["ocean", "stars", "fog", "grid", "embers", "paper", "storm"];
const TRANSITIONS = ["fade", "slide", "wipe", "flip", "clock", "iris", "none"];
const POSES = ["idle", "walk", "run", "point", "think", "shock", "shrug", "wave", "scared", "cheer"];
const HATS = ["none", "captain", "sailor", "detective", "bow"];
const MOODS = ["neutral", "happy", "worried", "shocked", "sad"];
const PROPS = ["ship", "barrel", "lifeboat", "question", "lightbulb", "magnifier", "compass", "scroll", "lightning", "cloud", "skull", "book"];
const THEMES = ["mystery", "cosmic", "archive"];

// What each scene type needs. Shown in error messages, too.
const REQUIRED = {
  title: ["title"],
  map: ["center"],
  timeline: ["events"],
  chart: ["data"],
  stat: ["value"],
  quote: ["text"],
  list: ["items"],
  text: ["headline"],
  question: ["text"],
  stickfigure: [],
  outro: [],
};

const DEFAULTS = {
  title: "Untitled video",
  channel: "",
  theme: "mystery",
  fps: 30,
  captions: true,
  wordsPerMinute: 150,
  voice: { engine: "auto", espeakVoice: "en-us+m3", speed: 150, pitch: 38, piperModel: "" },
  music: { file: "", generate: true, volume: 0.2, duckedVolume: 0.06 },
  sfx: true,
};

// ---------- TXT format ----------------------------------------------------
// A forgiving plain-text format for beginners. See templates/script-template.txt.
const parseList = (v) => v.split("|").map((s) => s.trim()).filter(Boolean);
const parsePair = (v) => v.split(",").map((n) => parseFloat(n.trim()));

const TXT_FIELDS = {
  items: parseList,
  highlightCountries: parseList,
  center: parsePair,
  zoom: parseFloat,
  value: parseFloat,
  short: (v) => /^(yes|true|1)$/i.test(v),
  events: (v) =>
    parseList(v).map((e) => {
      const [date, ...rest] = e.split("=");
      return { date: date.trim(), label: rest.join("=").trim() };
    }),
  data: (v) =>
    parseList(v).map((e) => {
      const [label, value] = e.split("=");
      return { label: label.trim(), value: parseFloat(value) };
    }),
  markers: (v) =>
    parseList(v).map((e) => {
      const [label, coords] = e.split("@");
      const [lon, lat] = parsePair(coords ?? "");
      return { label: label.trim(), lon, lat };
    }),
  route: (v) => v.split(">").map((p) => parsePair(p)),
  figures: (v) =>
    parseList(v).map((e) => {
      // e.g. "captain:point:captain"  ->  label:pose:hat
      const [label, pose, hat] = e.split(":").map((s) => s.trim());
      return { label: label || undefined, pose: pose || "idle", hat: hat || "none" };
    }),
  props: (v) =>
    parseList(v).map((e) => {
      const [kind, x, scale] = e.split(":").map((s) => s.trim());
      return { kind, x: x ? parseFloat(x) : undefined, scale: scale ? parseFloat(scale) : undefined };
    }),
};

export const parseTxt = (text) => {
  const script = { scenes: [] };
  let scene = null;
  const lines = text.split(/\r?\n/);
  lines.forEach((raw, i) => {
    const line = raw.trim();
    if (!line || line.startsWith("//")) return;
    const head = line.match(/^==+\s*([a-z]+)\s*==+$/i);
    if (head) {
      scene = { type: head[1].toLowerCase(), narration: "" };
      script.scenes.push(scene);
      return;
    }
    const kv = line.match(/^([A-Za-z]+)\s*:\s*(.*)$/);
    if (kv) {
      const key = kv[1];
      const value = kv[2];
      const target = scene ?? script;
      if (!scene && key === "music") {
        target.music = /^(none|off|no)$/i.test(value) ? { generate: false, file: "" } : { file: value };
      } else if (!scene && key === "voice") {
        target.voice = { engine: value };
      } else if (!scene && key === "captions") {
        target.captions = !/^(no|off|false)$/i.test(value);
      } else {
        try {
          target[key] = TXT_FIELDS[key] ? TXT_FIELDS[key](value) : value;
        } catch {
          throw new UserError(`script.txt line ${i + 1}: could not read "${key}".`, `Check the format in templates/script-template.txt`);
        }
      }
      return;
    }
    // A line without "key:" is narration.
    if (!scene) throw new UserError(`script.txt line ${i + 1}: text before the first "== scene ==" header.`, `Put settings as "key: value" lines, and start scenes with e.g. "== title ==".`);
    scene.narration = scene.narration ? `${scene.narration} ${line}` : line;
  });
  return script;
};

// ---------- validation ----------------------------------------------------
const checkEnum = (errors, where, field, value, allowed) => {
  if (value !== undefined && !allowed.includes(value)) {
    errors.push(`${where}: ${field} "${value}" is not valid. Use one of: ${allowed.join(", ")}`);
  }
};

const isNum = (n) => typeof n === "number" && Number.isFinite(n);

export const validateScript = (script) => {
  const errors = [];
  const warnings = [];
  if (!Array.isArray(script.scenes) || script.scenes.length === 0) {
    errors.push(`The script has no scenes. Add a "scenes": [ ... ] list.`);
    return { errors, warnings };
  }
  checkEnum(errors, "Settings", "theme", script.theme, THEMES);
  script.scenes.forEach((s, i) => {
    const where = `Scene ${i + 1}${s?.type ? ` (${s.type})` : ""}`;
    if (!s || typeof s !== "object") return errors.push(`${where}: must be an object.`);
    if (!SCENE_TYPES.includes(s.type)) return errors.push(`${where}: unknown type "${s.type}". Use one of: ${SCENE_TYPES.join(", ")}`);
    if (typeof s.narration !== "string") errors.push(`${where}: "narration" text is missing.`);
    else if (!s.narration.trim()) warnings.push(`${where}: empty narration — the scene will be shown silently for 3 seconds.`);
    for (const f of REQUIRED[s.type]) {
      if (s[f] === undefined || s[f] === "" || (Array.isArray(s[f]) && s[f].length === 0)) {
        errors.push(`${where}: needs "${f}". Required for ${s.type}: ${REQUIRED[s.type].join(", ")}`);
      }
    }
    checkEnum(errors, where, "background", s.background, BACKGROUNDS);
    checkEnum(errors, where, "transition", s.transition, TRANSITIONS);
    checkEnum(errors, where, "ground", s.ground, ["land", "deck", "water", "none"]);
    checkEnum(errors, where, "chartType", s.chartType, ["bar", "line", "donut"]);
    (s.figures ?? []).forEach((f, j) => {
      checkEnum(errors, `${where} figure ${j + 1}`, "pose", f.pose, POSES);
      checkEnum(errors, `${where} figure ${j + 1}`, "hat", f.hat, HATS);
      checkEnum(errors, `${where} figure ${j + 1}`, "mood", f.mood, MOODS);
    });
    (s.props ?? []).forEach((p, j) => checkEnum(errors, `${where} prop ${j + 1}`, "kind", p.kind, PROPS));
    if (s.center && !(s.center.length === 2 && s.center.every(isNum))) errors.push(`${where}: center must be [longitude, latitude], e.g. [-30, 38].`);
    (s.markers ?? []).forEach((m, j) => {
      if (!isNum(m.lon) || !isNum(m.lat)) errors.push(`${where} marker ${j + 1}: needs numeric "lon" and "lat".`);
    });
    (s.route ?? []).forEach((p, j) => {
      if (!(Array.isArray(p) && p.length === 2 && p.every(isNum))) errors.push(`${where} route point ${j + 1}: must be [longitude, latitude].`);
    });
    (s.data ?? []).forEach((d, j) => {
      if (!isNum(d.value)) errors.push(`${where} data ${j + 1}: "value" must be a number (got ${JSON.stringify(d.value)}).`);
    });
    (s.events ?? []).forEach((e, j) => {
      if (!e.date || !e.label) errors.push(`${where} event ${j + 1}: needs "date" and "label".`);
    });
    if (s.type === "stat" && s.value !== undefined && !isNum(s.value)) errors.push(`${where}: "value" must be a number.`);
    if ((s.narration ?? "").split("*").length % 2 === 0) warnings.push(`${where}: odd number of * marks — a highlight is not closed.`);
  });
  return { errors, warnings };
};

export const loadScript = (dir) => {
  const jsonPath = path.join(dir, "script.json");
  const txtPath = path.join(dir, "script.txt");
  let script;
  let source;
  if (fs.existsSync(jsonPath)) {
    source = jsonPath;
    const raw = fs.readFileSync(jsonPath, "utf8");
    try {
      script = JSON.parse(raw);
    } catch (e) {
      const pos = Number((e.message.match(/position (\d+)/) ?? [])[1]);
      const line = Number.isFinite(pos) ? raw.slice(0, pos).split("\n").length : "?";
      throw new UserError(
        `script.json is not valid JSON (around line ${line}): ${e.message}`,
        "Common causes: a missing comma between items, a trailing comma before ] or }, or straight quotes missing. Paste the file into https://jsonlint.com to find it.",
      );
    }
  } else if (fs.existsSync(txtPath)) {
    source = txtPath;
    script = parseTxt(fs.readFileSync(txtPath, "utf8"));
  } else {
    throw new UserError(`No script found in ${dir}.`, "Add a script.json or script.txt (copy one from the templates/ folder).");
  }

  const { errors, warnings } = validateScript(script);
  if (errors.length) {
    throw new UserError(
      `Found ${errors.length} problem(s) in ${path.basename(source)}:\n    - ${errors.join("\n    - ")}`,
      "Fix the lines above and run the command again.",
    );
  }

  const merged = {
    ...DEFAULTS,
    ...script,
    voice: { ...DEFAULTS.voice, ...(script.voice ?? {}) },
    music: { ...DEFAULTS.music, ...(script.music ?? {}) },
  };
  return { script: merged, source, warnings };
};

// Narration with *highlight* marks removed, for text-to-speech.
export const spokenText = (narration) => narration.replace(/\*/g, "").replace(/\s+/g, " ").trim();
