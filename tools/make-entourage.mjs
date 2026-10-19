#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * make-entourage.mjs — entourage (trees, shrubs, a hedge, a potted plant, people, cars) as CadCraft library items, drawn by
 * CadCraft from numbers (seeded shapes; no outside model or photo) and shared under CC0 1.0.
 *
 *   node tools/make-entourage.mjs --libitem <path to libitem.js> [--check]
 *
 * --libitem   the CadCraft library item module (libitem.js from a BimCraft or CadCraft build): validates each item and
 *             draws each preview.svg, the same drawing the library's cards show.
 * --check     write nothing; exit 1 when items/entourage/ or CREDITS.md differ from what this run would make.
 *
 * The items are tools/entourage/entourage.js (a copy of the CadCraft site's lib/entourage/entourage.js, kept byte-identical
 * by its tools/entourage/sync.mjs — ModelCraft's starter library builds the same shapes). Each item's source attribute
 * CC-RENDER-PARTS names its parts' triangle ranges and colours, so BimCraft places it with each part in its colour. For each
 * it writes items/entourage/<slug>/item.json (format 1, without uuid/version/license/provenance — the library fills those
 * when the item is published), preview.svg and credit.json (author CadCraft, CC0 1.0, source kind "own"), then CREDITS.md
 * for every item in the repo (the same table the other generators write). sources/entourage/README.md says what the set is.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { withTranslations } from './translations.mjs';
import { entourage, libraryItem } from './entourage/entourage.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const opt = (name, def = null) => { const i = args.indexOf(name); return i >= 0 && args[i + 1] ? args[i + 1] : def; };
const check = args.includes('--check');
const libitemPath = opt('--libitem');
if (!libitemPath) { console.error('Usage: node tools/make-entourage.mjs --libitem <libitem.js> [--check]'); process.exit(2); }
const L = await import(pathToFileURL(path.resolve(libitemPath)).href);

export const GENERATOR = 'make-entourage 1';
const CC0 = { name: 'CC0 1.0', url: 'https://creativecommons.org/publicdomain/zero/1.0/' };
const LICENSES = { 'CC0-1.0': CC0, 'CC-BY-3.0': { name: 'CC BY 3.0', url: 'https://creativecommons.org/licenses/by/3.0/' }, 'CC-BY-4.0': { name: 'CC BY 4.0', url: 'https://creativecommons.org/licenses/by/4.0/' } };
const SRC_URL = 'https://github.com/getcadcraft/library/tree/main/sources/entourage';

const want = new Map();
const outRoot = 'items/entourage';
const seen = new Set();
for (const e of entourage()) {
  const slug = e.slug, item = libraryItem(e);
  if (seen.has(slug)) { console.error('  ! two items named ' + slug); process.exit(1); }
  seen.add(slug);
  const why = L.validateItem(item, { partial: true });
  if (!why.ok) { console.error(`  ! ${item.name}: ${why.errors.join('; ')}`); process.exit(1); }
  const credit = {
    title: item.name,
    source_title: 'drawn by CadCraft',
    author: 'CadCraft',
    author_from: 'Drawn by CadCraft from numbers (seeded shapes): no outside model, photo or product.',
    license: 'CC0-1.0',
    license_url: CC0.url,
    library: 'CadCraft entourage',
    library_url: SRC_URL,
    commit: GENERATOR,
    source_kind: 'own',
    source_url: SRC_URL,
    notes: [],
    changes: 'None: drawn for this library.',
    attribution: `“${item.name}” by CadCraft, CC0 1.0 (${CC0.url}).`,
  };
  want.set(path.join(outRoot, slug, 'item.json'), JSON.stringify(withTranslations('entourage', slug, item)));   // CadCraft 0.6 WL.7: names in other languages (translations/)
  want.set(path.join(outRoot, slug, 'preview.svg'), L.previewSvg(item));
  want.set(path.join(outRoot, slug, 'credit.json'), JSON.stringify(credit, null, 2) + '\n');
}

/** CREDITS.md from every items/<source>/<slug>/credit.json in the repo (the entourage as this run makes it). */
function credits() {
  const rows = [];
  for (const src of fs.readdirSync(path.join(ROOT, 'items')).sort()) {
    if (src === 'entourage') continue;
    for (const slug of fs.readdirSync(path.join(ROOT, 'items', src)).sort()) {
      const f = path.join(ROOT, 'items', src, slug, 'credit.json');
      if (fs.existsSync(f)) rows.push({ src, slug, ...JSON.parse(fs.readFileSync(f, 'utf8')) });
    }
  }
  const mine = [...want.entries()].filter(([k]) => k.endsWith('credit.json')).map(([k, v]) => ({ src: 'entourage', slug: path.basename(path.dirname(k)), ...JSON.parse(v) }));
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

const stale = fs.existsSync(path.join(ROOT, outRoot)) ? fs.readdirSync(path.join(ROOT, outRoot)).filter((d) => !want.has(path.join(outRoot, d, 'item.json'))) : [];
let diff = 0;
for (const [rel, text] of want) {
  const f = path.join(ROOT, rel);
  if (fs.existsSync(f) && fs.readFileSync(f, 'utf8') === text) continue;
  diff++;
  if (check) { if (diff <= 10) console.log('  differs: ' + rel); continue; }
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, text);
}
for (const d of stale) { diff++; if (check) console.log('  stale: ' + path.join(outRoot, d)); else fs.rmSync(path.join(ROOT, outRoot, d), { recursive: true }); }
const n = seen.size;
console.log(check ? (diff ? `${diff} file(s) differ from what the generator makes.` : `${n} entourage items: up to date.`) : `${n} entourage items made; ${diff} file(s) written or removed.`);
process.exit(check && diff ? 1 : 0);
