// jsx --watch -x jsx js js

var Users = React.createClass({
  getInitialState: function(){
    return {users:[]}
  },
  componentDidMount: function(){
    this.props.store.users()
      .then(function(users){
        this.setState({users:users})
      }.bind(this))
  },
  render: function(){
    var store = this.props.store;
    return <div>
      <hr />
      <h2>
        Stored data
      </h2>
      <p>
        (experimental, requires Service Worker support)
      </p>
      {this.state.users.map(function(user){
        return <User user={user} store={store} />
      })}
    </div>
  }
})


var User = React.createClass({
  getInitialState: function(){
    return {count:0}
  },
  componentDidMount: function(){
    console.log(this.props.user)
  },
  _request: function(){
    if(this.state.requesting) return;
    this.setState({requesting: true})
    // TEMP TESTING

    var key = $('api-key').val() || '974a5ebc077564f72bd639d122479d4b';

    var requests = requestList(key,
      this.props.user.name,
      this.props.user._pages,
      this.props.user._last,
      this.props.user._page + 1
    )

    var u = this.props.user;
    var store = this.props.store;

    requestNext();

    var i = 5;

    function requestNext(){
      var r = requests.shift();
      lastFM(r)
        .then(function(doc){
          console.log(doc)
          var tracks = extractTracks(doc);
          var to = extractFirstTrackTime(doc);

          Promise.all([
            store.saveResponse(
              {
                name: u.name,
                to: to,
                tracks: tracks
              }
            ),
            store.updateUser(u.name, {_page: r.page})
          ])
          .then(function(){
            requestNext()
          });

        })
    }
  },
  _destroy: function(){
    this.props.store.getTracksFor(this.props.username)
      .delete()
      .then(function(){
        this.setState({destroyed:true})
      }.bind(this))
  },
  render: function(){

    if(this.state.destroyed) return <div> - {this.props.username}</div>;

    var name = this.props.user.name + '.csv'
    var url = 'sw/tracks/' + name;
    return <div>
      <hr />
      <h1>
        {this.props.user.name} <small>{this.props.user.playcount} plays</small>
      </h1>
      <h3>
        Downloaded {this.props.user._page} / {this.props.user._pages}
      </h3>
      <p>
        <a href={url}>{url}</a>
      </p>
      <p>
        <a className="btn btn-success" onClick={this._request}>
          request{this.state.requesting ? 'ing' : ''}
        </a>
        {/*<a className="btn btn-danger" onClick={this._destroy}>
          delete
        </a>*/}
      </p>
    </div>
  }
})
