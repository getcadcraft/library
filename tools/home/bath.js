/* SPDX-License-Identifier: Apache-2.0 */
/** Bathroom: toilets, bidet, tubs, showers, lavatories, spa and the exhaust fan. */
import { Model, Plan, makeItem, ellRing, supRing, rrRing, at, IN } from './kit.js';
import { C, FX, EQ, SIZE_NOTE, inch as I } from './common.js';

const clearFront = (w, y, d = 21) => ({ name: 'In front', x: -I(w) / 2, y: y - I(d), z: 0, w: I(w), d: I(d), h: I(30) });

/** Bowl outer rings for a toilet: a base, a trapway swell and a rim, elliptical in plan. */
function bowlRings(cx, cy, rx, ry, rimZ, n = 44) {
  const k = [[0, .66, .8, .1], [I(1.2), .68, .82, .1], [I(4), .82, .9, .06], [I(8.5), .94, .97, .02], [rimZ - I(.4), 1, 1, 0]];
  return k.map(([z, fx, fy, dy]) => ellRing(cx, cy + ry * dy, rx * fx, ry * fy, z, n));
}

export function toiletTwoPiece(elongated) {
  const M = new Model(), por = M.part('porcelain', C.porcelain), seat = M.part('seat', C.white), ch = M.part('chrome', C.chrome);
  const D = I(elongated ? 28.5 : 25.5), tw = I(19), td = I(7.5), rimZ = I(15), rx = I(7.4), ry = (D - I(5.5)) / 2, cy = -(D + I(5.5)) / 2;
  por.rbox(-tw / 2, -td, I(14.5), tw / 2, 0, I(28.2), I(2.2), I(.9));                       // tank
  por.rbox(-tw / 2 - I(.3), -td - I(.3), I(28.2), tw / 2 + I(.3), 0, I(29.1), I(2.4), I(.45)); // lid
  por.loft(bowlRings(0, cy, rx, ry, rimZ));                                                  // bowl and trapway
  por.rbox(-I(6.2), -I(8.5), I(3), I(6.2), -I(1), I(14.8), I(2.5), 0);                        // neck between the bowl and the tank
  seat.loft([ellRing(0, cy, rx + I(.55), ry + I(.55), rimZ - I(.3), 44), ellRing(0, cy, rx + I(.6), ry + I(.6), rimZ + I(.9), 44), ellRing(0, cy, rx + I(.1), ry + I(.1), rimZ + I(1.45), 44)]);
  ch.cyl(0, -td / 2, I(.95), I(29.1), I(29.7), 18);                                          // flush button
  for (const x of [-4.5, 4.5]) ch.cyl(I(x), cy + ry - I(.9), I(.45), rimZ + I(1.4), rimZ + I(1.9), 10);        // seat hinge caps
  ch.pipe([[-I(10.4), -I(1), I(7)], [-I(10.4), -I(1), I(4.2)], [-I(8.6), -I(3.2), I(4.2)], [-I(8.6), -I(3.2), I(14.6)]], I(.42), 8);    // supply line
  const p = new Plan(FX).rect('FIXTURE', -tw / 2, -td, tw / 2, 0).ellipse('FIXTURE', 0, cy, rx, ry).ellipse('FIXTURE-DETAIL', 0, cy, rx - I(.9), ry - I(.9)).line('FIXTURE-DETAIL', 0, 0, 0, -D)
    .rect('CLEARANCE', -I(15), -D - I(21), I(15), -D);
  return makeItem({
    name: `Toilet, two-piece, ${elongated ? 'elongated' : 'round-front'} bowl with tank`, kind: 'fixture', category: 'plumbing/fixtures',
    description: `Two-piece toilet with a ${elongated ? 'elongated' : 'round-front'} bowl, tank and lid, ${elongated ? 28.5 : 25.5}" from the wall, 29" tall to the lid, seat 16" high. Drain 12" from the finished wall; keep 15" from its centre to a side wall and 21" clear in front.`,
    ifc: { class: 'IfcSanitaryTerminal', predefined: 'TOILETPAN' }, plan: p, model: M, clearances: [clearFront(30, -D)], plumb: { cw: '3/8"', dd: '3"' }, remarks: SIZE_NOTE,
    attrs: { 'CC-SIZE-NOTE': 'nominal' },
  });
}

export function toiletOnePiece() {
  const M = new Model(), por = M.part('porcelain', C.porcelain), seat = M.part('seat', C.white), ch = M.part('chrome', C.chrome);
  const D = I(28), rimZ = I(16), rx = I(7.4), ry = (D - I(2)) / 2, cy = -(D + I(2)) / 2, n = 44;
  // skirted body: the bowl, trapway and tank flow into one shell with straight sides
  por.loft([ellRing(0, cy, rx - I(.7), ry - I(.7), I(.4), n), ellRing(0, cy, rx - I(.15), ry - I(.1), I(1.2), n), ellRing(0, cy, rx, ry, I(5), n), ellRing(0, cy, rx, ry, rimZ - I(.3), n)]);
  por.rbox(-I(8.8), -I(11), I(1.2), I(8.8), 0, I(14), I(3.2), I(.6));
  por.rbox(-I(9.4), -I(8), I(14), I(9.4), 0, I(27.2), I(2.6), I(1.1));                       // tank shoulder
  por.rbox(-I(9.6), -I(8.2), I(27.2), I(9.6), 0, I(28), I(2.8), I(.4));                       // slim lid
  seat.loft([ellRing(0, cy, rx + I(.3), ry + I(.3), rimZ - I(.3), n), ellRing(0, cy, rx + I(.35), ry + I(.35), rimZ + I(.7), n), ellRing(0, cy, rx - I(.2), ry - I(.2), rimZ + I(1.1), n)]);
  ch.rbox(-I(2.6), -I(5.4), I(28), I(2.6), -I(2.6), I(28.45), I(1), I(.2), 2);                // dual-flush plate
  const p = new Plan(FX).rect('FIXTURE', -I(9.4), -I(8), I(9.4), 0).ellipse('FIXTURE', 0, cy, rx, ry).ellipse('FIXTURE-DETAIL', 0, cy, rx - I(.9), ry - I(.9)).line('FIXTURE-DETAIL', 0, 0, 0, -D).rect('CLEARANCE', -I(15), -D - I(21), I(15), -D);
  return makeItem({
    name: 'Toilet, one-piece, skirted, elongated bowl', kind: 'fixture', category: 'plumbing/fixtures',
    description: 'One-piece skirted toilet with an elongated bowl and a dual-flush plate, 28" from the wall, 28" tall, seat 17" high. Drain 12" from the finished wall; keep 15" from its centre to a side wall and 21" clear in front.',
    ifc: { class: 'IfcSanitaryTerminal', predefined: 'TOILETPAN' }, plan: p, model: M, clearances: [clearFront(30, -D)], plumb: { cw: '3/8"', dd: '3"' }, remarks: SIZE_NOTE,
  });
}

export function toiletWallHung() {
  const M = new Model(), por = M.part('porcelain', C.porcelain), seat = M.part('seat', C.white), ch = M.part('chrome', C.chrome), wallp = M.part('plate', C.white);
  const D = I(22), rimZ = I(15), rx = I(7.2), ry = (D - I(4)) / 2, cy = -(D + I(4)) / 2, n = 44;
  por.loft([ellRing(0, cy, rx * .55, ry * .62, I(7.4), n), ellRing(0, cy, rx * .8, ry * .82, I(8.6), n), ellRing(0, cy, rx * .95, ry * .95, I(11), n), ellRing(0, cy, rx, ry, rimZ - I(.3), n)]);
  por.rbox(-I(6.6), -I(5.5), I(7.6), I(6.6), 0, rimZ - I(.3), I(2.4), I(.3));
  seat.loft([ellRing(0, cy, rx + I(.5), ry + I(.5), rimZ - I(.3), n), ellRing(0, cy, rx + I(.55), ry + I(.55), rimZ + I(.8), n), ellRing(0, cy, rx + I(.1), ry + I(.1), rimZ + I(1.2), n)]);
  wallp.rbox(-I(7.5), -I(.5), I(38), I(7.5), 0, I(46), I(.4), I(.2), 1);                      // flush plate: the carrier and tank are inside the wall
  ch.cyl(-I(2), -I(.75), I(1.1), I(41), I(44), 16); ch.cyl(I(2), -I(.75), I(1.1), I(41), I(44), 16);
  const p = new Plan(FX).rect('FIXTURE', -I(6.6), -I(5.5), I(6.6), 0).ellipse('FIXTURE', 0, cy, rx, ry).ellipse('FIXTURE-DETAIL', 0, cy, rx - I(.9), ry - I(.9)).rect('CLEARANCE', -I(15), -D - I(21), I(15), -D);
  return makeItem({
    name: 'Toilet, wall-hung, elongated bowl with flush plate', kind: 'fixture', category: 'plumbing/fixtures',
    description: 'Wall-hung toilet, 22" from the wall, seat 16" high, its bowl hung 7" off the floor on an in-wall carrier. The tank is inside the wall behind the flush plate at 38" to 46". The wall must be framed for the carrier.',
    ifc: { class: 'IfcSanitaryTerminal', predefined: 'TOILETPAN' }, plan: p, model: M, clearances: [clearFront(30, -D)], plumb: { cw: '1/2"', dd: '4"' }, remarks: SIZE_NOTE,
    attrs: { 'CC-NOTE': 'In-wall carrier not drawn' },
  });
}

export function bidet() {
  const M = new Model(), por = M.part('porcelain', C.porcelain), ch = M.part('chrome', C.chrome);
  const D = I(23), rimZ = I(15), rx = I(7.2), ry = (D - I(5)) / 2, cy = -(D + I(5)) / 2, n = 44;
  por.basin(bowlRings(0, cy, rx, ry, rimZ + I(.3), n), [ellRing(0, cy, rx * .5, ry * .55, I(8), n), ellRing(0, cy, rx * .78, ry * .82, I(11.5), n), ellRing(0, cy, rx - I(.8), ry - I(.8), rimZ + I(.3), n)]);
  por.rbox(-I(7.2), -I(5.5), I(10), I(7.2), 0, rimZ + I(.3), I(2.2), I(.5));                    // deck behind the bowl
  ch.cyl(0, -I(2.6), I(1.1), rimZ + I(.3), rimZ + I(.8), 16);
  ch.pipe([[0, -I(2.6), rimZ + I(.5)], [0, -I(2.6), rimZ + I(3.2)], [0, -I(4), rimZ + I(4.5)]], I(.5), 10);
  for (const s of [-1, 1]) ch.strut([s * I(3.3), -I(2.3), rimZ + I(.3)], [s * I(3.3), -I(2.3), rimZ + I(1.4)], I(.65), 10);
  ch.cyl(0, cy + ry * .1, I(1.2), I(10.9), I(11.1), 14);
  const p = new Plan(FX).rect('FIXTURE', -I(7.2), -I(5.5), I(7.2), 0).ellipse('FIXTURE', 0, cy, rx, ry).ellipse('FIXTURE-DETAIL', 0, cy, rx - I(1), ry - I(1)).circle('FIXTURE-DETAIL', 0, -I(2.6), I(.8)).rect('CLEARANCE', -I(15), -D - I(21), I(15), -D);
  return makeItem({
    name: 'Bidet, floor-mounted, with faucet', kind: 'fixture', category: 'plumbing/fixtures',
    description: 'Floor-mounted bidet, 23" from the wall, rim 15" high, with a deck faucet and two handles. Keep 15" from its centre to a side wall and 21" clear in front; usually beside the toilet.',
    ifc: { class: 'IfcSanitaryTerminal', predefined: 'BIDET' }, plan: p, model: M, clearances: [clearFront(30, -D)], plumb: { cw: '1/2"', hw: '1/2"', dd: '2"' }, remarks: SIZE_NOTE,
  });
}

/** An oval tub: outer and inner rings from the same fractions of its length and width. */
function tubShell(M, { L, W, outer, inner, cy, partName = 'tub', n = 48, p = 2.2 }) {
  const a = L / 2, b = W / 2, tub = M.part(partName, C.enamel);
  tub.basin(outer.map(([z, fa, fb]) => supRing(0, cy, a * fa, b * fb, p, z, n)), inner.map(([z, fa, fb]) => supRing(0, cy, a * fa, b * fb, p, z, n)));
  return tub;
}

export function tubFreestanding() {
  const M = new Model(), ch = M.part('chrome', C.chrome), L = I(67), W = I(31), cy = -W / 2;
  tubShell(M, { L, W, cy,
    outer: [[I(.6), .8, .72], [I(2), .88, .82], [I(10), .985, .97], [I(21), 1, 1], [I(23), 1, 1]],
    inner: [[I(4), .8, .6], [I(8), .9, .8], [I(16), .95, .9], [I(23), .965, .93]] });
  const plinth = M.part('plinth', C.lightGray); plinth.loft([supRing(0, cy, L * .38, W * .34, 2.2, 0, 48), supRing(0, cy, L * .38, W * .34, 2.2, I(.7), 48)]);
  ch.cyl(L * .31, cy, I(1.3), I(3.95), I(4.2), 16);
  ch.cyl(-L * .43, cy, I(.9), I(18.5), I(19), 14);                                                 // overflow
  const fx = -L / 2 - I(8);
  ch.pipe([[fx, cy, 0], [fx, cy, I(30)], [fx, cy, I(34)], [fx + I(4), cy, I(36.5)], [fx + I(9.5), cy, I(36.5)], [fx + I(11.5), cy, I(34.5)]], I(.55), 12);   // floor-mounted filler
  ch.cyl(fx, cy, I(2), 0, I(.6), 16);
  const p = new Plan(FX).ellipse('FIXTURE', 0, cy, L / 2, W / 2).ellipse('FIXTURE-DETAIL', 0, cy, L / 2 * .94, W / 2 * .9).circle('FIXTURE-DETAIL', L * .31, cy, I(1.3)).circle('FIXTURE-DETAIL', fx, cy, I(1.2));
  return makeItem({
    name: 'Bathtub, freestanding, oval, 67" with floor-mounted filler', kind: 'fixture', category: 'plumbing/fixtures',
    description: 'Freestanding oval soaking tub, 67" long, 31" wide, 23" tall, drain at the foot end, with a floor-mounted tub filler at the head. Needs a floor drain location and a supply rough-in at the filler.',
    ifc: { class: 'IfcSanitaryTerminal', predefined: 'BATH' }, plan: p, model: M, plumb: { cw: '1/2"', hw: '1/2"', dd: '1-1/2"' }, remarks: SIZE_NOTE,
  });
}

export function tubClawfoot() {
  const M = new Model(), ch = M.part('chrome', C.chrome), L = I(66), W = I(30), cy = -W / 2 - I(1);
  tubShell(M, { L, W, cy, n: 48, p: 2,
    outer: [[I(9), .8, .66], [I(12), .93, .88], [I(20), .99, .98], [I(26), 1, 1], [I(28), 1.04, 1.04], [I(29.6), 1.035, 1.035]],
    inner: [[I(12.5), .78, .55], [I(18), .9, .8], [I(26), .95, .9], [I(29.6), .975, .945]] });
  for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {                                  // four ball-and-claw style feet
    const x = sx * L * .31, y = cy + sy * W * .27;
    ch.strut([x, y, I(9.5)], [x, y, I(5.2)], I(1.5), 14, I(2.1));
    ch.lathe('z', [x, y, 0], [[0, I(2.3)], [I(.7), I(2.7)], [I(1.8), I(2.4)], [I(3.4), I(1.6)], [I(5.4), I(2.2)]], 14);
  }
  ch.cyl(-L * .32, cy, I(1.3), I(12.45), I(12.7), 16);
  const p = new Plan(FX).ellipse('FIXTURE', 0, cy, L / 2 * 1.035, W / 2 * 1.035).ellipse('FIXTURE-DETAIL', 0, cy, L / 2 * .94, W / 2 * .9);
  for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) p.circle('FIXTURE-DETAIL', sx * L * .31, cy + sy * W * .27, I(2));
  return makeItem({
    name: 'Bathtub, clawfoot, rolled rim, 66"', kind: 'fixture', category: 'plumbing/fixtures',
    description: 'Clawfoot tub with a rolled rim on four feet, 66" long, 30" wide, 30" tall. Drain at one end; supplies come through the floor or the wall, or on a rim-mounted faucet set.',
    ifc: { class: 'IfcSanitaryTerminal', predefined: 'BATH' }, plan: p, model: M, plumb: { cw: '1/2"', hw: '1/2"', dd: '1-1/2"' }, remarks: SIZE_NOTE,
  });
}

export function tubDropIn() {
  const M = new Model(), deck = M.part('deck', C.stone), tub = M.part('tub', C.enamel), ch = M.part('chrome', C.chrome);
  const L = I(66), W = I(36), tL = I(60), tW = I(32), cy = -W / 2, h = I(19.5), n = 48;
  deck.loft([supRing(0, cy, L / 2, W / 2, 10, 0, n), supRing(0, cy, L / 2, W / 2, 10, h - I(1.5), n)]);                       // the surround, a closed box
  deck.loft([supRing(0, cy, L / 2 + I(.4), W / 2 + I(.4), 10, h - I(1.5), n), supRing(0, cy, L / 2 + I(.4), W / 2 + I(.4), 10, h, n)]);
  // the tub shell sits below the deck with its rim flush with it
  tub.basin([supRing(0, cy, tL * .36, tW * .3, 2.2, h - I(17.5), n), supRing(0, cy, tL / 2 * .97, tW / 2 * .97, 2.4, h - I(10), n), supRing(0, cy, tL / 2, tW / 2, 2.4, h - I(.4), n)],
    [supRing(0, cy, tL * .3, tW * .25, 2.2, h - I(14.6), n), supRing(0, cy, tL / 2 * .9, tW / 2 * .88, 2.3, h - I(8), n), supRing(0, cy, tL / 2 * .965, tW / 2 * .94, 2.4, h - I(.4), n)]);
  ch.cyl(tL * .3, cy, I(1.3), h - I(14.7), h - I(14.5), 16);
  ch.pipe([[-L * .43, -I(2.2), h + I(.1)], [-L * .43, -I(2.2), h + I(3.5)], [-L * .43 + I(4.2), -I(2.2), h + I(5)]], I(.55), 10);
  const p = new Plan(FX).ring('FIXTURE', supRing(0, cy, L / 2, W / 2, 10, 0, n)).ellipse('FIXTURE-DETAIL', 0, cy, tL / 2, tW / 2).ellipse('FIXTURE-DETAIL', 0, cy, tL / 2 * .9, tW / 2 * .86).circle('FIXTURE-DETAIL', tL * .3, cy, I(1.3));
  return makeItem({
    name: 'Bathtub, drop-in, oval, 60" × 32" in a 66" × 36" surround', kind: 'fixture', category: 'plumbing/fixtures',
    description: 'Drop-in oval tub, 60" × 32", set in a tiled surround 66" × 36" and 19½" tall with a deck faucet at the head. The surround is drawn as a solid block; frame it to suit.',
    ifc: { class: 'IfcSanitaryTerminal', predefined: 'BATH' }, plan: p, model: M, plumb: { cw: '1/2"', hw: '1/2"', dd: '1-1/2"' }, remarks: SIZE_NOTE,
  });
}

export function showerCorner() {
  const M = new Model(), tray = M.part('tray', C.enamel), glass = M.part('glass', C.clear, .28), ch = M.part('chrome', C.chrome), wall = M.part('wall', C.lightGray);
  const R = I(38), cx0 = -I(19), arc = Array.from({ length: 25 }, (_, i) => { const t = -Math.PI / 2 * i / 24; return [cx0 + R * Math.cos(t), R * Math.sin(t)]; });
  const poly = [[cx0, 0], ...arc, [cx0, -R]].slice(0);
  tray.prism([[cx0, 0], ...arc.slice(0, -0), [cx0, -R]], 0, I(3));                                     // quarter-round base
  ch.cyl(cx0 + I(13), -I(13), I(2), I(3), I(3.15), 18);                                                // drain
  glass.ribbon(arc.slice(1, -1), I(3), I(75), I(.36));                                                 // curved glass screen
  const mid = arc[12];
  ch.strut([cx0, -R + I(.2), I(3)], [cx0, -R + I(.2), I(75)], I(.5), 10);
  ch.strut([cx0 + R - I(.2), 0, I(3)], [cx0 + R - I(.2), 0, I(75)], I(.5), 10);
  ch.strut([mid[0] + I(.8), mid[1] - I(.8), I(36)], [mid[0] + I(.8), mid[1] - I(.8), I(45)], I(.55), 10);   // pull
  ch.pipe([[cx0 + I(10), -I(.4), I(70)], [cx0 + I(10), -I(5), I(74)], [cx0 + I(10), -I(9), I(74)]], I(.55), 10);   // arm and head
  ch.lathe('z', [cx0 + I(10), -I(10), I(73.5)], [[0, I(.6)], [I(.5), I(3.2)], [I(1), I(3.2)], [I(1), 0]], 20);
  ch.cyl(cx0 + I(10), -I(.35), I(2.6), I(46), I(46.4), 18);                                            // valve trim
  wall.rbox(cx0 + I(.01), -R, 0, cx0 + I(.4), 0, I(.6), 0.5, 0, 1);                                    // a threshold line on the walls' foot
  const p = new Plan(FX).poly('FIXTURE', poly, true).arc('FIXTURE-DETAIL', cx0, 0, R - I(2), 270, 360).circle('FIXTURE-DETAIL', cx0 + I(13), -I(13), I(2)).arc('SWING', cx0, 0, R, 270, 360);
  return makeItem({
    name: 'Shower, corner, quarter-round, 38" × 38" with glass screen and head', kind: 'fixture', category: 'plumbing/fixtures',
    description: 'Corner shower with a quarter-round 38" × 38" base, a curved glass screen 75" tall with a pull handle, a valve and a ceiling-height shower head. Its back and left sides are the walls.',
    ifc: { class: 'IfcSanitaryTerminal', predefined: 'SHOWER' }, plan: p, model: M, plumb: { cw: '1/2"', hw: '1/2"', dd: '2"' }, remarks: SIZE_NOTE,
  });
}

export function vesselSink() {
  const M = new Model(), bowl = M.part('bowl', C.porcelain), ch = M.part('chrome', C.chrome), z0 = I(36), cy = -I(12);
  bowl.lathe('z', [0, cy, z0], [[0, 0], [0, I(4.6)], [I(.8), I(6.2)], [I(3.4), I(7.5)], [I(5.5), I(8)], [I(5.5), I(7.6)], [I(3.4), I(7.1)], [I(1.2), I(5.8)], [I(.9), I(4.2)], [I(.9), 0]], 44);
  ch.lathe('z', [0, -I(2.6), z0], [[0, I(1.4)], [I(.3), I(1.4)], [I(.3), I(.8)], [I(.3), 0]], 18);
  ch.pipe([[0, -I(2.6), z0 + I(.2)], [0, -I(2.6), z0 + I(9)], [0, -I(3.4), z0 + I(11)], [0, -I(6), z0 + I(11.4)], [0, -I(9.5), z0 + I(10.6)]], I(.6), 12);
  ch.cyl(0, cy, I(1.3), z0 + I(.85), z0 + I(.95), 16);                                              // drain
  ch.strut([I(1.5), -I(2.6), z0 + I(5)], [I(3.6), -I(2.6), z0 + I(6.2)], I(.4), 8);                   // lever
  const p = new Plan(FX).circle('FIXTURE', 0, cy, I(8)).circle('FIXTURE-DETAIL', 0, cy, I(7.1)).circle('FIXTURE-DETAIL', 0, cy, I(1.3)).circle('FIXTURE-DETAIL', 0, -I(2.6), I(.9));
  return makeItem({
    name: 'Vessel sink, round, 16" with tall faucet', kind: 'fixture', category: 'plumbing/fixtures',
    description: 'Round vessel lavatory, 16" across, 5½" tall, sitting on a counter at 36" with a tall single-lever faucet behind it. Set it on a vanity top; drain at the bowl bottom.',
    ifc: { class: 'IfcSanitaryTerminal', predefined: 'WASHHANDBASIN' }, plan: p, model: M, plumb: { cw: '1/2"', hw: '1/2"', dd: '1-1/4"' }, remarks: SIZE_NOTE,
    attrs: { 'CC-MOUNT-HEIGHT': String(Math.round(z0)) },
  });
}

export function lavatoryWallHung() {
  const M = new Model(), bs = M.part('basin', C.porcelain), ch = M.part('chrome', C.chrome), n = 44, cy = -I(9);
  bs.basin([supRing(0, cy, I(6.6), I(5.8), 2.4, I(29.6), n), supRing(0, cy, I(9.2), I(8.2), 3, I(31.6), n), supRing(0, cy, I(10), I(9), 3.6, I(34), n)],
    [supRing(0, cy, I(6), I(4.9), 2.4, I(32), n), supRing(0, cy, I(9), I(7.8), 3.2, I(33.6), n), supRing(0, cy, I(9.1), I(8), 3.6, I(34), n)]);
  bs.rbox(-I(10), -I(1.4), I(34), I(10), 0, I(37), I(1.2), I(.4));                                    // backsplash
  ch.cyl(0, -I(2.4), I(1.1), I(34), I(34.4), 16);
  ch.pipe([[0, -I(2.4), I(34.2)], [0, -I(2.4), I(38)], [0, -I(4), I(39.6)], [0, -I(7), I(39.6)], [0, -I(8.2), I(38.6)]], I(.55), 10);
  ch.strut([I(1.5), -I(2.4), I(34.4)], [I(3.4), -I(2.4), I(35.3)], I(.4), 8);
  ch.cyl(0, cy, I(1.1), I(32), I(32.1), 14);
  ch.pipe([[0, cy, I(29.8)], [0, cy, I(23.5)], [0, cy + I(3.6), I(20.6)], [0, -I(.6), I(20.6)]], I(.65), 12);      // P-trap
  const p = new Plan(FX).rect('FIXTURE', -I(10), -I(1.4), I(10), 0).ring('FIXTURE', supRing(0, cy, I(10), I(9), 3.6, 0, n)).ring('FIXTURE-DETAIL', supRing(0, cy, I(8.7), I(7.7), 3.2, 0, n)).circle('FIXTURE-DETAIL', 0, cy, I(1.1)).circle('FIXTURE-DETAIL', 0, -I(2.4), I(.9))
    .rect('CLEARANCE', -I(15), -I(18) - I(21), I(15), -I(18));
  return makeItem({
    name: 'Lavatory, wall-hung, 20" with faucet and trap', kind: 'fixture', category: 'plumbing/fixtures',
    description: 'Wall-hung lavatory, 20" wide, 18" deep, rim at 34", with a single-lever faucet and a chrome P-trap. Needs blocking in the wall; keep 15" from its centre to a side wall and 21" clear in front.',
    ifc: { class: 'IfcSanitaryTerminal', predefined: 'WASHHANDBASIN' }, plan: p, model: M, plumb: { cw: '3/8"', hw: '3/8"', dd: '1-1/4"' }, remarks: SIZE_NOTE,
    attrs: { 'CC-MOUNT-HEIGHT': String(Math.round(I(29.6))) },
  });
}

export function spa() {
  const M = new Model(), shell = M.part('shell', '#d7dde0'), cab = M.part('cabinet', C.wood), water = M.part('water', C.water, .55), ch = M.part('jets', C.chrome), cover = M.part('seat', '#c8d3d6');
  const S = I(84), h = I(36), n = 48, cy = -S / 2;
  cab.basin([supRing(0, cy, S / 2 - I(1.5), S / 2 - I(1.5), 6, 0, n), supRing(0, cy, S / 2 - I(1.5), S / 2 - I(1.5), 6, I(33.8), n)], [supRing(0, cy, S / 2 - I(2.5), S / 2 - I(2.5), 6, I(.5), n), supRing(0, cy, S / 2 - I(2.5), S / 2 - I(2.5), 6, I(33.8), n)]);
  shell.basin([supRing(0, cy, S / 2 - I(1.2), S / 2 - I(1.2), 6, I(33.6), n), supRing(0, cy, S / 2, S / 2, 6, I(34.6), n), supRing(0, cy, S / 2, S / 2, 6, h, n)],
    [supRing(0, cy, I(24), I(24), 3, I(8), n), supRing(0, cy, I(30), I(30), 3.4, I(15), n), supRing(0, cy, I(36), I(36), 4, I(19), n), supRing(0, cy, I(37.8), I(37.8), 5, I(24), n), supRing(0, cy, I(38.6), I(38.6), 5.4, I(35.4), n)]);
  water.loft([supRing(0, cy, I(37.6), I(37.6), 5.4, I(31), n), supRing(0, cy, I(37.6), I(37.6), 5.4, I(31.2), n)]);
  for (let i = 0; i < 12; i++) { const a = 2 * Math.PI * (i + .5) / 12, rr = I(35.6); ch.cyl(rr * Math.cos(a), cy + rr * Math.sin(a), I(1.4), I(20 + (i % 2) * 5), I(20.15 + (i % 2) * 5), 12); }
  cover.rbox(-I(7), cy - I(7), I(35.4), I(7), cy + I(7), I(36.2), I(2), I(.3), 2);
  const p = new Plan(FX).ring('FIXTURE', supRing(0, cy, S / 2, S / 2, 6, 0, n)).ring('FIXTURE-DETAIL', supRing(0, cy, I(38.6), I(38.6), 5.4, 0, n)).ring('FIXTURE-DETAIL', supRing(0, cy, I(30), I(30), 3.4, 0, n))
    .rect('CLEARANCE', -S / 2 - I(36), -S - I(36), S / 2 + I(36), I(0));
  return makeItem({
    name: 'Spa (hot tub), 7 ft square, seats six', kind: 'equipment', category: 'plumbing/fixtures',
    description: 'Square hot tub, 84" × 84" and 36" tall, with a wood-look cabinet, a contoured acrylic shell with bench seating and twelve jets, filled to 31". Needs a level pad and a 240 V circuit; keep 36" clear all round for service.',
    ifc: { class: 'IfcSanitaryTerminal', predefined: 'BATH' }, plan: p, model: M, elec: { volts: '240', phase: '1', amps: '50' }, remarks: SIZE_NOTE,
  });
}

export function exhaustFan() {
  const M = new Model(), hs = M.part('housing', C.white), gr = M.part('grille', C.lightGray), dk = M.part('duct', C.graphite), sz = I(14), z1 = I(96);
  hs.rbox(-sz / 2, -sz, z1 - I(.7), sz / 2, 0, z1 + I(.1), I(1.4), I(.3), 2);
  hs.rbox(-sz / 2 + I(.4), -sz + I(.4), z1 + I(.1), sz / 2 - I(.4), -I(.4), z1 + I(7.5), I(1), 0, 1);
  dk.cyl(0, -sz / 2, I(2), z1 + I(7.5), z1 + I(11), 18);
  for (let i = -5; i <= 5; i++) gr.box(-sz / 2 + I(1), -sz / 2 + I(i * .9) - I(.18), z1 - I(1.1), sz / 2 - I(1), -sz / 2 + I(i * .9) + I(.18), z1 - I(.6));
  const p = new Plan(EQ).rect('EQUIP-ABOVE', -sz / 2, -sz, sz / 2, 0).rect('EQUIP-DETAIL', -sz / 2 + I(1), -sz + I(1), sz / 2 - I(1), -I(1)).text('EQUIP-DETAIL', -I(1), -sz / 2, I(2), 'EF');
  return makeItem({
    name: 'Bathroom exhaust fan, ceiling, 14" grille, 110 CFM', kind: 'equipment', category: 'mechanical/equipment',
    description: 'Ceiling-mounted bathroom exhaust fan, 14" square grille, a 4" duct outlet on the housing, flush with a ceiling at 96", about 110 CFM. Duct it outdoors.',
    ifc: { class: 'IfcFan' }, plan: p, model: M, elec: { volts: '120', phase: '1', amps: '1' }, remarks: SIZE_NOTE,
    attrs: { 'CC-MOUNT-HEIGHT': String(Math.round(I(89))) },
  });
}

export function bathItems() {
  return [toiletTwoPiece(true), toiletTwoPiece(false), toiletOnePiece(), toiletWallHung(), bidet(), tubFreestanding(), tubClawfoot(), tubDropIn(), showerCorner(), vesselSink(), lavatoryWallHung(), spa(), exhaustFan()];
}
