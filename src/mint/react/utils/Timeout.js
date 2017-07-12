// react/utils/Timeout.js
// from https://stackoverflow.com/a/44691405/6465731

import React, { Component } from 'react';

export default Composition => class Timeout extends Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    this.timeouts = [];
  }

  setTimeout() {
    this.timeouts.push(setTimeout.apply(null, arguments));
  }

  clearTimeouts() {
    this.timeouts.forEach(clearTimeout);
  }

  componentWillUnmount() {
    this.clearTimeouts();
  }

  render() {
    const { timeouts, setTimeout, clearTimeouts } = this;

    return <Composition 
        timeouts={timeouts} 
        setTimeout={setTimeout} 
        clearTimeouts={clearTimeouts} 
        { ...this.props } />;
  }
};
