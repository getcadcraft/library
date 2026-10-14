# Standard parts

Mechanical standard parts drawn by CadCraft from the dimensions in published standard tables, shared under
[CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/): use them for anything, no credit needed.

Only the numbers are taken from each standard. Dimensions are facts; the standards' text, figures and layout are not
copied. Each table was checked against a second, independent open table where one exists (the FreeCAD Fasteners
Workbench data files for the ISO and ASME fasteners), and the CadCraft site's tests check the relations each standard
builds its table on.

| Family | Standard | Sizes in the table | Items here |
|---|---|---|---|
| Hex head screws (threaded to the head) | [ISO 4017:2022](https://www.iso.org/standard/72585.html) | M5–M36 | 14 |
| Hex bolts | [ISO 4014:2022](https://www.iso.org/standard/72579.html) | M5–M36; thread length by the standard's rule | 5 |
| Hex nuts, style 1 | [ISO 4032:2023](https://www.iso.org/standard/75016.html) | M5–M36 | 9 |
| Plain washers, normal series | [ISO 7089:2000](https://www.iso.org/standard/13666.html) | 5–36 | 9 |
| Hex bolts, inch | [ASME B18.2.1](https://www.asme.org/codes-standards/find-codes-standards/b18-2-1-square-hex-heavy-hex-askew-head-bolts-hex-heavy-hex-hex-flange-lobed-head-lag-screws) | 1/4–1 in, UNC | 6 |
| Hex nuts, inch | [ASME B18.2.2](https://www.asme.org/codes-standards/find-codes-standards/b18-2-2-nuts-general-applications-machine-screw-nuts-hex-square-hex-flange-coupling-nuts) | 1/4–1 in, UNC | 9 |
| Parallel pins, unhardened | [ISO 2338:1997](https://www.iso.org/standard/20001.html) | d 3–20 | 5 |
| Deep groove ball bearings | [ISO 15:2017](https://www.iso.org/standard/69977.html) | 60xx, 62xx, 63xx, bore 10–50 | 33 |
| Parallel keys, form A | [DIN 6885-1](https://www.din.de/en/getting-involved/standards-committees/nam/publications/wdc-beuth:din21:346315269) | shafts 6–130 mm | 16 |
| Spur gears | [ISO 54:1996](https://www.iso.org/standard/22644.html) modules, [ISO 53:1998](https://www.iso.org/standard/22643.html) basic rack | m 1–3 | 5 |

The full tables (more sizes and any length) are in `tools/shapes/parts.js`; CadCraft's library panel
makes any of them on the spot (its Standard tab), and PartCraft opens them as parametric parts.

## How they are drawn

Each item is a 2D drawing (no 3D body), in millimetres:

- screws, bolts and pins from the side, the bearing face of the head at the insertion point; threads by the usual
  convention (the root as a thin line, the end of the thread as a thick one);
- nuts, washers, bearings and gears face on, about their axis; bearings simplified (rings and the ball pitch circle);
  gears by the drawing convention (tip circle, pitch circle as a centre line, root circle thin), not tooth by tooth;
- keys from above.

Each item's `source_attrs` carry `CC-PART-TYPE`, `CC-PART-STD`, `CC-PART-SIZE`, `CC-PART-LENGTH` and `CC-PART-MATERIAL`:
CadCraft keeps them as block attributes and makes a parts list from them. Weights are from the nominal shape in steel
(7850 kg/m³), threads not taken off.

## Making them again

```sh
node tools/make-standard-parts.mjs --libitem <path to libitem.js> [--check]
```

`libitem.js` is the library item module from a BimCraft or CadCraft build (`app/libitem.js` in their repositories): it
draws each `preview.svg`. `tools/shapes/` is a copy of the CadCraft site's `lib/shapes/`; change it there, never here.
