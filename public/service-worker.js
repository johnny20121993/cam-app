const CACHE_NAME = 'cams-v1.0.0';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/static/js/bundle.js',     // React build sẽ tự động tạo file này
  '/static/css/main.css',
  '/manifest.json'
];

// Cài đặt: cache các file tĩnh
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker: Đang cache file tĩnh');
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// Kích hoạt: xoá cache cũ nếu có
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
});

// Fetch: ưu tiên lấy từ cache (offline‑first), nếu không có thì lấy qua mạng
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});