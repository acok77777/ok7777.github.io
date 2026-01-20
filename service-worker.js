const CACHE_NAME = "ymg-cache-v6"; // ✅ 수정할 때마다 v 숫자 올리기

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (!req.url.startsWith("http")) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);

    const isHTML =
      req.mode === "navigate" ||
      (req.headers.get("accept") || "").includes("text/html");

    // ✅ HTML은 항상 최신 우선 + 성공하면 캐시에 저장
    if (isHTML) {
      try {
        const fresh = await fetch(req, { cache: "no-store" });
        cache.put(req, fresh.clone());
        return fresh;
      } catch (e) {
        const cached = await cache.match(req);
        return cached || Response.error();
      }
    }

    // ✅ 기타 파일(JS/CSS/이미지): 네트워크 성공 시 캐시 갱신, 실패 시 캐시
    try {
      const fresh = await fetch(req);
      cache.put(req, fresh.clone());
      return fresh;
    } catch (e) {
      const cached = await cache.match(req);
      return cached || Response.error();
    }
  })());
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
