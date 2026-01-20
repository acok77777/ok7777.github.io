const CACHE_NAME = "ymg-v3"; // ← 숫자만 올리면 강제 업데이트됨

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null)));
      await self.clients.claim();
    })()
  );
});

// (중요) 캐시로 옛날거 주는걸 막고 항상 최신 네트워크 우선
self.addEventListener("fetch", (event) => {
  event.respondWith(
    (async () => {
      try {
        const fresh = await fetch(event.request, { cache: "no-store" });
        return fresh;
      } catch (e) {
        return caches.match(event.request);
      }
    })()
  );
});
