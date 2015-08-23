var LocalDb = (function() {
  "use strict";

  // Debug messages for Dexie (otherwise it swallows our messages)
  Dexie.Promise.on('error', function(err) {
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

  function getTracksFor (lastFmUsername) {
    console.log(lastFmUsername)
    return db
      .tracks
      .where('username').equals(lastFmUsername)
  }

  function usernames () {
    return db
      .tracks
      .orderBy('username')
      .uniqueKeys()
  }

  // export our API to window.
  return {
    getTracksFor: getTracksFor,
    saveTracks: saveTracks,
    usernames: usernames,
    db: db
  }

})();
