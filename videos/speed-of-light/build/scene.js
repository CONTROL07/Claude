// Scene: "علاش مانقدوش نفوتو سرعة الضوء؟"
// World areas (camera coords): A = rocket chase (480,540), B = Earth (1700,520), C = LHC ring (480,1750).
(() => {
const R = {};
const DIR = -22 * Math.PI / 180, UX = Math.cos(DIR), UY = Math.sin(DIR);   // chase direction (up-right)
const ROCKET = [380, 640];
const along = (s, n = 0) => [ROCKET[0] + UX * s - UY * n, ROCKET[1] + UY * s + UX * n];

window.SCENE = {
build(K) {
  const { C, S, el, pts, track } = K;
  const cam = K.layers.camera;

  // ================= AREA A: rocket chasing light =================
  const A = R.A = el('g', {}, cam);
  // track (dashed rails)
  [-70, 70].forEach(n => { const p0 = along(-520, n), p1 = along(760, n); el('line', { x1: p0[0], y1: p0[1], x2: p1[0], y2: p1[1], stroke: C.ink, 'stroke-width': 2, 'stroke-dasharray': '10 12', opacity: 0.35 }, A); });
  R.streaks = [];
  for (let i = 0; i < 9; i++) R.streaks.push({ el: el('line', { stroke: C.grey, 'stroke-width': 4, 'stroke-linecap': 'round', opacity: 0 }, A), n: -110 + (i * 37) % 220, off: i * 97 });
  // light beam
  R.beam = el('g', {}, A);
  R.beamWave = el('path', { fill: 'none', stroke: C.sun, 'stroke-width': 6, 'stroke-linecap': 'round' }, R.beam);
  const bc = el('g', {}, R.beam); R.beamCore = bc;
  el('circle', { r: 60, fill: C.sun, opacity: 0.18 }, bc);
  el('rect', { x: -80, y: -22, width: 160, height: 44, rx: 22, fill: C.sun, ...S }, bc);
  el('rect', { x: -56, y: -8, width: 112, height: 16, rx: 8, fill: '#fff', opacity: 0.85 }, bc);
  // rocket (local coords pointing +x)
  R.rocket = el('g', {}, A);
  R.flame = el('g', {}, R.rocket);
  el('path', { d: 'M-88,-20 Q-170,0 -88,20 Z', fill: C.sun, ...S }, R.flame);
  el('path', { d: 'M-88,-10 Q-135,0 -88,10 Z', fill: C.red }, R.flame);
  el('path', { d: 'M-88,-30 L-122,-66 L-58,-30Z', fill: C.blue, ...S }, R.rocket);
  el('path', { d: 'M-88,30 L-122,66 L-58,30Z', fill: C.blue, ...S }, R.rocket);
  el('path', { d: 'M-92,-32 L40,-32 Q96,-32 120,0 Q96,32 40,32 L-92,32 Z', fill: '#fff', ...S }, R.rocket);
  el('path', { d: 'M52,-31 Q98,-30 120,0 Q98,30 52,31 Z', fill: C.blue, ...S }, R.rocket);
  el('circle', { cx: 6, cy: 0, r: 15, fill: C.lblue, ...S }, R.rocket);
  el('line', { x1: -60, y1: -32, x2: -60, y2: 32, stroke: C.ink, 'stroke-width': 2, opacity: 0.5 }, R.rocket);
  // energy arrows into the engine
  R.energy = [-26, 0, 26].map(n => el('path', { fill: 'none', stroke: C.red, 'stroke-width': 6, 'stroke-linecap': 'round', opacity: 0 }, A));
  // speedometer
  const G = R.gauge = { x: 480, y: 980, r: 150 };
  const arc = (a0, a1, r) => { const p = a => [G.x + Math.cos(a) * r, G.y + Math.sin(a) * r]; const [x0, y0] = p(a0), [x1, y1] = p(a1); return `M${x0},${y0} A${r} ${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${x1},${y1}`; };
  const gg = el('g', {}, A);
  el('path', { d: arc(Math.PI, 2 * Math.PI, G.r) + ` L${G.x},${G.y}Z`, fill: '#fff', ...S }, gg);
  el('path', { d: arc(Math.PI, 1.86 * Math.PI, G.r - 22), fill: 'none', stroke: C.grid, 'stroke-width': 18 }, gg);
  el('path', { d: arc(1.88 * Math.PI, 2 * Math.PI - 0.02, G.r - 22), fill: 'none', stroke: C.red, 'stroke-width': 18 }, gg);
  for (let i = 0; i <= 10; i++) { const a = Math.PI + i * Math.PI / 10; el('line', { x1: G.x + Math.cos(a) * (G.r - 46), y1: G.y + Math.sin(a) * (G.r - 46), x2: G.x + Math.cos(a) * (G.r - 36), y2: G.y + Math.sin(a) * (G.r - 36), stroke: C.ink, 'stroke-width': 3 }, gg); }
  el('text', { x: G.x + G.r + 24, y: G.y - 6, 'font-size': 44, 'font-weight': 700, fill: C.red, 'text-anchor': 'middle', direction: 'ltr' }, gg).textContent = 'c';
  R.needle = el('line', { x1: G.x, y1: G.y, x2: G.x - G.r + 40, y2: G.y, stroke: C.ink, 'stroke-width': 6, 'stroke-linecap': 'round' }, gg);
  el('circle', { cx: G.x, cy: G.y, r: 12, fill: C.ink }, gg);
  R.coBeam = K.callout(A, ...along(330, -30), ...along(420, -150), 'الضوء', 28);
  R.coC = K.callout(A, G.x + G.r - 10, G.y - 40, G.x + G.r - 40, G.y - 170, 'سرعة الضوء', 26);
  // speed counter card (line 5)
  R.speedCard = el('g', { opacity: 0 }, A);
  el('rect', { x: 170, y: 150, width: 620, height: 210, rx: 26, fill: '#fff', ...S, 'stroke-width': 3 }, R.speedCard);
  R.speedTx = el('text', { x: 480, y: 272, 'font-size': 112, 'font-weight': 700, fill: C.red, 'text-anchor': 'middle', direction: 'ltr' }, R.speedCard);
  el('text', { x: 480, y: 332, 'font-size': 36, 'font-weight': 600, fill: C.ink, 'text-anchor': 'middle' }, R.speedCard).textContent = 'كيلومتر فالثانية';

  // ================= AREA B: Earth =================
  const B = el('g', {}, cam), E = R.E = { x: 1700, y: 540, r: 170 };
  R.orbitBack = el('g', {}, B);
  el('ellipse', { cx: E.x, cy: E.y, rx: 270, ry: 92, fill: 'none', stroke: C.ink, 'stroke-width': 2.5, 'stroke-dasharray': '10 10', opacity: 0.5 }, R.orbitBack);
  R.dotBack = el('circle', { r: 16, fill: C.sun, ...S }, R.orbitBack);
  el('circle', { cx: E.x, cy: E.y, r: E.r, fill: C.blue, ...S, 'stroke-width': 3 }, B);
  [['M1600,450 q40,-40 90,-10 q30,30 -10,60 q-50,20 -80,-10z'], ['M1730,560 q50,-30 90,10 q10,50 -40,60 q-60,0 -50,-70z'], ['M1620,600 q30,-10 40,20 q-10,30 -40,20z']]
    .forEach(([d]) => el('path', { d, fill: C.lblue, stroke: C.ink, 'stroke-width': 2 }, B));
  el('path', { d: `M${E.x - 120},${E.y - 90} a150,150 0 0 1 90,-60`, stroke: '#fff', 'stroke-width': 8, fill: 'none', 'stroke-linecap': 'round', opacity: 0.6 }, B);
  R.orbitFront = el('g', {}, B);
  el('path', { d: `M${E.x - 270},${E.y} A270 92 0 0 0 ${E.x + 270},${E.y}`, fill: 'none', stroke: C.ink, 'stroke-width': 2.5, 'stroke-dasharray': '10 10', opacity: 0.5 }, R.orbitFront);
  R.trail = el('path', { fill: 'none', stroke: C.sun, 'stroke-width': 8, 'stroke-linecap': 'round', opacity: 0.8 }, R.orbitFront);
  R.dotFront = el('circle', { r: 16, fill: C.sun, ...S }, R.orbitFront);
  R.lapG = el('g', { opacity: 0 }, B);
  el('rect', { x: E.x - 170, y: E.y - 380, width: 340, height: 150, rx: 24, fill: '#fff', ...S, 'stroke-width': 3 }, R.lapG);
  R.lapTx = el('text', { x: E.x, y: E.y - 290, 'font-size': 78, 'font-weight': 700, fill: C.red, 'text-anchor': 'middle', direction: 'ltr' }, R.lapG);
  el('text', { x: E.x, y: E.y - 248, 'font-size': 28, 'font-weight': 600, fill: C.ink, 'text-anchor': 'middle' }, R.lapG).textContent = 'دورات فثانية وحدة';

  // ================= AREA C: LHC ring =================
  const Cg = el('g', {}, cam), L = R.L = { x: 480, y: 1760, rx: 330, ry: 190 };
  for (let i = -3; i <= 3; i++) { el('line', { x1: L.x - 420 + i * 60, y1: L.y + 240 + i * 0, x2: L.x + 420 + i * 60, y2: L.y - 240, stroke: C.grid, 'stroke-width': 2 }, Cg); }
  el('ellipse', { cx: L.x, cy: L.y + 14, rx: L.rx, ry: L.ry, fill: 'none', stroke: C.ink, 'stroke-width': 40, opacity: 0.08 }, Cg);
  el('ellipse', { cx: L.x, cy: L.y, rx: L.rx, ry: L.ry, fill: 'none', stroke: C.ink, 'stroke-width': 36 }, Cg);
  el('ellipse', { cx: L.x, cy: L.y, rx: L.rx, ry: L.ry, fill: 'none', stroke: C.lblue, 'stroke-width': 30 }, Cg);
  el('ellipse', { cx: L.x, cy: L.y, rx: L.rx, ry: L.ry, fill: 'none', stroke: '#fff', 'stroke-width': 6, opacity: 0.8 }, Cg);
  const iso = K.iso(0, 0);
  [0, 0.5, 1, 1.5].forEach(k => {
    const a = k * Math.PI, x = L.x + Math.cos(a) * L.rx, y = L.y + Math.sin(a) * L.ry;
    const g = el('g', { transform: `translate(${x},${y - 10})` }, Cg);
    K.box(iso.P, -26, 26, 0, 46, -26, 26, ['#fff', C.lblue, '#9FD0F3'], g);
  });
  R.lhcTrail = el('path', { fill: 'none', stroke: C.blue, 'stroke-width': 10, 'stroke-linecap': 'round' }, Cg);
  R.lhcDot = el('circle', { r: 13, fill: C.blue, ...S }, Cg);
  R.coLHC = K.callout(Cg, L.x + L.rx - 14, L.y - 40, L.x + 170, L.y - 290, 'LHC · قرب جنيف', 30);
  R.lhcCard = el('g', { opacity: 0 }, Cg);
  el('rect', { x: 150, y: 1360, width: 660, height: 200, rx: 26, fill: '#fff', ...S, 'stroke-width': 3 }, R.lhcCard);
  R.lhcTx = el('text', { x: 480, y: 1480, 'font-size': 92, 'font-weight': 700, fill: C.red, 'text-anchor': 'middle', direction: 'ltr' }, R.lhcCard);
  el('text', { x: 480, y: 1534, 'font-size': 30, 'font-weight': 600, fill: C.ink, 'text-anchor': 'middle' }, R.lhcCard).textContent = 'من سرعة الضوء';
  R.no100 = el('g', { opacity: 0 }, Cg);
  el('rect', { x: 360, y: 1580, width: 240, height: 100, rx: 20, fill: '#fff', ...S }, R.no100);
  el('text', { x: 480, y: 1650, 'font-size': 56, 'font-weight': 700, fill: C.grey, 'text-anchor': 'middle', direction: 'ltr' }, R.no100).textContent = '100%';
  el('line', { x1: 380, y1: 1660, x2: 580, y2: 1600, stroke: C.red, 'stroke-width': 9, 'stroke-linecap': 'round' }, R.no100);

  // ================= MICRO: energy bars =================
  const mb = R.mBars = K.micro();
  el('line', { x1: 140, y1: 820, x2: 860, y2: 820, stroke: C.ink, 'stroke-width': 4 }, mb);
  el('line', { x1: 140, y1: 820, x2: 140, y2: 60, stroke: C.ink, 'stroke-width': 4 }, mb);
  el('polygon', { points: '140,40 128,66 152,66', fill: C.ink }, mb);
  el('text', { x: 170, y: 70, 'font-size': 34, 'font-weight': 700, fill: C.ink, 'text-anchor': 'end' }, mb).textContent = 'الطاقة اللي خاصاك';
  el('text', { x: 500, y: 960, 'font-size': 30, 'font-weight': 500, fill: C.text2, 'text-anchor': 'middle' }, mb).textContent = 'السرعة (من سرعة الضوء)';
  R.bars = [[250, '50%', 0.155], [420, '90%', 1.294], [590, '99%', 6.09], [760, '99.99%', 69.7]].map(([x, lab, e], i) => {
    const r = el('rect', { x: x - 60, y: 820, width: 120, height: 0, rx: 10, fill: i === 3 ? C.red : C.blue, stroke: C.ink, 'stroke-width': 3 }, mb);
    const tx = el('text', { x, y: 880, 'font-size': 32, 'font-weight': 700, fill: C.ink, 'text-anchor': 'middle', direction: 'ltr', opacity: 0 }, mb);
    tx.textContent = lab;
    return { r, tx, h: Math.min(1400, 640 * e / 6.09) };
  });
  R.inf = el('g', { opacity: 0 }, mb);
  el('circle', { cx: 480, cy: 430, r: 190, fill: '#fff', ...S, 'stroke-width': 4 }, R.inf);
  el('text', { x: 480, y: 520, 'font-size': 280, 'font-weight': 700, fill: C.red, 'text-anchor': 'middle', direction: 'ltr' }, R.inf).textContent = '∞';
  R.infStrike = el('line', { x1: 330, y1: 580, x2: 630, y2: 280, stroke: C.ink, 'stroke-width': 14, 'stroke-linecap': 'round', 'stroke-dasharray': 430, 'stroke-dashoffset': 430 }, R.inf);

  // ================= MICRO: a particle with mass =================
  const mp = R.mPart = K.micro();
  R.cLine = el('g', { opacity: 0 }, mp);
  el('line', { x1: 820, y1: 160, x2: 820, y2: 820, stroke: C.red, 'stroke-width': 6, 'stroke-dasharray': '18 14' }, R.cLine);
  el('text', { x: 820, y: 130, 'font-size': 56, 'font-weight': 700, fill: C.red, 'text-anchor': 'middle', direction: 'ltr' }, R.cLine).textContent = 'c';
  el('text', { x: 820, y: 880, 'font-size': 28, 'font-weight': 600, fill: C.red, 'text-anchor': 'middle' }, R.cLine).textContent = 'سرعة الضوء';
  R.pStreaks = [0, 1, 2, 3].map(i => el('line', { stroke: C.grey, 'stroke-width': 6, 'stroke-linecap': 'round', opacity: 0 }, mp));
  R.part = el('g', {}, mp);
  R.partBody = el('circle', { r: 120, fill: C.blue, ...S, 'stroke-width': 4 }, R.part);
  R.atoms = [[-50, -40], [20, -60], [60, 0], [10, 50], [-50, 30], [-10, -5], [40, 60]].map(([x, y]) => el('circle', { cx: x, cy: y, r: 0, fill: C.lblue, ...S }, R.part));
  el('path', { d: 'M-70,-60 a90,90 0 0 1 60,-40', stroke: '#fff', 'stroke-width': 9, fill: 'none', 'stroke-linecap': 'round', opacity: 0.6 }, R.part);
  R.coMass = K.callout(mp, 400, 410, 250, 220, 'كتلة', 34);

  // ================= MICRO: photon =================
  const mph = R.mPhoton = K.micro();
  R.lamp = el('g', { opacity: 0 }, mph);
  el('circle', { cx: 150, cy: 470, r: 60, fill: C.sun, ...S, 'stroke-width': 3 }, R.lamp);
  el('rect', { x: 120, y: 528, width: 60, height: 50, rx: 8, fill: C.grey, ...S }, R.lamp);
  R.photonW = el('path', { fill: 'none', stroke: C.sun, 'stroke-width': 10, 'stroke-linecap': 'round' }, mph);
  R.photonI = el('path', { fill: 'none', stroke: C.ink, 'stroke-width': 2.5, 'stroke-linecap': 'round' }, mph);
  R.coPhoton = K.callout(mph, 480, 420, 600, 250, 'فوتون', 34);
  R.massCard = el('g', { opacity: 0 }, mph);
  el('rect', { x: 260, y: 700, width: 440, height: 150, rx: 26, fill: '#fff', ...S, 'stroke-width': 3 }, R.massCard);
  const mt = el('text', { x: 480, y: 800, 'font-size': 64, 'font-weight': 700, fill: C.ink, 'text-anchor': 'middle' }, R.massCard);
  mt.innerHTML = 'الكتلة = <tspan fill="#2E9BEA">0</tspan>';
  R.cTag = el('text', { x: 860, y: 400, 'font-size': 56, 'font-weight': 700, fill: C.red, 'text-anchor': 'middle', direction: 'ltr', opacity: 0 }, mph);
  R.cTag.textContent = 'c';

  // ================= MICRO: two clocks =================
  const mc = R.mClocks = K.micro();
  R.hands = [[290, 'فالأرض'], [670, 'فالصاروخ']].map(([x, lab], i) => {
    el('circle', { cx: x, cy: 470, r: 160, fill: '#fff', ...S, 'stroke-width': 5 }, mc);
    for (let k = 0; k < 12; k++) { const a = k * Math.PI / 6; el('line', { x1: x + Math.cos(a) * 130, y1: 470 + Math.sin(a) * 130, x2: x + Math.cos(a) * 146, y2: 470 + Math.sin(a) * 146, stroke: C.ink, 'stroke-width': k % 3 ? 3 : 6 }, mc); }
    const h = el('line', { x1: x, y1: 470, x2: x, y2: 350, stroke: i ? C.red : C.ink, 'stroke-width': 8, 'stroke-linecap': 'round' }, mc);
    el('circle', { cx: x, cy: 470, r: 12, fill: C.ink }, mc);
    el('text', { x, y: 700, 'font-size': 44, 'font-weight': 700, fill: C.ink, 'text-anchor': 'middle' }, mc).textContent = lab;
    return { h, x };
  });
  { const e = el('g', {}, mc); el('circle', { cx: 290, cy: 790, r: 40, fill: C.blue, ...S }, e); el('path', { d: 'M270,775 q15,-12 30,0 q-5,20 -30,10z', fill: C.lblue }, e); }
  { const r = el('g', { transform: 'translate(670,790) rotate(-22) scale(0.42)' }, mc);
    el('path', { d: 'M-92,-32 L40,-32 Q96,-32 120,0 Q96,32 40,32 L-92,32 Z', fill: '#fff', ...S, 'stroke-width': 5 }, r);
    el('path', { d: 'M52,-31 Q98,-30 120,0 Q98,30 52,31 Z', fill: C.blue, ...S, 'stroke-width': 5 }, r); }
  R.slowTag = el('text', { x: 670, y: 270, 'font-size': 40, 'font-weight': 700, fill: C.red, 'text-anchor': 'middle', opacity: 0 }, mc);
  R.slowTag.textContent = 'تايتبطأ';

  // ================= badges =================
  R.bCart = K.badge();
  R.cart = el('g', {}, R.bCart);
  el('path', { d: 'M-46,-26 h76 l-10,38 h-58 z', fill: C.lblue, ...S, 'stroke-width': 3 }, R.cart);
  el('path', { d: 'M30,-26 l10,-18 h14', fill: 'none', ...S, 'stroke-width': 4 }, R.cart);
  [-28, 12].forEach(x => el('circle', { cx: x, cy: 26, r: 8, fill: C.ink }, R.cart));
  R.cartLoad = el('rect', { x: -40, y: -50, width: 60, height: 26, rx: 4, fill: C.grey, ...S, 'stroke-width': 3, opacity: 0 }, R.cart);
  R.bLimit = K.badge();
  el('circle', { r: 54, fill: '#fff', stroke: C.red, 'stroke-width': 12 }, R.bLimit);
  el('text', { y: 22, 'font-size': 64, 'font-weight': 700, fill: C.ink, 'text-anchor': 'middle', direction: 'ltr' }, R.bLimit).textContent = 'c';

  // ================= tracks =================
  const AW = [480, 600, 1.08], ROCK = [along(40)[0], along(40)[1] - 20, 1.45];
  track('cam', AW, [
    [0, 0.01, [480, 640, 1.3], 'l'],
    [0.02, 3.9, [500, 620, 1.42], 'io'],
    [4.9, 1.0, [480, 470, 1.05], 'x'],
    [9.3, 1.1, [1700, 470, 1.15], 'x'],
    [13.05, 1.1, ROCK, 'x'],
    [14.85, 0.9, [along(-90)[0], along(-90)[1], 2.0], 'x'],
    [16.3, 0.6, [along(-60)[0], along(-60)[1], 6], 'i'],
    [38.6, 0.01, [480, 1760, 3.2], 'l'],
    [38.62, 1.1, [480, 1660, 1.12], 'x'],
    [53.1, 0.6, [L.x + L.rx, L.y, 7], 'i'],
    [58.45, 0.01, [480, 600, 1.08], 'l'],
  ]);
  track('micro', 0, [[16.4, 0.5, 1, 'o'], [38.55, 0.4, 0, 'i'], [53.2, 0.5, 1, 'o'], [58.4, 0.3, 0, 'i'], [59.25, 0.4, 1, 'o'], [62.3, 0.4, 0, 'i']]);
  track('dim', 0, [[58.6, 0.3, 0.85, 'o'], [59.6, 0.3, 0, 'i']]);
  track('needle', 0.05, [[0.1, 1.3, 0.8, 'o'], [1.4, 1.0, 0.965, 'o'], [13.0, 0.01, 0.6, 'l'], [15.0, 2.0, 0.93, 'o']]);
  track('gap', 290, [[0, 3.8, 360, 'o']]);
  track('coBeam', 0, [[0.4, 0.7, 1, 'o'], [2.5, 0.3, 0, 'i']]);
  track('coC', 0, [[1.45, 0.7, 1, 'o'], [2.5, 0.3, 0, 'i']]);
  track('speedCard', 0, [[5.4, 0.5, 1, 'b'], [9.25, 0.3, 0, 'i']]);
  track('speed', 0, [[5.6, 2.0, 299792, 'o']]);
  track('laps', 0, [[10.49, 2.5, 7.5, 'io']]);
  track('lapCard', 0, [[10.5, 0.5, 1, 'b'], [13.0, 0.3, 0, 'i']]);
  track('energy', 0, [[14.9, 0.5, 1, 'o'], [16.4, 0.3, 0, 'i']]);
  track('flame', 1, [[14.9, 1.0, 1.8, 'o']]);
  track('mBars', 0, [[16.45, 0.5, 1, 'o'], [29.6, 0.4, 0, 'i']]);
  track('bar0', 0, [[17.66, 0.6, 1, 'o']]);
  track('bar1', 0, [[18.1, 0.8, 1, 'o']]);
  track('bar2', 0, [[18.7, 1.0, 1, 'o']]);
  track('bar3', 0, [[23.73, 2.0, 1, 'i']]);
  track('inf', 0, [[25.83, 0.5, 1, 'b']]);
  track('strike', 0, [[27.95, 0.5, 1, 'o']]);
  track('bCart', 0, [[19.84, 0.5, 1, 'l'], [23.7, 0.3, 0, 'l']]);
  track('cartLoad', 0, [[22.01, 0.4, 1, 'b']]);
  track('mPart', 0, [[29.7, 0.5, 1, 'o'], [38.55, 0.4, 0, 'i']]);
  track('coMass', 0, [[30.0, 0.8, 1, 'o'], [33.2, 0.3, 0, 'i']]);
  track('atoms', 0, [[31.76, 0.8, 1, 'o'], [33.2, 0.4, 0, 'i']]);
  track('run', 0, [[33.26, 3.6, 1, 'o']]);
  track('cLine', 0, [[33.0, 0.5, 1, 'o']]);
  track('bLimit', 0, [[35.37, 0.5, 1, 'l'], [38.55, 0.3, 0, 'l']]);
  track('coLHC', 0, [[39.97, 0.8, 1, 'o'], [44.4, 0.3, 0, 'i']]);
  track('lhcSpeed', 0.3, [[42.56, 2.0, 3.2, 'i']]);
  track('lhcOn', 0, [[39.0, 0.6, 1, 'o']]);
  track('lhcCard', 0, [[44.54, 0.5, 1, 'b']]);
  track('digits', 0, [[44.9, 5.6, 1, 'l']]);
  track('no100', 0, [[51.34, 0.5, 1, 'b']]);
  track('mPhoton', 0, [[53.3, 0.5, 1, 'o'], [58.4, 0.3, 0, 'i']]);
  track('coPhoton', 0, [[53.6, 0.8, 1, 'o'], [54.8, 0.3, 0, 'i']]);
  track('massCard', 0, [[54.83, 0.5, 1, 'b'], [56.3, 0.3, 0, 'i']]);
  track('emit', 0, [[56.38, 0.4, 1, 'o']]);
  track('mClocks', 0, [[59.3, 0.5, 1, 'o'], [62.3, 0.4, 0, 'i']]);
  track('slow', 0, [[60.94, 0.6, 1, 'o']]);
},

render(t, K) {
  const { C, set, clamp, V, EASE, wavePath } = K;
  const L = R.L, E = R.E;

  // ---- area A: rocket + beam + streaks ----
  const jit = Math.sin(t * 31) * 1.5, [rx, ry] = along(0, jit);
  set(R.rocket, { transform: `translate(${rx.toFixed(1)},${ry.toFixed(1)}) rotate(-22)` });
  const fl = V('flame', t) * (0.85 + 0.15 * Math.sin(t * 40));
  set(R.flame, { transform: `translate(-88,0) scale(${fl.toFixed(3)},1) translate(88,0)` });
  const gap = V('gap', t), [bx, by] = along(gap);
  set(R.beamCore, { transform: `translate(${bx.toFixed(1)},${by.toFixed(1)}) rotate(-22)` });
  set(R.beamWave, { d: wavePath([along(gap - 260), along(gap - 80)], 12, 46, t * 18, 1).d });
  R.streaks.forEach(s => {
    const u = ((t * 900 + s.off) % 1100) - 520, p0 = along(u, s.n), p1 = along(u - 70, s.n);
    set(s.el, { x1: p0[0], y1: p0[1], x2: p1[0], y2: p1[1], opacity: 0.55 });
  });
  const en = V('energy', t);
  R.energy.forEach((p, i) => {
    const k = ((t * 1.6 + i * 0.33) % 1);
    set(p, { d: `M${along(-330 + k * 140, (i - 1) * 50)[0]},${along(-330 + k * 140, (i - 1) * 50)[1]} L${along(-260 + k * 140, (i - 1) * 50)[0]},${along(-260 + k * 140, (i - 1) * 50)[1]}`, opacity: (en * (1 - k)).toFixed(2) });
  });
  const G = R.gauge, a = Math.PI + V('needle', t) * Math.PI + Math.sin(t * 23) * 0.006;
  set(R.needle, { x2: G.x + Math.cos(a) * (G.r - 40), y2: G.y + Math.sin(a) * (G.r - 40) });
  R.coBeam(V('coBeam', t)); R.coC(V('coC', t));
  set(R.speedCard, { opacity: V('speedCard', t) });
  R.speedTx.textContent = Math.round(V('speed', t)).toLocaleString('en-US');

  // ---- area B: Earth orbit ----
  const laps = V('laps', t), th = laps * 2 * Math.PI + Math.PI / 2;
  const ox = E.x + Math.cos(th) * 270, oy = E.y + Math.sin(th) * 92, front = Math.sin(th) > 0;
  set(R.dotFront, { cx: ox, cy: oy, opacity: front ? 1 : 0 });
  set(R.dotBack, { cx: ox, cy: oy, opacity: front ? 0 : 1 });
  let d = '';
  for (let k = 0; k <= 12; k++) { const tt = th - k * 0.08; if (Math.sin(tt) > 0) d += (d ? 'L' : 'M') + (E.x + Math.cos(tt) * 270).toFixed(1) + ',' + (E.y + Math.sin(tt) * 92).toFixed(1); }
  set(R.trail, { d: d || 'M0,0', opacity: laps > 0 && laps < 7.5 ? 0.8 : 0 });
  set(R.lapG, { opacity: V('lapCard', t) });
  R.lapTx.textContent = '×' + (Math.floor(laps * 2) / 2).toFixed(1);

  // ---- area C: LHC ----
  const sp = V('lhcSpeed', t), phase = (t - 39) * sp * 2.4;
  const px = L.x + Math.cos(phase) * L.rx, py = L.y + Math.sin(phase) * L.ry;
  set(R.lhcDot, { cx: px, cy: py, opacity: V('lhcOn', t) });
  let dl = '';
  for (let k = 0; k <= 16; k++) { const ph = phase - k * 0.05 * sp; dl += (dl ? 'L' : 'M') + (L.x + Math.cos(ph) * L.rx).toFixed(1) + ',' + (L.y + Math.sin(ph) * L.ry).toFixed(1); }
  set(R.lhcTrail, { d: dl, opacity: (V('lhcOn', t) * 0.6).toFixed(2) });
  R.coLHC(V('coLHC', t));
  set(R.lhcCard, { opacity: V('lhcCard', t) });
  const full = '99.9999991', n = Math.min(full.length, 2 + Math.floor(V('digits', t) * (full.length - 1)));
  R.lhcTx.textContent = full.slice(0, Math.max(2, n)) + '%';
  set(R.no100, { opacity: V('no100', t) });

  // ---- micro: energy bars ----
  K.microScene(R.mBars, V('mBars', t));
  R.bars.forEach((b, i) => {
    const v = EASE.o(clamp(V('bar' + i, t))), h = b.h * v;
    set(b.r, { y: 820 - h, height: h });
    set(b.tx, { opacity: clamp(V('bar' + i, t) * 3) });
  });
  set(R.inf, { opacity: V('inf', t), transform: `translate(480,430) scale(${(0.6 + 0.4 * EASE.b(clamp(V('inf', t)))).toFixed(3)}) translate(-480,-430)` });
  set(R.infStrike, { 'stroke-dashoffset': (430 * (1 - V('strike', t))).toFixed(1) });
  K.showBadge(R.bCart, V('bCart', t));
  const cl = V('cartLoad', t);
  set(R.cartLoad, { opacity: cl });
  set(R.cart, { transform: `translate(${(cl * Math.sin(t * 30) * 3).toFixed(1)},${(cl * 4).toFixed(1)})` });

  // ---- micro: particle ----
  K.microScene(R.mPart, V('mPart', t));
  const run = V('run', t), at = V('atoms', t);
  const pr = 120 - 50 * clamp(run * 4), pxx = 380 + 360 * (1 - Math.pow(1 - run, 3)) * 0.97;
  set(R.part, { transform: `translate(${pxx.toFixed(1)},480) scale(${(pr / 120).toFixed(3)})` });
  set(R.partBody, { fill: K.hexLerp(C.blue, '#7EC0EE', at) });
  R.atoms.forEach((c, i) => set(c, { r: (EASE.b(clamp(at * 1.4 - i * 0.06)) * 20).toFixed(1) }));
  R.coMass(V('coMass', t));
  set(R.cLine, { opacity: V('cLine', t) });
  R.pStreaks.forEach((s, i) => {
    const on = run > 0.02 && run < 0.98, y = 450 + (i - 1.5) * 26, x0 = pxx - 70 - ((t * 600 + i * 50) % 120);
    set(s, { x1: x0, y1: y, x2: x0 - 80, y2: y, opacity: on ? 0.6 : 0 });
  });
  K.showBadge(R.bLimit, V('bLimit', t));

  // ---- micro: photon ----
  K.microScene(R.mPhoton, V('mPhoton', t));
  const em = V('emit', t);
  const cx = em > 0 ? 260 + ((t - 56.38) * 900) % 760 : 480;
  const env = [[cx - 160, 470], [cx + 160, 470]];
  const pw = wavePath(env, 46, 64, t * 22, 1);
  set(R.photonW, { d: pw.d }); set(R.photonI, { d: pw.d });
  set(R.lamp, { opacity: em });
  set(R.cTag, { opacity: em });
  R.coPhoton(V('coPhoton', t));
  set(R.massCard, { opacity: V('massCard', t) });

  // ---- micro: clocks ----
  K.microScene(R.mClocks, V('mClocks', t));
  const base = (t - 59.3) * 300, sl = V('slow', t);
  R.hands.forEach((h, i) => {
    const ang = i ? base * (1 - 0.75 * sl) + (sl > 0 ? 0 : 0) : base;
    const r = (ang - 90) * Math.PI / 180;
    set(h.h, { x2: h.x + Math.cos(r) * 120, y2: 470 + Math.sin(r) * 120 });
  });
  set(R.slowTag, { opacity: sl });
},

recap(svg, K) {
  const { C, el } = K;
  const [bx, by] = along(330);
  R.rocket.setAttribute('transform', `translate(${along(0)[0]},${along(0)[1]}) rotate(-22)`);
  R.beamCore.setAttribute('transform', `translate(${bx},${by}) rotate(-22)`);
  R.beamWave.setAttribute('d', K.wavePath([along(70), along(250)], 12, 46, 0, 1).d);
  const clone = R.A.cloneNode(true);
  clone.setAttribute('transform', 'translate(205,-6) scale(0.55)');
  svg.appendChild(clone);
  const X = p => [205 + p[0] * 0.55, -6 + p[1] * 0.55];
  const G = R.gauge;
  [[along(330), [40, -70]], [along(-150), [-60, -60]], [along(0), [-30, 80]], [[G.x + G.r - 20, G.y - 40], [70, -40]]].forEach(([p, [dx, dy]], i) => {
    const [x, y] = X(p);
    el('line', { x1: x, y1: y, x2: x + dx, y2: y + dy, stroke: C.ink, 'stroke-width': 2 }, svg);
    el('circle', { cx: x, cy: y, r: 5, fill: C.ink }, svg);
    el('circle', { cx: x + dx, cy: y + dy, r: 22, fill: '#fff', stroke: C.ink, 'stroke-width': 2.5 }, svg);
    el('text', { x: x + dx, y: y + dy + 8, 'font-size': 24, 'font-weight': 700, fill: C.ink, 'text-anchor': 'middle' }, svg).textContent = String(i + 1);
  });
},
};
})();
