---
name: Wolfion dashboard retroactive recompute
description: Why editing/deleting a product config silently rewrites historical daily entries, and the delete guard that protects it.
---

The Wolfion admin dashboard runs a retroactive recompute `useEffect` that
rewrites EVERY saved daily production entry (yarnUsedKg, totalCost, costPerDozen)
whenever its inputs change — yarn purchases AND, since Product Setup, the
per-product `productConfigs` (yarn recipes).

**Consequence:** if a product config is deleted, `recipeForProduct` returns `[]`
for that product. The recompute now routes recipe-less products through
`productYarnCost`, which ESTIMATES yarn cost (default kg/dozen × prevailing yarn
price) instead of zeroing it. So deletion no longer zeroes history, but the
estimate ≠ the original recipe cost, so it still silently changes past
accounting — the delete guard still matters.

**Why:** historical cost is intentionally NOT frozen per entry; it auto-tracks
date-effective yarn prices. Recipe edits ride the same path, so a recipe change
also retroactively re-prices history (accepted behaviour). Deletion is the one
destructive case.

**How to apply:** never allow deleting a `productConfig` that is referenced by
any saved production/sales/daily entry. Product Setup guards this (blocks delete
when usageCount>0). If you ever want truly immutable history, snapshot the
recipe/price into each entry at creation instead of recomputing.

## Legacy entries have no productType
Daily entries saved before product types existed have `productType: undefined`.
They must be treated as short socks (`RECIPE_PRODUCT_TYPE_ID`). `recipeForProduct`
applies this fallback centrally; any per-product grouping key must also use
`e.productType || RECIPE_PRODUCT_TYPE_ID` (NOT `|| ""`), or legacy production is
dropped from yarn need/consumption aggregation and recomputed to zero cost.
