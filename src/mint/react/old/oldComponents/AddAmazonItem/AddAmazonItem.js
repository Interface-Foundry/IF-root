// react/components/AddAmazonItem/AddAmazonItem.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import NotificationBubble from '../NotificationBubble';
import { AmazonFormContainer } from '../../containers';

export default class AddAmazonItem extends Component {

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

  render() {
    const { props: { numUserItems, storeName } } = this;
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
