var username = 'benjaminf',
  key = 'c2899b0774a2eda7769be6eefddd94b6';

reqwest({
  url:"http://ws.audioscrobbler.com/2.0/",
  data: {
    method:'user.getrecenttracks',
    format:'json',
    user:username,
    api_key:key,
    limit:200,
    page:0
  }
})
.then(function (resp) {
  console.log(resp)
})




//plan:
// linking up to a page
// if a form is submitted,
// and that form has a key, and username in it
// replace it with a list of the requests
// make the requests

