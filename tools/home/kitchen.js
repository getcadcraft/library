/* SPDX-License-Identifier: Apache-2.0 */
/** Kitchen and laundry: cooktops, ovens, hoods, refrigeration, sinks, faucet, disposer, microwave, washers. */
import { Model, Plan, makeItem, ellRing, supRing, rrRing } from './kit.js';
import { C, EQ, FX, SIZE_NOTE, inch as I } from './common.js';

const mount = (z) => ({ 'CC-MOUNT-HEIGHT': String(Math.round(z)) });
const appliance = (extra) => ({ kind: 'equipment', category: 'appliances/residential', remarks: SIZE_NOTE, ...extra });
/** A knob on a front face (y = yf, front toward −Y). */
const knob = (part, x, yf, z, r = I(.85), d = I(1.1)) => part.lathe('y', [x, yf, z], [[0, r * .85], [-d * .3, r], [-d, r * .9], [-d, 0]], 18);
const handle = (part, x0, x1, yf, z, off = I(1.6), r = I(.45)) => { part.strut([x0, yf - off, z], [x1, yf - off, z], r, 10); part.strut([x0 + I(.8), yf, z], [x0 + I(.8), yf - off, z], r * .8, 8); part.strut([x1 - I(.8), yf, z], [x1 - I(.8), yf - off, z], r * .8, 8); };

export function cooktopGas36() {
  const M = new Model(), top = M.part('top', C.steel), grate = M.part('grate', C.black), brass = M.part('burner', C.brass), kn = M.part('knobs', C.chrome);
  const w = I(36), d = I(21), y0 = -I(2.2), y1 = y0 - d, z0 = I(35.4), z1 = I(36.1);
  top.rbox(-w / 2, y1, z0, w / 2, y0, z1, I(1.2), I(.15), 2);
  const burners = [[-I(11.5), y0 - I(5.2), 2.4], [-I(11.5), y1 + I(5.2), 2.0], [0, y0 - d / 2, 3.0], [I(11.5), y0 - I(5.2), 2.0], [I(11.5), y1 + I(5.2), 2.4]];
  for (const [x, y, rr] of burners) {
    brass.lathe('z', [x, y, z1], [[0, I(rr * .9)], [I(.4), I(rr * .9)], [I(.6), I(rr * .55)], [I(.9), I(rr * .55)], [I(.9), 0]], 20);
    for (const a of [0, Math.PI / 2]) for (const s of [-1, 1]) {
      const R = I(rr + 2.2), dx = Math.cos(a) * R * s, dy = Math.sin(a) * R * s;
      grate.strut([x, y, z1 + I(1.1)], [x + dx, y + dy, z1 + I(1.1)], I(.22), 6);
    }
    grate.lathe('z', [x, y, z1 + I(.8)], [[0, I(rr + 2.3)], [I(.3), I(rr + 2.3)], [I(.3), I(rr + 1.9)], [0, I(rr + 1.9)], [0, I(rr + 2.3)]], 24, { caps: false });
    for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) grate.strut([x + sx * I(rr + 2.1) * .72, y + sy * I(rr + 2.1) * .72, z1], [x + sx * I(rr + 2.1) * .72, y + sy * I(rr + 2.1) * .72, z1 + I(.9)], I(.25), 6);
  }
  grate.strut([-w / 2 + I(1.5), y0 - d / 2, z1 + I(1.1)], [w / 2 - I(1.5), y0 - d / 2, z1 + I(1.1)], I(.22), 6);
  for (let i = 0; i < 5; i++) knob(kn, -I(14) + i * I(7), y1, I(35.1), I(.85), I(.9));
  const p = new Plan(EQ).rect('EQUIP', -w / 2, y1, w / 2, y0);
  for (const [x, y, rr] of burners) p.circle('EQUIP-DETAIL', x, y, I(rr));
  return makeItem({ ...appliance({ name: 'Cooktop, gas, 36", five burners', description: 'Gas cooktop, 36" × 21", five burners on cast-iron grates with front knobs, set into a counter at 36". Cut-out about 34" × 19".', ifc: { class: 'IfcElectricAppliance', predefined: 'ELECTRICCOOKER' }, plan: p, model: M, plumb: { gas: '1/2"' }, elec: { volts: '120', phase: '1', amps: '15' }, attrs: mount(I(35.4)) }) });
}

export function cooktopInduction30() {
  const M = new Model(), gl = M.part('glass', C.glass), ring = M.part('zones', '#5d6268'), ctl = M.part('touch', C.chrome);
  const w = I(30), d = I(21), y0 = -I(2.2), y1 = y0 - d, z0 = I(35.5), z1 = I(36.1);
  gl.rbox(-w / 2, y1, z0, w / 2, y0, z1, I(1.4), I(.2), 2);
  const zs = [[-I(7.5), y0 - I(6), 3.6], [I(7.5), y0 - I(6), 3.0], [-I(7.5), y1 + I(7), 3.0], [I(7.5), y1 + I(7), 3.6]];
  for (const [x, y, r] of zs) ring.lathe('z', [x, y, z1], [[0, I(r)], [I(.05), I(r)], [I(.05), I(r - .35)], [0, I(r - .35)], [0, I(r)]], 40, { caps: false });
  ctl.rbox(-I(5), y1 + I(.8), z1, I(5), y1 + I(2), z1 + I(.05), I(.3), 0, 1);
  const p = new Plan(EQ).rect('EQUIP', -w / 2, y1, w / 2, y0);
  for (const [x, y, r] of zs) p.circle('EQUIP-DETAIL', x, y, I(r));
  return makeItem(appliance({ name: 'Cooktop, induction, 30", four zones', description: 'Induction cooktop, 30" × 21", a black glass top with four cooking zones and touch controls, set into a counter at 36". Cut-out about 28¼" × 19".', ifc: { class: 'IfcElectricAppliance', predefined: 'ELECTRICCOOKER' }, plan: p, model: M, elec: { volts: '240', phase: '1', amps: '40' }, attrs: mount(I(35.5)) }));
}

function wallOven(double) {
  const M = new Model(), st = M.part('steel', C.steel), gl = M.part('glass', C.glass, .92), pn = M.part('panel', C.black), kn = M.part('handle', C.chrome);
  const w = I(29.6), d = I(24), z0 = I(30), h = I(double ? 50.4 : 28.5), yf = -d;
  st.rbox(-w / 2, yf, z0, w / 2, 0, z0 + h, I(.5), I(.3), 1);
  const doors = double ? [[z0 + I(1), z0 + I(23.2)], [z0 + I(25.8), z0 + I(48.4)]] : [[z0 + I(1), z0 + I(23.2)]];
  const ctlZ = double ? z0 + I(24) : z0 + I(23.6);
  pn.rbox(-w / 2 + I(.8), yf - I(.3), ctlZ, w / 2 - I(.8), yf, ctlZ + I(3.6), I(.4), 0, 1);
  for (const [a, b] of doors) {
    st.rbox(-w / 2 + I(.6), yf - I(.9), a, w / 2 - I(.6), yf, double ? b - I(.2) : b + I(0), I(.6), I(.3), 1);
    gl.rbox(-w / 2 + I(3.4), yf - I(1.0), a + I(3.6), w / 2 - I(3.4), yf - I(.9), b - I(3.2), I(.5), 0, 1);
    handle(kn, -w / 2 + I(3.6), w / 2 - I(3.6), yf - I(.9), b - I(1.9), I(1.5));
  }
  for (let i = 0; i < 5; i++) knob(kn, -I(10) + i * I(5), yf - I(.3), ctlZ + I(1.8), I(.65), I(.7));
  const p = new Plan(EQ).rect('EQUIP', -w / 2, yf, w / 2, 0).line('EQUIP-DETAIL', -w / 2, yf + I(1), w / 2, yf + I(1)).text('EQUIP-DETAIL', -I(1.5), yf / 2, I(3), 'OV').rect('CLEARANCE', -w / 2, yf - I(24), w / 2, yf);
  return makeItem(appliance({ name: double ? 'Wall oven, double, 30"' : 'Wall oven, single, 30"', description: double ? 'Double built-in wall oven for a 30" cabinet opening, 29½" wide, 24" deep, 50½" tall, two doors with glass windows and bar handles, its bottom 30" above the floor. Leave 24" in front for the doors.' : 'Single built-in wall oven for a 30" cabinet opening, 29½" wide, 24" deep, 28½" tall, a glass window and a bar handle, its bottom 30" above the floor. Leave 24" in front for the door.', ifc: { class: 'IfcElectricAppliance', predefined: 'ELECTRICCOOKER' }, plan: p, model: M, elec: { volts: '240', phase: '1', amps: double ? '50' : '30' }, attrs: mount(z0) }));
}

export function hoodUnderCabinet30() {
  const M = new Model(), st = M.part('steel', C.steel), bk = M.part('vent', C.black), kn = M.part('knobs', C.chrome), lens = M.part('lamp', '#e8e2c8');
  const w = I(30), d = I(17.5), z0 = I(66), yf = -d;
  st.sweepX([[0, z0 + I(5.6)], [-I(15.6), z0 + I(5.6)], [-d, z0 + I(2.8)], [-d, z0], [0, z0]], -w / 2, w / 2);
  bk.box(-w / 2 + I(2), -I(14), z0 - I(.1), w / 2 - I(2), -I(2.6), z0 + I(.1));
  for (let i = 0; i < 9; i++) bk.box(-w / 2 + I(2.2), -I(14) + i * I(1.3), z0 - I(.35), w / 2 - I(2.2), -I(14) + i * I(1.3) + I(.5), z0 - I(.1));
  for (const x of [-I(9), I(9)]) lens.lathe('z', [x, -I(7), z0 - I(.15)], [[0, I(1.5)], [-I(.12), I(1.5)], [-I(.12), 0]], 16);
  for (let i = 0; i < 3; i++) knob(kn, -I(2.4) + i * I(2.4), yf + I(.2), z0 + I(2.2) + 0, I(.55), I(.5));
  const p = new Plan(EQ).rect('EQUIP-ABOVE', -w / 2, yf, w / 2, 0).line('EQUIP-DETAIL', -w / 2, yf + I(4), w / 2, yf + I(4));
  return makeItem(appliance({ name: 'Range hood, under-cabinet, 30"', description: 'Under-cabinet range hood, 30" wide, 17½" deep, 5½" tall, its bottom 66" above the floor (30" over a 36" cooktop), with a baffle filter, two lamps and three front controls. Duct it outdoors.', ifc: { class: 'IfcFan' }, plan: p, model: M, elec: { volts: '120', phase: '1', amps: '3' }, attrs: mount(z0) }));
}

export function hoodIsland36() {
  const M = new Model(), st = M.part('steel', C.steel), bk = M.part('filter', C.black);
  const w = I(36), d = I(27), z0 = I(72), zc = I(82), top = I(96), cy = -d / 2;
  st.loft([rrRing(-w / 2, cy - d / 2, w / 2, cy + d / 2, I(1.2), z0, 2), rrRing(-w / 2 + I(1.6), cy - d / 2 + I(1.6), w / 2 - I(1.6), cy + d / 2 - I(1.6), I(1), z0 + I(.8), 2), rrRing(-I(7), cy - I(7), I(7), cy + I(7), I(.8), zc, 2), rrRing(-I(7), cy - I(7), I(7), cy + I(7), I(.8), top, 2)]);
  bk.box(-w / 2 + I(3), cy - d / 2 + I(3), z0 - I(.1), w / 2 - I(3), cy + d / 2 - I(3), z0 + I(.2));
  const p = new Plan(EQ).rect('EQUIP-ABOVE', -w / 2, -d, w / 2, 0).rect('EQUIP-ABOVE', -I(7), cy - I(7), I(7), cy + I(7));
  return makeItem(appliance({ name: 'Range hood, island canopy, 36"', description: 'Island canopy range hood, 36" × 27", its bottom 72" above the floor, a 14" × 14" chimney up to a 96" ceiling, with a baffle filter. Centre it over the island cooktop.', ifc: { class: 'IfcFan' }, plan: p, model: M, elec: { volts: '120', phase: '1', amps: '4' }, attrs: mount(z0) }));
}

function fridgeBase(M, w, d, h, r) { M.part('steel', C.steel).rbox(-w / 2, -d, I(1.5), w / 2, 0, h, I(1.2), r, 2); M.part('plinth', C.graphite).box(-w / 2 + I(1), -d + I(1), 0, w / 2 - I(1), -I(1), I(1.6)); }

export function fridgeSideBySide36() {
  const M = new Model(), w = I(36), d = I(30), h = I(69.5), z0 = I(1.5);
  const st = M.part('steel', C.steel), dk = M.part('seams', C.black), ch = M.part('handle', C.chrome), pn = M.part('dispenser', C.glass);
  st.rbox(-w / 2, -I(28.4), z0, w / 2, 0, h, I(.5), I(.3), 1);
  M.part('plinth', C.graphite).box(-w / 2 + I(1), -I(26.4), 0, w / 2 - I(1), -I(1), I(1.6));
  const split = -w / 2 + w * .42;
  st.rbox(-w / 2 + I(.2), -I(30), z0 + I(.1), split - I(.15), -I(28.4), h - I(.2), I(.4), I(.5), 1);
  st.rbox(split + I(.15), -I(30), z0 + I(.1), w / 2 - I(.2), -I(28.4), h - I(.2), I(.4), I(.5), 1);
  pn.rbox(split + I(2), -I(30.2), I(40), w / 2 - I(2), -I(30), I(58), I(.4), 0, 1);
  dk.box(split + I(4.4), -I(30.3), I(44), w / 2 - I(4.4), -I(30.1), I(46));
  for (const [x, a, b] of [[split - I(1.8), I(14), I(60)], [split + I(1.8), I(14), I(60)]]) { ch.strut([x, -I(31.6), a], [x, -I(31.6), b], I(.6), 10); ch.strut([x, -I(30), a + I(2)], [x, -I(31.6), a + I(2)], I(.45), 8); ch.strut([x, -I(30), b - I(2)], [x, -I(31.6), b - I(2)], I(.45), 8); }
  const p = new Plan(EQ).rect('EQUIP', -w / 2, -I(28.4), w / 2, 0).line('EQUIP-DETAIL', split, -I(30), split, -I(28.4)).rect('EQUIP-DETAIL', -w / 2, -I(30), w / 2, -I(28.4)).text('EQUIP-DETAIL', -I(2), -I(14), I(3), 'REF')
    .arc('SWING', -w / 2, -I(30), I(15), 270, 360).arc('SWING', w / 2, -I(30), I(21), 180, 270);
  return makeItem(appliance({ name: 'Refrigerator, side-by-side, 36", stainless, water and ice', description: 'Side-by-side refrigerator-freezer, 36" wide, 30" deep with its doors and handles, 69½" tall, stainless doors with a water and ice dispenser and vertical bar handles. Leave 1" at the back and each side for the doors to clear.', ifc: { class: 'IfcElectricAppliance', predefined: 'FRIDGE_FREEZER' }, plan: p, model: M, plumb: { cw: '1/4"' }, elec: { volts: '120', phase: '1', amps: '15' } }));
}

export function fridgeTopFreezer30() {
  const M = new Model(), w = I(30), d = I(30), h = I(66), st = M.part('body', C.white), ch = M.part('handle', C.chrome), dk = M.part('seams', C.black);
  st.rbox(-w / 2, -I(28.5), I(1.5), w / 2, 0, h, I(.5), I(.3), 1);
  M.part('plinth', C.graphite).box(-w / 2 + I(1), -I(26), 0, w / 2 - I(1), -I(1), I(1.6));
  const split = I(44);
  st.rbox(-w / 2 + I(.2), -I(30), I(1.7), w / 2 - I(.2), -I(28.5), split - I(.2), I(.5), I(.6), 1);
  st.rbox(-w / 2 + I(.2), -I(30), split + I(.2), w / 2 - I(.2), -I(28.5), h - I(.2), I(.5), I(.6), 1);
  dk.box(-w / 2 + I(.3), -I(28.7), split - I(.1), w / 2 - I(.3), -I(28.45), split + I(.1));
  for (const [a, b] of [[I(48), I(62)], [I(25), I(41)]]) { const x = -w / 2 + I(2.2); ch.strut([x, -I(31.4), a], [x, -I(31.4), b], I(.55), 10); ch.strut([x, -I(30), a + I(1.2)], [x, -I(31.4), a + I(1.2)], I(.4), 8); ch.strut([x, -I(30), b - I(1.2)], [x, -I(31.4), b - I(1.2)], I(.4), 8); }
  const p = new Plan(EQ).rect('EQUIP', -w / 2, -I(28.5), w / 2, 0).rect('EQUIP-DETAIL', -w / 2, -I(30), w / 2, -I(28.5)).text('EQUIP-DETAIL', -I(2), -I(14), I(3), 'REF').arc('SWING', w / 2, -I(30), I(26), 180, 270).arc('SWING', w / 2, -I(30), I(26), 180, 270);
  return makeItem(appliance({ name: 'Refrigerator, top-freezer, 30", white', description: 'Top-freezer refrigerator, 30" wide, 30" deep with its doors and handles, 66" tall, two doors hinged on the right. Leave 1" at the back and sides for the doors to clear.', ifc: { class: 'IfcElectricAppliance', predefined: 'FRIDGE_FREEZER' }, plan: p, model: M, elec: { volts: '120', phase: '1', amps: '15' } }));
}

export function fridgeUndercounter24() {
  const M = new Model(), w = I(24), d = I(24), h = I(34), st = M.part('steel', C.steel), ch = M.part('handle', C.chrome), gl = M.part('glass', C.glass, .8);
  st.rbox(-w / 2, -d + I(1.2), I(.3), w / 2, 0, h, I(.4), I(.2), 1);
  st.rbox(-w / 2 + I(.2), -d, I(2.6), w / 2 - I(.2), -d + I(1.2), h - I(.2), I(.4), I(.5), 1);
  M.part('plinth', C.graphite).box(-w / 2 + I(.4), -d + I(3), 0, w / 2 - I(.4), -I(1), I(2.6));
  ch.strut([-w / 2 + I(3), -d - I(1.4), h - I(4)], [w / 2 - I(3), -d - I(1.4), h - I(4)], I(.45), 10);
  ch.strut([-w / 2 + I(3.8), -d, h - I(4)], [-w / 2 + I(3.8), -d - I(1.4), h - I(4)], I(.35), 8); ch.strut([w / 2 - I(3.8), -d, h - I(4)], [w / 2 - I(3.8), -d - I(1.4), h - I(4)], I(.35), 8);
  const p = new Plan(EQ).rect('EQUIP', -w / 2, -d, w / 2, 0).text('EQUIP-DETAIL', -I(2), -d / 2, I(3), 'REF').rect('CLEARANCE', -w / 2, -d - I(24), w / 2, -d);
  return makeItem(appliance({ name: 'Refrigerator, undercounter, 24"', description: 'Undercounter refrigerator, 24" wide, 24" deep, 34" tall, stainless door with a bar handle, fitted under a 36" counter.', ifc: { class: 'IfcElectricAppliance', predefined: 'FRIDGE' }, plan: p, model: M, elec: { volts: '120', phase: '1', amps: '15' } }));
}

export function freezerChest48() {
  const M = new Model(), w = I(48), d = I(28), h = I(34.5), wh = M.part('body', C.white), ch = M.part('handle', C.chrome), dk = M.part('seam', C.graphite);
  wh.rbox(-w / 2, -d, I(1.2), w / 2, 0, h - I(3), I(1.5), I(.5), 2);
  wh.rbox(-w / 2 - I(.2), -d - I(.2), h - I(3), w / 2 + I(.2), 0, h, I(1.6), I(1), 2);
  M.part('plinth', dk.color).box(-w / 2 + I(1), -d + I(1), 0, w / 2 - I(1), -I(1), I(1.3));
  ch.strut([-I(6), -d - I(1.2), h - I(1.6)], [I(6), -d - I(1.2), h - I(1.6)], I(.55), 10);
  for (const x of [-I(6), I(6)]) ch.strut([x, -d, h - I(1.6)], [x, -d - I(1.2), h - I(1.6)], I(.4), 8);
  const p = new Plan(EQ).rect('EQUIP', -w / 2, -d, w / 2, 0).rect('EQUIP-DETAIL', -w / 2 + I(1), -d + I(1), w / 2 - I(1), -I(1)).text('EQUIP-DETAIL', -I(2), -d / 2, I(3), 'FRZ').rect('CLEARANCE', -w / 2, -d - I(24), w / 2, -d);
  return makeItem(appliance({ name: 'Freezer, chest, 48", 15 cubic feet', description: 'Chest freezer, 48" wide, 28" deep, 34½" tall, a hinged lid with a bar handle. Leave 24" in front and a few inches at the back to open the lid.', ifc: { class: 'IfcElectricAppliance', predefined: 'FREEZER' }, plan: p, model: M, elec: { volts: '120', phase: '1', amps: '15' } }));
}

export function wineCooler24() {
  const M = new Model(), w = I(24), d = I(24), h = I(34), bk = M.part('body', C.black), gl = M.part('glass', '#26343c', .7), ch = M.part('handle', C.chrome), sh = M.part('racks', C.wood);
  bk.rbox(-w / 2, -d + I(1.2), I(.3), w / 2, 0, h, I(.4), I(.2), 1);
  bk.rbox(-w / 2 + I(.2), -d, I(2.4), w / 2 - I(.2), -d + I(1.2), h - I(.2), I(.4), I(.3), 1);
  gl.rbox(-w / 2 + I(1.6), -d - I(.1), I(4), w / 2 - I(1.6), -d + I(.2), h - I(2), I(.3), 0, 1);
  M.part('plinth', C.graphite).box(-w / 2 + I(.4), -d + I(3), 0, w / 2 - I(.4), -I(1), I(2.4));
  for (let i = 0; i < 5; i++) sh.box(-w / 2 + I(2), -d + I(1.4), I(6 + i * 5.4), w / 2 - I(2), -d + I(3), I(6.6 + i * 5.4));
  ch.strut([-w / 2 + I(3), -d - I(1.6), h * .5], [-w / 2 + I(3), -d - I(1.6), h - I(5)], I(.5), 10);
  const p = new Plan(EQ).rect('EQUIP', -w / 2, -d, w / 2, 0).text('EQUIP-DETAIL', -I(2), -d / 2, I(3), 'WC').rect('CLEARANCE', -w / 2, -d - I(24), w / 2, -d);
  return makeItem(appliance({ name: 'Wine cooler, undercounter, 24"', description: 'Undercounter wine cooler, 24" wide, 24" deep, 34" tall, a tinted glass door with a vertical handle and five wooden racks, fitted under a 36" counter.', ifc: { class: 'IfcElectricAppliance', predefined: 'FRIDGE' }, plan: p, model: M, elec: { volts: '120', phase: '1', amps: '15' } }));
}

export function sinkFarmhouse33() {
  const M = new Model(), fc = M.part('fireclay', C.porcelain), ch = M.part('drain', C.chrome), n = 48;
  const w = I(33), z1 = I(36), zb = I(26), cy = -I(13), b = I(11.4);
  fc.basin([supRing(0, cy, w / 2 * .92, b * .9, 12, zb, n), supRing(0, cy, w / 2, b, 12, zb + I(2), n), supRing(0, cy, w / 2, b, 12, z1, n)],
    [supRing(0, cy, w / 2 * .88, b * .8, 8, zb + I(2.4), n), supRing(0, cy, w / 2 * .95, b * .9, 10, z1 - I(4), n), supRing(0, cy, w / 2 * .96, b * .92, 12, z1, n)]);
  fc.rbox(-w / 2, cy - b - I(.2), zb + I(.6), w / 2, cy - b + I(1.6), z1 - I(.4), I(.8), I(.6), 2);         // the apron front
  ch.cyl(0, cy, I(1.6), zb + I(2.4), zb + I(2.55), 16);
  const p = new Plan(FX).ring('FIXTURE', supRing(0, cy, w / 2, b, 12, 0, n)).ring('FIXTURE-DETAIL', supRing(0, cy, w / 2 * .94, b * .9, 12, 0, n)).circle('FIXTURE-DETAIL', 0, cy, I(1.6));
  return makeItem({ name: 'Kitchen sink, farmhouse apron-front, 33", single bowl', kind: 'fixture', category: 'plumbing/fixtures', description: 'Fireclay farmhouse sink, 33" × 23", a single deep bowl 10" deep with an apron front that shows at the cabinet face. Sits in a 36" sink base cut for it; faucet on the counter behind.', ifc: { class: 'IfcSanitaryTerminal', predefined: 'SINK' }, plan: p, model: M, plumb: { cw: '1/2"', hw: '1/2"', dd: '2"' }, remarks: SIZE_NOTE, attrs: mount(zb) });
}

export function sinkBarRound15() {
  const M = new Model(), ss = M.part('steel', C.steel), ch = M.part('drain', C.chrome), z1 = I(36.1), cy = -I(8);
  ss.lathe('z', [0, cy, z1 - I(7)], [[0, 0], [0, I(5.2)], [I(.3), I(5.5)], [I(5.6), I(6.6)], [I(6.6), I(7.3)], [I(7.1), I(7.9)], [I(7.1), I(7.7)], [I(6.6), I(7.1)], [I(6.4), I(6.4)], [I(.7), I(5.2)], [I(.5), 0]], 48);
  ch.cyl(0, cy, I(1.5), z1 - I(6.4), z1 - I(6.25), 16);
  const p = new Plan(FX).circle('FIXTURE', 0, cy, I(7.9)).circle('FIXTURE-DETAIL', 0, cy, I(6.4)).circle('FIXTURE-DETAIL', 0, cy, I(1.5));
  return makeItem({ name: 'Bar sink, round, 15", stainless', kind: 'fixture', category: 'plumbing/fixtures', description: 'Round stainless bar or prep sink, 15" across and 7" deep, with a rolled rim, set in a counter at 36".', ifc: { class: 'IfcSanitaryTerminal', predefined: 'SINK' }, plan: p, model: M, plumb: { cw: '1/2"', hw: '1/2"', dd: '1-1/2"' }, remarks: SIZE_NOTE, attrs: mount(z1 - I(7)) });
}

export function faucetKitchen() {
  const M = new Model(), ch = M.part('chrome', C.chrome), z0 = I(36);
  ch.lathe('z', [0, -I(2), z0], [[0, I(1.5)], [I(.25), I(1.5)], [I(.3), I(1.1)], [I(.3), 0]], 20);
  ch.lathe('z', [0, -I(2), z0 + I(.3)], [[0, I(.9)], [I(6), I(.75)], [I(6), 0]], 14);
  const arc = []; for (let i = 0; i <= 10; i++) { const t = Math.PI * 0.62 * i / 10; arc.push([0, -I(2) - I(5.5) * (1 - Math.cos(t)), z0 + I(6.3) + I(5.5) * Math.sin(t)]); }
  ch.pipe(arc, I(.7), 12);
  const e = arc[arc.length - 1];
  ch.lathe('z', [e[0], e[1], e[2] - I(3.4)], [[0, I(.55)], [I(2.6), I(.95)], [I(3.4), I(1.1)], [I(3.4), 0]], 14);
  ch.strut([I(.9), -I(2), z0 + I(2.6)], [I(5.4), -I(2), z0 + I(4.2)], I(.55), 10);                  // lever
  const p = new Plan(FX).circle('FIXTURE', 0, -I(2), I(1.5)).circle('FIXTURE-DETAIL', 0, -I(2), I(.7)).line('FIXTURE-DETAIL', 0, -I(2), 0, -I(8.5));
  return makeItem({ name: 'Kitchen faucet, pull-down, single lever', kind: 'fixture', category: 'plumbing/fixtures', description: 'Single-lever kitchen faucet with a high gooseneck spout and a pull-down spray head, 15" tall, on a counter at 36". Place it behind the sink bowls.', ifc: { class: 'IfcSanitaryTerminal', predefined: 'SINK' }, plan: p, model: M, plumb: { cw: '3/8"', hw: '3/8"' }, remarks: SIZE_NOTE, attrs: mount(z0) });
}

export function disposer() {
  const M = new Model(), body = M.part('body', C.darkSteel), ch = M.part('flange', C.chrome), z1 = I(28), cy = -I(13);
  ch.lathe('z', [0, cy, z1 - I(1.5)], [[0, I(2.3)], [I(.4), I(2.3)], [I(.4), I(1.7)], [I(1.5), I(1.7)], [I(1.5), 0]].slice(0, 5), 24);
  body.lathe('z', [0, cy, z1 - I(13.5)], [[0, 0], [0, I(2.7)], [I(.6), I(3.3)], [I(6), I(3.4)], [I(10), I(3.1)], [I(11.8), I(3.6)], [I(11.8), 0]], 28);
  body.pipe([[I(3.3), cy, z1 - I(10.8)], [I(6.2), cy, z1 - I(10.8)]], I(.95), 12);                   // discharge
  ch.cyl(I(6.2), cy, I(1.15), z1 - I(11.7), z1 - I(9.9), 12);
  const p = new Plan(FX).circle('FIXTURE-DETAIL', 0, cy, I(3.5)).circle('FIXTURE-DETAIL', 0, cy, I(1.7));
  return makeItem({ name: 'Garbage disposer, continuous feed, ½ hp', kind: 'equipment', category: 'appliances/residential', description: 'Continuous-feed garbage disposer, ½ hp, 7" across and about 13" tall, hung under the sink flange with a side discharge to the trap. Plug it into a switched outlet in the sink base.', ifc: { class: 'IfcElectricAppliance' }, plan: p, model: M, elec: { volts: '120', phase: '1', amps: '6' }, plumb: { dd: '1-1/2"' }, remarks: SIZE_NOTE, attrs: mount(z1 - I(13.5)) });
}

export function microwaveCounter24() {
  const M = new Model(), st = M.part('body', C.steel), gl = M.part('glass', C.glass, .92), pn = M.part('panel', C.black), ch = M.part('handle', C.chrome), z0 = I(36), w = I(24), d = I(19), h = I(14);
  st.rbox(-w / 2, -d, z0 + I(.4), w / 2, -I(1), z0 + h, I(.8), I(.5), 2);
  M.part('feet', C.rubber).box(-w / 2 + I(1), -d + I(1), z0, w / 2 - I(1), -I(2), z0 + I(.4));
  gl.rbox(-w / 2 + I(1.2), -d - I(.2), z0 + I(1.8), w / 2 - I(6.4), -d + I(.1), z0 + h - I(1.6), I(.5), 0, 1);
  pn.rbox(w / 2 - I(5.8), -d - I(.2), z0 + I(1.8), w / 2 - I(.8), -d + I(.1), z0 + h - I(1.6), I(.4), 0, 1);
  for (let i = 0; i < 6; i++) ch.box(w / 2 - I(5.2), -d - I(.5), z0 + I(2.6 + i * 1.5), w / 2 - I(1.4), -d - I(.15), z0 + I(3.5 + i * 1.5));
  handle(ch, w / 2 - I(6.9), w / 2 - I(6.9) + I(.01), -d - I(.1), z0 + I(2), I(1.4));
  ch.strut([w / 2 - I(6.9), -d - I(1.5), z0 + I(2)], [w / 2 - I(6.9), -d - I(1.5), z0 + h - I(2)], I(.45), 10);
  const p = new Plan(EQ).rect('EQUIP', -w / 2, -d, w / 2, -I(1)).text('EQUIP-DETAIL', -I(2), -d / 2, I(3), 'MW');
  return makeItem(appliance({ name: 'Microwave oven, countertop, 24"', description: 'Countertop microwave oven, 24" wide, 19" deep, 14" tall, a glass door with a vertical handle and a keypad, on a counter at 36".', ifc: { class: 'IfcElectricAppliance', predefined: 'MICROWAVE' }, plan: p, model: M, elec: { volts: '120', phase: '1', amps: '15' }, attrs: mount(z0) }));
}

function laundryUnit(M, z0, h, label) {
  const w = I(27), d = I(30), wh = M.part('body', C.white), gl = M.part('glass', C.glass, .85), ch = M.part('trim', C.chrome), pn = M.part('panel', C.graphite);
  wh.rbox(-w / 2, -d, z0, w / 2, 0, z0 + h, I(.8), I(.5), 2);
  const dz = z0 + h * .44, dr = I(10);
  ch.lathe('y', [0, -d, dz], [[0, dr], [-I(.8), dr], [-I(.8), dr - I(.9)], [0, dr - I(.9)], [0, dr]], 40, { caps: false });
  gl.lathe('y', [0, -d, dz], [[-I(.6), dr - I(.9)], [I(.3), dr - I(1.4)], [I(1.4), I(3)], [I(1.6), 0]], 36);
  pn.rbox(-w / 2 + I(1.6), -d - I(.3), z0 + h - I(5.2), w / 2 - I(1.6), -d, z0 + h - I(1.2), I(.6), 0, 1);
  knob(ch, -I(7.5), -d - I(.3), z0 + h - I(3.2), I(1.3), I(.9));
  for (let i = 0; i < 3; i++) ch.cyl(I(2 + i * 3), -d - I(.15), I(.55), z0 + h - I(3.2), z0 + h - I(2.9), 10);
  return { w, d };
}
export function washerDryerStacked() {
  const M = new Model(), w = I(27), d = I(30), p = new Plan(EQ);
  laundryUnit(M, I(1), I(32), 'W'); laundryUnit(M, I(33.4), I(32), 'D');
  M.part('feet', C.rubber).box(-w / 2 + I(1), -d + I(2), 0, w / 2 - I(1), -I(2), I(1));
  p.rect('EQUIP', -w / 2, -d, w / 2, 0).line('EQUIP-DETAIL', -w / 2, -d + I(1), w / 2, -d + I(1)).text('EQUIP-DETAIL', -I(3), -d / 2, I(4), 'W/D').rect('CLEARANCE', -w / 2, -d - I(24), w / 2, -d);
  return makeItem(appliance({ name: 'Washer and dryer, stacked, front-loading, 27"', description: 'Front-loading washer with a dryer stacked above it, 27" wide, 30" deep, about 66" tall, each with a round glass door and its own controls. Washer needs hot and cold supply and a 2" standpipe; the dryer needs a 4" vent outdoors. Leave 24" in front.', ifc: { class: 'IfcElectricAppliance', predefined: 'WASHINGMACHINE' }, plan: p, model: M, plumb: { cw: '3/4"', hw: '3/4"', dd: '2"' }, elec: { volts: '240', phase: '1', amps: '30' } }));
}

export function washerTopLoad27() {
  const M = new Model(), w = I(27), d = I(27), h = I(38), wh = M.part('body', C.white), ch = M.part('trim', C.chrome), pn = M.part('panel', C.graphite), lid = M.part('lid', C.lightGray);
  wh.rbox(-w / 2, -d, I(.8), w / 2, 0, h, I(.8), I(.4), 2);
  M.part('feet', C.rubber).box(-w / 2 + I(1), -d + I(1), 0, w / 2 - I(1), -I(1), I(.8));
  pn.rbox(-w / 2, -I(5), h, w / 2, 0, h + I(4.4), I(.8), I(.3), 2);
  lid.rbox(-w / 2 + I(1.2), -d + I(1), h, w / 2 - I(1.2), -I(5.2), h + I(.7), I(1.6), I(.2), 2);
  lid.lathe('z', [0, -I(14.6), h + I(.7)], [[0, I(9)], [I(.4), I(9)], [I(.4), I(7.6)], [0, I(7.6)], [0, I(9)]], 36, { caps: false });
  for (const x of [-I(8), I(6)]) knob(ch, x, -I(1.8), h + I(2.4), I(1.3), I(.1)).lathe('z', [x, -I(2), h + I(4.4)], [[0, I(1.5)], [I(.7), I(1.4)], [I(.7), 0]], 16);
  const p = new Plan(EQ).rect('EQUIP', -w / 2, -d, w / 2, 0).circle('EQUIP-DETAIL', 0, -I(14.6), I(8.6)).text('EQUIP-DETAIL', -I(1.5), -I(24), I(3), 'W').rect('CLEARANCE', -w / 2, -d - I(24), w / 2, -d);
  return makeItem(appliance({ name: 'Washing machine, top-loading, 27"', description: 'Top-loading washing machine, 27" wide, 27" deep, 38" to the lid hinge and 42" with the control console, a lid over the tub and two dials. Hot and cold supply and a 2" standpipe; leave room above to lift the lid.', ifc: { class: 'IfcElectricAppliance', predefined: 'WASHINGMACHINE' }, plan: p, model: M, plumb: { cw: '3/4"', hw: '3/4"', dd: '2"' }, elec: { volts: '120', phase: '1', amps: '15' } }));
}

export function kitchenItems() {
  return [cooktopGas36(), cooktopInduction30(), wallOven(false), wallOven(true), hoodUnderCabinet30(), hoodIsland36(), fridgeSideBySide36(), fridgeTopFreezer30(), fridgeUndercounter24(), freezerChest48(), wineCooler24(),
    sinkFarmhouse33(), sinkBarRound15(), faucetKitchen(), disposer(), microwaveCounter24(), washerDryerStacked(), washerTopLoad27()];
}
