// Inlined into every chapter sub-composition. Builds one paused, seek-safe GSAP timeline
// from the data-* animation hooks the generator writes. Deterministic: no clocks, no random.
(function (ID) {
  const root = document.querySelector("[data-composition-id=\"" + ID + "\"]");
  const tl = gsap.timeline({ paused: true });
  const num = (v, d = 0) => (v === undefined || v === "" ? d : parseFloat(v));
  const reps = (d, p) => Math.max(0, Math.floor(d / p) - 1);

  root.querySelectorAll(".shot").forEach((shot, si) => {
    const s = num(shot.dataset.s), d = num(shot.dataset.d);
    const q = (sel) => shot.querySelectorAll(sel);

    const cam = shot.querySelector(".cam");
    if (cam) {
      const m = cam.dataset.cam;
      const from = { push: { scale: 1, x: 0 }, pull: { scale: 1.08, x: 0 }, panL: { scale: 1.06, x: 40 }, panR: { scale: 1.06, x: -40 }, still: { scale: 1, x: 0 } }[m];
      const to = { push: { scale: 1.07, x: 0 }, pull: { scale: 1, x: 0 }, panL: { scale: 1.06, x: -40 }, panR: { scale: 1.06, x: 40 }, still: { scale: 1.02, x: 0 } }[m];
      tl.fromTo(cam, from, { ...to, duration: d, ease: "sine.inOut" }, s);
    }

    q("[data-swing]").forEach((el) => {
      // Static pose is baked into the transform attribute; swing tweens that attribute string.
      const base = num(el.dataset.rot), org = el.dataset.org;
      const [amp, period, phase] = el.dataset.swing.split(",").map(Number);
      const a = phase ? base + amp : base - amp, b = phase ? base - amp : base + amp;
      tl.fromTo(el, { attr: { transform: "rotate(" + a + " " + org + ")" } }, { attr: { transform: "rotate(" + b + " " + org + ")" }, duration: period, ease: "sine.inOut", yoyo: true, repeat: reps(d, period) }, s);
    });
    q("[data-walk]").forEach((el) => {
      const dx = Math.abs(num(el.dataset.walk));
      tl.fromTo(el, { x: -dx / 2 }, { x: dx / 2, duration: d, ease: "none" }, s);
    });
    q("[data-bob]").forEach((el) => {
      if (el.dataset.walk) return;
      tl.fromTo(el, { y: 0 }, { y: -5, duration: 1.1, ease: "sine.inOut", yoyo: true, repeat: reps(d, 1.1) }, s + num(el.dataset.bob));
    });
    q("[data-pulse]").forEach((el) => {
      const p = num(el.dataset.pulse, 1);
      tl.fromTo(el, { opacity: 1 }, { opacity: 0.4, duration: p / 2, ease: "sine.inOut", yoyo: true, repeat: reps(d, p / 2) }, s);
    });
    q("[data-ring]").forEach((el) => {
      if (el.dataset.ring === "") return;
      const p = 2.4;
      tl.fromTo(el, { scale: 0.5, opacity: 0.9, svgOrigin: "960 540" }, { scale: 2.4, opacity: 0, svgOrigin: "960 540", duration: p, ease: "power1.out", repeat: reps(d - num(el.dataset.ring), p) }, s + num(el.dataset.ring));
    });
    q("[data-in]").forEach((el) => {
      const kind = el.dataset.in, t = s + num(el.dataset.delay), dur = num(el.dataset.drawdur, 0.6);
      if (kind === "draw" && !el.getAttribute("stroke-dasharray") && el.getTotalLength) {
        const L = el.getTotalLength();
        tl.fromTo(el, { strokeDasharray: L, strokeDashoffset: L }, { strokeDashoffset: 0, duration: dur, ease: "power2.inOut" }, t);
      } else if (kind === "up") tl.fromTo(el, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, t);
      else if (kind === "right") tl.fromTo(el, { opacity: 0, x: -40 }, { opacity: 1, x: 0, duration: 0.5, ease: "power3.out" }, t);
      else if (kind === "scale") tl.fromTo(el, { opacity: 0, scale: 0.4, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1, duration: 0.45, ease: "back.out(2)" }, t);
      else tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: dur, ease: "power1.out" }, t);
    });
    q("[data-xray]").forEach((el) => {
      const t = s + num(el.dataset.xray);
      tl.fromTo(el, { clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.9, ease: "power2.inOut" }, t);
    });
    q("[data-scan]").forEach((el) => {
      const t = s + (shot.querySelector("[data-xray]") ? num(shot.querySelector("[data-xray]").dataset.xray) : 0.1);
      tl.fromTo(el, { x: -120, opacity: 1 }, { x: 2040, duration: 0.9, ease: "power2.inOut" }, t);
      tl.to(el, { opacity: 0, duration: 0.2 }, t + 0.9);
    });
    q("[data-shake]").forEach((el) => tl.fromTo(el, { x: -8 }, { x: 8, duration: 0.05, yoyo: true, repeat: reps(d - 0.5, 0.05), ease: "none" }, s + 0.5));
    q("[data-shakeel]").forEach((el) => { if (el.dataset.shakeel) tl.fromTo(el, { rotation: -3, transformOrigin: "50% 50%" }, { rotation: 3, duration: 0.06, yoyo: true, repeat: reps(d, 0.06), ease: "none" }, s); });
    q("[data-glasses-off]").forEach((el) => tl.fromTo(el, { y: 0, rotation: 0, opacity: 1, svgOrigin: "960 540" }, { y: 760, rotation: 9, opacity: 0.2, svgOrigin: "960 540", duration: 1, ease: "power2.in" }, s + num(el.dataset.glassesOff)));
    q("[data-blink]").forEach((el) => {
      tl.set(el, { y: -620 }, 0);
      const t = s + Math.min(d * 0.55, 1.6);
      tl.to(el, { y: 0, duration: 0.09, ease: "power2.in" }, t).to(el, { y: -620, duration: 0.14, ease: "power2.out" }, t + 0.12);
    });
    q("[data-look]").forEach((el) => tl.fromTo(el, { x: -18 }, { x: 18, duration: d, ease: "sine.inOut" }, s));
    q("[data-spin]").forEach((el) => {
      const deg = num(el.dataset.spin), t = s + 0.3 + num(el.dataset.spindelay);
      tl.fromTo(el, { rotation: 0, svgOrigin: el.dataset.org }, { rotation: deg, svgOrigin: el.dataset.org, duration: 1.1, ease: "power2.inOut" }, t);
    });
    q("[data-door]").forEach((el) => tl.fromTo(el, { scaleX: 1, svgOrigin: "640 540" }, { scaleX: 0.12, svgOrigin: "640 540", duration: 0.8, ease: "power2.inOut" }, s + 0.2));
    q("[data-beat]").forEach((el) => tl.fromTo(el, { scale: 1, svgOrigin: "960 520" }, { scale: 1.09, svgOrigin: "960 520", duration: 0.37, yoyo: true, repeat: reps(d, 0.37), ease: "power2.out" }, s));
    q("[data-flashel]").forEach((el) => { tl.set(el, { opacity: 0 }, 0); tl.to(el, { opacity: 1, duration: 0.05 }, s + num(el.dataset.flashel)).to(el, { opacity: 0, duration: 0.4 }, s + num(el.dataset.flashel) + 0.06); });
    q("[data-unfold]").forEach((el) => tl.fromTo(el, { scaleY: 0.15, opacity: 0.6, svgOrigin: "960 540" }, { scaleY: 1, opacity: 1, svgOrigin: "960 540", duration: 1.2, ease: "power2.out" }, s + 0.2));
    q("[data-bar]").forEach((el) => {
      const [f, delay] = el.dataset.bar.split(",").map(Number);
      tl.fromTo(el, { width: "0%" }, { width: `${f * 100}%`, duration: 1.2, ease: "power2.out" }, s + delay);
    });
    q("[data-count]").forEach((el) => {
      const [to, delay] = el.dataset.count.split(",").map(Number), o = { v: 0 };
      tl.fromTo(o, { v: 0 }, { v: to, duration: 1.2, ease: "power2.out", onUpdate: () => { el.textContent = Math.round(o.v); } }, s + delay);
    });
    q("[data-flip]").forEach((el) => tl.fromTo(el, { scaleX: 1, svgOrigin: "760 520" }, { scaleX: 0.06, svgOrigin: "760 520", duration: 0.12, yoyo: true, repeat: 7, ease: "sine.inOut" }, s + num(el.dataset.flip)));
    q("[data-countdown]").forEach((el) => {
      const from = num(el.dataset.countdown), o = { v: from };
      tl.fromTo(o, { v: from }, { v: 0, duration: Math.min(d, from), ease: "none", onUpdate: () => { el.textContent = Math.ceil(o.v); } }, s);
    });
    q("[data-flash]").forEach((el) => tl.fromTo(el, { opacity: 1 }, { opacity: 0, duration: Math.min(1.2, d), ease: "power2.out" }, s));
    q("[data-glitch]").forEach((el) => {
      tl.fromTo(el, { opacity: 0, x: -30, skewX: 20 }, { opacity: 1, x: 0, skewX: 0, duration: 0.35, ease: "steps(5)" }, s + num(el.dataset.glitch));
    });
  });

  window.__timelines[ID] = tl;
})(document.currentScript ? document.currentScript.dataset.id : "__ID__");
