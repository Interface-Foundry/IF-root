// react/components/Stores/Stores.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';

import Store from './Store';

export default class Stores extends Component {
  static propTypes = {
    stores: PropTypes.array,
    _toggleLoginScreen: PropTypes.func,
    user: PropTypes.object
  }
  componentWillReceiveProps(nextProps) {
    const { stores, _toggleLoginScreen } = this.props;

    if (stores.length !== nextProps.stores.length && !nextProps.user.id) {
      _toggleLoginScreen();
    }
  }

  render() {
    const { stores } = this.props;
    const otherStores = stores.slice() || [];
    const suggested = otherStores.shift() || [];

    return (
      <section>
        <div className='cart_store'> 
          <h3>Suggested For You</h3>
          <ul className='cart_store__list suggested'>
            <Store key={suggested.store_type} {...suggested} />
          </ul>
        </div>
        <div className='cart_store'> 
          <h3>Other Stores</h3>
          <ul className='cart_store__list'>
            {otherStores.map(store => 
                <Store 
                  key={store.store_type} 
                  {...store} 
                />
              )
            }
          </ul>
        </div>
      </section>
    );
  }
}
