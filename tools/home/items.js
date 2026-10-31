/* SPDX-License-Identifier: Apache-2.0 */
/**
 * items.js — the home set: appliances, fixtures, hearths, utilities and vehicles of a house, drawn by CadCraft with smooth
 * lofted, turned and tubed solids and coloured parts, and shared under CC0 1.0. No DOM; tools/make-home.mjs writes them as
 * library items.   homeItems() → [{ slug, item }]
 */
import { slugify } from './kit.js';
import { bathItems } from './bath.js';
import { kitchenItems } from './kitchen.js';
import { hearthItems } from './hearth.js';
import { vehicleItems } from './vehicles.js';

export function homeItems() {
  const all = [...bathItems(), ...kitchenItems(), ...hearthItems(), ...vehicleItems()];
  const seen = new Set();
  return all.map((item) => {
    const slug = slugify(item.name);
    if (seen.has(slug)) throw new Error('two home items named ' + slug);
    seen.add(slug);
    return { slug, item };
  });
}
