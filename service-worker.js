const CACHE_NAME = "acok-pwa-v38"; // 🔴 업데이트 시 이 숫자만 올리세요

const CORE_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/flower2.jpg",
  "/icon-192.png",
  "/icon-512.png"
];

// 설치
self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS))
  );
});

// 활성화 (이전 캐시 제거)
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// 🔑 핵심: 모든 요청을 index.html로 폴백
self.addEventListener("fetch", event => {
  event.respondWith(
    fetch(event.request)
      .then(res => res)
      .catch(() => caches.match("/index.html"))
  );
});
