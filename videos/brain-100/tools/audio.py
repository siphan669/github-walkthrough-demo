"""Synthesize the music beds (one per chapter, by mood) and the SFX library.

Original procedural audio: no samples, no downloads. Reads story/timeline.json.
Usage: python3 -I tools/audio.py  (from the project root)
"""
import json
import os

import numpy as np
import soundfile as sf

SR = 44100
rng = np.random.default_rng(7)


def t_axis(dur):
    return np.arange(int(dur * SR)) / SR


def env(n, a=0.01, r=0.2):
    e = np.ones(n)
    ai, ri = max(1, int(a * SR)), max(1, int(r * SR))
    e[:ai] = np.linspace(0, 1, ai)
    e[-ri:] *= np.linspace(1, 0, ri)
    return e


def tone(f, dur, kind="sine", decay=None):
    t = t_axis(dur)
    if kind == "pad":
        x = sum(np.sin(2 * np.pi * f * m * t + m) / (m * m) for m in (1, 2, 3)) + 0.5 * np.sin(2 * np.pi * f * 1.004 * t)
    elif kind == "piano":
        x = sum(np.sin(2 * np.pi * f * m * t) * (0.6 ** m) for m in (1, 2, 3, 4)) * np.exp(-t * (decay or 2.2))
    elif kind == "bass":
        x = np.tanh(2.5 * np.sin(2 * np.pi * f * t)) * np.exp(-t * (decay or 6))
    else:
        x = np.sin(2 * np.pi * f * t)
    return x


def lowpass(x, k=0.05):
    y = np.zeros_like(x)
    acc = 0.0
    for i in range(0, len(x), 1):
        acc += k * (x[i] - acc)
        y[i] = acc
    return y


def noise(dur):
    return rng.standard_normal(int(dur * SR))


def place(buf, x, at):
    i = int(at * SR)
    j = min(len(buf), i + len(x))
    if i < len(buf):
        buf[i:j] += x[: j - i]


def hz(note):
    names = {"C": -9, "D": -7, "E": -5, "F": -4, "G": -2, "A": 0, "B": 2}
    n, octv = note[:-1], int(note[-1])
    semi = names[n[0]] + (1 if "#" in n else -1 if "b" in n[1:] else 0)
    return 440 * 2 ** ((semi + (octv - 4) * 12) / 12)


CHORDS_MINOR = [["A2", "E3", "A3", "C4"], ["F2", "C3", "F3", "A3"], ["C3", "G3", "C4", "E4"], ["G2", "D3", "G3", "B3"]]
CHORDS_MAJOR = [["C3", "G3", "C4", "E4"], ["G2", "D3", "G3", "B3"], ["A2", "E3", "A3", "C4"], ["F2", "C3", "F3", "A3"]]


def pads(dur, chords, seg=4.0, vol=0.12):
    buf = np.zeros(int(dur * SR) + SR)
    t = 0.0
    k = 0
    while t < dur:
        for n in chords[k % len(chords)]:
            x = tone(hz(n), seg + 1.0, "pad") * env(int((seg + 1.0) * SR), a=1.2, r=1.4)
            place(buf, x * vol / 4, t)
        t += seg
        k += 1
    return buf[: int(dur * SR)]


def music(mood, dur):
    n = int(dur * SR)
    buf = np.zeros(n + SR)
    t = t_axis(dur)
    if mood in ("tense", "action"):
        drone = (np.sin(2 * np.pi * 55 * t) + 0.6 * np.sin(2 * np.pi * 82.4 * t)) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.05 * t))
        buf[:n] += 0.10 * drone
        bpm = 100 if mood == "tense" else 132
        beat = 60 / bpm
        kick = np.sin(2 * np.pi * (50 + 80 * np.exp(-t_axis(0.35) * 25)) * t_axis(0.35)) * np.exp(-t_axis(0.35) * 9)
        hat = lowpass(noise(0.05), 0.9) * np.exp(-t_axis(0.05) * 80)
        k = 0
        x = 0.0
        while x < dur:
            place(buf, kick * (0.35 if mood == "tense" else 0.45), x)
            if mood == "action":
                place(buf, tone(hz(["A1", "A1", "C2", "A1", "G1", "A1", "E2", "A1"][k % 8]), beat / 2, "bass") * 0.16, x)
                place(buf, tone(hz(["A1", "A1", "C2", "A1", "G1", "A1", "E2", "A1"][k % 8]), beat / 2, "bass") * 0.12, x + beat / 2)
            place(buf, hat * 0.05, x + beat / 2)
            x += beat
            k += 1
        buf[:n] += pads(dur, CHORDS_MINOR, seg=beat * 8, vol=0.07)
    elif mood == "calm":
        buf[:n] += pads(dur, CHORDS_MINOR, seg=4.0, vol=0.13)
        buf[:n] += 0.04 * np.sin(2 * np.pi * 55 * t)
    elif mood == "hope":
        buf[:n] += pads(dur, CHORDS_MAJOR, seg=3.2, vol=0.13)
        arp = ["C5", "E5", "G5", "E5", "B4", "D5", "G5", "D5", "C5", "E5", "A5", "E5", "A4", "C5", "F5", "C5"]
        x, k = 0.0, 0
        while x < dur:
            place(buf, tone(hz(arp[k % len(arp)]), 1.2, "piano", 3.0) * 0.07, x)
            x += 0.4
            k += 1
    elif mood == "piano":
        buf[:n] += pads(dur, CHORDS_MAJOR, seg=4.8, vol=0.07)
        melody = ["E4", "G4", "C5", "B4", "A4", "G4", "E4", "D4", "C4", "E4", "G4", "A4", "G4", "E4", "D4", "C4"]
        x, k = 0.5, 0
        while x < dur:
            note = melody[k % len(melody)]
            place(buf, tone(hz(note), 2.6, "piano", 1.6) * 0.16, x)
            if k % 4 == 0:
                place(buf, tone(hz(note) / 4, 3.5, "piano", 1.0) * 0.12, x)
            x += 1.2
            k += 1
    out = buf[:n] * env(n, a=1.0, r=1.6)
    peak = np.max(np.abs(out)) or 1
    return out / peak * 0.5


def sfx_lib():
    d = {}
    w = noise(0.9)
    d["whoosh"] = lowpass(w, 0.08) * np.sin(np.linspace(0, np.pi, len(w))) ** 2 * 3
    t = t_axis(1.6)
    d["hum"] = (np.sin(2 * np.pi * 120 * t) + 0.5 * np.sin(2 * np.pi * 240 * t) + 0.3 * np.sin(2 * np.pi * 1800 * t * (1 + 0.2 * t))) * env(len(t), 0.2, 0.6) * 0.35
    ring = np.zeros(int(2.4 * SR))
    for k in range(2):
        burst = (np.sin(2 * np.pi * 1400 * t_axis(0.5)) * np.sign(np.sin(2 * np.pi * 20 * t_axis(0.5)))) * 0.3
        place(ring, burst * env(len(burst), 0.01, 0.05), k * 1.2)
    d["ring"] = ring
    d["click"] = np.concatenate([lowpass(noise(0.02), 0.6) * 1.5, np.zeros(int(0.06 * SR)), lowpass(noise(0.04), 0.4) * np.exp(-t_axis(0.04) * 60) * 2])
    ticks = np.zeros(int(3.5 * SR))
    for k in range(18):
        place(ticks, lowpass(noise(0.012), 0.7) * 0.8, 0.15 + k * 0.17)
    d["ticks"] = ticks
    hb = np.zeros(int(3.0 * SR))
    for k in range(4):
        thump = np.sin(2 * np.pi * 55 * t_axis(0.18)) * np.exp(-t_axis(0.18) * 22)
        place(hb, thump, k * 0.75)
        place(hb, thump * 0.7, k * 0.75 + 0.22)
    d["heartbeat"] = hb * 0.9
    tb = t_axis(0.18)
    d["blip"] = np.sin(2 * np.pi * (880 + 600 * tb / 0.18) * tb) * env(len(tb), 0.005, 0.1) * 0.25
    tb = t_axis(3.0)
    d["boom"] = (np.sin(2 * np.pi * (40 + 60 * np.exp(-tb * 4)) * tb) * np.exp(-tb * 1.5) + lowpass(noise(3.0), 0.03) * np.exp(-tb * 2) * 2) * 0.8
    tb = t_axis(0.7)
    d["zap"] = (lowpass(noise(0.7), 0.5) * np.exp(-tb * 6) + np.sin(2 * np.pi * 2000 * np.exp(-tb * 5) * tb) * np.exp(-tb * 6)) * 0.6
    tb = t_axis(2.5)
    d["rumble"] = lowpass(noise(2.5), 0.01) * env(len(tb), 0.3, 0.8) * 6
    d["tick"] = lowpass(noise(0.015), 0.8) * 0.9
    tb = t_axis(3.0)
    d["siren"] = np.sin(2 * np.pi * np.cumsum(700 + 250 * np.sin(2 * np.pi * 0.8 * tb)) / SR) * env(len(tb), 0.4, 0.8) * 0.12
    return d


def main():
    tl = json.load(open("story/timeline.json"))
    os.makedirs("public/music", exist_ok=True)
    os.makedirs("public/sfx", exist_ok=True)
    for ch in tl["chapters"]:
        sf.write(f"public/music/{ch['id']}.wav", music(ch["music"], ch["dur"]).astype(np.float32), SR)
        print("music", ch["id"], ch["music"], ch["dur"])
    for name, x in sfx_lib().items():
        x = np.clip(x, -1, 1)
        sf.write(f"public/sfx/{name}.wav", x.astype(np.float32), SR)
    print("sfx done")


if __name__ == "__main__":
    main()
