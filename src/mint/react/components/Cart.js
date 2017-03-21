import React, { PropTypes, Component } from 'react';
import AddItem from './AddItem';

export default class Cart extends Component {

  listItems(hasItems, items) {
    return hasItems ? items.map(item =>
      <li><a href={item.original_link}>{item.original_link}</a></li>
    ) : <em>Please add some products to the cart.</em>;
  }

  render() {
    const { cart_id, addItem, items } = this.props;
    const hasItems = items.length > 0;
    return (
      <div>
      <h3>Cart</h3>
      <ul>{this.listItems(hasItems, items)}</ul>
      <AddItem cart_id={cart_id} addItem={addItem} />
      <button disabled={hasItems ? '' : 'disabled'}>
        Checkout
      </button>
    </div>
    );
  }
}
