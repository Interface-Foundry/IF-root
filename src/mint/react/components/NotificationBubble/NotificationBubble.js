import React, { Component, PropTypes } from 'react';

export default class AddAmazonItem extends Component {

  static propTypes = {
    top: PropTypes.number,
    bottom: PropTypes.number,
    left: PropTypes.number,
    right: PropTypes.number,
  }

  render() {
    const { top = null, bottom = null, left = null, right = null } = this.props;
    return (
      <div className='notification_bubble' style={{top: top, bottom: bottom, left: left, right: right}}/>
    );
  }
}
