// react/components/Stores/Stores.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';

import Store from './Store';

export default class Stores extends Component {
  static propTypes = {
    stores: PropTypes.array,
    togglePopup: PropTypes.func,
    user: PropTypes.object
  }
  componentWillReceiveProps(nextProps) {
    const { stores, togglePopup } = this.props;

    if (stores.length !== nextProps.stores.length && !nextProps.user.id) {
      togglePopup();
    }
  }

  render() {
    const { stores } = this.props;
    const otherStores = stores.filter((s) => {
      return s.store_name === 'Amazon UK' || s.store_name === 'Amazon Canada' || s.store_name === 'YPO'
    });
    const suggested = stores.filter((s) => {
      return s.store_name === 'Muji' || s.store_name === 'Punyus' || s.store_name === 'Lotte' || s.store_name === 'Amazon US'
    });

    return (
      <section>
        <div className='cart_store'> 
          <h3>Suggested For You</h3>
          <ul className='cart_store__list suggested'>
            {
              suggested.map(store => 
                <Store key={store.store_type} {...store} />
              )
            }
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
