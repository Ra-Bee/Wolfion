---
name: Wolfion financial calculation decisions
description: Durable decisions for how Wolfion admin computes Profit, inventory stock, and recipe-less cost — and why.
---

**One source of truth.** All admin financial numbers (Production/Sales/Cost/
Profit) are computed at READ time from the canonical helpers in
`wolfion-store.ts` and reused by Dashboard, Inventory Report, and PDF. Never let
one page rely on another page having "recomputed" storage.

**Profit = sales-based (COGS), user-confirmed.** Profit = Sales revenue − the
production cost of ONLY the dozens actually sold. Unsold stock is NOT a loss; it
stays in inventory until sold. **Why:** the user reversed an earlier cash-flow
model (which subtracted the full period's production cost) because heavy
production vs. light sales made profit look wildly negative. Full production cost
is still shown, but only as informational "production cost", never as the profit
basis.

**PDF range-consistency.** Each report sale row carries its own cost and the PDF
sums it over the same range-filtered sales as the rest of the report. Do NOT
precompute a single period COGS at the call site — that desynced PDF profit from
the selected date range (range sales vs. all-time cost).

**Inventory stock seeds must be zero.** Live stock = opening seed + production −
sales, and the opening seed must be zero for every product type. **Why:**
non-zero seeds injected phantom stock (a type showed exactly its seed value), and
only the Inventory Report read the seeded constant while the Dashboard used a
zeroed copy, so the two pages disagreed. Real opening stock comes from production
entries, not seeds.

**Recipe-less products estimate yarn, NOT zero — this is intentional and
user-required.** Products with empty recipes (ankle-socks, others, mixed,
sports-football) must still carry a realistic yarn cost (estimated from a default
kg/dozen × prevailing price). **Why:** the user explicitly reported that
recipe-less products showing zero yarn cost was a bug. Do not "fix" this back to
zero — that reintroduces the reported bug. (A code-review bot has flagged this as
a violation of a stale Product-Setup spec; the live product requirement wins.)

**No electricity double-count.** Per-dozen overhead already bundles rent +
electricity + salary, so standalone electricity bills are never added to
production cost.
