var STATE = {
  READY:     1,
  // REQUESTED: 2, // not really used
  FAILED:    3,
  SUCCESS:   4
};

importScripts('bower_components/dexie/dist/latest/Dexie.js');
importScripts('js/ds_lastfm_local.js');

self.addEventListener('fetch', function (event) {
  var csvMatcher = event.request.url.match(/sw\/tracks\/(.*)\.csv$/)
  if(csvMatcher){
    console.log("MATCH")
    event.respondWith(buildCSVResponse(csvMatcher[1]));
  }

  if(event.request.url.match(/sw\/users$/)){
    event.respondWith(
      LocalDb.usernames()
        .then(JSONResponse)
    )
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


function JSONResponse(obj){
  return new Response( JSON.stringify(obj), {
    headers: { 'Content-Type': 'application/json' }
  });
}

var quoteRegex = /[\",]/g;

function buildCSVResponse(lastFmUsername){

  console.time("generate csv")

  var keys = ['artist', 'album', 'name', 'date'];
  var rows = [csv(keys) + '\n'];
  var str = csv(keys) + '\n'

  return LocalDb.requests()
    .where('[user+state]').equals([lastFmUsername, STATE.SUCCESS])
    .each(function(req){
      rows.push(
        req.response.map(function(t){
          return csv(row(keys, t)) + '\n'
        }).join('').replace(quoteRegex,'')
      )
    })
    .then(function(){
      var data = new Blob(rows);
      console.timeEnd("generate csv")
      return new Response( data, {
        headers: { 'Content-Type': 'text/csv' }
      });
    });
}

// 930 docs
//
// nothing at all - 2533.488ms
// straight string  -  7123.787ms
// array of strings - 7587.591ms
// array of bigger strings -  5898.709ms
// array of blobs per response  - 8572.458ms
// no blob (straigh text response) - 6401.046ms
// ..turns out the big sink was the csv regex

//
// CSV builder
//

function csv(array){

    // this is *definitely* not a world class csv generator
  return array.join(',');

  // this is not a world class csv generator
  // return array.map(function(item){
  //   return  typeof(item) === 'string' ?
  //     item.replace(/[\",]/g,'') :
  //     item;
  // }).join(',')
}

// create a csv row from an array
function row(keys, obj){
  return keys.map(function(k){
    return obj[k]
  })
}
