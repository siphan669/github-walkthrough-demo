// "What If Your Brain Suddenly Used 100% of Its Potential?" — original story.
// Each line: [speaker, text, visual]. Speakers: N narrator, J Jonah, R Ray (dad),
// O Dr. Okafor, K Rhett Kane. A visual of null keeps the previous shot on screen.
// Visual kinds are React components in src/shots/ (see src/Shot.tsx).

export const VOICES = {
  N: { voice: "am_michael", speed: 0.9 },
  J: { voice: "am_liam", speed: 0.97 },
  R: { voice: "am_eric", speed: 0.92 },
  O: { voice: "af_heart", speed: 0.95 },
  K: { voice: "bm_lewis", speed: 0.9 },
};

const ch = (c) => (pose = "stand", x = 50, o = {}) => ({ c, pose, x, ...o });
const jonah = ch("jonah"), ray = ch("ray"), okafor = ch("okafor"), kane = ch("kane");
const guard = ch("guard"), nurse = ch("nurse"), guest = ch("guest");
const lit = (pose, x, o = {}) => jonah(pose, x, { glow: "#a78bfa", ...o });

export const CHAPTERS = [
  {
    id: "c00", title: null, music: "tense",
    lines: [
      ["N", "Every neuron in your brain... firing at once.", { k: "brain", level: 100 }],
      ["N", "You read a nine-hundred-page book in four minutes.", { k: "book" }],
      ["N", "You learn Japanese before lunch.", { k: "language" }],
      ["K", "A brain like yours is worth more than my whole company.", { k: "scene", bg: "lab", chars: [kane("talk", 36), lit("stand", 62, { face: -1 })] }],
      ["N", "Seventy-two hours. That's how long a brain can burn at one hundred percent.", { k: "hours", value: 72 }],
      ["N", "And one choice nobody else would make.", { k: "scene", bg: "garage", chars: [ray("stand", 40), jonah("stand", 60, { face: -1 })] }],
      [null, "", { k: "titlecard", big: "WHAT IF YOUR BRAIN USED", hero: "100%?", dur: 3.2 }],
    ],
  },
  {
    id: "c01", title: "Ten percent", music: "calm",
    lines: [
      ["N", "You're Jonah. Seventeen. A solid C student.", { k: "scene", bg: "street", chars: [jonah("walk", 50)] }],
      ["N", "Your dad, Ray, runs a two-bay garage that smells like oil and coffee.", { k: "scene", bg: "garage", chars: [ray("hold", 44), jonah("stand", 64, { face: -1 })] }],
      ["R", "You don't have to be a genius, kid. You just have to be kind.", { k: "scene", bg: "garage", chars: [ray("talk", 44), jonah("stand", 64, { face: -1, mood: "happy" })] }],
      ["N", "Lately, you've been getting headaches. So the doctors order a brain scan.", { k: "scene", bg: "mri", chars: [nurse("stand", 30)] }],
      ["N", "That night, a storm knocks out half the city.", { k: "scene", bg: "street", lightning: true, chars: [] }],
      ["N", "And lightning hits the hospital... while you're inside the scanner.", { k: "scene", bg: "mri", impact: true, chars: [nurse("sad", 30)] }],
      ["N", "You've heard the myth that we only use ten percent of our brains. It isn't true. Most of it is always busy.", { k: "brain", level: 10 }],
      ["N", "But when you wake up, every neuron is firing. All at once.", { k: "brain", level: 100 }],
    ],
  },
  {
    id: "c02", title: "One hundred percent", music: "tense",
    lines: [
      ["N", "The first thing you notice is the ceiling.", { k: "scene", bg: "hospital", neurons: true, chars: [lit("stand", 50)] }],
      ["N", "One thousand, two hundred and forty-eight tiles. You didn't try to count them.", { k: "tiles" }],
      ["N", "The patient in the next bed. You read his chart upside down, from across the room.", { k: "chart" }],
      ["N", "The dose is wrong. A decimal point in the wrong place. Ten times too much.", null],
      ["J", "Nurse? Bed four. Check the decimal.", { k: "scene", bg: "hospital", chars: [lit("point", 36), nurse("stand", 62, { face: -1 })] }],
      ["N", "She checks. She goes pale. She fixes it.", { k: "scene", bg: "hospital", chars: [jonah("stand", 36), nurse("sad", 62, { face: -1 })] }],
      ["N", "By lunch you've read every book in the waiting room. By dinner, you speak Japanese.", { k: "language" }],
      ["N", "Back at the garage, you hear an engine idle once... and know which cylinder is misfiring.", { k: "engine" }],
      ["R", "Number three? How did you... I didn't even pop the hood.", { k: "scene", bg: "garage", chars: [ray("talk", 40), lit("stand", 62, { face: -1 })] }],
    ],
  },
  {
    id: "c03", title: "Seventy-two hours", music: "calm",
    lines: [
      ["N", "Then the headaches come back. Worse.", { k: "scene", bg: "home", chars: [jonah("sad", 50)] }],
      ["N", "Doctor Imani Okafor runs a second scan.", { k: "scene", bg: "hospital", chars: [okafor("stand", 40), jonah("stand", 62, { face: -1 })] }],
      ["O", "Your brain is using four times the energy it should. It's running hot. Like an engine with no limiter.", { k: "thermo" }],
      ["O", "At this rate... you have about seventy-two hours.", { k: "hours", value: 72 }],
      ["N", "There's only one machine on Earth that can turn a brain back down.", { k: "damper" }],
      ["N", "It's a prototype. It belongs to NeuroKane. And to its founder, Rhett Kane.", { k: "scene", bg: "lab", chars: [kane("stand", 50)] }],
    ],
  },
  {
    id: "c04", title: "Five things", music: "tense",
    lines: [
      ["N", "Kane meets you himself. Big smile. Firm handshake.", { k: "scene", bg: "lab", chars: [kane("talk", 36), lit("stand", 62, { face: -1 })] }],
      ["K", "Of course we'll help you, Jonah. That's what we do.", null],
      ["N", "At one hundred percent, you notice five things.", { k: "brain", level: 100 }],
      ["N", "One. When he sees your scan, his pupils get wider. Not worried. Hungry.", { k: "scene", bg: "lab", label: "1 · HIS EYES", chars: [kane("stand", 50, { mood: "smug" })] }],
      ["N", "Two. The consent form. Clause fourteen, in tiny print: the subject agrees to indefinite study.", { k: "contract" }],
      ["N", "Three. The lab door beeps four times when he types the code. Four different tones.", { k: "keypad" }],
      ["N", "Four. The machine needs a voice command to reset. His voice. Nobody else's.", { k: "damper", label: "4 · VOICE LOCK" }],
      ["N", "Five. In the window behind him, you read his phone in the reflection.", { k: "reflection" }],
      ["N", "He isn't planning to turn your brain down. He's planning to watch it burn... and take notes.", { k: "scene", bg: "lab", chars: [kane("stand", 46, { mood: "smug" })] }],
    ],
  },
  {
    id: "c05", title: "The plan", music: "tense",
    lines: [
      ["N", "There's a catch. The harder you think, the hotter you burn.", { k: "thermo", hot: true }],
      ["N", "Every plan you run costs you minutes.", { k: "hours", value: 41, sub: "HOURS LEFT · FALLING FASTER" }],
      ["N", "So you only run it once.", { k: "brain", level: 100 }],
      ["N", "Step one. The door code is in the tones. Each tone is a number.", { k: "keypad", decode: true }],
      ["N", "Step two. Doctor Okafor records the meeting. For the medical notes.", { k: "scene", bg: "lab", chars: [okafor("hold", 30), kane("talk", 52), jonah("stand", 72, { face: -1 })] }],
      ["N", "Step three. You keep Kane talking.", { k: "scene", bg: "lab", chars: [kane("talk", 40), lit("talk", 62, { face: -1 })] }],
      ["K", "I authorize every test personally.", { k: "splice", word: 0 }],
      ["K", "The damper is our crown jewel.", { k: "splice", word: 1 }],
      ["K", "Most people never reset their thinking.", { k: "splice", word: 2 }],
      ["K", "I'm Rhett Kane, and I don't lose.", { k: "splice", word: 3 }],
    ],
  },
  {
    id: "c06", title: "The suite", music: "action",
    lines: [
      ["N", "That evening, Kane's guards walk you to an observation suite. The door locks from the outside.", { k: "scene", bg: "suite", chars: [guard("hold", 36), jonah("stand", 60, { face: -1 })] }],
      ["N", "Six hours left.", { k: "hours", value: 6 }],
      ["N", "Midnight. You know the guards' rotation by heart. Every ninety seconds, the hall is empty.", { k: "clock", time: "12:00 AM" }],
      ["N", "The keypad. Four tones you heard this morning.", { k: "keypad", decode: true }],
      ["N", "Seven. Two. Nine. One.", { k: "text", big: "7 · 2 · 9 · 1" }],
      ["N", "The door opens.", { k: "scene", bg: "lab", neurons: true, chars: [lit("walk", 40)] }],
      ["N", "The machine is right where you saw it.", { k: "damper" }],
      ["N", "And so is Kane.", { k: "scene", bg: "lab", chars: [kane("stand", 34, { mood: "smug" }), jonah("stand", 64, { face: -1, mood: "sad" })] }],
      ["K", "I've studied your scans all day, Jonah. I know how you think.", { k: "scene", bg: "lab", chars: [kane("talk", 36, { mood: "smug" }), jonah("stand", 64, { face: -1 })] }],
      ["K", "The reset needs my voice. And I'm not going to say it.", null],
      ["N", "Your head is pounding. One hundred and four degrees.", { k: "thermo", hot: true }],
      ["N", "Every second you think, you burn.", { k: "hours", value: 1, sub: "HOUR LEFT" }],
    ],
  },
  {
    id: "c07", title: "Five words", music: "action",
    lines: [
      ["J", "You already said it.", { k: "scene", bg: "lab", chars: [kane("stand", 36), lit("stand", 64, { face: -1 })] }],
      ["N", "Kane laughs.", { k: "scene", bg: "lab", chars: [kane("talk", 36, { mood: "smug" }), jonah("stand", 64, { face: -1 })] }],
      ["J", "This morning. Five words, in four different sentences.", { k: "scene", bg: "lab", chars: [kane("stand", 36), lit("talk", 64, { face: -1 })] }],
      ["N", "I authorize. Damper. Reset. Rhett Kane.", { k: "splice", word: 4, assemble: true }],
      ["N", "Doctor Okafor's recording. Cut together at one hundred percent... in your head.", { k: "splice", word: 4, assemble: true }],
      ["N", "Over the lab speakers, Kane's own voice gives the order.", { k: "scene", bg: "lab", chars: [okafor("hold", 24), kane("sad", 46), jonah("stand", 70, { face: -1 })] }],
      ["N", "The machine wakes up.", { k: "damper", on: true }],
      ["O", "Jonah, listen to me. The reset brings you back to normal. Everything you learned... it goes.", { k: "scene", bg: "lab", chars: [okafor("talk", 36), jonah("stand", 62, { face: -1 })] }],
      ["N", "Every book. Every language. Every number.", { k: "brain", level: 100 }],
      ["N", "You could stay. Burn bright for one more hour.", null],
      ["N", "You think about the garage. The coffee. Your dad's hands on an engine.", { k: "scene", bg: "garage", flash: true, chars: [ray("hold", 44), jonah("stand", 62, { face: -1, mood: "happy" })] }],
      ["J", "Do it.", { k: "scene", bg: "lab", chars: [okafor("stand", 36), jonah("stand", 62, { face: -1 })] }],
      ["N", "The machine hums.", { k: "damper", on: true }],
      ["N", "And for the first time in two days... it's quiet.", { k: "brain", level: "reset" }],
    ],
  },
  {
    id: "c08", title: "What it was for", music: "hope",
    lines: [
      ["N", "Doctor Okafor sends the recording, the contract and Kane's messages to the medical board. And the police.", { k: "scene", bg: "street", siren: true, chars: [guard("hold", 40), kane("cuffed", 58, { face: -1 })] }],
      ["N", "NeuroKane's prototype goes to a public hospital.", { k: "damper", on: true }],
      ["N", "You don't remember Japanese anymore.", { k: "brain", level: 10 }],
      ["N", "But the man in bed four does remember you. He walks out of the hospital a week later.", { k: "scene", bg: "hospital", chars: [guest("wave", 40), jonah("stand", 62, { face: -1, mood: "happy" })] }],
      ["N", "Seventy-two hours at one hundred percent. And the best thing you did with it took one sentence.", { k: "text", big: "BED FOUR", sub: "CHECK THE DECIMAL" }],
    ],
  },
  {
    id: "c09", title: "The garage", music: "piano",
    lines: [
      ["N", "Saturday. The garage.", { k: "scene", bg: "garage", chars: [ray("hold", 40), jonah("stand", 62, { face: -1 })] }],
      ["R", "So. You're back to normal?", { k: "scene", bg: "garage", chars: [ray("talk", 40), jonah("stand", 62, { face: -1 })] }],
      ["J", "Totally average.", { k: "scene", bg: "garage", chars: [ray("stand", 40), jonah("talk", 62, { face: -1, mood: "happy" })] }],
      ["N", "An engine coughs. You have no idea which cylinder it is anymore.", { k: "engine", unknown: true }],
      ["N", "So your dad shows you. Slowly. It takes three hours.", { k: "scene", bg: "garage", chars: [ray("point", 40), jonah("stand", 62, { face: -1 })] }],
      ["N", "It's the best three hours of your week.", { k: "scene", bg: "garage", chars: [ray("talk", 40, { mood: "happy" }), jonah("stand", 62, { face: -1, mood: "happy" })] }],
      ["R", "You don't have to be a genius, kid.", null],
      ["J", "Just kind. I remember.", { k: "scene", bg: "garage", chars: [ray("hug", 46), jonah("hug", 53, { face: -1, mood: "happy" })] }],
      ["N", "Would you give up a genius brain to stay yourself? Tell us in the comments.", { k: "text", big: "WOULD YOU GIVE IT UP?", sub: "TELL US IN THE COMMENTS", cta: true }],
      ["N", "Like, and subscribe.", null],
    ],
  },
];
