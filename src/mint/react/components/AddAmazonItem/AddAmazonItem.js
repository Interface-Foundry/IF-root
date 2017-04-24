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
    replace: PropTypes.func.isRequired,
    cart_id: PropTypes.string
  }

  addItemToCart() {
    const { user_account, addingItem, cart_id, replace } = this.props;
    addingItem(true);
    replace(user_account.id ? `/cart/${cart_id}/m/item/add` : `/cart/${cart_id}/m/signin`);
  }

  render() {
    const { addItemToCart, props } = this;
    const { numUserItems, user_account } = props;
    return (
      <div className='add_to_amazon'>
        Add Item to Kip Cart
        <button className={`add_to_amazon__button ${!!user_account.id ? '' : 'yellow'}`} onClick={addItemToCart}>
          <Icon icon='Search'/>
          { !!user_account.id ? 'Paste Amazon URL or Search' : '+ Add Amazon Item' }
        </button>
        {numUserItems ? null : <NotificationBubble top={25} right={13}/>}
      </div>
    );
  }
}
