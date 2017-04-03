import React, { Component, PropTypes } from 'react';

export default class AddAmazonItem extends Component {
  constructor(props) {
    super(props);
    this.addItemToCart = ::this.addItemToCart;
  }

  static propTypes = {
    changeModalComponent: PropTypes.func.isRequired,
    user_accounts: PropTypes.array.isRequired,
    addingItem: PropTypes.func.isRequired
  }

  addItemToCart() {
    const { changeModalComponent, user_accounts, addingItem } = this.props;
    addingItem(true);
    changeModalComponent(user_accounts.length ? 'AmazonFormContainer' : 'EmailFormContainer');
  }

  render() {
    const { addItemToCart } = this;
    return (
      <button className='amazon__button' onClick={addItemToCart}>+ Add Amazon Items to Cart</button>
    );
  }
}
