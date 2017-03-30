import React, { PropTypes, Component } from 'react';

export default class Header extends Component {
  static propTypes = {
    cart_id: PropTypes.string.isRequired
  }

  render() {
    const { cart_id } = this.props;

    return (
      <nav>
        <h1>
          Cart ID #{cart_id}
        </h1>
      </nav>
    );
  }
}
