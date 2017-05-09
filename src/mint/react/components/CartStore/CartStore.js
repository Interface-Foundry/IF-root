// react/components/CartStore/CartStore.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';

export default class CartStore extends Component {

  static propTypes = {
    fetchStores: PropTypes.func,
    setStore: PropTypes.func,
    choices: PropTypes.array,
    cart_id: PropTypes.string
  }

  componentWillMount() {
    const { fetchStores } = this.props;
    fetchStores();
  }

  render() {
    const { choices, setStore, cart_id } = this.props;
    return (
      <ul className="cart_store">
        {choices.map(choice => <StoreChoice key={choice.cart_type} {...choice} setStore={store => setStore(cart_id, store)} />)}
      </ul>
    );
  }
}

class StoreChoice extends Component {
  static propTypes = {
    cart_name: PropTypes.string,
    cart_img: PropTypes.string,
    cart_type: PropTypes.string,
    cart_domain: PropTypes.string,
    setStore: PropTypes.func
  }
  render() {
    const {
      cart_img: img,
      cart_type: type,
      cart_name: name,
      cart_domain: domain,
      setStore
    } = this.props;

    return (
      <li key={type} onClick={() => setStore(type)}>
        <img src={img}/> 
        { name }
        { domain }
      </li>
    );
  }
}
