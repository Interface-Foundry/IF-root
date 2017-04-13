import React, { Component } from 'react';

class Team extends Component {
  constructor(props) {
    super(props);
  }
  render() {
   return (<div>
      {JSON.stringify(this.props)}
    </div>)
  }
}

export default Team;