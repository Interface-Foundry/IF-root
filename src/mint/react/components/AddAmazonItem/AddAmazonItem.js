import React, { Component, PropTypes } from 'react';

export default class AddAmazonItem extends Component {
  constructor(props) {
    super(props);
    this.addItemToCart = ::this.addItemToCart;
  }

  static propTypes = {
    changeKipFormView: PropTypes.func.isRequired,
    toggleAddingToCart: PropTypes.func.isRequired,
    user_accounts: PropTypes.array.isRequired
  }

  addItemToCart() {
    const { changeKipFormView, toggleAddingToCart, user_accounts } = this.props;
    toggleAddingToCart();
    changeKipFormView(user_accounts.length ? 2 : 1);
  }

  render() {
    const { addItemToCart } = this;
    return (
      <button className='amazon__button' onClick={addItemToCart}>+ Add Amazon Items to Cart</button>
    );
  }
}
