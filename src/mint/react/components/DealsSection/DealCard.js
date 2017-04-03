import React, { Component, PropTypes } from 'react';

export default class DealCart extends Component {
  constructor(props) {
    super(props);
    console.log(props);
  }
  static propTypes = {
    deal: PropTypes.object.isRequired
  }
  render() {
    return (<div>{this.props.deal.name}</div>);
  }
}
