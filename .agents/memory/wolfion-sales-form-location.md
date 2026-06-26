---
name: Wolfion Daily Sales Entry form lives in dashboard.tsx
description: Which file actually renders the sales-entry form the user edits, vs. the dead daily-sales.tsx page
---

The "Daily Sales Entry" form the user sees and asks to tweak is the card **inside `artifacts/wolfion/src/pages/admin/dashboard.tsx`** (search `CardTitle ... Daily Sales Entry`), NOT `artifacts/wolfion/src/pages/admin/daily-sales.tsx`.

**Why:** `daily-sales.tsx` is wired to the `/admin/daily-sales` route but the user navigates to the dashboard's inline sales card; editing `daily-sales.tsx` produces no visible change for them. Cost one wasted round-trip.

**How to apply:** For any "daily sales entry" UI request, edit the form block in `dashboard.tsx`. The dashboard also holds the live versions of other entry forms (e.g. the auto-calc yarn table also exists here, mirrored in `daily-production.tsx`). When a user reports "I can't see the change", first confirm you edited the surface that is actually routed/rendered before assuming a cache/deploy issue.
