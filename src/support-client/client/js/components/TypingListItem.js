import React, { Component, PropTypes } from 'react';

class TypingListItem extends Component {

  static propTypes = {
    username: PropTypes.string.isRequired
  };
  render() {
    return (
      <span>
        {this.props.username}
      </span>
    );
  }
}

export default TypingListItem