// jsx --watch -x jsx js js

var Users = React.createClass({displayName: "Users",
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
    return React.createElement("div", null, 
      React.createElement("hr", null), 
      React.createElement("h2", null, 
        "Stored data"
      ), 
      React.createElement("p", null, 
        "(experimental, requires Service Worker support)"
      ), 
      this.state.users.map(function(user){
        return React.createElement(User, {user: user, store: store})
      })
    )
  }
})


var User = React.createClass({displayName: "User",
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

    if(this.state.destroyed) return React.createElement("div", null, " - ", this.props.username);

    var name = this.props.user.name + '.csv'
    var url = 'sw/tracks/' + name;
    return React.createElement("div", null, 
      React.createElement("hr", null), 
      React.createElement("h1", null, 
        this.props.user.name, " ", React.createElement("small", null, this.props.user.playcount, " plays")
      ), 
      React.createElement("h3", null, 
        "Downloaded ", this.props.user._page, " / ", this.props.user._pages
      ), 
      React.createElement("p", null, 
        React.createElement("a", {href: url}, url)
      ), 
      React.createElement("p", null, 
        React.createElement("a", {className: "btn btn-success", onClick: this._request}, 
          "request", this.state.requesting ? 'ing' : ''
        )
        /*<a className="btn btn-danger" onClick={this._destroy}>
          delete
        </a>*/
      )
    )
  }
})
