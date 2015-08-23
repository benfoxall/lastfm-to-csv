// jsx --watch -x jsx js js

var Users = React.createClass({
  getInitialState: function(){
    return {users:[]}
  },
  componentDidMount: function(){
    fetch('/sw/users')
      .then(function(res){ return res.json() })
      .then(function(users){
        this.setState({users:users})
      }.bind(this))
  },
  render: function(){
    return <div>
      <hr />
      <h2>
        Service Worker <small>(experimental)</small>
      </h2>
      <p>
        This serves any past service worker
      </p>
      <hr />
      {this.state.users.map(function(user){
        return <User username={user} />
      })}
    </div>
  }
})


var User = React.createClass({
  getInitialState: function(){
    return {count:0}
  },
  componentDidMount: function(){
    fetch('/sw/count/' + this.props.username)
      .then(function(res){ return res.json() })
      .then(function(count){
        this.setState({count:count})
      }.bind(this))
  },
  _destroy: function(){
    fetch('/sw/destroy/' + this.props.username)
      .then(function(){
        this.setState({destroyed:true})
      }.bind(this))
  },
  render: function(){

    if(this.state.destroyed) return <div> - {this.props.username}</div>;

    var name = this.props.username + '.csv'
    var url = 'sw/tracks/' + name;
    return <div>
      <h1>
        {this.props.username} <small>{this.state.count || ''}</small>
      </h1>
      <p>
        <a href={url}>{url}</a>
      </p>
      <p>
        <a className="btn btn-success" href={url}>
          download
        </a> <a className="btn btn-danger" onClick={this._destroy}>
          delete
        </a>
      </p>
    </div>
  }
})
