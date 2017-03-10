// src/components/About/index.js
import React, { PropTypes, Component } from 'react';
import classnames from 'classnames';

import '../style.css';

export default class About extends Component {
  // static propTypes = {}
  // static defaultProps = {}
  // state = {}

  render() {
    console.log(nodeData);
    const { className, ...props } = this.props;
    return (
      <div className={classnames('About', className)}>
        <h1>
          About Me
        </h1>
      </div>
    );
  }
}
