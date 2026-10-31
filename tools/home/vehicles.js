/* SPDX-License-Identifier: Apache-2.0 */
/** Vehicles for a garage, drive or street: cars drawn from a body-section table (wheel arches, glass, lamps), a pickup, a motorcycle, a bicycle.
 *  Length along Y, the front toward −Y; the origin is the middle of the footprint at the ground. Typical sizes, not any maker's vehicle. */
import { Model, Plan, makeItem, superRing } from './kit.js';
import { C, VH } from './common.js';

const lerp = (tab, u) => {            // piecewise-linear lookup in [[u, v]…]
  if (u <= tab[0][0]) return tab[0][1];
  for (let i = 1; i < tab.length; i++) if (u <= tab[i][0]) { const [u0, v0] = tab[i - 1], [u1, v1] = tab[i]; return v0 + (v1 - v0) * (u - u0) / (u1 - u0); }
  return tab[tab.length - 1][1];
};
const smooth = (t) => t * t * (3 - 2 * t);

/** A wheel at (x, y), outward direction s (±1): tyre, alloy disc, spokes. R = tyre radius, B = tyre width (mm). */
function wheel(M, x, y, s, R, B, rimR) {
  const tyre = M.part('tyres', C.rubber), alloy = M.part('wheels', '#b9bec4'), dark = M.part('wheel centres', '#3a3d41');
  const c = [x, y, R];
  tyre.lathe('x', c, [[-B / 2, rimR], [-B / 2 - 3, rimR + (R - rimR) * .55], [-B / 2 + 14, R - 6], [-B / 2 + 40, R], [B / 2 - 40, R], [B / 2 - 14, R - 6], [B / 2 + 3, rimR + (R - rimR) * .55], [B / 2, rimR], [B / 2 - 20, rimR - 8], [-B / 2 + 20, rimR - 8], [-B / 2, rimR]], 36, { caps: false });
  alloy.lathe('x', c, [[s * -B * .2, 0], [s * -B * .2, rimR - 4], [s * B * .32, rimR - 4], [s * B * .36, rimR * .78], [s * B * .22, rimR * .72], [s * B * .22, 0]], 32);
  dark.lathe('x', [x + s * B * .36, y, R], [[0, rimR * .22], [s * 8, rimR * .2], [s * 8, 0]], 14);
  for (let i = 0; i < 5; i++) { const a = i * 2 * Math.PI / 5; dark.strut([x + s * B * .34, y + Math.cos(a) * rimR * .26, R + Math.sin(a) * rimR * .26], [x + s * B * .34, y + Math.cos(a) * rimR * .8, R + Math.sin(a) * rimR * .8], rimR * .07, 6); }
}

/**
 * spec: L W H (mm), color, wheelR, wb (wheelbase), front/rear overhang follow, belt, hood/deck tables:
 *   body: [[u, zTop, wFactor, zBottom]…] from the tail (u = 0) to the nose (u = 1); cabin: [[u, zRoof, wFactor]…]; belt = beltline height.
 */
function car(spec) {
  const { bed, L, W, H, color, wr, wb, ofront, body, cabin, belt, name, desc, cat = 'site/vehicles', grille = true, ride = 150, glassTone = '#26323a' } = spec;
  const M = new Model(), bd = M.part('body', color), gl = M.part('glass', glassTone, .55), roof = M.part('roof', color), lamp = M.part('headlamps', '#e9e6d8'), tail = M.part('tail lamps', '#a3191f'), gr = M.part('grille', C.black), tr = M.part('trim', C.chrome);
  const yOf = (u) => L / 2 - u * L, hw = W / 2;
  const fy = -L / 2 + ofront, ry = fy + wb, arch = (u) => { const y = yOf(u); let z = 0; for (const wy of [fy, ry]) { const dy = Math.abs(y - wy), Ra = wr + 55; if (dy < Ra) z = Math.max(z, wr + Math.sqrt(Ra * Ra - dy * dy)); } return z; };
  const us = []; for (let i = 0; i <= 120; i++) us.push(i / 120);
  const bodyRings = us.map((u) => {
    const zt = lerp(body.map(([a, b]) => [a, b]), u), wf = lerp(body.map(([a, , c]) => [a, c]), u), zb0 = lerp(body.map(([a, , , d]) => [a, d]), u);
    const zb = Math.min(zt - 60, Math.max(zb0, arch(u))), a = Math.max(hw * wf, 8), b = Math.max((zt - zb) / 2, 6);
    return superRing(0, (zt + zb) / 2, a, b, 4.2, yOf(u), 44);
  });
  bd.loft(bodyRings);
  // cabin: glass between the belt and the roof, a roof panel in the body colour
  const cu = us.filter((u) => u >= cabin[0][0] && u <= cabin[cabin.length - 1][0]);
  const cabRing = (u, inset, zr) => { const zt = lerp(cabin.map(([a, b]) => [a, b]), u) - zr, wf = lerp(cabin.map(([a, , c]) => [a, c]), u), f = smooth(Math.min(1, Math.min(u - cabin[0][0], cabin[cabin.length - 1][0] - u) / 0.035)); const zb = belt - 20 * (1 - f); const a = hw * wf * (0.55 + 0.45 * f) - inset, b = Math.max((zt - zb) / 2, 5); return superRing(0, (zt + zb) / 2, a, b, 3.3, yOf(u), 40); };
  gl.loft(cu.map((u) => cabRing(u, 0, 0)));
  const ru = cu.filter((u) => u > cabin[0][0] + 0.06 && u < cabin[cabin.length - 1][0] - 0.07);
  roof.loft(ru.map((u) => { const zt = lerp(cabin.map(([a, b]) => [a, b]), u), wf = lerp(cabin.map(([a, , c]) => [a, c]), u); return superRing(0, zt - 22, hw * wf - 6, 24, 3.3, yOf(u), 40); }));
  // lamps, grille, mirrors, plates
  const nz = lerp(body.map(([a, b]) => [a, b]), 0.97) - 140;
  for (const s of [-1, 1]) {
    lamp.ellipsoid([s * hw * .72, -L / 2 + 70, nz], 130, 70, 55, 14, 8);
    tail.ellipsoid([s * hw * .72, L / 2 - 50, lerp(body.map(([a, b]) => [a, b]), 0.03) - 120], 120, 50, 55, 14, 8);
    tr.ellipsoid([s * (hw * .78), yOf(cabin[0][0] + (cabin[cabin.length - 1][0] - cabin[0][0]) * .78), belt + 50], 70, 110, 45, 12, 8);
  }
  if (grille) gr.rbox(-hw * .38, -L / 2 + 6, nz - 130, hw * .38, -L / 2 + 70, nz + 20, 20, 0, 2);
  gr.rbox(-hw * .5, -L / 2 + 4, ride + 20, hw * .5, -L / 2 + 60, ride + 110, 20, 0, 2);
  for (const [wy, s] of [[fy, -1], [fy, 1], [ry, -1], [ry, 1]]) wheel(M, s * (hw - 118), wy, s, wr, 215, wr * .66);
  if (bed) {                                   // open load bed: side rails, a headboard and a tailgate on the low deck
    const y0 = yOf(.0), y1 = yOf(.3), zr0 = 880, zr1 = 1160;
    for (const s of [-1, 1]) bd.rbox(s > 0 ? hw - 95 : -hw + 25, y1, zr0, s > 0 ? hw - 25 : -hw + 95, y0 - 10, zr1, 25, 8, 1);
    bd.rbox(-hw + 25, y0 - 70, zr0, hw - 25, y0 - 10, zr1, 20, 6, 1);
    bd.rbox(-hw + 95, y1, zr0, hw - 95, y1 + 70, 1260, 20, 6, 1);
  }
  // plan
  const left = us.filter((_, i) => i % 6 === 0).map((u) => [lerp(body.map(([a, , c]) => [a, c]), u) * hw, yOf(u)]);
  const outline = [...left, ...left.slice().reverse().map(([x, y]) => [-x, y])];
  const cl = cu.filter((_, i) => i % 6 === 0).map((u) => [lerp(cabin.map(([a, , c]) => [a, c]), u) * hw * .86, yOf(u)]);
  const p = new Plan(VH).poly('VEHICLE', outline, true).poly('VEHICLE-DETAIL', [...cl, ...cl.slice().reverse().map(([x, y]) => [-x, y])], true);
  for (const [wy, s] of [[fy, -1], [fy, 1], [ry, -1], [ry, 1]]) p.rect('VEHICLE-DETAIL', s * (hw - 118) - 107, wy - wr, s * (hw - 118) + 107, wy + wr);
  const it = makeItem({ name, kind: 'furniture', category: cat, description: desc, ifc: { class: 'IfcTransportElement', predefined: 'NOTDEFINED' }, plan: p, model: M, remarks: 'Typical size for the class, not any maker\'s vehicle.', attrs: { 'CC-NOTE': 'Body, glass and wheels are shapes for scale and clearances; wheel arches are cut into the underside' } });
  return it;
}

export function sedan() {
  return car({ name: 'Car, sedan, four-door, 15.7 ft', L: 4790, W: 1850, H: 1450, color: '#566470', wr: 330, wb: 2800, ofront: 900, belt: 960,
    body: [[0, 700, .86, 260], [.02, 880, .94, 230], [.07, 985, .98, 190], [.2, 1000, 1, 190], [.34, 960, 1, 190], [.62, 940, 1, 190], [.82, 860, .99, 190], [.95, 740, .93, 220], [1, 640, .84, 300]],
    cabin: [[.25, 975, .86], [.31, 1230, .88], [.37, 1440, .86], [.58, 1450, .86], [.66, 1280, .84], [.73, 1010, .83]],
    desc: 'Four-door sedan, 4.79 m (15.7 ft) long, 1.85 m wide, 1.45 m tall, 2.8 m wheelbase, with glass, a roof, lamps, a grille and four wheels with arches, for drives, garages and parking. Front toward −Y.' });
}
export function suv() {
  return car({ name: 'Car, SUV, midsize, 16.1 ft', L: 4900, W: 1930, H: 1720, color: '#2f4a5a', wr: 360, wb: 2850, ofront: 930, belt: 1130, ride: 200,
    body: [[0, 1180, .9, 300], [.03, 1210, .96, 270], [.1, 1230, 1, 240], [.7, 1090, 1, 230], [.85, 1000, .99, 250], [.96, 900, .93, 290], [1, 760, .86, 360]],
    cabin: [[.02, 1190, .9], [.07, 1480, .9], [.15, 1715, .88], [.55, 1720, .87], [.65, 1550, .85], [.72, 1150, .84]],
    desc: 'Midsize sport utility vehicle, 4.9 m (16.1 ft) long, 1.93 m wide, 1.72 m tall, 2.85 m wheelbase, with glass, a roof, lamps and four wheels with arches, for drives, garages and parking. Front toward −Y.' });
}
export function pickup() {
  const k = car({ bed: true, name: 'Truck, pickup, crew cab, 19.4 ft', L: 5900, W: 2030, H: 1950, color: '#7a2f2a', wr: 400, wb: 3600, ofront: 1000, belt: 1250, ride: 230,
    body: [[0, 880, .96, 340], [.02, 900, .98, 330], [.3, 900, 1, 320], [.31, 1230, 1, 320], [.6, 1230, 1, 330], [.72, 1200, 1, 320], [.86, 1170, 1, 300], [.95, 1070, .96, 330], [1, 920, .9, 420]],
    cabin: [[.34, 1260, .88], [.38, 1600, .88], [.46, 1940, .86], [.58, 1950, .86], [.64, 1700, .84], [.7, 1290, .83]],
    desc: 'Full-size pickup truck, crew cab with a 5½ ft bed, 5.9 m (19.4 ft) long, 2.03 m wide, 1.95 m tall, 3.6 m wheelbase, with glass, a roof, lamps and four wheels with arches (an open bed with rails and a tailgate), for drives, garages and parking. Front toward −Y.' });
  return k;
}
export function minivan() {
  return car({ name: 'Car, minivan, 17 ft', L: 5170, W: 1990, H: 1780, color: '#b5b9bd', wr: 350, wb: 3000, ofront: 950, belt: 1050,
    body: [[0, 1130, .92, 270], [.04, 1170, .97, 250], [.12, 1160, 1, 230], [.7, 1020, 1, 220], [.86, 930, .99, 240], [.96, 820, .94, 290], [1, 700, .87, 340]],
    cabin: [[.03, 1160, .9], [.08, 1450, .9], [.15, 1775, .88], [.6, 1780, .87], [.68, 1600, .86], [.76, 1070, .85]],
    desc: 'Minivan, 5.17 m (17 ft) long, 1.99 m wide, 1.78 m tall, 3.0 m wheelbase, with glass, a roof, lamps and four wheels with arches, for drives, garages and parking. Front toward −Y.' });
}
export function hatchback() {
  return car({ name: 'Car, hatchback, compact, 13.6 ft', L: 4150, W: 1780, H: 1480, color: '#3d5a80', wr: 310, wb: 2600, ofront: 830, belt: 930,
    body: [[0, 880, .9, 260], [.03, 940, .96, 230], [.1, 960, 1, 200], [.7, 930, 1, 200], [.86, 850, .99, 220], [.96, 720, .93, 250], [1, 640, .86, 310]],
    cabin: [[.04, 950, .88], [.1, 1250, .88], [.18, 1470, .86], [.5, 1480, .86], [.6, 1320, .85], [.7, 1000, .84]],
    desc: 'Compact hatchback, 4.15 m (13.6 ft) long, 1.78 m wide, 1.48 m tall, 2.6 m wheelbase, with glass, a roof, lamps and four wheels with arches, for tight drives and garages. Front toward −Y.' });
}

export function motorcycle() {
  const M = new Model(), tyre = M.part('tyres', C.rubber), alloy = M.part('wheels', '#b9bec4'), fr = M.part('frame', C.black), tank = M.part('tank', '#6b2b2b'), seat = M.part('seat', '#27282b'), en = M.part('engine', '#55595e'), ch = M.part('chrome', C.chrome), lamp = M.part('headlamp', '#e9e6d8');
  const R = 330, wbase = 1450, fy = -wbase / 2, ry = wbase / 2;
  for (const [y, B] of [[fy, 110], [ry, 160]]) {
    tyre.lathe('x', [0, y, R], [[-B / 2, 220], [-B / 2 + 14, 280], [-B / 2 + 36, R], [B / 2 - 36, R], [B / 2 - 14, 280], [B / 2, 220], [B / 2 - 14, 200], [-B / 2 + 14, 200], [-B / 2, 220]], 36, { caps: false });
    alloy.lathe('x', [0, y, R], [[-14, 0], [-14, 210], [14, 210], [14, 0]], 30);
    for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; alloy.strut([-22, y + Math.cos(a) * 60, R + Math.sin(a) * 60], [-22, y + Math.cos(a) * 205, R + Math.sin(a) * 205], 9, 6); }
  }
  const head = [0, fy + 120, 800];
  for (const s of [-1, 1]) { ch.strut([s * 90, fy + 125, 790], [s * 70, fy + 30, R + 20], 18, 10); ch.strut([s * 70, fy + 30, R + 20], [s * 70, fy, R], 14, 8); }
  ch.strut([-90, head[1], 800], [90, head[1], 800], 18, 10);
  ch.strut([-390, head[1] - 50, 1040], [390, head[1] - 50, 1040], 12, 10);
  for (const s of [-1, 1]) { ch.strut([s * 90, head[1], 800], [s * 150, head[1] - 20, 1030], 14, 8); ch.strut([s * 150, head[1] - 20, 1030], [s * 390, head[1] - 50, 1040], 12, 8); ch.strut([s * 250, head[1] - 40, 1040], [s * 260, head[1] - 150, 1130], 7, 6); }
  lamp.ellipsoid([0, fy + 60, 880], 100, 80, 100, 16, 10);
  fr.pipe([[0, fy + 110, 790], [0, -80, 640], [0, 300, 720], [0, ry - 80, 560], [0, ry, R]], 24, 10);
  fr.pipe([[0, -80, 430], [0, 200, 400], [0, ry, R]], 24, 10);
  for (const s of [-1, 1]) fr.strut([s * 80, 200, 400], [s * 80, ry, R], 18, 8);
  en.rbox(-130, -160, 320, 130, 220, 640, 30, 10, 2);
  for (let i = 0; i < 3; i++) for (const s of [-1, 1]) en.strut([s * 100, -80 + i * 110, 520], [s * 240, -80 + i * 110, 600], 55, 12);
  tank.ellipsoid([0, -140, 800], 170, 270, 130, 20, 12);
  seat.rbox(-130, 40, 740, 130, 640, 810, 50, 24, 3);
  seat.rbox(-110, 640, 760, 110, 800, 800, 40, 12, 2);
  for (const s of [-1, 1]) { ch.pipe([[s * 150, -70, 300], [s * 175, 300, 300], [s * 175, 800, 360]], 32, 10); ch.strut([s * 175, 800, 360], [s * 175, 900, 380], 42, 12, 46); }
  const p = new Plan(VH).rect('VEHICLE', -45, fy - R, 45, ry + R).ellipse('VEHICLE-DETAIL', 0, -140, 130, 270).rect('VEHICLE-DETAIL', -390, fy + 70, 390, fy + 90);
  return makeItem({ name: 'Motorcycle, standard, 8 ft', kind: 'furniture', category: 'site/vehicles', description: 'Standard motorcycle, about 2.3 m (7.7 ft) long, 0.8 m wide and 1.1 m tall, with spoked-look wheels, a fork, a handlebar, a tank, a seat, an engine block and exhausts. Front toward −Y.', ifc: { class: 'IfcTransportElement', predefined: 'NOTDEFINED' }, plan: p, model: M, remarks: 'Typical size for the class, not any maker\'s vehicle.' });
}

export function bicycle() {
  const M = new Model(), tyre = M.part('tyres', C.rubber), rim = M.part('rims', '#b9bec4'), fr = M.part('frame', '#2f5d8c'), sp = M.part('spokes', '#d5d8dc'), sd = M.part('saddle', '#27282b'), ch = M.part('parts', C.chrome);
  const R = 340, fy = -520, ry = 520;
  for (const y of [fy, ry]) {
    tyre.torusX([0, y, R], R - 16, 16, 40, 10);
    rim.torusX([0, y, R], R - 36, 5, 40, 6);
    for (let i = 0; i < 20; i++) { const a = i * Math.PI / 10; sp.strut([0, y + Math.cos(a) * 20, R + Math.sin(a) * 20], [0, y + Math.cos(a + .15) * (R - 36), R + Math.sin(a + .15) * (R - 36)], 1.2, 4); }
    ch.lathe('x', [0, y, R], [[-18, 14], [18, 14]], 10);
  }
  const bb = [0, 60, 280], st = [0, 160, 760], ht = [0, -420, 760], hb = [0, -450, 640];
  fr.strut(bb, st, 17, 10); fr.strut([0, 140, 730], ht, 16, 10); fr.strut(bb, hb, 20, 10); fr.strut(ht, hb, 22, 12);
  fr.strut([0, 150, 700], [0, ry, R], 8, 8); fr.strut(bb, [0, ry, R], 8, 8);
  for (const s of [-1, 1]) { fr.strut([s * 55, ry - 8, R], [s * 8, 150, 700], 6, 6); fr.strut([s * 55, ry - 8, R], [s * 8, 60, 285], 6, 6); ch.strut([s * 55, hb[1] - 8, 650], [s * 55, fy, R], 9, 8); }
  ch.strut([0, st[1], st[2]], [0, st[1] + 20, 860], 14, 8);
  sd.ellipsoid([0, 190, 880], 70, 150, 28, 14, 8);
  ch.strut(ht, [0, ht[1] - 20, 860], 14, 8); ch.strut([0, ht[1] - 20, 860], [0, ht[1] - 60, 880], 14, 8);
  ch.strut([-210, ht[1] - 70, 890], [210, ht[1] - 70, 890], 11, 8);
  for (const s of [-1, 1]) { ch.strut([s * 210, ht[1] - 70, 890], [s * 210, ht[1] - 150, 830], 11, 8); fr.strut([s * 210, ht[1] - 150, 830], [s * 160, ht[1] - 150, 760], 10, 8); }
  ch.lathe('x', [60, bb[1], bb[2]], [[0, 110], [4, 110], [4, 90], [0, 90]], 28);
  ch.strut([-85, bb[1], bb[2] - 150], [85, bb[1], bb[2] + 150], 11, 8);
  ch.box(60, bb[1] - 40, bb[2] + 150 - 15, 150, bb[1] + 40, bb[2] + 150 + 15); ch.box(-150, bb[1] - 40, bb[2] - 150 - 15, -60, bb[1] + 40, bb[2] - 150 + 15);
  const p = new Plan(VH).rect('VEHICLE', -300, fy - R, 300, ry + R).line('VEHICLE-DETAIL', 0, fy - R, 0, ry + R).rect('VEHICLE-DETAIL', -210, ht[1] - 90, 210, ht[1] - 50);
  return makeItem({ name: 'Bicycle, road, 700c wheels', kind: 'furniture', category: 'site/vehicles', description: 'Road bicycle with 700c wheels, 1.75 m long, 0.42 m wide at the bars and 1.05 m tall, with a frame, fork, drop bars, saddle, spoked wheels, chainring and pedals. Front toward −Y.', ifc: { class: 'IfcTransportElement', predefined: 'NOTDEFINED' }, plan: p, model: M, remarks: 'Typical size for the class, not any maker\'s bicycle.' });
}

export function vehicleItems() { return [sedan(), suv(), pickup(), minivan(), hatchback(), motorcycle(), bicycle()]; }
