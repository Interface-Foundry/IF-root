import React, { PropTypes, Component } from 'react';

export default class Footer extends Component {

  static propTypes = {
    cart_id: PropTypes.string.isRequired,
    replace: PropTypes.func.isRequired,
    item_id: PropTypes.string.isRequired,
    addItem: PropTypes.func.isRequired
  }

  render() {
    const { addItem, item_id, cart_id, replace } = this.props;
    console.log('cart', cart_id);
    console.log('item_id', item_id);
    return (
      <footer className='item__footer'>
        <button onClick={() => addItem(cart_id, item_id, replace)}>Add to Cart</button>
      </footer>
    );
  }
}
