const CACHE = "cuntas-v8";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
];
// The on-device receipt reader (optional — app works without it, scan reading needs it)
const VENDOR = [
  "./fonts/built-titling.woff2",
  "./fonts/built-titling.woff",
  "./vendor/tesseract.min.js",
  "./vendor/worker.min.js",
  "./vendor/tesseract-core-simd-lstm.wasm.js",
  "./vendor/eng.traineddata.gz",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    (async () => {
      const c = await caches.open(CACHE);
      await c.addAll(ASSETS);
      // cache reader files individually so a missing one never breaks the app
      await Promise.all(VENDOR.map((v) => c.add(v).catch(() => {})));
    })()
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then(
      (hit) =>
        hit ||
        fetch(e.request).then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
          return res;
        })
    )
  );
});
