import React, { PropTypes, Component } from 'react';
import { Item } from '..';
import { AddAmazonItemContainer } from '../../containers';

export default class Cart extends Component {
  static propTypes = {
    fetchItems: PropTypes.func.isRequired,
    cart_id: PropTypes.string.isRequired,
    members: PropTypes.arrayOf(PropTypes.object).isRequired,
    leader: PropTypes.object,
    items: PropTypes.arrayOf(PropTypes.object)
      .isRequired
  }

  render() {
    const { cart_id, addItem, items, members, leader } = this.props;

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
                  items.map((item, i) => <Item key={i} item={item} itemNumber={i+1} members={members} leader={leader}/>) 
                  : <em>Please add some products to the cart.</em>
              } 
            </ul>
          </div>
    </div>
    );
  }
}
