#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * import-freecad.mjs — turns parts of the FreeCAD Parts Library (CC BY 3.0) into CadCraft library items, each
 * with a credit naming its author.
 *
 *   node tools/import-freecad.mjs --upstream <FreeCAD-library clone> --libitem <path to libitem.js> [--list sources/freecad/pilot.json]
 *
 * --upstream  a clone of https://github.com/FreeCAD/FreeCAD-library (a blobless clone is enough:
 *             git clone --filter=blob:none --no-checkout …). Files are read at the commit the list pins, never the
 *             working tree, so a run is repeatable.
 * --libitem   the CadCraft library item module (libitem.js from a BimCraft or CadCraft build that reads STL).
 * --list      the parts to import (default sources/freecad/pilot.json): path, name, category, kind, and turn
 *             (degrees counterclockwise, seen from above: 90, 180 or -90) for a part whose front does not face −Y.
 *
 * For each part it writes items/freecad/<slug>/item.json (format 1, without uuid/version/license/provenance —
 * the library fills those when the item is published), preview.svg and credit.json, then CREDITS.md for every item.
 *
 * Who made a part: the FreeCAD file's CreatedBy property when the author filled it in, else the author of the
 * commit that first added the part (followed through renames), as the library's README says to look there.
 * A part with no author found is left out, never published unattributed.
 * License: CC BY 3.0 (the library's LICENSE-Assets), or CC BY 4.0 when the part's own FreeCAD file says the
 * author chose CC BY 4.0. A FreeCAD file whose License property reads "All rights reserved" (FreeCAD's default
 * for new documents) is noted in credit.json so a person can review it.
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const opt = (name, def = null) => { const i = args.indexOf(name); return i >= 0 && args[i + 1] ? args[i + 1] : def; };
const upstream = opt('--upstream');
const libitemPath = opt('--libitem');
const listPath = path.resolve(opt('--list', path.join(ROOT, 'sources/freecad/pilot.json')));
if (!upstream || !libitemPath) {
  console.error('Usage: node tools/import-freecad.mjs --upstream <FreeCAD-library clone> --libitem <libitem.js> [--list <parts.json>]');
  process.exit(2);
}

const L = await import(pathToFileURL(path.resolve(libitemPath)).href);
const list = JSON.parse(fs.readFileSync(listPath, 'utf8'));
const commit = list.commit;
const git = (...a) => execFileSync('git', ['-C', upstream, ...a], { maxBuffer: 256 * 1024 * 1024 });
const gitText = (...a) => git(...a).toString('utf8');

const LICENSES = {
  'CC-BY-3.0': { name: 'CC BY 3.0', url: 'https://creativecommons.org/licenses/by/3.0/' },
  'CC-BY-4.0': { name: 'CC BY 4.0', url: 'https://creativecommons.org/licenses/by/4.0/' },
};
// Same defaults as the site's LibraryCatalog::CATEGORIES ifc column.
const IFC = { 'plumbing/fixtures': 'IfcFlowTerminal', 'plumbing/equipment': 'IfcBuildingElementProxy', 'electrical/fixtures': 'IfcFlowTerminal',
  'electrical/equipment': 'IfcBuildingElementProxy', 'mechanical/equipment': 'IfcBuildingElementProxy' };

const outRoot = path.join(ROOT, 'items', list.source);
fs.mkdirSync(outRoot, { recursive: true });
const done = [], skipped = [];

for (const part of list.parts) {
  const slug = slugify(part.name);
  try {
    const stl = git('show', `${commit}:${part.path}`);
    const fc = findFcstd(part.path);
    const props = fc ? fcstdProps(git('show', `${commit}:${fc}`)) : {};
    const first = firstCommit(part.path);
    const createdBy = cleanPerson(props.CreatedBy || '');
    const author = createdBy || first?.author || '';
    if (!author) { skipped.push({ path: part.path, why: 'no author found' }); continue; }
    const authorFrom = createdBy ? 'the CreatedBy property of the FreeCAD file' : `the git commit that added the part (${first.date}, "${first.subject}")`;
    const says40 = /attribution/i.test(props.License || '') && /\/by\/4\.0/.test(props.LicenseURL || '');
    const license = says40 ? 'CC-BY-4.0' : list.license;

    const r = L.itemFromMesh(new Uint8Array(stl), 'stl', { name: part.name });
    if (!r.items.length) { skipped.push({ path: part.path, why: r.notes.join(' ') }); continue; }
    const item = L.cleanItem(r.items[0]);
    if (part.turn) turnItem(item, part.turn);
    item.name = part.name;
    item.category = part.category;
    item.kind = part.kind;
    item.ifc = { class: IFC[part.category] || 'IfcFurnishingElement', predefined: 'NOTDEFINED' };
    item.description = `From the ${list.title}. The 3D body is the part's STL mesh; the plan is the outline of the mesh.`;
    const v = L.validateItem(item, { partial: true });
    if (!v.ok) { skipped.push({ path: part.path, why: v.errors.slice(0, 3).join('; ') }); continue; }

    const sourceUrl = `${list.repo}/blob/${commit}/${part.path.split('/').map(encodeURIComponent).join('/')}`;
    const lic = LICENSES[license];
    const credit = {
      title: part.name,
      source_title: path.basename(part.path).replace(/\.[^.]+$/, ''),
      author,
      author_from: authorFrom,
      license,
      license_url: lic.url,
      library: list.title,
      library_url: list.repo,
      commit,
      source_file: part.path,
      source_url: sourceUrl,
      source_sha256: sha256(stl),
      freecad_file: fc || null,
      freecad_license_property: props.License || null,
      notes: [],
      changes: 'Converted from STL to a CadCraft library item: the mesh was ' + (part.turn ? `turned ${Math.abs(part.turn)}° ${part.turn > 0 ? 'counterclockwise' : 'clockwise'} so its front faces the front, and ` : '')
        + 'moved so the middle of its back, at the bottom, is the insertion point, and a plan outline was added. Nothing else was changed.',
      attribution: `“${path.basename(part.path).replace(/\.[^.]+$/, '')}” by ${author}, from the ${list.title} (${sourceUrl}), ${lic.name} (${lic.url}). Converted to a CadCraft library item.`,
    };
    if (says40) credit.notes.push(`The part's FreeCAD file says the author chose CC BY 4.0 (${props.LicenseURL}); the library as a whole is CC BY 3.0.`);
    if (/all rights reserved/i.test(props.License || '')) credit.notes.push('The FreeCAD file\'s License property reads "All rights reserved", FreeCAD\'s default for new documents; the library\'s LICENSE-Assets puts every part under CC BY 3.0.');
    if (!fc) credit.notes.push('No FreeCAD file beside the STL.');

    const dir = path.join(outRoot, slug);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'item.json'), JSON.stringify(item));
    fs.writeFileSync(path.join(dir, 'preview.svg'), L.previewSvg(item));
    fs.writeFileSync(path.join(dir, 'credit.json'), JSON.stringify(credit, null, 2) + '\n');
    done.push({ slug, name: part.name, author, license, tris: item.body.indices.length / 3 });
  } catch (e) {
    skipped.push({ path: part.path, why: String(e.message || e).split('\n')[0] });
  }
}

writeCredits();
for (const d of done) console.log(`  + ${d.slug}  (${d.author}, ${d.license}, ${d.tris} triangles)`);
for (const s of skipped) console.log(`  - ${s.path}: ${s.why}`);
console.log(`${done.length} items written, ${skipped.length} left out.`);
process.exit(skipped.length ? 1 : 0);

// ---------------------------------------------------------------------------

/**
 * Turn an item from itemFromMesh about Z (degrees, counterclockwise from above), then put it back the way
 * itemFromMesh leaves it: centred in X, back on y = 0, bottom on z = 0, plan = the hull, sizes from the box.
 */
function turnItem(item, deg) {
  const a = deg * Math.PI / 180, c = Math.round(Math.cos(a) * 1e9) / 1e9, s = Math.round(Math.sin(a) * 1e9) / 1e9;
  const P = item.body.positions;
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity, minZ = Infinity, maxZ = -Infinity;
  for (let i = 0; i < P.length; i += 3) {
    const x = P[i] * c - P[i + 1] * s, y = P[i] * s + P[i + 1] * c;
    P[i] = x; P[i + 1] = y;
    minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y);
    minZ = Math.min(minZ, P[i + 2]); maxZ = Math.max(maxZ, P[i + 2]);
  }
  const cx = (minX + maxX) / 2, r4 = (v) => Math.round(v * 10000) / 10000;
  for (let i = 0; i < P.length; i += 3) { P[i] = r4(P[i] - cx); P[i + 1] = r4(P[i + 1] - maxY); P[i + 2] = r4(P[i + 2] - minZ); }
  const pts = [];
  for (let i = 0; i < P.length; i += 3) pts.push([P[i], P[i + 1]]);
  item.plan.entities = item.plan.entities.filter((e) => e.type !== 'poly');
  const hull = L.convexHull(pts);
  if (hull.length >= 3) item.plan.entities.push({ type: 'poly', layer: 'EQUIP', color: null, pts: hull, closed: true });
  item.params = { ...item.params, width: r4(maxX - minX), depth: r4(maxY - minY), height: r4(maxZ - minZ) };
}

function slugify(s) {
  return s.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);
}
function sha256(buf) { return crypto.createHash('sha256').update(buf).digest('hex'); }

/** The FreeCAD file beside an STL: same folder and name, .FCStd in any letter case. */
function findFcstd(p) {
  const dir = path.posix.dirname(p), base = path.posix.basename(p).replace(/\.[^.]+$/, '').toLowerCase();
  const names = gitText('ls-tree', '--name-only', `${commit}:${dir}`).split('\n');
  const hit = names.find((n) => n.toLowerCase() === base + '.fcstd');
  return hit ? `${dir}/${hit}` : null;
}

/** The earliest commit of a file, followed through renames. */
function firstCommit(p) {
  const lines = gitText('log', '--follow', '--format=%an%x09%ad%x09%s', '--date=short', commit, '--', p).trim().split('\n').filter(Boolean);
  if (!lines.length) return null;
  const [author, date, subject] = lines[lines.length - 1].split('\t');
  return { author: cleanPerson(author), date, subject };
}

/** "Name <mail>" → "Name"; XML entities decoded. */
function cleanPerson(s) {
  return s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/<[^>]*>/g, '').trim();
}

/** Document properties of an .FCStd (a zip holding Document.xml). Reads the zip's central directory by hand. */
function fcstdProps(buf) {
  let eocd = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 65557); i--) if (buf.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
  if (eocd < 0) return {};
  let off = buf.readUInt32LE(eocd + 16);
  const count = buf.readUInt16LE(eocd + 10);
  for (let n = 0; n < count; n++) {
    const method = buf.readUInt16LE(off + 10), size = buf.readUInt32LE(off + 20);
    const nameLen = buf.readUInt16LE(off + 28), extra = buf.readUInt16LE(off + 30), comment = buf.readUInt16LE(off + 32);
    const local = buf.readUInt32LE(off + 42);
    const name = buf.toString('utf8', off + 46, off + 46 + nameLen);
    if (name === 'Document.xml') {
      const start = local + 30 + buf.readUInt16LE(local + 26) + buf.readUInt16LE(local + 28);
      const raw = buf.subarray(start, start + size);
      const xml = (method === 8 ? zlib.inflateRawSync(raw) : raw).toString('utf8');
      const out = {};
      for (const k of ['CreatedBy', 'LastModifiedBy', 'Company', 'License', 'LicenseURL']) {
        const m = new RegExp(`<Property name="${k}"[^>]*>\\s*<String value="([^"]*)"`).exec(xml);
        if (m && m[1].trim()) out[k] = m[1].trim();
      }
      return out;
    }
    off += 46 + nameLen + extra + comment;
  }
  return {};
}

/** CREDITS.md from every items/<source>/<slug>/credit.json in the repo. */
function writeCredits() {
  const rows = [];
  for (const src of fs.readdirSync(path.join(ROOT, 'items')).sort()) {
    for (const slug of fs.readdirSync(path.join(ROOT, 'items', src)).sort()) {
      const f = path.join(ROOT, 'items', src, slug, 'credit.json');
      if (fs.existsSync(f)) rows.push({ src, slug, ...JSON.parse(fs.readFileSync(f, 'utf8')) });
    }
  }
  const md = (s) => String(s).replace(/\|/g, '\\|');
  const out = ['# Credits', '',
    'Every item in this repository was made by the person named here and is shared under the license shown.',
    'Each item\'s `credit.json` has the full attribution, the source file and what was changed.', '',
    '| Item | Author | License | Source |', '|---|---|---|---|'];
  for (const r of rows) {
    out.push(`| [${md(r.title)}](items/${r.src}/${r.slug}/) | ${md(r.author)} | [${md(LICENSES[r.license]?.name || r.license)}](${r.license_url}) | [${md(r.library)}: ${md(r.source_title)}](${r.source_url}) |`);
  }
  fs.writeFileSync(path.join(ROOT, 'CREDITS.md'), out.join('\n') + '\n');
}
