// indexedDB

const indexedDB =
  self.indexedDB ||
  self.mozIndexedDB ||
  self.webkitIndexedDB ||
  self.msIndexedDB;

if (!self.indexedDB) {
  self.alert(
    'Your browser doesn\'t support a stable version of IndexedDB. Such and such feature will not be available.'
  );
}

var db;

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

  fetch('http://localhost:1337/restaurants')
    .then(res => {
      return res.json();
    })
    .then(res => {
      // set('data', res);
      console.log(res, 'sw-res');

      var request = indexedDB.open('restaurant-db', 1);

      request.onerror = function() {
        window.alert('Yo man, let me get some of that database access!');
      };
      request.onupgradeneeded = function(event) {
        db = event.target.result;

        var objectStore = db.createObjectStore('restaurants', {
          keyPath: 'id'
        });

        objectStore.createIndex('name', 'name', { unique: true });
        objectStore.createIndex('cuisine', 'cuisine', { unique: false });

        objectStore.transaction.oncomplete = function() {
          var restaurantObjectStore = db
            .transaction('restaurants', 'readwrite')
            .objectStore('restaurants');
          res.forEach(function(restuarant) {
            restaurantObjectStore.add(restuarant);
          });
        };
      };
      request.onsuccess = function(event) {
        db = event.target.result;
        console.log('FUCK YEAH!', event);
        db.onerror = function(event) {
          alert(
            'Error Will Robinson... beep... boop...',
            event.target.errorCode
          );
        };
      };
    })
    .catch(err => {
      console.log('damn son...', err);
    });
});

self.addEventListener('fetch', function(e) {
  /* console.log(e.request); */
  if (
    e.request.cache === 'only-if-cached' &&
    e.request.mode !== 'same-origin'
  ) {
    return;
  } else if (e.request.url === 'http://localhost:1337/restaurants') {
    console.log(e.request, 'bingo');
    var restaurantArray = [];
    var request = indexedDB.open('restaurant-db');

    request.onerror = function() {
      console.log('huh?');
    };

    request.onsuccess = function() {
      db = this.result;

      var objectStore = db
        .transaction('restaurants')
        .objectStore('restaurants');

      objectStore.openCursor().onsuccess = function(event) {
        var cursor = event.target.result;
        if (cursor) {
          restaurantArray.push(cursor.value);
          cursor.continue();
        } else {
          console.log(restaurantArray);
          return restaurantArray;
        }
      };

      return fetch(e.request);
    };
  } else {
    e.respondWith(
      caches
        .match(e.request)
        .then(res => {
          if (res) return res;
          return fetch(e.request);
        })
        .catch(err => {
          console.log('you fool!', err);
        })
    );
  }
});
