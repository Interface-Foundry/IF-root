import React, { Component, PropTypes } from 'react';

export default class AddAmazonItem extends Component {
  constructor(props) {
    super(props);
    this.addItemToCart = ::this.addItemToCart;
  }

  static propTypes = {
    user_accounts: PropTypes.array.isRequired,
    addingItem: PropTypes.func.isRequired,
    replace: PropTypes.func.isRequired,
    cart_id: PropTypes.string.isRequired
  }

  addItemToCart() {
    const { user_accounts, addingItem, cart_id, replace } = this.props;
    addingItem(true);
    replace(user_accounts.length ? `/cart/${cart_id}/m/item/add` : `/cart/${cart_id}/m/signin`);
  }

  render() {
    const { addItemToCart } = this;
    return (
      <button className='amazon__button' onClick={addItemToCart}>+ Add Amazon Items to Cart</button>
    );
  }
}
