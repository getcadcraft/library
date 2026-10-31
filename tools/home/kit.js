/* SPDX-License-Identifier: Apache-2.0 */
/**
 * kit.js — the geometry kit for the home set: rounded lofts, lathes, hollow basins, tubes, coloured parts and plan
 * drawings. No DOM, no imports. Millimetres, Z up, the front faces −Y, the insertion point is the middle of the back at
 * the floor (vehicles: the middle of the footprint). Each primitive is a closed solid and is turned outward by its signed
 * volume, so a ring order only has to be consistent inside one loft.
 */
export const IN = 25.4;
export const r1 = (v) => Math.round(v * 10) / 10;
export const inch = (n) => n * IN;

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const norm = (a) => { const l = Math.hypot(...a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };

// ------------------------------------------------------------------------------------------------------------ rings
/** Rounded rectangle, anticlockwise seen from above, at height z. 4 × (seg + 1) points. */
export function rrRing(x0, y0, x1, y1, r, z, seg = 3) {
  r = Math.max(0.5, Math.min(r, (x1 - x0) / 2 - 0.01, (y1 - y0) / 2 - 0.01));
  const out = [], c = [[x1 - r, y0 + r, -90], [x1 - r, y1 - r, 0], [x0 + r, y1 - r, 90], [x0 + r, y0 + r, 180]];
  for (const [cx, cy, a0] of c) for (let i = 0; i <= seg; i++) { const a = (a0 + 90 * i / seg) * Math.PI / 180; out.push([cx + r * Math.cos(a), cy + r * Math.sin(a), z]); }
  return out;
}
export function ellRing(cx, cy, rx, ry, z, n = 32) { return Array.from({ length: n }, (_, i) => [cx + rx * Math.cos(2 * Math.PI * i / n), cy + ry * Math.sin(2 * Math.PI * i / n), z]); }
export const circRing = (cx, cy, r, z, n = 32) => ellRing(cx, cy, r, r, z, n);
/** A superellipse (|x/a|^p + |z/b|^p = 1) in the XZ plane at y: a car's cross-section; p = 2 an ellipse, large p a rounded box. */
export function superRing(cx, cz, a, b, p, y, n = 40) {
  const e = 2 / p, f = (t) => Math.sign(t) * Math.pow(Math.abs(t), e);
  return Array.from({ length: n }, (_, i) => { const t = 2 * Math.PI * i / n; return [cx + a * f(Math.cos(t)), y, cz + b * f(Math.sin(t))]; });
}
/** A superellipse in plan at height z: p = 2 an ellipse, a large p a rounded rectangle (all start at angle 0, so rings of one kind morph into each other). */
export function supRing(cx, cy, a, b, p, z, n = 48) {
  const e = 2 / p, f = (t) => Math.sign(t) * Math.pow(Math.abs(t), e);
  return Array.from({ length: n }, (_, i) => { const t = 2 * Math.PI * i / n; return [cx + a * f(Math.cos(t)), cy + b * f(Math.sin(t)), z]; });
}
/** Scale a ring about its centre in plan. */
export function grow(ring, d) {
  const cx = ring.reduce((s, p) => s + p[0], 0) / ring.length, cy = ring.reduce((s, p) => s + p[1], 0) / ring.length;
  return ring.map(([x, y, z]) => { const l = Math.hypot(x - cx, y - cy) || 1; return [x + (x - cx) / l * d, y + (y - cy) / l * d, z]; });
}
export const at = (ring, z) => ring.map(([x, y]) => [x, y, z]);

// ------------------------------------------------------------------------------------------------------------ parts
export class Part {
  constructor(name, color, alpha = 1) { this.name = name; this.color = color; this.alpha = alpha; this.P = []; this.I = []; }
  /** Add vertices V ([[x,y,z]…]) and faces F ([[a,b,c]…]); orient = turn the solid outward by its signed volume. */
  commit(V, F, orient = true) {
    let vol = 0;
    for (const [a, b, c] of F) vol += dot(V[a], cross(V[b], V[c]));
    const flip = orient && vol < 0;
    const base = this.P.length / 3;
    for (const [x, y, z] of V) this.P.push(r1(x), r1(y), r1(z));
    for (const [a, b, c] of F) {
      const pa = V[a], pb = V[b], pc = V[c];
      const n = cross(sub(pb, pa), sub(pc, pa));
      if (Math.hypot(...n) < 1e-6) continue;           // no area
      if (flip) this.I.push(base + a, base + c, base + b); else this.I.push(base + a, base + b, base + c);
    }
    return this;
  }
  /** Rings (same point count) joined in order, capped at both ends unless the ring is a single point. */
  loft(rings, { caps = true, orient = true } = {}) {
    const N = rings[0].length, V = rings.flat(), F = [];
    for (let i = 0; i + 1 < rings.length; i++) for (let j = 0; j < N; j++) {
      const a = i * N + j, b = i * N + (j + 1) % N, c = (i + 1) * N + (j + 1) % N, d = (i + 1) * N + j;
      F.push([a, b, c], [a, c, d]);
    }
    if (caps) for (const [ri, up] of [[0, false], [rings.length - 1, true]]) {
      const ring = rings[ri], c = [0, 1, 2].map((k) => ring.reduce((s, p) => s + p[k], 0) / N);
      if (ring.every((p) => Math.hypot(p[0] - c[0], p[1] - c[1], p[2] - c[2]) < 0.05)) continue;
      const ci = V.push(c) - 1, o = ri * N;
      for (let j = 0; j < N; j++) F.push(up ? [ci, o + j, o + (j + 1) % N] : [ci, o + (j + 1) % N, o + j]);
    }
    return this.commit(V, F, orient);
  }
  box(x0, y0, z0, x1, y1, z1) { return this.loft([rrRing(x0, y0, x1, y1, 0.5, z0, 1), rrRing(x0, y0, x1, y1, 0.5, z1, 1)]); }
  /** A box with rounded vertical edges (radius r) and a rounded top and bottom edge (radius e). */
  rbox(x0, y0, z0, x1, y1, z1, r = 10, e = 0, seg = 3) {
    if (e <= 0) return this.loft([rrRing(x0, y0, x1, y1, r, z0, seg), rrRing(x0, y0, x1, y1, r, z1, seg)]);
    const rings = [], K = 4;
    for (let k = 0; k <= K; k++) { const a = (Math.PI / 2) * k / K, inset = e * (1 - Math.sin(a)), dz = e * (1 - Math.cos(a)); rings.push(rrRing(x0 + inset, y0 + inset, x1 - inset, y1 - inset, Math.max(r - inset, 0.6), z0 + dz, seg)); }
    for (let k = K; k >= 0; k--) { const a = (Math.PI / 2) * k / K, inset = e * (1 - Math.sin(a)), dz = e * (1 - Math.cos(a)); rings.push(rrRing(x0 + inset, y0 + inset, x1 - inset, y1 - inset, Math.max(r - inset, 0.6), z1 - dz, seg)); }
    return this.loft(rings);
  }
  /** A solid of revolution about an axis: profile = [[distance along the axis, radius]…], centre c = [x, y, z]. */
  lathe(axis, c, profile, seg = 32, opts = {}) {
    const rings = profile.map(([t, r]) => Array.from({ length: seg }, (_, i) => {
      const a = 2 * Math.PI * i / seg, co = r * Math.cos(a), si = r * Math.sin(a);
      return axis === 'z' ? [c[0] + co, c[1] + si, c[2] + t] : axis === 'x' ? [c[0] + t, c[1] + co, c[2] + si] : [c[0] + co, c[1] + t, c[2] + si];
    }));
    return this.loft(rings, opts);
  }
  cyl(cx, cy, r, z0, z1, seg = 24) { return this.lathe('z', [cx, cy, 0], [[z0, r], [z1, r]], seg); }
  /** A cylinder or cone between two points. */
  strut(p0, p1, r, seg = 10, rEnd = r) {
    const d = norm(sub(p1, p0)), h = Math.abs(d[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0];
    const u = norm(cross(d, h)), w = cross(d, u);
    const ring = (p, rr) => Array.from({ length: seg }, (_, i) => { const a = 2 * Math.PI * i / seg; return [p[0] + rr * (Math.cos(a) * u[0] + Math.sin(a) * w[0]), p[1] + rr * (Math.cos(a) * u[1] + Math.sin(a) * w[1]), p[2] + rr * (Math.cos(a) * u[2] + Math.sin(a) * w[2])]; });
    return this.loft([ring(p0, r), ring(p1, rEnd)]);
  }
  /** A polyline of struts with a ball at every bend. */
  pipe(pts, r, seg = 10) {
    for (let i = 0; i + 1 < pts.length; i++) this.strut(pts[i], pts[i + 1], r, seg);
    for (let i = 1; i + 1 < pts.length; i++) this.ball(pts[i], r, 8);
    return this;
  }
  ball(c, r, seg = 12) { return this.ellipsoid(c, r, r, r, seg); }
  ellipsoid(c, rx, ry, rz, seg = 20, stacks = 10) {
    const prof = [];
    for (let k = 0; k <= stacks; k++) { const a = Math.PI * k / stacks; prof.push([-Math.cos(a), Math.sin(a)]); }
    const rings = prof.map(([t, s]) => Array.from({ length: seg }, (_, i) => { const a = 2 * Math.PI * i / seg; return [c[0] + rx * s * Math.cos(a), c[1] + ry * s * Math.sin(a), c[2] + rz * t]; }));
    return this.loft(rings);
  }
  /** A ring (torus) about the X axis in the YZ plane (a wheel's tyre): centre c, major radius R, minor radius r. */
  torusX(c, R, r, seg = 40, tube = 12) {
    const rings = [];
    for (let i = 0; i < seg; i++) {
      const a = 2 * Math.PI * i / seg, ca = Math.cos(a), sa = Math.sin(a);
      rings.push(Array.from({ length: tube }, (_, j) => { const b = 2 * Math.PI * j / tube, rr = R + r * Math.cos(b); return [c[0] + r * Math.sin(b), c[1] + rr * ca, c[2] + rr * sa]; }));
    }
    rings.push(rings[0].map((p) => p.slice()));
    return this.loft(rings, { caps: false });
  }
  /** A hollow basin: outer rings bottom → rim, inner rings floor → rim (same point count; the rim ring of the inner one is inside the outer's). */
  basin(outer, inner) {
    const N = outer[0].length, V = [...outer.flat(), ...inner.flat()], F = [], io = inner.length ? outer.length * N : 0;
    for (let i = 0; i + 1 < outer.length; i++) for (let j = 0; j < N; j++) {
      const a = i * N + j, b = i * N + (j + 1) % N, c = (i + 1) * N + (j + 1) % N, d = (i + 1) * N + j;
      F.push([a, b, c], [a, c, d]);
    }
    const centre = (ring) => [0, 1, 2].map((k) => ring.reduce((s, p) => s + p[k], 0) / N);
    const c0 = V.push(centre(outer[0])) - 1;
    for (let j = 0; j < N; j++) F.push([c0, (j + 1) % N, j]);
    for (let i = 0; i + 1 < inner.length; i++) for (let j = 0; j < N; j++) {
      const a = io + i * N + j, b = io + i * N + (j + 1) % N, c = io + (i + 1) * N + (j + 1) % N, d = io + (i + 1) * N + j;
      F.push([a, c, b], [a, d, c]);
    }
    const c1 = V.push(centre(inner[0])) - 1;
    for (let j = 0; j < N; j++) F.push([c1, io + j, io + (j + 1) % N]);
    const ot = (outer.length - 1) * N, it = io + (inner.length - 1) * N;
    for (let j = 0; j < N; j++) { const j1 = (j + 1) % N; F.push([ot + j, ot + j1, it + j1], [ot + j, it + j1, it + j]); }
    return this.commit(V, F);
  }
  /** A thin wall along a path in plan (glass panel, apron, curved screen): t thick, from z0 to z1. */
  ribbon(path, z0, z1, t) {
    const n = path.length, L = [], R = [];
    for (let i = 0; i < n; i++) {
      const a = path[Math.max(0, i - 1)], b = path[Math.min(n - 1, i + 1)];
      let dx = b[0] - a[0], dy = b[1] - a[1]; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
      L.push([path[i][0] - dy * t / 2, path[i][1] + dx * t / 2]); R.push([path[i][0] + dy * t / 2, path[i][1] - dx * t / 2]);
    }
    const V = [], F = [];
    for (const z of [z0, z1]) { for (const p of L) V.push([p[0], p[1], z]); for (const p of R) V.push([p[0], p[1], z]); }
    const lo = 0, ro = n, lh = 2 * n, rh = 3 * n;
    for (let i = 0; i + 1 < n; i++) {
      F.push([lo + i, lo + i + 1, lh + i + 1], [lo + i, lh + i + 1, lh + i]);       // one face
      F.push([ro + i, rh + i + 1, ro + i + 1], [ro + i, rh + i, rh + i + 1]);       // the other
      F.push([lh + i, lh + i + 1, rh + i + 1], [lh + i, rh + i + 1, rh + i]);       // top
      F.push([lo + i, ro + i + 1, lo + i + 1], [lo + i, ro + i, ro + i + 1]);       // bottom
    }
    F.push([lo, lh, rh], [lo, rh, ro]);                                              // the two ends
    F.push([lo + n - 1, ro + n - 1, rh + n - 1], [lo + n - 1, rh + n - 1, lh + n - 1]);
    return this.commit(V, F);
  }
  /** A profile in the YZ plane (convex, any winding) swept along X from x0 to x1. */
  sweepX(prof, x0, x1) { return this.loft([prof.map(([y, z]) => [x0, y, z]), prof.map(([y, z]) => [x1, y, z])]); }
  /** Convex or star-shaped plan polygon (anticlockwise) swept from z0 to z1. */
  prism(poly, z0, z1) { return this.loft([poly.map(([x, y]) => [x, y, z0]), poly.map(([x, y]) => [x, y, z1])]); }
}

/** A model: coloured parts in a fixed order. */
export class Model {
  constructor() { this.parts = new Map(); }
  part(key, color, alpha = 1) { if (!this.parts.has(key)) this.parts.set(key, new Part(key, color, alpha)); return this.parts.get(key); }
  /** The one mesh and the triangle range of each part (empty parts are left out). */
  merged() {
    const positions = [], indices = [], ranges = [];
    for (const p of this.parts.values()) {
      if (!p.I.length) continue;
      const base = positions.length / 3, from = indices.length / 3;
      for (const x of p.P) positions.push(x);
      for (const i of p.I) indices.push(base + i);
      ranges.push({ from, to: indices.length / 3 - 1, color: p.color, alpha: p.alpha });
    }
    return { positions, indices, ranges };
  }
  /** Directed edges that have no opposite partner (0 = every part is a closed, consistently wound surface). */
  openEdges() {
    let bad = 0;
    for (const p of this.parts.values()) {
      const key = (i) => p.P[i * 3] + ',' + p.P[i * 3 + 1] + ',' + p.P[i * 3 + 2], cnt = new Map();
      for (let t = 0; t < p.I.length; t += 3) for (let k = 0; k < 3; k++) {
        const a = key(p.I[t + k]), b = key(p.I[t + (k + 1) % 3]);
        if (a === b) continue;
        cnt.set(a + '>' + b, (cnt.get(a + '>' + b) || 0) + 1);
      }
      for (const [e, n] of cnt) { const [a, b] = e.split('>'); if ((cnt.get(b + '>' + a) || 0) !== n) bad++; }
    }
    return bad;
  }
  /** Total signed volume (mm³) of every part: positive when the solids face outward. */
  volume() {
    let v = 0;
    for (const p of this.parts.values()) for (let t = 0; t < p.I.length; t += 3) {
      const g = (k) => [p.P[p.I[t + k] * 3], p.P[p.I[t + k] * 3 + 1], p.P[p.I[t + k] * 3 + 2]];
      v += dot(g(0), cross(g(1), g(2))) / 6;
    }
    return v;
  }
}

// ------------------------------------------------------------------------------------------------------------- plan
export class Plan {
  constructor(layers) { this.layers = layers.map(([name, color]) => ({ name, color })); this.entities = []; }
  poly(layer, pts, closed = false) { this.entities.push({ type: 'poly', layer, color: null, pts: pts.map(([x, y]) => [r1(x), r1(y)]), closed }); return this; }
  rect(layer, x0, y0, x1, y1) { return this.poly(layer, [[x0, y0], [x1, y0], [x1, y1], [x0, y1]], true); }
  ring(layer, ring, closed = true) { return this.poly(layer, ring.map(([x, y]) => [x, y]), closed); }
  line(layer, x1, y1, x2, y2) { this.entities.push({ type: 'line', layer, color: null, x1: r1(x1), y1: r1(y1), x2: r1(x2), y2: r1(y2) }); return this; }
  circle(layer, x, y, r) { this.entities.push({ type: 'circle', layer, color: null, x: r1(x), y: r1(y), r: r1(r) }); return this; }
  arc(layer, x, y, r, a0, a1) { this.entities.push({ type: 'arc', layer, color: null, x: r1(x), y: r1(y), r: r1(r), a0, a1 }); return this; }
  ellipse(layer, cx, cy, rx, ry) { const major = rx >= ry; this.entities.push({ type: 'ellipse', layer, color: null, cx: r1(cx), cy: r1(cy), mx: r1(major ? rx : 0), my: r1(major ? 0 : ry), ratio: Math.round((major ? ry / rx : rx / ry) * 10000) / 10000, t0: 0, t1: 360 }); return this; }
  text(layer, x, y, h, value) { this.entities.push({ type: 'text', layer, color: null, x: r1(x), y: r1(y), h: r1(h), rot: 0, value }); return this; }
  out() { return { layers: this.layers, entities: this.entities }; }
}

export const slugify = (s) => String(s).normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/×/g, 'x').replace(/[″"]/g, '-in').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

/** A library item (format 1, without uuid / version / license / provenance) from a model. */
export function makeItem({ name, kind, category, description, ifc, plan, model, clearances, attrs = {}, remarks, elec, plumb }) {
  const m = model.merged();
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity, z0 = Infinity, z1 = -Infinity;
  for (let i = 0; i < m.positions.length; i += 3) {
    x0 = Math.min(x0, m.positions[i]); x1 = Math.max(x1, m.positions[i]);
    y0 = Math.min(y0, m.positions[i + 1]); y1 = Math.max(y1, m.positions[i + 1]);
    z0 = Math.min(z0, m.positions[i + 2]); z1 = Math.max(z1, m.positions[i + 2]);
  }
  const parts = m.ranges.map((r) => `${r.from}-${r.to} ${r.color}` + (r.alpha < 1 ? '/' + Math.round(r.alpha * 100) / 100 : '')).join(';');
  const it = { format: 'cadcraft-library-item', format_version: 1, name, kind, category, description, maker: '', model: '', ifc, plan: plan.out(), body: { type: 'mesh', positions: m.positions, indices: m.indices } };
  if (clearances?.length) it.clearances = clearances;
  it.params = { width: r1(x1 - x0), depth: r1(y1 - y0), height: r1(z1 - z0) };
  if (remarks) it.params.remarks = remarks;
  if (elec) it.params.elec = elec;
  if (plumb) it.params.plumb = plumb;
  it.source_attrs = { 'CC-SET': 'Home', 'CC-RENDER-PARTS': parts, ...attrs };
  Object.defineProperty(it, '_bounds', { value: { x0, x1, y0, y1, z0, z1 } });
  Object.defineProperty(it, '_model', { value: model });
  return it;
}
