---
name: what-if-story-video
description: >
  Make an Ifverse-style "What If" animated story video (like "What If You Used 500 IQ to Save Your
  Sister? (Part 3)") about any topic the user gives: second-person narrated stickman / minimal-character
  animated short, 8-12 min (or a 60 s Short), with a cold-open montage, numbered clue reveals, a
  thousand-simulations plan, a twist payoff, an emotional epilogue and a comment-bait question.
  Use whenever the user says "make a what-if video about X", "make a video like the 500 IQ one",
  "Ifverse style", "next part of the series", or gives a bare topic for this channel format.
  Orchestrates: story script → shot list → character sheet → keyframes → animated clips → voices →
  music/SFX → HyperFrames assembly + captions → render → YouTube packaging.
---

# What-If Story Video

Turn a topic ("What if you could stop time to win a war?") into a finished, uploadable video in the
format of the Ifverse channel's *What If You Used 500 IQ…* series. This skill is the **orchestrator**;
it hands each stage to a specialist skill or MCP tool.

Read these before starting:

- `references/story-formula.md` — the narrative template distilled from the reference video. **Always.**
- `references/production-pipeline.md` — which tool does which stage, with fallbacks. **Always.**
- `references/packaging.md` — title, thumbnail, description, chapters, tags. At the packaging stage.

## Stage 0 — Brief (ask once, then go)

From the user's topic, fill this brief. Ask only for what you can't infer (one AskUserQuestion, max 4
questions); otherwise choose sensible defaults and state them.

| Field | Default |
| --- | --- |
| Premise | "What if you had <power> and used it to <stakes>?" built from the topic |
| Format | Long-form 16:9, 8–12 min, 7–9 chapters. Short = 9:16, 45–60 s, cold open + 1 act + twist |
| Series | Standalone, or Part N (recap hook + link to previous parts) |
| Visual style | Minimal stickman / flat-shaded characters, cinematic lighting, dark palette with one accent colour |
| Pipeline | **AI** (Higgsfield images + image-to-video) if connected, else **Code** (HyperFrames SVG/GSAP) |
| Voices | 1 narrator (calm, intimate, slightly low) + one distinct voice per speaking character |
| Language | English |

## Stage 1 — Story & script → `story/script.md`

Follow `references/story-formula.md` beat by beat. Output:

1. Logline + the **one emotional core** (who "always saw" the hero, what they really want).
2. Beat sheet with chapter titles and target timestamps.
3. Full script as a table: `#`, `speaker` (NARRATOR / character), `line`, `on-screen visual`, `sfx/music cue`.
   Narration is **second person, present tense, short sentences, ellipses for pauses**.
4. Read-aloud length check: ~150 words/min of narration+dialogue. Trim to the target runtime.

Show the user the logline + beat sheet and continue unless they object (they asked for a finished video).

## Stage 2 — Shot list → `story/shots.json`

One entry per shot, 2–6 s each (≈150–220 shots for 10 min; ≈15–25 for a Short):

```json
{ "id": "s014", "chapter": "12 seconds, 5 clues", "dur": 3.5,
  "line_ids": [22], "camera": "slow push-in", "shot": "extreme close-up of sister's eye reflecting a window and mountain ridge",
  "characters": ["sister"], "motion": "eye blinks twice", "onscreen_text": "CLUE 1", "sfx": "low hum" }
```

Reuse shots (same keyframe, different crop/camera move) to keep generation cost down — aim for ~40%
reuse in long-form.

## Stage 3 — Look & characters → `assets/characters/`

- Write `design.md` (palette, line weight, lighting, aspect ratio) — see `hyperframes-creative`.
- Create a **character sheet** per recurring character (front / ¾ / side, 2–3 expressions) and reuse it
  as the reference image for every shot so the characters stay consistent. Higgsfield:
  `get_workflow_instructions { workflow: "character-sheet" }`. Code pipeline: one parametric SVG stickman
  component per character (colour accent + one prop/silhouette detail each).

## Stage 4 — Visuals → `assets/shots/<id>.mp4`

See `production-pipeline.md` §Visuals. AI: keyframe image per shot with the character reference →
image-to-video with the shot's `motion` + `camera` prompt; batch generation; check every clip and
regenerate failures. Code: build each shot as a HyperFrames sub-composition with GSAP.

**Cost gate:** before any paid batch, quote total credits/cost (`balance`, `models_explore`) and get
the user's OK once for the whole run.

## Stage 5 — Voice, music, SFX → `assets/audio/`

- One TTS file per script line (so timing can be re-cut), consistent voice IDs per speaker.
- Underscore: tense pulse for acts 1–3, swell at the rescue, solo piano for the epilogue.
- SFX per the script's cue column (hums, phone ring, thrusters, glass, gunfire *muffled*, heartbeat).
- Mix with `hyperframes-audio`: narration −16 LUFS integrated, music ducked ~−12 dB under speech.

## Stage 6 — Assemble & render

Use the `hyperframes` entry skill → `hyperframes-core` composition: shots on track 1 timed to the
voice lines, audio tracks, burned-in captions (bold, 2–4 words per chunk, accent colour on the key
word), chapter title cards (`motion-graphics`), and the end card. Then `hyperframes-cli`:
`lint` → `snapshot` a few frames and look at them → `render` to `out/<slug>.mp4` (1080p, 30 fps).

## Stage 7 — Packaging → `out/youtube.md` (+ `out/thumbnail.png`)

Follow `references/packaging.md`. Deliver: title (+2 alternates, scored), description with chapters
and series links, tags, pinned-comment question, thumbnail.

## Finish

Send the user `out/<slug>.mp4`, `out/thumbnail.png`, and `out/youtube.md`. Never upload or publish to
YouTube/social without an explicit ask.
