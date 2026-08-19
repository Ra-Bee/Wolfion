---
name: Wolfion produced-quantity source of truth
description: Which stored list drives finished-goods stock, and the dual-source pitfall behind stock/history mismatches
---

Finished-goods "stock available" on the dashboard = produced − sold. The
produced side must come from the `daily` list (dailyEntries / STORAGE_KEYS.daily),
NOT the `production` list (productionEntries / STORAGE_KEYS.production).

**Why:** two separate cloud arrays hold produced quantities. The daily-entry
form writes BOTH in sync (production row carries `sourceDailyId`), and
delete/edit sync both. But a now-unwired legacy `handleAddProduction` created
production-only rows (no `sourceDailyId`, no daily counterpart). Those inflate
any calc based on `productionEntries` while never appearing in the entry-history
table (which renders dailyEntries) — producing "stock 64 but history sums to 42"
reports.

**How to apply:** for any produced-quantity metric (inventory/stock,
productionByType, totalProducedDozen, electricity per-dozen allocation), aggregate
`dailyEntries.totalProductionDozen`. `DailyProductionEntry.productType` is
optional — fall back to `RECIPE_PRODUCT_TYPE_ID` (short-socks) for legacy rows.
Football full-sets are stored as separate top+bottom rows in both models (merged
only for display via `mergeComboDailyRows`), so switching source adds no new
double-count. The report export still passes raw `productionEntries`; treat
`dailyEntries` as canonical if you unify further.

**Orphan production rows:** editing/consolidating/deleting daily entries can
leave production rows whose `sourceDailyId` points to a daily entry that no longer
exists (or is undefined for old production-only-form rows). These are stale
duplicates, NOT extra real stock — they inflated old prod-based stock. To
reconcile both lists: drop every production row where `!sourceDailyId ||
!dailyIds.has(sourceDailyId)`. When deleting a daily row, also drop its linked
production row (else you create a new orphan).

**Manual reconciliation to a real-world count:** to force a product's total to a
known physical figure, append a labeled adjustment row (delta = target − current)
to BOTH lists — a positive delta adds, a negative delta reduces. Set all cost
fields to 0 (profit is sales-based so it's unaffected; only inventory value/yarn
stats shift). Link the production adjustment to the daily adjustment via
`sourceDailyId` so it isn't flagged as an orphan. Direct RTDB reconciliation is
done via a minted SA token (see wolfion-data-recovery.md); PUT the whole array,
then re-read to verify, and tell the user to hard-refresh open tabs.
