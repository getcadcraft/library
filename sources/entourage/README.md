# Entourage

Trees, shrubs, a hedge, a potted plant, people and cars for site plans, sections and rendered pictures: the things that give a
building its scale. Drawn by CadCraft from numbers (seeded shapes: lofted trunks, displaced spheres for crowns, simple figures,
swept car bodies) — no outside model, photo or product — and shared under CC0 1.0.

- Generator: `tools/entourage/entourage.js` (a copy of the CadCraft site's `lib/entourage/entourage.js`), written out by
  `node tools/make-entourage.mjs --libitem <libitem.js>`.
- Millimetres, Z up, the front faces −Y; the insertion point is the middle of the item at the ground.
- Each item's source attribute `CC-RENDER-PARTS` lists its parts as triangle ranges with a colour (and, for glass, how much
  shows through): BimCraft places the item with each part in its colour, so trunks are brown and leaves green in every viewer.
- Low polygon counts (a few hundred triangles each), so a street of trees stays quick.
- People are stylised figures (the kind architects use for scale), not portraits of anyone.
