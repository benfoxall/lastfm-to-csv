describe('request data', function(){
  
  it('gives correct request properties', function(){

    requestData('my-key', 'benjaminf')

    .should.have.properties({
      method:'user.getrecenttracks',
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





describe('extract tracks', function(){

  var tracks;

  before(function (done) {
    reqwest({
      url:'fixture.small.xml',
      type:'xml'
    }).then(function(doc){
      tracks = extractTracks(doc)
      done();
    })
  });

  it('got two tracks', function(){
    tracks.length.should.eql(2)
  })

  it('has correct first track', function(){
    tracks[0].should.have.properties({
      artist:'TEEN',
      name: 'Roses & Wine',
      album: 'In Limbo',
      date: '22 May 2014, 20:11',
      url: 'http://www.last.fm/music/TEEN/_/Roses+&+Wine'
    })
  })

  it('has correct second track', function(){
    tracks[1].should.have.properties({
      artist:'TEEN',
      name: 'Why Why Why',
      album: 'In Limbo',
      date: '22 May 2014, 20:05',
      url: 'http://www.last.fm/music/TEEN/_/Why+Why+Why'
    })
  })

})




describe('extract page count', function(){

  var pages;

  before(function (done) {
    reqwest({
      url:'fixture.small.xml',
      type:'xml'
    }).then(function(doc){
      pages = extractPageCount(doc)
      done();
    })
  });

  it('got 15412 pages', function(){
    pages.should.eql(15412)
  })

})


describe('row', function(){

  it('works', function(){
    row(['a','b'], {b: 100, a: 20, c: 30})
    .should.eql([20, 100])
  })

})

describe('csv', function(){

  it('works for numbers', function(){
    csv([1,2,3])
    .should.eql('1,2,3')
  })

  it('works for strings', function(){
    csv(['one',2,'three'])
    .should.eql('one,2,three')
  })

  // it('escapes ,', function(){
  //   csv(['one',',','three'])
  //   .should.eql('one,",",three')
  // })

  // it('escapes "', function(){
  //   csv(['one','"','three'])
  //   .should.eql('one,"\\"",three')
  // })

  it('removes problem characters', function(){
    csv(['o"n"e',',two,','"three"'])
    .should.eql('one,two,three')

  })

})


