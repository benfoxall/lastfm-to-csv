describe('request data', function(){
  
  it('gives correct request properties', function(){

    requestData('my-key', 'benjaminf')

    .should.have.properties({
      method:'user.getrecenttracks',
      format:'json',
      user:'benjaminf',
      api_key:'my-key',
      limit:200,
      page:0
    })

  })

  it('gives a request properties for page 50', function(){

    requestData('my-key', 'benjaminf', 50)

    .should.have.properties({
      method:'user.getrecenttracks',
      format:'json',
      user:'benjaminf',
      api_key:'my-key',
      limit:200,
      page:50
    })

  })

})


describe("request list", function(){
  var requests;
  before(function(){
    requests = requestList('my-key', 'benjaminf', 3)
  })

  it('gives 3 request objects', function(){
    requests.length.should.eql(3)
  })

  it('gives request objects with ascending pages', function(){
    var page = 0;
    requests.forEach(function(request){
      request.page.should.eql(page++)
    })
  })
})


describe('lastFM', function(){

  var request;

  var server, request;
  before(function (done) {


    reqwest({
      url:'fixture.xml',
      type:'xml'
    }).then(function(doc){
      console.log("SDD", doc);

      var xmlstr = (new XMLSerializer()).serializeToString(doc)

      server = sinon.fakeServer.create();
      server.respondWith([200, { "Content-Type": "application/xml" }, xmlstr]);

      request = lastFM(requestData('my-key', 'benjaminf'))

      done();
    })



   });
  after(function () { server.restore(); });


  it('returns a promise', function(){
    request.should.have.properties('then', 'always')
  })

  it('makes a request to the server', function(){
    server.requests.length.should.eql(1)
  })

  it('used the correct params', function(){
    var url = server.requests[0].url;
    url.should.containEql('method=user.getrecenttracks');
    url.should.containEql('user=benjaminf');
    url.should.containEql('api_key=my-key');
  })

})







// this is the first function I'm writing, so it's
// probably going to be a lot more tested than the rest
xdescribe('request page', function(){

  var server, request;
  before(function () { 
    server = sinon.fakeServer.create();
    server.respondWith([200, 
      { "Content-Type": "application/json" }, 
      JSON.stringify(fixtures.single)])
   });
  after(function () { server.restore(); });

  before(function(){
    request = requestPage('api-key', 'barry', 0)
  });

  it('returns a promise', function(){
    request.should.have.properties('then', 'always')
  })

  it('made a request', function(){
    console.log(server)
    server.requests.length.should.eql(1)
  })

  it('used the correct params', function(){
    var url = server.requests[0].url;
    url.should.containEql('method=user.getrecenttracks');
    url.should.containEql('user=barry');
    url.should.containEql('api_key=api-key');
  })

  describe('on server response', function(){
    var callback = sinon.spy();

    before(function(){
      request.then(callback);
      server.respond()
    })

    it('called back', function(){
      callback.called.should.be.true
    })

    // crazy ugly
    it('gives the response', function(){
      console.log(callback.args)
      callback.args[0][0].recenttracks.track[0].artist['#text'].should.eql("Future Islands")
    })

  })

})


xdescribe('extracting tracks', function(){

  var extracting;
  before(function(){
    extracting = extractTracks(fixtures.single);
  });

  it('found two tracks', function(){
    extracting.length.should.eql(2)
  })

  it('normalised slightly', function(){
    extracting[0].artist.should.eql('Future Islands');
    extracting[0].name.should.eql('Seasons (Waiting on You)');
    extracting[0].date.should.eql("21 May 2014, 18:51");
  })

})