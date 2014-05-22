var username = 'benjaminf',
  key = 'c2899b0774a2eda7769be6eefddd94b6';

// make a request to lastFM
function lastFM(data){
  return reqwest({
    url:"http://ws.audioscrobbler.com/2.0/",
    data: data
  })
}

// generate data for a request
function requestData(api_key, user, page){
  return {
    method:'user.getrecenttracks',
    user:user,
    api_key:api_key,
    limit:200,
    page: page || 0
  }
}

// generate a list of request data objects
function requestList(api_key, user, page_count){
  var requests = [];
  for(var page = 0; page < page_count; page++){
    requests.push(requestData(api_key, user, page))
  }
  return requests
}

// extract the data from the xml response
function extractTracks(doc){

  // probably nicer ways to do this
  var arr = [];
  var track, obj, child;
  var tracks = doc.evaluate('lfm/recenttracks/track', doc)
  while (track = tracks.iterateNext()){
    obj = {};
    for (var i = track.children.length - 1; i >= 0; i--) {
      child = track.children[i];
      obj[child.tagName] = child.textContent;
    };
    arr.push(obj)
  }

  return arr;
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



reqwest({
  url:"http://ws.audioscrobbler.com/2.0/",
  data: {
    method:'user.getrecenttracks',
    user:username,
    api_key:key,
    limit:200,
    page:0
  },
  type:'xml'
})
.then(function (resp) {
  gr = resp;
  console.log(resp)
})


function requestPage(key, user, page){

  return reqwest({
    url:"http://ws.audioscrobbler.com/2.0/",
    data: {
      method:'user.getrecenttracks',
      format:'json',
      user:user,
      api_key:key,
      limit:200,
      page:page
    }
  })

}



//plan:
// linking up to a page
// if a form is submitted,
// and that form has a key, and username in it
// replace it with a list of the requests
// make the requests

