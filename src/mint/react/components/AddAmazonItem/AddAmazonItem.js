// react/components/AddAmazonItem/AddAmazonItem.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import NotificationBubble from '../NotificationBubble';
import { Icon } from '..';

export default class AddAmazonItem extends Component {
  constructor(props) {
    super(props);
    this.addItemToCart = ::this.addItemToCart;
  }

  static propTypes = {
    user_account: PropTypes.object.isRequired,
    numUserItems: PropTypes.number.isRequired,
    addingItem: PropTypes.func.isRequired,
    push: PropTypes.func.isRequired,
    cart_id: PropTypes.string
  }

  addItemToCart() {
    const { user_account, addingItem, cart_id, push } = this.props;
    addingItem(true);
    push(user_account.id ? `/cart/${cart_id}/m/item/add` : `/cart/${cart_id}/m/signin`);
  }

  render() {
    const { addItemToCart, props } = this;
    const { numUserItems, user_account } = props;
    return (
      <div className='add_to_amazon'>
        Add Item to Kip Cart
        <button className={`add_to_amazon__button ${!!user_account.id ? '' : 'yellow'}`} onClick={addItemToCart}>
          {
            !!user_account.id
            ? <Icon icon='Search'/>
            : null
          }
          {
            !!user_account.id
            ? 'Paste Amazon URL or Search' 
            : '+ Add Amazon Item'
          }
        </button>
        {numUserItems ? null : <NotificationBubble top={23} right={12}/>}
      </div>
    );
  }
}
