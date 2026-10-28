# Video Factory 🎬

Turn a script file into a finished, YouTube-ready MP4: animated stick figures, moving backgrounds, maps, timelines, charts, word-by-word captions, transitions, music and voiceover. It renders in **16:9**, **9:16**, or as a **Short**.

Everything runs **on your own computer with free tools** (Remotion, React, FFmpeg, espeak-ng/Piper). There are no paid APIs, no per-video fees and no accounts.

> **Licence note:** Remotion is free for individuals and companies with up to 3 employees. Larger companies need a [Remotion company licence](https://remotion.dev/license). Every other tool used here is free and open source.

---

## 1. One-time setup

| You need | How to get it (free) |
|---|---|
| Node.js 18+ | https://nodejs.org |
| FFmpeg | macOS `brew install ffmpeg` · Ubuntu `sudo apt install ffmpeg` · Windows `winget install ffmpeg` |
| A voice (optional) | `sudo apt install espeak-ng` / `brew install espeak-ng`. For a much better voice, see [Better free voice](#better-free-voice-piper) |

```bash
cd video-factory
npm install
npm run doctor        # checks everything and tells you how to fix problems
```

The first render downloads Remotion's free headless browser automatically (one time only).

## 2. Render the sample video

```bash
npm run make -- mary-celeste                    # 16:9 HD video (~9:47)
npm run make -- mary-celeste --format both      # 16:9 + 9:16
npm run make -- mary-celeste --format all       # 16:9 + 9:16 + Shorts cut
```

Results go to `out/mary-celeste/`:

- `mary-celeste-landscape.mp4`: the video (1080p, H.264, loudness normalised to YouTube's −14 LUFS)
- `…-thumbnail.jpg`: a starting point for your thumbnail
- `…-description.txt`: title, description, **YouTube chapters** and sources, ready to paste

## 3. Make your next video (the everyday workflow)

```bash
npm run new -- dyatlov-pass            # creates videos/dyatlov-pass/script.json
#   (use  --txt  for the simpler plain-text format)
# ✏️  edit videos/dyatlov-pass/script.json
npm run check -- dyatlov-pass          # finds mistakes + shows the estimated length
npm run make -- dyatlov-pass --preview # fast half-size test render
npm run make -- dyatlov-pass --format both
```

**Tips**
- Aim for **1,350–1,550 words** of narration for a 6–10 minute video. `npm run check` tells you how many words to add or cut.
- Wrap **important words** in `*asterisks*` and they glow in the captions.
- Add `"chapter": "Name"` to a scene to start a YouTube chapter there.
- Add `"short": true` to the scenes you want in the vertical Shorts cut (`--format short`).
- Render only some scenes while you iterate: `--scenes 3-6`.
- See it live in your browser while editing: `npm run studio -- dyatlov-pass` (add `--format vertical` to preview 9:16).

## 4. The script file

A video is a list of scenes. Each scene has a `type`, the `narration` to speak, and a few fields for its visuals. `templates/script-template.json` has a working example of every type.

| type | What it shows | Required fields | Useful extras |
|---|---|---|---|
| `title` | Big animated title | `title` | `kicker`, `subtitle`, `props` |
| `stickfigure` | Animated stick-figure scene | – | `figures`, `props`, `ground`, `headline` |
| `map` | World map that zooms, draws a route, drops pins | `center` [lon, lat] | `zoom`, `route`, `markers`, `highlightCountries` |
| `timeline` | Events revealed in order | `events` | `headline` |
| `chart` | Animated bar / line / donut chart | `data` | `chartType`, `unit`, `headline` |
| `stat` | One big counting number | `value` | `prefix`, `suffix`, `label` |
| `list` | Items revealed one by one | `items` | `headline` |
| `quote` | Typewriter quote | `text` | `author` |
| `text` | Kinetic headline | `headline` | `body` |
| `question` | Glitchy mystery question | `text` | – |
| `outro` | Subscribe end card | – | `title`, `subtitle`, `cta` |

**Options you can put on any scene**
- `background`: `ocean`, `stars`, `fog`, `grid`, `embers`, `paper`, `storm`
- `transition` (into this scene): `fade`, `slide`, `wipe`, `flip`, `clock`, `iris`, `none`

**Stick figures:** `{ "pose": "point", "hat": "captain", "mood": "worried", "x": 0.3, "label": "Name", "say": "Speech bubble!" }`
- poses: `idle walk run point think shock shrug wave scared cheer`
- hats: `none captain sailor detective bow`
- moods: `neutral happy worried shocked sad`
- `enter`: `walk` (default), `pop`, `none`

**Props:** `ship barrel lifeboat question lightbulb magnifier compass scroll lightning cloud skull book`, used as `{ "kind": "ship", "x": 0.7, "y": 0.6, "scale": 0.8 }`.

**Video settings** (top of the file): `title`, `channel` (watermark), `theme` (`mystery`, `cosmic`, `archive`), `description`, `sources`, `captions` (true/false), `voice`, `music`.

## 5. Audio: voice and music

Put files in `videos/<name>/audio/`. Everything is optional:

| File | Effect |
|---|---|
| `recorded/scene-01.mp3`, `scene-02.mp3`, … | **Your own voice**, one clip per scene. Scenes stretch to fit each clip exactly. |
| `voiceover.mp3` | One recording of the whole script, read in scene order |
| `music.mp3` | Your background music, looped and automatically lowered while the narrator speaks |
| `whoosh.wav` | Your own transition sound |

Without recordings, a **free offline voice** reads the script (Piper if installed, otherwise espeak-ng). Without music, an **original ambient track is synthesised with FFmpeg**, so there are no copyright claims. Voice clips are cached, so only edited scenes are re-generated.

Free music sources if you want your own: YouTube Audio Library, Pixabay Music, or Free Music Archive (check each track's licence).

### Better free voice (Piper)

espeak-ng sounds robotic. [Piper](https://github.com/rhasspy/piper) is free, offline and sounds natural:

```bash
python3 -m venv .venv && .venv/bin/pip install piper-tts
# download BOTH files of a voice into voices/, e.g. en_US-ryan-medium:
#   https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_US/ryan/medium
npm run doctor     # should now say "Voice: Piper"
npm run make -- mary-celeste --force-voice
```

The pipeline picks Piper automatically when a model is in `voices/`. To force an engine, set `"voice": { "engine": "piper" }` (or `"espeak"` or `"none"`).

## 6. All commands

| Command | What it does |
|---|---|
| `npm run doctor` | Check Node, FFmpeg, browser, voice engine |
| `npm run new -- <name> [--txt]` | Start a new video from the template |
| `npm run check -- <name>` | Validate the script and show timing per scene |
| `npm run make -- <name>` | Full render (16:9) |
| `  --format landscape\|vertical\|short\|both\|all` | Choose output formats |
| `  --preview` | Half-resolution, faster test render |
| `  --scenes 2-5` | Render only some scenes |
| `  --no-voice` / `--no-music` | Skip voice / music |
| `  --force-voice` | Re-generate all voice clips |
| `  --concurrency 2` | Use fewer CPU cores (if your computer struggles) |
| `npm run studio -- <name>` | Live preview in the browser (Remotion Studio) |

## 7. How it works

```
videos/<name>/script.json ─┐
videos/<name>/audio/*  ────┤
                           ▼
 scripts/render.mjs ─► validate ─► voice (Piper/espeak) ─► music (FFmpeg)
                           │
                           ▼
            scripts/lib/plan.mjs  → frame-exact timeline + caption timings
                           │
                           ▼
          Remotion (React, src/) → renders every frame in headless Chrome
                           │
                           ▼
          FFmpeg → loudness normalise, fast-start MP4, thumbnail, chapters
```

- `src/scenes/`: one React template per scene type (add a new one in `src/scenes/index.tsx`)
- `src/components/`: stick figure rig, props, backgrounds, world map, captions, overlay
- `src/theme.ts`: colour themes and fonts (Bebas Neue + Inter, bundled locally)
- Map outlines come from Natural Earth (public domain) via the `world-atlas` package.

## 8. Troubleshooting

| Problem | Fix |
|---|---|
| `FFmpeg is not installed` | Install it (see setup) and reopen the terminal |
| `script.json is not valid JSON` | Usually a missing or trailing comma; the error gives the line number |
| Browser fails to download / start | Run `npm run doctor`. Behind a firewall, set `REMOTION_BROWSER_EXECUTABLE=/path/to/chrome` |
| Render crashes or the computer freezes | Add `--concurrency 2` |
| A scene looks wrong | `npm run studio -- <name>` and scrub to it, or `--scenes N --preview` |
| Video too long or short | `npm run check -- <name>` shows how many words to add or cut |
| Voice too fast or slow | Change `"speed"` under `"voice"` (espeak words per minute) |

Rendering speed depends on your CPU. On a 4-core machine, a 10-minute 1080p video takes roughly 35–45 minutes. Use `--preview` while you work.
