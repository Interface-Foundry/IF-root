import React, { Component, PropTypes } from 'react';

export default class AddAmazonItem extends Component {
  constructor(props) {
    super(props);
    this.addItemToCart = ::this.addItemToCart;
  }

  static propTypes = {
    user_accounts: PropTypes.array.isRequired,
    addingItem: PropTypes.func.isRequired
  }

  addItemToCart() {
    const { user_accounts, addingItem, push, cart_id } = this.props;
    addingItem(true);
    push(user_accounts.length ? `${cart_id}/m/item/add` : `${cart_id}/m/signin`);
  }

  render() {
    const { addItemToCart } = this;
    return (
      <button className='amazon__button' onClick={addItemToCart}>+ Add Amazon Items to Cart</button>
    );
  }
}
