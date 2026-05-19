const CACHE_VERSION = "etxebus-v9";
const SHELL_CACHE = `etxebus-shell-${CACHE_VERSION}`;
const RUNTIME_CACHE = `etxebus-runtime-${CACHE_VERSION}`;

const SHELL_ASSETS = [
  "/manifest.webmanifest",
  "/config.local.js",
  "/html/cargando.html",
  "/html/principal.html",
  "/html/lineas.html",
  "/html/horarios.html",
  "/html/trayecto.html",
  "/html/login.html",
  "/html/registar.html",
  "/css/cargando.css",
  "/css/principal.css",
  "/css/lineas.css",
  "/css/horarios.css",
  "/css/trayecto.css",
  "/css/login.css",
  "/js/pwa-register.js",
  "/js/session.js",
  "/js/header.js",
  "/js/cargando.js",
  "/js/principal.js",
  "/js/lineas.js",
  "/js/horarios.js",
  "/js/trayecto.js",
  "/js/login.js",
  "/js/registar.js",
  "/js/mapa.js",
  "/js/routes-precomputed.js",
  "/image/logo.png",
  "/image/icon-192.png",
  "/image/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then(async (cache) => {
      const cacheResults = await Promise.allSettled(
        SHELL_ASSETS.map((asset) => cache.add(asset))
      );
      const failedAssets = cacheResults.filter((result) => result.status === "rejected");
      if (failedAssets.length) {
        console.warn("No se pudieron precachear algunos recursos de shell.", failedAssets.length);
      }
      await self.skipWaiting();
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== SHELL_CACHE && key !== RUNTIME_CACHE)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

function shouldBypassCache(requestUrl) {
  return (
    requestUrl.pathname.startsWith("/api/") ||
    requestUrl.pathname.startsWith("/docs/") ||
    requestUrl.pathname.endsWith(".pdf")
  );
}

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin || shouldBypassCache(requestUrl)) {
    return;
  }

  const isNavigation = event.request.mode === "navigate";

  if (isNavigation) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(async () => {
          const cache = await caches.open(RUNTIME_CACHE);
          const cached = await cache.match(event.request);
          return cached || caches.match("/html/principal.html");
        })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((response) => {
        const copy = response.clone();
        caches.open(RUNTIME_CACHE).then((cache) => cache.put(event.request, copy));
        return response;
      });
    })
  );
});
