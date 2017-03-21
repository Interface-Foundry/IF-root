import React, { PropTypes, Component } from 'react';
import { Button, FormGroup } from 'react-bootstrap';
import AddItem from './AddItem';

export default class Cart extends Component {

  listItems(hasItems, items) {
    return hasItems ? items.map(item =>
      <li>{item.id}: <a href={item.original_link}>{item.name}</a><br/>{item.descrip}<br/>
      {item.email}, Quantity: {item.quantity}, ${item.price}, {item.paid ? 'Paid' : 'Unpaid'}, Total: ${item.total}
      </li>
    ) : <em>Please add some products to the cart.</em>;
  }

  render() {
    const { cart_id, addItem, items } = this.props;
    const hasItems = items.length > 0;
    return (
      <div>
      <h3>Cart</h3>
      <ul>{this.listItems(hasItems, items)}</ul>
      <FormGroup>
      <AddItem cart_id={cart_id} addItem={addItem} />
      <Button disabled={hasItems ? '' : 'disabled'}>
        Checkout
      </Button>
      </FormGroup>
    </div>
    );
  }
}
