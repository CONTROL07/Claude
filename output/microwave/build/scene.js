// CO7 – "علاش المايكروويف ماتايسخنش الطبسيل؟"
// Deterministic scene: window.__seek(t) renders the frame at time t (seconds).
(() => {
'use strict';

const C = { bg: '#F8FBFE', panel: '#EAF5FD', grid: '#D6E9F7', ink: '#1B2A3A', blue: '#2E9BEA',
  lblue: '#BFE2F8', red: '#D0111B', mint: '#3CC8A0', sun: '#FFC83D', grey: '#9AA8B8', metal: '#DCE6EF', food: '#F2D3A0' };
const END = 58.28 + 1.6;                       // voice-over end + end-card tail
const NS = 'http://www.w3.org/2000/svg';
const svg = document.getElementById('svg');

// ---------- helpers ----------
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

// Keyframe tracks: track(name, initial, [[start, duration, target, ease], ...])
const TR = {};
const track = (name, init, steps) => { TR[name] = { init, steps: steps.sort((a, b) => a[0] - b[0]) }; };
const V = (name, t) => {
  const tr = TR[name]; let v = tr.init;
  for (const [t0, d, to, e] of tr.steps) {
    if (t < t0) break;
    const p = EASE[e || 'io'](d > 0 ? clamp((t - t0) / d) : 1);
    v = Array.isArray(v) ? v.map((x, i) => lerp(x, to[i], p)) : lerp(v, to, p);
  }
  return v;
};
// on/off envelope: fade in at a, out at b
const env = (t, a, b, fin = 0.35, fout = 0.35) => clamp((t - a) / fin) * (b == null ? 1 : clamp((b - t) / fout));

// ---------- isometric projection ----------
const CO = 0.8660254, SI = 0.5, O = { x: 428, y: 500 };
const P = (x, y, z) => [O.x + (x - z) * CO, O.y + (x + z) * SI - y];
const pts = a => a.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
const isoEll = r => [r * 1.2247, r * 0.7071];             // horizontal circle -> screen ellipse semi-axes

// sine wiggle along a polyline, revealed up to `prog` (0..1); returns {d, tip, dir}
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
  return { d, tip, dir };
}
const arrowHead = (tip, dir, size = 16) => {
  const [x, y] = tip, [dx, dy] = dir, nx = -dy, ny = dx;
  return pts([[x + dx * size, y + dy * size], [x + nx * size * 0.6, y + ny * size * 0.6], [x - nx * size * 0.6, y - ny * size * 0.6]]);
};

// ---------- defs ----------
const defs = el('defs');
const gridPat = el('pattern', { id: 'grid', width: 48, height: 48, patternUnits: 'userSpaceOnUse' }, defs);
el('path', { d: 'M48 0H0V48', fill: 'none', stroke: C.grid, 'stroke-width': 1.5 }, gridPat);
const dots = el('pattern', { id: 'dots', width: 14, height: 14, patternUnits: 'userSpaceOnUse' }, defs);
el('circle', { cx: 7, cy: 7, r: 2.2, fill: C.ink, opacity: 0.35 }, dots);
const clip = el('clipPath', { id: 'iris' }, defs);
const irisC = el('circle', { cx: 480, cy: 470, r: 900 }, clip);

// ---------- WORLD (isometric microwave cutaway) ----------
const irisG = el('g', { 'clip-path': 'url(#iris)' });
el('rect', { width: 960, height: 1030, fill: 'url(#grid)', opacity: 0.55 }, irisG);
const camG = el('g', {}, irisG);
const art = el('g', { id: 'art' }, camG);
const S = { stroke: C.ink, 'stroke-width': 2.5, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' };

// shadow
el('ellipse', { cx: P(210, 0, 150)[0], cy: P(210, 0, 150)[1] + 8, rx: 330, ry: 120, fill: C.ink, opacity: 0.06 }, art);
// housing: back/hidden edges dashed
const hid = { ...S, fill: 'none', 'stroke-dasharray': '8 8', opacity: 0.45 };
el('polyline', { ...hid, points: pts([P(0, 0, 300), P(0, 0, 0), P(420, 0, 0)]) }, art);
el('polyline', { ...hid, points: pts([P(0, 0, 0), P(0, 260, 0)]) }, art);
// cavity inner surfaces (metal), seen through glass
const cav = { x0: 20, x1: 310, y0: 20, y1: 240, z0: 20, z1: 290 };
el('polygon', { ...S, fill: C.metal, points: pts([P(cav.x0, cav.y0, cav.z0), P(cav.x1, cav.y0, cav.z0), P(cav.x1, cav.y1, cav.z0), P(cav.x0, cav.y1, cav.z0)]) }, art);
el('polygon', { ...S, fill: '#CFDCE8', points: pts([P(cav.x0, cav.y0, cav.z0), P(cav.x0, cav.y0, cav.z1), P(cav.x0, cav.y1, cav.z1), P(cav.x0, cav.y1, cav.z0)]) }, art);
el('polygon', { ...S, fill: '#E6EEF5', points: pts([P(cav.x0, cav.y0, cav.z0), P(cav.x1, cav.y0, cav.z0), P(cav.x1, cav.y0, cav.z1), P(cav.x0, cav.y0, cav.z1)]) }, art);
el('polyline', { ...hid, points: pts([P(cav.x1, cav.y0, cav.z1), P(cav.x1, cav.y1, cav.z1), P(cav.x1, cav.y1, cav.z0)]) }, art);
el('polyline', { ...hid, points: pts([P(cav.x0, cav.y1, cav.z1), P(cav.x1, cav.y1, cav.z1)]) }, art);
const wallLeft = el('polygon', { fill: C.blue, opacity: 0, points: pts([P(cav.x0, cav.y0, cav.z0), P(cav.x0, cav.y0, cav.z1), P(cav.x0, cav.y1, cav.z1), P(cav.x0, cav.y1, cav.z0)]) }, art);
const wallBack = el('polygon', { fill: C.blue, opacity: 0, points: pts([P(cav.x0, cav.y0, cav.z0), P(cav.x1, cav.y0, cav.z0), P(cav.x1, cav.y1, cav.z0), P(cav.x0, cav.y1, cav.z0)]) }, art);

// magnetron + waveguide (behind the control panel)
function box(x0, x1, y0, y1, z0, z1, fills, parent = art, extra = {}) {
  const g = el('g', extra, parent);
  el('polygon', { ...S, fill: fills[0], points: pts([P(x0, y1, z0), P(x1, y1, z0), P(x1, y1, z1), P(x0, y1, z1)]) }, g);      // top
  el('polygon', { ...S, fill: fills[1], points: pts([P(x0, y0, z1), P(x1, y0, z1), P(x1, y1, z1), P(x0, y1, z1)]) }, g);      // front-left (z1)
  el('polygon', { ...S, fill: fills[2], points: pts([P(x1, y0, z0), P(x1, y0, z1), P(x1, y1, z1), P(x1, y1, z0)]) }, g);      // front-right (x1)
  return g;
}
box(310, 336, 182, 226, 150, 230, ['#9FD0F3', '#7EC0EE', '#66B2E8']);
const mag = box(336, 404, 120, 230, 130, 245, [C.lblue, C.blue, '#2386CF']);
for (let i = 0; i < 6; i++) el('polyline', { ...S, 'stroke-width': 2, fill: 'none', opacity: 0.7, points: pts([P(404, 135 + i * 16, 140), P(404, 135 + i * 16, 235)]) }, mag);
const magGlow = el('circle', { cx: P(404, 175, 188)[0], cy: P(404, 175, 188)[1], r: 34, fill: C.blue, opacity: 0 }, art);

// turntable, plate, food
const fc = P(165, 32, 155);
const [ta, tb] = isoEll(122), [pa1, pb1] = isoEll(106), [pa2, pb2] = isoEll(72), [fa, fb] = isoEll(64);
const tc = P(165, 22, 155);
el('ellipse', { cx: tc[0], cy: tc[1] + 4, rx: ta, ry: tb, fill: '#ffffff', stroke: C.ink, 'stroke-width': 2, opacity: 0.7 }, art);
const pb = P(165, 22, 155);
const plateG = el('g', {}, art);
const plateBand = el('path', { ...S, fill: '#9FD0F3', d: `M${fc[0] - pa1},${fc[1]} L${pb[0] - pa2},${pb[1]} A${pa2} ${pb2} 0 0 0 ${pb[0] + pa2},${pb[1]} L${fc[0] + pa1},${fc[1]} A${pa1} ${pb1} 0 0 1 ${fc[0] - pa1},${fc[1]}Z` }, plateG);
const plateTop = el('ellipse', { ...S, cx: fc[0], cy: fc[1], rx: pa1, ry: pb1, fill: C.lblue }, plateG);
el('ellipse', { cx: fc[0], cy: fc[1] + 4, rx: pa1 * 0.7, ry: pb1 * 0.7, fill: 'none', stroke: C.ink, 'stroke-width': 1.5, opacity: 0.35 }, plateG);
const plateWarm = el('ellipse', { cx: fc[0], cy: fc[1] + 6, rx: pa1 * 0.62, ry: pb1 * 0.62, fill: C.red, opacity: 0 }, plateG);
const FH = 70;
const food = el('path', { ...S, fill: C.food, d: `M${fc[0] - fa},${fc[1]} A${fa} ${fb} 0 0 0 ${fc[0] + fa},${fc[1]} A${fa} ${FH} 0 0 0 ${fc[0] - fa},${fc[1]}Z` }, art);
el('path', { d: `M${fc[0] - fa * 0.55},${fc[1] - FH * 0.55} q${fa * 0.25},-${FH * 0.32} ${fa * 0.6},-${FH * 0.38}`, fill: 'none', stroke: '#fff', 'stroke-width': 5, 'stroke-linecap': 'round', opacity: 0.7 }, art);
// water droplets inside the food (hidden until "عامرة بالما")
const drops = [];
[[-38, -18], [-12, -40], [18, -22], [40, -8], [-30, 6], [6, 0], [28, 14], [-6, -60], [22, -48], [-46, -2], [0, 18], [-20, -28]]
  .forEach(([dx, dy], i) => drops.push(el('circle', { cx: fc[0] + dx, cy: fc[1] + dy, r: 0, fill: C.blue, stroke: C.ink, 'stroke-width': 1.5 }, art)));
// steam
const steam = [0, 1, 2].map(i => el('path', { fill: 'none', stroke: C.red, 'stroke-width': 4, 'stroke-linecap': 'round', opacity: 0 }, art));

// housing glass (front faces) drawn over the inside
el('polygon', { ...S, fill: C.panel, 'fill-opacity': 0.28, points: pts([P(0, 260, 0), P(420, 260, 0), P(420, 260, 300), P(0, 260, 300)]) }, art);
el('polygon', { ...S, fill: C.panel, 'fill-opacity': 0.18, points: pts([P(0, 0, 300), P(420, 0, 300), P(420, 260, 300), P(0, 260, 300)]) }, art);
el('polygon', { ...S, fill: C.panel, 'fill-opacity': 0.22, points: pts([P(420, 0, 0), P(420, 0, 300), P(420, 260, 300), P(420, 260, 0)]) }, art);
// door frame with mesh window, control panel
el('polygon', { ...S, fill: 'none', opacity: 0.3, points: pts([P(12, 12, 300), P(316, 12, 300), P(316, 248, 300), P(12, 248, 300)]) }, art);
const mesh = el('polygon', { stroke: C.ink, 'stroke-width': 1.5, fill: 'url(#dots)', opacity: 0.35, points: pts([P(40, 40, 300), P(290, 40, 300), P(290, 220, 300), P(40, 220, 300)]) }, art);
const recapSource = art.cloneNode(true); recapSource.removeAttribute('id');

// microwave rays (procedural)
const src = P(310, 200, 190);
const RAYS = [
  [src, P(20, 190, 250), P(60, 240, 40), [fc[0] - 6, fc[1] - FH + 4]],
  [src, P(200, 240, 40), P(20, 80, 200), [fc[0] - 30, fc[1] - FH * 0.5]],
  [src, P(250, 20, 260), [fc[0] + 34, fc[1] - FH * 0.55]],
];
const rayG = el('g', {}, camG);
const rayEls = RAYS.map(() => ({ p: el('path', { fill: 'none', stroke: C.blue, 'stroke-width': 5, 'stroke-linecap': 'round' }, rayG), h: el('polygon', { fill: C.blue }, rayG) }));
const pings = [RAYS[0][1], RAYS[0][2], RAYS[1][1], RAYS[1][2], RAYS[2][1]].map(p => el('circle', { cx: p[0], cy: p[1], r: 0, fill: 'none', stroke: C.blue, 'stroke-width': 4 }, rayG));
// conduction arrows (food -> plate)
const condG = el('g', {}, camG);
const cond = [-40, 0, 40].map(dx => el('path', { d: `M${fc[0] + dx},${fc[1] - 20} l0,46`, stroke: C.red, 'stroke-width': 6, 'stroke-linecap': 'round', fill: 'none', 'marker-end': '' }, condG));
const condHeads = [-40, 0, 40].map(dx => el('polygon', { fill: C.red, points: pts([[fc[0] + dx - 11, fc[1] + 26], [fc[0] + dx + 11, fc[1] + 26], [fc[0] + dx, fc[1] + 42]]) }, condG));

// thermometers (hook contrast)
function thermo(x, y, color, parent) {
  const g = el('g', { transform: `translate(${x},${y})` }, parent);
  el('rect', { x: -14, y: -78, width: 28, height: 92, rx: 14, fill: '#fff', ...S }, g);
  const lvl = el('rect', { x: -6, y: 0, width: 12, height: 0, rx: 6, fill: color }, g);
  el('circle', { cx: 0, cy: 20, r: 20, fill: color, ...S }, g);
  return { g, lvl };
}
const thFood = thermo(fc[0] + 175, fc[1] - 120, C.red, camG), thPlate = thermo(fc[0] - 190, fc[1] + 10, C.blue, camG);

// callouts (leader line + label)
function callout(x1, y1, x2, y2, text, parent = camG, size = 30) {
  const g = el('g', {}, parent);
  const L = Math.hypot(x2 - x1, y2 - y1);
  const line = el('path', { d: `M${x1},${y1}L${x2},${y2}`, stroke: C.ink, 'stroke-width': 2, fill: 'none', 'stroke-dasharray': L, 'stroke-dashoffset': L }, g);
  el('circle', { cx: x1, cy: y1, r: 5, fill: C.ink }, g);
  const tx = el('text', { x: x2 + (x2 < x1 ? -10 : 10), y: y2 + 10, 'font-size': size, 'font-weight': 600, fill: C.ink, 'text-anchor': x2 < x1 ? 'end' : 'start', opacity: 0 }, g);
  tx.textContent = text;
  return p => { set(line, { 'stroke-dashoffset': L * (1 - clamp(p * 1.6)) }); set(tx, { opacity: clamp(p * 2 - 0.8) }); g.style.display = p > 0 ? '' : 'none'; };
}
const mp = P(370, 230, 190);
const coMag = callout(mp[0], mp[1] - 8, mp[0] + 70, mp[1] - 120, 'الماڭنيترون', camG, 24);
const coPlate = callout(fc[0] - pa1 + 22, fc[1] + 12, fc[0] - pa1 - 30, fc[1] + 150, 'سيراميك / زاج', camG, 22);
const coWall = callout(P(20, 150, 150)[0], P(20, 150, 150)[1], P(20, 150, 150)[0] - 60, P(20, 150, 150)[1] - 150, 'حيط ديال الحديد', camG, 22);

// ---------- MICRO scenes ----------
const microBg = el('rect', { width: 960, height: 1030, fill: C.panel, opacity: 0 });
const microGrid = el('rect', { width: 960, height: 1030, fill: 'url(#grid)', opacity: 0 });
const warm = el('rect', { width: 960, height: 1030, fill: '#FDE8E6', opacity: 0 });

function h2o(parent, k = 1) {
  const g = el('g', {}, parent);
  const a = 52.25 * Math.PI / 180, d = 64;
  const hp = [[-Math.sin(a) * d, Math.cos(a) * d], [Math.sin(a) * d, Math.cos(a) * d]];
  hp.forEach(([x, y]) => el('line', { x1: 0, y1: 0, x2: x, y2: y, stroke: C.ink, 'stroke-width': 7 }, g));
  const hs = hp.map(([x, y]) => el('circle', { cx: x, cy: y, r: 28, fill: C.lblue, ...S, 'stroke-width': 3 }, g));
  const o = el('circle', { cx: 0, cy: 0, r: 46, fill: C.blue, ...S, 'stroke-width': 3 }, g);
  el('path', { d: 'M-22,-22 a26,26 0 0 1 22,-12', stroke: '#fff', 'stroke-width': 5, fill: 'none', 'stroke-linecap': 'round', opacity: 0.7 }, g);
  return { g, hs, o, hp, k };
}
const place = (m, x, y, ang, k) => set(m.g, { transform: `translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${ang.toFixed(2)}) scale(${k.toFixed(3)})` });

// scene: single molecule
const molG = el('g', { opacity: 0 });
const fieldWave = el('path', { fill: 'none', stroke: C.blue, 'stroke-width': 6, 'stroke-linecap': 'round', opacity: 0 }, molG);
const fieldHead = el('polygon', { fill: C.blue, opacity: 0 }, molG);
const M = h2o(molG);
const plusEls = M.hp.map(() => { const g = el('g', { opacity: 0 }, molG); el('circle', { r: 22, fill: C.red }, g); el('path', { d: 'M-10,0H10M0,-10V10', stroke: '#fff', 'stroke-width': 5, 'stroke-linecap': 'round' }, g); return g; });
const minusEl = (() => { const g = el('g', { opacity: 0 }, molG); el('circle', { r: 22, fill: C.ink }, g); el('path', { d: 'M-10,0H10', stroke: '#fff', 'stroke-width': 5, 'stroke-linecap': 'round' }, g); return g; })();
const endsRing = [0, 1, 2].map(() => el('circle', { r: 0, fill: 'none', stroke: C.red, 'stroke-width': 4, 'stroke-dasharray': '10 8' }, molG));
const rotArrows = el('g', { opacity: 0 }, molG);
el('path', { d: 'M-150,-150 A212,212 0 0 1 150,-150', fill: 'none', stroke: C.ink, 'stroke-width': 4, 'stroke-dasharray': '2 12', 'stroke-linecap': 'round' }, rotArrows);
el('polygon', { points: '150,-150 128,-160 146,-176', fill: C.ink }, rotArrows);
el('polygon', { points: '-150,-150 -128,-160 -146,-176', fill: C.ink }, rotArrows);
const counterG = el('g', { opacity: 0 }, molG);
el('rect', { x: 210, y: 690, width: 540, height: 230, rx: 24, fill: '#fff', ...S }, counterG);
const counterTx = el('text', { x: 480, y: 820, 'font-size': 120, 'font-weight': 700, fill: C.red, 'text-anchor': 'middle', direction: 'ltr' }, counterG);
el('text', { x: 480, y: 885, 'font-size': 38, 'font-weight': 600, fill: C.ink, 'text-anchor': 'middle' }, counterG).textContent = 'مليار مرة فالثانية';

// scene: many molecules colliding
const fieldG = el('g', { opacity: 0 });
const FM = [];
for (let r = 0; r < 5; r++) for (let c = 0; c < 4; c++) {
  const m = h2o(fieldG); m.x = 150 + c * 220 + (r % 2) * 90; m.y = 140 + r * 190; m.seed = r * 7 + c * 3.1; FM.push(m);
}
const sparks = [];
for (let i = 0; i < 9; i++) {
  const g = el('g', { opacity: 0 }, fieldG);
  for (let j = 0; j < 6; j++) { const a = j * Math.PI / 3; el('line', { x1: Math.cos(a) * 10, y1: Math.sin(a) * 10, x2: Math.cos(a) * 26, y2: Math.sin(a) * 26, stroke: C.red, 'stroke-width': 4, 'stroke-linecap': 'round' }, g); }
  sparks.push({ g, x: 160 + ((i * 337) % 640), y: 180 + ((i * 211) % 700), t0: 28.1 + i * 0.42 });
}
const heatLines = [0, 1, 2, 3, 4, 5].map(i => el('path', { fill: 'none', stroke: C.red, 'stroke-width': 6, 'stroke-linecap': 'round', opacity: 0 }, fieldG));

// scene: ceramic lattice
const latG = el('g', { opacity: 0 });
const LAT = [];
for (let r = 0; r < 7; r++) for (let c = 0; c < 6; c++) LAT.push([150 + c * 132 + (r % 2) * 66, 140 + r * 118]);
LAT.forEach(([x, y], i) => LAT.forEach(([x2, y2], j) => { if (j > i && Math.hypot(x2 - x, y2 - y) < 150) el('line', { x1: x, y1: y, x2, y2, stroke: C.ink, 'stroke-width': 4, opacity: 0.55 }, latG); }));
LAT.forEach(([x, y], i) => el('circle', { cx: x, cy: y, r: 30, fill: i % 3 ? '#DDE7F0' : '#C9D6E2', ...S, 'stroke-width': 3 }, latG));
const latWave = el('path', { fill: 'none', stroke: C.blue, 'stroke-width': 8, 'stroke-linecap': 'round', opacity: 0.9 }, latG);
const latHead = el('polygon', { fill: C.blue }, latG);
const noWater = el('g', { opacity: 0 }, latG);
el('rect', { x: 330, y: 820, width: 300, height: 170, rx: 24, fill: '#fff', ...S }, noWater);
const nw = h2o(noWater); place(nw, 480, 890, 0, 0.6);
el('path', { d: 'M420,850 L540,950 M540,850 L420,950', stroke: C.red, 'stroke-width': 9, 'stroke-linecap': 'round' }, noWater);

// scene: ice
const iceG = el('g', { opacity: 0 });
const cube = el('g', {}, iceG);
const cubeBox = (() => {
  const s = 150, c0 = [480, 520], q = (x, y, z) => [c0[0] + (x - z) * CO * s, c0[1] + (x + z) * SI * s - y * s];
  el('polygon', { ...S, 'stroke-width': 4, fill: '#E3F3FD', points: pts([q(-1, 1, -1), q(1, 1, -1), q(1, 1, 1), q(-1, 1, 1)]) }, cube);
  el('polygon', { ...S, 'stroke-width': 4, fill: C.lblue, points: pts([q(-1, -1, 1), q(1, -1, 1), q(1, 1, 1), q(-1, 1, 1)]) }, cube);
  el('polygon', { ...S, 'stroke-width': 4, fill: '#A5D6F6', points: pts([q(1, -1, -1), q(1, -1, 1), q(1, 1, 1), q(1, 1, -1)]) }, cube);
  el('path', { d: `M${q(-0.6, 0.5, 1)[0]},${q(-0.6, 0.5, 1)[1]} l40,22`, stroke: '#fff', 'stroke-width': 8, 'stroke-linecap': 'round' }, cube);
})();
const iceLat = el('g', { opacity: 0 }, iceG);
const ICE = [];
for (let r = 0; r < 6; r++) for (let c = 0; c < 4; c++) ICE.push([170 + c * 210 + (r % 2) * 105, 150 + r * 150]);
ICE.forEach(([x, y], i) => ICE.forEach(([x2, y2], j) => { if (j > i && Math.hypot(x2 - x, y2 - y) < 200) el('line', { x1: x, y1: y, x2, y2, stroke: C.blue, 'stroke-width': 3, 'stroke-dasharray': '6 8', opacity: 0.6 }, iceLat); }));
const IM = ICE.map(([x, y], i) => { const m = h2o(iceLat); m.x = x; m.y = y; m.a = (i % 3) * 120 + 30; place(m, x, y, m.a, 0.55); return m; });
const iceWave = el('path', { fill: 'none', stroke: C.blue, 'stroke-width': 8, 'stroke-linecap': 'round', opacity: 0.9 }, iceG);
const iceHead = el('polygon', { fill: C.blue }, iceG);
// bars: water vs ice
const barsG = el('g', { opacity: 0 }, iceG);
el('rect', { x: 0, y: 0, width: 960, height: 1030, fill: C.bg }, barsG);
const bars = [[300, 'الما', C.blue], [660, 'الثلج', C.lblue]].map(([x, lab, col]) => {
  el('rect', { x: x - 90, y: 260, width: 180, height: 480, rx: 20, fill: '#fff', ...S, 'stroke-width': 4 }, barsG);
  for (let k = 1; k < 5; k++) el('line', { x1: x - 90, x2: x - 60, y1: 260 + k * 96, y2: 260 + k * 96, stroke: C.ink, 'stroke-width': 3 }, barsG);
  const f = el('rect', { x: x - 84, y: 734, width: 168, height: 0, rx: 14, fill: C.red, opacity: 0.85 }, barsG);
  el('text', { x, y: 820, 'font-size': 46, 'font-weight': 700, fill: C.ink, 'text-anchor': 'middle' }, barsG).textContent = lab;
  el('circle', { cx: x, cy: 180, r: 42, fill: col, ...S, 'stroke-width': 3 }, barsG);
  return f;
});
el('text', { x: 480, y: 930, 'font-size': 34, 'font-weight': 500, fill: C.grey, 'text-anchor': 'middle' }, barsG).textContent = 'نفس الوقت فالمايكروويف';

// ---------- iris / sting overlay ----------
const stingG = el('g', { opacity: 0 });
el('circle', { cx: 480, cy: 470, r: 262, fill: 'none', stroke: C.lblue, 'stroke-width': 14 }, stingG);
const ring = el('circle', { cx: 480, cy: 470, r: 262, fill: 'none', stroke: C.blue, 'stroke-width': 14, 'stroke-linecap': 'round', transform: 'rotate(-90 480 470)', 'stroke-dasharray': `${2 * Math.PI * 262}`, 'stroke-dashoffset': `${2 * Math.PI * 262}` }, stingG);
const stingLogo = el('image', { href: 'logo_light.png', x: 400, y: 790, width: 160, height: 164 }, stingG);
const stingMask = el('path', { fill: C.bg, 'fill-rule': 'evenodd', opacity: 0, d: 'M0,0H960V1030H0Z M480,208 a262,262 0 1,0 0.1,0Z' });

// ---------- badges (analogy pictograms, top-right) ----------
function badge() { const g = el('g', { opacity: 0 }); el('rect', { x: -70, y: -70, width: 140, height: 140, rx: 22, fill: '#fff', ...S, 'stroke-width': 3 }, g); return g; }
const bWifi = badge();
[[48, 1], [32, 0.8], [16, 0.6]].forEach(([r]) => el('path', { d: `M${-r},${12 - r * 0.2} A${r} ${r} 0 0 1 ${r},${12 - r * 0.2}`, fill: 'none', stroke: C.blue, 'stroke-width': 8, 'stroke-linecap': 'round', transform: 'translate(0,16)' }, bWifi));
el('circle', { cx: 0, cy: 30, r: 7, fill: C.blue }, bWifi);
const bHands = badge();
const handL = el('rect', { x: -44, y: -30, width: 40, height: 74, rx: 20, fill: C.food, ...S, 'stroke-width': 3 }, bHands);
const handR = el('rect', { x: 4, y: -30, width: 40, height: 74, rx: 20, fill: '#E9C489', ...S, 'stroke-width': 3 }, bHands);
[-24, 0, 24].forEach(x => el('path', { d: `M${x},-40 q6,-8 0,-16`, stroke: C.red, 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' }, bHands));
const bWin = badge();
el('rect', { x: -40, y: -36, width: 80, height: 80, fill: '#E3F3FD', ...S, 'stroke-width': 4 }, bWin);
el('path', { d: 'M0,-36V44M-40,4H40', stroke: C.ink, 'stroke-width': 4 }, bWin);
el('circle', { cx: 34, cy: -40, r: 16, fill: C.sun, ...S, 'stroke-width': 3 }, bWin);
el('path', { d: 'M22,-28 L-20,20 M30,-20 L0,30', stroke: C.sun, 'stroke-width': 6, 'stroke-linecap': 'round', opacity: 0.9 }, bWin);
const showBadge = (g, p) => set(g, { opacity: clamp(p * 3), transform: `translate(870,90) scale(${EASE.b(clamp(p)).toFixed(3)})` });

// dim layer for "والغريب؟"
const dim = el('rect', { width: 960, height: 1030, fill: C.bg, opacity: 0 });
// reorder: overlays above world
[microBg, microGrid, warm, molG, fieldG, latG, iceG, stingMask, stingG, dim, bWifi, bHands, bWin].forEach(n => svg.appendChild(n));
svg.insertBefore(irisG, microBg);

// recap mini diagram
const recapArt = document.getElementById('recapArt');
recapSource.setAttribute('transform', 'translate(192,62) scale(0.6)');
recapArt.appendChild(recapSource);
const RX = (p) => [192 + p[0] * 0.6, 62 + p[1] * 0.6];
[[P(370, 230, 190), '1', [80, -60]], [P(20, 200, 120), '2', [-80, -40]], [[fc[0], fc[1] - 40], '3', [90, 60]], [[fc[0] - pa1, fc[1]], '4', [-60, 70]]].forEach(([p, n, [dx, dy]]) => {
  const [x, y] = RX(p);
  el('line', { x1: x, y1: y, x2: x + dx, y2: y + dy, stroke: C.ink, 'stroke-width': 2 }, recapArt);
  el('circle', { cx: x, cy: y, r: 5, fill: C.ink }, recapArt);
  el('circle', { cx: x + dx, cy: y + dy, r: 22, fill: '#fff', stroke: C.ink, 'stroke-width': 2.5 }, recapArt);
  el('text', { x: x + dx, y: y + dy + 8, 'font-size': 24, 'font-weight': 700, fill: C.ink, 'text-anchor': 'middle' }, recapArt).textContent = n;
});
recapSource.querySelectorAll('circle[fill="' + C.blue + '"]').forEach(n => n.remove());

// ---------- timeline (tracks) ----------
const FOOD = [fc[0], fc[1] - 30], PLATE = [fc[0] - 60, fc[1] + 10];
const WIDE = [470, 560, 1.18];
track('cam', WIDE, [
  [0, 3.2, [470, 575, 1.3], 'io'],
  [4.45, 1.2, [mp[0] + 6, mp[1] + 50, 2.3], 'x'],
  [7.95, 1.0, [462, 520, 1.45], 'x'],
  [14.9, 1.0, [FOOD[0], FOOD[1], 2.6], 'x'],
  [17.3, 0.8, [fc[0] + 6, fc[1] - 20, 9], 'i'],
  [32.2, 0.01, [fc[0] - 40, fc[1], 6], 'l'],
  [32.25, 1.0, [PLATE[0], PLATE[1], 2.3], 'x'],
  [35.85, 0.6, [fc[0] - 90, fc[1] + 20, 8], 'i'],
  [43.3, 0.01, [fc[0], fc[1] - 20, 5], 'l'],
  [43.32, 0.9, [fc[0], fc[1] - 20, 2.2], 'x'],
]);
track('iris', 900, [[3.15, 0.45, 262, 'o'], [4.4, 0.6, 900, 'i']]);
track('sting', 0, [[3.2, 0.3, 1, 'o'], [4.4, 0.4, 0, 'i']]);
track('ring', 0, [[3.3, 1.05, 1, 'io']]);
track('heat', 0, [[0.3, 1.8, 1, 'io'], [32.2, 0.01, 0.7, 'l']]);
track('thermo', 0, [[2.1, 0.5, 1, 'o'], [3.15, 0.3, 0, 'i']]);
track('coMag', 0, [[6.9, 0.7, 1, 'o'], [7.95, 0.3, 0, 'i']]);
track('magGlow', 0, [[7.9, 0.4, 0.45, 'o'], [14.8, 0.6, 0, 'i']]);
track('rays', 0, [[8.03, 2.2, 1, 'io']]);
track('raysOp', 0, [[8.0, 0.2, 1, 'o'], [15.9, 0.5, 0, 'i']]);
track('coWall', 0, [[10.4, 0.8, 1, 'o'], [12.6, 0.4, 0, 'i']]);
track('wall', 0, [[10.6, 0.4, 0.22, 'o'], [12.6, 0.6, 0, 'i']]);
track('drops', 0, [[16.5, 0.6, 1, 'b'], [32.2, 0.01, 0, 'l']]);
track('micro', 0, [[17.6, 0.5, 1, 'o'], [32.2, 0.5, 0, 'i'], [35.95, 0.5, 1, 'o'], [43.3, 0.5, 0, 'i'], [45.9, 0.4, 1, 'o'], [51.85, 0.4, 0, 'i']]);
track('mol', 0, [[17.7, 0.6, 1, 'o'], [26.95, 0.4, 0, 'i']]);
track('molIn', 0.5, [[17.7, 0.9, 1, 'b']]);
track('ends', 0, [[19.2, 0.6, 1, 'o'], [20.1, 0.3, 0, 'i']]);
track('plus', 0, [[20.1, 0.4, 1, 'b']]);
track('minus', 0, [[20.85, 0.4, 1, 'b']]);
track('fwave', 0, [[21.7, 0.6, 1, 'o']]);
track('osc', 0, [[21.8, 0.6, 1, 'o']]);
track('rot', 0, [[22.4, 0.4, 1, 'o'], [24.1, 0.3, 0, 'i']]);
track('counter', 0, [[24.2, 0.4, 1, 'o']]);
track('count', 0, [[24.3, 1.6, 2.45, 'o']]);
track('field', 0, [[27.0, 0.5, 1, 'o'], [32.2, 0.4, 0, 'i']]);
track('jit', 0.2, [[27.0, 0.6, 1, 'o']]);
track('warm', 0, [[30.9, 0.8, 0.7, 'o'], [32.2, 0.4, 0, 'i']]);
track('heatL', 0, [[30.84, 0.8, 1, 'o']]);
track('coPlate', 0, [[33.98, 0.8, 1, 'o'], [35.8, 0.3, 0, 'i']]);
track('lat', 0, [[35.95, 0.6, 1, 'o'], [43.3, 0.5, 0, 'i']]);
track('noWater', 0, [[38.5, 0.5, 1, 'b'], [40.0, 0.4, 0, 'i']]);
track('latWave', 0, [[40.1, 3.0, 1, 'l']]);
track('cond', 0, [[43.6, 0.8, 1, 'o']]);
track('plateWarm', 0, [[44.0, 1.0, 0.25, 'o']]);
track('dim', 0, [[45.2, 0.4, 0.85, 'o']]);
track('ice', 0, [[45.9, 0.4, 1, 'o'], [51.85, 0.4, 0, 'i']]);
track('cube', 0, [[45.95, 0.5, 1, 'b'], [47.1, 0.4, 0, 'i']]);
track('iceLat', 0, [[47.1, 0.5, 1, 'o']]);
track('iceWave', 0, [[47.5, 2.3, 1, 'l']]);
track('bars', 0, [[49.85, 0.4, 1, 'o']]);
track('barW', 0, [[50.1, 0.9, 0.86, 'o']]);
track('barI', 0, [[50.1, 2.0, 0.2, 'io']]);
track('recap', 0, [[51.9, 0.5, 1, 'o']]);
track('cta', 0, [[55.85, 0.5, 1, 'o']]);
track('bWifi', 0, [[9.05, 0.5, 1, 'l'], [12.3, 0.3, 0, 'l']]);
track('bHands', 0, [[29.3, 0.5, 1, 'l'], [30.9, 0.3, 0, 'l']]);
track('bWin', 0, [[41.9, 0.5, 1, 'l'], [43.3, 0.3, 0, 'l']]);

// ---------- captions ----------
const KW = {
  0: [['تانسخنو', 'r']], 1: [['الطبسيل', 'r']], 2: [['فدقيقة', 'r']], 3: [['الماڭنيترون', 'r']], 4: [['الويفي', 'b']],
  5: [['وترجع', 'r']], 7: [['الماكلة', 'r']], 8: [['بالما', 'b']], 9: [['الما', 'b']], 10: [['جوج طراف', 'r']],
  11: [['موجب', 'r'], ['سالب', 'b']], 12: [['ليمن وليسر', 'r']], 13: [['جوج مليار ونص', 'r']], 14: [['وتاتضرب', 'r']],
  16: [['السخانة', 'r']], 17: [['والطبسيل؟', 'r']], 18: [['السيراميك', 'b'], ['الزاج', 'b']], 19: [['وقاصحين', 'r']],
  20: [['الما الحر', 'b']], 21: [['تاتدوز', 'r']], 23: [['من الماكلة', 'r']], 24: [['والغريب؟', 'r']], 25: [['الثلج', 'b']],
  26: [['مجمّدين', 'b']], 27: [['بشوية', 'r']], 28: [['ماتايسخنش الطبسيل', 'r']], 29: [['تايحرّك الما', 'r']],
};
const capEl = document.getElementById('cap');
const display = s => s.replace('الماڭْنِيترون', 'الماڭنيترون');
let capIdx = -2;
function captions(t) {
  let i = -1;
  for (let k = 0; k < LINES.length; k++) if (t >= LINES[k].s - 0.06) i = k;
  if (i >= 30) i = -1;                                   // CTA lines live in the end card
  if (i !== capIdx) {
    capIdx = i;
    if (i < 0) { capEl.innerHTML = ''; return; }
    let h = display(LINES[i].t);
    (KW[i] || []).forEach(([w, c]) => { h = h.replace(w, `<span class="k ${c}">${w}</span>`); });
    capEl.innerHTML = h;
  }
  if (i < 0) return;
  const p = clamp((t - LINES[i].s + 0.06) / 0.22);
  capEl.style.color = hexLerp(C.grey, C.ink, p);
  capEl.style.opacity = 0.4 + 0.6 * p;
  capEl.style.transform = `translateY(${(1 - EASE.o(p)) * 14}px)`;
  const u = EASE.o(clamp((t - LINES[i].s - 0.25) / 0.35));
  capEl.querySelectorAll('.k').forEach(k => { k.style.setProperty('--u', (u * 100).toFixed(1) + '%'); k.style.color = u > 0 ? '' : hexLerp(C.grey, C.ink, p); });
}

// ---------- render ----------
function render(t) {
  // camera
  const [fx, fy, s] = V('cam', t);
  set(camG, { transform: `translate(480,500) scale(${s.toFixed(4)}) translate(${(-fx).toFixed(2)},${(-fy).toFixed(2)})` });
  set(irisC, { r: V('iris', t).toFixed(1) });
  const sting = V('sting', t);
  set(stingG, { opacity: sting }); set(stingMask, { opacity: sting });
  set(ring, { 'stroke-dashoffset': (2 * Math.PI * 262 * (1 - V('ring', t))).toFixed(1) });
  set(stingLogo, { opacity: clamp((t - 3.35) / 0.3) });

  // food heat + steam
  const heat = V('heat', t);
  set(food, { fill: hexLerp(C.food, '#F4A39A', heat) });
  steam.forEach((p, i) => {
    const x0 = fc[0] - 36 + i * 36, rise = ((t * 40 + i * 30) % 60);
    let d = `M${x0},${fc[1] - FH - 10 - rise}`;
    for (let k = 1; k <= 6; k++) d += ` L${x0 + Math.sin(k * 1.3 + t * 4 + i) * 8},${fc[1] - FH - 10 - rise - k * 12}`;
    set(p, { d, opacity: (heat * (1 - rise / 70) * 0.9).toFixed(2) });
  });
  const th = V('thermo', t);
  [thFood, thPlate].forEach((m, i) => { set(m.g, { opacity: th }); set(m.lvl, { y: -70 + (i ? 58 : 4) * 1 + (1 - th) * (i ? 12 : 66), height: (i ? 12 : 66) * th + 8 }); });
  coMag(V('coMag', t)); coWall(V('coWall', t)); coPlate(V('coPlate', t));
  set(magGlow, { opacity: (V('magGlow', t) * (0.7 + 0.3 * Math.sin(t * 12))).toFixed(2) });
  set(wallLeft, { opacity: V('wall', t) }); set(wallBack, { opacity: V('wall', t) * 0.6 });

  // rays
  const rp = V('rays', t), rop = V('raysOp', t);
  RAYS.forEach((r, i) => {
    const w = wavePath(r, 10, 34, t * 14 + i, clamp(rp * 1.15 - i * 0.08));
    set(rayEls[i].p, { d: w.d || 'M0,0', opacity: rop });
    set(rayEls[i].h, { points: arrowHead(w.tip, w.dir), opacity: w.d ? rop : 0 });
  });
  pings.forEach((c, i) => {
    const ph = ((t - 9.2 - i * 0.37) % 1.4 + 1.4) % 1.4, on = t > 9.2 && rop > 0;
    set(c, { r: on ? (ph * 40).toFixed(1) : 0, opacity: on ? ((1 - ph / 1.4) * rop * (t > 12.2 && t < 13.3 ? 1 : 0.55)).toFixed(2) : 0 });
  });
  const dp = V('drops', t);
  drops.forEach((d, i) => set(d, { r: (Math.max(0, EASE.b(clamp(dp * 1.6 - i * 0.05))) * 7).toFixed(2) }));
  const cp = V('cond', t);
  cond.forEach((c, i) => { const k = clamp(cp * 1.5 - i * 0.2); set(c, { opacity: k, transform: `translate(0,${((t * 30) % 18).toFixed(1)})` }); set(condHeads[i], { opacity: k, transform: `translate(0,${((t * 30) % 18).toFixed(1)})` }); });
  set(plateWarm, { opacity: V('plateWarm', t) });

  // micro background
  const mi = V('micro', t);
  set(microBg, { opacity: mi }); set(microGrid, { opacity: mi * 0.8 });
  set(warm, { opacity: V('warm', t) * mi });

  // single molecule
  const mo = V('mol', t), sIn = V('molIn', t), osc = V('osc', t);
  set(molG, { opacity: mo, transform: `translate(480,470) scale(${(0.7 + 0.3 * sIn).toFixed(3)}) translate(-480,-470)` });
  const fast = t > 24.2 ? 2.6 : 1;
  const ang = osc * 42 * Math.sin(t * 5.2 * fast);
  place(M, 480, 470, ang, 2.1);
  const R = (x, y, a) => { const r = a * Math.PI / 180; return [480 + (x * Math.cos(r) - y * Math.sin(r)) * 2.1, 470 + (x * Math.sin(r) + y * Math.cos(r)) * 2.1]; };
  M.hp.forEach(([x, y], i) => { const [px, py] = R(x * 1.55, y * 1.55, ang); set(plusEls[i], { opacity: V('plus', t), transform: `translate(${px.toFixed(1)},${py.toFixed(1)}) scale(${EASE.b(clamp(V('plus', t))).toFixed(2)})` }); });
  { const [px, py] = R(0, -78, ang); set(minusEl, { opacity: V('minus', t), transform: `translate(${px.toFixed(1)},${py.toFixed(1)}) scale(${EASE.b(clamp(V('minus', t))).toFixed(2)})` }); }
  const ends = V('ends', t);
  [[0, -10], ...M.hp.map(([x, y]) => [x * 1.1, y * 1.1])].forEach(([x, y], i) => { const [px, py] = R(x, y, ang); set(endsRing[i], { cx: px, cy: py, r: (i ? 70 : 105) * ends, opacity: ends }); });
  const fw = V('fwave', t);
  { const w = wavePath([[-40, 470], [1000, 470]], 70 * fw, 260, t * 5.2 * fast * 1.0, 1); set(fieldWave, { d: w.d, opacity: fw * 0.5 }); set(fieldHead, { opacity: 0 }); }
  set(rotArrows, { opacity: V('rot', t), transform: `translate(480,470) rotate(${(Math.sin(t * 5.2) * 12).toFixed(1)})` });
  set(counterG, { opacity: V('counter', t) });
  counterTx.textContent = '~' + V('count', t).toFixed(2);

  // collision field
  const fo = V('field', t), jit = V('jit', t);
  set(fieldG, { opacity: fo });
  if (fo > 0) {
    FM.forEach(m => {
      const n = m.seed;
      place(m, m.x + Math.sin(t * 9 + n) * 26 * jit + Math.sin(t * 23 + n * 2) * 8 * jit, m.y + Math.cos(t * 8 + n * 1.7) * 22 * jit,
        Math.sin(t * 14 + n) * 70 * jit + n * 40, 0.62);
    });
    sparks.forEach(sp => { const p = (t - sp.t0) / 0.45; set(sp.g, { opacity: p > 0 && p < 1 ? (1 - p).toFixed(2) : 0, transform: `translate(${sp.x},${sp.y}) scale(${(0.6 + p * 0.8).toFixed(2)})` }); });
    const hl = V('heatL', t);
    heatLines.forEach((p, i) => {
      const x0 = 120 + i * 145, rise = (t * 90 + i * 70) % 260;
      let d = `M${x0},${960 - rise}`;
      for (let k = 1; k <= 7; k++) d += ` L${x0 + Math.sin(k * 1.2 + t * 6 + i) * 14},${960 - rise - k * 20}`;
      set(p, { d, opacity: (hl * (1 - rise / 280)).toFixed(2) });
    });
  }

  // lattice
  set(latG, { opacity: V('lat', t), transform: `translate(480,500) scale(${(0.85 + 0.15 * V('lat', t)).toFixed(3)}) translate(-480,-500)` });
  set(noWater, { opacity: V('noWater', t) });
  { const lp = V('latWave', t), w = wavePath([[-60, 520], [1020, 520]], 46, 140, t * 6, lp);
    set(latWave, { d: w.d || 'M0,0', opacity: lp > 0 && lp < 1 ? 0.9 : 0 }); set(latHead, { points: arrowHead(w.tip, w.dir, 24), opacity: lp > 0 && lp < 1 ? 1 : 0 }); }

  // ice
  set(dim, { opacity: V('dim', t) * (1 - V('ice', t)) });
  set(iceG, { opacity: V('ice', t) });
  set(cube, { opacity: V('cube', t), transform: `translate(480,520) scale(${(0.6 + 0.4 * EASE.b(clamp(V('cube', t)))).toFixed(3)}) translate(-480,-520)` });
  set(iceLat, { opacity: V('iceLat', t) });
  IM.forEach((m, i) => place(m, m.x, m.y, m.a + Math.sin(t * 20 + i) * 3, 0.55));
  { const ip = V('iceWave', t), w = wavePath([[-60, 470], [1020, 470]], 46, 140, t * 6, ip);
    set(iceWave, { d: w.d || 'M0,0', opacity: ip > 0 && ip < 1 ? 0.9 : 0 }); set(iceHead, { points: arrowHead(w.tip, w.dir, 24), opacity: ip > 0 && ip < 1 ? 1 : 0 }); }
  set(barsG, { opacity: V('bars', t) });
  [V('barW', t), V('barI', t)].forEach((v, i) => set(bars[i], { y: 734 - v * 468, height: v * 468 }));

  // badges
  showBadge(bWifi, V('bWifi', t)); showBadge(bHands, V('bHands', t)); showBadge(bWin, V('bWin', t));
  set(handL, { transform: `translate(0,${(Math.sin(t * 18) * 8).toFixed(1)})` }); set(handR, { transform: `translate(0,${(-Math.sin(t * 18) * 8).toFixed(1)})` });

  // cards
  const rc = V('recap', t), ct = V('cta', t);
  document.getElementById('recap').style.opacity = rc * (1 - ct);
  document.getElementById('recap').style.transform = `translateY(${((1 - rc) * 30).toFixed(1)}px)`;
  document.getElementById('cta').style.opacity = ct;
  document.querySelector('#cta .cursor').style.opacity = Math.floor(t * 2) % 2 ? 0 : 1;

  captions(t);
}

window.__END = END;
window.__seek = t => { render(t); return true; };
window.__ready = document.fonts.ready.then(() => { render(0); return true; });
})();
