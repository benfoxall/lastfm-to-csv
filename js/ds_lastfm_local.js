var LocalDb = (function() {
  "use strict";

  // Debug messages for Dexie (otherwise it swallows our messages)
  Dexie.Promise.on('error', function(err) {
    console.log("Uncaught error: " + err);
  });

  var db = new Dexie("lastFM");
  db.version(1).stores({
    tracks: "timePlayed, username"
  });
  db.version(2).stores({
    users: "name, _page, _pages, _last",

    // responses from the api
    responses: "[name+to], name, to",

    // requestQueue: "++,name"

    // note: timePlayed can clash (even with single user)
    tracks: "timePlayed, username"
  });

  db.open();

  function saveUser(user) {
    return db.users.put(user);
  }

  function updateUser(name, data) {
    return db.users.update(name, data);
  }

  function saveResponse(response) {
    return db.responses.put(response);
  }

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

  function users () {
    return db
      .users
      .orderBy('name')
      .toArray()
  }

  // export our API to window.
  return {
    saveUser: saveUser,
    getTracksFor: getTracksFor,
    saveTracks: saveTracks,
    users: users,
    saveResponse: saveResponse,
    updateUser: updateUser,
    db: db
  }

})();
