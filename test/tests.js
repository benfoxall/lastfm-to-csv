// this is the first function I'm writing, so it's
// probably going to be a lot more tested than the rest
describe('request page', function(){

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


describe('extracting tracks', function(){

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