// mint/react/components/View/Cart/Cart.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';

export default class ItemPaidButton extends Component {

  static propTypes = {
    cart: PropTypes.object,
    user: PropTypes.object,
    item: PropTypes.object,
    editId: PropTypes.string,
    removeItem: PropTypes.func,
    addItem: PropTypes.func,
    copyItem: PropTypes.func,
    updateItem: PropTypes.func,
    fetchItem: PropTypes.func,
    selectCartItem: PropTypes.func
  }

  render() {
    const { cart, user, editId, item, removeItem, copyItem, fetchItem, selectCartItem } = this.props;
    return (
      <div>
        <h3> NOT PAID </h3>
      </div>
    );
  }
}
