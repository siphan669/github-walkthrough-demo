# YouTube packaging

## Title

Pattern: `What If You <Used/Had> <Power> to <Emotional Goal>? (Part N)` — under 70 chars, the goal is
personal ("Save Your Sister", "Get Revenge on Your Bully", "Win Back Your Family").
Generate 10 with vidIQ `vidiq_generate_titles`, score the best 3 with `vidiq_score_title`, check search
demand with `vidiq_keyword_research`.

## Thumbnail (1280×720)

One character close-up with a strong emotion + one glowing gadget/power object + 2–4 word text max
(e.g. "500 IQ", "50 GUARDS"). Dark background, one accent colour, high contrast.
Generate with vidIQ `vidiq_generate_thumbnail` (or Higgsfield `generate_image` from the character
sheet), refine with `vidiq_refine_thumbnail`, score with `vidiq_score_thumbnail`; compare against
`vidiq_similar_thumbnails`.

## Description template

```
In Part <N-1>, <one-line recap>. Then <the new threat>.

Now <stakes in one sentence>. <Hero> has <time limit>, <gadget>... and <rule-bending twist hint>.

But <the hook that the obvious win isn't the end>.

<This is the final part. / Part N of M.> Watch Part 1: <url>
Part 2: <url>

<Theme question>? Tell us in the comments.

0:00 <chapter>
...            ← from the beat sheet; vidIQ `vidiq_generate_video_chapters` can verify

-----
<Channel>: where every "what if" becomes a story.
Subscribe for new What If films: <sub link>

#whatif #<power> #animation #<theme> #<channel>
```

## Tags

`what if`, `what if animation`, `animated short film`, `stickman animation`, `sci-fi story`,
`what if you had <power>`, `<power>`, `<power> part N`, theme words (`rescue mission`, `emotional story`),
channel name.

## Pinned comment

The theme question from the ending, phrased personally.

Never upload, schedule or publish (vidIQ `vidiq_video_upload`, Metricool, TikTok) without an explicit ask.
