import React, { PropTypes, Component } from 'react';

export default class Footer extends Component {
  render() {
  	const { addItem, original_link, cart_id, replace } = this.props;
    return (
      <footer className='item__footer'>
        <button onClick={() => addItem(cart_id, original_link, replace)}>Add to Cart</button>
      </footer>
    );
  }
}
