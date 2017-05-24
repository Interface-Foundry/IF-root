import React, { Component } from 'react';
import { PropTypes } from 'prop-types';

export default class Link extends Component {
  static propTypes = {
    to: PropTypes.string,
    children: PropTypes.array,
    className: PropTypes.string
  };

  render() {
    const { to, children, className } = this.props;
    return (
      <a className={className} href={to}>{children}</a>
    );
  }
}
