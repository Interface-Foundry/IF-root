// react/components/CartStore/CartStore.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';

export default class CartStore extends Component {

  static propTypes = {
    fetchStores: PropTypes.func,
    setStore: PropTypes.func,
    choices: PropTypes.array,
    cart_id: PropTypes.string,
    history: PropTypes.object,
    user_account: PropTypes.object,
    _toggleLoginScreen: PropTypes.func
  }

  componentDidMount() {
    const { choices, fetchStores } = this.props;
    if (!choices.length) fetchStores();
  }

  componentWillReceiveProps(nextProps) {
    const { choices } = this.props;
    const { choices: newStores, user_account, _toggleLoginScreen } = nextProps;

    if (choices.length !== newStores.length && !user_account.id) _toggleLoginScreen();
  }

  render() {
    const { choices } = this.props;
    const suggested = choices.shift() || [];
    return (
      <section>
        <div className='cart_store'> 
          <h3>Suggested For You</h3>
          <ul className='cart_store__list suggested'>
            <StoreChoice key={suggested.store_type} {...suggested} />
          </ul>
        </div>
        <div className='cart_store'> 
          <h3>Other Stores</h3>
          <ul className='cart_store__list'>
            {choices.map(choice => 
                <StoreChoice 
                  key={choice.store_type} 
                  {...choice} 
                />
              )
            }
          </ul>
        </div>
      </section>
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
