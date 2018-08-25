self.addEventListener('install', e => {
  const urlsToCache = [
    '/',
    'index.html',
    'restaurant.html',
    'js/dbhelper.js',
    'js/main.js',
    'js/restaurant_info.js',
    'css/styles.css',
    'img/1.jpg',
    'img/2.jpg',
    'img/3.jpg',
    'img/4.jpg',
    'img/5.jpg',
    'img/6.jpg',
    'img/7.jpg',
    'img/8.jpg',
    'img/9.jpg',
    'img/undefined.jpg'
  ];

  e.waitUntil(
    caches
      .open('restaurant-reviews-v3')
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.log('you goofed', err);
      })
  );
});

self.addEventListener('fetch', e => {
  if (
    e.request.cache === 'only-if-cached' &&
    e.request.mode !== 'same-origin'
  ) {
    return;
  }
  e.respondWith(
    caches
      .match(e.request)
      .then(res => {
        if (res) return res;
        return fetch(e.request);
      })
      .catch(err => {
        console.log('you fucked up', err);
      })
  );
});
