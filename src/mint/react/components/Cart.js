import React, { PropTypes, Component } from 'react';
import AddItem from './AddItem';

export default class Cart extends Component {

  listItems(hasItems, items) {
    return hasItems ? items.map(item =>
      <div>{JSON.stringify(item, null, 2)}</div>
    ) : <em>Please add some products to the cart.</em>;
  }

  render() {
    const { cart_id, addToCart, items } = this.props;
    const hasItems = items.length > 0;
    return (
      <div>
      <h3>Cart</h3>
      <div>{this.listItems(hasItems, items)}</div>
      <AddItem cart_id={cart_id} addToCart={addToCart} />
      <button disabled={hasItems ? '' : 'disabled'}>
        Checkout
      </button>
    </div>
    );
  }
}
