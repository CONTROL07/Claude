// Scene for "علاش فاش تنسخنو الماكلة فالميكرو أوند… ما تيسخن الطبسيل؟" (footage mode).
// The user's video shows in the window; the world is drawn only during cutaways ('cut' track),
// overlays (cards, badges) sit on top of the footage. Times = seconds in footage.mp4 (see lines.js).
(() => {
const R = {};

window.SCENE = {
build(K) {
  const { C, S, el, set, pts, track } = K;
  const { P, ell } = K.iso(428, 500);
  const cam = K.layers.camera;
  const world = R.world = el('g', { opacity: 0 }, cam);       // visible only during cutaways
  const art = R.art = el('g', {}, world);

  // ---------- WORLD: isometric microwave cutaway ----------
  el('ellipse', { cx: P(210, 0, 150)[0], cy: P(210, 0, 150)[1] + 8, rx: 330, ry: 120, fill: C.ink, opacity: 0.06 }, art);
  const hid = { ...S, fill: 'none', 'stroke-dasharray': '8 8', opacity: 0.45 };
  el('polyline', { ...hid, points: pts([P(0, 0, 300), P(0, 0, 0), P(420, 0, 0)]) }, art);
  el('polyline', { ...hid, points: pts([P(0, 0, 0), P(0, 260, 0)]) }, art);
  const cv = { x0: 20, x1: 310, y0: 20, y1: 240, z0: 20, z1: 290 };
  const back = [P(cv.x0, cv.y0, cv.z0), P(cv.x1, cv.y0, cv.z0), P(cv.x1, cv.y1, cv.z0), P(cv.x0, cv.y1, cv.z0)];
  const left = [P(cv.x0, cv.y0, cv.z0), P(cv.x0, cv.y0, cv.z1), P(cv.x0, cv.y1, cv.z1), P(cv.x0, cv.y1, cv.z0)];
  el('polygon', { ...S, fill: C.metal, points: pts(back) }, art);
  el('polygon', { ...S, fill: '#CFDCE8', points: pts(left) }, art);
  el('polygon', { ...S, fill: '#E6EEF5', points: pts([P(cv.x0, cv.y0, cv.z0), P(cv.x1, cv.y0, cv.z0), P(cv.x1, cv.y0, cv.z1), P(cv.x0, cv.y0, cv.z1)]) }, art);
  el('polyline', { ...hid, points: pts([P(cv.x1, cv.y0, cv.z1), P(cv.x1, cv.y1, cv.z1), P(cv.x1, cv.y1, cv.z0)]) }, art);
  el('polyline', { ...hid, points: pts([P(cv.x0, cv.y1, cv.z1), P(cv.x1, cv.y1, cv.z1)]) }, art);
  R.wallL = el('polygon', { fill: C.blue, opacity: 0, points: pts(left) }, art);
  R.wallB = el('polygon', { fill: C.blue, opacity: 0, points: pts(back) }, art);

  K.box(P, 310, 336, 182, 226, 150, 230, ['#9FD0F3', '#7EC0EE', '#66B2E8'], art);       // waveguide
  const mag = K.box(P, 336, 404, 120, 230, 130, 245, [C.lblue, C.blue, '#2386CF'], art); // magnetron
  for (let i = 0; i < 6; i++) el('polyline', { ...S, 'stroke-width': 2, fill: 'none', opacity: 0.7, points: pts([P(404, 135 + i * 16, 140), P(404, 135 + i * 16, 235)]) }, mag);
  R.magGlow = el('circle', { cx: P(404, 175, 188)[0], cy: P(404, 175, 188)[1], r: 34, fill: C.blue, opacity: 0 }, art);

  const fc = R.fc = P(165, 32, 155), pb = P(165, 22, 155);
  const [ta, tb] = ell(122), [pa1, pb1] = ell(106), [pa2, pb2] = ell(72), [fa, fb] = ell(64), FH = R.FH = 70;
  el('ellipse', { cx: pb[0], cy: pb[1] + 4, rx: ta, ry: tb, fill: '#fff', stroke: C.ink, 'stroke-width': 2, opacity: 0.7 }, art);
  el('path', { ...S, fill: '#9FD0F3', d: `M${fc[0] - pa1},${fc[1]} L${pb[0] - pa2},${pb[1]} A${pa2} ${pb2} 0 0 0 ${pb[0] + pa2},${pb[1]} L${fc[0] + pa1},${fc[1]} A${pa1} ${pb1} 0 0 1 ${fc[0] - pa1},${fc[1]}Z` }, art);
  el('ellipse', { ...S, cx: fc[0], cy: fc[1], rx: pa1, ry: pb1, fill: C.lblue }, art);
  el('ellipse', { cx: fc[0], cy: fc[1] + 4, rx: pa1 * 0.7, ry: pb1 * 0.7, fill: 'none', stroke: C.ink, 'stroke-width': 1.5, opacity: 0.35 }, art);
  R.food = el('path', { ...S, fill: C.food, d: `M${fc[0] - fa},${fc[1]} A${fa} ${fb} 0 0 0 ${fc[0] + fa},${fc[1]} A${fa} ${FH} 0 0 0 ${fc[0] - fa},${fc[1]}Z` }, art);
  el('path', { d: `M${fc[0] - fa * 0.55},${fc[1] - FH * 0.55} q${fa * 0.25},-${FH * 0.32} ${fa * 0.6},-${FH * 0.38}`, fill: 'none', stroke: '#fff', 'stroke-width': 5, 'stroke-linecap': 'round', opacity: 0.7 }, art);
  R.drops = [[-38, -18], [-12, -40], [18, -22], [40, -8], [-30, 6], [6, 0], [28, 14], [-6, -60], [22, -48], [-46, -2], [0, 18], [-20, -28]]
    .map(([dx, dy]) => el('circle', { cx: fc[0] + dx, cy: fc[1] + dy, r: 0, fill: C.blue, stroke: C.ink, 'stroke-width': 1.5 }, art));
  R.steam = [0, 1, 2].map(() => el('path', { fill: 'none', stroke: C.red, 'stroke-width': 4, 'stroke-linecap': 'round', opacity: 0 }, art));

  // glass housing + door
  el('polygon', { ...S, fill: C.panel, 'fill-opacity': 0.28, points: pts([P(0, 260, 0), P(420, 260, 0), P(420, 260, 300), P(0, 260, 300)]) }, art);
  el('polygon', { ...S, fill: C.panel, 'fill-opacity': 0.18, points: pts([P(0, 0, 300), P(420, 0, 300), P(420, 260, 300), P(0, 260, 300)]) }, art);
  el('polygon', { ...S, fill: C.panel, 'fill-opacity': 0.22, points: pts([P(420, 0, 0), P(420, 0, 300), P(420, 260, 300), P(420, 260, 0)]) }, art);
  el('polygon', { ...S, fill: 'none', opacity: 0.3, points: pts([P(12, 12, 300), P(316, 12, 300), P(316, 248, 300), P(12, 248, 300)]) }, art);
  el('polygon', { stroke: C.ink, 'stroke-width': 1.5, fill: 'url(#dots)', opacity: 0.35, points: pts([P(40, 40, 300), P(290, 40, 300), P(290, 220, 300), P(40, 220, 300)]) }, art);
  R.recapSource = art.cloneNode(true);

  // microwave rays (two passes: line 5 and line 9)
  const src = P(310, 200, 190);
  R.RAYS = [
    [src, P(20, 190, 250), P(60, 240, 40), [fc[0] - 6, fc[1] - FH + 4]],
    [src, P(200, 240, 40), P(20, 80, 200), [fc[0] - 30, fc[1] - FH * 0.5]],
    [src, P(250, 20, 260), [fc[0] + 34, fc[1] - FH * 0.55]],
  ];
  R.rays = R.RAYS.map(() => ({ p: el('path', { fill: 'none', stroke: C.blue, 'stroke-width': 5, 'stroke-linecap': 'round' }, world), h: el('polygon', { fill: C.blue }, world) }));
  R.pings = [R.RAYS[0][1], R.RAYS[0][2], R.RAYS[1][1], R.RAYS[1][2], R.RAYS[2][1]].map(p => el('circle', { cx: p[0], cy: p[1], r: 0, fill: 'none', stroke: C.blue, 'stroke-width': 4 }, world));
  R.thFood = K.thermo(world, fc[0] + 175, fc[1] - 120, C.red);
  R.thPlate = K.thermo(world, fc[0] - 190, fc[1] + 10, C.blue);
  const mp = R.mp = P(370, 230, 190);
  R.coMag = K.callout(world, mp[0], mp[1] - 8, mp[0] + 70, mp[1] - 120, 'الماغنيطرون', 24);
  R.coPlate = K.callout(world, fc[0] - pa1 + 22, fc[1] + 12, fc[0] - pa1 - 30, fc[1] + 150, 'سيراميك / زاج', 22);
  const wp = P(20, 150, 150);
  R.coWall = K.callout(world, wp[0], wp[1], wp[0] - 60, wp[1] - 150, 'حيط ديال الحديد', 22);

  // ---------- MICRO: one water molecule ----------
  const mol = R.mol = K.micro();
  R.fieldWave = el('path', { fill: 'none', stroke: C.blue, 'stroke-width': 6, 'stroke-linecap': 'round', opacity: 0 }, mol);
  R.M = K.h2o(mol);
  R.plus = R.M.hp.map(() => { const g = el('g', { opacity: 0 }, mol); el('circle', { r: 22, fill: C.red }, g); el('path', { d: 'M-10,0H10M0,-10V10', stroke: '#fff', 'stroke-width': 5, 'stroke-linecap': 'round' }, g); return g; });
  R.minus = (() => { const g = el('g', { opacity: 0 }, mol); el('circle', { r: 22, fill: C.ink }, g); el('path', { d: 'M-10,0H10', stroke: '#fff', 'stroke-width': 5, 'stroke-linecap': 'round' }, g); return g; })();
  R.ends = [0, 1, 2].map(() => el('circle', { r: 0, fill: 'none', stroke: C.red, 'stroke-width': 4, 'stroke-dasharray': '10 8' }, mol));
  R.rot = el('g', { opacity: 0 }, mol);
  el('path', { d: 'M-150,-150 A212,212 0 0 1 150,-150', fill: 'none', stroke: C.ink, 'stroke-width': 4, 'stroke-dasharray': '2 12', 'stroke-linecap': 'round' }, R.rot);
  el('polygon', { points: '150,-150 128,-160 146,-176', fill: C.ink }, R.rot);
  el('polygon', { points: '-150,-150 -128,-160 -146,-176', fill: C.ink }, R.rot);
  R.counter = el('g', { opacity: 0 }, mol);
  el('rect', { x: 210, y: 690, width: 540, height: 230, rx: 24, fill: '#fff', ...S }, R.counter);
  R.counterTx = el('text', { x: 480, y: 820, 'font-size': 120, 'font-weight': 700, fill: C.red, 'text-anchor': 'middle', direction: 'ltr' }, R.counter);
  el('text', { x: 480, y: 885, 'font-size': 38, 'font-weight': 600, fill: C.ink, 'text-anchor': 'middle' }, R.counter).textContent = 'مليار مرة فالثانية';

  // ---------- MICRO: ceramic / glass lattice ----------
  const lat = R.lat = K.micro();
  const LAT = [];
  for (let r = 0; r < 7; r++) for (let c = 0; c < 6; c++) LAT.push([150 + c * 132 + (r % 2) * 66, 140 + r * 118]);
  LAT.forEach(([x, y], i) => LAT.forEach(([x2, y2], j) => { if (j > i && Math.hypot(x2 - x, y2 - y) < 150) el('line', { x1: x, y1: y, x2, y2, stroke: C.ink, 'stroke-width': 4, opacity: 0.55 }, lat); }));
  LAT.forEach(([x, y], i) => el('circle', { cx: x, cy: y, r: 30, fill: i % 3 ? '#DDE7F0' : '#C9D6E2', ...S, 'stroke-width': 3 }, lat));
  R.latWave = el('path', { fill: 'none', stroke: C.blue, 'stroke-width': 8, 'stroke-linecap': 'round' }, lat);
  R.latHead = el('polygon', { fill: C.blue }, lat);
  R.noWater = el('g', { opacity: 0 }, lat);
  el('rect', { x: 330, y: 820, width: 300, height: 170, rx: 24, fill: '#fff', ...S }, R.noWater);
  K.place(K.h2o(R.noWater), 480, 890, 0, 0.6);
  el('path', { d: 'M420,850 L540,950 M540,850 L420,950', stroke: C.red, 'stroke-width': 9, 'stroke-linecap': 'round' }, R.noWater);

  // ---------- OVERLAYS on the footage (white cards behind any text) ----------
  const ov = K.layers.badges;
  // magnetron tag card (lines 3–4)
  R.magCard = el('g', { opacity: 0 }, ov);
  el('rect', { x: 250, y: 830, width: 460, height: 130, rx: 26, fill: '#fff', ...S, 'stroke-width': 3 }, R.magCard);
  { const g = el('g', { transform: 'translate(640,895)' }, R.magCard);
    el('rect', { x: -38, y: -30, width: 76, height: 60, rx: 8, fill: C.blue, ...S, 'stroke-width': 3 }, g);
    for (let i = 0; i < 4; i++) el('line', { x1: -26 + i * 17, y1: -20, x2: -26 + i * 17, y2: 20, stroke: C.ink, 'stroke-width': 2.5, opacity: 0.7 }, g); }
  R.magQ = el('text', { x: 440, y: 915, 'font-size': 64, 'font-weight': 700, fill: C.blue, 'text-anchor': 'middle' }, R.magCard);
  R.magQ.textContent = '؟';
  R.magLbl = el('text', { x: 430, y: 912, 'font-size': 48, 'font-weight': 700, fill: C.ink, 'text-anchor': 'middle', opacity: 0 }, R.magCard);
  R.magLbl.textContent = 'الماغنيطرون';
  // molecules rubbing card (line 21)
  R.molCard = el('g', { opacity: 0 }, ov);
  el('rect', { x: 250, y: 760, width: 460, height: 220, rx: 26, fill: '#fff', ...S, 'stroke-width': 3 }, R.molCard);
  R.MC = [[350, 870, 0], [480, 850, 2.1], [610, 875, 4.2]].map(([x, y, s]) => { const m = K.h2o(R.molCard); m.x = x; m.y = y; m.seed = s; return m; });
  // thermometer cards (lines 33–34)
  R.thCards = [[300, 'الماكلة', C.red, 0.92], [660, 'الطبسيل', C.blue, 0.15]].map(([x, lab, col, lv]) => {
    const g = el('g', { opacity: 0 }, ov);
    el('rect', { x: x - 150, y: 730, width: 300, height: 250, rx: 26, fill: '#fff', ...S, 'stroke-width': 3 }, g);
    el('text', { x, y: 955, 'font-size': 40, 'font-weight': 700, fill: C.ink, 'text-anchor': 'middle' }, g).textContent = lab;
    const th = K.thermo(g, x, 850, col);
    return { g, th, lv };
  });

  // ---------- analogy badges (top-right of the window) ----------
  R.bWifi = K.badge();
  [48, 32, 16].forEach(r => el('path', { d: `M${-r},${12 - r * 0.2} A${r} ${r} 0 0 1 ${r},${12 - r * 0.2}`, fill: 'none', stroke: C.blue, 'stroke-width': 8, 'stroke-linecap': 'round', transform: 'translate(0,16)' }, R.bWifi));
  el('circle', { cx: 0, cy: 30, r: 7, fill: C.blue }, R.bWifi);
  R.bDrop = K.badge();
  el('path', { d: 'M0,-46 C18,-20 34,-2 34,18 A34,34 0 0 1 -34,18 C-34,-2 -18,-20 0,-46Z', fill: C.blue, ...S, 'stroke-width': 3 }, R.bDrop);
  el('path', { d: 'M-14,14 a16,16 0 0 0 12,16', stroke: '#fff', 'stroke-width': 5, fill: 'none', 'stroke-linecap': 'round' }, R.bDrop);
  R.bQ = K.badge();
  el('text', { x: 0, y: 34, 'font-size': 96, 'font-weight': 700, fill: C.blue, 'text-anchor': 'middle' }, R.bQ).textContent = '؟';
  R.bHands = K.badge();
  R.handL = el('rect', { x: -44, y: -30, width: 40, height: 74, rx: 20, fill: C.food, ...S, 'stroke-width': 3 }, R.bHands);
  R.handR = el('rect', { x: 4, y: -30, width: 40, height: 74, rx: 20, fill: '#E9C489', ...S, 'stroke-width': 3 }, R.bHands);
  R.handHeat = el('g', { opacity: 0 }, R.bHands);
  [-24, 0, 24].forEach(x => el('path', { d: `M${x},-40 q6,-8 0,-16`, stroke: C.red, 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' }, R.handHeat));
  R.bPlate = K.badge();
  el('ellipse', { cx: 0, cy: 22, rx: 52, ry: 20, fill: C.lblue, ...S, 'stroke-width': 3 }, R.bPlate);
  el('ellipse', { cx: 0, cy: 20, rx: 30, ry: 10, fill: 'none', stroke: C.ink, 'stroke-width': 2, opacity: 0.4 }, R.bPlate);
  el('text', { x: 0, y: -2, 'font-size': 64, 'font-weight': 700, fill: C.ink, 'text-anchor': 'middle' }, R.bPlate).textContent = '؟';
  R.bWin = K.badge();
  el('rect', { x: -40, y: -36, width: 80, height: 80, fill: '#E3F3FD', ...S, 'stroke-width': 4 }, R.bWin);
  el('path', { d: 'M0,-36V44M-40,4H40', stroke: C.ink, 'stroke-width': 4 }, R.bWin);
  el('circle', { cx: 34, cy: -40, r: 16, fill: C.sun, ...S, 'stroke-width': 3 }, R.bWin);

  // ---------- tracks (times = line starts in lines.js) ----------
  const FOOD = [fc[0], fc[1] - 30], PLATE = [fc[0] - 60, fc[1] + 10];
  // cutaways: 0–3.19 hook · 7.32–11.13 waves · 14.79–19.95 walls · 23.21–32.78 molecule · 42.18–53.35 plate
  track('cut', 1, [[2.85, 0.35, 0, 'i'], [7.32, 0.4, 1, 'o'], [11.0, 0.35, 0, 'i'], [14.79, 0.4, 1, 'o'], [19.8, 0.35, 0, 'i'],
    [23.21, 0.4, 1, 'o'], [32.7, 0.4, 0, 'i'], [42.18, 0.4, 1, 'o'], [53.25, 0.4, 0, 'i']]);
  track('world', 1, [[2.85, 0.35, 0, 'i'], [7.32, 0.4, 1, 'o'], [11.0, 0.35, 0, 'i'], [14.79, 0.4, 1, 'o'], [19.8, 0.35, 0, 'i'],
    [23.21, 0.3, 1, 'o'], [24.2, 0.3, 0, 'l'], [42.18, 0.4, 1, 'o'], [53.25, 0.4, 0, 'i']]);
  track('cam', [470, 575, 1.3], [
    [0, 3.0, [470, 560, 1.38], 'io'],
    [7.0, 0.01, [mp[0] + 6, mp[1] + 50, 2.3], 'l'],
    [9.65, 1.0, [462, 520, 1.45], 'x'],
    [18.43, 1.0, [FOOD[0], FOOD[1], 2.6], 'x'],
    [23.21, 0.75, [fc[0] + 6, fc[1] - 20, 9], 'i'],
    [41.9, 0.01, [fc[0] - 40, fc[1], 6], 'l'],
    [42.18, 1.0, [PLATE[0], PLATE[1], 2.3], 'x'],
    [45.9, 0.6, [fc[0] - 90, fc[1] + 20, 8], 'i'],
  ]);
  track('micro', 0, [[23.6, 0.5, 1, 'o'], [32.7, 0.4, 0, 'i'], [46.2, 0.5, 1, 'o'], [53.25, 0.4, 0, 'i']]);
  track('heat', 0, [[0.2, 1.6, 1, 'io'], [3.3, 0.01, 0, 'l'], [18.6, 1.2, 0.55, 'o'], [41.9, 0.01, 0.7, 'l']]);
  track('thermo', 0, [[1.31, 0.5, 1, 'o'], [2.85, 0.3, 0, 'i']]);
  track('magCard', 0, [[4.51, 0.5, 1, 'b'], [7.2, 0.3, 0, 'i']]);
  track('magLbl', 0, [[5.76, 0.4, 1, 'o']]);
  track('coMag', 0, [[7.4, 0.7, 1, 'o'], [9.6, 0.3, 0, 'i']]);
  track('magGlow', 0, [[7.5, 0.4, 0.45, 'o'], [11.0, 0.4, 0, 'i'], [14.8, 0.4, 0.45, 'o'], [19.8, 0.4, 0, 'i']]);
  track('rays', 0, [[7.8, 2.0, 1, 'io'], [14.0, 0.01, 0, 'l'], [14.85, 1.4, 1, 'io']]);
  track('raysOp', 0, [[7.75, 0.2, 1, 'o'], [11.0, 0.35, 0, 'i'], [14.8, 0.2, 1, 'o'], [19.0, 0.5, 0, 'i']]);
  track('wall', 0, [[16.06, 0.4, 0.22, 'o'], [18.43, 0.5, 0, 'i']]);
  track('coWall', 0, [[16.06, 0.8, 1, 'o'], [18.3, 0.35, 0, 'i']]);
  track('drops', 0, [[18.6, 0.6, 1, 'b'], [20.0, 0.01, 0, 'l']]);
  track('mol', 0, [[23.7, 0.6, 1, 'o'], [32.7, 0.4, 0, 'i']]);
  track('ends', 0, [[25.49, 0.6, 1, 'o'], [26.45, 0.3, 0, 'i']]);
  track('minus', 0, [[26.45, 0.4, 1, 'b']]);
  track('plus', 0, [[27.1, 0.4, 1, 'b']]);
  track('fwave', 0, [[27.92, 0.6, 1, 'o']]);
  track('osc', 0, [[28.0, 0.6, 1, 'o']]);
  track('rot', 0, [[28.4, 0.4, 1, 'o'], [30.4, 0.3, 0, 'i']]);
  track('counter', 0, [[30.55, 0.4, 1, 'o']]);
  track('count', 0, [[30.65, 1.6, 2.5, 'o']]);
  track('molCard', 0, [[32.78, 0.5, 1, 'b'], [35.6, 0.3, 0, 'i']]);
  track('coPlate', 0, [[43.23, 0.8, 1, 'o'], [45.8, 0.3, 0, 'i']]);
  track('lat', 0, [[46.3, 0.6, 1, 'o'], [53.25, 0.4, 0, 'i']]);
  track('noWater', 0, [[47.97, 0.5, 1, 'b'], [49.2, 0.3, 0, 'i']]);
  track('latWave', 0, [[49.28, 3.0, 1, 'l']]);
  track('thFood', 0, [[53.35, 0.5, 1, 'b'], [56.5, 0.3, 0, 'i']]);
  track('thPlate', 0, [[55.85, 0.5, 1, 'b'], [56.5, 0.3, 0, 'i']]);
  track('bWifi', 0, [[9.65, 0.5, 1, 'l'], [11.13, 0.3, 0, 'l']]);
  track('bDrop', 0, [[21.57, 0.5, 1, 'l'], [22.4, 0.3, 0, 'l']]);
  track('bQ', 0, [[22.4, 0.5, 1, 'l'], [23.21, 0.3, 0, 'l']]);
  track('bHands', 0, [[35.74, 0.5, 1, 'l'], [39.38, 0.3, 0, 'l']]);
  track('handHeat', 0, [[37.39, 0.4, 1, 'o']]);
  track('bPlate', 0, [[39.5, 0.5, 1, 'l'], [42.18, 0.3, 0, 'l']]);
  track('bWin', 0, [[51.32, 0.5, 1, 'l'], [53.35, 0.3, 0, 'l']]);
},

render(t, K) {
  const { C, set, clamp, V, EASE, hexLerp, wavePath, arrowHead, place } = K;
  const fc = R.fc, FH = R.FH;
  set(R.world, { opacity: V('world', t).toFixed(3) });
  // food heat + steam + thermometers
  const heat = V('heat', t);
  set(R.food, { fill: hexLerp(C.food, '#F4A39A', heat) });
  R.steam.forEach((p, i) => {
    const x0 = fc[0] - 36 + i * 36, rise = (t * 40 + i * 30) % 60;
    let d = `M${x0},${fc[1] - FH - 10 - rise}`;
    for (let k = 1; k <= 6; k++) d += ` L${x0 + Math.sin(k * 1.3 + t * 4 + i) * 8},${fc[1] - FH - 10 - rise - k * 12}`;
    set(p, { d, opacity: (heat * (1 - rise / 70) * 0.9).toFixed(2) });
  });
  const th = V('thermo', t);
  set(R.thFood.g, { opacity: th }); R.thFood.level(0.9 * th);
  set(R.thPlate.g, { opacity: th }); R.thPlate.level(0.15 * th);
  R.coMag(V('coMag', t)); R.coWall(V('coWall', t)); R.coPlate(V('coPlate', t));
  set(R.magGlow, { opacity: (V('magGlow', t) * (0.7 + 0.3 * Math.sin(t * 12))).toFixed(2) });
  set(R.wallL, { opacity: V('wall', t) }); set(R.wallB, { opacity: V('wall', t) * 0.6 });

  // rays + reflection pings
  const rp = V('rays', t), rop = V('raysOp', t);
  R.RAYS.forEach((r, i) => {
    const w = wavePath(r, 10, 34, t * 14 + i, clamp(rp * 1.15 - i * 0.08));
    set(R.rays[i].p, { d: w.d, opacity: rop });
    set(R.rays[i].h, { points: arrowHead(w.tip, w.dir), opacity: w.empty ? 0 : rop });
  });
  R.pings.forEach((c, i) => {
    const ph = ((t - i * 0.37) % 1.4 + 1.4) % 1.4, on = rp > 0.85 && rop > 0;
    set(c, { r: on ? (ph * 40).toFixed(1) : 0, opacity: on ? ((1 - ph / 1.4) * rop * (t > 16.06 && t < 18.43 ? 1 : 0.55)).toFixed(2) : 0 });
  });
  const dp = V('drops', t);
  R.drops.forEach((d, i) => set(d, { r: (Math.max(0, EASE.b(clamp(dp * 1.6 - i * 0.05))) * 7).toFixed(2) }));

  // one molecule
  const mo = V('mol', t), osc = V('osc', t);
  K.microScene(R.mol, mo, 480, 470);
  const fast = t > 30.55 ? 2.6 : 1, ang = osc * 42 * Math.sin(t * 5.2 * fast);
  place(R.M, 480, 470, ang, 2.1);
  const rot = (x, y) => { const r = ang * Math.PI / 180; return [480 + (x * Math.cos(r) - y * Math.sin(r)) * 2.1, 470 + (x * Math.sin(r) + y * Math.cos(r)) * 2.1]; };
  R.M.hp.forEach(([x, y], i) => { const [px, py] = rot(x * 1.55, y * 1.55); set(R.plus[i], { opacity: V('plus', t), transform: `translate(${px.toFixed(1)},${py.toFixed(1)}) scale(${EASE.b(clamp(V('plus', t))).toFixed(2)})` }); });
  { const [px, py] = rot(0, -78); set(R.minus, { opacity: V('minus', t), transform: `translate(${px.toFixed(1)},${py.toFixed(1)}) scale(${EASE.b(clamp(V('minus', t))).toFixed(2)})` }); }
  const ends = V('ends', t);
  [[0, -10], ...R.M.hp.map(([x, y]) => [x * 1.1, y * 1.1])].forEach(([x, y], i) => { const [px, py] = rot(x, y); set(R.ends[i], { cx: px, cy: py, r: (i ? 70 : 105) * ends, opacity: ends }); });
  const fw = V('fwave', t);
  set(R.fieldWave, { d: wavePath([[-40, 470], [1000, 470]], 70 * fw, 260, t * 5.2 * fast, 1).d, opacity: fw * 0.5 });
  set(R.rot, { opacity: V('rot', t), transform: `translate(480,470) rotate(${(Math.sin(t * 5.2) * 12).toFixed(1)})` });
  set(R.counter, { opacity: V('counter', t) });
  R.counterTx.textContent = '+' + V('count', t).toFixed(1);

  // lattice
  K.microScene(R.lat, V('lat', t));
  set(R.noWater, { opacity: V('noWater', t) });
  { const lp = V('latWave', t), w = wavePath([[-60, 520], [1020, 520]], 46, 140, t * 6, lp), on = lp > 0 && lp < 1;
    set(R.latWave, { d: w.d, opacity: on ? 0.9 : 0 }); set(R.latHead, { points: arrowHead(w.tip, w.dir, 24), opacity: on ? 1 : 0 }); }

  // overlay cards (pop in from their own center)
  const pop = (g, p, cx, cy) => set(g, { opacity: clamp(p * 3).toFixed(3), transform: `translate(${cx},${cy}) scale(${EASE.b(clamp(p)).toFixed(3)}) translate(${-cx},${-cy})` });
  pop(R.magCard, V('magCard', t), 480, 895);
  const ml = V('magLbl', t);
  set(R.magLbl, { opacity: ml }); set(R.magQ, { opacity: 1 - ml });
  pop(R.molCard, V('molCard', t), 480, 870);
  if (V('molCard', t) > 0) R.MC.forEach(m => place(m, m.x + Math.sin(t * 9 + m.seed) * 14, m.y + Math.cos(t * 8 + m.seed * 1.7) * 10, Math.sin(t * 14 + m.seed) * 60 + m.seed * 40, 0.5));
  [V('thFood', t), V('thPlate', t)].forEach((v, i) => {
    const c = R.thCards[i];
    pop(c.g, v, i ? 660 : 300, 855);
    c.th.level(c.lv * clamp((v - 0.2) / 0.8) * (i ? 1 : 0.92 + 0.08 * Math.sin(t * 6)));
  });

  // badges
  K.showBadge(R.bWifi, V('bWifi', t)); K.showBadge(R.bDrop, V('bDrop', t)); K.showBadge(R.bQ, V('bQ', t));
  K.showBadge(R.bHands, V('bHands', t)); K.showBadge(R.bPlate, V('bPlate', t)); K.showBadge(R.bWin, V('bWin', t));
  set(R.handL, { transform: `translate(0,${(Math.sin(t * 18) * 8).toFixed(1)})` });
  set(R.handR, { transform: `translate(0,${(-Math.sin(t * 18) * 8).toFixed(1)})` });
  set(R.handHeat, { opacity: V('handHeat', t) * (0.7 + 0.3 * Math.sin(t * 10)) });
},

// recap diagram: the world drawing at 0.6 scale with numbered markers (numbers match VIDEO.recap.legend)
recap(svg, K) {
  const { C, el } = K, { P } = K.iso(428, 500), fc = R.fc;
  R.recapSource.setAttribute('transform', 'translate(192,62) scale(0.6)');
  svg.appendChild(R.recapSource);
  const X = p => [192 + p[0] * 0.6, 62 + p[1] * 0.6];
  [[P(370, 230, 190), [80, -60]], [P(20, 200, 120), [-80, -40]], [[fc[0], fc[1] - 40], [90, 60]], [[fc[0] - 128, fc[1]], [-60, 70]]].forEach(([p, [dx, dy]], i) => {
    const [x, y] = X(p);
    el('line', { x1: x, y1: y, x2: x + dx, y2: y + dy, stroke: C.ink, 'stroke-width': 2 }, svg);
    el('circle', { cx: x, cy: y, r: 5, fill: C.ink }, svg);
    el('circle', { cx: x + dx, cy: y + dy, r: 22, fill: '#fff', stroke: C.ink, 'stroke-width': 2.5 }, svg);
    el('text', { x: x + dx, y: y + dy + 8, 'font-size': 24, 'font-weight': 700, fill: C.ink, 'text-anchor': 'middle' }, svg).textContent = String(i + 1);
  });
},
};
})();
