// react/utils/Timeout.js
// from https://stackoverflow.com/a/44691405/6465731

import React, { Component } from 'react';

export default Composition => class Timeout extends Component {

  timeouts = [];

  createTimeout() {
    this.timeouts.push(setTimeout.apply(null, arguments));
  }

  clearTimeouts = () =>
    this.timeouts.forEach(clearTimeout)

  componentWillUnmount = () =>
    this.clearTimeouts()

  render = () =>
    <Composition
      timeouts={this.timeouts}
      createTimeout={this.createTimeout}
      clearTimeouts={this.clearTimeouts}
      { ...this.props } />
};