#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * make-standard-parts.mjs — mechanical standard parts (bolts, nuts, washers, pins, bearings, keys, gears) as CadCraft
 * library items, made by CadCraft from the dimensions in public standard tables and shared under CC0 1.0.
 *
 *   node tools/make-standard-parts.mjs --libitem <path to libitem.js> [--check]
 *
 * --libitem   the CadCraft library item module (libitem.js from a BimCraft or CadCraft build): its previewSvg draws
 *             each preview.svg, the same drawing the library's cards show.
 * --check     write nothing; exit 1 when items/standard-parts/ or CREDITS.md differ from what this run would make.
 *
 * The tables and the drawings are tools/shapes/parts.js and tools/shapes/items.js (copies of the CadCraft site's
 * lib/shapes/, kept byte-identical by its tools/shapes/sync.mjs — CadCraft's Standard tab draws parts with the same code).
 * The sizes published are parts.js LIBRARY_SET. For each it writes items/standard-parts/<slug>/item.json (format 1,
 * without uuid/version/license/provenance — the library fills those when the item is published), preview.svg and
 * credit.json (author CadCraft, CC0 1.0, source kind "spec", the standard and its catalogue page), then CREDITS.md for
 * every item in the repo. sources/standard-parts/README.md says which table each family comes from.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { LIBRARY_SET, makePart, PART_STANDARDS } from './shapes/parts.js';
import { partItem } from './shapes/items.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const opt = (name, def = null) => { const i = args.indexOf(name); return i >= 0 && args[i + 1] ? args[i + 1] : def; };
const check = args.includes('--check');
const libitemPath = opt('--libitem');
if (!libitemPath) {
  console.error('Usage: node tools/make-standard-parts.mjs --libitem <libitem.js> [--check]');
  process.exit(2);
}
const L = await import(pathToFileURL(path.resolve(libitemPath)).href);

export const GENERATOR = 'make-standard-parts 1';
const CC0 = { name: 'CC0 1.0', url: 'https://creativecommons.org/publicdomain/zero/1.0/' };
const LICENSES = {
  'CC0-1.0': CC0,
  'CC-BY-3.0': { name: 'CC BY 3.0', url: 'https://creativecommons.org/licenses/by/3.0/' },
  'CC-BY-4.0': { name: 'CC BY 4.0', url: 'https://creativecommons.org/licenses/by/4.0/' },
};
const slugify = (s) => String(s).normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/×/g, 'x').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const want = new Map();   // relative path → content
const outRoot = 'items/standard-parts';
for (const [family, size, opts] of LIBRARY_SET) {
  const r = makePart(family, size, opts);
  if (!r.ok) { console.error(`  ! ${family} ${size}: ${r.error}`); process.exit(1); }
  const p = r.part;
  const item = partItem(p);
  const why = L.validateItem(item, { partial: true });
  if (!why.ok) { console.error(`  ! ${item.name}: ${why.errors.join('; ')}`); process.exit(1); }
  const slug = slugify(item.name);
  const std = PART_STANDARDS[p.standard];
  const refs = p.type === 'gear' ? [PART_STANDARDS['ISO 54'], PART_STANDARDS['ISO 53']] : [std];
  const credit = {
    title: item.name,
    source_title: refs.map((s) => s.title).join('; '),
    author: 'CadCraft',
    author_from: 'Drawn by CadCraft from the dimensions in the standard\'s published tables (only the numbers are taken: dimensions are facts).',
    license: 'CC0-1.0',
    license_url: CC0.url,
    library: 'standard parts tables',
    library_url: 'https://github.com/getcadcraft/library/tree/main/sources/standard-parts',
    commit: GENERATOR,
    source_kind: 'spec',
    standard: p.type === 'gear' ? 'ISO 54, ISO 53' : p.standard,
    source_url: refs[0].url,
    notes: p.type === 'gear' ? ['Drawn by the gear drawing convention (tip circle, pitch circle as a centre line, root circle thin), not tooth by tooth.'] : [],
    changes: 'None: made directly from the table.',
    attribution: `“${item.name}” by CadCraft, dimensions from ${refs.map((s) => s.title.split(' ').slice(0, 2).join(' ')).join(' and ')} (${refs[0].url}), CC0 1.0 (${CC0.url}).`,
  };
  want.set(path.join(outRoot, slug, 'item.json'), JSON.stringify(item));
  want.set(path.join(outRoot, slug, 'preview.svg'), L.previewSvg(item));
  want.set(path.join(outRoot, slug, 'credit.json'), JSON.stringify(credit, null, 2) + '\n');
}

/** CREDITS.md from every items/<source>/<slug>/credit.json in the repo (the standard parts as this run makes them). */
function credits() {
  const rows = [];
  for (const src of fs.readdirSync(path.join(ROOT, 'items')).sort()) {
    if (src === 'standard-parts') continue;
    for (const slug of fs.readdirSync(path.join(ROOT, 'items', src)).sort()) {
      const f = path.join(ROOT, 'items', src, slug, 'credit.json');
      if (fs.existsSync(f)) rows.push({ src, slug, ...JSON.parse(fs.readFileSync(f, 'utf8')) });
    }
  }
  const mine = [...want.entries()].filter(([k]) => k.endsWith('credit.json')).map(([k, v]) => ({ src: 'standard-parts', slug: path.basename(path.dirname(k)), ...JSON.parse(v) }));
  mine.sort((a, b) => a.slug.localeCompare(b.slug));
  const all = [...rows, ...mine].sort((a, b) => a.src.localeCompare(b.src) || a.slug.localeCompare(b.slug));
  const md = (s) => String(s).replace(/\|/g, '\\|');
  const out = ['# Credits', '',
    'Every item in this repository was made by the person named here and is shared under the license shown.',
    'Each item\'s `credit.json` has the full attribution, the source file and what was changed.', '',
    '| Item | Author | License | Source |', '|---|---|---|---|'];
  for (const r of all) {
    const src = r.source_kind === 'spec' ? `[${md(r.standard)}](${r.source_url})` : `[${md(r.library)}: ${md(r.source_title)}](${r.source_url})`;
    out.push(`| [${md(r.title)}](items/${r.src}/${r.slug}/) | ${md(r.author)} | [${md(LICENSES[r.license]?.name || r.license)}](${r.license_url}) | ${src} |`);
  }
  return out.join('\n') + '\n';
}
want.set('CREDITS.md', credits());

// stale item folders (a size no longer in the set)
const stale = fs.existsSync(path.join(ROOT, outRoot)) ? fs.readdirSync(path.join(ROOT, outRoot)).filter((d) => !want.has(path.join(outRoot, d, 'item.json'))) : [];
let diff = 0;
for (const [rel, text] of want) {
  const f = path.join(ROOT, rel);
  const same = fs.existsSync(f) && fs.readFileSync(f, 'utf8') === text;
  if (same) continue;
  diff++;
  if (check) { if (diff <= 10) console.log('  differs: ' + rel); continue; }
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, text);
}
for (const d of stale) { diff++; if (check) console.log('  stale: ' + path.join(outRoot, d)); else fs.rmSync(path.join(ROOT, outRoot, d), { recursive: true }); }
const n = LIBRARY_SET.length;
console.log(check ? (diff ? `${diff} file(s) differ from what the generator makes.` : `${n} standard parts: up to date.`) : `${n} standard parts made; ${diff} file(s) written or removed.`);
process.exit(check && diff ? 1 : 0);
