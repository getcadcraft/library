/* SPDX-License-Identifier: Apache-2.0 */
/**
 * items.js — the residential set: cabinets, vanities, appliances, plumbing fixtures and furniture, drawn by CadCraft from
 * common US residential sizes and shared under CC0 1.0. No DOM; tools/make-residential.mjs writes them as library items.
 *
 *   residentialItems() → [{ slug, item }]   item = "CadCraft library item" format 1, without uuid / version / license /
 *                                           provenance (the library adds those when it publishes the item)
 *
 * Conventions (the library format's): millimetres, Z up, the front faces −Y, the insertion point is the middle of the back
 * at the floor — so an item placed against a wall with BimCraft's wall snap has its back on the wall face. Things that
 * hang (wall cabinets, a microwave over the range, a range hood) or sit on a counter (sinks) carry their own height: the
 * body starts at its mounting height and the item's source attributes say so (CC-MOUNT-HEIGHT, mm). Plan layers follow the
 * library's layer-name convention: CASEWORK / EQUIP / FIXTURE / FURNITURE outlines, -DETAIL thin lines, -ABOVE dashed
 * (things overhead), CLEARANCE and SWING dotted. Sizes are common nominal sizes, not any maker's product.
 */
const IN = 25.4;
const r1 = (v) => Math.round(v * 10) / 10;

// ---------------------------------------------------------------------------------------------------------- meshes
class Mesh {
  constructor() { this.P = []; this.I = []; }
  /** A box from its two corners (mm). */
  box(x0, y0, z0, x1, y1, z1) {
    const b = this.P.length / 3;
    for (const z of [z0, z1]) for (const [x, y] of [[x0, y0], [x1, y0], [x1, y1], [x0, y1]]) this.P.push(r1(x), r1(y), r1(z));
    const f = [[0, 2, 1], [0, 3, 2], [4, 5, 6], [4, 6, 7], [0, 1, 5], [0, 5, 4], [1, 2, 6], [1, 6, 5], [2, 3, 7], [2, 7, 6], [3, 0, 4], [3, 4, 7]];
    for (const t of f) this.I.push(b + t[0], b + t[1], b + t[2]);
    return this;
  }
  /** A simple polygon (anticlockwise, plan mm) swept from z0 to z1. */
  prism(poly, z0, z1) {
    const n = poly.length, b = this.P.length / 3;
    for (const z of [z0, z1]) for (const [x, y] of poly) this.P.push(r1(x), r1(y), r1(z));
    const tri = earcut(poly);
    for (const [a, c, d] of tri) { this.I.push(b + a, b + d, b + c); this.I.push(b + n + a, b + n + c, b + n + d); }
    for (let i = 0; i < n; i++) { const j = (i + 1) % n; this.I.push(b + i, b + j, b + n + j, b + i, b + n + j, b + n + i); }
    return this;
  }
  cyl(cx, cy, r, z0, z1, seg = 20) { return this.prism(circle(cx, cy, r, seg), z0, z1); }
  ell(cx, cy, rx, ry, z0, z1, seg = 24) { return this.prism(ellipsePts(cx, cy, rx, ry, seg), z0, z1); }
  body() { return { type: 'mesh', positions: this.P, indices: this.I }; }
}
function circle(cx, cy, r, seg = 20) { return Array.from({ length: seg }, (_, i) => [cx + r * Math.cos(2 * Math.PI * i / seg), cy + r * Math.sin(2 * Math.PI * i / seg)]); }
function ellipsePts(cx, cy, rx, ry, seg = 24) { return Array.from({ length: seg }, (_, i) => [cx + rx * Math.cos(2 * Math.PI * i / seg), cy + ry * Math.sin(2 * Math.PI * i / seg)]); }
function rrect(x0, y0, x1, y1, r, seg = 4) {
  const out = [], c = [[x1 - r, y0 + r, -90], [x1 - r, y1 - r, 0], [x0 + r, y1 - r, 90], [x0 + r, y0 + r, 180]];
  for (const [cx, cy, a0] of c) for (let i = 0; i <= seg; i++) { const a = (a0 + 90 * i / seg) * Math.PI / 180; out.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); }
  return out;
}
/** Ear clipping for a simple anticlockwise polygon → triangles of indices. */
function earcut(P) {
  const idx = P.map((_, i) => i), out = [];
  const cr = (a, b, c) => (P[b][0] - P[a][0]) * (P[c][1] - P[a][1]) - (P[b][1] - P[a][1]) * (P[c][0] - P[a][0]);
  const inside = (p, a, b, c) => cr(a, b, p) >= 0 && cr(b, c, p) >= 0 && cr(c, a, p) >= 0;
  let guard = 0;
  while (idx.length > 3 && guard++ < 10000) {
    let cut = false;
    for (let i = 0; i < idx.length; i++) {
      const a = idx[(i + idx.length - 1) % idx.length], b = idx[i], c = idx[(i + 1) % idx.length];
      if (cr(a, b, c) <= 1e-9) continue;
      if (idx.some((p) => p !== a && p !== b && p !== c && inside(p, a, b, c))) continue;
      out.push([a, b, c]); idx.splice(i, 1); cut = true; break;
    }
    if (!cut) break;
  }
  if (idx.length === 3) out.push([idx[0], idx[1], idx[2]]);
  return out;
}

// ------------------------------------------------------------------------------------------------------------ plans
class Plan {
  constructor(layers) { this.layers = layers.map(([name, color]) => ({ name, color })); this.entities = []; }
  rect(layer, x0, y0, x1, y1) { return this.poly(layer, [[x0, y0], [x1, y0], [x1, y1], [x0, y1]], true); }
  poly(layer, pts, closed = false) { this.entities.push({ type: 'poly', layer, color: null, pts: pts.map(([x, y]) => [r1(x), r1(y)]), closed }); return this; }
  line(layer, x1, y1, x2, y2) { this.entities.push({ type: 'line', layer, color: null, x1: r1(x1), y1: r1(y1), x2: r1(x2), y2: r1(y2) }); return this; }
  circle(layer, x, y, r) { this.entities.push({ type: 'circle', layer, color: null, x: r1(x), y: r1(y), r: r1(r) }); return this; }
  arc(layer, x, y, r, a0, a1) { this.entities.push({ type: 'arc', layer, color: null, x: r1(x), y: r1(y), r: r1(r), a0, a1 }); return this; }
  ellipse(layer, cx, cy, rx, ry) { const major = rx >= ry; this.entities.push({ type: 'ellipse', layer, color: null, cx: r1(cx), cy: r1(cy), mx: r1(major ? rx : 0), my: r1(major ? 0 : ry), ratio: Math.round((major ? ry / rx : rx / ry) * 1e4) / 1e4, t0: 0, t1: 360 }); return this; }
  text(layer, x, y, h, value) { this.entities.push({ type: 'text', layer, color: null, x: r1(x), y: r1(y), h: r1(h), rot: 0, value }); return this; }
  out() { return { layers: this.layers, entities: this.entities }; }
}
const fmtIn = (mm) => { const v = Math.round(mm / IN * 8) / 8; const w = Math.floor(v), f = v - w; const fr = { 0: '', 0.25: '¼', 0.5: '½', 0.75: '¾', 0.125: '⅛', 0.375: '⅜', 0.625: '⅝', 0.875: '⅞' }[f] ?? ''; return (w || !fr ? String(w) : '') + fr + '"'; };
const slugify = (s) => String(s).normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/×/g, 'x').replace(/[″"]/g, '-in').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

function item({ name, kind, category, description, ifc, plan, body, w, d, h, clearances, attrs = {}, remarks, elec, plumb }) {
  const it = { format: 'cadcraft-library-item', format_version: 1, name, kind, category, description, maker: '', model: '', ifc, plan: plan.out(), body };
  if (clearances?.length) it.clearances = clearances;
  it.params = { width: r1(w), depth: r1(d), height: r1(h) };
  if (remarks) it.params.remarks = remarks;
  if (elec) it.params.elec = elec;
  if (plumb) it.params.plumb = plumb;
  it.source_attrs = { 'CC-SET': 'Residential', ...attrs };
  return it;
}

// ---------------------------------------------------------------------------------------------------------- casework
const CASE_LAYERS = [['CASEWORK', 7], ['CASEWORK-DETAIL', 8], ['CASEWORK-ABOVE', 4], ['CASEWORK-CENTER', 1]];
const TOE_H = 4.5 * IN, TOE_D = 3 * IN, BASE_H = 34.5 * IN, BASE_D = 24 * IN, DOOR = 0.75 * IN, GAP = 0.125 * IN;
/** Door fronts on the face plane y = yf (front, −Y): `panels` = [[x0, x1, z0, z1]…] as thin boxes proud of the box. */
function fronts(m, yf, panels) { for (const [x0, x1, z0, z1] of panels) m.box(x0 + GAP / 2, yf - DOOR, z0 + GAP / 2, x1 - GAP / 2, yf, z1 - GAP / 2); }
function doorsAcross(x0, x1, z0, z1, n) { const out = [], w = (x1 - x0) / n; for (let i = 0; i < n; i++) out.push([x0 + w * i, x0 + w * (i + 1), z0, z1]); return out; }

function baseCabinet(wIn, style) {
  const w = wIn * IN, x0 = -w / 2, x1 = w / 2, y = -BASE_D;
  const m = new Mesh().box(x0, y + TOE_D, 0, x1, 0, TOE_H).box(x0, y + DOOR, TOE_H, x1, 0, BASE_H);
  const doors = wIn <= 21 ? 1 : 2;
  const drawerZ = BASE_H - 6 * IN;
  let code, name, desc;
  if (style === 'drawers') {
    const z = [TOE_H, TOE_H + 11 * IN, TOE_H + 20.5 * IN, BASE_H];
    fronts(m, y + DOOR, [[x0, x1, z[0], z[1]], [x0, x1, z[1], z[2]], [x0, x1, z[2], z[3]]]);
    code = 'DB' + wIn; name = `Three-drawer base cabinet ${wIn}" (${code})`; desc = `Base cabinet with three drawers, ${wIn}" wide, 24" deep, 34½" tall with a 4½" toe kick (a counter top brings it to 36").`;
  } else if (style === 'sink') {
    fronts(m, y + DOOR, [[x0, x1, drawerZ, BASE_H], ...doorsAcross(x0, x1, TOE_H, drawerZ, 2)]);
    code = 'SB' + wIn; name = `Sink base cabinet ${wIn}" (${code})`; desc = `Sink base cabinet, ${wIn}" wide, 24" deep, 34½" tall: two doors under a false drawer front, open inside for the sink and its plumbing.`;
  } else {
    fronts(m, y + DOOR, [...doorsAcross(x0, x1, drawerZ, BASE_H, doors), ...doorsAcross(x0, x1, TOE_H, drawerZ, doors)]);
    code = 'B' + wIn; name = `Base cabinet ${wIn}" (${code})`; desc = `Base cabinet, ${wIn}" wide, 24" deep, 34½" tall with a 4½" toe kick: ${doors === 1 ? 'one door' : 'two doors'} under ${doors === 1 ? 'a drawer' : 'drawers'}.`;
  }
  const p = new Plan(CASE_LAYERS).rect('CASEWORK', x0, y, x1, 0).line('CASEWORK-DETAIL', x0, y + DOOR, x1, y + DOOR);
  if (style === 'sink') p.rect('CASEWORK-DETAIL', x0 + 2 * IN, y + 3 * IN, x1 - 2 * IN, -3 * IN);
  return { code, item: item({ name, kind: 'furniture', category: 'casework/base', description: desc, ifc: { class: 'IfcFurniture' }, plan: p, body: m.body(), w, d: BASE_D, h: BASE_H, attrs: { 'CC-CASEWORK': code, 'CC-COUNTER-READY': 'yes' } }) };
}
function cornerBase(kind) {
  // a 36" × 36" lazy susan corner (an L of two 24"-deep runs), or a 42" blind corner (one run, a filler side)
  if (kind === 'susan') {
    const s = 36 * IN, dd = BASE_D;
    // L footprint: back along the wall at y = 0 (x from −s/2 to s/2) and down the left wall (x = −s/2)
    const L = [[-s / 2, -s], [-s / 2 + dd, -s], [-s / 2 + dd, -dd], [s / 2, -dd], [s / 2, 0], [-s / 2, 0]];
    const m = new Mesh().prism(L, TOE_H, BASE_H).prism([[-s / 2, -s + TOE_D], [-s / 2 + dd - TOE_D, -s + TOE_D], [-s / 2 + dd - TOE_D, -dd + TOE_D], [s / 2, -dd + TOE_D], [s / 2, 0], [-s / 2, 0]], 0, TOE_H);
    const ix = -s / 2 + dd, iy = -dd;
    m.box(ix - DOOR, iy - DOOR, TOE_H + GAP, ix + 12 * IN, iy, BASE_H - GAP).box(ix - DOOR, iy - 12 * IN, TOE_H + GAP, ix, iy, BASE_H - GAP);
    const p = new Plan(CASE_LAYERS).poly('CASEWORK', L, true).arc('CASEWORK-DETAIL', -s / 2 + 4 * IN, -4 * IN, 14 * IN, 270, 360);
    return item({ name: 'Lazy susan corner base cabinet 36" (LS36)', kind: 'furniture', category: 'casework/base', description: 'Corner base cabinet for an inside corner, 36" along each wall, 24" deep, 34½" tall, with a revolving lazy susan behind a bifold door. Its back sits on one wall; the other run starts at its side.', ifc: { class: 'IfcFurniture' }, plan: p, body: m.body(), w: s, d: s, h: BASE_H, attrs: { 'CC-CASEWORK': 'LS36', 'CC-COUNTER-READY': 'yes', 'CC-FOOTPRINT': 'L ' + r1(dd) } });
  }
  const w = 42 * IN, x0 = -w / 2, x1 = w / 2, y = -BASE_D;
  const m = new Mesh().box(x0, y + TOE_D, 0, x1, 0, TOE_H).box(x0, y + DOOR, TOE_H, x1, 0, BASE_H);
  fronts(m, y + DOOR, [[x1 - 18 * IN, x1, BASE_H - 6 * IN, BASE_H], [x1 - 18 * IN, x1, TOE_H, BASE_H - 6 * IN]]);
  const p = new Plan(CASE_LAYERS).rect('CASEWORK', x0, y, x1, 0).line('CASEWORK-DETAIL', x1 - 18 * IN, y + DOOR, x1, y + DOOR).line('CASEWORK-DETAIL', x0, y + DOOR, x1 - 18 * IN, y + DOOR);
  return item({ name: 'Blind corner base cabinet 42" (BBC42)', kind: 'furniture', category: 'casework/base', description: 'Blind corner base cabinet, 42" wide, 24" deep, 34½" tall: an 18" door at its right; its blind left end runs into the corner under the other run.', ifc: { class: 'IfcFurniture' }, plan: p, body: m.body(), w, d: BASE_D, h: BASE_H, attrs: { 'CC-CASEWORK': 'BBC42', 'CC-COUNTER-READY': 'yes' } });
}
const WALL_D = 12 * IN, WALL_BOTTOM = 54 * IN;
function wallCabinet(wIn, hIn, bottomIn = 54) {
  const w = wIn * IN, h = hIn * IN, z0 = bottomIn * IN, x0 = -w / 2, x1 = w / 2, y = -WALL_D;
  const m = new Mesh().box(x0, y + DOOR, z0, x1, 0, z0 + h);
  fronts(m, y + DOOR, doorsAcross(x0, x1, z0, z0 + h, wIn <= 21 ? 1 : 2));
  const code = 'W' + wIn + hIn;
  const p = new Plan(CASE_LAYERS).rect('CASEWORK-ABOVE', x0, y, x1, 0).line('CASEWORK-ABOVE', x0, y, x1, 0).line('CASEWORK-ABOVE', x1, y, x0, 0);
  return item({ name: `Wall cabinet ${wIn}" × ${hIn}" (${code})`, kind: 'furniture', category: 'casework/wall', description: `Wall cabinet, ${wIn}" wide, 12" deep, ${hIn}" tall, hung with its bottom ${bottomIn}" above the floor (the item carries that height: place it at the floor against the wall).`, ifc: { class: 'IfcFurniture' }, plan: p, body: m.body(), w, d: WALL_D, h, attrs: { 'CC-CASEWORK': code, 'CC-MOUNT-HEIGHT': String(Math.round(z0)) }, remarks: `Bottom ${bottomIn}" above the floor.` });
}
function cornerWall() {
  const s = 24 * IN, z0 = WALL_BOTTOM, h = 30 * IN, dd = WALL_D;
  const L = [[-s / 2, -s], [-s / 2 + dd, -s], [-s / 2 + dd, -dd], [s / 2, -dd], [s / 2, 0], [-s / 2, 0]];
  const m = new Mesh().prism(L, z0, z0 + h);
  const p = new Plan(CASE_LAYERS).poly('CASEWORK-ABOVE', L, true);
  return item({ name: 'Corner wall cabinet 24" × 30" (WC2430)', kind: 'furniture', category: 'casework/wall', description: 'Corner wall cabinet for an inside corner, 24" along each wall, 12" deep, 30" tall, its bottom 54" above the floor (the item carries that height).', ifc: { class: 'IfcFurniture' }, plan: p, body: m.body(), w: s, d: s, h, attrs: { 'CC-CASEWORK': 'WC2430', 'CC-MOUNT-HEIGHT': String(Math.round(z0)) }, remarks: 'Bottom 54" above the floor.' });
}
function tallCabinet(wIn, hIn, oven = false) {
  const w = wIn * IN, h = hIn * IN, x0 = -w / 2, x1 = w / 2, y = -BASE_D;
  const m = new Mesh().box(x0, y + TOE_D, 0, x1, 0, TOE_H).box(x0, y + DOOR, TOE_H, x1, 0, h);
  if (oven) fronts(m, y + DOOR, [[x0, x1, TOE_H, TOE_H + 24 * IN], [x0, x1, h - 15 * IN, h]]);
  else fronts(m, y + DOOR, [...doorsAcross(x0, x1, TOE_H, TOE_H + 48 * IN, wIn <= 21 ? 1 : 2), ...doorsAcross(x0, x1, TOE_H + 48 * IN, h, wIn <= 21 ? 1 : 2)]);
  const code = (oven ? 'OV' : 'U') + wIn + hIn;
  const p = new Plan(CASE_LAYERS).rect('CASEWORK', x0, y, x1, 0).line('CASEWORK-DETAIL', x0, y, x1, 0).line('CASEWORK-DETAIL', x1, y, x0, 0);
  if (oven) p.rect('CASEWORK-DETAIL', x0 + 1.5 * IN, y + DOOR, x1 - 1.5 * IN, y + 3 * IN);
  const name = oven ? `Oven cabinet ${wIn}" × ${hIn}" (${code})` : `Tall pantry cabinet ${wIn}" × ${hIn}" (${code})`;
  const desc = oven ? `Tall cabinet for a ${wIn - 3}" wall oven, ${wIn}" wide, 24" deep, ${hIn}" tall: a drawer under the oven opening, a door above.` : `Tall pantry cabinet, ${wIn}" wide, 24" deep, ${hIn}" tall, with doors top and bottom.`;
  return item({ name, kind: 'furniture', category: 'casework/tall', description: desc, ifc: { class: 'IfcFurniture' }, plan: p, body: m.body(), w, d: BASE_D, h, attrs: { 'CC-CASEWORK': code } });
}
function vanity(wIn, sinks = 1) {
  const w = wIn * IN, d = 21 * IN, h = 34.5 * IN, top = 0.75 * IN, x0 = -w / 2, x1 = w / 2, y = -d;
  const m = new Mesh().box(x0, y + TOE_D, 0, x1, 0, TOE_H).box(x0, y + DOOR, TOE_H, x1, 0, h - top).box(x0 - 0.5 * IN, y - 1 * IN, h - top, x1 + 0.5 * IN, 0, h);
  fronts(m, y + DOOR, doorsAcross(x0, x1, TOE_H, h - top - 1 * IN, wIn >= 30 ? (sinks === 2 ? 4 : 2) : 1));
  const p = new Plan([['CASEWORK', 7], ['CASEWORK-DETAIL', 8], ['FIXTURE', 7], ['FIXTURE-DETAIL', 8]]).rect('CASEWORK', x0 - 0.5 * IN, y - 1 * IN, x1 + 0.5 * IN, 0);
  const cx = sinks === 2 ? [-w / 4, w / 4] : [0];
  for (const c of cx) {
    p.ellipse('FIXTURE', c, y + d / 2 - 0.5 * IN, 8.5 * IN, 6.5 * IN).circle('FIXTURE-DETAIL', c, y + d / 2 - 0.5 * IN, 0.75 * IN).circle('FIXTURE-DETAIL', c, -2 * IN, 0.6 * IN);
    m.ell(c, y + d / 2 - 0.5 * IN, 8.5 * IN, 6.5 * IN, h - 6 * IN, h + 0.1);
  }
  const code = (sinks === 2 ? 'VD' : 'V') + wIn + '21';
  return item({ name: `Bathroom vanity ${wIn}"${sinks === 2 ? ' with two sinks' : ''} (${code})`, kind: 'fixture', category: 'casework/base', description: `Bathroom vanity, ${wIn}" wide, 21" deep, 34½" tall, with its top and ${sinks === 2 ? 'two oval sinks' : 'an oval sink'} (17" × 13").`, ifc: { class: 'IfcSanitaryTerminal', predefined: 'WASHHANDBASIN' }, plan: p, body: m.body(), w: w + IN, d: d + IN, h, attrs: { 'CC-CASEWORK': code }, plumb: { cw: '1/2"', hw: '1/2"', dd: '1-1/4"' } });
}

// ---------------------------------------------------------------------------------------------------------- appliances
const EQ_LAYERS = [['EQUIP', 7], ['EQUIP-DETAIL', 8], ['EQUIP-ABOVE', 4], ['SWING', 3], ['CLEARANCE', 3]];
function fridge(wIn) {
  const w = wIn * IN, d = 30 * IN, h = 70 * IN, x0 = -w / 2, x1 = w / 2, y = -d;
  const m = new Mesh().box(x0, y + 2 * IN, 0, x1, 0, h).box(x0, y, h * 0.36 + GAP, 0 - GAP / 2, y + 2 * IN, h).box(GAP / 2, y, h * 0.36 + GAP, x1, y + 2 * IN, h).box(x0, y, 1 * IN, x1, y + 2 * IN, h * 0.36);
  const p = new Plan(EQ_LAYERS).rect('EQUIP', x0, y, x1, 0).line('EQUIP-DETAIL', x0, y + 2 * IN, x1, y + 2 * IN).line('EQUIP-DETAIL', 0, y, 0, y + 2 * IN).text('EQUIP-DETAIL', -4 * IN, y + d / 2, 3 * IN, 'REF')
    .arc('SWING', x0, y, w / 2, 270, 360).arc('SWING', x1, y, w / 2, 180, 270);
  return item({ name: `Refrigerator ${wIn}" (French door)`, kind: 'equipment', category: 'appliances/residential', description: `French-door refrigerator with a bottom freezer drawer, ${wIn}" wide, 30" deep with its doors, 70" tall. Leave about 1" above and at the back for air.`, ifc: { class: 'IfcElectricAppliance', predefined: 'FRIDGE_FREEZER' }, plan: p, body: m.body(), w, d, h, clearances: [{ name: 'Doors open', x: x0, y: y - w / 2, z: 0, w, d: w / 2, h }], elec: { volts: '115', phase: '1', amps: '15' }, plumb: { cw: '1/4"' } });
}
function range(wIn) {
  const w = wIn * IN, d = 26 * IN, h = 36 * IN, x0 = -w / 2, x1 = w / 2, y = -d;
  const m = new Mesh().box(x0, y + 1 * IN, 0, x1, 0, h).box(x0, -3 * IN, h, x1, 0, h + 6 * IN).box(x0 + 1 * IN, y, 6 * IN, x1 - 1 * IN, y + 1 * IN, h - 6 * IN);
  const p = new Plan(EQ_LAYERS).rect('EQUIP', x0, y, x1, 0).line('EQUIP-DETAIL', x0, -3 * IN, x1, -3 * IN);
  const n = wIn >= 36 ? 3 : 2;
  for (let i = 0; i < n; i++) for (const yy of [y + 7 * IN, -10 * IN]) p.circle('EQUIP-DETAIL', x0 + w * (i + 0.5) / n, yy, (i === 0 && yy < -12 * IN ? 4.5 : 3.5) * IN);
  return item({ name: `Range ${wIn}" (freestanding)`, kind: 'equipment', category: 'appliances/residential', description: `Freestanding range, ${wIn}" wide, 26" deep, 36" to the cooktop, with a 6" back guard: ${n * 2} burners over an oven.`, ifc: { class: 'IfcElectricAppliance', predefined: 'ELECTRICCOOKER' }, plan: p, body: m.body(), w, d, h: h + 6 * IN, clearances: [{ name: 'Oven door open', x: x0, y: y - 20 * IN, z: 0, w, d: 20 * IN, h: 20 * IN }], elec: { volts: '240', phase: '1', amps: '40' } });
}
function dishwasher() {
  const w = 24 * IN, d = 24 * IN, h = 34.5 * IN, x0 = -w / 2, x1 = w / 2, y = -d;
  const m = new Mesh().box(x0, y + 1 * IN, 0, x1, 0, h).box(x0 + GAP, y, 4 * IN, x1 - GAP, y + 1 * IN, h - GAP);
  const p = new Plan(EQ_LAYERS).rect('EQUIP', x0, y, x1, 0).text('EQUIP-DETAIL', -2.5 * IN, y + d / 2, 3 * IN, 'DW').rect('CLEARANCE', x0, y - 24 * IN, x1, y);
  return item({ name: 'Dishwasher 24" (built-in)', kind: 'equipment', category: 'appliances/residential', description: 'Built-in dishwasher, 24" wide, 24" deep, 34½" tall, under the counter. Its door drops down 24" in front.', ifc: { class: 'IfcElectricAppliance', predefined: 'DISHWASHER' }, plan: p, body: m.body(), w, d, h, clearances: [{ name: 'Door open', x: x0, y: y - 24 * IN, z: 0, w, d: 24 * IN, h: 8 * IN }], elec: { volts: '115', phase: '1', amps: '15' }, plumb: { hw: '3/8"', dd: '5/8"' } });
}
function overRange(kind, wIn) {
  const w = wIn * IN, x0 = -w / 2, x1 = w / 2;
  if (kind === 'micro') {
    const d = 15 * IN, h = 17 * IN, z0 = 66 * IN, y = -d;
    const m = new Mesh().box(x0, y, z0, x1, 0, z0 + h);
    const p = new Plan(EQ_LAYERS).rect('EQUIP-ABOVE', x0, y, x1, 0).text('EQUIP-DETAIL', -3 * IN, y + d / 2, 2.5 * IN, 'MW');
    return item({ name: `Over-the-range microwave ${wIn}"`, kind: 'equipment', category: 'appliances/residential', description: `Microwave with a vent fan for over a range, ${wIn}" wide, 15" deep, 17" tall, its bottom 66" above the floor (the item carries that height).`, ifc: { class: 'IfcElectricAppliance', predefined: 'MICROWAVE' }, plan: p, body: m.body(), w, d, h, attrs: { 'CC-MOUNT-HEIGHT': String(Math.round(z0)) }, elec: { volts: '115', phase: '1', amps: '20' }, remarks: 'Bottom 66" above the floor.' });
  }
  const d = 20 * IN, z0 = 66 * IN, y = -d;
  const m = new Mesh().prism([[x0, y], [x1, y], [x1, 0], [x0, 0]], z0, z0 + 6 * IN).box(-5 * IN, -10 * IN, z0 + 6 * IN, 5 * IN, 0, 96 * IN);
  const p = new Plan(EQ_LAYERS).rect('EQUIP-ABOVE', x0, y, x1, 0).rect('EQUIP-ABOVE', -5 * IN, -10 * IN, 5 * IN, 0);
  return item({ name: `Range hood ${wIn}" (wall chimney)`, kind: 'equipment', category: 'appliances/residential', description: `Wall-mounted chimney range hood, ${wIn}" wide, 20" deep, its bottom 66" above the floor (30" over a 36" range), the chimney up to 8'.`, ifc: { class: 'IfcElectricAppliance', predefined: 'USERDEFINED' }, plan: p, body: m.body(), w, d, h: 96 * IN - z0, attrs: { 'CC-MOUNT-HEIGHT': String(Math.round(z0)) }, elec: { volts: '115', phase: '1', amps: '15' }, remarks: 'Bottom 66" above the floor; ducted outside.' });
}
function laundry(kind) {
  const w = 27 * IN, d = 31 * IN, h = 39 * IN, x0 = -w / 2, x1 = w / 2, y = -d;
  const m = new Mesh().box(x0, y + 1 * IN, 0, x1, 0, h).box(x0, -6 * IN, h - 6 * IN, x1, 0, h).box(-8 * IN, y, 10 * IN, 8 * IN, y + 1 * IN, 26 * IN);
  const label = kind === 'washer' ? 'W' : 'D';
  const p = new Plan(EQ_LAYERS).rect('EQUIP', x0, y, x1, 0).text('EQUIP-DETAIL', -1 * IN, y + d / 2, 4 * IN, label).rect('CLEARANCE', x0, y - 24 * IN, x1, y);
  const name = kind === 'washer' ? 'Washing machine 27" (front-loading)' : 'Clothes dryer 27" (front-loading)';
  const desc = kind === 'washer' ? 'Front-loading washing machine, 27" wide, 31" deep, 39" tall. Leave 24" in front to load it.' : 'Front-loading clothes dryer, 27" wide, 31" deep, 39" tall, vented outside. Leave 24" in front to load it.';
  return item({ name, kind: 'equipment', category: 'appliances/residential', description: desc, ifc: { class: 'IfcElectricAppliance', predefined: kind === 'washer' ? 'WASHINGMACHINE' : 'TUMBLEDRYER' }, plan: p, body: m.body(), w, d, h, clearances: [{ name: 'Loading', x: x0, y: y - 24 * IN, z: 0, w, d: 24 * IN, h }], elec: kind === 'washer' ? { volts: '115', phase: '1', amps: '20' } : { volts: '240', phase: '1', amps: '30' }, plumb: kind === 'washer' ? { cw: '1/2"', hw: '1/2"', dd: '2"' } : {} });
}
function waterHeater() {
  const r = 11 * IN, h = 60 * IN;
  const m = new Mesh().cyl(0, -r, r, 0, h).cyl(0, -r, 1.5 * IN, h, h + 6 * IN, 12);
  const p = new Plan(EQ_LAYERS).circle('EQUIP', 0, -r, r).circle('EQUIP-DETAIL', 0, -r, 1.5 * IN).text('EQUIP-DETAIL', -3 * IN, -r - 6 * IN, 2.5 * IN, 'WH').rect('CLEARANCE', -r, -2 * r - 30 * IN, r, -2 * r);
  return item({ name: 'Water heater 50 gal (tank)', kind: 'equipment', category: 'plumbing/equipment', description: 'Tank water heater, 50 US gallons, 22" across, 60" tall, with its flue. Leave 30" in front to service it.', ifc: { class: 'IfcBuildingElementProxy' }, plan: p, body: m.body(), w: 2 * r, d: 2 * r, h: h + 6 * IN, clearances: [{ name: 'Service', x: -r, y: -2 * r - 30 * IN, z: 0, w: 2 * r, d: 30 * IN, h }], plumb: { cw: '3/4"', hw: '3/4"', gas: '1/2"' } });
}

// ------------------------------------------------------------------------------------------------------- plumbing
const FX_LAYERS = [['FIXTURE', 7], ['FIXTURE-DETAIL', 8], ['CLEARANCE', 3]];
function toilet() {
  const tw = 20 * IN, td = 8 * IN, bowlRx = 7.25 * IN, bowlRy = 9.75 * IN;
  const by = -td - bowlRy - 1 * IN;
  const m = new Mesh().box(-tw / 2, -td, 15 * IN, tw / 2, 0, 30 * IN).ell(0, by, bowlRx, bowlRy, 0, 15 * IN).box(-5 * IN, -td - 4 * IN, 0, 5 * IN, -td + 1, 15 * IN);
  const p = new Plan(FX_LAYERS).rect('FIXTURE', -tw / 2, -td, tw / 2, 0).ellipse('FIXTURE', 0, by, bowlRx, bowlRy).ellipse('FIXTURE-DETAIL', 0, by + 0.5 * IN, bowlRx - 1.5 * IN, bowlRy - 2 * IN).rect('CLEARANCE', -15 * IN, by - bowlRy - 21 * IN, 15 * IN, by - bowlRy);
  return item({ name: 'Toilet (elongated bowl)', kind: 'fixture', category: 'plumbing/fixtures', description: 'Two-piece toilet with an elongated bowl, 20" wide, 30" from the wall, 30" tall; drain 12" from the finished wall. Keep 15" from its centre to a side wall and 21" clear in front.', ifc: { class: 'IfcSanitaryTerminal', predefined: 'TOILETPAN' }, plan: p, body: m.body(), w: tw, d: -(by - bowlRy), h: 30 * IN, clearances: [{ name: 'In front', x: -15 * IN, y: by - bowlRy - 21 * IN, z: 0, w: 30 * IN, d: 21 * IN, h: 30 * IN }], plumb: { cw: '3/8"', dd: '3"' } });
}
function pedestal() {
  const w = 24 * IN, d = 19 * IN, h = 34 * IN;
  const m = new Mesh().cyl(0, -8 * IN, 3.5 * IN, 0, 28 * IN, 16).prism(rrect(-w / 2, -d, w / 2, 0, 3 * IN), 28 * IN, h);
  const p = new Plan(FX_LAYERS).poly('FIXTURE', rrect(-w / 2, -d, w / 2, 0, 3 * IN), true).ellipse('FIXTURE-DETAIL', 0, -d / 2 - 1 * IN, 8 * IN, 6 * IN).circle('FIXTURE-DETAIL', 0, -2.5 * IN, 0.6 * IN);
  return item({ name: 'Pedestal lavatory 24"', kind: 'fixture', category: 'plumbing/fixtures', description: 'Pedestal lavatory (bathroom sink on a column), 24" wide, 19" deep, 34" to its rim.', ifc: { class: 'IfcSanitaryTerminal', predefined: 'WASHHANDBASIN' }, plan: p, body: m.body(), w, d, h, plumb: { cw: '1/2"', hw: '1/2"', dd: '1-1/4"' } });
}
function kitchenSink(bowls) {
  const w = (bowls === 2 ? 33 : 25) * IN, d = 22 * IN, top = 36 * IN, depth = 9 * IN, y = -d - 1.5 * IN;   // set 1½" in from the counter's back edge
  const m = new Mesh().box(-w / 2, y, top - 0.25 * IN, w / 2, y + d, top);
  const p = new Plan(FX_LAYERS).poly('FIXTURE', rrect(-w / 2, y, w / 2, y + d, 1 * IN), true);
  const inner = bowls === 2 ? [[-w / 2 + 1.5 * IN, -0.75 * IN], [0.75 * IN, w / 2 - 1.5 * IN]] : [[-w / 2 + 1.5 * IN, w / 2 - 1.5 * IN]];
  for (const [a, b] of inner) {
    p.poly('FIXTURE-DETAIL', rrect(a, y + 1.5 * IN, b, y + d - 3 * IN, 1.5 * IN), true).circle('FIXTURE-DETAIL', (a + b) / 2, y + d / 2 - 1 * IN, 1.75 * IN);
    m.box(a, y + 1.5 * IN, top - depth, b, y + d - 3 * IN, top - 0.25 * IN);
  }
  p.circle('FIXTURE-DETAIL', 0, y + d - 1.5 * IN, 0.75 * IN);
  return item({ name: bowls === 2 ? 'Kitchen sink 33" (double bowl, drop-in)' : 'Kitchen sink 25" (single bowl, drop-in)', kind: 'fixture', category: 'plumbing/fixtures', description: `Drop-in kitchen sink, ${w / IN}" × 22", ${bowls === 2 ? 'two bowls' : 'one bowl'} 9" deep, its rim on a 36" counter (the item carries that height: place it at the floor, its back 1½" from the wall, over a sink base cabinet).`, ifc: { class: 'IfcSanitaryTerminal', predefined: 'SINK' }, plan: p, body: m.body(), w, d: d + 1.5 * IN, h: top, attrs: { 'CC-MOUNT-HEIGHT': String(Math.round(top - depth)) }, plumb: { cw: '1/2"', hw: '1/2"', dd: '1-1/2"' }, remarks: 'Rim 36" above the floor.' });
}
function bathtub() {
  const w = 60 * IN, d = 30 * IN, h = 20 * IN;
  const m = new Mesh().box(-w / 2, -d, 0, w / 2, 0, 2 * IN).prism([[-w / 2, -d], [w / 2, -d], [w / 2, 0], [-w / 2, 0]], 2 * IN, h);
  const p = new Plan(FX_LAYERS).rect('FIXTURE', -w / 2, -d, w / 2, 0).poly('FIXTURE-DETAIL', rrect(-w / 2 + 3 * IN, -d + 3 * IN, w / 2 - 3 * IN, -3 * IN, 6 * IN), true).circle('FIXTURE-DETAIL', -w / 2 + 8 * IN, -d / 2, 1.25 * IN);
  return item({ name: 'Bathtub 60" × 30" (alcove)', kind: 'fixture', category: 'plumbing/fixtures', description: 'Alcove bathtub with an apron front, 60" long, 30" deep, 20" tall, drain at the left end — for a 5\' alcove between two walls.', ifc: { class: 'IfcSanitaryTerminal', predefined: 'BATH' }, plan: p, body: m.body(), w, d, h, plumb: { cw: '1/2"', hw: '1/2"', dd: '1-1/2"' } });
}
function shower(wIn, dIn) {
  const w = wIn * IN, d = dIn * IN;
  const m = new Mesh().box(-w / 2, -d, 0, w / 2, 0, 4 * IN).box(-w / 2, -d, 4 * IN, -w / 2 + 0.375 * IN, 0, 78 * IN);
  const p = new Plan(FX_LAYERS).rect('FIXTURE', -w / 2, -d, w / 2, 0).line('FIXTURE-DETAIL', -w / 2, -d, w / 2, 0).line('FIXTURE-DETAIL', w / 2, -d, -w / 2, 0).circle('FIXTURE-DETAIL', 0, -d / 2, 1.5 * IN);
  return item({ name: `Shower ${wIn}" × ${dIn}" (base and glass)`, kind: 'fixture', category: 'plumbing/fixtures', description: `Shower base ${wIn}" × ${dIn}", 4" curb, with a 78" glass panel on its left side; drain in the middle.`, ifc: { class: 'IfcSanitaryTerminal', predefined: 'SHOWER' }, plan: p, body: m.body(), w, d, h: 78 * IN, plumb: { cw: '1/2"', hw: '1/2"', dd: '2"' } });
}
function laundrySink() {
  const w = 24 * IN, d = 22 * IN, h = 34 * IN;
  const m = new Mesh().box(-w / 2, -d, 22 * IN, w / 2, 0, h);
  for (const [x, y] of [[-w / 2 + 1 * IN, -d + 1 * IN], [w / 2 - 1 * IN, -d + 1 * IN], [w / 2 - 1 * IN, -1 * IN], [-w / 2 + 1 * IN, -1 * IN]]) m.cyl(x, y, 0.75 * IN, 0, 22 * IN, 8);
  const p = new Plan(FX_LAYERS).rect('FIXTURE', -w / 2, -d, w / 2, 0).poly('FIXTURE-DETAIL', rrect(-w / 2 + 2 * IN, -d + 2 * IN, w / 2 - 2 * IN, -4 * IN, 2 * IN), true).circle('FIXTURE-DETAIL', 0, -d / 2 - 1 * IN, 1.5 * IN);
  return item({ name: 'Laundry sink 24" (utility tub)', kind: 'fixture', category: 'plumbing/fixtures', description: 'Freestanding utility tub on legs, 24" wide, 22" deep, 34" to its rim.', ifc: { class: 'IfcSanitaryTerminal', predefined: 'SINK' }, plan: p, body: m.body(), w, d, h, plumb: { cw: '1/2"', hw: '1/2"', dd: '1-1/2"' } });
}

// ------------------------------------------------------------------------------------------------------- furniture
const FU_LAYERS = [['FURNITURE', 7], ['FURNITURE-DETAIL', 8]];
function sofa(wIn, name) {
  const w = wIn * IN, d = 36 * IN, h = 34 * IN, arm = 6 * IN, back = 8 * IN;
  const m = new Mesh().box(-w / 2, -d, 0, w / 2, 0, 17 * IN).box(-w / 2, -back, 17 * IN, w / 2, 0, h).box(-w / 2, -d, 17 * IN, -w / 2 + arm, 0, 25 * IN).box(w / 2 - arm, -d, 17 * IN, w / 2, 0, 25 * IN);
  const p = new Plan(FU_LAYERS).rect('FURNITURE', -w / 2, -d, w / 2, 0).line('FURNITURE-DETAIL', -w / 2 + arm, -back, w / 2 - arm, -back).line('FURNITURE-DETAIL', -w / 2 + arm, -d, -w / 2 + arm, -back).line('FURNITURE-DETAIL', w / 2 - arm, -d, w / 2 - arm, -back);
  const seats = wIn >= 72 ? 3 : wIn >= 50 ? 2 : 1;
  for (let i = 1; i < seats; i++) { const x = -w / 2 + arm + (w - 2 * arm) * i / seats; p.line('FURNITURE-DETAIL', x, -d, x, -back); }
  return item({ name: `${name} ${wIn}"`, kind: 'furniture', category: 'furniture/seating', description: `${name}, ${wIn}" wide, 36" deep, 34" tall, seat 17" high, ${seats === 1 ? 'one seat' : seats + ' seats'}.`, ifc: { class: 'IfcFurniture' }, plan: p, body: m.body(), w, d, h });
}
function table(kind, wIn, dIn, hIn = 30) {
  const w = wIn * IN, d = dIn * IN, h = hIn * IN, top = 1.25 * IN;
  const m = new Mesh();
  const p = new Plan(FU_LAYERS);
  let name, desc, cat = 'furniture/tables';
  if (kind === 'round') {
    m.cyl(0, -w / 2, w / 2, h - top, h, 32).cyl(0, -w / 2, 3 * IN, 0, h - top, 12).cyl(0, -w / 2, 10 * IN, 0, 1 * IN, 16);
    p.circle('FURNITURE', 0, -w / 2, w / 2);
    name = `Round dining table ${wIn}"`; desc = `Round dining table on a pedestal, ${wIn}" across, ${hIn}" tall, seats four.`;
  } else {
    m.box(-w / 2, -d, h - top, w / 2, 0, h);
    for (const [x, y] of [[-w / 2 + 2 * IN, -d + 2 * IN], [w / 2 - 4 * IN, -d + 2 * IN], [w / 2 - 4 * IN, -4 * IN], [-w / 2 + 2 * IN, -4 * IN]]) m.box(x, y, 0, x + 2 * IN, y + 2 * IN, h - top);
    p.rect('FURNITURE', -w / 2, -d, w / 2, 0);
    ({ dining: () => { name = `Dining table ${wIn}" × ${dIn}"`; desc = `Rectangular dining table, ${wIn}" × ${dIn}", ${hIn}" tall, seats ${wIn >= 72 ? 8 : 6}.`; },
      coffee: () => { name = `Coffee table ${wIn}" × ${dIn}"`; desc = `Coffee table, ${wIn}" × ${dIn}", ${hIn}" tall.`; },
      end: () => { name = `End table ${wIn}" × ${dIn}"`; desc = `End table, ${wIn}" × ${dIn}", ${hIn}" tall.`; },
      desk: () => { name = `Desk ${wIn}" × ${dIn}"`; desc = `Writing desk, ${wIn}" × ${dIn}", ${hIn}" tall.`; cat = 'furniture/desks'; } })[kind]();
  }
  return item({ name, kind: 'furniture', category: cat, description: desc, ifc: { class: 'IfcFurniture' }, plan: p, body: m.body(), w, d, h });
}
function chair(kind) {
  const w = (kind === 'arm' ? 34 : 18) * IN, d = (kind === 'arm' ? 36 : 21) * IN, h = (kind === 'arm' ? 34 : 34) * IN;
  const m = new Mesh(), p = new Plan(FU_LAYERS).rect('FURNITURE', -w / 2, -d, w / 2, 0);
  if (kind === 'arm') {
    m.box(-w / 2, -d, 0, w / 2, 0, 17 * IN).box(-w / 2, -7 * IN, 17 * IN, w / 2, 0, h).box(-w / 2, -d, 17 * IN, -w / 2 + 5 * IN, 0, 25 * IN).box(w / 2 - 5 * IN, -d, 17 * IN, w / 2, 0, 25 * IN);
    p.line('FURNITURE-DETAIL', -w / 2 + 5 * IN, -7 * IN, w / 2 - 5 * IN, -7 * IN).line('FURNITURE-DETAIL', -w / 2 + 5 * IN, -d, -w / 2 + 5 * IN, -7 * IN).line('FURNITURE-DETAIL', w / 2 - 5 * IN, -d, w / 2 - 5 * IN, -7 * IN);
    return item({ name: 'Armchair 34"', kind: 'furniture', category: 'furniture/seating', description: 'Upholstered armchair, 34" wide, 36" deep, 34" tall.', ifc: { class: 'IfcFurniture' }, plan: p, body: m.body(), w, d, h });
  }
  m.box(-w / 2, -d, 17 * IN, w / 2, 0, 18.5 * IN).box(-w / 2, -1.5 * IN, 18.5 * IN, w / 2, 0, h);
  for (const [x, y] of [[-w / 2, -d], [w / 2 - 1.5 * IN, -d], [w / 2 - 1.5 * IN, -1.5 * IN], [-w / 2, -1.5 * IN]]) m.box(x, y, 0, x + 1.5 * IN, y + 1.5 * IN, 17 * IN);
  p.line('FURNITURE-DETAIL', -w / 2, -1.5 * IN, w / 2, -1.5 * IN);
  return item({ name: 'Dining chair', kind: 'furniture', category: 'furniture/seating', description: 'Dining chair, 18" wide, 21" deep, 34" tall, seat 18½" high. Its back is the insertion point: place it at a table edge facing in.', ifc: { class: 'IfcFurniture' }, plan: p, body: m.body(), w, d, h });
}
function bed(name, wIn, lIn) {
  const w = wIn * IN, l = lIn * IN, frame = 2 * IN, hb = 4 * IN;
  const W = w + 2 * frame, L = l + frame + hb;
  const m = new Mesh().box(-W / 2, -L, 0, W / 2, -hb, 12 * IN).box(-w / 2, -L + frame, 12 * IN, w / 2, -hb, 24 * IN).box(-W / 2, -hb, 0, W / 2, 0, 48 * IN);
  const p = new Plan(FU_LAYERS).rect('FURNITURE', -W / 2, -L, W / 2, 0).line('FURNITURE-DETAIL', -W / 2, -hb, W / 2, -hb).line('FURNITURE-DETAIL', -w / 2, -hb - 24 * IN, w / 2, -hb - 24 * IN);
  const pillows = wIn >= 50 ? 2 : 1;
  for (let i = 0; i < pillows; i++) { const x0 = -w / 2 + 2 * IN + (w - 4 * IN) * i / pillows, x1 = -w / 2 + 2 * IN + (w - 4 * IN) * (i + 1) / pillows - (pillows > 1 ? 2 * IN : 0); p.poly('FURNITURE-DETAIL', rrect(x0, -hb - 20 * IN, x1, -hb - 3 * IN, 3 * IN), true); }
  return item({ name: `${name} bed ${wIn}" × ${lIn}"`, kind: 'furniture', category: 'furniture/beds', description: `${name} bed: a ${wIn}" × ${lIn}" mattress on a frame with a headboard, ${Math.round(W / IN)}" × ${Math.round(L / IN)}" overall, mattress top 24" high.`, ifc: { class: 'IfcFurniture' }, plan: p, body: m.body(), w: W, d: L, h: 48 * IN });
}
function storage(kind) {
  const spec = { nightstand: [24, 16, 26, 'Nightstand', 'Nightstand with a drawer, 24" wide, 16" deep, 26" tall.'], dresser: [60, 18, 32, 'Dresser', 'Dresser with six drawers, 60" wide, 18" deep, 32" tall.'], bookcase: [36, 12, 72, 'Bookcase', 'Open bookcase with five shelves, 36" wide, 12" deep, 72" tall.'], tvstand: [60, 18, 24, 'Media console', 'Media console for a television, 60" wide, 18" deep, 24" tall.'] }[kind];
  const [wIn, dIn, hIn, name, desc] = spec, w = wIn * IN, d = dIn * IN, h = hIn * IN;
  const m = new Mesh().box(-w / 2, -d, 0, w / 2, 0, h);
  if (kind === 'bookcase') for (let i = 1; i < 5; i++) m.box(-w / 2 + 0.75 * IN, -d - 0.01, i * h / 5, w / 2 - 0.75 * IN, -d + 0.5 * IN, i * h / 5 + 0.75 * IN);
  const p = new Plan(FU_LAYERS).rect('FURNITURE', -w / 2, -d, w / 2, 0).line('FURNITURE-DETAIL', -w / 2, -d + 1 * IN, w / 2, -d + 1 * IN);
  return item({ name: `${name} ${wIn}"`, kind: 'furniture', category: 'furniture/storage', description: desc, ifc: { class: 'IfcFurniture' }, plan: p, body: m.body(), w, d, h });
}

// --------------------------------------------------------------------------------------------------------- the set
export function residentialItems() {
  const out = [];
  const add = (it) => out.push({ slug: slugify(it.name), item: it });
  for (const w of [12, 15, 18, 21, 24, 30, 33, 36]) add(baseCabinet(w, 'door').item);
  for (const w of [18, 24]) add(baseCabinet(w, 'drawers').item);
  for (const w of [30, 33, 36]) add(baseCabinet(w, 'sink').item);
  add(cornerBase('susan')); add(cornerBase('blind'));
  for (const w of [12, 15, 18, 21, 24, 30, 33, 36]) add(wallCabinet(w, 30));
  add(wallCabinet(30, 15, 69)); add(wallCabinet(36, 15, 69)); add(wallCabinet(36, 12, 72));
  add(cornerWall());
  add(tallCabinet(18, 84)); add(tallCabinet(24, 84)); add(tallCabinet(24, 90)); add(tallCabinet(30, 84, true));
  for (const w of [24, 30, 36, 48]) add(vanity(w)); add(vanity(60, 2));
  add(fridge(36)); add(fridge(33)); add(range(30)); add(range(36)); add(dishwasher());
  add(overRange('micro', 30)); add(overRange('hood', 30)); add(overRange('hood', 36));
  add(laundry('washer')); add(laundry('dryer')); add(waterHeater());
  add(toilet()); add(pedestal()); add(kitchenSink(2)); add(kitchenSink(1)); add(bathtub()); add(shower(36, 36)); add(shower(60, 32)); add(laundrySink());
  add(sofa(84, 'Sofa')); add(sofa(60, 'Loveseat')); add(chair('arm')); add(chair('dining'));
  add(table('coffee', 48, 24, 18)); add(table('end', 24, 24, 24)); add(table('dining', 60, 36)); add(table('dining', 84, 40)); add(table('round', 48, 48)); add(table('desk', 48, 24));
  add(bed('Twin', 38, 75)); add(bed('Full', 54, 75)); add(bed('Queen', 60, 80)); add(bed('King', 76, 80));
  add(storage('nightstand')); add(storage('dresser')); add(storage('bookcase')); add(storage('tvstand'));
  return out;
}
export const fmtInches = fmtIn;
