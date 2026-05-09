// Wolfion service worker.
//
// IMPORTANT: API responses (anything under /api/) MUST be network-only.
// Caching them caused product data to go stale across sessions (e.g. an old
// product called "Wool Hiker" continued to appear in the catalog and on the
// product detail page even after the database was reseeded). Likewise, we
// avoid caching /products/*.jpg (the user-facing product image folder) so
// admins immediately see freshly uploaded images.
//
// We also bump the cache version on every behavioural change so that the
// activate handler purges stale caches from prior service worker versions.
const CACHE = "wolfion-shell-v46";
const SHELL = [
  "/",
  "/app-icon.jpg",
  "/favicon-32.png",
  "/favicon-192.png",
  "/splash.jpg",
  "/logo.svg",
  "/manifest.webmanifest",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL)).catch(() => undefined),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Drop every cache that is not the current version. This includes
      // older `wolfion-shell-v*` caches that may contain stale API or
      // product-image responses from a previous session.
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

// Routes that must always go to the network and never be cached.
function isNetworkOnly(url) {
  return (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/products/") // product image folder, content can change
  );
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  let url;
  try {
    url = new URL(req.url);
  } catch {
    return;
  }

  // Cross-origin requests are passed through untouched.
  if (url.origin !== self.location.origin) return;

  // API + product images: network-only, never read from or write to cache.
  if (isNetworkOnly(url)) {
    event.respondWith(fetch(req));
    return;
  }

  // Everything else: network-first with a cache fallback for offline support.
  event.respondWith(
    fetch(req)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((cache) => cache.put(req, copy)).catch(() => undefined);
        return res;
      })
      .catch(() => caches.match(req).then((hit) => hit || caches.match("/"))),
  );
});
