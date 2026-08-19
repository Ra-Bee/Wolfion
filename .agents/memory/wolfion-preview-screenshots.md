---
name: Wolfion preview screenshots
description: How to reliably screenshot the shop home in headless preview
---
- Shop home lives at `/shop`, not `/` (root is the splash landing). Screenshot `/shop?__preview&__scroll=<anchor>` — `__preview` is the DEV-only Clerk bypass in App.tsx's ShopRouteWrapper.
- Use a tall viewport (1440x2600); `__scroll` anchors are flaky, retry if blank.
- Videos don't paint first frame headlessly — set a `poster` (ffmpeg first frame).
**Why:** screenshots at `/` always show the splash and look like a broken bypass.
