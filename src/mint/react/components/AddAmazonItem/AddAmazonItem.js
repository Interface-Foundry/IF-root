import React, { Component, PropTypes } from 'react';
import NotificationBubble from '../NotificationBubble';

export default class AddAmazonItem extends Component {
  constructor(props) {
    super(props);
    this.addItemToCart = ::this.addItemToCart;
  }

  static propTypes = {
    user_accounts: PropTypes.array.isRequired,
    addingItem: PropTypes.func.isRequired,
    replace: PropTypes.func.isRequired,
    cart_id: PropTypes.string
  }

  addItemToCart() {
    const { user_accounts, addingItem, cart_id, replace } = this.props;
    addingItem(true);
    replace(user_accounts.length ? `/cart/${cart_id}/m/item/add` : `/cart/${cart_id}/m/signin`);
  }

  render() {
    const { addItemToCart } = this;
    const newMember = true;
    return (
      <div className='add_to_amazon'>
        Add Item to Kip Cart
        <button className='add_to_amazon__button' onClick={addItemToCart}>Paste Amazon URL or Search</button>
        {newMember ? <NotificationBubble top={44} right={12}/> : null}
      </div>
    );
  }
}
