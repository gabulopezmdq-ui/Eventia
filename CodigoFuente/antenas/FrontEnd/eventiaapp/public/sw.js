const CACHE_NAME = "eventia-cache-v1";
const ASSETS_TO_CACHE = [
  "/",
  "/favicon.ico",
];

// Instalar el Service Worker y precargar recursos fundamentales
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activar el Service Worker y limpiar memorias caché obsoletas
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("PWA: Eliminando caché antigua:", cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Interceptar peticiones de red
self.addEventListener("fetch", (event) => {
  // Solo interceptar peticiones con método GET
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Excluir llamadas locales/API, archivos internos de Next.js (_next), y recargas en caliente de desarrollo
  if (
    url.pathname.startsWith("/api") || 
    url.pathname.includes("_next") || 
    url.hostname === "localhost" ||
    url.pathname.includes("webpack-hmr")
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Estrategia Stale-While-Revalidate: Responder rápido desde caché y actualizar de fondo
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse);
              });
            }
          })
          .catch(() => {
            // Ignorar fallos de red al refrescar caché de fondo
          });
        return cachedResponse;
      }

      // Si no está en caché, ir a la red
      return fetch(event.request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== "basic") {
            return networkResponse;
          }
          // Clonar y almacenar en caché para la próxima visita offline
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return networkResponse;
        })
        .catch((err) => {
          console.log("PWA: Error de red y recurso no cacheado:", err);
        });
    })
  );
});
