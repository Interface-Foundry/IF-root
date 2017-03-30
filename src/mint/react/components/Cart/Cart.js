import React, { PropTypes, Component } from 'react';
import {Item} from '..';
import { AddAmazonItemContainer } from '../../containers';

export default class Cart extends Component {
  static propTypes = {
    fetchItems: PropTypes.func.isRequired,
    cart_id: PropTypes.string.isRequired,
    items: PropTypes.arrayOf(PropTypes.object).isRequired
  }

  render() {
    const { cart_id, addItem, items } = this.props;

    const hasItems = items.length > 0;
    return (
      <div>
          <div className='row'>
            <AddAmazonItemContainer />
          </div>
          <div className='row'>
            <h4>Group Shopping Cart</h4>
          </div>
          <div className='row'>
            <h1>Email@email.com</h1>
            <ul>
              { 
                hasItems ? 
                  items.map((item, i) => <Item key={i} item={item} />) 
                  : <em>Please add some products to the cart.</em>
              } 
            </ul>
          </div>
    </div>
    );
  }
}
