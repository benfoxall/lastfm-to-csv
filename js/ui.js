// jsx --watch -x jsx js js

var Users = React.createClass({displayName: "Users",
  getInitialState: function(){
    return {users:[]}
  },
  componentDidMount: function(){
    fetch('sw/users')
      .then(function(res){ return res.json() })
      .then(function(users){
        this.setState({users:users})
      }.bind(this))
  },
  render: function(){
    return React.createElement("div", null, 
      React.createElement("hr", null), 
      React.createElement("h2", null, 
        "Service Worker ", React.createElement("small", null, "(experimental)")
      ), 
      React.createElement("p", null, 
        "This serves any past service worker"
      ), 
      React.createElement("hr", null), 
      this.state.users.map(function(user){
        return React.createElement(User, {username: user})
      })
    )
  }
})


var User = React.createClass({displayName: "User",
  getInitialState: function(){
    return {count:0}
  },
  componentDidMount: function(){
    fetch('sw/count/' + this.props.username)
      .then(function(res){ return res.json() })
      .then(function(count){
        this.setState({count:count})
      }.bind(this))
  },
  _destroy: function(){
    fetch('sw/destroy/' + this.props.username)
      .then(function(){
        this.setState({destroyed:true})
      }.bind(this))
  },
  render: function(){

    if(this.state.destroyed) return React.createElement("div", null, " - ", this.props.username);

    var name = this.props.username + '.csv'
    var url = 'sw/tracks/' + name;
    return React.createElement("div", null, 
      React.createElement("h1", null, 
        this.props.username, " ", React.createElement("small", null, this.state.count || '')
      ), 
      React.createElement("p", null, 
        React.createElement("a", {href: url}, url)
      ), 
      React.createElement("p", null, 
        React.createElement("a", {className: "btn btn-success", href: url}, 
          "download"
        ), " ", React.createElement("a", {className: "btn btn-danger", onClick: this._destroy}, 
          "delete"
        )
      )
    )
  }
})
