
// make a request to lastFM
function lastFM(data, callback){
  return reqwest({
    url:"https://ws.audioscrobbler.com/2.0/",
    data: data,
    type: 'xml',
    success: function(data){
      if(callback){callback(false, data)}
    },
    error: function(err){
      if(callback){callback(err)}
    }
  })
}

// generate data for a request
function requestData(api_key, user, page){
  return {
    method:'user.getrecenttracks',
    user:user,
    api_key:api_key,
    limit:200,
    page: page || 1
  }
}

// generate a list of request data objects
function requestList(api_key, user, page_count){
  var requests = [];
  for(var page = 1; page <= page_count; page++){
    requests.push(requestData(api_key, user, page))
  }
  return requests;
}

// extract the data from the xml response
function extractTracks(doc,from){

  // probably nicer ways to do this
  var arr = [];
  var track, obj, child;
  var tracks = doc.evaluate('lfm/recenttracks/track', doc, null, XPathResult.ANY_TYPE, null)
  while (track = tracks.iterateNext()){
    obj = {};
    for (var i = track.childNodes.length - 1; i >= 0; i--) {
      child = track.childNodes[i];
      obj[child.tagName] = child.textContent;
    };
    if (Date.parse(obj.date)>=from.getTime() || from == null)
      arr.push(obj)
    else 
      return arr;
  }
  return arr;
}

function extractPageCount(doc){
  var recenttracks = doc.evaluate('lfm/recenttracks', doc, null, XPathResult.ANY_TYPE, null).iterateNext()
  return parseInt(recenttracks.getAttribute('totalPages'), 10)
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

// delay a function by millis
function delay(fn, millis){
  return function(){
    var args = [].slice.call(arguments);
    setTimeout.apply(this, [fn,millis].concat(args));
  }
}


/*
var output = [];

// find the page count
lastFM(requestData(key, username))
.then(extractPageCount)
.then(function(page_count){

  // request all pages
  requestList(key, username, page_count)
  // .slice(0,30) // actually only 5
  .forEach(function(r,i){
    setTimeout(function(){
      lastFM(r)
      .then(extractTracks)
      .then(function(tracks){
        console.log('.')
        // output[0].map(function(d){return row(['artist', 'name', 'date'], d)}).map(csv).join('\n')
        output[i] = new Blob([tracks.map(function(d){return row(['artist', 'name', 'date'], d)}).map(csv).join('\n'),'\n'])
      })
    },  i * 1000)
  })
})

// b = new Blob(output, {type: 'text/csv'})
// saveAs(b)

*/
