---
name: diy-transformation-reel
description: Plan and produce short (10–20 s) AI-generated DIY/home-makeover "transformation" reels with a recurring branded host. A fixed camera shows an empty space filling up through 6–10 satisfying build steps, ending in a cozy reveal that loops back. Use when the user wants reel ideas, storyboards, character sheets, image/video prompts, captions, or to assemble generated clips into a finished vertical video.
---

# DIY Transformation Reel

This format is a vertical 9:16 video of 10–20 s. One locked camera angle watches a dull space become a dream space. A recurring host does each step. There are 15–20 cuts on the beat and an SFX hit on each cut. The video ends on the reveal and loops back to the "before" shot.

Read `../../../docs/niroz-frame-content-research.md` for the analysis behind this.

## Workflow

Work through these stages in order. Save outputs under `reels/<slug>/`.

### 1. Concept (`concept.md`)
- Pick an idea from `references/idea-bank.md` or invent one. It must be cheap-looking materials, a dramatic visual payoff and something pinnable.
- Write a **hook line**, a **curiosity caption** ("Watch this ___ become a ___…") and 5 hashtags.
- Name the **payoff moment**: the light turning on, the tape being pulled, or water flowing.

### 2. Host
- If `references/character-bible.md` has no filled-in host yet, fill it in with the user. The host must be original, not a copy of an existing creator.
- Every image prompt must include the host's **identity block** and **outfit block** verbatim.

### 3. Keyframe storyboard (`storyboard.md`)
- Write 8 states (K0…K7) of the **same room, same camera**. Change one thing per step.
- Use `references/prompt-templates.md` § Keyframes. K0 is generated from text. K1–K7 are **edits of the previous keyframe**. Always attach the previous keyframe and the host reference sheet.

### 4. Motion prompts (`motion.md`)
- For each pair (Kn → Kn+1), write one image-to-video prompt using the first frame and the last frame. See § Motion in the templates.
- Allow 4–5 s per generated clip. Only about 1 s of each will be used.

### 5. Generate
- If the Higgsfield MCP is connected, use it for both images (edit with references) and video (start/end frame). Load its workflow instructions first, then quote and confirm the credit cost with the user before generating.
- Otherwise, hand the prompts to the user for Nano Banana / Kling / Veo.
- Save clips as `reels/<slug>/clips/01.mp4`, `02.mp4`, … in story order.

### 6. Assemble
```
.claude/skills/diy-transformation-reel/scripts/assemble.sh reels/<slug>/clips reels/<slug>/final.mp4 [music.mp3] [cuts.txt]
```
- `cuts.txt` (optional) holds one line per clip: `<start_s> <duration_s>`. The default is the middle 1.0 s of each clip, with the last clip held for 2.5 s.
- The script normalises clips to 1080×1920 at 30 fps, concatenates them, appends clip 01's opening as a loop tail, and mixes in music at −14 LUFS.
- SFX: add drill, tape-rip and whoosh hits in an editor, or generate them with ElevenLabs.

### 7. Publish checklist
- [ ] Turn on Meta's **AI info / "Made with AI"** label.
- [ ] Use the final reveal frame as the cover.
- [ ] Use the curiosity caption with the payoff after "…more".
- [ ] Add trending audio in-app if it fits.
- [ ] After 48 h, log views, saves and shares in `reels/log.csv`. Remake the top 10% of concepts with variations.

## Quality bar
- Keep the camera angle and room geometry identical across all keyframes, and keep the host's outfit identical.
- No legible fake brand text. Prompt "unbranded tools" and inspect each frame.
- The first frame must already be mid-action. Never open on a static empty room.
