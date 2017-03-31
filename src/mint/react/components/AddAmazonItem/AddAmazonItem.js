import React, { Component, PropTypes } from 'react';

export default class AddAmazonItem extends Component {
  constructor(props) {
    super(props);
    this.addItemToCart = ::this.addItemToCart;
  }

  addItemToCart() {
    const { changeKipFormView, toggleAddingToCart, user_accounts } = this.props;
    toggleAddingToCart();
    changeKipFormView(user_accounts.length ? 2 : 1);
  }

  render() {
    const { changeKipFormView } = this.props;
    const { addItemToCart } = this;
    return (
      <button className='addToCartBtn' onClick={addItemToCart}>+ Add Item</button>
    );
  }
}
