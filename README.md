# CadCraft library

Openly licensed items for the [CadCraft](https://getcadcraft.com) family's library (LibraryCraft): furniture,
appliances, fixtures and other things you place in a drawing or a model. Each item comes with its author's name
and its license, so you can see who made it and how you may use it.

> **Status:** a pilot. The first items are 25 parts from the FreeCAD Parts Library. The library on
> getcadcraft.com is not open to the public yet.

## What is in this repo

- `items/<source>/<item>/`: one folder per item.
  - `item.json`: the item in the "CadCraft library item" format 1 (lengths in mm, Z up, the front faces −Y, the
    insertion point is the middle of the back at the bottom). The library adds the id, version, license and
    provenance when it publishes the item.
  - `preview.svg`: the plan drawing shown on library cards.
  - `credit.json`: who made it, the license, the source file it was made from and what was changed.
- `CREDITS.md`: every item with its author and license.
- `sources/<source>/`: where a set of items comes from, and the list of parts taken from it.
- `tools/`: the scripts that make the items from their sources.

## Licenses

**The items are not covered by this repo's Apache license.** Each item keeps the license its author chose,
named in its `credit.json` and in `CREDITS.md`:

- Items from the FreeCAD Parts Library: [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/) (some
  authors chose [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) for their own parts). You may use,
  change and share them for any purpose, as long as you credit the author, link the license and say what you
  changed. The `attribution` line in each `credit.json` does all three.

The scripts in `tools/` are ours, under the Apache License 2.0 (`LICENSE`).

None of the authors endorse CadCraft or how you use their work.

## Adding items from a source

```sh
# The FreeCAD Parts Library (about 5 GB): a blobless clone fetches only the files the list asks for.
git clone --filter=blob:none --no-checkout https://github.com/FreeCAD/FreeCAD-library.git ../FreeCAD-library
node tools/import-freecad.mjs --upstream ../FreeCAD-library --libitem <path to libitem.js>
```

`libitem.js` is the library item module from a BimCraft or CadCraft build (`app/libitem.js` in their
repositories) that reads STL. The script reads the source at the commit `sources/freecad/pilot.json` pins, so a
run gives the same items every time. See `sources/freecad/README.md` for how authors and licenses are found.

## Links

- The CadCraft family: https://getcadcraft.com
- FreeCAD Parts Library: https://github.com/FreeCAD/FreeCAD-library

---
CadCraft and the CadCraft logo are trademarks of The Data Design Group, Inc. FreeCAD is a trademark of its
respective owners; CadCraft is independent of the FreeCAD project and not affiliated with or endorsed by it.
