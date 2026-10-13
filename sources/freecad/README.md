# FreeCAD Parts Library

- Source: https://github.com/FreeCAD/FreeCAD-library, at the commit pinned in `pilot.json`.
- License: every part is under [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/) (the library's
  `LICENSE-Assets`), copyrighted by its own author. Each part must be credited to its author.

## The pilot (`pilot.json`)

25 parts that fit the library's categories (appliances, furniture, plumbing fixtures), each with an STL file. We
left out, for now:

- parts named after a brand or a product (for example `IKEA_*`, `Maxim-Air`, `Dolce_Gusto_*`);
- `Architectural Parts/Wikihouse`, whose license has to be checked separately;
- doors, windows and roofs (no library category yet), and mechanical or electronic parts (no app places them yet);
- parts with only a FreeCAD or STEP file and no STL.

A part may carry `turn` (degrees counterclockwise, seen from above) when its front does not face −Y. Each turn
was checked by looking at the part from all four sides.

## How each part is credited

The importer (`tools/import-freecad.mjs`) finds:

1. **The author**: the `CreatedBy` property of the part's FreeCAD file when the author filled it in; otherwise
   the author of the git commit that first added the part, followed through renames and folder moves (the
   library's README says to look there). A part with no author found is left out.
2. **The license**: CC BY 3.0, or CC BY 4.0 when the part's own FreeCAD file says its author chose CC BY 4.0.
3. **A note for review** when the FreeCAD file's `License` property reads "All rights reserved". That is
   FreeCAD's default for every new document, and the library's `LICENSE-Assets` puts every part under CC BY 3.0,
   but the note is kept in `credit.json` so a person can review it.

Each `credit.json` keeps the source file, its commit and sha256, where the author's name came from, and what was
changed (converted from STL; turned, when needed; moved to the insertion point; a plan outline added).
