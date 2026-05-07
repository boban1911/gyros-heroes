/* Gyros Heroes Scanner — minimal service worker.
 *
 * v1: network-first cache for the SPA shell only. No offline scan support.
 * Plain JS lives in /public/scan/ so Vite copies it verbatim to /scan/sw.js
 * with a stable URL — service workers cannot use hashed filenames.
 */

const CACHE_NAME = 'gh-scanner-shell-v1';
const SHELL_URLS = ['/scan/', '/scan/index.html', '/scan/manifest.webmanifest'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(SHELL_URLS))
      .catch(() => undefined)
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GETs scoped to /scan/ — never intercept API calls.
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (!url.pathname.startsWith('/scan/')) return;
  if (url.pathname.startsWith('/scan/api/')) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache a copy of successful basic responses for the shell.
        if (response.ok && response.type === 'basic') {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => undefined);
        }
        return response;
      })
      .catch(() => caches.match(request).then((cached) => cached || caches.match('/scan/'))),
  );
});
