import React, { PropTypes, Component } from 'react';
import { Item } from '..';
import { AddAmazonItemContainer } from '../../containers';

export default class Cart extends Component {
  static propTypes = {
    fetchItems: PropTypes.func.isRequired,
    cart_id: PropTypes.string.isRequired,
    accounts: PropTypes.arrayOf(PropTypes.object).isRequired,
    items: PropTypes.arrayOf(PropTypes.object)
      .isRequired
  }

  render() {
    const { cart_id, addItem, items, accounts } = this.props;

    const hasItems = items.length > 0;
    return (
      <div className='cart'>
          <div className='cart__add'>
            <AddAmazonItemContainer />
          </div>
          <div className='cart__title'>
            <h4>Group Shopping Cart</h4>
          </div>
          <div className='cart__items'>
            <ul>
              { 
                hasItems ? 
                  items.map((item, i) => <Item key={i} item={item} itemNumber={i+1} accounts={accounts}/>) 
                  : <em>Please add some products to the cart.</em>
              } 
            </ul>
          </div>
    </div>
    );
  }
}
