// jsx --watch -x jsx js js

var Users = React.createClass({
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
    return <div>
      {this.state.users.map(function(user){
        return <User user={user} key={user.name} store={store} />
      })}
      <hr />

      <button onClick={this._pause} className="btn btn-info">
        {this.props.queue.paused ? 'download': 'pause'}
      </button>
    </div>
  }
})


var User = React.createClass({
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

    if(this.state.destroyed) return <div> x - {this.props.username}</div>;

    var name = this.props.user.name + '.csv'
    var url = 'v2.html/sw/tracks/' + name;
    return <div>
      <hr />
      <h1>
        <a onClick={this._destroy} className="btn btn-danger">
          x
        </a>
        {this.props.user.name} <small>
        {this.props.user.counts.SUCCESS}/
        {this.props.user.counts.READY + this.props.user.counts.SUCCESS}
        </small>
      </h1>
      <p>
        <a href={url}>{url}</a>
      </p>
    </div>
  }
})
