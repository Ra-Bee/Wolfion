---
name: Wolfion touch-scroll traps
description: Two causes of "page won't scroll" on Wolfion — body overscroll/overflow-x rule, and pointer-capture tilt effects.
---

# Wolfion touch-scroll traps

## 1. body overflow-x + overscroll-behavior kills ALL scrolling (Aug 2026, the big one)
**Rule:** never put `overflow-x: hidden` together with `overscroll-behavior: none` on `<body>`. `overflow-x: hidden` makes body its own scroll container (computed overflow-y becomes auto); body has nothing to scroll, and `overscroll-behavior: none` then blocks scroll chaining to the real page scroller — so wheel/touch over ANY content scrolls nothing. Only gestures on `position: fixed` elements (header, bottom nav) still scrolled, which was the diagnostic tell.
**How to apply:** pull-to-refresh suppression (`overscroll-behavior-y: none`) belongs on `<html>` (the viewport scroller) only. Horizontal clip on html. Symptom signature: "scrolls when touching header, dead everywhere else, on desktop AND phone".

## 2. pointer-capture tilt effects block finger scroll
**Rule:** interactive image effects (3D tilt, parallax) that call `setPointerCapture` on large elements must be disabled on touch devices via `matchMedia("(hover: none), (pointer: coarse)")` guard; `touch-action: pan-y` alone is not reliably enough.

## Debugging notes
- Programmatic scroll (scrollIntoView, `__scroll` param) still works when either bug is active — screenshot-based checks cannot see scroll bugs.
- The Playwright testing subagent's emulated swipes also scrolled fine while real devices failed — trust the user's symptom description (what still scrolls vs what doesn't) over emulation.
