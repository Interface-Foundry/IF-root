// react/components/AddAmazonItem/AddAmazonItem.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import NotificationBubble from '../NotificationBubble';
import { AmazonFormContainer } from '../../containers';
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

  state = {
    clickedAmazonField: false
  }

  addItemToCart() {
    const { user_account, addingItem, cart_id, push } = this.props;
    addingItem(true);
    user_account.id //if they have an account, just switch the button to a text field
      ? this.setState({ clickedAmazonField: true })
      : push(`/cart/${cart_id}/m/signin`);
  }

  render() {
    const { addItemToCart, props: { numUserItems, user_account } } = this;
    return (
      <div className='add_to_amazon'>
        Add Item to Kip Cart
        {
          !!user_account.id 
          ? <AmazonFormContainer />
          : <button className='add_to_amazon__button yellow' onClick={addItemToCart}>
              + Add Amazon Item
            </button>
        }
        {numUserItems ? null : <NotificationBubble top={21} right={3}/>}
      </div>
    );
  }
}
