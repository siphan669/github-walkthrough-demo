# Prompt Templates

## Global style suffix (append to every image prompt)
```
Vertical 9:16, photorealistic smartphone photo, wide shot from fixed tripod at chest height, same camera position and lens as reference, natural daylight plus warm practical light, high detail, unbranded tools, no text, no watermark.
```

## Keyframes (edit-chaining)

**K0: before (text-to-image)**
```
An empty <space: bare grey room corner / plain concrete backyard / dark under-stair nook>, protective plastic on the floor, <starting materials visible>. [HOST identity] [Outfit] <starting action, e.g. kneeling, pressing green painter's tape onto the wall in a large heart outline>. [style suffix]
```

**K1…K7: edits (attach the previous keyframe and the host reference)**
```
Edit this image. Keep the exact same room, camera angle, lighting and the same woman and outfit.
Change ONLY: <one step, e.g. "the inside of the taped heart is now painted soft blush pink, she holds a paint roller">.
```

Typical step ladder (adapt per project):
1. Mark or tape the outline
2. Paint, pour or fill (mid-progress)
3. Finished base, with tape removed
4. Install the structure (shelves, frame, planter body). Show a drill
5. Lighting installed and **switched on** (the payoff)
6. Decor: frames, plants, mirror
7. Furniture and soft goods
8. Final hero: host admiring it, warm evening light, candles

## Motion (image-to-video, first frame Kn → last frame Kn+1)
```
Static locked-off camera, no camera movement. The woman <action that links the two frames, e.g. rolls pink paint across the wall in smooth strokes>. Realistic hand motion, satisfying, steady pace. Room and lighting unchanged.
```
- Payoff clip: `The LED strip flicks on and glows warm pink, light blooming across the wall.`
- Reveal clip: `Slow push-in 5%, warm light gradually brightens, candles flicker.` This is the only clip that moves the camera.
- Duration 5 s, 9:16. Generate 2 takes per pair and keep the cleaner hands.

## Caption formulas
- `Watch this empty <space> become a <dream thing> 😍`
- `I turned a <cheap material> into <result>… wait for the end`
- `<Season> idea you'll want to steal 🎄`
- Then add: `Would you do this? Save it for later 📌`, plus 3–5 hashtags such as #diy #homedecor #roommakeover #<niche>
