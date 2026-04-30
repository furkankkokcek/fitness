const CACHE = 'fittrack-v2.0.1';
const ASSETS = ['/', '/index.html', '/manifest.json'];

self.addEventListener('install', e => {
  console.log('[SW] Install event');
  e.waitUntil(
    caches.open(CACHE).then(c => {
      console.log('[SW] Caching assets');
      return c.addAll(ASSETS).catch(err => {
        console.error('[SW] Cache error:', err);
        // Partial cache - devam et
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  console.log('[SW] Activate event');
  e.waitUntil(
    caches.keys().then(keys => {
      console.log('[SW] Cleaning old caches');
      return Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Network first strategy
  e.respondWith(
    fetch(e.request)
      .then(response => {
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE).then(cache => {
            cache.put(e.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(e.request).then(cached => {
          return cached || caches.match('/index.html');
        });
      })
  );
});

// Bildirimlere tıklanınca işle (Android & Desktop)
self.addEventListener('notificationclick', e => {
  console.log('[SW] Notification clicked');
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      for (let i = 0; i < clientList.length; i++) {
        if ('focus' in clientList[i]) {
          return clientList[i].focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

self.addEventListener('notificationclose', e => {
  console.log('[SW] Notification closed');
});

// Push notification (gelecek kullanım)
self.addEventListener('push', e => {
  console.log('[SW] Push notification:', e.data?.text());
  const text = e.data?.text() || 'FitTrack Bildirimi';
  const title = 'FitTrack ⏱️';
  
  e.waitUntil(
    self.registration.showNotification(title, {
      body: text,
      icon: '/fitness/icons/icon-192.png',
      badge: '/fitness/icons/icon-192.png',
      tag: 'fittrack-notification',
      requireInteraction: true,
      vibrate: [200, 100, 200, 100, 200]
    })
  );
});
