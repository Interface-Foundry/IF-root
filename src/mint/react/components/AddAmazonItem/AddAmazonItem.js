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
    cart_id: PropTypes.string,
    storeName: PropTypes.string
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
    console.log(this.props.store)
    const { addItemToCart, props: { numUserItems, user_account, storeName } } = this;
    const displayStore = storeName === 'ypo' ? 'YPO' : _.capitalize(storeName);
    return (
      <div className='add_to_amazon'>
        Add {displayStore} Item to Kip Cart
        <AmazonFormContainer />
        {numUserItems ? null : <NotificationBubble top={21} right={3}/>}
      </div>
    );
  }
}


