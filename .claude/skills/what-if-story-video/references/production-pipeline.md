# Production pipeline — which tool does what

Prefer the first option that is available in the session; fall back down the list. Check MCP tools
with ToolSearch before declaring a stage impossible.

## Research the reference / competitors (optional)

- vidIQ MCP: `vidiq_get_videos_by_ids`, `vidiq_video_transcript`, `vidiq_similar_videos`,
  `vidiq_outliers` — study top "what if" videos, pull transcripts for structure.

## Visuals

**AI pipeline (closest to the reference look)** — Higgsfield MCP
1. `get_workflow_instructions` (no arg) for multi-step video, and `{ workflow: "character-sheet" }`.
2. `models_explore { action: "recommend" }` for a stylised 2D / stickman image model and an
   image-to-video model.
3. Character sheets → `generate_image` (save media IDs in `assets/characters/index.json`).
4. Keyframes per shot → `generate_image_batch` with the character reference + `design.md` style prompt.
5. Clips → `generate_video_batch` (image-to-video, 3–6 s, prompt = `motion` + `camera` from shots.json).
6. `jobs_wait` → download → `assets/shots/<id>.mp4`. Upscale only hero shots (`upscale_video`).

Alternatives: vidIQ `vidiq_generate_broll` / `vidiq_generate_video`; Vsub `create_ai_video_v3`
(art styles via `list_art_styles`) for quick Shorts with built-in captions.

**Code pipeline (free, fully editable, offline)** — HyperFrames skills
- `hyperframes` (entry) → `hyperframes-core` + `hyperframes-animation` (GSAP) to draw SVG stickmen,
  sets and camera moves; `hyperframes-keyframes` for push-ins/zooms; `hyperframes-registry` for named
  effects (glitch, HUD, scanlines for the visor); `motion-graphics` for clue labels, maps, counters.

## Voice

1. HyperFrames `media-use`: `npx hyperframes media-use resolve --type voice …` (HeyGen TTS; free
   allowance after `heygen auth login --oauth`; local Kokoro fallback; ElevenLabs if `ELEVENLABS_API_KEY`).
2. Higgsfield `create_voice` / `generate_audio` (+ `list_voices`).
3. vidIQ `vidiq_voiceover_generate` (`vidiq_voiceover_list_voices`) or Vsub `text_to_speech`.
Keep one voice ID per speaker in `assets/audio/voices.json`.

## Music & SFX

- Music: `media-use resolve --type bgm` (needs heygen CLI) → Higgsfield `generate_audio` → vidIQ
  `vidiq_generate_music`.
- SFX: `media-use resolve --type sfx` (Openverse CC0/CC BY, no account; credit CC BY) → Vsub
  `list_sound_effects`.
- Mix: `hyperframes-audio`.

## Captions

Generate word timings from the TTS files (`media-use` transcription) and burn captions in the
composition (`hyperframes-core` captions pattern). Vsub `create_caption_video` is a fallback for Shorts.

## Assembly & render

`hyperframes-cli`: `npx hyperframes init` → author → `lint` → `snapshot` (inspect frames) → `render`.
ffmpeg is available for concat/trim/loudness (`loudnorm`) checks.
Cloud alternative when the user wants a shareable HeyGen project: HyperFrames MCP `compose` /
`render_video` (disabled from CLI agents — use the local skills here).

## Edit / reformat

Adobe MCP: `video_resize` (16:9 → 9:16 Short), `video_create_quick_cut`, `media_enhance_speech`.

## Keys & accounts (only what the chosen path needs)

`heygen` CLI login or `HEYGEN_API_KEY` (TTS/BGM) · Higgsfield credits (AI visuals) ·
optional `ELEVENLABS_API_KEY`, `GEMINI_API_KEY`. Store secrets as environment secrets, never in the repo.
