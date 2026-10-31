/* SPDX-License-Identifier: Apache-2.0 */
/** Hearths and house utilities: fireplaces, stoves, water heaters, softener, furnace, condenser, mini-split, radiator, boiler, panel, ceiling fan. */
import { Model, Plan, makeItem, ellRing, supRing, rrRing } from './kit.js';
import { C, EQ, SIZE_NOTE, inch as I } from './common.js';

const mount = (z) => ({ 'CC-MOUNT-HEIGHT': String(Math.round(z)) });
const eq = (o) => ({ kind: 'equipment', remarks: SIZE_NOTE, ...o });
const knob = (part, x, yf, z, r = I(.8), d = I(.9)) => part.lathe('y', [x, yf, z], [[0, r * .85], [-d * .3, r], [-d, r * .9], [-d, 0]], 16);
/** Rectangular chimney-pipe / vent run drawn as a round pipe. */
const flue = (part, x, y, z0, z1, r) => part.lathe('z', [x, y, 0], [[z0, r], [z1, r]], 20);

export function fireplaceMasonry() {
  const M = new Model(), br = M.part('brick', C.brick), fb = M.part('firebrick', C.firebrick), st = M.part('hearth', C.stone), wd = M.part('mantel', C.wood), ir = M.part('iron', C.black), lg = M.part('logs', '#5b3a24');
  const W = I(72), D = I(16), ow = I(36), oh = I(28), hz = I(4), pier = (W - ow) / 2;
  br.rbox(-W / 2, -D, hz, -ow / 2, 0, I(96), 0.6, 0, 1);                      // left pier and breast
  br.rbox(ow / 2, -D, hz, W / 2, 0, I(96), 0.6, 0, 1);                        // right pier and breast
  br.rbox(-ow / 2, -D, hz + oh, ow / 2, 0, I(96), 0.6, 0, 1);                 // lintel and breast above the opening
  for (let z = hz + I(2.7); z < I(96); z += I(2.7)) br.box(-W / 2 - I(.15), -D - I(.12), z, W / 2 + I(.15), -D + I(.05), z + I(.22));   // mortar joints stand proud as courses
  fb.box(-ow / 2, -I(.8), hz, ow / 2, 0, hz + oh);                            // firebrick back
  fb.box(-ow / 2, -D + I(1), hz, ow / 2, -I(.8), hz + I(.2));                 // firebox floor
  fb.box(-ow / 2, -D + I(.5), hz, -ow / 2 + I(.25), -I(.8), hz + oh); fb.box(ow / 2 - I(.25), -D + I(.5), hz, ow / 2, -I(.8), hz + oh);
  st.rbox(-W / 2 - I(6), -D - I(18), 0, W / 2 + I(6), 0, hz, I(1), I(.3), 1);  // raised hearth slab
  wd.rbox(-W / 2 - I(4), -D - I(3), I(54), W / 2 + I(4), 0, I(56.2), I(.4), I(.3), 1);   // mantel shelf
  wd.rbox(-ow / 2 - I(1), -D - I(.6), hz + oh - I(1.2), ow / 2 + I(1), -D, hz + oh + I(1.6), I(.3), 0, 1);
  ir.strut([-I(12), -I(4), hz + I(.3)], [-I(12), -I(12), hz + I(.3)], I(.55), 8); ir.strut([I(12), -I(4), hz + I(.3)], [I(12), -I(12), hz + I(.3)], I(.55), 8);
  for (const x of [-I(12), I(12)]) { ir.strut([x, -I(12), hz + I(.3)], [x, -I(12), hz + I(8)], I(.7), 8); ir.ball([x, -I(12), hz + I(8.6)], I(1.1), 8); }
  for (const [y, z, r] of [[-I(6), hz + I(2), 3], [-I(10), hz + I(2), 3], [-I(8), hz + I(5.4), 3.2]]) lg.strut([-I(13), y, z + I(1)], [I(13), y, z + I(1)], I(r), 12);
  const p = new Plan(EQ).rect('EQUIP', -W / 2, -D, W / 2, 0).rect('EQUIP-DETAIL', -ow / 2, -D, ow / 2, -I(1)).rect('EQUIP-DETAIL', -W / 2 - I(6), -D - I(18), W / 2 + I(6), -D).rect('CLEARANCE', -W / 2 - I(6), -D - I(18) - I(36), W / 2 + I(6), -D - I(18));
  return makeItem(eq({ name: 'Fireplace, masonry, wood-burning, 72" brick breast with hearth', category: 'appliances/residential', description: 'Wood-burning masonry fireplace: a brick chimney breast 72" wide, 16" deep and up to a 96" ceiling, a 36" × 28" firebox with firebrick, a raised stone hearth 18" deep and a wood mantel shelf at 54". Logs on andirons are drawn. A chimney is needed above the ceiling.', ifc: { class: 'IfcBuildingElementProxy' }, plan: p, model: M, attrs: { 'CC-NOTE': 'Chimney above ceiling not drawn' } }));
}

export function fireplaceGas() {
  const M = new Model(), bx = M.part('firebox', C.black), gl = M.part('glass', '#2b3036', .35), fr = M.part('frame', C.graphite), lg = M.part('logs', '#7a5a3c'), fl = M.part('flame', '#e8872a', .8), st = M.part('surround', C.stone);
  const W = I(42), D = I(18), H = I(52), ow = I(36), oh = I(24), z0 = I(10);
  bx.rbox(-W / 2, -D, 0, W / 2, 0, H, I(.5), I(.2), 1);
  st.rbox(-W / 2 - I(8), -D - I(.9), 0, W / 2 + I(8), -D, I(60), I(.3), 0, 1);                // stone-look facing panel
  fr.rbox(-ow / 2 - I(1.8), -D - I(1.8), z0 - I(1.8), ow / 2 + I(1.8), -D - I(.9), z0 + oh + I(1.8), I(.4), I(.3), 1);
  gl.box(-ow / 2, -D - I(1.2), z0, ow / 2, -D - I(1), z0 + oh);
  for (let i = 0; i < 5; i++) lg.strut([-I(12) + i * I(5.5), -I(5) - (i % 2) * I(3), z0 + I(3)], [-I(9) + i * I(5.5), -I(9) - (i % 2) * I(2), z0 + I(3.8)], I(2.1), 10);
  for (let i = 0; i < 7; i++) fl.lathe('z', [-I(15) + i * I(5), -I(7.5) - (i % 3) * I(1.5), z0 + I(4)], [[0, I(1.3)], [I(4 + (i % 3)), I(.9)], [I(7 + (i % 3) * 1.5), 0]], 10);
  const p = new Plan(EQ).rect('EQUIP', -W / 2 - I(8), -D - I(.9), W / 2 + I(8), 0).rect('EQUIP-DETAIL', -ow / 2, -D - I(1.2), ow / 2, -D - I(1)).rect('CLEARANCE', -W / 2 - I(8), -D - I(.9) - I(36), W / 2 + I(8), -D - I(.9));
  return makeItem(eq({ name: 'Fireplace, gas, direct-vent, 36" glass front with surround', category: 'appliances/residential', description: 'Direct-vent gas fireplace, a 42" × 18" firebox 52" tall with a 36" × 24" glass front, a ceramic log set, a black frame and a 60" tall stone-look facing 58" wide. Vents through the wall or roof; keep furniture and finishes 36" clear in front.', ifc: { class: 'IfcSpaceHeater' }, plan: p, model: M, plumb: { gas: '1/2"' }, elec: { volts: '120', phase: '1', amps: '5' } }));
}

export function stoveWood() {
  const M = new Model(), ci = M.part('cast iron', '#2a2b2d'), gl = M.part('glass', '#3a3f45', .6), ch = M.part('handle', C.chrome), pipe = M.part('flue', C.black);
  const w = I(24), d = I(18), z0 = I(6), h = I(26), cx = 0, cy = -I(14);
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) ci.strut([sx * I(9), cy + sy * I(6), 0], [sx * I(9), cy + sy * I(6), z0], I(.9), 8, I(.6));
  ci.rbox(-w / 2, cy - d / 2, z0, w / 2, cy + d / 2, z0 + h, I(1.6), I(.7), 2);
  ci.rbox(-w / 2 - I(.6), cy - d / 2 - I(.6), z0 + h, w / 2 + I(.6), cy + d / 2 + I(.6), z0 + h + I(1), I(1.6), I(.3), 2);         // top plate
  gl.rbox(-I(6.5), cy - d / 2 - I(.35), z0 + I(7), I(6.5), cy - d / 2, z0 + I(19), I(.6), 0, 1);
  ci.rbox(-I(8.5), cy - d / 2 - I(.7), z0 + I(5.2), I(8.5), cy - d / 2 - I(.3), z0 + I(20.8), I(.8), 0, 1);
  ch.strut([I(9.6), cy - d / 2 - I(.7), z0 + I(9)], [I(9.6), cy - d / 2 - I(1.9), z0 + I(9)], I(.45), 8); ch.strut([I(9.6), cy - d / 2 - I(1.9), z0 + I(9)], [I(9.6), cy - d / 2 - I(1.9), z0 + I(16)], I(.45), 8);
  ci.rbox(-w / 2 + I(1.5), cy - d / 2 - I(2), 0, w / 2 - I(1.5), cy - d / 2 + I(1), z0 - I(1), I(.5), 0, 1);                       // ash lip
  flue(pipe, 0, cy + I(2), z0 + h + I(1), I(96), I(3));
  pipe.lathe('z', [0, cy + I(2), 0], [[z0 + h + I(1), I(3.4)], [z0 + h + I(2.2), I(3.4)], [z0 + h + I(2.2), I(3)]], 20);
  const p = new Plan(EQ).rect('EQUIP', -w / 2, cy - d / 2, w / 2, cy + d / 2).circle('EQUIP-DETAIL', 0, cy + I(2), I(3)).rect('EQUIP-DETAIL', -I(8.5), cy - d / 2 - I(.7), I(8.5), cy - d / 2).rect('CLEARANCE', -I(30), cy - d / 2 - I(18), I(30), I(0));
  return makeItem(eq({ name: 'Stove, wood-burning, freestanding, cast iron, 24"', category: 'appliances/residential', description: 'Freestanding wood stove, 24" wide and 18" deep on four legs, 33" to its top plate, with a glass door, an ash lip and a 6" flue pipe up to a 96" ceiling. Needs a non-combustible hearth pad and the maker\'s clearances to walls (the dotted outline is 30" each side and 18" in front); this is not a listed clearance.', ifc: { class: 'IfcSpaceHeater' }, plan: p, model: M, attrs: { 'CC-NOTE': 'Clearances to be confirmed from the chosen stove' } }));
}

export function stovePellet() {
  const M = new Model(), bd = M.part('body', C.darkSteel), gl = M.part('glass', '#2d3238', .55), ch = M.part('trim', C.chrome), lid = M.part('hopper lid', C.black), vt = M.part('vent', C.black);
  const w = I(22), d = I(25), h = I(34);
  bd.rbox(-w / 2, -d, I(2), w / 2, 0, h - I(10), I(1.2), I(.6), 2);
  bd.rbox(-w / 2 + I(1.5), -d + I(2), h - I(10), w / 2 - I(1.5), -I(2), h, I(1), I(.4), 2);                 // hopper
  lid.rbox(-w / 2 + I(1.2), -d + I(1.8), h, w / 2 - I(1.2), -I(1.8), h + I(.6), I(1), I(.2), 2);
  M.part('base', C.graphite).rbox(-w / 2 + I(1), -d + I(1), 0, w / 2 - I(1), -I(1), I(2), I(.6), 0, 1);
  gl.rbox(-I(7.5), -d - I(.4), I(9), I(7.5), -d, I(21), I(.6), 0, 1);
  ch.rbox(-I(9), -d - I(.8), I(7.4), I(9), -d - I(.4), I(22.6), I(.8), 0, 1);
  ch.rbox(-I(3.4), -d - I(.7), I(2.6), I(3.4), -d - I(.3), I(6.4), I(.5), 0, 1);
  ch.cyl(I(5), -d - I(.7), I(.9), I(26), I(26.4), 14);
  vt.strut([0, -I(2), I(12)], [0, I(.1), I(12)], I(1.8), 14);                                                // exhaust stub through the wall
  const p = new Plan(EQ).rect('EQUIP', -w / 2, -d, w / 2, 0).circle('EQUIP-DETAIL', 0, -I(1.5), I(1.8)).rect('EQUIP-DETAIL', -I(7.5), -d, I(7.5), -d + I(1)).rect('CLEARANCE', -I(24), -d - I(36), I(24), -d);
  return makeItem(eq({ name: 'Stove, pellet, freestanding, 22"', category: 'appliances/residential', description: 'Pellet stove, 22" wide, 25" deep and 34" tall, a glass door, a hopper with a lid on top and a 3" exhaust stub at the back that goes straight out through the wall. Needs a power outlet, a non-combustible hearth pad and the maker\'s clearances.', ifc: { class: 'IfcSpaceHeater' }, plan: p, model: M, elec: { volts: '120', phase: '1', amps: '3' }, attrs: { 'CC-NOTE': 'Clearances to be confirmed from the chosen stove' } }));
}

export function firePit() {
  const M = new Model(), stn = M.part('stone', C.stone), bowl = M.part('bowl', C.black), emb = M.part('embers', '#6a3b22'), lg = M.part('logs', '#6a4a2e');
  const R = I(18), cy = -R;
  stn.basin([supRing(0, cy, R, R, 2, 0, 40), supRing(0, cy, R * .96, R * .96, 2, I(6), 40), supRing(0, cy, R * .9, R * .9, 2, I(12), 40)], [supRing(0, cy, R * .78, R * .78, 2, I(1), 40), supRing(0, cy, R * .78, R * .78, 2, I(12), 40)]);
  stn.lathe('z', [0, cy, I(12)], [[0, R * .93], [I(1.6), R * .95], [I(1.6), R * .7], [0, R * .7], [0, R * .93]], 40, { caps: false });
  bowl.lathe('z', [0, cy, I(3)], [[0, 0], [0, R * .75], [I(3), R * .74], [I(7.8), R * .72], [I(8), R * .68], [I(3.1), R * .7], [I(.4), R * .5], [I(.4), 0]], 36);
  emb.lathe('z', [0, cy, I(9)], [[0, 0], [0, R * .66], [I(.5), R * .62], [I(.5), 0]], 24);
  for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + .4; lg.strut([Math.cos(a) * I(8), cy + Math.sin(a) * I(8), I(11)], [-Math.cos(a) * I(8), cy - Math.sin(a) * I(8), I(14)], I(2), 10); }
  const p = new Plan(EQ).circle('EQUIP', 0, cy, R).circle('EQUIP-DETAIL', 0, cy, R * .78).circle('CLEARANCE', 0, cy, R + I(60));
  return makeItem(eq({ name: 'Fire pit, round, 36", stone ring with steel bowl', category: 'site/landscape', description: 'Outdoor fire pit, 36" across and 12" tall, a stacked stone ring around a steel bowl with embers and four logs. Keep it on a non-combustible surface and clear of buildings and overhanging branches (the dotted ring is a planning aid, not a code distance).', ifc: { class: 'IfcBuildingElementProxy' }, plan: p, model: M, attrs: { 'CC-NOTE': 'Distances to be set by local rules' } }));
}

export function waterHeaterHeatPump() {
  const M = new Model(), tk = M.part('tank', C.white), hd = M.part('heat pump', '#9aa1a7'), cu = M.part('pipes', C.copper), bk = M.part('vents', C.black), gr = M.part('valve', C.brass);
  const R = I(12), cy = -R, H = I(62);
  tk.lathe('z', [0, cy, 0], [[0, R * .8], [I(.6), R * .96], [I(1), R], [H - I(1.5), R], [H - I(.6), R * .97]].map(([t, r]) => [t, r]).concat([[H, R * .9], [H, 0]]), 40);
  hd.lathe('z', [0, cy, H], [[0, R * .98], [I(2), R * 1.0], [I(11), R * 1.0], [I(12), R * .92], [I(12.6), R * .6], [I(12.6), 0]], 40);
  for (let i = 0; i < 6; i++) bk.box(-R * .7, cy - R * 1.01 - I(.2), H + I(2.6 + i * 1.3), R * .7, cy - R * .9, H + I(3.2 + i * 1.3));
  cu.pipe([[-I(4), cy + I(1), H + I(12.6)], [-I(4), cy + I(1), H + I(16)]], I(.5), 10); cu.pipe([[I(4), cy + I(1), H + I(12.6)], [I(4), cy + I(1), H + I(16)]], I(.5), 10);
  gr.strut([R * .95, cy, H - I(16)], [R * .95 + I(2.6), cy, H - I(16)], I(.6), 8); gr.strut([-R * .8, cy, I(6)], [-R * .8, cy - I(2), I(6)], I(.7), 8);
  const p = new Plan(EQ).circle('EQUIP', 0, cy, R).circle('EQUIP-DETAIL', 0, cy, R * .5).text('EQUIP-DETAIL', -I(3), cy, I(3), 'HPWH').rect('CLEARANCE', -R - I(6), cy - R - I(30), R + I(6), cy - R);
  return makeItem(eq({ name: 'Water heater, heat pump, 50 gal, 24" × 74"', category: 'plumbing/equipment', description: 'Heat-pump (hybrid) water heater, 50 US gallons, 24" across and 75" tall with its compressor unit on top, needing about 700 cubic feet of air and 30" in front for service, a condensate drain and a 240 V circuit.', ifc: { class: 'IfcBoiler' }, plan: p, model: M, plumb: { cw: '3/4"', hw: '3/4"', dd: '3/4"' }, elec: { volts: '240', phase: '1', amps: '30' } }));
}

export function waterHeaterTankless() {
  const M = new Model(), cs = M.part('case', C.white), dp = M.part('display', C.glass), vt = M.part('vent', C.gray), cu = M.part('hot', C.copper), bl = M.part('cold', '#3f73a8'), gs = M.part('gas', '#c9a227');
  const w = I(14), d = I(9), h = I(20), z0 = I(48);
  cs.rbox(-w / 2, -d, z0, w / 2, 0, z0 + h, I(1), I(.8), 2);
  dp.rbox(-I(3.2), -d - I(.2), z0 + h - I(5), I(3.2), -d + I(.1), z0 + h - I(2), I(.4), 0, 1);
  vt.lathe('z', [-I(3), -d / 2, z0 + h], [[0, I(1.5)], [I(2.2), I(1.5)], [I(2.2), 0]], 18);
  vt.lathe('z', [I(3), -d / 2, z0 + h], [[0, I(1.5)], [I(2.2), I(1.5)], [I(2.2), 0]], 18);
  [[-5, gs], [-3, cu], [-1, bl], [1, cu], [3, bl]].forEach(([x, part], i) => part.strut([I(x), -I(3 + (i % 2) * 1.5), z0], [I(x), -I(3 + (i % 2) * 1.5), z0 - I(5)], I(.4), 8));
  const p = new Plan(EQ).rect('EQUIP-ABOVE', -w / 2, -d, w / 2, 0).text('EQUIP-DETAIL', -I(3), -d / 2, I(2.5), 'TWH').rect('CLEARANCE', -w / 2, -d - I(24), w / 2, -d);
  return makeItem(eq({ name: 'Water heater, tankless, gas, wall-hung, 14" × 20"', category: 'plumbing/equipment', description: 'Wall-hung tankless gas water heater, 14" wide, 9" deep, 20" tall, hung with its bottom 48" above the floor, with a display and two vent collars on top and gas, hot and cold connections below. Keep 24" in front for service.', ifc: { class: 'IfcBoiler' }, plan: p, model: M, plumb: { cw: '3/4"', hw: '3/4"', gas: '3/4"' }, elec: { volts: '120', phase: '1', amps: '3' }, attrs: mount(z0) }));
}

export function waterSoftener() {
  const M = new Model(), br = M.part('brine tank', '#3d3f43'), lid = M.part('salt lid', '#a9a79e'), rs = M.part('resin tank', '#2c5f8e'), hd = M.part('control head', C.white), cu = M.part('pipes', C.copper);
  const r1 = I(9), r2 = I(5.2), cy1 = -I(10), cy2 = -I(10);
  br.lathe('z', [I(8.5), cy1, 0], [[0, r1 * .92], [I(.3), r1], [I(38), r1], [I(40), r1 * .98], [I(40), 0]], 32);
  lid.lathe('z', [I(8.5), cy1, I(40)], [[0, r1 * 1.01], [I(1.4), r1 * 1.01], [I(1.4), r1 * .7], [I(1.4), 0]], 32);
  rs.lathe('z', [-I(6), cy2, 0], [[0, r2 * .9], [I(.3), r2], [I(40), r2], [I(46), r2 * .62], [I(47), r2 * .5], [I(47), 0]], 28);
  hd.rbox(-I(6) - I(4), cy2 - I(3.4), I(46.6), -I(6) + I(4), cy2 + I(3.4), I(52), I(1.4), I(.5), 2);
  cu.pipe([[-I(8), cy2 + I(3), I(51)], [-I(8), cy2 + I(3), I(55)], [-I(14), cy2 + I(3), I(55)]], I(.55), 10); cu.pipe([[-I(4), cy2 + I(3), I(51)], [-I(4), cy2 + I(3), I(54)], [I(2), cy2 + I(3), I(54)]], I(.55), 10);
  const p = new Plan(EQ).circle('EQUIP', I(8.5), cy1, r1).circle('EQUIP', -I(6), cy2, r2).text('EQUIP-DETAIL', -I(7), cy1 - I(14), I(2.5), 'WS').rect('CLEARANCE', -I(14), cy1 - r1 - I(24), I(18), cy1 - r1);
  return makeItem(eq({ name: 'Water softener, two-tank, 32,000 grain', category: 'plumbing/equipment', description: 'Two-tank water softener, 32,000 grain: a 10" resin tank with a control head, 52" tall, beside an 18" brine tank 40" tall with a salt lid. Needs hot and cold bypass piping, a drain and an outlet nearby; keep 24" in front.', ifc: { class: 'IfcBuildingElementProxy' }, plan: p, model: M, plumb: { cw: '1"', dd: '1/2"' }, elec: { volts: '120', phase: '1', amps: '1' } }));
}

export function furnaceUpflow() {
  const M = new Model(), cb = M.part('cabinet', '#c9cdd1'), dr = M.part('door', '#b4b9be'), pl = M.part('plenum', C.steel), fl = M.part('flue', C.black), kn = M.part('trim', C.black);
  const w = I(17.5), d = I(29), h = I(34);
  cb.rbox(-w / 2, -d, I(1), w / 2, 0, h, I(.6), I(.4), 1);
  dr.rbox(-w / 2 + I(.4), -d - I(.7), I(1.6), w / 2 - I(.4), -d, I(24), I(.5), I(.3), 1);
  dr.rbox(-w / 2 + I(.4), -d - I(.7), I(24.4), w / 2 - I(.4), -d, h - I(.4), I(.5), I(.3), 1);
  kn.rbox(-I(2.8), -d - I(.9), I(12), I(2.8), -d - I(.6), I(15), I(.4), 0, 1);
  pl.sweepX([[-I(1), h], [-d + I(1), h], [-d + I(3), h + I(10)], [-I(3), h + I(10)]], -w / 2 + I(.4), w / 2 - I(.4));
  pl.sweepX([[-I(3), h + I(10)], [-d + I(3), h + I(10)], [-d + I(5), h + I(26)], [-I(5), h + I(26)]], -w / 2 + I(1.4), w / 2 - I(1.4));
  flue(fl, I(5), -I(5), h, h + I(18), I(2));
  M.part('base', C.graphite).box(-w / 2, -d, 0, w / 2, 0, I(1));
  const p = new Plan(EQ).rect('EQUIP', -w / 2, -d, w / 2, 0).line('EQUIP-DETAIL', -w / 2, -d + I(2), w / 2, -d + I(2)).text('EQUIP-DETAIL', -I(2), -d / 2, I(3), 'FUR').rect('CLEARANCE', -w / 2, -d - I(30), w / 2, -d);
  return makeItem(eq({ name: 'Furnace, gas, upflow, 80 MBH, with supply plenum', category: 'mechanical/equipment', description: 'Gas-fired upflow furnace, 80 MBH, 17½" wide, 29" deep, 34" tall with a supply plenum above (to 70") and a 4" flue pipe to the vent. Keep 30" in front for service and the air filter.', ifc: { class: 'IfcSpaceHeater' }, plan: p, model: M, elec: { volts: '120', phase: '1', amps: '10' }, plumb: { gas: '1/2"' } }));
}

export function condenser3ton() {
  const M = new Model(), cb = M.part('cabinet', '#c4c8cc'), gr = M.part('grille', C.black), fan = M.part('fan', '#2f3236'), vl = M.part('valves', C.brass), pad = M.part('pad', C.lightGray);
  const s = I(29), h = I(32), cy = -s / 2 - I(2), z0 = I(3);
  pad.rbox(-s / 2 - I(3), cy - s / 2 - I(3), 0, s / 2 + I(3), cy + s / 2 + I(3), z0, I(1), I(.3), 1);
  cb.rbox(-s / 2, cy - s / 2, z0, s / 2, cy + s / 2, z0 + h, I(1.6), I(.7), 2);
  gr.lathe('z', [0, cy, z0 + h], [[0, I(12.2)], [I(.3), I(12.2)], [I(.3), I(11.7)], [0, I(11.7)], [0, I(12.2)]], 36, { caps: false });
  for (let r = I(3); r < I(12); r += I(2.2)) gr.lathe('z', [0, cy, z0 + h], [[I(.1), r + I(.15)], [I(.5), r + I(.15)], [I(.5), r - I(.15)], [I(.1), r - I(.15)], [I(.1), r + I(.15)]], 32, { caps: false });
  for (let a = 0; a < 6; a++) { const t = a * Math.PI / 3; gr.strut([0, cy, z0 + h + I(.3)], [Math.cos(t) * I(12), cy + Math.sin(t) * I(12), z0 + h + I(.3)], I(.22), 5); }
  fan.lathe('z', [0, cy, z0 + h - I(3)], [[0, I(1.6)], [I(1.5), I(1.6)], [I(1.5), 0]], 16);
  for (let a = 0; a < 3; a++) { const t = a * 2 * Math.PI / 3; fan.strut([0, cy, z0 + h - I(2.4)], [Math.cos(t) * I(10.5), cy + Math.sin(t) * I(10.5), z0 + h - I(1.6)], I(.9), 6, I(.4)); }
  vl.strut([s / 2, cy + I(6), z0 + I(5)], [s / 2 + I(2.2), cy + I(6), z0 + I(5)], I(.55), 8); vl.strut([s / 2, cy + I(9), z0 + I(5)], [s / 2 + I(2.2), cy + I(9), z0 + I(5)], I(.8), 8);
  const p = new Plan(EQ).rect('EQUIP', -s / 2, cy - s / 2, s / 2, cy + s / 2).circle('EQUIP-DETAIL', 0, cy, I(12)).circle('EQUIP-DETAIL', 0, cy, I(2)).rect('CLEARANCE', -s / 2 - I(24), cy - s / 2 - I(24), s / 2 + I(24), cy + s / 2 + I(24));
  return makeItem(eq({ name: 'Air conditioner condenser, outdoor, 3 ton, 29" square', category: 'mechanical/equipment', description: 'Outdoor air-conditioning condensing unit, 3 ton, 29" × 29" and 32" tall on a 3" pad, with a top-discharge fan grille and refrigerant service valves on the side. Keep 24" clear around it and 60" above.', ifc: { class: 'IfcCondenser' }, plan: p, model: M, elec: { volts: '240', phase: '1', amps: '30' } }));
}

export function miniSplitHead() {
  const M = new Model(), wh = M.part('case', C.white), lv = M.part('louver', '#e4e6e8'), gr = M.part('grille', '#cfd3d6'), dk = M.part('vent', C.black);
  const w = I(36), d = I(10), h = I(12.5), z0 = I(84);
  wh.sweepX([[0, z0 + h], [-d + I(2), z0 + h], [-d, z0 + h - I(3)], [-d, z0 + I(3.6)], [-d + I(3), z0 + I(1.6)], [0, z0 + I(1.6)]], -w / 2, w / 2);
  lv.sweepX([[-I(1.5), z0 + I(1.6)], [-d + I(3), z0 + I(1.6)], [-d + I(1.8), z0], [-I(1.5), z0 + I(.3)]], -w / 2 + I(1), w / 2 - I(1));
  dk.box(-w / 2 + I(1.6), -d + I(3.8), z0 + I(1.7), w / 2 - I(1.6), -I(2), z0 + I(2.1));
  for (let i = 0; i < 12; i++) gr.box(-w / 2 + I(2) + i * I(2.8), -d + I(.1), z0 + h - I(2.4), -w / 2 + I(2) + i * I(2.8) + I(1.9), -d + I(.4), z0 + h - I(.8));
  const p = new Plan(EQ).rect('EQUIP-ABOVE', -w / 2, -d, w / 2, 0).line('EQUIP-DETAIL', -w / 2, -d + I(3), w / 2, -d + I(3)).text('EQUIP-DETAIL', -I(3), -d / 2, I(2.5), 'MS');
  return makeItem(eq({ name: 'Mini-split heat pump, indoor wall unit, 36" × 12"', category: 'mechanical/equipment', description: 'Ductless heat pump indoor wall unit, 36" wide, 10" deep, 12½" tall, high on the wall with its bottom at 84", a top intake grille and a motorised louver at the bottom. Needs a line-set and drain through the wall and a 240 V connection or one from the outdoor unit.', ifc: { class: 'IfcUnitaryEquipment' }, plan: p, model: M, elec: { volts: '240', phase: '1', amps: '15' }, attrs: mount(z0) }));
}

export function radiatorPanel() {
  const M = new Model(), pn = M.part('panel', C.white), cu = M.part('valves', C.chrome), z0 = I(4), w = I(36), h = I(24), d = I(4.5);
  pn.rbox(-w / 2, -I(1.6), z0, w / 2, 0, z0 + h, I(.6), I(.2), 1);
  for (let i = 0; i < 34; i++) { const x = -w / 2 + I(.5) + i * (w - I(1)) / 33; pn.rbox(x - I(.45), -d, z0 + I(.8), x + I(.45), -I(1.6), z0 + h - I(1.6), I(.2), 0, 1); }
  pn.rbox(-w / 2, -d - I(.2), z0 + h - I(1.4), w / 2, 0, z0 + h + I(.1), I(.5), I(.3), 1);
  cu.strut([-w / 2 + I(2), -I(1.2), z0], [-w / 2 + I(2), -I(1.2), 0], I(.6), 8); cu.strut([w / 2 - I(2), -I(1.2), z0], [w / 2 - I(2), -I(1.2), 0], I(.6), 8);
  cu.lathe('z', [w / 2 - I(2), -I(1.2), 0], [[0, I(1)], [I(1.2), I(1)], [I(1.2), I(.7)], [I(2), 0]], 12);
  const p = new Plan(EQ).rect('EQUIP', -w / 2, -d, w / 2, 0).line('EQUIP-DETAIL', -w / 2, -I(1.6), w / 2, -I(1.6));
  return makeItem(eq({ name: 'Radiator, hydronic panel, 36" × 24"', category: 'mechanical/equipment', description: 'Hot-water panel radiator, 36" wide, 24" tall and 4½" deep with convector fins behind a flat front, hung with its bottom 4" above the floor and two valves at the bottom corners.', ifc: { class: 'IfcSpaceHeater', predefined: 'RADIATOR' }, plan: p, model: M, plumb: { hw: '1/2"' } }));
}

export function boilerWallHung() {
  const M = new Model(), cs = M.part('case', C.white), dp = M.part('display', C.glass), vt = M.part('vent', C.gray), cu = M.part('pipes', C.copper), gs = M.part('gas', '#c9a227');
  const w = I(17), d = I(12), h = I(28), z0 = I(48);
  cs.rbox(-w / 2, -d, z0, w / 2, 0, z0 + h, I(1), I(.8), 2);
  dp.rbox(-I(4), -d - I(.2), z0 + h - I(6), I(4), -d + I(.1), z0 + h - I(2.4), I(.5), 0, 1);
  for (const x of [-4, 4]) knob(cs, I(x), -d, z0 + I(5), I(1), I(.8));
  vt.lathe('z', [0, -d / 2, z0 + h], [[0, I(2.5)], [I(4), I(2.5)], [I(4), 0]], 24);
  [[-5, gs], [-2.5, cu], [0, cu], [2.5, cu], [5, cu]].forEach(([x, part]) => part.strut([I(x), -I(4), z0], [I(x), -I(4), z0 - I(6)], I(.45), 8));
  const p = new Plan(EQ).rect('EQUIP-ABOVE', -w / 2, -d, w / 2, 0).text('EQUIP-DETAIL', -I(3), -d / 2, I(2.5), 'B').rect('CLEARANCE', -w / 2, -d - I(24), w / 2, -d);
  return makeItem(eq({ name: 'Boiler, wall-hung, condensing gas, 17" × 28"', category: 'mechanical/equipment', description: 'Wall-hung condensing gas boiler, 17" wide, 12" deep, 28" tall, hung with its bottom 48" above the floor, with a display, a 3" vent collar on top and gas, supply and return connections below. Keep 24" in front for service.', ifc: { class: 'IfcBoiler' }, plan: p, model: M, plumb: { gas: '3/4"', hw: '1"' }, elec: { volts: '120', phase: '1', amps: '5' }, attrs: mount(z0) }));
}

export function electricalPanel() {
  const M = new Model(), bx = M.part('box', '#b9bdc1'), dr = M.part('door', '#c8ccd0'), lb = M.part('label', C.white), lt = M.part('latch', C.black);
  const w = I(14.25), d = I(3.75), h = I(30), z0 = I(48);
  bx.rbox(-w / 2, -d, z0, w / 2, 0, z0 + h, I(.3), I(.2), 1);
  dr.rbox(-w / 2 - I(.3), -d - I(.4), z0 - I(.3), w / 2 + I(.3), -d, z0 + h + I(.3), I(.3), I(.2), 1);
  lb.box(-I(5), -d - I(.5), z0 + I(5), I(5), -d - I(.38), z0 + I(20));
  lt.cyl(w / 2 - I(1.5), -d - I(.4), I(.7), z0 + h * .5, z0 + h * .5 + I(.2), 12); lt.lathe('y', [w / 2 - I(1.5), -d - I(.4), z0 + h * .5], [[0, I(.4)], [-I(.5), I(.4)], [-I(.5), 0]], 10);
  const p = new Plan(EQ).rect('EQUIP', -w / 2, -d, w / 2, 0).text('EQUIP-DETAIL', -I(3), -d / 2, I(1.5), 'MDP').rect('CLEARANCE', -I(15), -d - I(36), I(15), -d);
  return makeItem(eq({ name: 'Electrical panel, main breaker, 200 A, surface-mounted', category: 'electrical/equipment', description: 'Surface-mounted service panel, 200 A, 14¼" wide, 3¾" deep and 30" tall, with a hinged door and a label card, mounted with its bottom 48" above the floor (its top breaker no higher than 78"). Keep 30" wide, 36" deep and 78" high clear in front.', ifc: { class: 'IfcElectricDistributionBoard' }, plan: p, model: M, elec: { volts: '240', phase: '1', amps: '200' }, attrs: mount(z0) }));
}

export function ceilingFan() {
  const M = new Model(), mt = M.part('motor', C.darkSteel), bl = M.part('blades', C.oak), lt = M.part('light', '#eee9da', .8), cap = M.part('canopy', C.darkSteel), cy = -I(26), top = I(96);
  cap.lathe('z', [0, cy, top - I(2.4)], [[0, I(2.8)], [I(2.4), I(2)], [I(2.4), 0]], 24);
  mt.strut([0, cy, top - I(2.4)], [0, cy, top - I(8)], I(.65), 10);
  mt.lathe('z', [0, cy, top - I(15)], [[0, I(2.2)], [I(1), I(5.2)], [I(2.4), I(5.4)], [I(4.8), I(5.2)], [I(6.2), I(3.4)], [I(7), 0]], 28);
  lt.lathe('z', [0, cy, top - I(18)], [[0, 0], [0, I(3)], [I(1.6), I(4.2)], [I(3.2), I(3.4)], [I(3.2), 0]], 24);
  for (let i = 0; i < 5; i++) {
    const a = i * 2 * Math.PI / 5, ca = Math.cos(a), sa = Math.sin(a), px = -sa, py = ca;
    const pts = [[I(6), -I(2.4)], [I(26), -I(3.3)], [I(26), I(3.3)], [I(6), I(2.4)]].map(([r, t]) => [ca * r + px * t, cy + sa * r + py * t]);
    bl.loft([pts.map(([x, y]) => [x, y, top - I(14.6) - I(.2)]), pts.map(([x, y]) => [x, y, top - I(14.6) + I(.5)])]);
    bl.strut([ca * I(5.4), cy + sa * I(5.4), top - I(14.2)], [ca * I(7.4), cy + sa * I(7.4), top - I(14.2)], I(.5), 6);
  }
  const p = new Plan(EQ).circle('EQUIP-ABOVE', 0, cy, I(26)).circle('EQUIP-DETAIL', 0, cy, I(5.4));
  for (let i = 0; i < 5; i++) { const a = i * 2 * Math.PI / 5; p.line('EQUIP-DETAIL', Math.cos(a) * I(6), cy + Math.sin(a) * I(6), Math.cos(a) * I(26), cy + Math.sin(a) * I(26)); }
  return makeItem(eq({ name: 'Ceiling fan, 52", five blades, with light', category: 'electrical/fixtures', description: 'Ceiling fan, 52" across, five wood-look blades with a downlight, hung from a 96" ceiling on a 6" downrod so the blades are about 82" above the floor. Wants a fan-rated box.', ifc: { class: 'IfcFan' }, plan: p, model: M, elec: { volts: '120', phase: '1', amps: '1' }, attrs: mount(I(75)) }));
}

export function hearthItems() {
  return [fireplaceMasonry(), fireplaceGas(), stoveWood(), stovePellet(), firePit(), waterHeaterHeatPump(), waterHeaterTankless(), waterSoftener(), furnaceUpflow(), condenser3ton(), miniSplitHead(), radiatorPanel(), boilerWallHung(), electricalPanel(), ceilingFan()];
}
