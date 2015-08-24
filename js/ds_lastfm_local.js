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
  db.version(3).stores({
    /*
      {
        priority: int,
        state: int,
        user: string,
        request: {parameters},
        response: {response_data},
      }
    */
    requests:  '++, priority, state, user, [user+state]'
  });

  db.open();

  function saveRequest(request){
    return db.requests.put(request)
  }

  function requestsFor(user){
    return db.requests
      .where('user').equals(user)
  }

  // for hacks
  function requests(){
    return db.requests
  }

  // export our API to window.
  return {
    saveRequest: saveRequest,
    requestsFor: requestsFor,
    requests: requests
  }

})();
