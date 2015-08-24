// jsx --watch -x jsx js js

var Users = React.createClass({displayName: "Users",
  getInitialState: function(){
    return {users:[]}
  },
  componentDidMount: function(){
    var ui = this.props.ui;

    var load = (function(){
      return ui()
        .then(function(state){
          this.setState({users:state})
        }.bind(this))
    }).bind(this);
    load();


    this.props.reload(function(){
      return load();
    }.bind(this))
  },
  _pause: function(){
    if(this.props.queue.paused){
      this.props.queue.resume()
    } else {
      this.props.queue.pause()
    }
  },
  render: function(){
    var store = this.props.store;
    return React.createElement("div", null, 
      this.state.users.map(function(user){
        return React.createElement(User, {user: user, key: user.name, store: store})
      }), 
      React.createElement("hr", null), 

      React.createElement("button", {onClick: this._pause, className: "btn btn-info"}, 
        this.props.queue.paused ? 'download': 'pause'
      )
    )
  }
})


var User = React.createClass({displayName: "User",
  getInitialState: function(){
    return {}
  },
  _destroy: function(){
    this.props.store.requestsFor(this.props.user.name)
      .delete()
      .then(function(){
        this.setState({destroyed:true})
        enqueue()
      }.bind(this))
  },
  render: function(){

    if(this.state.destroyed) return React.createElement("div", null, " x - ", this.props.username);

    var name = this.props.user.name + '.csv'
    var url = 'sw/tracks/' + name;
    return React.createElement("div", null, 
      React.createElement("hr", null), 
      React.createElement("h1", null, 
        React.createElement("a", {onClick: this._destroy, className: "btn btn-danger btn-sm"}, 
          "x"
        ), " ", this.props.user.name, " ", React.createElement("small", null, 
        this.props.user.counts.SUCCESS, "/", 
        this.props.user.counts.READY + this.props.user.counts.SUCCESS
        )
      ), 
      React.createElement("p", null, 
        React.createElement("a", {href: url}, url)
      )
    )
  }
})
