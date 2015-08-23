"use strict";

importScripts('bower_components/dexie/dist/latest/Dexie.js');
importScripts('js/ds_lastfm_local.js');

self.addEventListener('fetch', function (event) {
  var csvMatcher = event.request.url.match(/sw\/tracks\/(.*).csv$/)
  if(csvMatcher){
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

function buildCSVResponse(lastFmUsername){

  var keys = ['artist', 'album', 'name', 'date'];
  var rows = [keys];

  return LocalDb.getTracksFor(lastFmUsername)
    .each(function(track){
      rows.push(
        row(keys, track)
      );
    })
    .then(function(){
      var data = new Blob(rows.map(function(row){
        return csv(row) + '\n';
      }));
      return new Response( data, {
        headers: { 'Content-Type': 'text/csv' }
      });
    });
}


//
// CSV builder
//

function csv(array){

  // this is not a world class csv generator
  return array.map(function(item){
    return  typeof(item) === 'string' ?
      item.replace(/[\",]/g,'') :
      item;
  }).join(',')
}

// create a csv row from an array
function row(keys, obj){
  return keys.map(function(k){
    return obj[k]
  })
}
