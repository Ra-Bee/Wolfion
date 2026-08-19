---
name: Wolfion yarn-type data models
description: Two coexisting yarn-type paradigms over the same purchases store; how to bridge them.
---

# Wolfion yarn types: two paradigms, one store

Yarn purchases (`STORAGE_KEYS.yarnPurchases`) are written by two pages with
different shapes:

- **Dashboard** (`dashboard.tsx`): stores a free-text `yarnType` *name* on the
  purchase, and keeps a separate `string[]` custom-name list at
  `STORAGE_KEYS.yarnTypes` (seeded from `defaultYarnTypes`). No `yarnTypeId`.
- **Yarn Calculation** (`yarn-calculation.tsx`): uses the fixed
  `shortSocksYarnRecipe` ids via `yarnTypeId`, plus an `OTHER_ID = "other"`.

**Bridge:** `typeKeyOf(p) = p.yarnTypeId || p.yarnType || OTHER_ID`. Always group
and label purchases by this key on the calc page, or dashboard-added yarns
collapse into "Other".

**Why:** the two pages were built independently against the same key, so a
purchase has *either* an id *or* a name, never guaranteed both.

**How to apply:**
- Recipe yarn → store `yarnTypeId` = recipe id only.
- Custom yarn → store `yarnTypeId` = name AND `yarnType` = name (cross-page).
- When offering a custom-name picker, union `yarnTypes` with names already on
  purchases so legacy data stays selectable; map a typed name back to a recipe
  id if it matches a recipe label (avoid duplicate buckets).
- Future-need projection is recipe-only (custom yarns lack grams/dozen).
