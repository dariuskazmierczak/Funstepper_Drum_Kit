// Set a name for the current cache
var cacheName = 'v2'; 

// Default files to always cache

	var cacheFiles = [
		 './',
		'/index.html',
		'/modules/lib.js',
		'/modules/db.js',
		'/js/app.js',
		'/css/style.css',
		'/data/volumes.json',
		'/data/instruments.json',
		'/data/sounds.json',
		'/mp3/kick1.mp3',
		'/mp3/snare1.mp3',
		'/mp3/percussion1.mp3',
		'/mp3/cowbell1.mp3',
		'/mp3/shaker1.mp3',
		'/mp3/hihat1.mp3',
		'/mp3/beep.mp3',
		'/mp3/bass1.mp3',
		'/mp3/bass2.mp3',
		'/mp3/brass1.mp3',
		'/mp3/brass2.mp3',
		'/mp3/marimba-g2.mp3',
		'/mp3/marimba-c3.mp3',
		'/mp3/marimba-dis3.mp3',
		'/mp3/marimba-f3.mp3',
		'/mp3/voice.mp3'
	
	];



self.addEventListener('install', function(e) {
    console.log('[ServiceWorker] Installed');

    // e.waitUntil Delays the event until the Promise is resolved
    e.waitUntil(

    	// Open the cache
	    caches.open(cacheName).then(function(cache) {

	    	// Add all the default files to the cache
			console.log('[ServiceWorker] Caching cacheFiles');
			return cache.addAll(cacheFiles);
	    })
	); // end e.waitUntil
});


self.addEventListener('activate', function(e) {
    console.log('[ServiceWorker] Activated');

    e.waitUntil(

    	// Get all the cache keys (cacheName)
		caches.keys().then(function(cacheNames) {
			return Promise.all(cacheNames.map(function(thisCacheName) {

				// If a cached item is saved under a previous cacheName
				if (thisCacheName !== cacheName) {

					// Delete that cached file
					console.log('[ServiceWorker] Removing Cached Files from Cache - ', thisCacheName);
					return caches.delete(thisCacheName);
				}
			}));
		})
	); // end e.waitUntil

});


self.addEventListener('fetch', function(e) {
	console.log('[ServiceWorker] Fetch', e.request.url);

	// e.respondWidth Responds to the fetch event
	e.respondWith(

		// Check in cache for the request being made
		caches.match(e.request)


			.then(function(response) {

				// If the request is in the cache
				if ( response ) {
					console.log("[ServiceWorker] Found in Cache", e.request.url, response);
					// Return the cached version
					return response;
				}

				// If the request is NOT in the cache, fetch and cache

				var requestClone = e.request.clone();
				return fetch(requestClone)
					.then(function(response) {

						if ( !response ) {
							console.log("[ServiceWorker] No response from fetch ")
							return response;
						}

						var responseClone = response.clone();

						//  Open the cache
						caches.open(cacheName).then(function(cache) {

							// Put the fetched response in the cache
							cache.put(e.request, responseClone);
							console.log('[ServiceWorker] New Data Cached', e.request.url);

							// Return the response
							return response;
			
				        }); // end caches.open

					})
					.catch(function(err) {
						console.log('[ServiceWorker] Error Fetching & Caching New Data', err);
					});


			}) // end caches.match(e.request)
	); // end e.respondWith
});
