"use strict";

//
// Declare Database
//
Dexie.Promise.on('error', function(err) {
// Log to console or show en error indicator somewhere in your GUI...
console.log("Uncaught error: " + err);
});

var db = new Dexie("lastFM");
db.version(1).stores({ tracks: "timePlayed, username" });
db.open();

function saveTracks (user, tracks) {
  tracks.forEach(function (track) {
    track.username = user;
    track.timePlayed = new Date(track.date).getTime();
    db.tracks.add(track);
  });

  return tracks;
}