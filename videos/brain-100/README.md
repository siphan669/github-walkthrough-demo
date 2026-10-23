# What If Your Brain Used 100%? — Remotion project

Fourth What-If episode, built with Remotion (the first three use HyperFrames). Same house
character style, story format, Kokoro voices and synthesized music as the other episodes.

## Pipeline

```bash
node tools/tts.mjs          # story/script.mjs → public/vo/*.wav + story/lines.json (cached per line)
node tools/build.mjs        # → src/Video.tsx (generated timeline), story/timeline.json, story/script.md
python3 -I tools/audio.py   # → public/music/<chapter>.wav + public/sfx/*.wav
node tools/build.mjs        # again, so SFX durations come from the real files
npx remotion studio         # preview and edit (each shot / voice line / sound is its own timeline item)
npx remotion render BrainAt100 out/what-if-brain-100.mp4
node tools/thumbnail.mjs    # → out/thumbnail.png, out/thumbnail-alt.png
```

## Layout

- `story/script.mjs` — the story: `[speaker, text, visual]` lines grouped into chapters.
- `src/Video.tsx` — **generated** timeline: named `Track`s for shots, voice + captions, music and
  two SFX lanes. Every item is its own JSX node with inline timing, so Studio edits write back to it.
  Re-running `tools/build.mjs` overwrites hand edits there; edit `story/script.mjs` for lasting changes.
- `src/Shot.tsx` — one timeline shot (`Interactive.create`): camera move + visual dispatch.
- `src/components/` — `Character` (house-style figure, frame-driven limbs), `Scene` (backdrop,
  characters, neuron/lightning/siren/impact overlays), `anim.ts` helpers.
- `src/shots/` — close-ups (`Brain`, `Book`, `Thermo`, `Keypad`, `Splice`, …) and text cards.
- `src/Captions.tsx` — per-line captions using `Interactive.captionsSchema`.
- `src/lib/art.mjs` — the shared SVG art module from the HyperFrames episodes (backgrounds);
  `src/lib/bgs.mjs` adds this episode's locations.

## Cloud sessions

Remotion can't download its own browser here (`remotion.media` is blocked), so
`remotion.config.ts` points it at the headless Chrome that HyperFrames installs.
Generated audio (`public/vo`, `public/music`, `public/sfx`) and renders are not committed.
