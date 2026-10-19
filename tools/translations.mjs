// SPDX-License-Identifier: Apache-2.0
// Item names in other languages (CadCraft 0.6 WL.7): translations/<locale>.json → each item's `i18n` (format 1, optional).
//   { "@locale": "es-MX", "items": { "<source>/<slug>": { "name": "…", "description": "…", "type": "…", "params": { "<key>": "…" } } } }
// The generators (make-residential.mjs, make-entourage.mjs) call withTranslations() before they write an item, so their
// --check covers the translations too. A translation file is data: only those four fields are copied, each a string.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIR = path.join(ROOT, 'translations');
const FIELDS = ['name', 'description', 'type'];
let cache = null;

/** Every translation file: Map(locale → items object). */
export function translations() {
  if (cache) return cache;
  cache = new Map();
  if (!fs.existsSync(DIR)) return cache;
  for (const f of fs.readdirSync(DIR).filter((x) => x.endsWith('.json')).sort()) {
    const doc = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
    const locale = doc['@locale'] || f.replace(/\.json$/, '');
    if (doc.items && typeof doc.items === 'object') cache.set(locale, doc.items);
  }
  return cache;
}

/** The item with an `i18n` block for every language that translates `<source>/<slug>` (the same item when none does). */
export function withTranslations(source, slug, item) {
  const i18n = {};
  for (const [locale, items] of translations()) {
    const t = items[source + '/' + slug];
    if (!t || typeof t !== 'object') continue;
    const out = {};
    for (const k of FIELDS) if (typeof t[k] === 'string' && t[k].trim()) out[k] = t[k];
    if (t.params && typeof t.params === 'object') {
      const p = Object.fromEntries(Object.entries(t.params).filter(([, v]) => typeof v === 'string' && v.trim()));
      if (Object.keys(p).length) out.params = p;
    }
    if (Object.keys(out).length) i18n[locale] = out;
  }
  return Object.keys(i18n).length ? { ...item, i18n } : item;
}

/** Keys a translation file names that no generated item has (typos, removed items). */
export function unusedKeys(made) {
  const out = [];
  for (const [locale, items] of translations()) for (const k of Object.keys(items)) if (!made.has(k)) out.push(locale + ': ' + k);
  return out;
}
