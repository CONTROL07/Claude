// CO7 BRAND ENGINE — identical in every video. Do not edit per video.
// It owns: layers, camera, iris sting, micro panel, dim, badges, captions, chapter timeline,
// recap + CTA cards, and the deterministic frame clock (window.__seek).
// A video supplies: video.js (window.VIDEO), lines.js (window.LINES), scene.js (window.SCENE).
(() => {
'use strict';
const NS = 'http://www.w3.org/2000/svg';
const C = { bg: '#F8FBFE', panel: '#EAF5FD', grid: '#D6E9F7', ink: '#1B2A3A', blue: '#2E9BEA', lblue: '#BFE2F8',
  red: '#D0111B', mint: '#3CC8A0', sun: '#FFC83D', grey: '#9AA8B8', metal: '#DCE6EF', food: '#F2D3A0', text2: '#5B6878' };
const S = { stroke: C.ink, 'stroke-width': 2.5, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' };   // standard outline

// ---------- basic helpers ----------
const svg = document.getElementById('svg');
const el = (tag, attrs = {}, parent = svg) => {
  const n = document.createElementNS(NS, tag);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  parent.appendChild(n);
  return n;
};
const set = (n, attrs) => { for (const k in attrs) n.setAttribute(k, attrs[k]); };
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, p) => a + (b - a) * p;
const EASE = {
  io: gsap.parseEase('power2.inOut'), o: gsap.parseEase('power2.out'), i: gsap.parseEase('power2.in'),
  x: gsap.parseEase('expo.inOut'), b: gsap.parseEase('back.out(1.8)'), l: p => p,
};
const hexLerp = (h1, h2, p) => {
  const a = [1, 3, 5].map(i => parseInt(h1.slice(i, i + 2), 16)), b = [1, 3, 5].map(i => parseInt(h2.slice(i, i + 2), 16));
  return '#' + a.map((v, i) => Math.round(lerp(v, b[i], p)).toString(16).padStart(2, '0')).join('');
};
const pts = a => a.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');

// keyframe tracks: track(name, initial, [[start, duration, target, ease], ...]); V(name, t) -> value
const TR = {};
const track = (name, init, steps) => { TR[name] = { init, steps: steps.sort((a, b) => a[0] - b[0]) }; };
const V = (name, t) => {
  const tr = TR[name]; if (!tr) return undefined;
  let v = tr.init;
  for (const [t0, d, to, e] of tr.steps) {
    if (t < t0) break;
    const p = EASE[e || 'io'](d > 0 ? clamp((t - t0) / d) : 1);
    v = Array.isArray(v) ? v.map((x, i) => lerp(x, to[i], p)) : lerp(v, to, p);
  }
  return v;
};
const env = (t, a, b, fin = 0.35, fout = 0.35) => clamp((t - a) / fin) * (b == null ? 1 : clamp((b - t) / fout));

// ---------- isometric projection ----------
const iso = (ox = 428, oy = 500) => {
  const P = (x, y, z) => [ox + (x - z) * 0.8660254, oy + (x + z) * 0.5 - y];
  return { P, ell: r => [r * 1.2247, r * 0.7071] };       // horizontal circle radius -> screen ellipse semi-axes
};

// sine wiggle along a polyline, revealed up to prog (0..1)
function wavePath(points, amp, wl, phase, prog) {
  const segs = []; let total = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const [x0, y0] = points[i], [x1, y1] = points[i + 1], L = Math.hypot(x1 - x0, y1 - y0);
    segs.push({ x0, y0, dx: (x1 - x0) / L, dy: (y1 - y0) / L, L, s: total }); total += L;
  }
  const lim = total * prog; let d = '', tip = points[0], dir = [1, 0];
  for (let s = 0; s <= lim; s += 6) {
    const sg = segs.find(g => s <= g.s + g.L) || segs[segs.length - 1];
    const u = s - sg.s, taper = Math.min(1, s / 40, (total - s) / 40);
    const w = Math.sin((s / wl) * Math.PI * 2 - phase) * amp * taper;
    const x = sg.x0 + sg.dx * u - sg.dy * w, y = sg.y0 + sg.dy * u + sg.dx * w;
    d += (d ? 'L' : 'M') + x.toFixed(1) + ',' + y.toFixed(1);
    tip = [x, y]; dir = [sg.dx, sg.dy];
  }
  return { d: d || 'M0,0', tip, dir, empty: !d };
}
const arrowHead = (tip, dir, size = 16) => {
  const [x, y] = tip, [dx, dy] = dir, nx = -dy, ny = dx;
  return pts([[x + dx * size, y + dy * size], [x + nx * size * 0.6, y + ny * size * 0.6], [x - nx * size * 0.6, y - ny * size * 0.6]]);
};

// ---------- layers ----------
const defs = el('defs');
const gridPat = el('pattern', { id: 'grid', width: 48, height: 48, patternUnits: 'userSpaceOnUse' }, defs);
el('path', { d: 'M48 0H0V48', fill: 'none', stroke: C.grid, 'stroke-width': 1.5 }, gridPat);
const dots = el('pattern', { id: 'dots', width: 14, height: 14, patternUnits: 'userSpaceOnUse' }, defs);
el('circle', { cx: 7, cy: 7, r: 2.2, fill: C.ink, opacity: 0.35 }, dots);
const irisClip = el('clipPath', { id: 'iris' }, defs);
const irisC = el('circle', { cx: 480, cy: 470, r: 900 }, irisClip);

const worldG = el('g', { 'clip-path': 'url(#iris)' });
el('rect', { width: 960, height: 1030, fill: 'url(#grid)', opacity: 0.55 }, worldG);
const camG = el('g', {}, worldG);
const microBg = el('rect', { width: 960, height: 1030, fill: C.panel, opacity: 0 });
const microGrid = el('rect', { width: 960, height: 1030, fill: 'url(#grid)', opacity: 0 });
const microL = el('g');
const stingMask = el('path', { fill: C.bg, 'fill-rule': 'evenodd', opacity: 0, d: 'M0,0H960V1030H0Z M480,208 a262,262 0 1,0 0.1,0Z' });
const stingG = el('g', { opacity: 0 });
el('circle', { cx: 480, cy: 470, r: 262, fill: 'none', stroke: C.lblue, 'stroke-width': 14 }, stingG);
const RING = 2 * Math.PI * 262;
const ring = el('circle', { cx: 480, cy: 470, r: 262, fill: 'none', stroke: C.blue, 'stroke-width': 14, 'stroke-linecap': 'round', transform: 'rotate(-90 480 470)', 'stroke-dasharray': RING, 'stroke-dashoffset': RING }, stingG);
const stingLogo = el('image', { href: 'logo_light.png', x: 400, y: 790, width: 160, height: 164 }, stingG);
const dimR = el('rect', { width: 960, height: 1030, fill: C.bg, opacity: 0 });
const badgeL = el('g');

// like + subscribe overlay (plays on VIDEO.likeLine): two pills, a cursor taps like, then subscribe
const subG = el('g', { opacity: 0 });
function pill(cx, label, fill, color) {
  const g = el('g', {}, subG);
  el('rect', { x: cx - 150, y: 852, width: 300, height: 100, rx: 50, fill: C.ink, opacity: 0.08, transform: 'translate(0,8)' }, g);
  const bg = el('rect', { x: cx - 150, y: 852, width: 300, height: 100, rx: 50, fill, ...S, 'stroke-width': 3 }, g);
  const icon = el('g', { transform: `translate(${cx + 80},902)` }, g);
  const tx = el('text', { x: cx - 20, y: 917, 'font-size': 42, 'font-weight': 700, fill: color, 'text-anchor': 'middle' }, g);
  tx.textContent = label;
  return { g, bg, icon, tx, cx };
}
const likeP = pill(310, 'لايك', '#fff', C.ink);
const thumb = el('path', { d: 'M-22,6 h10 v26 h-10z M-8,32 h26 c6,0 9,-4 10,-9 l5,-20 c1,-6 -3,-10 -9,-10 h-14 l3,-14 c1,-6 -3,-11 -8,-11 l-13,24 z', ...S, 'stroke-width': 3, fill: C.lblue, transform: 'translate(0,-6) scale(0.95)' }, likeP.icon);
const subP = pill(650, 'اشتراك', C.red, '#fff');
const bell = el('path', { d: 'M0,-26 c-13,0 -20,10 -20,22 v12 l-7,9 h54 l-7,-9 v-12 c0,-12 -7,-22 -20,-22z M-7,20 a7,7 0 0 0 14,0', fill: '#fff', stroke: '#fff', 'stroke-width': 2, 'stroke-linejoin': 'round' }, subP.icon);
const check = el('path', { d: 'M-18,0 l12,12 l24,-26', fill: 'none', stroke: '#fff', 'stroke-width': 7, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: 0 }, subP.icon);
const cursor = el('path', { d: 'M0,0 L0,46 L12,35 L21,55 L30,51 L21,32 L37,32 Z', fill: '#fff', ...S, 'stroke-width': 3 }, subG);
function likeSub(t) {
  const i = VIDEO.likeLine;
  if (i == null) { set(subG, { opacity: 0 }); return; }
  const s = LINES[i].s, next = LINES[i + 1] ? LINES[i + 1].s : LINES[i].e + 0.5, d = Math.max(1.2, next - s);
  const u = (t - s) / d;
  const op = clamp((t - s + 0.05) / 0.25) * (1 - clamp((t - next + 0.05) / 0.25));
  set(subG, { opacity: op.toFixed(3) });
  if (op <= 0) return;
  [likeP, subP].forEach((p, k) => {
    const pop = EASE.b(clamp((t - s - k * 0.08) / 0.35));
    const tapAt = k ? 0.72 : 0.42, press = 1 - 0.08 * Math.max(0, 1 - Math.abs(u - tapAt) / 0.05);
    set(p.g, { transform: `translate(${p.cx},902) scale(${(pop * press).toFixed(3)}) translate(${-p.cx},-902)` });
  });
  const liked = u >= 0.42, subbed = u >= 0.72;
  set(likeP.bg, { fill: liked ? C.blue : '#fff' }); set(likeP.tx, { fill: liked ? '#fff' : C.ink });
  set(thumb, { fill: liked ? '#fff' : C.lblue });
  set(subP.bg, { fill: subbed ? C.ink : C.red });
  subP.tx.textContent = subbed ? 'مشترك' : 'اشتراك';
  set(bell, { opacity: subbed ? 0 : 1 }); set(check, { opacity: subbed ? 1 : 0 });
  // cursor: enters bottom-right, taps like, then subscribe
  const path = [[880, 1080], [300, 915], [640, 915]];
  const m1 = EASE.io(clamp((u - 0.12) / 0.28)), m2 = EASE.io(clamp((u - 0.5) / 0.2));
  const x = lerp(lerp(path[0][0], path[1][0], m1), path[2][0], m2), y = lerp(lerp(path[0][1], path[1][1], m1), path[2][1], m2);
  set(cursor, { transform: `translate(${x.toFixed(1)},${y.toFixed(1)}) scale(${u > 0.4 && u < 0.46 || u > 0.7 && u < 0.76 ? 0.85 : 1})` });
}

// ---------- reusable components ----------
function box(P, x0, x1, y0, y1, z0, z1, fills, parent) {
  const g = el('g', {}, parent);
  el('polygon', { ...S, fill: fills[0], points: pts([P(x0, y1, z0), P(x1, y1, z0), P(x1, y1, z1), P(x0, y1, z1)]) }, g);   // top
  el('polygon', { ...S, fill: fills[1], points: pts([P(x0, y0, z1), P(x1, y0, z1), P(x1, y1, z1), P(x0, y1, z1)]) }, g);   // front-left
  el('polygon', { ...S, fill: fills[2], points: pts([P(x1, y0, z0), P(x1, y0, z1), P(x1, y1, z1), P(x1, y1, z0)]) }, g);   // front-right
  return g;
}
function callout(parent, x1, y1, x2, y2, text, size = 30) {
  const g = el('g', {}, parent);
  const L = Math.hypot(x2 - x1, y2 - y1);
  const line = el('path', { d: `M${x1},${y1}L${x2},${y2}`, stroke: C.ink, 'stroke-width': 2, fill: 'none', 'stroke-dasharray': L, 'stroke-dashoffset': L }, g);
  el('circle', { cx: x1, cy: y1, r: 5, fill: C.ink }, g);
  const tx = el('text', { x: x2 + (x2 < x1 ? -10 : 10), y: y2 + 10, 'font-size': size, 'font-weight': 600, fill: C.ink, 'text-anchor': x2 < x1 ? 'end' : 'start', opacity: 0 }, g);
  tx.textContent = text;
  return p => { set(line, { 'stroke-dashoffset': L * (1 - clamp(p * 1.6)) }); set(tx, { opacity: clamp(p * 2 - 0.8) }); g.style.display = p > 0 ? '' : 'none'; };
}
// analogy badge (top-right of the window): build the icon inside the returned group, drive it with showBadge(g, p)
function badge() {
  const g = el('g', { opacity: 0 }, badgeL);
  el('rect', { x: -70, y: -70, width: 140, height: 140, rx: 22, fill: '#fff', ...S, 'stroke-width': 3 }, g);
  return g;
}
const showBadge = (g, p) => set(g, { opacity: clamp(p * 3), transform: `translate(870,90) scale(${EASE.b(clamp(p)).toFixed(3)})` });
function thermo(parent, x, y, color) {
  const g = el('g', { transform: `translate(${x},${y})` }, parent);
  el('rect', { x: -14, y: -78, width: 28, height: 92, rx: 14, fill: '#fff', ...S }, g);
  const lvl = el('rect', { x: -6, y: 0, width: 12, height: 0, rx: 6, fill: color }, g);
  el('circle', { cx: 0, cy: 20, r: 20, fill: color, ...S }, g);
  return { g, level: p => set(lvl, { y: 8 - p * 74, height: p * 74 + 4 }) };
}
// water molecule (O blue, 2 H light blue). place(m, x, y, angleDeg, scale)
function h2o(parent) {
  const g = el('g', {}, parent);
  const a = 52.25 * Math.PI / 180, d = 64;
  const hp = [[-Math.sin(a) * d, Math.cos(a) * d], [Math.sin(a) * d, Math.cos(a) * d]];
  hp.forEach(([x, y]) => el('line', { x1: 0, y1: 0, x2: x, y2: y, stroke: C.ink, 'stroke-width': 7 }, g));
  hp.forEach(([x, y]) => el('circle', { cx: x, cy: y, r: 28, fill: C.lblue, ...S, 'stroke-width': 3 }, g));
  el('circle', { cx: 0, cy: 0, r: 46, fill: C.blue, ...S, 'stroke-width': 3 }, g);
  el('path', { d: 'M-22,-22 a26,26 0 0 1 22,-12', stroke: '#fff', 'stroke-width': 5, fill: 'none', 'stroke-linecap': 'round', opacity: 0.7 }, g);
  return { g, hp };
}
const place = (m, x, y, ang, k) => set(m.g, { transform: `translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${ang.toFixed(2)}) scale(${k.toFixed(3)})` });
// a full-window micro scene group (shown on the blue panel); zoom-in entrance when driven by microScene(g, p)
const micro = () => el('g', { opacity: 0 }, microL);
const microScene = (g, p, cx = 480, cy = 500) => set(g, { opacity: p, transform: `translate(${cx},${cy}) scale(${(0.82 + 0.18 * EASE.o(clamp(p))).toFixed(3)}) translate(${-cx},${-cy})` });

// ---------- captions ----------
const capEl = document.getElementById('cap');
let capIdx = -2;
function captions(t) {
  const V0 = window.VIDEO;
  let i = -1;
  for (let k = 0; k < LINES.length; k++) if (t >= LINES[k].s - 0.06) i = k;
  if (i >= V0.ctaLine) i = -1;                                    // CTA lines are shown in the end card
  if (i !== capIdx) {
    capIdx = i;
    if (i < 0) { capEl.innerHTML = ''; return; }
    let h = LINES[i].t;
    for (const [a, b] of Object.entries(V0.display || {})) h = h.split(a).join(b);
    (V0.keywords[i] || []).forEach(([w, c]) => { h = h.replace(w, `<span class="k ${c}">${w}</span>`); });
    capEl.innerHTML = h;
  }
  if (i < 0) return;
  const p = clamp((t - LINES[i].s + 0.06) / 0.22);
  capEl.style.color = hexLerp(C.grey, C.ink, p);
  capEl.style.opacity = 0.4 + 0.6 * p;
  capEl.style.transform = `translateY(${((1 - EASE.o(p)) * 14).toFixed(1)}px)`;
  const u = EASE.o(clamp((t - LINES[i].s - 0.25) / 0.35));
  capEl.querySelectorAll('.k').forEach(k => { k.style.setProperty('--u', (u * 100).toFixed(1) + '%'); k.style.color = u > 0 ? '' : hexLerp(C.grey, C.ink, p); });
}

// ---------- chapter timeline (header, RTL: starts on the right) ----------
const tl = document.getElementById('tl');
let TLS = [];
function buildTimeline() {
  const ch = VIDEO.chapters, n = ch.length, gap = 12, W = 764, segW = (W - gap * (n - 1)) / n;
  TLS = ch.map((c, i) => {
    const x0 = W - (i + 1) * segW - i * gap;
    el('rect', { x: x0, y: 14, width: segW, height: 8, rx: 4, fill: C.grid }, tl);
    const fill = el('rect', { x: x0 + segW, y: 14, width: 0, height: 8, rx: 4, fill: C.red }, tl);
    const head = el('circle', { cx: x0 + segW, cy: 18, r: 0, fill: C.red, stroke: '#fff', 'stroke-width': 3 }, tl);
    const num = el('text', { x: x0 + segW, y: 60, 'font-size': 20, 'font-weight': 700, fill: C.grey, 'text-anchor': 'end', direction: 'ltr' }, tl);
    num.textContent = String(i + 1).padStart(2, '0');
    const lab = el('text', { x: x0 + segW - 34, y: 61, 'font-size': 23, 'font-weight': 500, fill: C.grey, 'text-anchor': 'start' }, tl);
    lab.textContent = c.label;
    const end = i + 1 < n ? ch[i + 1].at : VIDEO.audioEnd;
    return { x0, segW, fill, head, num, lab, start: c.at, end };
  });
}
function timeline(t) {
  TLS.forEach(s => {
    const p = clamp((t - s.start) / (s.end - s.start)), active = t >= s.start && t < s.end;
    const w = s.segW * p;
    set(s.fill, { x: s.x0 + s.segW - w, width: w });
    set(s.head, { cx: s.x0 + s.segW - w, r: active ? 9 : 0 });
    const done = p >= 1;
    set(s.lab, { fill: active ? C.ink : done ? C.text2 : C.grey, 'font-weight': active ? 700 : 500 });
    set(s.num, { fill: active || done ? C.red : C.grey });
  });
}

// ---------- cards ----------
function fillCards() {
  const r = VIDEO.recap, q = s => document.querySelector(s);
  q('#recap .title').innerHTML = r.title;
  q('#recap .legend').innerHTML = r.legend.map((x, i) => `<div><span>${i + 1}</span>${x}</div>`).join('');
  q('#recap .hero b').innerHTML = r.hero.value;
  q('#recap .hero p').innerHTML = r.hero.text;
  q('#recap .pts').innerHTML = r.points;
  q('#cta .l1').innerHTML = VIDEO.cta.l1;
  q('#cta .l2').innerHTML = VIDEO.cta.l2;
}

// ---------- frame ----------
let STING;
function render(t) {
  if (window.SCENE.render) window.SCENE.render(t, K);
  // camera
  const cam = V('cam', t) || [480, 560, 1.18];
  set(camG, { transform: `translate(480,500) scale(${cam[2].toFixed(4)}) translate(${(-cam[0]).toFixed(2)},${(-cam[1]).toFixed(2)})` });
  // iris sting (automatic, on the tagline line)
  const [s0, s1] = STING;
  const irisR = t < s1 - 0.09 ? lerp(900, 262, EASE.o(clamp((t - s0 + 0.16) / 0.45))) : lerp(262, 900, EASE.i(clamp((t - s1 + 0.09) / 0.6)));
  set(irisC, { r: irisR.toFixed(1) });
  const so = clamp((t - s0 + 0.11) / 0.3) * (1 - EASE.i(clamp((t - s1 + 0.09) / 0.4)));
  set(stingG, { opacity: so.toFixed(3) }); set(stingMask, { opacity: so.toFixed(3) });
  set(ring, { 'stroke-dashoffset': (RING * (1 - EASE.io(clamp((t - s0) / Math.max(0.3, s1 - s0 - 0.1))))).toFixed(1) });
  set(stingLogo, { opacity: clamp((t - s0 - 0.04) / 0.3) });
  // micro panel + dim
  const mi = V('micro', t) || 0;
  set(microBg, { opacity: mi }); set(microGrid, { opacity: mi * 0.8 });
  set(dimR, { opacity: V('dim', t) || 0 });
  // cards
  const rc = clamp((t - LINES[VIDEO.recapLine].s + 0.08) / 0.5), ct = clamp((t - LINES[VIDEO.ctaLine].s + 0.06) / 0.5);
  const recap = document.getElementById('recap'), cta = document.getElementById('cta');
  recap.style.opacity = (EASE.o(rc) * (1 - ct)).toFixed(3);
  recap.style.transform = `translateY(${((1 - EASE.o(rc)) * 30).toFixed(1)}px)`;
  cta.style.opacity = EASE.o(ct).toFixed(3);
  document.querySelector('#cta .cursor').style.opacity = Math.floor(t * 2) % 2 ? 0 : 1;
  likeSub(t);
  captions(t);
  timeline(t);
}

const K = window.K = {
  C, S, el, set, clamp, lerp, EASE, hexLerp, pts, track, V, env, iso, wavePath, arrowHead,
  box, callout, badge, showBadge, thermo, h2o, place, micro, microScene,
  layers: { svg, world: worldG, camera: camG, micro: microL, badges: badgeL },
  start() {
    STING = [LINES[VIDEO.stingLine].s, LINES[VIDEO.stingLine + 1].s];
    buildTimeline(); fillCards();
    window.SCENE.build(K);
    if (window.SCENE.recap) window.SCENE.recap(document.getElementById('recapArt'), K);
    // keep engine overlays above scene content
    [dimR, microBg, microGrid, microL, stingMask, stingG, badgeL, subG].forEach(n => svg.appendChild(n));
    window.__END = VIDEO.audioEnd + (VIDEO.tail || 1.6);
    window.__seek = t => { render(t); return true; };
    window.__ready = document.fonts.ready.then(() => { render(0); return true; });
  },
};
})();
