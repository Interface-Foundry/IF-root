import React, { Component, PropTypes } from 'react';

export default class AddAmazonItem extends Component {
  constructor(props) {
    super(props);
    this.addItemToCart = ::this.addItemToCart;
  }

  static propTypes = {
    user_accounts: PropTypes.array.isRequired,
    addingItem: PropTypes.func.isRequired,
    push: PropTypes.func.isRequired
  }

  addItemToCart() {
    const { user_accounts, addingItem, push } = this.props;
    addingItem(true);
    push(user_accounts.length ? 'm/item/add' : 'm/signin');
  }

  render() {
    const { addItemToCart } = this;
    return (
      <button className='amazon__button' onClick={addItemToCart}>+ Add Amazon Items to Cart</button>
    );
  }
}
