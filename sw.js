importScripts('bower_components/dexie/dist/latest/Dexie.js'); 
importScripts('js/ting.js'); 
self.addEventListener('fetch',function (event) {
	console.log(event);
	if(event.request.url.match(/sw\/summary.csv$/)){
		event.respondWith(summaryResponse());
	}
});

// Grab control (in case I've got more than one tab open by accident)

if (typeof self.skipWaiting === 'function') {
  console.log('self.skipWaiting() is supported.');
  self.addEventListener('install', function(e) {
    // See https://slightlyoff.github.io/ServiceWorker/spec/service_worker/index.html#service-worker-global-scope-skipwaiting
    e.waitUntil(self.skipWaiting());
  });
} else {
  console.log('self.skipWaiting() is not supported.');
}

if (self.clients && (typeof self.clients.claim === 'function')) {
  console.log('self.clients.claim() is supported.');
  self.addEventListener('activate', function(e) {
    // See https://slightlyoff.github.io/ServiceWorker/spec/service_worker/index.html#clients-claim-method
    e.waitUntil(self.clients.claim());
  });
} else {
  console.log('self.clients.claim() is not supported.');
}


function summaryResponse(){
  console.time('build summary')

  var keys = ['album', 'artist', 'date'];
  var rows = [keys];

  return db
    .tracks
    .each(function(track){
      rows.push(
        row(keys, track)
      )
    })
    .then(function(){
      console.timeEnd('build summary');

      var data = new Blob(rows.map(function(row){
        return csv(row) + '\n';
      }));
      return new Response( data, {
        headers: { 'Content-Type': 'text/csv' }
      });
    })

}

// pull out a row of keys
function row(keys, obj){
  return keys.map(function(k){
    return obj[k]
  })
}
// create a csv row from an array
function csv(array){

  // this is not a world class csv generator
  return array.map(function(item){
    return  typeof(item) === 'string' ?
      item.replace(/[\",]/g,'') :
      item;
  }).join(',')
}


console.log('loaded');