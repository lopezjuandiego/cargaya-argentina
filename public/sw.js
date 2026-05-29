const CACHE = "dondecargar-v1";

const OFFLINE_URL = "/offline";

const PRECACHE = [
  "/",
  "/buscar",
  "/offline",
  "/icon.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Solo interceptar requests al mismo origen
  if (url.origin !== self.location.origin) return;

  // No interceptar API routes ni crons
  if (url.pathname.startsWith("/api/")) return;

  // Assets estáticos (_next/static): cache-first
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((res) => {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(event.request, clone));
          return res;
        });
      })
    );
    return;
  }

  // Páginas: network-first, fallback a cache, fallback a offline
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        const clone = res.clone();
        caches.open(CACHE).then((c) => c.put(event.request, clone));
        return res;
      })
      .catch(() =>
        caches.match(event.request).then(
          (cached) => cached ?? caches.match(OFFLINE_URL)
        )
      )
  );
});
