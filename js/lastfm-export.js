var username = 'benjaminf',
  key = 'c2899b0774a2eda7769be6eefddd94b6';

// make a request to lastFM
function lastFM(data){
  return reqwest({
    url:"http://ws.audioscrobbler.com/2.0/",
    data: data
  })
}

function requestData(api_key, user, page){
  return {
    method:'user.getrecenttracks',
    format:'json',
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



reqwest({
  url:"http://ws.audioscrobbler.com/2.0/",
  data: {
    method:'user.getrecenttracks',
    // format:'json',
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

function extractTracks(json){
  return json.recenttracks.track
}





//plan:
// linking up to a page
// if a form is submitted,
// and that form has a key, and username in it
// replace it with a list of the requests
// make the requests

