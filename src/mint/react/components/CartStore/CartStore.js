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
    const { choices, history: { replace } } = this.props;
    return (
      <ul className="cart_store">
        {choices.map(choice => 
            <StoreChoice 
              key={choice.store_type} 
              {...choice} 
              onClick={() => replace(`/newcart/${choice.store_type}`)} 
            />
          )
        }
      </ul>
    );
  }
}

class StoreChoice extends Component {
  static propTypes = {
    store_name: PropTypes.string,
    store_img: PropTypes.string,
    store_type: PropTypes.string,
    store_domain: PropTypes.string,
    setStore: PropTypes.func
  }
  render() {
    const {
      store_img: img,
      store_type: type,
      store_name: name,
      store_domain: domain,
    } = this.props;

    return (
      <a href={`/newcart/${type}`}  key={type}>
        <div className='cart__choice'>
          <div className='choice__details'>
            <div className='choice__image image' style={{backgroundImage:`url(${img})`}}/>
            <span className='choice__name'> { name } </span>
            <span className='choice__domain'> { domain } </span>
          </div>
          <div className='choice__select'>
            Choose
          </div>
        </div>
      </a>
    );
  }
}
