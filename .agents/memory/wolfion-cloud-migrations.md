---
name: Wolfion cloud-list migrations
description: How to safely add new default products/options when lists are cloud-stored in Firebase RTDB
---

Changing code-level default lists does NOT reach existing admins — product
lists are cloud-stored (`useCloudStored`) and defaults only apply when nothing
is stored. To ship (or retire) an option for existing data, add a migration
effect that rewrites the stored lists by id.

**Why:** `useCloudStored` pre-seeds from localStorage and queues pre-auth writes
(`pendingWriteRef`) that flush to RTDB on sign-in — a migration that writes before
the first cloud snapshot can clobber newer cloud data with a stale local mirror.

**How to apply:**
- Gate the migration on the `cloudReady` flag (3rd tuple element of
  `useCloudStored`) for EVERY key it touches.
- Set the one-shot per-device localStorage "migrated" flag only after a later
  effect pass confirms the stored values are fully clean, never right after
  calling the setters — optimistic writes can fail and would be marked done.
- When a migration splits/renames records that other records link to by id,
  derive the new ids deterministically from the old id so a retried run after
  a partial write failure can still remap links.
- When splitting a numeric value in two, compute the second half as
  `value - firstHalf` so the sum is exact (no double-rounding drift).
- Before retiring a legacy option, verify ALL linked record kinds are clean —
  a completion check that skips one kind can permanently strand stale links.
- Run the migration hook from the shared admin layout so it fires on any
  admin page; also keep any local default-list copies and image maps in sync.
