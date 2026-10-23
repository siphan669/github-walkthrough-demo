# github-walkthrough-demo
Demo repo created to walk through GitHub capabilities via Runable

## What-If story videos

Claude Code skills for making Ifverse-style "What If…" animated story videos about any topic live in
`.claude/skills/`. Start with `what-if-story-video` (the orchestrator); it uses the HyperFrames skills
(installed from `heygen-com/hyperframes`, pinned in `skills-lock.json`) for composition, animation,
audio, voice and rendering. Ask: *"Make a what-if video about <topic>"*.

## Remotion (React video editing)

The official Remotion agent skills (`remotion-dev/skills`, pinned in `skills-lock.json`) are installed in
`.claude/skills/remotion-*`; start from `remotion-best-practices`, which routes to the rest.

In Claude Code cloud sessions Remotion cannot download its own browser (`remotion.media` is not reachable),
so render with the headless Chrome that HyperFrames installs (the SessionStart hook keeps it present):

```bash
npx remotion render <CompositionId> out/video.mp4 \
  --browser-executable="$(ls -d /root/.cache/hyperframes/chrome/chrome-headless-shell/*/chrome-headless-shell-linux64/chrome-headless-shell | head -1)"
```
