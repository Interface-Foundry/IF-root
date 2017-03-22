import React, { PropTypes, Component } from 'react';
import AddItemField from './AddItemField';
import Item from './Item'

export default class Cart extends Component {

  listItems(hasItems, items) {
    return hasItems 
     ? items.map((item, i) => <Item key={i} item={item} />) 
     : <em>Please add some products to the cart.</em>;
  }

  render() {
    const { cart_id, addItem, items } = this.props;
    const hasItems = items.length > 0;
    return (
      <div>
      <h3>Cart</h3>
      <ul>{this.listItems(hasItems, items)}</ul>
      <AddItemField cart_id={cart_id} addItem={addItem} />
    </div>
    );
  }
}
