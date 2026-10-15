# The residential set

Cabinets, bathroom vanities, appliances, plumbing fixtures and furniture for laying out a house, **drawn by CadCraft** and
shared under [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/): use them for anything, no credit needed.

Made by `tools/make-residential.mjs` from `tools/residential/items.js` (no source files: the items are drawn in code).

## Sizes

Common nominal US residential sizes, not any maker's product:

- **Base cabinets** 34½" tall (36" with a counter top), 24" deep, a 4½" × 3" toe kick: 12"–36" wide (B), three-drawer (DB),
  sink bases (SB), a 36" lazy susan corner (LS36) and a 42" blind corner (BBC42).
- **Wall cabinets** 12" deep, hung with their bottom 54" above the floor (30" tall), or 69" / 72" (over a refrigerator or a
  range); a 24" corner wall cabinet.
- **Tall cabinets** 24" deep: pantries 84" / 90", an oven cabinet.
- **Vanities** 21" deep, 34½" tall with their top and oval sinks.
- **Appliances**: French-door refrigerators 33" / 36", ranges 30" / 36", a 24" dishwasher, an over-the-range microwave,
  chimney range hoods, a 27" washer and dryer, a 50-gallon water heater.
- **Plumbing fixtures**: an elongated toilet (drain 12" from the wall), a pedestal lavatory, drop-in kitchen sinks, a 60" ×
  30" alcove bathtub, showers 36" × 36" and 60" × 32", a laundry tub.
- **Furniture**: sofa, loveseat, armchair, dining chair, coffee / end / dining / round tables, a desk, twin / full / queen /
  king beds, a nightstand, a dresser, a bookcase, a media console.

## How they are drawn

Millimetres, Z up, the front faces −Y, the insertion point is the middle of the back at the floor, so wall snapping in
BimCraft puts an item's back on the wall. Things that hang or sit on a counter carry their own height (their source attribute
`CC-MOUNT-HEIGHT` says it, in mm): place them at the floor like everything else. Plan layers follow the library's layer
names (outlines; `-DETAIL` thin; `-ABOVE` dashed for things overhead; `CLEARANCE` and `SWING` dotted), so the previews and
the apps draw them the same way. Clearances (doors open, room in front of a toilet or a washer) are saved as named boxes.
