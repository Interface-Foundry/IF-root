// react/components/CartStore/CartStore.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';

export default class CartStore extends Component {

  static propTypes = {
    fetchStores: PropTypes.func,
    setStore: PropTypes.func,
    choices: PropTypes.array,
    cart_id: PropTypes.string,
    history: PropTypes.object
  }

  componentWillMount() {
    const { fetchStores } = this.props;
    fetchStores();
  }

  render() {
    const { choices, setStore, cart_id, history: { replace } } = this.props;
    return (
      <ul className="cart_store">
        {choices.map(choice => <StoreChoice key={choice.cart_type} {...choice} setStore={store => {setStore(cart_id, store); replace(`/cart/${cart_id}`);}} />)}
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
      <li>
        <div className='cart__choice' key={type} onClick={() => setStore(type)}>
          <div className='choice__details'>
            <div className='choice__image image' style={{backgroundImage:`url(${img})`}}/>
            <span className='choice__name'> { name } </span>
            <span className='choice__domain'> { domain } </span>
          </div>
          <div className='choice__select'>
            Choose
          </div>
        </div>
      </li>
    );
  }
}
