import React, { Component, PropTypes} from 'react';


class Pane extends Component {
  render() {
    return (
      <div>
        {this.props.children}
      </div>
    );
  }
};

export default Pane