const CACHE_NAME = "rentflow-v1";
const RUNTIME_CACHE = "rentflow-runtime-v1";

// Assets to cache on install
const PRECACHE_ASSETS = [
  "/",
  "/login",
  "/dashboard",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
];

// Install event - cache app shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Service Worker: Pre-caching app shell");
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
              console.log("Service Worker: Removing old cache", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - stale-while-revalidate strategy
self.addEventListener("fetch", (event) => {
  // Skip non-GET requests
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Return cached version if available
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // Clone the response
        const responseToCache = networkResponse.clone();

        // Update cache in background
        caches.open(RUNTIME_CACHE).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      });

      // Return cached version immediately, fetch updates cache
      return cachedResponse || fetchPromise;
    })
  );
});

// Background sync for offline inspections
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-inspections") {
    event.waitUntil(syncInspections());
  }
});

async function syncInspections() {
  try {
    const registration = await self.registration;
    if (registration.sync) {
      // Notify client to sync inspections
      const clients = await self.clients.matchAll();
      clients.forEach((client) => {
        client.postMessage({ type: "SYNC_INSPECTIONS" });
      });
    }
  } catch (error) {
    console.error("Service Worker: Background sync failed", error);
  }
}

